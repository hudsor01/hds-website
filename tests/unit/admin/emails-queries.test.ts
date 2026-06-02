/**
 * Tests for the emails admin read layer after the Phase 13 Wave 2 migration.
 *
 * `getQueueCounts` now returns `AdminQueryResult<QueueCounts>` (the `catch`
 * returns `err()`, NOT a falsely-healthy all-zero record), and
 * `listScheduledEmailsForAdmin` returns `AdminQueryResult<ListScheduledEmailsResult>`
 * (the `catch` returns `err()`, zero rows return `ok({...})`).
 * `getScheduledEmailById` returns the 3-way `AdminDetailResult<ScheduledEmail>`
 * (`found` / `not-found` / `error`). The internal write-helper caller
 * `retryScheduledEmail` narrows the detail result locally and KEEPS its
 * existing `RetryResult` contract (`{ ok: false, reason: 'not_found' }` when
 * the row is absent or the lookup failed), which the retry cases below pin.
 *
 * We still test the list CONTRACT and CONTROL FLOW (PAGE_SIZE+1 read, hasMore
 * detection, cursor encoding, before-direction row reversal, malformed-cursor
 * safety, status + search WHERE composition).
 *
 * Cursor shape: 2-part `[scheduledFor.toISOString(), id]`. Sort order is
 * `(scheduledFor DESC, id ASC)` for forward pages; flipped for backward.
 * `scheduledFor` is `.notNull()` in the schema so there is NO NULLS-LAST
 * sentinel -- straight 2-part cursor like Plan 10-04 / 10-05.
 *
 * Mock pattern mirrors `tests/unit/admin/showcase-queries.test.ts`: a thenable
 * chainable mock for `db.select()` (settles to `state.rowsToReturn` on whatever
 * terminal method the query awaits, covering the list `.limit()`, the
 * `getQueueCounts` `.groupBy()`, and the `getScheduledEmailById` `.limit(1)`)
 * plus a stubbed `db.update()` chain that resolves to `state.updateRowsToReturn`
 * so `retryScheduledEmail` can run its full lookup + update path.
 */
import { beforeEach, describe, expect, mock, test } from 'bun:test'

// --- Mock state shared across cases (re-initialized in beforeEach) ----------

interface MockState {
	whereArg: unknown
	orderByArgs: unknown[]
	limitArg: number | undefined
	rowsToReturn: unknown[]
	shouldThrow: boolean
	updateRowsToReturn: unknown[]
}

const state: MockState = {
	whereArg: undefined,
	orderByArgs: [],
	limitArg: undefined,
	rowsToReturn: [],
	shouldThrow: false,
	updateRowsToReturn: []
}

function resetState(): void {
	state.whereArg = undefined
	state.orderByArgs = []
	state.limitArg = undefined
	state.rowsToReturn = []
	state.shouldThrow = false
	state.updateRowsToReturn = []
}

// Thenable chainable mock for SELECT: every builder method returns the chain,
// and the chain itself is awaitable. This covers the list query (terminates on
// `.limit()`), `getQueueCounts` (terminates on `.groupBy()`), and
// `getScheduledEmailById` (terminates on `.limit(1)`). Whatever terminal
// method the query awaits, the chain settles to `state.rowsToReturn` (or
// rejects when `state.shouldThrow`).
function buildSelectChain(): unknown {
	const settle = (): Promise<unknown> =>
		state.shouldThrow
			? Promise.reject(new Error('db down'))
			: Promise.resolve(state.rowsToReturn)
	const chain = {
		from: () => chain,
		where: (arg: unknown) => {
			state.whereArg = arg
			return chain
		},
		groupBy: () => settle(),
		orderBy: (...args: unknown[]) => {
			state.orderByArgs = args
			return chain
		},
		limit: (n: number) => {
			state.limitArg = n
			return settle()
		},
		then: (
			onFulfilled?: (value: unknown) => unknown,
			onRejected?: (reason: unknown) => unknown
		) => settle().then(onFulfilled, onRejected)
	}
	return chain
}

// UPDATE chain used by `retryScheduledEmail`:
// `db.update(t).set(v).where(c).returning()` resolves to
// `state.updateRowsToReturn`.
function buildUpdateChain(): unknown {
	const chain = {
		set: () => chain,
		where: () => chain,
		returning: () => Promise.resolve(state.updateRowsToReturn)
	}
	return chain
}

function setupDbMock(): void {
	mock.module('@/lib/db', () => ({
		db: {
			select: () => buildSelectChain(),
			update: () => buildUpdateChain()
		}
	}))
}

