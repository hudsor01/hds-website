---
phase: 11-paystub-tax-accuracy
plan: 04
subsystem: paystub-calculator
tags: [paystub, tax, ui, url-state, copy, seo, security]
requires: ["11-01", "11-02", "11-03"]
provides:
  - "Tax Year dropdown rendered from getSupportedTaxYears() (only 2025)"
  - "Default taxYear 2025"
  - "URL-restored ?state= intersected with supported codes (PAYSTUB-10)"
  - "Estimate-framed 2025 paystub hero + metadata + openGraph copy (PAYSTUB-09)"
affects:
  - src/components/paystub/PaystubForm.tsx
  - src/hooks/use-paystub-form.ts
  - src/hooks/use-paystub-generator.ts
  - src/app/(public)/tools/paystub-calculator/PaystubCalculatorClient.tsx
  - src/app/(public)/tools/paystub-calculator/page.tsx
  - e2e/tools.spec.ts
tech-stack:
  added: []
  patterns:
    - "Render select options from the data-derived helper, never a hardcoded literal list"
    - "Intersect untrusted nuqs URL state against a supported allow-list before applying it"
key-files:
  created: []
  modified:
    - src/components/paystub/PaystubForm.tsx
    - src/hooks/use-paystub-form.ts
    - src/hooks/use-paystub-generator.ts
    - src/app/(public)/tools/paystub-calculator/PaystubCalculatorClient.tsx
    - src/app/(public)/tools/paystub-calculator/page.tsx
    - e2e/tools.spec.ts
decisions:
  - "Built SUPPORTED_STATE_CODES at module scope (not per-render) from the two public helpers; NO_INCOME_TAX_CODES stays module-private"
  - "Uppercase the restored ?state= code before the membership check so case variance in a shared URL still matches"
  - "Added one non-breaking e2e smoke (tax year dropdown offers only 2025) because a paystub e2e block already exists in tools.spec.ts"
metrics:
  duration: ~12m
  completed: 2026-06-02
  tasks: 3
  files: 6
---

# Phase 11 Plan 04: Form + URL hardening + estimate copy + full gate Summary

Wired the data-derived helpers into the paystub form UI, defaulted the tax year to 2025, hardened the URL-state restore against unsupported state codes (PAYSTUB-10), reframed the marketing copy as a 2025 estimate (PAYSTUB-09), and ran the full phase gate. This is the final wave of Phase 11.

## What shipped

**Task 1 — Tax Year dropdown from data + default 2025 (`c3d2cb3`)**
- `PaystubForm.tsx`: removed the hardcoded `<SelectItem value="2024">` and `<SelectItem value="2023">`; the Tax Year `<SelectContent>` now maps `getSupportedTaxYears()` (returns `[2025]`), mirroring the `getIncomeTaxStates().map(...)` idiom in the State optgroup. Added `import { getSupportedTaxYears } from '@/lib/paystub-calculator/tax-data'` (Biome required it ordered after the states-utils import). The `onValueChange` `parseInt(value, 10)` handler and the State `<Select>` are unchanged — the State Income Tax optgroup auto-narrows to CA/NY/IL/PA/MA via 11-03's derived `getIncomeTaxStates()`.
- `use-paystub-form.ts`: `INITIAL_PAYSTUB.taxYear` `2024` -> `2025`, matching the only data-backed year.

**Task 2 — URL-restore state intersect, PAYSTUB-10 (`49df6d6`)**
- `use-paystub-generator.ts`: added `import { getIncomeTaxStates, getNoIncomeTaxStates }` and a module-scope `SUPPORTED_STATE_CODES = new Set([...getIncomeTaxStates(), ...getNoIncomeTaxStates()].map(s => s.value))` (computed once, not per render; the private `NO_INCOME_TAX_CODES` is reached only through the public helper). In the URL-restore effect, the unconditional `if (urlState.state) { formState.setSelectedState(urlState.state) }` became an intersect: uppercase the restored code and call `setSelectedState` only when `SUPPORTED_STATE_CODES.has(restoredStateCode)`. A stale shared `?state=AL` is dropped, leaving `selectedState` at its default, so it can never reach `calculateStateTax`'s defensive `return 0` and present a silent confident $0. A supported no-income-tax code (e.g. TX) still restores and correctly yields $0 via the no-tax group. The `taxYear` restore line (line 70) is unchanged — 11-03's tightened `validatePaystubInputs` is the year gate. `hasInitializedFromUrl` ref logic untouched.

