/**
 * Shared discriminated-union result types for the admin data seam
 * (`src/lib/admin/*-queries.ts`).
 *
 * Background (Phase 13, ADMINERR-01..04): every admin read query used to
 * swallow DB errors and return a "safe default" indistinguishable from real
 * emptiness (`[]` / `null` / an all-zero counts record). On a genuine failure
 * the operator saw an empty list, a falsely-healthy zeroed queue, or - worst -
 * a transient detail-page error masquerading as a 404. The fix is to RETURN a
 * discriminated result so a failed `catch` is distinguishable from a
 * successful-but-empty read, and each surface renders its own visible error
 * state in place (preserving the v4 per-widget resilience: a returned failure
 * never rejects a `Promise.all`, so one failed widget cannot blank the page).
 *
 * This module is INTENTIONALLY tier-agnostic: it contains only pure types and
 * trivial constructors and MUST stay importable from any tier (no server-tier
 * import guard). The two client widgets (`VisitorsChart`, `TrafficSourcesPie`)
 * import these result types, so a server-tier guard would break their bundle
 * build. Keep this file free of the server-tier import directive.
 *
 * Style matches the hand-rolled `RetryResult` union in `emails-queries.ts`
 * (no external Result library).
 */

/**
 * Two-variant result for list / widget / queue reads.
 *
 * `ok: true` carries the data (which may itself be legitimately empty);
 * `ok: false` carries no payload - the raw exception stays in `logger.error`
 * server-side only and never crosses into the rendered error state.
 */
export type AdminQueryResult<T> =
	| { ok: true; data: T }
	| { ok: false; error: true }

/** Wrap a successful read (the data may be empty - that is still `ok`). */
export const ok = <T>(data: T): AdminQueryResult<T> => ({ ok: true, data })

/** Signal a failed read. Carries no payload by design (no info-leak). */
export const err = (): AdminQueryResult<never> => ({ ok: false, error: true })

/**
 * Three-variant result for `get*ById` detail reads. Distinguishes a genuinely
 * missing row (`'not-found'` -> `notFound()` / 404) from a DB failure
 * (`'error'` -> error state, NOT a 404). The three statuses are mutually
 * exclusive; switching on `result.status` is exhaustive.
 */
export type AdminDetailResult<T> =
	| { status: 'found'; data: T }
	| { status: 'not-found' }
	| { status: 'error' }

/** A row was found. */
export const found = <T>(data: T): AdminDetailResult<T> => ({
	status: 'found',
	data
})

/** No row exists for this id - the consumer should 404. */
export const notFoundResult = (): AdminDetailResult<never> => ({
	status: 'not-found'
})

/** The detail read failed - the consumer should render an error state. */
export const errResult = (): AdminDetailResult<never> => ({ status: 'error' })
