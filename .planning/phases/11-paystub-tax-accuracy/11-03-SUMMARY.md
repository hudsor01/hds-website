---
phase: 11-paystub-tax-accuracy
plan: 03
subsystem: paystub-calculator
tags: [tax-data, validation, testing, bun-test, 2025, single-source-of-truth, derivation]

# Dependency graph
requires:
  - phase: 11-paystub-tax-accuracy (plan 01)
    provides: getSupportedTaxYears() (data-derived year set, returns [2025]); official 2025 federal brackets + SS wage base 176100
  - phase: 11-paystub-tax-accuracy (plan 02)
    provides: getSupportedIncomeTaxStateCodes() (CA/NY/IL/PA/MA); official 2025 CA/NY/MA brackets with surtaxes encoded as top bands
provides:
  - "getIncomeTaxStates() derived from getSupportedIncomeTaxStateCodes() (single source of truth; dropdown can never drift from bracket data)"
  - "validatePaystubInputs() year check is a getSupportedTaxYears() membership test (rejects unbacked years like 2024; accepts 2025)"
  - "calculateStateTax defensive return 0 re-commented as UI-unreachable fallback (behavior unchanged)"
  - "Full 2025 unit-test matrix: bidirectional dropdown<->data parity, exact-set, MA flat 0.05, CA/MA/NY surtax goldens, federal 5914.00, SS cap 10918.20/378.20, rejected/accepted year"
  - "z-paystub-calculator + pay-periods-generation fixtures re-keyed to taxYear 2025 (survive the tightened validator)"
