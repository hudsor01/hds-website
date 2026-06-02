# Phase 11: paystub-tax-accuracy - Research

**Researched:** 2026-06-01 (re-researched against official tax authorities + nuqs official docs same day)
**Domain:** Internal TypeScript tax-calculation logic + React/shadcn form UI (Next.js 16 / React 19, Bun + bun:test); tax-table data accuracy
**Confidence:** HIGH for code-internal findings (direct read); HIGH for tax-data verification (primary government sources fetched this session); HIGH for nuqs semantics (official docs).

> **Re-research note (2026-06-01):** The prior version of this file was codebase-internal only - it verified line numbers, call sites, and the single-source-of-truth derivation pattern, but it did NOT verify the actual tax NUMBERS against any authoritative source. This pass adds two new authoritative sections (`## Data Accuracy Verification` and `## Methodology Accuracy`) backed by primary government documents (IRS Rev. Proc. 2023-34, SSA, FTB, NY DTF, IL DOR, PA DOR, Mass.gov) and resolves the nuqs stale-URL open question against official nuqs docs. **Headline finding: the data is worse than the original audit thought. The bug is not only "37 states silently return $0" - the 5 states that DO have data, plus the federal brackets, are materially STALE or WRONG.** See the verdict table below.

## Summary

The paystub calculator advertises "accurate ... federal and state tax calculations for any pay period," but its inputs over-promise AND its underlying numbers are stale. Two layers of problems exist:

1. **Coverage lie (original audit, still valid):** The state dropdown renders all 42 income-tax states while only 5 (CA, NY, IL, PA, MA, plus redundant flat-0 TX/FL/WA) have bracket data. Selecting any of the other 37 returns `undefined` -> `calculateStateTax` -> `return 0`, a confident $0 and inflated net pay. The year dropdown offers "2023" with no 2023 data and silently falls back.

2. **Accuracy lie (NEW finding this pass, not in the original audit):** Of the values that DO exist, verification against official 2024 tables shows the **federal income-tax brackets are 2023 values mislabeled as 2024**, the **California brackets are 2023 values**, the **New York brackets use pre-2023 rates and omit the 9.65%/10.3%/10.9% high-income brackets**, and the **Massachusetts rate (0.0535) is wrong - MA has been a flat 5.0% since 2020**. Only the Social Security wage base / FICA rates, the Illinois flat 4.95%, and the Pennsylvania flat 3.07% match the official 2024 figures.

This changes the shape of the phase. The CONTEXT.md-locked scope (make selectable inputs match the data that exists) is still correct and still the floor. But "the data that exists" is itself inaccurate for federal + CA + NY + MA. The planner must DECIDE whether Phase 11 (a) ships the input-narrowing fix and corrects the federal + CA + NY + MA values to official 2024 figures (recommended - these are the 5 visible states and the federal calc every user hits), or (b) ships only the input-narrowing fix and books a follow-up data-correction task. Either way, the over-promising "accurate" copy cannot stand: even with corrected tables, the engine computes a flat-rate liability estimate, not true payroll withholding (see `## Methodology Accuracy`).

**Primary recommendation:** Treat `stateTaxDataByYear` and `taxDataByYear` as the single source of truth for the *selectable* surface (the CONTEXT.md-locked derivation work), AND correct the four stale value sets (federal, CA, NY, MA) to the official 2024 figures cited below in the same phase. Re-label the UI copy from "accurate" to "estimate," dash-free. Resolve the nuqs stale-URL question: `parseAsInteger`/`parseAsString` pass `?year=2023` / `?state=AL` through unchanged (no built-in allowlist), so the tightened `validatePaystubInputs` is the only thing that catches them - that validation MUST run on the restored URL state, not just on the submit path.

## Data Accuracy Verification (official sources)

> All "code value" entries are read directly from `src/lib/paystub-calculator/tax-data.ts` and `state-tax-data.ts` (this session). All "official 2024 value" entries are from the primary government documents listed in `## Sources`. Match = does the code value equal the official 2024 published value.

### Verdict per value set (one-liner each)

| Value set | Verdict | Confidence |
|-----------|---------|-----------|
| Federal income-tax brackets | **WRONG - code holds 2023 brackets mislabeled as 2024.** Every threshold is a prior-year value. | HIGH `[CITED: IRS Rev. Proc. 2023-34]` |
| Social Security wage base + FICA/Medicare rates | **CORRECT** - $168,600 base, 6.2% SS, 1.45% Medicare, 0.9% additional at $200k/$250k/$125k. | HIGH `[CITED: SSA, IRS Topic 751]` |
| California brackets | **WRONG - code holds 2023 CA brackets.** All thresholds stale; also omits the 1% MHS surtax over $1M (top effective 13.3%). | HIGH `[CITED: FTB 2024 Tax Rate Schedules]` |
| New York brackets | **WRONG - code uses pre-2023 rates (5.9/6.21/6.49/8.82) and is missing the 9.65%/10.3%/10.9% brackets** in effect since 2021. | HIGH `[CITED: NY DTF IT-201-I 2024]` |
| Illinois flat 0.0495 | **CORRECT** - 4.95% flat since 2017. | HIGH `[CITED: IL DOR]` |
| Pennsylvania flat 0.0307 | **CORRECT** - 3.07% flat. | HIGH `[CITED: PA DOR]` |
| Massachusetts flat 0.0535 | **WRONG - MA is a flat 5.0% (0.05).** 0.0535 was the pre-2020 rate. Plus a 4% surtax over $1,053,750 (2024) the code does not model. | HIGH `[CITED: Mass.gov DOR]` |

### Federal income tax brackets - SINGLE (representative; all four statuses are stale the same way)

| Bracket (rate) | Code value (upper limit) | Official 2024 value | Source | Match? |
|----------------|--------------------------|---------------------|--------|--------|
| 10% up to | $11,000 | **$11,600** | IRS RP 2023-34 Table 3 | NO |
| 12% up to | $44,725 | **$47,150** | " | NO |
| 22% up to | $95,375 | **$100,525** | " | NO |
| 24% up to | $182,100 | **$191,950** | " | NO |
| 32% up to | $231,250 | **$243,725** | " | NO |
| 35% up to | $578,125 | **$609,350** | " | NO |
| 37% over | (Infinity) | over $609,350 | " | rate OK, threshold wrong |

The code's single-filer numbers ($11,000 / $44,725 / $95,375 / $182,100 / $231,250 / $578,125) are exactly the **2023** federal brackets (Rev. Proc. 2022-38). MFJ, MFS, and HoH in the code are likewise the 2023 figures. **Action: replace all four federal `federalBrackets` schedules with the official 2024 values** (full official table below). `[CITED: https://www.irs.gov/pub/irs-drop/rp-23-34.pdf]`

