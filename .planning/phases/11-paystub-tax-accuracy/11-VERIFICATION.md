---
phase: 11-paystub-tax-accuracy
verified: 2026-06-02T00:00:00Z
status: passed
score: 11/11 must-haves verified
overrides_applied: 0
---

# Phase 11: paystub-tax-accuracy Verification Report

**Phase Goal:** The paystub calculator never tells the user a confident lie about take-home pay. It computes the OFFICIAL 2025 tax year (federal + CA/NY/IL/PA/MA); only states/years backed by real official data are selectable; no silent $0 for a taxed state; no silent year fallback; the >$1M CA/MA surtaxes and NY top brackets are implemented; and the output is framed as an estimate.
**Verified:** 2026-06-02
**Status:** passed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1 | No silent $0 for a taxed state - dropdown derived from data, URL-restore intersected | VERIFIED | `states-utils.ts:14-17` builds `INCOME_TAX_STATES_CACHE` from `getSupportedIncomeTaxStateCodes()` (the union of `stateTaxDataByYear` keys, `state-tax-data.ts:184-192`); `PaystubForm.tsx:227` renders only those; `use-paystub-generator.ts:19-21,85-93` intersects `?state=` with `SUPPORTED_STATE_CODES` and drops unsupported codes. Parity test (`state-tax-calculations.test.ts:8-28`) passes. |
| 2 | Official 2025 values for federal + 5 states | VERIFIED | Federal single 10% ceiling = 11925 (`tax-data.ts:21`); SS base = 176100 (`tax-data.ts:8`); CA top 742953 + MHS 13.3% over 1M (`state-tax-data.ts:47-49`); MA 0.05 then 0.09 over 1083150 (`state-tax-data.ts:21-24`); NY 9.65/10.3/10.9 (`state-tax-data.ts:113-115`); NY MFJ 27900/161550 (`state-tax-data.ts:120-121`). All match RESEARCH "Official 2025 Tables". |
| 3 | No silent year fallback | VERIFIED | `validation.ts:50-53` membership-tests `getSupportedTaxYears()` (= `[2025]`, `tax-data.ts:72-76`); `PaystubForm.tsx:201-205` renders years from `getSupportedTaxYears()`; default `taxYear: 2025` (`use-paystub-form.ts:13`). Test `paystub-validation.test.ts:73-92` (rejects 2024, accepts 2025) + `paystub-federal-tax.test.ts:18-20` (returns exactly [2025]) pass. |
| 4 | Estimate framing, references 2025, dash-free | VERIFIED | `PaystubCalculatorClient.tsx:168` "Estimate your 2025 ... This is an estimate and does not account for W-4 allowances, deductions, or credits."; `page.tsx:13` metadata "Estimate 2025 payroll tax breakdowns". No "accurate" in user-facing copy; no em/en-dash (grep clean). |
| 5 | Tests green and lock the above | VERIFIED | 4 targeted suites: 34 pass / 0 fail. Federal golden 5914.00, 10% ceiling at 11925, SS cap at 176100, MA surtax over 1083150 (eff 9%), CA MHS over 1M (13.3%), NY 10.9% top, parity + exact-set assertions all asserted. |
| 6 | typecheck + targeted suite green | VERIFIED | `bun run typecheck` exit 0; targeted suite exit 0 (34/0). |

**Score:** 6/6 truths verified

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| PAYSTUB-01 | 11-03 | Only states with computed income tax are selectable; never a silent $0 | SATISFIED | Dropdown derived from `getSupportedIncomeTaxStateCodes()`; parity test exact set = CA/IL/MA/NY/PA (`state-tax-calculations.test.ts:20-28`). |
| PAYSTUB-02 | 11-01/11-04 | Year selector offers only data-backed years (2025); no fallback; 2023/2024 removed; default 2025 | SATISFIED | `taxDataByYear` keyed 2025 only; dropdown maps `getSupportedTaxYears()`; default `taxYear: 2025`; `getSupportedTaxYears()` returns `[2025]` (test). |
| PAYSTUB-03 | 11-03 | Year validation rejects unbacked years, range derived from data, unit-tested | SATISFIED | `validation.ts:50-53` derives from `getSupportedTaxYears()`; tests reject 2024 / accept 2025. |
| PAYSTUB-04 | 11-01 | Redundant flat-0 TX/FL/WA removed from bracket table | SATISFIED | `state-tax-data.ts` 2025 table contains only CA/NY/IL/PA/MA; TX/FL/WA live in `NO_INCOME_TAX_CODES` (`states-utils.ts:6`). |
| PAYSTUB-05 | 11-01 | Official 2025 federal brackets all statuses; SS base 176100; FICA/Medicare unchanged | SATISFIED | `tax-data.ts:19-65` all 5 statuses official 2025; `ssWageBase: 176100`; rates 0.062/0.0145/0.009 with 200k/250k/125k thresholds. Golden tests pass. |
| PAYSTUB-06 | 11-01 | CA official 2025 FTB all schedules incl. 1% MHS surtax over $1M | SATISFIED | `state-tax-data.ts:37-103` Schedules X/Y/Z with a 1M split producing 13.3% effective top; surtax IMPLEMENTED (full fidelity, exceeds RESEARCH "simplification" framing per REQUIREMENTS decision). Test asserts 6650 over 1M. |
| PAYSTUB-07 | 11-01 | NY official 2025 DTF all schedules incl. 9.65/10.3/10.9 high brackets | SATISFIED | `state-tax-data.ts:105-160` all statuses with 9.65/10.3/10.9; MFJ thresholds updated to 27900/161550. Test asserts 10.9% top bracket (109000). |
| PAYSTUB-08 | 11-01 | MA flat 5.0% (not 0.0535) incl. 4% surtax over $1,083,150 | SATISFIED | `massachusettsBrackets()` `state-tax-data.ts:20-24` = 0.05 to 1083150 then 0.09; surtax IMPLEMENTED. Tests assert 100/250 (flat) and 5674 (surtax band). |
| PAYSTUB-09 | 11-02 | UI describes output as "estimate" not "accurate"; dash-free | SATISFIED | Hero + metadata say "Estimate", reference 2025, disclose no-W-4/deduction/credit limitation; no "accurate"; no em/en-dash. |
| PAYSTUB-10 | 11-04 | Stale shared URL state code cannot reach defensive $0 path | SATISFIED | `use-paystub-generator.ts:85-93` only applies a restored state code if it is in `SUPPORTED_STATE_CODES`; unsupported `?state=AL` is dropped (form keeps default), never reaching `calculateStateTax`'s defensive `return 0`. |

