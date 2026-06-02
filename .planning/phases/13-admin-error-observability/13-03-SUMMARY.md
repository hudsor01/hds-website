---
phase: 13-admin-error-observability
plan: 03
subsystem: admin
tags: [typescript, discriminated-union, next-server-component, bun-test, admin, calculator-leads, error-state]

# Dependency graph
requires:
  - phase: 13-01 (shared primitives)
    provides: "AdminQueryResult<T> / AdminDetailResult<T> + ok/err/found/notFoundResult/errResult; AdminErrorState component"
provides:
  - "listCalculatorLeadsForAdmin -> AdminQueryResult<ListCalculatorLeadsResult> (err() on DB failure, ok-empty on zero rows)"
  - "getCalculatorLeadById -> 3-way AdminDetailResult<CalculatorLeadRow> (found/not-found/error)"
  - "calculator-leads list page renders AdminErrorState on !result.ok; empty state reserved for genuine zero rows"
  - "calculator-lead detail page 404s only on not-found, renders AdminErrorState on error (no misleading 404)"
affects: [13-04, 13-05, 13-06, 13-07, 13-08, 13-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "list query catch returns err() (not EMPTY_RESULT); zero-rows returns ok({rows:[]...}) - error vs empty are now distinguishable"
    - "get*ById returns the 3-way detail union; consumer switches on result.status (not-found -> notFound(), error -> AdminErrorState)"

key-files:
  created: []
  modified:
    - src/lib/admin/calculator-leads-queries.ts
    - src/app/(admin)/admin/leads/calculator/page.tsx
    - src/app/(admin)/admin/leads/calculator/[id]/page.tsx
    - tests/unit/admin/calculator-leads-queries.test.ts

key-decisions:
  - "EMPTY_RESULT const deleted (its only purpose was the swallowed-error default, now replaced by err()); grep gate returns 0"
  - "getCalculatorLeadById reads via a single .limit(1) select (no Promise.all), so the existing chainable mock works after a one-line refactor to a shared settle() helper - thenable not strictly required, but added the settle() form to match the 13-02 harness"
  - "BUILD_PLACEHOLDER_ID short-circuit + await connection() left byte-unchanged (Pitfall 2: no PPR $~ regression) - verified the diff has no +/- on those lines"
  - "logger.error retained on both catch paths (caught error stays server-side, never crosses into AdminErrorState copy)"

patterns-established:
  - "Second Wave-2 resource migrated with the identical shape established by 13-02 (leads): wrap reads in the unions + teach consumers to narrow, in lockstep so typecheck catches any straggler"

requirements-completed: [ADMINERR-01, ADMINERR-04]

# Metrics
duration: 3min
completed: 2026-06-02
---

# Phase 13 Plan 03: Calculator-leads error-vs-empty + 3-way detail Summary

**Migrated the calculator-leads read layer to the Wave-1 discriminated unions and taught both consumers to render the shared error state: `listCalculatorLeadsForAdmin` returns `AdminQueryResult<ListCalculatorLeadsResult>` (the list page shows `AdminErrorState` on failure, empty state only on genuine zero rows) and `getCalculatorLeadById` returns a 3-way `AdminDetailResult<CalculatorLeadRow>` (the detail page 404s only on not-found, renders `AdminErrorState` on DB error).**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-02T18:20:41Z
- **Completed:** 2026-06-02T18:23:02Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `src/lib/admin/calculator-leads-queries.ts`: `listCalculatorLeadsForAdmin` now returns `AdminQueryResult<ListCalculatorLeadsResult>` - success payload wrapped in `ok(...)`, the `catch` returns `err()` (was `EMPTY_RESULT`) while keeping the `logger.error` line. The now-unused `EMPTY_RESULT` const is deleted (grep gate returns 0). `getCalculatorLeadById` returns the 3-way `AdminDetailResult<CalculatorLeadRow>`: `found(row)` on a present row, `notFoundResult()` when no row, `errResult()` on throw (logs once).
- `src/app/(admin)/admin/leads/calculator/page.tsx`: narrows the union - `if (!result.ok) return <AdminErrorState resource="calculator submissions" />`, then destructures `result.data`. The existing `rows.length === 0 ? <empty> : <Table>` branch is unchanged and now only runs on genuine success.
- `src/app/(admin)/admin/leads/calculator/[id]/page.tsx`: switches on `result.status` - `'not-found'` -> `notFound()`, `'error'` -> `<AdminErrorState resource="calculator submission" />`, then reads `result.data`. The `if (id === BUILD_PLACEHOLDER_ID) notFound()` short-circuit and `await connection()` are byte-unchanged (verified in the diff: no +/- on those lines) so the PPR placeholder path is intact (Pitfall 2).
- `tests/unit/admin/calculator-leads-queries.test.ts`: rewrote the DB-error case to assert `{ ok: false, error: true }` (not the empty shape) with `logger.error` called once; the zero-rows case now asserts `ok` with empty `data.rows` (distinct from error); all surviving list cases narrow `result.data`; added three `getCalculatorLeadById` cases (found / not-found / error). The chainable mock was refactored to a shared `settle()` helper (matching 13-02) so the list query's `.limit()` path and the detail query's `.limit(1)` path both resolve / reject from one source.
- 16 passing unit tests; `bun run typecheck` green across the whole project (0 errors); lint clean on the two touched source files.

## Task Commits

Each task was committed atomically (hooks ran on every commit; no `--no-verify`):

1. **Task 1: Migrate calculator-leads-queries reads + update tests** - `fc3b4c0` (feat) - TDD task; test rewritten RED (11 failing), source migrated GREEN (16/16 passing), committed together.
2. **Task 2: Update both calculator-leads consumers to render AdminErrorState** - `f507c1c` (feat)

**Plan metadata:** (final commit) `docs(13-03): complete calculator-leads error-state plan`

## Files Created/Modified
- `src/lib/admin/calculator-leads-queries.ts` - `listCalculatorLeadsForAdmin` -> `AdminQueryResult<ListCalculatorLeadsResult>` (`ok`/`err`); `getCalculatorLeadById` -> `AdminDetailResult<CalculatorLeadRow>` (`found`/`notFoundResult`/`errResult`); `EMPTY_RESULT` deleted; `logger.error` retained on both catches; constructors + types imported from `@/lib/admin/query-result`.
- `src/app/(admin)/admin/leads/calculator/page.tsx` - narrows `result.ok`, renders `<AdminErrorState resource="calculator submissions" />` on failure; empty/table branch unchanged.
- `src/app/(admin)/admin/leads/calculator/[id]/page.tsx` - switches on `result.status`; 404 only on `'not-found'`, `<AdminErrorState resource="calculator submission" />` on `'error'`; placeholder short-circuit + `connection()` untouched.
- `tests/unit/admin/calculator-leads-queries.test.ts` - error variant (not empty), ok-empty, 3-way detail; shared `settle()` chainable-db-mock.

## Decisions Made
- **`EMPTY_RESULT` deleted**, not retained: its sole purpose was the swallowed-error default that this phase replaces with `err()`. Keeping it would leave a dead const and re-tempt the silent-empty anti-pattern.
- **No `Promise.all` in `getCalculatorLeadById`** (unlike `getLeadById`): the calculator-lead detail reads a single row via `.limit(1)`, so the mock's `.limit()` terminal already drives the found / not-found / error cases. The chain was still refactored to a shared `settle()` helper to keep the harness shape consistent with the 13-02 leads test.
- **Placeholder short-circuit left byte-unchanged** (Pitfall 2): the new `'error'` branch only runs for real ids on real requests after `connection()`, the same fully-dynamic class as the existing render - no build-time prerender step is added, so no `$~` PPR regression.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None. RED was confirmed (11 failing) before the source change; GREEN was confirmed (16/16) after. The whole-project typecheck briefly showed the expected consumer errors after Task 1 (all confined to the two calculator pages, which the plan fixes in Task 2); all cleared after Task 2.

## Threat Model Status
- **T-13-03 (Information disclosure, calculator-leads pages):** MITIGATED. Both pages render `AdminErrorState` (fixed generic copy, never the exception); the caught DB error stays in `logger.error` server-side.
- **T-13-04b (Repudiation / availability, calculator/[id]):** MITIGATED. A DB error renders the error state; only a genuinely missing row 404s. The misleading-404-on-error path is gone.

## Known Stubs
None. Both reads are fully wired to the unions and both consumers narrow them; no placeholder data, no TODO/FIXME, no empty-data short-circuits introduced.

## User Setup Required
None - no external service configuration.

## Next Phase Readiness
- Calculator-leads is the second Wave 2 consumer fully migrated (after leads in 13-02). Plans 13-04..13-09 follow the same per-resource shape (wrap the read, narrow in the consumer, assert the error variant + 3-way).
- No blockers.

## Self-Check: PASSED

- `src/lib/admin/calculator-leads-queries.ts` exists (modified); `src/app/(admin)/admin/leads/calculator/page.tsx` exists (modified); `src/app/(admin)/admin/leads/calculator/[id]/page.tsx` exists (modified); `tests/unit/admin/calculator-leads-queries.test.ts` exists (modified).
- Commits `fc3b4c0` and `f507c1c` are present in git history.
- `bun test tests/unit/admin/calculator-leads-queries.test.ts` = 16 pass / 0 fail; `bun run typecheck` = 0 errors; grep gate `EMPTY_RESULT` = 0.

---
*Phase: 13-admin-error-observability*
*Completed: 2026-06-02*
