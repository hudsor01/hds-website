---
phase: 10-admin-list-pagination
plan: 06
subsystem: admin-list
wave: 2
tags: [pagination, cursor, search, quality-filter, server-component, shadcn]
requires:
  - "list-cursor primitives from Wave 1 (PAGE_SIZE, encodeCursor, decodeCursor, escapeLikePattern, buildPaginationHref)"
  - "SearchInput nuqs component from Wave 1"
  - "shadcn ui/table.tsx + ui/pagination.tsx primitives from Wave 1"
  - "StatusFilterBar from Phase 05 (byte-equal; URL param stays `status` despite the chip filtering by lead_quality column)"
  - "Plan 10-05 structural pattern (listLeadsForAdmin canonical 2-part cursor + status + q composition shape)"
provides:
  - listCalculatorLeadsForAdmin (rewritten, options-object signature)
  - ListCalculatorLeadsOptions
  - ListCalculatorLeadsResult
affects:
  - "/admin/leads/calculator server page (rewritten to consume cursor + search alongside the existing StatusFilterBar quality chip row)"
tech_stack:
  added: []
  patterns:
    - "2-part cursor: (createdAt DESC, id ASC) -- identical to Plans 10-04 and 10-05. Forward = OR(lt(createdAt), and(eq(createdAt), gt(id))); backward flips both comparators"
    - "Filter composition: quality + q + cursor all assembled into a single conditions[] array and reduced via and(), so each control surface can be active independently or in any combination"
    - "Search over two columns (email + name) via OR of ILIKE predicates -- name is nullable, ILIKE on a NULL column returns NULL (false) so those rows are safely filtered out. email is notNull"
    - "PAGE_SIZE + 1 trick: read one extra row to detect hasMore without a second COUNT query"
    - "Before-direction reversal: SQL ORDER BY flipped to (asc createdAt + desc id), then result rows reversed in JS so callers always see display order"
    - "preservedForPagination typed as Record<string, string> with conditional assignment (if quality / if q); status key carries the quality value because the URL param is `status` by Phase 05 convention"
    - "URL param naming asymmetry: page-level param is `status` (existing user-facing convention from Phase 05) but the helper option key is `quality` (matches the lead_quality DB column). The mapping is one-way at the page boundary; the helper sees only quality"
key_files:
  created:
    - tests/unit/admin/calculator-leads-queries.test.ts
  modified:
    - src/lib/admin/calculator-leads-queries.ts
    - src/app/(admin)/admin/leads/calculator/page.tsx
decisions:
  - "Single atomic commit (helper + page + tests) matching the Plan 10-02 / 10-03 / 10-04 / 10-05 commit shape. Tests were written first and observed to fail against the legacy positional-arg signature (returned `Lead[]` not `ListCalculatorLeadsResult`) before the rewrite landed, so the RED gate was hit even though it did not ship as its own commit"
  - "URL param stays `?status=` per the plan's must_haves.truths #4 -- existing /admin/leads/calculator deep links and StatusFilterBar `<form>` action keep working. The helper option key remains `quality` to match the lead_quality DB column name; mapping happens at the page boundary"
  - "StatusFilterBar JSX byte-equal vs origin/main: same baseHref + current + options + legend props, same position in the JSX tree. Per CONTEXT.md §4, composition of quality + q + cursor is handled by the surrounding helper + Pagination preservedParams; StatusFilterBar's own contract (plain GET, no hidden inputs, drops q + cursor on quality change) is preserved"
  - "SearchInput receives only `placeholder` -- per API ADDENDUM 1 nuqs auto-preserves status and every other query param. No need to pass status through a preservedParams prop on SearchInput"
  - "Inline 'Clear search' link sends the operator back to /admin/leads/calculator?status={current} when a quality filter is also active, so dropping q does not also drop the quality filter. When no quality is active, link goes to /admin/leads/calculator"
  - "Outer wrapper (the `<div className=\"space-y-6\">` with the 'Back to leads' Link + h1 + Suspense) is kept byte-equal vs origin/main -- the calculator-leads page does NOT use ResourceListPage because of the custom secondary-nav header"
  - "Empty-q-result copy uses 'No calculator leads matching {q}.' wording per the plan's action spec; pre-search empty-state copy 'No calculator submissions yet.' kept byte-equal from origin/main"
  - "Chainable db mock re-registered in beforeEach (tests/setup.ts mock.restore() wipes per-file mocks). Pattern lifted byte-for-byte from leads-queries.test.ts; makeRow fixture extended with calculator_leads-specific columns (calculatorType, inputs, results, leadScore, leadQuality, contacted, etc.)"