**Official 2024 federal brackets (Rev. Proc. 2023-34, Section 3.01, Tables 1-4):**

- **Married filing jointly / qualifying surviving spouse:** 10% to $23,200; 12% to $94,300; 22% to $201,050; 24% to $383,900; 32% to $487,450; 35% to $731,200; 37% over $731,200.
- **Head of household:** 10% to $16,550; 12% to $63,100; 22% to $100,500; 24% to $191,950; 32% to $243,700; 35% to $609,350; 37% over $609,350.
- **Single (unmarried, not surviving spouse/HoH):** 10% to $11,600; 12% to $47,150; 22% to $100,525; 24% to $191,950; 32% to $243,725; 35% to $609,350; 37% over $609,350.
- **Married filing separately:** 10% to $11,600; 12% to $47,150; 22% to $100,525; 24% to $191,950; 32% to $243,725; 35% to $365,600; 37% over $365,600.

> Note the code's `qualifyingSurvivingSpouse` is a copy of MFJ (correct treatment per IRS), and `headOfHousehold` has its own schedule (correct). Only the dollar values are stale.

### Federal payroll constants (CORRECT - no change needed)

| Constant | Code value | Official 2024 | Source | Match? |
|----------|-----------|---------------|--------|--------|
| SS wage base | `168600` | $168,600 | SSA Contribution & Benefit Base | YES |
| SS rate | `0.062` | 6.2% | SSA / IRS Topic 751 | YES |
| Medicare rate | `0.0145` | 1.45% | IRS Topic 751 | YES |
| Additional Medicare rate | `0.009` | 0.9% | IRS Topic 751 | YES |
| Add'l Medicare threshold single / HoH | `200000` | $200,000 | IRS Topic 751 | YES |
| Add'l Medicare threshold MFJ / QSS | `250000` | $250,000 | IRS Topic 751 | YES |
| Add'l Medicare threshold MFS | `125000` | $125,000 | IRS Topic 751 | YES |

`[CITED: https://www.ssa.gov/oact/cola/cbb.html ; https://www.irs.gov/taxtopics/tc751]`

### California - SINGLE / MFS (Schedule X) (representative; all CA schedules are stale)

| Rate | Code upper limit | Official 2024 upper limit | Match? |
|------|------------------|---------------------------|--------|
| 1% | $9,325 | **$10,756** | NO |
| 2% | $22,107 | **$25,499** | NO |
| 4% | $34,892 | **$40,245** | NO |
| 6% | $48,435 | **$55,866** | NO |
| 8% | $61,214 | **$70,606** | NO |
| 9.3% | $312,686 | **$360,659** | NO |
| 10.3% | $375,221 | **$432,787** | NO |
| 11.3% | $625,369 | **$721,314** | NO |
| 12.3% | over | over $721,314 | rate OK, threshold wrong |

The code CA single values ($9,325 / $22,107 / ...) are the **2023** CA brackets. **Action: replace all five CA schedules with the official 2024 FTB Schedule X/Y/Z values** (below). Also note CA levies an additional **1% Mental Health Services Tax on taxable income over $1,000,000** (effective top rate 13.3%) which the code does not model; given this is a withholding *estimate* tool and the threshold is $1M, omitting it is a documented simplification, not a correctness bug for the target user. `[CITED: https://www.ftb.ca.gov/forms/2024/2024-540-tax-rate-schedules.pdf]`

**Official 2024 California (FTB 540 Tax Rate Schedules, page 75):**
- **Schedule X (Single / MFS):** 1% to $10,756; 2% to $25,499; 4% to $40,245; 6% to $55,866; 8% to $70,606; 9.3% to $360,659; 10.3% to $432,787; 11.3% to $721,314; 12.3% over.
- **Schedule Y (MFJ / QSS):** 1% to $21,512; 2% to $50,998; 4% to $80,490; 6% to $111,732; 8% to $141,212; 9.3% to $721,318; 10.3% to $865,574; 11.3% to $1,442,628; 12.3% over.
- **Schedule Z (HoH):** 1% to $21,527; 2% to $51,000; 4% to $65,744; 6% to $81,364; 8% to $96,107; 9.3% to $490,493; 10.3% to $588,593; 11.3% to $980,987; 12.3% over.

### New York - SINGLE / MFS (representative; structure is wrong, not just thresholds)

| Code bracket | Code value | Official 2024 bracket | Official value | Match? |
|--------------|-----------|------------------------|----------------|--------|
| 4% up to | $8,500 | 4% up to | $8,500 | YES |
| 4.5% up to | $11,700 | 4.5% up to | $11,700 | YES |
| 5.25% up to | $13,900 | 5.25% up to | $13,900 | YES |
| **5.9%** up to | $21,400 | **5.5%** up to | $80,650 | NO (wrong rate + range) |
| **6.21%** up to | $80,650 | **6%** up to | $215,400 | NO |
| **6.49%** up to | $215,400 | 6.85% up to | $1,077,550 | NO |
| 6.85% up to | $1,077,550 | **9.65%** up to | $5,000,000 | NO (missing bracket) |
| **8.82%** over | (Infinity) | **10.3%** up to | $25,000,000 | NO |
| - | - | **10.9%** over | $25,000,000 | MISSING |

The code's NY rates (5.9 / 6.21 / 6.49 / 8.82 top) are a **pre-2023** schedule and it is **missing the three high-income brackets (9.65% / 10.3% / 10.9%)** that NY enacted in 2021. **Action: replace all five NY schedules with the official 2024 NY DTF figures** (below). `[CITED: NY DTF Form IT-201-I (2024), New York State tax rate schedule, page 33]`

**Official 2024 New York (IT-201-I, New York State tax rate schedule):**
- **Single / MFS:** 4% to $8,500; 4.5% to $11,700; 5.25% to $13,900; 5.5% to $80,650; 6% to $215,400; 6.85% to $1,077,550; 9.65% to $5,000,000; 10.3% to $25,000,000; 10.9% over.
- **MFJ / QSS:** 4% to $17,150; 4.5% to $23,600; 5.25% to $27,900; 5.5% to $161,550; 6% to $323,200; 6.85% to $2,155,350; 9.65% to $5,000,000; 10.3% to $25,000,000; 10.9% over.
- **HoH:** 4% to $12,800; 4.5% to $17,650; 5.25% to $20,900; 5.5% to $107,650; 6% to $269,300; 6.85% to $1,616,450; 9.65% to $5,000,000; 10.3% to $25,000,000; 10.9% over.

> NY publishes both a "tax rate schedule" (the marginal brackets above) and a separate "tax computation worksheet" with a recapture adjustment for NY AGI over $107,650. The calculator's marginal-bracket engine matches the rate schedule, not the recapture worksheet - acceptable for an estimate (see Methodology), but a reason the output is an estimate, not the filed liability.

### Flat-rate states

