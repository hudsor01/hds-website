# STATE — Current GSD Position

**Last updated:** 2026-05-21
**Branch:** `showcase-ui-enhance`
**Current milestone:** v3.0 (Showcase & conversion polish)
**Current phase:** `01-showcase-ui-redesign`
**Current plan:** 01-04 (verification — pending)

## What just happened

- Plan 01-01 shipped: 4 image-backed rows in Neon `showcase` table (commit 22e84ed).
- Plan 01-02 shipped: `Card variant="project"` accepts optional `imageUrl` / `imageAlt` (commit ac0dab7).
- Plan 01-03 shipped: `/showcase` rewritten with featured-first layout, image-led cards, inline mid-scroll CTA. All em/en-dash characters removed. 4 homepage screenshots added under `public/images/showcase/` (commit 1df250f).
- Phase 01 is 3 of 4 plans complete. Only verification (01-04) remains.

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

Run `gsd-execute-plan` against `01-04-PLAN.md` for the verification pass (lint, typecheck, build, em/en-dash grep, human visual smoke on local dev).
