---
phase: 03-admin-shell-and-dashboard
plan: 04
subsystem: admin
tags: [admin, dashboard, recharts, web-vitals, suspense, cache-components]
dependency_graph:
  requires:
    - src/lib/admin/dashboard-queries.ts (Plan 03-01)
    - src/components/admin/Sidebar.tsx (Plan 03-02)
    - src/components/admin/Topbar.tsx (Plan 03-02)
    - src/app/admin/layout.tsx (Plan 03-03)
    - recharts@3.8.1 (Plan 03-01)
  provides:
    - src/app/admin/dashboard/page.tsx
    - VisitorsChart
    - TopPagesTable
    - TrafficSourcesPie
    - WebVitalsCards
    - RecentLeadsPanel
  affects:
    - Closes Phase 03. /admin/dashboard is now the canonical admin landing.
tech_stack:
  added: []
  patterns:
    - Single Suspense boundary around an async server component that does all
      data work in Promise.all. Required by Next.js 16 cacheComponents:true
      (no force-dynamic available).
    - `await connection()` from next/server inside the data-fetching subtree
      to opt out of static prerendering for a session-gated page; without it,
      next build attempts to prerender the dashboard shell and the Neon
      driver emits five "during prerendering, fetch() rejects" errors per
      build.
    - Client widgets (recharts) receive serialised data as props; server
      widgets fetch nothing themselves and also receive props. Single
      Promise.all in the page = one round-trip group, not five.
    - Per-widget error isolation is delegated to the query layer: every
      function in dashboard-queries.ts wraps the DB call in try/catch and
      returns [] on failure, so a bad query renders the widget's empty state
      and Promise.all never rejects.
key_files:
  created:
    - src/app/admin/dashboard/page.tsx
    - src/components/admin/widgets/VisitorsChart.tsx
    - src/components/admin/widgets/TopPagesTable.tsx
    - src/components/admin/widgets/TrafficSourcesPie.tsx
    - src/components/admin/widgets/WebVitalsCards.tsx
    - src/components/admin/widgets/RecentLeadsPanel.tsx
  modified: []
decisions:
  - Used Suspense + a single async DashboardWidgets section instead of one
    Suspense per widget. The plan's acceptance criteria require Promise.all
    in the page; that pattern is incompatible with the alternative "one
    async sibling section per widget" layout. The trade-off is a single
    streaming boundary (all five widgets paint together) for cleaner
    parallel fetching semantics. Per-widget streaming can be re-introduced
    in a later phase if a slow query starts blocking the others.
  - Added `await connection()` inside DashboardWidgets to opt the subtree
    out of static prerendering. Cleaner than the alternative `export const
    dynamic = 'force-dynamic'` which is rejected outright by
    nextConfig.cacheComponents:true.
  - Skeleton fallbacks are blank rounded panels sized to each widget's
    natural height (332/220/400/292/400px). Lightweight placeholder; richer
    skeleton polish is out of scope per CONTEXT section 10.
metrics:
  duration: ~22 minutes
  completed: 2026-05-23
  tasks: 6
  files_created: 6
  files_modified: 0
---

# Phase 03 Plan 04: Admin Dashboard Page + Widgets Summary

One-liner: `/admin/dashboard` server page composing five real-data widgets (VisitorsChart, WebVitalsCards, TopPagesTable, TrafficSourcesPie, RecentLeadsPanel) with single-Suspense streaming over a `Promise.all` of the dashboard-queries module.

## Widget classifications

| Widget | File | Rendering | Reason |
|---|---|---|---|
| VisitorsChart | `src/components/admin/widgets/VisitorsChart.tsx` | client (`'use client'`) | recharts `<LineChart>` needs ResizeObserver |
| TopPagesTable | `src/components/admin/widgets/TopPagesTable.tsx` | server | Plain HTML `<table>`; zero client JS |
| TrafficSourcesPie | `src/components/admin/widgets/TrafficSourcesPie.tsx` | client (`'use client'`) | recharts `<PieChart>` + `useMemo` for top-5 + Other bucketing |
| WebVitalsCards | `src/components/admin/widgets/WebVitalsCards.tsx` | server | Plain HTML grid of 6 KPI cards |
| RecentLeadsPanel | `src/components/admin/widgets/RecentLeadsPanel.tsx` | server | Plain `<ul>` list; `Intl.RelativeTimeFormat` runs at request time |

Pattern: client widgets receive their data as props from the server page. Server widgets also receive props (not self-fetching) so the page can use one parallel `Promise.all` instead of five sequential per-widget fetches.

## Page composition

`src/app/admin/dashboard/page.tsx`:

- `export const metadata` with `robots.index === false, follow === false` (admin pages must not be indexed).
- Top-level `<Suspense fallback={<DashboardSkeleton />}>` wraps a single async `DashboardWidgets` component.
- `DashboardWidgets` awaits `connection()` from `next/server` (opt out of prerender), then awaits `Promise.all([getVisitorsByDay(30), getTopPages(10, 30), getTrafficSources(30), getWebVitalsP75(7), getRecentLeads(10)])`.
- Renders:
  - Row 1 (full width): `<VisitorsChart data={visitors} />`
  - Row 2 (full width): `<WebVitalsCards rows={vitals} />`
  - Row 3 (`grid-cols-1 lg:grid-cols-2 gap-6`): `<TopPagesTable rows={topPages} />` on the left; `<TrafficSourcesPie data={sources} />` stacked over `<RecentLeadsPanel leads={recentLeads} />` on the right.

## Error handling

Per-widget error isolation lives entirely in the query layer (`src/lib/admin/dashboard-queries.ts`, Plan 03-01). Every `getXxx` function wraps its DB call in `try/catch`, logs via `logger.error`, and returns `[]` on failure. Because no query rejects, `Promise.all` never rejects either; a failing widget renders its empty state and the rest of the dashboard renders normally. No additional `<ErrorBoundary>` or per-widget Suspense was added.

## Web Vitals threshold table

The `classifyVital()` helper in `WebVitalsCards.tsx` mirrors the rating thresholds the `/api/web-vitals` route uses on ingest.

| Metric | good <= | needs-improvement <= | poor > | Unit |
|---|---|---|---|---|
| CLS | 0.1 | 0.25 | 0.25 | (unitless) |
| FCP | 1800 | 3000 | 3000 | ms |
| FID | 100 | 300 | 300 | ms |
| INP | 200 | 500 | 500 | ms |
| LCP | 2500 | 4000 | 4000 | ms |
| TTFB | 800 | 1800 | 1800 | ms |

Color mapping: `good` -> `text-success-text`, `needs-improvement` -> `text-warning-text`, `poor` -> `text-destructive-text` (all defined in `globals.css`).

## Verification

```text
$ bun run lint
Checked 305 files in 32ms. No fixes applied.
Found 1 info. (pre-existing in src/components/admin/Sidebar.tsx, out of scope)
exit 0

$ bun run typecheck
$ tsc --noEmit
exit 0

$ bun run build
Compiled successfully
Generating static pages using 17 workers (180/180)
exit 0
Route table contains: /admin/dashboard (PPR)
```

Em/en-dash sweep on all changed files:
```text
$ grep -rE '[\x{2014}\x{2013}]' src/components/admin/widgets src/app/admin/dashboard
(no output)
```

Hardcoded sample-data sweep:
```text
$ grep -rn "const (data|sample|MOCK)" src/components/admin/widgets/
(no output)

$ grep -rEn "const \w+\s*[:=]\s*\[" src/components/admin/widgets | grep -vE "useMemo|WEB_VITALS_ORDER|WEB_VITALS_THRESHOLDS|WEB_VITALS_UNITS|SLICE_COLORS"
(no output)
```

Widget file count:
```text
$ find src/components/admin/widgets -name '*.tsx' | wc -l
5
```

## Deviations from CONTEXT section 5

- **Web Vitals empty placeholder uses `--` (two ASCII hyphens), not blank.** Plan-specified.
- **Per-widget Suspense replaced by single page-level Suspense.** Forced by Next.js 16 `cacheComponents:true` + the plan's mandatory `Promise.all`. Per-widget error isolation is preserved by the query layer's internal try/catch. Per-widget streaming can be reintroduced later by inverting the pattern (one async section per widget) if a slow query starts blocking siblings.
- **Added `await connection()` to the data-fetching subtree.** Not in the plan, but required by `cacheComponents:true` to suppress the Neon prerender errors during `next build`. Cleaner than `dynamic = 'force-dynamic'` (which is rejected by cacheComponents).
- **Sidebar lint info-level warning on a pre-existing file (`Sidebar.tsx`, Plan 03-02).** Out of scope per the executor's scope-boundary rule. Not addressed here; tracked as a candidate for a follow-up cleanup.

## Self-Check: PASSED

Files exist:
- FOUND: src/app/admin/dashboard/page.tsx
- FOUND: src/components/admin/widgets/VisitorsChart.tsx
- FOUND: src/components/admin/widgets/TopPagesTable.tsx
- FOUND: src/components/admin/widgets/TrafficSourcesPie.tsx
- FOUND: src/components/admin/widgets/WebVitalsCards.tsx
- FOUND: src/components/admin/widgets/RecentLeadsPanel.tsx
