---
phase: 10-admin-list-pagination
plan: 01
subsystem: admin-list
wave: 1
tags: [pagination, cursor, search, server-component, primitive]
requires: []
provides:
  - PAGE_SIZE
  - Direction
  - Cursor
  - encodeCursor
  - decodeCursor
  - escapeLikePattern
  - SearchInput
  - SearchInputProps
  - Pagination
  - PaginationProps
affects:
  - "Wave 2 query helpers (showcase, blog, testimonials, leads, calculator-leads, newsletter, emails) -- import { PAGE_SIZE, decodeCursor, encodeCursor, escapeLikePattern } from '@/lib/admin/list-cursor'"
  - "Wave 2 list pages -- import { SearchInput } from '@/components/admin/SearchInput' and import { Pagination } from '@/components/admin/Pagination'"
tech_stack:
  added: []
  patterns:
    - "Cursor codec: per-part base64url encoding joined by `.` (outside base64url alphabet) -- unambiguous round-trip even when parts contain `:` (ISO timestamps)"
    - "Server-rendered GET form for search (no client JS, no router hooks)"
    - "Server-rendered Prev/Next via next/link with URLSearchParams-encoded hrefs"
    - "Disabled-state pattern: render `<span aria-disabled=\"true\">` instead of a `<button disabled>` for non-link affordances"
    - "preservedParams convention: empty-string values are skipped on emit"
key_files:
  created:
    - src/lib/admin/list-cursor.ts
    - src/components/admin/SearchInput.tsx
    - src/components/admin/Pagination.tsx
    - tests/unit/admin/list-cursor.test.ts
    - tests/unit/admin/search-input.test.tsx
    - tests/unit/admin/pagination.test.tsx
  modified: []
decisions:
  - "Cursor payload uses per-part base64url + `.` separator (not joined-then-encoded `:` separator) so ISO timestamps containing `:` round-trip cleanly"
  - "Component test filenames are `.test.tsx` (plan said `.test.ts`) because Bun's loader only parses JSX in `.tsx`"
  - "Em/en-dash and arrow glyphs in negative-assertion tests are written as `\\u2014` / `\\u2013` / `\\u2192` / `\\u2190` so source bytes contain zero forbidden glyphs while the runtime check still asserts on the literal characters"
metrics:
  duration_min: 18
  tasks_completed: 3
  files_created: 6
  files_modified: 0
  test_assertions: 55
  test_cases: 31
  completed: 2026-05-27
---

# Phase 10 Plan 01: Shared list primitives Summary

Built the three shared primitives every Wave 2 plan depends on: a pure cursor codec + SQL LIKE escape (`src/lib/admin/list-cursor.ts`), a server-rendered text-search GET form (`src/components/admin/SearchInput.tsx`), and a server-rendered Prev/Next nav row (`src/components/admin/Pagination.tsx`). 31 bun:test cases / 55 expect() assertions cover round-trips, malformed input, escape order, render attrs, hidden-input emission, disabled-state collapse, href shape, and forbidden-glyph negatives.

## Exports + Wave 2 consumers

### `src/lib/admin/list-cursor.ts`

| Symbol | Shape | Where Wave 2 uses it |
|---|---|---|
| `PAGE_SIZE` | `25` (const) | Every Wave 2 query helper: `limit(PAGE_SIZE + 1)` to detect `hasMore` |
| `Direction` | `'after' \| 'before'` | Cursor type for `{ cursor, direction }` query-helper arg |
| `Cursor` | `{ direction: Direction; parts: string[] }` | Return type of `decodeCursor` |
| `encodeCursor(direction, parts)` | `(Direction, (string \| number \| Date)[]) => string` | Wave 2 helpers call after fetching a page to build `prevCursor` / `nextCursor` |
| `decodeCursor(raw)` | `(string \| undefined) => Cursor \| null` | Wave 2 helpers call on each request to derive WHERE clause; null returns fall back to page 1 |
| `escapeLikePattern(q)` | `(string) => string` | Wave 2 helpers call before interpolating `q` into an `ILIKE '%pattern%'` clause |

### `src/components/admin/SearchInput.tsx`

| Symbol | Shape | Where Wave 2 uses it |
|---|---|---|
| `SearchInput` | `(SearchInputProps) => JSX` | Every Wave 2 list page renders one above the table: `<SearchInput baseHref="/admin/leads" q={q} preservedParams={{ status }} />` |
| `SearchInputProps` | `{ baseHref; q?; placeholder?; preservedParams? }` | Type used at the call site |

### `src/components/admin/Pagination.tsx`

| Symbol | Shape | Where Wave 2 uses it |
|---|---|---|
| `Pagination` | `(PaginationProps) => JSX` | Every Wave 2 list page renders one below the table: `<Pagination baseHref="/admin/leads" prevCursor={prevCursor} nextCursor={nextCursor} preservedParams={{ q, status }} />` |
| `PaginationProps` | `{ baseHref; prevCursor: string \| null; nextCursor: string \| null; preservedParams? }` | Type used at the call site |

## Commits

