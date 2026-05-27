/**
 * Tests for `listLeadsForAdmin` after the Phase 10 Wave 2 rewrite.
 *
 * The helper now accepts an options object `{ status?, q?, cursor?, direction? }`
 * and returns `{ rows, hasMore, prevCursor, nextCursor }`. We test the
 * CONTRACT and CONTROL FLOW here (PAGE_SIZE+1 read, hasMore detection,
 * cursor encoding, before-direction row reversal, malformed-cursor safety,
 * DB-error safe default, status + search WHERE composition). The full SQL
 * behavior is exercised in the Wave 3 integration verification pass.
 *
 * Cursor shape: 2-part `[createdAt.toISOString(), id]`. Sort order is
 * `(createdAt DESC, id ASC)` for forward pages; flipped for backward.
 *
 * Mock pattern mirrors `tests/unit/admin/testimonials-queries.test.ts`.
 */
import { beforeEach, describe, expect, mock, test } from 'bun:test'

// --- Mock state shared across cases (re-initialized in beforeEach) ----------

interface MockState {
	whereArg: unknown
	orderByArgs: unknown[]
	limitArg: number | undefined
	rowsToReturn: unknown[]
	shouldThrow: boolean
}

const state: MockState = {
	whereArg: undefined,
	orderByArgs: [],
	limitArg: undefined,
	rowsToReturn: [],
	shouldThrow: false
}

function resetState(): void {
	state.whereArg = undefined
	state.orderByArgs = []
	state.limitArg = undefined
	state.rowsToReturn = []
	state.shouldThrow = false
}

function buildSelectChain(): unknown {
	const chain = {
		from: () => chain,
		where: (arg: unknown) => {
			state.whereArg = arg
			return chain
		},
		orderBy: (...args: unknown[]) => {
			state.orderByArgs = args
			return chain
		},
		limit: (n: number) => {
			state.limitArg = n
			if (state.shouldThrow) {
				return Promise.reject(new Error('db down'))
			}
			return Promise.resolve(state.rowsToReturn)
		}
	}
	return chain
}

function setupDbMock(): void {
	mock.module('@/lib/db', () => ({
		db: {
			select: () => buildSelectChain()
		}
	}))
}

setupDbMock()

// Real list-cursor module is used (pure functions, no DB). Schema barrel is
// real too -- drizzle column refs are just objects, and the helper only
// passes them to mocked drizzle operators, which the chainable mock ignores.

import { listLeadsForAdmin } from '@/lib/admin/leads-queries'
import { decodeCursor, encodeCursor, PAGE_SIZE } from '@/lib/admin/list-cursor'
import { logger } from '@/lib/logger'

function makeRow(
	idx: number,
	overrides: Partial<{
		id: string
		createdAt: Date | null
		name: string | null
		email: string
		company: string | null
	}> = {}
): Record<string, unknown> {
	const id = overrides.id ?? `row-${String(idx).padStart(2, '0')}`
	const createdAt =
		overrides.createdAt === undefined
			? new Date(2026, 4, 1 + idx, 12, 0, 0)
			: overrides.createdAt
	return {
		id,
		email: overrides.email ?? `lead-${idx}@example.com`,
		name: overrides.name ?? `Name ${idx}`,
		phone: null,
		company: overrides.company ?? null,
		source: null,
		status: 'new',
		score: null,
		metadata: null,
		createdAt,
		updatedAt: createdAt
	}
}

beforeEach(() => {
	resetState()
	// tests/setup.ts beforeEach runs `mock.restore()` BEFORE this file's
	// beforeEach. Re-register the db mock so the chainable stub stays bound
	// to the module under test for every case.
	setupDbMock()
})

describe('listLeadsForAdmin: page-size + hasMore', () => {
	test('returns PAGE_SIZE rows + hasMore=true + nextCursor encoded from LAST RETURNED row when DB yields PAGE_SIZE + 1', async () => {
		const allRows = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => makeRow(i))
		state.rowsToReturn = allRows

		const result = await listLeadsForAdmin()

		expect(state.limitArg).toBe(PAGE_SIZE + 1)
		expect(result.rows.length).toBe(PAGE_SIZE)
		expect(result.hasMore).toBe(true)
		expect(result.prevCursor).toBeNull()
		expect(result.nextCursor).not.toBeNull()

		// nextCursor must encode the LAST RETURNED row (index PAGE_SIZE - 1),
		// NOT the sentinel row that was dropped.
		const lastReturned = allRows[PAGE_SIZE - 1] as ReturnType<typeof makeRow>
		const decoded = decodeCursor(result.nextCursor ?? undefined)
		expect(decoded).not.toBeNull()
		expect(decoded?.direction).toBe('after')
		expect(decoded?.parts).toEqual([
			(lastReturned.createdAt as Date).toISOString(),
			lastReturned.id as string
		])
	})

	test('returns all rows + hasMore=false when DB yields fewer than PAGE_SIZE', async () => {
		state.rowsToReturn = [makeRow(0), makeRow(1), makeRow(2)]

		const result = await listLeadsForAdmin()

		expect(result.rows.length).toBe(3)
		expect(result.hasMore).toBe(false)
		expect(result.nextCursor).toBeNull()
		expect(result.prevCursor).toBeNull()
	})

	test('returns empty shape when DB yields zero rows', async () => {
		state.rowsToReturn = []

		const result = await listLeadsForAdmin()

		expect(result).toEqual({
			rows: [],
			hasMore: false,
			prevCursor: null,
			nextCursor: null
		})
	})
})

