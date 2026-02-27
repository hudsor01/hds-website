---
phase: 58-core-component-polish
plan: 01
subsystem: testing
tags: [tdd, components, button, input, textarea, card, navbar, footer, red-phase]

# Dependency graph
requires:
  - phase: 57-homepage-hero-redesign
    provides: TDD RED scaffold pattern established in Phase 57 Plans 01-03
  - phase: 56-design-token-system
    provides: bg-surface-raised, bg-surface-sunken, border-border-subtle, shadow-sm tokens used in assertions
provides:
  - "Failing test scaffold for COMP-01 (Button polish assertions)"
  - "Failing test scaffold for COMP-02 (Input/Textarea error state assertions)"
  - "Failing test scaffold for COMP-03 (Card surface elevation assertions)"
  - "Failing test scaffold for COMP-04 (Navbar hover/active and Footer inline style assertions)"
affects: [58-02, 58-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD RED phase: extend existing test files with describe blocks before touching component code"
    - "Guard assertions: some assertions validate correct existing behavior (ghost variant, textarea parity, glass unaffected) and pass in RED phase — this is expected"
    - "Footer inline style test: use class assertion (bg-nav-dark) instead of style attribute check because JSDOM does not render React style props as HTML attributes"

key-files:
  created: []
  modified:
    - tests/unit/components.test.tsx
    - tests/unit/navigation.test.tsx

key-decisions:
  - "Footer test rewritten to check for bg-nav-dark class (positive assertion) instead of absence of inline style (JSDOM does not render React style props as DOM attributes — getAttribute('style') returns null)"
  - "3 guard assertions in new COMP blocks pass in RED phase: ghost variant negative check, textarea parity check, glass unaffected check — these validate correct existing behavior and remain green"
  - "Test count per plan: components.test.tsx 27 pass/10 fail; navigation.test.tsx 21 pass/4 fail (combined: 48/14)"

patterns-established:
  - "Pattern: Footer inline style testing — check className for token class rather than style attribute"
  - "Pattern: Guard assertions in RED phase — negative assertions on correct existing behavior pass in RED; this is intentional and expected"

requirements-completed: [COMP-01, COMP-02, COMP-03, COMP-04]

# Metrics
duration: 11min
completed: 2026-02-26
---

# Phase 58 Plan 01: Core Component Polish — TDD Red Phase Summary

**Failing test scaffold for COMP-01 through COMP-04 with 14 red assertions and 48 green guard assertions across components.test.tsx and navigation.test.tsx**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-26T23:21:06Z
- **Completed:** 2026-02-26T23:32:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added 13 new test assertions to `tests/unit/components.test.tsx` covering COMP-01 (button shadow/active states), COMP-02 (input error state and surface token), COMP-03 (card surface elevation)
- Added 4 new test assertions to `tests/unit/navigation.test.tsx` covering COMP-04 (navbar hover bug, footer inline style)
- Confirmed RED state: 10 component tests fail, 4 navigation tests fail — all targeting specific CSS class changes needed in Plans 02 and 03
- All 45 original tests continue to pass with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: COMP-01/02/03 assertions in components.test.tsx** - `4bf85fa` (test)
2. **Task 2: COMP-04 assertions in navigation.test.tsx** - `d062175` (test)

## Files Created/Modified

- `tests/unit/components.test.tsx` — Added `Input` and `Textarea` imports; added `Button Polish — COMP-01`, `Input Polish — COMP-02`, `Card Surface — COMP-03` describe blocks (13 new tests)
- `tests/unit/navigation.test.tsx` — Added `Navbar Polish — COMP-04` describe block with 4 tests covering hover:bg-accent bug and footer inline style removal

## Decisions Made

- Footer test approach: JSDOM does not render React `style={{ backgroundColor: '...' }}` as a DOM attribute — `getAttribute('style')` returns `null`. Rewrote assertion to check for `bg-nav-dark` class (positive test of intended end state) which correctly fails now and will pass when Footer removes the inline style and adds the token class.
- Guard assertions pass in RED phase: The ghost variant test (checks ghost has no solid bg), textarea parity test (checks textarea already has `aria-invalid:border-destructive`), and glass unaffected test (checks glass card doesn't have `bg-surface-raised`) all pass because they validate correct EXISTING behavior. This is expected and correct — these are boundary guards, not polish assertions.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Footer test assertion corrected for JSDOM environment**
- **Found during:** Task 2 (COMP-04 navbar assertions)
- **Issue:** Plan specified `expect(footer?.getAttribute('style') ?? '').not.toContain('backgroundColor')` — but JSDOM does not render React `style` props as HTML attributes. `getAttribute('style')` returns `null`, making the assertion trivially true (not a meaningful test).
- **Fix:** Changed from "style attribute does not contain backgroundColor" to "footer className contains `bg-nav-dark`" — a positive assertion of the intended end state that correctly fails now and will pass after Plan 02/03 removes the inline style.
- **Files modified:** `tests/unit/navigation.test.tsx`
- **Verification:** `bun test tests/unit/navigation.test.tsx` shows footer test now fails (RED state confirmed)
- **Committed in:** `d062175` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in test assertion logic)
**Impact on plan:** Auto-fix ensures the footer test is a meaningful RED state assertion rather than a trivially-passing no-op.

## Issues Encountered

- Biome pre-commit hook flagged import order and formatting in both test files — applied `bunx biome check --write` before committing to resolve formatting requirements. Tests continued to pass/fail correctly after formatting.

## Next Phase Readiness

- RED state confirmed for all COMP-01 through COMP-04 requirements
- Plans 02 and 03 can now implement component polish — making tests green is the success criteria
- `tests/unit/components.test.tsx` and `tests/unit/navigation.test.tsx` are the verification files for Plans 02/03

---
*Phase: 58-core-component-polish*
*Completed: 2026-02-26*
