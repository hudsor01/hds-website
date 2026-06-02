---
phase: 13-admin-error-observability
plan: 09
subsystem: admin
tags: [typescript, discriminated-union, next-server-component, bun-test, admin, emails, error-state]

# Dependency graph
requires:
  - phase: 13-01 (shared primitives)
    provides: "AdminQueryResult<T> / AdminDetailResult<T> + ok/err/found/notFoundResult/errResult; AdminErrorState component"
provides:
  - "getQueueCounts -> AdminQueryResult<QueueCounts> (err() on DB failure, no more falsely-healthy all-zero record)"
  - "listScheduledEmailsForAdmin -> AdminQueryResult<ListScheduledEmailsResult> (err() on failure, ok-empty on zero rows)"
  - "getScheduledEmailById -> 3-way AdminDetailResult<ScheduledEmail> (found/not-found/error)"
  - "retryScheduledEmail narrows result.status === 'found' ? result.data : null; RetryResult contract unchanged"
  - "/admin/emails renders one grid-spanning AdminErrorState on a queue-counts failure; independent AdminErrorState for the list; chip count badges omitted when !counts.ok"
  - "/admin/emails/[id] 404s only on not-found, renders AdminErrorState on error (no misleading 404)"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Independent variants in a shared Promise.all: getQueueCounts and listScheduledEmailsForAdmin are each narrowed on their own, so a counts failure never blanks the list and vice versa (Pitfall 4)"
    - "One grid-spanning AdminErrorState replaces the 4-card stat row on a queue-counts failure (RESEARCH open-Q1 recommendation), never four falsely-healthy zero cards"
    - "get*ById change + its internal write-helper caller migrated in the SAME task (lockstep); whole-project typecheck is the straggler detector"

key-files:
  created: []
  modified:
    - src/lib/admin/emails-queries.ts
    - "src/app/(admin)/admin/emails/page.tsx"
    - "src/app/(admin)/admin/emails/[id]/page.tsx"
    - tests/unit/admin/emails-queries.test.ts

key-decisions:
  - "EMPTY_RESULT const deleted (its only purpose was the swallowed-error default, now replaced by err())"
  - "retryScheduledEmail narrowed to result.status === 'found' ? result.data : null so a DB error and a missing row both collapse to the existing not_found return; RetryResult union left as its own pre-existing mutation contract (NOT conflated with AdminQueryResult)"
  - "Chip count badges omitted (StatusFilterOption.count is optional) when !counts.ok rather than reading a count off the error variant"
  - "BUILD_PLACEHOLDER_ID short-circuit + await connection() left byte-unchanged (Pitfall 2: no PPR regression)"
  - "logger.error retained on all three read catch paths (caught error stays server-side, never crosses into AdminErrorState copy)"
  - "Test mock made thenable (covers getQueueCounts terminating on .groupBy()) and gained a db.update() chain so retryScheduledEmail runs its full lookup + update path"

patterns-established:
  - "Independent-variant page wiring: two AdminQueryResults sharing a Promise.all are narrowed separately so one failure cannot blank the other surface"

requirements-completed: [ADMINERR-01, ADMINERR-03, ADMINERR-04]

# Metrics
duration: 4min
completed: 2026-06-02
---

# Phase 13 Plan 09: Emails error-vs-empty + queue health + 3-way detail + retry lockstep Summary

