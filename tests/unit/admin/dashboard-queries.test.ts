/**
 * Tests for the admin dashboard widget queries (`src/lib/admin/dashboard-queries.ts`).
 *
 * WAVE 1 SCAFFOLD (Phase 13, plan 01): this file is created now so that plan 08
 * (Wave 2) only EXTENDS it - the file is owned by plan 08 thereafter. Today it
 * contains the chainable-db-mock harness (copied from `leads-queries.test.ts`)
 * plus ONE placeholder smoke test so the file is green and committable. The
 * real per-widget found-empty / error regression cases are added in plan 08.
 *
 * ---------------------------------------------------------------------------
 * PLAN 08 MUST COVER (ADMINERR-02): for each of the FIVE widget queries below,
 * assert the catch path yields the failure variant (`{ ok: false, error: true }`)
 * - NOT the current `[]` - and that a zero-row read yields `ok` with empty data.
 * Mock the db to throw via `state.shouldThrow = true`.
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

beforeEach(() => {
	resetState()
	// tests/setup.ts beforeEach runs `mock.restore()` BEFORE this file's
	// beforeEach. Re-register the db mock so the chainable stub stays bound to
	// the module under test for every case.
	setupDbMock()
})

describe('dashboard-queries: scaffold smoke', () => {
	test('the module exports all five widget queries and they are callable', async () => {
		expect(typeof getVisitorsByDay).toBe('function')
		expect(typeof getTopPages).toBe('function')
		expect(typeof getTrafficSources).toBe('function')
		expect(typeof getWebVitalsP75).toBe('function')
		expect(typeof getRecentLeads).toBe('function')

		// getRecentLeads exercises the .orderBy().limit() chain (no where/groupBy);
		// the thenable mock resolves it to the empty rows fixture.
		state.rowsToReturn = []
		const rows = await getRecentLeads(10)
		expect(Array.isArray(rows)).toBe(true)
		expect(rows).toEqual([])
	})
})
