---
phase: 20
status: passed
verified: 2026-06-03
method: regression tests (fail-on-old) + gates on shipped origin/main (PR #345)
---

# Phase 20 Verification — correctness-bugs

**Verdict:** PASSED — BUG-01..04 satisfied, each with a regression test proven to fail on pre-fix code.

| Req | Fix | Test (fails-on-old) | Status |
|-----|-----|---------------------|--------|
| BUG-01 | `claimDuePendingEmails` atomic `UPDATE…RETURNING` before send + stale-`processing` reclaim (`scheduledFor < now-15min`, no DDL) | two overlapping passes send once; pre-fix sends twice | satisfied |
| BUG-02 | lazy-prune bounds in-memory store during Redis outage; `SET NX EX`+`INCR` atomic TTL | store evicts expired (pre-fix kept all); Redis call-order `set:nx:ex` then `incr` (no bare `expire`) | satisfied |
| BUG-03 | `.returning()`+rows-affected → 404; `z.string().uuid()` → 400; across PATCH/DELETE `[id]` + DELETE `requests/[id]` | 400/404/200 per handler; pre-fix 200-on-missing | satisfied |
| BUG-04 | `superRefine` 16KB + 100-key cap → 400 before insert | oversized → 400 no-insert; normal → 200; pre-fix inserted | satisfied |

## Gates / CI

- Local (real bun): lint clean (414 files), typecheck clean, mock-leak guard OK, full `bun test tests/` **1090/0** (was 1073; +17).
- PR #345 CI: Build, **Test**, Code Quality, Create Neon Branch, Vercel all green. Merged to origin/main (`fed62f2e`).

## CI escape caught + fixed (test-isolation, not product)

First #345 CI run: Test job **9 fail** (all BUG-03 route tests, `Received: 503`). Root cause: the route tests authorize via the REAL `validateAdminAuth`, and `setupApiMocks` bakes `__TEST_ENV.ADMIN_SECRET`'s value into its `@/env` mock at call time; under CI's bun 1.3.8 ordering a prior suite (`admin-auth`, which flips `ADMIN_SECRET` to `undefined` for its 503 case) left it unset. Fixed in two steps (9 → 1 → 0): (1) re-establish `testEnv.ADMIN_SECRET` in `beforeEach`; (2) do so BEFORE `setupApiMocks()` reads it. Product code was always correct; this was a test-ordering fragility (same bun#7823 class the Phase-17 guard targets, but on `@/env`/auth rather than `@/lib/utils`). Local could not reproduce (bun 1.3.14 ordering); CI was authoritative.

## Notes

- No schema/DDL change; public function signatures unchanged.
- Code-only PR; planning trail on local main. Operator reconciles local main (`git merge origin/main`).
