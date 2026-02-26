# Architecture Research

**Domain:** Design System Overhaul — Tailwind v4 + shadcn/ui + Next.js 15 App Router
**Researched:** 2026-02-25
**Confidence:** HIGH (based on direct codebase inspection of globals.css, components/ui/, components.json)

---

## Current State (What Already Exists)

This is a brownfield overhaul, not greenfield. The existing system is more advanced than typical:

- **Tailwind v4** with `@theme {}` block in `globals.css` — NOT `tailwind.config.ts` (that file does not exist)
- **CSS custom properties** defined as `--color-*` tokens inside `@theme {}` using OKLCH color space
- **shadcn/ui** "new-york" style, `cssVariables: true`, components already forked into `src/components/ui/`
- **Semantic CSS classes** in `@layer components {}`: `.glass-card`, `.glass-card-light`, `.grid-pattern*`, `.hover-lift`, `.card-hover-glow`, `.transition-smooth`, `.typography`, `.container-narrow`, `.container-wide`
- **Semantic `@utility` blocks**: `section-spacing`, `gap-*`, `py-section*`, `card-padding*`, `mb-*`, `mt-*`, `z-*`
- **Components already use CVA** (class-variance-authority) with variants: `button.tsx`, `card.tsx`, `input.tsx`
- **Card is a mega-component** with discriminated union variants: base, service, pricing, project, testimonial
- **Dark mode** colors defined as `--color-*-dark` suffixed tokens (not a `[data-theme=dark]` block)

---

## System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                     globals.css (single source of truth)           │
│                                                                     │
│  @theme { --color-*, --font-*, --radius }  <- Design tokens        │
│  @layer components { .glass-card, .typography, .hover-lift ... }   │
│  @utility { section-spacing, gap-*, card-padding-*, z-* ... }      │
└────────────────────┬───────────────────────────────────────────────┘
                     │ CSS custom properties consumed by
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                  src/components/ui/  (forked shadcn)               │
│                                                                     │
│  button.tsx   -> CVA variants, uses bg-primary, bg-accent etc.     │
│  card.tsx     -> CVA variants, uses glass-card, card-padding-*     │
│  input.tsx    -> CVA variants, uses border-input, bg-background    │
│  badge.tsx, dialog.tsx, select.tsx, textarea.tsx ...               │
└────────────────────┬───────────────────────────────────────────────┘
                     │ composed into
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│              src/components/  (feature components)                 │
│                                                                     │
│  layout/NavbarLight.tsx, Footer.tsx                                 │
│  forms/ContactForm.tsx, SubmitButton.tsx ...                        │
│  utilities/Icon.tsx, JsonLd.tsx, BackgroundPattern.tsx ...         │
└────────────────────┬───────────────────────────────────────────────┘
                     │ assembled into
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│              src/app/  (Next.js 15 App Router pages)               │
│                                                                     │
│  page.tsx (server) + [Feature]Client.tsx (client boundary)         │
│  (tools)/, locations/, blog/, api/, actions/                       │
└────────────────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

| Component | Responsibility | Current State |
|-----------|----------------|---------------|
| `globals.css @theme {}` | All design tokens — color, font, radius | Exists, uses OKLCH, missing type scale tokens |
| `globals.css @layer components` | Reusable semantic CSS classes | Complete: .glass-card, .typography etc. |
| `globals.css @utility` | Tailwind v4 custom utilities | Complete: spacing/gap/z-index scale |
| `src/components/ui/button.tsx` | Button variants via CVA | Forked, has xl size, accent/success/muted variants |
| `src/components/ui/card.tsx` | Card variants + specialized cards | Heavily forked, mega-component |
| `src/components/ui/input.tsx` | Input with currency variant | Lightly forked |
| `src/components/layout/NavbarLight.tsx` | Primary navigation | Exists, needs polish audit |
| `src/components/ui/ThemeToggle.tsx` | Dark/light mode switcher | Exists |

---

## Recommended Project Structure (Design System Files Only)

```
src/app/
└── globals.css                     # ALL tokens live here — single source of truth
                                    # @theme: colors, fonts, radius, spacing scale
                                    # @layer components: semantic CSS classes
                                    # @utility: Tailwind v4 custom utilities

src/components/
├── ui/                             # Forked shadcn primitives — edit in place, never re-generate
│   ├── button.tsx                  # CVA variants — add/change here only
│   ├── card.tsx                    # CVA variants + specialized card types
│   ├── input.tsx                   # CVA variants
│   ├── badge.tsx                   # Polish: size/color variants
│   ├── select.tsx                  # Polish: match input height/border treatment
│   └── textarea.tsx                # Polish: match input treatment
├── layout/
│   ├── NavbarLight.tsx             # Phase 2 target: polished nav
│   └── Footer.tsx                  # Phase 2 target: polished footer
└── utilities/
    └── BackgroundPattern.tsx       # Encapsulates grid-pattern classes
```