metrics:
  duration_min: 9
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  test_cases: 12
  test_assertions: 33
  completed: 2026-05-27
---

# Phase 10 Plan 06: /admin/leads/calculator cursor + search Summary

Wave-2 conversion of `/admin/leads/calculator` from "200 newest rows,
optional quality filter" to a cursor-paginated + searchable list. The
existing `<StatusFilterBar>` chip row (keyed to `?status=` per the Phase
05 convention even though the helper key is `quality` and the DB column
is `lead_quality`) stays byte-equal and composes alongside the new nuqs
`<SearchInput>` and shadcn `<Pagination>`. Second Wave-2 plan after
10-05 where the three URL-state surfaces (quality chip, search box,
cursor nav) all coexist on the same page; reuses Plan 10-05's
composition shape verbatim with the two calculator-leads-specific
swaps:

1. Search columns are `(email, name)` not `(name, email, company)`
   (calculator_leads has no `company` column).
2. The URL param key for the StatusFilterBar chip stays `status` (the
   helper key is `quality`).

## Param composition matrix

| Control surface         | Touches `?status=`    | Touches `?q=`         | Touches `?cursor=`    |
|-------------------------|-----------------------|-----------------------|-----------------------|
| StatusFilterBar chip    | sets (or drops on All)| drops                 | drops                 |
| SearchInput (nuqs)      | preserves             | sets / clears         | preserves             |
| Pagination Prev / Next  | preserves             | preserves             | sets                  |

Identical to Plan 10-05's matrix. The asymmetry is deliberate.
StatusFilterBar is the coarsest filter (a quality switch typically
means "give me a fresh view of this slice"), so its plain-GET
submission with no hidden inputs intentionally resets q + cursor.
SearchInput and Pagination are refinements over the current view, so
they round-trip every other param.

## Diff scope

### `src/lib/admin/calculator-leads-queries.ts`

- Imports extended: `+ and, asc, gt, ilike, lt, or, type SQL` (replacing
  the narrow `desc, eq` import); `+ PAGE_SIZE, Direction, decodeCursor,
  encodeCursor, escapeLikePattern` from `@/lib/admin/list-cursor`.
- New type exports: `ListCalculatorLeadsOptions = { quality?, q?,
  cursor?, direction? }`, `ListCalculatorLeadsResult = { rows, hasMore,
  prevCursor, nextCursor }`.
- New module-private constants: `EMPTY_RESULT` (safe-default for catch
  path), `cursorPartsFor(row)` helper for the `[createdAt, id]` tuple.
- `listCalculatorLeadsForAdmin(opts?)` body fully rewritten per the
  plan's spec. The legacy positional-arg `(quality?, limit?)` signature
  is gone -- the new helper composes a `conditions[]` array up front
  and reduces it via `and(...)`. Search ILIKEs over
  `calculatorLeads.email` + `calculatorLeads.name`.

Every other export (`getCalculatorLeadById`,
`markCalculatorLeadContacted`, `markCalculatorLeadConverted`,
`deleteCalculatorLead`, `CALCULATOR_LEAD_QUALITIES`,
`CalculatorLeadQuality`, `CalculatorLeadRow`) byte-equal vs
`origin/main`.

### `src/app/(admin)/admin/leads/calculator/page.tsx`

- Added imports: `SearchInput`, shadcn `Pagination` primitive set,
  shadcn `Table` primitive set, `buildPaginationHref` from
  `list-cursor`.
- Page interface widened to `searchParams: Promise<{ status?, q?,
  cursor? }>`.
- `CalculatorLeadsList` derives `q` (trimmed) alongside the existing
  `quality` parsing (still mapped from `rawStatus` per the Phase 05
  URL convention), calls the new options-object helper, and builds
  `preservedForPagination` with explicit `if (quality) { ... }` /
  `if (q) { ... }` blocks per CLAUDE.md `useBlockStatements: error`.
  `clearSearchHref` is built as a `const` so the JSX does not inline a
  template literal.
