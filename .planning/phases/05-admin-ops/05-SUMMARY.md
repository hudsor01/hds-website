---
phase: 05-admin-ops
plans: 7
waves: 4
status: complete
date: 2026-05-23
branch: admin-ops
requirements: [P05]
tech-stack:
  added: []
  patterns:
    - "Same Server Actions seam as Phase 04 (per-resource `actions.ts` calls `requireAdminSession()` -> Zod safeParse -> Drizzle mutation -> `revalidatePath`)"
    - "Defense-in-depth auth: every Phase 05 Server Action calls `requireAdminSession()` (leads=5, calculator=4, newsletter=4, emails=4) even though the `/admin/*` layout already enforces role"
    - "Single data seam per resource: `src/lib/admin/{leads,calculator-leads,newsletter,emails}-queries.ts`. Admin UI never imports `db` directly"
    - "Detail page IS the edit surface — no `/[id]/edit` split. Mutations are single-button `<form action={action}>` shapes (no useAppForm); the leads add-note flow is a 1-textarea form, same shape"
    - "2 shared admin primitives reused across all 4 surfaces: `StatusFilterBar` (server-side `<form method=\"get\">` chip row) + `StatusBadge` (OKLCH token color map)"
    - "Next 16 cacheComponents handled correctly on first pass by Wave-2 agents: every `[id]/page.tsx` exports `generateStaticParams()` returning `__build_placeholder__` and calls `await connection()` at the top of the page"
    - "Filter chips round-trip via `?status=...` query param, server-rendered, no client JS"
    - "`revalidatePath` covers BOTH list path AND detail path on every mutation (leads=7, calculator=7, newsletter=7, emails=7) so the operator sees the change immediately on either surface"
key-files:
  created:
    - src/components/admin/StatusFilterBar.tsx
    - src/components/admin/StatusBadge.tsx
    - src/lib/admin/leads-queries.ts
    - src/lib/admin/calculator-leads-queries.ts
    - src/lib/admin/newsletter-queries.ts
    - src/lib/admin/emails-queries.ts
    - src/lib/schemas/admin-leads.ts
    - src/lib/schemas/admin-calculator-leads.ts
    - src/lib/schemas/admin-newsletter.ts
    - src/lib/schemas/admin-emails.ts
    - "src/app/admin/leads/* (page, actions, [id]/page)"
    - "src/app/admin/leads/calculator/* (page, actions, [id]/page)"
    - "src/app/admin/newsletter/* (page, actions, [id]/page)"
    - "src/app/admin/emails/* (page, actions, [id]/page)"
  deleted:
    - "src/app/admin/(coming-soon)/leads/page.tsx"
    - "src/app/admin/(coming-soon)/newsletter/page.tsx"
    - "src/app/admin/(coming-soon)/emails/page.tsx"
metrics:
  unit-tests-added: 0
  unit-tests-total: 563
  admin-routes-shipped: 8
  admin-routes-total: 19
  protected-paths-verified: 53
  files-created: 22
  files-deleted: 3
---

# Phase 05: admin-ops Summary

Operator-facing ops surfaces for the three Phase-03 coming-soon stubs (`/admin/leads`, `/admin/newsletter`, `/admin/emails`) plus a dedicated `/admin/leads/calculator` sub-page for calculator submissions. Read-mostly tabular pages with status filtering and per-row mutations: change lead status, add/delete a lead note, mark a calculator lead contacted or converted, unsubscribe/re-subscribe a newsletter row, retry or cancel a scheduled email, and hard-delete any of the above. Every mutation is a single-button form posting to a Server Action that calls `requireAdminSession()` first, parses with Zod, mutates via Drizzle, then `revalidatePath` for both the list and detail paths. After this phase, every nav item in the admin sidebar lands on a real working page (D-1 "every nav item lands on a real working page" from CONTEXT.md is satisfied), and the operator manages inbound leads, newsletter subscribers, and the scheduled-email queue from the admin UI without opening Neon Console. v4 (Admin Panel) milestone is complete.

## Plans

| Plan  | Wave | Status   | Description                                                                  |
| ----- | ---- | -------- | ---------------------------------------------------------------------------- |
| 05-01 | 1    | complete | Shared admin primitives: `StatusFilterBar` + `StatusBadge`                   |
| 05-02 | 2    | complete | Leads ops vertical slice (`/admin/leads` + `[id]`, 4 mutations)              |
| 05-03 | 2    | complete | Calculator-leads vertical slice (`/admin/leads/calculator` + `[id]`, 3 mut.) |
| 05-04 | 2    | complete | Newsletter ops vertical slice (`/admin/newsletter` + `[id]`, 3 mutations)    |
| 05-05 | 2    | complete | Emails ops vertical slice (`/admin/emails` + `[id]`, 3 mutations + counts)   |
| 05-06 | 3    | complete | Delete coming-soon stubs + Wave-3 latent-export build fix                    |
| 05-07 | 4    | complete | Verification gate (this plan)                                                |

## Commits

