# Pitfalls Research

**Domain:** UI/UX redesign of existing production Next.js 15 + Tailwind CSS + shadcn/ui site
**Researched:** 2026-02-25
**Confidence:** HIGH (based on shadcn/ui, Tailwind, and Next.js documented mechanics plus project-specific constraints)

---

## Critical Pitfalls

### Pitfall 1: Overriding shadcn CSS Variables and Breaking Dark Mode

**What goes wrong:**
shadcn/ui components are wired entirely to CSS custom properties defined in `globals.css` (e.g., `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`). When a redesign introduces new brand color values by redefining only the `:root` block — or by using Tailwind arbitrary values (`bg-[#1a1a2e]`) on surfaces that contain shadcn components — the `.dark` block and the component internals diverge silently. Buttons look fine in light mode; cards turn white-on-white or black-on-black in dark mode. The regression only appears at runtime — not in TypeScript or Biome.

**Why it happens:**
Designers and developers working primarily in light mode change `:root` variable values without touching the `.dark` block. shadcn components use `hsl(var(--background))` not `bg-white`, so Tailwind arbitrary overrides do not directly break the component — they break the surface the component sits on.

**How to avoid:**
- Always edit CSS variables in both `:root` and `.dark` blocks simultaneously. Treat them as a single atomic unit.
- Treat the `globals.css` variable table as a contract: every variable in `:root` must have a corresponding value in `.dark`.
- Do not use Tailwind arbitrary color values (`bg-[#...]`) on surfaces that contain shadcn components — use the token system instead.
- After any CSS variable change, render every component variant in both light and dark mode before committing.

**Warning signs:**
- Any `bg-[...]` or `text-[...]` class added to a page wrapper or card that wraps shadcn primitives.
- `globals.css` diff shows only `:root` block changed with no corresponding `.dark` change.
- Build passes cleanly but manual dark-mode toggle reveals invisible text or washed-out buttons.

**Phase to address:**
Design Tokens Phase (first phase of v4.0) — establish the complete token contract for both `:root` and `.dark` before any component work begins.

---

### Pitfall 2: CSS Specificity Wars Between globals.css Utilities and Tailwind Utility Classes

**What goes wrong:**
This project already uses semantic CSS classes (`.glass-card`, `.gradient-text`, `.hover-lift`, `.button-hover-glow`, `.section-spacing`) defined in `globals.css` using `@layer utilities`. When new polishing work adds `@layer base` or `@layer components` rules — or adds inline Tailwind classes that conflict — Tailwind's cascade order (`base → components → utilities`) causes one rule to silently win over another in a non-obvious way. A component looks correct in isolation but wrong when placed inside a layout section because a `globals.css` rule from `@layer base` overrides a responsive utility applied at the component level.

**Why it happens:**
Developers add polish as one-off Tailwind classes in JSX without realising a `globals.css` layer rule already targets the same element or property. The specificity hierarchy is invisible in JSX — there is no type error, no Biome warning, no runtime error.

**How to avoid:**
- Before adding any new `globals.css` rule, search the codebase for existing rules that target the same selector or property.
- Place new design-system utilities in `@layer utilities` only — never in `@layer base` (reserve base for resets and element defaults only).
- Document each new semantic class with a comment listing its purpose and what it must not conflict with.
- Use the `!` (important) Tailwind modifier only as a last resort, with a comment explaining why.

**Warning signs:**
- A Tailwind class applied in JSX has no visible effect even though the value is correct and valid.
- A hover state or transition works in isolation but disappears inside a specific layout section.
- `globals.css` grows past roughly 200 lines without clear `@layer` boundaries.
- A class from globals.css and a Tailwind utility exist on the same element targeting the same property.

**Phase to address:**
Design Tokens Phase (Phase 1) — define `@layer` boundaries and the semantic class inventory before any component polish begins. Enforce during every subsequent Component Polish phase.

---

### Pitfall 3: Breaking Existing WCAG AA Compliance with "Premium" Color Choices

**What goes wrong:**
The project achieved WCAG AA contrast compliance (4.5:1 for normal text, 3:1 for large text and UI components) in v2.0, explicitly documented in PROJECT.md. A redesign that introduces softer, more "premium" colors — lighter grays, muted brand accents, reduced-opacity overlays — frequently drops contrast ratios below AA thresholds. This is invisible in development unless a contrast checker is run. Real users with low vision are immediately affected.

