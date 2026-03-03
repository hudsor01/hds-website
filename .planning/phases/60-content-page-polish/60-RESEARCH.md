# Phase 60: Content Page Polish - Research

**Researched:** 2026-03-01
**Domain:** Next.js 15 App Router page layout redesign — Services, About, Contact, Location pages
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- All 4 pages use the same dark hero as the homepage: dark background with spotlight/gradient treatment, bold h1 + subtext — strong visual continuity across the site
- Testimonials to use: static/hardcoded content for now (not queried from DB)
- Closing CTA section (dark background, bold headline, primary button): Services and About pages only — Contact and Location are already destination pages, no redundant closing CTA
- CTA button style throughout body: same as homepage — `Button variant="accent"` for primary actions
- Contact form: already built and functional — layout polish only, no new form logic
- Contact page layout: two-column — contact form on the left, contact info (email, phone, hours) on the right
- Location pages: full landing page treatment — hero, trust signals, services list, and closing CTA section. Not a minimal SEO page.

### Claude's Discretion

- Eyebrow labels, container widths, breadcrumbs on hero sections
- Which trust signal types appear and on which pages
- Services page layout style (card grid vs. stacked sections)
- About page section order
- Exact CTA copy per page
- Whether location pages share a single template or are individually defined

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAGE-01 | Services page feels like a premium landing page — clear service sections, visual hierarchy, and CTAs | Hero pattern with grid-pattern-subtle + hero-spotlight; Card variant="service" already exists; closing CTA section pattern documented |
| PAGE-02 | About page communicates trust and expertise — consistent with overall brand aesthetic | Existing content structure is strong; section reordering + trust signals (hardcoded testimonials via Card variant="testimonial") adds credibility |
| PAGE-03 | Location page template is polished — local focus, service area, contact pathways | Individual slug page (`/locations/[slug]`) needs full treatment: hero with grid+spotlight, trust signals, services list, closing CTA; index page needs hero treatment upgrade |
| PAGE-04 | Contact page has a balanced, professional layout — form + contact info clearly structured | Two-column layout: form left, contact info right; existing ContactForm already functional; layout polish only |
</phase_requirements>

---

## Summary

All four pages already exist and have meaningful content. The gap between current state and the required premium standard is primarily layout elevation, not content creation. The pages are missing: (1) the `grid-pattern-subtle dark:grid-pattern-dark` + `hero-spotlight` background treatment in their hero sections that the homepage uses; (2) hardcoded trust signals (testimonials or stat blocks); and (3) tighter visual hierarchy in body sections.

The design system tokens (Phase 56), polished components (Phase 58), and `ToolPageLayout` pattern (Phase 59) are all in place. This phase consumes those foundations. The key implementation patterns are all already proven in `src/app/page.tsx` — the closing CTA section, the metric grid with gap-px dividers, the section eyebrow + heading + lead pattern, and the hero spotlight overlay. Every pattern needed already exists in the codebase.

The Services page has a critical issue: it is marked `'use client'` but has no client-side hooks or state — this is unnecessary and must be fixed. The `Card variant="service"` component is already built and used there, which is good. The About page is a Server Component and well-structured but its hero is missing the grid/spotlight treatment. The Contact page is a Server Component with a good two-column structure but the left column information hierarchy can be sharpened. Individual location pages (`/locations/[slug]`) need hero grid/spotlight overlays added since they're currently missing them.

**Primary recommendation:** Apply the homepage hero treatment (grid-pattern-subtle + hero-spotlight overlays, `relative z-10` wrapper) to all four pages, add hardcoded testimonial cards from Card variant="testimonial" on Services and About, fix `'use client'` on Services page, then refine Contact page left-column info hierarchy and tighten the Location slug page sections.

---

## Standard Stack

### Core (no new dependencies — zero install required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15.x | Page component + metadata | Already in use; Server Components by default |
| Tailwind CSS v4 | 4.x | Utility classes + design tokens | All tokens already defined in globals.css |
| Lucide React | latest | Icons | Project standard; modular imports enabled |
| shadcn Card | Phase 58 | testimonial/service card variants | Already built with variant="testimonial" |
| shadcn Button | Phase 58 | CTA buttons | variant="accent" for primary actions |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/dynamic | 15.x | Lazy-load ContactForm and GoogleMap | Already in contact/page.tsx — keep as-is |
| JsonLd | local | Structured data injection | Already used in about/page.tsx and location slug page |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hardcoded testimonials | DB query | DB query adds complexity; context locks hardcoded for now |
| Card variant="testimonial" | Custom markup | Already built, consistent with design system — use it |
| Shared location template component | Individual page definitions | Single template is simpler and consistent — Claude's discretion recommends shared template |

