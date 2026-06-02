# Phase 16: intentional-noop-confirmation - Research

**Researched:** 2026-06-02
**Domain:** Test authoring (bun:test regression tests for env-gated no-ops) + `.planning` doc reconciliation
**Confidence:** HIGH (all claims verified against current source + git history; no external library behavior in scope)

## Summary

Phase 16 has two halves. **NOOP-02** adds cheap regression tests locking the documented no-op
behavior of four env-gated integrations. **NOOP-01** reconciles `.planning/v6-AUDIT-FINDINGS.md`
against what phases 11-15 actually shipped. This research de-risks the test-writing and surfaces a
**critical reconciliation hazard**: the local working tree is on a stale branch point (29 commits
behind `origin/main`), so the on-disk source does NOT reflect the merged state of phases 12-14, and
phase 15 is not yet merged at all. Reconcile against `origin/main` git state, not the local tree.

For NOOP-02, `tests/setup.ts` already mocks `@/env` with a `TEST_ENV` object that contains **none**
of the five gating variables (`GOOGLE_ADS_*`, `POSTGRES_URL`, `SENTRY_DSN`, `SLACK_WEBHOOK_URL`,
`DISCORD_WEBHOOK_URL`). That means the unset-env path is the **default** in every test — no env
manipulation is needed to exercise the no-op. The global `fetch` is also already mocked in setup,
but the cleanest assertion is to install a per-test local `fetch` spy and assert it was NOT called
(this is exactly the idiom the existing `ad-conversions.test.ts` "no-op gates" describe block uses).

**Primary recommendation:** Extend `tests/unit/ad-conversions.test.ts` for `sendAdConversion`
(already done — see Finding 1), add a new `tests/unit/db.test.ts` and `tests/unit/error-tracking.test.ts`,
and add `tests/unit/notifications.test.ts`. **Drop `sendSlack/sendDiscard` as direct unit targets** —
they are module-private (not exported); test the no-op through the exported `notifyHighValueLead`
instead (returns void, fetch not called). Reconcile NOOP-01 against `origin/main`, treating phase 15
items as "RESOLVED-IN-PHASE-15 (merge pending)" if not yet on main at execute time.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| sendAdConversion env gate | API/Backend (server-only) | — | `import 'server-only'`; called from contact route `after()` |
| db mock proxy | DB/Storage | API/Backend | `createMockDb` substitutes the Drizzle client at module load |
| reportError Sentry gate | API/Backend | Browser (NEXT_PUBLIC_SENTRY_DSN) | server `SENTRY_DSN` gate; `@sentry/nextjs` |
| Slack/Discord webhooks | API/Backend | — | `notifications.ts` (createServerLogger, server fetch) |
| NOOP-01 doc reconciliation | Planning artifact | — | `.planning/`-only; no tier |

## Standard Stack

No new packages. NOOP-02 uses the existing test stack only.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `bun:test` | Bun 1.3.x built-in | unit test runner (`describe`/`it`/`expect`/`mock`) | Project standard; `tests/unit/*.test.ts` [VERIFIED: package.json + tests/setup.ts] |
| `@sentry/nextjs` | ^10.55.0 | already a dep; error-tracking imports it | Present in package.json [VERIFIED: package.json] |

**Installation:** none — no packages added in this phase.

## Package Legitimacy Audit

Not applicable — NOOP-02 installs no external packages. NOOP-01 is `.planning`-doc-only. No audit required.

## Architecture Patterns

### Pattern 1: Default-unset env exercises the no-op (no env manipulation)
**What:** `tests/setup.ts` registers `mock.module('@/env', () => ({ env: TEST_ENV }))`. `TEST_ENV`
contains only `NODE_ENV`, `CSRF_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`,
`npm_package_version`, `BASE_URL`, `NEXT_PUBLIC_BASE_URL`, `ADMIN_SECRET`, `CRON_SECRET`.
**When to use:** Any test that wants the "creds unset" branch — it is already the default.
**Verification:** `grep` confirms none of `GOOGLE_ADS_*`, `POSTGRES_URL`, `SENTRY_DSN`,
`SLACK_WEBHOOK_URL`, `DISCORD_WEBHOOK_URL` appear in `TEST_ENV` [VERIFIED: tests/setup.ts:15-25].

