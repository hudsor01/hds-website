---
phase: 04-admin-content-crud
plan: 04
subsystem: admin-testimonials-crud
tags: [admin, testimonials, server-actions, drizzle, zod, tanstack-form]
requires:
  - "@/lib/admin/auth (requireAdminSession)"
  - "@/lib/admin/form-data (formDataToObject)"
  - "@/components/admin/{ResourceListPage,FormFieldSet,DeleteButton,PublishToggle}"
  - "@/lib/testimonials (deleteTestimonial re-export)"
  - "@/lib/schemas/schema (testimonials Drizzle table)"
  - "@/hooks/form-hook (useAppForm)"
provides:
  - "listTestimonialsForAdmin, getTestimonialById, createTestimonial, updateTestimonial, toggleTestimonialPublished"
  - "createAdminTestimonialSchema, updateAdminTestimonialSchema"
  - "createTestimonialAction, updateTestimonialAction, deleteTestimonialAction, toggleTestimonialPublishedAction"
  - "/admin/testimonials list page, /admin/testimonials/new create page, /admin/testimonials/[id]/edit edit page"
affects:
  - "Public /testimonials route: NONE (read path src/lib/testimonials.ts byte-equal to main)"
tech-stack:
  added: []
  patterns:
    - "Server-action mutation seam with requireAdminSession() defense-in-depth gate"
    - "Server-only Drizzle query module with try/catch -> empty / null fallback"
    - "TanStack Form client island packing values into FormData for the Server Action"
key-files:
  created:
    - "src/lib/schemas/admin-testimonials.ts"
    - "src/lib/admin/testimonials-queries.ts"
    - "src/app/admin/testimonials/page.tsx"
    - "src/app/admin/testimonials/actions.ts"
    - "src/app/admin/testimonials/new/page.tsx"
    - "src/app/admin/testimonials/new/CreateTestimonialForm.tsx"
    - "src/app/admin/testimonials/[id]/edit/page.tsx"
    - "src/app/admin/testimonials/[id]/edit/EditTestimonialForm.tsx"
    - "tests/unit/schemas/admin-testimonials.test.ts"
  modified: []
decisions:
  - "publishedAt: there is no such column on testimonials, so the publish toggle flips the boolean only. Toggle does not touch updatedAt either when there is no change (existing.published == new value would not happen in toggle, but updatedAt fires on every UPDATE)."
  - "deleteTestimonial re-exports the existing public helper from @/lib/testimonials per CONTEXT.md 5.3 -- single DELETE seam, single error-logging side effect."
  - "Admin create form defaults published=false even though DB defaults true. Rationale: operator gets a review beat before the row goes live."
  - "Boolean(field.state.value) coercion on checkbox `checked` props instead of `?? false`. TanStack Form's inferred type collapses to `{}` for default-false fields and TS rejects `{} | undefined` as a `boolean` source; Boolean() bypasses the inference without re-typing the factory."
metrics:
  duration: ~40 minutes (parallel with plans 04-02 and 04-03)
  completed-date: 2026-05-23
---

# Phase 04 Plan 04: Testimonials CRUD Vertical Slice Summary

Admin operator can list, create, edit, toggle-publish, and delete testimonials at `/admin/testimonials` without writing SQL. Eight new files, all reads on the read path (`src/lib/testimonials.ts`, `src/app/testimonials/*`) byte-equal to main.

## What was built

**Data layer (2 files):**

- `src/lib/schemas/admin-testimonials.ts` — `createAdminTestimonialSchema` + `updateAdminTestimonialSchema`. Optional text columns coerce empty string to `null`; optional URL columns reject non-http(s). Both `featured` and `published` default to `false` on the admin shape (DB defaults `published: true` but the operator picks explicitly).
- `src/lib/admin/testimonials-queries.ts` — server-only Drizzle helpers: `listTestimonialsForAdmin`, `getTestimonialById`, `createTestimonial`, `updateTestimonial`, `deleteTestimonial` (re-export), `toggleTestimonialPublished`. Reads carry `try/catch -> []` / `null` so a transient DB blip renders an empty list instead of crashing the admin shell.

**Routes (6 files):**

