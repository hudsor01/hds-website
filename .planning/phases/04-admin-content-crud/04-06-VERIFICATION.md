# Phase 04 Verification

**Date:** 2026-05-23
**Branch:** `admin-content-crud`
**Plan:** 04-06

## Status: PASSED

All automated gates green. 20-step operator manual smoke deferred to operator pre-PR (per Phase 03 precedent).

## Automated gates

| # | Gate | Command | Result |
|---|---|---|---|
| 1 | Lint | `bun run lint` | exit 0 — `biome check src/` checked 334 files, no fixes applied, zero diagnostics |
| 2 | Typecheck | `bun run typecheck` | exit 0 — `tsc --noEmit` clean (no output) |
| 3 | Unit tests | `bun run test:unit` | exit 0 — **563 pass / 0 fail** across 49 files, 2335 expect() calls, 1199ms |
| 4 | Build | `bun run build` | exit 0 — Compiled successfully in 2.9s. 189 static pages generated. Full route table emitted with 14 `/admin/*` rows. No parallel-pages error. |
| 5 | Em-dash sweep on changed files | `rg -lF '—'` over added/modified Phase-04 files | 0 matches |
| 5 | En-dash sweep on changed files | `rg -lF '–'` over added/modified Phase-04 files | 0 matches |
| 6 | Protected files byte-equal to main | `git diff main...HEAD -- <path>` over 32 protected paths | 32/32 OK, 0 FAIL |
| 7 | Phase 05 stubs preserved | `test -f` on `(coming-soon)/{leads,newsletter,emails}/page.tsx` | 3/3 OK |
| 8 | Phase 04 stubs removed | `test ! -f` on `(coming-soon)/{showcase,blog,testimonials}/page.tsx` | 3/3 OK |
| 9 | Defense-in-depth `requireAdminSession` | `grep -c` on 3 action files | showcase=5, blog=5, testimonials=5 (each >= 4 required) |
| 10 | `revalidatePath` invocations | `grep -c` on 3 action files | showcase=8, blog=6, testimonials=8 (each >= 4 required) |
| 11 | No `console.*` | `rg -n 'console\.'` over added/modified files | 0 matches |
| 12 | No `process.env.X` | `rg -n 'process\.env'` over added/modified files | 0 matches |
| 13 | No `any` types | `rg -n ': any\b\|<any>\|as any\b'` over added/modified files | 0 matches |

## Admin route table (from `bun run build`)

```
├ ◐ /admin
├ ◐ /admin/blog
├ ◐ /admin/blog/[id]/edit
│ ├ /admin/blog/[id]/edit
│ └ /admin/blog/__build_placeholder__/edit
├ ◐ /admin/blog/new
├ ◐ /admin/dashboard
├ ◐ /admin/emails
├ ◐ /admin/leads
├ ◐ /admin/newsletter
├ ◐ /admin/showcase
├ ◐ /admin/showcase/[id]/edit
│ ├ /admin/showcase/[id]/edit
│ └ /admin/showcase/__build_placeholder__/edit
├ ◐ /admin/showcase/new
├ ◐ /admin/testimonials
├ ◐ /admin/testimonials/[id]/edit
│ ├ /admin/testimonials/[id]/edit
│ └ /admin/testimonials/__build_placeholder__/edit
└ ◐ /admin/testimonials/new
```

14 admin routes confirmed. `◐` = Partial Prerender. The `__build_placeholder__` rows exist because Next 16 cacheComponents requires `generateStaticParams()` to emit at least one parameter at build time even for dynamic-rendered pages; the placeholder is never reachable from real traffic (path collision prevented by `await connection()` opt-out from prerender).

## Tests added by Phase 04 (verified present and passing)

```
tests/unit/admin/slugify.test.ts
tests/unit/admin/form-data.test.ts
tests/unit/admin/db-errors.test.ts
tests/unit/schemas/admin-showcase.test.ts
tests/unit/schemas/admin-blog.test.ts
tests/unit/schemas/admin-testimonials.test.ts
```

563 total pass = pre-Phase-04 baseline (516) + 47 Phase-04 additions (19 admin helpers + 15 showcase + 7 blog + 6 testimonials).

## Protected files byte-equal to main

All 32 paths returned `OK` (0 lines of diff vs main):

```
OK: src/lib/auth/admin.ts
OK: src/lib/auth/index.ts
OK: src/lib/auth/client.ts
OK: src/lib/auth/get-session.ts
OK: src/components/auth/
OK: src/app/auth/
OK: src/app/api/auth/[...all]/route.ts
OK: proxy.ts
OK: src/lib/admin/dashboard-queries.ts
OK: src/components/admin/Sidebar.tsx
OK: src/components/admin/Topbar.tsx
OK: src/components/admin/Forbidden.tsx
OK: src/app/admin/layout.tsx
OK: src/app/admin/page.tsx
OK: src/app/admin/dashboard/page.tsx
OK: src/components/admin/widgets/
OK: src/lib/showcase.ts
OK: src/lib/blog.ts
OK: src/lib/testimonials.ts
OK: src/lib/schemas/showcase.ts
OK: src/lib/schemas/blog.ts
OK: src/lib/schemas/blog-api.ts
OK: src/lib/schemas/content.ts
OK: src/app/showcase/
OK: src/app/portfolio/
OK: src/app/blog/
OK: src/app/testimonials/
OK: src/app/api/blog/posts/route.ts
OK: src/app/api/testimonials/
OK: src/app/admin/(coming-soon)/leads/page.tsx
OK: src/app/admin/(coming-soon)/newsletter/page.tsx
OK: src/app/admin/(coming-soon)/emails/page.tsx
```