### Pattern 2: Local fetch spy + assert-not-called (existing idiom)
**What:** Install a per-test `fetch` spy in `beforeEach`, restore the original in `afterEach`,
assert `expect(fetchSpy).not.toHaveBeenCalled()`.
**Example:**
```typescript
// Source: tests/unit/ad-conversions.test.ts:202-233 (existing, verified pattern)
let originalFetch: typeof globalThis.fetch
let fetchSpy: ReturnType<typeof mock>
beforeEach(() => {
  originalFetch = globalThis.fetch
  fetchSpy = mock(() => Promise.resolve(new Response('{}', { status: 200 })))
  globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch
})
afterEach(() => { globalThis.fetch = originalFetch })
it('does nothing when env is unset', async () => {
  await theFn(args)
  expect(fetchSpy).not.toHaveBeenCalled()
})
```

### Pattern 3: Mutate `__TEST_ENV` to flip a var on (only if a test needs the "configured" path)
**What:** `globalThis.__TEST_ENV` exposes the live `TEST_ENV` object; mutate keys, then `delete`
them in `afterEach`. NOOP-02 does NOT need this for the no-op assertions (default is unset), but it
is the established way to test the configured branch (used by ad-conversions live-upload tests).
**Source:** tests/setup.ts:30-33, used at tests/unit/ad-conversions.test.ts:203/219-223 [VERIFIED].

### Anti-Patterns to Avoid
- **Asserting inside the mocked fetch callback for never-throws functions:** `sendAdConversion`
  swallows all throws, so an `expect()` thrown inside `fetch` would be caught and the test would
  falsely pass. Assert OUTSIDE the mock (the existing test documents this at line 344-345). Same
  caution applies to `notifyHighValueLead` / Slack/Discord (they catch and return false).
- **Importing `sendSlackNotification` / `sendDiscordNotification` directly:** they are NOT exported.
  See Finding 4.
- **Re-registering `@/env` with a fresh object inside a test:** breaks already-captured
  `import { env }` bindings (tests/setup.ts:10-14 warns about this). Mutate `__TEST_ENV` instead.
- **Over-mocking Drizzle for the db test:** the mock proxy is already the default when `POSTGRES_URL`
  is unset; do not mock `@neondatabase/serverless` or `drizzle-orm`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unset-env simulation | Custom env-stubbing harness | The default `TEST_ENV` (gating vars already absent) | setup.ts already does it |
| fetch interception | A custom network mock layer | Local `fetch` spy + restore (Pattern 2) | Matches existing ad-conversions test |
| db client substitution | Mocking Drizzle/Neon | The real `createMockDb` proxy (auto-selected) | It IS the behavior under test |

**Key insight:** Every gate under test is already in its no-op state by default in `tests/setup.ts`.
The test simply imports the function and asserts the documented outcome — minimal mocking.

## NOOP-02 Targets — exact contract + cleanest test

### Target 1: `sendAdConversion` (src/lib/ad-conversions.ts:368)
- **Signature:** `export async function sendAdConversion(params: AdConversionParams): Promise<void>` — async, returns `Promise<void>`. [VERIFIED: ad-conversions.ts:368-370]
- **Gate:** `getConfig()` returns `null` when any of `GOOGLE_ADS_CUSTOMER_ID` / `GOOGLE_ADS_CONVERSION_ACTION_ID` / `GOOGLE_ADS_SA_JSON` is falsy (ad-conversions.ts:125-132). On `null`, `sendAdConversion` early-returns before any fetch (line 372-375). Whole body wrapped in try/catch -> never throws (line 371-411). [VERIFIED]
- **Driving "creds unset":** default — `TEST_ENV` has no `GOOGLE_ADS_*`. [VERIFIED: tests/setup.ts]
- **Assert:** `await sendAdConversion({...})` resolves (no throw) AND `fetchSpy` not called.
- **Existing test:** **EXTEND** `tests/unit/ad-conversions.test.ts`. The `sendAdConversion (no-op gates)` describe block ALREADY covers this exact case ("does nothing when GOOGLE_ADS_* env is unset", line 226-233) plus three more no-op gates (no-gclid, invalid SA JSON, missing private_key) and a full live-upload describe. **NOOP-02 for sendAdConversion is effectively already satisfied** — verify the existing tests pass and cite them; add only if a gap is found. No new file.