- `<StatusFilterBar>` JSX byte-equal (same `baseHref` / `current` /
  `options` / `legend` props, same position in the JSX tree).
- `<SearchInput placeholder="Search calculator leads" />` rendered
  between the chip row and the table/empty-state block.
- Raw `<div className="overflow-x-auto ...">` + `<table>` + `<thead>` +
  `<tbody>` markup replaced with shadcn `<Table>` / `<TableHeader>` /
  `<TableBody>` / `<TableRow>` / `<TableHead>` / `<TableCell>` /
  `<TableCaption>`. Per-column `<th>` className stripped (shadcn
  `<TableHead>` handles padding + alignment).
- Inline empty-state surfaces `No calculator leads matching <q>` +
  `Clear search` link when `q` filters to zero rows; "Clear search"
  preserves `?status=` when set. The pre-search empty state
  `No calculator submissions yet.` is kept byte-equal from
  `origin/main`.
- shadcn `<Pagination>` composed directly per the Wave-1 canonical
  pattern: disabled `PaginationPrevious` / `PaginationNext` use
  `aria-disabled="true" className="pointer-events-none opacity-50"`;
  active uses `href={buildPaginationHref('/admin/leads/calculator',
  cursor, preservedForPagination)}`.
- Outer `<div className="space-y-6">` heading wrapper + 'Back to leads'
  `<Link>` + h1 + `<Suspense>` boundary byte-equal vs `origin/main`.
  `metadata` export and `FILTER_OPTIONS` constant byte-equal too.

### `tests/unit/admin/calculator-leads-queries.test.ts` (new)

12 bun:test cases / 33 expect() assertions:

| Group                              | Cases |
|------------------------------------|-------|
| page-size + hasMore                | 3     |
| DB error safety                    | 1     |
| WHERE composition (quality, q, +)  | 5     |
| cursor + direction                 | 3     |

Mock pattern mirrors `tests/unit/admin/leads-queries.test.ts`:
chainable mock that captures the `.where()` argument so we can assert
composition shape, and a configurable `.limit()` resolution that stages
different row counts per case. The mock is re-registered in
`beforeEach` because `tests/setup.ts` runs `mock.restore()` before each
test. `makeRow` fixture is calculator_leads-shaped (adds
`calculatorType`, `inputs`, `results`, `leadScore`, `leadQuality`,
`contacted`, `converted`, the UTM columns, etc.) so the chainable mock
returns row objects whose `id` + `createdAt` are valid for cursor
encoding.

## Cursor format (smoke-tested via the test suite)

Same as Plans 10-04 / 10-05 -- 2-part `(createdAt, id)` tuple:

```
encodeCursor('after', [new Date('2026-05-15T12:00:00.000Z'), 'row-id'])
```

produces:
```
after:MjAyNi0wNS0xNVQxMjowMDowMC4wMDBa.cm93LWlk
```

`buildPaginationHref('/admin/leads/calculator', cursor, { status:
'hot', q: 'alice' })` produces:
```
/admin/leads/calculator?cursor=after%3A...&status=hot&q=alice
```

Matches Wave-1's per-part base64url + `.`-separator format and
Wave-1's preservedParams URL-encoding contract; URLSearchParams
normalizes param order alphabetically.

## Commits

| Task                                    | Commit    | Files                                                                                                                              |
|-----------------------------------------|-----------|------------------------------------------------------------------------------------------------------------------------------------|
| 1 + 2: helper + page + tests            | `07e5739` | `src/lib/admin/calculator-leads-queries.ts`, `src/app/(admin)/admin/leads/calculator/page.tsx`, `tests/unit/admin/calculator-leads-queries.test.ts` |
| SUMMARY                                 | (next)    | `.planning/phases/10-admin-list-pagination/10-06-SUMMARY.md`                                                                       |

## Verification

- `bun run lint` exit 0 (Biome on 366 src files).
- `bun run typecheck` exit 0.
- `bunx biome check tests/unit/admin/calculator-leads-queries.test.ts`
  exit 0 (Lefthook pre-commit scope, run before first commit per Plans
  10-03 / 10-05 guidance).
- `bun test tests/unit/admin/calculator-leads-queries.test.ts`: 12
  pass, 0 fail, 33 expect() calls.
