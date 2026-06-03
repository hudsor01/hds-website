# Phase 17 Context — test-suite-isolation

**Phase:** 17
**Milestone:** v7 Stability and Maintenance
**Requirements:** TEST-01, TEST-02
**Severity:** HIGH (CI signal is currently untrustworthy; blocks Phase 18)

## Goal

`bun test tests/` is order-independent and 0-fail, matching isolated runs. The ~21 homepage/navigation/Footer failures are gone because their root cause is fixed at the source, and a guard prevents the same class of leak from returning.

## Locked decisions

1. **Root-fix, not symptom-patch.** No `.skip`, `xfail`, `test.todo`, or deletion of the homepage/navigation/Footer assertions. They keep asserting what they asserted and pass.
2. **The poisoner is `tests/unit/ttl-calculator-actions.test.ts`** (PROVEN in 17-RESEARCH.md). Its `setupCommonMocks()` partial-mocks pure shared modules globally.
3. **Fix = stop partial-mocking pure shared modules; use the real implementations.** Keep mocking only the real boundaries: `@/lib/db` (always) and `@/lib/resend-client` (complete mock, action sends email). Drop the `@/env`, `@/lib/logger`, `@/lib/constants/business`, `@/lib/utils`, `@/lib/schemas/ttl` mocks (first two are redundant with `tests/setup.ts`; last three are pure/deterministic and only need the real module).
4. **drizzle-orm stays real** (existing file comment is correct).
5. **Guard (TEST-02) is detection/convention, not a runtime reset** — bun#7823 means there is no per-file mock isolation to "turn on." Planner chooses among: a denylist grep lint in CI, a last-running canary meta-test asserting the real shared exports, and/or a documented convention. Whatever is chosen must be cheap and must actually fail if a future partial mock of a shared pure module leaks.

## Scope boundary

- IN: `tests/unit/ttl-calculator-actions.test.ts` (the fix), any residual leaker found after the fix (bisect + same treatment), `tests/setup.ts` (if the guard lives there), one new guard artifact (lint script or canary test), and a short TESTING convention note.
- OUT: rewriting tests to a different framework; net-new coverage; touching `src/**` runtime code (this is test-infra only — if a `src` change is required to make a module testable without a partial mock, flag it, do not silently expand scope).

## Verification (what proves done)

1. `bun test tests/` → 0 fail, default ordering, run 2-3x consecutively (stable).
2. Worst-case ordering still 0-fail: `bun test tests/unit/ttl-calculator-actions.test.ts tests/unit/homepage.test.tsx tests/unit/navigation.test.tsx` (the exact repro that fails today) → all pass.
3. The 9 `ttl-calculator-actions` tests still pass in isolation.
4. `bun run lint` + `bun run typecheck` clean.
5. The guard demonstrably fails when a partial shared-module mock is (temporarily) reintroduced — verify once, then revert.

## Notes

- Ship flow: feature branch off `origin/main`, code-only PR (planning stays on `main`), watch ALL CI check-runs (not just "CI"; Neon branch too), merge when green.
- This phase MUST land before Phase 18 (the dep PRs' CI Test job hits this same pollution).
