# Phase 58: Core Component Polish - Research

**Researched:** 2026-02-26
**Domain:** UI Component Polish — Tailwind v4 + shadcn CVA patterns
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMP-01 | Button component has distinct, polished variants — primary (brand color), secondary (outlined or muted), ghost (text-only) — all with proper hover/focus/active states | Button already has `variant`, `accent`, `ghost`; polish means strengthening contrast, adding active states, and ensuring primary/secondary are visually distinct from each other and page background |
| COMP-02 | Form inputs and textareas have consistent styling — focus ring, label positioning, placeholder treatment, error state, disabled state | Input uses `border-input bg-background`; lacks visible focus-ring (uses `focus-visible:ring-2 focus-visible:ring-ring`); no error state class; textarea needs same treatment as input |
| COMP-03 | Card component is visually distinct from page background — clear border/shadow/surface treatment with consistent padding | Card `default` variant uses `border-border shadow-xs` — subtle but present; surface tokens from Phase 56 can be applied to make card background (`--color-surface-raised`) visually distinct from page (`--color-surface-base`) |
| COMP-04 | Navbar is polished — proper backdrop treatment, link hover states, active indicator, mobile menu consistency | Navbar uses `bg-background/90 backdrop-blur-xl`; active link is `text-accent bg-accent/10`; hover changes `hover:bg-accent` (too strong — fills full bg with accent color); mobile menu has different hover treatment than desktop |
</phase_requirements>

## Summary

Phase 56 established the full design token system (OKLCH color palette, surface elevation, type scale, shadow scale). Phase 57 established the button CTA pattern (`variant="accent"` for primary, `variant="ghost"` for secondary). Phase 58 applies this foundation to polish all shared components away from generic shadcn defaults — targeting Resend/Linear/Clerk visual quality.

The research reveals that most components are partially polished already but have specific gaps. The button component has the right variants but the `default` (primary) variant uses `bg-primary` (a low-L slate blue that reads dark) rather than a clear brand action color. The hover/active states are basic opacity-based reductions rather than deliberate color shifts. Form inputs have focus rings but no error state styling and no consistent label treatment. The card `default` variant is subtle — border and shadow-xs — which may not be visually distinct enough on the page background. The navbar has a hover state issue where `hover:bg-accent` fills the full link background with amber, which is too aggressive for a nav item.

No new libraries are required. All work is CSS class changes within existing CVA `cva()` variant definitions plus globals.css semantic class additions. The Phase 56 token system provides everything needed — `--color-surface-raised`, `--shadow-sm`, `--color-ring`, border tokens. The pattern is: update CVA variant strings in each component file, add active states via `active:` prefix where missing, leverage surface tokens for card backgrounds.

**Primary recommendation:** Update CVA variant definitions in button.tsx, input.tsx, textarea.tsx, card.tsx and the Navbar.tsx hover/active classes — using existing Phase 56 design tokens. No new files, no new libraries.

## Standard Stack

### Core (already installed — no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| class-variance-authority | current | CVA variant composition for all UI components | Already used throughout; the standard pattern for shadcn components |
| tailwindcss | ^4.2.0 | Utility-first CSS | Foundation of entire design system |
| @radix-ui/react-slot | current | `asChild` pattern for button/badge polymorphism | Already in use; required for Button asChild + Link pattern |
| @radix-ui/react-label | current | Accessible label primitive | Already in use for Label component |

### No New Libraries Required

All COMP-01 through COMP-04 work is achieved through:
1. CVA variant string updates in existing component files
2. globals.css additions for new semantic utility classes
3. Tailwind class changes in Navbar.tsx

**Installation:** None needed.

## Architecture Patterns

### Recommended File Touch List
```
src/components/ui/
├── button.tsx          # COMP-01: strengthen primary/secondary contrast, add active states
├── input.tsx           # COMP-02: focus ring, error state, sunken surface
├── textarea.tsx        # COMP-02: same treatment as input (currently lacks error state)
├── label.tsx           # COMP-02: label color treatment, optional required indicator
├── card.tsx            # COMP-03: default variant → surface-raised background + stronger shadow
src/components/layout/
├── Navbar.tsx          # COMP-04: fix hover (muted not accent), active indicator underline
├── Footer.tsx          # remove inline style hack, normalize token usage
src/app/globals.css     # add .input-error, .input-focus semantic classes if needed
```

