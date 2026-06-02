---
phase: 13-admin-error-observability
plan: 08
subsystem: ui
tags: [admin, dashboard, discriminated-union, recharts, drizzle, bun-test, error-state]

# Dependency graph
requires:
  - phase: 13-admin-error-observability (plan 01)
    provides: AdminQueryResult<T> + ok/err helpers; AdminErrorState (inline variant); dashboard-queries.test.ts scaffold
provides:
  - all 5 dashboard widget queries return AdminQueryResult (incl. getWebVitalsP75 per A1)
  - each dashboard widget renders its own inline AdminErrorState card on the error variant
  - dashboard page passes a discriminated result to each widget; Promise.all resilience preserved (errors returned, never thrown)
  - populated dashboard-queries.test.ts (5 widget queries x error + ok-empty)
affects: [admin-page-title, dead-code-cleanup]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-widget error isolation: each dashboard widget owns its own AdminErrorState card; one failing widget cannot blank the page"
    - "Client widgets receive the plain serializable AdminQueryResult as a prop and render the (client-compatible) AdminErrorState"

key-files:
  created: []
  modified:
    - src/lib/admin/dashboard-queries.ts
    - src/components/admin/widgets/VisitorsChart.tsx
    - src/components/admin/widgets/TopPagesTable.tsx
    - src/components/admin/widgets/TrafficSourcesPie.tsx
    - src/components/admin/widgets/WebVitalsCards.tsx
    - src/components/admin/widgets/RecentLeadsPanel.tsx
    - "src/app/(admin)/admin/dashboard/page.tsx"
    - tests/unit/admin/dashboard-queries.test.ts

key-decisions:
  - "Included getWebVitalsP75 in the migration (RESEARCH A1) so the widget can tell 'no samples' from 'DB down' (it rendered per-card -- before, now an error card)"
  - "TrafficSourcesPie derives rows (result.ok ? result.data : []) BEFORE the render branch so useMemo stays unconditional (Rules of Hooks); the error card still renders on !result.ok"
  - "WebVitalsCards gained a whole-widget error branch via an early return (it had no whole-widget empty state, only per-card placeholders)"

patterns-established:
  - "Widget body branch order: !result.ok -> AdminErrorState inline; ok + zero rows -> existing empty state; ok + rows -> data render"
  - "Card chrome (rounded-xl border + h2 heading) stays outside the branch so the title shows in every state"

requirements-completed: [ADMINERR-02]

# Metrics
duration: 5min
completed: 2026-06-02
---

# Phase 13 Plan 08: Dashboard widget error states Summary

**All 5 dashboard widget queries return AdminQueryResult and each widget renders its own inline AdminErrorState card on failure, so one failing widget shows an error in its card while the other widgets and the page still render (Promise.all resilience preserved).**

## Performance

- **Duration:** 5 min
- **Started:** 2026-06-02T19:03:20Z
- **Completed:** 2026-06-02T19:08:23Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Migrated `getVisitorsByDay`, `getTopPages`, `getTrafficSources`, `getWebVitalsP75`, `getRecentLeads` to `Promise<AdminQueryResult<RowType[]>>`: success returns `ok(rows)`, catch returns `err()` (was `[]`), `logger.error` retained on every catch. A zero-row read stays `ok(rows)` so error is distinguishable from empty.
- Taught all 5 widgets to accept `result: AdminQueryResult<...>` and render `<AdminErrorState inline resource="..." />` on `!result.ok`, the existing empty branch on ok-empty, and data on ok-rows. Card chrome (heading + container) renders in every state.
- Dashboard page passes `result={...}` to all 5 widgets; `Promise.all` shape unchanged. Because the failure is a returned variant (never thrown), `Promise.all` never rejects -> one failing widget cannot blank the page (T-13-13 / v4 resilience preserved).
- Populated `dashboard-queries.test.ts`: 5 widget queries x (error variant + ok-empty) = 10 cases, asserting `{ ok: false, error: true }` + one `logger.error` on throw and `ok` with empty `data` on zero rows. Removed the Wave-1 placeholder smoke test.

## Task Commits

Each task was committed atomically (pre-commit hooks: biome check + typecheck, no `--no-verify`):

1. **Task 1: Migrate 5 widget queries + populate dashboard-queries.test.ts** - `da1e75be` (feat)
2. **Task 2: Update 5 widgets + dashboard page** - `82dd429c` (feat)

