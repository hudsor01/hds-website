# Phase 11: paystub-tax-accuracy - Research

**Researched:** 2026-06-01
**Domain:** Internal TypeScript tax-calculation logic + React/shadcn form UI (Next.js 16 / React 19, Bun + bun:test)
**Confidence:** HIGH (every claim verified by direct read of the source under change)

## Summary

The paystub calculator advertises "accurate ... federal and state tax calculations for any pay period," but its selectable inputs over-promise the data behind them. The state dropdown renders all 42 income-tax states (`getIncomeTaxStates()` = 50 states minus the 8 `NO_INCOME_TAX_CODES`), while only 5 states have bracket data (CA, NY, IL, PA, MA, plus redundant flat-0 TX/FL/WA). Selecting any of the other 37 returns `undefined` from `getStateTaxBrackets`, which `calculateStateTax` collapses to `return 0`, producing a confident $0 state tax and inflated net pay. Separately, the year dropdown offers "2023" with no 2023 data; `getTaxDataForYear(2023)` silently falls back to the max available year (2024/2025 clone). Validation (`validatePaystubInputs`) accepts any `taxYear` in a hardcoded `2020..currentYear+5` range, never catching the missing-data case.

This is a self-contained bugfix in five lib files, one component, and two test files. The fix is **fully specified in CONTEXT.md** and is NOT a redesign: make `getIncomeTaxStates()` derive from `stateTaxDataByYear` keys, remove the redundant TX/FL/WA flat-0 entries, remove the 2023 `SelectItem`, derive year validation from `Object.keys(taxDataByYear)`, update the test that codified silent-$0 as "graceful," and soften the page/client copy. No new dependencies, no schema changes, no network surface. The chief risk is touching shared modules (`tax-data.ts`, `state-tax-data.ts`) in a way that regresses federal calc or the existing flat/progressive state math, all of which is locked by existing unit tests.

**Primary recommendation:** Treat `stateTaxDataByYear` (state-tax-data.ts) and `taxDataByYear` (tax-data.ts) as the single source of truth. Export small derivation helpers (`getSupportedIncomeTaxStateCodes()`, `getSupportedTaxYears()`) and consume them in `states-utils.ts`, `validation.ts`, and `PaystubForm.tsx`. Add a bidirectional regression test that asserts `getIncomeTaxStates()` codes === `stateTaxDataByYear` income-tax codes, so the dropdown and the data can never drift again. Keep `calculateStateTax`'s `return 0` as a documented defensive fallback (unreachable from the UI), and keep `getTaxDataForYear`'s fallback as defense-in-depth now that validation rejects unbacked years upstream.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Derive selectable income-tax state list | Browser/Client (lib called from client component) | - | `states-utils.ts` is a pure module imported by `PaystubForm.tsx` (`'use client'`); no server round-trip; data is a static import of `states.json` + the in-module `stateTaxDataByYear` |
| Derive selectable / valid tax years | Browser/Client (lib) | - | `tax-data.ts` / `validation.ts` are pure modules; the dropdown and `validatePaystubInputs` run client-side inside the React hooks |
| State tax bracket math | Browser/Client (lib) | - | `calculateStateTax` runs synchronously inside `usePaystubCalculator` (`useMemo`); no backend |
| Year-data resolution + fallback | Browser/Client (lib) | - | `getTaxDataForYear` / `getCurrentTaxData` resolve in-process |
| Input validation | Browser/Client (lib) | - | `validatePaystubInputs` invoked both in `use-paystub-validation` and inside `calculatePaystubTotals` before compute |
| UI copy / metadata | Frontend Server (page metadata) + Client (hero) | - | `page.tsx` exports `metadata` (server); `PaystubCalculatorClient.tsx` passes the over-promising `description` string to `ToolPageLayout` (client) |

**Note:** This entire phase is client-tier pure logic + form UI. There is no API route, no DB, no server action involved. The only server-tier touchpoint is the static `metadata` export in `page.tsx`.

## Standard Stack

No new packages. This phase uses only what is already installed and locked by CLAUDE.md.

