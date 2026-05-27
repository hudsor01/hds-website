---
phase: 10-admin-list-pagination
plan: 04
subsystem: admin-list
wave: 2
tags: [pagination, cursor, search, server-component, shadcn]
requires:
  - "list-cursor primitives from Wave 1 (PAGE_SIZE, encodeCursor, decodeCursor, escapeLikePattern, buildPaginationHref)"
  - "SearchInput nuqs component from Wave 1"
  - "shadcn ui/table.tsx + ui/pagination.tsx primitives from Wave 1"
  - "Plan 10-02 structural pattern (listShowcasesForAdmin canonical shape)"
provides:
  - listTestimonialsForAdmin (rewritten)
  - ListTestimonialsOptions
  - ListTestimonialsResult
affects:
  - "/admin/testimonials server page (rewritten to consume cursor + search)"
tech_stack:
  added: []
  patterns:
    - "2-part cursor: (createdAt DESC, id ASC) -- simpler than 10-02's 3-part / 10-03's NULLS-LAST four-state. Forward = OR(lt(createdAt), and(eq(createdAt), gt(id))); backward flips both comparators"
    - "PAGE_SIZE + 1 trick: read one extra row to detect hasMore without a second COUNT query (inherited from Plan 10-02)"
    - "Before-direction reversal: SQL ORDER BY flipped to (asc createdAt + desc id), then result rows reversed in JS so callers always see display order (inherited from Plan 10-02)"
    - "Search over three columns (name + company + content) via OR of ILIKE predicates -- company is nullable, ILIKE on nullable column safely returns NULL (false) for null rows"
    - "shadcn Table + Pagination composed directly in the page; preservedParams = `{ q }` typed as Record<string, string>"
key_files:
  created:
    - tests/unit/admin/testimonials-queries.test.ts
  modified:
    - src/lib/admin/testimonials-queries.ts
    - src/app/(admin)/admin/testimonials/page.tsx
decisions:
  - "Single atomic commit (helper + page + tests) per plan success_criteria, matching the Plan 10-02 / 10-03 commit shape"
  - "2-part cursor tuple (no displayOrder, no publishedAt) -- testimonials has neither, so the simplest possible cursor format applies. Matches the plan's `<interfaces>` spec verbatim"
  - "Chainable db mock re-registered in beforeEach (tests/setup.ts mock.restore() wipes per-file mocks). Pattern lifted byte-for-byte from showcase-queries.test.ts"
  - "preservedForPagination typed as Record<string, string> (not inferred union) so buildPaginationHref's signature accepts the empty-object branch -- same fix Plan 10-02 applied"
metrics:
  duration_min: 14
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  test_assertions: 29
  test_cases: 10
  completed: 2026-05-27
---

# Phase 10 Plan 04: /admin/testimonials cursor + search Summary

Wave-2 conversion of `/admin/testimonials` from "list everything sorted by
createdAt DESC" to a cursor-paginated + searchable list. The helper
`listTestimonialsForAdmin` now takes an options object and returns the
canonical Wave-2 result shape; the page consumes Wave-1 primitives
directly (no per-page wrappers) and replaces raw `<table>` markup with
shadcn `<Table>` primitives. This is the simplest of the three Wave-2
conversions: testimonials has neither `displayOrder` (showcase) nor a
nullable `publishedAt` (blog), so the cursor tuple stays at the minimum
2 parts `(createdAt, id)`.

## Diff scope

### `src/lib/admin/testimonials-queries.ts`

- Imports extended: `+ and, asc, gt, ilike, lt, or, type SQL` from
  `drizzle-orm`; `+ PAGE_SIZE, Direction, decodeCursor, encodeCursor,
  escapeLikePattern` from `@/lib/admin/list-cursor`.
- New type exports: `ListTestimonialsOptions = { q?, cursor?, direction? }`,
  `ListTestimonialsResult = { rows, hasMore, prevCursor, nextCursor }`.
- New module-private constants: `EMPTY_RESULT` (safe-default for catch path),
  `cursorPartsFor(row)` helper for `[createdAt, id]` tuple extraction.
