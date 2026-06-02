# Phase 11: paystub-tax-accuracy - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning
**Source:** Synthesized from `.planning/v6-AUDIT-FINDINGS.md` (audit findings #1, #2, #4 + 2025-clone note) and operator decisions during v6 milestone setup.

<domain>
## Phase Boundary

Make the paystub calculator stop lying about take-home pay. Today the calculator advertises "accurate payroll breakdowns with federal and state tax calculations for any pay period," but:

1. The state dropdown lets users pick any of 42 income-tax states, while only 5 (CA, NY, IL, PA, MA) have bracket data. The other 37 silently resolve to $0 state tax and an inflated net pay.
2. The federal year dropdown offers "2023", but there is no 2023 data, so it silently falls back to other-year figures (a dead toggle).

This phase makes the selectable inputs match the data that exists AND makes that data correct and current. Official-source verification found the audit under-counted: the 5 "supported" states (CA/NY/MA) and the FEDERAL brackets were stale (2023 values labeled 2024; MA at a pre-2020 rate). **Target year is OFFICIAL 2025** (operator directive): the calculator computes the 2025 tax year using official 2025 federal + state tables, at full fidelity (operator decision: implement the >$1M tiers too). Scope: state selection, year selection (2025), year validation, redundant data cleanup, tax-data CORRECTION to official 2025 (federal + CA + NY + MA, incl. surtaxes; SS wage base updated to the 2025 figure), estimate-framing copy, URL-state hardening, and the tests that codified the silent $0 / silent fallback.

**In scope:** `src/lib/paystub-calculator/{state-tax-data,state-tax-calculations,states-utils,tax-data,validation}.ts`, `src/components/paystub/PaystubForm.tsx`, the paystub hooks for URL-state intersect, `tests/state-tax-calculations.test.ts` + `tests/paystub-validation.test.ts`, and paystub page/hero copy.

**Out of scope:** Adding bracket data for the 37 unsupported states (PAYSTUB-F1, deferred). Adding other tax years beyond 2025 (2024 historical, 2026) (PAYSTUB-F2, deferred). Any other paystub feature. Methodology beyond bracket-on-gross (no W-4/deductions/credits) is NOT added — instead the copy is reframed as an estimate (PAYSTUB-09).
</domain>

<decisions>
## Implementation Decisions (LOCKED)

### State selection (PAYSTUB-01)
- The "State Income Tax" dropdown group must only offer states that have real bracket data. `getIncomeTaxStates()` (`src/lib/paystub-calculator/states-utils.ts:23`) must DERIVE its list from the state codes present in the state tax bracket table (`stateTaxDataByYear`), mapped to labels from `src/data/states.json` — NOT from "all 50 minus 8 no-tax codes".
- After PAYSTUB-04 removes the redundant flat-0 entries, the supported set is exactly: CA, NY, IL, PA, MA.
- The "No State Income Tax" group (`getNoIncomeTaxStates()`, the 8 NO_INCOME_TAX_CODES) is unchanged.
- Net effect: no state that levies income tax but lacks bracket data is ever selectable, so the calculator can never present a confident $0 for a taxed state.
- Do NOT add 37 states of bracket data (deferred PAYSTUB-F1).

### Year selection (PAYSTUB-02) — target 2025
- The data tables are re-keyed to **2025** with official 2025 values. Replace the current `taxDataByYear[2024]` (which holds stale 2023 figures) and delete the `taxDataByYear[2025]` deep-clone; the single real entry becomes official 2025 federal data. Likewise `stateTaxDataByYear` is keyed 2025 with official 2025 state brackets.
- `PaystubForm.tsx` year dropdown: remove the `<SelectItem value="2023">` AND the `<SelectItem value="2024">`; offer **2025** (the only year with real data).
- Default `taxYear` becomes **2025** (`use-paystub-form.ts:13`, currently 2024).
- Every year offered must be backed by real data; a selected year must never silently fall back to a different year.

### Year validation (PAYSTUB-03)
- `validatePaystubInputs` (`validation.ts`) currently accepts `taxYear` in a hardcoded range `2020..currentYear+5`. Replace this with validation derived from the years that actually have data (`Object.keys(taxDataByYear)`, or the selectable set), rejecting years without data instead of letting `getTaxDataForYear` silently fall back to `Math.max(availableYears)`.
- Add a unit test asserting a year without data is rejected (or otherwise cannot silently yield another year's figures).

### Redundant data cleanup (PAYSTUB-04)
- Remove the `TX: flatBrackets(0)`, `FL: flatBrackets(0)`, `WA: flatBrackets(0)` entries from the income-tax bracket table in `state-tax-data.ts`. These states are already in the no-income-tax group (`NO_INCOME_TAX_CODES`), so the flat-0 entries are redundant and would pollute the data-derived selectable list from PAYSTUB-01.

### Tax data correctness, full fidelity (PAYSTUB-05..08) — OFFICIAL 2025 values from 11-RESEARCH.md "## Official 2025 Tables (TARGET YEAR)"
- **Federal (PAYSTUB-05):** replace all filing statuses with the official **2025** IRS brackets (Rev. Proc. 2024-40) transcribed in 11-RESEARCH.md (single ceilings 11925 / 48475 / 103350 / 197300 / 250525 / 626350; MFJ/HoH/MFS per the table). The **Social Security wage base CHANGES to $176,100** (2025, up from $168,600) - update it. Medicare 1.45% + 0.9% at $200k/$250k/$125k and the 6.2% SS rate are unchanged. This file feeds federal/SS/Medicare via `tax-calculations.ts` (4 call sites), so gate every edit with the full unit suite.
- **CA (PAYSTUB-06):** official **2025** FTB schedules (all filing statuses; Sch X 1% to 11079 ... 12.3% to 742953) AND the 1% Mental Health Services surtax on income over $1,000,000 (statutory, unchanged).
- **NY (PAYSTUB-07):** official **2025** DTF schedules (all filing statuses) AND the 9.65% / 10.3% / 10.9% high-income brackets (NY does not index these; same as 2024).
- **MA (PAYSTUB-08):** flat rate `0.05` (5.0%) AND the 4% surtax on income over **$1,083,150** (2025 indexed threshold, up from $1,053,750).
- IL (`0.0495`) and PA (`0.0307`) are unchanged for 2025 - confirmed against official sources, do NOT change.
- The bracket-application math in `calculateStateTax` already supports progressive brackets terminating in `Infinity`; express surtaxes as additional top brackets in the same data shape (so no new math path) where the schedule allows, else the planner specifies the minimal calc extension.
- Add unit tests asserting representative corrected 2025 boundary values (e.g. federal single 10% ceiling is $11,925; SS wage base $176,100; MA effective rate 5.0%; a >$1M CA/MA case applies the surtax; an NY high-income case hits the 10.9% bracket).

### Estimate framing (PAYSTUB-09)
- Even with corrected tables, the engine taxes gross from dollar one with no W-4, standard deduction, pre-tax deductions, or credits, so it is NOT real withholding (IRS Pub 15-T). The hero/metadata copy (`PaystubCalculatorClient.tsx:168`, `page.tsx:13`) must describe the output as an "estimate", not "accurate", and must not over-promise. No em-dash or en-dash in any user-facing string (project rule).

### URL-state hardening (PAYSTUB-10)
- nuqs `parseAsInteger`/`parseAsString` pass a parseable `?year=2023` / `?state=AL` through UNCHANGED (no range/allowlist). The tightened `validatePaystubInputs` is the only year gate and must run on URL-restored state. For state, the restore path (`use-paystub-generator.ts` ~62-77 / `use-paystub-url-state.ts`) must intersect the restored code with the supported state codes, so a stale shared `?state=AL` resolves to a supported default or a clear signal, never the defensive silent $0.

### Test contract
- `tests/state-tax-calculations.test.ts` currently codifies the silent "unknown state -> 0" behavior as "graceful." Update it to match the new contract. If `calculateStateTax` keeps a defensive `return 0` for truly-unknown input (acceptable since the UI can no longer reach it), the test should document that as a defensive fallback, not as expected user-facing behavior.

### Claude's Discretion
- Exact label text / ordering of the supported-state list; whether to keep a small dash-free "supported states" note.
- Whether `calculateStateTax` retains a defensive `return 0` for unknown input.
- Whether to delete the 2025 clone or merely make it non-selectable (recommended: delete).
- Exact wording of the "estimate" copy (must be dash-free, must not over-promise).
- Whether surtaxes are encoded as extra brackets vs a small calc extension (prefer extra brackets / no new math path).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Authoritative value source (READ FIRST for PAYSTUB-05..10)
- `.planning/phases/11-paystub-tax-accuracy/11-RESEARCH.md` — "## Official 2025 Tables (TARGET YEAR)" holds the full official **2025** federal/CA/NY/MA tables (all filing statuses) + the 2025-vs-2024 deltas table + source URLs (IRS Rev. Proc. 2024-40, SSA 2025 COLA, CA FTB 2025, NY DTF IT-201-I 2025, Mass.gov DOR 2025). Transcribe 2025 values from THIS section. The earlier "## Data Accuracy Verification" 2024 section is retained for reference only; it also holds the methodology/estimate finding and the nuqs stale-URL semantics (both still apply).

### Audit source of truth
- `.planning/v6-AUDIT-FINDINGS.md` — findings #1, #2 (state tax), #4 (year toggle), and the 2025-clone note, with verified call-site analysis.

### Code under change
- `src/lib/paystub-calculator/state-tax-data.ts` — `getStateTaxBrackets`, `stateTaxDataByYear`, the bracket table (CA/NY brackets, IL/PA/MA flat, redundant TX/FL/WA flat-0).
- `src/lib/paystub-calculator/state-tax-calculations.ts` — `calculateStateTax` (the `if (!stateBrackets) return 0` collapse).
- `src/lib/paystub-calculator/states-utils.ts` — `getIncomeTaxStates` / `getNoIncomeTaxStates`, `NO_INCOME_TAX_CODES`.
- `src/lib/paystub-calculator/tax-data.ts` — `taxDataByYear`, `getTaxDataForYear` (the `Math.max(availableYears)` fallback), the 2025 clone.
- `src/lib/paystub-calculator/validation.ts` — `validatePaystubInputs` (hardcoded `2020..currentYear+5` year range).
- `src/components/paystub/PaystubForm.tsx` — state dropdown (~line 215-228, both optgroups) and year dropdown (~line 200-201).
- `src/data/states.json` — state code/label source.

### Tests
- `tests/state-tax-calculations.test.ts` — codifies the silent-$0 "graceful" behavior; must be updated.
- `tests/z-paystub-calculator.test.ts` — broader paystub coverage; check for assertions affected by state/year changes.

### UI copy
- `src/app/(public)/tools/paystub-calculator/PaystubCalculatorClient.tsx`, `.../page.tsx` — hero + metadata that may over-promise coverage.
</canonical_refs>

<specifics>
## Specific Ideas

- Supported income-tax states after this phase: CA, NY, IL, PA, MA (exactly the `stateTaxDataByYear` keys once TX/FL/WA flat-0 dupes are removed).
- The data-derived `getIncomeTaxStates()` is the single source of truth tying the dropdown to the data, so the two can never drift again. A test should assert every selectable income-tax state has bracket data (and vice versa) to prevent regression.
- Run the project gates after: `bun run lint && bun run typecheck && bun run test:unit && bun run build`. Add an e2e check only if an existing paystub e2e already exists.
</specifics>

<deferred>
## Deferred Ideas

- **PAYSTUB-F1** (future milestone): Add real state income-tax bracket data for the remaining 37 income-tax states (incremental), re-enabling them in the selector via the same data-derived list.
</deferred>

---

*Phase: 11-paystub-tax-accuracy*
*Context gathered: 2026-06-01, synthesized from v6 audit findings + operator decisions*