### Core (already present)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| bun:test | bun@1.3.13 | Unit test runner | `[VERIFIED: package.json]` Project standard; `test:unit` = `bun test tests/` |
| TypeScript (strict) | per tsconfig | Type safety, no `any` | `[CITED: CLAUDE.md]` Strict mode, NO `any`, validate at boundaries with Zod |
| Zod 4 | installed | Boundary validation | `[CITED: CLAUDE.md]` Already used in `src/lib/schemas/paystub.ts` |
| @testing-library/react | installed | Hook tests | `[VERIFIED: tests/z-paystub-calculator.test.ts]` `renderHook`/`act` already used |
| shadcn `Select` | `src/components/ui/select` | State/year dropdowns | `[VERIFIED: PaystubForm.tsx]` `SelectGroup`/`SelectLabel`/`SelectItem` already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nuqs | installed | URL state (`year`, `state` query params) | Already wired in `use-paystub-url-state.ts`; relevant because a stale `?year=2023` URL must not crash or silently fall back after the fix |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-module `stateTaxDataByYear` object | A separate JSON data file | YAGNI - the data is small and the phase explicitly defers adding coverage (PAYSTUB-F1). Keep it in the TS module so it stays type-checked against `TaxData`. |
| Deriving years from `Object.keys` at call time | A frozen `SUPPORTED_TAX_YEARS` const | Either works; deriving from `Object.keys(taxDataByYear)` is the single-source-of-truth approach CONTEXT.md mandates and avoids a second list to keep in sync. `[CITED: 11-CONTEXT.md:38]` |

**Installation:** None. `bun install` unchanged.

## Package Legitimacy Audit

**Not applicable.** This phase installs zero external packages. All work uses existing project dependencies (bun:test, TypeScript, Zod, @testing-library/react, shadcn Select, nuqs), all already in `package.json` and exercised by existing code. No `npm install` / `bun add` step is planned. `[VERIFIED: codebase grep - no new imports required]`

## Architecture Patterns

### System Architecture Diagram

```
                         PaystubForm.tsx ('use client')
                                  |
        +-------------------------+--------------------------+
        |                         |                          |
   State <Select>          Year <Select>             other inputs
   getNoIncomeTaxStates()  hardcoded SelectItems       (rate, hours, ...)
   getIncomeTaxStates()    2024 / 2023(dead)
        |                         |
        |   (PAYSTUB-01)          |   (PAYSTUB-02)
        v                         v
  states-utils.ts            tax-data.ts
  derive from -------------> taxDataByYear (2024 real, 2025 clone)
  stateTaxDataByYear keys    getTaxDataForYear() [Math.max fallback]
        |                         |
        v                         |
  state-tax-data.ts              |
  stateTaxDataByYear             |
  (CA,NY,IL,PA,MA + TX/FL/WA-0)  |
  getStateTaxBrackets()          |
        |                         |
        +-----------+-------------+
                    |
            calculate-paystub-totals.ts
            validatePaystubInputs()  <-- (PAYSTUB-03) reject unbacked years
                    |  per pay period:
                    v
            calculateStateTax()  <-- (#1/#2) `if (!brackets) return 0` collapse
            calculateFederalTax / SocialSecurity / Medicare (getCurrentTaxData -> getTaxDataForYear)
                    |
                    v
            PaystubData.totals  -->  PaystubCalculatorClient renders net pay
```

Data flow for the primary use case (user picks state + year -> sees net pay): form select -> hook (`usePaystubCalculator` `useMemo`) -> `validatePaystubInputs` -> `calculatePaystubTotals` loops pay periods -> `calculateStateTax(state, ..., taxYear)` -> `getStateTaxBrackets` -> totals -> client render. The two bugs live at the **two select widgets at the top** (they offer values the data layer cannot honor) and at **`calculateStateTax`'s early return** (it hides the gap).

### Component Responsibilities