### Pattern 1: CVA Variant Update (in-place)
**What:** Modify the variant string in the `cva()` call — zero API changes, zero callsite changes
**When to use:** All component polish that doesn't change props or behavior
**Example (button primary polish):**
```typescript
// Source: existing button.tsx pattern, extended
default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/80 active:bg-primary/70 focus-visible:ring-primary/40',
accent:  'bg-accent text-accent-foreground shadow-sm hover:bg-accent/85 active:bg-accent/75 focus-visible:ring-accent/40',
```

### Pattern 2: Surface Token Usage for Cards
**What:** Use `--color-surface-raised` (slightly lighter than page background in light mode, slightly elevated in dark) to distinguish card from page surface
**When to use:** Card default variant background
**Example:**
```typescript
// In card.tsx cva default variant:
default: 'border-border-subtle bg-surface-raised shadow-sm',
// Note: surface-raised is a Tailwind token registered in @theme {} via Phase 56
```

### Pattern 3: Input Error State via data-invalid
**What:** shadcn pattern — `aria-invalid:ring-destructive/20` already exists in textarea; input should match
**When to use:** Both input and textarea error state
**Current state of textarea:** Has `aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive`
**Current state of input:** Missing `aria-invalid:*` classes — needs to match textarea

### Pattern 4: Navbar Link Hover Fix
**What:** Replace `hover:bg-accent hover:text-accent-foreground` (amber fill — too aggressive) with `hover:bg-muted hover:text-foreground` (neutral muted hover)
**When to use:** Both desktop nav links and mobile nav links
**Active state:** Keep `text-accent bg-accent/10` for active — that's correct branding
**Mobile menu:** Should match desktop pattern exactly

### Anti-Patterns to Avoid
- **Changing component API**: Do NOT add new props or change existing prop types — polish is CSS-only
- **Removing existing variants**: Destructive and success variants are in use in tool pages — keep them
- **Hardcoded hex/rgb values**: Use design tokens exclusively — no `bg-[#3B5BDB]`
- **Overriding glass variants**: `glass-card` and `glass-card-light` are used extensively in service/testimonial/pricing cards — touch only the `default` card variant
- **Adding animations**: Out of scope per REQUIREMENTS.md Out of Scope section; no `transition-all animate-*`
- **Touching form component wrappers**: ContactForm.tsx, FormField.tsx — COMP-02 is about the base input/textarea/label primitives only

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus ring state | Custom JS focus tracking | `focus-visible:` Tailwind prefix | Browsers handle focus-visible natively; CSS-only is correct |
| Error state styling | Error prop on Input | `aria-invalid` HTML attribute + Tailwind `aria-invalid:` prefix | Already the pattern in textarea.tsx; keeps HTML semantics correct |
| Active button state | JS click handler | `active:` Tailwind prefix | CSS pseudo-class handles this without JS |
| Dark mode card surface | Separate dark card component | `.dark {}` tokens already in Phase 56; `bg-surface-raised` adapts automatically | Phase 56 dark tokens handle this; no duplication needed |
| Navbar scroll behavior | IntersectionObserver | Existing `bg-background/90 backdrop-blur-xl` is already correct | Backdrop blur is working; this is about hover/active states only |

**Key insight:** Every problem in COMP-01 through COMP-04 is solvable by changing Tailwind class strings inside existing CVA definitions. Zero new infrastructure needed.

## Common Pitfalls

### Pitfall 1: Tailwind v4 Token Reference Syntax
**What goes wrong:** Using `bg-[--color-surface-raised]` (bracket syntax) when `bg-surface-raised` (direct utility) should work because Phase 56 registered tokens in `@theme {}`
**Why it happens:** Developers default to CSS variable bracket syntax when direct Tailwind utilities exist
**How to avoid:** Phase 56 registered `--color-surface-*` in `@theme {}` — these are available as `bg-surface-raised`, `bg-surface-base`, etc. as direct Tailwind utilities in Tailwind v4
**Warning signs:** `bg-[var(--color-surface-raised)]` in the output — should be `bg-surface-raised`

