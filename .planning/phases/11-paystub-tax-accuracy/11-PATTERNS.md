# Phase 11: paystub-tax-accuracy - Pattern Map

**Mapped:** 2026-06-01
**Files analyzed:** 9 (7 modified + 2 test-modified) + 2 UI-copy files
**Analogs found:** N/A — this is a MODIFY-only phase. Each file's "analog" is the existing in-file pattern the change must mirror or extend (no net-new modules).

## How to read this map

This phase adds no new files. Every change either (a) extends an existing exported function in place, (b) deletes data rows, or (c) adds a test case shaped like the ones already in the file. The "Analog" for each file is therefore the **existing code in the same file** that establishes the convention the new code must follow. Line numbers are verified against the current source (read 2026-06-01).

Project conventions in force (CLAUDE.md + MEMORY.md):
- TypeScript strict, **NO `any`** — derive types from existing data tables, never cast.
- Validate at boundaries with Zod; `validatePaystubInputs` is the runtime gate (not Zod here — it predates the schema and is the call-site `calculatePaystubTotals`/hooks use).
- **No em-dash (—) or en-dash (–) in any user-facing string** — JSX text, `placeholder`, `metadata.description`, `SelectLabel`. Use comma, period, hyphen `-`, or "to". Code comments are exempt.
- Unit tests live in `tests/` and run via `bun:test` (`bun run test:unit` = `bun test tests/`). New test files go in `tests/`, not `tests/unit/` (paystub tests already sit at `tests/state-tax-calculations.test.ts`, `tests/paystub-validation.test.ts`).
- Tabs for indentation (Biome). Single quotes, no semicolons (see every file below).

## File Classification

| Modified File | Role | Data Flow | In-File Analog Pattern | Match Quality |
|---------------|------|-----------|------------------------|---------------|
| `src/lib/paystub-calculator/state-tax-data.ts` | data table + pure derivation | transform | `getStateTaxBrackets` (data-derived lookup, lines 126-136); `flatBrackets` factory (138-146) | exact |
| `src/lib/paystub-calculator/states-utils.ts` | pure function (cached list) | transform | `getNoIncomeTaxStates()` derives `states.json` ∩ a code set (lines 5-18) — mirror this exact shape for the new data-derived income list | exact |
| `src/lib/paystub-calculator/tax-data.ts` | data table + pure derivation | transform | `Object.keys(taxDataByYear)` already used at line 73; `getTaxDataForYear` fallback (70-90) | exact |
| `src/lib/paystub-calculator/validation.ts` | validation | request-response (sync) | the membership-check idiom already used for `validFrequencies` (52-60) and `validFilingStatuses` (63-72) | exact |
| `src/lib/paystub-calculator/state-tax-calculations.ts` | pure function | transform | the defensive `if (!stateBrackets) return 0` guard (lines 12-14) — keep, re-comment | exact |
| `src/components/paystub/PaystubForm.tsx` | form component (client) | request-response | the `.map()` render of `getIncomeTaxStates()` into `<SelectItem>` (223-227) — apply same idiom to the year `<Select>` | exact |
| `tests/state-tax-calculations.test.ts` | test (bun:test) | n/a | existing `describe`/`it`/`expect(...).toBeCloseTo` blocks (lines 1-117) | exact |
| `tests/paystub-validation.test.ts` | test (bun:test) | n/a | `validBase` fixture + `validatePaystubInputs` assertion shape (lines 15-72) | exact |
| `src/app/(public)/tools/paystub-calculator/PaystubCalculatorClient.tsx` | UI copy (client) | n/a | `description=` prop to `ToolPageLayout` (line 168) | exact |
| `src/app/(public)/tools/paystub-calculator/page.tsx` | UI copy (server metadata) | n/a | `metadata.description` (line 13) | exact |

## Pattern Assignments

### `src/lib/paystub-calculator/state-tax-data.ts` (data table + derivation, transform)

