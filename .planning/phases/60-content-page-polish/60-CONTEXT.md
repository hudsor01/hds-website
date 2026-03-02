# Phase 60: Content Page Polish - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform Services, About, Contact, and Location pages from functional-but-generic layouts into premium landing page experiences — clear hierarchy, trust signals, and polished CTAs. The design system tokens (Phase 56), polished components (Phase 58), and ToolPageLayout pattern (Phase 59) are already established and should be consumed here.

No new pages, no new functionality. Visual redesign and layout elevation only.

</domain>

<decisions>
## Implementation Decisions

### Page entry points
- All 4 pages use the same dark hero as the homepage: dark background with spotlight/gradient treatment, bold h1 + subtext — strong visual continuity across the site
- Eyebrow label above h1 (accent-colored uppercase label): Claude's discretion
- Container width for header content: Claude's discretion — match what reads best per page
- Breadcrumbs: Claude's discretion

### Trust signals
- Testimonials to use: static/hardcoded content for now (not queried from DB)
- Which pages get trust signals: Claude's discretion — place where they fit naturally
- Where on page: Claude's discretion — integrated where they add most credibility
- Trust signal type (testimonials, stats, portfolio links): Claude's discretion

### CTA strategy
- Primary conversion action per page: Claude's discretion — infer from page purpose
- Closing CTA section (dark background, bold headline, primary button): **Services and About pages only** — Contact and Location are already destination pages, no redundant closing CTA
- CTA button style throughout body: same as homepage — `Button variant="accent"` for primary actions
- Contact form: already built and functional — layout polish only, no new form logic

### Page-by-page structure
- **Services page**: layout choice (card grid vs. vertical sections) at Claude's discretion — fit to existing content
- **About page**: post-hero content ordering at Claude's discretion — structure to tell the most compelling story based on existing content
- **Location pages**: full landing page treatment — same quality as Services/About. Hero, trust signals, services list, and closing CTA section. Not a minimal SEO page.
- **Contact page**: two-column layout — contact form on the left, contact info (email, phone, hours) on the right

### Claude's Discretion
- Eyebrow labels, container widths, breadcrumbs on hero sections
- Which trust signal types appear and on which pages
- Services page layout style (card grid vs. stacked sections)
- About page section order
- Exact CTA copy per page
- Whether location pages share a single template or are individually defined

</decisions>

<specifics>
## Specific Ideas

- Visual consistency is the primary goal — all pages should feel like they belong to the same premium product as the homepage
- Location pages should not feel like afterthoughts — they get the full treatment (hero + sections + closing CTA)
- The Contact page form is the primary asset — the two-column layout should frame it well, not compete with it
- Reference the existing homepage (page.tsx) for patterns to reuse: dark hero classes, py-section utilities, container utilities, accent button, closing CTA section pattern

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 60-content-page-polish*
*Context gathered: 2026-03-02*
