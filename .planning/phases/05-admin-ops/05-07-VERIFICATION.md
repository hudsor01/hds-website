# Phase 05 — Plan 07 Verification

**Date:** 2026-05-23
**Branch:** `admin-ops`
**Status:** passed
**Verifier:** automated gates 1-13 + 10b (operator smoke deferred to operator pre-PR)

## Summary

All automated gates green. The `/admin/leads`, `/admin/leads/calculator`,
`/admin/newsletter`, and `/admin/emails` surfaces shipped by Plans 05-02 through
05-05 build, typecheck, lint, and test clean. The 3 Phase-03 coming-soon stubs
were removed in Wave 3 (commit `cf59c45`) and the corresponding directory is
gone. Every Phase 02 / 03 / 04 file plus every public-route and public-API
surface is byte-equal to `main`. Defense-in-depth auth is in place on every
mutation (every Server Action calls `requireAdminSession()` >= 4 times, every
mutation calls `revalidatePath()` >= 7 times). No `console.*`, no
`process.env.X`, no `any` types in any Phase-05 added file. The 35-step
operator manual smoke is deferred to the operator pre-PR per the Phase 03 /
Phase 04 precedent.

## Gate Results

| Gate  | Description                                         | Command                                   | Result                                              |
| ----- | --------------------------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| 1     | Lint                                                | `bun run lint`                            | PASS (353 files, 0 diagnostics)                     |
| 2     | Typecheck                                           | `bun run typecheck`                       | PASS (0 errors)                                     |
| 3     | Unit tests                                          | `bun run test:unit`                       | PASS (563 / 563 pass, 0 fail, 2335 expects)         |
| 4     | Build + route table (19 admin routes)               | `bun run build`                           | PASS (build green, all 19 admin routes present)     |
| 5     | Em-dash sweep on Phase-05 src/ files                | `python rg em-dash 22 files`              | PASS (0 matches)                                    |
| 6     | En-dash sweep on Phase-05 src/ files                | `python rg en-dash 22 files`              | PASS (0 matches)                                    |
| 7     | Protected files byte-equal to main (53 paths)       | `git diff main -- <path>` per path        | PASS (53 / 53 paths, all 0 bytes diff)              |
| 8     | Phase 03 coming-soon stubs removed                  | `test ! -e` per path                      | PASS (3 files + 1 dir gone)                         |
| 9     | `requireAdminSession()` defense-in-depth per action | `grep -c` per action file                 | PASS (leads=5, calculator=4, newsletter=4, emails=4) |
| 10    | `revalidatePath` count per action file              | `grep -c` per action file                 | PASS (leads=7, calculator=7, newsletter=7, emails=7) |
| 10b   | `use server` non-async exports                      | `grep "^export"` per action file          | PASS (only `export async function` + `export type`) |
| 11    | No `console.*` in Phase-05 added files              | `re.search console\\.` over 22 files      | PASS (0 matches)                                    |
| 12    | No `process.env.X` in Phase-05 added files          | `"process.env" in line` over 22 files     | PASS (0 matches)                                    |
| 13    | No `any` types in Phase-05 added files              | `re.search ': any\|<any>\|as any\b'`      | PASS (0 matches)                                    |
| 13b   | `/api/process-emails/route.ts` byte-equal to main   | `git diff main -- <path>`                 | PASS (covered by Gate 7, 0 bytes diff)              |
| 14    | Operator manual smoke (35 steps, 4 surfaces)        | manual                                    | DEFERRED to operator pre-PR                         |

## Gate evidence

### Gate 1 — Lint

```
$ bun run lint
$ biome check src/
Checked 353 files in 35ms. No fixes applied.
```

Exit 0. File count 353.

### Gate 2 — Typecheck

```
$ bun run typecheck
$ tsc --noEmit
(no output)
```

Exit 0. Zero diagnostics.

### Gate 3 — Unit tests

```
$ bun run test:unit
 563 pass
 0 fail
 2335 expect() calls
Ran 563 tests across 49 files. [1222.00ms]
```

Exit 0. Pass count `563` matches Phase 04 baseline. Phase 05 added no new
unit-test files by design (read-mostly query surface; ops behavior is
exercised by the deferred operator smoke).

### Gate 4 — Build (19 admin routes)

