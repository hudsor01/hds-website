---
phase: 13-admin-error-observability
plan: 05
subsystem: admin
tags: [typescript, discriminated-union, next-server-component, bun-test, admin, showcase, error-state]

# Dependency graph
requires:
  - phase: 13-01 (shared primitives)
    provides: "AdminQueryResult<T> / AdminDetailResult<T> + ok/err/found/notFoundResult/errResult; AdminErrorState component"
provides:
  - "listShowcasesForAdmin -> AdminQueryResult<ListShowcasesResult> (err() on DB failure, ok-empty on zero rows)"
  - "getShowcaseById -> 3-way AdminDetailResult<ShowcaseRow> (found/not-found/error)"
  - "updateShowcase + toggleShowcasePublished narrow result.status === 'found' locally; null-on-absent contract unchanged"
  - "showcase list page renders AdminErrorState on !result.ok; empty state reserved for genuine zero rows"
  - "showcase edit page 404s only on not-found, renders AdminErrorState on error (no misleading 404)"
affects: [13-06, 13-07, 13-08, 13-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "get*ById change + its internal write-helper callers migrated in the SAME task (lockstep) so typecheck catches any straggler"
    - "internal write-helper caller narrows the 3-way detail union locally via result.status === 'found' ? result.data : null, preserving its existing null-on-absent return contract"
    - "thenable chainable db.select() mock + a stubbed db.update() chain so write-helper full paths (lookup + update) run against one harness"

key-files:
  created: []
  modified:
    - src/lib/admin/showcase-queries.ts
    - src/app/(admin)/admin/showcase/page.tsx
    - src/app/(admin)/admin/showcase/[id]/edit/page.tsx
    - tests/unit/admin/showcase-queries.test.ts

key-decisions:
  - "EMPTY_RESULT const deleted (its only purpose was the swallowed-error default, now replaced by err())"
  - "Both internal write-helper callers (updateShowcase, toggleShowcasePublished) migrated in lockstep with getShowcaseById; narrowed to row-or-null so their public contract is byte-equal"
  - "BUILD_PLACEHOLDER_ID short-circuit + await connection() left byte-unchanged (Pitfall 2: no PPR $~ regression)"
  - "logger.error retained on both read catch paths (caught error stays server-side, never crosses into AdminErrorState copy)"
  - "test mock gained a stubbed db.update() chain so updateShowcase/toggleShowcasePublished can run their full path and pin the null-on-absent contract"

patterns-established:
  - "get*ById + write-helper-caller lockstep migration: change the union and narrow every internal caller in one task; the whole-project typecheck is the straggler detector"

requirements-completed: [ADMINERR-01, ADMINERR-04]

# Metrics
duration: 3min
completed: 2026-06-02
---

# Phase 13 Plan 05: Showcase error-vs-empty + 3-way detail + internal-caller lockstep Summary

**Migrated the showcase read layer to the Wave-1 discriminated unions and the two internal write-helper callers in lockstep: `listShowcasesForAdmin` returns `AdminQueryResult<ListShowcasesResult>` (the list page shows `AdminErrorState` on failure, empty state only on genuine zero rows), `getShowcaseById` returns a 3-way `AdminDetailResult<ShowcaseRow>` (the edit page 404s only on not-found, renders `AdminErrorState` on DB error), and `updateShowcase` + `toggleShowcasePublished` narrow the detail union locally so their existing null-on-absent contract stays byte-equal and typecheck stays green.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-02T18:31:38Z
- **Completed:** 2026-06-02T18:34:43Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `src/lib/admin/showcase-queries.ts`: `listShowcasesForAdmin` now returns `AdminQueryResult<ListShowcasesResult>` - success payload wrapped in `ok(...)`, the `catch` returns `err()` (was `EMPTY_RESULT`) while keeping the `logger.error` line. The now-unused `EMPTY_RESULT` const is deleted (grep gate returns 0). `getShowcaseById` returns the 3-way `AdminDetailResult<ShowcaseRow>`: `found(row)` on a present row, `notFoundResult()` when no row, `errResult()` on throw (logs once).
- **Internal-caller lockstep (the load-bearing finding):** `updateShowcase` and `toggleShowcasePublished` both call `getShowcaseById` internally and relied on the old `null` contract. Each now reads `const result = await getShowcaseById(id); const existing = result.status === 'found' ? result.data : null; if (!existing) return null`, so both DB-error and not-found collapse to `null` exactly as before. Their public return type (`ShowcaseRow | null`) and behavior are byte-equal; the whole-project typecheck confirmed there are no other external callers left on the old contract.
- `src/app/(admin)/admin/showcase/page.tsx`: narrows the union - `if (!result.ok) return <AdminErrorState resource="showcase entries" />`, then destructures `result.data`. The existing search/empty/table branches inside `ResourceListPage` are unchanged and now only run on genuine success.
- `src/app/(admin)/admin/showcase/[id]/edit/page.tsx`: 3-way switch on `result.status` - `'not-found'` -> `notFound()`, `'error'` -> `<AdminErrorState resource="showcase entry" />`, else `result.data` is the row. The `if (id === BUILD_PLACEHOLDER_ID) notFound()` short-circuit and `await connection()` are byte-unchanged (verified as context lines in the diff) so the PPR placeholder path is intact (Pitfall 2). `ResourceListPage.tsx` was not touched (diff stat empty).
- `tests/unit/admin/showcase-queries.test.ts`: rewrote the list DB-error case to assert `{ ok: false, error: true }` (not the empty shape) with `logger.error` called once; the zero-rows case now asserts `ok` with empty `data` (distinct from error); all surviving list cases narrow `result.data`; added three `getShowcaseById` cases (found / not-found / error); added six write-helper cases pinning the null-on-absent contract for `updateShowcase` and `toggleShowcasePublished` (row present -> row, row absent -> null, lookup throws -> null). The chainable `db.select()` mock was made thenable and a stubbed `db.update()` chain was added so the write helpers run their full lookup+update path from one harness.
- 20 passing unit tests; `bun run typecheck` green across the whole project (0 errors); lint clean on all touched files.

## Task Commits

Each task was committed atomically (hooks ran on every commit; no `--no-verify`):

1. **Task 1: Migrate showcase reads + the 2 internal callers + update tests** - `a632c1f4` (feat) - TDD task; test rewritten RED (11 failing), source migrated GREEN (20/20 passing), committed together.
2. **Task 2: Update both showcase consumers** - `7ef779da` (feat)

**Plan metadata:** (final commit) `docs(13-05): complete showcase error-state plan`

## Files Created/Modified
- `src/lib/admin/showcase-queries.ts` - `listShowcasesForAdmin` -> `AdminQueryResult<ListShowcasesResult>` (`ok`/`err`); `getShowcaseById` -> `AdminDetailResult<ShowcaseRow>` (`found`/`notFoundResult`/`errResult`); `EMPTY_RESULT` deleted; `updateShowcase` + `toggleShowcasePublished` narrow `result.status === 'found' ? result.data : null` (contracts unchanged); `logger.error` retained on both read catches; constructors + types imported from `@/lib/admin/query-result`.
- `src/app/(admin)/admin/showcase/page.tsx` - narrows `result.ok`, renders `<AdminErrorState resource="showcase entries" />` on failure; search/empty/table branches unchanged.
- `src/app/(admin)/admin/showcase/[id]/edit/page.tsx` - switches on `result.status`; 404 only on `'not-found'`, `<AdminErrorState resource="showcase entry" />` on `'error'`; placeholder short-circuit + `connection()` untouched.
- `tests/unit/admin/showcase-queries.test.ts` - error variant (not empty), ok-empty, 3-way detail, six write-helper null-contract cases; thenable `db.select()` mock + stubbed `db.update()` chain.

## Decisions Made
- **`EMPTY_RESULT` deleted**, not retained: its sole purpose was the swallowed-error default that this phase replaces with `err()`. Keeping it would leave a dead const and re-tempt the silent-empty anti-pattern.
- **Internal callers migrated in lockstep, contracts byte-equal**: both write helpers narrow the 3-way result locally (`result.status === 'found' ? result.data : null`) so a DB error and a missing row both collapse to `null` exactly as the old `getShowcaseById` returned. This keeps their public `ShowcaseRow | null` contract unchanged (threat T-13-07 disposition: accept; out of scope per CONTEXT) while letting the read seam distinguish error from not-found for the edit page.
- **Write-helper tests added with a stubbed `db.update()` chain**: the existing list-only test had no `getShowcaseById`/write-helper coverage and no `db.update()` stub. Adding both lets the write helpers run their real lookup+update path against the mock and pins the null-on-absent contract that the lockstep migration must preserve.
- **Placeholder short-circuit left byte-unchanged** (Pitfall 2): the new `'error'` branch only runs for real ids on real requests after `connection()`, the same fully-dynamic class as the existing render - no build-time prerender step is added, so no `$~` PPR regression.

## Deviations from Plan
None - plan executed exactly as written. (One in-scope test-harness addition was required: a stubbed `db.update()` chain, because the write-helper cases the plan's Task 1 action mandates exercise `db.update(...).set(...).where(...).returning()`, which the previous list-only mock did not stub.)

## Issues Encountered
None. RED was confirmed (11 failing) before the source change; GREEN was confirmed (20/20) after. The whole-project typecheck briefly showed the expected showcase-consumer errors after Task 1 (the plan acknowledges consumers are fixed in Task 2) and exactly two files' errors, confirming the two internal callers were already migrated and no other external caller of `getShowcaseById` remained; all cleared after Task 2.

## Threat Model Status
- **T-13-06 (Information disclosure, showcase pages):** MITIGATED. Both pages render `AdminErrorState` (fixed generic copy, never the exception); the caught DB error stays in `logger.error` server-side.
- **T-13-04d (Repudiation / availability, showcase/[id]/edit):** MITIGATED. A DB error renders the error state; only a genuinely missing row 404s. The misleading-404-on-error path is gone.
- **T-13-07 (Tampering, updateShowcase / toggleShowcasePublished):** ACCEPTED (unchanged). The internal narrow preserves the existing "no row -> null" behavior; write-helper contracts are byte-equal. Out of scope per CONTEXT.

## Known Stubs
None. Both reads are fully wired to the unions, both consumers narrow them, and both internal write-helper callers narrow them; no placeholder data, no TODO/FIXME, no empty-data short-circuits introduced.

## User Setup Required
None - no external service configuration.

## Next Phase Readiness
- The showcase resource is fully migrated, including the first occurrence of the `get*ById` + write-helper internal-caller lockstep. The remaining plans 13-06..13-09 follow the same shape; the blog (`updateBlogPost`, `toggleBlogPostPublished`), testimonials (`toggleTestimonialPublished`), and emails (`retryScheduledEmail`) write helpers have the identical internal-caller hazard and the local-narrow pattern established here applies directly.
- No blockers.

## Self-Check: PASSED

- `src/lib/admin/showcase-queries.ts` exists (modified); `src/app/(admin)/admin/showcase/page.tsx` exists (modified); `src/app/(admin)/admin/showcase/[id]/edit/page.tsx` exists (modified); `tests/unit/admin/showcase-queries.test.ts` exists (modified).
- Commits `a632c1f4` and `7ef779da` are present in git history.
- `bun test tests/unit/admin/showcase-queries.test.ts` = 20 pass / 0 fail; `bun run typecheck` = 0 errors; grep gate `EMPTY_RESULT` = 0; `git diff --stat src/components/admin/ResourceListPage.tsx` empty.

---
*Phase: 13-admin-error-observability*
*Completed: 2026-06-02*
