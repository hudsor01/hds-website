---
phase: 11-paystub-tax-accuracy
plan: 01
subsystem: paystub-calculator
tags: [tax-data, federal, fica, 2025, data-correction]
requires: []
provides:
  - "Official 2025 federal tax data keyed 2025 (all five filing schedules)"
  - "Social Security wage base 176100 (2025)"
  - "getSupportedTaxYears() data-derived helper returning [2025]"
affects:
  - "src/lib/paystub-calculator/tax-calculations.ts (consumer via getCurrentTaxData; not modified)"
  - "11-03 (year-membership validation imports getSupportedTaxYears)"
  - "11-04 (form year dropdown renders from getSupportedTaxYears)"
tech-stack:
  added: []
  patterns:
    - "Derive selectable/valid year set from Object.keys(taxDataByYear), no parallel literal"
    - "Single real data entry keyed to its true year; defense-in-depth Math.max fallback retained + documented"
key-files:
  created: []
  modified:
    - "src/lib/paystub-calculator/tax-data.ts"
decisions:
  - "Deleted the 2024 entry and the JSON deep-clone 2025 placeholder; the re-keyed entry is the single real source (CONTEXT.md discretion: delete the clone)"
  - "Baseline guard moved from taxDataByYear[2024] to taxDataByYear[2025]; throw message updated to reference 2025"
  - "Kept the Math.max(...availableYears) fallback as documented defense-in-depth, unreachable from the UI once 11-03 validation lands"
metrics:
  duration: "~6 min"
  completed: "2026-06-02"
  tasks: 2
  files: 1
requirements: [PAYSTUB-02, PAYSTUB-05]
---

# Phase 11 Plan 01: Federal tax-data 2025 Summary

Re-keyed `tax-data.ts` to the official 2025 IRS federal brackets (Rev. Proc. 2024-40) for all five filing schedules, raised the Social Security wage base to $176,100, deleted the stale 2024 entry and the fake 2025 deep-clone, moved the baseline guard to 2025, and exposed the supported-year set as a data-derived `getSupportedTaxYears()` helper.

## What Was Built

### Task 1: Re-key federal table to official 2025 (commit `0f8c800`)

All five federal `federalBrackets` schedules now hold the official 2025 upper limits transcribed from 11-RESEARCH.md "## Official 2025 Tables (TARGET YEAR)":

