---
phase: 10-admin-list-pagination
plan: 05
subsystem: admin-list
wave: 2
tags: [pagination, cursor, search, status-filter, server-component, shadcn]
requires:
  - "list-cursor primitives from Wave 1 (PAGE_SIZE, encodeCursor, decodeCursor, escapeLikePattern, buildPaginationHref)"
  - "SearchInput nuqs component from Wave 1"
  - "shadcn ui/table.tsx + ui/pagination.tsx primitives from Wave 1"
  - "StatusFilterBar from Phase 05 (byte-equal; first Wave-2 plan to compose it alongside SearchInput + Pagination)"
  - "Plan 10-04 structural pattern (listTestimonialsForAdmin canonical 2-part cursor shape)"
provides:
  - listLeadsForAdmin (rewritten)
  - ListLeadsOptions
  - ListLeadsResult
affects:
  - "/admin/leads server page (rewritten to consume cursor + search alongside the existing StatusFilterBar chip row)"
tech_stack:
  added: []
  patterns:
    - "2-part cursor: (createdAt DESC, id ASC) -- identical to Plan 10-04. Forward = OR(lt(createdAt), and(eq(createdAt), gt(id))); backward flips both comparators"
    - "Filter composition: status + q + cursor all assembled into a single conditions[] array and reduced via and(), so each control surface can be active independently or in any combination"
    - "Search over three columns (name + email + company) via OR of ILIKE predicates -- name and company are nullable, ILIKE on a NULL column returns NULL (false) so those rows are safely filtered out"
    - "PAGE_SIZE + 1 trick: read one extra row to detect hasMore without a second COUNT query (inherited from Plan 10-02)"
    - "Before-direction reversal: SQL ORDER BY flipped to (asc createdAt + desc id), then result rows reversed in JS so callers always see display order"
    - "preservedForPagination typed as Record<string, string> with conditional assignment (if status / if q), so empty-filter pages still emit a typed empty object compatible with buildPaginationHref"
    - "Param composition: StatusFilterBar's plain-GET chip submission drops q + cursor on status change by design; nuqs SearchInput auto-preserves all other params including status; Pagination explicitly forwards both status + q when active. This is the first Wave-2 plan where three URL-state surfaces compose"
key_files:
  created:
    - tests/unit/admin/leads-queries.test.ts
  modified:
    - src/lib/admin/leads-queries.ts
    - src/app/(admin)/admin/leads/page.tsx
decisions:
  - "Single atomic commit (helper + page + tests) per plan success_criteria -- matches the Plan 10-02 / 10-03 / 10-04 commit shape. Tests were written first and observed to fail against the legacy positional-arg helper signature before the rewrite landed, so the RED gate was hit even though it did not ship as its own commit"
  - "StatusFilterBar stays byte-equal -- the plan's must_haves.truths #5 mandates this. Composition of status + q + cursor is handled by the surrounding helper and Pagination preservedParams; StatusFilterBar's own contract (plain GET, single-button submit, no hidden inputs) is preserved"
  - "SearchInput receives only `placeholder` -- per API ADDENDUM 1 nuqs auto-preserves status (and every other query param). No need to pass status through a preservedParams prop on SearchInput"
  - "Pagination's preservedForPagination forwards BOTH status and q when each is non-empty -- so Prev/Next clicks round-trip the full filter context"
  - "Inline 'Clear search' link sends the operator back to /admin/leads?status={current} when a status filter is also active, so dropping q does not also drop status. When no status is active, link goes to /admin/leads"
  - "Outer wrapper (the `<div className=\"space-y-6\">` with the heading + Calculator-leads Link + Suspense) is kept byte-equal vs origin/main -- the leads page does NOT use ResourceListPage because of the custom right-aligned secondary nav button"
  - "Chainable db mock re-registered in beforeEach (tests/setup.ts mock.restore() wipes per-file mocks). Pattern lifted byte-for-byte from testimonials-queries.test.ts"
metrics:
  duration_min: 12
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  test_cases: 12
  test_assertions: 33
  completed: 2026-05-27
---

# Phase 10 Plan 05: /admin/leads cursor + search Summary

Wave-2 conversion of `/admin/leads` from "200 newest rows, optional status
filter" to a cursor-paginated + searchable list. The existing
`<StatusFilterBar>` chip row stays byte-equal and composes alongside the
new nuqs `<SearchInput>` and shadcn `<Pagination>`. This is the first
Wave-2 plan where three URL-state surfaces (status chip, search box, cursor
nav) all coexist on the same page; the helper's `conditions[]` array +
`and(...)` composition keeps the SQL clean regardless of which subset of
filters is active.

## Param composition matrix

| Control surface         | Touches `?status=`    | Touches `?q=`         | Touches `?cursor=`    |
|-------------------------|-----------------------|-----------------------|-----------------------|
| StatusFilterBar chip    | sets (or drops on All)| drops                 | drops                 |
| SearchInput (nuqs)      | preserves             | sets / clears         | preserves             |
| Pagination Prev / Next  | preserves             | preserves             | sets                  |

