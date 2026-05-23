---
phase: 04-admin-content-crud
plans: 6
waves: 4
status: complete
date: 2026-05-23
branch: admin-content-crud
requirements: [P04]
tech-stack:
  added: []
  patterns:
    - "Server Actions seam (per-resource `actions.ts`) calls `requireAdminSession()` first, then validates with Zod, then mutates via Drizzle, then `revalidatePath` for public + admin surfaces"
    - "Defense-in-depth auth: every Server Action calls `requireAdminSession()` even though the `/admin/*` layout guard already enforces role; layer doesn't trust layer"
    - "Single data seam per resource: `src/lib/admin/{showcase,blog,testimonials}-queries.ts`. Admin UI never imports `db` directly."
    - "publishedAt semantics: showcase + blog set publishedAt=now() on first publish, NULL on unpublish; testimonials has NO publishedAt column (intentional schema asymmetry, documented)"
    - "Blog tag set replacement runs inside a single Drizzle transaction (delete old + insert new = atomic)"
    - "Next 16 cacheComponents requires `generateStaticParams()` to emit a placeholder for dynamic admin pages; combined with `await connection()` to force dynamic rendering at request time"
key-files:
  created:
    - src/lib/admin/auth.ts
    - src/lib/admin/slugify.ts
    - src/lib/admin/form-data.ts
    - src/lib/admin/db-errors.ts
    - src/lib/admin/showcase-queries.ts
    - src/lib/admin/blog-queries.ts
    - src/lib/admin/testimonials-queries.ts
    - src/lib/schemas/admin-showcase.ts
    - src/lib/schemas/admin-blog.ts
    - src/lib/schemas/admin-testimonials.ts
    - src/components/admin/FormFieldSet.tsx
    - src/components/admin/DeleteButton.tsx
    - src/components/admin/PublishToggle.tsx
    - src/components/admin/ResourceListPage.tsx
    - "src/app/admin/showcase/* (page, actions, new, [id]/edit)"
    - "src/app/admin/blog/* (page, actions, new, [id]/edit)"
    - "src/app/admin/testimonials/* (page, actions, new, [id]/edit)"
    - "tests/unit/admin/{slugify,form-data,db-errors}.test.ts"
    - "tests/unit/schemas/admin-{showcase,blog,testimonials}.test.ts"
  deleted:
    - "src/app/admin/(coming-soon)/showcase/page.tsx"
    - "src/app/admin/(coming-soon)/blog/page.tsx"
    - "src/app/admin/(coming-soon)/testimonials/page.tsx"
metrics:
  unit-tests-added: 47
  unit-tests-total: 563
  admin-routes-shipped: 11
  protected-paths-verified: 32
---

# Phase 04: admin-content-crud Summary

Operator-facing CRUD for the three content surfaces (`/admin/showcase`, `/admin/blog`, `/admin/testimonials`): list + create + edit + delete + publish toggle, all backed by Server Actions calling new admin-layer query libraries. Replaces the direct-SQL / Neon MCP workflow that existed before this phase. Public-facing rendering (`/showcase`, `/blog`, `/testimonials`) is byte-equal to main, the Phase-02 auth surface is byte-equal to main, the Phase-03 dashboard surface is byte-equal to main, and the n8n Bearer endpoint at `/api/blog/posts` is byte-equal to main. The three Phase-05 coming-soon stubs (`/admin/{leads,newsletter,emails}`) are preserved untouched.

## Plans

| Plan | Wave | Status | Description |
|---|---|---|---|
| 04-01 | 1 | complete | Shared admin foundation: helpers + UI primitives + 3 unit-test files |
| 04-02 | 2 | complete | Showcase CRUD vertical slice |
| 04-03 | 2 | complete | Blog CRUD vertical slice with author select + tag multi-select set replacement |
| 04-04 | 2 | complete | Testimonials CRUD vertical slice |
| 04-05 | 3 | complete | Stub cleanup + Next 16 cacheComponents prerender fix |
| 04-06 | 4 | complete | Verification gate (this plan) |

## Commits

### Wave 1 — Foundation
- `3d9e7d4` — feat(04): add shared admin helpers (auth, slugify, form-data, db-errors)
- `c3572b6` — feat(04): add shared admin UI primitives

### Wave 2 — Vertical slices (3 parallel agents)
- `3c39538` — feat(04-02): admin showcase schemas and queries
- `a0128f3` — feat(04): testimonials CRUD vertical slice (admin) [actual contents: showcase pages — see "Wave 2 commit-attribution race" below]
- `801021f` — docs(04-02): update SUMMARY attribution table with final commit hashes
- `aa2c069` — feat(04): admin blog schemas + Drizzle query layer
- `3cea181` — feat(04): admin blog CRUD pages, forms, and Server Actions
- `ebc333c` — docs(04-03): plan summary for blog CRUD vertical slice
- `18f94f4` — feat(04): testimonials CRUD vertical slice (admin)

### Wave 3 — Cleanup + prerender fix
- `e780f2b` — feat(04): remove coming-soon stubs + opt admin pages out of prerender