### Bootstrap
- `9ce62de` chore(05): bootstrap admin-ops context

### Wave 1 — Shared primitives
- `a753f59` feat(05): add admin status filter bar + status badge primitives

### Wave 2 — Vertical slices (parallel agents)
- `e1915c7` feat(05-02): leads admin schema + Drizzle query layer
- `458cac5` feat(05-03): calculator-leads Zod schemas + Drizzle query layer
- `2445bc1` feat(05-02): leads admin Server Actions seam  [actual contents includes newsletter Task 1 files — see "Wave 2 commit-attribution race" below]
- `2c14930` feat(05-05): emails admin schemas + Drizzle query layer
- `da399b8` feat(05-03): calculator-leads Server Actions
- `f3dbab8` feat(05-05): emails admin Server Actions (retry/cancel/delete)
- `9607c3a` feat(05-03): calculator-leads list + detail pages
- `6d76bfe` feat(05-05): emails admin list + detail pages
- `c48bd08` feat(05-04): newsletter admin list + detail + Server Actions
- `5fe1dec` feat(05-02): leads admin list + detail pages
- `b01c4bb` docs(05-03): complete calculator-leads ops slice
- `f240ec4` docs(05-05): complete emails ops slice
- `563331a` docs(05-04): newsletter ops plan summary

### Wave 3 — Stub cleanup + latent build fix
- `cf59c45` feat(05): remove coming-soon stubs + unblock build  (also removed a latent `flattenZod` + `ActionResult` runtime export from `leads/actions.ts` that was invisible until `next build` could run)

### Wave 4 — Verification
- See VERIFICATION.md commit (next).

## Architecture notes

### Same Server Actions contract as Phase 04

Every mutation in every Phase 05 action file follows the identical shape Phase 04 established:

1. `await requireAdminSession()` (D-12 defense in depth; the admin layout already enforces role for GET, but a forged POST can hit an action without going through the layout)
2. `formDataToObject(formData)` -> Zod `safeParse` against the resource's `admin-{r}.ts` schema
3. Drizzle mutation in `src/lib/admin/{r}-queries.ts`
4. `revalidatePath('/admin/{r}')` AND `revalidatePath('/admin/{r}/[id]', 'page')` so the list and detail both re-render after the mutation
5. `redirect('/admin/{r}')` for delete actions; `return { ok: true }` or `void` otherwise

No business logic lives in the page components; pages render forms and lists, actions own the writes. Reuse-rate from Phase 04: 100% (no new shared helpers were needed).

### 2 new shared primitives — both reused across all 4 surfaces

`src/components/admin/StatusFilterBar.tsx` — a server component that renders a `<form method="get">` chip row of `<button name="status" value="...">` entries. Active chip gets `aria-current="page"`. Reused identically by `/admin/leads`, `/admin/leads/calculator`, `/admin/newsletter`, and `/admin/emails`. Zero client JS.

`src/components/admin/StatusBadge.tsx` — a server component that maps status strings to OKLCH token colors. Same component renders the lead status, calculator lead quality, newsletter status, and scheduled-email status badges with consistent palette across the 4 surfaces.

### No useAppForm for any Phase 05 form

Every mutation in Phase 05 is a single-button form (`<form action={action}>` + hidden id + submit button), shape lifted from Phase 04's `DeleteButton` / `PublishToggle` primitives. The leads add-note flow is a 1-textarea form, same shape. `useAppForm` overhead is not justified for forms with 0-1 fields and no per-field validation messaging. Result: zero client-side state in any Phase 05 page.

### Detail page IS the edit surface (no `/[id]/edit` split)

Phase 04 split list / new / edit into 3 routes per resource (`/admin/{r}`, `/admin/{r}/new`, `/admin/{r}/[id]/edit`). Phase 05 collapses to 2 (`/admin/{r}`, `/admin/{r}/[id]`) because:

- No row creation (leads / subscribers / scheduled emails are all created by inbound systems)
- Mutations are small (status change, add note, retry, cancel) and don't justify a separate page
- The operator decides "what to change" by looking at the row's context (attribution, notes, retry history), so the change UI belongs ON the detail view

Total admin route count: 19 (8 new in Phase 05 + 11 preserved from Phase 03/04).

### Wave 2 commit-attribution race

Same as Phase 04. 4 parallel executor agents in a single working tree (leads + calculator-leads + newsletter + emails), each staging its own files individually per `task_commit_protocol`. Commit *messages* were generated independently and one agent's message landed against another agent's content. End state on disk is correct (every Phase-05 file accounted for, every gate green), but commit-message attribution does NOT match content for at least `2445bc1` — named "leads Server Actions" but also contains newsletter Task 1 files. Future readers: verify by file content via `git show <hash> --stat`, not by commit message.

Mitigation for the next phase that uses parallel agents: stage per-resource into separate sub-working-trees (one per agent), or serialize Wave-2 commits behind a single coordinator. Already documented as a deferred mitigation in STATE.md.

### Next 16 cacheComponents — correct on first pass