### Pitfall 2: Card.tsx Discriminated Union Complexity
**What goes wrong:** Editing the base card `cva()` accidentally affects service/pricing/project/testimonial cards which override it with `cardVariants({ variant: 'glassLight' })`
**Why it happens:** The `Card` component has 5 variants hardcoded inside the render function for special cards
**How to avoid:** Only change the `default` variant in `cardVariants`. Service/pricing/project/testimonial cards use `glassLight`/`glass` variants explicitly — they are immune to `default` changes. Verify by checking which variant each special card calls.

### Pitfall 3: Input Wrapper div Breaking className
**What goes wrong:** The `Input` component wraps in `<div className="relative">` — className applied to Input goes to the `<input>` element, not the wrapper. Error state border goes to the right place, but any width/layout class might not
**Why it happens:** The currency variant pattern required a wrapper div for the `$` prefix span
**How to avoid:** Error state via `aria-invalid:border-destructive` goes on the `<input>` — this is correct. Don't add width/container styles to the cva string expecting them on the wrapper.

### Pitfall 4: Navbar `hover:bg-accent` Bug
**What goes wrong:** Current code has `hover:bg-accent` on nav links which fills the full link background with the amber accent color — looks bad, not linear/resend-style
**Why it happens:** Original code was written before the amber accent palette was this saturated
**How to avoid:** Change hover to `hover:bg-muted` (neutral), not `hover:bg-accent`. Active state keeps `bg-accent/10 text-accent` — that distinction matters.

### Pitfall 5: Footer Inline Style Hack
**What goes wrong:** Footer has `style={{ backgroundColor: 'hsl(222 47% 11%)' }}` — hardcoded hex/hsl value not using the design token system
**Why it happens:** Legacy code from before Phase 56 established the dark surface tokens
**How to avoid:** Replace with `bg-background-dark` token class or `bg-[var(--color-background-dark)]`. The `--color-background-dark` token is `oklch(0.12 0.015 260)` — dark slate blue.

### Pitfall 6: Double 'use client' Directives
**What goes wrong:** `Footer.tsx` and `label.tsx` and `select.tsx` each have two `'use client'` directives at the top
**Why it happens:** Copy-paste artifact
**How to avoid:** While touching these files, clean up the duplicate directive. This is a minor hygiene fix, not scope creep.

### Pitfall 7: Biome Formatting of cn() Calls
**What goes wrong:** Biome has specific preferences for single-line vs multi-line `cn()` calls — may require adjustments on commit
**Why it happens:** Established in Phase 57 — Biome toggles cn() format in multi-line JSX contexts
**How to avoid:** Run `bunx biome check --write` after each file change before committing; match existing cn() formatting patterns in the file

## Code Examples

Verified patterns from codebase inspection:

### Button: Current vs Polished Primary
```typescript
// Source: src/components/ui/button.tsx (current)
default: 'bg-primary text-primary-foreground hover:bg-primary/90',

// Polished — adds shadow, explicit active state, stronger focus ring
default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/80 active:bg-primary/70 focus-visible:ring-primary/30',
```

### Input: Adding Error State to Match Textarea
```typescript
// Source: src/components/ui/textarea.tsx (existing pattern)
// textarea already has: aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive

// Source: src/components/ui/input.tsx (current — MISSING these)
'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ...'

// Polished input cva base string should include:
'... aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ...'
```

### Input: Sunken Surface for Depth
```typescript
// Phase 56 established surface-sunken for inputs (oklch(0.955 0.008 90) in light, oklch(0.1 0.012 260) in dark)
// Replace bg-background with bg-surface-sunken for visual depth
'flex h-10 w-full rounded-md border border-input bg-surface-sunken px-3 py-2 ...'
// Note: verify bg-surface-sunken works as Tailwind utility from @theme {} registration
```

