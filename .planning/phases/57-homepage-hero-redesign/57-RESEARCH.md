# Phase 57: Homepage & Hero Redesign - Research

**Researched:** 2026-02-26
**Domain:** Next.js 15 Server Component visual redesign — typographic hero, design token application, bento grid feature section, vertical rhythm
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hero Background Treatment**
- Visual character: Claude decides — must be consistent with overall design direction (dark, premium)
- Fully static — no animations, no CSS motion, no dynamic elements (v4.0 constraint)
- Hero-to-page transition: Claude decides based on what works best
- Purely typographic hero — no images, illustrations, device mockups, or decorative graphics
- Global rule: NO gradients anywhere on the site — this applies to backgrounds, text, borders, everything

**Headline Hierarchy**
- Strong contrast: very large primary headline (uses `text-page-title` or `text-h1` token), much smaller supporting statement
- Headline color: plain foreground/white — no gradient text, no color treatment
- Supporting statement uses `muted-foreground` color to visually separate the two tiers
- Hero content is center-aligned
- No eyebrow label — headline is the first visual element in the hero

**CTA Visual Differentiation**
- Primary CTA: solid filled brand accent color — high visual weight, unmissable
- Secondary CTA treatment: Claude decides (outlined or ghost — whichever cleanly separates from primary)
- Number of CTAs: Claude decides based on reading current homepage copy
- Hover/focus states: subtle only — slight color or border shift, no scale/lift/glow transforms

**Section Rhythm**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HERO-01 | Homepage hero section has a distinctive, non-generic background treatment | Dark solid background (`oklch(0.12 0.015 260)`) with optional `.grid-pattern-minimal` CSS texture overlay — static, no gradient, non-generic |
| HERO-02 | Hero headline has clear typographic hierarchy — primary claim + supporting statement visually distinct in size and weight | `text-page-title` (clamp 2.5–4rem, weight 900) for h1 + `text-lead` (clamp 1.125–1.25rem) in `muted-foreground` for supporting text |
| HERO-03 | Hero CTAs are polished with distinct visual weight — primary action clearly differentiated from secondary | `Button variant="accent"` (solid amber, `bg-accent text-accent-foreground`) for primary; `variant="ghost"` for secondary |
| HERO-04 | Page sections have deliberate vertical rhythm — whitespace, section transitions, and content density feel intentional | `py-section` (5rem) on all sections; remove `bg-muted` section backgrounds; strip scale/transform hover effects |
</phase_requirements>

---

## Summary

Phase 57 is a focused visual redesign of `src/app/page.tsx` — the homepage only. The phase boundary is strict: no new sections, no content changes, no new pages. The work is removal of anti-patterns and correct application of Phase 56 design tokens.

The current homepage has five specific violations that must be fixed. First, the hero is a two-column layout with a terminal card mockup on the right — this must be replaced with a full-width centered typographic hero. Second, decorative `blur-3xl` and `blur-2xl` orb elements (`absolute bg-primary/20 rounded-full blur-3xl`) are scattered throughout. Third, `hover:scale-105` and `group-hover:scale-105` transform animations are applied to multiple card groups. Fourth, the Results section uses `bg-muted` as its background, creating alternating section colors that violate whitespace-only separation. Fifth, the hero h1 uses a two-tier color split (`text-foreground` + `text-accent` spans) that conflicts with the locked constraint of plain foreground throughout.

The critical research finding is that **the project already has a `BentoGrid` + `BentoCard` component** at `src/components/ui/bento-grid.tsx`. It was sourced from the shadcn/magic-ui ecosystem and is fully compatible with the existing stack. The component uses hardcoded `rgba()` box-shadows and `bg-background` classes in some cells — these must be overridden with Phase 56 surface/border tokens via the `className` prop. No new npm packages are needed. The existing `Button` component already has `variant="accent"` which renders solid amber fill — exactly what the primary CTA constraint requires.