The asymmetry is deliberate. StatusFilterBar is the coarsest filter (a
status switch typically means "give me a fresh view of this slice"), so
its plain-GET submission with no hidden inputs intentionally resets q +
cursor. SearchInput and Pagination are refinements over the current view,
so they round-trip every other param.

## Diff scope

### `src/lib/admin/leads-queries.ts`

- Imports extended: `+ and, asc, gt, ilike, lt, or, type SQL` (replacing
  the narrow `desc, eq` import); `+ PAGE_SIZE, Direction, decodeCursor,
  encodeCursor, escapeLikePattern` from `@/lib/admin/list-cursor`.
- New type exports: `ListLeadsOptions = { status?, q?, cursor?, direction? }`,
  `ListLeadsResult = { rows, hasMore, prevCursor, nextCursor }`.
- New module-private constants: `EMPTY_RESULT` (safe-default for catch
  path), `cursorPartsFor(row)` helper for the `[createdAt, id]` tuple.
- `listLeadsForAdmin(opts?)` body fully rewritten per the plan's spec.
  The legacy `$dynamic()` builder is gone -- the new helper composes a
  `conditions[]` array up front and reduces it via `and(...)`.

Every other export (`getLeadById`, `updateLeadStatus`, `addLeadNote`,
`deleteLead`, `deleteLeadNote`) byte-equal vs `origin/main`.

### `src/app/(admin)/admin/leads/page.tsx`

- Added imports: `SearchInput`, shadcn `Pagination` primitive set, shadcn
  `Table` primitive set, `buildPaginationHref` from `list-cursor`.
- Page interface widened to `searchParams: Promise<{ status?, q?, cursor? }>`.
- `LeadsList` now derives `q` (trimmed) alongside the existing `status`
  parsing, calls the new options-object helper, and builds
  `preservedForPagination` with explicit `if (status) { ... }` / `if (q) {
  ... }` blocks per CLAUDE.md `useBlockStatements: error`.
- `<StatusFilterBar>` JSX byte-equal (same `baseHref` / `current` /
  `options` props, same position in the JSX tree).
- `<SearchInput placeholder="Search leads" />` rendered between the chip
  row and the table/empty-state block.
- Raw `<div className="overflow-x-auto ...">` + `<table>` + `<thead>` +
  `<tbody>` markup replaced with shadcn `<Table>` / `<TableHeader>` /
  `<TableBody>` / `<TableRow>` / `<TableHead>` / `<TableCell>` /
  `<TableCaption>`. Per-column `<th>` className stripped (shadcn
  `<TableHead>` handles padding + alignment).
- Inline empty-state surfaces `No leads matching <q>` + `Clear search`
  link when `q` filters to zero rows; "Clear search" preserves `status`
  when set.
- shadcn `<Pagination>` composed directly per the Wave-1 canonical
  pattern: disabled `PaginationPrevious` / `PaginationNext` use
  `aria-disabled="true" className="pointer-events-none opacity-50"`;
  active uses `href={buildPaginationHref('/admin/leads', cursor,
  preservedForPagination)}`.
- Outer `<div className="space-y-6">` heading wrapper + `Calculator
  leads` secondary nav `<Link>` + `<Suspense>` boundary byte-equal vs
  `origin/main`. `metadata` export and `FILTER_OPTIONS` constant
  byte-equal too.

### `tests/unit/admin/leads-queries.test.ts` (new)

12 bun:test cases / 33 expect() assertions:

| Group                            | Cases |
|----------------------------------|-------|
| page-size + hasMore              | 3     |
| DB error safety                  | 1     |
| WHERE composition (status, q, +) | 5     |
| cursor + direction               | 3     |

Mock pattern mirrors `tests/unit/admin/testimonials-queries.test.ts`:
chainable mock that captures the `.where()` argument so we can assert
composition shape, and a configurable `.limit()` resolution that stages
different row counts per case. The mock is re-registered in `beforeEach`
because `tests/setup.ts` runs `mock.restore()` before each test. The
extra two cases over Plan 10-04 cover the new `status` and `status + q`
composition paths.

## Cursor format (smoke-tested via the test suite)

Same as Plan 10-04 -- 2-part `(createdAt, id)` tuple:

```
encodeCursor('after', [new Date('2026-05-15T12:00:00.000Z'), 'row-id'])
```

produces:
```
after:MjAyNi0wNS0xNVQxMjowMDowMC4wMDBa.cm93LWlk
```

`buildPaginationHref('/admin/leads', cursor, { status: 'qualified', q:
'acme' })` produces:
```
/admin/leads?cursor=after%3A...&status=qualified&q=acme
```

Matches Wave-1's per-part base64url + `.`-separator format and Wave-1's
preservedParams URL-encoding contract; URLSearchParams normalizes param
order alphabetically.

