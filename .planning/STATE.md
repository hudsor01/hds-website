# STATE — Current GSD Position

**Last updated:** 2026-05-21
**Branch:** `showcase-ui-enhance`
**Current milestone:** v3.0 (Showcase & conversion polish)
**Current phase:** `01-showcase-ui-redesign` (Complete)
**Current plan:** none — phase 01 closed; awaiting human visual smoke + PR

## What just happened

- Plan 01-01 shipped: 4 image-backed rows in Neon `showcase` table (commit 22e84ed).
- Plan 01-02 shipped: `Card variant="project"` accepts optional `imageUrl` / `imageAlt` (commit ac0dab7).
- Plan 01-03 shipped: `/showcase` rewritten with featured-first layout, image-led cards, inline mid-scroll CTA. All em/en-dash characters removed. 4 homepage screenshots added under `public/images/showcase/` (commit 1df250f).
- Plan 01-04 verification PASSED: lint + typecheck + build all exit 0; `/showcase` static-prerendered; em-dash sweep clean in-scope (4 pre-existing JSX comments in card.tsx out of scope per plan); en-dash sweep clean; all 4 JPGs tracked under 500K; `getShowcaseItems()` query path verified (no `imageUrl` filter). Human visual smoke deferred to operator. See `.planning/phases/01-showcase-ui-redesign/01-04-VERIFICATION.md` and `01-SUMMARY.md`.
- Phase 01 complete (4/4 plans).

## Active decisions

- Featured selection uses `items.find(i => i.featured)` so the first featured item by `displayOrder` renders full-width (currently JirahShop).
- Inline CTA placed inside `ShowcaseProjects` (inside Suspense) so it streams with the project grid; existing closing CTA outside Suspense stays static.
- Trust signal separators use U+00B7 MIDDLE DOT, never em-dash.
- All accent body copy on light backgrounds uses `text-accent-text` (WCAG-safe) per globals.css.
- Em/en-dash ban codified in CLAUDE.md as a global copy rule; enforced per-file on touch (no global sweep).

## Deferred / known issues

- The earlier `v1.0/v1.1/v2.0` milestones are referenced in user memory but no `.planning/` artifacts remain. Treating those as historical only.
- 4 location pages (75 cities) shipped in PR #206; no follow-up planned yet.

## Next action

Operator: spin up `bun run dev`, hard-reload `http://localhost:3000/showcase`, walk through the 11 visual checks in `01-04-PLAN.md` Task 2 (typewriter, stats bar, section header, featured card, support grid, inline CTA, closing CTA, mobile stacking at ~375px, WebP serving in Network tab, keyboard focus rings). If green, open the PR against `main` with a squashed commit `feat(showcase): image-led redesign with featured card, support grid, and mid-scroll CTA`. Then pick the next v3.0 phase (none defined yet — roadmap currently lists only phase 01).
