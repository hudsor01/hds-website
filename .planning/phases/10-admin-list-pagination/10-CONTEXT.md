# Phase 10 — Admin list pagination + text search

**Date:** 2026-05-27
**Branch:** TBD (`admin-list-pagination`)
**Milestone:** v5 — Admin hardening + content authoring
**Scope:** Add server-rendered cursor pagination + a text-search filter to the 7 admin list pages. Replaces the Phase 04/05 hard caps (showcase 50, blog 50, testimonials 50, leads 200, calculator-leads 200, newsletter 200, emails 100) with paginated reads. All existing per-page filters (status chips, queue stats) keep working alongside the new search input and pagination controls.

## 1. Goal

After this phase, every admin list page renders at most one page of rows (default 25) and exposes Prev / Next links computed from a server-emitted cursor. Every list page also exposes a single `<input name="q">` text-search bar; submitting it round-trips through `?q=...` and the read helper applies `ILIKE '%q%'` against the page's primary text columns. No client-side state, no router hooks, no JS shipped for either control.

Visible value to the operator: the ops tables (leads, newsletter, emails) become searchable by name / email regardless of how many rows accumulate, and no list ever truncates silently again. Architectural value: removes the silent-truncation failure mode (the cap was implicit; an operator looking at a 200-row list never knew it was actually 250). Cursor pagination scales O(1) per page regardless of dataset size, unlike OFFSET pagination.

## 2. Non-goals

- **No client-side state, no router hooks, no `useState`, no debounced auto-search.** The search input is a plain `<form method="get">` with a submit button. The operator types and presses Enter. Adding `usePathname` / `useSearchParams` / `useTransition` is a Phase 11+ concern, and only if a usability gap is reported.
- **No `pg_trgm` indexes, no full-text search.** `ILIKE '%q%'` over the primary text columns is sufficient for row counts under 10k. Trigram indexes are a future scaling concern, not a v5 concern.
- **No infinite scroll, no virtualization.** Page-by-page navigation only. Infinite scroll requires client JS we are explicitly not adding here.
- **No sort-order controls in the UI.** Each page keeps its existing sort. Operator-controlled sort columns are a Phase 11+ concern.
- **No bulk actions on the list pages.** Bulk delete / bulk publish stay out of scope. Mutations still happen on the per-row detail page or via the existing `PublishToggle` icon button.
- **No new schema migration.** Existing columns (`id`, `createdAt`, `displayOrder`) carry the cursor. No new indexes ship in this phase -- the existing `idx_*_created_at` indexes from earlier phases cover the cursor `ORDER BY`. If a future phase needs `ILIKE` performance on a high-volume table, that phase owns the `pg_trgm` index, not this one.
- **No change to public-facing routes.** `/blog`, `/showcase`, `/portfolio`, `/testimonials`, `/help/*` are all untouched -- they have their own caching strategy and don't need pagination.
- **No change to dashboard widgets.** `/admin/dashboard` widgets (RecentLeadsPanel, TopPagesTable, etc.) keep their hard `LIMIT N` because they're at-a-glance summaries, not browsable lists.
- **No change to `<Suspense>` + `await connection()` pattern.** Every list page keeps the existing wrapper.
- **No change to `StatusFilterBar` semantics.** Status chips stay. The search input and pagination controls compose with the existing chip filter -- selecting a status chip preserves the current `q` and resets cursor.
- **No change to per-row mutation affordances.** `PublishToggle` icons on the showcase / blog / testimonials list pages keep working unchanged.

## 3. Pagination style (locked)

**Cursor pagination, not OFFSET.**

Rationale:

- All 7 list pages already sort by a stable, monotonically-increasing column (`createdAt DESC` on 6 of them; `displayOrder ASC, createdAt DESC` on showcase). Cursor pagination is the idiomatic choice for time-sorted lists.
- Cursor reads are O(log n) per page regardless of dataset size (driven by the `idx_*_created_at` index). OFFSET reads degrade linearly: page 100 of a 100k-row table costs 100x what page 1 costs.
- Cursor reads are stable under inserts. OFFSET reads can skip or duplicate rows when new rows land mid-pagination -- a real concern for `leads` and `newsletter_subscribers` where rows arrive continuously.

**Cursor encoding.** For tables sorted by `(createdAt DESC, id)`: cursor is the last row's `createdAt.toISOString() + ':' + id`. Round-trips as `?cursor=2026-05-27T12:34:56.789Z:abc-uuid`. For showcase (sorted by `(displayOrder ASC, createdAt DESC, id)`): cursor is `displayOrder:createdAt:id`.

**Decoding.** A shared helper `src/lib/admin/list-cursor.ts` exports `encodeCursor(row)` and `decodeCursor(raw)`. Decode returns `null` on malformed input (the page treats it as "no cursor" -- shows page 1). Encode of the last row in the current page produces the `next` cursor; encode of the first row produces the `prev` cursor -- but see "Page direction" below for the wrinkle.