---

## Architectural Patterns

### Pattern 1: Token-First in `@theme {}`

**What:** All design decisions expressed as CSS custom properties inside Tailwind v4's `@theme {}` block. No values hard-coded in components.

**When to use:** Any new color, spacing value, font size, shadow, or border-radius decision.

**Trade-offs:** Single source of truth, easy to change globally. Requires discipline — components must reference tokens, not raw values.

**Current gap:** Type scale tokens exist as `clamp()` inside named CSS classes (`.text-page-title`, `.text-section-title`) but NOT as `--font-size-*` tokens in `@theme {}`. This means type scale values are not reusable across components without duplication.

**Recommended additions to `@theme {}`:**
```css
/* Fluid type scale */
--font-size-xs:   clamp(0.75rem, 1.5vw, 0.875rem);
--font-size-sm:   clamp(0.875rem, 1.8vw, 1rem);
--font-size-base: clamp(1rem, 2vw, 1.125rem);
--font-size-lg:   clamp(1.125rem, 2.5vw, 1.25rem);
--font-size-xl:   clamp(1.25rem, 3vw, 1.5rem);
--font-size-2xl:  clamp(1.5rem, 3.5vw, 1.875rem);
--font-size-3xl:  clamp(1.875rem, 4vw, 2.25rem);
--font-size-4xl:  clamp(2.25rem, 5vw, 3rem);
--font-size-hero: clamp(2.5rem, 6vw, 4rem);

/* Shadow scale */
--shadow-sm:   0 1px 2px oklch(from var(--foreground) l c h / 0.05);
--shadow-md:   0 4px 12px oklch(from var(--foreground) l c h / 0.08);
--shadow-lg:   0 8px 24px oklch(from var(--foreground) l c h / 0.10);
--shadow-xl:   0 20px 40px oklch(from var(--foreground) l c h / 0.12);
--shadow-glow: 0 0 30px oklch(from var(--primary) l c h / 0.20);
```

### Pattern 2: Edit Forked shadcn Components In-Place

**What:** shadcn components in `src/components/ui/` are already forked. Modify them directly. Never run `npx shadcn add` on components that already exist — it overwrites customizations.

**When to use:** When a primitive needs a new variant, size, or behavior change.

**Trade-offs:** Full control, zero upstream dependency. Must manually check shadcn changelog for new primitives.

**Constraint:** `components.json` has `style: "new-york"` and `cssVariables: true`. Preserve this if running `npx shadcn add` for NEW components not yet present in `src/components/ui/`.

**Override strategy — three tiers:**
1. **CVA variants** (preferred): Add a new `variant` or `size` to the existing `cva()` call. Zero risk of breaking other usages.
2. **className prop** (acceptable): Pass `className` at call site for one-off overrides. Tailwind Merge (`cn()`) handles conflicts correctly.
3. **New component wrapping primitive** (for complex cases): Create e.g. `ButtonCTA.tsx` that imports `Button` and hard-codes variant/size. Use when a specific composition repeats 3+ times.

**What NOT to do:** Do not edit `globals.css` to add per-component CSS overrides. Put variant logic in the component file.

### Pattern 3: Dark Mode via `-dark` Suffixed Tokens

**What:** The existing `globals.css` defines dark mode colors as `--color-background-dark`, `--color-primary-dark` etc. inside `@theme {}`. This is NOT a `@media (prefers-color-scheme: dark)` or `[data-theme=dark]` approach in the token definitions.

**When to use:** Follow the existing pattern for any new dark mode tokens.

**Trade-offs:** Tokens are available to Tailwind as utilities (e.g., `bg-background-dark`) but the swap mechanism requires a `.dark {}` CSS block or similar to reassign the base token values.

**Critical verification needed in Phase 1:** Confirm whether `ThemeToggle.tsx` sets `class="dark"` on `<html>` and whether `globals.css` has a `.dark {}` selector block that reassigns e.g. `--color-background` to the dark value. If this wiring is absent, dark mode tokens are defined but never activated.

### Pattern 4: Semantic Classes Over Inline Utilities for Repeated Patterns

**What:** Complex repeated visual patterns (`.glass-card`, `.grid-pattern`, `.card-hover-glow`) live in `@layer components {}` as named classes.

**When to use:** Any visual pattern applied in 3 or more places.

**Trade-offs:** More maintainable, easier to change globally, readable JSX. Slightly less explicit than reading inline Tailwind utilities.

