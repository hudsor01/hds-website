/**
 * Tests for the showcase admin read layer after the Phase 13 Wave 2 migration.
 *
 * `listShowcasesForAdmin` now returns `AdminQueryResult<ListShowcasesResult>`
 * (the `catch` returns `err()`, zero rows return `ok({...})`), and
 * `getShowcaseById` returns the 3-way `AdminDetailResult<ShowcaseRow>`
 * (`found` / `not-found` / `error`). The two internal write-helper callers
 * (`updateShowcase`, `toggleShowcasePublished`) narrow the detail result
 * locally and KEEP their existing `null`-on-absent contract, which the
 * write-helper cases below pin.
 *
 * Mock pattern mirrors `tests/unit/admin/leads-queries.test.ts`: a thenable
 * chainable mock for `db.select()` (the chain settles to `state.rowsToReturn`
 * on whatever terminal method the query awaits) plus a stubbed `db.update()`
 * chain that resolves to `state.updateRowsToReturn` so the write helpers can
 * run their full path against the mock.
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
// and the chain itself is awaitable. This covers BOTH the list query
// (terminates on `.limit()`) and `getShowcaseById` (terminates on `.limit(1)`).
// Whatever terminal method the query awaits, the chain settles to
// `state.rowsToReturn` (or rejects when `state.shouldThrow`).
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

// UPDATE chain used by `updateShowcase` / `toggleShowcasePublished`:
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

import { decodeCursor, encodeCursor, PAGE_SIZE } from '@/lib/admin/list-cursor'
import {
	getShowcaseById,
	listShowcasesForAdmin,
	toggleShowcasePublished,
	updateShowcase
} from '@/lib/admin/showcase-queries'
import { logger } from '@/lib/logger'

function makeRow(
	idx: number,
	overrides: Partial<{
		id: string
		displayOrder: number | null
		createdAt: Date | null
		published: boolean
		publishedAt: Date | null
	}> = {}
): Record<string, unknown> {
	const id = overrides.id ?? `row-${String(idx).padStart(2, '0')}`
	const displayOrder =
		overrides.displayOrder === undefined ? idx : overrides.displayOrder
	// Synth a deterministic, always-valid ISO date by adding idx days to a
	// fixed epoch. Avoids the trap where `2026-05-${10+idx}` overflows past
	// 31 for idx >= 22 and produces an invalid Date.
	const createdAt =
		overrides.createdAt === undefined
			? new Date(2026, 4, 1 + idx, 12, 0, 0)
			: overrides.createdAt
	return {
		id,
		slug: `slug-${idx}`,
		title: `Title ${idx}`,
		description: 'desc',
		showcaseType: 'quick',
		featured: false,
		published: overrides.published ?? true,
		displayOrder,
		publishedAt: overrides.publishedAt ?? null,
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

describe('listShowcasesForAdmin: page-size + hasMore', () => {
	test('returns PAGE_SIZE rows + hasMore=true + nextCursor encoded from LAST RETURNED row when DB yields PAGE_SIZE + 1', async () => {
		const allRows = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => makeRow(i))
		state.rowsToReturn = allRows

		const result = await listShowcasesForAdmin()

		expect(state.limitArg).toBe(PAGE_SIZE + 1)
		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
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
			String(lastReturned.displayOrder),
			(lastReturned.createdAt as Date).toISOString(),
			lastReturned.id as string
		])
	})

	test('returns all rows + hasMore=false + nextCursor=null when DB yields fewer than PAGE_SIZE', async () => {
		state.rowsToReturn = [makeRow(0), makeRow(1), makeRow(2)]

		const result = await listShowcasesForAdmin()

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data.rows.length).toBe(3)
		expect(result.data.hasMore).toBe(false)
		expect(result.data.nextCursor).toBeNull()
		expect(result.data.prevCursor).toBeNull()
	})

	test('returns ok with empty rows when DB yields zero rows (distinct from error)', async () => {
		state.rowsToReturn = []

		const result = await listShowcasesForAdmin()

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data).toEqual({
			rows: [],
			hasMore: false,
			prevCursor: null,
			nextCursor: null
		})
	})
})

describe('listShowcasesForAdmin: DB error safety', () => {
	test('returns the error variant (not an empty result) + logs once when the query throws', async () => {
		state.shouldThrow = true

		const result = await listShowcasesForAdmin()

		expect(result).toEqual({ ok: false, error: true })
		expect(logger.error).toHaveBeenCalledTimes(1)
	})
})

describe('listShowcasesForAdmin: search composition', () => {
	test("q='foo' triggers a non-empty WHERE clause (ILIKE OR over title + slug)", async () => {
		state.rowsToReturn = []

		await listShowcasesForAdmin({ q: 'foo' })

		// The captured where() arg must be a truthy drizzle SQL chunk, not
		// undefined. Empty-q calls pass undefined (see next test); search
		// calls must pass an AND-composed clause.
		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})

	test('blank q (no opts) results in undefined WHERE clause (no filter)', async () => {
		state.rowsToReturn = []

		await listShowcasesForAdmin()

		expect(state.whereArg).toBeUndefined()
	})

	test('whitespace-only q is treated as no search (undefined WHERE)', async () => {
		state.rowsToReturn = []

		await listShowcasesForAdmin({ q: '   ' })

		expect(state.whereArg).toBeUndefined()
	})
})

describe('listShowcasesForAdmin: cursor + direction', () => {
	test('malformed cursor falls back to page 1 (never throws)', async () => {
		state.rowsToReturn = [makeRow(0)]

		const result = await listShowcasesForAdmin({ cursor: 'not-a-cursor' })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data.rows.length).toBe(1)
		// page 1 fall-back: WHERE is undefined (no cursor predicate)
		expect(state.whereArg).toBeUndefined()
		// prevCursor stays null because the malformed cursor was discarded
		expect(result.data.prevCursor).toBeNull()
	})

	test("'before' cursor reverses ORDER BY and rows come back in display order", async () => {
		// Simulate a 'before' page that's NOT page 1: SQL returns PAGE_SIZE + 1
		// rows in REVERSE display order (newer-than-cursor first under flipped
		// sort). Helper must reverse them before returning so the caller sees
		// display order. hasMore=true means there's still more data backward,
		// so prevCursor must remain emitted.
		const reversed = Array.from({ length: PAGE_SIZE + 1 }, (_, i) =>
			makeRow(PAGE_SIZE - i)
		)
		state.rowsToReturn = reversed

		const beforeCursor = encodeCursor('before', [
			'99',
			'2026-12-01T00:00:00.000Z',
			'row-99'
		])

		const result = await listShowcasesForAdmin({ cursor: beforeCursor })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		// Rows must be reversed back into display order (ascending idx)
		const ids = result.data.rows.map(r => (r as { id: string }).id)
		const expectedIds = Array.from(
			{ length: PAGE_SIZE },
			(_, i) => `row-${String(i + 1).padStart(2, '0')}`
		)
		expect(ids).toEqual(expectedIds)

		// prevCursor stays set because hasMore=true (more rows backward)
		expect(result.data.prevCursor).not.toBeNull()
		const decodedPrev = decodeCursor(result.data.prevCursor ?? undefined)
		expect(decodedPrev?.direction).toBe('before')
		// nextCursor also set because we navigated backward (page exists forward)
		expect(result.data.nextCursor).not.toBeNull()
	})

	test("'after' cursor with PAGE_SIZE+1 result emits both prev (after navigation) and next cursor", async () => {
		state.rowsToReturn = Array.from({ length: PAGE_SIZE + 1 }, (_, i) =>
			makeRow(i)
		)
		const afterCursor = encodeCursor('after', [
			'0',
			'2026-05-01T00:00:00.000Z',
			'sentinel-id'
		])

		const result = await listShowcasesForAdmin({ cursor: afterCursor })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data.rows.length).toBe(PAGE_SIZE)
		expect(result.data.hasMore).toBe(true)
		expect(result.data.prevCursor).not.toBeNull()
		expect(result.data.nextCursor).not.toBeNull()
	})

	test('emits nextCursor + nulls prevCursor when arriving on page 1 via backward navigation (direction=before, hasMore=false)', async () => {
		// User clicked Prev on page 2 and ran out of rows -- they ARE on the
		// real first page now. Before the fix: prevCursor was set to
		// before:firstRow (broken: clicking it leads to empty page) and
		// nextCursor was null (broken: user stuck, can't return to page 2).
		// After the fix: prevCursor=null (correctly at start) and
		// nextCursor=after:lastRow (so user can navigate forward to page 2).
		const reversed = [makeRow(3), makeRow(2), makeRow(1)]
		state.rowsToReturn = reversed

		const beforeCursor = encodeCursor('before', [
			'5',
			'2026-05-15T00:00:00.000Z',
			'row-05'
		])

		const result = await listShowcasesForAdmin({ cursor: beforeCursor })

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data.hasMore).toBe(false)
		expect(result.data.prevCursor).toBeNull()
		expect(result.data.nextCursor).not.toBeNull()
		const decodedNext = decodeCursor(result.data.nextCursor ?? undefined)
		expect(decodedNext?.direction).toBe('after')
	})
})

describe('getShowcaseById: 3-way detail result', () => {
	test("returns 'found' with the row when it exists", async () => {
		state.rowsToReturn = [makeRow(0)]

		const result = await getShowcaseById('row-00')

		expect(result.status).toBe('found')
		if (result.status !== 'found') {
			throw new Error('expected found result')
		}
		expect(result.data.id).toBe('row-00')
	})

	test("returns 'not-found' when no row exists", async () => {
		state.rowsToReturn = []

		const result = await getShowcaseById('missing')

		expect(result.status).toBe('not-found')
	})

	test("returns 'error' + logs once when the query throws", async () => {
		state.shouldThrow = true

		const result = await getShowcaseById('row-00')

		expect(result.status).toBe('error')
		expect(logger.error).toHaveBeenCalledTimes(1)
	})
})

describe('write helpers keep their null-on-absent contract after the get*ById migration', () => {
	test('updateShowcase returns the updated row when the row exists', async () => {
		state.rowsToReturn = [makeRow(0, { published: true })]
		const updated = makeRow(0, { published: true })
		state.updateRowsToReturn = [updated]

		const row = await updateShowcase('row-00', {
			title: 'Updated',
			slug: 'updated',
			description: 'desc',
			showcaseType: 'quick',
			featured: false,
			published: true,
			displayOrder: 0
		} as Parameters<typeof updateShowcase>[1])

		expect(row).not.toBeNull()
		expect((row as { id: string }).id).toBe('row-00')
	})

	test('updateShowcase returns null when the row does not exist', async () => {
		state.rowsToReturn = []

		const row = await updateShowcase('missing', {
			title: 'Updated',
			slug: 'updated',
			description: 'desc',
			showcaseType: 'quick',
			featured: false,
			published: true,
			displayOrder: 0
		} as Parameters<typeof updateShowcase>[1])

		expect(row).toBeNull()
	})

	test('updateShowcase returns null when the lookup query throws (error narrowed to null)', async () => {
		state.shouldThrow = true

		const row = await updateShowcase('row-00', {
			title: 'Updated',
			slug: 'updated',
			description: 'desc',
			showcaseType: 'quick',
			featured: false,
			published: true,
			displayOrder: 0
		} as Parameters<typeof updateShowcase>[1])

		expect(row).toBeNull()
	})

	test('toggleShowcasePublished flips published + returns the updated row when it exists', async () => {
		state.rowsToReturn = [makeRow(0, { published: false, publishedAt: null })]
		const toggled = makeRow(0, { published: true })
		state.updateRowsToReturn = [toggled]

		const row = await toggleShowcasePublished('row-00')

		expect(row).not.toBeNull()
		expect((row as { id: string }).id).toBe('row-00')
	})

	test('toggleShowcasePublished returns null when the row does not exist', async () => {
		state.rowsToReturn = []

		const row = await toggleShowcasePublished('missing')

		expect(row).toBeNull()
	})

	test('toggleShowcasePublished returns null when the lookup query throws (error narrowed to null)', async () => {
		state.shouldThrow = true

		const row = await toggleShowcasePublished('row-00')

		expect(row).toBeNull()
	})
})
