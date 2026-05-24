# Phase 05 — Admin Ops

**Date:** 2026-05-23
**Branch:** `admin-ops`
**Milestone:** v4 — Admin Panel (final phase)
**Scope:** Replace the three Phase-03 coming-soon stubs (`/admin/leads`, `/admin/newsletter`, `/admin/emails`) with read-mostly ops pages backed by the existing Neon tables. After this phase, the operator manages inbound leads, newsletter subscribers, and the scheduled-email queue from the admin UI without opening Neon Console.

## 1. Goal

After this phase, every nav item in the admin sidebar lands on a real working page. Specifically:

- **`/admin/leads`** answers "who has reached out to me and what's the next step?" Shows all contact submissions, filterable by status, with a per-lead detail view that includes attribution touchpoints, notes, and a status-change UI. Calculator leads (separate table) get their own sub-page so the contact form list stays focused.
- **`/admin/newsletter`** answers "who is on my list and is the list healthy?" Shows all subscribers, filterable by status, with one-row mutations for unsubscribe / re-subscribe / hard-delete (GDPR).
- **`/admin/emails`** answers "is the scheduled-email queue healthy and where are the failures?" Shows queue counts by status, the most recent failures with retry / cancel buttons, and a per-email detail view that surfaces the error message and retry history.

## 2. Non-goals

