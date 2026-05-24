# STATE — Current GSD Position

**Last updated:** 2026-05-23
**Branch:** `admin-content-crud`
**Current milestone:** v4 (Admin Panel)
**Current phase:** `04-admin-content-crud` (complete 6/6, PR not yet open)
**Current plan:** none — phase complete, awaiting operator smoke + PR

## What just happened

- Phase 04 (`admin-content-crud`) closed. 6 plans across 4 waves, 10 implementation commits on `admin-content-crud`. Operator-facing CRUD shipped for all 3 content surfaces: `/admin/showcase`, `/admin/blog`, `/admin/testimonials` with list + create + edit + delete + publish toggle, backed by Server Actions calling new per-resource Drizzle query libraries (`src/lib/admin/{showcase,blog,testimonials}-queries.ts`). Public-facing rendering (`/showcase`, `/blog`, `/testimonials`), Phase-02 auth surface, Phase-03 dashboard surface, n8n Bearer endpoint at `/api/blog/posts`, and the 3 Phase-05 coming-soon stubs (`/admin/{leads,newsletter,emails}`) all byte-equal to `main`. All 13 automated gates green: lint (334 files, 0 diagnostics) + typecheck + 563 unit tests pass + build (189 static pages, 14 admin routes) + em/en-dash sweep = 0 + protected-files diff = 32/32 OK + defense-in-depth auth verified (every Server Action calls `requireAdminSession()` >= 4 times) + every mutation calls `revalidatePath` + no `console.*` / no `process.env.X` / no `any` types in any added file. 20-step operator manual smoke deferred to operator pre-PR (see `.planning/phases/04-admin-content-crud/04-SUMMARY.md` for the checklist). Wave 2 ran 3 parallel agents in a single working tree; commit-message attribution got crossed with file contents on one commit (`a0128f3`), end state is correct, future readers should verify via `git show <hash> --stat`.
- Phase 03 (`admin-shell-and-dashboard`) closed earlier and merged to `main` via PR #213.
- Phase 02 (`auth-foundation`) closed earlier. Merged into the base for `admin-shell-dashboard`.
- Milestone v4 (Admin Panel) on track: 3/4 phases complete, 1 pending (`05-admin-ops`).
- Milestone v3 closed: Phase 01 (`showcase-ui-redesign`) shipped to main as `59e5e70` via PR #208.

## Active decisions (still in force from v3)

- Featured-first rendering on `/showcase`: `items.find(i => i.featured)` picks the lowest-displayOrder featured row for the full-width slot; support cards force `featured={false}` at the call site.
- Trust signal separators use U+00B7 MIDDLE DOT, never em-dash.
- Accent body copy on light backgrounds uses `text-accent-text` (WCAG-safe).
- Em/en-dash ban (CLAUDE.md) applies to user-facing text only.
- Milestone versions use whole numbers only (v3, v4), never decimals.

## Active decisions (v4)

- Auth library = **Better Auth** (npm `better-auth`). Multi-user sessions, password + OAuth-capable.
- Users live in Neon Postgres (new `users` + `sessions` tables; managed via Better Auth's Drizzle adapter).
- Admin gating = middleware-protected `/admin/*` route group. First user signed up gets `role: 'admin'`; later users default to `role: 'user'` and need promotion.
- Dashboard visual reference = Efferd Dashboard 5 (web analytics layout). Adapted to our design system; not lifting CSS verbatim.
- Admin shell composition is **locked**: `<Sidebar />` (left, `w-60`) + `<Topbar />` (top, `h-14`) + `{children}` (`p-6` md / `p-8` lg). All v4 admin pages render inside this contract.
- Single data seam for admin reads: `src/lib/admin/{dashboard,showcase,blog,testimonials}-queries.ts`. Widgets and pages never import `db` directly.
- Every admin widget owns its own empty state. The page never short-circuits on one widget failing — each query wraps in try/catch and returns `[]` on failure.
- Sidebar `NAV_ITEMS` is the source of truth for the v4 page set. Adding a page = entry in `Sidebar.tsx` + route + queries function (if needed).
- recharts (`3.8.1`) is the v4 chart library. No other chart deps.
- **Phase 04 additions:** Server Actions seam (per-resource `actions.ts`) calls `requireAdminSession()` first then validates with Zod then mutates via Drizzle then `revalidatePath` for public + admin surfaces. Defense-in-depth auth: layer doesn't trust layer. publishedAt semantics differ per resource (showcase + blog have it, testimonials does not). Blog tag set replacement runs inside one Drizzle transaction. Next 16 cacheComponents requires `generateStaticParams()` + `await connection()` placeholder pattern on admin dynamic routes.

## Deferred / known issues

- Earlier `v1` / `v1` deferred / `v2` milestones are historical (no `.planning/` artifacts remain).
- 4 location pages (75 cities) shipped in PR #206; no follow-up planned.
- 4 pre-existing em-dashes in `src/components/ui/card.tsx` JSX block comments — out of scope per v3.0/01 verification.
- `industry` prop on `ProjectCardProps` is dead surface (pre-existing); candidate for cleanup if a later v4 phase touches Card again.
- Wave 2 commit-message attribution race on Phase 04 (commit `a0128f3` named "testimonials" actually contains showcase files). End state is correct; future readers should verify via `git show <hash> --stat`. Mitigation for next parallel-agent phase: stage per-resource into separate sub-working-trees, or serialize commits behind a single coordinator.

## Next action

Operator manual smoke checklist (20 steps in `.planning/phases/04-admin-content-crud/04-SUMMARY.md` / `04-06-VERIFICATION.md`) on local dev. After it passes, ship PR for `admin-content-crud` -> `main` with the recommended squash commit message:

```
feat(admin): content CRUD - showcase, blog, testimonials list/create/edit/delete with Server Actions + TanStack Form
```

After PR merges, kick off Phase 05 (`admin-ops`): `/admin/leads`, `/admin/newsletter`, `/admin/emails` — the 3 stubs preserved by Phase 04.
