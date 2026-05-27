---
phase: 10-admin-list-pagination
plan: 07
subsystem: admin-list
wave: 2
tags: [pagination, cursor, search, status-filter, nulls-last, server-component, shadcn]
requires:
  - "list-cursor primitives from Wave 1 (PAGE_SIZE, encodeCursor, decodeCursor, escapeLikePattern, buildPaginationHref)"
  - "SearchInput nuqs component from Wave 1"
  - "shadcn ui/table.tsx + ui/pagination.tsx primitives from Wave 1"
  - "StatusFilterBar from Phase 05 (byte-equal; second Wave-2 plan to compose it alongside SearchInput + Pagination after Plan 10-05)"
  - "Plan 10-03 NULLS-LAST cursor template (\\x00 sentinel)"
  - "Plan 10-05 status + q + cursor composition matrix template"
provides:
  - listSubscribersForAdmin (rewritten)
  - ListSubscribersOptions
  - ListSubscribersResult
affects:
  - "/admin/newsletter server page (rewritten to consume cursor + search alongside the existing StatusFilterBar chip row)"
tech_stack:
  added: []
  patterns:
    - "2-part NULLS-LAST cursor: (subscribedAt DESC NULLS LAST, id ASC) -- no createdAt tiebreaker per Plan 10-07. Forward real-sa = OR(isNull(sa), lt(sa), eq(sa)+gt(id)); forward null-sa = AND(isNull(sa), gt(id)); backward real-sa = OR(gt(sa), eq(sa)+lt(id)); backward null-sa = OR(isNotNull(sa), AND(isNull(sa), lt(id))) because any real-sa row precedes any null-sa row in display order"
    - "NULL_SENTINEL = '\\x00' for the subscribedAt cursor part (matches Plan 10-03 blog). Empty string would be silently dropped on decode -- list-cursor.decodeCursor rejects zero-length parts"
    - "Filter composition: status + q + cursor all assembled into a single conditions[] array and reduced via and(), so each control surface can be active independently or in any combination"
    - "Search over two columns (email + name) via OR of ILIKE predicates -- name is nullable, ILIKE on a NULL column returns NULL (false) so those rows are safely filtered out"
    - "PAGE_SIZE + 1 trick: read one extra row to detect hasMore without a second COUNT query (inherited from Plan 10-02)"
    - "Before-direction reversal: SQL ORDER BY flipped (asc nulls first + desc id), then result rows reversed in JS so callers always see display order"
    - "preservedForPagination typed as Record<string, string> with conditional assignment (if status / if q), so empty-filter pages still emit a typed empty object compatible with buildPaginationHref"
    - "shadcn Table + Pagination composed directly in the page; Plan 10-05 param composition matrix carries over byte-equal"
key_files:
  created:
    - tests/unit/admin/newsletter-queries.test.ts
  modified:
    - src/lib/admin/newsletter-queries.ts
    - src/app/(admin)/admin/newsletter/page.tsx
decisions:
  - "NULLS-LAST sentinel = '\\x00' (matches Plan 10-03 blog convention). subscribedAt is nullable in the schema (defaultNow() only -- imported rows may have no timestamp) so the cursor must distinguish real-sa from null-sa just like Plan 10-03 distinguishes published from unpublished posts"
  - "2-part cursor (subscribedAt, id) -- NO createdAt tiebreaker. Plan 10-07 explicitly mandates the simpler shape (id is the per-row uuid PK so it always tiebreaks uniquely on its own)"
  - "Single atomic commit (helper + page + tests) per plan success_criteria -- matches the Plan 10-02 / 10-03 / 10-04 / 10-05 / 10-06 commit shape"
  - "StatusFilterBar stays byte-equal (plan's must_haves.truths #5). Composition of status + q + cursor handled by surrounding helper and Pagination preservedParams"
  - "SearchInput receives only `placeholder` per API ADDENDUM 1 (nuqs auto-preserves status and every other query param)"
  - "Pagination's preservedForPagination forwards BOTH status and q when each is non-empty"
  - "Inline 'Clear search' link goes to /admin/newsletter?status={current} when status is active so dropping q preserves status. When no status is active, link goes to /admin/newsletter"
  - "Chainable db mock re-registered in beforeEach (tests/setup.ts mock.restore() wipes per-file mocks). Pattern lifted byte-for-byte from leads-queries.test.ts"
