---
phase: 05-admin-ops
plan: 02
subsystem: admin-leads
tags: [admin, leads, server-actions, drizzle]
requires:
  - src/lib/admin/auth.ts (requireAdminSession)
  - src/lib/admin/form-data.ts (formDataToObject)
  - src/lib/admin/db-errors.ts (isUniqueViolation, unused in this slice)
  - src/lib/schemas/schema.ts (leads, leadAttribution, leadNotes barrel)
  - src/components/admin/StatusFilterBar.tsx (Wave 1)
  - src/components/admin/StatusBadge.tsx (Wave 1)
  - src/components/admin/DeleteButton.tsx (Phase 04 primitive)
provides:
  - src/lib/admin/leads-queries.ts (6 functions + LeadDetail type)
  - src/lib/schemas/admin-leads.ts (LEAD_STATUSES + 4 mutation schemas)
  - src/app/admin/leads/actions.ts (4 Server Actions + ActionResult + flattenZod)
  - src/app/admin/leads/page.tsx (server list)
  - src/app/admin/leads/[id]/page.tsx (server detail)
affects:
  - Replaces the inbound-only Phase 03 coming-soon stub at `/admin/leads`
    (the stub itself stays untouched in this plan; Plan 05-06 deletes it
    after all Wave 2 plans land).
tech-stack:
  patterns:
    - Next.js 16 server pages with `await connection()` inside `<Suspense>`
    - `generateStaticParams` returns `[{ id: '__build_placeholder__' }]`
      so `cacheComponents` has a real prerender sample (Phase 04 idiom)
    - Server-only Drizzle module (`import 'server-only'` first line)
    - Read helpers swallow errors and return safe defaults; write helpers
      let exceptions escape so the action layer can translate them
    - `<form action={serverAction}>` directly on server components (no
      client island, no TanStack Form binding for this slice)
key-files:
  created:
    - src/lib/schemas/admin-leads.ts
    - src/lib/admin/leads-queries.ts
    - src/app/admin/leads/actions.ts
    - src/app/admin/leads/page.tsx
    - src/app/admin/leads/[id]/page.tsx
  modified: []
decisions:
  - "Returned `void` from `updateLeadStatusAction` and `addLeadNoteAction` instead of `ActionResult` because React's `<form action>` typing rejects `ActionResult`-returning functions when consumed from a server component. `ActionResult` and `flattenZod` stay exported for any future client-form consumer."
  - "Collapsed the 4 status-change `<form>` blocks into a `LEAD_STATUSES.map(...)` loop. Renders the same 4 forms at runtime but stays DRY."
  - "Hard-coded `LEAD_STATUSES = ['new', 'contacted', 'qualified', 'closed']` in the schema file rather than the queries file, so the Zod enum and the application-side whitelist share one source of truth (the DB column is plain `text` with no CHECK constraint)."
metrics:
  duration: ~25 min
  completed: 2026-05-23
---

# Phase 05 Plan 02: Admin Leads Ops Summary

Ships the operator-facing `/admin/leads` surface: a server-rendered list of the most recent 200 contact submissions with chip-row status filtering, plus a per-lead detail page that surfaces every attribution touchpoint, every operator note, and four mutation seams (status change, add note, delete lead, delete note). Replaces the Phase 03 coming-soon stub functionally (the stub file itself is deleted in Plan 05-06).

## Tasks completed (3 / 3)

1. **Zod schemas + Drizzle query layer** -- `e1915c7`
2. **Server Actions seam (4 actions)** -- `2445bc1`
3. **List page + detail page** -- `5fe1dec`

## Surface shipped

### `src/lib/admin/leads-queries.ts` (server-only)

```ts
export type LeadDetail = { lead: Lead; attribution: LeadAttribution[]; notes: LeadNote[] }
export async function listLeadsForAdmin(status?: LeadStatus | null, limit: number = 200): Promise<Lead[]>
export async function getLeadById(id: string): Promise<LeadDetail | null>
export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead | null>
export async function addLeadNote(input: { leadId: string; content: string; createdBy: string }): Promise<LeadNote>
export async function deleteLead(id: string): Promise<boolean>
export async function deleteLeadNote(id: string): Promise<boolean>
```

`getLeadById` runs the 3 sub-queries (lead row + attribution list + notes list) in a single `Promise.all`. Read helpers wrap in try/catch and return `[]` / `null`; write helpers let exceptions escape.

### `src/lib/schemas/admin-leads.ts`

```ts
export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'closed'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]
export const updateLeadStatusSchema  // { id: uuid, status: enum }
export const addLeadNoteSchema       // { leadId: uuid, content: 1..4000 }
export const deleteLeadSchema        // { id: uuid }
export const deleteLeadNoteSchema    // { noteId: uuid, leadId: uuid }
export type UpdateLeadStatusInput
export type AddLeadNoteInput
```

### `src/app/admin/leads/actions.ts`

```ts
export type ActionResult = { ok: true } | { ok: false; errors: Record<string, string> }
export function flattenZod(error: ZodError): Record<string, string>
export async function updateLeadStatusAction(formData: FormData): Promise<void>
export async function addLeadNoteAction(formData: FormData):    Promise<void>
export async function deleteLeadAction(formData: FormData):     Promise<void>
export async function deleteLeadNoteAction(formData: FormData): Promise<void>
```

Every action starts with `await requireAdminSession()` (defense in depth, CONTEXT.md D-12 -- grep count: 5 = 4 action bodies + 1 import). Every successful mutation calls `revalidatePath` (grep count: 7 = 5 explicit calls + 1 import + 1 docstring reference).

### Routes shipped

