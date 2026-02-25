# Typography Enhancement Design

**Date:** 2026-02-25
**Status:** Approved
**Scope:** globals.css semantic class expansion + site-wide token application

---

## Problem

After Phase 56, the token foundation exists (`--font-size-*`, `--font-weight-*`, `--line-height-*`, `--tracking-*`) but many pages and components still use raw Tailwind heading combos (`text-3xl font-bold leading-tight`) instead of semantic classes. This creates inconsistency, makes future heading changes require multi-file edits, and violates the project principle of "semantic CSS classes for repeated patterns in globals.css."

Additionally, the heading class system is incomplete — there are only two classes (`.text-page-title`, `.text-section-title`) with no intermediate hierarchy (h1–h4 content headings, eyebrow labels, hero subtitles, lead paragraphs, captions).

---

## Design

### Part 1 — New semantic classes (globals.css)

One new `@theme {}` token:

```css
--font-weight-black: 900;
```

Update existing class to use the new token:

```css
/* .text-page-title: add --font-weight-black */
.text-page-title {
  font-weight: var(--font-weight-black); /* was --font-weight-heading (700) */
}
```

Eight new `@layer components` classes:

| Class | Role | Size token | Weight | Leading | Tracking |
|---|---|---|---|---|---|
| `.text-eyebrow` | Uppercase label above headings | `--font-size-xs` | semibold | normal | widest + uppercase |
| `.text-hero-subtitle` | Large intro para under hero h1 | `--font-size-xl` | normal | relaxed | normal |
| `.text-h1` | Primary content heading | `--font-size-4xl` | bold | snug | heading |
| `.text-h2` | Secondary content heading | `--font-size-3xl` | semibold | snug | heading |
| `.text-h3` | Tertiary heading | `--font-size-2xl` | semibold | normal | tight |
| `.text-h4` | Quaternary heading | `--font-size-xl` | medium | normal | normal |
| `.text-lead` | Intro body text | `--font-size-lg` | normal | relaxed | normal |
| `.text-caption` | Labels, metadata, footnotes | `--font-size-xs` | normal | normal | normal |

**Color is always separate.** These classes only set `font-size`, `font-weight`, `line-height`, and `letter-spacing`. Color utilities (`text-foreground`, `text-muted-foreground`, `text-accent`) are always applied alongside, never embedded.

### Part 2 — Site-wide token application

**Wave 1:** globals.css only (prerequisite for wave 2).

**Wave 2:** Four parallel agents, each covering a distinct section of the codebase.

#### Pattern mapping (raw Tailwind → semantic class)

| Raw pattern | Replaces with |
|---|---|
| `text-responsive-3xl font-black` | `text-page-title` |
| `text-3xl font-bold` / `text-4xl font-bold` | `text-h1` |
| `text-2xl font-bold` / `text-3xl font-semibold` | `text-h2` |
| `text-2xl font-semibold` | `text-h3` |
| `text-xl font-semibold` / `text-xl font-medium` | `text-h4` |
| `text-sm uppercase tracking-wider font-semibold` | `text-eyebrow` |
| `text-xl leading-relaxed` (body context) | `text-hero-subtitle` or `text-lead` |
| `text-sm text-muted-foreground` (label context) | `text-caption text-muted-foreground` |

**Rule:** Only replace when the pattern is used for a heading or typographic role. Inline utility combos in non-heading contexts (e.g., button labels, nav items) are left as-is.

#### Wave 2 agent file assignments

| Agent | Files | Notes |
|---|---|---|
| A — Shared components | `src/components/**/*.tsx` | Navbar, Footer, cards, buttons — changes here propagate site-wide |
| B — Homepage + tools | `src/app/page.tsx`, `src/app/(tools)/**` | Highest-traffic pages |
| C — Service/about/contact | `src/app/(services)/**`, `src/app/about/**`, `src/app/contact/**` | Core conversion pages |
| D — Location pages | `src/app/(locations)/**` | 75+ pages — template-based, likely 3-4 unique patterns |

---

## Constraints

- No new font loading — Geist Sans remains the sole typeface
- No visual redesign — this is token application only, not new design direction
- Color stays orthogonal to heading classes
- Biome must pass after each wave (`bun run lint`)
- TypeScript must pass (`bun run typecheck`)
- All 360 existing tests must remain green

---

## Success criteria

- `globals.css` has all 8 new semantic classes + `--font-weight-black` token
- No file outside `globals.css` uses the raw heading combos listed in the pattern map
- `bun run build` succeeds
- `bun test tests/` — 360 tests pass
- `bun run lint` — zero violations
