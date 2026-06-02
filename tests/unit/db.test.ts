/**
 * Regression test locking the db mock-proxy no-op (NOOP-02).
 *
 * TEST_ENV (tests/setup.ts) omits POSTGRES_URL, so `hasNoDatabase` is true at
 * module load and the real `@/lib/db` export is the createMockDb() proxy. The
 * documented contract: every chained query resolves to [] and never throws
 * (CI / preview builds without a database still render). This test asserts that
 * contract so a future change that makes db throw or do real work without
 * POSTGRES_URL is caught.
 *
 * NOTE: it asserts against `globalThis.__REAL_DB__`, the genuine `@/lib/db`
 * export captured at preload in tests/setup.ts. A plain `import { db } from
 * '@/lib/db'` would be intercepted by sibling suites that register
 * `mock.module('@/lib/db', ...)` (blog, showcase, api-*) — those registrations
 * persist for the whole run and are never cleared by mock.restore()
 * (oven-sh/bun#7823), so the import cannot reach the real module under
 * full-suite ordering. The preload capture is the only pollution-immune handle
 * on the genuine proxy under test.
 */
import { describe, expect, it } from 'bun:test'

// The real createMockDb proxy captured before any sibling mock.module('@/lib/db').
// Shapes are the chainable query-builder surface the proxy exposes; the proxy
// resolves every chain to [] regardless of args. The cast to `unknown` on each
// awaited value asserts the runtime contract without `any` (the proxy IS the
// behavior under test).
interface MockDbProxy {
	select: () => {
		from: (table: unknown) => { where: (clause: unknown) => unknown }
	}
	insert: (table: unknown) => { values: (rows: unknown) => unknown }
}

function getRealDb(): MockDbProxy {
	const captured = (globalThis as { __REAL_DB__?: MockDbProxy }).__REAL_DB__
	if (!captured) {
		throw new Error(
			'__REAL_DB__ was not captured by tests/setup.ts preload — cannot assert the db no-op contract'
		)
	}
	return captured
}

describe('db mock proxy (no-op when POSTGRES_URL unset)', () => {
	it('exposes the genuine createMockDb proxy via the preload capture', () => {
		expect(getRealDb()).toBeDefined()
	})

	it('resolves a bare select() to []', async () => {
		const result = (await getRealDb().select()) as unknown
		expect(result).toEqual([])
	})

	it('resolves a chained select().from().where() to [] (args ignored)', async () => {
		// The mock proxy ignores args; {} stands in for a table reference.
		const result = (await getRealDb().select().from({}).where({})) as unknown
		expect(result).toEqual([])
	})

	it('does not throw for an insert chain', async () => {
		const result = (await getRealDb().insert({}).values({})) as unknown
		expect(result).toEqual([])
	})
})
