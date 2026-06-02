/**
 * Tests for the shared admin result-type constructors (Phase 13, plan 01).
 *
 * These are pure functions with no DB / no I/O, so no mock harness is needed.
 * We assert each constructor produces the exact discriminated-union shape and
 * that narrowing works both 2-way (`AdminQueryResult`) and 3-way
 * (`AdminDetailResult`). The 3-way exhaustiveness is verified at compile time
 * via a `switch` with an `assertNever` default, and at runtime by routing.
 */
import { describe, expect, test } from 'bun:test'
import {
	type AdminDetailResult,
	type AdminQueryResult,
	err,
	errResult,
	found,
	notFoundResult,
	ok
} from '@/lib/admin/query-result'

describe('AdminQueryResult constructors', () => {
	test('ok(data) produces { ok: true, data } and narrows to expose data', () => {
		const result: AdminQueryResult<number[]> = ok([1, 2, 3])
		expect(result).toEqual({ ok: true, data: [1, 2, 3] })
		// Type narrowing: inside `result.ok === true`, `result.data` is reachable.
		if (result.ok) {
			expect(result.data).toEqual([1, 2, 3])
		} else {
			throw new Error('expected ok variant')
		}
	})

	test('ok(data) carries an empty payload distinctly from err()', () => {
		const empty: AdminQueryResult<string[]> = ok([])
		expect(empty).toEqual({ ok: true, data: [] })
		expect(empty.ok).toBe(true)
		// A legitimately-empty success is NOT the error variant.
		expect(empty).not.toEqual(err())
	})

	test('err() produces { ok: false, error: true } and carries no payload', () => {
		const result: AdminQueryResult<number> = err()
		expect(result).toEqual({ ok: false, error: true })
		expect(result.ok).toBe(false)
		expect('data' in result).toBe(false)
	})
})

describe('AdminDetailResult constructors', () => {
	test("found(data) produces { status: 'found', data }", () => {
		const result: AdminDetailResult<{ id: string }> = found({ id: 'abc' })
		expect(result).toEqual({ status: 'found', data: { id: 'abc' } })
	})

	test("notFoundResult() produces { status: 'not-found' } with no payload", () => {
		const result: AdminDetailResult<unknown> = notFoundResult()
		expect(result).toEqual({ status: 'not-found' })
		expect('data' in result).toBe(false)
	})

	test("errResult() produces { status: 'error' } with no payload", () => {
		const result: AdminDetailResult<unknown> = errResult()
		expect(result).toEqual({ status: 'error' })
		expect('data' in result).toBe(false)
	})

	test('the three detail statuses are mutually exclusive', () => {
		expect(found({ id: 1 }).status).toBe('found')
		expect(notFoundResult().status).toBe('not-found')
		expect(errResult().status).toBe('error')
	})
})

describe('AdminDetailResult 3-way narrowing is exhaustive', () => {
	// Compile-time exhaustiveness guard: if a future variant is added without a
	// matching case, `assertNever` fails to typecheck.
	function assertNever(value: never): never {
		throw new Error(`unexpected variant: ${JSON.stringify(value)}`)
	}

	function route<T>(result: AdminDetailResult<T>): 'render' | '404' | 'error' {
		switch (result.status) {
			case 'found':
				// `result.data` is reachable only in this branch.
				void result.data
				return 'render'
			case 'not-found':
				return '404'
			case 'error':
				return 'error'
			default:
				return assertNever(result)
		}
	}

	test('found routes to render', () => {
		expect(route(found({ id: 'x' }))).toBe('render')
	})

	test('not-found routes to 404', () => {
		expect(route(notFoundResult())).toBe('404')
	})

	test('error routes to error (NOT 404)', () => {
		expect(route(errResult())).toBe('error')
	})
})
