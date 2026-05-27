---
phase: 10-admin-list-pagination
plan: 08
subsystem: admin-list
wave: 2
tags: [pagination, cursor, search, status-filter, server-component, shadcn]
requires:
  - "list-cursor primitives from Wave 1 (PAGE_SIZE, encodeCursor, decodeCursor, escapeLikePattern, buildPaginationHref)"
  - "SearchInput nuqs component from Wave 1"
  - "shadcn ui/table.tsx + ui/pagination.tsx primitives from Wave 1"
  - "StatusFilterBar from Phase 05 (byte-equal; chip row stays unchanged)"
  - "Plan 10-05 / 10-07 structural pattern (canonical 2-part cursor + stat-card-aware page shape)"
provides:
  - listScheduledEmailsForAdmin (rewritten)
  - ListScheduledEmailsOptions
  - ListScheduledEmailsResult
affects:
  - "/admin/emails server page (rewritten to consume cursor + search alongside the existing StatusFilterBar chip row; stat cards stay UNFILTERED)"
tech_stack:
  added: []
  patterns:
    - "2-part cursor: (scheduledFor DESC, id ASC) -- identical to Plan 10-04 / 10-05. scheduledFor is .notNull() in the schema so NO NULLS-LAST sentinel is needed"
    - "Filter composition: status + q + cursor all assembled into a single conditions[] array and reduced via and(), so each control surface can be active independently or in any combination"
    - "Search over three columns (recipientEmail + recipientName + stepId) via OR of ILIKE predicates -- recipientName is nullable, ILIKE on a NULL column returns NULL (false) so those rows are safely filtered out"
    - "PAGE_SIZE + 1 trick: read one extra row to detect hasMore without a second COUNT query"
    - "Before-direction reversal: SQL ORDER BY flipped to (asc scheduledFor + desc id), then result rows reversed in JS so callers always see display order"
    - "preservedForPagination typed as Record<string, string> with conditional assignment (if status / if q), so empty-filter pages still emit a typed empty object compatible with buildPaginationHref"
    - "UNFILTERED stat cards: getQueueCounts() is called with NO arguments inside Promise.all alongside listScheduledEmailsForAdmin({ status, q, cursor }) so the 4-card grid above the StatusFilterBar always reflects full queue health regardless of which filter / page is active"
key_files:
  created:
    - tests/unit/admin/emails-queries.test.ts
  modified:
    - src/lib/admin/emails-queries.ts
    - src/app/(admin)/admin/emails/page.tsx
decisions:
  - "Single atomic commit (helper + page + tests) per plan success_criteria -- matches the Plan 10-02 through 10-07 commit shape. Tests were written first and observed to fail against the legacy positional-arg helper signature before the rewrite landed, so the RED gate was hit (10 failures observed) even though it did not ship as its own commit"
  - "StatusFilterBar stays byte-equal -- the plan's must_haves.truths #5 mandates this. Composition of status + q + cursor is handled by the surrounding helper and Pagination preservedParams; StatusFilterBar's own contract (plain GET, single-button submit, no hidden inputs) is preserved"
  - "SearchInput receives only `placeholder` -- per API ADDENDUM 1 nuqs auto-preserves status (and every other query param). No need to pass status through a preservedParams prop on SearchInput"
  - "Pagination's preservedForPagination forwards BOTH status and q when each is non-empty -- so Prev/Next clicks round-trip the full filter context (with status when it is the active chip)"
  - "Inline 'Clear search' link sends the operator back to /admin/emails?status={current} when a status filter is also active, so dropping q does not also drop status. When no status is active, link goes to /admin/emails"
  - "getQueueCounts() is byte-equal AND is called with NO arguments inside Promise.all. This keeps the 4 stat cards (pending / sent / failed / cancelled) reflecting the FULL queue regardless of the active status chip, the current ?q= search, or the current ?cursor= page. Operator always sees queue health at a glance, not just the slice currently rendered in the table"
  - "Outer wrapper (the `<div className=\"space-y-6\">` with the heading + Suspense) is kept byte-equal vs origin/main. The emails page does NOT use ResourceListPage (no New button, no secondary nav)"
  - "Chainable db mock re-registered in beforeEach (tests/setup.ts mock.restore() wipes per-file mocks). Pattern lifted byte-for-byte from leads-queries.test.ts / newsletter-queries.test.ts"
  - "Extra test case asserts `typeof getQueueCounts === 'function'` AND `getQueueCounts.length === 0` so any future refactor that accidentally widens its signature would trip the test before the page silently starts passing a status arg into it"