**Why it happens:**
Design aesthetics and accessibility requirements pull in opposite directions for muted or subtle color schemes. A color described as "sophisticated" or "refined" is often one with insufficient contrast. Palette changes for the premium feel (e.g., switching from a high-contrast dark button to a softer brand gradient) are not automatically validated.

**How to avoid:**
- Run contrast checks on every new color pair before it enters the codebase. Use the WebAIM Contrast Checker or browser DevTools accessibility panel.
- Include contrast ratios as comments next to CSS variable definitions: `/* --muted-foreground: 4.6:1 on --background */`.
- Include a contrast verification step in the definition of done for every phase: render the page, check every text color against its background.
- Never use `opacity-*` on text as a substitute for a lighter color — it reduces contrast without any TypeScript or lint error.
- `text-muted-foreground` is designed for captions and helper text, not body copy — do not use it on primary content.

**Warning signs:**
- A new color is described as "muted", "soft", "subtle", or "ghost" — these are contrast-risk words.
- Any `opacity-*` class is applied to text or icon elements.
- New gradient backgrounds placed under white or light text.
- The design review focuses on aesthetics without running a contrast check.

**Phase to address:**
Design Tokens Phase (Phase 1) — a bad palette choice here forces re-checking every component in every subsequent phase. Verify AA compliance for the full token set before any component work begins.

---

### Pitfall 4: Shadcn Component Internals Broken by className Overrides

**What goes wrong:**
shadcn/ui components accept a `className` prop merged with internal variant classes using `cn()` (clsx + tailwind-merge). When a redesign adds raw Tailwind classes via `className` that conflict with variant classes — for example, `bg-blue-600` on a Button with `variant="outline"` — tailwind-merge resolves the conflict but the variant logic is bypassed. The component looks correct in the default enabled state but is broken for hover, focus, disabled, and loading states. The regression is silent — no TypeScript error, no Biome warning.

**Why it happens:**
`className` overrides feel like the safe, non-destructive way to customise a component. The immediate visual result looks correct. The variant system failures in non-default states are only discovered through manual testing.

**How to avoid:**
- For any sustained color or style change, edit the component's `cva()` variant definitions inside the component file, not at the call site via `className`.
- Never add `bg-*`, `text-*`, `border-*`, or `ring-*` classes via `className` on shadcn primitives — these conflict directly with variant logic.
- If a new visual style is needed site-wide, create a new variant in the `cva()` call and use the variant prop.
- Reserve `className` on shadcn components for layout and spacing concerns only: margins, widths, flex/grid placement.

**Warning signs:**
- A shadcn component has `className="bg-... text-..."` passed from a parent.
- The disabled state of a button is visually identical to the enabled state after a style change.
- Focus ring styles disappear after a "quick fix" className addition.
- A component looks correct in a screenshot but keyboard navigation shows no focus indicator.

**Phase to address:**
Component Polish Phase — when re-styling buttons, inputs, and cards, work inside the `cva()` definitions, not around them.

---

### Pitfall 5: CSS Build Size Regression from Unguarded globals.css Additions

**What goes wrong:**
The project maintains first-load JS under 180kB per page and has validated performance infrastructure. CSS is separate but a redesign that adds many `@keyframes` blocks, imports animation libraries, or adds large `@font-face` declarations can silently push the CSS bundle past practical limits. Tailwind's JIT purges unused utility classes but does NOT purge manually added `@keyframes`, `@font-face`, or `@layer base` rules.

**Why it happens:**
CSS additions are not tracked the same way JS bundle size is. Developers add animation keyframes, font weight variants, or icon utilities to `globals.css` without checking the output size. Each addition seems small in isolation; collectively they add up.

**How to avoid:**
- Run `bun run build` and check `.next/static/css/` output sizes after every significant `globals.css` change.
- Do not import Framer Motion or GSAP for decorative animations on marketing pages — use Tailwind's built-in `animate-*` utilities or CSS `@keyframes` defined sparingly.
- If a heavy animation library is genuinely required, wrap it in `next/dynamic` with `ssr: false` so it is not in the critical CSS path.
- Keep `globals.css` to design tokens and semantic layout utilities — not animation keyframe libraries.