**Task 3 — Estimate copy + full gate, PAYSTUB-09 (`5fb9f6a`)**
- `PaystubCalculatorClient.tsx` hero `description`: replaced the over-promise (`"Generate accurate payroll breakdowns ... for any pay period"`) with: `"Estimate your 2025 federal and state income tax breakdown by pay period. State income tax is supported for CA, NY, IL, PA, and MA. This is an estimate and does not account for W-4 allowances, deductions, or credits."`
- `page.tsx` `metadata.description` (146 chars, in the 120-160 SEO range, gate-asserted): `"Estimate 2025 payroll tax breakdowns with our free paystub calculator. Federal tax for all filers and state income tax for CA, NY, IL, PA, and MA."`
- `page.tsx` `openGraph.description`: `"Estimate 2025 payroll tax breakdowns with our free paystub calculator."`
- `page.tsx` docblock updated to `"Estimate 2025 payroll tax breakdowns with federal and state income tax"`.
- Both copy files are dash-free (no U+2014/U+2013).
- `e2e/tools.spec.ts`: added one non-breaking smoke in the existing `Paystub Calculator` describe — opens `#taxYear` and asserts exactly one `2025` option and zero `2024`/`2023` options.

## Full gate result (final wave)

| Gate | Result |
|------|--------|
| `bun run lint` (biome `src/`) | Clean — 407 files, no fixes |
| `bun run typecheck` (`tsc --noEmit`) | Clean |
| `bun run test:unit` | 953 pass / 21 fail / 974 total |
| `bun run build` | Compiled successfully in 4.0s; `/tools/paystub-calculator` static |

**Test honesty note:** the 21 failures are exactly the documented pre-existing cross-file RTL pollution in `tests/unit/homepage.test.tsx` + `tests/unit/navigation.test.tsx` (HomePage structural / Footer / Navbar / Navigation a11y groups). Run in isolation those two files are 35 pass / 0 fail — they only fail under full-suite ordering. This matches the pre-phase baseline (logged in `deferred-items.md`); 0 net-new failures from 11-04. The paystub suite is fully green: `state-tax-calculations`, `paystub-validation`, `paystub-federal-tax`, `z-paystub-calculator`, `pay-periods-generation`, `csv-export` = 37 pass / 0 fail across 6 files. Per the final-gate note, the phase gate PASSES.

## Threat model dispositions delivered

- **T-11-07** (Tax Year offering a value with no backing data): mitigated — dropdown renders only `getSupportedTaxYears()` ([2025]); default 2025; a stale `?year=` is render-gated here and validation-gated by 11-03.
- **T-11-08** (stale `?state=AL` reaching the defensive $0): mitigated — the PAYSTUB-10 intersect drops unsupported codes before `setSelectedState`.
- **T-11-09** (copy advertising accuracy the engine lacks): mitigated — copy reframed as a 2025 estimate, "accurate" and universal-coverage framing removed.

## Deviations from Plan

None beyond plan discretion. The optional e2e smoke and the optional "supported states" inline note were both at Claude's discretion: the e2e smoke was added (a paystub e2e already exists, per CONTEXT.md gate); the inline note under the State `<Select>` was skipped (the metadata/hero copy already names the supported states, so an in-form note would be redundant). The Biome import-ordering fix on the new `getSupportedTaxYears` import is a trivial lint-driven adjustment, not a behavioral deviation.

## Known Stubs

None. No stub patterns introduced; all selects are data-wired.

## Self-Check: PASSED
- src/components/paystub/PaystubForm.tsx — FOUND
- src/hooks/use-paystub-form.ts — FOUND
- src/hooks/use-paystub-generator.ts — FOUND
- src/app/(public)/tools/paystub-calculator/PaystubCalculatorClient.tsx — FOUND
- src/app/(public)/tools/paystub-calculator/page.tsx — FOUND
- e2e/tools.spec.ts — FOUND
- commit c3d2cb3 — FOUND
- commit 49df6d6 — FOUND
- commit 5fb9f6a — FOUND