metrics:
  duration_min: 9
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  test_cases: 13
  test_assertions: 35
  completed: 2026-05-27
---

# Phase 10 Plan 08: /admin/emails cursor + search Summary

Wave-2 conversion of `/admin/emails` from "100 newest rows, optional
status filter" to a cursor-paginated + searchable list. The existing
`<StatusFilterBar>` chip row stays byte-equal and composes alongside the
new nuqs `<SearchInput>` and shadcn `<Pagination>`. **The 4 queue-health
stat cards stay UNFILTERED** -- `getQueueCounts()` is called with NO
arguments inside `Promise.all` alongside the paginated list helper, so
the cards always reflect the FULL queue state regardless of the active
`?status=` / `?q=` / `?cursor=` params. Last list page in Wave 2.

## Param composition matrix

| Control surface         | Touches `?status=`    | Touches `?q=`         | Touches `?cursor=`    |
|-------------------------|-----------------------|-----------------------|-----------------------|
| Stat cards (4-card grid)| n/a (UNFILTERED)      | n/a (UNFILTERED)      | n/a (UNFILTERED)      |
| StatusFilterBar chip    | sets (or drops on All)| drops                 | drops                 |
| SearchInput (nuqs)      | preserves             | sets / clears         | preserves             |
| Pagination Prev / Next  | preserves             | preserves             | sets                  |

The stat cards' UNFILTERED row at the top is the key per-page wrinkle
versus Plan 10-05 / 10-06 / 10-07. The operator can drill into "show me
all failed emails matching `acme`" via the chip row + search box and the
stat-card grid above still answers "what is the total queue health right
now?" -- which is the question that matters at 3 a.m. when something is
on fire. The other Wave-2 pages do not have this duality because their
top-of-page summary collapses naturally to the filtered slice.

## getQueueCounts: byte-equal sanity

The plan mandates `getQueueCounts()` remain byte-equal AND that the page
call it without arguments. Both are confirmed:

- `git diff origin/main -- src/lib/admin/emails-queries.ts` shows zero
  changes inside the `getQueueCounts()` body, signature, or doc comment.
- The page calls `getQueueCounts()` (no args) inside `Promise.all`.
- An extra test case asserts `typeof getQueueCounts === 'function'` and
  `getQueueCounts.length === 0`. Any future refactor that accidentally
  widens the signature (e.g. starts threading a status filter into the
  counts query) would trip the test BEFORE the page silently starts
  showing filtered counts.

## Diff scope

### `src/lib/admin/emails-queries.ts`

- Imports extended: `+ and, asc, gt, ilike, lt, or, type SQL` (alongside
  the existing `count, desc, eq` -- `count` stays because
  `getQueueCounts` still uses it); `+ PAGE_SIZE, Direction,
  decodeCursor, encodeCursor, escapeLikePattern` from
  `@/lib/admin/list-cursor`.
- New type exports: `ListScheduledEmailsOptions = { status?, q?,
  cursor?, direction? }`, `ListScheduledEmailsResult = { rows, hasMore,
  prevCursor, nextCursor }`.
- New module-private constants: `EMPTY_RESULT` (safe-default for catch
  path), `cursorPartsFor(row)` helper for the `[scheduledFor, id]`
  tuple.
- `listScheduledEmailsForAdmin(opts?)` body fully rewritten per the
  plan's spec. The legacy `$dynamic()` builder is gone -- the new helper
  composes a `conditions[]` array up front and reduces it via
  `and(...)`.

Every other export (`getQueueCounts`, `getScheduledEmailById`,
`retryScheduledEmail`, `cancelScheduledEmail`, `deleteScheduledEmail`,
`EMAIL_STATUSES`, `QueueCounts`, `RetryResult`, `EmailStatus`)
byte-equal vs `origin/main`.

### `src/app/(admin)/admin/emails/page.tsx`

- Added imports: `SearchInput`, shadcn `Pagination` primitive set,
  shadcn `Table` primitive set, `buildPaginationHref` from
  `list-cursor`.
- Page interface widened to `searchParams: Promise<{ status?, q?,
  cursor? }>`.