**PAYSTUB-04 — delete redundant flat-0 rows.** The bracket table is keyed `year -> stateCode -> StateTaxBrackets` (line 6: `Record<number, StateTaxBrackets>`). Delete exactly three lines (120-122) inside the `2024` table; leave IL/PA/MA flat rows intact:

```typescript
// state-tax-data.ts:117-122 — flat-rate states encoded via the flatBrackets() factory
IL: flatBrackets(0.0495),
PA: flatBrackets(0.0307),
MA: flatBrackets(0.0535),
TX: flatBrackets(0),   // <-- DELETE (TX already in NO_INCOME_TAX_CODES)
FL: flatBrackets(0),   // <-- DELETE
WA: flatBrackets(0)    // <-- DELETE
```

Note the flat vs. bracket encoding contrast the executor must respect:
- **Flat states (IL/PA/MA):** one-liner via `flatBrackets(rate)` — the factory at lines 138-146 returns a single `{ limit: Infinity, rate }` bracket per filing status. This is the analog if PAYSTUB-F1 ever adds another flat state.
- **Bracket states (CA/NY):** full per-filing-status arrays of `{ limit, rate }` ascending, terminating in `{ limit: Infinity, rate }` (CA lines 8-64, NY lines 65-116).

**PAYSTUB-01 source — add a data-derived code list.** Mirror the existing `getStateTaxBrackets` derivation style (it already reads `Object.keys(stateTaxDataByYear)` at line 134). Add a sibling exported helper that unions state codes across all years so it future-proofs for PAYSTUB-F1 (today only `2024` exists, so the union == `2024` keys after PAYSTUB-04 == `['CA','NY','IL','PA','MA']`):

```typescript
// state-tax-data.ts — new export, same module style (no `any`, derive from the table)
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

Existing derivation analog to copy the exact `??` + `Math.max(...Object.keys(...).map(Number))` idiom from:

```typescript
// state-tax-data.ts:126-136 — getStateTaxBrackets (the data-derived lookup analog)
export function getStateTaxBrackets(
	state: string,
	year?: number
): TaxData['federalBrackets'] | undefined {
	const normalizedState = state?.toUpperCase()
	const targetYear = year ?? new Date().getFullYear()
	const yearTable =
		stateTaxDataByYear[targetYear] ??
		stateTaxDataByYear[Math.max(...Object.keys(stateTaxDataByYear).map(Number))]
	return yearTable?.[normalizedState]
}
```

---

### `src/lib/paystub-calculator/states-utils.ts` (pure cached list, transform)

**PAYSTUB-01 — replace the independent allow-list with a data-derived one.** The bug lives here: `INCOME_TAX_STATES_CACHE` (lines 9-11) is computed as `states.json minus NO_INCOME_TAX_CODES`, an allow-list that drifts from the bracket data. The analog to mirror is the SIBLING `getNoIncomeTaxStates()` shape — filter `statesData.states` against a code Set, cache at module scope, return the cache:

```typescript
// states-utils.ts:5-18 — the EXACT shape to mirror for the income list
const NO_INCOME_TAX_CODES = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY']
const NO_INCOME_TAX_STATES_CACHE = statesData.states.filter(state =>
	NO_INCOME_TAX_CODES.includes(state.value)
)
// ...
export function getNoIncomeTaxStates() {
	return NO_INCOME_TAX_STATES_CACHE
}
```

Target change — keep `getNoIncomeTaxStates()` / `NO_INCOME_TAX_CODES` UNCHANGED (Pitfall 2: `selectedState || 'TX'` fallback depends on TX staying a valid no-tax code). Replace only the income cache so it intersects `states.json` with `getSupportedIncomeTaxStateCodes()`:

```typescript
import { getSupportedIncomeTaxStateCodes } from './state-tax-data'