### Wave 4 — Verification
- See VERIFICATION.md commit (next).

## Architecture notes

### Server Actions seam

Each resource owns one `actions.ts` file co-located with its admin routes. Action shape is uniform: call `requireAdminSession()` -> parse FormData via shared helper -> Zod `safeParse` -> Drizzle mutation -> `revalidatePath` for both `/admin/<resource>` and the public route -> redirect or return form-state. No business logic lives in the page components; pages render forms and lists, actions own the writes.

### Defense-in-depth auth

The `/admin/*` layout guard (Phase 03) enforces `role === 'admin'` before any admin page renders, but Server Actions are independently invokable RPC endpoints — they don't inherit the layout's guarantees. So every action re-checks via `requireAdminSession()` from `src/lib/admin/auth.ts`. Verified count: showcase=5, blog=5, testimonials=5 calls (one per public action plus internal helpers).

### publishedAt semantics per resource

- **Showcase + blog:** `publishedAt` column exists. Setting `published=true` for the first time stamps `publishedAt = now()`. Setting `published=false` clears it back to `NULL`. Public list queries sort by `publishedAt DESC NULLS LAST`.
- **Testimonials:** NO `publishedAt` column. Schema asymmetry intentional — testimonials sort by `createdAt DESC` everywhere. The action layer only toggles the `published` boolean.

### Blog tag set replacement

Updating tags on a blog post = delete-then-insert inside a single Drizzle transaction (`db.transaction(async (tx) => { ... })`). This avoids the unique-constraint races that an UPSERT-style approach would create on `(postId, tagId)`. Public read path (`src/lib/blog.ts`, untouched) joins through `blog_post_tags` the same way.

### Next 16 cacheComponents quirk

Next 16's `cacheComponents` experimental mode requires every dynamic segment to have a `generateStaticParams()` even when the page is fully request-rendered. Without it, build fails with a parallel-pages collision. Fix in `e780f2b`: each `[id]/edit/page.tsx` exports `generateStaticParams()` returning a single `__build_placeholder__` entry, AND calls `await connection()` at the top of the page to force runtime rendering. The placeholder route is never reachable from real traffic (no row in `showcase`/`blog_posts`/`testimonials` will ever have id=`__build_placeholder__`). Build output shows the placeholder row alongside the real `[id]/edit` row.

### Wave 2 commit-attribution race

Wave 2 ran 3 parallel executor agents in a single working tree. Each agent staged its own files individually (per `task_commit_protocol`), but commit *messages* were generated independently and one agent's message landed against another agent's content. End state is correct (`git ls-tree HEAD` matches the SUMMARY mappings), but commit-message attribution does NOT match content for at least `a0128f3` (named "testimonials" but contains showcase pages). Future readers: verify by file content via `git show <hash> --stat`, not by commit message. Mitigation for next phase: stage per-resource into separate sub-working-trees, or serialize Wave-2 commits behind a single coordinator.

## Files touched

51 total files diff vs main (`git diff --name-only main...HEAD`):
- 11 planning files (`.planning/phases/04-admin-content-crud/*`)
- 3 Phase-04 stub deletions
- 34 new src files (10 lib + 4 component + 20 admin pages including actions/forms)
- 6 new test files

Tests added: 19 cases (admin helpers) + 15 cases (admin-showcase schema) + 7 cases (admin-blog schema) + 6 cases (admin-testimonials schema) = 47. New baseline = 563 pass / 0 fail.

## Verification

See `04-06-VERIFICATION.md` for the full evidence log. All 13 automated gates passed:
1. Lint (334 files, zero diagnostics)
2. Typecheck (clean)
3. Unit tests (563 pass / 0 fail)
4. Build (189 static pages, 14 admin routes)
5. Em-dash sweep (zero matches)
6. En-dash sweep (zero matches)
7. Protected files byte-equal to main (32/32 OK)
8. Phase 05 stubs preserved (3/3 OK)
9. Phase 04 stubs removed (3/3 OK)
10. `requireAdminSession` calls (5/5/5 per action file, all >= 4)
11. `revalidatePath` calls (8/6/8 per action file, all >= 4)
12. No `console.*` (zero matches)
13. No `process.env.X` (zero matches)
14. No `: any` / `<any>` / `as any` (zero matches)

The 20-step manual operator smoke checklist (mirrors Phase 03's 12-step pattern, expanded for 3 resources + cross-cuts) is documented in VERIFICATION.md and deferred to the operator pre-PR.

## Next action

Operator runs the 20-step manual smoke checklist (see VERIFICATION.md) against the live `bun run dev` on port 3001. After it passes, open the PR for `admin-content-crud` -> `main` with the recommended squash commit message:

```
feat(admin): content CRUD - showcase, blog, testimonials list/create/edit/delete with Server Actions + TanStack Form
```

After PR merges, Phase 05 (`admin-ops`) is next on the v4 roadmap: `/admin/leads`, `/admin/newsletter`, `/admin/emails` — the 3 stubs preserved by this phase.
