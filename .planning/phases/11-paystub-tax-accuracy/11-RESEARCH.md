# Phase 11: paystub-tax-accuracy - Research

**Researched:** 2026-06-01 (re-researched against official tax authorities + nuqs official docs same day); **2026-06-02 (2025 target-year tables added from primary .gov sources)**
**Domain:** Internal TypeScript tax-calculation logic + React/shadcn form UI (Next.js 16 / React 19, Bun + bun:test); tax-table data accuracy
**Confidence:** HIGH for code-internal findings (direct read); HIGH for tax-data verification (primary government sources fetched this session); HIGH for nuqs semantics (official docs).

> **Target-year change (2026-06-02, operator directive):** Phase 11 now implements **OFFICIAL 2025** tax tables, NOT 2024. The selectable/default `taxYear` becomes 2025; the data tables are keyed `2025` with the official 2025 values transcribed from the **## Official 2025 Tables (TARGET YEAR)** section below. That section is the single authoritative implementation source. The older **## Data Accuracy Verification** (2024) section is retained for reference only - it documents what the code currently holds and how it drifted, not what to ship.

> **Re-research note (2026-06-01):** The prior version of this file was codebase-internal only - it verified line numbers, call sites, and the single-source-of-truth derivation pattern, but it did NOT verify the actual tax NUMBERS against any authoritative source. This pass adds two new authoritative sections (`## Data Accuracy Verification` and `## Methodology Accuracy`) backed by primary government documents (IRS Rev. Proc. 2023-34, SSA, FTB, NY DTF, IL DOR, PA DOR, Mass.gov) and resolves the nuqs stale-URL open question against official nuqs docs. **Headline finding: the data is worse than the original audit thought. The bug is not only "37 states silently return $0" - the 5 states that DO have data, plus the federal brackets, are materially STALE or WRONG.** See the verdict table below.

## Summary

The paystub calculator advertises "accurate ... federal and state tax calculations for any pay period," but its inputs over-promise AND its underlying numbers are stale. Two layers of problems exist:

1. **Coverage lie (original audit, still valid):** The state dropdown renders all 42 income-tax states while only 5 (CA, NY, IL, PA, MA, plus redundant flat-0 TX/FL/WA) have bracket data. Selecting any of the other 37 returns `undefined` -> `calculateStateTax` -> `return 0`, a confident $0 and inflated net pay. The year dropdown offers "2023" with no 2023 data and silently falls back.

2. **Accuracy lie (verified this pass):** Of the values that DO exist, the **federal income-tax brackets are 2023 values mislabeled as 2024**, the **California brackets are 2023 values**, the **New York brackets use pre-2023 rates and omit the 9.65%/10.3%/10.9% high-income brackets**, and the **Massachusetts rate (0.0535) is wrong - MA has been a flat 5.0% since 2020**. Only the Social Security wage base / FICA rates, the Illinois flat 4.95%, and the Pennsylvania flat 3.07% match the official figures.

Because the **target year is now 2025**, the implementation does not merely "correct to 2024" - it transcribes the official **2025** tables (IRS Rev. Proc. 2024-40 for federal; SSA 2025 wage base $176,100; FTB 2025 Schedules X/Y/Z; NY IT-201-I 2025 rate schedule; IL 4.95%; PA 3.07%; MA flat 5.0% + 2025 surtax threshold $1,083,150) into a `2025`-keyed data table, with `taxYear` defaulting to 2025. Even with correct 2025 tables, the engine computes a flat-rate liability estimate, not true payroll withholding (see `## Methodology Accuracy`), so the "accurate" copy must still become "estimate."

**Primary recommendation:** Re-key `stateTaxDataByYear` and `taxDataByYear` to **2025** with the official 2025 values in `## Official 2025 Tables (TARGET YEAR)`, set default `taxYear: 2025`, derive the selectable state/year surface from the data (single source of truth), drop the dead 2023 option and the redundant TX/FL/WA flat-0 rows, and re-label UI copy from "accurate" to "estimate" (dash-free). Tighten `validatePaystubInputs` to membership-test the supported years (now `[2025]`); since nuqs `parseAsInteger`/`parseAsString` pass `?year=`/`?state=` through unchanged, that validator is the only gate on stale shared URLs.

## Official 2025 Tables (TARGET YEAR)

> **THIS IS THE AUTHORITATIVE IMPLEMENTATION SOURCE.** The planner transcribes these values into a `2025`-keyed `taxDataByYear` / `stateTaxDataByYear`, default `taxYear: 2025`. Every value below cites a primary government source fetched 2026-06-02. Confidence is HIGH unless explicitly marked. Filing-status keys map to the code's `single`, `marriedJoint`, `marriedSeparate`, `headOfHousehold`, `qualifyingSurvivingSpouse` (QSS = a copy of MFJ, matching the existing code and IRS treatment). Bracket arrays use the code's `{ limit, rate }` shape where `limit` is the bracket's **upper** bound and the top bracket uses `limit: Infinity`.

### Federal income tax brackets 2025 (IRS Rev. Proc. 2024-40, Section 3.01, Tables 1-4)

`[VERIFIED: IRS Rev. Proc. 2024-40 PDF, pp.5-6, fetched 2026-06-02]` `[CITED: https://www.irs.gov/pub/irs-drop/rp-24-40.pdf]`

**Single** (Table 3, Unmarried Individuals other than surviving spouses/HoH):
| Rate | Upper limit (`limit`) |
|------|----------------------|
| 10% | 11925 |
| 12% | 48475 |
| 22% | 103350 |
| 24% | 197300 |
| 32% | 250525 |
| 35% | 626350 |
| 37% | Infinity |

**Married filing jointly / Qualifying surviving spouse** (Table 1):
| Rate | Upper limit |
|------|-------------|
| 10% | 23850 |
| 12% | 96950 |
| 22% | 206700 |
| 24% | 394600 |
| 32% | 501050 |
| 35% | 751600 |
| 37% | Infinity |

**Head of household** (Table 2):
| Rate | Upper limit |
|------|-------------|
| 10% | 17000 |
| 12% | 64850 |
| 22% | 103350 |
| 24% | 197300 |
| 32% | 250500 |
| 35% | 626350 |
| 37% | Infinity |

**Married filing separately** (Table 4):
| Rate | Upper limit |
|------|-------------|
| 10% | 11925 |
| 12% | 48475 |
| 22% | 103350 |
| 24% | 197300 |
| 32% | 250525 |
| 35% | 375800 |
| 37% | Infinity |

> The first six MFS bracket limits match Single exactly; only the 35%/37% split differs (MFS caps at 375800 vs Single 626350). This mirrors the existing code structure - copying Single into MFS and then editing the last threshold is safe.

### Federal standard deduction 2025 (Rev. Proc. 2024-40, Section 2.15)

`[VERIFIED: IRS Rev. Proc. 2024-40 PDF, p.12, fetched 2026-06-02]`

| Filing status | 2025 standard deduction |
|---------------|------------------------|
| Married filing jointly / QSS | $30,000 |
| Head of household | $22,500 |
| Single | $15,000 |
| Married filing separately | $15,000 |

> **Does the engine use the standard deduction?** NO. `calculateFederalTax` (`tax-calculations.ts`) walks the brackets against gross pay with no deduction subtracted (`[VERIFIED: tax-calculations.ts:25; Methodology Accuracy section]`). So the standard-deduction values above are **documentation only** - they are NOT transcribed into any data structure and the `TaxData` shape needs no field for them. They are recorded here because (a) they explain why the tool is an "estimate," and (b) if a future phase adds a standard-deduction step, these are the official 2025 numbers.