**Warning signs:**
- `globals.css` grows significantly after a design pass (check `git diff --stat`).
- New npm packages installed that include `*.css` files — check their sizes.
- Build output shows a CSS chunk significantly larger than pre-phase baseline.
- A "smooth animation" is implemented by installing a library rather than writing a CSS class.

**Phase to address:**
Every phase — enforce a `bun run build` check as part of the definition of done. Most acute risk during any Hero or Animation phase.

---

### Pitfall 6: Google Font Loading Breaking Core Web Vitals (CLS and LCP)

**What goes wrong:**
Adding a new font family without correct Next.js font optimisation causes Cumulative Layout Shift (CLS) — the page "jumps" when the font loads — and degrades Largest Contentful Paint (LCP). This is especially damaging on the hero section and above-fold text. The project validated Core Web Vitals in v3.0. A font change can silently regress this in production even though the dev server looks fine, because fonts are cached locally during development.

**Why it happens:**
Developers add a Google Font via `<link>` in the layout or `@import` in `globals.css`. Both use the default browser font-loading behaviour, which causes FOUT (Flash of Unstyled Text) and CLS. Next.js `next/font` solves this with zero-CLS loading but requires a specific import pattern.

**How to avoid:**
- Use `next/font/google` exclusively — never `<link rel="stylesheet">` for fonts, never `@import url(...)` in CSS.
- Import the font in `src/app/layout.tsx`, apply the CSS variable to the `<html>` element, reference it via a CSS custom property in `globals.css`.
- Set `display: 'swap'` and `preload: true` on the font object.
- Only load the font weights actually used in the design — typically 400, 500, and 700 at most.
- Test font loading with Chrome DevTools Network throttling set to "Slow 3G" before any font change is merged.

**Warning signs:**
- A `<link href="https://fonts.googleapis.com/...">` tag appears in any layout or page file.
- An `@import url("https://fonts.googleapis.com/...")` appears in `globals.css`.
- Multiple font weights loaded when the design only uses 2-3.
- CLS score in Vercel Speed Insights spikes after a deployment.

**Phase to address:**
Design Tokens Phase (Phase 1) — if a font change is needed, establish it using `next/font/google` before any other phase builds on top of it.

---

### Pitfall 7: Accidental Tailwind Major Version Upgrade During Dependency Updates

**What goes wrong:**
As of early 2026, Tailwind CSS v4 is in active release. The project currently uses Tailwind v3. shadcn/ui components, `tailwind-merge`, and `clsx` all have version-specific behaviour. If Tailwind is inadvertently upgraded to v4 during a dependency update — or if `npx shadcn@latest add` installs components targeting v4 — the entire design system breaks. All `@apply` directives in `globals.css` fail, all `cva()` class strings produce wrong output, and `tailwind-merge` v2/v3 may not handle v4 class names correctly.

**Why it happens:**
`bun update` or Dependabot bumps can pull in a major version if semver ranges are not pinned. `shadcn@latest` always targets the latest shadcn version, which may assume Tailwind v4.

**How to avoid:**
- Pin Tailwind to the current major version in `package.json`: `"tailwindcss": "3.x.x"` — not a caret range that allows v4.
- Before running `shadcn@latest add`, check what Tailwind version the component targets.
- Do not run `bun update` without reading the dependency changelogs.
- Verify `tailwind-merge` version compatibility after any Tailwind version change.

**Warning signs:**
- `tailwindcss` version in `package.json` has been bumped to 4.x in a Dependabot PR.
- `globals.css` `@apply` directives start throwing errors at build time.
- shadcn components render with unstyled or broken layouts after a dependency update.

**Phase to address:**
Pre-work dependency audit at the start of v4.0 before any CSS changes begin.

---

### Pitfall 8: Inline Style Leakage — style={{}} Instead of Tailwind Tokens

**What goes wrong:**
During rapid design iteration, developers reach for `style={{ color: '#...' }}` or `style={{ background: 'linear-gradient(...)' }}` because it is fast and produces the exact visual result immediately. These inline styles bypass the token system entirely, bypass dark mode (they always apply regardless of theme), bypass Biome lint rules, and create a maintenance debt of hard-coded values scattered through JSX. They also cannot be overridden by Tailwind utilities because inline styles have the highest CSS specificity.

**Why it happens:**
Speed of iteration during exploratory design. It is faster to inline a value than to add a token to `globals.css` and verify the token applies correctly across light and dark mode.

