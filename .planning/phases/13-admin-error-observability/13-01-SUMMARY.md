---
phase: 13-admin-error-observability
plan: 01
subsystem: api
tags: [typescript, discriminated-union, shadcn, alert, lucide, bun-test, admin]

# Dependency graph
requires:
  - phase: 13-CONTEXT (locked decisions)
    provides: "full error states everywhere; shared discriminated-union result + ONE shared error component; query-result module must NOT be server-only"
  - phase: v4 admin data seam
    provides: "src/lib/admin/*-queries.ts single read seam; shadcn Alert primitive; lucide icon library"
provides:
  - "AdminQueryResult<T> (2-way ok/err) for list/widget/queue reads"
  - "AdminDetailResult<T> (3-way found/not-found/error) for get*ById reads"
  - "ok/err/found/notFoundResult/errResult constructors (tier-agnostic, no server-only)"
  - "AdminErrorState component on shadcn Alert (role=alert, destructive), never renders a raw exception"
  - "tests/unit/admin/dashboard-queries.test.ts scaffold + thenable chainable-db-mock harness (plan 08 extends)"
affects: [13-02, 13-03, 13-04, 13-05, 13-06, 13-07, 13-08, 13-09, 13-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hand-rolled discriminated-union result (matches existing RetryResult idiom; no neverthrow dep)"
    - "Tier-agnostic types module: pure types + trivial constructors, no server-only guard (client widgets import the type)"
    - "Shared error UI on shadcn Alert with a fixed-copy, exception-free API (info-leak mitigation)"
    - "Thenable chainable-db-mock harness for queries that terminate on different builder methods"

key-files:
  created:
    - src/lib/admin/query-result.ts
    - src/components/admin/AdminErrorState.tsx
    - tests/unit/admin/query-result.test.ts
    - tests/unit/admin/dashboard-queries.test.ts
  modified: []

key-decisions:
  - "query-result.ts has NO server-only directive (grep gate returns 0) so the two client chart widgets can import the result type"
  - "AdminErrorState API is {resource?, message?, inline?} only - never an Error/exception (T-13-01 info-disclosure mitigation)"
  - "inline variant drops the card chrome for widget bodies; default wraps in the empty-state card chrome (rounded-xl border bg-surface-raised p-8)"
  - "lucide CircleAlert chosen as the error icon (components.json iconLibrary=lucide)"
  - "dashboard-queries mock chain is a thenable so any terminal method (orderBy or limit) resolves; includes groupBy for the widget chains"

patterns-established:
  - "AdminQueryResult<T> / AdminDetailResult<T>: the canonical error-vs-empty signaling shape every Wave 2 query returns"
  - "AdminErrorState: the ONE shared admin error UI reused across list pages, widgets, queue cards, detail pages"

requirements-completed: [ADMINERR-01, ADMINERR-02, ADMINERR-03, ADMINERR-04]

# Metrics
duration: 4min
completed: 2026-06-02
---

# Phase 13 Plan 01: Shared primitives Summary

**Discriminated-union result types (`AdminQueryResult<T>` 2-way + `AdminDetailResult<T>` 3-way) plus a shared `AdminErrorState` card on shadcn `Alert`, and a `dashboard-queries.test.ts` scaffold - the Wave 1 foundation every later admin plan imports.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-06-02T18:07:31Z
- **Completed:** 2026-06-02T18:09:35Z
- **Tasks:** 3
- **Files created:** 4

## Accomplishments
- `src/lib/admin/query-result.ts`: the two discriminated unions + five tiny constructors (`ok`/`err`/`found`/`notFoundResult`/`errResult`), no `any`, no `server-only` directive (grep gate returns 0) so client widgets can import the type.
- `src/components/admin/AdminErrorState.tsx`: the single shared error card built on shadcn `Alert` (`role="alert"`, `destructive`) + lucide `CircleAlert`; API accepts only `resource?`/`message?`/`inline?` and never an `Error` (T-13-01 info-leak mitigation); copy is dash-free and emoji-free.
- `tests/unit/admin/dashboard-queries.test.ts`: a passing scaffold with a thenable chainable-db-mock harness (includes `groupBy`) and a comment block enumerating the 5 widget queries plan 08 must cover.
- 11 passing unit tests across the two new test files; typecheck + lint green.

## Task Commits

Each task was committed atomically (hooks ran on every commit; no `--no-verify`):

1. **Task 1: Shared result-type module + unit test** - `e8634f2` (feat) — TDD task; source + 10-case test created and committed together (test verifies constructor shapes + 2-way + exhaustive 3-way narrowing)
2. **Task 2: AdminErrorState component** - `3df3e4c` (feat)
3. **Task 3: dashboard-queries test scaffold** - `42c1483` (test)

**Plan metadata:** (this commit) `docs(13-01): complete shared-primitives plan`

## Files Created/Modified
- `src/lib/admin/query-result.ts` - `AdminQueryResult<T>` / `AdminDetailResult<T>` unions + `ok`/`err`/`found`/`notFoundResult`/`errResult` constructors; tier-agnostic (no `server-only`).
- `src/components/admin/AdminErrorState.tsx` - shared destructive `Alert` error card; `{resource?, message?, inline?}` props; never renders an exception.
- `tests/unit/admin/query-result.test.ts` - 10 tests: constructor shapes, 2-way narrowing, exhaustive 3-way `switch` with compile-time `assertNever`.
- `tests/unit/admin/dashboard-queries.test.ts` - Wave 1 scaffold: thenable chainable-db-mock harness (with `groupBy`), imports all 5 widget queries, one smoke test, plan-08 coverage comment block.

## Decisions Made
- **`query-result.ts` is intentionally NOT `server-only`** (RESEARCH Pitfall 5): the `VisitorsChart`/`TrafficSourcesPie` client widgets import the result type, so a server-tier guard would break their bundle. The grep gate `grep -c "server-only" src/lib/admin/query-result.ts` returns 0 (the file's docstring was phrased to avoid even mentioning the literal string, so the gate is unambiguous for the verifier).
- **`AdminErrorState` API is exception-free by design** (threat T-13-01): props are `resource?`/`message?`/`inline?` only; the caught DB error stays in `logger.error` server-side. The "FOUND ERROR PROP" matches in a grep are all in the security-rationale docstring, not an actual `Error`-typed prop.
- **lucide `CircleAlert`** chosen (over `TriangleAlert`) as the destructive-state icon, consistent with `components.json` `iconLibrary=lucide`.
- **Thenable mock harness** for `dashboard-queries.test.ts`: the five widget queries terminate on different builder methods (`orderBy` for visitors/sources/vitals, `limit` for top-pages/recent-leads, and `getRecentLeads` skips `where`/`groupBy`). Making the chain object itself awaitable (a `then` that settles to `rowsToReturn` or rejects) covers every shape with one harness, matching the real Drizzle builder which is thenable at each step.

## Deviations from Plan

None - plan executed exactly as written. (One cosmetic biome format autofix on the scaffold's `then` parameter wrapping was applied before the Task 3 commit; not a behavioral deviation.)

## Issues Encountered
- Biome flagged a single line-length format issue on the `then` signature in `dashboard-queries.test.ts`; resolved with `bun run lint:fix` before committing Task 3. No logic change.

## Threat Model Status
- **T-13-01 (Information disclosure, AdminErrorState):** MITIGATED. The component never accepts or renders an `Error`/exception; fixed generic copy only. Raw exception remains in `logger.error` server-side (to be wired by Wave 2 query changes).
- **T-13-SC (Tampering, package installs):** N/A. Zero packages installed this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Wave 2 (plans 13-02..13-09) can now import `AdminQueryResult`/`AdminDetailResult` + constructors from `@/lib/admin/query-result` and render `AdminErrorState` from `@/components/admin/AdminErrorState` without file conflicts.
- Plan 13-08 owns and extends `tests/unit/admin/dashboard-queries.test.ts` (harness + 5 widget-query found-empty/error cases per the in-file comment block).
- No blockers. The shared primitives compile, narrow both 2-way and 3-way, and the error UI is accessible (`role="alert"`) and info-leak-safe.

## Self-Check: PASSED

All four created source/test files exist on disk; all three task commits (`e8634f2`, `3df3e4c`, `42c1483`) are present in the git history.

---
*Phase: 13-admin-error-observability*
*Completed: 2026-06-02*
