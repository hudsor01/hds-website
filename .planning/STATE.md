# STATE — Current GSD Position

**Last updated:** 2026-05-23
**Branch:** `admin-shell-dashboard`
**Current milestone:** v4 (Admin Panel)
**Current phase:** `03-admin-shell-and-dashboard` (complete 6/6)
**Current plan:** none (phase closed)

## What just happened

- Phase 03 (`admin-shell-and-dashboard`) closed. 6 plans across 4 waves, 5 implementation commits + 1 verification commit on `admin-shell-dashboard`. Real admin shell shipped: `Sidebar` (client, `usePathname` active state) + `Topbar` (server, site name + page label + AccountMenu) + `Forbidden` (server, 403 panel) composed in `src/app/admin/layout.tsx`; `/admin` 307-redirects to `/admin/dashboard`; the dashboard page renders 5 widgets (VisitorsChart, WebVitalsCards, TopPagesTable, TrafficSourcesPie, RecentLeadsPanel) all backed by `src/lib/admin/dashboard-queries.ts` via `Promise.all`; 6 coming-soon stubs under `(coming-soon)/{showcase,blog,testimonials,leads,newsletter,emails}` for Phase 04/05. `recharts@3.8.1` added. All automated gates green: lint + typecheck + build exit 0 with the full `/admin/*` + `/auth/*` route table present, em/en-dash count = 0 across 19 changed files, every Phase-02 file + `src/lib/auth/admin.ts` (Bearer guard for cron) byte-equal to `main`, no hardcoded sample arrays in any widget. Manual 12-step operator smoke deferred to operator pre-PR (see `.planning/phases/03-admin-shell-and-dashboard/03-SUMMARY.md`).
- Phase 02 (`auth-foundation`) closed earlier. 5 plans, 5 commits on `admin-panel-auth`. Better Auth wired end to end (users/sessions/accounts/verifications + sign-in / sign-up + role-guarded `/admin` layout + AccountMenu + `proxy.ts` edge cookie short-circuit). Merged into the base for `admin-shell-dashboard`.
- Milestone v4 (Admin Panel) on track: 2/4 phases complete, 2 pending (`04-admin-content-crud`, `05-admin-ops`).
- Milestone v3 closed: Phase 01 (`showcase-ui-redesign`) shipped to main as `59e5e70` via PR #208; planning sync as `60175b3` via PR #209.

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
- Single data seam for admin reads: `src/lib/admin/dashboard-queries.ts` (and per-resource sibling files in Phase 04+). Widgets never import `db` directly.
- Every admin widget owns its own empty state. The page never short-circuits on one widget failing - each query wraps in try/catch and returns `[]` on failure.
- Sidebar `NAV_ITEMS` is the source of truth for the v4 page set. Adding a page = entry in `Sidebar.tsx` + route + queries function (if needed).
- recharts (`3.8.1`) is the v4 chart library. No other chart deps.

## Deferred / known issues

- Earlier `v1` / `v1` deferred / `v2` milestones are historical (no `.planning/` artifacts remain).
- 4 location pages (75 cities) shipped in PR #206; no follow-up planned.
- 4 pre-existing em-dashes in `src/components/ui/card.tsx` JSX block comments — out of scope per v3.0/01 verification.
- `industry` prop on `ProjectCardProps` is dead surface (pre-existing); candidate for cleanup if v4 phase 04 touches Card again.
- Biome `lint/style/useTemplate` info diagnostic on `src/components/admin/Sidebar.tsx:61` (`item.href + '/'`) — info-only, exit 0; auto-fix available if Phase 04 touches the file.

## Next action

Ship Phase 03 PR. Operator runs the 12-step manual smoke checklist from `.planning/phases/03-admin-shell-and-dashboard/03-SUMMARY.md` against `bun run dev`, then opens the PR for `admin-shell-dashboard` (squash recommended: `feat(admin): shell + dashboard - sidebar, topbar, 5 real-data widgets, 6 coming-soon stubs`). After merge, kick off Phase 04 (`admin-content-crud`) on a fresh branch off `main`: write `04-CONTEXT.md` (resource list, CRUD pattern, list/create/edit/delete page shapes for `/admin/showcase`, `/admin/blog`, `/admin/testimonials`) and run `gsd-plan-phase 04-admin-content-crud`.