```
$ bun run build
... (route table excerpt for /admin/* )
├ ◐ /admin
├ ◐ /admin/blog
├ ◐ /admin/blog/[id]/edit
│ ├ /admin/blog/[id]/edit
│ └ /admin/blog/__build_placeholder__/edit
├ ◐ /admin/blog/new
├ ◐ /admin/dashboard
├ ◐ /admin/emails
├ ◐ /admin/emails/[id]
│ ├ /admin/emails/[id]
│ └ /admin/emails/__build_placeholder__
├ ◐ /admin/leads
├ ◐ /admin/leads/[id]
│ ├ /admin/leads/[id]
│ └ /admin/leads/__build_placeholder__
├ ◐ /admin/leads/calculator
├ ◐ /admin/leads/calculator/[id]
│ ├ /admin/leads/calculator/[id]
│ └ /admin/leads/calculator/__build_placeholder__
├ ◐ /admin/newsletter
├ ◐ /admin/newsletter/[id]
│ ├ /admin/newsletter/[id]
│ └ /admin/newsletter/__build_placeholder__
├ ◐ /admin/showcase
├ ◐ /admin/showcase/[id]/edit
│ ├ /admin/showcase/[id]/edit
│ └ /admin/showcase/__build_placeholder__/edit
├ ◐ /admin/showcase/new
├ ◐ /admin/testimonials
├ ◐ /admin/testimonials/[id]/edit
│ ├ /admin/testimonials/[id]/edit
│ └ /admin/testimonials/__build_placeholder__/edit
├ ◐ /admin/testimonials/new
```

19 admin routes, all `◐` (partial prerender). `__build_placeholder__` paths
are the static-params placeholders for dynamic routes (same pattern as
Phase 04, required by Next.js 16 `cacheComponents`). No `(coming-soon)`
segment present.

The 19 admin routes match the plan's expected list exactly:

1.  `/admin`
2.  `/admin/dashboard`
3.  `/admin/showcase`
4.  `/admin/showcase/new`
5.  `/admin/showcase/[id]/edit`
6.  `/admin/blog`
7.  `/admin/blog/new`
8.  `/admin/blog/[id]/edit`
9.  `/admin/testimonials`
10. `/admin/testimonials/new`
11. `/admin/testimonials/[id]/edit`
12. `/admin/leads`
13. `/admin/leads/[id]`
14. `/admin/leads/calculator`
15. `/admin/leads/calculator/[id]`
16. `/admin/newsletter`
17. `/admin/newsletter/[id]`
18. `/admin/emails`
19. `/admin/emails/[id]`

### Gate 5 / 6 — Em/En-dash sweep

Scanned the 22 Phase-05 changed src/ files (`git diff --name-only main...HEAD -- 'src/' | grep -v coming-soon`).

```
EM matches: []
EN matches: []
Files scanned: 22
```

### Gate 7 — Protected files byte-equal to main

53 protected paths checked, all show 0 bytes of diff vs `main`:

- `src/lib/auth/admin.ts`  — Bearer guard for cron / admin API
- `src/lib/auth/index.ts`, `src/lib/auth/client.ts`, `src/lib/auth/get-session.ts` — Phase 02 auth surface
- `src/components/auth/` — Phase 02 auth UI
- `src/app/auth/` — Phase 02 auth pages
- `src/app/api/auth/[...all]/route.ts` — Phase 02 Better Auth handler
- `proxy.ts` — Phase 02 edge proxy
- `src/lib/admin/dashboard-queries.ts` — Phase 03 dashboard data
- `src/components/admin/Sidebar.tsx`, `Topbar.tsx`, `Forbidden.tsx`,
  `FormFieldSet.tsx`, `DeleteButton.tsx`, `PublishToggle.tsx`,
  `ResourceListPage.tsx` — Phase 03 / 04 primitives reused by Phase 05
- `src/components/admin/widgets/` — Phase 03 dashboard widgets
- `src/app/admin/layout.tsx`, `page.tsx`, `dashboard/page.tsx` — Phase 03 shell
- `src/app/admin/showcase/`, `blog/`, `testimonials/` — Phase 04 CRUD pages
- `src/lib/admin/{auth,slugify,form-data,db-errors}.ts` — Phase 04 helpers
- `src/lib/admin/{showcase,blog,testimonials}-queries.ts` — Phase 04 queries
- `src/lib/schemas/admin-{showcase,blog,testimonials}.ts` — Phase 04 schemas
- `src/lib/{showcase,blog,testimonials,scheduled-emails,resend-client,email-utils,contact-service,notifications}.ts` —
  public read helpers + email senders (Phase 05 admin layer added NEW query files; existing public helpers untouched)
- `src/app/{contact,unsubscribe,newsletter,showcase,portfolio,blog,testimonials}/` — public routes
- `src/app/api/{contact,newsletter,blog,testimonials}/`, `src/app/api/process-emails/route.ts` —
  public + n8n + cron API routes