**How to avoid:**
- Establish a hard rule: zero `style={{ color: ... }}` or `style={{ background: ... }}` in component files. Layout-only inline styles for dynamic values (computed widths, JS-driven transforms) are acceptable.
- For "exact" values, define a CSS custom property in `globals.css` as a token and reference it via `bg-[--token-name]` in Tailwind v3.
- Enforce via code review — Biome does not have a built-in rule for this pattern.

**Warning signs:**
- Any `style={{` prop containing a color hex, rgb value, or gradient string.
- `style={{ color: 'white' }}` on elements inside dark-mode sections.
- A component that loses its dark-mode styling when tested in isolation.

**Phase to address:**
Component Polish Phase — review every modified component for inline color styles before closing the phase.

---

### Pitfall 9: Mobile Breakpoint Regressions During Desktop-First Polish

**What goes wrong:**
Design polish work naturally focuses on the desktop viewport where the "premium" aesthetic is most visible. Hero sections, card layouts, and type scales are tuned for 1440px. When tested on mobile, the large type scale causes overflow, hero height is too tall, card paddings are too large, and glassmorphism blur effects cause performance degradation — particularly on iOS Safari, which is sensitive to `backdrop-filter`.

**Why it happens:**
Tailwind is mobile-first (`sm:`, `md:`, `lg:`) but designers think desktop-first. Developers implement the desktop design and forget to add the smaller-breakpoint base styles. Blur effects are also expensive on mobile GPUs.

**How to avoid:**
- After every component polish session, resize the browser to 375px (iPhone SE) and 390px (iPhone 14) and verify layout is not broken.
- Use Tailwind's responsive modifier syntax correctly: base styles handle mobile, `md:` and `lg:` handle larger screens.
- Limit `backdrop-filter: blur()` to desktop only — test `backdrop-blur-*` on iOS Safari explicitly.
- Check hero section height on mobile — `min-h-screen` is fine, but a hard-coded pixel value will be too tall.

**Warning signs:**
- A component has only `lg:` or `xl:` responsive classes with no base styles for mobile.
- `backdrop-filter` or `blur-*` is applied unconditionally without a mobile breakpoint qualification.
- Hero `padding-top` is set without a mobile override.
- A horizontal scrollbar appears at 375px viewport width.

**Phase to address:**
Every component phase — mobile verification at 375px is part of the definition of done for each component.

---

### Pitfall 10: Test Suite Regression from Component Interface Changes

**What goes wrong:**
The project has 360 passing unit tests. When a component is polished, its interface may change: new required props, renamed props, removed variants. Test files that import the component directly or via test helpers will fail with TypeScript errors or runtime errors. With 360 tests, even one broken import can cascade failures across many test files, obscuring what actually changed.

**Why it happens:**
UI polish is perceived as "not touching logic", so test files are not checked before the component change. TypeScript strict mode and `bun:test` treat interface changes as breaking changes regardless.

**How to avoid:**
- Before changing any component, search `tests/` for its usage: `grep -r "ComponentName" /path/to/tests/`.
- Add new props as optional with sensible defaults to maintain backward compatibility.
- Run `bun test tests/` after every component change — not just at the end of a phase.
- If removing a prop or variant value, check all call sites codebase-wide before removing it.

**Warning signs:**
- A component prop is renamed or its TypeScript type is narrowed.
- A `variant` value is removed from a `cva()` definition.
- Tests start failing with "Property X does not exist on type" TypeScript errors.
- The passing test count drops between phases.

**Phase to address:**
Every component phase — run `bun test tests/` immediately after each component change, not at the end.

---

### Pitfall 11: Removing or Hiding Accessible Focus Indicators for Aesthetic Cleanliness

**What goes wrong:**
Focus rings are visually noisy. During a polish pass, developers add `outline-none` or `ring-0` to interactive elements to achieve a cleaner look. This makes the site completely unusable for keyboard-only users and fails WCAG 2.1 Success Criterion 2.4.7 (Focus Visible). The project achieved WCAG AA compliance — this regression is a direct compliance failure.

**Why it happens:**
Focus rings are only visible when using a keyboard. Developers testing with a mouse never see them and do not notice when they are removed. The visual cleanliness improvement is immediately obvious; the accessibility breakage is invisible during normal development.

