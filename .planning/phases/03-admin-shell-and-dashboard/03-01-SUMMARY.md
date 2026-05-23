---
phase: 03-admin-shell-and-dashboard
plan: 01
subsystem: admin
tags: [admin, dashboard, drizzle, recharts, server-only]
dependency_graph:
  requires:
    - src/lib/db.ts
    - src/lib/schemas/schema.ts
    - src/lib/logger.ts
  provides:
    - src/lib/admin/dashboard-queries.ts
    - getVisitorsByDay
    - getTopPages
    - getTrafficSources
    - getWebVitalsP75
    - getRecentLeads
    - VisitorsByDayRow
    - TopPagesRow
    - TrafficSourceRow
    - WebVitalsP75Row
    - RecentLeadRow
  affects:
    - .planning/phases/03-admin-shell-and-dashboard/03-04 (widgets will import from this module)
tech_stack:
  added:
    - recharts@3.8.1
  patterns:
    - server-only query module (mirrors src/lib/testimonials.ts shape)
    - sql template tags with typed casts (`sql<number>`, `sql<string>`)
    - percentile_cont aggregate for web vitals p75
key_files:
  created:
    - src/lib/admin/dashboard-queries.ts
  modified:
    - package.json
    - bun.lock
decisions:
  - Used `percentile_cont(0.75)` instead of `percentile_disc(0.75)` for Web Vitals so the p75 is linearly interpolated between samples rather than snapping to an existing observation. Matches what Vercel / CrUX surface.
  - Returned raw channel rows from `getTrafficSources` instead of bucketing the tail into "Other" inside the SQL. Kept the query simple; widgets in Plan 03-04 own the top-N + Other policy.
  - Cast `coalesce(sum(...), 0)::int` for pageview / unique-visitor sums so the Drizzle row carries a real number, not a string (Postgres `sum(integer)` returns `bigint`).
  - Bound the days window via a parameterised interval (`(${days} || ' days')::interval`) so the query plan stays prepared-statement-safe instead of string-interpolating into the SQL.
metrics:
  duration: ~6m
  completed_date: 2026-05-23
  tasks_completed: 2
  files_created: 1
  files_modified: 2
---

# Phase 3 Plan 01: Dashboard query layer + recharts Summary

Locked the chart library (`recharts@3.8.1`) and stood up the single source of truth for admin dashboard data: `src/lib/admin/dashboard-queries.ts`. The module is `server-only`, talks to Drizzle directly, and exports five typed async functions; every widget in Plan 03-04 will import from here so no widget reaches into the DB.

## Recharts version

```
recharts@3.8.1
```

Resolved by `bun add recharts` with no version pin. 38 packages pulled in transitively. Pinned exactly in `package.json` (no caret, matching the rest of the dependency list).

## Function signatures (verbatim)

```typescript
export async function getVisitorsByDay(
  days: number = 30
): Promise<VisitorsByDayRow[]>

export async function getTopPages(
  limit: number = 10,
  days: number = 30
): Promise<TopPagesRow[]>

export async function getTrafficSources(
  days: number = 30
): Promise<TrafficSourceRow[]>

export async function getWebVitalsP75(
  days: number = 7
): Promise<WebVitalsP75Row[]>

export async function getRecentLeads(
  limit: number = 10
): Promise<RecentLeadRow[]>
```

Row types (also exported):

```typescript
type VisitorsByDayRow = { date: string; pageviews: number }
type TopPagesRow      = { pathname: string; pageviews: number; uniqueVisitors: number }
type TrafficSourceRow = { channel: string; count: number }
type WebVitalsP75Row  = { name: string; p75: number; sampleCount: number }
type RecentLeadRow    = Pick<Lead, 'id' | 'email' | 'source' | 'status' | 'createdAt'>
```

## SQL / schema gotchas

1. **`page_analytics.date` is a timestamp, not a date.** The schema column is `timestamp('date', { withTimezone: true })`. The day buckets therefore use `date_trunc('day', date)` and emit `to_char(..., 'YYYY-MM-DD')` so the wire format is a stable `YYYY-MM-DD` string regardless of TZ.
2. **`page_analytics.pageViews` and `uniqueVisitors` are nullable integers** (`integer(...).default(0)`). Aggregates use `coalesce(sum(...), 0)::int` so missing rows still return `0` instead of `null` and the JS-side `Number(...)` call always sees a numeric string.
3. **Postgres `sum(integer)` returns `bigint`**, which the neon-http driver hands back as a string. The `::int` cast plus `Number(row.pageviews)` mapping is what keeps the typed return shape (`number`) honest.
4. **`web_vitals.value` is `numeric` (text-wide), not `double precision`.** `percentile_cont` insists on `double precision` or `interval` for the ordering expression, so the query casts: `percentile_cont(0.75) within group (order by ${webVitals.value}::numeric)`. Chose `percentile_cont` over `percentile_disc` so the p75 lands between samples (matches Vercel / CrUX).
5. **`lead_attribution.channel` is nullable.** The query both filters `IS NOT NULL` in SQL and narrows with a TS type-guard `.filter(...)` so the returned `channel` is `string`, never `string | null`. Belt-and-suspenders, but the narrowing is what keeps `TrafficSourceRow.channel` non-nullable at the type level.
6. **Parameterised intervals.** `now() - (${days} || ' days')::interval` keeps `days` as a bound parameter instead of inlining it into the SQL string; the prepared-statement plan can be reused across calls with different windows.
7. **Mock-db safety.** `src/lib/db.ts` returns a chainable Proxy that resolves to `[]` when `POSTGRES_URL` is unset. All five functions still wrap their query in try/catch with `logger.error` + `return []` so true runtime errors are also swallowed -- widgets never see a thrown query.

## Verification

```
bun run lint        PASS  (Checked 290 files, no errors)
bun run typecheck   PASS  (tsc --noEmit, exit 0)
grep '"recharts"' package.json    PASS  ("recharts": "3.8.1")
grep -c "^export async function get" src/lib/admin/dashboard-queries.ts    PASS  (5)
head -1 .../dashboard-queries.ts                                            PASS  (import 'server-only')
grep -E 'console\.(log|error|warn|info)' .../dashboard-queries.ts          PASS  (no matches)
```

## Deviations from Plan

None. Plan executed exactly as written.

## Self-Check: PASSED

- `src/lib/admin/dashboard-queries.ts` exists
- `package.json` shows `"recharts": "3.8.1"`
- `bun.lock` modified in the working tree (will be staged in final commit)
- All five exported function names match the spec
