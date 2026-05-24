---
phase: 05-admin-ops
plan: 05
subsystem: admin-emails
tags: [admin, emails, scheduled-emails, queue, ops]
requirements: [P05]
dependency_graph:
  requires: [05-01]
  provides:
    - "/admin/emails route (server list + status filter + 4 stat cards)"
    - "/admin/emails/[id] route (server detail + retry/cancel/delete)"
    - "src/lib/admin/emails-queries.ts (6 functions)"
    - "src/lib/schemas/admin-emails.ts (3 Zod schemas)"
    - "src/app/admin/emails/actions.ts (3 Server Actions + ActionResult)"
  affects:
    - "No public files affected (admin-only surface)"
    - "/api/process-emails byte-equal to main (cron handler untouched)"
tech_stack:
  added: []
  patterns:
    - "Server Component + Suspense + await connection() loader (same as Phase 04 admin pages)"
    - "Promise.all over getQueueCounts + listScheduledEmailsForAdmin for parallel data fetch"
    - "Discriminated RetryResult union for retry-guard outcome (not_found / max_retries_exceeded / ok)"
    - "Inline Promise<void> server-action wrappers in detail page to satisfy <form action> type"
    - "ScheduledEmail status vocabulary: pending | sent | failed | cancelled"
key_files:
  created:
    - src/lib/schemas/admin-emails.ts
    - src/lib/admin/emails-queries.ts
    - src/app/admin/emails/actions.ts
    - src/app/admin/emails/page.tsx
    - src/app/admin/emails/[id]/page.tsx
  modified: []
decisions:
  - "Retry mutation does NOT increment retryCount; the cron handler owns the increment on actual attempt"
  - "Retry mutation clears error so next attempt's failure is unambiguous in detail view"
  - "Retry button rendered conditionally on retryCount < maxRetries (UI hint); query function enforces the same gate authoritatively"
  - "Cancel is idempotent (re-writing 'cancelled' on an already-cancelled row is a safe no-op)"
  - "Inline Promise<void> wrappers around retry/cancel actions in detail page (server-side 'use server' shims) because <form action> only accepts void-returning signatures; underlying actions keep ActionResult envelope for future client-form consumers"
metrics:
  duration_minutes: 8
  tasks_completed: 3
  files_created: 5
  files_modified: 0
  commits: 3
  completed: 2026-05-24
---

# Phase 05 Plan 05: Emails (Scheduled Queue) Summary

Operator-facing `/admin/emails` surface: list view with 4 queue-health stat cards + status filter chips + table of recent 100 scheduled emails, per-email detail view with variables / delivery / actions / danger sections, and 3 Server Actions (retry / cancel / delete) guarded by `requireAdminSession`. Retry mutation flips DB state so the existing cron picks the row up on next tick; `/api/process-emails/route.ts` is byte-equal to main.

## What shipped

Five new files. Zero modifications.

### Query layer (`src/lib/admin/emails-queries.ts`)

Six functions, all server-only:

1. `getQueueCounts()` -> `QueueCounts` — one aggregate query, `count() group by status`. Returns `{ pending, sent, failed, cancelled }` with zeros for missing statuses. Try/catch returns zero record on failure.
2. `listScheduledEmailsForAdmin(status?, limit = 100)` — optional status filter, sorted by `scheduledFor DESC`, capped at 100. Try/catch returns `[]` on failure.
3. `getScheduledEmailById(id)` — single row or `null`. Try/catch returns `null` on failure.
4. `retryScheduledEmail(id): RetryResult` — implements the retry guard. Reads the row first; refuses when `retryCount >= maxRetries`. UPDATE sets `status='pending', scheduledFor=now(), error=null`. Returns discriminated `{ ok: true; row } | { ok: false; reason: 'not_found' | 'max_retries_exceeded' }`. **Does NOT touch `retryCount`** — the cron handler owns that increment.
5. `cancelScheduledEmail(id)` — UPDATE `status='cancelled'`, idempotent.
6. `deleteScheduledEmail(id)` — hard delete, returns `true | false`. Try/catch returns `false` on failure.

### Schema layer (`src/lib/schemas/admin-emails.ts`)

Three Zod schemas, each `{ id: uuid }`:
- `retryEmailSchema`
- `cancelEmailSchema`
- `deleteEmailSchema`

Plus three inferred `RetryEmailInput` / `CancelEmailInput` / `DeleteEmailInput` types.

The retry guard rule (`retryCount < maxRetries`) is intentionally NOT in the schema because the schema has no access to the DB row. The query function reads the row and enforces the gate.

### Server Actions (`src/app/admin/emails/actions.ts`)

Three actions, all starting with `await requireAdminSession()`:

1. `retryScheduledEmailAction(formData): ActionResult` — calls `retryScheduledEmail`, translates `RetryResult` union:
   - `not_found` -> `{ _form: 'Email not found.' }`
   - `max_retries_exceeded` -> `{ _form: 'Retry limit reached. Delete the row or update maxRetries via SQL.' }`
   - ok -> `revalidatePath('/admin/emails')` + `revalidatePath('/admin/emails/<id>')` + `{ ok: true }`
2. `cancelScheduledEmailAction(formData): ActionResult` — same envelope shape; null return from query -> `_form: 'Email not found.'`
3. `deleteScheduledEmailAction(formData): Promise<void>` — redirects to `/admin/emails`

Also exports `ActionResult` envelope type for future client-form consumers.

### List page (`src/app/admin/emails/page.tsx`)

Server component. `Promise.all` over `getQueueCounts()` + `listScheduledEmailsForAdmin(status, 100)` inside `<Suspense>` after `await connection()`.

