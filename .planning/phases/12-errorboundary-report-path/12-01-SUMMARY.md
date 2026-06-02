---
phase: 12-errorboundary-report-path
plan: 01
subsystem: api
tags: [error-reporting, telemetry, zod, sonner, sentry, next-route-handler, csrf-free, react-error-boundary]

# Dependency graph
requires:
  - phase: (existing infra)
    provides: withMutationGuards (guards.ts), reportError (error-tracking.ts), logger.error sink, Sonner Toaster mounted at root
provides:
  - POST /api/error-report public CSRF-free rate-limited telemetry route (Zod-validated, 204/400)
  - errorReportSchema (Zod) + ErrorReport type in its own schema file with .max() caps
  - ErrorBoundary.reportError wired to a real fetch with honest Sonner feedback (alert() deleted)
  - DefaultErrorFallback is now an exported component (for testing)
affects: [admin-error-observability, intentional-noop-confirmation, any future error-triage dashboard]

# Tech tracking
tech-stack:
  added: []  # zero new packages - all libs (next, zod, sonner, @sentry/nextjs, react) already declared
  patterns:
    - "Public CSRF-free telemetry POST: withMutationGuards(handler, { rateLimit:'api', csrf:false }) (mirrors csp-reports/web-vitals)"
    - "Server-side dual-sink: logger.error (always-on, redacted) + reportError (env-gated Sentry); never echo body"
    - "Client/server boundary: client only fetches; @/lib/error-tracking + @sentry/nextjs stay out of the client bundle"
    - "Honest UX: Sonner toast conditioned on res.ok; failure keeps Copy Error Details as the fallback"

key-files:
  created:
    - src/lib/schemas/error-report.ts
    - src/app/api/error-report/route.ts
    - tests/unit/api-error-report.test.ts
    - tests/unit/error-boundary-report.test.tsx
  modified:
    - src/components/utilities/ErrorBoundary.tsx

key-decisions:
  - "Status code 204 (no body) on success for symmetry with csp-reports; client reads only res.ok"
  - "csrf:false is mandatory - the crashed page cannot mint a CSRF token; same-origin check is the substitute defense"
  - "Schema lives in its own file (src/lib/schemas/error-report.ts), NOT in the Drizzle table barrel"
  - "Sentry forwarding stays server-side only (route owns reportError); client never imports error-tracking"
  - "A simple sending useState disables the button in-flight (full debounce is YAGNI; rate-limit 'api' is the server backstop)"

patterns-established:
  - "errorReportSchema as the boundary contract: safeParse -> 400; .max() caps are the input-validation control (V5)"
  - "Client error report transmission via await fetch + toast.success/toast.error keyed on res.ok"

requirements-completed: [ERR-01]

# Metrics
duration: ~20min
completed: 2026-06-02
---

# Phase 12 Plan 01: errorboundary-report-path Summary

**The ErrorBoundary "Report Error" button now transmits a real POST to a new Zod-validated /api/error-report channel and gives honest Sonner feedback; the lying alert() (the only one in the codebase) and the fake logger.warn('... prepared') are gone.**

## Performance

- **Duration:** ~20 min
- **Tasks:** 3/3 (2 TDD, 1 verification gate)
- **Files modified:** 5 (4 created, 1 edited)

## Accomplishments
- Created `POST /api/error-report`: a public, CSRF-free, rate-limited telemetry route mirroring `csp-reports` verbatim on its guard. It `safeParse`s the body with `errorReportSchema`, captures it always-on via `logger.error` (PII-redacted, persists to `error_logs` in prod), forwards env-gated to Sentry via `reportError`, returns `204` on success and a bare `400` on bad/malformed body without leaking any internals.
- Rewired `DefaultErrorFallback.reportError` to `await fetch('/api/error-report', ...)` and show `toast.success` only on `res.ok`, `toast.error` on a non-ok response or a thrown fetch. Deleted the `alert('... has been prepared')` and the lying `logger.warn('[ErrorBoundary] Error report prepared')`. Added a `sending` in-flight guard (`disabled={sending}`). Copy Error Details + mailto paths untouched. No Sentry/error-tracking import leaks into the client bundle.
- Both new unit tests green (7 tests): route (valid 204 + logger/reportError spies, missing-message 400, bad-url 400, raw-string 400) and client (toast.success on ok, toast.error on fail/throw + logger.error).

## Task Commits

Each task was committed atomically (normal commits, lefthook pre-commit hooks passed - no --no-verify):

1. **Task 1: Error-report Zod schema + POST route + route unit test** - `f6316ce` (feat) - TDD RED (test landed failing on missing route) -> GREEN (route makes 4/4 pass); schema + route + test committed together as the feature unit.
2. **Task 2: Rewire ErrorBoundary reportError to fetch + Sonner; delete alert(); client unit test** - `584687c` (fix) - TDD RED (test failed on unexported DefaultErrorFallback + alert path) -> GREEN (3/3 pass).
3. **Task 3: Full phase gate** - no code commit (verification-only). Results recorded below.