## Commits

| Task                                    | Commit    | Files                                                                                                          |
|-----------------------------------------|-----------|----------------------------------------------------------------------------------------------------------------|
| 1 + 2: helper + page + tests            | `e2818c3` | `src/lib/admin/leads-queries.ts`, `src/app/(admin)/admin/leads/page.tsx`, `tests/unit/admin/leads-queries.test.ts` |
| SUMMARY                                 | (next)    | `.planning/phases/10-admin-list-pagination/10-05-SUMMARY.md`                                                   |

## Verification

- `bun run lint` exit 0 (Biome on 366 src files).
- `bun run typecheck` exit 0.
- `bunx biome check tests/unit/admin/leads-queries.test.ts` exit 0
  (Lefthook pre-commit scope, run before first commit per Plan 10-03
  guidance).
- `bun test tests/unit/admin/leads-queries.test.ts`: 12 pass, 0 fail,
  33 expect() calls.
- `bun run test:unit`: 677 pass, 0 fail across 59 files (up from 665 in
  Plan 10-04 by the 12 new cases).
- `bun run build` exit 0; `/admin/leads`, `/admin/leads/[id]`,
  `/admin/leads/calculator`, `/admin/leads/calculator/[id]` routes
  compiled successfully. Pre-existing `BetterAuthError: You are using the
  default secret` warnings during build are environmental (no
  `BETTER_AUTH_SECRET` in the worktree env) and unrelated to this plan --
  documented in 10-02 / 10-03 / 10-04 SUMMARIES too.
- `grep -nP '[\x{2014}\x{2013}]' src/lib/admin/leads-queries.ts
  src/app/(admin)/admin/leads/page.tsx
  tests/unit/admin/leads-queries.test.ts` exit 1 (no em / en dash
  matches).
- Protected-file diff against `origin/main` empty for: `src/lib/auth/admin.ts`,
  `proxy.ts`, all of `src/app/api/`, `src/components/admin/StatusFilterBar.tsx`,
  `src/components/admin/PublishToggle.tsx`,
  `src/components/admin/ResourceListPage.tsx`,
  `src/app/(admin)/admin/leads/[id]/`,
  `src/app/(admin)/admin/leads/actions.ts`.
- `git diff origin/main -- src/lib/admin/leads-queries.ts` confined to
  imports + `listLeadsForAdmin` body + new helper types + `cursorPartsFor`
  helper. Every other export byte-equal.

## Deviations from Plan

### [Single atomic commit, not strict TDD-separated] Helper + page + tests in one commit

**Found during:** Task 1 commit decision.

**Issue:** Plan marks Task 1 as `type="auto" tdd="true"` (which would
normally produce a RED commit then GREEN commit) but the plan's
`<success_criteria>` block says "One commit: `feat(10-05): cursor + search
for /admin/leads`." These are in tension. Plans 10-02, 10-03, and 10-04
all resolved the tension by combining; following the same precedent.

**Fix:** Honored the spirit of "one commit" -- combined the test addition
(RED), helper rewrite (GREEN), and page rewrite (Task 2) into a single
atomic commit. Tests were written before the helper rewrite locally and
observed to fail on the legacy positional-arg signature returning
`Lead[]` instead of the new result object, so the RED gate was hit even
though it did not ship as its own commit.

**Files affected:** None additional; just commit shape.

### [Rule 1 -- Lint auto-fix] Inner and(...) collapsed to one line

**Found during:** First `bun run lint` pass after Task 2.

**Issue:** Biome's formatter flagged the multi-line inner
`and(eq(leads.createdAt, createdAtValue), gt(leads.id, idValue))` blocks
inside the cursor-clause ternary -- it preferred single-line layout to
stay within the line-length budget. Auto-fix applied.

**Fix:** Ran `bun run lint:fix`. Re-ran `bun run lint` -- exit 0. The
behavior of the cursor predicate is identical; only the source-line
wrapping changed.

**Files modified:** `src/lib/admin/leads-queries.ts`,
`src/app/(admin)/admin/leads/page.tsx` (the page file also got a minor
import-sort tweak from the same pass).

## Self-Check: PASSED

Files exist:

- `src/lib/admin/leads-queries.ts` (FOUND, modified)
- `src/app/(admin)/admin/leads/page.tsx` (FOUND, modified)
- `tests/unit/admin/leads-queries.test.ts` (FOUND, created)

Commit exists on branch `admin-list-pagination`:

- `e2818c3` (FOUND): `feat(10-05): cursor + search for /admin/leads`

Verification re-run after final commit: `bun run lint` exit 0, `bun run
typecheck` exit 0, `bun test tests/unit/admin/leads-queries.test.ts`
12/12 pass, `bun run test:unit` 677/677 pass, `bun run build` exit 0
(`/admin/leads` route compiled), protected-file diff empty, em / en dash
sweep empty.