**How to avoid:**
- Use `focus-visible:ring-2` not `focus:ring-2` — this shows rings only during keyboard navigation, not on mouse click, which satisfies both aesthetics and accessibility.
- Style the focus ring to match the design system (e.g., `focus-visible:ring-brand-500`) rather than removing it.
- Include a keyboard-navigation test session as part of the definition of done: tab through the entire page without a mouse, verify every interactive element has a visible focus indicator.
- Add `outline: none` only when a custom `focus-visible:` replacement is defined in the same rule.

**Warning signs:**
- Any `outline-none` or `ring-0` added to a button, link, or input without a corresponding `focus-visible:` class.
- A component's CSS includes `&:focus { outline: none }` without a `&:focus-visible` replacement.
- Tabbing through the page produces elements that receive focus but have no visible indicator.

**Phase to address:**
Component Polish Phase — focus state verification is part of the definition of done for every interactive component.

---

### Pitfall 12: Glassmorphism Applied to Form Inputs Making Text Unreadable

**What goes wrong:**
Glassmorphism (frosted-glass effect using `backdrop-filter: blur()` + semi-transparent background) is a popular premium design choice. Applied to cards and hero overlays it works well. Applied to form inputs, it makes the typed text hard to read — the blurred background makes the input field contrast unpredictable depending on what is behind it, and text legibility degrades as the user types. This is a WCAG failure on dynamic content.

**Why it happens:**
The glassmorphism treatment is applied consistently across all "card-like" elements including form containers and input fields, without distinguishing between decorative surfaces and interactive data-entry surfaces.

**How to avoid:**
- Reserve glassmorphism for decorative surfaces: hero overlays, background cards, decorative panels.
- Keep form inputs and interactive data-entry elements on solid backgrounds with a defined, tested contrast ratio.
- The `.glass-card` semantic class in this project's `globals.css` should not be applied to form fieldsets or input containers.

**Warning signs:**
- A `backdrop-blur-*` or `bg-white/10` class applied to a `<form>`, `<fieldset>`, or `<input>` wrapper.
- Form inputs appear to float over a blurred image or gradient background.
- Typed text is readable in the placeholder state but difficult to see once actual content is entered.

