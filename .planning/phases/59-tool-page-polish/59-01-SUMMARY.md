---
phase: 59-tool-page-polish
plan: 01
subsystem: testing
tags: [bun-test, testing-library, tdd, red-phase, tool-page-layout, calculator-input]

# Dependency graph
requires:
  - phase: 58-core-component-polish
    provides: glass-card-light class, Card glassLight variant, Input bg-surface-sunken, Button ghost variant — all used in ToolPageLayout assertions

provides:
  - RED-phase TDD scaffold for ToolPageLayout acceptance criteria (TOOL-01, TOOL-02, TOOL-03)
  - Failing test file that will turn green when Plan 02 creates ToolPageLayout

affects:
  - 59-02-PLAN (must satisfy these test assertions when implementing ToolPageLayout)
  - 59-03-PLAN through 59-06-PLAN (tool migration plans should run these tests after each migration)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "@ts-expect-error TS2307 on missing module import — suppresses type error for intentional RED-phase import of non-existent component"

key-files:
  created:
    - tests/unit/tool-page-layout.test.tsx
  modified: []

key-decisions:
  - "Used @ts-expect-error TS2307 on ToolPageLayout import to suppress TypeScript missing module error in RED phase, allowing pre-commit typecheck hook to pass while tests remain red"
  - "Removed ReactNode import — not needed in test file (plan template included it but no test case uses the type directly)"

patterns-established:
  - "RED-phase TDD with TypeScript strict mode: suppress missing-module errors with @ts-expect-error TS2307, not by disabling typecheck"

requirements-completed: [TOOL-01, TOOL-02, TOOL-03]

# Metrics
duration: 10min
completed: 2026-03-01
---

# Phase 59 Plan 01: ToolPageLayout TDD Red Scaffold Summary

**bun:test RED-phase acceptance criteria for ToolPageLayout (10 failing tests) covering header rendering, result card glass treatment, action bar conditional rendering, and CalculatorInput label-above pattern**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-01T07:10:35Z
- **Completed:** 2026-03-01T07:20:49Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created tests/unit/tool-page-layout.test.tsx with 10 test cases spanning TOOL-01, TOOL-02, and TOOL-03
- Confirmed RED state — import error `Cannot find module '@/components/layout/ToolPageLayout'`
- All 394 existing tests continue to pass (regression-free)
- Pre-commit lint + typecheck hooks pass cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Write RED-phase test file for ToolPageLayout and CalculatorInput** - `0d1cfdb` (test)

## Files Created/Modified
- `tests/unit/tool-page-layout.test.tsx` - RED-phase TDD scaffold: 10 failing tests defining acceptance criteria for ToolPageLayout (TOOL-01, TOOL-03) and CalculatorInput label-above pattern (TOOL-02)

## Decisions Made
- Used `@ts-expect-error TS2307` on the ToolPageLayout import rather than creating a stub — suppresses the missing module TypeScript error cleanly while keeping the test file in true RED state (runtime import error). This avoids any stub implementation leaking into Plan 02's GREEN phase work.
- Removed `ReactNode` type import from test file — the plan template included it in the pattern but no test case uses the type directly. Biome's `noUnusedImports` correctly flagged it; removed to keep the file clean.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed unused ReactNode import and added @ts-expect-error**
- **Found during:** Task 1 (commit attempt)
- **Issue:** Pre-commit hook blocked commit: Biome flagged `ReactNode` as unused import; TypeScript TS6133 + TS2307 caused typecheck to fail
- **Fix:** Removed `import type { ReactNode }` (unused); added `// @ts-expect-error TS2307` comment above ToolPageLayout import to suppress the intentional missing-module error
- **Files modified:** tests/unit/tool-page-layout.test.tsx
- **Verification:** `biome check` and `tsc --noEmit` both pass cleanly; `bun test` still shows RED import error
- **Committed in:** 0d1cfdb (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking pre-commit hook)
**Impact on plan:** Fix necessary for commit to succeed. No scope creep — import suppression is the correct TDD RED-phase pattern for TypeScript strict projects.

## Issues Encountered
- Pre-commit hook (lefthook) runs both Biome check and `tsc --noEmit` — both fire on the intentional RED-phase import of the non-existent module. Resolved by removing the unused import and using `@ts-expect-error` to document the intentional type error. This is the correct pattern for strict TypeScript projects in RED phase.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- RED scaffold in place — Plan 02 can now implement `src/components/layout/ToolPageLayout.tsx` and these tests will turn GREEN
- CalculatorInput TOOL-02 tests will pass immediately once ToolPageLayout import resolves (CalculatorInput already satisfies the label-above contract)
- ToolPageLayout must export `ToolPageLayout` named export with props: `title`, `description`, `columns`, `formSlot`, `resultSlot`, `hasResult`, `resultPlaceholder`, `actions`
- Result card container must have `glass-card-light` class; action bar must have `data-slot="action-bar"` attribute

---
*Phase: 59-tool-page-polish*
*Completed: 2026-03-01*