**Migrated the emails read layer to the Wave-1 discriminated unions and the internal retry caller in lockstep: `getQueueCounts` returns `AdminQueryResult<QueueCounts>` (no more falsely-healthy all-zero record on error -> the page shows ONE grid-spanning `AdminErrorState`), `listScheduledEmailsForAdmin` returns `AdminQueryResult` (error vs empty distinguished, independent of the counts), `getScheduledEmailById` returns a 3-way `AdminDetailResult` (the detail page 404s only on a genuinely missing row and shows an error state on DB failure), and `retryScheduledEmail` narrows the detail union locally so its `RetryResult` contract stays byte-equal. The stale v4-era comments asserting the old return-[]/zero contract were rewritten to describe the returned-error-variant behavior.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-06-02T19:20Z
- **Completed:** 2026-06-02T19:24Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `src/lib/admin/emails-queries.ts`: `getQueueCounts` returns `AdminQueryResult<QueueCounts>` - the computed record is wrapped in `ok(...)`, the `catch` returns `err()` (was the `{pending:0,sent:0,failed:0,cancelled:0}` record) while keeping `logger.error('emails-queries.getQueueCounts failed', error)`. `listScheduledEmailsForAdmin` returns `AdminQueryResult<ListScheduledEmailsResult>` - success wrapped in `ok(...)`, `catch` returns `err()`; the now-unused `EMPTY_RESULT` const is deleted. `getScheduledEmailById` returns the 3-way `AdminDetailResult<ScheduledEmail>`: `found(row)` / `notFoundResult()` / `errResult()` (logs once on throw).
- **Internal-caller lockstep:** `retryScheduledEmail` calls `getScheduledEmailById` and relied on the old `null` contract. It now reads `const result = await getScheduledEmailById(id); const existing = result.status === 'found' ? result.data : null; if (!existing) return { ok: false, reason: 'not_found' }`, so both DB-error and not-found collapse to the existing `not_found` outcome. Its `RetryResult` union and behavior are byte-equal; whole-project typecheck confirmed there are no other external callers left on the old `null` contract.
- `src/app/(admin)/admin/emails/page.tsx`: the `Promise.all` shape is unchanged (both reads return variants, neither throws). The stat-card region renders the 4 cards from `counts.data` when `counts.ok`, else ONE grid-spanning `<AdminErrorState inline resource="queue health" />` (RESEARCH open-Q1). The `filterOptions` chip builder spreads `...(counts.ok ? { count: counts.data[s] } : {})` so a counts failure omits the per-status badges instead of reading the error variant. The list region renders `<AdminErrorState resource="scheduled emails" />` on `!list.ok`, the existing empty/search/table branches on `list.data`. A counts failure does not blank the list and vice versa.
- `src/app/(admin)/admin/emails/[id]/page.tsx`: `EmailDetailLoader` 3-way switches on `result.status` - `'not-found'` -> `notFound()`, `'error'` -> `<AdminErrorState resource="scheduled email" />`, else `result.data` is the row. The `if (id === BUILD_PLACEHOLDER_ID) notFound()` short-circuit and `await connection()` are byte-unchanged (Pitfall 2).
- **Stale comments updated:** the module-level read-helper note ("return a safe default so a query blip renders an empty state"), the `getQueueCounts` docblock ("Returns the zero record on query failure"), the `listScheduledEmailsForAdmin` docblock ("returns the empty result shape" + the "getQueueCounts intentionally NOT touched" NOTE), the page docblock ("cards always reflect" / "stays byte-equal"), and the detail-page docblock ("404s when missing") were all rewritten to describe the returned-error-variant behavior. A grep gate confirms no comment asserts the old return-[]/zero contract (`EMPTY_RESULT`, "empty result shape", "intentionally NOT touched", "zero record on query failure", "404s when missing" all return 0).
- `tests/unit/admin/emails-queries.test.ts`: rewrote the `getQueueCounts` sanity test into four cases (ok-populated, ok-zeros, ignore-bogus-status, error variant + one `logger.error`); rewrote the list DB-error case to `{ ok: false, error: true }` + the zero-rows case to `{ ok: true, data: {...} }`; all surviving list cases narrow `result.data`; added three `getScheduledEmailById` cases (found / not-found / error); added four `retryScheduledEmail` cases (ok, absent -> not_found, lookup-throws -> not_found, retryCount >= maxRetries -> max_retries_exceeded). The `db.select()` mock was made thenable (covers `getQueueCounts` terminating on `.groupBy()`) and gained a `db.update()` chain so the retry helper runs its full path.
- 24 passing unit tests in the file; full admin suite 252 pass / 0 fail; `bun run typecheck` green across the whole project; lint clean on all four touched files.

## Task Commits

Each task was committed atomically (pre-commit hooks ran on every commit; no `--no-verify`):

1. **Task 1: Migrate emails reads (queue + list + detail) + retry internal caller + tests** - `680a4cd6` (feat) - TDD task; test rewritten RED (15 failing), source migrated GREEN (24/24 passing), committed together.
2. **Task 2: Update both emails consumers (independent queue + list variants)** - `399415ff` (feat)

**Plan metadata:** (final commit) `docs(13-09): complete emails error-state plan`

## Files Created/Modified
- `src/lib/admin/emails-queries.ts` - `getQueueCounts` -> `AdminQueryResult<QueueCounts>`; `listScheduledEmailsForAdmin` -> `AdminQueryResult`; `getScheduledEmailById` -> 3-way `AdminDetailResult`; `EMPTY_RESULT` deleted; `retryScheduledEmail` narrows `result.status === 'found' ? result.data : null` (RetryResult unchanged); `logger.error` retained on all three read catches; constructors + types imported from `@/lib/admin/query-result`; stale docblocks rewritten.
- `src/app/(admin)/admin/emails/page.tsx` - narrows `counts` and `list` independently; grid-spanning `AdminErrorState` on `!counts.ok`; chip badges omitted when `!counts.ok`; separate `AdminErrorState` on `!list.ok`; docblock rewritten.
- `src/app/(admin)/admin/emails/[id]/page.tsx` - 3-way switch on `result.status`; `notFound()` only on `'not-found'`, `AdminErrorState` on `'error'`; placeholder short-circuit + `connection()` untouched; docblock updated.
- `tests/unit/admin/emails-queries.test.ts` - queue error variant + ok-counts, list error variant + ok-empty, 3-way detail, four retry-contract cases; thenable `db.select()` mock + stubbed `db.update()` chain.