- `EmailsList` now derives `q` (trimmed) alongside the existing `status`
  parsing, calls the new options-object helper, and builds
  `preservedForPagination` with explicit `if (status) { ... }` / `if (q)
  { ... }` blocks per CLAUDE.md `useBlockStatements: error`.
- `Promise.all` left-side stays `getQueueCounts()` with NO arguments --
  stat cards UNFILTERED.
- 4-card stat grid JSX byte-equal (same `EMAIL_STATUSES.map`, same
  `counts[s].toLocaleString('en-US')`, same outer
  `grid grid-cols-2 md:grid-cols-4 gap-4` layout).
- `<StatusFilterBar>` JSX byte-equal (same `baseHref` / `current` /
  `options` props, same position in the JSX tree -- between stat cards
  and SearchInput).
- `<SearchInput placeholder="Search emails" />` rendered between the
  chip row and the table / empty-state block.
- Raw `<div className="overflow-x-auto ...">` + `<table>` + `<thead>` +
  `<tbody>` markup replaced with shadcn `<Table>` / `<TableHeader>` /
  `<TableBody>` / `<TableRow>` / `<TableHead>` / `<TableCell>` /
  `<TableCaption>`. Per-column `<th>` className stripped (shadcn
  `<TableHead>` handles padding + alignment). `text-right` className
  kept on the Retries header + cell.
- Inline empty-state surfaces `No emails matching <q>` + `Clear search`
  link when `q` filters to zero rows; "Clear search" preserves `status`
  when set. When `q` is empty, the original "No scheduled emails." copy
  is preserved byte-equal.
- shadcn `<Pagination>` composed directly per the Wave-1 canonical
  pattern: disabled `PaginationPrevious` / `PaginationNext` use
  `aria-disabled="true" className="pointer-events-none opacity-50"`;
  active uses `href={buildPaginationHref('/admin/emails', cursor,
  preservedForPagination)}`.
- Outer `<div className="space-y-6">` heading wrapper + `<Suspense>`
  boundary byte-equal vs `origin/main`. `metadata` export byte-equal
  too.

### `tests/unit/admin/emails-queries.test.ts` (new)

13 bun:test cases / 35 expect() assertions:

| Group                                     | Cases |
|-------------------------------------------|-------|
| page-size + hasMore                       | 3     |
| DB error safety                           | 1     |
| WHERE composition (status, q, +)          | 5     |
| cursor + direction                        | 3     |
| getQueueCounts byte-equal signature sanity| 1     |

Mock pattern mirrors `tests/unit/admin/leads-queries.test.ts` /
`tests/unit/admin/newsletter-queries.test.ts`: chainable mock that
captures the `.where()` argument so we can assert composition shape, and
a configurable `.limit()` resolution that stages different row counts
per case. The mock is re-registered in `beforeEach` because
`tests/setup.ts` runs `mock.restore()` before each test. One extra case
on top of the standard 12-case template asserts the byte-equal arity of
`getQueueCounts` so a future refactor cannot silently widen it.

## Cursor format (smoke-tested via the test suite)

2-part `(scheduledFor, id)` tuple, identical to Plan 10-04 / 10-05:

```
encodeCursor('after', [new Date('2026-05-15T12:00:00.000Z'), 'email-id'])
```

produces:
```
after:MjAyNi0wNS0xNVQxMjowMDowMC4wMDBa.ZW1haWwtaWQ
```

`buildPaginationHref('/admin/emails', cursor, { status: 'failed', q:
'acme' })` produces:
```
/admin/emails?cursor=after%3A...&status=failed&q=acme
```

Matches Wave-1's per-part base64url + `.`-separator format and Wave-1's
preservedParams URL-encoding contract.

## Commits

| Task                                    | Commit    | Files                                                                                                                              |
|-----------------------------------------|-----------|------------------------------------------------------------------------------------------------------------------------------------|
| 1 + 2: helper + page + tests            | `2c26377` | `src/lib/admin/emails-queries.ts`, `src/app/(admin)/admin/emails/page.tsx`, `tests/unit/admin/emails-queries.test.ts`              |
| SUMMARY                                 | (next)    | `.planning/phases/10-admin-list-pagination/10-08-SUMMARY.md`                                                                       |

## Verification

