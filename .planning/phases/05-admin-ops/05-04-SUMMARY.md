---
phase: 05-admin-ops
plan: 04
subsystem: admin-newsletter
tags: [admin, newsletter, server-actions, gdpr, drizzle]
dependency-graph:
  requires:
    - 05-01 (StatusFilterBar + StatusBadge primitives)
    - 04-CONTEXT.md D-12 (defense-in-depth auth, requireAdminSession in actions)
    - phase-04 admin/auth + admin/form-data helpers
  provides:
    - operator UI to list / filter / inspect newsletter subscribers
    - operator mutations: unsubscribe, re-subscribe, GDPR hard delete
  affects: []
tech-stack:
  added: []
  patterns:
    - "<form action={voidWrapper}> wrapping ActionResult-returning Server Action (matches sibling 05-03 calculator-leads pattern)"
    - "thin async function with 'use server' directive as a void-returning seam for the form binding"
    - "Suspense + await connection() + generateStaticParams placeholder (Phase 04 Wave 3 idiom)"
key-files:
  created:
    - src/lib/schemas/admin-newsletter.ts
    - src/lib/admin/newsletter-queries.ts
    - src/app/admin/newsletter/actions.ts
    - src/app/admin/newsletter/page.tsx
    - src/app/admin/newsletter/[id]/page.tsx
  modified: []
decisions:
  - "Operator-settable status enum (setStatusSchema) is ['active', 'unsubscribed']. `bounced` is observable but not operator-settable (set by the email provider webhook). Filter chips still expose 'bounced' so the operator can see bounced rows."
  - "Detail page renders exactly ONE action button driven by current status: active -> Unsubscribe, unsubscribed -> Re-subscribe, bounced/other -> 'No mutations available for this status.'"
  - "Delete is GDPR-compliant hard delete (CONTEXT.md section 5.3). DeleteButton's native window.confirm is the v1 UX."
  - "Form-action wrapper pattern: thin void-returning Server Action wrappers (`unsubscribeForm`, `resubscribeForm`) wrap the ActionResult-returning raw actions so `<form action={...}>` typechecks. The single-button forms drop the {ok, errors} envelope; a later plan that wants inline error display can switch to `useActionState` against the raw actions without touching them."
metrics:
  duration: "~8 min"
  completed: "2026-05-23"
---

# Phase 05 Plan 04: Newsletter Ops Summary

One-liner: Replace the Phase-03 `/admin/newsletter` coming-soon stub with an operator-facing list (status-filterable, ≤200 most recent), per-row detail page, and three Server Actions for unsubscribe / re-subscribe / GDPR hard-delete, all wired through `requireAdminSession()` for defense in depth.

## Files

| Path | Lines | Role |
|------|------:|------|
| `src/lib/schemas/admin-newsletter.ts` | 37 | Zod schemas: `setStatusSchema`, `deleteSubscriberSchema` |
| `src/lib/admin/newsletter-queries.ts` | 139 | Server-only Drizzle data layer: `listSubscribersForAdmin`, `getSubscriberById`, `setSubscriberStatus`, `deleteSubscriber`, plus the `SUBSCRIBER_STATUSES` const + `SubscriberStatus` type |
| `src/app/admin/newsletter/actions.ts` | 122 | 3 Server Actions: `unsubscribeSubscriberAction`, `resubscribeSubscriberAction`, `deleteSubscriberAction`. Exports `ActionResult` envelope. |
| `src/app/admin/newsletter/page.tsx` | 148 | List page: status filter chips + 6-col table sorted by `subscribedAt DESC` |
| `src/app/admin/newsletter/[id]/page.tsx` | 192 | Detail page: Subscription dl + Actions section (one button per status) + Danger section (DeleteButton) |

Total: 5 new files, 638 lines insertions, 0 modifications, 0 deletions.

## Query layer (4 functions)

1. `listSubscribersForAdmin(status?, limit = 200) -> SubscriberRow[]` — DESC by `subscribedAt`, optional `where(status)` filter. Try/catch + `[]` fallback + `logger.error`.
2. `getSubscriberById(id) -> SubscriberRow | null` — single row select. Try/catch + null fallback.
3. `setSubscriberStatus(id, 'active'|'unsubscribed') -> SubscriberRow | null` — branches on intent. For `active`: also nulls `unsubscribedAt`. For `unsubscribed`: sets `unsubscribedAt = now()`. Always bumps `updatedAt`. Lets exceptions escape so the action layer can map them.
4. `deleteSubscriber(id) -> boolean` — true when a row was removed. Try/catch + `false` fallback.

## Action layer (3 actions)

| Action | Return | Status transition | Revalidates |
|--------|--------|-------------------|-------------|
| `unsubscribeSubscriberAction` | `ActionResult` | -> `unsubscribed`, `unsubscribedAt=now()` | `/admin/newsletter`, `/admin/newsletter/{id}` |
| `resubscribeSubscriberAction` | `ActionResult` | -> `active`, `unsubscribedAt=null` | `/admin/newsletter`, `/admin/newsletter/{id}` |
| `deleteSubscriberAction` | `void` (redirects) | hard DELETE | `/admin/newsletter` |

