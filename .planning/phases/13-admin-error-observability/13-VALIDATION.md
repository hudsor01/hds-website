---
phase: 13
slug: admin-error-observability
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-02
---

# Phase 13 — Validation Strategy

> Per-phase validation contract. Derived from 13-RESEARCH.md "Validation Architecture". Wide multi-file phase (8 query files, 15 pages, 5 widgets, 6 internal callers).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bun:test; chainable-db-mock pattern (see tests/unit/showcase.test.ts + existing admin query tests) |
| **Quick run command** | `bun test tests/unit/admin/` (per-area while iterating) |
| **Full suite command** | `bun run test:unit` |
| **Gates** | `bun run lint && bun run typecheck && bun run test:unit && bun run build` |

---

## Sampling Rate

- **After each query-file + its consumer migration:** run that area's test file (`bun test tests/unit/admin/<area>-queries.test.ts`) + `bun run typecheck` (catches an unmigrated consumer or internal caller immediately).
- **After each wave:** `bun run test:unit`.
- **Before verify:** full gate chain incl. `bun run build` (many server components change — PPR/cacheComponents must stay green; do not reintroduce the `$~` loading bug).
- **Max feedback latency:** ~20s for a per-area run.

---

## Per-Requirement Verification Map

| Requirement | Correct Behavior | Test Type | Automated Command | Status |
|-------------|------------------|-----------|-------------------|--------|
| ADMINERR-01 (lists) | `list*ForAdmin` catch path returns `{ok:false,error:true}` (not EMPTY_RESULT); list pages render `AdminErrorState` on error, empty-state only on ok+zero | unit (mock db throw) + consumer render | `bun test tests/unit/admin/` | ⬜ pending |
| ADMINERR-02 (widgets) | dashboard widget queries (incl. getWebVitalsP75 per A1) return the result type; each widget renders its own error card on failure; other widgets/page still render (resilience) | unit + new dashboard-queries.test.ts | `bun test tests/unit/admin/dashboard-queries.test.ts` | ⬜ pending |
| ADMINERR-03 (queue) | `getQueueCounts` returns the error variant on failure (NOT the all-zero record); `/admin/emails` shows an error state, not a healthy zero | unit (mock throw) | `bun test tests/unit/admin/emails-queries.test.ts` | ⬜ pending |
| ADMINERR-04 (detail) | `get*ById` returns 3-way found/not-found/error; detail pages call `notFound()` only on not-found and render `AdminErrorState` on error (a DB error is never a 404); 6 internal write-helper callers migrated in lockstep | unit (3-way) + typecheck | `bun test tests/unit/admin/` + `bun run typecheck` | ⬜ pending |

---

## Wave 0 Requirements

- Shared primitives FIRST: `src/lib/admin/query-result.ts` (the unions + constructors) and `src/components/admin/AdminErrorState.tsx` (on shadcn `alert.tsx`) — everything else depends on them.
- Test to CREATE (does not exist today): `tests/unit/admin/dashboard-queries.test.ts` for the 5 widget queries.
- Tests to UPDATE: the 6 list-query "DB error safety" cases (assert error variant vs ok-empty); 7 `get*ById` suites (add 3-way found/not-found/error); `emails-queries.test.ts` for `getQueueCounts`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Forced DB failure: a list shows "couldn't load" (not empty), a widget card errors while others render, queue cards show unknown (not healthy zero), a detail page shows an error state (not 404) | ADMINERR-01..04 | Full server-component render under a real/simulated DB outage is a runtime/visual check | In dev, simulate a query throw; load each admin surface; confirm the error state vs empty-state distinction and that one failing widget doesn't blank the dashboard |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: per-area test + typecheck after each migration
- [x] Wave 0 covers MISSING references (query-result.ts, AdminErrorState.tsx, dashboard-queries.test.ts)
- [x] No watch-mode flags
- [x] Feedback latency < 20s per area
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-02 (derived from research; wide multi-file phase, per-area sampling)