## Files Created/Modified
- `src/lib/schemas/error-report.ts` (NEW) - `errorReportSchema` (Zod) + `ErrorReport` inferred type with `.max()` length caps (message 2000, stack 10000, url 2000, userAgent 1000, platform 200, language 50). Not added to the Drizzle table barrel.
- `src/app/api/error-report/route.ts` (NEW) - POST handler: `safeParse` -> 400; on success `logger.error` (always-on) + `reportError` (env-gated Sentry) -> 204; `withMutationGuards(handler, { rateLimit:'api', csrf:false })`.
- `src/components/utilities/ErrorBoundary.tsx` (EDIT) - added `import { toast } from 'sonner'`; exported `DefaultErrorFallback`; added `sending` state; rewrote `reportError` to real fetch + honest toast; deleted alert() + lying logger.warn + commented fetch; `disabled={sending}` on the Report Error button.
- `tests/unit/api-error-report.test.ts` (NEW) - 4 route cases; mocks `@/lib/error-tracking` so `reportError` is an assertable spy.
- `tests/unit/error-boundary-report.test.tsx` (NEW) - 3 client cases (A: ok -> success; B: not-ok -> error; C: throw -> error + logger), flushing the async fetch with `waitFor`.

## Phase Gate Results (Task 3)
- `bun run lint`: clean (410 files).
- `bun run typecheck`: clean (no `any`, strict).
- New test files in isolation: **7 pass / 0 fail** (`api-error-report.test.ts` 4, `error-boundary-report.test.tsx` 3).
- Full `bun test tests/`: **976 pass / 21 fail** (997 total). The 21 are exactly the documented pre-existing cross-file RTL pollution: `Footer Component` (9) + `HomePage structural assertions` (10) + `Navbar Polish` (1) + `Navigation Accessibility` (1), all in `homepage.test.tsx` + `navigation.test.tsx`. They pass **35/0 in isolation**. **0 net-new failures** vs the Phase 11 baseline (953 pass / 21 fail).
- `bun run build`: **compiled successfully in 6.6s** (202 static pages); `ƒ /api/error-report` present in the route manifest (dynamic, as expected for a POST handler).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Client-test logger live-binding mismatch with tests/setup.ts**
- **Found during:** Task 2 (TDD GREEN of the client test).
- **Issue:** `tests/setup.ts` `beforeEach` runs `mock.restore()` then re-`mock.module`s `@/lib/logger` with a **fresh** `mockLoggerInstance` every test. A test-local `mock.module('@/lib/logger', ...)` spy (Case C) never received the call because the component's live ES-module binding resolved to setup's per-test instance, while a destructured `const { logger }` snapshot in the test diverged. The catch-branch `logger.error` was being called - on setup's instance, not the local spy - so `toastError` passed but the logger assertion read 0 calls.
- **Fix:** Dropped the test-local logger `mock.module`; read the current mocked instance at assert time via a small `currentLoggerError()` helper that re-imports `@/lib/logger` (so test and component agree on the same per-test spy). Sonner remains test-locally mocked (it is not remocked by setup.ts).
- **Files modified:** `tests/unit/error-boundary-report.test.tsx`
- **Commit:** `584687c`

**2. [Rule 3 - Blocking] fetch mock cast rejected by tsc**
- **Found during:** Task 2 typecheck.
- **Issue:** `mock().mockResolvedValue({ ok: true }) as typeof fetch` failed `tsc` (TS2352 - the mock lacks `fetch.preconnect`).
- **Fix:** Cast via `as unknown as typeof fetch` on all three fetch stubs.
- **Files modified:** `tests/unit/error-boundary-report.test.tsx`
- **Commit:** `584687c`

No architectural deviations (no Rule 4). No authentication gates encountered.

## Threat Model Compliance
All `mitigate` dispositions in the plan's threat register are implemented:
- **T-12-01 / T-12-02 (Tampering/DoS):** `withMutationGuards({ rateLimit:'api', csrf:false })` (same-origin + 60/min/IP) + client `sending` in-flight guard.
- **T-12-03 (oversized/malformed body):** `errorReportSchema.safeParse` with `.max()` caps; non-JSON/non-object -> catch -> 400.
- **T-12-04 (PII in logs):** `logger.error` runs `redactSensitive` at the sink.
- **T-12-05 (response leak):** 204 no-body on success, bare 400 on failure; parsed body never echoed.
- **T-12-07 (Sentry in client bundle):** grep gate confirms no `error-tracking`/`@sentry` import in `ErrorBoundary.tsx`.
- **T-12-SC:** zero new packages installed.

No new threat surface beyond the planned endpoint.

## Known Stubs
None. The route transmits and captures for real; the client feedback is conditioned on `res.ok`. No placeholder/empty-data paths remain.

## Self-Check: PASSED
All 5 created files exist on disk; both task commits (`f6316ce`, `584687c`) found in git log.
