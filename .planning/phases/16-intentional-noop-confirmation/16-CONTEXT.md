# Phase 16: intentional-noop-confirmation - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning
**Source:** `.planning/v6-AUDIT-FINDINGS.md` Section 2 (the 50 intentional no-ops) + NOOP-01/NOOP-02. The v6 finale: close the audit loop by confirming the verified-intentional no-ops and locking the key ones by contract.

<domain>
## Phase Boundary

The no-op/stub audit produced 50 "intentional no-op" findings. The genuine stubs (6) were fixed in phases 11-15. This phase finalizes the rest:
- **NOOP-01 (doc):** make `.planning/v6-AUDIT-FINDINGS.md` the canonical VERIFIED-INTENTIONAL record. Each intentional no-op gets a clear "verified intentional + rationale" disposition, and the DECIDE/CLEANUP items are RECONCILED with what actually happened across phases 11-15 (so the doc is accurate post-milestone and a future audit recognizes these as intentional, not re-flags them).
- **NOOP-02 (tests):** add cheap regression tests asserting the documented no-op behavior for the key env-gated integrations, so the behavior is intentional-BY-CONTRACT (a future change that accidentally makes them throw / do real work without config is caught).

**In scope:** `.planning/v6-AUDIT-FINDINGS.md` (NOOP-01, doc-only) + new/extended unit tests under `tests/unit/` (NOOP-02). No production source behavior change.

**Out of scope:** changing any of the intentional no-ops' behavior (they are correct by design); the genuine stubs (already fixed in 11-15); anything outside NOOP-01/02.
</domain>

<decisions>
## Implementation Decisions (LOCKED)

### NOOP-01 — verified-intentional record (doc reconciliation)
- Update `.planning/v6-AUDIT-FINDINGS.md` Section 2 so every intentional no-op carries a final VERIFIED-INTENTIONAL disposition + one-line rationale. RECONCILE the original DECIDE/CLEANUP dispositions with the phase-11-15 outcomes:
  - **Admin silent-error-swallow (was DECIDE):** RESOLVED by Phase 13 (full error states everywhere; superseded the v4 return-[] lock). Mark as RESOLVED-IN-PHASE-13, not a standing no-op.
  - **logger `group`/`groupEnd`/`table` (was CLEANUP):** REMOVED in Phase 15. Mark RESOLVED-IN-PHASE-15.
  - **ttl `processingFees` (was CLEANUP-minor):** REMOVED in Phase 15. Mark RESOLVED-IN-PHASE-15.
  - **contact-welcome `whiteSpace` (was CLEANUP):** KEPT + documented in Phase 15. Mark VERIFIED-INTENTIONAL.
  - **admin `pageTitle` (was DECIDE):** RESOLVED by Phase 14 (prop removed). Mark RESOLVED-IN-PHASE-14.
  - **The genuinely env-gated no-ops** (ad-conversions `sendAdConversion`; error-tracking `reportError`/SENTRY_DSN; notifications Slack/Discord webhooks; `db.ts` mock proxy without POSTGRES_URL; rate-limiter Redis fallback; production log-level drops; attribution quota empty-catch; blob-probe fallback; the `isResendConfigured()`-gated email paths; upload `onUploadCompleted` audit log; ad-conversions unused value/currency/occurredAt params): confirm VERIFIED-INTENTIONAL with rationale (graceful degradation / documented groundwork). These remain by design.
- The doc should read as a closed, accurate record: 6 stubs fixed (which phase each), the formerly-DECIDE/CLEANUP items resolved (which phase), and the standing env-gated no-ops confirmed intentional. This is `.planning`-only (no code).

### NOOP-02 — regression tests (intentional-by-contract)
- Add cheap unit tests asserting the documented no-op behavior for a representative, high-value subset of the env-gated no-ops. Target the ones that are clean to test (tests/setup.ts already auto-mocks `@/env`):
  - `sendAdConversion()` no-ops (returns early / does nothing observable, no throw) when GOOGLE_ADS_* creds are unset (`getConfig()` -> null).
  - `db` is the mock proxy returning `[]` for queries when `POSTGRES_URL` is unset (`createMockDb`).
  - `reportError(...)` from error-tracking is a no-op (no throw, no Sentry call) when `SENTRY_DSN` unset.
  - `sendSlackNotification` / `sendDiscordNotification` return `false` (no fetch) when their webhook env is unset.
- Each test asserts: no throw + the documented no-op outcome (early return / `[]` / `false`). Follow the existing bun:test + `@/env` mock pattern. Research confirms exact current behavior + the cleanest way to drive the unset-env path. Do NOT change the source behavior; tests lock it.

### Claude's Discretion
- Exactly which env-gated no-ops to cover in NOOP-02 (the 4 above are the recommended high-value core; add more only if cheap). Avoid brittle tests (don't over-mock; assert the contract, not internals).
- Whether to add a one-line `logger.debug` on the rate-limiter Redis catch (audit suggested it) — OPTIONAL, only if trivial + clearly in-spirit; default SKIP (out of strict NOOP scope, it's a behavior tweak).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/v6-AUDIT-FINDINGS.md` — Section 2 (the 50 intentional no-ops, current dispositions) — the NOOP-01 target.
- `.planning/ROADMAP.md` + `.planning/STATE.md` — the phase-11-15 outcomes to reconcile against (which phase resolved which DECIDE/CLEANUP item).
- NOOP-02 source under test: `src/lib/ad-conversions.ts` (`sendAdConversion`/`getConfig`), `src/lib/db.ts` (`createMockDb`/`hasNoDatabase`), `src/lib/error-tracking.ts` (`reportError`/SENTRY_DSN gate), `src/lib/notifications.ts` (`sendSlackNotification`/`sendDiscordNotification` webhook gates).
- Existing test patterns: `tests/setup.ts` (auto-mocks `@/env` + `@/lib/logger`), `tests/unit/*.test.ts` (the env-mock + bun:test idioms; check for any existing ad-conversions/db/error-tracking/notifications tests to extend rather than duplicate).
- CLAUDE.md: bun:test in `tests/`, no `any`, never read `process.env` directly (env via `@/env`), no behavior change.
</canonical_refs>

<specifics>
## Specific Ideas
- Win condition: `v6-AUDIT-FINDINGS.md` is an accurate closed record (6 fixed + which phase, formerly-DECIDE/CLEANUP resolved + which phase, env-gated confirmed intentional); a small set of regression tests lock the key env-gated no-ops so they can't silently regress and so future audits see them as intentional-by-contract.
- Gates: `bun run lint && bun run typecheck && bun run test:unit && bun run build`. The new tests must pass; 0 net-new failures beyond the documented pre-existing baseline.
- This is the v6 finale; after it, the milestone can be completed/audited.
</specifics>

<deferred>
## Deferred Ideas
- The optional rate-limiter `logger.debug` on the Redis catch (behavior tweak, not strictly NOOP-confirmation).
- Ad-conversions: building `sendAdConversion` for real (when paid-ad budget exists) — documented groundwork, future.
</deferred>

---
*Phase: 16-intentional-noop-confirmation*
*Context gathered: 2026-06-02; NOOP-01 doc reconciliation + NOOP-02 regression tests; v6 finale*
