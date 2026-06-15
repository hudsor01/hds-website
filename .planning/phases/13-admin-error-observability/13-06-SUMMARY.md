---
phase: 13-admin-error-observability
plan: 06
subsystem: admin
tags: [typescript, discriminated-union, next-server-component, bun-test, admin, testimonials, error-state]

# Dependency graph
requires:
  - phase: 13-01 (shared primitives)
    provides: "AdminQueryResult<T> / AdminDetailResult<T> + ok/err/found/notFoundResult/errResult; AdminErrorState component"
provides:
  - "listTestimonialsForAdmin -> AdminQueryResult<ListTestimonialsResult> (err() on DB failure, ok-empty on zero rows)"
  - "getTestimonialById -> 3-way AdminDetailResult<TestimonialRow> (found/not-found/error)"
  - "toggleTestimonialPublished narrows result.status === 'found' locally; null-on-absent contract unchanged"
  - "testimonials list page renders AdminErrorState on !result.ok; empty state reserved for genuine zero rows"
  - "testimonials edit page 404s only on not-found, renders AdminErrorState on error (no misleading 404)"
affects: [13-07, 13-08, 13-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "get*ById change + its internal write-helper caller migrated in the SAME task (lockstep) so the whole-project typecheck catches any straggler"
    - "internal write-helper caller narrows the 3-way detail union locally via result.status === 'found' ? result.data : null, preserving its existing null-on-absent return contract"
    - "thenable chainable db.select() mock + a stubbed db.update() chain so the write-helper full path (lookup + update) runs against one harness"

key-files:
  created: []
  modified:
    - src/lib/admin/testimonials-queries.ts
    - src/app/(admin)/admin/testimonials/page.tsx
    - src/app/(admin)/admin/testimonials/[id]/edit/page.tsx
    - tests/unit/admin/testimonials-queries.test.ts

key-decisions:
  - "EMPTY_RESULT const deleted (its only purpose was the swallowed-error default, now replaced by err())"
  - "The single internal write-helper caller (toggleTestimonialPublished) migrated in lockstep with getTestimonialById; narrowed to row-or-null so its public contract is byte-equal"
  - "BUILD_PLACEHOLDER_ID short-circuit + await connection() left byte-unchanged (Pitfall 2: no PPR regression)"
  - "logger.error retained on both read catch paths (caught error stays server-side, never crosses into AdminErrorState copy)"
  - "test mock gained a thenable select chain + a stubbed db.update() chain so toggleTestimonialPublished runs its full lookup+update path and pins the null-on-absent contract"

patterns-established:
  - "get*ById + write-helper-caller lockstep migration: change the union and narrow every internal caller in one task; the whole-project typecheck is the straggler detector"

requirements-completed: [ADMINERR-01, ADMINERR-04]

# Metrics
duration: 3min
completed: 2026-06-02
---

# Phase 13 Plan 06: Testimonials error-vs-empty + 3-way detail + internal-caller lockstep Summary

**Migrated the testimonials read layer to the Wave-1 discriminated unions and the single internal write-helper caller in lockstep: `listTestimonialsForAdmin` returns `AdminQueryResult<ListTestimonialsResult>` (the list page shows `AdminErrorState` on failure, empty state only on genuine zero rows), `getTestimonialById` returns a 3-way `AdminDetailResult<TestimonialRow>` (the edit page 404s only on not-found, renders `AdminErrorState` on DB error), and `toggleTestimonialPublished` narrows the detail union locally so its existing null-on-absent contract stays byte-equal and typecheck stays green.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-02T18:38:20Z
- **Completed:** 2026-06-02T18:41:28Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `src/lib/admin/testimonials-queries.ts`: `listTestimonialsForAdmin` now returns `AdminQueryResult<ListTestimonialsResult>` - success payload wrapped in `ok(...)`, the `catch` returns `err()` (was `EMPTY_RESULT`) while keeping the `logger.error` line. The now-unused `EMPTY_RESULT` const is deleted (grep gate returns 0). `getTestimonialById` returns the 3-way `AdminDetailResult<TestimonialRow>`: `found(row)` on a present row, `notFoundResult()` when no row, `errResult()` on throw (logs once).
- **Internal-caller lockstep (the load-bearing finding):** `toggleTestimonialPublished` calls `getTestimonialById` internally and relied on the old `null` contract. It now reads `const result = await getTestimonialById(id); const existing = result.status === 'found' ? result.data : null; if (!existing) return null`, so both a DB error and a missing row collapse to `null` exactly as before. Its public return type (`TestimonialRow | null`) and behavior are byte-equal; the whole-project typecheck confirmed there are no other callers left on the old contract (only the two consumer pages errored after Task 1, both fixed in Task 2).
- `src/app/(admin)/admin/testimonials/page.tsx`: narrows the union - `if (!result.ok) return <AdminErrorState resource="testimonials" />`, then destructures `result.data`. The existing search/empty/table branches inside `ResourceListPage` are unchanged and now only run on genuine success.
- `src/app/(admin)/admin/testimonials/[id]/edit/page.tsx`: 3-way guards on `result.status` - `'not-found'` -> `notFound()`, `'error'` -> `<AdminErrorState resource="testimonial" />`, else `result.data` is the row. The `if (id === BUILD_PLACEHOLDER_ID) notFound()` short-circuit and `await connection()` are byte-unchanged (verified as context lines in the diff) so the PPR placeholder path is intact (Pitfall 2). `ResourceListPage.tsx` was not touched (diff stat empty).
- `tests/unit/admin/testimonials-queries.test.ts`: rewrote the list DB-error case to assert `{ ok: false, error: true }` (not the empty shape) with `logger.error` called once; the zero-rows case now asserts `ok` with empty `data` (distinct from error); all surviving list cases narrow `result.data`; added three `getTestimonialById` cases (found / not-found / error); added three `toggleTestimonialPublished` cases pinning the null-on-absent contract (row present -> row, row absent -> null, lookup throws -> null). The chainable `db.select()` mock was made thenable and a stubbed `db.update()` chain was added so the write helper runs its full lookup+update path from one harness.
- 17 passing unit tests; `bun run typecheck` green across the whole project (0 errors); lint clean on both touched pages.

## Task Commits

Each task was committed atomically (hooks ran on every commit; no `--no-verify`):

1. **Task 1: Migrate testimonials reads + the internal caller + update tests** - `74053303` (feat) - TDD task; test rewritten RED (11 failing), source migrated GREEN (17/17 passing), committed together.
2. **Task 2: Update both testimonials consumers** - `662e0ec3` (feat)

**Plan metadata:** (final commit) `docs(13-06): complete testimonials error-state plan`

## Files Created/Modified
- `src/lib/admin/testimonials-queries.ts` - `listTestimonialsForAdmin` -> `AdminQueryResult<ListTestimonialsResult>` (`ok`/`err`); `getTestimonialById` -> `AdminDetailResult<TestimonialRow>` (`found`/`notFoundResult`/`errResult`); `EMPTY_RESULT` deleted; `toggleTestimonialPublished` narrows `result.status === 'found' ? result.data : null` (contract unchanged); `logger.error` retained on both read catches; constructors + types imported from `@/lib/admin/query-result`.
- `src/app/(admin)/admin/testimonials/page.tsx` - narrows `result.ok`, renders `<AdminErrorState resource="testimonials" />` on failure; search/empty/table branches unchanged.
- `src/app/(admin)/admin/testimonials/[id]/edit/page.tsx` - 3-way guards on `result.status`; 404 only on `'not-found'`, `<AdminErrorState resource="testimonial" />` on `'error'`; placeholder short-circuit + `connection()` untouched.
- `tests/unit/admin/testimonials-queries.test.ts` - error variant (not empty), ok-empty, 3-way detail, three write-helper null-contract cases; thenable `db.select()` mock + stubbed `db.update()` chain.

## Decisions Made
- **`EMPTY_RESULT` deleted**, not retained: its sole purpose was the swallowed-error default that this phase replaces with `err()`. Keeping it would leave a dead const and re-tempt the silent-empty anti-pattern.
- **Internal caller migrated in lockstep, contract byte-equal**: `toggleTestimonialPublished` narrows the 3-way result locally (`result.status === 'found' ? result.data : null`) so a DB error and a missing row both collapse to `null` exactly as the old `getTestimonialById` returned. This keeps its public `TestimonialRow | null` contract unchanged (threat T-13-09 disposition: accept; out of scope per CONTEXT) while letting the read seam distinguish error from not-found for the edit page.
- **Write-helper test added with a stubbed `db.update()` chain**: the existing list-only test had no `getTestimonialById`/write-helper coverage and no `db.update()` stub. Adding both lets the write helper run its real lookup+update path against the mock and pins the null-on-absent contract that the lockstep migration must preserve.
- **Placeholder short-circuit left byte-unchanged** (Pitfall 2): the new `'error'` branch only runs for real ids on real requests after `connection()`, the same fully-dynamic class as the existing render - no build-time prerender step is added, so no PPR regression.

## Deviations from Plan
None - plan executed exactly as written. (One in-scope test-harness change matching 13-05: the chainable `db.select()` mock was made thenable and a stubbed `db.update()` chain was added, because the write-helper case the plan's Task 1 action mandates exercises `db.update(...).set(...).where(...).returning()`, which the previous list-only mock did not stub.)

## Issues Encountered
None. RED was confirmed (11 failing) before the source change; GREEN was confirmed (17/17) after. The whole-project typecheck showed exactly the two testimonials-consumer errors after Task 1 (the plan acknowledges consumers are fixed in Task 2), confirming the internal caller was already migrated and no other external caller of `getTestimonialById` remained; all cleared after Task 2.

## Threat Model Status
- **T-13-08 (Information disclosure, testimonials pages):** MITIGATED. Both pages render `AdminErrorState` (fixed generic copy, never the exception); the caught DB error stays in `logger.error` server-side.
- **T-13-04e (Repudiation / availability, testimonials/[id]/edit):** MITIGATED. A DB error renders the error state; only a genuinely missing row 404s. The misleading-404-on-error path is gone.
- **T-13-09 (Tampering, toggleTestimonialPublished):** ACCEPTED (unchanged). The internal narrow preserves the existing "no row -> null" behavior; the write-helper contract is byte-equal. Out of scope per CONTEXT.

## Known Stubs
None. Both reads are fully wired to the unions, both consumers narrow them, and the internal write-helper caller narrows it; no placeholder data, no TODO/FIXME, no empty-data short-circuits introduced.

## User Setup Required
None - no external service configuration.

## Next Phase Readiness
- The testimonials resource is fully migrated, following the showcase shape from 13-05 exactly (including the `get*ById` + write-helper internal-caller lockstep). The remaining plans 13-07..13-09 (blog, emails) follow the same shape; the blog (`updateBlogPost`, `toggleBlogPostPublished`) and emails (`retryScheduledEmail`) write helpers have the identical internal-caller hazard and the local-narrow pattern established here applies directly.
- No blockers.

## Self-Check: PASSED

- `src/lib/admin/testimonials-queries.ts` exists (modified); `src/app/(admin)/admin/testimonials/page.tsx` exists (modified); `src/app/(admin)/admin/testimonials/[id]/edit/page.tsx` exists (modified); `tests/unit/admin/testimonials-queries.test.ts` exists (modified).
- Commits `74053303` and `662e0ec3` are present in git history.
- `bun test tests/unit/admin/testimonials-queries.test.ts` = 17 pass / 0 fail; `bun run typecheck` = 0 errors; grep gate `EMPTY_RESULT` = 0; `git diff --stat src/components/admin/ResourceListPage.tsx` empty.

---
*Phase: 13-admin-error-observability*
*Completed: 2026-06-02*