**Primary recommendation:** Rewrite the hero section to a centered single-column layout on dark solid background with optional `grid-pattern-minimal` texture. Use the existing `BentoGrid`/`BentoCard` components (adapted with token-based className overrides) for the feature section. Remove all transform animations and `bg-muted` section backgrounds. Apply `text-section-title` consistently for all section h2 elements with center alignment. No new dependencies required.

---

## Standard Stack

### Core (all already installed — no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | `page.tsx` is a Server Component — no `'use client'` for hero | Project architecture; metadata export requires server component |
| Tailwind CSS | ^4.2.0 | All layout and styling via utility classes from `@theme` | Phase 56 tokens live in `@theme` block in globals.css |
| class-variance-authority | 0.7.1 | `cva()` drives Button and Card variant composition | Used in `button.tsx` and `card.tsx`; bento cells inherit |
| lucide-react | 0.575.0 | Icons for bento grid feature cells | Project icon standard; no heroicons |
| tailwind-merge | 3.5.0 | `cn()` for className merging in component overrides | Used in every component |

### Supporting (already present)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| BentoGrid / BentoCard | local (bento-grid.tsx) | Asymmetric feature grid layout | Already at `src/components/ui/bento-grid.tsx` — adapt, do not reinstall |
| BackgroundPattern | local | Grid texture overlays | Present but uses animated blobs — do NOT use for hero; use `.grid-pattern-minimal` directly |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Existing BentoGrid component | New block from shadcnblocks.com registry | Community bento blocks require auth or are dynamically loaded — existing component is equivalent; adapt it |
| Solid dark hero background | Very subtle radial spotlight | `radial-gradient()` is a CSS gradient — globally prohibited. Use solid bg only. |
| `variant="ghost"` secondary CTA | `variant="outline"` secondary CTA | `outline` hover fills solid amber on hover (`hover:bg-accent`) — competes with primary CTA appearance. `ghost` hover uses `hover:bg-muted/50` — clearly subordinate |

**Installation:** No new packages needed. All work is JSX/CSS within the existing stack.

---

## Architecture Patterns

### Current Homepage Structure (what needs to change)

```
src/app/page.tsx sections:
├── Hero          — 2-column grid, terminal mockup, left-aligned          [REPLACE entirely]
├── Solutions     — lg:grid-cols-3, glassLight cards, scale-105 hover     [REPLACE with BentoGrid]
├── Results       — bg-muted section, blur orbs, animationDelay styles    [STRIP violations]
├── Free Tools    — 3 tool link-cards, scale-105 hover                    [STRIP scale transforms]
├── Newsletter    — NewsletterSignup component                             [KEEP, check spacing]
└── Final CTA     — Card variant="glassSection"                           [KEEP, check spacing]
```

### Target Homepage Structure

```
src/app/page.tsx sections:
├── Hero          — full-width, center-aligned, dark bg, pure typography  [NEW]
│   ├── h1: text-page-title text-foreground
│   ├── p:  text-lead text-muted-foreground
│   └── CTAs: Button accent (primary) + Button ghost (secondary)
├── Solutions     — BentoGrid with token-adapted BentoCard cells          [ADAPTED]
├── Results       — bg-background (no bg-muted), no orbs, no anim        [STRIPPED]
├── Free Tools    — same cards, hover border only (no scale)              [STRIPPED]
├── Newsletter    — unchanged structure, py-section-sm                    [KEPT]
└── Final CTA     — unchanged structure, py-section                       [KEPT]
```

### Pattern 1: Center-Aligned Typographic Hero on Dark Background

**What:** Full-width section on dark solid background with center-aligned typography stack.
**When to use:** Top-of-page hero, purely typographic, static, no decorative graphics.