**Correct for v4:** In Tailwind v4, `@layer components {}` works correctly without `@apply`.

---

## Data Flow for Design Token Changes

```
globals.css @theme { --color-primary: oklch(...) }
    |
    +-- Tailwind auto-generates: bg-primary, text-primary, border-primary, ring-primary etc.
    |
    +-- shadcn components use: bg-primary, hover:bg-primary/90 etc.
    |
    +-- globals.css @layer components use: var(--primary), oklch(from var(--primary) l c h / 0.15)
```

**Key insight:** Tailwind v4 auto-generates utility classes from `@theme {}` tokens. Changing `--color-primary` updates all `bg-primary`, `text-primary`, `border-primary` usages across the codebase automatically. No rebuild config needed.

**OKLCH relative color syntax** (`oklch(from var(--primary) l c h / 0.20)`) is used throughout `globals.css` for alpha variants. This requires evergreen browsers. Already in production — do not add polyfills.

---

## Build Order: Tokens First, Components Second, Pages Third

This is the critical dependency chain. Each phase cannot proceed until the previous is stable.

### Phase 1: Token Foundation (globals.css only)

**Files changed:** `src/app/globals.css` only

**Work items:**
1. Add `--font-size-*` fluid type scale tokens to `@theme {}`
2. Add `--shadow-*` scale tokens to `@theme {}`
3. Audit and fix dark mode wiring — confirm `.dark {}` selector reassigns base tokens
4. Review and refine OKLCH color values if palette adjustment needed
5. Replace `.text-page-title` / `.text-section-title` clamp() values with references to new tokens

**Does NOT touch:** Any component files, any page files.

**Why first:** Every component in Phase 2 will reference these tokens. If tokens change after components are written, components must be re-edited.

**Integration point for Phase 2:** Components reference `var(--font-size-hero)` for hero text, `var(--shadow-lg)` for card shadows, etc.

### Phase 2: Component Polish (src/components/ui/ and src/components/layout/)

**Files changed:** Files in `src/components/ui/`, `src/components/layout/`

**Dependencies:** Phase 1 tokens must be finalized.

**Work items:**
1. `button.tsx` — Refine `xl` variant, add hover animations using `--shadow-*` tokens
2. `card.tsx` — Integrate `--shadow-*` tokens, refine glass effect, verify hover states
3. `input.tsx` / `select.tsx` / `textarea.tsx` — Consistent `h-10` height, consistent focus ring using `--color-ring`
4. `badge.tsx` — Add semantic color variants (success, warning, info) using existing semantic tokens
5. `NavbarLight.tsx` — Scroll behavior, active state styling, mobile menu polish
6. `Footer.tsx` — Link hover states, layout polish

**Does NOT touch:** Page files in `src/app/`.

**Why second:** Pages use these components. Elevated component quality propagates everywhere automatically.

**Integration point for Phase 3:** Pages need only page-level layout work. Primitive quality is already elevated.

### Phase 3: Page Layout Polish (src/app/ pages)

**Files changed:** Page files and their client components in `src/app/`

**Dependencies:** Phase 1 tokens, Phase 2 components.

**Priority order within Phase 3:**
1. Homepage (`src/app/page.tsx` + client component) — highest visibility, hero section
2. Services page — primary conversion page
3. Tool pages — 13 tools, form/output presentation template
4. Location pages — 75 pages share a template, one fix propagates everywhere
5. About page
6. Blog pages — typography and reading experience

**Why last:** Pages are the assembly layer. With tokens stable and components polished, page work is section layout, copy hierarchy, and visual rhythm.

---

## Integration Points Between Phases

| Boundary | Phase 1 Provides | Phase 2 Consumes |
|----------|-----------------|-----------------|
| Type scale | `--font-size-hero` through `--font-size-xs` | Button label sizing, Card heading sizes, Nav font sizes |
| Shadow scale | `--shadow-sm` through `--shadow-glow` | Card hover shadows, Button focus rings, Dialog elevation |
| Dark mode | Verified `.dark {}` swap for base tokens | All components inherit correct dark values automatically |
| Color refinements | Updated OKLCH values for primary/accent/etc. | `bg-primary`, `text-accent` etc. update automatically |

| Boundary | Phase 2 Provides | Phase 3 Consumes |
|----------|-----------------|-----------------|
| Polished Button | `xl` variant, refined hover, correct shadows | Hero CTA, contact form submit, tool CTAs |
| Polished Card | Premium glass treatment, consistent padding | Services section, pricing, tools index cards |
| Polished Inputs | Consistent height, focus ring, error states | All 13 tool forms, contact form |
| Polished Navbar | Active states, scroll behavior | All 130+ pages automatically via layout |

