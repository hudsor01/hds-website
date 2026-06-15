---
phase: 20-correctness-bugs
plan: 01
subsystem: api
tags: [drizzle, postgres, upstash-redis, rate-limiter, zod, bun-test, scheduled-emails, testimonials]

requires:
  - phase: 19-dependency-security
    provides: clean origin/main baseline (deps patched, suite 1073/0)
provides:
  - Atomic claim before send in the scheduled-email queue (no double-send under overlapping cron/n8n)
  - Bounded in-memory rate-limiter fallback (lazy prune) under Redis outage
  - Atomic Redis count+TTL (SET NX EX + INCR, no TTL-less zombie keys)
  - Testimonials [id] HTTP contract: 400 malformed / 404 missing / 200 success
  - Calculator submit JSON cap (16KB bytes + 100 keys) before DB insert
affects: [code-hygiene, future email-queue work, future rate-limiter work]

tech-stack:
  added: []
  patterns:
    - "Atomic claim-before-act: conditional UPDATE ... WHERE still-claimable RETURNING gates side effects across overlapping runs"
    - "Inject-the-db unit test: extract DB logic into a lightweight module taking the client as a param to dodge bun process-global mock.module bleed"
    - "Order-independent real-module load in tests via a unique query-string specifier (distinct bun module key)"

key-files:
  created:
    - src/lib/scheduled-emails-claim.ts
    - tests/unit/scheduled-emails-claim.test.ts
    - tests/unit/testimonials-route.test.ts
  modified:
    - src/lib/scheduled-emails.tsx
    - src/lib/rate-limiter.ts
    - src/lib/testimonials.ts
    - src/app/api/testimonials/[id]/route.ts
    - src/app/api/testimonials/requests/[id]/route.ts
    - src/app/api/calculators/submit/route.tsx
    - tests/unit/rate-limiter.test.ts
    - tests/unit/api-calculators-submit.test.ts
    - tests/test-utils.ts

key-decisions:
  - "BUG-01 recovery gap: chose option (a) - reclaim stale 'processing' rows (scheduledFor < now - 15min) in the candidate SELECT + claim predicate. No DDL; recoverable crashed claims."
  - "BUG-02 atomic form: SET key 0 NX EX window + INCR (TTL guaranteed on first write). No new dependency (@upstash/ratelimit NOT added)."
  - "BUG-04: 16KB serialized-byte cap is the real protection (bounds nesting depth); 100-key cap is a cheap early reject. Documented that key-count alone does not bound depth."
  - "'processing' is a transient value in the existing plain-text status column (not a pg enum). No schema/DDL change."

patterns-established:
  - "Claim-before-side-effect for any shared-row queue processed by overlapping workers"
  - "DB-logic-as-injectable-function for order-independent unit testing under bun:test"

requirements-completed: [BUG-01, BUG-02, BUG-03, BUG-04]

duration: 95min
completed: 2026-06-03
---

# Phase 20 Plan 01: correctness-bugs Summary

**Fixed four verified runtime defects (scheduled-email double-send race, rate-limiter outage memory leak + non-atomic Redis TTL, testimonials wrong HTTP contract, unbounded calculator JSON) each with a regression test that fails on the pre-fix code; full suite 1073 -> 1090 pass, 0 fail.**

## Performance

- **Duration:** ~95 min
- **Tasks:** 5 (4 TDD bug fixes + phase gate)
- **Files modified:** 10 (7 source, 3 test) + 1 new source module + 2 new test files

## Accomplishments

- **BUG-01** atomic claim (`claimDuePendingEmails`) runs a single conditional UPDATE (`status='processing' WHERE id IN (...) AND still-claimable RETURNING *`) before any Resend send; only claimed rows are sent. Two overlapping passes send a row at most once.
- **BUG-02** in-memory fallback now lazy-prunes expired entries on every call (bounded under a Redis outage, independent of `useRedis`); the Redis path uses `SET NX EX` + `INCR` so the TTL is established atomically with the first write (no zombie keys).
- **BUG-03** query layer returns rows-affected (`.returning()` + `result.length > 0`); routes validate `id` as a UUID (400 before any DB call) and map a false result to 404 instead of 500. Applied to PATCH/DELETE `[id]` and DELETE `requests/[id]`.
- **BUG-04** calculator submit caps `inputs` and `results` at 16KB serialized + 100 keys via a `superRefine`; oversized payloads return 400 before the DB insert.

## Task Commits

1. **Task 1: BUG-01 atomic claim** - `308b9871` (fix) + `ab709160` (refactor: extract into testable `scheduled-emails-claim.ts`)
2. **Task 2: BUG-02 bounded fallback + atomic Redis** - `f0514e7b` (fix)
3. **Task 3: BUG-03 testimonials HTTP contract** - `2be8b2c2` (fix)
4. **Task 4: BUG-04 calculator JSON cap** - `c98ebe79` (fix)
5. **Task 5: Phase gate + test isolation** - `5b4e3eba` (test: order-independence under mock bleed)