```tsx
// Source: globals.css tokens + page.tsx Server Component pattern
// No 'use client' needed — purely static markup

<section className="relative flex items-center justify-center px-4 sm:px-6 py-section bg-[oklch(0.12_0.015_260)]">
  {/* Optional: static grid texture — no gradient, no animation */}
  <div
    className="absolute inset-0 grid-pattern-minimal pointer-events-none"
    aria-hidden="true"
  />

  <div className="relative container-narrow text-center">
    <h1 className="text-page-title text-foreground leading-tight mb-comfortable text-balance">
      Stop Losing Revenue to Technical Bottlenecks
    </h1>

    <p className="text-lead text-muted-foreground mb-content-block max-w-2xl mx-auto text-balance">
      We build and scale your technical operations in weeks, not months.
      No hiring delays. No training costs. Just proven senior talent ready to execute.
    </p>

    <div className="flex flex-col sm:flex-row gap-comfortable justify-center">
      <Button asChild variant="accent" size="xl" trackConversion={true}>
        <Link href={ROUTES.CONTACT}>See Your ROI in 30 Days</Link>
      </Button>
      <Button asChild variant="ghost" size="xl" trackConversion={true}>
        <Link href={TOOL_ROUTES.ROI_CALCULATOR}>
          Calculate Your Savings
          <ArrowRight className="w-5 h-5" />
        </Link>
      </Button>
    </div>
  </div>
</section>
```

### Pattern 2: BentoGrid Feature Section (Adapted from Existing Component)

**What:** Use existing `BentoGrid` + `BentoCard` from `src/components/ui/bento-grid.tsx`. Override hardcoded box-shadow/bg classes via `className` prop. Feature cells span differently for visual hierarchy.
**When to use:** Solutions/features section replacing the current 3-column uniform grid.

Current `BentoCard` hardcodes:
```
bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),...]
dark:bg-background dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:...]
```

Override via className to use Phase 56 tokens:
```tsx
// Source: src/components/ui/bento-grid.tsx — adapt existing component
<BentoGrid>
  <BentoCard
    name="Ship Features Faster"
    description="Launch new features in days, not months."
    Icon={Code2}
    href={ROUTES.CONTACT}
    cta="Get Started"
    background={<div className="absolute inset-0 grid-pattern-subtle opacity-30" />}
    className="col-span-3 md:col-span-2 bg-surface-raised border border-border shadow-sm"
  />
  <BentoCard
    name="Fix Revenue Leaks"
    description="Automate everything that slows you down."
    Icon={Settings}
    href={ROUTES.CONTACT}
    cta="Learn More"
    background={<div className="absolute inset-0" />}
    className="col-span-3 md:col-span-1 bg-surface-raised border border-border shadow-sm"
  />
  <BentoCard
    name="Scale Without Breaking"
    description="Handle 10x growth without rebuilding."
    Icon={BarChart3}
    href={ROUTES.CONTACT}
    cta="See How"
    background={<div className="absolute inset-0" />}
    className="col-span-3 bg-surface-raised border border-border shadow-sm"
  />
</BentoGrid>
```

Note: `BentoGrid` sets `auto-rows-[22rem]` — override with `auto-rows-auto` if cell content height varies. Also note that `BentoCard` uses hover-triggered `translate-y-10` for the CTA reveal — this is a CSS transform animation. The constraint says no animations/motion for v4.0. Override: pass `lg:hidden` class variant to force the non-hover CTA path, or remove the hover translate classes from the copied component.

### Pattern 3: Whitespace-Only Section Rhythm

**What:** All sections on `bg-background` (no alternating muted), `py-section` padding, centered h2 with `text-section-title`.
**When to use:** Every section in the homepage redesign.

```tsx
// Source: globals.css utility definitions — py-section = padding-block: 5rem
<section className="py-section px-4 sm:px-6">
  <div className="container-wide">
    <div className="text-center mb-content-block">
      <h2 className="text-section-title text-foreground mb-comfortable text-balance">
        How We Solve Your Biggest Problems
      </h2>
      <p className="text-lead text-muted-foreground max-w-3xl mx-auto">
        Three ways we help businesses go from struggling to scaling.
      </p>
    </div>
    {/* content */}
  </div>
</section>
```

Removed from every section:
- `bg-muted` on section wrapper
- `absolute ... bg-accent/5 rounded-full blur-3xl` decorative orbs
- `absolute inset-0 bg-primary/5` background overlays
- `hover:transform hover:scale-105` / `group-hover:scale-105`
- `style={{ animationDelay: '...' }}` inline styles
- `hover-lift` class (applies `transform: translateY(-3px)` on hover)
- `card-hover-glow` class (applies `transform: translateY(-4px)` on hover)

