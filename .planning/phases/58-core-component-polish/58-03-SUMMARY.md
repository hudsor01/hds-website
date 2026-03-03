---
phase: 58-core-component-polish
plan: 03
subsystem: ui
tags: [components, card, navbar, footer, design-tokens, tailwind, tdd]

# Dependency graph
requires:
  - phase: 58-core-component-polish
    provides: TDD RED assertions for COMP-03/04 written in Plan 01; 58-02 confirmed pattern for token application
  - phase: 56-design-token-system
    provides: bg-surface-raised, border-border-subtle, bg-background-dark, shadow-sm tokens
provides:
  - "Card default variant with bg-surface-raised, border-border-subtle, shadow-sm (COMP-03 green)"
  - "Navbar inactive links with neutral hover:bg-muted hover:text-foreground — no amber fill (COMP-04 green)"
  - "Footer with bg-background-dark token class — no inline style hack (COMP-04 green)"
  - "Footer duplicate 'use client' directive removed"
affects: [58-04, any page using Card default, Navbar, or Footer]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Token mismatch resolution: when test was written with wrong token name (bg-nav-dark vs bg-background-dark), update the test to match the token that actually exists in @theme {}"
    - "CVA default variant token upgrade: target only the default variant string, leave all other variants untouched"

key-files:
  created: []
  modified:
    - src/components/ui/card.tsx
    - src/components/layout/Navbar.tsx
    - src/components/layout/Footer.tsx
    - tests/unit/navigation.test.tsx

key-decisions:
  - "Test assertion corrected: bg-nav-dark → bg-background-dark (bg-nav-dark never existed as a token; bg-background-dark is the correct Phase 56 token in @theme {})"
  - "Footer overlay div removed: the absolute inset-0 bg-(--color-nav-dark) div served as backup to the inline style; both removed together since bg-background-dark on the footer element handles the background"

patterns-established:
  - "Pattern: Token mismatch between test and implementation — always check @theme {} in globals.css for the canonical token name before writing tests or implementation"

requirements-completed: [COMP-03, COMP-04]

# Metrics
duration: 7min
completed: 2026-02-27
---

# Phase 58 Plan 03: Core Component Polish — Card Surface + Navbar Hover + Footer Token Summary

**Card default variant surface elevation (bg-surface-raised, shadow-sm, border-border-subtle) and Navbar neutral hover with Footer token background — 62 tests green, 0 fail**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-27T07:19:23Z
- **Completed:** 2026-02-27T07:26:28Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Card `default` variant upgraded: `border-border-subtle bg-surface-raised shadow-sm` — gives default cards visual elevation above page background
- Navbar all `hover:bg-accent` on nav links replaced with `hover:bg-muted` — desktop links, mobile links, mobile menu button, and Talk to Sales link all corrected
- Footer inline `style={{ backgroundColor: 'hsl(222 47% 11%)' }}` removed; `bg-background-dark` token class applied to `<footer>` element
- Footer duplicate `'use client'` directive removed (was duplicated on lines 1 and 3)
- Redundant overlay `<div className="absolute inset-0 bg-(--color-nav-dark)" />` removed (was backup to inline style — both gone now)
- All 62 component + navigation tests pass; full 387-test suite passes with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Polish card.tsx default variant with surface-raised token** - `f932a66` (feat)
2. **Task 2: Fix Navbar hover bug + remove Footer inline style** - `b35b083` (fix)

## Files Created/Modified

- `src/components/ui/card.tsx` — Updated default variant: `border-border-subtle bg-surface-raised shadow-sm`
- `src/components/layout/Navbar.tsx` — Replaced hover:bg-accent → hover:bg-muted, hover:text-accent-foreground → hover:text-foreground on all nav links
- `src/components/layout/Footer.tsx` — Removed duplicate 'use client', removed inline style, removed overlay div, added bg-background-dark class
- `tests/unit/navigation.test.tsx` — Corrected test assertion: bg-nav-dark → bg-background-dark (token name fix)

## Decisions Made

- **Token name correction:** The RED-phase test (Plan 01) was written with `bg-nav-dark` as the expected token class. However, `bg-nav-dark` does not exist in `@theme {}` — `bg-background-dark` is the correct Phase 56 token for the footer dark background. Updated the test to match the actual token so the assertion meaningfully validates the intended behavior (token class present, no inline style).
- **Overlay div removal:** The `<div className="absolute inset-0 bg-(--color-nav-dark)" />` served as a fallback for the inline style. With `bg-background-dark` now on the footer element itself, both the inline style and the redundant overlay are removed together. This keeps the DOM clean.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test assertion used non-existent token name**
- **Found during:** Task 2 (Navbar hover + Footer inline style removal)
- **Issue:** Test at line 315 of navigation.test.tsx expected `bg-nav-dark` but that class was never defined in `@theme {}` in globals.css. The plan 03 instructions specify `bg-background-dark` which is the actual Phase 56 token. Using the wrong name would leave the test permanently failing despite correct implementation.
- **Fix:** Updated test description and assertion: `bg-nav-dark` → `bg-background-dark`
- **Files modified:** `tests/unit/navigation.test.tsx`
- **Verification:** `bun test tests/unit/navigation.test.tsx` — 25 pass, 0 fail
- **Committed in:** `b35b083` (Task 2 commit, as part of the navigation test fix)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in test assertion using non-existent token name)
**Impact on plan:** Essential correction — without it the test would never pass regardless of correct implementation. No scope creep.

## Issues Encountered

None — all changes were straightforward token substitutions. Pre-commit hooks (biome + typecheck) passed cleanly on both commits.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- COMP-03 and COMP-04 are fully green: 4 card surface tests + 4 navbar/footer tests all pass
- Plan 58-04 can proceed (covers remaining COMP requirements or verification)
- All glass variants remain unaffected: glass-card, glass-card-light, glassSection all still render correctly
- TypeScript strict mode and Biome both clean

---
*Phase: 58-core-component-polish*
*Completed: 2026-02-27*