| File | Current Responsibility | Change Required |
|------|------------------------|-----------------|
| `src/lib/paystub-calculator/state-tax-data.ts` | Holds `stateTaxDataByYear`, `getStateTaxBrackets`, `flatBrackets` | Remove `TX`/`FL`/`WA` flat-0 entries (PAYSTUB-04); export a helper to list supported state codes across all years (PAYSTUB-01 source) |
| `src/lib/paystub-calculator/states-utils.ts` | `getIncomeTaxStates()` returns `states.json` minus `NO_INCOME_TAX_CODES` | Derive list from `stateTaxDataByYear` keys, intersected with `states.json` for labels (PAYSTUB-01). `getNoIncomeTaxStates()` unchanged. |
| `src/lib/paystub-calculator/tax-data.ts` | `taxDataByYear` (2024 + 2025 clone), `getTaxDataForYear` fallback | Decide on 2025 clone (delete or keep non-selectable); export `getSupportedTaxYears()` (PAYSTUB-02 source). Keep `Math.max` fallback as documented defense. |
| `src/lib/paystub-calculator/validation.ts` | `validatePaystubInputs` hardcodes `2020..currentYear+5` | Replace with membership check against supported years (PAYSTUB-03) |
| `src/components/paystub/PaystubForm.tsx` | Year `<SelectItem>` list hardcodes 2024+2023; state optgroups call the two utils | Remove `2023` item (line 201); ideally render year items from `getSupportedTaxYears()` (PAYSTUB-02). State optgroup auto-fixes via PAYSTUB-01. |
| `src/lib/paystub-calculator/state-tax-calculations.ts` | `calculateStateTax` `if (!stateBrackets) return 0` | Keep `return 0` as a documented defensive fallback (Claude's discretion, CONTEXT.md:53); add a code comment that the UI can no longer reach it. |

### Pattern 1: Derive selectable inputs from the data table
**What:** The list a user can select from is computed from the data that can answer the selection, not from an independent allow-list.
**When to use:** Any time a UI control's options must stay in lockstep with backing data.
**Example (illustrative - matches existing module style, `[ASSUMED]` shape):**
```typescript
// src/lib/paystub-calculator/state-tax-data.ts
// Source: derived from existing stateTaxDataByYear shape (state-tax-data.ts:6)
export function getSupportedIncomeTaxStateCodes(): string[] {
	const codes = new Set<string>()
	for (const yearTable of Object.values(stateTaxDataByYear)) {
		for (const code of Object.keys(yearTable)) {
			codes.add(code)
		}
	}
	return [...codes]
}
```
```typescript
// src/lib/paystub-calculator/states-utils.ts
// Intersect supported codes with states.json for labels
const SUPPORTED = new Set(getSupportedIncomeTaxStateCodes())
const INCOME_TAX_STATES_CACHE = statesData.states.filter(s => SUPPORTED.has(s.value))
```
Note: `stateTaxDataByYear` is keyed **year -> stateCode -> brackets** (confirmed: `state-tax-data.ts:6` `Record<number, StateTaxBrackets>`, `StateTaxBrackets = Record<string, ...>`). Currently only the `2024` year exists, so the union over years equals the `2024` keys. Iterating all years future-proofs for PAYSTUB-F1. `[VERIFIED: state-tax-data.ts:4-6]`

### Pattern 2: Derive valid year set, reject the rest
```typescript
// tax-data.ts
// Source: existing Object.keys(taxDataByYear) usage (tax-data.ts:73)
export function getSupportedTaxYears(): number[] {
	return Object.keys(taxDataByYear).map(Number).sort((a, b) => b - a)
}
```
```typescript
// validation.ts - replaces lines 46-49
const supportedYears = getSupportedTaxYears()
if (!supportedYears.includes(params.taxYear)) {
	errors.taxYear = `Tax year must be one of: ${supportedYears.join(', ')}`
}
```
**Decision point (Claude's discretion, CONTEXT.md:54):** If the 2025 clone is *deleted*, the only supported/selectable year is 2024 and the dropdown should show only 2024. If the clone is *kept but made non-selectable*, `getSupportedTaxYears()` must intersect with an explicit "selectable" set so 2025 is never offered. **Recommendation:** delete the 2025 clone (`tax-data.ts:68`) - it is fake data ("placeholder until official tables update"), keeping it adds a year to keep non-selectable for no benefit, and YAGNI/CLAUDE.md favor deleting code. After deletion, the dropdown offers only 2024, validation accepts only 2024, default `taxYear: 2024` (already the default in `use-paystub-form.ts:13`) is consistent. `[VERIFIED: tax-data.ts:68, use-paystub-form.ts:13]`

### Anti-Patterns to Avoid
- **Two parallel allow-lists:** The bug exists *because* `states-utils.ts` has an independent `NO_INCOME_TAX_CODES` list while `state-tax-data.ts` has the real data. Do not introduce a second hardcoded "supported states" array - derive it.
- **Silent fallback masquerading as a value:** `getTaxDataForYear(2023)` returning 2024 figures is exactly the lie this phase fixes. Do not add similar `?? someDefault` paths in the selectable surface.
- **Removing the defensive `return 0` and throwing instead:** `calculateStateTax` runs once per pay period inside a `useMemo`; throwing on unknown state would surface as a caught error -> `null` result -> generic toast, a worse UX than the (now-unreachable) defensive 0. CONTEXT.md leaves this to discretion; keep `return 0` with a comment.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Listing supported states/years | A new hardcoded array of CA/NY/IL/PA/MA or [2024] | `Object.keys()` over the existing data tables | A hardcoded list re-creates the exact drift bug being fixed |
| State/year dropdown grouping | Custom `<select>`/`<optgroup>` | Existing shadcn `Select`/`SelectGroup`/`SelectLabel` | Already in `PaystubForm.tsx`; accessible, styled, keyboard-navigable |
| Year membership validation | Regex / range math | `supportedYears.includes(taxYear)` | Set/array membership is the whole requirement (PAYSTUB-03) |
| Tax bracket math | New bracket loop | Existing `calculateStateTax` incremental loop | It already handles progressive (CA/NY) and flat (IL/PA/MA) brackets correctly per existing tests |

**Key insight:** Every part of this phase is about *deleting* an independent source of truth and pointing the consumer at the existing data table. Net lines of code should go DOWN, not up.

## Runtime State Inventory

> This is a string/data-consistency refactor (selectable list <-> data table), so the inventory applies.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **None.** Paystub calculator persists form state to `localStorage` (`use-paystub-persistence.ts`) and to the URL via nuqs (`?year=`, `?state=`). No DB, no server store. A user with a bookmarked/shared URL containing `?year=2023` or `?state=AL` (now-unsupported) exists in the wild. | Verify the URL-restore path (`use-paystub-generator.ts:62-77`) does not crash and that validation now flags the stale year/state instead of silently computing. Recommend: invalid `?year=` should surface the validation error (or fall back to default 2024) rather than throw. |
| Live service config | None - no external service holds paystub state. | None. |
| OS-registered state | None. | None. |
| Secrets/env vars | None - calculator reads no env. | None. |
| Build artifacts | None - pure TS, no codegen/egg-info equivalent. | None. |

**The canonical question:** After the code is fixed, the only "cached old value" surface is a **stale shareable URL** (`?year=2023` or `?state=AL`). This is the one runtime-state consideration the plan must cover: ensure a stale URL degrades gracefully (validation error or default), never a crash and never a silent fake calculation. `[VERIFIED: use-paystub-url-state.ts, use-paystub-generator.ts:62-77]`

## Common Pitfalls

### Pitfall 1: Regressing federal/SS/Medicare calc when editing tax-data.ts
**What goes wrong:** `tax-data.ts` feeds federal AND state-year resolution. `getCurrentTaxData` -> `getTaxDataForYear` is called 4x in `tax-calculations.ts` (federal, SS, medicare, additional-medicare threshold). Deleting the 2025 clone or editing the fallback can change which year federal math uses.
**Why it happens:** The 2025 clone makes `Math.max(availableYears)` = 2025; after deletion it becomes 2024. For any input that *requested* 2025, federal figures are identical today (clone of 2024), so behavior is unchanged - but a test asserting `getTaxDataForYear(2025)` returns data will start returning the fallback (2024) or could need updating.
**How to avoid:** After deleting the 2025 clone, run the full federal suite. Keep `getTaxDataForYear`'s `defaultData = taxDataByYear[2024]` guard (it throws if 2024 is missing - good). Add a unit test: `getTaxDataForYear(2023)` and `getTaxDataForYear(9999)` must NOT silently return a different year's figures in a way the UI can reach (the UI fix + validation makes them unreachable; the lib keeps the fallback as documented defense). `[VERIFIED: tax-calculations.ts:10,81,106,116; tax-data.ts:70-90]`

### Pitfall 2: `selectedState` default of `'TX'` in the calc hook
**What goes wrong:** `usePaystubCalculations` passes `state: selectedState || 'TX'` (`use-paystub-calculations.ts:40`). TX is a no-income-tax state, so the default state-tax is correctly 0. But if a planner "cleans up" TX from anywhere, this default must remain a valid no-tax code.
**Why it happens:** TX is being removed from the *income-tax bracket table* (PAYSTUB-04), NOT from `NO_INCOME_TAX_CODES` (`states-utils.ts:5`) and NOT as a valid state value. The `|| 'TX'` fallback stays valid.
**How to avoid:** Do not touch `NO_INCOME_TAX_CODES` or the `|| 'TX'` fallback. PAYSTUB-04 only deletes the three `flatBrackets(0)` lines in `state-tax-data.ts:120-122`. `[VERIFIED: use-paystub-calculations.ts:40, states-utils.ts:5, state-tax-data.ts:120-122]`

### Pitfall 3: The test that ENCODES the bug as correct behavior
**What goes wrong:** `tests/state-tax-calculations.test.ts:62-78` ("No State Income Tax states") asserts TX and FL return 0 by *passing them to `calculateStateTax` and expecting 0*. After PAYSTUB-04 removes TX/FL from the bracket table, these still pass (TX/FL -> `undefined` -> defensive `return 0`), but the test's *meaning* changes from "TX flat-0 bracket = 0" to "unknown-state defensive fallback = 0". The "Error handling -> unknown states gracefully" test (`:81-89`, state `'XX'`) currently codifies the silent-0 as the contract.
**Why it happens:** These tests were written against the buggy behavior.
**How to avoid:** Update per CONTEXT.md:44-45: rename/recomment the `'XX'` case to "defensive fallback for input the UI cannot produce," NOT "graceful user-facing behavior." Keep TX/FL assertions but document they now exercise the defensive path (the real "no income tax" contract is enforced upstream by `getNoIncomeTaxStates()`). `[VERIFIED: tests/state-tax-calculations.test.ts:61-89]`

### Pitfall 4: Biweekly annualization is correct - do not "fix" it
**What goes wrong:** A planner might think `calculateStateTax` needs to annualize per-period gross. It does not - the caller loops 26 periods accumulating `ytdGross`, and `calculateStateTax` computes the marginal tax on the *current period's* gross given prior YTD (`state-tax-calculations.ts:22, 35-44`). Flat states (IL/PA/MA) multiply the period gross by the flat rate; progressive states (CA/NY) walk brackets against cumulative income. This is verified by existing tests (IL 5000*0.0495=247.5, etc.).
**How to avoid:** Do not modify the bracket loop. PAYSTUB-04 deletes data rows only; PAYSTUB-01 changes which states are *offered*, not how tax is *computed*. `[VERIFIED: state-tax-calculations.test.ts:5-58]`

### Pitfall 5: em/en-dash in new UI copy
**What goes wrong:** New copy ("supports CA, NY, IL, PA, MA" or a "more states coming" note) ships an em-dash/en-dash, violating CLAUDE.md project-wide ban.
**How to avoid:** Use comma, period, hyphen `-`, or "to". The current over-promising string is `description="Generate accurate payroll breakdowns with federal and state tax calculations for any pay period"` in `PaystubCalculatorClient.tsx:168` (passed to `ToolPageLayout`). The page `metadata.description` in `page.tsx:13` is `"Generate detailed payroll breakdowns with federal and state tax calculations. Free paystub calculator for employers and employees."` Both should drop "any pay period"/"accurate ... for any pay period" framing that implies universal state coverage. `[VERIFIED: PaystubCalculatorClient.tsx:168, page.tsx:13; CITED: CLAUDE.md dash ban]`

## Code Examples

### Exact lines to change (verified line numbers)

```typescript
// PaystubForm.tsx:199-202  (PAYSTUB-02) — remove the 2023 dead toggle
// BEFORE:
<SelectItem value="2024">2024</SelectItem>
<SelectItem value="2023">2023</SelectItem>   // <-- DELETE (no 2023 data)
// AFTER (option A, data-driven — preferred):
{getSupportedTaxYears().map(y => (
	<SelectItem key={y} value={String(y)}>{y}</SelectItem>
))}
```

```typescript
// state-tax-data.ts:117-122  (PAYSTUB-04) — remove redundant flat-0 rows
IL: flatBrackets(0.0495),
PA: flatBrackets(0.0307),
MA: flatBrackets(0.0535),
TX: flatBrackets(0),   // <-- DELETE (already in NO_INCOME_TAX_CODES)
FL: flatBrackets(0),   // <-- DELETE
WA: flatBrackets(0)    // <-- DELETE
```

```typescript
// validation.ts:45-49  (PAYSTUB-03) — derive valid years from data
// BEFORE:
const currentYear = new Date().getFullYear()
if (params.taxYear < 2020 || params.taxYear > currentYear + 5) {
	errors.taxYear = `Tax year must be between 2020 and ${currentYear + 5}`
}
// AFTER:
const supportedYears = getSupportedTaxYears() // imported from ./tax-data
if (!supportedYears.includes(params.taxYear)) {
	errors.taxYear = `Tax year must be one of: ${supportedYears.join(', ')}`
}
```

### Proposed regression test (locks PAYSTUB-01 bidirectionally)
```typescript
// tests/state-tax-calculations.test.ts (or a new tests/paystub-state-coverage.test.ts)
import { describe, expect, it } from 'bun:test'
import { getIncomeTaxStates } from '@/lib/paystub-calculator/states-utils'
import { getSupportedIncomeTaxStateCodes } from '@/lib/paystub-calculator/state-tax-data'

describe('PAYSTUB-01: dropdown <-> data parity', () => {
	it('every selectable income-tax state has bracket data and vice versa', () => {
		const selectable = new Set(getIncomeTaxStates().map(s => s.value))
		const withData = new Set(getSupportedIncomeTaxStateCodes())
		// bidirectional: no selectable state lacks data, no data state is unselectable
		expect([...selectable].sort()).toEqual([...withData].sort())
	})
	it('the supported set is exactly CA, NY, IL, PA, MA', () => {
		expect(getIncomeTaxStates().map(s => s.value).sort())
			.toEqual(['CA', 'IL', 'MA', 'NY', 'PA'])
	})
})
```
`[CITED: 11-CONTEXT.md:86 — "A test should assert every selectable income-tax state has bracket data (and vice versa)"]`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dropdown = allow-list independent of data | Dropdown derived from data table | This phase | Cannot drift again |
| Year validation = hardcoded range | Year validation = membership in `Object.keys(taxDataByYear)` | This phase | No silent year fallback reachable from UI |

**Deprecated/outdated:**
- `<SelectItem value="2023">` - no backing data, removed.
- `TX`/`FL`/`WA` `flatBrackets(0)` rows - redundant with `NO_INCOME_TAX_CODES`, removed.
- 2025 clone of 2024 (`tax-data.ts:68`) - fake placeholder; recommend deletion (discretion).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Exact helper names (`getSupportedIncomeTaxStateCodes`, `getSupportedTaxYears`) are suggestions; planner may choose final names | Code Examples, Patterns | None - naming is cosmetic; behavior is locked |
| A2 | Deleting the 2025 clone is the better choice over keeping-it-non-selectable | Pattern 2, State of the Art | Low - CONTEXT.md explicitly leaves this to discretion (CONTEXT.md:54); both satisfy the requirement |
| A3 | Keeping `calculateStateTax`'s `return 0` defensive fallback is acceptable | Anti-Patterns, Pitfall 3 | None - CONTEXT.md:53 lists this as discretion; UI fix makes it unreachable |
| A4 | A stale shared URL `?year=2023`/`?state=AL` should degrade to a validation error or default, not crash | Runtime State Inventory | Medium - if not handled, a bookmarked URL could throw; plan should add a smoke check. Verified the restore path exists (use-paystub-generator.ts:62-77) but its behavior with an invalid year is `[ASSUMED]` until tested |

## Open Questions

1. **Stale shareable-URL behavior with an unsupported `?year=` / `?state=`**
   - What we know: nuqs restores `year`/`state` into form state on mount (`use-paystub-generator.ts:62-77`); validation will now reject an unsupported year.
   - What's unclear: whether an invalid restored year produces a clean validation message (preferred) or an exception path -> `null` result -> generic toast.
   - Recommendation: Add a small smoke assertion (unit or e2e) that loading `?year=2023` yields the default/valid behavior without a crash. Low effort; closes A4.

2. **Whether to add a "more states coming" UI note**
   - What we know: CONTEXT.md:52 marks this as Claude's discretion.
   - Recommendation: A short, dash-free note under the State select ("State income tax supported for CA, NY, IL, PA, MA.") improves honesty with near-zero cost. Optional.

## Environment Availability

> Pure code/config change with no external runtime dependencies beyond the existing toolchain.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun (runtime + test) | build, test:unit | yes | bun@1.3.13 | - |
| Playwright | test:e2e (optional smoke) | yes (configured) | per package.json | Skip e2e; unit + typecheck + build suffice |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

## Validation Architecture

> `.planning/config.json` has no `nyquist_validation` key -> treat as enabled. Test runner: `bun:test`, files in `tests/`.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bun:test (bun@1.3.13) |
| Config file | none dedicated; `tests/setup.ts` auto-mocks `@/env` and `@/lib/logger` |
| Quick run command | `bun test tests/state-tax-calculations.test.ts tests/paystub-validation.test.ts` |
| Full suite command | `bun run test:unit` (= `bun test tests/`) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAYSTUB-01 | Selectable income-tax states === states with bracket data (bidirectional) | unit | `bun test tests/state-tax-calculations.test.ts -t "parity"` | ❌ Wave 0 (new test) |
| PAYSTUB-01 | Supported set is exactly CA,NY,IL,PA,MA | unit | same file | ❌ Wave 0 (new assertion) |
| PAYSTUB-02 | Year dropdown offers only data-backed years (2024); no 2023 item | unit (helper) + e2e smoke | `bun test` on `getSupportedTaxYears()`; Playwright option/text check | ⚠️ partial (existing tools.spec only checks heading) |
| PAYSTUB-02 | A requested year with no data never returns another year's figures via the UI path | unit | `bun test` on validation rejecting 2023 + `getTaxDataForYear(2023)` documented-fallback test | ❌ Wave 0 |
| PAYSTUB-03 | `validatePaystubInputs({taxYear: 2023})` -> `isValid:false`, `errors.taxYear` set | unit | extend `tests/paystub-validation.test.ts` | ✅ file exists, add case |
| PAYSTUB-03 | `validatePaystubInputs({taxYear: 2024})` -> valid | unit | `tests/paystub-validation.test.ts` | ✅ existing valid-base uses 2024 |
| PAYSTUB-04 | TX/FL/WA absent from income-tax bracket table; still 0 via no-tax path | unit | `tests/state-tax-calculations.test.ts` (update comments) | ✅ exists, update meaning |
| (regression) | Federal/SS/Medicare unchanged after tax-data.ts edit | unit | `bun run test:unit` full | ✅ existing federal/period tests |

### Failure Modes (what must be observably prevented)
- **Silent $0 state tax for a taxed state:** prevented by PAYSTUB-01 (state not selectable) + parity test. Observable: dropdown lacks the state; if forced via stale URL, the defensive 0 is documented and unreachable from UI.
- **Silent year fallback:** prevented by PAYSTUB-02 (item removed) + PAYSTUB-03 (validation rejects). Observable: validation error on unsupported year; no 2023 option in DOM.
- **Federal-calc regression:** prevented by running the full unit suite after editing `tax-data.ts` (existing federal/SS/medicare/period tests must stay green).
- **Drift recurrence:** prevented permanently by the bidirectional parity test.

### Sampling Rate
- **Per task commit:** `bun run lint && bun run typecheck && bun test tests/state-tax-calculations.test.ts tests/paystub-validation.test.ts`
- **Per wave merge:** `bun run test:unit`
- **Phase gate:** `bun run lint && bun run typecheck && bun run test:unit && bun run build` (CONTEXT.md:87). Add `bun run test:e2e:fast` only if extending the existing `e2e/tools.spec.ts` paystub block.

### Wave 0 Gaps
- [ ] `tests/state-tax-calculations.test.ts` - add bidirectional parity test + exact-set assertion (PAYSTUB-01); update "unknown state -> 0" and TX/FL cases to document defensive-fallback meaning (PAYSTUB-04).
- [ ] `tests/paystub-validation.test.ts` - add `taxYear: 2023` rejected case and confirm 2024 accepted (PAYSTUB-03).
- [ ] New or existing test - `getSupportedTaxYears()` returns only data-backed years; `getTaxDataForYear(2023)` documented-fallback test (PAYSTUB-02).
- [ ] (optional) `e2e/tools.spec.ts` - assert no `2023` option and that the state list does not contain a known-unsupported state label (e.g., "Alabama") under "State Income Tax".

## Security Domain

> `security_enforcement` is absent in config -> treat as enabled. However this phase has no auth, session, network, crypto, or persistence surface - it is pure client-side arithmetic over a static in-module data table.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A - no auth in this flow |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A - public free tool |
| V5 Input Validation | yes | `validatePaystubInputs` (tightened year check) + Zod `paystubFormSchema`; `taxYear` parsed via `parseInt`/`parseAsInteger` (nuqs). Ensure unsupported-year and 2-letter-state checks remain. |
| V6 Cryptography | no | N/A - no secrets, no hashing |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Crafted `?year=`/`?state=` query param (untrusted URL input) | Tampering | `validatePaystubInputs` rejects unsupported year; state length check (`validation.ts:75`); unsupported state -> defensive 0, not a crash. The phase's main job (reject unbacked inputs) IS the input-validation hardening. |
| `Infinity` in bracket limits serialized to URL/state | n/a | Not user-controllable; `Infinity` lives only in the static data table, never in form/URL state |

No new attack surface is introduced. The phase strictly *narrows* accepted input.

## Sources

### Primary (HIGH confidence)
- Direct read of all files under change: `state-tax-data.ts`, `state-tax-calculations.ts`, `states-utils.ts`, `tax-data.ts`, `validation.ts`, `paystub-utils.ts`, `calculate-paystub-totals.ts`, `tax-calculations.ts` (caller refs), `PaystubForm.tsx`, `PaystubCalculatorClient.tsx`, `page.tsx`, hook family (`use-paystub-*`), `src/data/states.json`, `src/types/paystub.ts`, `src/lib/schemas/paystub.ts`.
- Tests: `tests/state-tax-calculations.test.ts`, `tests/paystub-validation.test.ts`, `tests/z-paystub-calculator.test.ts`, `tests/pay-periods-generation.test.ts`, `tests/csv-export.test.ts`; e2e `e2e/tools.spec.ts`, `e2e/user-flows-validation.spec.ts`.
- Call-site verification via ripgrep (every consumer of the affected exports enumerated).
- `.planning/v6-AUDIT-FINDINGS.md` (findings #1, #2, #4 + 2025-clone note), `.planning/REQUIREMENTS.md` (PAYSTUB-01..04), `11-CONTEXT.md` (locked decisions), `CLAUDE.md` (conventions), `.planning/config.json`, `package.json`.

### Secondary (MEDIUM confidence)
- None needed; no external library behavior is in scope.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new deps; all tools verified in package.json and existing code.
- Architecture: HIGH - exact line numbers and call sites verified by read + grep.
- Pitfalls: HIGH - each pitfall traced to a specific verified line; federal-regression risk confirmed via `getCurrentTaxData` fan-out in `tax-calculations.ts`.

**Call-site completeness (verified, no other consumers):**
- `getIncomeTaxStates` / `getNoIncomeTaxStates`: only `PaystubForm.tsx`. No other affected callers.
- `getStateTaxBrackets`: only `state-tax-calculations.ts`.
- `stateTaxDataByYear`: only within `state-tax-data.ts`.
- `getTaxDataForYear`: only `paystub-utils.ts` (-> `getCurrentTaxData` -> `tax-calculations.ts`).
- `taxDataByYear`: only within `tax-data.ts`.
- `calculateStateTax`: `calculate-paystub-totals.ts` + tests.
- `validatePaystubInputs`: `calculate-paystub-totals.ts`, `use-paystub-calculator.ts`, `use-paystub-validation.ts`, `tests/paystub-validation.test.ts`.

**Research date:** 2026-06-01
**Valid until:** 2026-07-01 (stable internal code; valid until the files change)
