# Typography Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 8 semantic heading classes to `globals.css`, then sweep all pages/components replacing raw Tailwind heading combos with those classes.

**Architecture:** Two-wave execution. Wave 1 extends `globals.css` with `--font-weight-black` token and 8 new `@layer components` classes. Wave 2 runs 4 parallel agents each covering a distinct file group, replacing concrete raw patterns with the new classes. Color utilities are never removed — only size/weight/leading/tracking consolidations happen.

**Tech Stack:** Tailwind CSS v4 `@theme {}` / `@layer components`, Next.js 15, TypeScript strict, Biome linter

---

## Pattern Map (raw Tailwind → semantic class)

Use this table in every Task below. Only replace patterns in **heading / label / body-intro context** — not inside button labels, nav items, or icon badges.

| Raw pattern | Replace with | Notes |
|---|---|---|
| `text-responsive-3xl font-black` | `text-page-title` | Exact match, safe |
| `text-4xl font-bold` | `text-h1` | Keep color/max-width utils |
| `text-3xl font-bold` | `text-h2` | Keep color/max-width utils |
| `text-3xl font-semibold` | `text-h2` | Same size tier |
| `text-2xl font-bold` | `text-h3` | Most common — 30+ occurrences |
| `text-2xl font-semibold` | `text-h3` | Same size tier |
| `text-xl font-semibold` | `text-h4` | Keep color util |
| `text-xl font-medium` | `text-h4` | Keep color util |
| `text-xs uppercase tracking-wide font-bold` | `text-eyebrow` | Keep color util, remove `uppercase` (class includes it) |
| `text-xs uppercase tracking-wider font-medium` | `text-eyebrow` | Same |
| `text-xl leading-relaxed` (body/para context) | `text-lead` | Keep color/max-width utils |

**DO NOT replace:**
- `text-5xl md:text-7xl ...` or any multi-breakpoint hero with custom responsive overrides
- `text-4xl lg:text-5xl` responsive combos — leave as-is
- `text-8xl lg:text-9xl` (404 page) — leave as-is
- `text-section-title font-black` — `.text-section-title` already a semantic class; `font-black` will be handled by `--font-weight-black` token if needed later
- Font sizes inside button/badge/chip/nav context

---

## Wave 1

### Task 1: Extend `globals.css` with token and 8 new semantic classes

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add `--font-weight-black` to `@theme {}`**

In `globals.css`, locate the Font weights block (around line 144):

```css
/* Font weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-heading: 700;
```

Add after `--font-weight-heading`:

```css
--font-weight-black: 900;
```

**Step 2: Update `.text-page-title` to use `--font-weight-black`**

Locate `.text-page-title` in `@layer components` (around line 411):

```css
.text-page-title {
	font-size: var(--font-size-hero);
	line-height: var(--line-height-hero);
	letter-spacing: var(--tracking-heading);
	font-weight: var(--font-weight-heading);
}
```

Change `--font-weight-heading` to `--font-weight-black`:

```css
.text-page-title {
	font-size: var(--font-size-hero);
	line-height: var(--line-height-hero);
	letter-spacing: var(--tracking-heading);
	font-weight: var(--font-weight-black);
}
```

**Step 3: Add 8 new semantic classes**

Directly after the `.text-section-title` block (around line 422), add:

```css
.text-eyebrow {
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-semibold);
	letter-spacing: var(--tracking-widest);
	line-height: var(--line-height-normal);
	text-transform: uppercase;
}
.text-hero-subtitle {
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-normal);
	line-height: var(--line-height-relaxed);
	letter-spacing: var(--tracking-normal);
}
.text-h1 {
	font-size: var(--font-size-4xl);
	font-weight: var(--font-weight-bold);
	line-height: var(--line-height-snug);
	letter-spacing: var(--tracking-heading);
}
.text-h2 {
	font-size: var(--font-size-3xl);
	font-weight: var(--font-weight-semibold);
	line-height: var(--line-height-snug);
	letter-spacing: var(--tracking-heading);
}
.text-h3 {
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-semibold);
	line-height: var(--line-height-normal);
	letter-spacing: var(--tracking-tight);
}
.text-h4 {
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-medium);
	line-height: var(--line-height-normal);
	letter-spacing: var(--tracking-normal);
}
.text-lead {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-normal);
	line-height: var(--line-height-relaxed);
	letter-spacing: var(--tracking-normal);
}
.text-caption {
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-normal);
	line-height: var(--line-height-normal);
	letter-spacing: var(--tracking-normal);
}
```

