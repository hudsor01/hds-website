---
phase: 10-admin-list-pagination
plan: 03
subsystem: admin-list
wave: 2
tags: [pagination, cursor, search, server-component, shadcn, nulls-last]
requires:
  - "list-cursor primitives from Wave 1 (PAGE_SIZE, encodeCursor, decodeCursor, escapeLikePattern, buildPaginationHref)"
  - "SearchInput nuqs component from Wave 1"
  - "shadcn ui/table.tsx + ui/pagination.tsx primitives from Wave 1"
  - "Plan 10-02 structural pattern (listShowcasesForAdmin canonical shape)"
provides:
  - listBlogPostsForAdmin (rewritten)
  - ListBlogPostsOptions
  - ListBlogPostsResult
affects:
  - "/admin/blog server page (rewritten to consume cursor + search)"
tech_stack:
  added: []
  patterns:
    - "NULLS LAST cursor: publishedAt encodes as the literal `\\x00` sentinel (NOT empty string) because list-cursor.decodeCursor rejects zero-length parts -- empty would round-trip as null and silently lose the marker"
    - "Four-state cursor branch: (cursor.publishedAt real/null) x (direction after/before). Real-pa forward = OR(isNull, lt(pa), eq(pa)+lt(createdAt), eq(pa)+eq(createdAt)+gt(id)). Null-pa forward = within-null-tail walk only. Real-pa backward flips each comparator. Null-pa backward = OR(isNotNull, within-null-tail backward) because any real-pa row precedes any null-pa row in display order"
    - "Tag-id lookup runs over the trimmed PAGE_SIZE slice, not the full PAGE_SIZE+1 read -- the sentinel row never reaches blog_post_tags. A dedicated test (`tag-id lookup is page-slice scoped`) pins this contract"
    - "PAGE_SIZE + 1 trick: read one extra row to detect hasMore without a second COUNT query (inherited from Plan 10-02)"
    - "Before-direction reversal: SQL ORDER BY is flipped (asc nulls first + asc createdAt + desc id), then result rows reversed in JS so callers always see display order (inherited from Plan 10-02)"
    - "shadcn Table + Pagination composed directly in the page; preservedParams = `{ q }` typed as Record<string, string>"
key_files:
  created:
    - tests/unit/admin/blog-queries.test.ts
  modified:
    - src/lib/admin/blog-queries.ts
    - src/app/(admin)/admin/blog/page.tsx
decisions:
  - "NULLS LAST sentinel = '\\x00' (NOT '' as the plan mentioned as one option). Reason: list-cursor.decodeCursor rejects zero-length parts (`part.length === 0 -> return null`), so an empty-string sentinel would be silently dropped on the round-trip and the cursor would decode as null (page-1 fall-back). `\\x00` is non-empty, base64url-safe, and never appears in a real ISO timestamp"
  - "Single atomic commit (helper + page + tests) per plan success_criteria, matching the Plan 10-02 commit shape"
  - "Test mocks drizzle-orm's `inArray` to capture the `values` argument -- this is the only way to assert that loadTagIdsForPosts received the trimmed page-slice ids without spinning up a real DB"
  - "Test sets up TWO chainable mocks behind a single mocked db.select(): the first call returns the post-list chain (.leftJoin().where().orderBy().limit()), the second call returns the tag-lookup chain (.from().where()). A mode flag in the shared state flips between them"
metrics:
  duration_min: 22
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  test_assertions: 32
  test_cases: 11
  completed: 2026-05-27
---

# Phase 10 Plan 03: /admin/blog cursor + search Summary

Wave-2 conversion of `/admin/blog` from "list every post in publishedAt
DESC NULLS LAST order" to a cursor-paginated + searchable list. The
helper `listBlogPostsForAdmin` now takes an options object and returns
the canonical Wave-2 result shape; the page consumes Wave-1 primitives
directly (no per-page wrappers) and replaces raw `<table>` markup with
shadcn `<Table>` primitives. Tag-id lookup is now scoped to the trimmed
page slice (`<= PAGE_SIZE` ids), down from "every post in the DB".

## Diff scope

### `src/lib/admin/blog-queries.ts`