const SUPPORTED_INCOME_TAX_CODES = new Set(getSupportedIncomeTaxStateCodes())
const INCOME_TAX_STATES_CACHE = statesData.states.filter(state =>
	SUPPORTED_INCOME_TAX_CODES.has(state.value)
)
// getIncomeTaxStates() body unchanged — still returns INCOME_TAX_STATES_CACHE
```

`states.json` shape is `{ value, label }` (e.g. `{ "value": "CA", "label": "California" }`) — `state.value` is the 2-letter code, `state.label` is the display name the `<SelectItem>` renders.

---

### `src/lib/paystub-calculator/tax-data.ts` (data table + derivation, transform)

**PAYSTUB-02 source + 2025-clone decision.** The 2025 clone is fake placeholder data (line 68). RESEARCH recommends DELETING it (Assumption A2, CONTEXT.md:54 discretion) so the only data-backed/selectable year is 2024 — consistent with the `taxYear: 2024` default at `use-paystub-form.ts:13`.

```typescript
// tax-data.ts:67-68 — DELETE this clone (recommended) so only data-backed 2024 remains
// 2025 uses 2024 figures as placeholder until official tables update
taxDataByYear[2025] = JSON.parse(JSON.stringify(taxDataByYear[2024])) as TaxData
```

Add a derivation helper using the `Object.keys(taxDataByYear).map(Number)` idiom already present at line 73:

```typescript
// tax-data.ts — new export (mirrors existing Object.keys usage at line 73)
export function getSupportedTaxYears(): number[] {
	return Object.keys(taxDataByYear).map(Number).sort((a, b) => b - a)
}
```

**Keep the `getTaxDataForYear` fallback as documented defense** (Pitfall 1 — it fans out to federal/SS/Medicare 4x in `tax-calculations.ts`; the `defaultData = taxDataByYear[2024]` guard at line 75 throws if 2024 is missing, which is correct). Do NOT remove the `Math.max(...availableYears)` fallback (lines 86-89); it becomes unreachable from the UI once validation rejects unbacked years, so it stays as defense-in-depth:

```typescript
// tax-data.ts:70-90 — the fallback to KEEP (do not delete; now unreachable from UI)
export function getTaxDataForYear(year?: number): TaxData {
	const currentYear = new Date().getFullYear()
	const targetYear = year ?? currentYear
	const availableYears = Object.keys(taxDataByYear).map(Number)
	const defaultData = taxDataByYear[2024]
	if (!defaultData) {
		throw new Error('Missing baseline tax data for 2024')
	}
	// ...
	const fallbackYear = Math.max(...availableYears)
	const fallbackData = taxDataByYear[fallbackYear] ?? defaultData
	return taxDataByYear[targetYear] ?? fallbackData
}
```

---

### `src/lib/paystub-calculator/validation.ts` (validation, sync)

**PAYSTUB-03 — replace the hardcoded range with a membership check.** The analog is already in this same file: `validFrequencies.includes(...)` (52-60) and `validFilingStatuses.includes(...)` (63-72) both validate by membership in a known set. Apply that idiom to `taxYear`, sourcing the set from `getSupportedTaxYears()` instead of an inline literal:

```typescript
// validation.ts:45-49 — BEFORE (hardcoded range, never catches missing data)
const currentYear = new Date().getFullYear()
if (params.taxYear < 2020 || params.taxYear > currentYear + 5) {
	errors.taxYear = `Tax year must be between 2020 and ${currentYear + 5}`
}
```

```typescript
// AFTER — mirrors the validFrequencies/validFilingStatuses membership idiom in this file
import { getSupportedTaxYears } from './tax-data'
const supportedYears = getSupportedTaxYears()
if (!supportedYears.includes(params.taxYear)) {
	errors.taxYear = `Tax year must be one of: ${supportedYears.join(', ')}`
}
```

Membership-check analog to copy verbatim in style:

```typescript
// validation.ts:52-60 — existing membership-validation pattern
const validFrequencies: Array<PaystubCalculationParams['payFrequency']> = [
	'weekly', 'biweekly', 'semimonthly', 'monthly'
]
if (!validFrequencies.includes(params.payFrequency)) {
	errors.payFrequency = 'Invalid pay frequency'
}
```

Leave the 2-letter state length check (lines 74-77) intact — it is the V5 input-validation control noted in RESEARCH's Security Domain.

---

### `src/lib/paystub-calculator/state-tax-calculations.ts` (pure function, transform)

**No behavior change — re-comment only (CONTEXT.md:53, discretion = keep `return 0`).** Keep the defensive guard; update the comment from implying user-facing behavior to documenting an unreachable defensive fallback:

```typescript
// state-tax-calculations.ts:11-14 — keep the guard, change ONLY the comment
const stateBrackets = getStateTaxBrackets(state, year)
if (!stateBrackets) {
	return 0 // Unknown state -> assume no income tax   <-- re-comment as defensive fallback
}
```

Do NOT touch the bracket loop (Pitfall 4 — biweekly YTD annualization is correct; flat states multiply period gross by rate, progressive walk cumulative income against brackets). PAYSTUB-04 deletes data rows only.

---

### `src/components/paystub/PaystubForm.tsx` (form component, client)

**PAYSTUB-02 — remove the dead 2023 item; render years data-driven.** Analog: the state optgroup already renders a list via `.map()` into `<SelectItem>` (lines 223-227). Apply that exact idiom to the year `<Select>`:

```tsx
// PaystubForm.tsx:199-202 — BEFORE
<SelectContent>
	<SelectItem value="2024">2024</SelectItem>
	<SelectItem value="2023">2023</SelectItem>   {/* <-- DELETE: no 2023 data */}