```
TOTAL: 53 paths, 0 FAIL
```

### Gate 8 — coming-soon stubs removed

```
OK: src/app/admin/(coming-soon)/leads/page.tsx removed
OK: src/app/admin/(coming-soon)/newsletter/page.tsx removed
OK: src/app/admin/(coming-soon)/emails/page.tsx removed
OK: src/app/admin/(coming-soon) removed
```

Deletion shipped in commit `cf59c45` (Wave 3).

### Gate 9 — `requireAdminSession` defense-in-depth count per action file

```
src/app/admin/leads/actions.ts: 5
src/app/admin/leads/calculator/actions.ts: 4
src/app/admin/newsletter/actions.ts: 4
src/app/admin/emails/actions.ts: 4
```

Each file is well above the >= 3 minimum. Every Server Action calls
`requireAdminSession()` at the top of the function body before any DB
mutation. The admin layout already gates GET renders, but a forged POST
could hit an action without going through the layout, so each action
re-checks (D-12 defense in depth).

### Gate 10 — `revalidatePath` count per action file

```
src/app/admin/leads/actions.ts: 7
src/app/admin/leads/calculator/actions.ts: 7
src/app/admin/newsletter/actions.ts: 7
src/app/admin/emails/actions.ts: 7
```

Each file is well above the >= 3 minimum. Every mutation revalidates BOTH
the list path (`/admin/{r}`) AND the detail path (`/admin/{r}/[id]`) so
the operator sees the change immediately on either surface.

### Gate 10b — `'use server'` non-async exports

```
src/app/admin/leads/calculator/actions.ts:
  export type ActionResult = ...
  export async function markCalculatorLeadContactedAction(...)
  export async function markCalculatorLeadConvertedAction(...)
  export async function deleteCalculatorLeadAction(...)

src/app/admin/newsletter/actions.ts:
  export type ActionResult = ...
  export async function unsubscribeSubscriberAction(...)
  export async function resubscribeSubscriberAction(...)
  export async function deleteSubscriberAction(...)

src/app/admin/emails/actions.ts:
  export type ActionResult = ...
  export async function retryScheduledEmailAction(...)
  export async function cancelScheduledEmailAction(...)
  export async function deleteScheduledEmailAction(...)

src/app/admin/leads/actions.ts:
  export async function updateLeadStatusAction(...)
  export async function addLeadNoteAction(...)
  export async function deleteLeadAction(...)
  export async function deleteLeadNoteAction(...)
```

`export type ActionResult` is type-only and is erased at compile time —
it does NOT create a runtime export and is permitted by React's
`'use server'` rules. The latent non-async runtime export
(`flattenZod` + `ActionResult` value) that Wave 3 removed from
`leads/actions.ts` (commit `cf59c45`) is the only kind of export that
would have failed `next build`; the build is now clean. The other 3
action files were authored without the `flattenZod` runtime value from
the start.

### Gate 11 / 12 / 13 — Code hygiene

```
=== console.* ===     total: 0
=== process.env ===   total: 0
=== any types ===     total: 0
```

Scanned all 22 Phase-05 added / modified `src/` files.

### Gate 13b — `/api/process-emails/route.ts` byte-equal to main

Already covered by Gate 7. Diff is 0 bytes. The cron handler is
untouched; the admin "Retry now" button mutates the DB row so the next
cron tick picks it up (it does not call the cron handler directly).

## Gate 14 — Operator manual smoke (35 steps)

DEFERRED to operator pre-PR per the Phase 03 / 04 precedent. Run `bun
run dev` (port 3001), sign in as the admin user, and run every step
below. If any step fails or shows a visual regression, record it in
this file and STOP — open a follow-up plan to fix.

### Leads surface (`/admin/leads`)

1.  Visit http://localhost:3001/admin/leads. Page renders inside the
    admin shell with the sidebar's "Leads" item highlighted.
2.  Filter chips show: All, New, Contacted, Qualified, Closed. Default
    state is "All" highlighted (`aria-current="page"`).
3.  Table shows the most recent <= 200 contact submissions OR the
    empty-state copy "No leads yet."
4.  Click a status chip (e.g. "New"). Page reloads with `?status=new`
    in the URL; only matching rows appear; "New" chip is now
    highlighted.
5.  Click "All" chip. `?status=` clears; full list returns.
6.  Click the "Calculator leads" button (top-right). Lands on
    `/admin/leads/calculator`.
