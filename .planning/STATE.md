# STATE — Current GSD Position

**Last updated:** 2026-05-23
**Branch:** `admin-content-crud`
**Current milestone:** v4 (Admin Panel)
**Current phase:** `04-admin-content-crud` (planning)
**Current plan:** none (planning in progress)

## What just happened

- Dependabot triage swept clean. PR #207 (sanitize-html 2.17.4 standalone) closed in favor of `#211`, which bundled the same security patch. `#212` (dev tooling: types/bun, types/node, types/react, knip, lefthook) merged as `c36a8f2`. `#211` (sanitize-html 2.17.4 xmp tag bypass fix + @tanstack/react-query 5.100.13) merged as `3a5ab55`. `#205` (lucide-react 1.14.0 -> 1.16.0; was red on a 5-day-stale base inheriting the admin-auth test flake) recreated via `@dependabot recreate`, locally verified on fresh main (516/516 tests), merged as `f15d7a6`. All three merges admin-flagged past the recurring Create Neon Branch transient failure; build/code-quality/test/setup all green.
- PR #213 (Phase 03) merged to `main` as `d88d049`. Review loop ran 2 iterations: iter-1 flagged 6 findings (W1-W4 + N1-N2, addressed in commit `5fcfc8e`), iter-2 verified zero findings and approved. CI: build/code-quality/test/setup all green; Create Neon Branch failed (recurring transient flake, admin-merged per established pattern). Branch deleted.
- Phase 03 (`admin-shell-and-dashboard`) closed. 6 plans across 4 waves, 5 implementation commits + 1 verification commit + 1 review-fix commit on `admin-shell-dashboard`. Real admin shell shipped: `Sidebar` (client, `usePathname` active state, brand is `<Link>` to `/admin/dashboard`) + `Topbar` (server, site name + page label + AccountMenu) + `Forbidden` (server, 403 panel) composed in `src/app/admin/layout.tsx`; `/admin` 307-redirects to `/admin/dashboard`; the dashboard page renders 5 widgets (VisitorsChart, WebVitalsCards, TopPagesTable, TrafficSourcesPie, RecentLeadsPanel) all backed by `src/lib/admin/dashboard-queries.ts` via `Promise.all`; 6 coming-soon stubs under `(coming-soon)/{showcase,blog,testimonials,leads,newsletter,emails}` for Phase 04/05. `recharts@3.8.1` added. All automated gates green: lint + typecheck + build exit 0 with the full `/admin/*` + `/auth/*` route table present, em/en-dash count = 0 across 19 changed files, every Phase-02 file + `src/lib/auth/admin.ts` (Bearer guard for cron) byte-equal to `main`, no hardcoded sample arrays in any widget. Manual 12-step operator smoke deferred to operator pre-PR (see `.planning/phases/03-admin-shell-and-dashboard/03-SUMMARY.md`).
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
- The Biome `lint/style/useTemplate` info diagnostic in Sidebar.tsx was fixed during PR #213 iter-1 (W1).

## Next action

Operator runs the 12-step manual smoke from `.planning/phases/03-admin-shell-and-dashboard/03-SUMMARY.md` against the live `/admin/dashboard` deploy. After that, kick off Phase 04 (`admin-content-crud`) on a fresh branch off `main`: write `04-CONTEXT.md` (resource list, CRUD pattern, list/create/edit/delete page shapes for `/admin/showcase`, `/admin/blog`, `/admin/testimonials`) and run `gsd-plan-phase 04-admin-content-crud`.