</SelectContent>
```

```tsx
// AFTER — mirror the getIncomeTaxStates().map() render at lines 223-227
import { getSupportedTaxYears } from '@/lib/paystub-calculator/tax-data'
<SelectContent>
	{getSupportedTaxYears().map(y => (
		<SelectItem key={y} value={String(y)}>{y}</SelectItem>
	))}
</SelectContent>
```

State-list render analog (auto-fixes via PAYSTUB-01 — no edit needed here, the optgroup already maps `getIncomeTaxStates()`):

```tsx
// PaystubForm.tsx:221-228 — the .map() render idiom to copy for years
<SelectGroup>
	<SelectLabel>State Income Tax</SelectLabel>
	{getIncomeTaxStates().map(state => (
		<SelectItem key={state.value} value={state.value}>
			{state.label}
		</SelectItem>
	))}
</SelectGroup>
```

Imports block convention (lines 9-23): shadcn `Select*` from `@/components/ui/select`, paystub utils from `@/lib/paystub-calculator/...`, types last. Add the `getSupportedTaxYears` import alongside the existing `states-utils` import.

Optional (CONTEXT.md:52, discretion): a dash-free note under the State `<Select>` such as `State income tax supported for CA, NY, IL, PA, MA.` — comma-separated, no em/en-dash.

---

### `tests/state-tax-calculations.test.ts` (bun:test)

**PAYSTUB-01 — add a bidirectional parity test + exact-set assertion.** Shape it like the existing `describe`/`it`/`expect` blocks in this file (`bun:test` imports at line 1). New block:

```typescript
import { getIncomeTaxStates } from '@/lib/paystub-calculator/states-utils'
import { getSupportedIncomeTaxStateCodes } from '@/lib/paystub-calculator/state-tax-data'

