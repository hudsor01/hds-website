---
phase: 59-tool-page-polish
plan: "06"
subsystem: tool-pages
tags: [gap-closure, tool-page-layout, actions, print, copy, paystub, performance-calculator]
dependency_graph:
  requires: [59-05]
  provides: [TOOL-03-complete]
  affects: [paystub-calculator, performance-calculator]
tech_stack:
  added: []
  patterns: [ToolPageLayout actions prop, slot-based layout, useCallback for stable click handlers]
key_files:
  created: []
  modified:
    - src/app/tools/paystub-calculator/PaystubCalculatorClient.tsx
    - src/app/tools/performance-calculator/PerformanceCalculatorClient.tsx
decisions:
  - "Paystub formSlot split: PaystubForm remains in formSlot; PaystubNavigation + period cards + annual totals moved to resultSlot so ResultCard can render them with the action bar"
  - "Print action calls window.print() directly — same effect as PaystubNavigation.onPrint (which calls generator.handlePrint which calls window.print()); action bar is a second access point"
  - "Performance copy serializes results object to key: value lines, filtered to remove empty entries, written to clipboard via navigator.clipboard.writeText"
metrics:
  duration: "17 minutes"
  completed_date: "2026-03-02"
  tasks_completed: 3
  files_modified: 2
---

# Phase 59 Plan 06: Gap Closure — Paystub Print + Performance Copy Summary

Close Gap 1 (paystub print action) and Gap 2 (performance copy action) identified in 59-VERIFICATION.md. Both tools had result state but no ToolPageLayout action bar wired.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add print action to Paystub Calculator — split formSlot | 0ff3174 | PaystubCalculatorClient.tsx |
| 2 | Add copy action to Performance Calculator | a6a1145 | PerformanceCalculatorClient.tsx |
| 3 | Final gap closure verification | — | (verify only) |

## What Was Built

**Task 1 — Paystub print action:**

The Paystub Calculator previously packed both the form and results into a single `formSlot` div. Since ToolPageLayout only renders `ResultCard` (with the action bar) when both `hasResult=true` AND `resultSlot` is provided, the action bar was never visible.

The fix splits the content:
- `formSlot`: `<PaystubForm .../>` only (the input form)
- `resultSlot`: `<PaystubNavigation />` + period detail cards + annual totals card
- `hasResult`: `generator.resultsVisible && generator.paystubData.payPeriods.length > 0`
- `actions` (when resultsVisible): `[{ type: 'print', label: 'Print', onClick: () => window.print() }]`

The print action calls `window.print()` directly — the same function that `generator.handlePrint` ultimately calls. `PaystubNavigation` retains its own print button (inside resultSlot content), so users have two access points. This is the consistent position per CONTEXT.md.

**Task 2 — Performance Calculator copy action:**

The Performance Calculator already had `columns="two"`, `resultSlot`, and `hasResult` wired correctly. The fix adds:
- `useCallback` added to the React import
- `handleCopy` callback that builds a human-readable text summary of all result fields, filtered to remove empty entries, written to clipboard via `navigator.clipboard.writeText`
- `actions` prop: `showResults ? [{ type: 'copy', label: 'Copy Report', onClick: handleCopy }] : undefined`

**Task 3 — Full gap closure verification:**

All 5 tools from 59-VERIFICATION.md gaps confirmed to have `actions=` prop:
- contract-generator (Plan 05 — download)
- invoice-generator (Plan 05 — download)
- proposal-generator (Plan 05 — download)
- paystub-calculator (Plan 06 — print)
- performance-calculator (Plan 06 — copy)

## Verification Results

- TypeScript: 0 errors
- Biome lint: 0 errors
- Tests: 408 pass, 0 fail
- Build: success

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files confirmed:
- FOUND: src/app/tools/paystub-calculator/PaystubCalculatorClient.tsx
- FOUND: src/app/tools/performance-calculator/PerformanceCalculatorClient.tsx

Commits confirmed:
- FOUND: 0ff3174 (Task 1 — paystub print)
- FOUND: a6a1145 (Task 2 — performance copy)