- `bun run lint` exit 0 (Biome on 366 src files).
- `bun run typecheck` exit 0.
- `bunx biome check tests/unit/admin/emails-queries.test.ts` exit 0
  (Lefthook pre-commit scope, run before first commit per Plan 10-03
  guidance).
- `bun test tests/unit/admin/emails-queries.test.ts`: 13 pass, 0 fail,
  35 expect() calls.
- `bun run test:unit`: 715 pass, 0 fail across 62 files (up from prior
  baseline by the 13 new cases).
- `bun run build` exit 0; `/admin/emails`, `/admin/emails/[id]` routes
  compiled successfully. Pre-existing `BetterAuthError: You are using
  the default secret` warnings during build are environmental (no
  `BETTER_AUTH_SECRET` in the worktree env) and unrelated to this
  plan -- documented in 10-02 through 10-07 SUMMARIES too.
- `grep -nE 'â€"|â€"' src/lib/admin/emails-queries.ts
  src/app/\(admin\)/admin/emails/page.tsx
  tests/unit/admin/emails-queries.test.ts` exit 1 (no em / en dash
  matches).
- Protected-file diff against `origin/main` empty for:
  `src/app/api/process-emails/route.ts`, `src/lib/auth/admin.ts`,
  `proxy.ts`, `src/components/admin/StatusFilterBar.tsx`,
  `src/components/admin/PublishToggle.tsx`,
  `src/components/admin/ResourceListPage.tsx`,
  `src/app/(admin)/admin/emails/[id]/`.
- `git diff origin/main -- src/lib/admin/emails-queries.ts` confined to
  imports + `listScheduledEmailsForAdmin` body + new helper types +
  `cursorPartsFor` helper + `EMPTY_RESULT` constant. `getQueueCounts`,
  `getScheduledEmailById`, `retryScheduledEmail`,
  `cancelScheduledEmail`, `deleteScheduledEmail` bodies byte-equal.
- No file deletions in the feat commit (verified by
  `git diff --diff-filter=D --name-only HEAD~1 HEAD`).

## Deviations from Plan

### [Single atomic commit, not strict TDD-separated] Helper + page + tests in one commit

**Found during:** Task 1 commit decision.

**Issue:** Plan marks Task 1 as `type="auto" tdd="true"` (which would
normally produce a RED commit then GREEN commit) but the plan's
`<success_criteria>` block says "One commit: `feat(10-08): cursor +
search for /admin/emails`." These are in tension. Plans 10-02 through
10-07 all resolved the tension by combining; following the same
precedent.

**Fix:** Honored the spirit of "one commit" -- combined the test
addition (RED), helper rewrite (GREEN), and page rewrite (Task 2) into a
single atomic commit. Tests were written before the helper rewrite
locally and observed to fail on the legacy positional-arg signature
returning `ScheduledEmail[]` instead of the new result object -- 10 of
13 test cases failed on the first run, so the RED gate was hit even
though it did not ship as its own commit.

**Files affected:** None additional; just commit shape.

### [Rule 1 -- Lint auto-fix] Import block formatting

**Found during:** First `bun run lint` pass after Task 1.

**Issue:** Biome's formatter flagged the single-line `import { and,
asc, count, desc, eq, gt, ilike, lt, or, type SQL } from 'drizzle-orm'`
import -- it preferred the multi-line layout because the import exceeded
the line-length budget. Auto-fix applied.

**Fix:** Ran `bun run lint:fix`. Re-ran `bun run lint` -- exit 0. The
imports are identical at runtime; only the source-line wrapping changed.

**Files modified:** `src/lib/admin/emails-queries.ts`.

## Self-Check: PASSED

Files exist:

- `src/lib/admin/emails-queries.ts` (FOUND, modified)
- `src/app/(admin)/admin/emails/page.tsx` (FOUND, modified)
- `tests/unit/admin/emails-queries.test.ts` (FOUND, created)

Commit exists on branch `admin-list-pagination`:

- `2c26377` (FOUND): `feat(10-08): cursor + search for /admin/emails`

Verification re-run after final commit: `bun run lint` exit 0, `bun run
typecheck` exit 0, `bun test tests/unit/admin/emails-queries.test.ts`
13/13 pass, `bun run test:unit` 715/715 pass, `bun run build` exit 0
(`/admin/emails` route compiled), protected-file diff empty, em / en
dash sweep empty, `getQueueCounts` byte-equal vs origin/main.
