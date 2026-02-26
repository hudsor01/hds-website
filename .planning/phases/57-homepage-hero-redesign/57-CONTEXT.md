# Phase 57: Homepage & Hero Redesign - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual redesign of the homepage only — hero section aesthetic, headline hierarchy, CTA treatment, and section vertical rhythm. No new pages, no new sections, no content changes. UI polish and design token application within the existing homepage structure.

</domain>

<decisions>
## Implementation Decisions

### Hero Background Treatment
- Visual character: Claude decides — must be consistent with overall design direction (dark, premium)
- Fully static — no animations, no CSS motion, no dynamic elements (v4.0 constraint)
- Hero-to-page transition: Claude decides based on what works best
- Purely typographic hero — no images, illustrations, device mockups, or decorative graphics
- **Global rule: NO gradients anywhere on the site** — this applies to backgrounds, text, borders, everything

### Headline Hierarchy
- Strong contrast: very large primary headline (uses `text-page-title` or `text-h1` token), much smaller supporting statement
- Headline color: plain foreground/white — no gradient text, no color treatment
- Supporting statement uses `muted-foreground` color to visually separate the two tiers
- Hero content is center-aligned
- No eyebrow label — headline is the first visual element in the hero

### CTA Visual Differentiation
- Primary CTA: solid filled brand accent color — high visual weight, unmissable
- Secondary CTA treatment: Claude decides (outlined or ghost — whichever cleanly separates from primary)
- Number of CTAs: Claude decides based on reading current homepage copy
- Hover/focus states: subtle only — slight color or border shift, no scale/lift/glow transforms

### Section Rhythm
- Section separation: whitespace only — generous vertical padding, no dividers, no alternating backgrounds
- Section heading alignment: Claude decides, but MUST be globally consistent across all sections
- Card/feature sections: apply Phase 56 card surface tokens (elevated surface, border, shadow) — cards visually distinct from page background
- One premium bento grid component from a shadcn UI repository for the feature/services section — source from shadcn/ui blocks or a well-regarded shadcn community repo

### Claude's Discretion
- Exact hero background CSS approach (dark solid, very subtle radial spotlight, etc.) — no gradient rule applies
- Secondary CTA variant (outlined vs ghost)
- Number of CTAs in hero (1 or 2) based on existing homepage copy
- Global section heading alignment (centered vs left) — must be consistent
- Hero-to-content transition treatment
- Exact bento grid block chosen from shadcn repository

</decisions>

<specifics>
## Specific Ideas

- Reference aesthetic: Resend, Linear, Clerk — purposeful dark, tight type scale, no visual noise
- Design token source: Phase 56 OKLCH tokens already established in globals.css — use them, don't introduce new hardcoded values
- Bento grid: source one high-quality premium block from shadcn/ui blocks (ui.shadcn.com/blocks) or a community shadcn registry — the grid should use the Phase 56 card surface tokens, not its own hardcoded colors

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 57-homepage-hero-redesign*
*Context gathered: 2026-02-26*