- **No row creation.** Leads, subscribers, and scheduled emails are all created by inbound systems (contact form, newsletter signup, sequence trigger). The admin reads + mutates existing rows; it never creates new ones.
- **No email sending UI.** Triggering a one-off marketing blast, composing an HTML email, or editing email templates is a separate phase. The `/admin/emails` page surfaces queue HEALTH and lets the operator retry / cancel — it does not let the operator author or send messages.
- **No tag / segment / list management for the newsletter.** Single global list. Tagging / segmenting is out of scope.
- **No CSV export, no bulk actions.** Defer to Phase 06+ if real-world need surfaces. (CSV export is two lines but introduces a download permission surface we don't want to design now.)
- **No charts on these pages.** The dashboard already shows the time-series view of leads and traffic. These pages are tabular operations surfaces.
- **No edit pages for leads / subscribers' content fields.** Email, name, etc. are inbound facts. The admin can change `status` and add a `lead_note`; it cannot rewrite the email address. (If a row is wrong, delete it.)
- **No pagination, no search.** Match the Phase 04 list approach. Tables sort by sensible defaults; if a table grows past ~200 rows we add pagination later. (Leads ~50/mo, subscribers ~hundreds, scheduled_emails ~thousands but the page only ever loads the most recent N — see per-resource caps.)
- **`calculator_leads` is a SEPARATE page from `leads`.** Different shape (one row per calculator submission with input/output blobs), different operator question ("which calculators are converting?"). Linked from the leads index page; not merged into one list.

## 3. Pattern (locked for all three resources)

Every resource follows the same shape so we ship three near-identical implementations.

**Routes:**

| URL | Component | Purpose |
|---|---|---|
| `/admin/{r}` | server page | List table with status filter, sorted by recency, hard cap on row count |
| `/admin/{r}/[id]` | server page | Detail view + status-mutation form + (where applicable) attached collections (lead_attribution, lead_notes, email retry history) |

**Notable differences from Phase 04:**

- **No `/new` route.** Rows are inbound only.
- **No `[id]/edit` separate from `[id]`.** Detail view IS the edit surface for the small mutations the page allows (status change, note add, retry, cancel). One page instead of two.
- **Server Actions** for every mutation, identical contract to Phase 04: `'use server'`, `await requireAdminSession()` first, Zod safeParse, return `{ ok: true | false, errors }` envelope, `revalidatePath` after success.
- **No useAppForm.** Mutations are single-button forms (DeleteButton/PublishToggle shape from Phase 04 — `<form action={...}>` + hidden id + submit button). The leads add-note flow is a 1-textarea form; useAppForm overhead is not justified.
- **Empty state per page.** "No leads yet." / "No subscribers yet." / "No scheduled emails." with no extra link (nowhere to go to create them).

**Filter pattern** (where applicable): the list page reads a `status` query param (`?status=new`, `?status=contacted`, etc.). If absent, shows all. Renders the filter as a small server-side `<form method="get">` row of `<button>` chips above the table. No client JS.

## 4. File-level changes

### New files (per resource: leads, newsletter, emails)

For each `{r}` in `{leads, newsletter, emails}`:

- `src/lib/admin/{r}-queries.ts` — `'server-only'` Drizzle module. Typed functions per the resource's spec in §5.
- `src/lib/schemas/admin-{r}.ts` — Zod schemas for the per-row mutations (status change, note add, retry, etc.). Inferred types exported.
- `src/app/admin/{r}/page.tsx` — server list page with status filter.
- `src/app/admin/{r}/actions.ts` — Server Actions for every mutation the resource allows.
- `src/app/admin/{r}/[id]/page.tsx` — server detail page.

### New files (shared — small)

- `src/components/admin/StatusFilterBar.tsx` — server component. Renders the filter chip row as a `<form method="get">` with a `<button name="status" value="...">` per chip. Active chip highlighted via `aria-current="page"`. Reused by all three list pages.
- `src/components/admin/StatusBadge.tsx` — server component. Maps status strings to OKLCH token colors (consistent palette across pages).

### New files (calculator leads sub-page — leads only)

- `src/app/admin/leads/calculator/page.tsx` — server list page for `calculator_leads`.
- `src/app/admin/leads/calculator/[id]/page.tsx` — detail page (inputs, results, conversion data).
- `src/lib/admin/calculator-leads-queries.ts` — typed Drizzle queries.

### Modified files

- `src/components/admin/Sidebar.tsx` — the nav items for leads / newsletter / emails are already present; verify they still point at the right URLs (no Sidebar change expected). If a sub-page nav item is desired for Calculator Leads, add it; otherwise leave Sidebar alone.
- `.planning/STATE.md`, `.planning/ROADMAP.md` — phase status updates after the phase ships.

### Deleted files

- `src/app/admin/(coming-soon)/leads/page.tsx`
- `src/app/admin/(coming-soon)/newsletter/page.tsx`
- `src/app/admin/(coming-soon)/emails/page.tsx`

The `(coming-soon)/` directory is empty after these deletions; remove the directory.

## 5. Per-resource specs

### 5.1 Leads (`src/lib/schemas/leads.ts`)

**Tables:** `leads` (primary), `lead_attribution` (touchpoint timeline per lead), `lead_notes` (operator-written notes).

**List page (`/admin/leads`):**
- Columns: `name | email | company | source | status | createdAt`
- Sort: `createdAt DESC`
- Cap: most recent 200 rows (raise to pagination if real load exceeds this)
- Filter chips: `all | new | contacted | qualified | closed`
- Row click → detail page

**Detail page (`/admin/leads/[id]`):**
- Header: name + email + company + status badge
- "Contact info" section: phone, source, score, metadata (rendered as `<dl>`)
- "Touchpoints" section: chronological list from `lead_attribution` (source / medium / campaign / referrer / landing page / timestamp)
- "Notes" section: list of `lead_notes` newest first, plus an inline "Add note" 1-textarea form
- "Status" section: 4 radio-style buttons (new / contacted / qualified / closed). Each posts to `updateLeadStatusAction`.
- "Danger" section: `DeleteButton` (uses Phase 04 primitive). Permanent delete cascades via `lead_attribution.lead_id ON DELETE CASCADE` and `lead_notes.lead_id ON DELETE CASCADE`.

**Server Actions** (`src/app/admin/leads/actions.ts`):
- `updateLeadStatusAction(formData)` — id + new status; Zod-validated against `['new', 'contacted', 'qualified', 'closed']`
- `addLeadNoteAction(formData)` — id + content (1-4000 chars); `createdBy` = session user's email
- `deleteLeadAction(formData)` — id only; redirects to list on success
- `deleteLeadNoteAction(formData)` — note id; revalidates current path

**Queries** (`src/lib/admin/leads-queries.ts`):
- `listLeadsForAdmin(status?, limit = 200)`
- `getLeadById(id)` → returns lead + lead_attribution[] + lead_notes[] in one Promise.all
- `updateLeadStatus(id, status)`
- `addLeadNote({ leadId, content, createdBy })`
- `deleteLead(id)`
- `deleteLeadNote(id)`

### 5.2 Calculator Leads (`calculator_leads` table)

**List page (`/admin/leads/calculator`):**
- Columns: `email | calculatorType | leadQuality | contacted | converted | createdAt`
- Sort: `createdAt DESC`
- Cap: most recent 200
- Filter chips: `all | hot | warm | cold` (mapped to `lead_quality` values; verify what enum values the production data actually uses)

**Detail page (`/admin/leads/calculator/[id]`):**
- Header: email + calculator type + lead quality badge
- "Lead" section: name, phone, company, score
- "Calculator inputs" section: pretty-printed `inputs` jsonb
- "Calculator results" section: pretty-printed `results` jsonb
- "Conversion" section: contacted / contactedAt / converted / convertedAt / conversionValue + a "Mark contacted" / "Mark converted" pair of mutation buttons
- "Attribution" section: UTM source / medium / campaign / term / content + referrer + landingPage
- "Danger" section: DeleteButton

**Server Actions** (`src/app/admin/leads/calculator/actions.ts`):
- `markCalculatorLeadContactedAction(formData)` — id only; sets `contacted=true, contactedAt=now()`
- `markCalculatorLeadConvertedAction(formData)` — id + conversionValue; sets `converted=true, convertedAt=now(), conversionValue=...`
- `deleteCalculatorLeadAction(formData)` — id; redirects to list

### 5.3 Newsletter (`newsletter_subscribers` table)

**List page (`/admin/newsletter`):**
- Columns: `email | name | status | source | subscribedAt | unsubscribedAt`
- Sort: `subscribedAt DESC`
- Cap: most recent 200
- Filter chips: `all | active | unsubscribed | bounced` (verify against production status values; if more exist, add them)
- Row click → detail page

**Detail page (`/admin/newsletter/[id]`):**
- Header: email + name + status badge
- "Subscription" section: source, subscribedAt, unsubscribedAt, metadata
- "Actions" section: based on current status, render:
  - Active → `Unsubscribe` button (sets `status='unsubscribed', unsubscribedAt=now()`)
  - Unsubscribed → `Re-subscribe` button (sets `status='active', unsubscribedAt=null`)
- "Danger" section: `DeleteButton` (GDPR — permanent delete)

**Server Actions** (`src/app/admin/newsletter/actions.ts`):
- `unsubscribeSubscriberAction(formData)`
- `resubscribeSubscriberAction(formData)`
- `deleteSubscriberAction(formData)` — redirects to list

**Queries** (`src/lib/admin/newsletter-queries.ts`):
- `listSubscribersForAdmin(status?, limit = 200)`
- `getSubscriberById(id)`
- `setSubscriberStatus(id, status)`
- `deleteSubscriber(id)`

### 5.4 Emails (`scheduled_emails` table)

**List page (`/admin/emails`):**
- Top-of-page: 4 stat cards showing counts by status: `pending | sent | failed | cancelled`. One Drizzle aggregate query.
- Table below: most recent 100 emails by `scheduledFor DESC`
  - Columns: `recipient | sequence/step | status | scheduledFor | sentAt | retryCount/maxRetries`
- Filter chips: `all | pending | sent | failed | cancelled`
- Row click → detail page

**Detail page (`/admin/emails/[id]`):**
- Header: recipient + status badge + scheduledFor
- "Email" section: sequenceId, stepId, recipientName, variables (pretty-printed jsonb)
- "Delivery" section: status, sentAt, retryCount/maxRetries, error (if any — rendered as `<pre>`)
- "Actions" section:
  - Pending or failed → `Retry now` button (sets `status='pending', scheduledFor=now(), retryCount=retryCount+0` so the existing cron picks it up). Forbidden when `retryCount >= maxRetries`.
  - Pending → `Cancel` button (sets `status='cancelled'`)
  - Sent → no actions
- "Danger" section: `DeleteButton` (queue cleanup; mostly for canceled / failed rows the operator wants to clear out)

**Server Actions** (`src/app/admin/emails/actions.ts`):
- `retryScheduledEmailAction(formData)` — id; Zod-checks current row's `retryCount < maxRetries` before mutating
- `cancelScheduledEmailAction(formData)`
- `deleteScheduledEmailAction(formData)` — redirects to list

**Queries** (`src/lib/admin/emails-queries.ts`):
- `getQueueCounts()` → `{ pending: n, sent: n, failed: n, cancelled: n }` (one aggregate)
- `listScheduledEmailsForAdmin(status?, limit = 100)`
- `getScheduledEmailById(id)`
- `retryScheduledEmail(id)`
- `cancelScheduledEmail(id)`
- `deleteScheduledEmail(id)`

**`/api/process-emails` is UNTOUCHED.** The cron endpoint that processes the queue lives in `src/app/api/process-emails/route.ts` and is Bearer-protected. The admin retry button just mutates the DB row so the next cron tick picks it up; it does not call the cron handler directly.

## 6. Server Actions contract

Identical to Phase 04 (see `.planning/phases/04-admin-content-crud/04-CONTEXT.md` §6). Every action:

```ts
'use server'
export async function someAction(formData: FormData): Promise<
  | { ok: true }
  | { ok: false; errors: Record<string, string> }
> {
  await requireAdminSession()
  const parsed = someSchema.safeParse(formDataToObject(formData))
  if (!parsed.success) return { ok: false, errors: flattenZod(parsed.error) }
  try {
    await mutate(parsed.data)
  } catch (e) {
    logger.error('someAction failed', e)
    return { ok: false, errors: { _form: 'Could not complete action.' } }
  }
  revalidatePath('/admin/{r}')
  if (needsRedirect) redirect('/admin/{r}')
  return { ok: true }
}
```

Reuse the existing Wave 1 / Phase 04 helpers: `requireAdminSession` (`src/lib/admin/auth.ts`), `formDataToObject` (`src/lib/admin/form-data.ts`), `isUniqueViolation` (`src/lib/admin/db-errors.ts`), `DeleteButton` / `PublishToggle` UI primitives (`src/components/admin/`). No new shared infrastructure required — the foundation Phase 04 shipped covers Phase 05.

## 7. Constraints (do not violate)

- All project conventions in `/CLAUDE.md`. Highlights: NO emojis, NO em-dash / en-dash in user-facing strings, server-first components, existing utility classes from `globals.css` (no hardcoded colors), `text-accent-text` for small accent body copy on light backgrounds, Logger not `console.*`, Zod `safeParse` not `parse`, env via `@/env`.
- Phase 02 + 03 + 04 files stay untouched. Specifically:
  - All `src/lib/auth/*` (Phase 02)
  - `src/components/auth/*` (Phase 02)
  - `src/app/auth/*` (Phase 02)
  - `src/app/api/auth/[...all]/route.ts` (Phase 02)
  - `proxy.ts` (Phase 02)
  - `src/lib/auth/admin.ts` (Bearer guard for cron — also untouched all of Phase 03/04)
  - `src/lib/admin/dashboard-queries.ts` (Phase 03)
  - `src/components/admin/{Sidebar,Topbar,Forbidden,FormFieldSet,DeleteButton,PublishToggle,ResourceListPage}.tsx` (Phase 03/04 primitives; we add `StatusFilterBar` + `StatusBadge` as NEW files)
  - `src/components/admin/widgets/*` (Phase 03)
  - `src/app/admin/{layout,page,dashboard/page}.tsx` (Phase 03)
  - All Phase 04 query/schema/page/actions files for showcase/blog/testimonials
- Public-site files stay untouched: `src/app/{contact,unsubscribe,newsletter}/*` and the `/api/contact`, `/api/newsletter`, `/api/process-emails` routes. Admin queries READ the same tables but the admin layer adds NEW functions in `src/lib/admin/{r}-queries.ts`.
- All admin pages remain `role === 'admin'`-only via the existing `src/app/admin/layout.tsx` gate. Server Actions add the second `requireAdminSession()` check inside the action body (defense in depth).
- List and detail pages are server components by default. Client islands only where browser APIs are needed (none expected for Phase 05 — every form is a `<form action={action}>` posting to a Server Action with no client state).
- Next.js 16 `cacheComponents: true` requirement: every dynamic data fetch on an admin page must sit inside a `<Suspense>` boundary AND call `await connection()`. The 3 `[id]/page.tsx` routes need `generateStaticParams()` returning a `__build_placeholder__` id (same pattern Phase 04 Wave 3 established).

## 8. Verification

- `bun run lint && bun run typecheck && bun run build` all exit 0
- `/admin/leads`, `/admin/leads/calculator`, `/admin/newsletter`, `/admin/emails` all render with real data when the underlying tables have rows; show empty states when they don't
- Status filter chips on each list page actually filter via `?status=...` query param round-trip
- Mutations work: update lead status, add lead note, mark calculator lead contacted, unsubscribe a newsletter subscriber, retry a scheduled email, cancel a pending email, delete any of the above
- Em/en-dash sweep on all phase-05 changed files: zero
- Phase 02/03/04 surface diff vs main: empty
- `src/lib/auth/admin.ts` diff vs main: empty
- The 3 deleted coming-soon stubs no longer resolve; `bun run build` route table contains the real routes only

## 9. Out of scope

- Lead/subscriber/email CREATE flows (inbound only)
- One-off email composer / sender UI
- Newsletter tagging or segmentation
- CSV / JSON export of any list
- Charts on the ops pages (dashboard already has them)
- Pagination, search, full-text filtering (defer to Phase 06+ if needed)
- Editing lead/subscriber/email content fields beyond status + add-note
- Bulk actions (multi-select retry / cancel / delete)
- Webhook configuration UI
- Sequence editor (composing the email sequence templates)