**Phase to address:**
Tool Page Polish Phase — form UI polish must use solid backgrounds for inputs, not glass effects.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `style={{ color: '#...' }}` inline | Fast design iteration | Bypasses dark mode, token system, highest specificity — cannot be overridden by Tailwind | Never — use CSS custom property instead |
| `!important` in globals.css | Forces a style to apply | Specificity arms race; future changes become unpredictable | Never in production code |
| `className` overrides on shadcn color properties | Quick one-off visual fix | Breaks variant logic for disabled/focus states silently | Never for color/background — only for layout spacing |
| Duplicating a shadcn component to fully customise it | Full control without variant system | Two components drift; bug fixes must be applied twice | Only if the variant system genuinely cannot express the need |
| `opacity-*` on text for "muted" effect | Single Tailwind class, looks right | Destroys contrast ratio; fails WCAG AA | Never — use a muted-foreground token instead |
| Hard-coding `dark:` class alternatives instead of CSS variables | Feels explicit and clear | N × 2 classes for every dark-mode style; high maintenance surface | Only for truly one-off utility classes not part of the design system |
| Importing Google Fonts via `<link>` or `@import` | Familiar and fast | FOUT, CLS regression, Core Web Vitals damage | Never — always use `next/font/google` |
| Adding `outline-none` without a `focus-visible:` replacement | Cleaner visual in mouse testing | WCAG 2.4.7 failure; keyboard users cannot navigate | Never — style the ring, do not remove it |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| shadcn/ui + Tailwind | Overriding component colors via `className` at the call site | Edit the `cva()` variant definition inside the component file |
| shadcn/ui + dark mode | Defining dark-mode colors only in `:root` block | Always define both `:root` and `.dark` (or `:root.dark`) blocks simultaneously |
| Tailwind + CSS custom properties | Using `var(--token)` directly in Tailwind config | shadcn uses `hsl(var(--token))` — follow the same pattern for all custom tokens |
| tailwind-merge + shadcn | Passing conflicting Tailwind classes and expecting intuitive resolution | Understand tailwind-merge conflict resolution: last-class-wins per property group; verify in all variant states |
| next/font + globals.css | Referencing the font family by name directly in CSS | Always use the CSS variable injected by `next/font` into `<html>`; never hard-code the font name string |
| Biome + globals.css | CSS linting active in Biome 2.4.4; new CSS properties can trigger lint errors | Use standard CSS property names; run `bun run lint` after every `globals.css` change |
| Vercel + CSS animations | `@keyframes` in globals.css are loaded on every page statically | Keep keyframe definitions minimal; use Tailwind `animate-*` built-ins where possible |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `backdrop-filter: blur()` on every card | Frame drops on mobile, iOS Safari jank | Limit to hero section; disable on mobile with responsive class or `@media (prefers-reduced-motion)` | Any mobile device with integrated GPU, especially iOS |
| Large `@keyframes` in globals.css | CSS bundle grows; animations load on pages that do not use them | Minimal keyframes; component-scoped for heavy animations | When globals.css has 5+ keyframe definitions |
| Multiple above-fold images with `priority` | LCP score degrades; images compete for fetch priority | Use `priority` only on the single above-fold LCP element | When hero has more than one `priority` image |
| Multiple unnecessary font weights loaded | Increased CSS payload, slower font render | Load only weights used (typically 400, 500, 700) | Any slow network connection |
| Framer Motion imported at page level | +30-60kB in first-load JS | Use `next/dynamic` with `ssr: false`; or replace with CSS `@keyframes` | Any page using Framer Motion without dynamic import |
| New shadcn components added without a bundle audit | JS bundle grows incrementally | Verify radix-ui primitives are not pulled in for unused components | When 5+ new shadcn components are added in one phase |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Replacing working form error states with prettier layouts that omit error messages | Users cannot tell what went wrong | Preserve `role="alert"` and `aria-live` error regions — polish the container, not the content structure |
| Removing visible focus rings for a "cleaner look" | Keyboard users cannot navigate the site | Use `focus-visible:ring-2`; style the ring to match the design, never remove it |
| Hero CTA button with insufficient contrast against a gradient background | CTA is missed by users scanning quickly | Test CTA button contrast against every point of the gradient, not just the start and end colors |
| Tool page form layout changes that shift the submit button location | Users familiar with the current layout are disoriented | Keep form field order and submit button position stable; polish spacing and style, not structure |
| Card hover animations that also change text color | Users with motion sensitivity get unexpected color changes | Separate motion from color changes; respect `prefers-reduced-motion` |
| Glassmorphism on form inputs | Typed text becomes hard to read | Reserve glass effects for decorative surfaces; use solid backgrounds for data-entry elements |
| Using `text-muted-foreground` on body copy | Low contrast for the primary reading experience | `text-muted-foreground` is for captions and helper text only — verify 4.5:1 contrast on all body copy |

---

## "Looks Done But Isn't" Checklist