Wave 2 agents applied the Phase-04 prerender pattern correctly without needing a Wave-3 retrofit (unlike Phase 04, which needed `e780f2b` to add the placeholder). Every `[id]/page.tsx` in Phase 05 exports `generateStaticParams()` returning a single `__build_placeholder__` entry AND calls `await connection()` at the top of the page to force runtime rendering. Build output shows the placeholder row alongside the real `[id]` row for all 4 detail routes.

### Latent `'use server'` non-async export — removed in Wave 3

The leads agent originally shipped a `flattenZod` helper function AND an `ActionResult` value (not just type) as module-level exports from `src/app/admin/leads/actions.ts`. React's `'use server'` rules disallow non-async function exports at runtime — the file would have shipped fine through lint + typecheck but `next build` would have failed.

The issue stayed invisible until Wave 3's stub-deletion commit (`cf59c45`) finally let the full build run end-to-end against the admin-ops branch. The same commit removed the non-async exports inline. The other 3 Phase-05 action files (`calculator/actions.ts`, `newsletter/actions.ts`, `emails/actions.ts`) keep a local `export type ActionResult` — type-only, erased at compile time, allowed by `'use server'` — but no value exports.

Lesson: a clean `bun run typecheck` is necessary but not sufficient for a `'use server'` file. Add `bun run build` to the per-task verification command if a future plan ships new `actions.ts` files with shared exports.

## Files touched

22 new src/ files + 3 deletions (3 coming-soon stubs) = 25 src-tree diff entries against main:

- 2 shared admin primitives (`StatusFilterBar`, `StatusBadge`)
- 4 query libraries (`{leads, calculator-leads, newsletter, emails}-queries.ts`)
- 4 schema files (`admin-{leads, calculator-leads, newsletter, emails}.ts`)
- 12 admin-page files: 4 list pages, 4 detail pages, 4 actions files

Plus planning files: 7 PLAN.md + 4 in-flight SUMMARY.md (`05-02`, `05-03`, `05-04`, `05-05`) + 1 VERIFICATION.md + this phase-level SUMMARY.md.

## Verification

See `05-07-VERIFICATION.md` for the full evidence log. All 13 automated gates + Gate 10b passed:

1. Lint (353 files, zero diagnostics)
2. Typecheck (clean)
3. Unit tests (563 pass / 0 fail, unchanged from Phase 04 baseline — Phase 05 added no new test files by design)
4. Build (19 admin routes, all `◐` partial prerender, zero `(coming-soon)` segments)
5. Em-dash sweep on Phase-05 changed files (zero matches)
6. En-dash sweep on Phase-05 changed files (zero matches)
7. Protected files byte-equal to main (53 / 53 paths, 0 bytes diff each)
8. Coming-soon stubs removed (3 files + 1 dir gone)
9. `requireAdminSession` defense-in-depth (leads=5, calculator=4, newsletter=4, emails=4; all >= 3)
10. `revalidatePath` coverage (leads=7, calculator=7, newsletter=7, emails=7; all >= 3)
10b. `'use server'` non-async value exports (zero — only `export async function` + `export type`)
11. No `console.*` in Phase-05 added files (zero matches)
12. No `process.env.X` in Phase-05 added files (zero matches)
13. No `: any` / `<any>` / `as any` in Phase-05 added files (zero matches)
13b. `/api/process-emails/route.ts` byte-equal to main (0 bytes diff)

The 35-step manual operator smoke checklist (4 surfaces + cross-cuts, expanded from Phase 04's 20 to cover the calculator-leads sub-page and the per-row retry / cancel logic on emails) is documented in `05-07-VERIFICATION.md` and deferred to the operator pre-PR.

## Recommended PR commit message

```
feat(admin): ops - leads, calculator-leads, newsletter, emails with Server Actions
```

(Hyphen `-` used in place of em-dash per CLAUDE.md user-facing-text rule. The PR title and the squash commit body both ship to the GitHub UI as user-facing strings.)

PR body should reference:
- This SUMMARY for the architecture overview
- `05-07-VERIFICATION.md` for the gate-by-gate evidence
- v4 milestone closure (4 of 4 phases complete after merge)

## Next action

Operator runs the 35-step manual smoke checklist (in `05-07-VERIFICATION.md`) against `bun run dev` on port 3001, signed in as the admin user. After it passes, ship the PR for `admin-ops` -> `main`. After merge, v4 milestone (Admin Panel) is complete — choose v5 direction.

The v3 / v4 phase / plan / wave / verification / summary cycle is now battle-tested across 11 phases (Phase 01 + 4 v4 phases + the rest). The framework is ready for v5 without additional process iteration.

## Self-Check: PASSED

- All 4 expected files present (`05-07-VERIFICATION.md`, `05-SUMMARY.md`, `STATE.md`, `ROADMAP.md`)
- All 16 expected commits present in `git log --all` (bootstrap through Wave-3 cleanup)
- ROADMAP Phase 05 status updated to `complete (7/7)`; all 7 plan checkboxes flipped to `[x]`; zero remaining `[ ]` entries for Phase 05
