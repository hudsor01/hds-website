---
phase: 03-admin-shell-and-dashboard
milestone: v4
status: complete
plans: 6
completed_plans: 6
commits: 5
date_started: 2026-05-23
date_completed: 2026-05-23
branch: admin-shell-dashboard
---

# Phase 03 - Admin Shell + Dashboard Summary

Replaced the Phase-02 placeholder `/admin` with a real admin shell (sidebar + topbar + content slot) and a working `/admin/dashboard` rendered entirely from existing Neon tables: a 30-day visitors line chart, a 6-card Core Web Vitals p75 row, a top-10 pages table, a traffic-sources donut, and a recent-leads panel. Six coming-soon stub pages under an `(coming-soon)` route group fill the rest of v4's sidebar links so navigation works end to end without 404s. No CRUD, no ops pages, no Phase-02 surface changes.

## What shipped

| Plan | Title | Commit | What |
|---|---|---|---|
| 03-01 | Dashboard query layer + recharts | `f18ec9b` | `src/lib/admin/dashboard-queries.ts` (`'server-only'`) with 5 typed Drizzle queries: `getVisitorsByDay(days)`, `getTopPages(limit, days)`, `getTrafficSources(days)`, `getWebVitalsP75(days)`, `getRecentLeads(limit)`. Each wraps its DB call in try/catch and returns `[]` on failure so a single bad query renders an empty-state instead of blanking the page. `recharts@3.8.1` added to `package.json`. |
| 03-02 | Shell primitives | `88afe85` | `src/components/admin/Sidebar.tsx` (client, `usePathname` active-state), `Topbar.tsx` (server, site name + page label + AccountMenu slot), `Forbidden.tsx` (server, 403 panel extracted from Phase 02's inline layout). Sidebar nav: Dashboard, Showcase, Blog, Testimonials, Leads, Newsletter, Emails - icons from Heroicons per CLAUDE.md. |
| 03-03 | Shell wiring + /admin redirect | `d4e4a6d` | `src/app/admin/layout.tsx` rewritten to compose `<Sidebar />` + `<Topbar />` around `{children}` while keeping the Phase-02 `getSession()` -> role-guard contract (non-admins get `<Forbidden />` instead of `children`). `src/app/admin/page.tsx` becomes a `redirect('/admin/dashboard')` so `/admin` is the canonical entry. |
| 03-04 | /admin/dashboard + 5 widgets | `d11edcb` | `src/app/admin/dashboard/page.tsx` server component fetches all 5 widget datasets via `Promise.all` from `dashboard-queries.ts`, then composes: `VisitorsChart` (client, recharts line, 30d), `WebVitalsCards` (server, 6 cards CLS/FCP/FID/INP/LCP/TTFB p75 7d, color-coded by CWV thresholds), `TopPagesTable` (server, top 10 by pageviews 30d), `TrafficSourcesPie` (client, recharts donut, top-5 channels + Other 30d), `RecentLeadsPanel` (server, last 10 leads with email + source + middle-dot + relative time + status badge). Every widget has a real empty state - no placeholders. |
| 03-05 | Coming-soon stubs | `b566f48` | 6 stub pages under `src/app/admin/(coming-soon)/`: `showcase`, `blog`, `testimonials` (announce Phase 04) and `leads`, `newsletter`, `emails` (announce Phase 05). Each renders inside the admin shell (route group, not layout-skipping) with a "Back to dashboard" link. Sidebar links from Plan 03-02 now resolve. |
| 03-06 | Verification | (this commit) | All 11 automated gates green: lint exit 0, typecheck exit 0, build exit 0 with the full `/admin/*` + `/auth/*` route table present, em/en-dash count = 0 across all 19 changed files, every Phase-02 file byte-equal to `main`, `src/lib/auth/admin.ts` (Bearer guard for cron) byte-equal to `main`, wave 1/2 files unchanged after `d11edcb`, no hardcoded sample arrays in any widget. Manual operator smoke deferred to operator pre-PR (checklist below). Full evidence in `03-06-VERIFICATION.md`. |

## Defense in depth: data flow is single-seam

Every widget reads through `src/lib/admin/dashboard-queries.ts`. Widgets never import `db` or any schema table directly. Consequence: the dashboard has exactly one place to change a query, one place to add an index hint, one place to mock for tests. The page fetches all five datasets concurrently:

```ts
const [visitors, topPages, sources, vitals, recentLeads] = await Promise.all([
  getVisitorsByDay(30),
  getTopPages(10, 30),
  getTrafficSources(30),
  getWebVitalsP75(7),
  getRecentLeads(10),
])
```

If any single query rejects, that widget renders its empty state - the page never throws.

## Route map (after this phase)

```
/admin                         -> 307 redirect to /admin/dashboard
/admin/dashboard               -> 5-widget analytics dashboard
/admin/showcase                -> coming-soon stub (Phase 04)
/admin/blog                    -> coming-soon stub (Phase 04)
/admin/testimonials            -> coming-soon stub (Phase 04)
/admin/leads                   -> coming-soon stub (Phase 05)
/admin/newsletter              -> coming-soon stub (Phase 05)
/admin/emails                  -> coming-soon stub (Phase 05)
/auth/sign-in                  -> unchanged (Phase 02)
/auth/sign-up                  -> unchanged (Phase 02)
/api/auth/[...all]             -> unchanged (Phase 02)
```

Build route-table marker for the new pages is `◐` (dynamic - they depend on per-request session and per-render DB queries). `/auth/*` stays `○` (static).

## What did NOT change

- `src/lib/auth/admin.ts` (Bearer guard for `/api/process-emails` and other cron endpoints) - byte-equal to `main`.
- `src/lib/auth/{index,client,get-session}.ts` - byte-equal to `main`.
- `src/app/api/auth/[...all]/route.ts` - byte-equal to `main`.
- `src/app/auth/sign-{in,up}/page.tsx`, `src/components/auth/{SignInForm,SignUpForm,AccountMenu}.tsx` - byte-equal to `main`. `AccountMenu` is reused inside the new `Topbar` without modification.
- `proxy.ts` - byte-equal to `main`. Edge cookie short-circuit from Phase 02 still gates `/admin/*` anonymous traffic before any server render.

All verified via per-file `git diff main...HEAD -- <path>` returning empty.

## Active decisions (locked for v4)

- Admin shell composition: `<Sidebar />` (left, `w-60`) + `<Topbar />` (top, `h-14`) + `{children}` (`p-6` md / `p-8` lg). This contract is fixed for the rest of v4 - Phase 04 and 05 pages render inside it.
- Single data seam: `src/lib/admin/dashboard-queries.ts`. New admin widgets add a function here, not a direct DB call in the widget. CRUD pages (Phase 04) will follow the same pattern with `src/lib/admin/<resource>-queries.ts`.
- Empty states are first-class. Every widget returns its own empty UI; the page does not short-circuit on one widget failing.
- Sidebar nav is the source of truth for v4 page count. Adding a page = adding a `NAV_ITEMS` entry in `Sidebar.tsx` + a route + a `dashboard-queries.ts` function (if it needs data). Coming-soon stubs are the placeholder for not-yet-shipped entries.
- recharts (`3.8.1`) is the chart library for v4. No other chart deps.
- Middle dot `·` (U+00B7) is the only allowed inline separator. Em-dash and en-dash remain banned per CLAUDE.md.

## Manual smoke checklist (deferred to operator pre-PR)

Run `bun run dev` (port 3001) and, signed in as the admin user:

1. Visit `http://localhost:3001/admin`. URL bar should land on `/admin/dashboard` (server-side redirect).
2. Page renders: sidebar on the left (7 nav items, Dashboard highlighted), topbar with site name + page label `Dashboard` + AccountMenu on the right, main area showing 5 widgets.
3. Visitors chart: a line chart of daily pageviews (last 30 days) OR the empty-state copy `No traffic data yet.` No runtime errors.
4. Web Vitals row: 6 cards in order (CLS, FCP, FID, INP, LCP, TTFB), each with a p75 value + unit OR `--`, plus sample count. Color matches rating (success / warning / destructive text tokens).
5. Top pages table: up to 10 rows OR empty state. Numbers right-aligned and locale-formatted.
6. Traffic sources donut: donut with up to 5 channels + Other OR empty state. Legend visible.
7. Recent leads panel: up to 10 rows OR `No leads yet.` Each row shows email, source + middle dot + relative time, status badge.
8. Click each of the 6 non-dashboard sidebar links (Showcase, Blog, Testimonials, Leads, Newsletter, Emails). Each loads a stub page with the Phase 04 or Phase 05 announcement and a "Back to dashboard" link. No 404s.
9. Click `Back to dashboard` from any stub. Lands back at `/admin/dashboard`.
10. Sign out via AccountMenu. Confirm cookie cleared (visit `/admin` -> bounce to `/auth/sign-in`).
11. Open an incognito window. Visit `/admin/dashboard` directly. Confirm bounce to `/auth/sign-in`.
12. (Optional, if a `role: 'user'` test account exists) Sign in as non-admin, visit `/admin`. Confirm Forbidden panel renders inside the shell-free 403 layout.

No browser-console errors at any step. Em/en-dash check by eye on rendered copy. If all 12 pass: open the PR for `admin-shell-dashboard` (squash recommended: `feat(admin): shell + dashboard - sidebar, topbar, 5 real-data widgets, 6 coming-soon stubs`).

## Metrics

| Metric | Value |
|---|---|
| Plans | 6 / 6 complete |
| Commits | 5 implementation + 1 verification |
| Files created | 18 |
| Files modified | 2 (`src/app/admin/layout.tsx`, `src/app/admin/page.tsx`) |
| LoC added | ~3,287 net (incl. recharts type ripple) |
| New deps | 1 (`recharts@3.8.1`) |
| Phase-02 diff | 0 lines |
| Em/en-dash count | 0 across 19 changed files |
| Duration | 2 days (2026-05-22 -> 2026-05-23) |

## Next phase

**Phase 04 - admin-content-crud.** `/admin/showcase`, `/admin/blog`, `/admin/testimonials` list + create + edit + delete. Replaces the direct-SQL / Neon-MCP authoring workflow. Plans + waves to be drafted on a fresh branch off `main` after this phase's PR merges.