metrics:
  duration_min: 8
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  test_cases: 13
  test_assertions: 35
  completed: 2026-05-27
---

# Phase 10 Plan 07: /admin/newsletter cursor + search Summary

Wave-2 conversion of `/admin/newsletter` from "200 newest subscribers,
optional status filter" to a cursor-paginated + searchable list. Combines
two prior Wave-2 patterns:

- Plan 10-03's NULLS-LAST cursor (subscribedAt is nullable for imported
  rows -- needs the `\x00` sentinel + four-state cursor branch).
- Plan 10-05's status + q + cursor composition matrix (existing
  `<StatusFilterBar>` chip row stays byte-equal alongside new
  `<SearchInput>` + shadcn `<Pagination>`).

Cursor is the simpler 2-part `(subscribedAt, id)` tuple (NO createdAt
tiebreaker per plan -- `id` is the per-row uuid PK so it tiebreaks
uniquely on its own).

## Param composition matrix (mirrors Plan 10-05)

| Control surface         | Touches `?status=`     | Touches `?q=`         | Touches `?cursor=`    |
|-------------------------|------------------------|-----------------------|-----------------------|
| StatusFilterBar chip    | sets (or drops on All) | drops                 | drops                 |
| SearchInput (nuqs)      | preserves              | sets / clears         | preserves             |
| Pagination Prev / Next  | preserves              | preserves             | sets                  |

## Diff scope

### `src/lib/admin/newsletter-queries.ts`

- Imports extended: `+ and, asc, gt, ilike, isNotNull, isNull, lt, or,
  type SQL, sql` (replacing the narrow `desc, eq` import); `+ Direction,
  PAGE_SIZE, decodeCursor, encodeCursor, escapeLikePattern` from
  `@/lib/admin/list-cursor`.
- New type exports: `ListSubscribersOptions = { status?, q?, cursor?,
  direction? }`, `ListSubscribersResult = { rows, hasMore, prevCursor,
  nextCursor }`.
- New module-private constants: `EMPTY_RESULT` (safe-default for catch
  path), `NULL_SENTINEL = '\x00'` (NULLS-LAST cursor marker), `cursorPartsFor(row)` helper for `[subscribedAt-or-sentinel, id]` tuple extraction.
- `listSubscribersForAdmin(opts?)` body fully rewritten per the plan's
  spec, including the four-state cursor branch (real/null subscribedAt
  x after/before direction) and the NULLS-LAST-aware orderBy flip.

Every other export (`getSubscriberById`, `setSubscriberStatus`,
`deleteSubscriber`, `SUBSCRIBER_STATUSES`, `SubscriberStatus`,
`SubscriberRow`) byte-equal vs `origin/main`.

### `src/app/(admin)/admin/newsletter/page.tsx`

- Added imports: `SearchInput`, shadcn `Pagination` primitive set,
  shadcn `Table` primitive set, `buildPaginationHref` from `list-cursor`.
- Page interface widened to `searchParams: Promise<{ status?, q?, cursor? }>`.
- `NewsletterList` now derives `q` (trimmed) alongside the existing
  `status` parsing, calls the new options-object helper, and builds
  `preservedForPagination` with explicit `if (status) { ... }` / `if (q)
  { ... }` blocks. The `clearSearchHref` const is computed up front to
  avoid repeating the ternary inside JSX.
- `<StatusFilterBar>` JSX byte-equal (same `baseHref` / `current` /
  `options` props, same position in the JSX tree).
- `<SearchInput placeholder="Search subscribers" />` rendered between
  the chip row and the table/empty-state block.