Every action calls `await requireAdminSession()` as its first statement. `grep -c 'await requireAdminSession()'` = 4 (3 actual calls + 1 doc-comment reference).

## Route paths

- `GET /admin/newsletter` — list with `?status={active|unsubscribed|bounced}` filter (omit = all)
- `GET /admin/newsletter/{id}` — detail with action buttons (one per status), GDPR delete

## Deviations from Plan

### Rule 1 - Bug: TypeScript form-action prop signature

**Found during:** Task 3
**Issue:** Plan's literal `<form action={unsubscribeSubscriberAction}>` snippet fails typecheck because `Promise<ActionResult>` is not assignable to React's `form.action` prop signature `void | Promise<void>`. Same bug the sibling 05-03 (calculator-leads) hit, and they shipped the canonical fix.
**Fix:** Added two thin void-returning Server Action wrappers (`unsubscribeForm`, `resubscribeForm`) inside `src/app/admin/newsletter/[id]/page.tsx` (each `await`s the raw action and drops the envelope). The forms bind to these wrappers. Pattern matches sibling 05-03 verbatim (same comment block lifted).
**Files modified:** `src/app/admin/newsletter/[id]/page.tsx` (within scope)
**Commit:** c48bd08

Acceptance criterion language (`contains '<form action={unsubscribeSubscriberAction}'`) was not strictly met — the literal binding in the detail page is `<form action={unsubscribeForm}>`. The raw `unsubscribeSubscriberAction` is still referenced (imported and awaited inside the wrapper), and the FROM acceptance criterion that drove this requirement (typecheck passing) is met. Documented for the verifier.

### Rule 1 - Bug: import ordering after first lint pass

**Found during:** Task 3 first lint
**Issue:** Biome's `organizeImports` flagged `newsletter-queries` import block ordering.
**Fix:** Reordered to `listSubscribersForAdmin, SUBSCRIBER_STATUSES, type SubscriberStatus`.
**Files modified:** `src/app/admin/newsletter/page.tsx` (within scope)
**Commit:** c48bd08

## Commit-attribution race (Wave 2 parallel-execution wart)

Task 1 files (`src/lib/schemas/admin-newsletter.ts` + `src/lib/admin/newsletter-queries.ts`) are committed under SHA `2445bc1` — but the commit message says `feat(05-02): leads admin Server Actions seam`. A sibling Wave-2 agent's commit operation swept my newly-staged files into their commit. This is the same parallel-agent race that bit Phase 04 Wave 2 (`a0128f3` per STATE.md). End state on disk is correct; future readers should verify per-file ownership with `git show 2445bc1 --stat`.

Mitigation taken for Tasks 2 + 3: deferred all staging until both files were ready, then made a single combined commit `c48bd08` containing exactly the 3 newsletter UI files. That commit's `--stat` is clean and correctly attributed.

## Threat surface scan

No new network endpoints. No new auth paths. No file access. The admin layer adds a NEW second read path against `newsletter_subscribers` but the table's trust boundary (public reads via `/api/newsletter` for unsubscribe links) is unchanged. The `/api/newsletter` route handler and `/unsubscribe` page are byte-equal to main.

The `deleteSubscriberAction` introduces a new mutation surface but it sits behind two-layer auth (admin layout + `requireAdminSession()` in the action body) per CONTEXT.md D-12.

No new threat flags.

## Verification evidence

| Gate | Result |
|------|--------|
| `bun run lint` | exit 0 (356 files, 0 diagnostics) |
| `bun run typecheck` | exit 0 |
| Em/en-dash sweep on 5 new files | 0 matches |
| `grep -E 'console\.|process\.env\.|: any|<any>|as any'` on 5 new files | 0 matches |
| `grep -c 'await requireAdminSession()' src/app/admin/newsletter/actions.ts` | 4 (>= 3 required) |
| `grep -c 'revalidatePath' src/app/admin/newsletter/actions.ts` | 5 (>= 3 required) |
| Protected files diff vs main | empty (auth/proxy/api/newsletter/api/process-emails/unsubscribe/dashboard-queries/admin primitives all byte-equal) |
| Sibling Wave-2 surface modifications in my commits | 0 (`git show c48bd08 --stat` is 3 files all under `src/app/admin/newsletter/`) |

`bun run build` was NOT executed per plan's hard constraint ("Do NOT run `bun run build`"); the global typecheck pass is the typecheck half of the build, and the lint pass plus em-dash sweep plus auth-count plus protected-files diff are all green.

## Self-Check: PASSED

- src/lib/schemas/admin-newsletter.ts: FOUND
- src/lib/admin/newsletter-queries.ts: FOUND
- src/app/admin/newsletter/actions.ts: FOUND
- src/app/admin/newsletter/page.tsx: FOUND
- src/app/admin/newsletter/[id]/page.tsx: FOUND
- Commit c48bd08: FOUND (3-file newsletter UI commit)
- Commit 2445bc1: FOUND (race-mixed; contains Task 1 newsletter files plus sibling leads action file)
