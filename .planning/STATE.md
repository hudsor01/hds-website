# STATE — Current GSD Position

**Last updated:** 2026-05-22
**Branch:** `main`
**Current milestone:** v3.0 (Showcase & conversion polish)
**Current phase:** none active — Phase 01 closed and merged
**Current plan:** none

## What just happened

- Phase 01 (`showcase-ui-redesign`) shipped to production:
  - 4 plans across 3 waves, all executed with atomic commits
  - 2-iteration code review loop (14 findings to 0 defects)
  - Squash-merged as `59e5e70` on `2026-05-22T21:50Z` via PR #208
- Original feature-branch commits: `22e84ed` (data), `ac0dab7` (Card), `1df250f` (page+images), `b25c72c` (planning metadata), `356ad1e` (verification), `983e4d7` (review-fix). All collapsed into the squash commit on main.
- `/showcase` now renders 1 featured (JirahShop) + 3 support cards (Ink 37, TenantFlow, RevOps) with real homepage screenshots, plus a new mid-scroll CTA between the grid and the closing CTA.

## Active decisions (still in force)

- Featured-first rendering: `items.find(i => i.featured)` picks the lowest-displayOrder featured row for the full-width slot; remaining items render in a 3-col support grid with `featured={false}` forced at the call site so `md:col-span-2` / `priority` / the "Featured" overlay badge never fire on a support card.
- Inline CTA lives inside `ShowcaseProjects` (under Suspense) so it streams with the grid; closing CTA stays outside Suspense.
- Trust signal separators use U+00B7 MIDDLE DOT, never em-dash.
- Accent body copy on light backgrounds uses `text-accent-text` (WCAG-safe).
- Em/en-dash ban (CLAUDE.md) applies to user-facing text only; code comments and developer-only strings are exempt.

## Deferred / known issues

- Earlier `v1.0` / `v1.1` / `v2.0` milestones are referenced in user memory but no `.planning/` artifacts remain. Treating those as historical only.
- 4 location pages (75 cities) shipped in PR #206; no follow-up planned yet.
- 4 pre-existing em-dashes in `src/components/ui/card.tsx` JSX block comments (lines 392, 397, 413, 427) are out of scope per the v3.0/01 verification (CLAUDE.md exempts code comments).
- `industry` prop on `ProjectCardProps` is declared but never destructured/rendered. Pre-existing on `main` before phase 01. Candidate for a small cleanup PR if the next phase touches the Card component.

## Next action

Pick the next v3.0 phase. Roadmap currently lists only phase 01 (closed). Candidates surfaced during phase 01:
- Global em/en-dash sweep across the rest of the site (PR-#206 copy still has scattered em-dashes)
- `/services` page visual upgrade (currently text-heavy, no imagery)
- Drop the unused `industry` prop on `ProjectCardProps`
- Polish the closing CTA on `/showcase` (still uses `text-section-title` despite being demoted to h3)

Run `/gsd-add-phase` to add a phase once direction is chosen.