### FICA / Medicare 2025

**Social Security wage base 2025 = $176,100** (up from 2024's $168,600). Rate 6.2% (employee). `[VERIFIED: SSA, fetched 2026-06-02]` `[CITED: https://www.ssa.gov/oact/cola/cbb.html ; https://www.ssa.gov/news/press/factsheets/colafacts2025.pdf]`

**Medicare** 1.45%; **Additional Medicare** 0.9% over **$200,000 single / HoH**, **$250,000 MFJ / QSS**, **$125,000 MFS**. These thresholds are **statutory and NOT inflation-indexed** - identical to 2024 and prior years. `[VERIFIED: IRS Topic 751 / Additional Medicare Tax; CITED: https://www.irs.gov/taxtopics/tc751]`

| Constant | 2025 value | Change vs 2024 |
|----------|-----------|----------------|
| `ssWageBase` | `176100` | **CHANGED** (was 168600) |
| `ssRate` | `0.062` | same |
| `medicareRate` | `0.0145` | same |
| `additionalMedicareRate` | `0.009` | same |
| Add'l Medicare threshold single / HoH | `200000` | same (statutory) |
| Add'l Medicare threshold MFJ / QSS | `250000` | same (statutory) |
| Add'l Medicare threshold MFS | `125000` | same (statutory) |

### California 2025 (FTB 2025 California Tax Rate Schedules, Schedules X/Y/Z)

`[VERIFIED: FTB "2025 California Tax Rate Schedules" PDF, fetched 2026-06-02]` `[CITED: https://www.ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf]`

**Schedule X - Single / Married-RDP filing separately** (-> code `single` and `marriedSeparate`):
| Rate | Upper limit |
|------|-------------|
| 1% | 11079 |
| 2% | 26264 |
| 4% | 41452 |
| 6% | 57542 |
| 8% | 72724 |
| 9.3% | 371479 |
| 10.3% | 445771 |
| 11.3% | 742953 |
| 12.3% | Infinity |

**Schedule Y - Married/RDP filing jointly or Qualifying surviving spouse/RDP** (-> code `marriedJoint` and `qualifyingSurvivingSpouse`):
| Rate | Upper limit |
|------|-------------|
| 1% | 22158 |
| 2% | 52528 |
| 4% | 82904 |
| 6% | 115084 |
| 8% | 145448 |
| 9.3% | 742958 |
| 10.3% | 891542 |
| 11.3% | 1485906 |
| 12.3% | Infinity |

**Schedule Z - Head of household** (-> code `headOfHousehold`):
| Rate | Upper limit |
|------|-------------|
| 1% | 22173 |
| 2% | 52530 |
| 4% | 67716 |
| 6% | 83805 |
| 8% | 98990 |
| 9.3% | 505208 |
| 10.3% | 606251 |
| 11.3% | 1010417 |
| 12.3% | Infinity |

**CA 1% Mental Health Services (MHS) surtax over $1,000,000:** still in effect for 2025, top effective rate 13.3%. The **$1,000,000 threshold is statutory and NOT indexed** (Cal. Rev. & Tax. Code 17043) - it stays at exactly $1M for 2025. The calculator does not model the MHS surtax; given it is an estimate tool with a $1M threshold, omitting it is a documented simplification, not a correctness bug for the target user. `[VERIFIED: threshold is fixed at $1,000,000 per statute; CITED: FTB schedules show only the base 12.3% top rate, MHS is added separately]` Confidence on the $1M figure: HIGH (statutory non-indexed).

### New York 2025 (NY DTF Form IT-201-I 2025, "New York State tax rate schedule", page 33)

`[VERIFIED: NY IT-201-I (2025) PDF, p.33, fetched 2026-06-02]` `[CITED: https://www.tax.ny.gov/pdf/current_forms/it/it201i.pdf]`

> **NY 2025 thresholds are UNCHANGED from 2024** - NY does not annually index these brackets; the 9.65% / 10.3% / 10.9% high-income brackets (enacted 2021, currently scheduled through tax year 2027) are present and the thresholds match 2024. So the corrected 2024 NY figures from the reference section equal the 2025 figures.

**Single / Married filing separately** (-> code `single` and `marriedSeparate`):
| Rate | Upper limit |
|------|-------------|
| 4% | 8500 |
| 4.5% | 11700 |
| 5.25% | 13900 |
| 5.5% | 80650 |
| 6% | 215400 |
| 6.85% | 1077550 |
| 9.65% | 5000000 |
| 10.3% | 25000000 |
| 10.9% | Infinity |

**Married filing jointly / Qualifying surviving spouse** (-> code `marriedJoint` and `qualifyingSurvivingSpouse`):
| Rate | Upper limit |
|------|-------------|
| 4% | 17150 |
| 4.5% | 23600 |
| 5.25% | 27900 |
| 5.5% | 161550 |
| 6% | 323200 |
| 6.85% | 2155350 |
| 9.65% | 5000000 |
| 10.3% | 25000000 |
| 10.9% | Infinity |

**Head of household** (-> code `headOfHousehold`):
| Rate | Upper limit |
|------|-------------|
| 4% | 12800 |
| 4.5% | 17650 |
| 5.25% | 20900 |
| 5.5% | 107650 |
| 6% | 269300 |
| 6.85% | 1616450 |
| 9.65% | 5000000 |
| 10.3% | 25000000 |
| 10.9% | Infinity |

> NY also publishes a separate "tax computation worksheet" with a recapture adjustment for NY AGI over $107,650 (IT-201-I 2025, pp.34-35). The calculator's marginal-bracket engine matches the **rate schedule** above, not the recapture worksheet - acceptable for an estimate, but a reason the output is an estimate, not the filed liability. The MFJ thresholds for 5.25% (27,900) and 5.5% (161,550) on the official 2025 schedule supersede the code's stale `27950` / `43000` values.

### Flat-rate states 2025

| State | 2025 rate (`flatBrackets` arg) | Source | Confidence |
|-------|-------------------------------|--------|-----------|
| IL | `0.0495` (4.95% flat, effective 7/1/2017, in force 2025) | IL DOR Income Tax Rates + 2025 IL-700-T booklet | HIGH `[VERIFIED: https://tax.illinois.gov/research/taxrates/income.html ; https://tax.illinois.gov/content/dam/soi/en/web/tax/forms/withholding/documents/2025/il-700-t.pdf]` |
| PA | `0.0307` (3.07% flat, "2004 - Present") | PA DOR Personal Income Tax Rates | HIGH `[VERIFIED: https://www.pa.gov/agencies/revenue/resources/tax-rates/personal-income-tax-rates]` |
| MA | `0.05` (5.0% flat on Part B / earned income) | Mass.gov Circular M 2025 ("at 5.0% effective January 1, 2025") | HIGH `[VERIFIED: https://www.mass.gov/doc/massachusetts-circular-m-income-tax-withholding-tables-at-50-effective-january-1-2025/download]` |

**MA 4% surtax threshold 2025 = $1,083,150** (indexed annually; was $1,053,750 for 2024). 4% surtax applies only to the portion of taxable income above the threshold. The calculator models the flat 5.0% only; the >$1.08M surtax is a documented omission for an estimate tool. `[VERIFIED: Mass.gov, fetched 2026-06-02; CITED: https://www.mass.gov/info-details/massachusetts-4-surtax-on-taxable-income]` Confidence: HIGH.

### 2025 vs 2024 Deltas (what moves from the figures documented in the 2024 reference section)

> "2024 (current research)" = the **official 2024** value the reference section says the code should hold (the corrected figure, not the stale code value). "Changed?" answers whether 2025 differs from official 2024.

| Value | 2024 (official, from reference section) | OFFICIAL 2025 | Source URL | Changed? |
|-------|----------------------------------------|---------------|------------|----------|
| Federal Single 10% upper | 11600 | **11925** | irs.gov/pub/irs-drop/rp-24-40.pdf | YES |
| Federal Single 12% upper | 47150 | **48475** | " | YES |
| Federal Single 22% upper | 100525 | **103350** | " | YES |
| Federal Single 24% upper | 191950 | **197300** | " | YES |
| Federal Single 32% upper | 243725 | **250525** | " | YES |
| Federal Single 35% upper | 609350 | **626350** | " | YES |
| Federal MFJ 10% upper | 23200 | **23850** | " | YES |
| Federal MFJ 12% upper | 94300 | **96950** | " | YES |
| Federal MFJ 22% upper | 201050 | **206700** | " | YES |
| Federal MFJ 24% upper | 383900 | **394600** | " | YES |
| Federal MFJ 32% upper | 487450 | **501050** | " | YES |
| Federal MFJ 35% upper | 731200 | **751600** | " | YES |
| Federal HoH 10% upper | 16550 | **17000** | " | YES |
| Federal HoH 12% upper | 63100 | **64850** | " | YES |
| Federal HoH 22% upper | 100500 | **103350** | " | YES |
| Federal HoH 24% upper | 191950 | **197300** | " | YES |
| Federal HoH 32% upper | 243700 | **250500** | " | YES |
| Federal HoH 35% upper | 609350 | **626350** | " | YES |
| Federal MFS 35% upper | 365600 | **375800** | " | YES |
| Std deduction Single (doc only) | 14600 | **15000** | " | YES |
| Std deduction MFJ (doc only) | 29200 | **30000** | " | YES |
| Std deduction HoH (doc only) | 21900 | **22500** | " | YES |
| SS wage base | 168600 | **176100** | ssa.gov/oact/cola/cbb.html | **YES** |
| SS rate | 0.062 | 0.062 | " | no |
| Medicare rate | 0.0145 | 0.0145 | irs.gov/taxtopics/tc751 | no |
| Add'l Medicare 0.9% thresholds | 200000/250000/125000 | 200000/250000/125000 | " | no (statutory) |
| CA Sch X 1% upper | 10756 | **11079** | ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf | YES |
| CA Sch X 9.3% upper | 360659 | **371479** | " | YES |
| CA Sch X 12.3% start (11.3% upper) | 721314 | **742953** | " | YES |
| CA Sch Y 1% upper | 21512 | **22158** | " | YES |
| CA Sch Z 1% upper | 21527 | **22173** | " | YES |
| CA MHS surtax threshold | 1000000 | 1000000 | statute (non-indexed) | no |
| NY all brackets (Single/MFJ/HoH) | 2024 schedule | **same** | tax.ny.gov/pdf/current_forms/it/it201i.pdf | no (not indexed) |
| NY top rate 10.9% over | 25000000 | 25000000 | " | no |
| IL flat rate | 0.0495 | 0.0495 | tax.illinois.gov/research/taxrates/income.html | no |
| PA flat rate | 0.0307 | 0.0307 | pa.gov .../personal-income-tax-rates | no |
| MA flat rate | 0.05 | 0.05 | mass.gov Circular M 2025 | no |
| MA 4% surtax threshold | 1053750 | **1083150** | mass.gov/info-details/massachusetts-4-surtax-on-taxable-income | YES |

**Headline:** Federal brackets (all statuses) move up ~3-3.5%; SS wage base jumps $168,600 -> **$176,100**; CA brackets index up ~3%; MA surtax threshold rises to $1,083,150. **NY, IL, PA, MA base rate, Medicare, and all the statutory thresholds (Add'l Medicare, CA MHS) are unchanged.**

### Carry-forward (still valid for 2025 targeting)

- **Methodology / "estimate" finding still applies, restated:** the engine taxes gross pay with no standard deduction, no W-4 Step 2/3/4 adjustments, no pre-tax deductions, no credits, and no state standard deduction/exemption. Therefore even with perfect 2025 tables the output is a *pre-deduction, no-allowance marginal-tax estimate*, which overstates real withholding (Pub 15-T bakes in a standard-deduction-equivalent). Copy must say **"estimate,"** dash-free. `[VERIFIED: tax-calculations.ts:25; CITED: IRS Pub 15-T]` (full detail in `## Methodology Accuracy`).
- **nuqs stale-URL semantics unchanged:** `parseAsInteger`/`parseAsString` pass `?year=`/`?state=` through with no allowlist; the only gate is `validatePaystubInputs`. With the target year now 2025, the supported-years set is `[2025]`, so a stale `?year=2024` (or `2023`) shared URL must be rejected/defaulted by the validator, not silently fall back (full detail in `## Library Behavior`).
- **Single-source-of-truth derivation pattern unchanged:** derive the selectable state list from `Object.keys(stateTaxDataByYear[year])` and the selectable years from `Object.keys(taxDataByYear)`; do not maintain a parallel allow-list. **Supported income-tax states remain exactly CA / NY / IL / PA / MA** (the 2025 re-key changes the year, not the state set). `[VERIFIED: state-tax-data.ts; CITED: 11-CONTEXT.md]`

## Data Accuracy Verification (official sources)

> **RETAINED FOR REFERENCE ONLY - 2024 IS NOT THE IMPLEMENTED YEAR.** Per operator directive (2026-06-02), Phase 11's target year is **OFFICIAL 2025** (see `## Official 2025 Tables (TARGET YEAR)` above for the values to ship). This section documents what the code currently holds and how it drifted from official 2024 - it explains the bug, it is not the implementation source. Transcribe the 2025 values, not these 2024 ones.

> All "code value" entries are read directly from `src/lib/paystub-calculator/tax-data.ts` and `state-tax-data.ts` (this session). All "official 2024 value" entries are from the primary government documents listed in `## Sources`. Match = does the code value equal the official 2024 published value.

### Verdict per value set (one-liner each)

| Value set | Verdict | Confidence |
|-----------|---------|-----------|
| Federal income-tax brackets | **WRONG - code holds 2023 brackets mislabeled as 2024.** Every threshold is a prior-year value. | HIGH `[CITED: IRS Rev. Proc. 2023-34]` |
| Social Security wage base + FICA/Medicare rates | **CORRECT for 2024** - $168,600 base, 6.2% SS, 1.45% Medicare, 0.9% additional at $200k/$250k/$125k. (For 2025 the base becomes $176,100.) | HIGH `[CITED: SSA, IRS Topic 751]` |
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

The code's single-filer numbers ($11,000 / $44,725 / $95,375 / $182,100 / $231,250 / $578,125) are exactly the **2023** federal brackets (Rev. Proc. 2022-38). MFJ, MFS, and HoH in the code are likewise the 2023 figures. **For the 2025 target, replace all four federal `federalBrackets` schedules with the official 2025 values in `## Official 2025 Tables`.** `[CITED: https://www.irs.gov/pub/irs-drop/rp-23-34.pdf]`

**Official 2024 federal brackets (Rev. Proc. 2023-34, Section 3.01, Tables 1-4):**

- **Married filing jointly / qualifying surviving spouse:** 10% to $23,200; 12% to $94,300; 22% to $201,050; 24% to $383,900; 32% to $487,450; 35% to $731,200; 37% over $731,200.
- **Head of household:** 10% to $16,550; 12% to $63,100; 22% to $100,500; 24% to $191,950; 32% to $243,700; 35% to $609,350; 37% over $609,350.
- **Single (unmarried, not surviving spouse/HoH):** 10% to $11,600; 12% to $47,150; 22% to $100,525; 24% to $191,950; 32% to $243,725; 35% to $609,350; 37% over $609,350.
- **Married filing separately:** 10% to $11,600; 12% to $47,150; 22% to $100,525; 24% to $191,950; 32% to $243,725; 35% to $365,600; 37% over $365,600.

> Note the code's `qualifyingSurvivingSpouse` is a copy of MFJ (correct treatment per IRS), and `headOfHousehold` has its own schedule (correct). Only the dollar values are stale.

### Federal payroll constants (2024)

| Constant | Code value | Official 2024 | Source | Match? |
|----------|-----------|---------------|--------|--------|
| SS wage base | `168600` | $168,600 | SSA Contribution & Benefit Base | YES (2024) - **2025 is $176,100** |
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

The code CA single values are the **2023** CA brackets. **For the 2025 target, replace all CA schedules with the official 2025 FTB Schedule X/Y/Z values in `## Official 2025 Tables`.** CA levies an additional **1% Mental Health Services Tax on taxable income over $1,000,000** which the code does not model (documented simplification). `[CITED: https://www.ftb.ca.gov/forms/2024/2024-540-tax-rate-schedules.pdf]`

**Official 2024 California (FTB 540 Tax Rate Schedules):**
- **Schedule X (Single / MFS):** 1% to $10,756; 2% to $25,499; 4% to $40,245; 6% to $55,866; 8% to $70,606; 9.3% to $360,659; 10.3% to $432,787; 11.3% to $721,314; 12.3% over.
- **Schedule Y (MFJ / QSS):** 1% to $21,512; 2% to $50,998; 4% to $80,490; 6% to $111,732; 8% to $141,212; 9.3% to $721,318; 10.3% to $865,574; 11.3% to $1,442,628; 12.3% over.
- **Schedule Z (HoH):** 1% to $21,527; 2% to $51,000; 4% to $65,744; 6% to $81,364; 8% to $96,107; 9.3% to $490,493; 10.3% to $588,593; 11.3% to $980,987; 12.3% over.

### New York - SINGLE / MFS (representative; structure is wrong, not just thresholds)

| Code bracket | Code value | Official bracket | Official value | Match? |
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

The code's NY rates are a **pre-2023** schedule missing the three high-income brackets. **For the 2025 target, replace all five NY schedules with the official 2025 NY DTF figures in `## Official 2025 Tables` (which equal the 2024 figures - NY does not index these).** `[CITED: NY DTF Form IT-201-I, New York State tax rate schedule]`

### Flat-rate states

| State | Code value | Official | Source | Match? | Action (2025 target) |
|-------|-----------|---------------|--------|--------|--------|
| IL | `0.0495` | 4.95% flat | IL DOR | YES | keep `0.0495` |
| PA | `0.0307` | 3.07% flat | PA DOR | YES | keep `0.0307` |
| MA | `0.0535` | **5.0% flat (0.05)** | Mass.gov DOR | **NO** | change to `0.05`; surtax threshold for 2025 is $1,083,150 |

MA correction is the clearest single-line fix: `MA: flatBrackets(0.05)`. The 0.0535 rate has not been MA's rate since the 2020 tax year. `[CITED: https://www.mass.gov/info-details/massachusetts-4-surtax-on-taxable-income]`

### Net effect on phase scope

The original audit scoped Phase 11 as input-narrowing + cleanup + copy. The verification + 2025 target add a **data-transcription dimension**:

- **PAYSTUB-01 expands** to "the *supported* states are exactly CA/NY/IL/PA/MA AND their bracket data is the official **2025** data."
- A **federal-bracket transcription task** is warranted regardless of the state work: every user hits the federal calc.
- This is a self-contained data + logic change in the same files; no new dependencies or surface. It enlarges the test matrix (golden-number tests per 2025 schedule).

**Recommendation:** Transcribe the official 2025 tables (federal + CA + NY + IL + PA + MA + SS base) into a `2025`-keyed table, default `taxYear: 2025`. The "accurate" -> "estimate" copy change ships regardless.

## Methodology Accuracy

**What the engine does:** `calculateFederalTax` and `calculateStateTax` walk marginal brackets against *cumulative gross pay* (`ytdGross + grossPay`), accumulated period-by-period across 12/24/26/52 periods (`calculate-paystub-totals.ts`). There is **no standard deduction, no W-4 Step-2/3/4 adjustments, no pre-tax deductions (401k/HSA/section-125), no credits, and no state standard deduction/exemption.** Gross pay is treated as taxable income. `[VERIFIED: tax-calculations.ts:25, state-tax-calculations.ts:22]`

**How real payroll withholding works (IRS Pub 15-T percentage method):** An employer annualizes the period wage, **subtracts a standard-deduction-equivalent amount** baked into the W-4 Step-style tables, applies the percentage-method brackets to that *reduced* annualized figure, subtracts tax-credit amounts (W-4 Step 3), then divides back to the period. Withholding is therefore almost always *lower* than the calculator's output for the same gross. `[CITED: https://www.irs.gov/pub/irs-pdf/p15t.pdf - Pub 15-T, Percentage Method Tables for Automated Payroll Systems]`

**Two independent accuracy gaps, even with correct 2025 tables:**
1. **No standard deduction / no W-4 inputs.** The 2025 federal standard deduction is $15,000 single / $30,000 MFJ; the calculator taxes that slice. Result: federal "withholding" is overstated for essentially every realistic wage. State calcs likewise ignore state standard deductions/exemptions.
2. **Marginal-liability model, not a withholding-table model.** Pub 15-T withholding is an estimate of *annual liability spread evenly*; the calculator's per-period marginal walk on cumulative gross is a reasonable annual-liability *approximation* but is not the employer withholding figure and is not the filed return.

**Copy verdict:** The output **cannot honestly be called "accurate."** Even with correct 2025 tables, it is a *pre-deduction, no-allowance gross-to-marginal-tax estimate*. The copy should say **"estimate"** in dash-free language per CLAUDE.md. **Confidence: HIGH.**

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
| nuqs | 2.8.9 | URL state (`year`, `state` query params) | `[VERIFIED: npm view nuqs version -> 2.8.9; matches package.json]` Already wired in `use-paystub-url-state.ts`; relevant because a stale `?year=2024`/`?state=AL` URL must not crash or silently fall back after the 2025 re-key |

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
  derive from -------------> taxDataByYear (re-key to 2025; default taxYear 2025)
  stateTaxDataByYear keys    getTaxDataForYear() [Math.max fallback]
        |                         |
        v                         |
  state-tax-data.ts              |
  stateTaxDataByYear[2025]       |
  CA/NY/IL/PA/MA official 2025   |
  (remove TX/FL/WA-0)            |
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

Data flow for the primary use case: form select -> hook (`usePaystubCalculations` `useMemo`) -> `validatePaystubInputs` -> `calculatePaystubTotals` loops pay periods -> `calculateStateTax`/`calculateFederalTax` -> `getStateTaxBrackets`/`getCurrentTaxData` -> totals -> client render. The bugs live at the **two select widgets** (offer values the data cannot honor), at **`calculateStateTax`'s early return** (hides the gap), AND inside **the bracket data itself** (stale values, now replaced with official 2025).

### Component Responsibilities

| File | Current Responsibility | Change Required |
|------|------------------------|-----------------|
| `src/lib/paystub-calculator/state-tax-data.ts` | `stateTaxDataByYear`, `getStateTaxBrackets`, `flatBrackets` | Re-key to `2025`; transcribe official 2025 CA (Sch X/Y/Z), NY (2025 schedule), MA `flatBrackets(0.05)`, keep IL `0.0495` / PA `0.0307`; remove `TX`/`FL`/`WA` flat-0 (PAYSTUB-04); export helper listing supported state codes (PAYSTUB-01 source) |
| `src/lib/paystub-calculator/states-utils.ts` | `getIncomeTaxStates()` = `states.json` minus `NO_INCOME_TAX_CODES` | Derive list from `stateTaxDataByYear` keys, intersect with `states.json` for labels (PAYSTUB-01). `getNoIncomeTaxStates()` unchanged. |
| `src/lib/paystub-calculator/tax-data.ts` | `taxDataByYear` (2024 + 2025 clone), `getTaxDataForYear` fallback | Re-key baseline to `2025` with official 2025 federal brackets + `ssWageBase: 176100`; remove the JSON-clone placeholder (the cloned line becomes the real source, no clone needed); export `getSupportedTaxYears()` (PAYSTUB-02 source); update `defaultData`/error guard to reference 2025. Keep `Math.max` fallback as documented defense. |
| `src/lib/paystub-calculator/validation.ts` | `validatePaystubInputs` hardcodes `2020..currentYear+5` | Replace with membership check against supported years `[2025]` (PAYSTUB-03). MUST run on URL-restored `taxYear`. |
| `src/components/paystub/PaystubForm.tsx` | Year `<SelectItem>` list hardcodes 2024+2023; state optgroups call the two utils | Remove `2023` and `2024` items; render year items from `getSupportedTaxYears()` -> `2025` (PAYSTUB-02). State optgroup auto-fixes via PAYSTUB-01. |
| `src/lib/paystub-calculator/state-tax-calculations.ts` | `calculateStateTax` `if (!stateBrackets) return 0` | Keep `return 0` as documented defensive fallback (CONTEXT.md:53); add a comment that the UI can no longer reach it. |
| `PaystubCalculatorClient.tsx` / `page.tsx` | Hero + metadata advertise "accurate ... for any pay period" | Re-label to "estimate" + coverage note, dash-free; reference 2025 if a year appears in copy. |

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
`stateTaxDataByYear` is keyed **year -> stateCode -> brackets**. After the 2025 re-key only `2025` exists, so the union over years equals the `2025` keys. `[VERIFIED: state-tax-data.ts:4-6]`

### Pattern 2: Derive valid year set, reject the rest
```typescript
// tax-data.ts
export function getSupportedTaxYears(): number[] {
	return Object.keys(taxDataByYear).map(Number).sort((a, b) => b - a)
}
```
```typescript
// validation.ts - replaces lines 46-49
const supportedYears = getSupportedTaxYears() // [2025]
if (!supportedYears.includes(params.taxYear)) {
	errors.taxYear = `Tax year must be one of: ${supportedYears.join(', ')}`
}
```
**Decision point (Claude's discretion, CONTEXT.md:54):** With the 2025 re-key, the placeholder 2025-clone line (`tax-data.ts:68`) is deleted; the 2025 entry becomes the real baseline. After the change the dropdown offers only 2025, validation accepts only 2025, default `taxYear: 2025` is consistent. `[VERIFIED: tax-data.ts:68]`

### Anti-Patterns to Avoid
- **Two parallel allow-lists:** the bug exists *because* `states-utils.ts` has an independent list while `state-tax-data.ts` has the real data. Derive, don't duplicate.
- **Silent fallback masquerading as a value:** `getTaxDataForYear(2024)` returning 2025 figures would re-introduce the lie. No new `?? someDefault` paths on the selectable surface.
- **Transcribing 2024 instead of 2025:** the target is official 2025. Use the `## Official 2025 Tables` values, not the 2024 reference figures.
- **Removing the defensive `return 0` and throwing instead:** `calculateStateTax` runs per period inside a `useMemo`; throwing surfaces as a generic toast, worse UX than the now-unreachable defensive 0. Keep `return 0` with a comment.
- **Rebuilding a Pub 15-T withholding engine in this phase:** out of scope. The fix for accuracy framing is the word "estimate," not a payroll engine.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Listing supported states/years | A new hardcoded array of CA/NY/IL/PA/MA or [2025] | `Object.keys()` over the existing data tables | A hardcoded list re-creates the exact drift bug being fixed |
| State/year dropdown grouping | Custom `<select>`/`<optgroup>` | Existing shadcn `Select`/`SelectGroup`/`SelectLabel` | Already in `PaystubForm.tsx`; accessible, keyboard-navigable |
| Year membership validation | Regex / range math | `supportedYears.includes(taxYear)` | Set/array membership is the whole requirement (PAYSTUB-03) |
| Stale-URL param validation | Custom query-param sanitizer | The tightened `validatePaystubInputs` + existing 2-letter state check | nuqs passes raw values through (no allowlist); the validator is already the boundary |
| Tax bracket math | New bracket loop | Existing `calculateStateTax`/`calculateFederalTax` incremental loop | It already handles progressive + flat brackets correctly; only the DATA changes, not the loop |
| "True" payroll withholding | A Pub 15-T percentage-method engine | Keep the marginal-estimate loop + label "estimate" | Building real withholding (std deduction, W-4 Steps 2-4, credits) is a different project; the honest fix is copy |

**Key insight:** This phase *deletes* an independent source of truth (selectable list) AND *re-keys/transcribes* the values in the single remaining source of truth (the tables) to official 2025. Code count for the structural work goes DOWN; the data work replaces values in place.

## Runtime State Inventory

> This is a string/data-consistency refactor (selectable list <-> data table) plus a year re-key + value transcription, so the inventory applies.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **None in a DB.** Paystub state persists to `localStorage` (`use-paystub-persistence.ts`) and to the URL via nuqs (`?year=`, `?state=`). A user with a bookmarked/shared URL containing `?year=2024`, `?year=2023`, or `?state=AL` (now-unsupported) exists in the wild. | Verify the URL-restore path (`use-paystub-generator.ts:50-78`) does not crash and that the tightened validation flags the stale year/state. nuqs does NOT validate these - the validator must. |
| Live service config | None - no external service holds paystub state. | None. |
| OS-registered state | None. | None. |
| Secrets/env vars | None - calculator reads no env. | None. |
| Build artifacts | None - pure TS, no codegen. | None. |

**The canonical question:** After the code is re-keyed to 2025, the only "cached old value" surface is a **stale shareable URL** (`?year=2024`/`?year=2023` or `?state=AL`). Because nuqs `parseAsInteger`/`parseAsString` pass these through unchanged, the tightened `validatePaystubInputs` is the ONLY thing that catches them. The plan must ensure an invalid restored `taxYear`/`state` surfaces a validation message (or resets to default 2025), never a crash and never a silent fake calculation. `[VERIFIED: use-paystub-url-state.ts:18-32, use-paystub-generator.ts:62-78]`

## Library Behavior: nuqs stale-URL semantics (resolves prior Open Question A4)

`[CITED: https://nuqs.dev/docs/parsers/built-in ; https://nuqs.dev/docs/parsers]` (official docs, nuqs 2.8.9):

- **`parseAsInteger`** transforms the search param with `parseInt(value, 10)`. It does **no range or allowlist validation**. `?year=2024` parses to the integer `2024` and is passed through verbatim. A non-numeric value (`?year=abc`) returns the **default value if one is set, otherwise `null`**. The paystub parser sets no default, so `?year=abc` -> `null` -> `urlState.year ?? prev.taxYear` keeps the form default (now 2025).
- **`parseAsString`** "does not perform any validation when parsing, and will accept **any** value." `?state=AL` passes through as the string `"AL"` unchanged.
- **Conclusion for A4 (HIGH confidence):** A persisted `?year=2024` is **coerced to a valid integer and passed through** - nuqs will NOT default or reject it. Therefore the ONLY gate is `validatePaystubInputs`: after PAYSTUB-03 it rejects 2024/2023 (year not in supported set `[2025]`). For a persisted `?state=AL`, the existing 2-letter check accepts its shape, so it reaches `calculateStateTax`'s defensive `return 0` and produces $0 state tax for a shared URL. **Plan implication:** if a shared `?state=AL` link should not silently compute $0, the restore path should additionally reject states not in `getSupportedIncomeTaxStateCodes()` + `NO_INCOME_TAX_CODES`, or surface a "state not supported" notice. At minimum, add a smoke test that `?year=2024` yields a validation error / default-2025 behavior without a crash.
- nuqs also exposes `parseAsStringLiteral` / `parseAsNumberLiteral` (validate against a TS literal set) and `parseAsJson` (Standard Schema / Zod) - optional hardening, not required by the locked decisions.

**Next.js 16 / React 19 relevance:** `use-paystub-url-state.ts` and `use-paystub-generator.ts` are `'use client'`; nuqs hydrates query state on mount and the generator's `useEffect` applies it once (`hasInitializedFromUrl` ref guards re-apply). No App Router server boundary is crossed (`shallow: true`, `history: 'replace'`). `[VERIFIED: use-paystub-url-state.ts:67-72; CITED: nuqs docs]`

## Common Pitfalls

### Pitfall 1: Regressing federal/SS/Medicare calc when editing tax-data.ts
**What goes wrong:** `tax-data.ts` feeds federal AND state-year resolution. `getCurrentTaxData` -> `getTaxDataForYear` is called 4x in `tax-calculations.ts` (federal, SS, medicare, additional-medicare threshold). Re-keying to 2025 changes which year federal math uses and the SS wage base ($168,600 -> $176,100).
**Why it happens:** The 2024 entry / 2025 clone make `Math.max(availableYears)` ambiguous; after the 2025 re-key it becomes 2025.
**How to avoid:** After transcribing 2025 brackets + `ssWageBase: 176100`, REPLACE the federal golden-number tests with values recomputed against the official 2025 brackets and the 2025 wage base. Update `getTaxDataForYear`'s `defaultData`/error guard to reference 2025, not 2024. `[VERIFIED: tax-calculations.ts:10,81,106,113; tax-data.ts:70-90]`

### Pitfall 2: `selectedState` default of `'TX'` in the calc hook
**What goes wrong:** `usePaystubCalculations` passes `state: selectedState || 'TX'`. TX is a no-income-tax state, so default state-tax is correctly 0.
**How to avoid:** Do not touch `NO_INCOME_TAX_CODES` or the `|| 'TX'` fallback. PAYSTUB-04 only deletes the three `flatBrackets(0)` lines. `[VERIFIED: states-utils.ts:5, state-tax-data.ts:120-122]`

### Pitfall 3: The test that ENCODES the bug as correct behavior
**What goes wrong:** `tests/.../state-tax-calculations.test.ts` asserts TX/FL/unknown -> 0 by passing them to `calculateStateTax`. After PAYSTUB-04 these still pass via the defensive `return 0`, but the test's *meaning* changes.
**How to avoid:** Update per CONTEXT.md:44-45 - document the `'XX'`/TX/FL cases as "defensive fallback for input the UI cannot produce," not "graceful user-facing behavior."

### Pitfall 4: Bracket loop is correct - do not "fix" it; only the DATA changes
**What goes wrong:** A planner might think the incremental bracket loop needs reworking. The loop is correct (verified by flat-state tests, e.g. IL `5000*0.0495=247.5`). Wrong outputs came from **stale bracket VALUES**, now replaced with official 2025.
**How to avoid:** Transcribe the data tables; leave `calculateStateTax`/`calculateFederalTax` loops untouched. `[VERIFIED: state-tax-calculations.test.ts existing IL/PA/MA assertions]`

### Pitfall 5: Updating MA tests to 0.05 while leaving the assertion's expected value at the 0.0535 product
**What goes wrong:** Any existing MA test asserting `gross * 0.0535` breaks once MA -> 0.05. The expected value must be recomputed (`gross * 0.05`), not the rate reverted.
**How to avoid:** When setting `MA: flatBrackets(0.05)`, recompute every MA expected value in the tests.

### Pitfall 6: em/en-dash in new UI copy
**What goes wrong:** New "estimate" / coverage copy ships an em-dash/en-dash, violating CLAUDE.md.
**How to avoid:** Use comma, period, hyphen `-`, or "to". The over-promising strings are `description="Generate accurate payroll breakdowns with federal and state tax calculations for any pay period"` (`PaystubCalculatorClient.tsx:168`) and the `metadata.description` in `page.tsx:13`. Both must drop "accurate" and the universal-coverage framing and adopt "estimate." `[VERIFIED: PaystubCalculatorClient.tsx:168, page.tsx:13; CITED: CLAUDE.md dash ban]`

### Pitfall 7: Mixing up Single vs MFS at the top federal bracket (2025)
**What goes wrong:** For 2025 the first six Single and MFS limits are identical; only the 35%/37% split differs (Single caps 35% at 626350, MFS at 375800). Copy-pasting Single into MFS and forgetting to lower the last threshold over-taxes high MFS earners.
**How to avoid:** After copying, edit MFS row 6 to `{ limit: 375800, rate: 0.35 }`. `[VERIFIED: RP 2024-40 Table 4]`

## Code Examples

### Exact lines to change (verified line numbers; 2025 target)

```typescript
// PaystubForm.tsx:~200-201  (PAYSTUB-02) — remove dead/old year toggles
// BEFORE:
<SelectItem value="2024">2024</SelectItem>
<SelectItem value="2023">2023</SelectItem>   // <-- DELETE (no 2023 data)
// AFTER (data-driven — preferred):
{getSupportedTaxYears().map(y => (
	<SelectItem key={y} value={String(y)}>{y}</SelectItem>
))}   // renders 2025 only
```

```typescript
// state-tax-data.ts  (re-key to 2025 + PAYSTUB-04 + MA correction)
const stateTaxDataByYear: Record<number, StateTaxBrackets> = {
	2025: {
		CA: { /* Schedule X -> single & marriedSeparate; Schedule Y -> marriedJoint & qss; Schedule Z -> headOfHousehold (values from ## Official 2025 Tables) */ },
		NY: { /* 2025 schedule, all five statuses (## Official 2025 Tables) */ },
		IL: flatBrackets(0.0495),  // 4.95% (IL DOR, 2025)
		PA: flatBrackets(0.0307),  // 3.07% (PA DOR, 2025)
		MA: flatBrackets(0.05)     // 5.0% (Mass.gov Circular M 2025) — was 0.0535
		// TX/FL/WA flatBrackets(0) rows REMOVED (PAYSTUB-04; already in NO_INCOME_TAX_CODES)
	}
}
```

```typescript
// tax-data.ts — federal SINGLE bracket for 2025 (RP 2024-40 Table 3); do all 5 statuses
single: [
	{ limit: 11925, rate: 0.1 }, { limit: 48475, rate: 0.12 },
	{ limit: 103350, rate: 0.22 }, { limit: 197300, rate: 0.24 },
	{ limit: 250525, rate: 0.32 }, { limit: 626350, rate: 0.35 },
	{ limit: Infinity, rate: 0.37 }
],
// ssWageBase: 176100  (SSA 2025)  <-- changed from 168600
```

```typescript
// validation.ts:45-49  (PAYSTUB-03) — derive valid years from data
// AFTER:
const supportedYears = getSupportedTaxYears() // [2025]
if (!supportedYears.includes(params.taxYear)) {
	errors.taxYear = `Tax year must be one of: ${supportedYears.join(', ')}`
}
```

### Proposed regression test (locks PAYSTUB-01 bidirectionally + golden 2025 tax numbers)
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
`[CITED: 11-CONTEXT.md:86]` Plus golden-number tests: MA `gross*0.05`, IL `gross*0.0495`, at least one CA and one NY case computed against the official 2025 schedules, and one federal single case against official 2025 brackets (e.g. taxable 50000 single 2025: 10%*11925 + 12%*(48475-11925) + 22%*(50000-48475) = 1192.50 + 4386.00 + 335.50 = 5914.00).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dropdown = allow-list independent of data | Dropdown derived from data table | This phase | Cannot drift again |
| Year validation = hardcoded range | Year validation = membership in `Object.keys(taxDataByYear)` (`[2025]`) | This phase | No silent year fallback reachable from UI |
| Federal brackets labeled "2024" = actually 2023 | Federal brackets = official **2025** (RP 2024-40) | This phase | Federal calc is current-year |
| SS wage base 168600 | SS wage base **176100** (2025) | This phase | FICA cap correct for 2025 |
| CA 2023 brackets; NY pre-2023; MA 0.0535 | CA/NY = official 2025; MA = flat 0.05 | This phase | The 5 supported states are official 2025 |
| Copy: "accurate ... for any pay period" | Copy: "estimate ..." dash-free | This phase | Honest framing per Pub 15-T methodology gap |

**Deprecated/outdated:**
- `<SelectItem value="2023">` and `value="2024"` - no current backing data, replaced by 2025-only.
- `TX`/`FL`/`WA` `flatBrackets(0)` rows - redundant with `NO_INCOME_TAX_CODES`, removed.
- 2025-clone-of-2024 placeholder (`tax-data.ts:68`) - becomes the real 2025 baseline; clone line deleted.
- MA rate `0.0535` - pre-2020 rate; corrected to `0.05`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Helper names (`getSupportedIncomeTaxStateCodes`, `getSupportedTaxYears`) are suggestions | Code Examples | None - naming is cosmetic |
| A2 | Deleting the 2025-clone placeholder and making 2025 the real baseline is the cleanest re-key | Pattern 2 | Low - CONTEXT.md:54 leaves to discretion |
| A3 | Keeping `calculateStateTax`'s `return 0` defensive fallback is acceptable | Anti-Patterns | None - CONTEXT.md:53 discretion |
| A4 | (RESOLVED) nuqs passes `?year=`/`?state=` through unchanged; only `validatePaystubInputs` gates them | Library Behavior | Resolved by official nuqs docs |
| A5 | NY 2025 brackets equal NY 2024 brackets (NY does not index these; high-income brackets scheduled through 2027) | Official 2025 Tables / NY | Low - verified directly from IT-201-I (2025) p.33 fetched this session; both years read identical |
| A6 | Omitting CA's 1% MHS surtax (>$1M) and MA's 4% surtax (>$1,083,150) is acceptable for an "estimate" tool | Official 2025 Tables | Low for target users (ordinary wage earners); the "estimate" copy covers it |
| A7 | CA MHS $1,000,000 threshold is statutory and not indexed for 2025 | Official 2025 Tables / CA | Low - the $1M figure is fixed in Cal. R&T Code 17043; not present on the FTB rate-schedule PDF (added separately) |

**If this table is empty:** N/A - assumptions exist and are listed.

## Open Questions

1. **Stale shared `?state=AL` URL still computes a silent $0 even after PAYSTUB-03.**
   - What we know: nuqs passes `AL` through; the 2-letter check accepts its shape; it reaches the defensive `return 0`.
   - Recommendation: intersect restored `state` with supported codes + `NO_INCOME_TAX_CODES`, or show a "state not supported" notice; add a smoke test.
2. **Whether to model the CA 1% MHS and MA 4% surtaxes (A6).**
   - Recommendation: skip for now (over-$1M / over-$1.08M thresholds); document as a known simplification in the "estimate" copy.
3. **Whether to retain a multi-year table or keep 2025-only.**
   - What we know: CONTEXT.md leaves the year shape to discretion; only 2025 is the target.
   - Recommendation: ship 2025-only now (default 2025, validation `[2025]`); the derive-from-data pattern makes adding 2026 later a one-entry change.

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
| PAYSTUB-01 (data) | CA single golden case matches official 2025 FTB Schedule X | unit | `bun test` new CA golden test | Wave 0 (new) |
| PAYSTUB-01 (data) | NY single golden case matches official 2025 DTF schedule | unit | `bun test` new NY golden test | Wave 0 (new) |
| PAYSTUB-01 (data) | MA = flat 0.05 (not 0.0535) | unit | update existing MA assertion | exists, recompute |
| PAYSTUB-02 | Year dropdown offers only data-backed years (2025); no 2023/2024 item | unit + e2e smoke | `bun test` on `getSupportedTaxYears()`; Playwright option check | partial |
| PAYSTUB-02 | A requested year with no data never returns another year's figures via the UI path | unit | validation rejects 2024/2023 + `getTaxDataForYear(2024)` documented-fallback test | Wave 0 |
| PAYSTUB-03 | `validatePaystubInputs({taxYear:2024})` -> invalid | unit | extend `tests/paystub-validation.test.ts` | exists, add case |
| PAYSTUB-03 | restored stale `?year=2024` surfaces error / default, no crash | unit or e2e | new smoke | Wave 0 |
| PAYSTUB-04 | TX/FL/WA absent from income-tax bracket table; still 0 via no-tax path | unit | `tests/state-tax-calculations.test.ts` (update comments) | exists, update meaning |
| (federal data) | Federal single golden case matches official 2025 brackets; SS cap at 176100 | unit | recompute existing federal tests to 2025 | exists, MUST update |
| (regression) | Federal/SS/Medicare otherwise unchanged in shape | unit | `bun run test:unit` full | exists |

### Failure Modes (what must be observably prevented)
- **Silent $0 state tax for a taxed state:** prevented by PAYSTUB-01 (not selectable) + parity test; for stale URLs, also intersect restored state with supported codes.
- **Silent year fallback:** prevented by PAYSTUB-02 (item removed) + PAYSTUB-03 (validation rejects 2024/2023).
- **Stale/wrong tax numbers presented as 2025:** prevented by transcribing official 2025 tables + golden-number tests against official figures.
- **"Accurate" copy over an estimate engine:** prevented by re-labeling copy to "estimate."
- **Federal-calc regression / drift recurrence:** prevented by full-suite run + the bidirectional parity test.

### Sampling Rate
- **Per task commit:** `bun run lint && bun run typecheck && bun test tests/state-tax-calculations.test.ts tests/paystub-validation.test.ts`
- **Per wave merge:** `bun run test:unit`
- **Phase gate:** `bun run lint && bun run typecheck && bun run test:unit && bun run build` (CONTEXT.md:87). Add `bun run test:e2e:fast` if extending `e2e/tools.spec.ts`.

### Wave 0 Gaps
- [ ] `tests/state-tax-calculations.test.ts` - bidirectional parity test + exact-set assertion (PAYSTUB-01); update "unknown state -> 0"/TX/FL meaning (PAYSTUB-04); recompute MA to 0.05; add CA + NY golden cases vs official 2025.
- [ ] `tests/paystub-validation.test.ts` - add `taxYear:2024` rejected case; confirm 2025 accepted (PAYSTUB-03).
- [ ] Federal golden tests - recompute existing federal assertions against official 2025 brackets + SS wage base 176100 (they currently encode stale 2023 and will fail after the re-key).
- [ ] New/existing test - `getSupportedTaxYears()` returns only data-backed years (`[2025]`); `getTaxDataForYear(2024)` documented-fallback test (PAYSTUB-02).
- [ ] (optional) `e2e/tools.spec.ts` - assert no `2023`/`2024` option; state list lacks a known-unsupported label (e.g. "Alabama"); a `?year=2024` URL does not crash.

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
| Crafted `?year=`/`?state=` query param (untrusted URL input passed through by nuqs) | Tampering | `validatePaystubInputs` rejects unsupported year (now `[2025]`); existing 2-letter state shape check; recommend intersecting restored state with supported codes so a crafted `?state=AL` cannot silently yield $0. |
| `Infinity` bracket limits serialized to URL/state | n/a | Not user-controllable; `Infinity` lives only in the static table, never in form/URL state. |

No new attack surface; the phase strictly narrows accepted input.

## Sources

### Primary (HIGH confidence) - 2025 target year
- **IRS Rev. Proc. 2024-40** (2025 inflation-adjusted items; Section 3.01 Tax Rate Tables 1-4 on pp.5-6; Section 2.15 Standard Deduction p.12) - https://www.irs.gov/pub/irs-drop/rp-24-40.pdf - PDF fetched 2026-06-02; verified official 2025 federal income-tax brackets for all four filing statuses + 2025 standard deduction ($30,000 MFJ / $22,500 HoH / $15,000 single / $15,000 MFS).
- **SSA Contribution and Benefit Base** - https://www.ssa.gov/oact/cola/cbb.html and **2025 COLA fact sheet** https://www.ssa.gov/news/press/factsheets/colafacts2025.pdf - verified 2025 SS wage base **$176,100** (up from $168,600); 6.2% employee rate.
- **IRS Topic No. 751 / Additional Medicare Tax** - https://www.irs.gov/taxtopics/tc751 - verified 1.45% Medicare, 0.9% Additional Medicare at $200k single/HoH, $250k MFJ/QSS, $125k MFS (statutory, unindexed - same for 2025).
- **California FTB "2025 California Tax Rate Schedules"** (Schedules X/Y/Z) - https://www.ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf - PDF fetched 2026-06-02; verified official 2025 CA brackets, all three schedules.
- **NY Dept. of Taxation & Finance, Form IT-201-I (2025), "New York State tax rate schedule" (p.33)** - https://www.tax.ny.gov/pdf/current_forms/it/it201i.pdf - PDF fetched 2026-06-02; verified 2025 NY brackets all three filing-status groups, including 9.65%/10.3%/10.9% high-income brackets (unchanged from 2024).
- **Illinois DOR Income Tax Rates** - https://tax.illinois.gov/research/taxrates/income.html and **2025 Withholding Booklet IL-700-T** https://tax.illinois.gov/content/dam/soi/en/web/tax/forms/withholding/documents/2025/il-700-t.pdf - verified 4.95% flat in force for 2025.
- **Pennsylvania DOR Personal Income Tax Rates** - https://www.pa.gov/agencies/revenue/resources/tax-rates/personal-income-tax-rates - verified 3.07% flat ("2004 - Present"), in force 2025.
- **Mass.gov Circular M 2025 withholding tables ("at 5.0% effective January 1, 2025")** - https://www.mass.gov/doc/massachusetts-circular-m-income-tax-withholding-tables-at-50-effective-january-1-2025/download - verified MA flat 5.0% for 2025.
- **Mass.gov DOR - 4% Surtax on Taxable Income** - https://www.mass.gov/info-details/massachusetts-4-surtax-on-taxable-income - verified MA 2025 4% surtax threshold **$1,083,150** (up from $1,053,750 for 2024).

### Primary (HIGH confidence) - 2024 reference + methodology + library
- **IRS Rev. Proc. 2023-34** (2024 figures) - https://www.irs.gov/pub/irs-drop/rp-23-34.pdf - basis for the retained 2024 reference section.
- **California FTB 2024 Tax Rate Schedules** - https://www.ftb.ca.gov/forms/2024/2024-540-tax-rate-schedules.pdf - 2024 reference values.
- **IRS Publication 15-T (Percentage Method)** - https://www.irs.gov/pub/irs-pdf/p15t.pdf - confirms real withholding incorporates a standard-deduction-equivalent and W-4 adjustments the calculator omits -> output is an estimate.
- **nuqs official docs (built-in parsers; parsers)** - https://nuqs.dev/docs/parsers/built-in and https://nuqs.dev/docs/parsers - no-validation pass-through; default-on-invalid. Resolves Open Question A4.
- **Direct read of all files under change** (this session): `tax-data.ts`, `state-tax-data.ts`, `state-tax-calculations.ts`, `tax-calculations.ts`, `calculate-paystub-totals.ts`, `states-utils.ts`, `validation.ts`, `use-paystub-url-state.ts`, `use-paystub-generator.ts`; plus `11-CONTEXT.md`, `v6-AUDIT-FINDINGS.md`, `CLAUDE.md`, `package.json`, `.planning/config.json`.

### Secondary (MEDIUM confidence)
- SSA 2025 wage base $176,100 additionally corroborated via SSA "How is Social Security financed?" and benefits-planner maxtax pages (search-surfaced) - used only to corroborate the cbb.html / COLA fact-sheet primaries.
- MA 2025 surtax threshold $1,083,150 surfaced via Mass.gov search snippet; the underlying primary is the Mass.gov 4%-surtax detail page.

### Tertiary (LOW confidence)
- None relied upon. All numeric 2025 claims trace to a primary government source above.

## Metadata

**Confidence breakdown:**
- 2025 federal brackets + standard deduction: HIGH - read directly from the RP 2024-40 PDF this session.
- 2025 SS wage base / Medicare: HIGH - SSA primary ($176,100) + statutory Medicare thresholds.
- 2025 CA schedules: HIGH - read directly from the FTB 2025 PDF this session.
- 2025 NY schedules: HIGH - read directly from IT-201-I (2025) p.33 this session; unchanged from 2024.
- 2025 IL / PA / MA: HIGH - IL DOR + 2025 IL-700-T; PA DOR rates page; Mass.gov Circular M 2025 + 4%-surtax page ($1,083,150).
- CA MHS $1M / Add'l Medicare thresholds: HIGH (statutory, non-indexed).
- Code-internal findings (line numbers, call sites, derivation pattern): HIGH - direct read + grep.
- Methodology (estimate vs withholding): HIGH. nuqs semantics: HIGH (official docs).

**Research date:** 2026-06-02 (2025 target-year pass) / 2026-06-01 (re-research)
**Valid until:** 2025 tax tables are final and do not change retroactively; revisit when adding tax year 2026 (official 2026 federal = IRS Rev. Proc. issued ~Oct 2025; 2026 SS base announced ~Oct 2025). Code findings valid until the files change. nuqs semantics valid for 2.8.x.