affects: [11-04 (URL-state intersect referencing getSupportedIncomeTaxStateCodes + the rejected/accepted-year test names)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Derive-then-filter: the selectable list (getIncomeTaxStates) is statesData.states filtered by a Set(getSupportedIncomeTaxStateCodes()), not an independent minus-no-tax allow-list"
    - "Year validation as array membership (supportedYears.includes(taxYear)) mirroring the existing validFrequencies/validFilingStatuses idiom, not a hardcoded numeric range"

key-files:
  created:
    - tests/paystub-federal-tax.test.ts
  modified:
    - src/lib/paystub-calculator/states-utils.ts
    - src/lib/paystub-calculator/validation.ts
    - src/lib/paystub-calculator/state-tax-calculations.ts
    - tests/state-tax-calculations.test.ts
    - tests/paystub-validation.test.ts
    - tests/z-paystub-calculator.test.ts
    - tests/pay-periods-generation.test.ts

key-decisions:
  - "Built a module-scope Set(getSupportedIncomeTaxStateCodes()) and filtered statesData.states against it (mirrors the NO_INCOME_TAX_STATES_CACHE filter shape); left NO_INCOME_TAX_CODES + getNoIncomeTaxStates() untouched (TX || fallback depends on it - RESEARCH Pitfall 2)"
  - "Year error message uses dash-free 'Tax year must be one of: ${supportedYears.join(', ')}' so it lists the backed years dynamically"
  - "Re-keyed the pay-periods-generation.test.ts fixture to 2025 as a Rule 1 fix (it was not in files_modified but broke as a direct consequence of Task 1 tightening the validator; same re-key as z-paystub-calculator)"

patterns-established:
  - "Derive-then-filter selectable list from the data table's code set"
  - "Year-membership validation against getSupportedTaxYears()"

requirements-completed: [PAYSTUB-01, PAYSTUB-03, PAYSTUB-05, PAYSTUB-06, PAYSTUB-07, PAYSTUB-08]

# Metrics
duration: ~18min
completed: 2026-06-02
---

# Phase 11 Plan 03: Derivations + validation + tests Summary

**Wired getIncomeTaxStates() to getSupportedIncomeTaxStateCodes() and validatePaystubInputs() to getSupportedTaxYears() (closing the two drift bugs), re-commented the defensive state-tax guard, and recomputed/added the full 2025 unit-test matrix (parity, MA flat 0.05, CA/MA/NY surtax goldens, federal 5914.00, SS cap 176100, rejected-2024/accepted-2025) so every paystub test file is GREEN.**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-06-02
- **Completed:** 2026-06-02
- **Tasks:** 3 (+1 Rule 1 fixture re-key)
- **Files modified:** 7 (1 created)

## Accomplishments

- **PAYSTUB-01 code drift closed:** `getIncomeTaxStates()` now filters `statesData.states` by a `Set(getSupportedIncomeTaxStateCodes())` (single source of truth), so the dropdown is exactly CA/IL/MA/NY/PA and can never drift from the bracket data. `getNoIncomeTaxStates()` and `NO_INCOME_TAX_CODES` are untouched.
- **PAYSTUB-03 year drift closed:** `validatePaystubInputs()` replaced the hardcoded `2020..currentYear+5` range with `getSupportedTaxYears().includes(params.taxYear)`. A stale `?year=2024` now produces `errors.taxYear` instead of silently flowing to `getTaxDataForYear`'s Math.max fallback (mitigates T-11-05).
- **Defensive guard re-commented:** `calculateStateTax`'s `return 0` is documented as a UI-unreachable fallback for stale shared URLs, behavior unchanged (mitigates T-11-06 framing).
- **2025 test matrix locked:** bidirectional dropdown<->data parity + exact-set; MA recomputed from 0.0535 to flat 0.05 (107/267.5 -> 100/250); new surtax goldens MA 5674.00, CA 6650.00, NY 109000.00; federal single golden 5914.00 + 11925 ceiling; SS cap 10918.20 / 378.20 (proves 176100, not 168600); getSupportedTaxYears()==[2025]; documented getTaxDataForYear fallback; rejected-2024 + accepted-2025.
- **Fixtures re-keyed to 2025:** all four `z-paystub-calculator` fixtures + the `pay-periods-generation` baseParams + the `paystub-validation` validBase, so the hook/period tests survive the tightened validator.
- **All paystub test files GREEN:** 36 pass / 0 fail across state-tax, paystub-validation, paystub-federal-tax, z-paystub-calculator, pay-periods-generation.

## Task Commits

Each task was committed atomically (normal git commits, lefthook pre-commit hooks passed - no --no-verify):

1. **Task 1: Derive getIncomeTaxStates() + data-derived year validation + re-comment defensive guard** - `897a0d3` (feat)
2. **Task 2: State-tax tests (parity, exact-set, MA 0.05, CA/MA/NY surtax goldens, re-documented defensive cases)** - `aa90b06` (test)
3. **Task 3: Federal 2025 golden + SS cap test, year validation tests, re-key z-paystub fixtures** - `dd796b0` (test)
4. **Rule 1 fix: re-key pay-periods-generation fixture to 2025** - `948a38e` (test)

**Plan metadata:** committed with this SUMMARY (docs).

_Note: Tasks were `tdd="true"`. The RED baseline was the pre-existing stale MA/federal assertions + the new parity/year tests; GREEN is the recomputed/added assertions. Source wiring (Task 1) was verified by the plan's grep + typecheck + lint gate plus the parity/validation tests in Tasks 2-3._

## Files Created/Modified

- `src/lib/paystub-calculator/states-utils.ts` - import `getSupportedIncomeTaxStateCodes`; `INCOME_TAX_STATES_CACHE` now filters `statesData.states` by `SUPPORTED_INCOME_TAX_CODES` (a `Set`).
- `src/lib/paystub-calculator/validation.ts` - import `getSupportedTaxYears`; year check is now `!supportedYears.includes(params.taxYear)` with a dash-free dynamic error message.
- `src/lib/paystub-calculator/state-tax-calculations.ts` - defensive `return 0` comment changed to document it as a UI-unreachable fallback (behavior unchanged).
- `tests/state-tax-calculations.test.ts` - added parity + exact-set; recomputed MA to 0.05; added surtax goldens (5674/6650/109000); re-documented TX/FL/XX defensive cases.
- `tests/paystub-federal-tax.test.ts` (NEW) - getSupportedTaxYears()==[2025]; federal 5914.00 + 11925 ceiling; SS 10918.20/378.20; documented getTaxDataForYear fallback.
- `tests/paystub-validation.test.ts` - validBase fixture to 2025; added rejected-2024 + accepted-2025 cases.
- `tests/z-paystub-calculator.test.ts` - all four PaystubData fixtures re-keyed taxYear 2024 -> 2025.
- `tests/pay-periods-generation.test.ts` - baseParams fixture re-keyed 2024 -> 2025 (Rule 1).

## New / changed test case names (for 11-04 reference)

- `PAYSTUB-01: dropdown <-> data parity > selectable income-tax states equal the states with bracket data`
- `PAYSTUB-01: dropdown <-> data parity > the supported income-tax set is exactly CA, IL, MA, NY, PA`
- `Corrected 2025 surtax boundaries > applies the MA 4% surtax over 1083150 (effective 9.0%)`
- `Corrected 2025 surtax boundaries > applies the CA Mental Health Services surtax over 1000000 (13.3%)`
- `Corrected 2025 surtax boundaries > hits the NY 10.9% top bracket over 25000000`
- `PAYSTUB-02: supported tax years > getSupportedTaxYears() returns exactly [2025]`
- `PAYSTUB-05: federal 2025 brackets > computes the single golden case (gross 50000, ytd 0)`
- `PAYSTUB-05: federal 2025 brackets > locks the 10% ceiling at 11925 (not the old 11000)`
- `PAYSTUB-05: SS wage base 2025 > taxes the full 176100 base at 6.2%`
- `PAYSTUB-05: SS wage base 2025 > caps contributions at the 176100 base (not the old 168600)`
- `getTaxDataForYear defensive fallback > resolves an unbacked year to the latest backed year (defense-in-depth)`
- `calculatePaystubTotals validation > rejects a tax year with no backing data`
- `calculatePaystubTotals validation > accepts the supported tax year 2025`

## Decisions Made

- Mirrored the existing `NO_INCOME_TAX_STATES_CACHE` filter shape with a `Set` for the supported-income-tax derivation; left the no-tax allow-list and `getNoIncomeTaxStates()` untouched (RESEARCH Pitfall 2: the `selectedState || 'TX'` default relies on TX staying a no-tax code).
- Year error message is dynamic + dash-free (`Tax year must be one of: 2025`) so it never lists a stale year.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Re-keyed pay-periods-generation.test.ts fixture to 2025**
- **Found during:** Overall verification (`bun run test:unit` after Task 3)
- **Issue:** `tests/pay-periods-generation.test.ts` carries a `baseParams` fixture with `taxYear: 2024` and calls `calculatePaystubTotals`, which now runs the Task 1-tightened `validatePaystubInputs`. The validator rejected 2024 and `calculatePaystubTotals` threw `Invalid paystub inputs: Tax year must be one of: 2025`, breaking both tests in that file. This file was not in the plan's `files_modified` but the breakage is a direct consequence of Task 1, identical in cause to the planned z-paystub-calculator re-key.
- **Fix:** Changed the fixture `taxYear: 2024` to `2025` (one line).
- **Files modified:** tests/pay-periods-generation.test.ts
- **Verification:** `bun test tests/pay-periods-generation.test.ts` -> 2 pass, 0 fail.
- **Committed in:** `948a38e`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for the Wave-2 test:unit gate. No scope creep - it is the same year-re-key the plan already prescribes for z-paystub-calculator, applied to a sibling fixture file that exercises the same validator path.

## Issues Encountered

- The full `bun run test:unit` run shows **21 failures**, all in `tests/unit/homepage.test.tsx` and `tests/unit/navigation.test.tsx` (Footer Component, HomePage structural assertions, Navbar Polish, Navigation Accessibility). These are **pre-existing and out of scope**: the pre-11-03 tree (`2d3eaf00`) already had 21 failures, and these files PASS in isolation (35 pass) - they only fail under full-suite ordering (cross-file test pollution), unrelated to paystub. Net new failures introduced by 11-03: **0** (953 pass vs 946 pre-plan; +7 from the new 11-03 tests). Logged to `.planning/phases/11-paystub-tax-accuracy/deferred-items.md` per the SCOPE BOUNDARY rule; not fixed.

## Known Stubs

None. No placeholder data, empty arrays flowing to UI, or TODO/FIXME markers were introduced.

## Threat Model Coverage

- **T-11-05** (Tampering, stale `?year=` -> validatePaystubInputs): MITIGATED - hardcoded range replaced with `getSupportedTaxYears()` membership (Task 1); rejected-2024/accepted-2025 tests lock it (Task 3).
- **T-11-06** (Information disclosure, getIncomeTaxStates drift / defensive $0 as real): MITIGATED - dropdown derived from `getSupportedIncomeTaxStateCodes()` (Task 1); bidirectional parity test prevents drift (Task 2); guard re-commented as UI-unreachable (Task 1). State-side stale-URL gate (PAYSTUB-10) lands in 11-04.
- **T-11-SC** (package installs): ACCEPTED - zero new deps in this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 11-04 (URL-state hardening, PAYSTUB-10) can intersect URL-restored `?state=` against `getSupportedIncomeTaxStateCodes()` and rely on the now-tightened `validatePaystubInputs` for `?year=`. The rejected/accepted-year test names above are the reference contract.
- All paystub test files are GREEN; the only remaining full-suite failures are the documented pre-existing UI test-pollution failures (deferred-items.md).

## Self-Check: PASSED

- FOUND: src/lib/paystub-calculator/states-utils.ts (modified)
- FOUND: src/lib/paystub-calculator/validation.ts (modified)
- FOUND: src/lib/paystub-calculator/state-tax-calculations.ts (modified)
- FOUND: tests/paystub-federal-tax.test.ts (created)
- FOUND: commit 897a0d3 (Task 1), aa90b06 (Task 2), dd796b0 (Task 3), 948a38e (Rule 1 fix)
- All paystub test files GREEN (36 pass, 0 fail); lint + typecheck clean.

---
*Phase: 11-paystub-tax-accuracy*
*Completed: 2026-06-02*
