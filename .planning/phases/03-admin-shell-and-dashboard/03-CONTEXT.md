# Phase 03 — Admin Shell + Dashboard

**Date:** 2026-05-23
**Branch:** `admin-shell-dashboard`
**Milestone:** v4 — Admin Panel
**Scope:** Build the admin shell (sidebar + topbar + content slot) adapted from Efferd Dashboard 5, replace the placeholder `/admin` page with a real web-analytics dashboard wired to the existing `web_vitals` / `page_analytics` / `leads` tables, and stand up the `/admin/dashboard` route. No CRUD pages yet (Phase 04). No ops pages yet (Phase 05).

## 1. Goal

After this phase, signing into the admin lands on a real working dashboard that answers the daily question for the site owner: **how is this site performing?**

Visible value:
- Sidebar with the navigation items the rest of v4 will fill in (Dashboard, Showcase, Blog, Testimonials, Leads, Newsletter, Emails, Settings)
- Topbar with site name, page label, AccountMenu
- Dashboard widgets backed by REAL data from Neon (no placeholders, no hardcoded sample arrays)

## 2. Non-goals

- Admin CRUD pages (Phase 04 — `/admin/showcase`, `/admin/blog`, `/admin/testimonials`)
- Ops pages (Phase 05 — `/admin/leads`, `/admin/newsletter`, `/admin/emails`)
- Sidebar items beyond Dashboard get a clickable link to a "Coming in Phase 04/05" placeholder page; no functionality
- Settings page (defer to a later phase)
- Live users / real-time presence (Dashboard 5 has it; we don't have presence infra and won't build it for this phase)
- Mobile sidebar collapse polish beyond the bare minimum (functional but not polished)
- Date-range pickers; widgets show fixed "last 7 days" / "last 30 days" windows per spec section 5

## 3. Visual reference

Efferd Dashboard 5 (web analytics) is the layout pattern. Sidebar on the left, topbar with page label, main content grid below. We are adapting the pattern to our design system (`globals.css` OKLCH tokens, existing utility classes), NOT copying their CSS verbatim.

Screenshot reference: visible while scrolling https://efferd.com/blocks/dashboard

## 4. File-level changes

### New files

- `src/app/admin/layout.tsx` — **rewrite** the placeholder layout from Phase 02. Becomes the full shell: sidebar + topbar + main slot. Still calls `getSession()` and enforces `role === 'admin'`. 403 panel is preserved (extract to a shared `Forbidden` component since the shell wraps everything).
- `src/app/admin/page.tsx` — **rewrite** placeholder. Redirect to `/admin/dashboard` (so `/admin` is canonical entry, dashboard is the real page).
- `src/app/admin/dashboard/page.tsx` — the dashboard page itself. Server component, fetches all 5 widget data sets via `Promise.all`, passes to client widgets where needed.
- `src/app/admin/(coming-soon)/showcase/page.tsx` — placeholder page for Phase 04. One-line: "Showcase CRUD ships in Phase 04."
- `src/app/admin/(coming-soon)/blog/page.tsx` — same
- `src/app/admin/(coming-soon)/testimonials/page.tsx` — same
- `src/app/admin/(coming-soon)/leads/page.tsx` — same (Phase 05)
- `src/app/admin/(coming-soon)/newsletter/page.tsx` — same (Phase 05)
- `src/app/admin/(coming-soon)/emails/page.tsx` — same (Phase 05)
- `src/components/admin/Sidebar.tsx` — server component, renders the navigation items. Active state via `usePathname` (so this is actually a thin client wrapper around a server-rendered list, OR we make the whole thing client; pick during planning).
- `src/components/admin/Topbar.tsx` — server component. Renders site name + page title (passed via context or props from layout) + AccountMenu.
- `src/components/admin/Forbidden.tsx` — extracted 403 panel from Phase 02's layout. Server component, takes `email` + `role` props.
- `src/components/admin/widgets/VisitorsChart.tsx` — client component (recharts). Line chart, daily pageviews from `page_analytics` aggregated for the last 30 days.
- `src/components/admin/widgets/TopPagesTable.tsx` — server component. Top 10 pathnames by views in the last 30 days from `page_analytics`.
- `src/components/admin/widgets/TrafficSourcesPie.tsx` — client component (recharts donut). Channel breakdown from `lead_attribution.channel` for the last 30 days.
- `src/components/admin/widgets/WebVitalsCards.tsx` — server component. 6 small KPI cards (CLS, FCP, FID, INP, LCP, TTFB) showing p75 over the last 7 days from `web_vitals`. Color-coded by Core Web Vitals thresholds (good / needs-improvement / poor).
- `src/components/admin/widgets/RecentLeadsPanel.tsx` — server component. List of the last 10 `leads` rows; email + source + relative time + status. Borrows the visual treatment of Dashboard 1's "Recent invoices" panel.
- `src/lib/admin/dashboard-queries.ts` — `'server-only'`. Five typed query functions: `getVisitorsByDay(days)`, `getTopPages(limit, days)`, `getTrafficSources(days)`, `getWebVitalsP75(days)`, `getRecentLeads(limit)`. Each returns a typed array. Single source of truth so widgets don't reach into Drizzle directly.