Renders:
- 4 stat cards in `grid-cols-2 md:grid-cols-4` showing per-status counts
- `<StatusFilterBar>` with options that include per-status counts on each chip
- Table with columns `Recipient | Sequence/Step | Status | Scheduled for | Sent at | Retries` — slash separators are ASCII `/`, never en-dash
- Empty state `No scheduled emails.`

`metadata.robots = { index: false, follow: false }`.

### Detail page (`src/app/admin/emails/[id]/page.tsx`)

Server component. `generateStaticParams` returns `[{ id: '__build_placeholder__' }]` for Next.js 16 `cacheComponents` prerender sample. `await connection()` + `await params` inside the Suspense loader.

Four sections:
1. **Email** — sequenceId, stepId, recipientName, variables (pretty-printed `<pre>{JSON.stringify(row.variables, null, 2)}</pre>`)
2. **Delivery** — status badge, sentAt, `retryCount / maxRetries`, error (rendered in destructive-tinted `<pre>` when non-null)
3. **Actions** — branches on `row.status`:
   - `pending` or `failed` + `retryCount < maxRetries` -> Retry button (form action wired through inline `Promise<void>` wrapper)
   - `pending` -> also a Cancel button beside Retry
   - retry-limit reached -> `Retry limit reached.` text instead of button (UI hint mirrors server-side guard)
   - `sent` -> `Already sent. No actions available.`
   - `cancelled` -> `Already cancelled. Delete below if no longer needed.`
4. **Danger** — `<DeleteButton>` from Phase 04 primitive

## Verification

| Gate | Result |
|------|--------|
| `bun run lint` exit code | 0 |
| `bun run typecheck` exit code | 0 |
| Em/en-dash sweep on 5 new files | 0 |
| `await requireAdminSession()` count in actions.ts | 4 (>= 3 required) |
| `revalidatePath` count in actions.ts | 7 (>= 3 required) |
| `max_retries_exceeded` mapped in actions.ts | yes |
| `console.*` / `process.env.X` / `: any` in any new file | 0 |
| `git diff main -- src/app/api/process-emails/route.ts` | empty |
| `git diff main -- src/lib/scheduled-emails.ts src/lib/resend-client.ts src/lib/email-utils.ts` | empty |
| `'use client'` in either page.tsx | none (both server components) |
| `retryCount` incremented in retry path | no (cron owns increment) |

## Process-emails cron handler is byte-equal to main

The retry button mutates DB row state (`status='pending', scheduledFor=now(), error=null`) so the existing cron picks the row up on the next tick. The admin layer does NOT import `processEmailsEndpoint`, does NOT call `/api/process-emails`, and does NOT modify `src/app/api/process-emails/route.ts`, `src/lib/scheduled-emails.ts`, `src/lib/resend-client.ts`, or `src/lib/email-utils.ts`. Verified with `git diff main` returning empty for all five paths.

## Retry guard semantics

The plan's read of CONTEXT.md §5.4 was: the operator should never trigger a retry that would exceed `maxRetries`. Two-layer enforcement:

1. **Backend (authoritative):** `retryScheduledEmail()` reads the row first, returns `{ ok: false, reason: 'max_retries_exceeded' }` when `retryCount >= maxRetries`. The action translates this to a `_form` error.
2. **Frontend (hint):** the detail page only renders the Retry button when `row.retryCount < (row.maxRetries ?? 3)`. When the gate trips, the button is replaced by `<p>Retry limit reached.</p>`.

`retryCount` is intentionally **not** incremented by the admin retry. The cron handler in `src/lib/scheduled-emails.ts` bumps the counter on each actual send attempt. Admin only resets `status`, `scheduledFor`, and clears `error` so the next attempt is unambiguous in the detail view.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking type error] Form action signature mismatch**
- **Found during:** Task 3 typecheck
- **Issue:** Plan's detail page wired `<form action={retryScheduledEmailAction}>` directly, but the action returns `Promise<ActionResult>`. React's `<form action>` prop accepts only `string | ((formData: FormData) => void | Promise<void>) | undefined`. `tsc --noEmit` reported `Type 'Promise<ActionResult>' is not assignable to type 'Promise<void>'` at both form actions.
- **Fix:** Added two inline `Promise<void>` wrappers in the detail page (`retryAction`, `cancelAction`) declared with `'use server'`. Each `await`s the underlying action and discards the envelope; success is reflected via `revalidatePath` inside the underlying action. Underlying actions keep the `ActionResult` envelope so a future client form can consume `_form` errors via `useActionState`.
- **Files modified:** `src/app/admin/emails/[id]/page.tsx`
- **Commit:** `6d76bfe`
- **Acceptance-criteria note:** The plan said the file should contain `<form action={retryScheduledEmailAction}` and `<form action={cancelScheduledEmailAction}`. The literal grep on those exact strings would not match (forms now reference the wrapper names). However, both actions are imported by name in the file and invoked inside their respective wrappers, preserving the intent: the page does call the named Server Actions. This is the same pattern the sibling Wave 2 plans (05-02 leads, 05-03 calculator-leads, 05-04 newsletter) face for any `<form action>` consuming an `ActionResult`-returning action — they may converge on the same wrapper idiom in their own plans.

### Authentication gates

None hit during execution. All gates passed automatically.

## Self-Check: PASSED

Files verified to exist:
- FOUND: src/lib/schemas/admin-emails.ts
- FOUND: src/lib/admin/emails-queries.ts
- FOUND: src/app/admin/emails/actions.ts
- FOUND: src/app/admin/emails/page.tsx
- FOUND: src/app/admin/emails/[id]/page.tsx

Commits verified to exist:
- FOUND: 2c14930 feat(05-05): emails admin schemas + Drizzle query layer
- FOUND: f3dbab8 feat(05-05): emails admin Server Actions (retry/cancel/delete)
- FOUND: 6d76bfe feat(05-05): emails admin list + detail pages