describe('PAYSTUB-01: dropdown <-> data parity', () => {
	it('every selectable income-tax state has bracket data and vice versa', () => {
		const selectable = [...new Set(getIncomeTaxStates().map(s => s.value))].sort()
		const withData = [...new Set(getSupportedIncomeTaxStateCodes())].sort()
		expect(selectable).toEqual(withData)
	})
	it('the supported set is exactly CA, NY, IL, PA, MA', () => {
		expect(getIncomeTaxStates().map(s => s.value).sort())
			.toEqual(['CA', 'IL', 'MA', 'NY', 'PA'])
	})
})
```

**PAYSTUB-04 — re-document the existing TX/FL/`'XX'` cases (do not delete).** These still pass post-change (TX/FL/XX -> `undefined` -> defensive `return 0`), but their MEANING shifts from "flat-0 bracket = 0" to "defensive fallback for input the UI cannot produce." Update the `describe` labels / comments, keep the assertions:

```typescript
// state-tax-calculations.test.ts:61-89 — existing cases whose comments must change meaning
describe('No State Income Tax states', () => {
	it('should return 0 for Texas (no state income tax)', () => {
		const tax = calculateStateTax(5000, 25000, 'TX', 'single')
		expect(tax).toBe(0)   // now exercises the DEFENSIVE path, not a flat-0 bracket
	})
	// ...
})
describe('Error handling', () => {
	it('should handle unknown states gracefully', () => {
		const tax = calculateStateTax(5000, 25000, 'XX', 'single')
		expect(tax).toBe(0)   // defensive fallback for UI-unreachable input
	})
})
```

The flat/progressive math assertions (IL `247.5`, PA `122.8`, MA `267.5`, CA/NY `> 0`, lines 5-58/92-109) are the regression lock — do NOT change them; they must stay green.

---

### `tests/paystub-validation.test.ts` (bun:test)

**PAYSTUB-03 — add the rejected-year case using the existing `validBase` fixture pattern.** The fixture (lines 18-27) already sets `taxYear: 2024` (the valid baseline). Add an `it` mirroring `throws on invalid pay frequency` (51-71):

```typescript
// pattern: spread validBase, override the one field, assert isValid:false + the error key
it('rejects a tax year with no backing data', () => {
	if (!validBase) { return }
	const invalidParams = { ...validBase, taxYear: 2023 }
	const validation = validatePaystubInputs(invalidParams)
	expect(validation.isValid).toBe(false)
	expect(validation.errors.taxYear).toBeDefined()
})
it('accepts the supported tax year 2024', () => {
	if (!validBase) { return }
	expect(validatePaystubInputs(validBase).isValid).toBe(true)
})
```

Existing fixture + assertion analog to copy (note the `if (!validBase) { return }` guard, CLAUDE.md curly-brace rule):

```typescript
// paystub-validation.test.ts:18-27 + 51-65 — fixture and membership-failure assertion shape
validBase = { hourlyRate: 25, hoursPerPeriod: 80, filingStatus: 'single' as const,
	taxYear: 2024, state: 'TX', payFrequency: 'biweekly' as const }
// ...
const invalidParams = { ...validBase, payFrequency: 'quarterly' as unknown as ... }
const validation = validatePaystubInputs(invalidParams)
expect(validation.isValid).toBe(false)
expect(validation.errors.payFrequency).toBeDefined()
```

Optional (closes RESEARCH Open Question 1 / Assumption A4): add a `getSupportedTaxYears()` returns-only-data-backed-years assertion and a `getTaxDataForYear(2023)` documented-fallback test (can live in this file or a new `tests/paystub-tax-years.test.ts`).

---

### UI copy — `PaystubCalculatorClient.tsx` + `page.tsx` (over-promise fix, dash ban)

Both strings imply universal coverage ("for any pay period" / "state tax calculations"). Soften so they do not over-promise now that state coverage is explicitly 5 states. **No em/en-dash** in the replacement.

```tsx
// PaystubCalculatorClient.tsx:168 — passed to ToolPageLayout (client)
description="Generate accurate payroll breakdowns with federal and state tax calculations for any pay period"
```

```typescript
// page.tsx:13 — server metadata.description (keep 120-160 chars for SEO, CLAUDE.md)
description:
	'Generate detailed payroll breakdowns with federal and state tax calculations. Free paystub calculator for employers and employees.',
