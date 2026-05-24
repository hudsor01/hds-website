# Phase 04 — Admin Content CRUD

**Date:** 2026-05-23
**Branch:** `admin-content-crud`
**Milestone:** v4 — Admin Panel
**Scope:** Replace the three Phase-03 coming-soon stubs (`/admin/showcase`, `/admin/blog`, `/admin/testimonials`) with real list + create + edit + delete pages backed by the existing Neon tables. Replaces the direct-SQL / Neon MCP workflow currently used to maintain showcase entries, blog posts, and testimonials.

## 1. Goal

After this phase, the operator can manage all three content surfaces from the admin UI without writing SQL:

- See the full list of rows (published + unpublished) with key columns and a status indicator.
- Click a row to edit every field.
- Click New to create a row.
- Toggle published from the list or the edit form.
- Delete from the edit form behind a confirmation.

Public-facing rendering (`/showcase`, `/blog`, `/testimonials` and their detail pages) keeps reading from the same tables and is untouched.

## 2. Non-goals

- **No image uploads.** Admin pastes a URL into the image fields. Image hosting (Vercel Blob, R2, S3) is a separate phase. The seed data already uses external URLs; the admin just edits those URLs.
- **No rich-text / WYSIWYG editor.** Blog `content` is plain `<textarea>` carrying Markdown; the public site already renders markdown server-side.
- **No bulk actions** (multi-select + bulk publish / delete). Single-row only.
- **No pagination, no search, no filters.** Showcase has ~5 rows, blog ~10-50, testimonials ~20. Plain list with a fixed sort is fine. Pagination is a follow-up if any table grows past ~100 rows.
- **No tag / author CRUD pages.** `blog_authors` and `blog_tags` are managed via the existing seed scripts; the admin blog form picks from existing values via a `<select>` and a tag multi-select. New authors / tags require a one-off SQL insert. (Defer to a future phase if it becomes a friction point.)
- **No version history, no soft-delete, no audit log.** Delete is permanent. Update overwrites in place.
- **No revalidation of public routes from admin** — Next.js ISR / `revalidatePath` wiring lives in Phase 5+ if it proves necessary. For now, public pages are dynamic enough that a refresh shows the change.
- **No leads / newsletter / emails pages.** Those are Phase 05.

## 3. CRUD pattern (locked for all three resources)

Every resource follows the same shape so we ship three near-identical implementations instead of three different ones.

**Routes:**

| URL | Component | Purpose |
|---|---|---|
| `/admin/{resource}` | server page | List table: all rows, key columns, published indicator, "New" button, click-row-to-edit |
| `/admin/{resource}/new` | server page wrapping `Create{Resource}Form` client island | Empty form |
| `/admin/{resource}/[id]/edit` | server page (loads row, 404s on miss) wrapping `Edit{Resource}Form` client island | Pre-filled form + Delete button |

**Mutation seam:** **Server Actions** in `src/app/admin/{resource}/actions.ts`. Every action calls `requireAdminSession()` first; non-admin = `redirect('/auth/sign-in')`. Inputs validated with the Zod schema; failures return `{ ok: false, errors }` for the form to render.

Routes are intentionally NOT used for admin mutations. Routes exist only for external systems (the existing Bearer-protected `POST /api/blog/posts` for n8n stays untouched).

**Form library:** `@tanstack/react-form` via the existing `useAppForm` factory in `src/hooks/form-hook.tsx`. Each form binds to a per-resource Zod schema with the `zodSchema` adapter. Submission calls the Server Action with the parsed object; the form's `onSubmit` handles the `{ ok, errors }` envelope by mapping field errors onto fields.

**Slug auto-generation:** Helper `slugify(title)` (`src/lib/admin/slugify.ts`, pure, no DB call) runs on the create form when the slug field is empty and the title blurs. Edit form leaves slug alone unless the operator changes it manually.

**Delete confirmation:** Native `window.confirm('Delete \"...\"? This cannot be undone.')` is sufficient for v1. No custom modal.

