---
phase: 58-core-component-polish
plan: 02
subsystem: ui
tags: [tailwind, cva, button, input, label, aria, accessibility]

requires:
  - phase: 58-01
    provides: TDD RED assertions for COMP-01 through COMP-04 (failing tests scaffolded)

provides:
  - Button CVA variants with shadow-sm and active state polish on all solid variants
  - Input with aria-invalid error state parity matching textarea, bg-surface-sunken depth token
  - Label with duplicate 'use client' directive removed

affects: [plan-58-03, plan-58-04, forms, contact-form]

tech-stack:
  added: []
  patterns:
    - "Input error state via aria-invalid:* classes matching textarea pattern"
    - "bg-surface-sunken token for form inputs to distinguish from surface-level bg"
    - "CVA variant strings include shadow-sm + active:* on all solid button variants"

key-files:
  created: []
  modified:
    - src/components/ui/button.tsx
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx

key-decisions:
  - "bg-surface-sunken used directly in Tailwind v4 (token auto-generated from --color-surface-sunken in @theme {})"
  - "COMP-01 button polish (df5e53c) was applied prior to this plan session — confirmed passing before Task 2"
  - "aria-invalid error classes applied to inputVariants base string (not a variant) for universal coverage across default and currency variants"

patterns-established:
  - "Form input error state: aria-invalid:border-destructive, aria-invalid:ring-destructive/20, dark:aria-invalid:ring-destructive/40"
  - "Sunken surface for inputs: bg-surface-sunken distinguishes input bg from card/page bg"

requirements-completed: [COMP-01, COMP-02]

duration: 10min
completed: 2026-02-27
---

# Phase 58 Plan 02: Core Component Polish (COMP-01/02) Summary

**Button CVA variants polished with shadow-sm and active states; input.tsx gains aria-invalid error parity and bg-surface-sunken depth token; label.tsx duplicate directive removed**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-02-27T07:00:00Z
- **Completed:** 2026-02-27T07:07:37Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- COMP-01 button variants: `shadow-sm` and `active:*` classes on default, accent, destructive, success, outline, secondary, muted variants — all 5 Button Polish tests green
- COMP-02 input: `bg-surface-sunken` replaces `bg-background` for visual depth; `aria-invalid:border-destructive`, `aria-invalid:ring-destructive/20`, `dark:aria-invalid:ring-destructive/40` added for error state parity with textarea
- Label cleanup: removed duplicate `'use client'` directive (copy-paste artifact)
- Test count: 31 pass -> 34 pass; 3 remaining failures are COMP-03 (card.tsx, Plan 03 scope)

## Task Commits

Each task was committed atomically:

1. **Task 1: Polish button.tsx CVA variants (COMP-01)** - `df5e53c` (feat)
2. **Task 2: Polish input.tsx error state + clean label.tsx (COMP-02)** - `541104f` (feat)

## Files Created/Modified

- `src/components/ui/button.tsx` - Added shadow-sm, active:* states to all solid button variants (committed df5e53c)
- `src/components/ui/input.tsx` - Replaced bg-background with bg-surface-sunken; added aria-invalid error classes
- `src/components/ui/label.tsx` - Removed duplicate 'use client' directive

## Decisions Made

- `bg-surface-sunken` used directly as Tailwind v4 utility class — the `--color-surface-sunken` token in `@theme {}` of globals.css auto-generates the utility. No bracket syntax fallback needed.
- `aria-invalid` classes placed in the CVA base string (not a variant) so all input variants (default and currency) inherit error state behavior automatically.
- COMP-01 button task was already committed (`df5e53c`) prior to this plan session. Verified all 5 Button Polish assertions were green before proceeding to Task 2.

## Deviations from Plan

None — plan executed exactly as written. The button polish task was already committed before this session began; Task 1 was verified as complete (5/5 Button Polish tests passing) and Task 2 was executed fresh.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- COMP-01 and COMP-02 complete; 34/37 component tests pass
- Remaining 3 failures are COMP-03 (card.tsx surface tokens) — Plan 03's scope
- Plan 03 (card.tsx + navbar) can proceed immediately

---
*Phase: 58-core-component-polish*
*Completed: 2026-02-27*
