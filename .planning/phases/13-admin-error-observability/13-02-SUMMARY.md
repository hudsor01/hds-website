---
phase: 13-admin-error-observability
plan: 02
subsystem: admin
tags: [typescript, discriminated-union, next-server-component, bun-test, admin, leads, error-state]

# Dependency graph
requires:
  - phase: 13-01 (shared primitives)
    provides: "AdminQueryResult<T> / AdminDetailResult<T> + ok/err/found/notFoundResult/errResult; AdminErrorState component"
provides:
  - "listLeadsForAdmin -> AdminQueryResult<ListLeadsResult> (err() on DB failure, ok-empty on zero rows)"
  - "getLeadById -> 3-way AdminDetailResult<LeadDetail> (found/not-found/error)"
  - "leads list page renders AdminErrorState on !result.ok; empty state reserved for genuine zero rows"
  - "lead detail page 404s only on not-found, renders AdminErrorState on error (no misleading 404)"
  - "thenable chainable-db-mock harness in leads-queries.test.ts (covers .limit() and .orderBy()-terminated selects)"
affects: [13-03, 13-04, 13-05, 13-06, 13-07, 13-08, 13-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "list query catch returns err() (not EMPTY_RESULT); zero-rows returns ok({rows:[]...}) - error vs empty are now distinguishable"
    - "get*ById returns the 3-way detail union; consumer switches on result.status (not-found -> notFound(), error -> AdminErrorState)"
    - "thenable chainable-db-mock (a then() on the chain) so Promise.all over selects terminating on different builder methods all settle from one harness"

key-files:
  created: []
  modified:
    - src/lib/admin/leads-queries.ts
    - src/app/(admin)/admin/leads/page.tsx
    - src/app/(admin)/admin/leads/[id]/page.tsx
    - tests/unit/admin/leads-queries.test.ts

key-decisions:
  - "EMPTY_RESULT const deleted (its only purpose was the swallowed-error default, now replaced by err())"
  - "leads-queries.test.ts chainable mock made thenable (added then()) so getLeadById's 3 Promise.all selects all settle; list query's .limit() path unchanged"
  - "BUILD_PLACEHOLDER_ID short-circuit + await connection() left byte-unchanged (Pitfall 2: no PPR $~ regression)"
  - "logger.error retained on both catch paths (caught error stays server-side, never crosses into AdminErrorState copy)"

patterns-established:
  - "Per-resource Wave 2 migration shape: wrap reads in the unions + teach consumers to narrow, in lockstep so typecheck catches any straggler"

requirements-completed: [ADMINERR-01, ADMINERR-04]

# Metrics
duration: 3min
completed: 2026-06-02
---

# Phase 13 Plan 02: Leads error-vs-empty + 3-way detail Summary

**Migrated the leads read layer to the Wave-1 discriminated unions and taught both consumers to render the shared error state: `listLeadsForAdmin` returns `AdminQueryResult<ListLeadsResult>` (the list page shows `AdminErrorState` on failure, empty state only on genuine zero rows) and `getLeadById` returns a 3-way `AdminDetailResult<LeadDetail>` (the detail page 404s only on not-found, renders `AdminErrorState` on DB error).**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-02T18:15:04Z
- **Completed:** 2026-06-02T18:18:17Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `src/lib/admin/leads-queries.ts`: `listLeadsForAdmin` now returns `AdminQueryResult<ListLeadsResult>` - success payload wrapped in `ok(...)`, the `catch` returns `err()` (was `EMPTY_RESULT`) while keeping the `logger.error` line. The now-unused `EMPTY_RESULT` const is deleted (grep gate returns 0). `getLeadById` returns the 3-way `AdminDetailResult<LeadDetail>`: `found({...})` on a present row, `notFoundResult()` when no row, `errResult()` on throw (logs once).
- `src/app/(admin)/admin/leads/page.tsx`: narrows the union - `if (!result.ok) return <AdminErrorState resource="leads" />`, then destructures `result.data`. The existing `rows.length === 0 ? <empty> : <Table>` branch is unchanged and now only runs on genuine success.
- `src/app/(admin)/admin/leads/[id]/page.tsx`: switches on `result.status` - `'not-found'` -> `notFound()`, `'error'` -> `<AdminErrorState resource="lead" />`, then reads `result.data`. The `if (id === BUILD_PLACEHOLDER_ID) notFound()` short-circuit and `await connection()` are byte-unchanged (verified in the diff as context lines, not edits) so the PPR placeholder path is intact (Pitfall 2).
- `tests/unit/admin/leads-queries.test.ts`: rewrote the DB-error case to assert `{ ok: false, error: true }` (not the empty shape) with `logger.error` called once; the zero-rows case now asserts `ok` with empty `data.rows` (distinct from error); all surviving list cases narrow `result.data`; added three `getLeadById` cases (found / not-found / error). The chainable mock was made thenable so the `Promise.all` over three selects (one terminating on `.limit(1)`, two on `.orderBy()`) all settle from one harness.
- 16 passing unit tests; `bun run typecheck` green across the whole project (0 errors); lint clean on the two touched source files.

## Task Commits

Each task was committed atomically (hooks ran on every commit; no `--no-verify`):

1. **Task 1: Migrate leads-queries reads + update tests** - `bd7ed55` (feat) - TDD task; test rewritten RED (11 failing), source migrated GREEN (16/16 passing), committed together.
2. **Task 2: Update both leads consumers to render AdminErrorState** - `9fd0d51` (feat)

**Plan metadata:** (final commit) `docs(13-02): complete leads error-state plan`

## Files Created/Modified
- `src/lib/admin/leads-queries.ts` - `listLeadsForAdmin` -> `AdminQueryResult<ListLeadsResult>` (`ok`/`err`); `getLeadById` -> `AdminDetailResult<LeadDetail>` (`found`/`notFoundResult`/`errResult`); `EMPTY_RESULT` deleted; `logger.error` retained on both catches; constructors + types imported from `@/lib/admin/query-result`.
- `src/app/(admin)/admin/leads/page.tsx` - narrows `result.ok`, renders `<AdminErrorState resource="leads" />` on failure; empty/table branch unchanged.
- `src/app/(admin)/admin/leads/[id]/page.tsx` - switches on `result.status`; 404 only on `'not-found'`, `<AdminErrorState resource="lead" />` on `'error'`; placeholder short-circuit + `connection()` untouched.
- `tests/unit/admin/leads-queries.test.ts` - error variant (not empty), ok-empty, 3-way detail; thenable chainable-db-mock.

## Decisions Made
- **`EMPTY_RESULT` deleted**, not retained: its sole purpose was the swallowed-error default that this phase replaces with `err()`. Keeping it would leave a dead const and re-tempt the silent-empty anti-pattern.
- **Thenable chainable mock**: `getLeadById` awaits a `Promise.all` of three selects that terminate on different builder methods (`.limit(1)` for the lead row; `.orderBy()` for attribution and notes). Making the chain object itself awaitable (a `then()` that settles to `state.rowsToReturn` or rejects on `state.shouldThrow`) covers every shape with one harness while leaving the list query's `.limit()` path (which still returns the settled promise directly) working. Mirrors the harness approach established in `dashboard-queries.test.ts` (13-01).
- **Placeholder short-circuit left byte-unchanged** (Pitfall 2): the new `'error'` branch only runs for real ids on real requests after `connection()`, the same fully-dynamic class as the existing render - no build-time prerender step is added, so no `$~` PPR regression.

## Deviations from Plan
None - plan executed exactly as written. (One extra test-harness change was required and is in-scope: the chainable mock had to become thenable to drive `getLeadById`'s `.orderBy()`-terminated selects, which the plan's Task 1 action implicitly requires by adding the 3-way detail cases.)

## Issues Encountered
None. RED was confirmed (11 failing) before the source change; GREEN was confirmed (16/16) after. The whole-project typecheck briefly showed the 9 expected consumer errors after Task 1 (the plan acknowledges consumers are fixed in Task 2); all cleared after Task 2.

## Threat Model Status
- **T-13-02 (Information disclosure, leads pages):** MITIGATED. Both pages render `AdminErrorState` (fixed generic copy, never the exception); the caught DB error stays in `logger.error` server-side.
- **T-13-04 (Repudiation / availability, leads/[id]):** MITIGATED. A DB error renders the error state; only a genuinely missing row 404s. The misleading-404-on-error path is gone.

## Known Stubs
None. Both reads are fully wired to the unions and both consumers narrow them; no placeholder data, no TODO/FIXME, no empty-data short-circuits introduced.

## User Setup Required
None - no external service configuration.

## Next Phase Readiness
- The leads resource is the first Wave 2 consumer fully migrated; plans 13-03..13-09 follow the same per-resource shape (wrap the read, narrow in the consumer, assert the error variant + 3-way). The thenable-mock harness pattern is reusable for any `get*ById` test that uses `Promise.all`.
- No blockers.

## Self-Check: PASSED

- `src/lib/admin/leads-queries.ts` exists (modified); `src/app/(admin)/admin/leads/page.tsx` exists (modified); `src/app/(admin)/admin/leads/[id]/page.tsx` exists (modified); `tests/unit/admin/leads-queries.test.ts` exists (modified).
- Commits `bd7ed55` and `9fd0d51` are present in git history.
- `bun test tests/unit/admin/leads-queries.test.ts` = 16 pass / 0 fail; `bun run typecheck` = 0 errors; grep gate `EMPTY_RESULT` = 0.

---
*Phase: 13-admin-error-observability*
*Completed: 2026-06-02*
