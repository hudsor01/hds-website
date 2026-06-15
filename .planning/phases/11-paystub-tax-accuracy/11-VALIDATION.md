---
phase: 11
slug: paystub-tax-accuracy
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-01
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Derived from 11-RESEARCH.md "Validation Architecture".

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bun:test |
| **Config file** | none — `tests/setup.ts` auto-mocks `@/env` and `@/lib/logger` |
| **Quick run command** | `bun test tests/state-tax-calculations.test.ts` |
| **Full suite command** | `bun run test:unit` (alias `bun test tests/`) |
| **Estimated runtime** | ~quick: <2s; full suite: ~10-20s |
| **Gates** | `bun run lint && bun run typecheck && bun run test:unit && bun run build` |

---

## Sampling Rate

- **After every task commit:** Run the quick command for the file(s) touched (state-tax, tax-data, validation, states-utils).
- **After every plan wave:** Run `bun run test:unit` (federal-calc regression guard — `tax-data.ts` fans out to `tax-calculations.ts`).
- **Before `/gsd:verify-work`:** Full gate chain green (lint + typecheck + unit + build).
- **Max feedback latency:** ~20s.

---

## Per-Requirement Verification Map

Target year: OFFICIAL 2025. Maps each requirement to its observable proof.

| Requirement | Correct Behavior | Test Type | Automated Command | Status |
|-------------|------------------|-----------|-------------------|--------|
| PAYSTUB-01 | `getIncomeTaxStates()` returns exactly the state codes present in `stateTaxDataByYear` (CA, NY, IL, PA, MA); no income-tax state without bracket data is selectable | unit (bidirectional parity) | `bun test tests/state-tax-calculations.test.ts` | ⬜ pending |
| PAYSTUB-02 | Year dropdown offers only 2025 (the year backed by real data); no `2023`/`2024` items; default `taxYear` 2025; selecting a year never yields another year's figures | unit + build | `bun run test:unit` | ⬜ pending |
| PAYSTUB-03 | `validatePaystubInputs` rejects a tax year not present in `taxDataByYear` (derived from data = `[2025]`, not hardcoded `2020..currentYear+5`); rejected-2024 + accepted-2025 cases | unit | `bun test tests/paystub-validation.test.ts` | ⬜ pending |
| PAYSTUB-04 | `stateTaxDataByYear` no longer contains TX/FL/WA flat-0 entries; those codes resolve via the no-income-tax group only | unit + source assertion | `bun test tests/state-tax-calculations.test.ts` | ⬜ pending |
| PAYSTUB-05 | Federal brackets are official 2025 (IRS Rev. Proc. 2024-40, all statuses; single 10% ceiling $11,925); SS wage base $176,100; Medicare/SS rates unchanged | unit (federal golden + SS-cap) | `bun run test:unit` | ⬜ pending |
| PAYSTUB-06 | CA brackets official 2025 FTB (top 12.3% to $742,953) + 1% MHS surtax over $1,000,000 (effective 13.3%) as a top bracket | unit (CA surtax case) | `bun test tests/state-tax-calculations.test.ts` | ⬜ pending |
| PAYSTUB-07 | NY brackets official 2025 DTF (all statuses) incl. 9.65/10.3/10.9% high-income brackets | unit (NY high-income case) | `bun test tests/state-tax-calculations.test.ts` | ⬜ pending |
| PAYSTUB-08 | MA flat 5.0% (`0.05`, not `0.0535`) + 4% surtax over $1,083,150 (effective 9%) as a top bracket; MA math-lock expectations recomputed | unit (MA + surtax case) | `bun test tests/state-tax-calculations.test.ts` | ⬜ pending |
| PAYSTUB-09 | Paystub hero/metadata copy says "estimate" (not "accurate"), references 2025, no over-promise, no em/en-dash; metadata description 120-160 chars (gate-asserted) | build + grep + length assert | `bun run build` + grep gate | ⬜ pending |
| PAYSTUB-10 | URL-restored `?state=` is intersected with supported codes; a stale `?state=AL` cannot reach the defensive $0 | unit + manual smoke | `bun run test:unit` | ⬜ pending |

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements (bun:test + `tests/state-tax-calculations.test.ts` + `tests/paystub-validation.test.ts` + `tests/z-paystub-calculator.test.ts` already exist). No new framework install.
- Tests to ADD: bidirectional parity test (selectable income-tax states == states with bracket data) locking PAYSTUB-01; federal-golden + SS-cap ($176,100) value assertions; CA/MA/NY surtax + high-income value assertions; rejected-2024 / accepted-2025 year cases.
- Tests to UPDATE: recompute MA math-lock expectations (0.0535 -> 0.05); re-key the 4 `taxYear: 2024` fixtures in `tests/z-paystub-calculator.test.ts` to 2025 (owned by 11-03).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stale shared URL `?year=2024` / `?state=AL` (nuqs-persisted) degrades to the supported default (2025 / supported state) or a clear error, never a crash or silent wrong figure | PAYSTUB-02, -03, -10 | nuqs URL-state restore is a browser runtime path not covered by unit tests | Load `/tools/paystub-calculator?year=2024&state=AL` in dev; confirm it resolves to 2025 / a supported state, never a silent $0 or another year's figures |
| Paystub hero/metadata copy reads as an "estimate", references 2025, does not over-promise, contains no em/en-dash | PAYSTUB-09 | Copy/visual judgment | Read rendered `/tools/paystub-calculator`; grep changed copy for U+2014/U+2013 |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (bidirectional parity test added in 11-01 Task 2)
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-02 (retargeted to official 2025; covers PAYSTUB-01..10; blocker + warnings from re-check corrected)
