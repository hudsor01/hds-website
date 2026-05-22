# Showcase Page UI/UX Redesign — Design Spec

**Date:** 2026-05-21
**Branch:** `showcase-ui-enhance`
**Scope:** `/showcase` page only. Data layer + Card component get minor extensions; no breaking changes to existing showcase consumers.

## 1. Context & Problem

The current `/showcase` page renders projects as full-text cards with no imagery. Three issues:

1. **No visual hook.** Cards are pure text + metric numbers + tech chips on a white background. Nothing about the page actually shows what the websites look like, which is the entire reason a prospect visits a showcase.
2. **Featured cards waste vertical space.** Featured projects render at full width; non-featured at half. With 3 projects, the third sits as a single half-width card with empty whitespace beside it.
3. **The "Featured Showcase Entries" header is generic** and the page lacks a conversion moment between the project grid and the closing CTA.

A 4th project (JirahShop, K-beauty e-commerce) is being added, which makes a 2×2 layout viable but also forces a decision about which project leads.

## 2. Goals

**Primary:** turn the showcase into a stronger conversion surface for the "Get My Free Website Plan" CTA. Visitors should see proof, not text.

Concrete metrics this redesign optimizes:
- Visible imagery on every project (homepage screenshots)
- One project featured prominently (the most visually compelling)
- A mid-scroll CTA so visitors don't have to reach the bottom to convert
- Page-wide consistency with the rest of the live site (light theme, OKLCH tokens, real utility classes from `globals.css`)

**Non-goals:**
- No filtering, sorting, or category chips (rejected during brainstorming)
- No outcome ladder / badges strip in the hero (rejected during brainstorming)
- No animation beyond the existing typewriter
- No changes to `/showcase/[slug]` detail pages
- No changes to the showcase data table schema

## 3. Final Layout (Approved)

Top-to-bottom on `/showcase`:

1. **Hero** — centered, typewriter-led. Mirrors the existing live hero.
   - Eyebrow: `Showcase` (lines on either side, accent color via `text-accent-text`)
   - H1: existing `<TypewriterText />` cycling `Real Projects.` / `Real Results.` with blinking caret
   - Lead: existing copy ("Real websites for small businesses. See how we help local businesses get found online, win customers, and grow.")
   - Two CTAs: `Get My Free Website Plan` (accent) + `View Services` (outline)
2. **Stats bar** — keep existing 4-column metric strip (Projects Delivered, First Delivery, Track Record, Response Time). Stat 1 updates to `4+` once the 4th project ships.
3. **Section header** — new
   - Eyebrow: `Featured`
   - H2: `Four small businesses. One thing in common.` (the second clause in `text-accent`)
   - Lead: `A website built around what they actually needed, not what looked good in a template.`
4. **Featured project card** — full width, image left, content right (1.05fr / 1fr grid)
   - Slug: `jirah-shop`
   - Image: `/images/showcase/jirah-shop.jpg` (`object-cover`, `object-position: top center`)
   - Tag overlay top-left: `★ Featured · E-Commerce`
   - Body: eyebrow row (`E-Commerce` + `Case Study` pill), H3 title, description, 3-up metric row, tech-stack chips, dual link row (`Read the case study →` + `Visit shopatjirah.com ↗`)
5. **Support cards grid** — 3 columns of image-led cards (16:9 image area + body)
   - Order: Ink 37 Tattoos, TenantFlow, RevOps Portfolio
   - Each: pill overlay (`Case Study` or `Portfolio`), eyebrow (category), H4 title, short desc, 2-up metric row
   - Cards use `hover-lift` style transition (existing utility)
6. **Inline CTA** — new
   - Surface uses accent spotlight treatment (same gradient pattern as homepage closing CTA)
   - H3: `Want your business on this page?`
   - Body: `Free 30 minute call. We map out pages, timeline, and a clear price for your website. No sales pitch.`
   - CTA button: `Get My Free Website Plan`
   - Trust signals: `30-minute call · No commitment · Reply within 2 hours`
7. **Existing closing CTA section** — keep as-is. Two CTAs on this page is intentional (conversion at mid-scroll and at end-of-content).

## 4. Data Layer Changes

The `Showcase` schema already has `imageUrl` (nullable). The redesign requires it to be populated for all 4 displayed projects. No schema migration; this is a data update.

**Slug → image mapping:**

| Project | Status | imageUrl | Source |
|---|---|---|---|
| Ink 37 Tattoos | existing (look up slug in DB) | `/images/showcase/ink37-tattoos.jpg` | ink37tattoos.com |
| TenantFlow | existing (look up slug in DB) | `/images/showcase/tenantflow.jpg` | tenantflow.app |
| RevOps Consultant Portfolio | existing (look up slug in DB) | `/images/showcase/revops-portfolio.jpg` | richardwhudsonjr.com |
| JirahShop | new — slug `jirah-shop` | `/images/showcase/jirah-shop.jpg` | shopatjirah.com |

Executor: read the live `slug` for the 3 existing items from the showcase DB before writing the update SQL. Don't invent.

The 4 JPGs already live at `public/images/showcase/`. They were captured via Playwright at 1440x900 retina (2x) and saved as quality-88 JPEG. File sizes 188K to 352K.