- Raw `<div className="overflow-x-auto ...">` + `<table>` + `<thead>` +
  `<tbody>` markup replaced with shadcn `<Table>` / `<TableHeader>` /
  `<TableBody>` / `<TableRow>` / `<TableHead>` / `<TableCell>` /
  `<TableCaption>`. Per-column `<th>` className stripped (shadcn
  `<TableHead>` handles padding + alignment).
- Inline empty-state surfaces `No subscribers matching <q>` + `Clear
  search` link when `q` filters to zero rows; "Clear search" preserves
  `status` when set. "No subscribers yet" copy preserved for the
  no-search-no-rows case.
- shadcn `<Pagination>` composed directly per the Wave-1 canonical
  pattern: disabled `PaginationPrevious` / `PaginationNext` use
  `aria-disabled="true" className="pointer-events-none opacity-50"`;
  active uses `href={buildPaginationHref('/admin/newsletter', cursor,
  preservedForPagination)}`.
- Outer `<div className="space-y-6">` heading wrapper + `<Suspense>`
  boundary byte-equal vs `origin/main`. `metadata` export and
  `FILTER_OPTIONS` constant byte-equal too.

### `tests/unit/admin/newsletter-queries.test.ts` (new)

13 bun:test cases / 35 expect() assertions:

| Group                            | Cases |
|----------------------------------|-------|
| page-size + hasMore              | 3     |
| DB error safety                  | 1     |
| WHERE composition (status, q, +) | 5     |
| cursor + direction (incl. NULLS) | 4     |

Mock pattern mirrors `tests/unit/admin/leads-queries.test.ts`:
chainable mock that captures the `.where()` argument and a configurable
`.limit()` resolution that stages different row counts per case.
Re-registered in `beforeEach` because `tests/setup.ts` runs
`mock.restore()` before each test. The extra case over Plan 10-05 is
the NULLS-LAST sentinel test (`'\x00'` round-trip through encodeCursor /
decodeCursor when the last in-page row has `subscribedAt=null`).

## Cursor format

Real subscribedAt:
```
encodeCursor('after', ['2026-05-15T12:00:00.000Z', 'sub-id'])
```
produces:
```
after:MjAyNi0wNS0xNVQxMjowMDowMC4wMDBa.c3ViLWlk
```

Null subscribedAt (imported row with no timestamp):
```
encodeCursor('after', ['\x00', 'sub-id'])
```
produces a cursor whose first base64url part decodes back to the single
NUL character; the helper detects this on decode (`rawSubscribedAt ===
NULL_SENTINEL`) and chooses the "null-tail walk" branch of the
comparison predicate.

`buildPaginationHref('/admin/newsletter', cursor, { status: 'active', q:
'alice' })` produces:
```
/admin/newsletter?cursor=<encoded>&status=active&q=alice
```

## Commits

| Task                            | Commit    | Files                                                                                                                                       |
|---------------------------------|-----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| 1 + 2: helper + page + tests    | `dbcf88f` | `src/lib/admin/newsletter-queries.ts`, `src/app/(admin)/admin/newsletter/page.tsx`, `tests/unit/admin/newsletter-queries.test.ts` |
| SUMMARY                         | (next)    | `.planning/phases/10-admin-list-pagination/10-07-SUMMARY.md`                                                                                |

## Verification

- `bun run lint` exit 0 (Biome on 366 src files).
- `bun run typecheck` exit 0.
- `bunx biome check --write tests/unit/admin/newsletter-queries.test.ts`
  applied 1 fix (organizeImports moved the local `@/lib/admin/...`
  imports into path-alphabetical order). Lefthook pre-commit hook then
  passed on first attempt.
- `bun test tests/unit/admin/newsletter-queries.test.ts`: 13 pass, 0
  fail, 35 expect() calls.
- `bun run test:unit`: 702 pass, 0 fail across 61 files (up from 689 in
  Plan 10-06 by the 13 new cases).
