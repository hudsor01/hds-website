---
phase: 10-admin-list-pagination
plan: 02
subsystem: admin-list
wave: 2
tags: [pagination, cursor, search, server-component, shadcn]
requires:
  - "list-cursor primitives from Wave 1 (PAGE_SIZE, encodeCursor, decodeCursor, escapeLikePattern, buildPaginationHref)"
  - "SearchInput nuqs component from Wave 1"
  - "shadcn ui/table.tsx + ui/pagination.tsx primitives from Wave 1"
provides:
  - listShowcasesForAdmin (rewritten)
  - ListShowcasesOptions
  - ListShowcasesResult
affects:
  - "/admin/showcase server page (rewritten to consume cursor + search)"
tech_stack:
  added: []
  patterns:
    - "Mixed-direction cursor: row-constructor expansion for (displayOrder ASC, createdAt DESC, id ASC) -- forward = OR(gt(displayOrder), and(eq(displayOrder), lt(createdAt)), and(eq(displayOrder), eq(createdAt), gt(id))); backward flips every comparator"
    - "PAGE_SIZE + 1 trick: read one extra row to detect hasMore without a second COUNT query"
    - "Before-direction reversal: SQL ORDER BY is flipped, then result rows reversed in JS so callers always see display order"
    - "shadcn Table + Pagination composed directly in the page (no project wrapper); preservedParams driven by Record<string, string>"
key_files:
  created:
    - tests/unit/admin/showcase-queries.test.ts
  modified:
    - src/lib/admin/showcase-queries.ts
    - src/app/(admin)/admin/showcase/page.tsx
decisions:
  - "Single atomic commit covering helper + page + tests (per plan success_criteria), instead of strict TDD-separated RED/GREEN commits"
  - "Test factory uses fixed-epoch + idx-days date (not template literal ${10+idx}) so PAGE_SIZE+1 cases never produce invalid Date objects from day-31 overflow"
  - "Chainable db mock re-registered in beforeEach (tests/setup.ts mock.restore() wipes per-file mocks)"
  - "preservedForPagination typed as Record<string, string> (not inferred union) so buildPaginationHref's signature accepts the empty-object branch"
metrics:
  duration_min: 16
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  test_assertions: 29
  test_cases: 10
  completed: 2026-05-27
---

# Phase 10 Plan 02: /admin/showcase cursor + search Summary

Wave-2 conversion of `/admin/showcase` from "list everything" to a
cursor-paginated + searchable list. The helper `listShowcasesForAdmin`
now takes an options object and returns the canonical Wave-2 result
shape; the page consumes Wave-1 primitives directly (no per-page
wrappers) and replaces raw `<table>` markup with shadcn `<Table>`
primitives.

## Diff scope

### `src/lib/admin/showcase-queries.ts`

- Imports extended: `+ and, gt, ilike, lt, or, type SQL` from `drizzle-orm`; `+ PAGE_SIZE, Direction, decodeCursor, encodeCursor, escapeLikePattern` from `@/lib/admin/list-cursor`.
- New type exports: `ListShowcasesOptions = { q?, cursor?, direction? }`, `ListShowcasesResult = { rows, hasMore, prevCursor, nextCursor }`.
- New module-private constants: `EMPTY_RESULT` (safe-default for catch path), `cursorPartsFor(row)` helper for `[displayOrder, createdAt, id]` tuple extraction.
- `listShowcasesForAdmin(opts?)` body fully rewritten per the plan's spec.

Every other export -- `getShowcaseById`, `createShowcase`, `updateShowcase`, `deleteShowcase`, `toggleShowcasePublished`, `computePublishedAtTransition` -- is byte-equal to `origin/main`.

### `src/app/(admin)/admin/showcase/page.tsx`