| URL                     | Component                              | Purpose                                                     |
| ----------------------- | -------------------------------------- | ----------------------------------------------------------- |
| `/admin/leads`          | `src/app/admin/leads/page.tsx`         | List of latest 200 leads, chip-filtered by status           |
| `/admin/leads/[id]`     | `src/app/admin/leads/[id]/page.tsx`    | Detail view + 4 mutation forms (status, add note, delete leads, delete note) |

The detail page renders 5 `<section>`s in order: Contact info, Status, Touchpoints, Notes, Danger. Status section renders 4 forms via `LEAD_STATUSES.map(...)` -- one per status, each posting to `updateLeadStatusAction`. Notes section has an inline add-note textarea plus a list of existing notes, each note carrying its own delete `<form>`. Danger section uses the Phase 04 `DeleteButton` primitive with a `window.confirm` gate.

## Verification evidence

- `bun run lint` -- exit 0 (356 files checked)
- `bun run typecheck` -- exit 0
- Em/en-dash sweep on all 5 new files -- 0 matches
- `grep -c 'await requireAdminSession' src/app/admin/leads/actions.ts` -- 5 (>= 4 required)
- `grep -c 'revalidatePath' src/app/admin/leads/actions.ts` -- 7
- Forbidden patterns (`console.*`, `process.env.*`, `: any`, `<any>`, `as any`) across the 5 new files -- 0 matches
- Protected paths diff vs `main` (auth, dashboard, layout, Phase 04 showcase / blog / testimonials, contact / unsubscribe / newsletter / api/* routes, proxy.ts, all `src/components/admin/*` Phase 03/04 primitives) -- 0 lines changed
- Wave 1 file diff vs `a753f59` (StatusFilterBar, StatusBadge) -- 0 lines changed
- `bun run build` -- intentionally NOT run per Wave 2 orchestrator instruction; verified at Wave 3 / Wave 4

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `<form action>` rejected `ActionResult`-returning actions on server components**

- **Found during:** Task 3 (after wiring `updateLeadStatusAction` and `addLeadNoteAction` into `<form action={...}>` on the detail page).
- **Issue:** Plan specified both actions as `Promise<ActionResult>`. React's `HTMLFormElement.action` typing only accepts `string | ((formData) => void | Promise<void>)`. Wiring an `ActionResult`-returning function directly fails `tsc --noEmit` (`Type 'ActionResult' is not assignable to type 'void'`). The plan also instructed direct `<form action={action}>` wiring with no client island (per CONTEXT.md §3), so the two requirements conflict.
- **Fix:** Changed both action signatures to `Promise<void>`. Errors are now logged via `logger.error` and the action returns; the form re-renders (operator sees unchanged state). `ActionResult` and `flattenZod` stay exported for any future client-form consumer that wants to surface field-level errors.
- **Files modified:** `src/app/admin/leads/actions.ts`
- **Commit:** `5fe1dec`

**2. [Rule 1 - Stylistic] Status section uses `.map()` instead of 4 literal `<form>` blocks**

- **Found during:** Task 3 implementation.
- **Issue:** Plan specified "4 `<form action={updateLeadStatusAction}` blocks one per `LEAD_STATUSES` value" and a `grep -c 'updateLeadStatusAction' >= 5` heuristic. Writing 4 literal `<form>` blocks would duplicate the same JSX for each status string, which violates the project DRY norm and is also how the plan suggests building `FILTER_OPTIONS` itself (via `LEAD_STATUSES.map(...)`).
- **Fix:** Render `LEAD_STATUSES.map(s => <form key={s} action={updateLeadStatusAction}>...</form>)`. Same 4 forms at runtime; only 1 literal text occurrence of `updateLeadStatusAction` in the JSX. The acceptance is functional ("4 forms one per status") and is met.
- **Files modified:** `src/app/admin/leads/[id]/page.tsx`
- **Commit:** `5fe1dec`

### Commit attribution race (Phase 04 Wave 2 pattern recurrence)

The Task 2 commit (`2445bc1`, "feat(05-02): leads admin Server Actions seam") inadvertently swept up two files belonging to Plan 05-04 (`src/lib/admin/newsletter-queries.ts`, `src/lib/schemas/admin-newsletter.ts`) that the sibling Plan 05-04 agent created in the working tree between my `git add` and `git commit` calls. Even though I staged only `src/app/admin/leads/actions.ts` with an exact pathspec, the shared `.git/index` allowed the parallel agent's `git add` to land in the same index before my commit ran. This is the same race documented in CONTEXT.md against Phase 04 (commit `a0128f3` named "testimonials" but contained showcase files).

Mitigation applied for Task 3: after `git add` of only my pathspecs, I verified the staged set with `git diff --cached --name-only` immediately before `git commit` and saw only my 3 files. Task 3 commit (`5fe1dec`) is clean -- 3 files, all leads.

The cross-attributed files in `2445bc1` are functionally correct for Plan 05-04; only the commit message is misleading. Net effect on the branch is identical to what each plan would have shipped independently. Recommended follow-up: when running parallel Wave executors, the orchestrator should serialize the `git add && git commit` step or use per-worktree git checkouts to make the index race impossible.

## Self-Check: PASSED

All 5 created files exist on disk:

- `src/lib/schemas/admin-leads.ts`
- `src/lib/admin/leads-queries.ts`
- `src/app/admin/leads/actions.ts`
- `src/app/admin/leads/page.tsx`
- `src/app/admin/leads/[id]/page.tsx`

All 3 commit hashes exist in `git log`:

- `e1915c7` (Task 1)
- `2445bc1` (Task 2)
- `5fe1dec` (Task 3)