**Plan metadata:** (docs commit, this SUMMARY + STATE + ROADMAP)

## Files Created/Modified

- `src/lib/scheduled-emails-claim.ts` (new) - `claimDuePendingEmails(db, now)` atomic claim + 15-min stale-`processing` reclaim predicate; lightweight (drizzle + schema only) so it is unit-testable in isolation.
- `src/lib/scheduled-emails.tsx` - `processPendingEmails` now calls `claimDuePendingEmails` before any send; retry/failed logic unchanged.
- `src/lib/rate-limiter.ts` - `_checkLimitInMemory` lazy-prunes on every call; `checkWithRedis` uses `SET NX EX` + `INCR`.
- `src/lib/testimonials.ts` - `updateTestimonialStatus`/`deleteTestimonial`/`deleteTestimonialRequest` add `.returning()` and return rows-affected.
- `src/app/api/testimonials/[id]/route.ts`, `.../requests/[id]/route.ts` - UUID validation (400) + not-found (404) mapping; dash-free messages.
- `src/app/api/calculators/submit/route.tsx` - `MAX_JSON_BYTES` (16384) + `MAX_JSON_KEYS` (100) cap via `superRefine`.
- `tests/unit/scheduled-emails-claim.test.ts` (new), `tests/unit/testimonials-route.test.ts` (new), `tests/unit/rate-limiter.test.ts`, `tests/unit/api-calculators-submit.test.ts`, `tests/test-utils.ts`.

## How Each Test Fails On The Pre-Fix Code

- **BUG-01:** Two `claimDuePendingEmails` passes over the same candidate; the claim UPDATE returns the row on pass 1 and `[]` on pass 2. Asserts pass 1 surfaces the row exactly once, pass 2 surfaces nothing, and the claim uses `.returning()`. Verified by reverting the fix (claim returns all candidates without the `.returning()` gate): 2 of 3 tests fail (overlap double-surface + missing rows-affected gate). On the original pre-fix `processPendingEmails` there was no claim at all, so both passes would send.
- **BUG-02:** Fallback test seeds 5 keys, advances time past the window, then one fresh `checkLimit` and asserts `store.size === 1` (pre-fix kept all 6). Redis test stubs `@upstash/redis` and asserts the call order is `set:nx=1:ex=<window>` then `incr`, and that bare `expire` is never used (pre-fix did `incr` then `expire`).
- **BUG-03:** Asserts malformed `not-a-uuid` -> 400 with the query mock NOT called; valid UUID returning false -> 404; valid UUID returning true -> 200, across PATCH/DELETE `[id]` and DELETE `requests/[id]`. Pre-fix returned 200 on missing and lacked the 400 guard (6 of 9 fail).
- **BUG-04:** Oversized inputs (20KB string), over-key-count inputs (150 keys), and oversized results each -> 400 with the insert mock NOT called; normal payload still 200. Pre-fix accepted and inserted (3 fail).

## Decisions Made

- **BUG-01 orphaned-`processing` recovery (mandated decision, option a):** The atomic claim sets `status='processing'`, but the table has no `updatedAt` column. To recover a crashed claim, the candidate SELECT and the claim predicate also reclaim rows stuck in `processing` whose `scheduledFor < now - 15min`. `scheduledFor` is never rewritten once set, so a still-`processing` row long past its due time is provably a crashed claim. The atomic claim keeps concurrent reclaim safe. No DB column added (no DDL). This is strictly better than the old behavior (which double-sent on overlap) and recoverable rather than dropping the email.
- **BUG-02 atomic Redis form:** `SET key 0 NX EX window` then `INCR key`. NX makes the SET a no-op on an existing key; the EX guarantees the TTL is set by the same write that creates the counter. A plain two-command `pipeline()` is not transactional on Upstash, so this idempotent SET-NX-EX + INCR pair was chosen over a pipeline. No new dependency.
- **BUG-04 depth note:** The 16KB serialized-byte cap is the real protection - it bounds total payload size regardless of nesting depth. The 100-key top-level cap does NOT bound nesting depth on its own; that is acceptable because the byte cap covers it. Both `inputs` and `results` are capped.
- **`processing` column type:** `scheduled_emails.status` is plain `text` (confirmed in `src/lib/schemas/emails.ts:26`), not a pg enum, so `'processing'` is a transient string value - no schema/DDL change.
- **BUG-02 reported defect CONFIRMED:** The non-atomic `redis.incr(key)` + separate `await redis.expire(key, windowSeconds)` was confirmed at `src/lib/rate-limiter.ts:56-57` at execution time.
- **Dependency decision:** No new dependency added. `@upstash/ratelimit` was NOT needed (the no-new-dep `SET NX EX` + `INCR` form was clean), so no `checkpoint:decision` was raised.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extracted the BUG-01 claim into a lightweight module for order-independent testing**
- **Found during:** Task 5 (phase gate), surfaced when the full suite ran.
- **Issue:** The original BUG-01 test imported `processEmailsEndpoint` from `@/lib/scheduled-emails`. bun's `mock.module` is process-global and never unregistered (oven-sh/bun#7823); sibling suites (`api-calculators-submit`, `process-emails-route`) stub `@/lib/scheduled-emails`, so the import got a stub and the test failed only in the full suite. Every bypass attempt (abs-path require, query-string fresh-eval of the heavy module) either failed to bind to the per-test db mock or re-evaluated the heavy dependency graph and contaminated other suites.
- **Fix:** Extracted `claimDuePendingEmails(db, now)` (and the stale-reclaim predicate) into a new lightweight `src/lib/scheduled-emails-claim.ts` that imports only `drizzle-orm` + the schema and takes the db client as a parameter. The test injects a plain db double - zero module-global mocking, fully order-independent. `processPendingEmails` calls the extracted function.
- **Files modified:** `src/lib/scheduled-emails-claim.ts` (new), `src/lib/scheduled-emails.tsx`, `tests/unit/scheduled-emails-claim.test.ts`.
- **Verification:** 3 BUG-01 tests pass alone and after the poisoners; verified-then-reverted (simulated pre-fix -> 2 fail). Full suite 1090/0.
- **Committed in:** `ab709160`.

