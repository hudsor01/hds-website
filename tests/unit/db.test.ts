/**
 * Regression test locking the db mock-proxy no-op (NOOP-02).
 *
 * TEST_ENV (tests/setup.ts) omits POSTGRES_URL, so `hasNoDatabase` is true at
 * module load and `db` is the createMockDb() proxy. The documented contract:
 * every chained query resolves to [] and never throws (CI / preview builds
 * without a database still render). This test asserts that contract so a future
 * change that makes db throw or do real work without POSTGRES_URL is caught.
 */
import { describe, expect, it } from 'bun:test'
import { db } from '@/lib/db'

describe('db mock proxy (no-op when POSTGRES_URL unset)', () => {
	// The mock proxy resolves every chain to []; its static type is still
	// Drizzle's typed query result, so the awaited value is cast through
	// `unknown` to assert the runtime contract (the proxy IS the behavior
	// under test). No `any`.
	it('resolves a bare select() to []', async () => {
		const result = (await db.select()) as unknown
		expect(result).toEqual([])
	})

	it('resolves a chained select().from().where() to [] (args ignored)', async () => {
		// The mock proxy ignores args; {} stands in for a table reference.
		const result = (await db
			.select()
			.from({} as never)
			.where({} as never)) as unknown
		expect(result).toEqual([])
	})

	it('does not throw for an insert chain', async () => {
		const result = (await db.insert({} as never).values({} as never)) as unknown
		expect(result).toEqual([])
	})
})
