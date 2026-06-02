/**
 * Tests for the pure detail-page routing helper (Phase 13, ADMINERR-04).
 *
 * `routeDetailResult` is the single mapping every admin `[id]` detail loader
 * applies to its `AdminDetailResult` before deciding whether to `notFound()`,
 * render `<AdminErrorState>`, or render the row. The mapping is pure (no DB, no
 * React, no `next/navigation`), so it is asserted here with plain input ->
 * output checks -- NO `mock.module`, NO JSX, NO page-module imports. This keeps
 * the global module registry clean (a prior attempt poisoned unrelated tests by
 * mocking `next/navigation` / `@/lib/constants/business` from a detail-page
 * test) while still locking the behavior down.
 *
 * The load-bearing assertion is the regression guard: `errResult()` (a caught
 * DB failure) must route to `{ kind: 'error' }` and NEVER to
 * `{ kind: 'not-found' }`. A DB error is never a 404 -- this test pins that
 * contract so the mapping cannot silently regress.
 */
import { describe, expect, test } from 'bun:test'
import { routeDetailResult } from '@/lib/admin/detail-result-routing'
import { errResult, found, notFoundResult } from '@/lib/admin/query-result'

describe('routeDetailResult: DB error is never a 404', () => {
	test("errResult() routes to { kind: 'error' } (NOT 'not-found')", () => {
		const routing = routeDetailResult(errResult())
		expect(routing).toEqual({ kind: 'error' })
		// Explicit regression guard: a caught DB failure must not collapse into a
		// 404, which would render a misleading "not found" on a transient error.
		expect(routing.kind).not.toBe('not-found')
	})

	test("notFoundResult() routes to { kind: 'not-found' }", () => {
		const routing = routeDetailResult(notFoundResult())
		expect(routing).toEqual({ kind: 'not-found' })
	})

	test("found(data) routes to { kind: 'render', data } carrying the row", () => {
		const data = { id: 'abc', title: 'Example' }
		const routing = routeDetailResult(found(data))
		expect(routing).toEqual({ kind: 'render', data })
		// The data is reachable only on the render branch.
		if (routing.kind === 'render') {
			expect(routing.data).toBe(data)
		} else {
			throw new Error('expected render variant')
		}
	})
})

describe('routeDetailResult: the three outcomes are mutually exclusive', () => {
	test('each status maps to exactly one distinct kind', () => {
		expect(routeDetailResult(notFoundResult()).kind).toBe('not-found')
		expect(routeDetailResult(errResult()).kind).toBe('error')
		expect(routeDetailResult(found(1)).kind).toBe('render')
	})
})