**Step 4: Verify build passes**

```bash
bun run build 2>&1 | tail -5
```

Expected: build succeeds, no CSS errors.

**Step 5: Verify lint passes**

```bash
bun run lint
```

Expected: zero violations.

**Step 6: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add semantic heading classes and --font-weight-black token"
```

---

## Wave 2 (run all 4 tasks in parallel after Task 1 commits)

### Task 2: Components sweep — `src/components/**/*.tsx`

**Files:**
- Modify (heading context only): `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/components/ui/card.tsx`, `src/components/ui/bento-grid.tsx`, `src/components/ui/BackgroundPattern.tsx`, `src/components/forms/FormSuccessMessage.tsx`, `src/components/utilities/ErrorBoundary.tsx`, `src/components/calculators/Calculator.tsx`, `src/components/calculators/CalculatorLayout.tsx`, `src/components/calculators/CalculatorResults.tsx`, `src/components/calculators/ComparisonView.tsx`, `src/components/pricing-card.tsx`, `src/components/project-card.tsx`

**Step 1: Apply pattern map**

For each file, grep for patterns in the Pattern Map table at the top of this document, then apply substitutions.

Key occurrences confirmed:
- `src/components/layout/Navbar.tsx:66` — `text-xs text-accent font-medium tracking-wider uppercase` → `text-eyebrow text-accent` (remove `uppercase tracking-wider font-medium`, add class)
- `src/components/pricing-card.tsx:80,97` — `text-xs uppercase tracking-wide text-muted-foreground font-bold` → `text-eyebrow text-muted-foreground`
- `src/components/ui/card.tsx:249,267` — `text-xs uppercase tracking-wide text-muted-foreground font-bold` → `text-eyebrow text-muted-foreground`
- `src/components/ui/bento-grid.tsx:63` — `text-xl font-semibold text-foreground` → `text-h4 text-foreground`
- `src/components/calculators/CalculatorLayout.tsx:38` — `text-4xl font-bold tracking-tight` → `text-h1` (remove `tracking-tight`, class includes it)
- `src/components/calculators/Calculator.tsx:202` — `text-4xl font-bold text-foreground` → `text-h1 text-foreground`
- `src/components/calculators/Calculator.tsx:274` — `text-xl font-semibold text-foreground` → `text-h4 text-foreground`
- `src/components/calculators/CalculatorResults.tsx:87` — `text-xl font-semibold text-foreground` → `text-h4 text-foreground`
- `src/components/calculators/ComparisonView.tsx:32` — `text-xl font-semibold text-foreground` → `text-h4 text-foreground`
- `src/components/utilities/ErrorBoundary.tsx:103` — `text-2xl font-bold text-foreground` → `text-h3 text-foreground`
- `src/components/forms/FormSuccessMessage.tsx:27` — `text-2xl text-pretty font-bold` → `text-h3 text-pretty`

**Step 2: Verify build**

```bash
bun run build 2>&1 | tail -5
```

**Step 3: Verify lint**

```bash
bun run lint
```

**Step 4: Commit**

```bash
git add src/components/
git commit -m "refactor: apply semantic heading classes to shared components"
```

---

### Task 3: Homepage + tools sweep — `src/app/page.tsx` + `src/app/(tools)/**`

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/(tools)/` all `.tsx` files
- Modify: `src/app/tools/page.tsx` (if exists)

**Step 1: Apply pattern map to `src/app/page.tsx`**

Key occurrences confirmed:
- Line 109: `text-responsive-3xl font-black` → `text-page-title`
- Line 117: `text-responsive-xl font-bold text-accent` → `text-hero-subtitle text-accent font-bold` (keep bold for accent emphasis; hero-subtitle sets size/leading)
- Line 122: `text-xl text-muted-foreground leading-relaxed max-w-xl` → `text-lead text-muted-foreground max-w-xl`
- Line 265: `text-responsive-2xl font-black` — check context; if section heading → `text-h1` or `text-page-title` depending on visual weight
- Line 331: `text-xl text-muted-foreground leading-relaxed max-w-3xl` → `text-lead text-muted-foreground max-w-3xl`
- Line 359: `text-4xl lg:text-5xl font-black` — **DO NOT REPLACE** (responsive override)
- Line 413: `text-xl text-muted-foreground leading-relaxed max-w-3xl` → `text-lead text-muted-foreground max-w-3xl`
- Line 645: `text-xl text-muted-foreground mb-12 max-w-3xl leading-relaxed` → `text-lead text-muted-foreground mb-12 max-w-3xl`

**Step 2: Apply pattern map to tools pages**

Use grep to find all heading patterns in `src/app/(tools)/`:

```bash
grep -rn "text-[0-9]xl font-\(bold\|semibold\|black\)" src/app/\(tools\)/ --include="*.tsx"
```

Apply Pattern Map substitutions to each result.

**Step 3: Verify build**

```bash
bun run build 2>&1 | tail -5
```

**Step 4: Verify lint**

```bash
bun run lint
```

**Step 5: Commit**

```bash
git add src/app/page.tsx src/app/\(tools\)/
git commit -m "refactor: apply semantic heading classes to homepage and tool pages"
```

---

### Task 4: Service/about/contact/blog/other pages sweep

**Files:**
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/contact/page.tsx`
- Modify: `src/app/services/page.tsx` + `src/app/services/layout.tsx`
- Modify: `src/app/blog/page.tsx`
- Modify: `src/app/faq/FaqClient.tsx`
- Modify: `src/app/testimonials/page.tsx` (check — has large hero sizes, many may be exempt)
- Modify: `src/app/showcase/page.tsx` + `src/app/showcase/[slug]/page.tsx`
- Modify: `src/app/portfolio/[slug]/page.tsx`
- Modify: `src/app/help/page.tsx` + `src/app/help/[category]/page.tsx` + `src/app/help/[category]/[slug]/page.tsx`
- Modify: `src/app/privacy/page.tsx`
- Modify: `src/app/not-found.tsx` (check — has `text-8xl lg:text-9xl font-black`, DO NOT replace that)

**Step 1: Apply pattern map**

Key occurrences confirmed:
- `src/app/about/page.tsx:70` — `text-responsive-lg font-black` — check if semantic class fits; if section heading use `text-h2`
- `src/app/about/page.tsx:107` — `text-2xl font-bold text-foreground` → `text-h3 text-foreground`
- `src/app/about/page.tsx:344` — `text-3xl font-black text-accent` → check context; could be `text-h2 text-accent` if section heading
- `src/app/contact/page.tsx:72` — `text-clamp-2xl font-black` — custom clamp class, leave font-black but note it will render 900 weight now
- `src/app/services/page.tsx:242` — `text-4xl font-bold text-foreground` → `text-h1 text-foreground`
- `src/app/blog/page.tsx:60` — `text-clamp-xl font-black` — custom clamp class, leave size
- `src/app/faq/FaqClient.tsx:184` — `text-2xl font-bold text-foreground` → `text-h3 text-foreground`
- `src/app/faq/FaqClient.tsx:146` — `text-4xl md:text-6xl font-black` — **DO NOT REPLACE** (responsive override)
- `src/app/showcase/[slug]/page.tsx:160` — `text-3xl font-bold text-foreground` → `text-h2 text-foreground`
- `src/app/showcase/[slug]/page.tsx:183` — `text-xl font-semibold text-foreground` → `text-h4 text-foreground`
- `src/app/portfolio/[slug]/page.tsx:224,248,269` — `text-2xl font-bold text-foreground` → `text-h3 text-foreground`
- `src/app/portfolio/[slug]/page.tsx:230` — `text-3xl md:text-4xl font-bold` — **DO NOT REPLACE** (responsive override)
- `src/app/privacy/page.tsx:21` — `text-responsive-lg text-accent font-black` → check context; keep `text-accent`
- `src/app/privacy/page.tsx:34,56` — `text-2xl font-bold text-foreground` → `text-h3 text-foreground`
- `src/app/not-found.tsx:34` — `text-xl text-secondary-foreground mb-8 leading-relaxed` → `text-lead text-secondary-foreground mb-8`
- `src/app/help/[category]/[slug]/page.tsx:159` — `text-xl md:text-2xl font-semibold` — **DO NOT REPLACE** (responsive override)
- `src/app/help/[category]/[slug]/page.tsx:164` — `text-lg md:text-xl font-semibold` — **DO NOT REPLACE** (responsive override)
- `src/app/help/[category]/page.tsx:136` — `text-xl font-semibold text-foreground` → `text-h4 text-foreground`

**Step 2: Verify build**

```bash
bun run build 2>&1 | tail -5
```

**Step 3: Verify lint**

```bash
bun run lint
```

**Step 4: Commit**

```bash
git add src/app/about/ src/app/contact/ src/app/services/ src/app/blog/ src/app/faq/ src/app/testimonials/ src/app/showcase/ src/app/portfolio/ src/app/help/ src/app/privacy/ src/app/not-found.tsx
git commit -m "refactor: apply semantic heading classes to service/about/content pages"
```

---

### Task 5: Location + dynamic pages sweep

**Files:**
- Modify: `src/app/locations/page.tsx`
- Modify: `src/app/locations/[slug]/page.tsx`

**Step 1: Apply pattern map**

Key occurrences confirmed:
- `src/app/locations/page.tsx:49,75` — `text-2xl font-semibold text-foreground` → `text-h3 text-foreground`
- `src/app/locations/[slug]/page.tsx:112` — `text-3xl font-bold text-primary` → `text-h2 text-primary`
- `src/app/locations/[slug]/page.tsx:142,163` — `text-2xl font-bold text-foreground` → `text-h3 text-foreground`
- `src/app/locations/[slug]/page.tsx:184` — `text-3xl font-bold text-foreground` → `text-h2 text-foreground`

**Step 2: Verify build**

```bash
bun run build 2>&1 | tail -5
```

**Step 3: Verify lint**

```bash
bun run lint
```

**Step 4: Run full test suite**

```bash
bun test tests/
```

Expected: 360 tests pass, 0 failures.

**Step 5: Commit**

```bash
git add src/app/locations/
git commit -m "refactor: apply semantic heading classes to location pages"
```

---

## Final verification

After all Wave 2 tasks complete:

```bash
bun run build && bun run lint && bun run typecheck && bun test tests/
```

All must pass. Then verify visually:
1. Open dev server: `bun run dev`
2. Check homepage hero — h1 weight should be 900 (black), visually heavier than before
3. Check a section heading — h2/h3 should be visually clean, consistent
4. Toggle dark mode — headings should remain properly sized (they don't affect color)
5. Check an eyebrow label (e.g., Navbar badge) — should be small, uppercase, wide tracking

---

## Success criteria

- `src/app/globals.css` has `--font-weight-black: 900` in `@theme {}` and 8 new classes in `@layer components`
- No file contains the raw heading combos from the Pattern Map table (except DO NOT REPLACE cases)
- `bun run build` succeeds
- `bun test tests/` — 360 tests pass
- `bun run lint` — zero violations
- `bun run typecheck` — zero errors