Allowed hover states (color/border transitions only):
- `hover:border-accent/40` — border color transition
- `hover:text-accent` — text color transition
- `transition-smooth` — timing function utility

### Anti-Patterns to Avoid

- **Keeping `hover-lift` via `Card hover={true}`:** The `Card` component's `hover` prop applies `card-hover-glow hover-lift` — both use CSS transforms. Do not pass `hover={true}` to cards in redesigned homepage sections.
- **Radial spotlight as "not a gradient":** `radial-gradient()` is a CSS gradient — prohibited by the global no-gradient rule. Use only solid `background-color`.
- **`text-accent` spans inside h1:** The current hero splits the h1 with a `text-accent` span — remove this. Plain `text-foreground` throughout the headline.
- **`BackgroundPattern` component:** Uses animated blob divs internally — do not use in hero. Reference `grid-pattern-minimal` directly.
- **`text-responsive-2xl` for section h2:** Current page uses this for section headings. Use `text-section-title` instead — the semantically correct token.
- **`size="lg"` for hero CTAs:** Current hero uses `size="lg"` (h-10, px-6). For a large typographic hero, `size="xl"` (h-12, px-10, text-lg) provides appropriate visual weight.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Asymmetric feature grid | Custom CSS grid with `grid-cols` and `col-span` math | Existing `BentoGrid` + `BentoCard` at `src/components/ui/bento-grid.tsx` | Already integrated, responsive, adaptable via className |
| Solid amber primary CTA | New button style | `Button variant="accent"` (button.tsx line 19) | `bg-accent text-accent-foreground hover:bg-accent/90` — exactly correct |
| Subtle background texture | Custom SVG background or image | `.grid-pattern-minimal` CSS class (globals.css) | Uses `--border` token at 8% opacity, 64px grid — static, no gradients |
| Fluid hero headline | `text-4xl md:text-6xl` breakpoint hacks | `.text-page-title` class (globals.css) | `clamp(2.5rem, 6vw, 4rem)` — smooth scaling, weight 900 |
| Section content width | `max-w-4xl mx-auto` scattered | `.container-wide` (80rem) / `.container-narrow` (42rem) | Semantic utilities, consistent across pages |
| Spacing between hero elements | Ad-hoc `mt-8 mb-6` | `mb-comfortable` (1.5rem), `mb-content-block` (2rem) | Semantic spacing tokens from Phase 56 |

**Key insight:** Every visual primitive needed for this phase already exists in the design token system or component library. The work is surgical editing of `page.tsx` — removing wrong classes and adding correct token-based classes. No new files, no new components, no new packages.

---

## Common Pitfalls

### Pitfall 1: Radial-Gradient Counted as No-Gradient Violation

**What goes wrong:** Implementing the hero background as `background: radial-gradient(circle at center, oklch(0.16 0.02 260), oklch(0.12 0.015 260))` as a "very subtle spotlight." This is technically a CSS gradient.
**Why it happens:** Radial spotlights look aesthetically different from color gradients — the rule can feel like it should have exceptions.
**How to avoid:** Use only `background-color: oklch(0.12 0.015 260)` (solid). If texture is needed, layer `.grid-pattern-minimal` on top via an absolutely positioned div.
**Warning signs:** Any CSS value containing the string `gradient`.

### Pitfall 2: Card `hover` Prop Silently Applies Transform Animations

**What goes wrong:** Writing `<Card variant="glassLight" size="lg" hover>` and not realizing `hover={true}` triggers both `card-hover-glow` (translateY -4px) and `hover-lift` (translateY -3px) via the CVA definition.
**Why it happens:** The `hover` shorthand is convenient but bundles transform side effects that violate the static v4.0 constraint.
**How to avoid:** Never pass `hover={true}` to Card components on the redesigned homepage. Apply only `hover:border-accent/40 transition-smooth` directly.
**Warning signs:** Cards that visually lift or glow on hover when loaded in browser.

