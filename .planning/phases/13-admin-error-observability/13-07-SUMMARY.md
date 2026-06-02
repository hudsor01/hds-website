---
phase: 13-admin-error-observability
plan: 07
subsystem: admin
tags: [typescript, discriminated-union, next-server-component, bun-test, admin, blog, error-state]

# Dependency graph
requires:
  - phase: 13-01 (shared primitives)
    provides: "AdminQueryResult<T> / AdminDetailResult<T> + ok/err/found/notFoundResult/errResult; AdminErrorState component"
provides:
  - "listBlogPostsForAdmin -> AdminQueryResult<ListBlogPostsResult> (err() on DB failure, ok-empty on zero rows)"
  - "getBlogPostForAdmin -> 3-way AdminDetailResult<AdminBlogListRow> (found/not-found/error; throw in post select OR loadTagIdsForPosts await -> error)"
  - "updateBlogPost + toggleBlogPostPublished narrow result.status === 'found' locally; null-on-absent contract unchanged"
  - "blog list page renders AdminErrorState on !result.ok; empty state reserved for genuine zero rows"
  - "blog edit page 404s only on not-found, renders AdminErrorState on error (no misleading 404); authors/tags Promise.all elements unchanged"
affects: [13-08, 13-09, 13-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "get*ById change + its TWO internal write-helper callers migrated in the SAME task (lockstep) so the whole-project typecheck catches any straggler"
    - "internal write-helper caller narrows the 3-way detail union locally via result.status === 'found' ? result.data : null, preserving its existing null-on-absent return contract"
    - "the detail read keeps its in-try loadTagIdsForPosts await: a throw there is still a read failure -> errResult(), not a misleading 404"
    - "only the FIRST element of the edit-loader Promise.all (the post result) becomes the 3-way union; getAuthors/getTags elements are byte-unchanged"

key-files:
  created: []
  modified:
    - src/lib/admin/blog-queries.ts
    - src/app/(admin)/admin/blog/page.tsx
    - src/app/(admin)/admin/blog/[id]/edit/page.tsx
    - tests/unit/admin/blog-queries.test.ts

key-decisions:
  - "EMPTY_RESULT const deleted (its only purpose was the swallowed-error default, now replaced by err())"
  - "Both internal write-helper callers (updateBlogPost, toggleBlogPostPublished) migrated in lockstep with getBlogPostForAdmin; narrowed to row-or-null so their public contract is byte-equal"
  - "BUILD_PLACEHOLDER_ID short-circuit + await connection() left byte-unchanged (Pitfall 2: no PPR $~ regression)"
  - "getAuthors/getTags elements of the edit-loader Promise.all left byte-unchanged (out of scope); only the post result became the union"
  - "logger.error retained on both read catch paths (caught error stays server-side, never crosses into AdminErrorState copy)"

patterns-established:
  - "the get*ById detail read can wrap MORE than the row select in its try (here loadTagIdsForPosts): any throw in the whole detail read yields errResult(), keeping the error-vs-404 distinction honest"

requirements-completed: [ADMINERR-01, ADMINERR-04]

# Metrics
duration: 8min
completed: 2026-06-02
---

# Phase 13 Plan 07: Blog error-vs-empty + 3-way detail + internal-caller lockstep Summary

**Migrated the blog read layer to the Wave-1 discriminated unions and the two internal write-helper callers in lockstep: `listBlogPostsForAdmin` returns `AdminQueryResult<ListBlogPostsResult>` (the list page shows `AdminErrorState` on failure, empty state only on genuine zero rows), `getBlogPostForAdmin` returns a 3-way `AdminDetailResult<AdminBlogListRow>` where a throw in EITHER the post select OR the in-try `loadTagIdsForPosts` await yields the error variant (the edit page 404s only on not-found, renders `AdminErrorState` on DB error while leaving the `getAuthors`/`getTags` `Promise.all` elements untouched), and `updateBlogPost` + `toggleBlogPostPublished` narrow the detail union locally so their existing null-on-absent contract stays byte-equal and typecheck stays green.**

## Performance

- **Duration:** ~8 min (two implementation task commits from a prior session + finalization)
- **Tasks:** 2
- **Files modified:** 4
- **Completed:** 2026-06-02

## Accomplishments
- `src/lib/admin/blog-queries.ts`: `listBlogPostsForAdmin` now returns `AdminQueryResult<ListBlogPostsResult>` - success payload wrapped in `ok(...)`, the `catch` returns `err()` (was `EMPTY_RESULT`) while keeping the `logger.error` line. The now-unused `EMPTY_RESULT` const is deleted (grep gate returns 0). `getBlogPostForAdmin` returns the 3-way `AdminDetailResult<AdminBlogListRow>`: `found({post, author, tagIds})` on a present row, `notFoundResult()` when no row, `errResult()` on throw (logs once). The `loadTagIdsForPosts([id])` await stays INSIDE the try, so a throw there (not just in the post select) is treated as a read failure and yields `errResult()` rather than a misleading 404.
- **Internal-caller lockstep (the load-bearing finding):** `updateBlogPost` and `toggleBlogPostPublished` both call `getBlogPostForAdmin` internally and relied on the old `null` contract. Each now reads `const result = await getBlogPostForAdmin(id); const existing = result.status === 'found' ? result.data : null; if (!existing) return null`, so both DB-error and not-found collapse to `null` exactly as before. Their public return type (`DbBlogPost | null`) and behavior are byte-equal; the whole-project typecheck confirmed no other external caller remained on the old contract.
- `src/app/(admin)/admin/blog/page.tsx`: narrows the union - `if (!result.ok) return <AdminErrorState resource="blog posts" />`, then destructures `result.data`. The existing search/empty/table branches inside `ResourceListPage` are unchanged and now only run on genuine success.
- `src/app/(admin)/admin/blog/[id]/edit/page.tsx`: keeps the `Promise.all([getBlogPostForAdmin(id), getAuthors(), getTags()])`, but only the FIRST element is now an `AdminDetailResult`. After awaiting: `if (postResult.status === 'not-found') { notFound() }`, `if (postResult.status === 'error') { return <AdminErrorState resource="blog post" /> }`, else `postResult.data` is the row; `authors`/`tags` are used unchanged for the render. The `if (id === BUILD_PLACEHOLDER_ID) notFound()` short-circuit and `await connection()` are byte-unchanged (verified: no +/- on those diff lines) so the PPR placeholder path is intact (Pitfall 2). `ResourceListPage.tsx` was not touched (diff stat empty); `getAuthors`/`getTags` in `src/lib/blog.ts` were not touched (diff stat empty).
- `tests/unit/admin/blog-queries.test.ts`: the list DB-error case asserts `{ ok: false, error: true }` (not the empty shape) with `logger.error` called once; the zero-rows case asserts `ok` with an empty `data` payload (distinct from error); all surviving list cases narrow `result.data`; three `getBlogPostForAdmin` cases (found / not-found / error); six write-helper cases pinning the null-on-absent contract for `updateBlogPost` and `toggleBlogPostPublished` (row present -> row, row absent -> null, lookup throws -> null). The chainable `db.select()` mock is thenable, with a stubbed `db.update()` chain and a `db.transaction()` stub so the write helpers run their full lookup+write path (`toggleBlogPostPublished` via `db.update`, `updateBlogPost` via `db.transaction`) from one harness.
- 21 passing unit tests in the blog suite; `bun run typecheck` green across the whole project (pre-commit hook ran on every commit and passed, including the finalization commit); lint clean on all touched files.

## Task Commits

Each task was committed atomically (hooks ran on every commit; no `--no-verify`):

1. **Task 1: Migrate blog reads + the 2 internal callers + update tests** - `128d4850` (feat) - TDD task; reads migrated to the unions, both internal callers narrowed in lockstep, tests rewritten for the error variant + 3-way detail + write-helper null-contract.
2. **Task 2: Update both blog consumers** - `827d2929` (feat) - list page `AdminErrorState` on `!ok`; edit loader 3-way guard with authors/tags unchanged.

A follow-up `style(13-07)` commit (`87aeb1a1`) applied a Biome auto-format to the test file (a multi-line array literal collapsed to one line) that the pre-commit hook normalized; no behavior change, blog suite still 21/21.

**Plan metadata:** (final commit) `docs(13-07): complete blog error-state plan`

## Files Created/Modified
- `src/lib/admin/blog-queries.ts` - `listBlogPostsForAdmin` -> `AdminQueryResult<ListBlogPostsResult>` (`ok`/`err`); `getBlogPostForAdmin` -> `AdminDetailResult<AdminBlogListRow>` (`found`/`notFoundResult`/`errResult`, `loadTagIdsForPosts` await kept in-try); `EMPTY_RESULT` deleted; `updateBlogPost` + `toggleBlogPostPublished` narrow `result.status === 'found' ? result.data : null` (contracts unchanged); `logger.error` retained on both read catches; constructors + types imported from `@/lib/admin/query-result`.
- `src/app/(admin)/admin/blog/page.tsx` - narrows `result.ok`, renders `<AdminErrorState resource="blog posts" />` on failure; search/empty/table branches unchanged.
- `src/app/(admin)/admin/blog/[id]/edit/page.tsx` - switches on `postResult.status`; 404 only on `'not-found'`, `<AdminErrorState resource="blog post" />` on `'error'`; placeholder short-circuit + `connection()` untouched; `getAuthors`/`getTags` elements of the `Promise.all` untouched.
- `tests/unit/admin/blog-queries.test.ts` - error variant (not empty), ok-empty, 3-way detail, six write-helper null-contract cases; thenable `db.select()` mock + stubbed `db.update()` chain + `db.transaction()` stub.

## Decisions Made
- **`EMPTY_RESULT` deleted**, not retained: its sole purpose was the swallowed-error default that this phase replaces with `err()`. Keeping it would leave a dead const and re-tempt the silent-empty anti-pattern.
- **Internal callers migrated in lockstep, contracts byte-equal**: both write helpers narrow the 3-way result locally (`result.status === 'found' ? result.data : null`) so a DB error and a missing row both collapse to `null` exactly as the old `getBlogPostForAdmin` returned. This keeps their public `DbBlogPost | null` contract unchanged (threat T-13-11 disposition: accept; out of scope per CONTEXT) while letting the read seam distinguish error from not-found for the edit page.
- **The detail read's try wraps `loadTagIdsForPosts` too**: a throw in the tag-id join (not just the post select) is a genuine read failure, so it yields `errResult()` and the edit page error-states rather than 404s. This keeps the error-vs-404 distinction honest for the whole detail read, not just the first query.
- **Only the post element of the edit-loader `Promise.all` became the union**: `getAuthors`/`getTags` are out of scope (public read helpers shared with the create page); they were left byte-unchanged and the v4 per-widget resilience of `Promise.all` (a returned failure never rejects the whole all) is preserved.
- **Placeholder short-circuit left byte-unchanged** (Pitfall 2): the new `'error'` branch only runs for real ids on real requests after `connection()`, the same fully-dynamic class as the existing render - no build-time prerender step is added, so no `$~` PPR regression.

## Deviations from Plan
None functionally - plan executed as written. One follow-up `style(13-07)` commit applied a Biome auto-format (single-line array literal) to the test file that the pre-commit hook normalized; it carries no behavior change and the blog suite remains 21/21 green.

## Issues Encountered
None. The blog suite is 21/21 green; the whole-project typecheck is green (enforced by the pre-commit hook on each commit, no `--no-verify`). The `bun run typecheck` invocation was unavailable as a standalone command during finalization, but the lefthook pre-commit hook (which runs `lint && typecheck`) ran and passed on the `style(13-07)` finalization commit, confirming the slice typechecks clean.

## Threat Model Status
- **T-13-10 (Information disclosure, blog pages):** MITIGATED. Both pages render `AdminErrorState` (fixed generic copy, never the exception); the caught DB error stays in `logger.error` server-side.
- **T-13-04f (Repudiation / availability, blog/[id]/edit):** MITIGATED. A DB error (in the post select OR the tag-id join) renders the error state; only a genuinely missing row 404s. The misleading-404-on-error path is gone.
- **T-13-11 (Tampering, updateBlogPost / toggleBlogPostPublished):** ACCEPTED (unchanged). The internal narrow preserves the existing "no row -> null" behavior; write-helper contracts are byte-equal. Out of scope per CONTEXT.

## Threat Flags
None. No new network endpoint, auth path, file-access pattern, or trust-boundary schema change was introduced; the migration is confined to the read seam shape and consumer narrowing.

## Known Stubs
None. Both reads are fully wired to the unions, both consumers narrow them, and both internal write-helper callers narrow them; no placeholder data, no TODO/FIXME, no empty-data short-circuits introduced.

## User Setup Required
None - no external service configuration.

## Next Phase Readiness
- Blog is the sixth Wave-2 resource migrated; the only remaining Wave-2 plans are 13-08 (dashboard widgets, ADMINERR-02) and 13-09 (emails queue counts + `getScheduledEmailById` + retry caller, ADMINERR-03). The `get*ById` + write-helper internal-caller lockstep pattern established in 13-05 and reused here applies directly to 13-09's `retryScheduledEmail` caller.
- No blockers.

## Self-Check: PASSED

- `src/lib/admin/blog-queries.ts` exists (modified); `src/app/(admin)/admin/blog/page.tsx` exists (modified); `src/app/(admin)/admin/blog/[id]/edit/page.tsx` exists (modified); `tests/unit/admin/blog-queries.test.ts` exists (modified).
- Commits `128d4850`, `827d2929`, and `87aeb1a1` are present in git history.
- `bun test tests/unit/admin/blog-queries.test.ts` = 21 pass / 0 fail; grep gate `EMPTY_RESULT` = 0; `git diff --stat src/components/admin/ResourceListPage.tsx` empty; `git diff --stat src/lib/blog.ts` empty (getAuthors/getTags untouched).

---
*Phase: 13-admin-error-observability*
*Completed: 2026-06-02*