| Task | Commit | Files |
|---|---|---|
| 1: list-cursor + tests | `3e55346` | `src/lib/admin/list-cursor.ts`, `tests/unit/admin/list-cursor.test.ts` |
| 2: SearchInput + tests | `4d22182` | `src/components/admin/SearchInput.tsx`, `tests/unit/admin/search-input.test.tsx` |
| 3: Pagination + tests | `0ec67b6` | `src/components/admin/Pagination.tsx`, `tests/unit/admin/pagination.test.tsx` |
| 4: SUMMARY | (this commit) | `.planning/phases/10-admin-list-pagination/10-01-SUMMARY.md` |

## Test coverage

| File | Cases | Assertions |
|---|---|---|
| `tests/unit/admin/list-cursor.test.ts` | 16 | 17 |
| `tests/unit/admin/search-input.test.tsx` | 8 | 17 |
| `tests/unit/admin/pagination.test.tsx` | 7 | 21 |
| **Total** | **31** | **55** |

All 31 cases pass. `bun run lint` exit 0 on 365 files. `bun run typecheck` exit 0. Pre-commit hook (Lefthook: biome check + typecheck on staged files) passed for every task commit.

Protected-file diff vs `origin/main` is empty for: `src/lib/auth/admin.ts`, `proxy.ts`, `src/components/admin/StatusFilterBar.tsx`.

## Deviations from Plan

### [Rule 1 - Bug] Cursor payload encoding

**Found during:** Task 1 (RED step caught it on first GREEN run)

**Issue:** The plan's encode/decode design joined parts with `:` and then base64url-encoded the joined payload. On decode, the payload decodes back to a raw string containing the ISO timestamp's literal `:` characters; splitting by `:` then shreds `2026-05-27T12:34:56.789Z` into three pieces (`['2026-05-27T12', '34', '56.789Z']`) instead of preserving it as one element. Two of the 16 test cases failed.

**Fix:** Encode each part individually to base64url and join the encoded parts with `.` (a character outside the base64url alphabet). On decode, split by `.` first, then base64url-decode each part. Round-trip is now unambiguous for any input including ISO timestamps and arbitrary strings containing `:`.

**Files modified:** `src/lib/admin/list-cursor.ts`

**Commit:** `3e55346`

### [Rule 3 - Blocker] Component test filenames

**Found during:** Task 2 (planning phase)

**Issue:** The plan's `<files>` block listed component tests as `tests/unit/admin/search-input.test.ts` and `tests/unit/admin/pagination.test.ts`. Both tests use JSX (`render(<SearchInput ... />)`). Bun's loader only parses JSX in `.jsx` / `.tsx` files -- the `.test.ts` variant would fail to compile.

**Fix:** Created the two component test files as `.test.tsx`. The list-cursor test stays `.test.ts` (no JSX). Contents match the plan exactly; only the extension changed.

**Files modified:** `tests/unit/admin/search-input.test.tsx`, `tests/unit/admin/pagination.test.tsx`

### [Rule 3 - Blocker] Forbidden-glyph negative-assertion source bytes

**Found during:** Task 2 (post-write Unicode scan)

**Issue:** The plan's test fixtures include literal em-dash (`U+2014`), en-dash (`U+2013`), right-arrow (`U+2192`), and left-arrow (`U+2190`) inside `expect(html.includes('—')).toBe(false)` style assertions. The user constraint "NO em-dash, NO en-dash, NO arrow glyphs anywhere in source OR tests" forbids these glyphs in source bytes. Without an escape, the assertion source itself violates the rule.

**Fix:** Wrote the literal characters as Unicode escape sequences (`'—'`, `'–'`, `'→'`, `'←'`). At runtime the string still equals the single Unicode codepoint, so the negative assertion still works; in the source file the bytes contain only ASCII. Verified by `grep` and Python codepoint scan: zero forbidden glyphs remain in any new file.

**Files modified:** `tests/unit/admin/search-input.test.tsx`, `tests/unit/admin/pagination.test.tsx`

### Documentation-only mismatch: explicit `JSX.Element` return type

**Found during:** Task 2 (interface review)

**Issue:** The plan's `<interfaces>` block documents `SearchInput` and `Pagination` as `(props) => JSX.Element`. The existing admin component convention (`StatusFilterBar`, `PublishToggle`, etc.) does not annotate return types -- TS infers `JSX.Element` automatically and the project uses `verbatimModuleSyntax: true` which would require an explicit `import type { JSX }` if the annotation were spelled out.

**Fix:** Matched the codebase convention -- omit the explicit return type, let TS infer. Runtime behavior and the inferred public type are identical; only the source spelling differs from the plan's interface comment.

**Files modified:** `src/components/admin/SearchInput.tsx`, `src/components/admin/Pagination.tsx`

## Self-Check: PASSED

Files exist:

- `src/lib/admin/list-cursor.ts` (FOUND)
- `src/components/admin/SearchInput.tsx` (FOUND)
- `src/components/admin/Pagination.tsx` (FOUND)
- `tests/unit/admin/list-cursor.test.ts` (FOUND)
- `tests/unit/admin/search-input.test.tsx` (FOUND)
- `tests/unit/admin/pagination.test.tsx` (FOUND)

Commits exist on branch `admin-list-pagination`:

- `3e55346` (FOUND)
- `4d22182` (FOUND)
- `0ec67b6` (FOUND)

Verification commands re-run after final commit: `bun run lint` exit 0, `bun run typecheck` exit 0, `bun test tests/unit/admin/{list-cursor,search-input,pagination}.test.*` 31/31 pass, protected-file diff empty.
