/**
 * Pure routing helper for admin detail-page loaders (Phase 13, ADMINERR-04).
 *
 * Each `[id]` detail server component reads its row via a `get*ById` query that
 * returns the 3-way `AdminDetailResult` union (`found` / `not-found` / `error`).
 * The loader must map that union onto exactly one of three render outcomes:
 *   - a genuinely missing row -> `notFound()` (404)
 *   - a caught DB failure      -> a visible `<AdminErrorState>` (NEVER a 404)
 *   - a found row              -> render the data
 *
 * The CRITICAL guarantee this helper locks down is that a DB `'error'` is
 * routed to `{ kind: 'error' }` and never collapses into `{ kind: 'not-found' }`
 * (which would render a misleading 404 on a transient failure). Extracting the
 * mapping into a side-effect-free function lets us unit-test that guarantee with
 * pure input -> output assertions, without rendering a React server component or
 * mocking `next/navigation`.
 *
 * Tier-agnostic by design (no server-only guard, no I/O): it only switches on a
 * plain discriminated union and returns a plain discriminated union.
 */
import type { AdminDetailResult } from './query-result'

/**
 * The render outcome a detail loader should take, derived purely from the
 * query result. `'render'` carries the row data; the other two carry nothing.
 */
export type DetailRouting<T> =
	| { kind: 'not-found' }
	| { kind: 'error' }
	| { kind: 'render'; data: T }

/**
 * Map an `AdminDetailResult` onto the loader's render outcome. Exhaustive over
 * the three statuses; `'error'` maps to `{ kind: 'error' }` so a DB failure can
 * never be mistaken for a 404.
 */
export function routeDetailResult<T>(
	result: AdminDetailResult<T>
): DetailRouting<T> {
	switch (result.status) {
		case 'not-found':
			return { kind: 'not-found' }
		case 'error':
			return { kind: 'error' }
		case 'found':
			return { kind: 'render', data: result.data }
		default:
			return assertNever(result)
	}
}

// Compile-time exhaustiveness guard: if a future `AdminDetailResult` variant is
// added without a matching case above, this fails to typecheck.
function assertNever(value: never): never {
	throw new Error(`unexpected detail result variant: ${JSON.stringify(value)}`)
}