describe('listLeadsForAdmin: DB error safety', () => {
	test('returns empty result + logs error when the query throws', async () => {
		state.shouldThrow = true

		const result = await listLeadsForAdmin()

		expect(result).toEqual({
			rows: [],
			hasMore: false,
			prevCursor: null,
			nextCursor: null
		})
		expect(logger.error).toHaveBeenCalledTimes(1)
	})
})

describe('listLeadsForAdmin: WHERE composition', () => {
	test('no opts produces undefined WHERE (no filter)', async () => {
		state.rowsToReturn = []

		await listLeadsForAdmin()

		expect(state.whereArg).toBeUndefined()
	})

	test("status='new' produces a non-empty WHERE (eq predicate)", async () => {
		state.rowsToReturn = []

		await listLeadsForAdmin({ status: 'new' })

		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})

	test("q='acme' produces a non-empty WHERE (ILIKE OR over name + email + company)", async () => {
		state.rowsToReturn = []

		await listLeadsForAdmin({ q: 'acme' })

		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})

	test('whitespace-only q is treated as no search (undefined WHERE)', async () => {
		state.rowsToReturn = []

		await listLeadsForAdmin({ q: '   ' })

		expect(state.whereArg).toBeUndefined()
	})

	test('status + q combine into a non-empty WHERE (and of eq + or-of-ilike)', async () => {
		state.rowsToReturn = []

		await listLeadsForAdmin({ status: 'qualified', q: 'acme' })

		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})
})

describe('listLeadsForAdmin: cursor + direction', () => {
	test('malformed cursor falls back to page 1 (never throws)', async () => {
		state.rowsToReturn = [makeRow(0)]

		const result = await listLeadsForAdmin({ cursor: 'not-a-cursor' })

		expect(result.rows.length).toBe(1)
		// page 1 fall-back: WHERE is undefined (no cursor predicate)
		expect(state.whereArg).toBeUndefined()
		// prevCursor stays null because the malformed cursor was discarded
		expect(result.prevCursor).toBeNull()
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
			'row-99'
		])

		const result = await listLeadsForAdmin({ cursor: beforeCursor })

		const ids = result.rows.map(r => (r as { id: string }).id)
		const expectedIds = Array.from(
			{ length: PAGE_SIZE },
			(_, i) => `row-${String(i + 1).padStart(2, '0')}`
		)
		expect(ids).toEqual(expectedIds)

		expect(result.prevCursor).not.toBeNull()
		const decodedPrev = decodeCursor(result.prevCursor ?? undefined)
		expect(decodedPrev?.direction).toBe('before')
		expect(result.nextCursor).not.toBeNull()
	})

	test('emits nextCursor + nulls prevCursor when arriving on page 1 via backward navigation (direction=before, hasMore=false)', async () => {
		// User clicked Prev on page 2 and ran out of rows. Before the fix:
		// prevCursor=before:firstRow (broken) and nextCursor=null (stuck).
		// After the fix: prevCursor=null, nextCursor=after:lastRow.
		const reversed = [makeRow(3), makeRow(2), makeRow(1)]
		state.rowsToReturn = reversed

		const beforeCursor = encodeCursor('before', [
			'2026-05-15T00:00:00.000Z',
			'row-05'
		])

		const result = await listLeadsForAdmin({ cursor: beforeCursor })

		expect(result.hasMore).toBe(false)
		expect(result.prevCursor).toBeNull()
		expect(result.nextCursor).not.toBeNull()
		const decodedNext = decodeCursor(result.nextCursor ?? undefined)
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

		const result = await listLeadsForAdmin({ cursor: afterCursor })

		expect(result.rows.length).toBe(PAGE_SIZE)
		expect(result.hasMore).toBe(true)
		expect(result.prevCursor).not.toBeNull()
		expect(result.nextCursor).not.toBeNull()
	})
})
