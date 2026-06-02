/**
 * Tests for the admin dashboard widget queries (`src/lib/admin/dashboard-queries.ts`).
 *
 * WAVE 1 SCAFFOLD (Phase 13, plan 01) -> POPULATED in plan 08 (Wave 2). The
 * harness (chainable-db-mock copied from `leads-queries.test.ts`) is owned by
 * plan 08; the Wave-1 placeholder smoke test has been replaced with the real
 * per-widget found-empty / error regression cases below.
 *
 * ---------------------------------------------------------------------------
 * COVERAGE (ADMINERR-02): for each of the FIVE widget queries below, assert the
 * catch path yields the failure variant (`{ ok: false, error: true }`) - NOT
 * the old `[]` - and that a zero-row read yields `ok` with empty data. The db
 * is mocked to throw via `state.shouldThrow = true`.
 *
 *   1. getVisitorsByDay   - .where().groupBy(dayExpr).orderBy(dayExpr)
 *   2. getTopPages        - .where().groupBy(pathname).orderBy(desc).limit(n)
 *   3. getTrafficSources  - .where(and(...)).groupBy(channel).orderBy(desc)
 *   4. getWebVitalsP75    - .where().groupBy(name).orderBy(name)
 *   5. getRecentLeads     - .orderBy(desc).limit(n)   (no where / no groupBy)
 *
 * NOTE: the widget queries call `.groupBy().orderBy().limit()` over `sql` exprs,
 * so the mock chain MUST include `groupBy`. Different queries terminate on a
 * different method (`orderBy` for visitors/sources/vitals, `limit` for top
 * pages / recent leads), so the chain itself is awaitable (thenable) - awaiting
 * after ANY method resolves to `state.rowsToReturn` (or rejects when
 * `state.shouldThrow`). This matches the real Drizzle builder, which is
 * thenable at every step.
 * ---------------------------------------------------------------------------
 *
 * Mock pattern mirrors `tests/unit/admin/leads-queries.test.ts`.
 */
import { beforeEach, describe, expect, mock, test } from 'bun:test'

// --- Mock state shared across cases (re-initialized in beforeEach) ----------

interface MockState {
	rowsToReturn: unknown[]
	shouldThrow: boolean
}

const state: MockState = {
	rowsToReturn: [],
	shouldThrow: false
}

function resetState(): void {
	state.rowsToReturn = []
	state.shouldThrow = false
}

/**
 * A thenable chainable stub. Every builder method returns the same chain so any
 * call sequence (`.from().where().groupBy().orderBy().limit()` in any subset)
 * works. The chain is awaitable: `await chain` resolves to `state.rowsToReturn`
 * or rejects when `state.shouldThrow` - so it does not matter which method the
 * query under test treats as terminal.
 */
function buildSelectChain(): unknown {
	const settle = () =>
		state.shouldThrow
			? Promise.reject(new Error('db down'))
			: Promise.resolve(state.rowsToReturn)

	const chain: Record<string, unknown> = {
		from: () => chain,
		where: () => chain,
		groupBy: () => chain,
		orderBy: () => chain,
		limit: () => chain,
		// Awaiting the builder at any step resolves like the real Drizzle query.
		then: (
			resolve: (v: unknown) => unknown,
			reject?: (e: unknown) => unknown
		) => settle().then(resolve, reject)
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

// Real schema barrel is used - drizzle column refs are just objects the mocked
// chain ignores. `tests/setup.ts` auto-mocks `@/env` + `@/lib/logger`.
import {
	getRecentLeads,
	getTopPages,
	getTrafficSources,
	getVisitorsByDay,
	getWebVitalsP75
} from '@/lib/admin/dashboard-queries'
import { logger } from '@/lib/logger'

beforeEach(() => {
	resetState()
	// tests/setup.ts beforeEach runs `mock.restore()` BEFORE this file's
	// beforeEach. Re-register the db mock so the chainable stub stays bound to
	// the module under test for every case.
	setupDbMock()
})

// Each widget query is exercised twice: a thrown DB call must yield the failure
// variant (`{ ok: false, error: true }`) and log once via `logger.error`; a
// zero-row read must yield `ok` with empty `data` - the distinction that lets a
// widget tell "DB down" from "no data yet".

describe('getVisitorsByDay: error vs ok-empty', () => {
	test('returns the error variant + logs once when the query throws', async () => {
		state.shouldThrow = true

		const result = await getVisitorsByDay(30)

		expect(result).toEqual({ ok: false, error: true })
		expect(logger.error).toHaveBeenCalledTimes(1)
	})

	test('returns ok with empty data when the query yields zero rows', async () => {
		state.rowsToReturn = []

		const result = await getVisitorsByDay(30)

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data).toEqual([])
	})
})

describe('getTopPages: error vs ok-empty', () => {
	test('returns the error variant + logs once when the query throws', async () => {
		state.shouldThrow = true

		const result = await getTopPages(10, 30)

		expect(result).toEqual({ ok: false, error: true })
		expect(logger.error).toHaveBeenCalledTimes(1)
	})

	test('returns ok with empty data when the query yields zero rows', async () => {
		state.rowsToReturn = []

		const result = await getTopPages(10, 30)

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data).toEqual([])
	})
})

describe('getTrafficSources: error vs ok-empty', () => {
	test('returns the error variant + logs once when the query throws', async () => {
		state.shouldThrow = true

		const result = await getTrafficSources(30)

		expect(result).toEqual({ ok: false, error: true })
		expect(logger.error).toHaveBeenCalledTimes(1)
	})

	test('returns ok with empty data when the query yields zero rows', async () => {
		state.rowsToReturn = []

		const result = await getTrafficSources(30)

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data).toEqual([])
	})
})

describe('getWebVitalsP75: error vs ok-empty', () => {
	test('returns the error variant + logs once when the query throws', async () => {
		state.shouldThrow = true

		const result = await getWebVitalsP75(7)

		expect(result).toEqual({ ok: false, error: true })
		expect(logger.error).toHaveBeenCalledTimes(1)
	})

	test('returns ok with empty data when the query yields zero rows', async () => {
		state.rowsToReturn = []

		const result = await getWebVitalsP75(7)

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data).toEqual([])
	})
})

describe('getRecentLeads: error vs ok-empty', () => {
	test('returns the error variant + logs once when the query throws', async () => {
		state.shouldThrow = true

		const result = await getRecentLeads(10)

		expect(result).toEqual({ ok: false, error: true })
		expect(logger.error).toHaveBeenCalledTimes(1)
	})

	test('returns ok with empty data when the query yields zero rows', async () => {
		state.rowsToReturn = []

		const result = await getRecentLeads(10)

		expect(result.ok).toBe(true)
		if (!result.ok) {
			throw new Error('expected ok result')
		}
		expect(result.data).toEqual([])
	})
})