setupDbMock()

// Real list-cursor module is used (pure functions, no DB). Schema barrel is
// real too -- drizzle column refs are just objects, and the helper only
// passes them to mocked drizzle operators, which the chainable mock ignores.

import {
	getQueueCounts,
	getScheduledEmailById,
	listScheduledEmailsForAdmin,
	retryScheduledEmail
} from '@/lib/admin/emails-queries'
import { decodeCursor, encodeCursor, PAGE_SIZE } from '@/lib/admin/list-cursor'
import { logger } from '@/lib/logger'

function makeRow(
	idx: number,
	overrides: Partial<{
		id: string
		scheduledFor: Date
		recipientEmail: string
		recipientName: string | null
		stepId: string
		status: string
		retryCount: number
		maxRetries: number
	}> = {}
): Record<string, unknown> {
	const id = overrides.id ?? `email-${String(idx).padStart(2, '0')}`
	const scheduledFor =
		overrides.scheduledFor ?? new Date(2026, 4, 1 + idx, 12, 0, 0)
	return {
		id,
		recipientEmail: overrides.recipientEmail ?? `to-${idx}@example.com`,
		recipientName: overrides.recipientName ?? `Recipient ${idx}`,
		sequenceId: 'welcome',
		stepId: overrides.stepId ?? `step-${idx}`,
		scheduledFor,
		sentAt: null,
		status: overrides.status ?? 'pending',
		variables: {},
		retryCount: overrides.retryCount ?? 0,
		maxRetries: overrides.maxRetries ?? 3,
		error: null,
		createdAt: scheduledFor
	}
}

beforeEach(() => {
	resetState()
	// tests/setup.ts beforeEach runs `mock.restore()` BEFORE this file's
	// beforeEach. Re-register the db mock so the chainable stub stays bound
	// to the module under test for every case.
	setupDbMock()
})

describe('getQueueCounts: error vs healthy zero', () => {
	test('returns ok with a fully-populated counts record on success', async () => {
		state.rowsToReturn = [
			{ status: 'pending', count: 3 },
			{ status: 'sent', count: 10 },
			{ status: 'failed', count: 2 },
			{ status: 'cancelled', count: 1 }
		]

		const result = await getQueueCounts()

		expect(result.ok).toBe(true)
		if (result.ok) {
			expect(result.data).toEqual({
				pending: 3,
				sent: 10,
				failed: 2,
				cancelled: 1
			})
		}
	})

	test('returns ok with zeros for missing statuses (genuine empty queue)', async () => {
		state.rowsToReturn = [{ status: 'sent', count: 5 }]

		const result = await getQueueCounts()

		expect(result.ok).toBe(true)
		if (result.ok) {
			expect(result.data).toEqual({
				pending: 0,
				sent: 5,
				failed: 0,
				cancelled: 0
			})
		}
	})

	test('ignores non-standard status strings (defensive against migrated rows)', async () => {
		state.rowsToReturn = [
			{ status: 'pending', count: 4 },
			{ status: 'bogus', count: 99 }
		]

		const result = await getQueueCounts()

		expect(result.ok).toBe(true)
		if (result.ok) {
			expect(result.data).toEqual({
				pending: 4,
				sent: 0,
				failed: 0,
				cancelled: 0
			})
		}
	})

	test('returns the error variant + logs once when the query throws (NOT a zero record)', async () => {
		state.shouldThrow = true

		const result = await getQueueCounts()

		expect(result).toEqual({ ok: false, error: true })
		expect(logger.error).toHaveBeenCalledTimes(1)
	})
})