- Added imports: `SearchInput`, shadcn `Pagination` primitive set, shadcn `Table` primitive set, `buildPaginationHref` from `list-cursor`.
- Page signature: `interface AdminShowcasePageProps { searchParams: Promise<{ q?, cursor? }> }`. Default export now passes `searchParams` to `ShowcaseList`.
- `ShowcaseList` is async, awaits `searchParams`, derives `q` (trimmed), threads `{ q: q.length > 0 ? q : undefined, cursor }` into the helper. `preservedForPagination` is `Record<string, string>` (typed annotation needed because the inferred union breaks `buildPaginationHref`'s signature).
- Raw `<div className="overflow-x-auto ...">` + `<table>` + `<thead>` + `<tbody>` markup replaced with shadcn `<Table>` / `<TableHeader>` / `<TableBody>` / `<TableRow>` / `<TableHead>` / `<TableCell>` / `<TableCaption>`. Per-column `<th>` className stripped (shadcn `<TableHead>` styles); right-aligned columns still pass `className="text-right"`.
- Inline empty-state surfaces `No showcase entries matching <q>` + `Clear search` link when `q` filters to zero rows.
- shadcn `<Pagination>` composed directly per the Wave-1 canonical pattern: `<PaginationPrevious aria-disabled="true" className="pointer-events-none opacity-50" />` for disabled state, `<PaginationPrevious href={buildPaginationHref(...)} />` for active. No project-specific wrapper layer.
- `ResourceListPage`'s centered empty-state fires only when `rows.length === 0 && q.length === 0` so the "no rows AND no active search" state is unambiguous.

### `tests/unit/admin/showcase-queries.test.ts` (new)

10 bun:test cases / 29 expect() assertions:

| Group | Cases |
|---|---|
| page-size + hasMore | 3 |
| DB error safety | 1 |
| search composition | 3 |
| cursor + direction | 3 |

Mock pattern mirrors `tests/unit/showcase.test.ts`: chainable mock that captures the `.where()` argument so we can assert composition shape, and a configurable `.limit()` resolution that stages different row counts per case. The mock is re-registered in `beforeEach` because `tests/setup.ts` runs `mock.restore()` before each test.

## Cursor format (smoke-tested)

`encodeCursor('after', [5, new Date('2026-05-15T12:34:56.789Z'), 'abc-uuid'])`
produces:
```
after:NQ.MjAyNi0wNS0xNVQxMjozNDo1Ni43ODla.YWJjLXV1aWQ
```

Round-trips back to:
```
{ direction: "after", parts: ["5", "2026-05-15T12:34:56.789Z", "abc-uuid"] }
```

`buildPaginationHref('/admin/showcase', cursor, { q: 'foo' })` produces:
```
/admin/showcase?cursor=after%3ANQ.MjAyNi0wNS0xNVQxMjozNDo1Ni43ODla.YWJjLXV1aWQ&q=foo
```

This matches Wave-1's per-part base64url + `.`-separator format and Wave-1's preservedParams URL-encoding contract.

## Commits

| Task | Commit | Files |
|---|---|---|
| 1 + 2: helper + page + tests | `bc27079` | `src/lib/admin/showcase-queries.ts`, `src/app/(admin)/admin/showcase/page.tsx`, `tests/unit/admin/showcase-queries.test.ts` |
| SUMMARY | (next commit) | `.planning/phases/10-admin-list-pagination/10-02-SUMMARY.md` |

## Verification

- `bun run lint` exit 0 (Biome on 366 files).
- `bun run typecheck` exit 0.
- `bun test tests/unit/admin/showcase-queries.test.ts tests/unit/showcase.test.ts`: 20 pass, 0 fail, 58 expect() calls.
- `bun run test:unit`: 644 pass, 0 fail across 56 files.
- `bun run build` exit 0; `/admin/showcase` route compiled successfully. Pre-existing BetterAuth-secret warnings during build are environmental (no `BETTER_AUTH_SECRET` in the worktree) and unrelated to this plan.
- `grep -nP '[\x{2014}\x{2013}]' src/lib/admin/showcase-queries.ts src/app/(admin)/admin/showcase/page.tsx tests/unit/admin/showcase-queries.test.ts` empty (no em / en dashes).
- Protected-file diff against `origin/main` empty for: `src/lib/auth/admin.ts`, `proxy.ts`, all of `src/app/api/`, `src/components/admin/StatusFilterBar.tsx`, `src/components/admin/PublishToggle.tsx`, `src/components/admin/ResourceListPage.tsx`.
- `git diff origin/main -- src/lib/admin/showcase-queries.ts` confined to imports + `listShowcasesForAdmin` body + new helper types + `cursorPartsFor` helper. Every other export byte-equal.

## Deviations from Plan

### [Single atomic commit, not strict TDD-separated] Helper + page + tests in one commit

**Found during:** Task 1 commit decision.

**Issue:** Plan marks Task 1 as `type="auto" tdd="true"` (which would normally produce a RED commit then GREEN commit) but the plan's `<success_criteria>` block says "One commit: `feat(10-02): cursor + search for /admin/showcase`." These are in tension.

**Fix:** Honored the spirit of "one commit" -- combined the test addition (RED), helper rewrite (GREEN), and page rewrite (Task 2) into a single atomic commit. Tests were written before the helper rewrite locally and observed to fail on the legacy shape (8/10 failed on first run), so the RED gate was hit even though it didn't ship as its own commit.

**Files affected:** None additional; just commit shape.

### [Rule 3 - Blocker] Test factory date overflow on PAGE_SIZE+1 cases

**Found during:** Task 1, first GREEN run.

**Issue:** Initial test factory used `new Date(\`2026-05-${String(10 + idx).padStart(2, '0')}T00:00:00.000Z\`)`. For `idx >= 22`, the day field overflows past 31 (e.g. `2026-05-35T00:00:00.000Z`), producing an invalid Date. `encodeCursor` then calls `.toISOString()` on the invalid Date, which throws `RangeError: Invalid Date`, gets caught by the helper's try/catch, and silently returns the empty result. Two tests failed with "Expected 25, Received 0" rows.

**Fix:** Rewrote the test factory to use `new Date(2026, 4, 1 + idx, 12, 0, 0)` -- the JS Date constructor handles month-day overflow by carrying into the next month, so every idx produces a valid Date. Both failing tests then passed.

**Files modified:** `tests/unit/admin/showcase-queries.test.ts`.

### [Rule 3 - Blocker] DB mock must be re-registered per-test

**Found during:** Task 1, initial test run.

**Issue:** `tests/setup.ts` runs `mock.restore()` in its `beforeEach`, which wipes the per-file `mock.module('@/lib/db', ...)` registration. Without re-registration, the second case onward would either crash or fall back to whatever previous mock state survived.

**Fix:** Extracted the `mock.module('@/lib/db', ...)` call into a `setupDbMock()` function and called it both at module-eval time (for the first case) and in this file's `beforeEach` (after the global `mock.restore()` runs).

**Files modified:** `tests/unit/admin/showcase-queries.test.ts`.

### [Rule 3 - Blocker] preservedForPagination type union vs buildPaginationHref signature

**Found during:** Task 2, typecheck.

**Issue:** `const preservedForPagination = q.length > 0 ? { q } : {}` is inferred as `{ q: string } | { q?: undefined }`. The `{ q?: undefined }` branch is not assignable to `Record<string, string>` (the `buildPaginationHref` parameter) because `undefined` is not `string`.

**Fix:** Annotated the variable explicitly: `const preservedForPagination: Record<string, string> = q.length > 0 ? { q } : {}`. Both branches now widen to the same target type and the call typechecks.

**Files modified:** `src/app/(admin)/admin/showcase/page.tsx`.

### [Lint auto-fix] Import order + format

**Found during:** Task 1 + Task 2 lint pass.

**Issue:** Biome flagged `assist/source/organizeImports` and `lint/style/noNonNullAssertion` on the helper; flagged single-line ternary on the page test file. Auto-fix applied to all.

**Fix:** Replaced non-null assertions (`pageRows[i]!`) with truthy guards on locally-bound variables (`const firstRow = pageRows[0]; ... firstRow ? encode(...) : null`). Let `bun run lint:fix` re-organize imports.

**Files modified:** `src/lib/admin/showcase-queries.ts`, `tests/unit/admin/showcase-queries.test.ts`.

## Self-Check: PASSED

Files exist:

- `src/lib/admin/showcase-queries.ts` (FOUND, modified)
- `src/app/(admin)/admin/showcase/page.tsx` (FOUND, modified)
- `tests/unit/admin/showcase-queries.test.ts` (FOUND, created)

Commit exists on branch `admin-list-pagination`:

- `bc27079` (FOUND): `feat(10-02): cursor + search for /admin/showcase`

Verification re-run after final commit: `bun run lint` exit 0, `bun run typecheck` exit 0, `bun test tests/unit/admin/showcase-queries.test.ts tests/unit/showcase.test.ts` 20/20 pass, `bun run test:unit` 644/644 pass, `bun run build` exit 0 (`/admin/showcase` route compiled), protected-file diff empty, em / en dash sweep empty.