- [ ] **Dark mode:** Every new CSS variable has a value in both `:root` and `.dark` blocks — verify by toggling the OS theme preference in a deployed preview.
- [ ] **WCAG AA:** Every new text/background color pair checked with a contrast ratio tool — 4.5:1 minimum for body text, 3:1 for large text and UI components.
- [ ] **Keyboard navigation:** Every interactive element (button, link, input, dialog trigger) is reachable and has a visible focus indicator via Tab key — verify without a mouse.
- [ ] **Mobile layout:** Every component renders correctly at 375px viewport width — verified in Chrome DevTools device mode.
- [ ] **Focus rings:** No `outline-none` or `ring-0` without a `focus-visible:` replacement on the same element.
- [ ] **Test suite:** `bun test tests/` passes with 360 or more tests after every component change — not just at the end of a phase.
- [ ] **Build size:** `bun run build` CSS output in `.next/static/css/` is not significantly larger than the pre-phase baseline.
- [ ] **Shadcn variant states:** Every modified shadcn component tested in all variant states: default, hover, focus, disabled — not just the enabled default.
- [ ] **Reduced motion:** Any new CSS animation or transition respects `@media (prefers-reduced-motion: reduce)` — verify in OS accessibility settings.
- [ ] **Biome clean:** `bun run lint` returns zero violations after every phase — no accumulated suppressions.
- [ ] **Font loading:** Any new font uses `next/font/google` — no `<link>` or `@import` for fonts anywhere in the codebase.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Dark mode color regression | MEDIUM | Revert `globals.css` CSS variable changes; re-implement with both `:root` and `.dark` defined simultaneously |
| WCAG AA contrast failure | LOW-MEDIUM | Run contrast checker on all changed colors; adjust lightness of the failing token until 4.5:1 is met; re-test all usages |
| CSS specificity conflict | MEDIUM | Use browser DevTools Computed Styles panel to trace which rule wins; resolve by adjusting `@layer` placement |
| Shadcn variant logic broken by className override | LOW | Remove the offending className; move the style into the component's `cva()` definition; test all variant states |
| Test suite regression from prop changes | LOW-MEDIUM | Run `bun test tests/` with `--reporter verbose`; fix each failing test before continuing |
| Build size spike | MEDIUM | Check `.next/static/css/` file sizes; remove unused keyframes and font weights; replace library imports with CSS |
| Font CLS regression | LOW | Replace `<link>` or `@import` with `next/font/google`; redeploy; verify CLS in Vercel Speed Insights |
| Tailwind accidental major version upgrade | HIGH | `git revert` the `package.json` change; `bun install`; verify `bun run build` passes; pin the Tailwind version explicitly |
| Focus ring removed | LOW | Add `focus-visible:ring-2 focus-visible:ring-offset-2` to the element; choose a ring color from the design system |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Dark mode CSS variable regression | Phase 1: Design Tokens — define complete `:root` + `.dark` token set upfront | Toggle dark mode after every variable change; visual check of all page sections |
| WCAG AA contrast failure from new palette | Phase 1: Design Tokens — measure contrast for every color pair before adoption | Contrast ratio check for all text/background pairs |
| Shadcn variant logic broken | Component Polish Phase — edit `cva()` not `className` | Render all variant states (default, hover, focus, disabled) after each component change |
| CSS specificity war | Phase 1: Design Tokens — establish `@layer` boundaries; enforce in every component phase | `bun run lint` clean; visual check that expected styles apply |
| Build size regression | Every phase — run `bun run build` after significant CSS changes | `.next/static/css/` file sizes compared to pre-phase baseline |
| Font CLS / LCP regression | Phase 1: Design Tokens — font choice via `next/font/google` | Vercel Speed Insights CLS score after first deploy |
| Tailwind accidental major version bump | Pre-work dependency audit before Phase 1 | `package.json` pinned version verified; `bun run build` passes |
| Inline style leakage | Component Polish Phase — review all JSX for inline color styles | `grep -r 'style={{'` in `src/` returns only layout-justified usages |
| Mobile breakpoint regressions | Every component phase — mobile check in definition of done | 375px viewport verification after each component |
| Test suite regression | Every component phase — run tests after each change | `bun test tests/` count equals or exceeds 360 |
| Focus ring removal | Component Polish Phase — keyboard-only navigation test | Tab through entire page without mouse; every focused element visible |
| Glassmorphism on form inputs | Tool Page Polish Phase — form UI uses solid backgrounds | Manual test: type text into every input field; verify readability |
| Reduced-motion violations | Any phase adding animations | `@media (prefers-reduced-motion)` alongside every `@keyframes` definition | OS accessibility toggle removes animations cleanly |

---

## Sources

- shadcn/ui documentation: component variant system (`cva()`), CSS variable architecture — HIGH confidence (official docs)
- Next.js documentation: `next/font` zero-CLS font loading, `next/dynamic` for code splitting — HIGH confidence (official docs)
- Tailwind CSS documentation: `@layer` cascade order, `tailwind-merge` conflict resolution behaviour — HIGH confidence (official docs)
- WCAG 2.1 Success Criterion 1.4.3 (Contrast Minimum), 1.4.11 (Non-text Contrast), 2.4.7 (Focus Visible) — HIGH confidence (W3C specification)
- Project `.planning/PROJECT.md`: confirmed existing WCAG AA compliance, 360 passing tests, 139 static pages, Biome 2.4.4 toolchain — HIGH confidence (project source of truth)
- Tailwind v4 migration breaking changes (CSS-first config, `@apply` behaviour) — MEDIUM confidence (based on Tailwind v4 release notes; verify current state before Phase 1)
- CSS `backdrop-filter` performance on iOS Safari — MEDIUM confidence (widely reported community issue; verify with current browser support data before relying on it)
- `prefers-reduced-motion` browser support — HIGH confidence (universal browser support as of 2024)

---
*Pitfalls research for: UI/UX redesign of production Next.js 15 + Tailwind + shadcn/ui site*
*Researched: 2026-02-25*