### Pitfall 3: BentoCard CTA Reveal Uses `translate-y-10` Transform

**What goes wrong:** The existing `BentoCard` uses `translate-y-10` / `group-hover:translate-y-0` to reveal the CTA link on hover. This is an animation/transform that violates the v4.0 no-animation constraint.
**Why it happens:** The component ships with this as a feature — it's not obvious from the API surface that it uses transforms internally.
**How to avoid:** When integrating BentoCard, review its internal implementation. Either (a) use only the `lg:hidden` path which shows CTA always without the translate reveal, or (b) fork the component to remove the translate classes and always show the CTA.
**Warning signs:** BentoCard CTA links animate in on hover in the browser.

### Pitfall 4: Inconsistent Section Heading Token

**What goes wrong:** Some sections use `text-responsive-2xl` (current page.tsx), others use `text-section-title` (the correct Phase 56 token). The tokens produce different font sizes and weights.
**Why it happens:** `text-responsive-2xl` is an older utility that predates the Phase 56 token system. It sets only `font-size` with no `letter-spacing` or `line-height` tokens.
**How to avoid:** Replace all `text-responsive-2xl` section h2 usages with `text-section-title`. Verify: `text-section-title` = `font-size: var(--font-size-4xl)`, `line-height: var(--line-height-snug)`, `letter-spacing: var(--tracking-heading)`, `font-weight: var(--font-weight-semibold)`.
**Warning signs:** Section headings look inconsistent in size or weight across the page.

### Pitfall 5: `bg-muted` Results Section Background Not Caught

**What goes wrong:** The Results section at line 316 of page.tsx has `bg-muted` on the section wrapper. It also has `absolute inset-0 bg-primary/5`, `absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl` and a second blur orb. These all need removal.
**Why it happens:** The blur orbs are inside the section as `absolute` positioned children — easy to overlook when scanning top-level classes.
**How to avoid:** Search for `blur-3xl`, `blur-2xl`, `bg-muted` in page.tsx and remove all instances. Also remove the `absolute top-0 left-1/2 ... w-16 h-1 bg-accent rounded-b-full` accent underline decorators on section headings.
**Warning signs:** Results section has a visually different background from the rest of the page.

### Pitfall 6: Hero Background Color as Arbitrary vs CSS Variable

**What goes wrong:** Writing `bg-[oklch(0.12_0.015_260)]` (arbitrary value) when `var(--color-background-dark)` is defined in `@theme` but may or may not resolve as a Tailwind utility class (`bg-background-dark`).
**Why it happens:** Tailwind v4's `@theme` block creates CSS custom properties, but whether they generate utility classes depends on whether the property name matches Tailwind's expected format.
**How to avoid:** At implementation time, test `bg-background-dark` first. If it resolves in the compiled CSS, use it (cleaner, token-based). If not, use the arbitrary value `bg-[var(--color-background-dark)]`. Do not hardcode the OKLCH literal as the primary option.
**Warning signs:** Hero background appears as the default page background (light) rather than dark.

---

## Code Examples

Verified patterns from existing codebase files:

### Available Design Tokens (globals.css — verified)