### Target 2: `db` mock proxy (src/lib/db.ts:42 / :70)
- **Contract:** `hasNoDatabase = !env.POSTGRES_URL` evaluated at **module load** (db.ts:21). `export const db` is fixed at load time: when `POSTGRES_URL` is unset it is `createMockDb()` (db.ts:70-71). The mock returns a Proxy where every property access returns a function producing a "chainable" Proxy; the chainable is a **thenable** (`then`/`catch`/`finally` resolve `Promise.resolve([])`). So `await db.select().from(x).where(y)` resolves to `[]`. [VERIFIED: db.ts:42-67]
- **Driving "unset":** default — `TEST_ENV` has no `POSTGRES_URL`. Because the gate is module-load-time, simply `import { db } from '@/lib/db'` and it is already the mock. [VERIFIED: tests/setup.ts + db.ts:21]
- **Thenable nuance:** the chain only resolves when awaited (or `.then`-ed). `db.select()` alone returns a Proxy, not `[]`; you must `await` the full chain (or just `await db.select()`) to get `[]`. The Proxy's `then` accepts the resolve callback, so `await` works. Drizzle real queries are also thenable, so a representative chain like `await db.select().from(...).where(...)` mirrors real usage — but `from`/`where` need a table arg; passing any object works since the mock ignores args. Simplest representative assertion: `expect(await db.select()).toEqual([])` and `expect(await db.query.anything.findMany()).toEqual([])`.
- **Assert:** a representative query chain `await`s to `[]`; no throw; do not need a real table.
- **Existing test:** **NEW** file `tests/unit/db.test.ts`. No existing db test. Keep it tiny (2-3 assertions). Note: db.ts has no `server-only` guard (by design, db.ts:5-14) so it imports cleanly under bun:test.