7.  Back to `/admin/leads`. Click a lead row's name to open detail.
8.  Detail page renders: header (name / email / company / status
    badge), Contact info `<dl>`, Status section (4 chip-buttons;
    current status highlighted), Touchpoints section (or empty state),
    Notes section with textarea + existing notes, Danger section with
    Delete button.
9.  Click a different status chip in the Status section. Page reloads
    with the new status; chip highlighting updates.
10. Type a note into the textarea and click "Add note". The note
    appears at the top of the list with the admin's email as
    `createdBy` and a timestamp.
11. Click "Delete" on a note. The note disappears immediately (no
    confirm; intentional for low-stakes deletes).
12. Click "Delete lead". Confirm dialog appears. Click OK. Lands on
    `/admin/leads`; the lead is gone; `lead_attribution` + `lead_notes`
    also gone via CASCADE.

### Calculator leads surface (`/admin/leads/calculator`)

13. Filter chips show: All, Hot, Warm, Cold. Status filter works via
    query param.
14. Click a row. Detail page renders: header, Lead `<dl>`, Inputs
    `<pre>`, Results `<pre>`, Conversion `<dl>` + action row (Mark
    contacted button OR Mark converted form OR "No further actions"),
    Attribution `<dl>`, Danger Delete button.
15. If the lead is not contacted: click "Mark contacted". `contacted`
    becomes Yes; the form is replaced with the Mark converted form.
16. Type "100" into the Conversion value field and click "Mark
    converted". `converted` becomes Yes; conversionValue shows $100.
17. Click "Delete calculator lead". Confirm; lands on
    `/admin/leads/calculator`; row is gone.

### Newsletter surface (`/admin/newsletter`)

18. Filter chips show: All, Active, Unsubscribed, Bounced. Filter
    works.
19. Click a row. Detail page renders: header (email / name / status
    badge), Subscription `<dl>`, Actions section showing ONE button
    based on status (Unsubscribe / Re-subscribe / "No mutations
    available"), Danger Delete button.
20. If subscriber is Active: click "Unsubscribe". Status flips to
    Unsubscribed; `unsubscribedAt` is now set; the button now says
    "Re-subscribe".
21. Click "Re-subscribe". Status flips back to Active;
    `unsubscribedAt` is cleared.
22. Click "Delete subscriber". Confirm; lands on `/admin/newsletter`;
    row is gone (GDPR hard delete).

### Emails surface (`/admin/emails`)

23. Page renders 4 stat cards (Pending, Sent, Failed, Cancelled) above
    the filter row. Counts are accurate (cross-check against a `SELECT
    status, count(*) FROM scheduled_emails GROUP BY status` if curious).
24. Filter chips show: All, Pending (count), Sent (count), Failed
    (count), Cancelled (count). Filter works.
25. Click a row. Detail page renders: header (recipient / status badge
    / scheduledFor), Email `<dl>` with variables `<pre>`, Delivery
    `<dl>` with error `<pre>` if present, Actions section, Danger
    Delete button.
26. For a Pending row: both "Retry now" and "Cancel" buttons appear.
27. For a Failed row WITH `retryCount < maxRetries`: "Retry now"
    appears. Click it. Status flips to Pending, `scheduledFor` is now,
    error cleared.
28. For a Failed row WITH `retryCount >= maxRetries`: instead of Retry
    button, "Retry limit reached." text appears.
29. For a Sent row: "Already sent. No actions available." appears.
30. For a Cancelled row: "Already cancelled. Delete below if no longer
    needed." appears.
31. Click "Delete email". Confirm; lands on `/admin/emails`; row is
    gone.

### Cross-cuts

32. Sign out via AccountMenu. Visit `/admin/leads` directly. Bounced
    to `/auth/sign-in`.
33. Try to invoke a Server Action via the UI from an incognito window
    (cookie cleared). The action should redirect to `/auth/sign-in`
    (defense in depth — `requireAdminSession` first in every action).
34. Em-dash / en-dash by-eye sweep on every rendered surface above.
    Zero unexpected dashes.
35. No browser-console errors at any step.

If all 35 steps pass: write "Operator smoke: PASS (35 / 35)" into this
file and proceed to PR. If any step fails: write the failure into the
Operator Smoke section of this file and STOP for triage.

## Conclusion

All 13 automated gates + Gate 10b green. Phase 05 is ready for operator
manual smoke (35 steps above) and, after smoke passes, ready for the PR
`admin-ops` -> `main` with the recommended squash commit message:

```
feat(admin): ops — leads, calculator-leads, newsletter, emails with Server Actions
```

(replace the em-dash with a hyphen or comma per CLAUDE.md before
committing to the PR title).