Failures: 0. Every Phase-02 auth surface, Phase-03 dashboard surface, n8n Bearer endpoint, public-facing rendering, and preserved Phase-05 coming-soon stub is unchanged.

## Changed files (grouped by plan)

### Plan 04-01 (shared foundation, Wave 1)
- `src/lib/admin/auth.ts`
- `src/lib/admin/slugify.ts`
- `src/lib/admin/form-data.ts`
- `src/lib/admin/db-errors.ts`
- `src/components/admin/FormFieldSet.tsx`
- `src/components/admin/DeleteButton.tsx`
- `src/components/admin/PublishToggle.tsx`
- `src/components/admin/ResourceListPage.tsx`
- `tests/unit/admin/slugify.test.ts`
- `tests/unit/admin/form-data.test.ts`
- `tests/unit/admin/db-errors.test.ts`

### Plan 04-02 (showcase, Wave 2)
- `src/lib/admin/showcase-queries.ts`
- `src/lib/schemas/admin-showcase.ts`
- `src/app/admin/showcase/page.tsx`
- `src/app/admin/showcase/actions.ts`
- `src/app/admin/showcase/new/page.tsx`
- `src/app/admin/showcase/new/CreateShowcaseForm.tsx`
- `src/app/admin/showcase/[id]/edit/page.tsx`
- `src/app/admin/showcase/[id]/edit/EditShowcaseForm.tsx`
- `tests/unit/schemas/admin-showcase.test.ts`

### Plan 04-03 (blog, Wave 2)
- `src/lib/admin/blog-queries.ts`
- `src/lib/schemas/admin-blog.ts`
- `src/app/admin/blog/page.tsx`
- `src/app/admin/blog/actions.ts`
- `src/app/admin/blog/new/page.tsx`
- `src/app/admin/blog/new/CreateBlogForm.tsx`
- `src/app/admin/blog/[id]/edit/page.tsx`
- `src/app/admin/blog/[id]/edit/EditBlogForm.tsx`
- `tests/unit/schemas/admin-blog.test.ts`

### Plan 04-04 (testimonials, Wave 2)
- `src/lib/admin/testimonials-queries.ts`
- `src/lib/schemas/admin-testimonials.ts`
- `src/app/admin/testimonials/page.tsx`
- `src/app/admin/testimonials/actions.ts`
- `src/app/admin/testimonials/new/page.tsx`
- `src/app/admin/testimonials/new/CreateTestimonialForm.tsx`
- `src/app/admin/testimonials/[id]/edit/page.tsx`
- `src/app/admin/testimonials/[id]/edit/EditTestimonialForm.tsx`
- `tests/unit/schemas/admin-testimonials.test.ts`

### Plan 04-05 (stub cleanup, Wave 3)
- DELETED: `src/app/admin/(coming-soon)/showcase/page.tsx`
- DELETED: `src/app/admin/(coming-soon)/blog/page.tsx`
- DELETED: `src/app/admin/(coming-soon)/testimonials/page.tsx`
- (Same commit also added `await connection()` to opt admin pages out of prerender — fixed Next 16 cacheComponents requirement.)

## Operator manual smoke checklist (run before opening PR)

Boot `bun run dev` on port 3001. Signed in as the admin user from Phase 02.

### Showcase
1. Visit `/admin/showcase`. List renders with all rows (published + unpublished). "New showcase" button top-right.
2. Click "New showcase". Empty form renders. Type "Test Showcase Item" in Title; tab out; slug auto-fills "test-showcase-item".
3. Fill Description with "smoke test"; submit. Lands on `/admin/showcase/{newId}/edit`. Form pre-filled.
4. Change displayOrder to 999. Save. "Saved." appears. Reload, value persists.
5. Toggle the published checkbox to true. Save. Back on the list, the row shows published=Yes. Click the eye icon to flip back; published=No on next render.
6. From the edit page, click "Delete showcase". Confirm. Redirects to list; row is gone.

### Blog
7. Visit `/admin/blog`. List renders all posts sorted by publishedAt DESC NULLS LAST.
8. Click "New post". Author dropdown populated; tag checkboxes populated. Type a title; slug auto-fills.
9. Pick an author, check 1-2 tags, fill excerpt + content, submit. Lands on edit page; row exists in `blog_posts`; join rows exist in `blog_post_tags`.
10. Uncheck one tag, save. Re-load. Tag set updated. Verify in Neon: `SELECT tagId FROM blog_post_tags WHERE postId=...`
11. Toggle publish from the list. publishedAt sets on false to true and clears on true to false (verify in Neon).
12. Delete from edit page. Confirm. Row gone; CASCADE removed `blog_post_tags` rows.

### Testimonials
13. Visit `/admin/testimonials`. List renders all sorted by createdAt DESC.
14. Click "New testimonial". Fill name + content; pick rating 5. Submit. Lands on edit page; row exists.
15. Toggle publish from list. Row updates with NO publishedAt column touched (testimonials table has no such column).
16. Delete from edit page. Confirm. Row gone.

### Cross-cuts
17. Public `/showcase`, `/blog`, `/testimonials` still render the same published rows after each admin change. No regressions.
18. Sidebar Dashboard / Showcase / Blog / Testimonials / Leads / Newsletter / Emails links all resolve. Phase 05 stubs (Leads / Newsletter / Emails) still announce "Phase 05".
19. Sign out via AccountMenu. Visit any admin URL anonymously; bounce to `/auth/sign-in`. Sign in as a `role: 'user'` (non-admin) account; visit `/admin/showcase`; Forbidden panel renders.
20. Open browser DevTools Console. No errors at any step.

If all 20 pass: open the PR for `admin-content-crud` (squash recommended: `feat(admin): content CRUD - showcase, blog, testimonials list/create/edit/delete with Server Actions + TanStack Form`).
