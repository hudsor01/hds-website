/**
 * Tests for `listShowcasesForAdmin` after the Phase 10 Wave 2 rewrite.
 *
 * The helper now accepts an options object `{ q?, cursor?, direction? }`
 * and returns `{ rows, hasMore, prevCursor, nextCursor }`. We test the
 * CONTRACT and CONTROL FLOW here (PAGE_SIZE+1 read, hasMore detection,
 * cursor encoding, before-direction row reversal, malformed-cursor safety,
 * DB-error safe default, search-WHERE composition). The full SQL behavior
 * is exercised in the Wave 3 integration verification pass.
 *
 * Mock pattern mirrors `tests/unit/showcase.test.ts`: chainable mock that
 * captures the `.where()` argument so we can assert composition shape, and
 * a configurable `.limit()` resolution so we can stage different row counts
 * per case.
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

import { decodeCursor, encodeCursor, PAGE_SIZE } from '@/lib/admin/list-cursor'
import { listShowcasesForAdmin } from '@/lib/admin/showcase-queries'
import { logger } from '@/lib/logger'

function makeRow(
	idx: number,
	overrides: Partial<{
		id: string
		displayOrder: number | null
		createdAt: Date | null
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
		published: true,
		displayOrder,
		publishedAt: null,
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
			String(lastReturned.displayOrder),
			(lastReturned.createdAt as Date).toISOString(),
			lastReturned.id as string
		])
	})

	test('returns all rows + hasMore=false + nextCursor=null when DB yields fewer than PAGE_SIZE', async () => {
		state.rowsToReturn = [makeRow(0), makeRow(1), makeRow(2)]

		const result = await listShowcasesForAdmin()

		expect(result.rows.length).toBe(3)
		expect(result.hasMore).toBe(false)
		expect(result.nextCursor).toBeNull()
		expect(result.prevCursor).toBeNull()
	})

	test('returns empty shape when DB yields zero rows', async () => {
		state.rowsToReturn = []

		const result = await listShowcasesForAdmin()

		expect(result).toEqual({
			rows: [],
			hasMore: false,
			prevCursor: null,
			nextCursor: null
		})
	})
})

describe('listShowcasesForAdmin: DB error safety', () => {
	test('returns empty result + logs error when the query throws', async () => {
		state.shouldThrow = true

		const result = await listShowcasesForAdmin()

		expect(result).toEqual({
			rows: [],
			hasMore: false,
			prevCursor: null,
			nextCursor: null
		})
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

		expect(result.rows.length).toBe(1)
		// page 1 fall-back: WHERE is undefined (no cursor predicate)
		expect(state.whereArg).toBeUndefined()
		// prevCursor stays null because the malformed cursor was discarded
		expect(result.prevCursor).toBeNull()
	})

	test("'before' cursor reverses ORDER BY and rows come back in display order", async () => {
		// Simulate a 'before' page: SQL returns rows in REVERSE display order
		// (newer-than-cursor first under flipped sort). Helper must reverse
		// them before returning so the caller sees display order.
		const reversed = [makeRow(3), makeRow(2), makeRow(1)]
		state.rowsToReturn = reversed

		const beforeCursor = encodeCursor('before', [
			'5',
			'2026-05-15T00:00:00.000Z',
			'row-05'
		])

		const result = await listShowcasesForAdmin({ cursor: beforeCursor })

		// Rows must be reversed back into display order: row-01, row-02, row-03
		const ids = result.rows.map(r => (r as { id: string }).id)
		expect(ids).toEqual(['row-01', 'row-02', 'row-03'])

		// prevCursor is set because the caller asked for a cursor and got rows
		expect(result.prevCursor).not.toBeNull()
		const decodedPrev = decodeCursor(result.prevCursor ?? undefined)
		expect(decodedPrev?.direction).toBe('before')
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

		expect(result.rows.length).toBe(PAGE_SIZE)
		expect(result.hasMore).toBe(true)
		expect(result.prevCursor).not.toBeNull()
		expect(result.nextCursor).not.toBeNull()
	})
})