### Target 3: `reportError` (src/lib/error-tracking.ts:14)
- **Signature:** `export function reportError(error: unknown, tags: Record<string, string>): void` — synchronous, returns void. [VERIFIED: error-tracking.ts:14-22]
- **Gate:** `if (!env.SENTRY_DSN) return` (line 18-20) before `Sentry.captureException` (line 21). [VERIFIED]
- **Driving "unset":** default — `TEST_ENV` has no `SENTRY_DSN`. [VERIFIED: tests/setup.ts]
- **Assert (recommended):** spy on `Sentry.captureException` and assert it is NOT called when DSN unset. Use `mock.module('@sentry/nextjs', () => ({ captureException: mock() }))` at top of the test file, capture the spy, assert `not.toHaveBeenCalled()`. ALSO assert `reportError(new Error('x'), {})` does not throw. (`@sentry/nextjs` ^10.55.0 is installed — error-tracking imports `* as Sentry`.) [VERIFIED: package.json]
- **Lighter alternative:** assert only "returns without throwing" (no Sentry spy). The Sentry-not-called assertion is the stronger, intentional-by-contract version and is cheap — recommend it.
- **Existing test:** **NEW** file `tests/unit/error-tracking.test.ts`. No existing test. Re-apply the Sentry module mock in `beforeEach` if needed (setup.ts `mock.restore()` clears `mock()` spies; `mock.module` registrations for `@sentry/nextjs` would also be cleared — register inside the test file's own `beforeEach` or top-level and re-assert).

### Target 4: Slack / Discord webhooks (src/lib/notifications.ts)
- **CRITICAL:** `sendSlackNotification` (notifications.ts:35) and `sendDiscordNotification` (:189) are **NOT exported** — they are module-private. Only `notifyHighValueLead` (:338) is exported. [VERIFIED: `grep -nE '^export ' src/lib/notifications.ts` -> only line 338]
- **Private-fn contract:** each returns `Promise<boolean>`; when its webhook env (`SLACK_WEBHOOK_URL` / `DISCORD_WEBHOOK_URL`) is unset it `logger.warn(...)` and `return false` before any fetch (notifications.ts:36-44 and :192-200). [VERIFIED]
- **Exported entry contract:** `notifyHighValueLead(lead): Promise<void>`. It early-returns if `lead.leadScore < NOTIFICATION_MINIMUM_THRESHOLD` (= 70, lead-scoring.ts:91). For a `leadScore >= 70` lead it `Promise.allSettled([sendSlack, sendDiscord])`; with both webhooks unset, both inner fns return false WITHOUT calling fetch, and `notifyHighValueLead` resolves to `undefined`. [VERIFIED: notifications.ts:338-386]
- **Driving "unset":** default — `TEST_ENV` has neither webhook var. [VERIFIED: tests/setup.ts]
- **Recommended assert (through the public seam):** call `notifyHighValueLead(highScoreLead)` with `leadScore: 100`; assert it resolves to `undefined` (no throw) AND `fetchSpy` not called. This proves both webhook gates no-op without reaching into private functions or over-mocking. A second case with `leadScore: 0` proves the threshold early-return (also no fetch).
- **Existing test:** **NEW** file `tests/unit/notifications.test.ts`. No existing test. `notifications.ts` has no `server-only` guard; imports cleanly.
- **Brittleness call:** Testing `sendSlack/sendDiscord` directly is NOT possible without changing source (they're unexported) — **do not add exports just to test them** (violates no-source-change scope). Test through `notifyHighValueLead`. If the planner wants the most literal coverage, that public-seam test IS the clean contract; the private fns are an implementation detail.

### NOOP-02 coverage summary
| Target | Verdict | File action | Brittle? |
|--------|---------|-------------|----------|
| sendAdConversion | Already covered | EXTEND `ad-conversions.test.ts` (likely no-op; verify existing) | No |
| db mock proxy | Add | NEW `db.test.ts` | No |
| reportError | Add | NEW `error-tracking.test.ts` (Sentry spy) | No |
| Slack/Discord | Add via public seam | NEW `notifications.test.ts` (`notifyHighValueLead`) | Direct private-fn test would be brittle — DROPPED; public-seam test is clean |

## Runtime State Inventory

Not a rename/refactor/migration phase that touches stored data — NOOP-02 adds tests, NOOP-01 edits a
`.planning` doc. **None — verified:** no datastore keys, live-service config, OS-registered state,
secrets, or build artifacts change. (One git-state hazard is noted below under Common Pitfalls, but
it is not runtime state.)

## Common Pitfalls

### Pitfall 1: Reconciling NOOP-01 against the stale local tree instead of `origin/main`
**What goes wrong:** The local working tree (HEAD `a1a1138f`, the Phase 16 context commit) is **29
commits behind `origin/main` and 37 ahead** — a divergent branch. On disk, `processingFees`,
logger `group/groupEnd/table`, and `pageTitle` all still appear, which makes it look like phases
14/15 never ran. **They did** — they are merged on `origin/main`.
**Why it happens:** The Phase 16 context/branch was cut before phases 12-15 merged.
**Ground truth (verified via `git merge-base --is-ancestor ... origin/main`):**
| Phase | Item | On `origin/main`? | Correct NOOP-01 disposition |
|-------|------|-------------------|-----------------------------|
| 12 errorboundary-report-path | `/api/error-report/route.ts` | **YES** (PR #333, `f57839ff`) | Finding #3 RESOLVED-IN-PHASE-12 |
| 13 admin-error-observability | `AdminQueryResult` seam in `src/lib/admin/*-queries.ts` | **YES** (PR #334, `0acb7001`) | Admin silent-error-swallow RESOLVED-IN-PHASE-13 |
| 14 admin-page-title | `pageTitle` prop removed from Topbar | **YES** (PR #337, `e1942d87`) | admin `pageTitle` RESOLVED-IN-PHASE-14 |
| 15 dead-code-cleanup | logger `group/groupEnd/table` removed; ttl `processingFees` removed | **NOT YET on origin/main** (commits `05caf6aa`/`f4c14035` exist on phase-15 branch only) | RESOLVED-IN-PHASE-15 *(merge pending — verify at execute time)* |
| 15 dead-code-cleanup | contact-welcome `whiteSpace` | KEPT + clarified | VERIFIED-INTENTIONAL (kept by design) |
**How to avoid:** At execute time, rebase the Phase 16 branch onto current `origin/main` FIRST. Then
re-check the four items by `grep` on the rebased tree before writing dispositions. If phase 15 has
merged by then (logger group/processingFees gone), mark RESOLVED-IN-PHASE-15; if not, mark
"RESOLVED-IN-PHASE-15 (merge pending)" and do NOT claim they are gone in the doc.
**Warning signs:** A NOOP-01 disposition that says "REMOVED in Phase 15" while `grep processingFees
src/lib/ttl-calculator/calculator.ts` still returns a hit on the working tree.

> **Note to planner re: CONTEXT.md numbering.** The CONTEXT.md decision list maps "admin `pageTitle`
> -> RESOLVED-IN-PHASE-14" and "logger group/ttl processingFees -> RESOLVED-IN-PHASE-15". This matches
> the ROADMAP (`14 = admin-page-title`, `15 = dead-code-cleanup`). CONTEXT.md also says "Admin
> silent-error-swallow RESOLVED by Phase 13" and "admin pageTitle RESOLVED by Phase 14" — both
> **correct** per `origin/main`. The only nuance is phase-15 merge timing (above). CONTEXT.md is
> accurate as written; just verify phase-15 merge state before claiming the two phase-15 items are gone.

### Pitfall 2: `mock.restore()` in `beforeEach`/`afterEach` clears your Sentry/module spies
**What goes wrong:** `tests/setup.ts` calls `mock.restore()` in both `beforeEach` and `afterEach`
(lines 238, 251), then re-applies only the critical mocks (`@/env`, logger, next/cache, next/server).
A `mock.module('@sentry/nextjs', ...)` you register at file top is cleared between tests.
**How to avoid:** Register the Sentry mock (and capture the `captureException` spy) inside the test
file's own `beforeEach`, after setup's restore runs (test-file `beforeEach` runs after setup's). Or
register at top-level AND inside `beforeEach`. The existing ad-conversions test sidesteps this by
spying on `globalThis.fetch` per-test rather than module-mocking.
**Warning signs:** Sentry spy shows 0 calls in a test that should have called it, or a flaky pass.

### Pitfall 3: Global fetch is already mocked — don't rely on it for assert-not-called
**What goes wrong:** `tests/setup.ts:225-229` sets `globalThis.fetch = mock(() => Promise.resolve(mockResponse))`
globally, and `beforeEach` does NOT re-create it (only `mock.restore()` resets call counts on
`mock()` instances). Relying on the global spy's call count across tests is fragile.
**How to avoid:** Install a fresh local `fetch` spy in each test's `beforeEach` and restore in
`afterEach` (Pattern 2 / the ad-conversions idiom). Assert on the local spy.

### Pitfall 4: Pre-existing 21-failure baseline in the full suite
**What goes wrong:** `bun run test:unit` reports ~21 failures from `homepage.test.tsx` +
`navigation.test.tsx` cross-file RTL pollution (documented in STATE.md, deferred-items.md). New tests
must produce **0 net-new** failures; do not "fix" the pollution failures (out of scope).
**How to avoid:** Run the new test files in isolation to confirm green, then confirm the full-suite
failure count is unchanged from the documented baseline.

## Code Examples

### db mock proxy no-op (new tests/unit/db.test.ts)
```typescript
// POSTGRES_URL is absent from TEST_ENV (tests/setup.ts), so `db` is createMockDb() at module load.
import { describe, expect, it } from 'bun:test'
import { db } from '@/lib/db'

describe('db mock proxy (POSTGRES_URL unset)', () => {
  it('resolves a select chain to [] without a real database', async () => {
    expect(await db.select()).toEqual([])
  })
  it('resolves a chained query to [] and never throws', async () => {
    // args are ignored by the mock proxy; passing {} stands in for a table
    await expect(db.select().from({}).where({})).resolves.toEqual([])
  })
})
```

### reportError no-op (new tests/unit/error-tracking.test.ts)
```typescript
import { beforeEach, describe, expect, it, mock } from 'bun:test'
const captureException = mock()
mock.module('@sentry/nextjs', () => ({ captureException }))
beforeEach(() => { mock.module('@sentry/nextjs', () => ({ captureException })) })

describe('reportError (SENTRY_DSN unset)', () => {
  it('does not call Sentry and does not throw', async () => {
    const { reportError } = await import('@/lib/error-tracking')
    expect(() => reportError(new Error('boom'), { route: '/x' })).not.toThrow()
    expect(captureException).not.toHaveBeenCalled()
  })
})
```

### Slack/Discord no-op via public seam (new tests/unit/notifications.test.ts)
```typescript
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { notifyHighValueLead } from '@/lib/notifications'

const HIGH_LEAD = {
  leadId: 'l1', firstName: 'A', lastName: 'B', email: 'a@b.com',
  leadScore: 100, leadQuality: 'urgent', source: 'contact'
}

describe('notifyHighValueLead (webhooks unset)', () => {
  let originalFetch: typeof globalThis.fetch
  let fetchSpy: ReturnType<typeof mock>
  beforeEach(() => {
    originalFetch = globalThis.fetch
    fetchSpy = mock(() => Promise.resolve(new Response('{}', { status: 200 })))
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch
  })
  afterEach(() => { globalThis.fetch = originalFetch })

  it('sends nothing (no fetch, no throw) when SLACK/DISCORD webhooks are unset', async () => {
    await expect(notifyHighValueLead(HIGH_LEAD)).resolves.toBeUndefined()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
  it('skips low-score leads before touching any webhook', async () => {
    await expect(notifyHighValueLead({ ...HIGH_LEAD, leadScore: 0 })).resolves.toBeUndefined()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `bun:test` (Bun 1.3.x) [VERIFIED] |
| Config file | none (uses `tests/setup.ts` preload) [VERIFIED: tests/setup.ts] |
| Quick run command | `bun test tests/unit/db.test.ts tests/unit/error-tracking.test.ts tests/unit/notifications.test.ts tests/unit/ad-conversions.test.ts` |
| Full suite command | `bun run test:unit` (alias `bun test tests/`) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NOOP-02 | `sendAdConversion` no-op (no fetch, no throw) when creds unset | unit | `bun test tests/unit/ad-conversions.test.ts` | YES (extend/verify) |
| NOOP-02 | `db` select chain resolves to `[]` when `POSTGRES_URL` unset | unit | `bun test tests/unit/db.test.ts` | NO — Wave 0 |
| NOOP-02 | `reportError` no-op (no Sentry call, no throw) when `SENTRY_DSN` unset | unit | `bun test tests/unit/error-tracking.test.ts` | NO — Wave 0 |
| NOOP-02 | Slack/Discord no fetch (via `notifyHighValueLead`) when webhooks unset | unit | `bun test tests/unit/notifications.test.ts` | NO — Wave 0 |
| NOOP-01 | `.planning/v6-AUDIT-FINDINGS.md` dispositions match `origin/main` | manual (doc review) | `git grep` checks on rebased tree | N/A (doc) |

### What each regression test observably asserts
- **sendAdConversion:** local `fetchSpy` not called + promise resolves to `undefined` (existing).
- **db:** `await db.select()` deep-equals `[]`; chained `await db.select().from({}).where({})` resolves `[]`; no throw.
- **reportError:** `Sentry.captureException` spy `not.toHaveBeenCalled()`; call does not throw.
- **notifyHighValueLead:** resolves to `undefined`; local `fetchSpy` not called (both high-score-no-webhook and low-score cases).

### Sampling Rate
- **Per task commit:** run the four target files (quick command above).
- **Per wave merge:** `bun run test:unit` — confirm 0 net-new failures vs the documented ~21 pre-existing baseline.
- **Phase gate:** `bun run lint && bun run typecheck && bun run test:unit && bun run build` (CONTEXT.md:60).

### Wave 0 Gaps
- [ ] `tests/unit/db.test.ts` — covers NOOP-02 (db mock proxy)
- [ ] `tests/unit/error-tracking.test.ts` — covers NOOP-02 (reportError Sentry gate)
- [ ] `tests/unit/notifications.test.ts` — covers NOOP-02 (Slack/Discord via notifyHighValueLead)
- [ ] No framework install needed; no shared fixtures needed (tests are self-contained).
- [ ] `tests/unit/ad-conversions.test.ts` already covers the sendAdConversion no-op gate — verify green, extend only if a gap is found.

## Security Domain

`security_enforcement` not set to false in scope. This phase adds tests + edits a planning doc; it
introduces no auth, input-handling, crypto, or network surface. ASVS categories below for completeness:

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no (no new inputs; tests assert existing behavior) | existing Zod at boundaries |
| V6 Cryptography | no | — |

The no-ops under test are themselves a security-relevant graceful-degradation property (services do
not fire without configured creds); NOOP-02 locks that property by contract, which is a net security
positive.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Phase 15 (logger group / ttl processingFees removal) will be merged to `origin/main` by the time Phase 16 executes | Pitfall 1 | If not merged, NOOP-01 must say "merge pending" for those two items rather than "removed". Mitigated: research instructs a re-grep at execute time. |

**Everything else is verified or cited.** (A1 is timing-dependent on another phase's merge, hence
flagged rather than asserted.)

## Open Questions

1. **Does NOOP-02 require a fresh test for `sendAdConversion`, or is the existing coverage accepted?**
   - What we know: `tests/unit/ad-conversions.test.ts` already has a `sendAdConversion (no-op gates)`
     describe with the exact unset-env assertion plus three more no-op gates and a live-upload suite.
   - What's unclear: whether the planner counts the existing test as satisfying NOOP-02 or wants a
     dedicated/duplicated assertion.
   - Recommendation: count the existing test (verify it passes, cite it in the SUMMARY). Do not
     duplicate. Add only `db`, `error-tracking`, `notifications` tests.

2. **Phase 15 merge timing (see Assumption A1).**
   - Recommendation: rebase Phase 16 onto `origin/main` at execute time and re-grep the two phase-15
     items before writing their NOOP-01 disposition.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun | test runner | ✓ | 1.3.x | — |
| `@sentry/nextjs` | error-tracking import | ✓ | ^10.55.0 | — |

No external services required (the whole point: tests exercise the unset/no-op path). No blocking
dependencies.

## State of the Art

No fast-moving external tech in scope. The only "state" that matters is the **git merge state** of
phases 12-15 (documented in Pitfall 1), which must be re-checked at execute time.

## Sources

### Primary (HIGH confidence)
- Source files (read in full or relevant ranges): `src/lib/ad-conversions.ts`, `src/lib/db.ts`,
  `src/lib/error-tracking.ts`, `src/lib/notifications.ts`, `src/env.ts`, `tests/setup.ts`,
  `tests/unit/ad-conversions.test.ts`, `tests/unit/rate-limiter.test.ts`,
  `src/lib/constants/lead-scoring.ts` — verified behavior, exports, and gates.
- `git` (`merge-base --is-ancestor`, `ls-tree`, `grep` on `origin/main`) — verified which phases
  (12/13/14) are merged on `origin/main` and which (15) are not; confirmed local tree divergence
  (29 behind / 37 ahead).
- `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/REQUIREMENTS.md`,
  `.planning/v6-AUDIT-FINDINGS.md`, `.planning/phases/16-.../16-CONTEXT.md` — phase numbering,
  requirement text, audit dispositions.
- `package.json` — `@sentry/nextjs` ^10.55.0 present; no new deps needed.

### Secondary (MEDIUM confidence)
- None.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- NOOP-02 test contracts: HIGH — read every target's gate + return type directly; confirmed `TEST_ENV` lacks all gating vars.
- Slack/Discord export constraint: HIGH — `grep '^export'` confirms only `notifyHighValueLead` is exported.
- NOOP-01 reconciliation facts: HIGH for the merged state of phases 12/13/14 on `origin/main`; MEDIUM for phase-15 timing (Assumption A1 — re-verify at execute).
- Test idioms (fetch spy, `__TEST_ENV`, mock.restore caveat): HIGH — sourced from the existing passing ad-conversions test + setup.ts.

**Research date:** 2026-06-02
**Valid until:** 2026-07-02 for code contracts (stable); the git merge-state facts (Pitfall 1) are
valid until the next merge to `origin/main` — re-check at execute time.
