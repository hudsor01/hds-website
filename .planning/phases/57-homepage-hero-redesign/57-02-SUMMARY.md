---
phase: 57-homepage-hero-redesign
plan: 02
subsystem: ui
tags: [hero, homepage, tailwind, bento-grid, design-tokens, dark-background]

# Dependency graph
requires:
  - phase: 57-01
    provides: TDD RED scaffold — 10 structural assertions for HERO-01 through HERO-04
  - phase: 56-design-system-foundation
    provides: Design tokens (text-page-title, bg-background-dark, text-lead, py-section, container-narrow, etc.)
provides:
  - Redesigned hero section in page.tsx — centered single-column typographic layout on dark background
  - Transform-free BentoGrid/BentoCard component — static layout only, no hover animations
affects:
  - 57-03 (Wave 3 section rhythm implementation must make remaining HERO-04 tests green)
  - 57-04 (Wave 4 verification will run full suite against this implementation)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hero section: centered single-column layout with bg-background-dark token and container-narrow"
    - "CTA differentiation: variant=accent (primary) vs variant=ghost (secondary), both size=xl"
    - "BentoCard: static layout — no translate-y, scale, opacity-0, or group-hover: animation classes"

key-files:
  created: []
  modified:
    - src/app/page.tsx
    - src/components/ui/bento-grid.tsx

key-decisions:
  - "Deferred BentoCard/BentoGrid import to Plan 03 — unused imports fail typecheck (TypeScript noUnusedLocals); YAGNI principle applied"
  - "Removed Clock and Users icon imports — only used in trust indicators section that was removed"

patterns-established:
  - "Hero section pattern: section.relative.flex.items-center.justify-center with bg-background-dark + grid-pattern-minimal overlay"
  - "CTA group pattern: flex-col sm:flex-row gap-comfortable justify-center with accent + ghost Button pair"

requirements-completed: [HERO-01, HERO-02, HERO-03]

# Metrics
duration: 15min
completed: 2026-02-26
---

# Phase 57 Plan 02: Homepage Hero Redesign — Implementation Summary

**Centered single-column hero on dark solid background (bg-background-dark) with plain h1, text-lead paragraph, and accent/ghost CTA pair; BentoGrid stripped of all hover transform animations**

## Performance

- **Duration:** 15 min
- **Started:** 2026-02-26T08:13:42Z
- **Completed:** 2026-02-26T08:28:55Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Replaced two-column hero layout (with terminal card mockup and blur orbs) with centered single-column typographic layout
- Hero section now uses `bg-background-dark` solid dark token — no CSS gradients, no animated elements
- h1 is plain `text-foreground` with no accent spans — `text-page-title` class applied directly
- Both CTAs properly differentiated: `variant="accent" size="xl"` (primary) and `variant="ghost" size="xl"` (secondary)
- Stripped all transform animations from BentoGrid/BentoCard — component is now static layout only
- 7 of 10 HERO test assertions now pass (up from 3 in Plan 01); HERO-01, HERO-02, HERO-03 all green

## Task Commits

Each task was committed atomically:

1. **Task 1: Strip transform animations from BentoGrid component** - `917294b` (refactor)
2. **Task 2: Rewrite hero section in page.tsx** - `1223a13` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/components/ui/bento-grid.tsx` - Removed all `translate-y`, `scale-75`, `opacity-0`, `group-hover:`, `transition-all`, `will-change-transform` classes; merged duplicate CTA divs into single always-visible div; static layout only
- `src/app/page.tsx` - Hero section rewritten to centered single-column layout; Clock/Users icon imports removed (unused after trust indicators removal); BentoCard/BentoGrid import deferred to Plan 03

## Decisions Made

- Deferred `BentoCard, BentoGrid` import to Plan 03: the plan suggested importing them now, but TypeScript strict mode (`noUnusedLocals`) flags unused imports as errors, blocking typecheck. YAGNI principle: import when actually used.
- Removed `Clock` and `Users` icon imports: they were only used in the trust indicators section that was removed as part of the hero redesign. `Rocket` kept — used in Final CTA section.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Biome formatter required different cn() formatting**
- **Found during:** Task 1 (commit step)
- **Issue:** Biome toggled between single-line and multi-line `cn()` call format; required `cn('...')` on one line inside multi-line div tags
- **Fix:** Used `className={cn('pointer-events-auto flex w-full flex-row items-center')}` on single line inside `<div\n>\n` structure
- **Files modified:** `src/components/ui/bento-grid.tsx`
- **Verification:** `bunx biome check` reported "No fixes applied"
- **Committed in:** `917294b` (Task 1 commit)

**2. [Rule 1 - Bug] Removed unused BentoCard/BentoGrid import**
- **Found during:** Task 2 (typecheck step)
- **Issue:** Plan instructed importing `BentoCard, BentoGrid` for Plan 03, but TypeScript strict mode reports `error TS6192: All imports in import declaration are unused`
- **Fix:** Removed the import; Plan 03 will add it when BentoGrid is actually used in the Solutions section
- **Files modified:** `src/app/page.tsx`
- **Verification:** `bun run typecheck` reports no errors
- **Committed in:** `1223a13` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for correctness. BentoGrid import deferred is a scope refinement — Plan 03 adds it when needed. No functionality lost.

## Issues Encountered

- Biome formatter formatting expectation for `cn()` calls required two commit attempts on Task 1 — resolved by matching Biome's preferred single-line `cn('...')` inside multi-line div tags.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- HERO-01, HERO-02, HERO-03 test assertions all pass (7/10 green)
- 3 remaining HERO-04 tests (`bg-muted`, `scale-105`, `animationDelay`) target non-hero sections — Plan 03 handles those
- BentoGrid is animation-free and ready for Plan 03's Solutions section implementation
- Build passes, TypeScript clean, Biome clean

## Self-Check: PASSED

- `src/components/ui/bento-grid.tsx` — FOUND
- `src/app/page.tsx` — FOUND
- `.planning/phases/57-homepage-hero-redesign/57-02-SUMMARY.md` — FOUND
- Commit `917294b` — FOUND
- Commit `1223a13` — FOUND

---
*Phase: 57-homepage-hero-redesign*
*Completed: 2026-02-26*