- `bun run test:unit`: 689 pass, 0 fail across 60 files (up from 677
  in Plan 10-05 by the 12 new cases).
- `bun run build` exit 0; `/admin/leads/calculator`,
  `/admin/leads/calculator/[id]`, `/admin/leads`, `/admin/leads/[id]`
  routes compiled successfully. Pre-existing `BetterAuthError: You are
  using the default secret` warnings during build are environmental
  (no `BETTER_AUTH_SECRET` in the worktree env) and unrelated to this
  plan -- documented in 10-02 / 10-03 / 10-04 / 10-05 SUMMARIES too.
- `grep -nP '[\x{2014}\x{2013}]'
  src/lib/admin/calculator-leads-queries.ts
  src/app/\(admin\)/admin/leads/calculator/page.tsx
  tests/unit/admin/calculator-leads-queries.test.ts` exit 1 (no em /
  en dash matches).
- Protected-file diff against `origin/main` empty for:
  `src/lib/auth/admin.ts`, `proxy.ts`, all of `src/app/api/`,
  `src/components/admin/StatusFilterBar.tsx`,
  `src/components/admin/PublishToggle.tsx`,
  `src/components/admin/ResourceListPage.tsx`,
  `src/app/(admin)/admin/leads/[id]/`,
  `src/app/(admin)/admin/leads/calculator/[id]/`,
  `src/app/(admin)/admin/leads/actions.ts`,
  `src/app/(admin)/admin/leads/calculator/actions.ts`.
- `git diff origin/main -- src/lib/admin/calculator-leads-queries.ts`
  confined to imports + `listCalculatorLeadsForAdmin` body + new
  helper types + `EMPTY_RESULT` + `cursorPartsFor`. Every other export
  byte-equal.

## Deviations from Plan

### [Single atomic commit, not strict TDD-separated] Helper + page + tests in one commit

**Found during:** Task 1 commit decision.

**Issue:** Plan marks Task 1 as `type="auto" tdd="true"` (which would
normally produce a RED commit then GREEN commit) but the plan's
`<success_criteria>` block says "One commit: `feat(10-06): cursor +
search for /admin/leads/calculator`." These are in tension. Plans
10-02, 10-03, 10-04, and 10-05 all resolved the tension by combining;
following the same precedent.

**Fix:** Honored the spirit of "one commit" -- combined the test
addition (RED), helper rewrite (GREEN), and page rewrite (Task 2) into
a single atomic commit. Tests were written before the helper rewrite
locally and run against the legacy positional-arg signature -- 8 of 12
cases failed (TypeError on `result.rows.length` because the legacy
return was `CalculatorLeadRow[]` not `ListCalculatorLeadsResult`), so
the RED gate was hit even though it did not ship as its own commit.

**Files affected:** None additional; just commit shape.

### [Rule 1 -- Biome auto-fix] Inline JSX text-then-`<span>` wrapped to multi-line

**Found during:** First `bun run lint` pass after Task 2.

**Issue:** Biome's formatter flagged the inline empty-state copy `No
calculator leads matching <span className="font-mono">{q}</span>.` --
it preferred wrapping the text + span across two lines with `{' '}`
between them to stay within the line-length budget. Same pattern as
Plan 10-05's auto-fix.

**Fix:** Ran `bun run lint:fix`. Re-ran `bun run lint` -- exit 0. The
rendered output is identical (`{' '}` evaluates to a single space);
only the source-line wrapping changed.

**Files modified:**
`src/app/(admin)/admin/leads/calculator/page.tsx`.

## Self-Check: PASSED

Files exist:

- `src/lib/admin/calculator-leads-queries.ts` (FOUND, modified)
- `src/app/(admin)/admin/leads/calculator/page.tsx` (FOUND, modified)
- `tests/unit/admin/calculator-leads-queries.test.ts` (FOUND, created)

Commit exists on branch `admin-list-pagination`:

- `07e5739` (FOUND): `feat(10-06): cursor + search for
  /admin/leads/calculator`

Verification re-run after final commit: `bun run lint` exit 0, `bun
run typecheck` exit 0, `bun test
tests/unit/admin/calculator-leads-queries.test.ts` 12/12 pass, `bun
run test:unit` 689/689 pass, `bun run build` exit 0
(`/admin/leads/calculator` route compiled), protected-file diff empty,
em / en dash sweep empty.