```

Reminder: `'use client'` files cannot export `metadata` — the metadata edit is in `page.tsx` (server) only; the hero string edit is in `PaystubCalculatorClient.tsx`.

## Shared Patterns

### Single-source-of-truth derivation (the spine of this phase)
**Source:** `state-tax-data.ts:126-136` (`getStateTaxBrackets`) and `tax-data.ts:73` (`Object.keys(taxDataByYear)`).
**Apply to:** `states-utils.ts` (income list), `validation.ts` (valid years), `PaystubForm.tsx` (year items).
**Rule:** A selectable option must be computed FROM the data table that can answer it, never from a parallel allow-list. The bug exists because `states-utils.ts` kept an independent `NO_INCOME_TAX_CODES`-based list. Net lines of code should go DOWN.

### Membership validation
**Source:** `validation.ts:52-60` (`validFrequencies.includes`), `:63-72` (`validFilingStatuses.includes`).
**Apply to:** `validation.ts` `taxYear` check — `supportedYears.includes(params.taxYear)`.

### List -> `<SelectItem>` render
**Source:** `PaystubForm.tsx:215-219` (no-tax states), `:223-227` (income states).
**Apply to:** year `<Select>` (`getSupportedTaxYears().map(...)`).

### bun:test fixture + assertion
**Source:** `tests/paystub-validation.test.ts:18-27` (`validBase` in `beforeEach`), `:33-49` / `:51-71` (`expect(validation.isValid).toBe(false)` + `errors.<field>` defined).
**Apply to:** new PAYSTUB-03 year-rejection cases.

### `flatBrackets` factory for flat-rate states
**Source:** `state-tax-data.ts:138-146`.
**Apply to:** any future flat state (PAYSTUB-F1); for THIS phase it is only relevant in that the 3 deleted rows (TX/FL/WA) used it — IL/PA/MA keep using it.

## No Analog Found

None. Every change extends an existing in-file pattern. No net-new module, route, schema, or service is introduced.

## Regression Guards (do not touch)

| Element | File:Line | Why it must stay |
|---------|-----------|------------------|
| `NO_INCOME_TAX_CODES` + `getNoIncomeTaxStates()` | `states-utils.ts:5-18` | `selectedState \|\| 'TX'` default (`use-paystub-calculations.ts:40`) needs TX as a valid no-tax code (Pitfall 2) |
| `getTaxDataForYear` `Math.max` fallback + 2024 guard | `tax-data.ts:75-89` | Federal/SS/Medicare fan-out (4x in `tax-calculations.ts`); keep as defense-in-depth (Pitfall 1) |
| `calculateStateTax` bracket loop | `state-tax-calculations.ts:16-62` | YTD biweekly annualization is correct; flat vs progressive math is test-locked (Pitfall 4) |
| Flat/progressive math assertions | `tests/state-tax-calculations.test.ts:5-58, 92-109` | The regression lock for IL/PA/MA/CA/NY |
| `paystubFormSchema` | `src/lib/schemas/paystub.ts` | No `taxYear`/`state` field here; year validation lives in `validatePaystubInputs`, not Zod — do not bolt year logic onto the Zod schema |

## Stale-URL consideration (RESEARCH A4 / Open Q1)

`use-paystub-generator.ts:70` restores `taxYear: urlState.year ?? prev.taxYear` from a nuqs `?year=` param. A bookmarked `?year=2023` (or `?state=AL`) must degrade to a validation error or default, never a crash or a silent fake calc. Plan should add a smoke check (unit on the restore path or e2e on `?year=2023`). The defensive `getTaxDataForYear` fallback + tightened `validatePaystubInputs` together make this non-crashing; verify it surfaces cleanly.

## Metadata

**Analog search scope:** `src/lib/paystub-calculator/`, `src/components/paystub/`, `src/app/(public)/tools/paystub-calculator/`, `tests/`, `src/data/states.json`, `src/lib/schemas/paystub.ts`, `src/hooks/use-paystub-*`.
**Files read (full or targeted):** state-tax-data.ts, states-utils.ts, state-tax-calculations.ts, tax-data.ts, validation.ts, PaystubForm.tsx, paystub.ts (schema), states.json, PaystubCalculatorClient.tsx (150-189), page.tsx (1-30), tests/state-tax-calculations.test.ts, tests/paystub-validation.test.ts; grep on use-paystub-form/generator/url-state.
**Pattern extraction date:** 2026-06-01
