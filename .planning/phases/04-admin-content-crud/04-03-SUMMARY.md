---
phase: 04-admin-content-crud
plan: 03
subsystem: admin-blog-crud
tags: [admin, blog, crud, server-actions, drizzle, zod, tanstack-form]
requirements: [P04]
dependency_graph:
  requires:
    - 04-01 (shared admin helpers + UI primitives: auth, slugify, form-data, db-errors, FormFieldSet, DeleteButton, PublishToggle, ResourceListPage)
    - existing public read helpers in src/lib/blog.ts (getAuthors, getTags) - left byte-equal to main
    - existing Drizzle tables blog_posts, blog_authors, blog_tags, blog_post_tags (src/lib/schemas/blog.ts)
  provides:
    - admin blog list, create, edit, delete flow at /admin/blog
    - createAdminBlogPostSchema + updateAdminBlogPostSchema (admin-shape with authorId uuid + tagIds uuid[])
    - server-only blog-queries module (list/get/create/update/delete/togglePublished) with transactional tag-set replacement
    - 4 Server Actions: createBlogPostAction, updateBlogPostAction, deleteBlogPostAction, toggleBlogPostPublishedAction
  affects:
    - none on public surface (src/lib/blog.ts, src/app/blog/, src/lib/schemas/blog-api.ts, src/app/api/blog/posts/route.ts all byte-equal to main)
tech-stack:
  added: []
  patterns:
    - "tag-set replacement inside db.transaction (delete + reinsert) so partial failure rolls the post update back too"
    - "ON DELETE CASCADE on blog_post_tags removes join rows on post delete (no manual cleanup)"
    - "publishedAt transition: stamp now() on false->true, clear on true->false, keep existing otherwise"
    - "Server Action defense-in-depth: requireAdminSession() at the top of every action"
    - "FormData boolean encoding: client sends literal 'true'/'false' strings so z.coerce.boolean() parses without falling back to defaults"
key-files:
  created:
    - src/lib/schemas/admin-blog.ts
    - src/lib/admin/blog-queries.ts
    - src/app/admin/blog/page.tsx
    - src/app/admin/blog/actions.ts
    - src/app/admin/blog/new/page.tsx
    - src/app/admin/blog/new/CreateBlogForm.tsx
    - src/app/admin/blog/[id]/edit/page.tsx
    - src/app/admin/blog/[id]/edit/EditBlogForm.tsx
    - tests/unit/schemas/admin-blog.test.ts
  modified: []
decisions:
  - "Separate createAdminBlogPostSchema in admin-blog.ts rather than reusing createBlogPostSchema in blog-api.ts. The admin form picks author/tags by uuid (no slug lookup) while n8n posts slugs; the public schema must stay byte-equal to main per CONTEXT.md D-13."
  - "Client forms own state with useState instead of useAppForm. The form factory has no checkbox-grid field type for the tag multi-select, and we needed explicit FormData encoding (boolean checkboxes as 'true'/'false' strings) so the action's z.coerce.boolean() resolves correctly without defaulting."
  - "publishedAt transition helper is duplicated inside blog-queries.ts (and will be duplicated in showcase/testimonials) per CONTEXT.md guidance to keep file count bounded. 4 lines per copy, identical contract."
  - "Author select pre-selects authorOptions[0] on the create form; UX assumes an admin always has at least one author seeded (true in this project). If no authors, the form renders a disabled 'No authors available' option."
  - "Edit page does NOT auto-slugify on title blur per CONTEXT.md D-09 (slug auto-fill is a create-time convenience only; editing a slug is an explicit operator decision)."
  - "DeleteButton sits outside the <form> on the edit page so a stray submit cannot fire the delete action."
metrics:
  duration: "~25 min wall-clock (multiple Wave 2 parallel-agent race retries)"
  completed: 2026-05-23
---

# Phase 04 Plan 03: Blog CRUD vertical slice

## One-liner

Admin operator can list, create, edit, delete, and toggle-publish blog posts at `/admin/blog` with author select + tag multi-select, backed by `blog_posts` + transactional `blog_post_tags` writes.

## Files created (9)

| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/schemas/admin-blog.ts` | 56 | Zod `createAdminBlogPostSchema` + `updateAdminBlogPostSchema` (admin shape: `authorId` uuid + `tagIds` uuid[]) |
| `src/lib/admin/blog-queries.ts` | 230 | `'server-only'` Drizzle helpers: list / get / create / update / delete / togglePublished, with transactional tag-set replacement |
| `src/app/admin/blog/page.tsx` | 110 | Server list page; columns: title, slug, author, featured, published, publishedAt, actions. Empty publishedAt renders the literal `Unpublished` (no em-dash). |
| `src/app/admin/blog/actions.ts` | 137 | 4 Server Actions, each opens with `await requireAdminSession()` and calls `revalidatePath('/admin/blog')` after every mutation |
| `src/app/admin/blog/new/page.tsx` | 44 | Server page; fetches authors + tags via existing public helpers, hands off to client form |
| `src/app/admin/blog/new/CreateBlogForm.tsx` | 324 | Client form; useState + useTransition; auto-slugify on title blur; tag checkbox grid posts repeated `tagIds` FormData key |
| `src/app/admin/blog/[id]/edit/page.tsx` | 57 | Server page; loads via `getBlogPostForAdmin`, `notFound()` on miss |
| `src/app/admin/blog/[id]/edit/EditBlogForm.tsx` | 333 | Client form; pre-filled from row; no slug auto-fill; DeleteButton sits outside the form |
| `tests/unit/schemas/admin-blog.test.ts` | ~95 | 7 unit tests covering happy path, missing authorId rejection, bad slug regex, default tagIds, empty featureImage transform, update schema id requirement |

## Test count

- 7 unit tests in `tests/unit/schemas/admin-blog.test.ts` (all passing)

## Diff vs main verification

```
git diff main -- \
  src/lib/blog.ts \
  src/lib/schemas/blog.ts \
  src/lib/schemas/blog-api.ts \
  src/app/api/blog/posts/route.ts \
  src/lib/auth/ \
  src/components/auth/ \
  src/app/auth/ \
  proxy.ts \
  src/lib/admin/dashboard-queries.ts \
  src/components/admin/Sidebar.tsx \
  src/components/admin/Topbar.tsx \
  src/components/admin/Forbidden.tsx \
  src/components/admin/widgets/ \
  src/app/admin/layout.tsx \
  src/app/admin/page.tsx \
  src/app/admin/dashboard/page.tsx \
  src/lib/auth/admin.ts \
  'src/app/admin/(coming-soon)/blog/' \
  src/app/blog/
```

Result: 0 lines. All protected files byte-equal to main per CONTEXT.md D-13 (n8n endpoint), D-14 (public surface), and Phase 02/03 hands-off list.

## Gates

| Gate | Result |
|------|--------|
| `bun run typecheck` | exit 0 |
| `bun run lint` | exit 0 |
| `bun test tests/unit/schemas/admin-blog.test.ts` | 7 pass / 0 fail |
| em-dash / en-dash sweep on blog files | 0 matches |
| `console.*` / `process.env.X` / `: any` / `as any` | 0 matches |
| `grep -c "await requireAdminSession" src/app/admin/blog/actions.ts` | 4 (one per Server Action) |
| `grep -c "revalidatePath('/admin/blog')" src/app/admin/blog/actions.ts` | 4 (one per mutation) |
| `src/app/api/blog/posts/route.ts` diff vs main | empty |
| `src/lib/schemas/blog-api.ts` diff vs main | empty |
| `src/lib/blog.ts` diff vs main | empty |
| Phase 02/03 + Wave 1 files diff vs main | empty (Wave 1 commits appear new on this branch but are byte-equal to their original commits) |

## Commits

| Hash | Message | Files |
|------|---------|-------|
| `aa2c069` | feat(04): admin blog schemas + Drizzle query layer | `src/lib/schemas/admin-blog.ts`, `src/lib/admin/blog-queries.ts`, `tests/unit/schemas/admin-blog.test.ts` |
| `3cea181` | feat(04): admin blog CRUD pages, forms, and Server Actions | `src/app/admin/blog/**` (6 files); the working-tree race also swept in `04-02-SUMMARY.md` produced by the parallel showcase agent. The 6 blog files in this commit are correct and complete. |

## Deviations from Plan

### Wave 2 parallel-agent race (process issue, not a code change)

**Root cause:** All three Wave 2 plans (04-02 showcase, 04-03 blog, 04-04 testimonials) ran in the SAME working tree rather than separate git worktrees. They contended for the staging index. Several intermediate commits picked up files from other agents because `git add <dir>` was racing with concurrent stages from sibling agents.

**Impact on this plan:** Two intermediate commits had wrong contents:
- The first attempt at the Task 1 commit (since rewritten) accidentally included testimonials files.
- The first attempt at the Task 2 commit (since rewritten via soft reset + restage) shipped showcase files under the blog message; on retry the blog files committed correctly under `3cea181`.

The reflog shows the cleanup (`git reset --soft HEAD~1`, restage, recommit) that landed the correct content. The final commit `3cea181` contains the correct 6 blog files plus an `04-02-SUMMARY.md` file that the parallel showcase agent wrote into the staging area between my `git add` and `git commit`.

**Code impact:** None. All blog code in the final commit is the code I authored. The sibling-agent `04-02-SUMMARY.md` is a planning artifact that does not affect runtime behavior.

**Recommendation for future Wave executions:** Use `git worktree add <branch>` per parallel agent so each operates on its own working tree and staging index. Race conditions on the index are unrecoverable in-place.

### No autonomous code deviations

The plan executed as written. No Rule 1/2/3 auto-fixes were applied; no Rule 4 architectural deviations were proposed.

## Auth gates encountered

None.

## Self-Check: PASSED

- `src/lib/schemas/admin-blog.ts` - FOUND
- `src/lib/admin/blog-queries.ts` - FOUND
- `src/app/admin/blog/page.tsx` - FOUND
- `src/app/admin/blog/actions.ts` - FOUND
- `src/app/admin/blog/new/page.tsx` - FOUND
- `src/app/admin/blog/new/CreateBlogForm.tsx` - FOUND
- `src/app/admin/blog/[id]/edit/page.tsx` - FOUND
- `src/app/admin/blog/[id]/edit/EditBlogForm.tsx` - FOUND
- `tests/unit/schemas/admin-blog.test.ts` - FOUND
- Commit `aa2c069` - FOUND in git log
- Commit `3cea181` - FOUND in git log