### Card: Default Variant with Elevated Surface
```typescript
// Source: src/components/ui/card.tsx (current)
default: 'border-border shadow-xs',

// Polished — uses surface-raised for visual distinction from page background
default: 'border-border-subtle bg-surface-raised shadow-sm',
```

### Navbar: Fixed Hover State
```typescript
// Source: src/components/layout/Navbar.tsx (current — buggy)
pathname === item.href
  ? 'text-accent bg-accent/10'
  : 'text-muted-foreground hover:text-accent-foreground hover:bg-accent dark:text-foreground'

// Polished — neutral hover, accent active only
pathname === item.href
  ? 'text-accent bg-accent/10'
  : 'text-muted-foreground hover:text-foreground hover:bg-muted dark:text-foreground'
```

### Footer: Remove Inline Style
```typescript
// Source: src/components/layout/Footer.tsx (current)
<footer style={{ backgroundColor: 'hsl(222 47% 11%)' }} ...>

// Polished — use design token
<footer className="... bg-background-dark" ...>
// Remove the style prop and the className="absolute inset-0 bg-(--color-nav-dark)" overlay div
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded hex colors | OKLCH design tokens in @theme {} | Phase 56 (Feb 2026) | All color references should now use token utilities |
| HSL color-scheme | OKLCH color space | Phase 56 (Feb 2026) | More perceptually uniform; relative color syntax works |
| Generic shadcn defaults | Custom CVA variants | Phase 57 established pattern | button.tsx already has accent/ghost variants; extend this pattern |
| Separate dark mode components | .dark {} token remapping | Phase 56 (Feb 2026) | Single component works in both modes via token switching |

**Current active/available tokens (Phase 56 output):**
- Surface: `bg-surface-base`, `bg-surface-raised`, `bg-surface-elevated`, `bg-surface-sunken`
- Border: `border-border-subtle`, `border-border-strong`
- Shadow: `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-glow`, `shadow-glow-accent`
- Typography: `text-page-title`, `text-section-title`, `text-h1`–`text-h4`, `text-lead`, `text-eyebrow`, `text-caption`
- Spacing: `gap-tight`, `gap-content`, `gap-comfortable`, `card-padding`, `card-padding-sm`, `card-padding-lg`, `py-section`

## Open Questions

1. **Should badge `shape` prop include the active `shape` variant in CVA?**
   - What we know: Badge has `shape: { rounded: 'rounded-md', full: 'rounded-full' }` defaulting to `full` — already reasonable
   - What's unclear: Whether COMP-01 intends badge variants need changes or just button variants
   - Recommendation: Badge is fairly polished already (has `accent`, `success`, `warning`, `info` variants). Include only if visual inspection shows gaps; otherwise focus on button, input, card, navbar as the four COMP-xx requirements specify.

2. **Is `bg-surface-raised` a valid direct Tailwind v4 utility from @theme {} registration?**
   - What we know: Phase 56 added `--color-surface-raised: oklch(0.995 0.001 90)` to `@theme {}`
   - What we know: In Tailwind v4, `@theme { --color-X: Y }` makes `bg-X`, `text-X`, etc. available
   - What's unclear: Whether the `surface-raised` naming convention produces `bg-surface-raised` vs needing `bg-[--color-surface-raised]`
   - Recommendation: Verify with a quick `bun run build` or dev server — if it doesn't work, fall back to `bg-[var(--color-surface-raised)]` bracket syntax. This is a one-line verification.

3. **Does the `select.tsx` SelectContent need matching focus ring polish?**
   - What we know: SelectTrigger uses `focus-ring` semantic class from globals.css; SelectContent uses `bg-popover`
   - What's unclear: Whether COMP-02 scope includes select dropdown styling or just input/textarea
   - Recommendation: Yes — SelectTrigger should match Input styling (border-input, bg-surface-sunken) since it's a form control. SelectContent popup can stay as-is.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bun:test + @testing-library/react + happy-dom |
| Config file | `bunfig.toml` (preload `tests/setup.ts`) |
| Quick run command | `bun test tests/unit/components.test.tsx` |
| Full suite command | `bun test tests/` |
| Estimated runtime | ~10-15 seconds |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | Button primary has distinct brand styling (shadow, active state) | unit/structural | `bun test tests/unit/components.test.tsx` | ✅ yes (extend existing) |
| COMP-01 | Button accent vs ghost are visually differentiated (CSS class check) | unit/structural | `bun test tests/unit/components.test.tsx` | ✅ yes (extend existing) |
| COMP-02 | Input has aria-invalid error state classes | unit/structural | `bun test tests/unit/components.test.tsx` | ✅ yes (extend existing) |
| COMP-02 | Textarea has consistent focus/error classes matching input | unit/structural | `bun test tests/unit/components.test.tsx` | ✅ yes (extend existing) |
| COMP-03 | Card default variant has non-transparent background (surface-raised) | unit/structural | `bun test tests/unit/components.test.tsx` | ✅ yes (extend existing) |
| COMP-03 | Card default variant has border and shadow | unit/structural | `bun test tests/unit/components.test.tsx` | ✅ yes (extend existing) |
| COMP-04 | Navbar active link has accent class | unit/structural | `bun test tests/unit/navigation.test.tsx` | ✅ yes (extend existing) |
| COMP-04 | Navbar inactive link does NOT have bg-accent hover class | unit/structural | `bun test tests/unit/navigation.test.tsx` | ✅ yes (extend existing) |

**Testing approach:** Follow Phase 57 TDD RED scaffold pattern — write assertions in Wave 0 before touching component files. Assert CSS class strings via `className.includes('class-name')` or `toHaveClass()`. Render components with RTL, use `container.querySelector` for structural checks.

**Key mock needs for COMP-04 navbar test:**
```typescript
// mock.module('next/navigation') needed for usePathname
mock.module('next/navigation', () => ({
  usePathname: () => '/services'  // simulate active route
}))
```
The existing `tests/unit/navigation.test.tsx` already exists — check its current state before creating new tests.

### Nyquist Sampling Rate
- **Minimum sample interval:** After every committed task → run: `bun test tests/unit/components.test.tsx tests/unit/navigation.test.tsx`
- **Full suite trigger:** Before merging final task of any plan wave → `bun test tests/`
- **Phase-complete gate:** Full suite green before `/gsd:verify-work` runs
- **Estimated feedback latency per task:** ~10 seconds

### Wave 0 Gaps (must be created before implementation)
- [ ] `tests/unit/components.test.tsx` — add COMP-01 button variant assertions, COMP-02 input error state assertions, COMP-03 card surface assertions (file EXISTS but needs new describe blocks for these requirements)
- [ ] `tests/unit/navigation.test.tsx` — add COMP-04 navbar hover/active class assertions (file EXISTS but check current coverage before adding)

**Wave 0 is test extension, not creation** — both target files exist. The scaffold task adds new `describe` blocks covering the COMP-xx requirements.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `src/components/ui/button.tsx`, `input.tsx`, `textarea.tsx`, `card.tsx`, `badge.tsx`, `label.tsx`, `select.tsx`, `field.tsx`
- Direct codebase inspection — `src/components/layout/Navbar.tsx`, `Footer.tsx`
- Direct codebase inspection — `src/app/globals.css` (full token inventory)
- Phase 56 SUMMARY files — token system provided (56-01-SUMMARY.md, 56-02-SUMMARY.md)
- Phase 57 SUMMARY files — button pattern established (57-02-SUMMARY.md)

### Secondary (MEDIUM confidence)
- REQUIREMENTS.md COMP-01 through COMP-04 definitions — scope boundary
- STATE.md decisions — "Inspiration: Resend, Linear, Clerk — purposeful dark aesthetic, tight type scale, polished components"; "No animations in this milestone"

### Tertiary (LOW confidence)
- None — all findings based on direct codebase inspection

## Metadata

**Confidence breakdown:**
- Current component state: HIGH — direct file inspection
- Token availability: HIGH — Phase 56 SUMMARY confirms exact tokens
- Button/card/input patterns: HIGH — CVA variant strings read directly
- Navbar hover bug: HIGH — className string inspected directly
- Test infrastructure: HIGH — setup.ts, existing test files inspected

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (stable — all findings based on local codebase, not external APIs)