**Page direction.** Two-way navigation requires the page to know whether the operator clicked Next (use cursor as `WHERE (createdAt, id) < cursor`) or Prev (use `WHERE (createdAt, id) > cursor` and reverse the result set). The simplest pattern: encode direction into the param itself as `?cursor=after:...` or `?cursor=before:...`. The `Pagination` component emits both. The query helper accepts a `{ cursor, direction }` shape.

**Page size.** Default `PAGE_SIZE = 25` shared from `src/lib/admin/list-cursor.ts`. No per-page override in this phase -- a single constant is simpler and the operator can hit Next twice for the cost of one if they want 50.

## 4. Text search UX (locked)

**Plain `<form method="get">` with `<input name="q" type="search">` + submit button.** No client JS, no debouncing.

**Search columns per surface** (case-insensitive, `ILIKE '%q%'` applied per column, results ORed together):

| Page | Search columns |
|---|---|
| `/admin/showcase` | `title`, `slug` |
| `/admin/blog` | `title`, `slug`, `excerpt` |
| `/admin/testimonials` | `name`, `company`, `content` |
| `/admin/leads` | `name`, `email`, `company` |
| `/admin/leads/calculator` | `email`, `name` |
| `/admin/newsletter` | `email`, `name` |
| `/admin/emails` | `recipientEmail`, `recipientName`, `stepId` |

**Sanitization.** The search input value is URL-decoded by the framework. The query helper escapes `%` and `_` (SQL wildcards) inside `q` before interpolating into the `LIKE` pattern -- prevents an accidental wildcard from matching the whole table. Drizzle's `like()` / `ilike()` operators take care of parameter binding, so SQL injection isn't a concern; the `%`/`_` escape is purely UX.

**Search + filter + cursor compose.** Submitting the search form omits `cursor` (resets to page 1) but preserves `status` if present. Clicking a status chip omits both `cursor` and `q`. Clicking Next preserves both `q` and `status`.

**Empty results.** When `q` filters to zero rows, the page renders an empty state with the literal query echoed back: "No leads matching `<q>`. [Clear search]" where `[Clear search]` is a link to the same URL with `q` dropped.

## 5. File-level changes

### New files

- `src/lib/admin/list-cursor.ts` — pure helpers, `import 'server-only'` for safety:
  - `PAGE_SIZE = 25` constant
  - `type Direction = 'after' | 'before'`
  - `type Cursor<TKey> = { key: TKey; direction: Direction }`
  - `encodeCursor(direction: Direction, parts: (string | number | Date)[]): string` — produces URL-safe cursor strings
  - `decodeCursor(raw: string | undefined): Cursor<string[]> | null` — returns `null` on malformed input
  - `escapeLikePattern(q: string): string` — escapes `%` and `_` and backslash
- `src/components/admin/SearchInput.tsx` — server component:
  - Props: `baseHref`, `q?`, `placeholder?`, `preservedParams?: Record<string, string>` (so the form preserves `?status=...` when submitted)
  - Markup: `<form method="get" action={baseHref}><input type="search" name="q" defaultValue={q} aria-label="Search" /><button type="submit">Search</button>` + hidden inputs for each `preservedParams` key
