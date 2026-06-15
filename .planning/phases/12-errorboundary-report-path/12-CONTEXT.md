# Phase 12: errorboundary-report-path - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning
**Source:** Synthesized from `.planning/v6-AUDIT-FINDINGS.md` finding #3 + operator decision (v6).

<domain>
## Phase Boundary

Make the ErrorBoundary "Report Error" action tell the truth. Today `DefaultErrorFallback.reportError` (`src/components/utilities/ErrorBoundary.tsx:65`) builds an `errorReport` object, has its only transmission path (`fetch('/api/error-report', ...)`) commented out, no such route exists, and then it calls `alert('Error report has been prepared...')` — claiming a report was filed when nothing was sent. The ErrorBoundary wraps the root layout, so this is live in production, and it is the only `alert()` in the codebase.

**Operator decision (LOCKED): wire it to a REAL report path** (not remove the button). The button must actually transmit the report, and the user feedback must be honest.

**In scope:** a real client->server error-report channel + the ErrorBoundary client wiring + replacing `alert()` with a Sonner toast. `src/components/utilities/ErrorBoundary.tsx`, a new `src/app/api/error-report/route.ts`, and whatever guard/schema that route needs.

**Out of scope:** redesigning the ErrorBoundary UI; changing the "Copy Error Details" or mailto paths (they stay); any other error-handling refactor. ERR-01 only.
</domain>

<decisions>
## Implementation Decisions (LOCKED)

### Real report channel (ERR-01)
- Create `POST /api/error-report` (`src/app/api/error-report/route.ts`) as the always-on real channel. Mirror the existing `src/app/api/csp-reports/route.ts` pattern: validate the JSON body with Zod, log the report server-side via `logger.error`/`logger.warn` (the project log sink, which redacts PII and persists), and ALSO forward to Sentry via the existing `reportError(error, tags)` from `src/lib/error-tracking.ts` (server-side, env-gated — no-op when `SENTRY_DSN` unset, which is fine; the logger capture is the always-on guarantee). Return a small success status (200/204); never expose internals.
- The route must NOT depend on a client CSRF token the crashed page may not have. Research/planner: determine the correct guard for an unauthenticated, client-originated error report — rate-limited but CSRF-appropriate (look at how `csp-reports` and `web-vitals` routes guard themselves; match the lightest guard that fits a public telemetry POST). Do not block legitimate reports behind a token the ErrorBoundary cannot supply.

### ErrorBoundary client wiring (ERR-01)
- In `reportError` (`ErrorBoundary.tsx`): replace the commented-out fetch + `alert()` with a real `await fetch('/api/error-report', { method: 'POST', headers, body: JSON.stringify(errorReport) })`.
- Replace BOTH the `alert()` and the bare `logger.warn(... 'prepared')` with honest behavior: on a successful POST, show `toast.success(...)` (Sonner is the project toast standard, Toaster is mounted at root); on failure, show `toast.error(...)` AND keep the "Copy Error Details" path as the fallback. The copy must NEVER claim a report was filed when the POST failed.
- No `alert()` anywhere (it is the only one in the codebase; remove it). User-facing toast/copy strings must be em/en-dash free (CLAUDE.md).
- `ErrorBoundary.tsx` is `'use client'` and already imports `logger`; add the `sonner` import. It currently imports `reportError`? No — it uses the local `reportError` handler; the SERVER route is what calls error-tracking's `reportError`. Keep the client/server boundary clean (client fetches; server logs + Sentry).

### Claude's Discretion
- Exact toast copy (dash-free, honest).
- The Zod schema shape for the error-report body (message/stack/url/userAgent/timestamp/platform/language are the current fields).
- Whether to debounce/limit repeat reports; the precise guard/rate-limit on the route (pick the lightest correct one).
- Status code (200 vs 204) and response shape.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Audit source of truth
- `.planning/v6-AUDIT-FINDINGS.md` — finding #3 (the "Report Error" button that reports nothing and lies via alert()).

### Code under change / analogs
- `src/components/utilities/ErrorBoundary.tsx` — `DefaultErrorFallback.reportError` (~line 65), the commented fetch (~81-85), the `alert()` (~88-90), the "Copy Error Details" handler (analog for the fallback), `'use client'`.
- `src/app/api/csp-reports/route.ts` — the CLOSEST analog: a public client->server telemetry POST that validates + logs via `logger`, with its guard (`withMutationGuards`) — confirm whether that guard requires CSRF and whether it fits an error-report POST.
- `src/app/api/web-vitals/route.ts` — second analog for a client telemetry POST + its guard.
- `src/lib/error-tracking.ts` — `reportError(error, tags)` Sentry seam (env-gated; server-side forward target).
- `src/lib/logger.ts` — the log sink (PII-redacting, DB-persisting); server-side capture is the always-on guarantee.
- `src/lib/api/guards.ts` — `withMutationGuards` (CSRF + rate-limit); determine the right guard for a public error-report POST.
- `src/app/layout.tsx` — where ErrorBoundary + the Sonner `<Toaster />` are mounted (confirm Toaster availability in the fallback).

### Schema location
- `src/lib/schemas/` — add the error-report Zod schema here per project convention (`safeParse`, export schema + inferred type).
</canonical_refs>

<specifics>
## Specific Ideas
- Honest contract: a report is "sent" only when the POST returns ok; the toast/copy must reflect that. The server `logger.error` capture means even a Sentry-less deploy records the report — so success is real, not theater.
- Gates after: `bun run lint && bun run typecheck && bun run test:unit && bun run build`. Unit-test the route handler (success + invalid-body) per project convention; the ErrorBoundary client behavior may warrant a small test or an e2e if one fits.
</specifics>

<deferred>
## Deferred Ideas
- A richer error-reporting dashboard / triage surface (none today; out of scope).
</deferred>

---
*Phase: 12-errorboundary-report-path*
*Context gathered: 2026-06-02, synthesized from v6 finding #3 + operator decision (wire to a real report path)*
