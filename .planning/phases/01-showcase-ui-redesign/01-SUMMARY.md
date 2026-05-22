---
phase: 01-showcase-ui-redesign
milestone: v3.0
status: complete
plans: 4
completed_plans: 4
commits: 4
date_started: 2026-05-21
date_completed: 2026-05-21
head_sha: b25c72c
---

# Phase 01 — Showcase UI Redesign Summary

`/showcase` rewritten as an image-led conversion surface: 4 published Neon rows render with real homepage screenshots (1 featured full-width + 3 in a responsive support grid), a mid-scroll inline CTA sits between the grid and the existing closing CTA, the hero typewriter is preserved, and all new copy is em/en-dash free.

## What shipped

| Plan | Title | Commit | What |
|---|---|---|---|
| 01-01 | Populate Neon showcase table | `22e84ed` | `UPDATE imageUrl` on 3 existing rows (Ink 37, TenantFlow, RevOps Portfolio); `INSERT` jirah-shop row with `featured = true`, `display_order = 0` so it sorts first |
| 01-02 | Card image-header support | `ac0dab7` | Additive `imageUrl` / `imageAlt` props on `Card variant="project"`; conditional Next.js `<Image>` header (4:3 featured, 16:9 support); category/featured pills moved to absolute overlay when image present |
| 01-03 | Rewrite `/showcase` page | `1df250f` | Featured-first split: `items.find(i => i.featured)` renders full-width; remaining items render in `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. New section header, new inline CTA section, em/en-dash purge (3 em-dash + 1 en-dash removed). 4 homepage screenshots shipped under `public/images/showcase/`. |
| 01-04 | Verification | `b25c72c` (metadata) + this commit | Lint + typecheck + build all green; em/en-dash sweep zero in-scope; 4 JPGs all tracked under 500K; `getShowcaseItems()` query path verified to not filter on `imageUrl`. Human visual smoke deferred to operator. |

## Surface summary

**Database (`showcase` table, `published = true`):**
- 4 rows in display order: `jirah-shop` (featured, `display_order=0`) > `ink37-tattoos` (featured, 1) > `tenantflow` (featured, 2) > `revops-portfolio` (3).
- All 4 have `imageUrl` populated pointing at `/images/showcase/{slug}.jpg`.

**Component (`src/components/ui/card.tsx`):**
- `variant="project"` now accepts optional `imageUrl` / `imageAlt`.
- When present: renders Next.js `<Image>` header (4:3 if `featured`, else 16:9) with overlay pills.
- When absent: falls back to existing accent-bar + in-body pill row. Zero-regression for non-image callers.

**Page (`src/app/showcase/page.tsx`):**
- Hero typewriter preserved (`Real Projects.` / `Real Results.`).
- Stats bar: `4+ Projects Delivered`.
- Section header: eyebrow `Featured` / H2 `Four small businesses. <span class="text-accent">One thing in common.</span>` / lead copy.
- Featured card: jirah-shop full-width with 4:3 image header.
- Support grid: 3 cards (Ink 37, TenantFlow, RevOps) at 1/2/3 cols mobile/tablet/desktop.
- Inline CTA: `Want your business on this page?` between grid and closing CTA (U+00B7 separators in trust signal, never em-dash).
- Closing CTA unchanged.

**Assets (`public/images/showcase/`):**
- `jirah-shop.jpg` (184K), `ink37-tattoos.jpg` (344K), `tenantflow.jpg` (303K), `revops-portfolio.jpg` (263K). All git-tracked, all under 500K, Next.js Image converts to WebP at request time.

## Cross-cutting decisions (apply beyond this phase)

- **Em/en-dash ban codified in CLAUDE.md as a global copy rule.** Enforced per-file on touch (no global sweep, but new copy must use periods/middle-dot/hyphen as appropriate). Pre-existing JSX comments in `card.tsx` left alone per scope discipline.
- **All accent body copy on light backgrounds uses `text-accent-text` (WCAG-safe per globals.css), not `text-accent`.** `text-accent` reserved for non-body decorative use.
- **Featured selection is data-driven** (`featured: true` + lowest `displayOrder`), not hard-coded by slug. Swapping the featured project is a SQL update, not a code change.

## Recommended commit / PR shape

Each plan landed as a single atomic commit on `showcase-ui-enhance`:
- `feat(showcase): populate Neon showcase table with 4 image-backed rows` (22e84ed)
- `feat(card): add optional imageUrl to project card variant` (ac0dab7)
- `feat(showcase): redesign page with image-led featured + 3 support cards` (1df250f)
- `docs(01-03): complete showcase page redesign plan` (b25c72c) — metadata only
- `chore(01): phase verification passed` (this commit) — VERIFICATION.md + SUMMARY.md + STATE.md + ROADMAP.md

PR recommendation: **squash on merge** to main, single squash message `feat(showcase): image-led redesign with featured card, support grid, and mid-scroll CTA`. The atomic per-plan history is preserved on the feature branch for traceability; the main-branch history stays one-commit-per-feature.

## Open follow-ups for future phases

- **Human visual smoke is deferred.** Operator should run `bun run dev`, hard-reload `/showcase`, and walk through the 11 checks in `01-04-PLAN.md` Task 2 before opening the PR. None of the 11 checks block the audited gates above, but they catch rendering regressions that lint/typecheck/build can't see.
- **Playwright coverage of `/showcase` is not yet in place.** Section 11 of `01-CONTEXT.md` captured an outline. Consider adding it in a follow-up phase if the showcase rendering regresses more than once.
- **`gradientClass` fallback** still ships brand-token defaults for non-image rows. If all future rows will have images, the gradient code path becomes dead — re-evaluate after the next 3 published rows.

## Phase verdict

All 4 plans shipped. All automated gates green. Phase ready for human visual smoke + PR.