- **single:** 10% to 11925, 12% to 48475, 22% to 103350, 24% to 197300, 32% to 250525, 35% to 626350, 37% over (Infinity).
- **marriedJoint:** 10% to 23850, 12% to 96950, 22% to 206700, 24% to 394600, 32% to 501050, 35% to 751600, 37% over (Infinity).
- **marriedSeparate:** 10% to 11925, 12% to 48475, 22% to 103350, 24% to 197300, 32% to 250525, 35% to **375800** (distinct from single's 626350 - RESEARCH Pitfall 7), 37% over (Infinity).
- **headOfHousehold:** 10% to 17000, 12% to 64850, 22% to 103350, 24% to 197300, 32% to **250500** (not 250525), 35% to 626350, 37% over (Infinity).
- **qualifyingSurvivingSpouse:** identical to marriedJoint (IRS treatment).

Federal payroll constants:

- `ssWageBase: 176100` (CHANGED from 168600 - SSA 2025 COLA).
- `ssRate: 0.062`, `medicareRate: 0.0145`, `additionalMedicareRate: 0.009` - UNCHANGED.
- `additionalMedicareThreshold` block (single 200000, marriedJoint 250000, marriedSeparate 125000, headOfHousehold 200000, qualifyingSurvivingSpouse 250000) - UNCHANGED (statutory, not indexed).

Structural changes:

- The entry key changed from `2024` to `2025`.
- DELETED the deep-clone placeholder line `taxDataByYear[2025] = JSON.parse(JSON.stringify(taxDataByYear[2024])) as TaxData` and its comment (old lines 67-68). The re-keyed entry replaces it; there is no longer a 2024 entry to clone from.
- In `getTaxDataForYear`: `const defaultData = taxDataByYear[2024]` to `taxDataByYear[2025]`, and the throw message `'Missing baseline tax data for 2024'` to `'Missing baseline tax data for 2025'`.
- KEPT the `Math.max(...availableYears)` fallback with an added comment noting it is defense-in-depth, unreachable from the UI once 11-03 year-membership validation rejects unbacked years.

### Task 2: Export getSupportedTaxYears() (commit `5cd20f3`)

Added the exported helper:

```typescript
export function getSupportedTaxYears(): number[] {
	return Object.keys(taxDataByYear)
		.map(Number)
		.sort((a, b) => b - a)
}
```

Single source of truth for the selectable/valid year set, mirroring the `Object.keys(taxDataByYear)` idiom already in `getTaxDataForYear`. No parallel `SUPPORTED_TAX_YEARS` literal added (anti-pattern). After the Task 1 re-key it returns exactly `[2025]` (verified at runtime). 11-03 validation and the 11-04 form dropdown import it.

## Consumer for 11-03 golden tests

The federal calc the corrected data feeds is **`calculateFederalTax`** (arrow const, `src/lib/paystub-calculator/tax-calculations.ts:4`). It reads federal brackets via `getCurrentTaxData(year)` (from `paystub-utils`, which wraps `getTaxDataForYear`). SS is `calculateSocialSecurity` (line 76, reads `ssWageBase`/`ssRate`), Medicare is `calculateMedicare` (line 100, reads `medicareRate`/`additionalMedicareRate`/threshold). 11-03 should write golden-number assertions against `calculateFederalTax` using the 2025 brackets and against `calculateSocialSecurity` using the $176,100 wage base.

## Verification

- `bun run typecheck` - PASS (after each task and overall).
- All Task 1 grep gates - PASS: `ssWageBase: 176100` present; `limit: 11925` / `626350` / `375800` / `751600` present; `taxDataByYear[2025]` referenced by the baseline guard; `JSON.parse(JSON.stringify` absent; zero non-comment `2024` references; zero non-comment `168600` references.
- `getSupportedTaxYears()` returns exactly `[2025]` at runtime (proves data-derived, not hardcoded).
- Pre-commit hooks (Biome lint + typecheck via lefthook) passed on both commits.

## Deviations from Plan

None - plan executed exactly as written.

## Note on test files (expected RED at Wave-1 boundary)

Per the plan's `<verification>` block, federal golden-number unit tests are intentionally (re)written in 11-03, which owns the test files. After this plan the existing federal-encoding assertions may be RED until 11-03 recomputes them against the 2025 brackets and the $176,100 SS base. That is expected at the Wave-1 boundary. No test files were edited in this plan (file ownership: 11-03 owns the tests). The grep + runtime + typecheck gates served as the executable verification for this data-only change.

## TDD Gate Compliance

This plan's tasks are marked `tdd="true"`, but the plan body and `<verification>` explicitly assign all test-file ownership to 11-03 and forbid editing test files here. The behavior verification was performed via the plan-specified automated gates (grep value assertions + runtime `getSupportedTaxYears()` check + typecheck) rather than RED/GREEN test commits, because writing the federal golden-number tests in this plan would violate 11-03's file ownership. The federal golden-number RED/GREEN cycle lands in 11-03 as designed.

## Threat Model Coverage

- **T-11-01** (presenting 2023 brackets as current): MITIGATED - all five federal schedules replaced with official 2025 IRS values and SS base 176100 (Task 1). 11-03 federal golden tests will lock the correction.
- **T-11-02** (silent year substitution via Math.max): MITIGATED - fallback retained only as documented defense-in-depth; baseline guard moved to 2025 so it cannot throw post re-key; UI-level rejection lands in 11-03.
- **T-11-SC** (package installs): ACCEPTED - no package installs in this plan, zero new deps.

## Self-Check: PASSED

- `src/lib/paystub-calculator/tax-data.ts` exists (modified).
- Commit `0f8c800` exists (Task 1).
- Commit `5cd20f3` exists (Task 2).