| Token Class | Computed Value | Use in Phase 57 |
|-------------|----------------|-----------------|
| `text-page-title` | clamp(2.5rem,6vw,4rem), weight 900, lh 1.1, ls -0.02em | Hero h1 |
| `text-section-title` | 4xl fluid, weight 600, lh 1.25, ls -0.02em | All section h2 |
| `text-lead` | lg fluid (~1.125–1.25rem), weight 400, lh 1.625 | Supporting statements |
| `text-muted-foreground` | oklch(0.45 0.02 255) light / oklch(0.85 0.015 90) dark | Supporting text |
| `text-foreground` | oklch(0.145 0.015 260) light / oklch(0.94 0.008 90) dark | Headlines |
| `py-section` | padding-block: 5rem | All primary sections |
| `py-section-sm` | padding-block: 3rem | Newsletter section |
| `mb-comfortable` | margin-bottom: 1.5rem | Headline → body gap |
| `mb-content-block` | margin-bottom: 2rem | Body → CTA gap |
| `gap-comfortable` | gap: 1.5rem | Between CTA buttons |
| `container-narrow` | max-width: 42rem, mx: auto | Hero content column |
| `container-wide` | max-width: 80rem, mx: auto | Section content area |
| `grid-pattern-minimal` | linear lines at 64px, 8% border opacity | Hero static texture |
| `surface-raised` | oklch(0.995 0.001 90) light / oklch(0.16 0.018 260) dark | Card bg token |
| `border-border` | oklch(0.88 0.015 255) light / oklch(0.28 0.02 260) dark | Card border token |
| `shadow-sm` | `var(--shadow-sm)` | Subtle card elevation |
| `shadow-md` | `var(--shadow-md)` | Featured card elevation |

### Button Variants (button.tsx — verified)

```tsx
// Source: src/components/ui/button.tsx (verified lines 13-26)
// variant="accent" — solid amber fill — PRIMARY CTA
// bg-accent text-accent-foreground hover:bg-accent/90
<Button variant="accent" size="xl">Get Your Free Roadmap</Button>

// variant="ghost" — minimal, hover muted bg — SECONDARY CTA
// text-muted-foreground hover:text-foreground hover:bg-muted/50
<Button variant="ghost" size="xl">Calculate Your ROI</Button>

// variant="outline" — borders, hover fills accent — AVOID for secondary (too competitive with accent primary)
// border border-border bg-background hover:bg-accent hover:text-accent-foreground
```

### Card Without Hover Transforms

```tsx
// Source: src/components/ui/card.tsx — hover={true} activates transforms, do not use
// Use default card with only border hover via className

<Card
  variant="default"
  size="lg"
  // hover prop NOT passed — avoids card-hover-glow (translateY) and hover-lift (translateY)
  className="hover:border-accent/40 transition-smooth"
>
  {/* content */}
</Card>
```

### Section h2 with Correct Token

```tsx
// Source: globals.css — text-section-title definition (lines 418-423)
// Replace all text-responsive-2xl usages with text-section-title
<h2 className="text-section-title text-foreground mb-comfortable text-center text-balance">
  How We Solve Your Biggest Problems
</h2>
<p className="text-lead text-muted-foreground max-w-3xl mx-auto text-center">
  Supporting statement in muted-foreground.
</p>
```

---

## State of the Art

| Old Pattern (current page.tsx) | New Pattern (this phase) | Why |
|--------------------------------|--------------------------|-----|
| `lg:grid-cols-2` two-column hero with terminal mockup | Full-width centered single-column hero | Purely typographic decision; images/mockups prohibited |
| `<span className="block text-accent">Technical Bottlenecks</span>` in h1 | Plain `text-foreground` throughout h1 | No color treatment on headline — constraint |
| `text-hero-subtitle text-accent` subtitle ("Ship 3x Faster") | Remove; fold key claims into supporting `text-lead text-muted-foreground` paragraph | No accent-colored subtitle — constraint |
| `Button variant="default"` primary CTA | `Button variant="accent"` | Accent (solid amber) is the brand emphasis button; `default` is primary blue |
| `hover:scale-105`, `group-hover:scale-105` on cards | Removed; `hover:border-accent/40 transition-smooth` only | No scale/lift/glow transforms — constraint |
| `bg-muted` Results section background | Remove; all sections on `bg-background` | Whitespace-only rhythm — constraint |
| `absolute ... bg-accent/5 rounded-full blur-3xl` background orbs | Removed entirely | No decorative elements — static quality |
| `text-responsive-2xl` section h2 | `text-section-title` | Correct Phase 56 semantic token |
| `Card hover={true}` | `Card` without hover prop + `hover:border-accent/40` | `hover` prop bundles CSS transforms |
| `style={{ animationDelay: '${index * 100}ms' }}` on results grid | Removed | No animation in v4.0 |