- `src/app/admin/testimonials/page.tsx` — list table (Name / Role / Company / Rating / Featured / Published / Created / Actions). Sorted `createdAt DESC`. Wrapped in `Suspense` + `await connection()` so the DB read stays outside any partial-prerender step. Rating renders `"5/5"` or `"Unrated"`; nullable role / company render `"Unspecified"`. Empty state: `"No testimonials yet. Create your first one."`
- `src/app/admin/testimonials/actions.ts` — 4 Server Actions (`create`, `update`, `delete`, `togglePublished`). Each opens with `await requireAdminSession()` (D-12 defense in depth) and closes with `revalidatePath('/admin/testimonials')`. Create redirects to the edit page; update returns the `{ ok, errors }` envelope; delete and toggle return `void`. No unique-violation translation -- the testimonials table has no unique constraint other than the primary key.
- `src/app/admin/testimonials/new/page.tsx` — pure server shell: back-link, heading, client form.
- `src/app/admin/testimonials/new/CreateTestimonialForm.tsx` — TanStack Form client island binding all 9 fields. Image / video are URL paste only (D-04). On `{ ok: false, errors }` maps field errors via `setFieldMeta` and surfaces `_form` as a banner.
- `src/app/admin/testimonials/[id]/edit/page.tsx` — server loader, `notFound()` on miss.
- `src/app/admin/testimonials/[id]/edit/EditTestimonialForm.tsx` — pre-filled form, stays on the page after save with a `Saved.` banner, `<DeleteButton />` rendered below in a separate `<form>` so a stray Enter cannot fire delete.

**Tests (1 file):**

- `tests/unit/schemas/admin-testimonials.test.ts` — 6 cases (happy path, missing name, rating below 1, rating above 5, empty URL collapses to null, update requires uuid id).

## Verification

- `bun run lint` exits 0
- `bun run typecheck` exits 0
- `bun test tests/unit/schemas/admin-testimonials.test.ts` 6 pass / 0 fail
- `grep -n "await requireAdminSession" src/app/admin/testimonials/actions.ts` returns 5 lines (1 docstring + 4 actual action gates) -- gate requires `>= 4`
- `grep -n "revalidatePath('/admin/testimonials')" src/app/admin/testimonials/actions.ts` returns 5 lines (1 docstring + 4 mutation calls)
- Em-dash / en-dash sweep on the 9 new files: 0 matches each
- No `console.*`, no `process.env.*`, no `: any` in the 9 new files
- `git diff main -- src/lib/testimonials.ts src/app/api/testimonials/ src/lib/schemas/content.ts src/app/testimonials/`: empty (locked public path untouched)
- `git diff main -- src/lib/auth/ src/components/auth/ src/app/auth/ proxy.ts src/lib/admin/dashboard-queries.ts src/app/admin/{layout,page,dashboard/page}.tsx src/components/admin/{Sidebar,Topbar,Forbidden}.tsx src/lib/auth/admin.ts`: empty (Phase 02/03 locked)
- `git diff 18f94f4^..18f94f4 -- src/lib/admin/{auth,form-data,db-errors,slugify}.ts src/components/admin/{FormFieldSet,DeleteButton,PublishToggle,ResourceListPage}.tsx`: empty (Wave 1 outputs consumed, not modified)

## Deviations from Plan

- **Race-condition deviation**: This plan was executed in parallel with 04-02 and 04-03 against a shared git index, which caused multiple commits to have hijacked file lists (commits ended up referencing other plans' files even when only one agent's files were `git add`-ed). The final state on the `admin-content-crud` branch contains the correct file content per plan, but the per-commit attribution may not match the planned 1-commit-per-task structure. Net result for this plan: all 9 files are committed at `18f94f4` with the correct commit message.
- **Boolean() coercion on checkboxes**: Mirrors the pattern that the showcase plan settled on; using `field.state.value ?? false` fails typecheck because TanStack Form's default-false field type collapses to `{}` which is incompatible with `boolean | undefined`. `Boolean(field.state.value)` is a one-line workaround that does not change runtime behavior.

## Self-Check: PASSED

- src/lib/schemas/admin-testimonials.ts: FOUND
- src/lib/admin/testimonials-queries.ts: FOUND
- src/app/admin/testimonials/page.tsx: FOUND
- src/app/admin/testimonials/actions.ts: FOUND
- src/app/admin/testimonials/new/page.tsx: FOUND
- src/app/admin/testimonials/new/CreateTestimonialForm.tsx: FOUND
- src/app/admin/testimonials/[id]/edit/page.tsx: FOUND
- src/app/admin/testimonials/[id]/edit/EditTestimonialForm.tsx: FOUND
- tests/unit/schemas/admin-testimonials.test.ts: FOUND
- Commit 18f94f4: FOUND in git log