**Publish toggle:** Boolean checkbox in the edit form; also a quick-toggle button in the list table that posts to a dedicated `toggle{Resource}PublishedAction`. Toggling `published` does not update `publishedAt` (we set `publishedAt` only on the first transition false -> true; see per-resource section for behavior).

**Empty list state:** Each list page renders "No {resource} yet. Create your first one." with a link to `/new`.

## 4. File-level changes

### New files (admin auth + shared)

- `src/lib/admin/auth.ts` — `requireAdminSession()` server helper: calls `getSession()`, redirects to `/auth/sign-in` on no session, returns the session if `role === 'admin'`, otherwise `redirect('/admin')` (the Forbidden panel renders there).
- `src/lib/admin/slugify.ts` — pure `slugify(input: string): string` that lowercases, strips diacritics, replaces non-alphanumeric runs with `-`, trims leading / trailing hyphens. Mirrors the existing slug regex in `createBlogPostSchema` (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`).
- `src/components/admin/ResourceListPage.tsx` — server component wrapping the common list shell: page header with title + "New" link, table or empty-state.
- `src/components/admin/FormFieldSet.tsx` — labeled wrapper that renders a `<label>`, the child input, and field-level error text. Used inside `useAppForm` field renderers.
- `src/components/admin/DeleteButton.tsx` — `'use client'`. Renders a `<form action={action}>` with a hidden `id` and an `onClick={(e) => { if (!window.confirm(...)) e.preventDefault() }}` red button.
- `src/components/admin/PublishToggle.tsx` — `'use client'`. Renders a `<form action={toggleAction}>` with a small icon-button (`Eye` / `EyeOff` from lucide-react) and an `aria-label`.

### New files (per resource — showcase, blog, testimonials)

For each of the three resources `{r}`:

- `src/lib/admin/{r}-queries.ts` — `'server-only'`. Five typed Drizzle functions:
  - `list{R}sForAdmin()` — returns all rows (published + unpublished), sorted for the list table.
  - `get{R}ById(id)` — returns the row or `null`.
  - `create{R}(input)` — INSERT and return the created row.
  - `update{R}(id, input)` — UPDATE by id and return the updated row.
  - `delete{R}(id)` — DELETE by id, returns `boolean`.
- `src/lib/schemas/admin-{r}.ts` — Zod schemas: `create{R}Schema`, `update{R}Schema` (often `create{R}Schema.partial().extend({ id })` or similar). Exports the inferred types.
- `src/app/admin/{r}/page.tsx` — server list page.
- `src/app/admin/{r}/actions.ts` — Server Actions: `create{R}Action`, `update{R}Action`, `delete{R}Action`, `toggle{R}PublishedAction`. Each calls `requireAdminSession()` first.
- `src/app/admin/{r}/new/page.tsx` — server page wrapping the create form client island.
- `src/app/admin/{r}/new/Create{R}Form.tsx` — `'use client'`. The form, bound to `create{R}Schema`, calling `create{R}Action`.
- `src/app/admin/{r}/[id]/edit/page.tsx` — server page: loads via `get{R}ById`, 404s on miss, wraps the edit form.
- `src/app/admin/{r}/[id]/edit/Edit{R}Form.tsx` — `'use client'`. Pre-filled form bound to `update{R}Schema`, calling `update{R}Action`. Includes the `DeleteButton`.

### Modified files

- `.planning/STATE.md` / `.planning/ROADMAP.md` — phase status after the phase ships.

### Deleted files

- `src/app/admin/(coming-soon)/showcase/page.tsx`
- `src/app/admin/(coming-soon)/blog/page.tsx`
- `src/app/admin/(coming-soon)/testimonials/page.tsx`

The 3 Phase-05 stubs (`leads`, `newsletter`, `emails`) stay.

## 5. Per-resource specs

### 5.1 Showcase (`src/lib/schemas/showcase.ts`)

**Table:** `showcase`. 30 columns. Most are optional (nullable text). The required ones are `slug`, `title`, `description`, `showcaseType` (defaults `'quick'`).

**List columns:** `title`, `slug`, `showcaseType`, `featured`, `published`, `displayOrder`, "actions" cell (edit + publish-toggle + delete in edit form).

**List sort:** `displayOrder ASC, createdAt DESC`. Matches the public-site sort.

**Create schema:** Required: `slug`, `title`, `description`, `showcaseType` (enum `'quick' | 'detailed'`). Everything else optional, with type-correct Zod nullability.
- `technologies`: `z.array(z.string()).default([])` (UI: textarea, one per line, joined / split on submit).
- `metrics`: `z.record(z.string(), z.string()).default({})` (UI: simple key/value rows; if it becomes a friction point, defer to a JSON textarea).
- `galleryImages`: `z.array(z.string().url()).default([])` (UI: textarea, one URL per line).

**`publishedAt` semantics:** Set to `now()` on the first `published: false -> true` transition. Cleared on `true -> false`. Captured inside `updateShowcase` and `toggleShowcasePublishedAction`.

**Slug uniqueness:** Enforced by the DB (`text('slug').notNull().unique()`). The action catches `unique_violation` and returns `{ ok: false, errors: { slug: 'Slug already exists.' } }`.

### 5.2 Blog (`src/lib/schemas/blog.ts`)

**Tables:** `blog_posts`, `blog_authors`, `blog_tags`, `blog_post_tags`. Phase 04 manages `blog_posts` only; authors and tags are picked from existing rows (read-only for this phase).

**List columns:** `title`, `slug`, author name, `featured`, `published`, `publishedAt`, "actions".

**List sort:** `publishedAt DESC NULLS LAST, createdAt DESC`.

**Create schema:** Reuse `createBlogPostSchema` from `src/lib/schemas/blog-api.ts` if it covers the admin shape. If it differs (e.g. admin form needs `authorId: uuid` directly instead of `authorSlug: string`), define `createAdminBlogPostSchema` in `src/lib/schemas/admin-blog.ts` and leave the API schema untouched. **Decision:** the admin form picks the author by id (no need to look up by slug), so a new admin schema is the cleaner answer.
- `authorId`: `<select>` populated from `getAuthors()` (existing read helper).
- `tagIds`: multi-select populated from `getTags()`. Save by clearing `blog_post_tags` then inserting the picked set.
- `content`: large `<textarea>`, markdown. No editor wrapper.

**`publishedAt` semantics:** Same as showcase. Default `published: true` is preserved (blog posts default to published in the existing schema, unlike showcase).

**Foreign-key safety:** `delete{R}` for blog posts must rely on the existing `onDelete: 'cascade'` on `blog_post_tags`. No manual cleanup needed.

### 5.3 Testimonials (`src/lib/schemas/content.ts`)

**Tables:** `testimonials` (and `testimonial_requests`, but request management is a Phase-05 concern; Phase 04 only manages the testimonials themselves).

**List columns:** `name`, `role`, `company`, `rating`, `featured`, `published`, `createdAt`, "actions".

**List sort:** `createdAt DESC`.

**Create schema:** Required: `name`, `content`. Optional: `role`, `company`, `rating` (1-5 int), `imageUrl`, `videoUrl`, `featured`, `published`. Reuse / extend the existing `testimonialSubmitSchema` if shape matches; define a new `createAdminTestimonialSchema` in `src/lib/schemas/admin-testimonials.ts` otherwise.

**Existing write helpers:** `src/lib/testimonials.ts` already exports `submitTestimonial`, `updateTestimonialStatus`, `deleteTestimonial`. The admin layer reuses those where it can rather than reimplementing.

**No `publishedAt` column.** Testimonials only track `createdAt` / `updatedAt`.

## 6. Server Actions contract

Every action exported from `src/app/admin/{r}/actions.ts`:

```ts
'use server'
export async function create{R}Action(formData: FormData): Promise<
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string> }
> {
  await requireAdminSession()
  const parsed = create{R}Schema.safeParse(formDataToObject(formData))
  if (!parsed.success) return { ok: false, errors: flattenZod(parsed.error) }
  try {
    const row = await create{R}(parsed.data)
    revalidatePath('/admin/{r}')
    redirect(`/admin/{r}/${row.id}/edit`)
  } catch (e) {
    if (isUniqueViolation(e, 'slug')) return { ok: false, errors: { slug: 'Slug already exists.' } }
    logger.error('create{R} failed', e)
    return { ok: false, errors: { _form: 'Could not create. Please try again.' } }
  }
}
```

Similar shape for `update`, `delete` (no body return on delete; redirects to the list), `togglePublished`.

`formDataToObject` is a small helper (`src/lib/admin/form-data.ts`) that flattens `FormData` into a plain object. Lives in `src/lib/admin/` because no public API needs it.

`isUniqueViolation(error, column)` is a small helper (`src/lib/admin/db-errors.ts`) that pattern-matches `error.code === '23505'` and the constraint name.

## 7. Constraints (do not violate)

- All project conventions in `/CLAUDE.md` apply. Highlights: NO emojis, NO em-dash (—) / en-dash (–) in any user-facing string (form labels, errors, button text, page titles), server-first components, existing utility classes from `globals.css` (no hardcoded colors), `text-accent-text` for small accent body copy, Logger not `console.*`, Zod `safeParse` not `parse`, env via `@/env`.
- Public-site files **stay untouched**. Specifically: `src/app/showcase/*`, `src/app/portfolio/*`, `src/app/blog/*`, `src/app/testimonials/*`, `src/lib/showcase.ts`, `src/lib/blog.ts`, `src/lib/testimonials.ts`. The admin layer adds NEW read functions (`list{R}sForAdmin`, `get{R}ById`) in `src/lib/admin/{r}-queries.ts` instead of changing the public read helpers (which already filter to `published: true`).
- Phase 02 + 03 files stay untouched. Specifically: all `src/lib/auth/*`, `src/components/auth/*`, `src/app/auth/*`, `src/app/api/auth/[...all]/route.ts`, `proxy.ts`, `src/lib/auth/admin.ts` (Bearer guard for cron), `src/lib/admin/dashboard-queries.ts`, `src/components/admin/{Sidebar,Topbar,Forbidden}.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/dashboard/page.tsx`, `src/components/admin/widgets/*`.
- Existing `POST /api/blog/posts` Bearer-protected route stays untouched. n8n keeps using it.
- All admin pages remain `role === 'admin'`-only via the existing `src/app/admin/layout.tsx` gate. Server Actions add a second `requireAdminSession()` check inside the action body (defense in depth — the layout gate only stops a GET render; an action can be invoked from a leaked POST without going through the layout).
- Lists and forms are server components by default. Client islands (`'use client'`) are limited to: the form components themselves (need React state + hooks), `DeleteButton` (needs `window.confirm`), `PublishToggle` (toggle pattern), and any field control that needs `useState` (e.g. tag multi-select).

## 8. Verification

- `bun run lint && bun run typecheck && bun run build` all exit 0
- All three list pages render: rows visible, "New" button present
- Create form for each resource: posts, redirects to edit page, row visible in list
- Edit form for each resource: pre-filled, save persists, redirects back to list (or stays on edit; pick during planning)
- Delete from edit form: confirms, removes row, redirects to list
- Publish toggle from list: flips `published`, persists, list updates
- Em / en-dash sweep on all phase-04 changed files: zero
- `src/lib/auth/admin.ts` diff vs main: empty
- Public site smoke: `/showcase`, `/blog`, `/testimonials` still render the same rows; no regressions

## 9. Out of scope

- Image upload UI (paste-URL only)
- Rich-text editor (markdown textarea only)
- Bulk actions
- Pagination, search, filters
- Author / tag CRUD
- Soft-delete, version history, audit log
- Public-route revalidation wiring (`revalidatePath` is called from actions, but no ISR config changes)
- Leads / newsletter / emails admin (Phase 05)
