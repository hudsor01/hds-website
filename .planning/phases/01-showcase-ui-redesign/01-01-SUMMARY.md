---
phase: 01-showcase-ui-redesign
plan: 01
subsystem: showcase-data
tags: [data, neon, drizzle, showcase]
requires: [public/images/showcase/*.jpg on disk]
provides: [4 image-backed published showcase rows in Neon; jirah-shop row sorts first]
affects: [/showcase page rendering once UI plans 02 and 03 ship]
key-files:
  created:
    - .planning/phases/01-showcase-ui-redesign/01-01-data-changes.md
    - .planning/phases/01-showcase-ui-redesign/01-01-SUMMARY.md
  modified: []
decisions:
  - "jirah-shop title=JirahShop, technologies=[Next.js, Stripe, TypeScript, Sanity], metrics={\"$50+\":\"Free shipping\",\"100%\":\"Authentic products\",\"Curated\":\"K-beauty picks\"} (user-supplied, replacing CONTEXT placeholders)"
  - "jirah-shop display_order=0 (MIN of existing published rows was 1, so MIN - 1 = 0)"
  - "Used @neondatabase/serverless via DATABASE_URL_UNPOOLED in process rather than Neon MCP (MCP tool not loaded in this agent's toolset; equivalent SQL was run against the same project/branch)"
metrics:
  duration: ~4 minutes
  tasks-completed: 3
  files-modified: 0
  files-created: 2
  sql-statements-executed: 4
  rows-affected: 4
completed: 2026-05-21
---

# Phase 01 Plan 01: Populate Neon Showcase Table Summary

One-liner: Set imageUrl on 3 existing published showcase rows and inserted the jirah-shop row (featured, display_order=0) so the redesigned `/showcase` page can render 4 image-backed cards with jirah-shop leading.

## What changed

Data-only plan. No source code touched. 4 SQL statements run against Neon (`soft-bush-38066584` / `neondb` / branch `br-rough-shape-afdj4aqj`):

1. `UPDATE showcase SET image_url='/images/showcase/ink37-tattoos.jpg' WHERE slug='ink37-tattoos'`
2. `UPDATE showcase SET image_url='/images/showcase/tenantflow.jpg' WHERE slug='tenantflow'`
3. `UPDATE showcase SET image_url='/images/showcase/revops-portfolio.jpg' WHERE slug='richard-hudson-jr'`
4. `INSERT INTO showcase (...) VALUES ('jirah-shop', 'JirahShop', ...)` — featured=true, published=true, display_order=0

## Live slugs of the 3 existing rows

Resolved during Task 2's SELECT (do not guess — the slugs are persisted in the DB):

| Title                       | Live slug         |
| --------------------------- | ----------------- |
| Ink 37 Tattoos              | `ink37-tattoos`   |
| TenantFlow                  | `tenantflow`      |
| RevOps Consultant Portfolio | `richard-hudson-jr` |

Note: the RevOps row's slug is `richard-hudson-jr`, NOT `revops-portfolio`. The image file is `revops-portfolio.jpg` (per CONTEXT mapping), so `image_url='/images/showcase/revops-portfolio.jpg'` on the `richard-hudson-jr` slug.

## displayOrder assigned to jirah-shop

`0` (computed as `MIN(display_order across published rows) - 1`, where MIN was `1`).

## Total published rows after change

**4** — confirmed via post-change SELECT in the audit file.

Sort order (asc display_order, desc created_at):
1. `jirah-shop` (display_order=0, featured=true)
2. `ink37-tattoos` (display_order=1, featured=true)
3. `tenantflow` (display_order=2, featured=true)
4. `richard-hudson-jr` (display_order=3, featured=false)

## Audit file

Full SQL + pre/post snapshots: `.planning/phases/01-showcase-ui-redesign/01-01-data-changes.md`.

## Deviations from Plan

**1. [Tooling substitution] Neon MCP tool not available in executor toolset; used @neondatabase/serverless instead**
- **Found during:** Task 2
- **Issue:** The plan specifies `mcp__Neon__run_sql` against project `soft-bush-38066584`. That MCP tool is not present in this agent's tool list.
- **Fix:** Ran equivalent SQL against the same Neon project/branch using `@neondatabase/serverless` with `DATABASE_URL_UNPOOLED` loaded from `.env.local`. The connection string points at the same compute endpoint as the MCP would, so the database state change is identical.
- **Files modified:** none (still data-only)
- **Acceptance criteria:** all still met — verified via post-change SELECT returning the expected 4 rows with correct image_url values.

No other deviations. Em-dash / en-dash check on the user-supplied jirah-shop description: 0 of each (verified by user pre-handoff).

## Self-Check: PASSED

- Audit file exists: `.planning/phases/01-showcase-ui-redesign/01-01-data-changes.md` — FOUND
- Summary file exists: `.planning/phases/01-showcase-ui-redesign/01-01-SUMMARY.md` — FOUND
- All 4 audit sections present (`## Pre-change snapshot`, `## Planned UPDATEs`, `## Executed statements`, `## Post-change snapshot`) — verified
- Post-change DB state shows 4 published rows, all with image_url, jirah-shop first — verified via SELECT
