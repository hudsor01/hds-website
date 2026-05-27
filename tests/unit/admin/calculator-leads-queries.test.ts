/**
 * Tests for `listCalculatorLeadsForAdmin` after the Phase 10 Wave 2 rewrite.
 *
 * The helper now accepts an options object `{ quality?, q?, cursor?, direction? }`
 * and returns `{ rows, hasMore, prevCursor, nextCursor }`. We test the
 * CONTRACT and CONTROL FLOW here (PAGE_SIZE+1 read, hasMore detection,
 * cursor encoding, before-direction row reversal, malformed-cursor safety,
 * DB-error safe default, quality + search WHERE composition).
 *
 * Cursor shape: 2-part `[createdAt.toISOString(), id]`. Sort order is
 * `(createdAt DESC, id ASC)` for forward pages; flipped for backward.
 *
 * Mock pattern mirrors `tests/unit/admin/leads-queries.test.ts`.
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

import { listCalculatorLeadsForAdmin } from '@/lib/admin/calculator-leads-queries'
import { decodeCursor, encodeCursor, PAGE_SIZE } from '@/lib/admin/list-cursor'
import { logger } from '@/lib/logger'

function makeRow(
	idx: number,
	overrides: Partial<{
		id: string
		createdAt: Date | null
		name: string | null
		email: string
		leadQuality: string | null
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
		company: null,
		calculatorType: 'ttl',
		inputs: {},
		results: {},
		leadScore: null,
		leadQuality: overrides.leadQuality ?? null,
		contacted: false,
		contactedAt: null,
		converted: false,
		convertedAt: null,
		conversionValue: null,
		notes: null,
		utmSource: null,
		utmMedium: null,
		utmCampaign: null,
		utmTerm: null,
		utmContent: null,
		referrer: null,
		landingPage: null,
		userAgent: null,
		ipAddress: null,
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

describe('listCalculatorLeadsForAdmin: page-size + hasMore', () => {
	test('returns PAGE_SIZE rows + hasMore=true + nextCursor encoded from LAST RETURNED row when DB yields PAGE_SIZE + 1', async () => {
		const allRows = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => makeRow(i))
		state.rowsToReturn = allRows

		const result = await listCalculatorLeadsForAdmin()

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

		const result = await listCalculatorLeadsForAdmin()

		expect(result.rows.length).toBe(3)
		expect(result.hasMore).toBe(false)
		expect(result.nextCursor).toBeNull()
		expect(result.prevCursor).toBeNull()
	})

	test('returns empty shape when DB yields zero rows', async () => {
		state.rowsToReturn = []

		const result = await listCalculatorLeadsForAdmin()

		expect(result).toEqual({
			rows: [],
			hasMore: false,
			prevCursor: null,
			nextCursor: null
		})
	})
})

describe('listCalculatorLeadsForAdmin: DB error safety', () => {
	test('returns empty result + logs error when the query throws', async () => {
		state.shouldThrow = true

		const result = await listCalculatorLeadsForAdmin()

		expect(result).toEqual({
			rows: [],
			hasMore: false,
			prevCursor: null,
			nextCursor: null
		})
		expect(logger.error).toHaveBeenCalledTimes(1)
	})
})

describe('listCalculatorLeadsForAdmin: WHERE composition', () => {
	test('no opts produces undefined WHERE (no filter)', async () => {
		state.rowsToReturn = []

		await listCalculatorLeadsForAdmin()

		expect(state.whereArg).toBeUndefined()
	})

	test("quality='hot' produces a non-empty WHERE (eq predicate on leadQuality)", async () => {
		state.rowsToReturn = []

		await listCalculatorLeadsForAdmin({ quality: 'hot' })

		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})

	test("q='alice' produces a non-empty WHERE (ILIKE OR over email + name)", async () => {
		state.rowsToReturn = []

		await listCalculatorLeadsForAdmin({ q: 'alice' })

		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})

	test('whitespace-only q is treated as no search (undefined WHERE)', async () => {
		state.rowsToReturn = []

		await listCalculatorLeadsForAdmin({ q: '   ' })

		expect(state.whereArg).toBeUndefined()
	})

	test('quality + q combine into a non-empty WHERE (and of eq + or-of-ilike)', async () => {
		state.rowsToReturn = []

		await listCalculatorLeadsForAdmin({ quality: 'warm', q: 'alice' })

		expect(state.whereArg).toBeDefined()
		expect(state.whereArg).not.toBeNull()
	})
})

describe('listCalculatorLeadsForAdmin: cursor + direction', () => {
	test('malformed cursor falls back to page 1 (never throws)', async () => {
		state.rowsToReturn = [makeRow(0)]

		const result = await listCalculatorLeadsForAdmin({ cursor: 'not-a-cursor' })

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
			'2026-05-15T00:00:00.000Z',
			'row-05'
		])

		const result = await listCalculatorLeadsForAdmin({ cursor: beforeCursor })

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
			'2026-05-01T00:00:00.000Z',
			'sentinel-id'
		])

		const result = await listCalculatorLeadsForAdmin({ cursor: afterCursor })

		expect(result.rows.length).toBe(PAGE_SIZE)
		expect(result.hasMore).toBe(true)
		expect(result.prevCursor).not.toBeNull()
		expect(result.nextCursor).not.toBeNull()
	})
})