**Installation:** None required. All dependencies already in use.

---

## Architecture Patterns

### Recommended File Changes

```
src/app/
├── services/page.tsx         # Remove 'use client', add hero overlays, add trust signals
├── about/page.tsx            # Add hero overlays, reorder sections if needed, add testimonials
├── contact/page.tsx          # Polish left-column info hierarchy, sharpen contact info block
└── locations/[slug]/page.tsx # Add hero overlays (grid + spotlight), upgrade CTA section
```

No new files required. All four pages are Server Components after fixing Services.

### Pattern 1: Hero Section with Grid + Spotlight Treatment

**What:** The homepage hero uses two layered `absolute inset-0` divs — one for the subtle grid and one for the amber spotlight radial gradient — over a `relative overflow-hidden bg-background` section wrapper.

**When to use:** On every page hero per locked decision.

**Example (from src/app/page.tsx lines 116–137):**
```tsx
<section className="relative overflow-hidden bg-background">
  <div
    className="absolute inset-0 grid-pattern-subtle dark:grid-pattern-dark pointer-events-none"
    aria-hidden="true"
  />
  <div
    className="hero-spotlight absolute inset-0 pointer-events-none"
    aria-hidden="true"
  />
  <div className="relative z-10 container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
    {/* hero content */}
  </div>
</section>
```

The About and Location slug pages are currently missing the two overlay divs — only the container div is present.

### Pattern 2: Closing CTA Section (Services + About only)

**What:** Rounded card with `hero-spotlight` overlay, centered heading, lead text, and two-button row.

**Example (from src/app/page.tsx lines 450–500):**
```tsx
<section className="py-section px-4 sm:px-6">
  <div className="container-wide">
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-10 md:p-16 text-center">
      <div
        className="hero-spotlight absolute inset-0 opacity-60 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10">
        <h2 className="text-section-title text-foreground mb-6 max-w-3xl mx-auto text-balance">
          {/* heading */}
        </h2>
        <p className="text-lead text-muted-foreground mb-10 max-w-2xl mx-auto">
          {/* subtext */}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="accent" size="xl" trackConversion={true}>
            <Link href="/contact">{/* CTA */}</Link>
          </Button>
          <Button asChild variant="outline" size="xl" ...>
            <Link href={/* secondary */}>{/* secondary label */}</Link>
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>
```

Services page already has this pattern. About page already has it too — both are already complete on this point.

### Pattern 3: Section Eyebrow + Heading + Lead

**What:** Every body section uses the same three-line header: `text-xs font-semibold uppercase tracking-widest text-accent` eyebrow, `text-section-title` h2, `text-lead text-muted-foreground` paragraph.

**Example (from src/app/page.tsx lines 249–261):**
```tsx
<div className="text-center mb-10">
  <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
    What We Build
  </p>
  <h2 className="text-section-title text-foreground mb-comfortable text-balance">
    One Partner. Three Phases. End to End.
  </h2>
  <p className="text-lead text-muted-foreground max-w-2xl mx-auto">
    {/* description */}
  </p>
</div>
```

### Pattern 4: Metric Grid with Gap-px Dividers

**What:** A grid using `gap-px bg-border/30 rounded-2xl overflow-hidden` so border color shows as 1px dividers between cells, each cell `bg-background` with an accent top-bar and large tabular number.

**Example (from src/app/page.tsx lines 321–343):**
```tsx
<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden">
  {results.map(result => (
    <div key={result.metric} className="bg-background px-8 py-10 text-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-accent" />
      <div className="text-4xl lg:text-5xl font-black text-accent mb-2 font-mono tabular-nums">
        {result.metric}
      </div>
      <div className="text-sm font-semibold text-foreground mb-1">{result.label}</div>
      <div className="text-xs text-muted-foreground">{result.period}</div>
    </div>
  ))}
</div>
```

