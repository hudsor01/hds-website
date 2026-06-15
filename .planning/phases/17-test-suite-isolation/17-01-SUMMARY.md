---
phase: 17-test-suite-isolation
plan: 01
subsystem: testing
tags: [bun-test, mock.module, test-isolation, ci, drizzle, react-testing-library]

# Dependency graph
requires:
  - phase: 11-paystub-tax-accuracy
    provides: the ttl-calculator action + its unit test that was the proven poisoner
provides:
  - Order-independent, 0-fail `bun test tests/` (1052/21 -> 1073/0)
  - scripts/check-test-mock-leaks.sh denylist guard wired into test:unit and CI Code Quality
  - tests/setup.ts convention note documenting bun#7823
affects: [phase-18-dependency-updates, any-future-test-authoring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Never partial-mock a shared pure module in a per-file bun test (bun#7823); use the real module or a complete mock in tests/setup.ts"
    - "Static denylist grep guard enforced in CI Code Quality + local test:unit"

key-files:
  created:
    - scripts/check-test-mock-leaks.sh
  modified:
    - tests/unit/ttl-calculator-actions.test.ts
    - tests/setup.ts
    - package.json
    - .github/workflows/ci.yml

key-decisions:
  - "Root-fix at the source: deleted the 5 leaky/redundant partial mocks; no skip/xfail/deletion of any assertion"
  - "Guard is a deterministic static denylist grep (not a biome rule, not a canary test) because biome only lints src/ and bun file ordering is non-deterministic"
  - "Guard uses `command grep` + `--exclude` so it stays correct in shells that alias grep to ripgrep"

patterns-established:
  - "Shared-pure-module mock leaks are caught at the mock.module() call site, order-independently, before tests run"

# Metrics
duration: ~25min
completed: 2026-06-02
---

# Phase 17 Plan 01: test-suite-isolation Summary

**Removed the single process-global mock poisoner in ttl-calculator-actions.test.ts and added a CI-wired denylist guard, making `bun test tests/` order-independent and 0-fail (1052/21 -> 1073/0).**

## Performance

- **Duration:** ~25 min
- **Tasks:** 4 (3 with deliverables, 1 verify-only)
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- Eliminated the ~21 homepage/navigation/Footer cross-file failures at their root cause: `setupCommonMocks()` was reduced from 7 `mock.module` calls to exactly 2 (only the real boundaries `@/lib/db` and `@/lib/resend-client`). The pure shared modules `@/lib/utils`, `@/lib/constants/business`, `@/lib/schemas/ttl` now use their real implementations, and the redundant `@/env` / `@/lib/logger` overrides (already complete in `tests/setup.ts`) were dropped.
- Added `scripts/check-test-mock-leaks.sh`, a deterministic denylist guard that fails if any per-file test partial-mocks `@/lib/utils` or `@/lib/constants/*` outside `tests/setup.ts`, wired into both the local `test:unit` script and the CI Code Quality job.
- Documented the bun#7823 convention at the top of `tests/setup.ts`.

## Test counts observed

| Run | Before fix | After fix |
|-----|-----------|-----------|
| Full suite `bun test tests/` (default order) | 1052 pass / 21 fail | 1073 pass / 0 fail |
| Full suite, 2nd consecutive run (stability) | n/a | 1073 pass / 0 fail (stable) |
| Worst-case ordering (ttl, homepage, navigation) | 25 fail (`Export named 'cn' not found`) | 45 pass / 0 fail |
| ttl-calculator-actions in isolation | 10 pass / 0 fail | 10 pass / 0 fail |

These match the adversarial plan-checker's simulated expectations exactly.

## Guard verification (verify-then-revert)

- Reintroduced the `@/lib/utils` partial mock into `ttl-calculator-actions.test.ts`; the guard exited 1 and named `tests/unit/ttl-calculator-actions.test.ts:57:	mock.module('@/lib/utils', () => ({` as the offender.
- Reverted via `git checkout --`; the guard exited 0 again. The committed tree has exactly 2 `mock.module` calls in the file (`grep -c` == 2). The leak was never committed.

## Task Commits

1. **Task 1: Reduce setupCommonMocks() to real boundaries only** - `e6ff4d7a` (fix)
2. **Task 3: Add denylist mock-leak guard + wiring + convention note** - `02d74b2c` (feat)
3. **Task 4 follow-up: alias-proof the guard (command grep + --exclude)** - `922a7558` (fix)

_Task 2 (order-independence verification) and Task 4 (verify-then-revert proof + phase gate) produced no committed source change beyond Task 1's fix; they were verification gates._

## Files Created/Modified

- `scripts/check-test-mock-leaks.sh` - Denylist grep guard for shared-pure-module partial mocks; `exit 1` on a leak with file:line, `exit 0` otherwise.
- `tests/unit/ttl-calculator-actions.test.ts` - `setupCommonMocks()` reduced from 7 to 2 `mock.module` calls; no test body changed.
- `tests/setup.ts` - Added bun#7823 TESTING convention note after the `__REAL_DB__` capture.
- `package.json` - `test:unit` now chains the guard before `bun test tests/`.
- `.github/workflows/ci.yml` - Added "Check test mock leaks" step to the Code Quality job.

## Decisions Made

- **Root-fix over symptom-patch:** deleted the partial/redundant mocks rather than skipping or xfailing any homepage/navigation/Footer assertion (CONTEXT.md decision 1).
- **Guard = static denylist grep:** biome only lints `src/` (cannot catch a test-only leak); a last-running canary is fragile because bun file ordering is non-deterministic. A static grep is deterministic, sub-second, and order-independent.
- **Denylist scope = `@/lib/utils` + `@/lib/constants/` only:** `@/lib/schemas/*` is intentionally not banned because `blog.test.ts` and `newsletter-unsubscribe-route.test.ts` legitimately stub Drizzle barrels as complete objects (plan guard_scope_note).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Guard silently passed on a reintroduced leak in the local dev shell**
- **Found during:** Task 4 (verify-then-revert)
- **Issue:** The guard's original two-stage pipeline (`grep ... | grep -v '^tests/setup\.ts:'`) failed to fire on a reintroduced `@/lib/utils` partial mock. Root cause: the developer's interactive shell aliases `grep` to ripgrep (`rg`), which changed the invert-filter semantics so the offending line was dropped before the emptiness check.
- **Fix:** Rewrote the match as a single pass using `command grep` (bypasses the alias) plus `--exclude='setup.ts'` (drops the one sanctioned file without a second filter stage). The guard now exits 1 on the leak and 0 after revert.
- **Files modified:** `scripts/check-test-mock-leaks.sh`
- **Verification:** Re-ran verify-then-revert: exit 1 with file:line on the leak, exit 0 after `git checkout --`.
- **Committed in:** `922a7558`

This fix is test-infra only and stays in scope (Task 3's own deliverable). No `src/**` file was touched. The proven `cn`/`links.facebook` root cause required no `src` change, as predicted.

---

**Total deviations:** 1 auto-fixed (Rule 1).
**Impact on plan:** The fix made the guard actually enforce its contract; without it TEST-02 would have been a no-op in the dev environment. No scope creep, no `src` change, no new dependency.

## Issues Encountered

- **`bun run test:unit` aborts under the local safe-chain shell wrapper (environment-only, non-blocking).** When the `test:unit` script (`bash scripts/check-test-mock-leaks.sh && bun test tests/`) runs via `bun run`, the nested `bun test` is resolved through this machine's `safe-chain` `bun` shell function and mis-resolves `bun` to a bad path (`Cannot find module .../bun`). The guard step passes; the failure is purely the local wrapper. Verified the chain works with the real `bun` binary (1.3.14): guard OK, then 1073 pass / 0 fail. CI runs in a clean shell with the real `bun` on PATH (oven-sh/setup-bun@v2), so this does not affect CI. No code change made; flagged here for awareness.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 18 (dependency updates) is unblocked: the Dependabot PRs' CI Test job no longer hits the shared-module mock pollution, and the new guard prevents the same class of regression.
- ROADMAP.md Phase 17 marked complete; line count preserved (371).

## Self-Check: PASSED

- `scripts/check-test-mock-leaks.sh` exists (FOUND).
- Commits `e6ff4d7a`, `02d74b2c`, `922a7558` exist on `main` (FOUND).
- `tests/unit/ttl-calculator-actions.test.ts` has exactly 2 `mock.module` calls (FOUND).

---
*Phase: 17-test-suite-isolation*
*Completed: 2026-06-02*