---

## Files Changed Per Phase (Explicit List)

### Phase 1 Files
- `src/app/globals.css` — add type scale tokens, shadow scale tokens, verify/add dark mode `.dark {}` block

### Phase 2 Files
- `src/components/ui/button.tsx` — variant/size refinements
- `src/components/ui/card.tsx` — shadow token integration, glass refinement
- `src/components/ui/input.tsx` — height/focus consistency
- `src/components/ui/select.tsx` — height/focus consistency (match input)
- `src/components/ui/textarea.tsx` — focus consistency (match input)
- `src/components/ui/badge.tsx` — semantic color variants
- `src/components/layout/NavbarLight.tsx` — scroll state, active links, mobile menu
- `src/components/layout/Footer.tsx` — link states, layout

### Phase 3 Files (page-level, ordered by priority)
- `src/app/page.tsx` + client component — hero section, section layouts
- `src/app/services/page.tsx` — premium landing page treatment
- `src/app/(tools)/*/page.tsx` — form/output layout (13 files)
- `src/app/locations/[slug]/page.tsx` — template polish (propagates to 75 pages)
- `src/app/about/page.tsx` — page layout
- `src/app/blog/*/page.tsx` — typography and reading experience

---

## Anti-Patterns

### Anti-Pattern 1: Adding `tailwind.config.ts` for Theme Extension

**What people do:** Create `tailwind.config.ts` with `theme.extend` to add custom tokens.

**Why it's wrong:** This project uses Tailwind v4 with `@theme {}` in CSS. Adding `tailwind.config.ts` creates two sources of truth and causes conflicts. Tailwind v4 resolves the theme from CSS, not JS config.

**Do this instead:** All tokens go in the `@theme {}` block in `globals.css`.

### Anti-Pattern 2: Re-running `npx shadcn add` on Existing Components

**What people do:** Run `npx shadcn add button` to "update" the button component.

**Why it's wrong:** Overwrites the forked file, losing all custom variants (`xl` size, `accent`/`success`/`muted` variants, `trackConversion` prop, etc.).

**Do this instead:** Edit `src/components/ui/button.tsx` directly. Check shadcn changelog manually if you need to port a specific upstream change.

### Anti-Pattern 3: Hardcoding Color Values in Components

**What people do:** Write `bg-[#2B4B8C]` or `text-[oklch(0.35_0.08_255)]` in a component.

**Why it's wrong:** Breaks dark mode, bypasses token system, makes global color changes require grep-and-replace.

**Do this instead:** Use token-based utilities: `bg-primary`, `bg-primary/80`, `text-muted-foreground`. If a shade doesn't exist as a utility, add it as a token in `@theme {}`.

### Anti-Pattern 4: Using `@apply` in Tailwind v4

**What people do:** Write `@apply flex items-center` inside `@layer components`.

**Why it's wrong:** `@apply` is deprecated and unreliable in Tailwind v4.

**Do this instead:** Write native CSS in `@layer components {}` blocks (already done throughout `globals.css`), or use Tailwind utility classes inline in JSX.

### Anti-Pattern 5: Per-Component CSS Overrides in globals.css

**What people do:** Add `.button-cta { background: var(--accent); }` to globals.css to override a specific button instance.

**Why it's wrong:** globals.css should contain only design tokens and reusable patterns. Per-component overrides create hidden coupling and make components unpredictable.

**Do this instead:** Add a CVA variant to `button.tsx` or pass `className` at the call site.

---

## Scaling Considerations

This is a marketing/tools website. Scaling here means "design system scales across 130+ pages" not infrastructure scaling.

| Scale | Architecture Adjustment |
|-------|------------------------|
| 13 tools, 75 location pages (current) | Single `globals.css`, components in `src/components/ui/` — correct as-is |
| Adding more page types | Follow existing patterns. New page types get their own layout only if genuinely different. |
| Multiple contributors | Design tokens in `globals.css` are the shared contract. CVA variants are the component vocabulary. |

---

## Sources

- Direct codebase inspection: `src/app/globals.css` (578 lines), `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/input.tsx`, `components.json`
- Tailwind v4 `@theme {}` pattern confirmed by presence of `@import 'tailwindcss'` and `@theme {}` block (no `tailwind.config.ts` present)
- shadcn "new-york" style confirmed by `components.json` `style: "new-york"` and `cssVariables: true`
- OKLCH relative color syntax usage confirmed throughout `globals.css`
- All findings from direct code inspection — HIGH confidence, no training data assumptions

---

*Architecture research for: Design system overhaul within Tailwind v4 + shadcn/ui + Next.js 15*
*Researched: 2026-02-25*
