---
phase: 01-showcase-ui-redesign
plan: 02
subsystem: ui
tags: [card, showcase, image]
requires: []
provides: [SHOWCASE-CARD]
affects: [src/components/ui/card.tsx]
tech-stack:
  added: [next/image (existing dep, new import site)]
  patterns: [conditional render branch, additive optional props, overlay pills]
key-files:
  created: []
  modified:
    - src/components/ui/card.tsx
decisions:
  - "Wrapped the entire in-body category/showcase/featured pill row in a single {!hasImage && (...)} conditional rather than per-pill conditionals. Cleanest diff and the row is a single semantic unit."
  - "Used text-accent-text (not text-accent) for the eyebrow on the image overlay per WCAG comment in globals.css; overlay pills sit on bg-card/90 to guarantee contrast over photo backgrounds."
  - "Eyebrow inside the body retains the original text-accent class to preserve zero-regression rendering for callers that omit imageUrl."
metrics:
  duration: ~5 min
  completed: 2026-05-21
---

# Phase 01 Plan 02: Card image-header support Summary

Additive `imageUrl` / `imageAlt` props on `Card` `variant="project"`, with a conditional Next.js `<Image>` header (4:3 for featured, 16:9 for standard) replacing the accent-bar when present; pill row moved to an absolute-positioned overlay so the body stays clean.

## Prop signature added

```ts
interface ProjectCardProps extends Omit<BaseCardProps, 'variant'> {
  // ...existing fields...
  externalLink?: string | null
  imageUrl?: string | null   // NEW
  imageAlt?: string          // NEW
}
```

Destructured in the project branch alongside existing props. Defaults:
- `hasImage = Boolean(imageUrl)`
- `resolvedAlt = imageAlt ?? \`${title} homepage\``

## Files modified

| File | Range | Change |
|------|-------|--------|
| `src/components/ui/card.tsx` | L5 | Added `import Image from 'next/image'` |
| `src/components/ui/card.tsx` | L87-88 | Added `imageUrl?: string \| null` and `imageAlt?: string` to `ProjectCardProps` |
| `src/components/ui/card.tsx` | L286-360 | Rewrote project card header: destructure new props, compute `hasImage` / `resolvedAlt`, conditional `<Image fill />` header with overlay pills vs. legacy accent bar; wrapped in-body pill row in `{!hasImage && (...)}` |

## Header rendering rules

- `hasImage === true`:
  - Wrapper: `<div className="relative w-full bg-muted overflow-hidden {featured ? 'aspect-[4/3]' : 'aspect-video'}">`
  - `<Image fill className="object-cover object-top" sizes={featured ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'} priority={featured} />`
  - Overlay pill row absolute-positioned `top-3 left-3 right-3`: category eyebrow + showcaseType chip + Featured chip
- `hasImage === false`:
  - Renders the original `<div className="h-1 bg-accent" />` and the original in-body pill row. Zero regression for callers that don't pass `imageUrl`.

## Overlay pill suppression pattern

Chose a single `{!hasImage && (<div>...</div>)}` wrapper around the entire category/showcase/featured row in the body rather than per-element conditionals. Reasons:
- One semantic unit (the category row) maps to one conditional.
- Minimal diff: the existing JSX inside the conditional is byte-for-byte identical to the prior version.
- No risk of mis-suppressing the H3 / description / metrics / tech stack, all of which must render in both branches.

## Edge cases

- `object-top` is the right default for homepage screenshots (hero is at the top). No portrait sources in `public/images/showcase/` (all four current assets are landscape: `ink37-tattoos.jpg`, `jirah-shop.jpg`, `revops-portfolio.jpg`, `tenantflow.jpg`), so no fallback needed.
- `imageUrl as string` cast inside the JSX is safe: it's only evaluated when `hasImage` is true (i.e., `imageUrl` is a non-empty string).
- Body H3 title, description, metrics row, tech-stack chips, and "View Project" hover hint remain unconditional in both branches.

## Verification

- `bun run lint`: PASS (Biome, 275 files, no fixes)
- `bun run typecheck`: PASS (tsc --noEmit, exit 0)
- Automated grep verify expression from plan: PASS (all 4 patterns match)
- Em/en-dash scan on diff: no matches introduced
- Visual smoke check: deferred to plan 04 per plan spec

## Self-Check: PASSED

- File `src/components/ui/card.tsx`: FOUND (modified)
- Imports include `next/image`: FOUND
- Both new props on `ProjectCardProps`: FOUND
- Conditional `aspect-[4/3]` / `aspect-video` branch: FOUND
- Commit hash recorded post-commit.
