---
phase: 11
slug: paystub-tax-accuracy
status: draft
nyquist_compliant: false
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

Plan/task IDs filled in by the planner; this maps each requirement to its observable proof.

| Requirement | Secure/Correct Behavior | Test Type | Automated Command | Status |
|-------------|-------------------------|-----------|-------------------|--------|
| PAYSTUB-01 | `getIncomeTaxStates()` returns exactly the state codes present in `stateTaxDataByYear` (CA, NY, IL, PA, MA); no income-tax state without bracket data is selectable | unit (bidirectional parity) | `bun test tests/state-tax-calculations.test.ts` | ⬜ pending |
| PAYSTUB-02 | Year dropdown offers only years backed by real data (2024); no `2023` item; selecting a year never yields another year's figures | unit + build | `bun run test:unit` | ⬜ pending |
| PAYSTUB-03 | `validatePaystubInputs` rejects a tax year not present in `taxDataByYear` (derived range, not hardcoded `2020..currentYear+5`) | unit (rejected-year case) | `bun test tests/z-paystub-calculator.test.ts` | ⬜ pending |
| PAYSTUB-04 | `stateTaxDataByYear` no longer contains TX/FL/WA flat-0 entries; those codes resolve via the no-income-tax group only | unit + source assertion | `bun test tests/state-tax-calculations.test.ts` | ⬜ pending |

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements (bun:test + `tests/state-tax-calculations.test.ts` + `tests/z-paystub-calculator.test.ts` already exist). No new framework install.
- New test to ADD: bidirectional parity test (selectable income-tax states == states with bracket data) locking PAYSTUB-01.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stale shared URL `?year=2023` / `?state=AL` (nuqs-persisted) degrades to a validation error or default, not a crash or silent wrong figure | PAYSTUB-02, -03 | nuqs URL-state restore is a browser runtime path not covered by unit tests | Load `/tools/paystub-calculator?year=2023&state=AL` in dev; confirm it falls back to a supported default / shows a clear error, never a silent $0 or 2024-as-2023 |
| Paystub hero/metadata copy no longer over-promises state coverage and contains no em/en-dash | PAYSTUB-01 | Copy/visual judgment | Read rendered `/tools/paystub-calculator`; grep changed copy for U+2014/U+2013 |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (bidirectional parity test added)
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