**Deprecated/outdated in current page.tsx requiring removal:**
- All `blur-3xl`, `blur-2xl` decorative div elements
- `text-hero-subtitle text-accent` — the "Ship 3x Faster, 60% Cheaper" subtitle line
- `absolute -bottom-3 left-1/2 ... w-24 h-1.5 bg-accent rounded-full` underline accents under h2 headings
- `absolute top-0 left-1/2 ... w-16 h-1 bg-accent rounded-b-full` top accent lines on cards
- `group-hover:scale-75` on BentoCard icon (inside bento-grid.tsx — evaluate if keeping or removing)
- `lg:group-hover:-translate-y-10` on BentoCard content (inside bento-grid.tsx — evaluate for static mode)

---

## Open Questions

1. **BentoCard Transform Animations Inside the Component**
   - What we know: The existing `BentoCard` internally applies `lg:group-hover:-translate-y-10` on card content and `translate-y-10 group-hover:translate-y-0 group-hover:opacity-100` on the CTA button reveal — both use CSS transforms/transitions.
   - What's unclear: Whether "no animations" for v4.0 applies to subtle hover interactions on individual elements, or only to full CSS `@keyframes` / JS-driven animations.
   - Recommendation: Remove the translate-based CTA reveal. Use the `lg:hidden` branch (always-visible CTA) by setting `lg:flex` and removing the translate classes. Simpler is better.

2. **Hero Background Token Availability**
   - What we know: `--color-background-dark` is in the `@theme` block. Tailwind v4's `@theme` generates utility classes for `--color-*` variables as `bg-*`, `text-*`, `border-*`.
   - What's unclear: Whether `bg-background-dark` is a valid Tailwind class or requires `bg-[var(--color-background-dark)]` syntax.
   - Recommendation: Try `bg-background-dark` in implementation; if not generated, fall back to `bg-[var(--color-background-dark)]`. Either way, avoid hardcoding the OKLCH literal directly.

3. **Section Count for CTA Decision**
   - What we know: Current homepage has two CTAs in the hero: "See Your ROI in 30 Days" (primary) and "Calculate Your Savings" (secondary). There is also a Final CTA section at the bottom.
   - What's unclear: Whether two CTAs in the hero is appropriate for the center-aligned typographic layout.
   - Recommendation: Keep two CTAs. They are clearly differentiated (solid accent vs ghost), center-aligned, and the current copy supports both paths (conversion vs consideration). One CTA would reduce the secondary user journey.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | bun:test + @testing-library/react 16.3.2 + happy-dom |
| Config file | `bunfig.toml` (preloads `tests/setup.ts`) |
| Quick run command | `bun test tests/unit/homepage.test.tsx` |
| Full suite command | `bun test tests/` |
| Estimated runtime | ~5 seconds quick / ~15 seconds full suite |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-01 | Hero `<section>` does not use gradient backgrounds | unit | `bun test tests/unit/homepage.test.tsx` | No — Wave 0 gap |
| HERO-01 | Hero has dark background class (not default page bg) | unit | `bun test tests/unit/homepage.test.tsx` | No — Wave 0 gap |
| HERO-02 | `<h1>` has `text-page-title` class | unit | `bun test tests/unit/homepage.test.tsx` | No — Wave 0 gap |
| HERO-02 | Supporting `<p>` has `text-muted-foreground` class | unit | `bun test tests/unit/homepage.test.tsx` | No — Wave 0 gap |
| HERO-02 | No `text-accent` class on `<h1>` or any descendant span | unit | `bun test tests/unit/homepage.test.tsx` | No — Wave 0 gap |
| HERO-03 | Primary CTA has class `bg-accent` (accent variant) | unit | `bun test tests/unit/homepage.test.tsx` | No — Wave 0 gap |
| HERO-03 | Secondary CTA does NOT have class `bg-accent` | unit | `bun test tests/unit/homepage.test.tsx` | No — Wave 0 gap |
| HERO-04 | No `<section>` has `bg-muted` class | unit | `bun test tests/unit/homepage.test.tsx` | No — Wave 0 gap |
| HERO-04 | No element has classes `scale-105`, `hover:scale`, or `translate-y` | unit | `bun test tests/unit/homepage.test.tsx` | No — Wave 0 gap |