| State | Code value | Official 2024 | Source | Match? | Action |
|-------|-----------|---------------|--------|--------|--------|
| IL | `0.0495` | 4.95% flat | IL DOR | YES | none |
| PA | `0.0307` | 3.07% flat | PA DOR | YES | none |
| MA | `0.0535` | **5.0% flat (0.05)** | Mass.gov DOR | **NO** | change to `0.05`; optionally model 4% surtax over $1,053,750 |

MA correction is the clearest single-line fix: `MA: flatBrackets(0.05)`. The 0.0535 rate has not been MA's rate since the 2020 tax year (MA completed its statutory phase-down to a flat 5% on 1 Jan 2020). The 2024 reality is **5.0% on Part B (earned) income, plus a 4% surtax on the portion of taxable income over $1,053,750**. For a per-paycheck estimate aimed at ordinary wage earners, modeling the flat 5% is correct; the >$1.05M surtax is a documented omission. `[CITED: https://www.mass.gov/info-details/massachusetts-4-surtax-on-taxable-income]`

### Net effect on phase scope

The original audit (`v6-AUDIT-FINDINGS.md` #1/#2/#4) scoped Phase 11 as input-narrowing + cleanup + copy. This verification adds a **data-correction dimension the audit missed**:

- **PAYSTUB-01 should expand** to "the *supported* states are exactly CA/NY/IL/PA/MA AND their bracket data is the official 2024 data," not just "the selectable list matches whatever data exists." Shipping the narrowing without correcting CA/NY/MA would leave 3 of the 5 advertised-accurate states materially wrong.
- A **federal-bracket correction task** is warranted regardless of the state work: every single user hits the federal calc, and it currently computes 2023 liability while labeled 2024.
- This is still a self-contained data + logic change in the same files; it adds no dependencies and no new surface. It does enlarge the test matrix (golden-number tests per corrected schedule).

**Recommendation (planner DECIDE):** Fold the federal + CA + NY + MA 2024 corrections into Phase 11. They are cheap (table edits), they are the difference between "honest estimate" and "confidently wrong," and they share the exact files and tests already in scope. If the planner prefers to keep Phase 11 strictly input-narrowing, then a same-milestone `PAYSTUB-05: correct stale 2024 tables` task is mandatory, not optional - the "accurate" copy cannot ship over 2023 numbers.

## Methodology Accuracy

**What the engine does:** `calculateFederalTax` and `calculateStateTax` walk marginal brackets against *cumulative gross pay* (`ytdGross + grossPay`), accumulated period-by-period across 12/24/26/52 periods (`calculate-paystub-totals.ts`). There is **no standard deduction, no W-4 Step-2/3/4 adjustments, no pre-tax deductions (401k/HSA/section-125), no credits, and no state standard deduction/exemption.** Gross pay is treated as taxable income. `[VERIFIED: tax-calculations.ts:25, state-tax-calculations.ts:22]`

**How real payroll withholding works (IRS Pub 15-T percentage method):** An employer annualizes the period wage, **subtracts a standard-deduction-equivalent amount** baked into the W-4 Step-style tables, applies the percentage-method brackets to that *reduced* annualized figure, subtracts tax-credit amounts (W-4 Step 3), then divides back to the period. Withholding is therefore almost always *lower* than the calculator's output for the same gross, because the calculator omits the standard deduction and all W-4 adjustments and taxes gross-from-dollar-one. `[CITED: https://www.irs.gov/pub/irs-pdf/p15t.pdf - Pub 15-T, Percentage Method Tables for Automated Payroll Systems]`

**Two independent accuracy gaps, even with corrected 2024 tables:**
1. **No standard deduction / no W-4 inputs.** The 2024 federal standard deduction is $14,600 single / $29,200 MFJ; the calculator taxes that slice. Result: federal "withholding" is overstated for essentially every realistic wage. State calcs likewise ignore state standard deductions/exemptions (CA, NY, MA all have them).
2. **Marginal-liability model, not a withholding-table model.** Pub 15-T withholding is an estimate of *annual liability spread evenly*; the calculator's per-period marginal walk on cumulative gross is a reasonable annual-liability *approximation* but is not the employer withholding figure and is not the filed return.

**Copy verdict (informs the PAYSTUB-01 / UI-copy decision):** The output **cannot honestly be called "accurate."** Even after correcting the stale tables, it is a *pre-deduction, no-allowance gross-to-marginal-tax estimate*, which will diverge from both an employee's real paystub and their filed return. The copy should say **"estimate"** (e.g. "Estimate your federal and state tax breakdown" / "Estimated take-home pay. Does not include the standard deduction, W-4 allowances, pre-tax deductions, or credits - your actual paycheck will differ.") in dash-free language per CLAUDE.md. This is consistent with, and strengthens, the original audit's instruction to soften the "accurate ... for any pay period" copy. **Confidence: HIGH** - the omission of the standard deduction and W-4 inputs is directly readable in the code and Pub 15-T is unambiguous that withholding incorporates them.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Derive selectable income-tax state list | Browser/Client (lib called from client component) | - | `states-utils.ts` is a pure module imported by `PaystubForm.tsx` (`'use client'`); no server round-trip; data is a static import of `states.json` + in-module `stateTaxDataByYear` |
| Derive selectable / valid tax years | Browser/Client (lib) | - | `tax-data.ts` / `validation.ts` are pure modules; the dropdown and `validatePaystubInputs` run client-side inside React hooks |
| State + federal bracket math | Browser/Client (lib) | - | `calculateStateTax` / `calculateFederalTax` run synchronously inside `usePaystubCalculations` (`useMemo`); no backend |
| Year-data resolution + fallback | Browser/Client (lib) | - | `getTaxDataForYear` / `getCurrentTaxData` resolve in-process |
| Input validation (incl. stale-URL params) | Browser/Client (lib) | - | `validatePaystubInputs` invoked in `use-paystub-validation` and inside `calculatePaystubTotals`; URL params hydrate via nuqs on mount |
| UI copy / metadata | Frontend Server (page metadata) + Client (hero) | - | `page.tsx` exports `metadata` (server); `PaystubCalculatorClient.tsx` passes the description string to `ToolPageLayout` (client) |

**Note:** This entire phase is client-tier pure logic + form UI + static data tables. There is no API route, no DB, no server action. The only server-tier touchpoint is the static `metadata` export in `page.tsx`.

## Standard Stack

No new packages. This phase uses only what is already installed and locked by CLAUDE.md.

### Core (already present)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| bun:test | bun@1.3.x | Unit test runner | `[VERIFIED: package.json]` Project standard; `test:unit` = `bun test tests/` |
| TypeScript (strict) | per tsconfig | Type safety, no `any` | `[CITED: CLAUDE.md]` Strict mode, NO `any`, validate at boundaries with Zod |
| Zod | 4.4.3 | Boundary validation | `[VERIFIED: package.json]` Already used in `src/lib/schemas/paystub.ts` |
| @testing-library/react | installed | Hook tests | `[VERIFIED: tests/z-paystub-calculator.test.ts]` `renderHook`/`act` already used |
| shadcn `Select` | `src/components/ui/select` | State/year dropdowns | `[VERIFIED: PaystubForm.tsx]` `SelectGroup`/`SelectLabel`/`SelectItem` already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nuqs | 2.8.9 | URL state (`year`, `state` query params) | `[VERIFIED: npm view nuqs version -> 2.8.9; matches package.json]` Already wired in `use-paystub-url-state.ts`; relevant because a stale `?year=2023` / `?state=AL` URL must not crash or silently fall back after the fix |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-module `stateTaxDataByYear` object | A separate JSON data file | YAGNI - data is small. Keep it in the TS module so it stays type-checked against `TaxData`. |
| Deriving years from `Object.keys` at call time | A frozen `SUPPORTED_TAX_YEARS` const | Either works; deriving is the single-source-of-truth approach CONTEXT.md mandates. `[CITED: 11-CONTEXT.md:38]` |
| Marginal-bracket engine | A real Pub 15-T percentage-method engine (with std deduction + W-4) | Out of scope and high-effort; the right move is to label output an "estimate," not to rebuild a payroll engine. `[CITED: IRS Pub 15-T]` |

**Installation:** None. `bun install` unchanged.

## Package Legitimacy Audit

**Not applicable.** This phase installs zero external packages. All work uses existing project dependencies (bun:test, TypeScript, Zod, @testing-library/react, shadcn Select, nuqs@2.8.9), all already in `package.json` and exercised by existing code. No `npm install` / `bun add` step is planned. `[VERIFIED: codebase grep - no new imports required; npm view nuqs version confirms 2.8.9 is current]`

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
  derive from -------------> taxDataByYear (federal brackets = STALE 2023!)
  stateTaxDataByYear keys    getTaxDataForYear() [Math.max fallback]
        |                         |
        v                         |
  state-tax-data.ts              |
  stateTaxDataByYear             |
  CA(2023 vals) NY(pre-2023)     |
  IL ok PA ok MA(0.0535 stale)   |
  + TX/FL/WA-0 (remove)          |
  getStateTaxBrackets()          |
        |                         |
        +-----------+-------------+
                    |
            calculate-paystub-totals.ts
            validatePaystubInputs()  <-- (PAYSTUB-03) reject unbacked years; ALSO the only check on stale URL params
                    |  per pay period:
                    v
            calculateStateTax()  <-- `if (!brackets) return 0` collapse
            calculateFederalTax / SocialSecurity / Medicare (getCurrentTaxData -> getTaxDataForYear)
                    |  (no std deduction, no W-4 -> estimate, not withholding)
                    v
            PaystubData.totals  -->  PaystubCalculatorClient renders net pay
```

Data flow for the primary use case: form select -> hook (`usePaystubCalculations` `useMemo`) -> `validatePaystubInputs` -> `calculatePaystubTotals` loops pay periods -> `calculateStateTax`/`calculateFederalTax` -> `getStateTaxBrackets`/`getCurrentTaxData` -> totals -> client render. The bugs live at the **two select widgets** (offer values the data cannot honor), at **`calculateStateTax`'s early return** (hides the gap), AND - new finding - inside **the bracket data itself** (stale federal/CA/NY/MA values).

### Component Responsibilities

| File | Current Responsibility | Change Required |
|------|------------------------|-----------------|
| `src/lib/paystub-calculator/state-tax-data.ts` | `stateTaxDataByYear`, `getStateTaxBrackets`, `flatBrackets` | Remove `TX`/`FL`/`WA` flat-0 (PAYSTUB-04); export helper listing supported state codes (PAYSTUB-01 source); **correct CA to 2024 FTB schedules; correct MA to `0.05`; correct NY to 2024 DTF schedules** (NEW, planner DECIDE whether in-phase) |
| `src/lib/paystub-calculator/states-utils.ts` | `getIncomeTaxStates()` = `states.json` minus `NO_INCOME_TAX_CODES` | Derive list from `stateTaxDataByYear` keys, intersect with `states.json` for labels (PAYSTUB-01). `getNoIncomeTaxStates()` unchanged. |
| `src/lib/paystub-calculator/tax-data.ts` | `taxDataByYear` (2024 + 2025 clone), `getTaxDataForYear` fallback | Decide on 2025 clone (delete or non-selectable); export `getSupportedTaxYears()` (PAYSTUB-02 source); **correct all four `federalBrackets` schedules from stale 2023 to official 2024 figures** (NEW). Keep `Math.max` fallback as documented defense. |
| `src/lib/paystub-calculator/validation.ts` | `validatePaystubInputs` hardcodes `2020..currentYear+5` | Replace with membership check against supported years (PAYSTUB-03). MUST run on URL-restored `taxYear` (see Runtime State Inventory). |
| `src/components/paystub/PaystubForm.tsx` | Year `<SelectItem>` list hardcodes 2024+2023; state optgroups call the two utils | Remove `2023` item (~line 201); ideally render year items from `getSupportedTaxYears()` (PAYSTUB-02). State optgroup auto-fixes via PAYSTUB-01. |
| `src/lib/paystub-calculator/state-tax-calculations.ts` | `calculateStateTax` `if (!stateBrackets) return 0` | Keep `return 0` as documented defensive fallback (Claude's discretion, CONTEXT.md:53); add a comment that the UI can no longer reach it. |
| `PaystubCalculatorClient.tsx` / `page.tsx` | Hero + metadata advertise "accurate ... for any pay period" | Re-label to "estimate" + coverage note, dash-free (Methodology + CLAUDE.md). |

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
const SUPPORTED = new Set(getSupportedIncomeTaxStateCodes())
const INCOME_TAX_STATES_CACHE = statesData.states.filter(s => SUPPORTED.has(s.value))
```
`stateTaxDataByYear` is keyed **year -> stateCode -> brackets** (`state-tax-data.ts:6` `Record<number, StateTaxBrackets>`). Currently only `2024` exists, so the union over years equals the `2024` keys. `[VERIFIED: state-tax-data.ts:4-6]`

### Pattern 2: Derive valid year set, reject the rest
```typescript
// tax-data.ts
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
**Decision point (Claude's discretion, CONTEXT.md:54):** Recommend deleting the 2025 clone (`tax-data.ts:68`) - it is fake data; after the federal 2024 correction the 2025 clone would be a clone of corrected-2024, still not real 2025. After deletion the dropdown offers only 2024, validation accepts only 2024, default `taxYear: 2024` is consistent. `[VERIFIED: tax-data.ts:68]`

### Anti-Patterns to Avoid
- **Two parallel allow-lists:** the bug exists *because* `states-utils.ts` has an independent list while `state-tax-data.ts` has the real data. Derive, don't duplicate.
- **Silent fallback masquerading as a value:** `getTaxDataForYear(2023)` returning 2024 figures is the lie this phase fixes. No new `?? someDefault` paths on the selectable surface.
- **Shipping the narrowing while leaving CA/NY/MA/federal stale:** that would narrow to 5 "supported" states, 3 of which are still materially wrong, under copy you are simultaneously softening. Correct the values or explicitly book the correction task.
- **Removing the defensive `return 0` and throwing instead:** `calculateStateTax` runs per period inside a `useMemo`; throwing surfaces as a generic toast, worse UX than the now-unreachable defensive 0. Keep `return 0` with a comment.
- **Rebuilding a Pub 15-T withholding engine in this phase:** out of scope. The fix for accuracy framing is the word "estimate," not a payroll engine.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Listing supported states/years | A new hardcoded array of CA/NY/IL/PA/MA or [2024] | `Object.keys()` over the existing data tables | A hardcoded list re-creates the exact drift bug being fixed |
| State/year dropdown grouping | Custom `<select>`/`<optgroup>` | Existing shadcn `Select`/`SelectGroup`/`SelectLabel` | Already in `PaystubForm.tsx`; accessible, keyboard-navigable |
| Year membership validation | Regex / range math | `supportedYears.includes(taxYear)` | Set/array membership is the whole requirement (PAYSTUB-03) |
| Stale-URL param validation | Custom query-param sanitizer | The tightened `validatePaystubInputs` + existing 2-letter state check | nuqs passes raw values through (no allowlist); the validator is already the boundary |
| Tax bracket math | New bracket loop | Existing `calculateStateTax`/`calculateFederalTax` incremental loop | It already handles progressive + flat brackets correctly; only the DATA is wrong, not the loop |
| "True" payroll withholding | A Pub 15-T percentage-method engine | Keep the marginal-estimate loop + label "estimate" | Building real withholding (std deduction, W-4 Steps 2-4, credits) is a different project; the honest fix is copy |

**Key insight:** This phase *deletes* an independent source of truth (selectable list) AND *corrects* the values in the single remaining source of truth (the tables). Code count for the structural work goes DOWN; the data-correction work edits values in place (net-neutral lines).

## Runtime State Inventory

> This is a string/data-consistency refactor (selectable list <-> data table) plus a value correction, so the inventory applies.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **None in a DB.** Paystub state persists to `localStorage` (`use-paystub-persistence.ts`) and to the URL via nuqs (`?year=`, `?state=`). A user with a bookmarked/shared URL containing `?year=2023` or `?state=AL` (now-unsupported) exists in the wild. | Verify the URL-restore path (`use-paystub-generator.ts:50-78`) does not crash and that the tightened validation flags the stale year/state. nuqs does NOT validate these (see below) - the validator must. |
| Live service config | None - no external service holds paystub state. | None. |
| OS-registered state | None. | None. |
| Secrets/env vars | None - calculator reads no env. | None. |
| Build artifacts | None - pure TS, no codegen. | None. |

**The canonical question:** After the code is fixed, the only "cached old value" surface is a **stale shareable URL** (`?year=2023` or `?state=AL`). `use-paystub-generator.ts:62-71` applies `urlState.year` directly into `taxYear` (`taxYear: urlState.year ?? prev.taxYear`) and `urlState.state` into `selectedState` (`:73-75`). Because nuqs `parseAsInteger`/`parseAsString` pass these through unchanged (next section), the tightened `validatePaystubInputs` is the ONLY thing that catches them - and only when calc runs. The plan must ensure an invalid restored `taxYear`/`state` surfaces a validation message (or resets to default), never a crash and never a silent fake calculation. `[VERIFIED: use-paystub-url-state.ts:18-32, use-paystub-generator.ts:62-78]`

## Library Behavior: nuqs stale-URL semantics (resolves prior Open Question A4)

`[CITED: https://nuqs.dev/docs/parsers/built-in ; https://nuqs.dev/docs/parsers]` (official docs, nuqs 2.8.9):

- **`parseAsInteger`** transforms the search param with `parseInt(value, 10)`. It does **no range or allowlist validation**. `?year=2023` parses to the integer `2023` and is passed through to the hook state verbatim. A non-numeric value (`?year=abc`) is "invalid for the parser" -> returns the **default value if one is set, otherwise `null`**. The paystub parser sets no default (`year: parseAsInteger`), so `?year=abc` -> `null` -> `urlState.year ?? prev.taxYear` keeps the form default (2024).
- **`parseAsString`** "does not perform any validation when parsing, and will accept **any** value." `?state=AL` passes through as the string `"AL"` unchanged; `?state=ZZ` likewise.
- **Conclusion for A4 (HIGH confidence):** A persisted `?year=2023` is **coerced to a valid integer and passed through** - nuqs will NOT default or reject it. A persisted `?state=AL` is **passed through as-is**. Therefore the ONLY gate is `validatePaystubInputs`: after PAYSTUB-03 it rejects 2023 (year not in supported set) and the existing 2-letter check accepts `AL`'s shape - so `AL` reaches `calculateStateTax`, hits the (now-unreachable-from-UI) defensive `return 0`, and produces a $0 state tax for a shared URL. **Plan implication:** if a shared `?state=AL` link should not silently compute $0, the restore path should additionally reject states not in the supported set (intersect restored `state` with `getSupportedIncomeTaxStateCodes()` + `NO_INCOME_TAX_CODES`), or surface a "state not supported" notice. At minimum, add a smoke test that `?year=2023` yields a validation error / default-2024 behavior without a crash.
- nuqs also exposes `parseAsStringLiteral` / `parseAsNumberLiteral` (validate against a TS literal set) and `parseAsJson` (Standard Schema / Zod). Switching `year`/`state` to a literal/Zod parser would push validation into the parse layer - optional hardening, not required by the locked decisions.

**Next.js 16 / React 19 relevance:** `use-paystub-url-state.ts` and `use-paystub-generator.ts` are `'use client'`; nuqs hydrates query state on mount and the generator's `useEffect` applies it once (`hasInitializedFromUrl` ref guards re-apply). No App Router server boundary is crossed (the hook uses nuqs `shallow: true`, `history: 'replace'`). No Next.js 16 / React 19 change affects this path. `[VERIFIED: use-paystub-url-state.ts:67-72; CITED: nuqs docs]`

## Common Pitfalls

### Pitfall 1: Regressing federal/SS/Medicare calc when editing tax-data.ts
**What goes wrong:** `tax-data.ts` feeds federal AND state-year resolution. `getCurrentTaxData` -> `getTaxDataForYear` is called 4x in `tax-calculations.ts` (federal, SS, medicare, additional-medicare threshold). Editing federal brackets or deleting the 2025 clone can change which year federal math uses.
**Why it happens:** The 2025 clone makes `Math.max(availableYears)` = 2025; after deletion it becomes 2024.
**How to avoid:** After correcting federal brackets, REPLACE the existing federal golden-number tests with values recomputed against the official 2024 brackets - existing federal tests currently assert against the stale 2023 numbers and will (correctly) fail; updating them is part of the correction, not a regression. Keep `getTaxDataForYear`'s `defaultData = taxDataByYear[2024]` guard. `[VERIFIED: tax-calculations.ts:10,81,106,113; tax-data.ts:70-90]`

### Pitfall 2: `selectedState` default of `'TX'` in the calc hook
**What goes wrong:** `usePaystubCalculations` passes `state: selectedState || 'TX'`. TX is a no-income-tax state, so default state-tax is correctly 0.
**How to avoid:** Do not touch `NO_INCOME_TAX_CODES` or the `|| 'TX'` fallback. PAYSTUB-04 only deletes the three `flatBrackets(0)` lines (`state-tax-data.ts:120-122`). `[VERIFIED: states-utils.ts:5, state-tax-data.ts:120-122]`

### Pitfall 3: The test that ENCODES the bug as correct behavior
**What goes wrong:** `tests/.../state-tax-calculations.test.ts` asserts TX/FL/unknown -> 0 by passing them to `calculateStateTax`. After PAYSTUB-04 these still pass via the defensive `return 0`, but the test's *meaning* changes.
**How to avoid:** Update per CONTEXT.md:44-45 - document the `'XX'`/TX/FL cases as "defensive fallback for input the UI cannot produce," not "graceful user-facing behavior."

### Pitfall 4: Bracket loop is correct - do not "fix" it; only the DATA is wrong
**What goes wrong:** A planner might think the incremental bracket loop needs reworking because results look off. The loop is correct (verified by the existing flat-state tests, e.g. IL `5000*0.0495=247.5`). The wrong outputs come from **stale bracket VALUES** (federal/CA/NY/MA), not the algorithm.
**How to avoid:** Correct the data tables; leave `calculateStateTax`/`calculateFederalTax` loops untouched. `[VERIFIED: state-tax-calculations.test.ts existing IL/PA/MA assertions]`

### Pitfall 5: Updating MA tests to 0.05 while leaving the assertion's expected value at the 0.0535 product
**What goes wrong:** Any existing MA test asserting `gross * 0.0535` will break once MA -> 0.05. The expected value must be recomputed (`gross * 0.05`), not the rate reverted.
**How to avoid:** When correcting `MA: flatBrackets(0.05)`, recompute every MA expected value in the tests.

### Pitfall 6: em/en-dash in new UI copy
**What goes wrong:** New "estimate" / coverage copy ships an em-dash/en-dash, violating CLAUDE.md.
**How to avoid:** Use comma, period, hyphen `-`, or "to". The over-promising strings are `description="Generate accurate payroll breakdowns with federal and state tax calculations for any pay period"` (`PaystubCalculatorClient.tsx:168`) and the `metadata.description` in `page.tsx:13`. Both must drop "accurate" and the universal-coverage framing and adopt "estimate." `[VERIFIED: PaystubCalculatorClient.tsx:168, page.tsx:13; CITED: CLAUDE.md dash ban]`

## Code Examples

### Exact lines to change (verified line numbers)

```typescript
// PaystubForm.tsx:~200-201  (PAYSTUB-02) — remove the 2023 dead toggle
// BEFORE:
<SelectItem value="2024">2024</SelectItem>
<SelectItem value="2023">2023</SelectItem>   // <-- DELETE (no 2023 data)
// AFTER (data-driven — preferred):
{getSupportedTaxYears().map(y => (
	<SelectItem key={y} value={String(y)}>{y}</SelectItem>
))}
```

```typescript
// state-tax-data.ts:117-122  (PAYSTUB-04 + MA correction)
IL: flatBrackets(0.0495),  // VERIFIED correct (IL DOR 4.95%)
PA: flatBrackets(0.0307),  // VERIFIED correct (PA DOR 3.07%)
MA: flatBrackets(0.05),    // CORRECTED from 0.0535 — MA is flat 5.0% (Mass.gov DOR)
TX: flatBrackets(0),       // <-- DELETE (already in NO_INCOME_TAX_CODES)
FL: flatBrackets(0),       // <-- DELETE
WA: flatBrackets(0)        // <-- DELETE
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

```typescript
// tax-data.ts — federal single bracket CORRECTION (2023 -> official 2024; do all 4 statuses)
// BEFORE (stale 2023):
single: [
	{ limit: 11000, rate: 0.1 }, { limit: 44725, rate: 0.12 },
	{ limit: 95375, rate: 0.22 }, { limit: 182100, rate: 0.24 },
	{ limit: 231250, rate: 0.32 }, { limit: 578125, rate: 0.35 },
	{ limit: Infinity, rate: 0.37 }
],
// AFTER (official 2024, Rev. Proc. 2023-34 Table 3):
single: [
	{ limit: 11600, rate: 0.1 }, { limit: 47150, rate: 0.12 },
	{ limit: 100525, rate: 0.22 }, { limit: 191950, rate: 0.24 },
	{ limit: 243725, rate: 0.32 }, { limit: 609350, rate: 0.35 },
	{ limit: Infinity, rate: 0.37 }
],
```

### Proposed regression test (locks PAYSTUB-01 bidirectionally + golden tax numbers)
```typescript
// tests/state-tax-calculations.test.ts (or tests/paystub-state-coverage.test.ts)
import { describe, expect, it } from 'bun:test'
import { getIncomeTaxStates } from '@/lib/paystub-calculator/states-utils'
import { getSupportedIncomeTaxStateCodes } from '@/lib/paystub-calculator/state-tax-data'

describe('PAYSTUB-01: dropdown <-> data parity', () => {
	it('every selectable income-tax state has bracket data and vice versa', () => {
		const selectable = new Set(getIncomeTaxStates().map(s => s.value))
		const withData = new Set(getSupportedIncomeTaxStateCodes())
		expect([...selectable].sort()).toEqual([...withData].sort())
	})
	it('the supported set is exactly CA, NY, IL, PA, MA', () => {
		expect(getIncomeTaxStates().map(s => s.value).sort())
			.toEqual(['CA', 'IL', 'MA', 'NY', 'PA'])
	})
})
```
`[CITED: 11-CONTEXT.md:86]` Plus, if the data is corrected, add golden-number tests asserting MA `gross*0.05`, and at least one CA and one NY case computed against the official 2024 schedules above, and one federal single case against official 2024 brackets.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dropdown = allow-list independent of data | Dropdown derived from data table | This phase | Cannot drift again |
| Year validation = hardcoded range | Year validation = membership in `Object.keys(taxDataByYear)` | This phase | No silent year fallback reachable from UI |
| Federal brackets labeled "2024" = actually 2023 | Federal brackets = official 2024 (RP 2023-34) | This phase (NEW) | Federal calc stops being a year stale |
| CA brackets = 2023; NY = pre-2023; MA = 0.0535 | CA/NY = official 2024; MA = flat 0.05 | This phase (NEW, DECIDE) | The 5 advertised states become actually-2024 |
| Copy: "accurate ... for any pay period" | Copy: "estimate ..." dash-free | This phase | Honest framing per Pub 15-T methodology gap |

**Deprecated/outdated:**
- `<SelectItem value="2023">` - no backing data, removed.
- `TX`/`FL`/`WA` `flatBrackets(0)` rows - redundant with `NO_INCOME_TAX_CODES`, removed.
- 2025 clone of 2024 (`tax-data.ts:68`) - fake placeholder; recommend deletion.
- MA rate `0.0535` - pre-2020 rate; corrected to `0.05`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Helper names (`getSupportedIncomeTaxStateCodes`, `getSupportedTaxYears`) are suggestions | Code Examples | None - naming is cosmetic |
| A2 | Deleting the 2025 clone is better than keeping-non-selectable | Pattern 2 | Low - CONTEXT.md:54 leaves to discretion |
| A3 | Keeping `calculateStateTax`'s `return 0` defensive fallback is acceptable | Anti-Patterns | None - CONTEXT.md:53 discretion |
| A4 | (RESOLVED) nuqs passes `?year=2023`/`?state=AL` through unchanged; only `validatePaystubInputs` gates them | Library Behavior | Resolved by official nuqs docs - no longer an assumption |
| A5 | The data corrections (federal/CA/NY/MA) should land in Phase 11 rather than a separate phase | Data Accuracy / Net effect | Medium - this is a scope DECISION for the planner; the alternative (book PAYSTUB-05) is explicitly allowed, but the "accurate"->"estimate" copy must ship regardless |
| A6 | Omitting CA's 1% MHS surtax (>$1M) and MA's 4% surtax (>$1.05M) is acceptable for an "estimate" tool | Data Accuracy | Low for target users (ordinary wage earners); the "estimate" copy covers it |

**If this table is empty:** N/A - assumptions exist and are listed.

## Open Questions

1. **Scope: in-phase data correction vs. follow-up task (A5).**
   - What we know: federal + CA + NY + MA values are stale/wrong vs official 2024; same files/tests as the locked work.
   - Recommendation: fold the corrections into Phase 11. If deferred, a same-milestone `PAYSTUB-05: correct stale 2024 tables` is mandatory; the "estimate" copy ships either way.
2. **Stale shared `?state=AL` URL still computes a silent $0 even after PAYSTUB-03.**
   - What we know: nuqs passes `AL` through; the 2-letter check accepts its shape; it reaches the defensive `return 0`.
   - Recommendation: intersect restored `state` with supported codes + `NO_INCOME_TAX_CODES`, or show a "state not supported" notice; add a smoke test.
3. **Whether to model the CA 1% MHS and MA 4% surtaxes (A6).**
   - Recommendation: skip for now (over-$1M thresholds); document as a known simplification in the "estimate" copy.

## Environment Availability

> Pure code/config/data change with no external runtime dependencies beyond the existing toolchain.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun (runtime + test) | build, test:unit | yes | bun@1.3.x | - |
| Playwright | test:e2e (optional smoke) | yes (configured) | per package.json | Skip e2e; unit + typecheck + build suffice |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

## Validation Architecture

> `.planning/config.json` has no `nyquist_validation` key -> treat as enabled. Test runner: `bun:test`, files in `tests/`.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bun:test (bun@1.3.x) |
| Config file | none dedicated; `tests/setup.ts` auto-mocks `@/env` and `@/lib/logger` |
| Quick run command | `bun test tests/state-tax-calculations.test.ts tests/paystub-validation.test.ts` |
| Full suite command | `bun run test:unit` (= `bun test tests/`) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAYSTUB-01 | Selectable income-tax states === states with bracket data (bidirectional) | unit | `bun test tests/state-tax-calculations.test.ts -t "parity"` | Wave 0 (new) |
| PAYSTUB-01 | Supported set is exactly CA,NY,IL,PA,MA | unit | same file | Wave 0 (new) |
| PAYSTUB-01 (data) | CA single golden case matches official 2024 FTB schedule | unit | `bun test` new CA golden test | Wave 0 (new) |
| PAYSTUB-01 (data) | NY single golden case matches official 2024 DTF schedule | unit | `bun test` new NY golden test | Wave 0 (new) |
| PAYSTUB-01 (data) | MA = flat 0.05 (not 0.0535) | unit | update existing MA assertion | exists, recompute |
| PAYSTUB-02 | Year dropdown offers only data-backed years (2024); no 2023 item | unit + e2e smoke | `bun test` on `getSupportedTaxYears()`; Playwright option check | partial |
| PAYSTUB-02 | A requested year with no data never returns another year's figures via the UI path | unit | validation rejects 2023 + `getTaxDataForYear(2023)` documented-fallback test | Wave 0 |
| PAYSTUB-03 | `validatePaystubInputs({taxYear:2023})` -> invalid | unit | extend `tests/paystub-validation.test.ts` | exists, add case |
| PAYSTUB-03 | restored stale `?year=2023` surfaces error / default, no crash | unit or e2e | new smoke | Wave 0 |
| PAYSTUB-04 | TX/FL/WA absent from income-tax bracket table; still 0 via no-tax path | unit | `tests/state-tax-calculations.test.ts` (update comments) | exists, update meaning |
| (federal data) | Federal single golden case matches official 2024 brackets | unit | recompute existing federal tests to 2024 | exists, MUST update |
| (regression) | Federal/SS/Medicare otherwise unchanged | unit | `bun run test:unit` full | exists |

### Failure Modes (what must be observably prevented)
- **Silent $0 state tax for a taxed state:** prevented by PAYSTUB-01 (not selectable) + parity test; for stale URLs, also intersect restored state with supported codes.
- **Silent year fallback:** prevented by PAYSTUB-02 (item removed) + PAYSTUB-03 (validation rejects).
- **Stale/wrong tax numbers presented as 2024:** prevented by correcting federal/CA/NY/MA tables + golden-number tests against official figures.
- **"Accurate" copy over an estimate engine:** prevented by re-labeling copy to "estimate."
- **Federal-calc regression / drift recurrence:** prevented by full-suite run + the bidirectional parity test.

### Sampling Rate
- **Per task commit:** `bun run lint && bun run typecheck && bun test tests/state-tax-calculations.test.ts tests/paystub-validation.test.ts`
- **Per wave merge:** `bun run test:unit`
- **Phase gate:** `bun run lint && bun run typecheck && bun run test:unit && bun run build` (CONTEXT.md:87). Add `bun run test:e2e:fast` if extending `e2e/tools.spec.ts`.

### Wave 0 Gaps
- [ ] `tests/state-tax-calculations.test.ts` - bidirectional parity test + exact-set assertion (PAYSTUB-01); update "unknown state -> 0"/TX/FL meaning (PAYSTUB-04); recompute MA to 0.05; add CA + NY golden cases vs official 2024.
- [ ] `tests/paystub-validation.test.ts` - add `taxYear:2023` rejected case; confirm 2024 accepted (PAYSTUB-03).
- [ ] Federal golden tests - recompute existing federal assertions against official 2024 brackets (they currently encode stale 2023 and will fail after correction).
- [ ] New/existing test - `getSupportedTaxYears()` returns only data-backed years; `getTaxDataForYear(2023)` documented-fallback test (PAYSTUB-02).
- [ ] (optional) `e2e/tools.spec.ts` - assert no `2023` option; state list lacks a known-unsupported label (e.g. "Alabama"); a `?year=2023` URL does not crash.

## Security Domain

> `security_enforcement` absent in config -> treat as enabled. This phase has no auth, session, network, crypto, or persistence surface - pure client-side arithmetic over a static in-module data table.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A - public free tool |
| V5 Input Validation | yes | `validatePaystubInputs` (tightened year + supported-state check) + Zod `paystubFormSchema`; `taxYear`/`state` arrive via nuqs `parseAsInteger`/`parseAsString` which do NOT validate - the validator is the boundary. |
| V6 Cryptography | no | N/A |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Crafted `?year=`/`?state=` query param (untrusted URL input passed through by nuqs) | Tampering | `validatePaystubInputs` rejects unsupported year; existing 2-letter state shape check; recommend intersecting restored state with supported codes so a crafted `?state=AL` cannot silently yield $0. |
| `Infinity` bracket limits serialized to URL/state | n/a | Not user-controllable; `Infinity` lives only in the static table, never in form/URL state. |

No new attack surface; the phase strictly narrows accepted input.

## Sources

### Primary (HIGH confidence)
- **IRS Rev. Proc. 2023-34** (2024 inflation-adjusted items; Section 3.01 Tax Rate Tables 1-4) - https://www.irs.gov/pub/irs-drop/rp-23-34.pdf - verified the official 2024 federal income-tax brackets for all four filing statuses. Code's "2024" brackets are the prior-year (2023) values.
- **SSA Contribution and Benefit Base** - https://www.ssa.gov/oact/cola/cbb.html - verified 2024 SS wage base $168,600.
- **IRS Topic No. 751 (SS & Medicare withholding rates)** - https://www.irs.gov/taxtopics/tc751 - verified 6.2% SS, 1.45% Medicare, 0.9% Additional Medicare at $200k/$250k/$125k. All match code.
- **California FTB 2024 Tax Rate Schedules** (540 booklet p.75, Schedules X/Y/Z) - https://www.ftb.ca.gov/forms/2024/2024-540-tax-rate-schedules.pdf - verified 2024 CA brackets; code holds 2023 CA values.
- **NY Dept. of Taxation & Finance, Form IT-201-I (2024), "New York State tax rate schedule" (p.33)** - https://www.tax.ny.gov/pdf/2024/inc/it201i_2024.pdf - verified 2024 NY brackets; code uses pre-2023 rates and omits the 9.65%/10.3%/10.9% brackets.
- **Illinois DOR Income Tax Rates** - https://tax.illinois.gov/research/taxrates/income.html - verified 4.95% flat (effective 7/1/2017). Code `0.0495` correct.
- **Pennsylvania DOR Personal Income Tax Rates** - https://www.pa.gov/agencies/revenue/resources/tax-rates/personal-income-tax-rates - verified 3.07% flat. Code `0.0307` correct.
- **Mass.gov DOR - 4% Surtax on Taxable Income / Massachusetts Tax Rates** - https://www.mass.gov/info-details/massachusetts-4-surtax-on-taxable-income - verified MA flat 5.0% (Part B / earned income) + 4% surtax over $1,053,750 (2024). Code `0.0535` is the pre-2020 rate - WRONG.
- **IRS Publication 15-T (Federal Income Tax Withholding Methods, Percentage Method)** - https://www.irs.gov/pub/irs-pdf/p15t.pdf and https://www.irs.gov/publications/p15t - confirms real withholding incorporates a standard-deduction-equivalent and W-4 adjustments the calculator omits -> output is an estimate, not withholding.
- **nuqs official docs (built-in parsers; parsers)** - https://nuqs.dev/docs/parsers/built-in and https://nuqs.dev/docs/parsers - `parseAsInteger` uses `parseInt` base 10 with no range/allowlist validation; `parseAsString` accepts any value; invalid parses return the default (or null). Resolves Open Question A4.
- **Direct read of all files under change** (this session): `tax-data.ts`, `state-tax-data.ts`, `state-tax-calculations.ts`, `tax-calculations.ts`, `calculate-paystub-totals.ts`, `states-utils.ts`, `validation.ts`, `use-paystub-url-state.ts`, `use-paystub-generator.ts`; plus `11-CONTEXT.md`, `v6-AUDIT-FINDINGS.md`, `CLAUDE.md`, `package.json` (nuqs 2.8.9, zod 4.4.3, next 16.2.6, react 19.2.6), `.planning/config.json`.

### Secondary (MEDIUM confidence)
- Cross-confirmation of MA 2024 surtax threshold ($1,053,750) and effective 9% top via Mass.gov news/TIR pages and corroborating practitioner write-ups (Bowditch/Lexology) - used only to corroborate the Mass.gov primary source.

### Tertiary (LOW confidence)
- None relied upon. All numeric claims trace to a primary government source above.

## Metadata

**Confidence breakdown:**
- Code-internal findings (line numbers, call sites, derivation pattern): HIGH - direct read + grep, unchanged from prior pass.
- Tax-data verification (federal, CA, NY, IL, PA, MA, SS/Medicare): HIGH - each value compared against the primary government document fetched this session; the four mismatches (federal, CA, NY, MA) are exact and reproducible.
- Methodology (estimate vs withholding): HIGH - the std-deduction/W-4 omission is directly readable in code; Pub 15-T is unambiguous.
- nuqs semantics: HIGH - official docs explicit on no-validation pass-through + default-on-invalid.

**Research date:** 2026-06-01 (re-research)
**Valid until:** Tax tables - through the 2024 filing context (the 2024 figures themselves do not change); revisit when adding 2025 data (official 2025 federal = RP 2024-40, 2025 SS base $176,100 - out of scope here). Code findings valid until the files change. nuqs semantics valid for 2.8.x.