Services page already has this for stats. About page has inline metrics inside the founder card. The location slug pages already use this for their 3-stat block.

### Pattern 5: Testimonial Card (hardcoded, static data)

**What:** Use `Card variant="testimonial"` from `src/components/ui/card.tsx`. The component renders rating stars, optional highlight badge, quote, and client info. Pass static data directly in the page — no DB query.

**Example usage:**
```tsx
import { Card } from '@/components/ui/card'

// Hardcoded trust signals (per locked decision)
const testimonials = [
  {
    testimonialId: 1,
    name: 'Jane Smith',
    company: 'Acme Corp',
    role: 'CEO',
    content: 'Hudson Digital built our site and automated our onboarding — we saved 10 hours a week.',
    rating: 5,
    service: 'Business Automation',
    highlight: '10 hrs/week saved'
  }
]

// In JSX:
<div className="grid md:grid-cols-2 gap-6">
  {testimonials.map(t => (
    <Card
      key={t.testimonialId}
      variant="testimonial"
      testimonialId={t.testimonialId}
      name={t.name}
      company={t.company}
      role={t.role}
      content={t.content}
      rating={t.rating}
      service={t.service}
      highlight={t.highlight}
    />
  ))}
</div>
```

### Pattern 6: Contact Page Two-Column Layout (left=form, right=info)

**What:** The current contact/page.tsx already uses `grid grid-cols-1 lg:grid-cols-2` with the hero content left and form right. The locked decision flips this: form left, contact info right. The form column (left) should use the existing dynamic-imported `ContactForm`. The right column should show email, phone, hours, and optionally the "What Happens Next" steps card.

**Current gap:** Right column of the contact page currently has the "What Happens Next" card and trust badges — this content should move to the right after the form moves left.

### Pattern 7: Services Page — Remove 'use client'

**What:** The Services page is marked `'use client'` but has no hooks, state, or event handlers. The `Card variant="service"` component is itself `'use client'` (it imports from card.tsx which is 'use client'), but that does NOT require the page itself to be a client component — Next.js handles this automatically when a server component renders a client child.