**2. [Rule 3 - Blocking] Fixed cross-suite mock bleed breaking admin-auth/health and the BUG-02 rate-limiter tests**
- **Found during:** Task 5 (phase gate).
- **Issue:** (a) The BUG-03 test originally `mock.module('@/lib/auth/admin', ...)`, which leaked process-globally and made `admin-auth.test.ts` + `health-route.test.ts` see a null-returning `validateAdminAuth` (5 collateral failures). (b) The BUG-02 rate-limiter tests bound to the mock `UnifiedRateLimiter` class from `setupApiMocks`, which lacks the `.store` / `@upstash/redis` internals they assert.
- **Fix:** (a) BUG-03 test authorizes via the REAL `validateAdminAuth` with a valid Bearer token; `setupApiMocks` now supplies `ADMIN_SECRET`/`CRON_SECRET` (sourced from the shared `__TEST_ENV`, no duplicated literal) so the route's freshly-imported `admin.ts` is configured. (b) The two BUG-02 tests load the REAL `UnifiedRateLimiter` via a unique query-string specifier (a distinct bun module key that bypasses the alias mock; rate-limiter.ts is lightweight so no contamination).
- **Files modified:** `tests/unit/testimonials-route.test.ts`, `tests/unit/rate-limiter.test.ts`, `tests/test-utils.ts`.
- **Verification:** admin-auth + health + testimonials + rate-limiter + api-calc all green together; full suite 1090/0 twice (deterministic).
- **Committed in:** `5b4e3eba` (test-utils + rate-limiter + testimonials), `ab709160` (scheduled-emails extraction).

**3. [Rule 1 - Bug] Aikido pre-commit secret-scanner false positive on test fixture**
- **Found during:** Task 5 commit.
- **Issue:** The Aikido pre-commit hook flagged the test-only `ADMIN_SECRET` literal added to `tests/test-utils.ts` (identical value already committed in `tests/setup.ts`).
- **Fix:** Sourced the secrets from the shared `globalThis.__TEST_ENV` instead of re-typing the literal in both `test-utils.ts` and `testimonials-route.test.ts`. No `--no-verify` bypass used.
- **Verification:** Commit passed the hook; suites still green.
- **Committed in:** `5b4e3eba`.

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug). All in the test layer; no change to the four production fixes' behavior. No scope creep - the refactor preserves `processPendingEmails`'s public contract.

## Issues Encountered

- The hardest part was making the four regression tests pass in the full `bun test tests/` run (not just standalone) given bun's process-global `mock.module` (oven-sh/bun#7823). Resolved by (a) extracting BUG-01's DB logic into an injectable function and (b) loading the real rate-limiter via a distinct module key. bun does not run files in a stable alphabetical order across `tests/` subdirectories, so ordering-based fixes were rejected in favor of these order-independent designs.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All four bugs fixed; public function/contract signatures unchanged; no schema/DDL change; no new dependency.
- Gate green: `~/.bun/bin/bun run lint` clean, `~/.bun/bin/bun run typecheck` clean, `scripts/check-test-mock-leaks.sh` OK, full `~/.bun/bin/bun test tests/` 1090 pass / 0 fail (baseline 1073 -> +17 new tests).
- Ready for the code-only PR off origin/main (built separately by the orchestrator) and then Phase 21 (`code-hygiene`).

## Self-Check: PASSED

- Files: `src/lib/scheduled-emails-claim.ts`, `tests/unit/scheduled-emails-claim.test.ts`, `tests/unit/testimonials-route.test.ts`, `20-01-SUMMARY.md` all present.
- Commits: `308b9871`, `f0514e7b`, `2be8b2c2`, `c98ebe79`, `ab709160`, `5b4e3eba` all in history.

---
*Phase: 20-correctness-bugs*
*Completed: 2026-06-03*