- `listTestimonialsForAdmin(opts?)` body fully rewritten per the plan's spec.

Every other export -- `getTestimonialById`, `createTestimonial`,
`updateTestimonial`, `deleteTestimonial` re-export from `@/lib/testimonials`,
`toggleTestimonialPublished` -- is byte-equal to `origin/main`.

### `src/app/(admin)/admin/testimonials/page.tsx`

- Added imports: `SearchInput`, shadcn `Pagination` primitive set, shadcn
  `Table` primitive set, `buildPaginationHref` from `list-cursor`.
- Page signature: `interface AdminTestimonialsPageProps { searchParams:
  Promise<{ q?, cursor? }> }`. Default export now passes `searchParams` to
  `TestimonialsList`.
- `TestimonialsList` is async, awaits `searchParams`, derives `q` (trimmed),
  threads `{ q: q.length > 0 ? q : undefined, cursor }` into the helper.
  `preservedForPagination` is `Record<string, string>` (typed annotation
  needed because the inferred union `{ q: string } | { q?: undefined }`
  breaks `buildPaginationHref`'s signature).
- Raw `<div className="overflow-x-auto ...">` + `<table>` + `<thead>` +
  `<tbody>` markup replaced with shadcn `<Table>` / `<TableHeader>` /
  `<TableBody>` / `<TableRow>` / `<TableHead>` / `<TableCell>` /
  `<TableCaption>`. Per-column `<th>` className stripped (shadcn
  `<TableHead>` styles); right-aligned actions column still passes
  `className="text-right"`.
- Inline empty-state surfaces `No testimonials matching <q>` + `Clear search`
  link when `q` filters to zero rows.
- shadcn `<Pagination>` composed directly per the Wave-1 canonical pattern:
  disabled `PaginationPrevious`/`PaginationNext` use `aria-disabled="true"
  className="pointer-events-none opacity-50"`; active uses
  `href={buildPaginationHref(...)}`.
- `ResourceListPage`'s centered empty-state fires only when `rows.length ===
  0 && q.length === 0` so "no rows AND no active search" is unambiguous.
- `metadata` export and `dateFormatter` declaration byte-equal vs
  `origin/main`; `<Suspense>` fallback string byte-equal; `PublishToggle` +
  Edit Link markup inside each row byte-equal.

### `tests/unit/admin/testimonials-queries.test.ts` (new)

10 bun:test cases / 29 expect() assertions:

| Group | Cases |
|---|---|
| page-size + hasMore | 3 |
| DB error safety | 1 |
| search composition | 3 |
| cursor + direction | 3 |

Mock pattern mirrors `tests/unit/admin/showcase-queries.test.ts`: chainable
mock that captures the `.where()` argument so we can assert composition
shape, and a configurable `.limit()` resolution that stages different row
counts per case. The mock is re-registered in `beforeEach` because
`tests/setup.ts` runs `mock.restore()` before each test.

## Cursor format (smoke-tested)

```
encodeCursor('after', [new Date('2026-05-15T12:00:00.000Z'), 'row-id'])
```

produces:
```
after:MjAyNi0wNS0xNVQxMjowMDowMC4wMDBa.cm93LWlk
```

Round-trips back to:
```
{ direction: "after", parts: ["2026-05-15T12:00:00.000Z", "row-id"] }
```

`buildPaginationHref('/admin/testimonials', cursor, { q: 'acme' })` produces:
```
/admin/testimonials?cursor=after%3AMjAyNi0wNS0xNVQxMjowMDowMC4wMDBa.cm93LWlk&q=acme
```

This matches Wave-1's per-part base64url + `.`-separator format and Wave-1's
preservedParams URL-encoding contract.

## Commits

| Task | Commit | Files |
|---|---|---|
| 1 + 2: helper + page + tests | `5c70f51` | `src/lib/admin/testimonials-queries.ts`, `src/app/(admin)/admin/testimonials/page.tsx`, `tests/unit/admin/testimonials-queries.test.ts` |
| SUMMARY | (next commit) | `.planning/phases/10-admin-list-pagination/10-04-SUMMARY.md` |

## Verification

- `bun run lint` exit 0 (Biome on 366 src files).
- `bun run typecheck` exit 0.
- `bunx biome check tests/unit/admin/testimonials-queries.test.ts` exit 0
  (Lefthook pre-commit scope, run before first commit per Plan 10-03
  guidance).
- `bun test tests/unit/admin/testimonials-queries.test.ts`: 10 pass, 0 fail,
  29 expect() calls.
- `bun run test:unit`: 665 pass, 0 fail across 58 files (up from 655 in
  Plan 10-03 by the 10 new cases).
- `bun run build` exit 0; `/admin/testimonials`, `/admin/testimonials/new`,
  `/admin/testimonials/[id]/edit` routes compiled successfully. Pre-existing
  `BetterAuthError: You are using the default secret` warnings during build
  are environmental (no `BETTER_AUTH_SECRET` in the worktree env) and
  unrelated to this plan -- documented in 10-02 and 10-03 SUMMARIES too.
- `grep -nP '[\x{2014}\x{2013}]' src/lib/admin/testimonials-queries.ts
  src/app/(admin)/admin/testimonials/page.tsx
  tests/unit/admin/testimonials-queries.test.ts` exit 1 (no em / en dash
  matches).
- Protected-file diff against `origin/main` empty for: `src/lib/auth/admin.ts`,
  `proxy.ts`, all of `src/app/api/`, `src/components/admin/StatusFilterBar.tsx`,
  `src/components/admin/PublishToggle.tsx`,
  `src/components/admin/ResourceListPage.tsx`,
  `src/app/(admin)/admin/testimonials/[id]/`,
  `src/app/(admin)/admin/testimonials/actions.ts`.
- `git diff origin/main -- src/lib/admin/testimonials-queries.ts` confined
  to imports + `listTestimonialsForAdmin` body + new helper types +
  `cursorPartsFor` helper. Every other export byte-equal.

## Deviations from Plan

### [Single atomic commit, not strict TDD-separated] Helper + page + tests in one commit

**Found during:** Task 1 commit decision.

**Issue:** Plan marks Task 1 as `type="auto" tdd="true"` (which would normally
produce a RED commit then GREEN commit) but the plan's `<success_criteria>`
block says "One commit: `feat(10-04): cursor + search for /admin/testimonials`."
These are in tension. Plans 10-02 and 10-03 resolved the tension by combining;
following the same precedent.

**Fix:** Honored the spirit of "one commit" -- combined the test addition (RED),
helper rewrite (GREEN), and page rewrite (Task 2) into a single atomic commit.
Tests were written before the helper rewrite locally and observed to fail on
the legacy shape (8/10 failed on first run, matching the legacy zero-arg
signature returning `TestimonialRow[]` instead of the new result object), so
the RED gate was hit even though it did not ship as its own commit.

**Files affected:** None additional; just commit shape.

### [Lint auto-fix] JSX line-wrap on ternary

**Found during:** Task 2 lint pass.

**Issue:** Biome's formatter flagged the single-line ternary
`{r.createdAt ? dateFormatter.format(r.createdAt) : 'Unknown'}` inside a
narrow `<TableCell>` -- it preferred a multi-line layout to stay within the
line-length budget. Auto-fix applied.

**Fix:** Ran `bun run lint:fix`. Re-ran `bun run lint` -- exit 0.

**Files modified:** `src/app/(admin)/admin/testimonials/page.tsx`.

## Self-Check: PASSED

Files exist:

- `src/lib/admin/testimonials-queries.ts` (FOUND, modified)
- `src/app/(admin)/admin/testimonials/page.tsx` (FOUND, modified)
- `tests/unit/admin/testimonials-queries.test.ts` (FOUND, created)

Commit exists on branch `admin-list-pagination`:

- `5c70f51` (FOUND): `feat(10-04): cursor + search for /admin/testimonials`

Verification re-run after final commit: `bun run lint` exit 0, `bun run
typecheck` exit 0, `bun test tests/unit/admin/testimonials-queries.test.ts`
10/10 pass, `bun run test:unit` 665/665 pass, `bun run build` exit 0
(`/admin/testimonials` route compiled), protected-file diff empty, em / en
dash sweep empty.