describe('listScheduledEmailsForAdmin: page-size + hasMore', () => {
	test('returns PAGE_SIZE rows + hasMore=true + nextCursor encoded from LAST RETURNED row when DB yields PAGE_SIZE + 1', async () => {
		const allRows = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => makeRow(i))
		state.rowsToReturn = allRows

		const result = await listScheduledEmailsForAdmin()

		expect(state.limitArg).toBe(PAGE_SIZE + 1)
		expect(result.ok).toBe(true)
		if (!result.ok) {
			return
		}
		expect(result.data.rows.length).toBe(PAGE_SIZE)
		expect(result.data.hasMore).toBe(true)
		expect(result.data.prevCursor).toBeNull()
		expect(result.data.nextCursor).not.toBeNull()

		// nextCursor must encode the LAST RETURNED row (index PAGE_SIZE - 1),
		// NOT the sentinel row that was dropped.
		const lastReturned = allRows[PAGE_SIZE - 1] as ReturnType<typeof makeRow>
		const decoded = decodeCursor(result.data.nextCursor ?? undefined)
		expect(decoded).not.toBeNull()
		expect(decoded?.direction).toBe('after')
		expect(decoded?.parts).toEqual([
			(lastReturned.scheduledFor as Date).toISOString(),
			lastReturned.id as string
		])
	})

	test('returns all rows + hasMore=false when DB yields fewer than PAGE_SIZE', async () => {
		state.rowsToReturn = [makeRow(0), makeRow(1), makeRow(2)]

		const result = await listScheduledEmailsForAdmin()

		expect(result.ok).toBe(true)
		if (!result.ok) {
			return
		}
		expect(result.data.rows.length).toBe(3)
		expect(result.data.hasMore).toBe(false)
		expect(result.data.nextCursor).toBeNull()
		expect(result.data.prevCursor).toBeNull()
	})

	test('returns ok with the empty shape when DB yields zero rows (distinct from error)', async () => {
		state.rowsToReturn = []

		const result = await listScheduledEmailsForAdmin()

		expect(result).toEqual({
			ok: true,
			data: {
				rows: [],
				hasMore: false,
				prevCursor: null,
				nextCursor: null
			}
		})
	})
})

describe('listScheduledEmailsForAdmin: DB error safety', () => {
	test('returns the error variant + logs error when the query throws (NOT an empty list)', async () => {
		state.shouldThrow = true

		const result = await listScheduledEmailsForAdmin()

		expect(result).toEqual({ ok: false, error: true })
		expect(logger.error).toHaveBeenCalledTimes(1)
	})
})

describe('listScheduledEmailsForAdmin: WHERE composition', () => {
	test('no opts produces undefined WHERE (no filter)', async () => {
		state.rowsToReturn = []

		await listScheduledEmailsForAdmin()

		expect(state.whereArg).toBeUndefined()
	})

	test("status='failed' produces a non-empty WHERE (eq predicate)", async () => {
		state.rowsToReturn = []

		await listScheduledEmailsForAdmin({ status: 'failed' })

		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})

	test("q='abc' produces a non-empty WHERE (ILIKE OR over recipientEmail + recipientName + stepId)", async () => {
		state.rowsToReturn = []

		await listScheduledEmailsForAdmin({ q: 'abc' })

		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})

	test('whitespace-only q is treated as no search (undefined WHERE)', async () => {
		state.rowsToReturn = []

		await listScheduledEmailsForAdmin({ q: '   ' })

		expect(state.whereArg).toBeUndefined()
	})

	test('status + q combine into a non-empty WHERE (and of eq + or-of-ilike)', async () => {
		state.rowsToReturn = []

		await listScheduledEmailsForAdmin({ status: 'pending', q: 'abc' })

		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})
})