- `src/components/admin/Pagination.tsx` — server component:
  - Props: `baseHref`, `prevCursor?`, `nextCursor?`, `preservedParams?: Record<string, string>`
  - Markup: a flex row with `Prev` and `Next` links. Both are `<Link>` elements with the cursor + preserved params embedded. Disabled state renders as plain text instead of a link.
  - Accessibility: nav landmark with `aria-label="Pagination"`; current "page" is implicit (no explicit page number since cursor pagination doesn't have one).
- `tests/unit/admin/list-cursor.test.ts` — encode/decode round-trip cases, malformed input returns null, `escapeLikePattern` for `%` / `_` / `\`.
- `tests/unit/admin/search-input.test.ts` and `tests/unit/admin/pagination.test.ts` — render assertions for the two new server components (preserved params present, disabled state correct, accessible labels correct).

### Modified files (7 list pages + 7 query helpers)

For each pair `(page, queries)`:

1. Query helper signature changes from `list*ForAdmin(status?, limit?)` to `list*ForAdmin({ status?, q?, cursor?, direction? })`. Return shape changes from `Row[]` to `{ rows: Row[], hasMore: boolean, prevCursor: string | null, nextCursor: string | null }`. The helper:
   - Decodes the cursor params; falls back to page 1 on malformed
   - Applies `ILIKE` against the page's search columns when `q` is non-empty (with `escapeLikePattern`)
   - Reads `PAGE_SIZE + 1` rows to detect `hasMore`; trims to `PAGE_SIZE` before returning
   - For `direction: 'before'`, reverses the order in SQL and reverses the result set in JS so the caller gets rows in display order
2. List page accepts `searchParams` and reads `q`, `cursor`, plus existing filters (`status` etc.); passes everything to the query helper; renders `<SearchInput>` above the table and `<Pagination>` below; threads `q` + `status` through both as preserved params.

**Affected pairs:**

- `src/lib/admin/showcase-queries.ts` + `src/app/(admin)/admin/showcase/page.tsx` (no status filter; search on title + slug)
- `src/lib/admin/blog-queries.ts` + `src/app/(admin)/admin/blog/page.tsx` (no status filter today; search on title + slug + excerpt; pre-existing list helper to extend)
- `src/lib/admin/testimonials-queries.ts` + `src/app/(admin)/admin/testimonials/page.tsx` (no status filter; search on name + company + content)
- `src/lib/admin/leads-queries.ts` + `src/app/(admin)/admin/leads/page.tsx` (status filter; search on name + email + company)
- `src/lib/admin/calculator-leads-queries.ts` + `src/app/(admin)/admin/leads/calculator/page.tsx` (quality filter; search on email + name)
- `src/lib/admin/newsletter-queries.ts` + `src/app/(admin)/admin/newsletter/page.tsx` (status filter; search on email + name)
- `src/lib/admin/emails-queries.ts` + `src/app/(admin)/admin/emails/page.tsx` (status filter + stat cards; search on recipientEmail + recipientName + stepId; stat cards must stay unfiltered)

### Deleted files

None.

## 6. Constraints (do not violate)

- All project conventions in `/CLAUDE.md`. Highlights: NO em/en-dashes in user-facing strings (search placeholders, empty-state copy, Pagination button labels), NO emojis, server-first by default (`SearchInput` + `Pagination` are server components; no client hooks), Logger not `console.*`, Zod `safeParse`, env via `@/env`.
- `src/lib/auth/admin.ts` (Bearer cron guard) byte-equal to `origin/main`.
- `proxy.ts` byte-equal.
- All `src/app/api/**` byte-equal — no new API route, no API contract change.
- Phase 02-09 admin / auth / chrome / logger / RichTextEditor / image upload files functionally unchanged.
- `src/components/admin/StatusFilterBar.tsx` byte-equal — the existing filter primitive composes WITH the new search input + pagination; it is not replaced.
- All public routes (`/blog`, `/showcase`, `/portfolio`, `/testimonials`, `/help/*`) byte-equal.
- All detail pages (`[id]` routes) byte-equal — Phase 10 only touches LIST surfaces.
- Existing per-list helper test suites must continue to pass; their fixtures may need extension for the new options object signature.
- New code must not call `db.select().from(...)` directly from a page or component — every DB read goes through a `src/lib/admin/*-queries.ts` helper.
- Pre-existing `listShowcasesForAdmin()` and `listLeadsForAdmin()` etc. shapes change. Every caller is updated in this phase; no compatibility shim.
- `<form method="get">` uses default URL encoding; no client `fetch` for the search submit.

## 7. Verification

- `bun run lint && bun run typecheck && bun run build` exit 0
- `bun run test:unit` — pass count rises by however many new test files add (target +15-20 cases across `list-cursor`, `search-input`, `pagination`, plus extended helper tests)
- Em / en-dash sweep on changed files: zero
- Protected-file diff vs `origin/main` empty for `src/lib/auth/admin.ts`, `proxy.ts`, `src/app/api/**`, `src/components/blog/BlogPostContent.tsx`, every public route, every detail page, every `actions.ts`.
- Manual operator smoke (deferred to operator pre-PR):
  1. Sign in to `/admin/leads`. Verify pagination shows when row count > 25 (seed a few fixture leads if needed). Click Next; verify URL gains `?cursor=after:...`. Click Prev; verify it goes back.
  2. Type a query in the search box on `/admin/leads`; submit. Verify URL is `?q=<term>` and the visible rows match. Combine with a status chip; verify URL keeps both `?status=...&q=...`.
  3. Repeat on the other 6 list pages.
  4. Spot-check the `/admin/emails` stat cards do NOT change when a filter or search is applied -- they must reflect the unfiltered queue total.
  5. Search a non-matching string; verify empty-state copy + "Clear search" link.

## 8. Out of scope (deferred to future phases)

- Debounced search-on-input (requires `'use client'` + `useTransition`)
- Sort-order controls in the UI
- Bulk actions on list rows
- `pg_trgm` indexes for `ILIKE` performance (activate when any list table exceeds 10k rows)
- Page-jump-to-N navigation (cursor pagination cannot do this efficiently; would require a separate count query)
- Saved searches / saved filters
- CSV / JSON export of filtered results
- Date-range filters
- Inline column resize, hide/show columns