### Modified files

- `src/app/admin/layout.tsx` — see above
- `src/app/admin/page.tsx` — see above
- `package.json` — adds `recharts` (already used elsewhere? verify; if yes, no add)
- `.planning/STATE.md` and `.planning/ROADMAP.md` — phase status updates after the phase ships

### Deleted files

None.

## 5. Widget specs

### Visitors chart (top of page, full width)
- Source: `page_analytics` table
- Window: last 30 days
- X axis: day (ISO date)
- Y axis: total pageviews across all pages
- Series: 1 line, accent color
- Empty state: "No traffic data yet" centered in chart area

### Web Vitals cards (row of 6 mini cards)
- Source: `web_vitals` table
- Window: last 7 days
- Metric: p75 of `value` grouped by `name` (CLS / FCP / FID / INP / LCP / TTFB)
- Color: each card carries the CWV threshold color (text-success-text / text-warning-text / text-destructive-text based on the metric's threshold rules — same thresholds the existing `/api/web-vitals` endpoint uses for the `rating` enum)
- Each card: metric name, p75 value with unit, sample count

### Top pages table (left half of bottom row)
- Source: `page_analytics`
- Limit: 10
- Columns: pathname, pageviews, unique visitors
- Sort: pageviews desc
- Window: last 30 days

### Traffic sources donut (right half of bottom row, top)
- Source: `lead_attribution`
- Group by: `channel`
- Window: last 30 days
- Show: top 5 channels by count, "Other" bucket for the rest
- Legend: under or right of donut

### Recent leads panel (right half of bottom row, bottom)
- Source: `leads`
- Limit: 10 most recent by `createdAt`
- Per row: email (truncated), source, relative time ("3h ago"), status badge (new / contacted / qualified / closed — based on `leads.status`)
- Empty state: "No leads yet."

## 6. Sidebar nav items

| Label | Href | Icon | Phase |
|---|---|---|---|
| Dashboard | /admin/dashboard | Heroicons HomeIcon | this phase |
| Showcase | /admin/showcase | Heroicons RectangleStackIcon | coming-soon stub |
| Blog | /admin/blog | Heroicons DocumentTextIcon | coming-soon stub |
| Testimonials | /admin/testimonials | Heroicons ChatBubbleLeftRightIcon | coming-soon stub |
| Leads | /admin/leads | Heroicons UserGroupIcon | coming-soon stub |
| Newsletter | /admin/newsletter | Heroicons EnvelopeIcon | coming-soon stub |
| Emails | /admin/emails | Heroicons PaperAirplaneIcon | coming-soon stub |

Settings + Profile go below a divider when v4 needs them (not this phase).

## 7. Layout structure

```
+---------+----------------------------------------+
| Sidebar | Topbar (site name | page label | menu) |
|         +----------------------------------------+
|         |                                        |
|         |  Page content                          |
|         |                                        |
|         |                                        |
+---------+----------------------------------------+
```

- Sidebar: fixed width (`w-60` on desktop), collapses to icon-only on tablet, off-canvas on mobile via a hamburger in the topbar.
- Topbar: `h-14` matching the public site, with horizontal padding.
- Content slot: `p-6` md / `p-8` lg.

## 8. Constraints (do not violate)

- Project conventions live in `/CLAUDE.md`. Highlights: NO emojis, NO em-dash (—), NO en-dash (–) in any user-facing copy, server-first components, use existing utility classes from `globals.css` (don't invent values), `text-accent-text` not raw `text-accent` for small accent body copy, Logger not `console.*`, Zod safeParse not parse, env via `@/env`.
- `src/lib/auth/admin.ts` (Bearer guard for cron) stays untouched.
- `src/lib/auth/index.ts`, `get-session.ts`, the catch-all auth route — UNTOUCHED. Phase 02 shipped them, they work.
- All admin pages remain `role === 'admin'`-only. The shell layout enforces this.
- Sidebar / topbar / Forbidden / coming-soon pages are server components. Only widgets that need browser APIs (charts) are client.
- recharts is the chart lib if it's already in the project; otherwise add it (small bundle, our existing pattern).
- All time windows in widgets use UTC; rendering is in the operator's locale via `Intl.DateTimeFormat`.

## 9. Verification

- `bun run lint && bun run typecheck && bun run build` all pass
- `/admin` redirects to `/admin/dashboard` (server-side 302/307)
- `/admin/dashboard` renders all 5 widgets without runtime errors
- Each widget shows real data when the underlying table has rows; an empty state when it doesn't
- Sidebar links navigate; the 6 coming-soon pages render their placeholder copy
- AccountMenu still works (sign-out)
- Em/en-dash sweep on all changed files: zero
- `src/lib/auth/admin.ts` diff vs main: empty

## 10. Out of scope

- Date-range picker UI (fixed windows for now)
- Drill-down into individual analytics records
- Export / download for tables
- Mobile sidebar polish beyond functional collapse
- Loading skeletons for widgets (Suspense fallback is plain spinner; polish in a later phase)
- Real-time / WebSocket data