describe('listScheduledEmailsForAdmin: cursor + direction', () => {
	test('malformed cursor falls back to page 1 (never throws)', async () => {
		state.rowsToReturn = [makeRow(0)]

		const result = await listScheduledEmailsForAdmin({ cursor: 'not-a-cursor' })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			return
		}
		expect(result.data.rows.length).toBe(1)
		// page 1 fall-back: WHERE is undefined (no cursor predicate)
		expect(state.whereArg).toBeUndefined()
		// prevCursor stays null because the malformed cursor was discarded
		expect(result.data.prevCursor).toBeNull()
	})

	test("'before' cursor reverses ORDER BY and rows come back in display order", async () => {
		// Simulate a 'before' page that's NOT page 1: SQL returns PAGE_SIZE + 1
		// rows in REVERSE display order. hasMore=true keeps prevCursor emitted.
		const reversed = Array.from({ length: PAGE_SIZE + 1 }, (_, i) =>
			makeRow(PAGE_SIZE - i)
		)
		state.rowsToReturn = reversed

		const beforeCursor = encodeCursor('before', [
			'2026-12-01T00:00:00.000Z',
			'email-99'
		])

		const result = await listScheduledEmailsForAdmin({ cursor: beforeCursor })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			return
		}
		const ids = result.data.rows.map(r => (r as { id: string }).id)
		const expectedIds = Array.from(
			{ length: PAGE_SIZE },
			(_, i) => `email-${String(i + 1).padStart(2, '0')}`
		)
		expect(ids).toEqual(expectedIds)

		expect(result.data.prevCursor).not.toBeNull()
		const decodedPrev = decodeCursor(result.data.prevCursor ?? undefined)
		expect(decodedPrev?.direction).toBe('before')
		expect(result.data.nextCursor).not.toBeNull()
	})

	test('emits nextCursor + nulls prevCursor when arriving on page 1 via backward navigation (direction=before, hasMore=false)', async () => {
		// User clicked Prev on page 2 and ran out of rows. Before the fix:
		// prevCursor=before:firstRow (broken) and nextCursor=null (stuck).
		// After the fix: prevCursor=null, nextCursor=after:lastRow.
		const reversed = [makeRow(3), makeRow(2), makeRow(1)]
		state.rowsToReturn = reversed

		const beforeCursor = encodeCursor('before', [
			'2026-05-15T00:00:00.000Z',
			'email-05'
		])

		const result = await listScheduledEmailsForAdmin({ cursor: beforeCursor })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			return
		}
		expect(result.data.hasMore).toBe(false)
		expect(result.data.prevCursor).toBeNull()
		expect(result.data.nextCursor).not.toBeNull()
		const decodedNext = decodeCursor(result.data.nextCursor ?? undefined)
		expect(decodedNext?.direction).toBe('after')
	})

	test("'after' cursor with PAGE_SIZE+1 result emits both prev (after navigation) and next cursor", async () => {
		state.rowsToReturn = Array.from({ length: PAGE_SIZE + 1 }, (_, i) =>
			makeRow(i)
		)
		const afterCursor = encodeCursor('after', [
			'2026-05-01T00:00:00.000Z',
			'sentinel-id'
		])

		const result = await listScheduledEmailsForAdmin({ cursor: afterCursor })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			return
		}
		expect(result.data.rows.length).toBe(PAGE_SIZE)
		expect(result.data.hasMore).toBe(true)
		expect(result.data.prevCursor).not.toBeNull()
		expect(result.data.nextCursor).not.toBeNull()
	})
})

describe('getScheduledEmailById: 3-way detail result', () => {
	test('returns found(row) when the row exists', async () => {
		const row = makeRow(0, { id: 'email-found' })
		state.rowsToReturn = [row]

		const result = await getScheduledEmailById('email-found')

		expect(result.status).toBe('found')
		if (result.status === 'found') {
			expect((result.data as { id: string }).id).toBe('email-found')
		}
	})

	test('returns not-found when no row exists', async () => {
		state.rowsToReturn = []

		const result = await getScheduledEmailById('missing')

		expect(result).toEqual({ status: 'not-found' })
	})

	test('returns error + logs once when the query throws (NOT a 404)', async () => {
		state.shouldThrow = true

		const result = await getScheduledEmailById('boom')

		expect(result).toEqual({ status: 'error' })
		expect(logger.error).toHaveBeenCalledTimes(1)
	})
})

describe('retryScheduledEmail: RetryResult contract unchanged after lockstep', () => {
	test('resets a retriable row and returns { ok: true, row }', async () => {
		const existing = makeRow(0, {
			id: 'retry-ok',
			status: 'failed',
			retryCount: 1,
			maxRetries: 3
		})
		state.rowsToReturn = [existing]
		const updated = makeRow(0, { id: 'retry-ok', status: 'pending' })
		state.updateRowsToReturn = [updated]

		const outcome = await retryScheduledEmail('retry-ok')

		expect(outcome.ok).toBe(true)
		if (outcome.ok) {
			expect((outcome.row as { id: string }).id).toBe('retry-ok')
		}
	})

	test("returns { ok: false, reason: 'not_found' } when the row is absent", async () => {
		state.rowsToReturn = []

		const outcome = await retryScheduledEmail('gone')

		expect(outcome).toEqual({ ok: false, reason: 'not_found' })
	})

	test("returns { ok: false, reason: 'not_found' } when the lookup query fails (error collapses to not_found)", async () => {
		state.shouldThrow = true

		const outcome = await retryScheduledEmail('boom')

		expect(outcome).toEqual({ ok: false, reason: 'not_found' })
	})

	test("returns { ok: false, reason: 'max_retries_exceeded' } when retryCount >= maxRetries", async () => {
		const maxed = makeRow(0, {
			id: 'retry-maxed',
			status: 'failed',
			retryCount: 3,
			maxRetries: 3
		})
		state.rowsToReturn = [maxed]

		const outcome = await retryScheduledEmail('retry-maxed')

		expect(outcome).toEqual({ ok: false, reason: 'max_retries_exceeded' })
	})
})
