---
phase: 16
slug: intentional-noop-confirmation
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-02
---

# Phase 16 — Validation Strategy

> Per-phase validation contract. Derived from 16-RESEARCH.md. NOOP-01 is a `.planning` doc reconciliation (no code); NOOP-02 adds regression tests locking the env-gated no-ops by contract.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bun:test; `tests/setup.ts` auto-mocks `@/env` (TEST_ENV omits GOOGLE_ADS_*, POSTGRES_URL, SENTRY_DSN, webhook vars -> the no-op path is the DEFAULT) + `@/lib/logger` |
| **Quick run command** | `bun test tests/unit/db.test.ts tests/unit/error-tracking.test.ts tests/unit/notifications.test.ts tests/unit/ad-conversions.test.ts` |
| **Gates** | `bun run lint && bun run typecheck && bun run test:unit && bun run build` |

---

## Sampling Rate

- **After each new test file:** run that file.
- **Before verify:** full gate chain green; the new tests pass; 0 net-new failures beyond the documented pre-existing baseline.

---

## Per-Requirement Verification Map

| Requirement | Correct Behavior | Test Type | Automated Command | Status |
|-------------|------------------|-----------|-------------------|--------|
| NOOP-01 | `.planning/v6-AUDIT-FINDINGS.md` records every intentional no-op as VERIFIED-INTENTIONAL with rationale; the formerly-DECIDE/CLEANUP items are reconciled to their resolving phase (admin errors->13, pageTitle->14, ErrorBoundary->12, logger group/table + ttl processingFees->15, whiteSpace->kept-15) | doc review | manual read (no code) | ⬜ pending |
| NOOP-02 (ad-conversions) | `sendAdConversion()` no-ops (no fetch, no throw, early return) when GOOGLE_ADS_* unset | unit (existing) | `bun test tests/unit/ad-conversions.test.ts` (verify the existing no-op block green) | ⬜ pending |
| NOOP-02 (db) | `db` mock proxy resolves `[]` for queries when POSTGRES_URL unset; no throw | unit (new db.test.ts) | `bun test tests/unit/db.test.ts` | ⬜ pending |
| NOOP-02 (error-tracking) | `reportError(...)` no-op (no `Sentry.captureException`, no throw) when SENTRY_DSN unset | unit (new error-tracking.test.ts; spy Sentry, re-register in beforeEach) | `bun test tests/unit/error-tracking.test.ts` | ⬜ pending |
| NOOP-02 (notifications) | `notifyHighValueLead(...)` resolves without fetch when webhooks unset (Slack/Discord private fns return false); threshold early-return for low score | unit (new notifications.test.ts via public seam) | `bun test tests/unit/notifications.test.ts` | ⬜ pending |

---

## Wave 0 Requirements

- No new infra. 3 new test files (db, error-tracking, notifications) + verify the existing ad-conversions no-op test. `tests/setup.ts` TEST_ENV already drives the unset-env (no-op) path — no env manipulation needed.
- error-tracking test must re-register the `@sentry/nextjs` mock in `beforeEach` (tests/setup.ts `mock.restore()` clears `mock()` spies).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The audit-findings doc is an accurate closed v6 record | NOOP-01 | Doc reconciliation, no executable surface | Read `v6-AUDIT-FINDINGS.md`: 6 stubs fixed (which phase), formerly-DECIDE/CLEANUP resolved (which phase), env-gated confirmed intentional |

---

## Validation Sign-Off

- [x] All NOOP-02 tasks have an automated `bun test` verify; NOOP-01 is doc-only (manual by nature)
- [x] Sampling continuity: per-file test run
- [x] Wave 0: 3 new test files + verify-existing
- [x] No watch-mode flags
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-02 (v6 finale: doc reconciliation + regression tests for the env-gated no-ops)