Note: All visual appearance tests (dark mode, actual color rendering, typography visual weight) are manual-only — computed styles in happy-dom do not resolve Tailwind CSS variables.

### Nyquist Sampling Rate

- **Minimum sample interval:** After every committed task — run: `bun test tests/unit/homepage.test.tsx`
- **Full suite trigger:** Before merging final task of the phase wave — run: `bun test tests/`
- **Phase-complete gate:** Full suite green before `/gsd:verify-work` runs
- **Estimated feedback latency per task:** ~5 seconds

### Wave 0 Gaps (must be created before implementation)

- [ ] `tests/unit/homepage.test.tsx` — new test file covering HERO-01 through HERO-04 structural assertions
  - Import `HomePage` from `@/app/page.tsx` and render with RTL
  - Assert h1 has `text-page-title` class (HERO-02)
  - Assert supporting p has `text-muted-foreground` class (HERO-02)
  - Assert no `<span>` inside h1 has `text-accent` class (HERO-02)
  - Assert primary Button rendered element has `bg-accent` class (HERO-03)
  - Assert secondary Button does not have `bg-accent` class (HERO-03)
  - Assert no section has `bg-muted` class (HERO-04)
  - Assert no element has a class containing `scale-105` (HERO-04)
  - Assert no inline style contains `animationDelay` (HERO-04)

*(Existing `tests/unit/components.test.tsx` covers Button and Card unit behavior — homepage structural tests require a new file focused on the page's rendered DOM)*

---

## Sources

### Primary (HIGH confidence)

- `src/app/globals.css` (read directly) — all Phase 56 design tokens, utility class definitions, spacing scale, typography tokens fully verified
- `src/app/page.tsx` (read directly) — complete current homepage structure, all sections, every class name, all violations identified
- `src/components/ui/button.tsx` (read directly) — all variants verified: `accent`, `ghost`, `outline`, `default`; `xl` size verified
- `src/components/ui/card.tsx` (read directly) — `hover` prop confirmed to apply `card-hover-glow hover-lift` (CSS transforms); base variants verified
- `src/components/ui/bento-grid.tsx` (read directly) — component API confirmed; hardcoded box-shadow rgba() values identified; `className` override path verified; internal translate-y animations identified
- `src/components/ui/BackgroundPattern.tsx` (read directly) — confirmed uses animated blob elements; should not be used for hero
- `.planning/phases/57-homepage-hero-redesign/57-CONTEXT.md` (read directly) — all locked decisions and discretion areas
- `.planning/REQUIREMENTS.md` (read directly) — HERO-01 through HERO-04 requirements verbatim
- `package.json` (queried directly) — dependency versions verified

### Secondary (MEDIUM confidence)

- Linear design pattern analysis — dark, monochrome black/white, minimal gradients, bold sans-serif type. Source: [LogRocket — Linear Design article](https://blog.logrocket.com/ux-design/linear-design/)
- shadcn/ui community bento grid ecosystem — confirmed shadcnblocks.com, shadcnstudio.com, allshadcn.com provide bento blocks; existing codebase component verified as equivalent. Sources: [shadcnblocks.com/blocks/bento](https://www.shadcnblocks.com/blocks/bento), [shadcnstudio.com](https://shadcnstudio.com/blocks/bento-grid/bento-grid)

### Tertiary (LOW confidence)

None — all findings verified against codebase files or multiple web sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from package.json and all component files
- Architecture patterns: HIGH — all patterns derived directly from reading page.tsx and globals.css
- Pitfalls: HIGH — each pitfall maps to a specific line or class in the existing codebase
- Bento grid adaptation: HIGH — component read directly; override path confirmed
- Community bento grid sources: MEDIUM — sites load blocks dynamically; full source not accessible; existing component verified as equivalent

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (30 days — stable stack, no fast-moving dependencies)