_Task 1 is the TDD step (query contract + its tests go green on their own); Task 2 is the consumer migration. The query layer typechecks clean after Task 1; the only typecheck errors after Task 1 were in `dashboard/page.tsx` (the Task-2 consumer), as expected by the plan's RED/GREEN boundary. To honor "each task committed with hooks passing" (whole-project typecheck), all edits were on disk before either commit; commits staged Task-1 files then Task-2 files individually._

## Files Created/Modified
- `src/lib/admin/dashboard-queries.ts` - 5 queries return `AdminQueryResult<RowType[]>`; `ok(rows)` on success, `err()` on catch, `logger.error` kept.
- `src/components/admin/widgets/VisitorsChart.tsx` - `result` prop; `<LineChart data={result.data}>`; inline error on `!result.ok`.
- `src/components/admin/widgets/TopPagesTable.tsx` - `result` prop; table maps `result.data`; inline error on `!result.ok`.
- `src/components/admin/widgets/TrafficSourcesPie.tsx` - `result` prop; rows derived pre-render so `useMemo` stays unconditional; inline error on `!result.ok`.
- `src/components/admin/widgets/WebVitalsCards.tsx` - `result` prop; new whole-widget error early-return; grid reads `result.data`.
- `src/components/admin/widgets/RecentLeadsPanel.tsx` - `result` prop; list maps `result.data`; inline error on `!result.ok`.
- `src/app/(admin)/admin/dashboard/page.tsx` - passes `result={...}` to all 5 widgets; stale "return [] on failure" docblock rewritten to describe the returned-error-variant behavior; `Promise.all` shape unchanged.
- `tests/unit/admin/dashboard-queries.test.ts` - 10 cases (5 x error + ok-empty); placeholder smoke removed; `logger` imported for the call-count assertions.

## Decisions Made
- **Included `getWebVitalsP75` (RESEARCH A1):** the only widget that previously couldn't tell "no samples" (per-card `--`) from "DB down". Now it renders an error card on `!result.ok`. Same mechanical change as the other four.
- **`TrafficSourcesPie` hook safety:** derived `const data = result.ok ? result.data : []` before the `useMemo` so the hook runs unconditionally (Rules of Hooks); the error card still wins the render branch on `!result.ok`.
- **`WebVitalsCards` early-return:** it had no whole-widget empty state (only per-card placeholders), so an early `return` for the error variant was cleaner than threading the branch through the 6-card grid.

## Deviations from Plan

None - plan executed exactly as written.

(One formatting nit during Task 2 verification: biome wanted the new `query-result` import in `dashboard-queries.ts` collapsed to a single line. Applied `biome check --write` to the touched files; this is normal lint autoformat within the planned file set, not a behavioral deviation.)

## Issues Encountered
None.

## Verification
- `bun test tests/unit/admin/dashboard-queries.test.ts` -> 10 pass / 0 fail (20 assertions).
- `bun run typecheck` -> clean across the whole project (0 errors).
- `bun run lint` -> clean (411 files) on all 5 widgets + the page + the queries + the test file.
- Grep gates: `return err()` count = 5 (one per catch); `return []` in queries = 0; `result.ok`/`!result.ok` branch present in all 5 widget files; `result={` count = 5 on the page; no `throw` in any widget or query; `Promise.all([...])` call intact.

## Threat Model
- **T-13-12 (info disclosure) mitigated:** widgets render `AdminErrorState` (fixed copy); the caught exception stays in `logger.error` server-side; the `result` prop carries no error message (the `err()` variant is `{ ok: false, error: true }` only).
- **T-13-13 (availability) mitigated:** errors are RETURNED not thrown, so `Promise.all` never rejects and one failing widget cannot blank the page (v4 per-widget resilience preserved).

## Next Phase Readiness
- ADMINERR-02 satisfied. Wave 2 dashboard slice complete.
- Remaining Phase 13 Wave-2 work (per ROADMAP): `getQueueCounts` / `/admin/emails` queue-health (ADMINERR-03, plan 13-09).

## Self-Check: PASSED

All 8 modified files + the SUMMARY exist on disk; both task commits (`da1e75be`, `82dd429c`) are present in git history.

---
*Phase: 13-admin-error-observability*
*Completed: 2026-06-02*
