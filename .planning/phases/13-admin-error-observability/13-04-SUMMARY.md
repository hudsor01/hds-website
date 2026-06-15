---
phase: 13-admin-error-observability
plan: 04
subsystem: admin
tags: [typescript, discriminated-union, next-server-component, bun-test, admin, newsletter, error-state]

# Dependency graph
requires:
  - phase: 13-01 (shared primitives)
    provides: "AdminQueryResult<T> / AdminDetailResult<T> + ok/err/found/notFoundResult/errResult; AdminErrorState component"
provides:
  - "listSubscribersForAdmin -> AdminQueryResult<ListSubscribersResult> (err() on DB failure, ok-empty on zero rows)"
  - "getSubscriberById -> 3-way AdminDetailResult<SubscriberRow> (found/not-found/error)"
  - "newsletter list page renders AdminErrorState on !result.ok; empty state reserved for genuine zero rows"
  - "subscriber detail page 404s only on not-found, renders AdminErrorState on error (no misleading 404)"
affects: [13-05, 13-06, 13-07, 13-08, 13-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "list query catch returns err() (not EMPTY_RESULT); zero-rows returns ok({rows:[]...}) - error vs empty are now distinguishable"
    - "get*ById returns the 3-way detail union; consumer switches on result.status (not-found -> notFound(), error -> AdminErrorState)"
    - "newsletter test mock unchanged: both queries terminate on .limit() so the existing limit()-settling chain drives getSubscriberById's single .limit(1) select (no thenable needed, unlike the leads Promise.all harness)"

key-files:
  created: []
  modified:
    - src/lib/admin/newsletter-queries.ts
    - src/app/(admin)/admin/newsletter/page.tsx
    - src/app/(admin)/admin/newsletter/[id]/page.tsx
    - tests/unit/admin/newsletter-queries.test.ts

key-decisions:
  - "EMPTY_RESULT const deleted (its only purpose was the swallowed-error default, now replaced by err())"
  - "newsletter test mock left as-is (limit()-terminating chain): both listSubscribersForAdmin and getSubscriberById terminate on .limit(), so no thenable conversion was required (the leads file needed it only because getLeadById uses a Promise.all of .orderBy()-terminated selects)"
  - "BUILD_PLACEHOLDER_ID short-circuit + await connection() left byte-unchanged (Pitfall 2: no PPR $~ regression)"
  - "GDPR hard-delete path (deleteSubscriberAction / deleteSubscriber) untouched - only the read seam migrated"
  - "logger.error retained on both catch paths (caught error stays server-side, never crosses into AdminErrorState copy)"

patterns-established:
  - "Per-resource Wave 2 migration shape applied to newsletter: wrap reads in the unions + teach consumers to narrow, in lockstep so typecheck catches any straggler"

requirements-completed: [ADMINERR-01, ADMINERR-04]

# Metrics
duration: 3min
completed: 2026-06-02
---

# Phase 13 Plan 04: Newsletter error-vs-empty + 3-way detail Summary

**Migrated the newsletter read layer to the Wave-1 discriminated unions and taught both consumers to render the shared error state: `listSubscribersForAdmin` returns `AdminQueryResult<ListSubscribersResult>` (the list page shows `AdminErrorState` on failure, empty state only on genuine zero rows) and `getSubscriberById` returns a 3-way `AdminDetailResult<SubscriberRow>` (the detail page 404s only on not-found, renders `AdminErrorState` on DB error). The GDPR hard-delete path was left untouched.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-02T18:25:34Z
- **Completed:** 2026-06-02T18:28:18Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- `src/lib/admin/newsletter-queries.ts`: `listSubscribersForAdmin` now returns `AdminQueryResult<ListSubscribersResult>` - success payload wrapped in `ok(...)`, the `catch` returns `err()` (was `EMPTY_RESULT`) while keeping the `logger.error` line. The now-unused `EMPTY_RESULT` const is deleted (grep gate returns 0). `getSubscriberById` returns the 3-way `AdminDetailResult<SubscriberRow>`: `found(row)` on a present row, `notFoundResult()` when no row, `errResult()` on throw (logs once). The doc comments were updated to describe the new failure semantics.
- `src/app/(admin)/admin/newsletter/page.tsx`: narrows the union - `if (!result.ok) return <AdminErrorState resource="subscribers" />`, then destructures `result.data`. The existing `rows.length === 0 ? <empty> : <Table>` branch is unchanged and now only runs on genuine success.
- `src/app/(admin)/admin/newsletter/[id]/page.tsx`: switches on `result.status` - `'not-found'` -> `notFound()`, `'error'` -> `<AdminErrorState resource="subscriber" />`, then reads `result.data`. The `if (id === BUILD_PLACEHOLDER_ID) notFound()` short-circuit and `await connection()` are byte-unchanged (verified in the diff as context lines, not edits) so the PPR placeholder path is intact (Pitfall 2). The GDPR `deleteSubscriberAction` form and the unsubscribe/re-subscribe action wrappers were not touched.
- `tests/unit/admin/newsletter-queries.test.ts`: rewrote the DB-error case to assert `{ ok: false, error: true }` (not the empty shape) with `logger.error` called once; the zero-rows case now asserts `ok` with empty `data.rows` (distinct from error); all surviving list cases narrow `result.data`; added three `getSubscriberById` cases (found / not-found / error). No mock-harness change was needed - the existing `.limit()`-settling chain already drives both queries (newsletter's `getSubscriberById` is a single `.limit(1)` select, not a `Promise.all`).
- 17 passing unit tests; `bun run typecheck` green across the whole project (0 errors); lint clean on the two touched source files.

## Task Commits

Each task was committed atomically (hooks ran on every commit; no `--no-verify`):

1. **Task 1: Migrate newsletter-queries reads + update tests** - `13921fc` (feat) - TDD task; test rewritten RED (12 failing), source migrated GREEN (17/17 passing), committed together.
2. **Task 2: Update both newsletter consumers to render AdminErrorState** - `18a5c5` (feat)

**Plan metadata:** (final commit) `docs(13-04): complete newsletter error-state plan`

## Files Created/Modified
- `src/lib/admin/newsletter-queries.ts` - `listSubscribersForAdmin` -> `AdminQueryResult<ListSubscribersResult>` (`ok`/`err`); `getSubscriberById` -> `AdminDetailResult<SubscriberRow>` (`found`/`notFoundResult`/`errResult`); `EMPTY_RESULT` deleted; `logger.error` retained on both catches; constructors + types imported from `@/lib/admin/query-result`.
- `src/app/(admin)/admin/newsletter/page.tsx` - narrows `result.ok`, renders `<AdminErrorState resource="subscribers" />` on failure; empty/table branch unchanged.
- `src/app/(admin)/admin/newsletter/[id]/page.tsx` - switches on `result.status`; 404 only on `'not-found'`, `<AdminErrorState resource="subscriber" />` on `'error'`; placeholder short-circuit + `connection()` untouched; GDPR delete path untouched.
- `tests/unit/admin/newsletter-queries.test.ts` - error variant (not empty), ok-empty, 3-way detail.

## Decisions Made
- **`EMPTY_RESULT` deleted**, not retained: its sole purpose was the swallowed-error default that this phase replaces with `err()`. Keeping it would leave a dead const and re-tempt the silent-empty anti-pattern.
- **Test mock left unchanged** (no thenable conversion): unlike `leads-queries.test.ts`, the newsletter mock did not need to become thenable. Both `listSubscribersForAdmin` (terminates on `.limit(PAGE_SIZE + 1)`) and `getSubscriberById` (terminates on `.limit(1)`) settle on the chain's existing `.limit()` method, which already returns the settled promise / rejection. The leads file needed a `then()` only because `getLeadById` awaits a `Promise.all` of `.orderBy()`-terminated selects; newsletter has no such shape.
- **Placeholder short-circuit left byte-unchanged** (Pitfall 2): the new `'error'` branch only runs for real ids on real requests after `connection()`, the same fully-dynamic class as the existing render - no build-time prerender step is added, so no `$~` PPR regression.
- **GDPR delete surface left untouched**: the plan flagged this page as the GDPR-delete surface. Only the read seam (`getSubscriberById` + the loader's null check) was migrated; `deleteSubscriberAction`, `unsubscribeForm`, and `resubscribeForm` are byte-unchanged.

## Deviations from Plan
None - plan executed exactly as written. (The plan's Task 1 action mirrors the leads migration, which involved a thenable-mock change; that change was specific to leads' `Promise.all` and was correctly NOT needed here - the newsletter mock's `.limit()` terminal already covers both queries.)

## Issues Encountered
None. RED was confirmed (12 failing) before the source change; GREEN was confirmed (17/17) after. The whole-project typecheck briefly showed the expected consumer errors (19 lines across the two newsletter pages) after Task 1; all cleared after Task 2.

## Threat Model Status
- **T-13-05 (Information disclosure, newsletter pages):** MITIGATED. Both pages render `AdminErrorState` (fixed generic copy, never the exception); the caught DB error stays in `logger.error` server-side.
- **T-13-04c (Repudiation / availability, newsletter/[id]):** MITIGATED. A DB error renders the error state; only a genuinely missing row 404s. The misleading-404-on-error path is gone.

## Known Stubs
None. Both reads are fully wired to the unions and both consumers narrow them; no placeholder data, no TODO/FIXME, no empty-data short-circuits introduced.

## User Setup Required
None - no external service configuration.

## Next Phase Readiness
- The newsletter resource follows the same per-resource Wave 2 shape as leads (13-02); plans 13-05..13-09 continue it (wrap the read, narrow in the consumer, assert the error variant + 3-way).
- No blockers.

## Self-Check: PASSED

- `src/lib/admin/newsletter-queries.ts` exists (modified); `src/app/(admin)/admin/newsletter/page.tsx` exists (modified); `src/app/(admin)/admin/newsletter/[id]/page.tsx` exists (modified); `tests/unit/admin/newsletter-queries.test.ts` exists (modified).
- Commits `13921fc` and `18a5c5` are present in git history.
- `bun test tests/unit/admin/newsletter-queries.test.ts` = 17 pass / 0 fail; `bun run typecheck` = 0 errors; grep gate `EMPTY_RESULT` = 0.

---
*Phase: 13-admin-error-observability*
*Completed: 2026-06-02*