- Imports extended: `+ and, asc, gt, ilike, isNotNull, isNull, lt, or, type SQL` from `drizzle-orm`; `+ PAGE_SIZE, Direction, decodeCursor, encodeCursor, escapeLikePattern` from `@/lib/admin/list-cursor`.
- New type exports: `ListBlogPostsOptions = { q?, cursor?, direction? }`, `ListBlogPostsResult = { rows, hasMore, prevCursor, nextCursor }`.
- New module-private constants: `EMPTY_RESULT` (safe-default for catch path), `NULL_SENTINEL = '\x00'` (NULLS-LAST cursor marker), `cursorPartsFor(row)` helper for `[publishedAt-or-sentinel, createdAt, id]` tuple extraction.
- `listBlogPostsForAdmin(opts?)` body fully rewritten per the plan's spec, including the four-state cursor branch (real/null pa x after/before direction) and the NULLS-LAST-aware orderBy flip.

Every other export -- `getBlogPostForAdmin`, `loadTagIdsForPosts`, `createBlogPost`, `updateBlogPost`, `deleteBlogPost`, `toggleBlogPostPublished`, `computePublishedAtTransition` -- is byte-equal to `origin/main`.

### `src/app/(admin)/admin/blog/page.tsx`

- Added imports: `SearchInput`, shadcn `Pagination` primitive set, shadcn `Table` primitive set, `buildPaginationHref` from `list-cursor`.
- Page signature: `interface AdminBlogPageProps { searchParams: Promise<{ q?, cursor? }> }`. Default export now passes `searchParams` to `BlogList`.
- `BlogList` is async, awaits `searchParams`, derives `q` (trimmed), threads `{ q: q.length > 0 ? q : undefined, cursor }` into the helper. `preservedForPagination` is `Record<string, string>` (typed annotation needed because the inferred union `{ q: string } | { q?: undefined }` breaks `buildPaginationHref`'s signature).
- Raw `<div className="overflow-x-auto ...">` + `<table>` + `<thead>` + `<tbody>` markup replaced with shadcn `<Table>` / `<TableHeader>` / `<TableBody>` / `<TableRow>` / `<TableHead>` / `<TableCell>` / `<TableCaption>`. Per-column `<th>` className stripped (shadcn `<TableHead>` styles); right-aligned actions column still passes `className="text-right"`.
- Inline empty-state surfaces `No posts matching <q>` + `Clear search` link when `q` filters to zero rows.
- shadcn `<Pagination>` composed directly per the Wave-1 canonical pattern: disabled `PaginationPrevious`/`PaginationNext` use `aria-disabled="true" className="pointer-events-none opacity-50"`; active uses `href={buildPaginationHref(...)}`.
- `ResourceListPage`'s centered empty-state fires only when `rows.length === 0 && q.length === 0` so "no rows AND no active search" is unambiguous.
- `formatPublishedAt` + `dateFormatter` declarations byte-equal vs origin/main; `metadata` export byte-equal; `<Suspense>` fallback string byte-equal.

### `tests/unit/admin/blog-queries.test.ts` (new)

11 bun:test cases / 32 expect() assertions:

| Group | Cases |
|---|---|
| page-size + hasMore | 3 |
| tag-id lookup is page-slice scoped | 1 |
| DB error safety | 1 |
| search composition | 3 |
| cursor + direction (incl. NULLS-LAST sentinel) | 3 |

Mock pattern mirrors `tests/unit/admin/showcase-queries.test.ts` with one addition: drizzle-orm's `inArray(column, values)` is mocked so the second select() call's `loadTagIdsForPosts` lookup captures the `values` argument. This is the only way to assert the "page slice only, not the full result" contract without a real DB.

The mock module setup is re-registered in `beforeEach` because `tests/setup.ts` runs `mock.restore()` before each test (would otherwise wipe the chainable stub).

## Cursor format

Real publishedAt:
```
encodeCursor('after', ['2026-05-15T12:00:00.000Z', '2026-05-15T12:00:00.000Z', 'post-id'])
```
produces:
```
after:MjAyNi0wNS0xNVQxMjowMDowMC4wMDBa.MjAyNi0wNS0xNVQxMjowMDowMC4wMDBa.cG9zdC1pZA
```

Null publishedAt (unpublished row):
```
encodeCursor('after', ['\x00', '2026-05-15T12:00:00.000Z', 'post-id'])
```
produces a cursor whose first base64url part decodes back to the single
NUL character; the helper detects this on decode (`rawPublishedAt === NULL_SENTINEL`) and chooses the "null-tail walk" branch of the comparison predicate.

`buildPaginationHref('/admin/blog', cursor, { q: 'foo' })` produces:
```
/admin/blog?cursor=<encoded>&q=foo
```

## Commits

| Task | Commit | Files |
|---|---|---|
| 1 + 2: helper + page + tests | `061e4f5` | `src/lib/admin/blog-queries.ts`, `src/app/(admin)/admin/blog/page.tsx`, `tests/unit/admin/blog-queries.test.ts` |
| SUMMARY | (next commit) | `.planning/phases/10-admin-list-pagination/10-03-SUMMARY.md` |

## Verification

- `bun run lint` exit 0 (Biome on 366 src files).
- `bun run typecheck` exit 0.
- `bunx biome check src/ tests/` exit 0 (Lefthook pre-commit scope).
- `bun test tests/unit/admin/blog-queries.test.ts`: 11 pass, 0 fail, 32 expect() calls.
- `bun run test:unit`: 655 pass, 0 fail across 57 files.
- `bun run build` exit 0; `/admin/blog` route compiled successfully. Pre-existing `BetterAuthError: You are using the default secret` warnings during build are environmental (no `BETTER_AUTH_SECRET` in the worktree env) and unrelated to this plan -- documented in 10-02 SUMMARY too.
- Em / en dash sweep on plan files (`rg --pcre2 '[\x{2014}\x{2013}]' ...`) exit 1 (no matches).
- Protected-file diff against `origin/main` empty for: `src/lib/auth/admin.ts`, `proxy.ts`, all of `src/app/api/`, `src/components/admin/StatusFilterBar.tsx`, `src/components/admin/PublishToggle.tsx`, `src/components/admin/ResourceListPage.tsx`, `src/app/(admin)/admin/blog/[id]/`, `src/app/(admin)/admin/blog/actions.ts`.
- `git diff origin/main -- src/lib/admin/blog-queries.ts` confined to imports + `listBlogPostsForAdmin` body + new helper types + `cursorPartsFor` helper. Every other export byte-equal.

## Tag-id lookup scope (per plan output spec)

The pre-rewrite helper called `loadTagIdsForPosts(rows.map(r => r.post.id))` AFTER loading every post in the DB -- the lookup ran over the entire blog_posts table even though the UI only renders 25 rows per page.

The new helper computes `pageRows` (the trimmed + display-ordered slice) FIRST, then calls `loadTagIdsForPosts(pageRows.map(r => r.post.id))` -- so the inArray lookup is always bounded by `<= PAGE_SIZE` (25) ids, regardless of how many posts exist in the DB. A dedicated test (`listBlogPostsForAdmin: tag-id lookup is page-slice scoped > loadTagIdsForPosts is called with the TRIMMED page-slice ids ...`) pins this contract by mocking `inArray` to capture the second-arg array and asserting:

1. The captured array has length exactly `PAGE_SIZE`.
2. The dropped sentinel row id is NOT in the array.
3. The array equals the first `PAGE_SIZE` ids of the mocked DB result.

## NULLS LAST sentinel choice

The plan explicitly offered two options ("`'\x00'` (or empty string -- pick one and document)"). I chose `'\x00'` because the empty string would be silently dropped by `list-cursor.decodeCursor` -- it rejects zero-length parts to defend against malformed URL input (see `list-cursor.ts:85-86`). An empty-string sentinel would round-trip as `null` (the codec returns `null` on any malformed input), which the helper would interpret as "no cursor" and fall back to page 1 -- breaking forward pagination across the published/unpublished boundary.

`\x00`:
- Is non-empty (passes the codec's length check).
- Base64url-encodes safely (`'\x00'` -> `'AA'`).
- Never appears in a real ISO 8601 timestamp.
- Decodes back to the exact same byte sequence (`Buffer.from('AA=', 'base64').toString('utf8')` -> `'\x00'`).

The helper detects it via `rawPublishedAt === NULL_SENTINEL` and chooses the null-tail-walk comparison predicate accordingly.

## Deviations from Plan

### [Single atomic commit, not strict TDD-separated] Helper + page + tests in one commit

**Found during:** Task 1 commit decision.

**Issue:** Plan marks Task 1 as `type="auto" tdd="true"` (which would normally produce a RED commit then GREEN commit) but the plan's `<success_criteria>` block says "One commit: `feat(10-03): cursor + search for /admin/blog`." These are in tension. Plan 10-02 resolved the tension by combining; following the same precedent.

**Fix:** Honored the spirit of "one commit" -- combined the test addition (RED), helper rewrite (GREEN), and page rewrite (Task 2) into a single atomic commit. Tests were written before the helper rewrite locally and observed to fail on the legacy shape (9/11 failed on first run, matching the legacy single-arg signature), so the RED gate was hit even though it did not ship as its own commit.

**Files affected:** None additional; just commit shape.

### [Rule 1 - Bug] NULLS-LAST sentinel chosen `\x00` over empty string

**Found during:** Task 1, first GREEN run on the NULLS-LAST sentinel test.

**Issue:** Initial implementation used the empty-string sentinel that the plan mentioned as one option. The test `NULLS-LAST sentinel: a row with publishedAt=null encodes to the sentinel in the cursor tuple` failed because `decodeCursor` returned `null` -- the codec rejects zero-length parts in `payload.split('.')`, so the empty sentinel was being silently swallowed at decode time. This would have broken forward pagination across the published/unpublished boundary in production.

**Fix:** Switched the sentinel to `'\x00'` (literal NUL byte). Updated the helper's `cursorPartsFor`, the cursor-decode branch, the constant `NULL_SENTINEL`, the JSDoc, and the test assertion. All 11 tests now pass; the sentinel round-trips correctly through the codec.

**Files modified:** `src/lib/admin/blog-queries.ts`, `tests/unit/admin/blog-queries.test.ts`.

### [Rule 1 - Bug] Cleaned up degenerate "before" + null-cursor predicate

**Found during:** Task 1, lint pass (the `and(...)` wrapper around a single argument was flagged by formatter).

**Issue:** Initial draft of the "before direction + cursor.publishedAt = null" branch included a fallback predicate `and(eq(blogPosts.publishedAt, blogPosts.publishedAt))` -- which is always true and would have made the cursor predicate a no-op (returning every row in the table). Caught while inspecting the post-format diff.

**Fix:** Replaced the gibberish fallback with `isNotNull(blogPosts.publishedAt)` -- the correct "back into real-publishedAt range" branch. Under display order, every real-pa row precedes every null-pa row, so when paging backward from a null-cursor, the wider OR-branch is "any row with a non-null publishedAt". Added `isNotNull` to the drizzle-orm import.

**Files modified:** `src/lib/admin/blog-queries.ts`.

### [Rule 3 - Blocker] Lefthook check covers tests/ but `bun run lint` does not

**Found during:** First commit attempt.

**Issue:** `bun run lint` runs `biome check src/` -- it does not scan `tests/`. The Lefthook pre-commit hook runs `biome check` across the staged file set, which includes the new test file. Biome flagged `assist/source/organizeImports` on the test file because the `@/lib/admin/blog-queries` and `@/lib/admin/list-cursor` imports were in alphabetical-by-symbol order rather than alphabetical-by-path. First commit attempt failed at the hook.

**Fix:** Ran `bunx biome check --write tests/unit/admin/blog-queries.test.ts` to auto-fix the import order, re-ran the test (still 11/11 pass), re-staged, re-committed. Hook passed on the second attempt.

**Files modified:** `tests/unit/admin/blog-queries.test.ts`.

## Self-Check: PASSED

Files exist:

- `src/lib/admin/blog-queries.ts` (FOUND, modified)
- `src/app/(admin)/admin/blog/page.tsx` (FOUND, modified)
- `tests/unit/admin/blog-queries.test.ts` (FOUND, created)

Commit exists on branch `admin-list-pagination`:

- `061e4f5` (FOUND): `feat(10-03): cursor + search for /admin/blog`

Verification re-run after final commit: `bun run lint` exit 0, `bun run typecheck` exit 0, `bun test tests/unit/admin/blog-queries.test.ts` 11/11 pass, `bun run test:unit` 655/655 pass, `bun run build` exit 0 (`/admin/blog` route compiled), protected-file diff empty, em / en dash sweep empty.
