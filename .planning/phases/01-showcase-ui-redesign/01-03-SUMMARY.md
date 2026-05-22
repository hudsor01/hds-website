---
phase: 01-showcase-ui-redesign
plan: 03
subsystem: showcase
tags: [ui, redesign, showcase, server-component]
dependency_graph:
  requires: ["01-01", "01-02"]
  provides: ["redesigned /showcase route"]
  affects: ["src/app/showcase/page.tsx"]
tech_stack:
  added: []
  patterns: ["featured-first split", "image-led project cards", "inline mid-scroll CTA"]
key_files:
  created:
    - public/images/showcase/ink37-tattoos.jpg
    - public/images/showcase/tenantflow.jpg
    - public/images/showcase/revops-portfolio.jpg
    - public/images/showcase/jirah-shop.jpg
  modified:
    - src/app/showcase/page.tsx
decisions:
  - "Featured selection uses items.find(i => i.featured) (first by displayOrder) so jirah-shop renders full-width on first render."
  - "Support grid is 1/2/3 cols at mobile/tablet/desktop per spec; replaces the prior 1/2-col grid."
  - "All em-dash characters (3 occurrences: metadata.description x2, hero lead paragraph) replaced with periods."
  - "Stats bar '1-4 wks' uses ASCII hyphen (the prior '1–4' en-dash was the only one in the file)."
metrics:
  completed_date: 2026-05-21
---

# Phase 01 Plan 03: Rewrite /showcase Page Summary

Featured-first layout wired end-to-end: jirah-shop renders full-width with 4:3 image header, three support cards render in a 3-col responsive grid below, and a new inline CTA sits between the grid and the existing closing CTA.

## Sections Rewritten

| Section | Change |
|---|---|
| `metadata.description` (and OG) | Replaced em-dash with period |
| Hero lead paragraph | Replaced em-dash with period |
| Stats bar "First Delivery" value | `1–4 wks` (en-dash) -> `1-4 wks` (hyphen) |
| `ShowcaseProjects` projects section header | Eyebrow `Showcase` -> `Featured`; H2 `Featured Showcase Entries` -> `Four small businesses. <span text-accent>One thing in common.</span>`; lead rewritten; eyebrow color `text-accent` -> `text-accent-text` per a11y rule |
| Project grid | 2-col grid with `featured: true` claiming `md:col-span-2` -> explicit split: `featuredItem` rendered in `mb-12` div, `supportItems` rendered in `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| Every `<Card variant="project" />` | Now passes `imageUrl={item.imageUrl}` / `imageUrl={featuredItem.imageUrl}` |
| Inline CTA section | NEW, inside `ShowcaseProjects` after the projects section; spotlight + accent surface |
| Hero, TypewriterText, stats bar structure, closing CTA section | UNCHANGED |

## Featured-First Split Verified

- `getShowcaseItems()` returns rows ordered `asc(displayOrder), desc(createdAt)`.
- DB state (per prompt): JirahShop displayOrder 0 (featured), Ink 37 Tattoos 1 (featured), TenantFlow 2 (featured), RevOps Portfolio 3 (not featured).
- `items.find(i => i.featured)` selects the FIRST featured item in iteration order = JirahShop. Confirmed by code path.
- Graceful fallback: when `featuredItem` is null, the support grid receives all items and the featured block is not rendered.

## Verbatim Copy Strings Added

**Section header (between stats bar and project grid):**
- Eyebrow: `Featured`
- H2: `Four small businesses. One thing in common.` (second sentence wrapped in `<span className="text-accent">`)
- Lead: `A website built around what they actually needed, not what looked good in a template.`

**Inline CTA (between project grid and closing CTA):**
- H3: `Want your business on this page?`
- Body: `Free 30 minute call. We map out pages, timeline, and a clear price for your website. No sales pitch.`
- Button: `Get My Free Website Plan` (existing copy reused)
- Trust signal: `30-minute call · No commitment · Reply within 2 hours` (U+00B7 MIDDLE DOT separators, not em-dash)

**Metadata.description (and openGraph.description):**
- `Real websites delivering measurable results for small businesses. See how we help local businesses get found online, win customers, and grow.`

**Hero lead paragraph (rewritten clause only):**
- `Real websites for small businesses. See how we help local businesses get found online, win customers, and grow.`

## Em/En-Dash Grep Result

```
$ grep -nE "—|–" src/app/showcase/page.tsx
$ echo $?
1
```

Zero matches. Three pre-existing em-dash characters (metadata description x2, hero lead) and one en-dash (`1–4 wks` in stats bar) were all replaced.

## Build Status

| Check | Status |
|---|---|
| `bun run lint` (Biome) | PASS - Checked 275 files, no fixes applied |
| `bun run typecheck` (tsc --noEmit) | PASS - no output |
| `bun run build` (next build --webpack) | PASS - Compiled successfully in 2.4s, 170/170 static pages generated |

## Divergences from Spec

None. Layout, copy strings, prop wiring, and class names match the plan and section 5.2 of `01-CONTEXT.md` exactly. The 4 JPGs (already on disk from Wave 1) are staged together with `src/app/showcase/page.tsx` in the same commit.

## Self-Check: PASSED

- `src/app/showcase/page.tsx` modified and on disk
- All 4 JPGs present at `public/images/showcase/`
- `bun run lint && bun run typecheck && bun run build` all green
- Zero em/en-dash characters in the file