All 10 phase requirements SATISFIED. No orphaned requirements (REQUIREMENTS.md maps exactly PAYSTUB-01..10 to Phase 11, all claimed across plans 11-01..11-04).

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `tax-data.ts` | 2025-keyed federal + getSupportedTaxYears | VERIFIED | Official 2025 brackets all statuses; SS 176100; `getSupportedTaxYears()` = [2025]. |
| `state-tax-data.ts` | CA/NY/IL/PA/MA 2025 + surtaxes + getSupportedIncomeTaxStateCodes | VERIFIED | All values match RESEARCH; CA MHS + MA surtax bands present; TX/FL/WA removed. |
| `states-utils.ts` | Dropdown derived from data | VERIFIED | `getIncomeTaxStates()` derived from data keys. |
| `validation.ts` | Membership-test years | VERIFIED | Derives from `getSupportedTaxYears()`. |
| `state-tax-calculations.ts` | Defensive return 0 retained, documented | VERIFIED | Documented as UI-unreachable defensive fallback. |
| `PaystubForm.tsx` | Data-driven year + state selects | VERIFIED | Year maps `getSupportedTaxYears()`; state maps `getIncomeTaxStates()`. |
| `use-paystub-form.ts` | default taxYear 2025 | VERIFIED | `taxYear: 2025`. |
| `use-paystub-generator.ts` | URL state intersection | VERIFIED | `SUPPORTED_STATE_CODES` guard on restore. |
| `PaystubCalculatorClient.tsx` / `page.tsx` | Estimate copy | VERIFIED | Estimate framing, 2025, dash-free. |
| paystub test files | Lock the above | VERIFIED | 34 pass / 0 fail. |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| PaystubForm state `<Select>` | bracket data | `getIncomeTaxStates()` -> `getSupportedIncomeTaxStateCodes()` -> `stateTaxDataByYear` keys | WIRED | Single source of truth, parity test enforces. |
| PaystubForm year `<Select>` | data table | `getSupportedTaxYears()` -> `Object.keys(taxDataByYear)` | WIRED | Renders 2025 only. |
| validatePaystubInputs | supported years | `getSupportedTaxYears()` | WIRED | Rejects 2024, accepts 2025. |
| URL `?state=` restore | supported codes | `SUPPORTED_STATE_CODES.has()` guard | WIRED | Unsupported dropped before set. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Targeted paystub suites | `bun test tests/state-tax-calculations.test.ts tests/paystub-validation.test.ts tests/paystub-federal-tax.test.ts tests/z-paystub-calculator.test.ts` | 34 pass / 0 fail, exit 0 | PASS |
| TypeScript | `bun run typecheck` | exit 0 | PASS |
| Full unit suite | `bun test tests/` | 953 pass / 21 fail, 974 total | PASS (21 fail = pre-existing) |
| Pre-existing failures unchanged | grep fail files | HomePage(10)+Footer(9)+Nav a11y(1)+Navbar Polish(1) = 21; 0 paystub failures | PASS (matches deferred-items.md exactly) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (none) | - | No TBD/FIXME/XXX/HACK/PLACEHOLDER-stub markers in modified files | Info | "PLACEHOLDER" grep hits are all legitimate input `placeholder=` form attributes, not stubs. `calculateStateTax` `return 0` is documented defensive fallback (UI-unreachable), not a silent stub. |

### Gaps Summary

No gaps. All 11 must-haves (6 observable truths + the 10 requirement IDs, deduplicated) are verified against the shipped source, not SUMMARY claims:

- The data values in `tax-data.ts` / `state-tax-data.ts` were spot-checked line-by-line against RESEARCH.md "Official 2025 Tables" and match (federal 11925/176100, CA 742953 + 13.3% MHS over 1M, MA 0.05/0.09 over 1083150, NY 9.65/10.3/10.9, NY MFJ 27900/161550).
- The implementation EXCEEDS the RESEARCH "documented simplification" stance on surtaxes: per the REQUIREMENTS "full fidelity" decision (PAYSTUB-06/08), the CA MHS and MA 4% surtaxes are actually implemented as additional top brackets, and tests lock them.
- The selectable surface (states + years) is derived from the data tables in both directions; no parallel allow-list remains; the URL-restore path closes the last silent-$0 hole (PAYSTUB-10).
- typecheck clean; 34/34 paystub tests pass; full-suite shows exactly the 21 pre-existing homepage/navigation pollution failures documented in deferred-items.md (0 net-new, 0 paystub-related).

---

_Verified: 2026-06-02_
_Verifier: Claude (gsd-verifier)_