**New `jirah-shop` row** needs to be inserted with these fields (final copy/metrics TBD with the user during implementation, placeholders in spec):
- `slug: 'jirah-shop'`
- `title: 'JirahShop'`
- `clientName: 'JirahShop'`
- `industry: 'E-Commerce'`
- `projectType: 'Online Store'`
- `category: 'E-Commerce'`
- `showcaseType: 'detailed'`
- `featured: true`
- `displayOrder`: set to **one less than the current minimum** across existing rows, so it sorts first (the projects render in `asc(displayOrder)` order)
- `externalLink: 'https://www.shopatjirah.com/'`
- `technologies`: `['Shopify', 'Liquid', 'Klaviyo', 'Hydrogen']` (placeholder — replace with real stack)
- `metrics`: 3 placeholders to be confirmed with the user

## 5. Component Changes

### 5.1 `Card` (`src/components/ui/card.tsx`) — `variant="project"`

The existing project card receives an image area. Card props gain one optional field:

```ts
interface ProjectCardProps {
  // existing fields…
  imageUrl?: string | null
  imageAlt?: string  // defaults to `${title} homepage`
}
```

Render behavior:
- If `imageUrl` is present: render a 16:9 image header (4:3 when `featured`), with `object-cover` and `object-position: top`, plus the existing overlay pills (`Featured` / `Case Study` / `Portfolio`)
- If `imageUrl` is absent: render the current accent-bar header (no regression for cards without images)
- Use Next.js `<Image>` with `width={1440} height={900}` (4:3 featured) / `width={800} height={450}` (support), `sizes` set appropriately, `priority` only on the featured card

This change is **additive**. Existing showcase items without `imageUrl` continue to render as today.

### 5.2 `src/app/showcase/page.tsx`

- **Hero section** remains structurally similar to current.
- **Stats bar** unchanged structurally; the dynamic `${items.length}+` becomes `4+` automatically when the 4th item ships.
- **`ShowcaseProjects` async component** is restructured:
  - Section header (eyebrow + H2 + lead) becomes a separate top-level subsection above the project grid.
  - Project grid logic changes: the **first `featured: true` item** (ordered by `displayOrder`) renders as the new full-width featured card; remaining items render in a 3-column grid below. Falls back gracefully if no items are featured (3-col grid only).
  - **New inline CTA section** is inserted between the support-card grid and the existing closing CTA. Uses the same spotlight + accent treatment pattern from the homepage.
- **Closing CTA section** unchanged. (Copy is already on-brand from the prior repositioning PR.)

### 5.3 New component: `<ShowcaseFeaturedCard />` (optional split)

If the project Card's project variant grows too dense, extract the featured/full-width treatment into a separate component file. Decision left to the executor based on file length after the change.

## 6. Copy Conventions

- **No em-dash (—) or en-dash (–) in any new copy.** Codified in `CLAUDE.md` and tracked in user memory. Replace with commas, periods, hyphens (`-`), or `to` for numeric ranges.
- All new copy is on-brand for the website-build positioning (PR #206).
- All new CTAs use `Get My Free Website Plan`.

## 7. Image Pipeline

- 4 JPGs already at `public/images/showcase/` (188K to 352K, retina 2x quality 88)
- Next.js Image component auto-converts to WebP at serve time (existing config: `formats: ['image/webp']`)
- All images served with `loading="lazy"` except featured (`priority`)
- Alt text: `${project.title} homepage` (component default)
- For the spec doc, the brainstorm mockup inlines these as base64 — that is **not** the production approach; production uses real file paths via Next.js Image.

## 8. Accessibility

- All images have meaningful alt text (project name + "homepage")
- Featured card and support cards both wrap with semantic `<article>` elements
- Overlay pill tags use `text-accent-text` (WCAG-compliant accent color for small text), not raw `text-accent`
- Hover states on support cards use `hover-lift` (existing utility); focus states via global `:focus-visible` rule
- Section landmarks use `<section>` with descriptive eyebrow text

## 9. Out of Scope

- Filtering / sorting / search UI (rejected)
- Outcome-ladder pill in hero (rejected)
- Detail page (`/showcase/[slug]`) changes
- Showcase data schema migrations
- Adding more than 4 projects
- Global em/en-dash sweep across the rest of the site (separate follow-up)

## 10. Verification

- `bun run lint && bun run typecheck` pass
- `bun run build` pass
- Local visual check: hero typewriter cycles correctly, featured card image loads with proper crop, support cards align in 3-column grid at desktop, inline CTA renders with spotlight, mobile layout collapses cleanly
- Verify all new copy contains zero em-dash / en-dash characters
- Verify Next.js Image serves WebP for the 4 screenshots in production build output

## 11. Image-Capture Tooling (Reusable Future Use)

A throwaway Playwright script was used to capture the 4 homepages at 1440x900 retina. Key learnings:
- `waitUntil: 'networkidle'` + 3-5s settle time is the baseline
- Sites using Framer Motion (or similar) initial-hidden states (`style="opacity:0"`) need a `page.evaluate()` step to force `opacity: 1` on hidden wrappers before screenshot, otherwise the hero renders empty
- `deviceScaleFactor: 2` gives retina-quality output suitable for `next/image` resizing

This learning should be captured in a future utility script if more project screenshots are added.