**Fix:** Remove `'use client'` from `src/app/services/page.tsx`. Also add `export const metadata: Metadata = { ... }` — currently missing (can't export metadata from client components, which is why it was omitted). After removing `'use client'`, metadata export becomes possible.

**Impact:** Enables metadata export for SEO, reduces client bundle for services page.

### Anti-Patterns to Avoid

- **'use client' on page components without state/hooks:** Already present on Services page — remove it.
- **metadata export from 'use client' pages:** Next.js silently ignores it. Fix by making page a Server Component.
- **Querying DB for testimonials:** Locked decision says hardcoded. Do not add DB queries.
- **Redundant closing CTA on Contact/Location pages:** Locked decision explicitly forbids these — those pages are already destination pages.
- **Skipping `relative z-10` on hero content:** Without `z-10`, the grid/spotlight overlays would sit above content. Always wrap hero content in `relative z-10`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Testimonial display | Custom testimonial markup | `Card variant="testimonial"` | Already built in Phase 58, consistent with design system |
| Service card display | Custom service markup | `Card variant="service"` | Already used on services page, consistent |
| Hero background treatment | Custom CSS | `grid-pattern-subtle dark:grid-pattern-dark` + `hero-spotlight` classes | Already defined in globals.css, proven on homepage |
| Closing CTA section | Custom component | Inline pattern from homepage | Already proven pattern, no abstraction needed (YAGNI) |
| Metric display grid | Custom grid | gap-px divider pattern from homepage | Already proven, tokens already applied |

**Key insight:** This phase is about applying existing patterns to under-styled pages, not building new patterns. The whole library of patterns is in `src/app/page.tsx`.

---

## Common Pitfalls

### Pitfall 1: Forgetting `relative z-10` on Hero Content Wrapper

**What goes wrong:** The grid pattern and spotlight overlays are `absolute inset-0` — without `relative z-10` on the content div, the overlays sit on top of content and block interaction.

**Why it happens:** Copying the section wrapper without also copying the `relative z-10` on the content div.

**How to avoid:** Always apply the full three-part structure: `section[relative overflow-hidden]` > `div[absolute inset-0]` overlay(s) > `div[relative z-10]` content.

**Warning signs:** Text visible but links/buttons not clickable in hero.

### Pitfall 2: Exporting metadata from 'use client' Page

**What goes wrong:** Next.js silently ignores `metadata` exports from `'use client'` components. Services page currently cannot export metadata.

**Why it happens:** The page was marked `'use client'` and then the developer couldn't add metadata.

**How to avoid:** Remove `'use client'` from services/page.tsx (it has no client-side hooks). Metadata can then be exported normally.

**Warning signs:** TypeScript type error if you try to export `metadata` alongside `'use client'`.

### Pitfall 3: Card variant="testimonial" Requires All Required Props

**What goes wrong:** TypeScript will reject `Card variant="testimonial"` if `testimonialId`, `name`, `company`, `role`, `content`, or `rating` are missing.

**Why it happens:** The card uses a discriminated union type — all required fields must be present.

**How to avoid:** Provide all required props in the hardcoded data arrays.

**Warning signs:** TypeScript error on Card usage.

### Pitfall 4: Location Slug Page Already Has Mostly the Right Structure

**What goes wrong:** Over-engineering location slug changes — the page already has stats, services, neighborhoods, and CTA sections. The main gaps are: (1) missing hero grid/spotlight overlays, (2) hero content could benefit from hero-spotlight treatment matching homepage.

**Why it happens:** Treating location pages as "minimal SEO pages" rather than full landing pages.

**How to avoid:** Add the hero overlay divs (2-line change), verify sections look polished with existing content — the locked decision says "full landing page treatment" but the structure is mostly already there.

### Pitfall 5: Contact Page Column Order Flip

**What goes wrong:** Current contact page has hero content (including "What Happens Next" card) on left, form on right. The locked decision specifies form on left, contact info on right.

**Why it happens:** Misreading current layout direction.

**How to avoid:** Form goes in `lg:col-span-1` left column. Right column gets: contact info (email/phone/hours), the "What Happens Next" numbered steps card, and trust badges. This is the opposite of current layout.

---

## Code Examples

### Hero Section Template (apply to all 4 pages)

```tsx
// Source: src/app/page.tsx (proven pattern)
<section className="relative overflow-hidden bg-background">
  <div
    className="absolute inset-0 grid-pattern-subtle dark:grid-pattern-dark pointer-events-none"
    aria-hidden="true"
  />
  <div
    className="hero-spotlight absolute inset-0 pointer-events-none"
    aria-hidden="true"
  />
  <div className="relative z-10 container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20 text-center">
    <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
      {eyebrow}
    </p>
    <h1 className="text-page-title text-foreground leading-tight text-balance">
      {heading}
    </h1>
    <p className="text-lead text-muted-foreground max-w-2xl mx-auto mt-6 mb-10">
      {subtext}
    </p>
    {/* optional CTA buttons */}
  </div>
</section>
```

### Services Page — Remove 'use client' + Add Metadata

```tsx
// BEFORE: 'use client' (remove this line)
// AFTER: plain server component

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Services | Hudson Digital Solutions',
  description: 'Custom web development, integrations, and business automation. Starting at $2,000.',
  openGraph: {
    title: 'Our Services | Hudson Digital Solutions',
    description: 'Website development, tool integrations, and workflow automation for growing businesses.'
  }
}

// Rest of component unchanged except hero section gets overlay divs
```

### Hardcoded Testimonials Array Pattern

```tsx
// Place at top of page file, outside component
const testimonials = [
  {
    testimonialId: 1 as const,
    name: 'Sarah Mitchell',
    company: 'Bright Spark Consulting',
    role: 'Founder',
    content: 'Our lead volume doubled in the first month after launch. The automation alone saves us 12 hours a week.',
    rating: 5 as const,
    service: 'Website Development + Automation',
    highlight: '2x lead volume'
  },
  {
    testimonialId: 2 as const,
    name: 'Marcus Holt',
    company: 'Gulf Coast Roofing',
    role: 'Operations Manager',
    content: 'We went from manually following up on every quote to having it all run automatically. Game changer.',
    rating: 5 as const,
    service: 'Business Automation',
    highlight: 'Zero manual follow-ups'
  }
] satisfies Array<{
  testimonialId: number
  name: string
  company: string
  role: string
  content: string
  rating: number
  service: string
  highlight: string
}>
```

### Contact Page Two-Column Layout (form left, info right)

```tsx
// Two-column: form left, contact info right
<section className="relative overflow-hidden bg-background">
  <div className="relative z-10 container-wide px-4 sm:px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* LEFT: Form */}
      <div className="rounded-xl border border-border bg-surface-raised p-8">
        <h2 className="text-h3 text-foreground mb-3 text-balance">
          Claim Your Free Strategy Call
        </h2>
        <Suspense fallback={<ContactFormSkeleton />}>
          <ContactForm />
        </Suspense>
      </div>

      {/* RIGHT: Info */}
      <div className="space-y-8">
        {/* eyebrow + heading */}
        {/* What Happens Next card */}
        {/* Contact info (email, phone, hours) */}
        {/* Trust badges */}
      </div>
    </div>
  </div>
</section>
```

---

## Current State Assessment

### What Already Works Well (Do Not Regress)

| Page | What's Good | What Needs Polish |
|------|-------------|-------------------|
| Services | Hero eyebrow+h1, service cards, process steps, closing CTA section | Missing hero grid/spotlight overlays, no metadata (client page), no trust signals |
| About | Full content, closing CTA, founder quote, mission/guarantee cards | Missing hero grid/spotlight overlays, no testimonials |
| Contact | Dynamic imports, two-column structure, contact form functional | Column order needs flip (form left), hero missing overlays |
| Location /[slug] | Stats grid, services features, CTA section, structured data | Missing hero grid/spotlight overlays |
| Location /index | State-grouped city list, CTA section | Missing hero grid/spotlight overlays |

### Page-by-Page Change Summary

**Services page (`services/page.tsx`):**
1. Remove `'use client'` directive
2. Add `export const metadata: Metadata = {...}`
3. Add `grid-pattern-subtle dark:grid-pattern-dark` + `hero-spotlight` overlays to hero section
4. Add a testimonials section (2 hardcoded testimonials using `Card variant="testimonial"`)

**About page (`about/page.tsx`):**
1. Add `grid-pattern-subtle dark:grid-pattern-dark` + `hero-spotlight` overlays to hero section
2. Add a testimonials section (2 hardcoded testimonials) — place after story or after expertise section
3. Section order (Claude's discretion): Story → Founder → Expertise → Values → Testimonials → CTA

**Contact page (`contact/page.tsx`):**
1. Add `grid-pattern-subtle dark:grid-pattern-dark` + `hero-spotlight` overlays to hero section
2. Swap column order: form on left, contact info on right
3. Add contact info block to right column (email, phone, business hours)
4. Keep map section as-is below the fold

**Location slug page (`locations/[slug]/page.tsx`):**
1. Add `grid-pattern-subtle dark:grid-pattern-dark` + `hero-spotlight` overlays to hero section
2. Add trust signals section (Claude's discretion: 2 hardcoded testimonials that are "local business" themed)
3. All other sections (stats, services, neighborhoods, CTA) are already well-structured

**Location index page (`locations/page.tsx`):**
1. Add `grid-pattern-subtle dark:grid-pattern-dark` + `hero-spotlight` overlays to hero section
2. Minor — the city grid itself is functional; the hero is the main gap

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `'use client'` page for no reason | Server Component by default | Phase 59 decision | Enables metadata export, reduces JS bundle |
| DB-queried testimonials | Hardcoded static for now | Phase 60 decision (CONTEXT.md) | Simpler, no DB dependency |
| Custom hero markup | grid-pattern + hero-spotlight utility classes | Phase 56/57 | Consistent treatment via CSS utilities |
| Scattered hardcoded hex/rgb | OKLCH design tokens | Phase 56 | All colors via `var(--color-*)` or token classes |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright (E2E) + bun:test (unit) |
| Config file | `playwright.config.ts` |
| Quick run command | `bun run test:e2e:fast` (chromium only) |
| Full suite command | `bun run test:e2e` |
| Estimated runtime | ~60–120 seconds (E2E fast mode) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAGE-01 | Services page renders h1, service cards, and CTA button | e2e smoke | `bun run test:e2e:fast -- --grep "services"` | Partial (user-flows-validation.spec.ts has services navigation) |
| PAGE-02 | About page renders h1, trust signal section | e2e smoke | `bun run test:e2e:fast -- --grep "about"` | No dedicated test — Wave 0 gap |
| PAGE-03 | Location slug page renders hero h1, stats, services list, CTA | e2e smoke | `bun run test:e2e:fast -- --grep "location"` | ✅ e2e/locations.spec.ts |
| PAGE-04 | Contact page renders two-column layout with form on left | e2e smoke | `bun run test:e2e:fast -- --grep "contact"` | ✅ e2e/contact-form.spec.ts |

### Nyquist Sampling Rate

- **Minimum sample interval:** After every committed task → run: `bun run test:e2e:fast`
- **Full suite trigger:** Before merging final task of any plan wave
- **Phase-complete gate:** Full suite green before `/gsd:verify-work` runs
- **Estimated feedback latency per task:** ~60 seconds

### Wave 0 Gaps

- [ ] `e2e/content-pages.spec.ts` — covers PAGE-01 (services hero + cards + CTA), PAGE-02 (about hero + testimonials), PAGE-03 (location full treatment), PAGE-04 (contact two-column layout verification)

Note: PAGE-03 and PAGE-04 have partial coverage already (`locations.spec.ts`, `contact-form.spec.ts`) but those tests focus on functional behavior (form submission, location links), not visual layout requirements. The new Wave 0 test file should cover layout structure assertions: h1 presence, grid-pattern class presence is not easily assertable, but section count, button text, and two-column grid can be checked.

---

## Open Questions

1. **Contact page right column content — what contact info to show?**
   - What we know: The CONTEXT.md says "contact info (email, phone, hours)" on the right
   - What's unclear: Exact business hours, phone number format, email display
   - Recommendation: Use `BUSINESS_INFO` constant from `src/lib/constants/business.ts` — check what's defined there; supplement with hardcoded hours if needed

2. **Location testimonials — page-specific or generic?**
   - What we know: Testimonials should be hardcoded; location pages need trust signals
   - What's unclear: Should testimonials reference the city, or are generic testimonials acceptable?
   - Recommendation: Use generic business testimonials (same 2 as other pages). The location data already provides city-specific content via stats and neighborhoods. No need for city-specific quotes.

3. **Services page metadata — description length?**
   - What we know: SEO_CONFIG is used on About, About uses `SEO_CONFIG.about`. Services page currently has no metadata.
   - What's unclear: Whether `SEO_CONFIG.services` exists
   - Recommendation: Check `src/utils/seo.ts` for `SEO_CONFIG.services` — if it exists, use it like About does. If not, write inline metadata (120–160 chars per CLAUDE.md).

---

## Sources

### Primary (HIGH confidence)

- `src/app/page.tsx` — Homepage with all patterns: hero overlays, section eyebrow pattern, metric grid, closing CTA section, button usage
- `src/app/globals.css` — Full design token inventory, utility class definitions (grid-pattern-subtle, hero-spotlight, py-section, container-wide, text-page-title, etc.)
- `src/components/ui/card.tsx` — Card component with all variants including "testimonial" and "service"; prop interfaces confirmed
- `src/components/ui/button.tsx` — Button variants: accent, outline, ghost; size variants: xl, lg, sm
- `src/components/layout/ToolPageLayout.tsx` — Reference for how Phase 59 laid out tool pages (slot pattern)
- CONTEXT.md (Phase 60) — Locked decisions and discretion areas

### Secondary (MEDIUM confidence)

- `e2e/user-flows-validation.spec.ts` — Confirmed services page and contact navigation tests exist
- `e2e/locations.spec.ts` — Confirmed location page test coverage exists
- `e2e/contact-form.spec.ts` — Confirmed contact form functional tests exist

### Tertiary (LOW confidence)

- None — all findings are from direct codebase inspection.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies; all patterns confirmed in codebase
- Architecture: HIGH — patterns copied from existing homepage, confirmed in source
- Pitfalls: HIGH — discovered by reading actual current page code (services 'use client', contact column order)
- Validation: MEDIUM — E2E tests exist but page-layout-specific assertions are a Wave 0 gap

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable patterns from existing codebase)