## Decisions Made
- **`EMPTY_RESULT` deleted**, not retained: its sole purpose was the swallowed-error default this phase replaces with `err()`. Keeping it would leave a dead const and re-tempt the silent-empty anti-pattern.
- **`RetryResult` kept as its own contract, not conflated with `AdminQueryResult`**: it is a pre-existing mutation outcome (`{ ok: true; row } | { ok: false; reason }`). The lockstep narrow only translates the new 3-way detail union back to the old `null`-on-absent behavior the retry helper expects, so its public contract is byte-equal.
- **Chip count badges omitted on a counts failure**: `StatusFilterOption.count` is optional, so spreading `...(counts.ok ? { count: counts.data[s] } : {})` cleanly drops the badge rather than reading a number off the `{ ok: false }` variant.
- **One grid-spanning error over four error cards** (RESEARCH open-Q1): a queue-counts failure is a single read failing, so one `AdminErrorState` spanning the card row communicates that clearly without four duplicate alerts.
- **Placeholder short-circuit left byte-unchanged** (Pitfall 2): the new `'error'` branch only runs for real ids on real requests after `connection()`, the same fully-dynamic class as the existing render - no build-time prerender step is added.

## Deviations from Plan
None - plan executed exactly as written. (The test harness required two in-scope additions the plan's Task 1 action implies: the `db.select()` mock made thenable so `getQueueCounts` resolves on its `.groupBy()` terminal, and a stubbed `db.update()` chain so `retryScheduledEmail` runs its full lookup + update path. Both mirror the showcase test harness established in plan 13-05.)

## Issues Encountered
None. RED was confirmed (15 failing) before the source change; GREEN was confirmed (24/24) after. After Task 1 the only typecheck errors were in the two emails consumer pages (the Task-2 scope), as expected by the plan's RED/GREEN boundary; all cleared after Task 2. One biome quote-style autofix on the test file (double -> single quotes on string-literal test names with no embedded apostrophe) was applied via `biome check --write`; normal lint autoformat, not a behavioral change.

## Threat Model Status
- **T-13-14 (Repudiation / availability, getQueueCounts / emails page):** MITIGATED. A queue-counts failure renders a grid-spanning `AdminErrorState`, never a falsely-healthy all-zero queue (the ADMINERR-03 fix).
- **T-13-15 (Information disclosure, emails pages):** MITIGATED. Both pages render `AdminErrorState` (fixed generic copy); the caught DB error stays in `logger.error` server-side, the `err()` variant carries no payload.
- **T-13-04g (Repudiation / availability, emails/[id]):** MITIGATED. A DB error renders the error state; only a genuinely missing row 404s. The misleading-404-on-error path is gone.
- **T-13-16 (Tampering, retryScheduledEmail):** ACCEPTED (unchanged). The internal narrow preserves the existing "no row / error -> not_found" behavior; the `RetryResult` contract is byte-equal. Out of scope per CONTEXT.

## Known Stubs
None. All three reads are fully wired to the unions, both consumers narrow them independently, and the internal retry caller narrows the detail union; no placeholder data, no TODO/FIXME, no empty-data short-circuits introduced.

## Threat Flags
None. No new network endpoints, auth paths, file access, or schema changes were introduced; the change is purely the read-seam contract + its two consumers.

## User Setup Required
None - no external service configuration.

## Next Phase Readiness
- ADMINERR-01 (scheduled-emails list), ADMINERR-03 (queue health), and ADMINERR-04 (detail) are satisfied for the emails slice. This was the last Wave-2 read surface per the ROADMAP; the emails resource is fully migrated including the queue-health independent-variant case.
- No blockers.

## Self-Check: PASSED

- `src/lib/admin/emails-queries.ts` exists (modified); `src/app/(admin)/admin/emails/page.tsx` exists (modified); `src/app/(admin)/admin/emails/[id]/page.tsx` exists (modified); `tests/unit/admin/emails-queries.test.ts` exists (modified).
- Commits `680a4cd6` and `399415ff` are present in git history.
- `bun test tests/unit/admin/emails-queries.test.ts` = 24 pass / 0 fail; full admin suite = 252 pass / 0 fail; `bun run typecheck` = 0 errors; lint clean on all four touched files; grep gate: `getQueueCounts` catch returns `err()` (not `pending: 0`); no stale old-contract comment remains.

---
*Phase: 13-admin-error-observability*
*Completed: 2026-06-02*