- `bun run build` exit 0; `/admin/newsletter` route compiled
  successfully alongside the other admin routes. Pre-existing
  `BetterAuthError: You are using the default secret` warnings during
  build are environmental (no `BETTER_AUTH_SECRET` in the worktree env)
  and unrelated to this plan -- documented in 10-02 / 10-03 / 10-04 /
  10-05 / 10-06 SUMMARIES too.
- `grep -nP '[\x{2014}\x{2013}]' src/lib/admin/newsletter-queries.ts
  'src/app/(admin)/admin/newsletter/page.tsx'
  tests/unit/admin/newsletter-queries.test.ts` exit 1 (no em / en dash
  matches).
- Protected-file diff against `origin/main` empty for:
  `src/lib/auth/admin.ts`, `proxy.ts`, all of `src/app/api/`,
  `src/components/admin/StatusFilterBar.tsx`,
  `src/components/admin/PublishToggle.tsx`,
  `src/components/admin/ResourceListPage.tsx`,
  `src/app/(admin)/admin/newsletter/[id]/`.
- `git diff origin/main -- src/lib/admin/newsletter-queries.ts`
  confined to imports + `listSubscribersForAdmin` body + new helper
  types + `cursorPartsFor` helper + `NULL_SENTINEL` constant +
  `EMPTY_RESULT` constant. Every other export byte-equal.

## Deviations from Plan

### [Single atomic commit, not strict TDD-separated] Helper + page + tests in one commit

**Found during:** Task 1 commit decision.

**Issue:** Plan marks Task 1 as `type="auto" tdd="true"` (which would
normally produce a RED commit then GREEN commit) but the plan's
`<success_criteria>` block says "One commit: `feat(10-07): cursor +
search for /admin/newsletter`." These are in tension. Plans 10-02 /
10-03 / 10-04 / 10-05 / 10-06 all resolved the tension by combining;
following the same precedent.

**Fix:** Honored the spirit of "one commit" -- combined the test
addition (RED), helper rewrite (GREEN), and page rewrite (Task 2) into
a single atomic commit. Tests were written before the helper rewrite
locally and observed to fail on the legacy positional `(status, limit)`
signature (9/13 failed on first run, matching the legacy shape that
returned `SubscriberRow[]` instead of the new result object), so the
RED gate was hit even though it did not ship as its own commit.

**Files affected:** None additional; just commit shape.

### [Rule 1 -- Lint auto-fix] Import order + orderBy wrap normalized

**Found during:** First `bun run lint` pass after Task 1.

**Issue:** Biome flagged the test file's `@/lib/...` imports as
out-of-order and the helper's `orderBy` array as needing the per-arg
wrap-and-indent layout (was on one line). Auto-fix applied.

**Fix:** Ran `bun run lint:fix` for the src files and `bunx biome check
--write tests/unit/admin/newsletter-queries.test.ts` for the test file
(test file is outside `bun run lint`'s `src/` scope but inside
Lefthook's). Re-ran the test suite (still 13/13 pass) and lint (exit
0). The behavior of the helper is identical; only the source-line
wrapping and the test file's import grouping changed.

**Files modified:** `src/lib/admin/newsletter-queries.ts`,
`src/app/(admin)/admin/newsletter/page.tsx`,
`tests/unit/admin/newsletter-queries.test.ts`.

## Self-Check: PASSED

Files exist:

- `src/lib/admin/newsletter-queries.ts` (FOUND, modified)
- `src/app/(admin)/admin/newsletter/page.tsx` (FOUND, modified)
- `tests/unit/admin/newsletter-queries.test.ts` (FOUND, created)

Commit exists on branch `admin-list-pagination`:

- `dbcf88f` (FOUND): `feat(10-07): cursor + search for /admin/newsletter`

Verification re-run after final commit: `bun run lint` exit 0, `bun run
typecheck` exit 0, `bun test tests/unit/admin/newsletter-queries.test.ts`
13/13 pass, `bun run test:unit` 702/702 pass, `bun run build` exit 0
(`/admin/newsletter` route compiled), protected-file diff empty, em /
en dash sweep empty.
