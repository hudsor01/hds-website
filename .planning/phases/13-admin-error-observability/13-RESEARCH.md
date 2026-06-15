# Phase 13: admin-error-observability - Research

**Researched:** 2026-06-02
**Domain:** Next.js 16 server-component data layer (Drizzle/Neon), discriminated-union result types, admin UI error states
**Confidence:** HIGH (entire change surface is in-repo; verified against every query file + every consumer page + every widget; no new external deps)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Error-signaling mechanism (core pattern):** Introduce a shared discriminated-union result, e.g. `AdminQueryResult<T> = { ok: true; data: T } | { ok: false; error: true }`. Queries RETURN it; they do NOT throw (throwing would kill the page and break v4 resilience). A failed query's `catch` returns the `error` variant (still logging via `logger.error` as today — keep the logging). A successful-but-empty query returns the `ok` variant with empty data. Single data seam stays: `src/lib/admin/*-queries.ts` is the only place pages/widgets read from.
- **List pages (ADMINERR-01):** `list*ForAdmin` functions return the result type. List pages render a visible error state (shared error component) when `ok:false`, instead of silently showing the empty-list UI. Empty-list UI is reserved for genuine `ok:true` + zero rows.
- **Dashboard widgets (ADMINERR-02):** `dashboard-queries.ts` widget queries (`getVisitorsByDay`, `getTopPages`, `getTrafficSources`, `getRecentLeads`) return the result type. Each widget renders its own error state in its card on `ok:false`; a failing widget must NOT prevent the other widgets or the page from rendering (preserve v4 resilience).
- **Queue-health counts (ADMINERR-03):** `emails-queries.ts::getQueueCounts` no longer returns the all-zero record on error. On failure it returns the `error` variant so the `/admin/emails` stat cards show an error/unknown state instead of a falsely-healthy zeroed queue.
- **Detail pages / get*ById (ADMINERR-04):** `get*ById` functions distinguish three outcomes: FOUND (data), NOT-FOUND (no row — legitimately 404 via `notFound()`), and ERROR (DB failure). On ERROR the detail page renders an error state, NOT a 404. The query returns a 3-way result (e.g. `{ status: 'found'; data } | { status: 'not-found' } | { status: 'error' }`); the page calls `notFound()` only on `'not-found'` and renders the error state on `'error'`.
- **Shared error-state UI:** Add ONE shared admin error-state component (mirror the existing empty-state pattern). Reuse it across list pages, widgets, queue cards, and detail pages. Survey `src/components/ui/` + existing admin empty-state components first (shadcn-first; do not hand-roll if a primitive fits).

### Claude's Discretion
- Exact names/shape of the result union(s) (two variants for list/widget/queue; three-way for get*ById) and where the type lives (a shared admin types module).
- The shared error component's exact API + copy (must be em/en-dash free, no emojis, accessible — `role="alert"`).
- Whether to also upgrade the `delete*` / mutation error contracts (NOT required by ADMINERR-01..04; only if trivially consistent and low-risk — otherwise defer).
- Plan/wave structure (likely: shared type + error component first, then per-resource query+page updates).

### Deferred Ideas (OUT OF SCOPE)
- Upgrading the `delete*` mutation error contracts to the same discriminated result.
- A global admin error-monitoring/telemetry surface.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMINERR-01 | Admin list pages distinguish "query failed" from "no data" with a visible error state instead of silently rendering an empty list. | §Consumer Map covers all 6 list pages + 1 (`emails`) list-in-page; §Result Type defines `AdminQueryResult<T>` wrapping the existing `{rows,hasMore,prevCursor,nextCursor}` payload; §Pattern 1 shows narrowing. |
| ADMINERR-02 | Admin dashboard widgets distinguish a failed query from genuinely-empty analytics. | §Consumer Map row "dashboard"; §Pattern 2 (per-widget isolation). The 4 named widget queries (plus `getWebVitalsP75`, see note) wrap in `AdminQueryResult`; widgets gain an `error` branch in their own card. |
| ADMINERR-03 | The `/admin/emails` queue-health counts distinguish a failed query from a healthy zeroed queue. | §Consumer Map row "emails (page)"; `getQueueCounts` returns `AdminQueryResult<QueueCounts>`; the stat-card grid renders an "Unknown" / error card on `ok:false`. |
| ADMINERR-04 | Admin detail pages (`get*ById`) show an error state on DB failure instead of a misleading 404. | §get*ById Wiring covers all 7 detail loaders; §Pitfall 2 confirms the PPR `$~` marker is NOT reintroduced; §Internal-Caller Hazard (the load-bearing finding) maps the 6 write-helper internal callers that also consume `get*ById`. |
</phase_requirements>

## Summary

Every admin read query currently swallows DB errors and returns a "safe default" indistinguishable from real emptiness: `list*ForAdmin` returns `EMPTY_RESULT` (`{rows:[], hasMore:false, prevCursor:null, nextCursor:null}`), `get*ById` returns `null` (which the page maps to `notFound()` → a misleading 404), dashboard widgets return `[]`, and `getQueueCounts` returns an all-zero record (a falsely-healthy queue). The fix is mechanical and uniform: wrap each read's return value in a discriminated union so a failed `catch` is distinguishable from a successful-but-empty result, and teach each consumer to render a visible error state on the failure variant. Because the failure is RETURNED (not thrown), per-widget/per-page resilience is preserved exactly as the v4 lock intended — `Promise.all` never rejects and one failed widget cannot blank the page.

The change surface is wide but shallow: **8 query files (21 read functions in scope), 15 consumer page files, 5 dashboard widget components, and 1 new shared error component**. There is exactly one non-obvious hazard that the planner MUST sequence correctly: **6 write-helper functions call `get*ById` internally** (`updateShowcase`, `toggleShowcasePublished`, `updateBlogPost`, `toggleBlogPostPublished`, `toggleTestimonialPublished`, `retryScheduledEmail`) and currently rely on the `null`-on-anything contract. Changing `get*ById` to a 3-way result breaks these internal callers and their tests at the type level. They must be migrated in the same task as the `get*ById` they consume.

No new dependencies are required. The shared error component should be built on the existing shadcn `Alert` primitive (`src/components/ui/alert.tsx`, already `role="alert"`, has `destructive` variant) wrapped in the admin card chrome the empty-states already use. The codebase already contains a precedent discriminated union (`RetryResult = { ok: true; row } | { ok: false; reason }` in `emails-queries.ts`), so the pattern is idiomatic here.

**Primary recommendation:** Define `AdminQueryResult<T>` (2-variant) and `AdminDetailResult<T>` (3-variant) in a new `src/lib/admin/query-result.ts` (server-agnostic types + tiny `ok()`/`err()`/`found()`/`notFoundResult()`/`errResult()` helpers, no `import 'server-only'` so they're importable from any tier). Wrap the existing payloads as the `data` field (the list payload shape `{rows,hasMore,prevCursor,nextCursor}` becomes `data`). Add one `AdminErrorState` component on top of shadcn `Alert`. Migrate per-resource (query + its consumers + its tests) in one wave each, sequencing the `get*ById`/write-helper pairs together.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Error-vs-empty signaling | API/Backend (`src/lib/admin/*-queries.ts`) | — | The query layer is the single data seam (v4 lock, unchanged). Only it knows whether the DB call threw. |
| Result-type definitions + helpers | API/Backend (`src/lib/admin/query-result.ts`) | Frontend Server (consumers narrow it) | Pure TS types; no runtime/no DB. Importable from server pages and widget components. |
| List-page error rendering | Frontend Server (`(admin)/admin/**/page.tsx`) | — | Server components own the `ok ? table : <AdminErrorState>` branch. |
| Dashboard widget error rendering | Frontend Server (server widgets) + Browser (recharts client widgets) | — | The dashboard page passes the discriminated result through to each widget; widgets own their own error card so one failure is contained. |
| Detail-page error vs 404 | Frontend Server (`[id]` loaders) | — | The loader maps `status: 'not-found'` → `notFound()` and `status: 'error'` → `<AdminErrorState>`. `notFound()` MUST stay synchronous for the build placeholder (see Pitfall 2). |
| Shared error-state UI | Browser/Client primitive (`ui/alert.tsx`, already `'use client'`) wrapped by an admin component | — | Reuse the existing shadcn `Alert`; the admin wrapper supplies card chrome + standard copy. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `class-variance-authority` | 0.7.1 (installed) | Already powers `ui/alert.tsx` variants | No new dep; the error component reuses `Alert`'s `destructive` variant. [VERIFIED: package.json] |
| `lucide-react` | 1.17.0 (installed) | Icon for the error state (e.g. `TriangleAlert` / `CircleAlert`) | `components.json` sets `"iconLibrary": "lucide"`; admin already uses lucide (`ResourceListPage` uses `Plus`). [VERIFIED: package.json + components.json] |
| Drizzle ORM | 0.45 (installed) | Query layer being wrapped | Existing seam; unchanged behavior, only return shape changes. [CITED: CLAUDE.md STACK] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `bun:test` | bundled with Bun 1.3.x | Unit-test the new catch paths + 3-way detail results | Per-query regression tests (mock db to throw). [VERIFIED: package.json `test:unit` script] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `{ ok: true; data } / { ok: false; error: true }` | `Result<T, E>` neverthrow-style lib | Adds a dependency for a 2-line type. The repo already hand-rolls `RetryResult` in the same style — match it, no new dep. |
| New `AdminErrorState` wrapping `Alert` | Raw shadcn `Alert` at every call site | A wrapper centralizes copy + card chrome + the standard `role="alert"` and keeps the ~13 call sites DRY and consistent. The CONTEXT lock requires ONE shared component. |
| 3-way `{ status }` union for detail | 2-way `AdminQueryResult<T | null>` | A 2-way union cannot distinguish not-found from error — exactly the ADMINERR-04 bug. The 3-way union is mandatory for detail. |

**Installation:** None. No packages added. (Package Legitimacy Audit is N/A — see below.)

## Package Legitimacy Audit

> Not applicable. This phase installs **zero** external packages — it adds in-repo TypeScript types, one in-repo component built on the existing shadcn `Alert`, and changes return shapes. All libraries used (`class-variance-authority`, `lucide-react`, Drizzle, `bun:test`) are already in `package.json`. slopcheck not run because no install occurs.

## Architecture Patterns

### System Architecture Diagram

```
                       ┌──────────────────────────────────────────────┐
   admin page request  │  src/app/(admin)/admin/**/page.tsx (server)   │
  ───────────────────► │  - await connection()  (dynamic, post-build)  │
                       │  - calls one/few query fns                    │
                       └───────────────┬──────────────────────────────┘
                                       │ awaits
                                       ▼
                  ┌────────────────────────────────────────────────────┐
                  │  src/lib/admin/*-queries.ts  (server-only seam)      │
                  │                                                      │
                  │   try { rows = await db.select()... }                │
                  │     → return ok({ rows, hasMore, prev, next })       │  list/widget/queue
                  │   catch (e) { logger.error(...); return err() }      │
                  │                                                      │
                  │   try { row = await db...where(id) }                 │
                  │     → row ? found(row) : notFoundResult()            │  get*ById
                  │   catch (e) { logger.error(...); return errResult()} │  (3-way)
                  └───────────────┬──────────────────────────────────────┘
                                  │ returns discriminated union
                                  ▼
        ┌───────────────────────────────────────────────────────────────┐
        │  Consumer narrows the union                                     │
        │                                                                 │
        │  LIST:    result.ok                                             │
        │             ? (rows.length ? <Table/> : <empty/>)               │
        │             : <AdminErrorState/>                                │
        │                                                                 │
        │  WIDGET:  each widget gets its own result; renders <Alert>      │
        │           in its own card on !ok → other widgets still render   │
        │                                                                 │
        │  QUEUE:   counts.ok ? <stat cards> : <Unknown/error cards>      │
        │                                                                 │
        │  DETAIL:  switch (result.status)                                │
        │             'not-found' → notFound()   (404)                    │
        │             'error'     → <AdminErrorState/>  (NOT 404)         │
        │             'found'     → render row                            │
        └───────────────────────────────────────────────────────────────┘
                                  │ renders
                                  ▼
                  ┌────────────────────────────────────────────┐
                  │  AdminErrorState (wraps shadcn Alert,        │
                  │  role="alert", destructive variant)         │
                  └────────────────────────────────────────────┘
```

### Recommended Structure (additions/changes only)
```
src/lib/admin/
├── query-result.ts          # NEW: AdminQueryResult<T>, AdminDetailResult<T> + ok/err/found/... helpers (NO 'server-only')
├── *-queries.ts             # CHANGED: read fns return the unions; catch returns failure variant; logger.error kept
src/components/admin/
├── AdminErrorState.tsx      # NEW: shared error card on top of ui/alert.tsx (role="alert")
├── widgets/*.tsx            # CHANGED: each accepts the result (or an `error` prop) and renders its own error branch
src/app/(admin)/admin/**
├── page.tsx / [id]/page.tsx # CHANGED: narrow the union; list→error branch, detail→switch on status
tests/unit/admin/
├── *-queries.test.ts        # CHANGED/ADDED: assert catch path yields failure variant; 3-way detail tests
```

### Pattern 1: 2-variant result for list/widget/queue
**What:** Wrap the existing payload as `data`; the consumer narrows with `if (result.ok)`.
**When to use:** `list*ForAdmin` (×6), the 4 dashboard widget queries, `getQueueCounts`.
**Example:**
```typescript
// src/lib/admin/query-result.ts  (NO 'server-only' — pure types, importable anywhere)
export type AdminQueryResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: true }

export const ok = <T>(data: T): AdminQueryResult<T> => ({ ok: true, data })
export const err = (): AdminQueryResult<never> => ({ ok: false, error: true })

export type AdminDetailResult<T> =
  | { status: 'found'; data: T }
  | { status: 'not-found' }
  | { status: 'error' }

export const found = <T>(data: T): AdminDetailResult<T> => ({ status: 'found', data })
export const notFoundResult = (): AdminDetailResult<never> => ({ status: 'not-found' })
export const errResult = (): AdminDetailResult<never> => ({ status: 'error' })
```
```typescript
// list query (the {rows,hasMore,prevCursor,nextCursor} object becomes `data`)
export async function listLeadsForAdmin(
  opts?: ListLeadsOptions
): Promise<AdminQueryResult<ListLeadsResult>> {
  // ...build whereClause/orderBy unchanged...
  try {
    const dbRows = await db.select()...limit(PAGE_SIZE + 1)
    // ...same cursor math...
    return ok({ rows: pageRows, hasMore, prevCursor, nextCursor })
  } catch (error) {
    logger.error('leads-queries.listLeadsForAdmin failed', error)  // KEEP logging
    return err()
  }
}
```
```tsx
// consumer (server page)
const result = await listLeadsForAdmin({ status, q, cursor })
if (!result.ok) {
  return <AdminErrorState resource="leads" />
}
const { rows, prevCursor, nextCursor } = result.data
// existing rows.length === 0 ? <empty> : <Table> branch unchanged from here
```
> Note: keep `ListLeadsResult` as the INNER payload type and delete the `EMPTY_RESULT` const (its only purpose was the swallowed-error default, now replaced by `err()`).

### Pattern 2: per-widget error isolation (ADMINERR-02)
**What:** The dashboard page passes each widget its own `AdminQueryResult`. Each widget renders an `<Alert>` inside its own card on `!ok`; the existing `data.length === 0` empty branch is preserved for genuine emptiness.
**When to use:** all five dashboard widgets.
**Example:**
```tsx
// dashboard/page.tsx — Promise.all still never rejects (errors are returned)
const [visitors, topPages, sources, vitals, recentLeads] = await Promise.all([
  getVisitorsByDay(30), getTopPages(10, 30), getTrafficSources(30),
  getWebVitalsP75(7), getRecentLeads(10)
])
return (
  <div className="space-y-6">
    <VisitorsChart result={visitors} />          {/* widget owns ok/empty/error */}
    <WebVitalsCards result={vitals} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TopPagesTable result={topPages} />
      <div className="space-y-6">
        <TrafficSourcesPie result={sources} />
        <RecentLeadsPanel result={recentLeads} />
      </div>
    </div>
  </div>
)
```
```tsx
// inside e.g. TopPagesTable — card chrome stays; only the body branches
export function TopPagesTable({ result }: { result: AdminQueryResult<TopPagesRow[]> }) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-6">
      <h2 className="text-sm font-semibold text-foreground mb-4">Top pages (last 30 days)</h2>
      {!result.ok ? (
        <AdminErrorState inline resource="page analytics" />
      ) : result.data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No page analytics yet.</p>
      ) : (
        /* existing <table> */
      )}
    </div>
  )
}
```
> The two client widgets (`VisitorsChart`, `TrafficSourcesPie` are `'use client'`) can still receive the result object as a prop — it is a plain serializable object — and render `AdminErrorState` (also a client-compatible component). No server/client boundary issue.

### Pattern 3: 3-way detail result + notFound() wiring (ADMINERR-04)
**What:** `get*ById` returns `AdminDetailResult<T>`. The loader switches: `'not-found'` → `notFound()`, `'error'` → `<AdminErrorState>`, `'found'` → render.
**Example:**
```typescript
// query
export async function getLeadById(id: string): Promise<AdminDetailResult<LeadDetail>> {
  try {
    const [leadRows, attribution, notes] = await Promise.all([...])
    const [lead] = leadRows
    if (!lead) return notFoundResult()
    return found({ lead, attribution, notes })
  } catch (error) {
    logger.error('leads-queries.getLeadById failed', error, { metadata: { id } })  // KEEP
    return errResult()
  }
}
```
```tsx
// detail loader — placeholder short-circuit UNCHANGED (still synchronous, before connection())
async function LeadDetailLoader({ params }: Props) {
  const { id } = await params
  if (id === BUILD_PLACEHOLDER_ID) {
    notFound()                       // <-- stays exactly as-is (Pitfall 2)
  }
  await connection()
  const result = await getLeadById(id)
  if (result.status === 'not-found') {
    notFound()
  }
  if (result.status === 'error') {
    return <AdminErrorState resource="lead" />   // NOT a 404
  }
  const { lead, attribution, notes } = result.data
  // ...existing render unchanged...
}
```

### Anti-Patterns to Avoid
- **Throwing from the query on DB error.** Breaks v4 resilience — a thrown query hits the route `error.tsx` boundary and blanks the whole page / all widgets. The lock is explicit: RETURN the failure variant.
- **Moving the placeholder `notFound()` after `connection()` or making it conditional on the result.** Reintroduces the `$~` PPR marker build bug (see Pitfall 2). Keep the `if (id === BUILD_PLACEHOLDER_ID) notFound()` line first, synchronous, untouched.
- **Putting `import 'server-only'` in `query-result.ts`.** The two client widgets (`VisitorsChart`, `TrafficSourcesPie`) import the result type; a `server-only` guard would fail their build. Keep the types in a tier-agnostic module.
- **Dropping the `logger.error` calls.** The lock says keep them. They are the only server-side trace of a real failure.
- **Collapsing `getQueueCounts` error into the zero record.** That IS the ADMINERR-03 bug. Return `err()`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible error banner | Custom `<div role="alert">` per call site | `AdminErrorState` wrapping shadcn `ui/alert.tsx` | `Alert` already sets `role="alert"`, has the `destructive` variant + icon slots, and matches the design system. One wrapper keeps copy consistent. |
| Result/option type | A bespoke `{ data, error, loading }` triple | `AdminQueryResult<T>` / `AdminDetailResult<T>` (match existing `RetryResult`) | The repo already uses this exact discriminated-union idiom; consistency + ergonomic narrowing. |
| Distinguishing not-found from error | Sentinel values / magic strings | The 3-way `{ status }` union | Sentinels are exactly what caused the misleading-404 bug. |

**Key insight:** This phase is fundamentally a *type-shape migration*, not new machinery. The risk is missing a consumer (type error) or a hidden internal caller (the write-helper hazard), not building something complex.

## Internal-Caller Hazard (LOAD-BEARING — read before planning ADMINERR-04)

`get*ById` is not only called by detail pages. Six WRITE helpers call it internally and rely on the current `null`-on-anything contract:

| Write helper | File:line | Internal call | Current usage |
|--------------|-----------|---------------|---------------|
| `updateShowcase` | showcase-queries.ts:251 | `getShowcaseById(id)` | `const existing = await getShowcaseById(id); if (!existing) return null` |
| `toggleShowcasePublished` | showcase-queries.ts:296 | `getShowcaseById(id)` | same |
| `updateBlogPost` | blog-queries.ts:386 | `getBlogPostForAdmin(id)` | same |
| `toggleBlogPostPublished` | blog-queries.ts:449 | `getBlogPostForAdmin(id)` | same |
| `toggleTestimonialPublished` | testimonials-queries.ts:254 | `getTestimonialById(id)` | same |
| `retryScheduledEmail` | emails-queries.ts:302 | `getScheduledEmailById(id)` | `const existing = await getScheduledEmailById(id); if (!existing) return { ok:false, reason:'not_found' }` |

**Implication for the planner:** When a `get*ById` changes to `AdminDetailResult<T>`, every internal caller above must be updated in the SAME task (they will otherwise fail typecheck — `if (!existing)` on a `{status}` object is always false; `existing.published` no longer type-checks). Two clean options for the internal callers:
1. Adjust the internal call sites to read `result.status === 'found' ? result.data : null` (minimal, keeps write contracts byte-equal).
2. Extract a private un-wrapped `fetchXById()` that returns `T | 'error'` and have both the public `get*ById` and the write helpers call it. Heavier; only if multiple internal callers share logic.

Recommendation: option 1 (local narrowing at each internal call site) — smallest diff, write-helper return contracts stay unchanged (still out of scope per CONTEXT). Note: the existing write-helper tests (`*-queries.test.ts`) mock `db` and exercise these paths; they will need the mock'd `get*ById` internal call to return a `found(...)`-shaped object — but since the write helpers call the REAL `get*ById` (same module), the existing db mock that returns a row already produces `found(row)`, so most write-helper tests keep passing if the narrowing is correct. Verify per-file.

## Full Consumer Map (the complete change surface)

**Query fns in scope (21):** 6 `list*ForAdmin`, 7 `get*ById`-style, 5 dashboard widgets (4 named in CONTEXT + `getWebVitalsP75`), `getQueueCounts`, `listScheduledEmailsForAdmin`, `getScheduledEmailById`. (`delete*`/mutation helpers are OUT of scope.)

### List queries → consumer pages
| Query fn | Query file | Consumer | Current empty-state UI |
|----------|-----------|----------|------------------------|
| `listLeadsForAdmin` | leads-queries.ts:97 | `(admin)/admin/leads/page.tsx:87` (destructures `{rows,prevCursor,nextCursor}`) | inline card "No leads yet." / "No leads matching {q}" (lines 108-125) |
| `listCalculatorLeadsForAdmin` | calculator-leads-queries.ts:85 | `(admin)/admin/leads/calculator/page.tsx:89` | inline card "No calculator submissions yet." / matching (114-134) |
| `listSubscribersForAdmin` | newsletter-queries.ts:125 | `(admin)/admin/newsletter/page.tsx:86` | inline "No subscribers yet." / matching (110-125) |
| `listShowcasesForAdmin` | showcase-queries.ts:82 | `(admin)/admin/showcase/page.tsx:60` | `ResourceListPage` empty card + inline "No showcase entries matching {q}" (77-89) |
| `listTestimonialsForAdmin` | testimonials-queries.ts:79 | `(admin)/admin/testimonials/page.tsx:65` | `ResourceListPage` empty card + inline matching (82-93) |
| `listBlogPostsForAdmin` | blog-queries.ts:126 | `(admin)/admin/blog/page.tsx:77` | `ResourceListPage` empty card + inline matching (94-105) |
| `listScheduledEmailsForAdmin` | emails-queries.ts:163 | `(admin)/admin/emails/page.tsx:89` (in `Promise.all` w/ `getQueueCounts`) | inline "No scheduled emails." / matching (139-156) |

> All seven destructure the payload directly (`const { rows, prevCursor, nextCursor } = await list...`). After the change they become `const result = await list...; if (!result.ok) return <AdminErrorState/>; const { rows, prevCursor, nextCursor } = result.data`.

### get*ById queries → detail/edit loaders
| Query fn | Query file | Consumer loader | Current null→ handling |
|----------|-----------|-----------------|------------------------|
| `getLeadById` | leads-queries.ts:203 | `leads/[id]/page.tsx:68` `LeadDetailLoader` | `if (!detail) notFound()` (69-71) |
| `getCalculatorLeadById` | calculator-leads-queries.ts:197 | `leads/calculator/[id]/page.tsx:95` | `if (!row) notFound()` (96-98) |
| `getSubscriberById` | newsletter-queries.ts:269 | `newsletter/[id]/page.tsx:77` `SubscriberLoader` | `if (!row) notFound()` (78-80) |
| `getShowcaseById` | showcase-queries.ts:206 | `showcase/[id]/edit/page.tsx:45` `EditLoader` | `if (!row) notFound()` (46-48) |
| `getTestimonialById` | testimonials-queries.ts:181 | `testimonials/[id]/edit/page.tsx:46` `EditLoader` | `if (!row) notFound()` (47-49) |
| `getBlogPostForAdmin` | blog-queries.ts:308 | `blog/[id]/edit/page.tsx:49` (in `Promise.all` w/ `getAuthors`,`getTags`) | `if (!row) notFound()` (53-55) |
| `getScheduledEmailById` | emails-queries.ts:269 | `emails/[id]/page.tsx:75` `EmailDetailLoader` | `if (!row) notFound()` (76-78) |

> All seven loaders already have the `if (id === BUILD_PLACEHOLDER_ID) notFound()` synchronous short-circuit + `await connection()` BEFORE the DB read — keep those lines untouched; only the post-`connection()` null-check becomes a `switch (result.status)`.

### Dashboard widgets (ADMINERR-02)
| Query fn | Query file:line | Consumer | Widget component | Current empty branch |
|----------|-----------------|----------|------------------|----------------------|
| `getVisitorsByDay` | dashboard-queries.ts:45 | `dashboard/page.tsx:69` | `VisitorsChart` (`'use client'`, recharts) | `data.length === 0 ? "No traffic data yet."` |
| `getTopPages` | :77 | :70 | `TopPagesTable` (server) | `rows.length === 0 ? "No page analytics yet."` |
| `getTrafficSources` | :114 | :71 | `TrafficSourcesPie` (`'use client'`, recharts) | `chartData.length === 0 ? "No traffic source data yet."` |
| `getWebVitalsP75` | :155 | :72 | `WebVitalsCards` (server) | per-card `--` placeholder (no whole-widget empty state) |
| `getRecentLeads` | :189 | :73 | `RecentLeadsPanel` (server) | `leads.length === 0 ? "No leads yet."` |

> **Decision needed (planner):** CONTEXT names only 4 widget queries (`getVisitorsByDay`, `getTopPages`, `getTrafficSources`, `getRecentLeads`) and omits `getWebVitalsP75`. For consistency and to fully satisfy ADMINERR-02 ("dashboard widgets distinguish a failed query"), recommend wrapping `getWebVitalsP75` too — it currently can't tell "no samples" (renders `--`) from "DB down". Flagged as an Assumption (A1). Low risk: it is the same mechanical change.

### Queue-health counts (ADMINERR-03)
| Query fn | Query file:line | Consumer | Current behavior |
|----------|-----------------|----------|------------------|
| `getQueueCounts` | emails-queries.ts:108 | `emails/page.tsx:88` (`Promise.all` w/ list) | returns all-zero record on error; page renders 4 stat cards reading `counts[s]` (lines 96-128). On error → falsely-healthy zeroed cards. |

> After: `getQueueCounts` returns `AdminQueryResult<QueueCounts>`. The page renders the 4 stat cards from `counts.data` when `ok`, else an "Unknown"/error stat-card row (use `AdminErrorState` spanning the grid, or per-card "Unknown"). The `filterOptions` builder at :96-103 reads `counts[s]` for chip counts — guard it (omit counts when `!ok`). The list and counts share a `Promise.all`; the list can still render even if counts fail (independent variants).

**Totals:** 8 query files changed · 21 read functions wrapped · 15 consumer page files changed · 5 widget components changed · 6 internal write-helper call sites adjusted · 1 new type module · 1 new shared component.

## Existing Empty-State Pattern + Shared Error Component

**The analog to mirror:** Two empty-state idioms exist today:
1. **List pages** — an inline centered card: `<div className="rounded-xl border border-border bg-surface-raised p-8 text-center"><p className="text-sm text-muted-foreground">…</p></div>` (e.g. leads/page.tsx:122-124). The shared shell `ResourceListPage` (`src/components/admin/ResourceListPage.tsx`) renders the same card for the whole-empty case.
2. **Widgets** — an inline `<p className="text-sm text-muted-foreground text-center py-8">No … yet.</p>` inside the existing card chrome.

**shadcn-first survey result:** `src/components/ui/alert.tsx` EXISTS (shadcn new-york `Alert`/`AlertTitle`/`AlertDescription`, already `role="alert"`, has a `destructive` variant, `'use client'`). This is the correct primitive — do not hand-roll. `components.json` confirms shadcn config (style new-york, lucide icons). No registry pull needed; the component is already vendored.

**Proposed `AdminErrorState` API:**
```tsx
// src/components/admin/AdminErrorState.tsx  (no 'use client' needed itself; Alert is the client part)
interface AdminErrorStateProps {
  /** e.g. "leads", "page analytics" — used in the default copy. */
  resource?: string
  /** Optional override copy (must be em/en-dash free). */
  message?: string
  /** Compact variant for inside a widget card (no extra card chrome). */
  inline?: boolean
}
// Renders <Alert variant="destructive"> with a lucide CircleAlert icon,
// AlertTitle "Could not load {resource}", AlertDescription
// "Something went wrong loading this data. Refresh to try again."
// `inline` drops the outer rounded-xl card wrapper for widget bodies.
```
**A11y:** inherits `role="alert"` from `Alert`; that announces to AT. Copy must avoid em/en dashes (CLAUDE.md) and emojis. Standard copy: title "Could not load {resource}", body "Something went wrong loading this data. Refresh to try again." (no dashes, no emojis — compliant).

## Runtime State Inventory

> Not a rename/refactor/migration phase in the runtime-state sense (no stored strings, no service config, no OS registrations). This is an in-process type-shape + UI change.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — verified by reading all 8 query files; no string keys/collection names change. | none |
| Live service config | None — verified; no external service config touched. | none |
| OS-registered state | None. | none |
| Secrets/env vars | None. | none |
| Build artifacts | None — no package rename; `next build` re-runs but no stale artifacts. | none |

## Common Pitfalls

### Pitfall 1: Missing a consumer / leaving a destructure on the old shape
**What goes wrong:** A consumer still does `const { rows } = await listX(...)` after `listX` now returns `{ ok, data }`. Destructuring `rows` off the union yields `undefined`/type error.
**Why it happens:** 15 consumer files + 5 widgets; easy to miss one.
**How to avoid:** Migrate each query and ALL its consumers (from the Consumer Map) in one task; rely on `tsc --noEmit` to catch any straggler (TypeScript will flag every old destructure as a type error against the new union). The Consumer Map above is exhaustive.
**Warning signs:** `bun run typecheck` errors of the form "Property 'rows' does not exist on type 'AdminQueryResult<...>'".

### Pitfall 2: Reintroducing the `$~` PPR loading bug on detail pages
**What goes wrong:** The build-time prerender of the `__build_placeholder__` id emits a `<!--$~-->` postponed-boundary marker that React's `$RC` reveal script can't handle → production ships an indefinite "Loading…" spinner. (Full root cause in `src/lib/admin/build-placeholder.ts`.)
**Why it happens:** Only if `connection()` (or any dynamic data access) runs during the placeholder prerender — i.e. if the synchronous `if (id === BUILD_PLACEHOLDER_ID) notFound()` short-circuit is moved/weakened.
**How to avoid:** Do NOT touch the placeholder short-circuit. It stays first, synchronous, before `connection()`. The NEW error path (`status === 'error' → <AdminErrorState/>`) only runs for REAL ids on real requests AFTER `connection()` — that is fully dynamic (`$?` boundary, revealed normally by `$RC`), identical PPR class to today's data render. Rendering JSX on the error branch does not add a build-time prerender step. [VERIFIED: build-placeholder.ts analysis + Next.js 16.2.7 notFound() semantics — notFound() throws NEXT_HTTP_ERROR_FALLBACK;404 and terminates the segment; the error branch returns JSX, same as the found branch.] [CITED: nextjs.org/docs/app/api-reference/functions/not-found]
**Warning signs:** After the change, a detail page for a real (existing) id hangs on "Loading…" in production, OR `next build` logs Neon "during prerendering, fetch() rejects" errors (means `connection()` ran at build time).

### Pitfall 3: Internal write-helper callers of get*ById (see dedicated section above)
**What goes wrong:** `updateShowcase`/`toggleShowcasePublished`/`updateBlogPost`/`toggleBlogPostPublished`/`toggleTestimonialPublished`/`retryScheduledEmail` do `const existing = await getXById(id); if (!existing) return null` — `!existing` is always false on a `{status}` object, and `existing.published` won't typecheck.
**How to avoid:** Adjust each internal call site to `const found = result.status === 'found' ? result.data : null; if (!found) return null` in the SAME task as the `get*ById` change.
**Warning signs:** typecheck errors in the write helpers; existing `*-queries.test.ts` write-helper cases failing.

### Pitfall 4: getQueueCounts shares Promise.all with the list
**What goes wrong:** Treating the `[counts, list]` tuple as all-or-nothing; a counts failure shouldn't blank the list (or vice-versa).
**How to avoid:** Narrow each independently: render the stat-card error row from `counts` (when `!counts.ok`) and the list error/empty from `list` separately. They are independent `AdminQueryResult`s — `Promise.all` still resolves because neither throws.

### Pitfall 5: `query-result.ts` accidentally `server-only`
**What goes wrong:** Client widgets (`VisitorsChart`, `TrafficSourcesPie`) import the result TYPE; if the module is `server-only`, their bundle build fails.
**How to avoid:** Keep `query-result.ts` free of `import 'server-only'`. It's pure types + trivial constructors. (Types are erased; the `ok()/err()` helpers are tiny and safe in any tier.)

## Code Examples

### Test the catch path now yields the failure variant (list)
```typescript
// tests/unit/admin/leads-queries.test.ts — replaces the existing "DB error safety" case.
// Mock pattern unchanged: state.shouldThrow → chain.limit() returns Promise.reject.
test('returns the error variant + logs when the query throws', async () => {
  state.shouldThrow = true
  const result = await listLeadsForAdmin()
  expect(result).toEqual({ ok: false, error: true })   // was: EMPTY_RESULT
  expect(logger.error).toHaveBeenCalledTimes(1)
})
test('returns ok({rows:[]...}) when DB yields zero rows (distinct from error)', async () => {
  state.rowsToReturn = []
  const result = await listLeadsForAdmin()
  expect(result.ok).toBe(true)
  if (result.ok) expect(result.data.rows).toEqual([])
})
```
> Source: existing chainable-mock pattern in `tests/unit/admin/leads-queries.test.ts:44-74` (verified). `tests/setup.ts` auto-mocks `@/lib/logger` and re-runs `mock.restore()` before each test; the file re-registers its db mock in `beforeEach`.

### Test get*ById 3-way (found / not-found / error)
```typescript
test('getLeadById: found', async () => {
  state.rowsToReturn = [makeRow(0)]   // lead row present
  const r = await getLeadById('row-00')
  expect(r.status).toBe('found')
})
test('getLeadById: not-found when no row', async () => {
  state.rowsToReturn = []
  const r = await getLeadById('missing')
  expect(r.status).toBe('not-found')
})
test('getLeadById: error when the query throws', async () => {
  state.shouldThrow = true
  const r = await getLeadById('row-00')
  expect(r.status).toBe('error')
  expect(logger.error).toHaveBeenCalledTimes(1)
})
```
> Note `getLeadById` uses `Promise.all` over three selects; the mock's `shouldThrow` on any of them rejects the `Promise.all`. `getBlogPostForAdmin` additionally calls `loadTagIdsForPosts` (a second await inside the try) — the existing blog test mock already handles the join select.

### getQueueCounts error variant (ADMINERR-03)
```typescript
test('getQueueCounts: error variant on throw (not the zero record)', async () => {
  state.shouldThrow = true
  const r = await getQueueCounts()
  expect(r).toEqual({ ok: false, error: true })  // was: {pending:0,sent:0,failed:0,cancelled:0}
  expect(logger.error).toHaveBeenCalledTimes(1)
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| v4: query catch returns `[]`/`null`/zeros (silent) | v6: query catch returns a failure variant of a discriminated union; consumer renders a visible error state | This phase (ADMINERR-01..04) | Operators see real failures instead of fake-empty/fake-healthy/404. |
| Detail `null → notFound()` (DB error masquerades as 404) | 3-way `AdminDetailResult`; error → error state, not 404 | This phase | Transient DB error never presents as "record does not exist." |

**Deprecated/outdated:** the `EMPTY_RESULT` consts (one per list query file) — their sole purpose was the swallowed-error default; delete after wrapping.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `getWebVitalsP75` should also be wrapped (CONTEXT names only the other 4 widget queries). | Consumer Map → Dashboard widgets | LOW — if the planner scopes it out, ADMINERR-02 is still met for the 4 named queries; `getWebVitalsP75` keeps its current behavior (per-card `--`). Recommend including for consistency. |
| A2 | Internal write-helper callers should narrow locally (option 1) rather than extract a private fetcher (option 2). | Internal-Caller Hazard | LOW — both work; option 1 is smaller. Planner may choose either; the constraint (migrate internal callers WITH their get*ById) holds regardless. |
| A3 | The shared error component should wrap shadcn `Alert` rather than be a bespoke card. | Shared Error Component | LOW — CONTEXT mandates ONE shared component and shadcn-first; `Alert` is already vendored with `role="alert"`. |

## Open Questions

1. **Per-card vs whole-grid error for the queue stat cards (ADMINERR-03).**
   - What we know: 4 stat cards read `counts[s]`; on error there are no per-status counts.
   - What's unclear: whether to render one `AdminErrorState` spanning the grid or four "Unknown" cards.
   - Recommendation: one `AdminErrorState` (inline) spanning the grid row — simplest, unambiguous "couldn't load queue health"; keeps the four-card layout for the success case only.

2. **`getWebVitalsP75` inclusion** — see A1. Recommendation: include.

## Environment Availability

> Skipped — this phase has no external tool/service dependencies. It is code-only (TypeScript types, one component, return-shape changes) plus the existing `bun:test` / `next build` gates already present in the repo.

## Validation Architecture

> nyquist_validation is not set to `false` in `.planning/config.json` (the file contains only `model_profile`), so this section is included (absent = enabled).

### Failure modes this phase must observably prevent
- **F1 (ADMINERR-01):** A list query throws → the list page must show the error state, NOT an empty list.
- **F2 (ADMINERR-02):** One widget query throws → that widget shows an error in its card; the OTHER widgets and the page still render (no whole-page blank, `Promise.all` does not reject).
- **F3 (ADMINERR-03):** `getQueueCounts` throws → stat cards show error/unknown, NOT a healthy all-zero queue.
- **F4 (ADMINERR-04):** `get*ById` throws → the detail page shows an error state, NOT a 404; a genuinely-missing row still 404s.
- **F5 (regression):** `next build` still passes with no `$~`/Neon-prerender errors (PPR placeholder path intact).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `bun:test` (bundled, Bun 1.3.x) + Playwright (e2e, not required here) |
| Config file | none for bun:test; `tests/setup.ts` auto-mocks `@/env` + `@/lib/logger` and runs `mock.restore()` per test |
| Quick run command | `bun test tests/unit/admin/<file>.test.ts` |
| Full suite command | `bun run test:unit` (= `bun test tests/`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMINERR-01 | each `list*ForAdmin` catch → `{ok:false,error:true}`; zero-rows → `ok` with empty `data.rows` | unit | `bun test tests/unit/admin/leads-queries.test.ts` (×6 files) | yes (update existing "DB error safety" cases in all 6) |
| ADMINERR-02 | each dashboard widget query catch → error variant; empty → ok-empty | unit | `bun test tests/unit/admin/dashboard-queries.test.ts` | NO — Wave 0 gap (no `dashboard-queries.test.ts` today) |
| ADMINERR-03 | `getQueueCounts` catch → error variant (not zero record) | unit | `bun test tests/unit/admin/emails-queries.test.ts` | yes (extend; file has a getQueueCounts sanity test today) |
| ADMINERR-04 | each `get*ById` returns found/not-found/error correctly | unit | `bun test tests/unit/admin/<file>.test.ts` (×7) | partial (files exist for 6 resources; add 3-way cases) |
| F5 build | `next build` green, no `$~`/prerender errors | smoke | `bun run build` | n/a (gate command, per CONTEXT §specifics) |

### Sampling Rate
- **Per task commit:** `bun run typecheck && bun test tests/unit/admin/<changed-file>.test.ts`
- **Per wave merge:** `bun run lint && bun run typecheck && bun run test:unit`
- **Phase gate:** `bun run lint && bun run typecheck && bun run test:unit && bun run build` (CONTEXT §specifics) green before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `tests/unit/admin/dashboard-queries.test.ts` — does NOT exist today; needed to cover ADMINERR-02 (5 widget queries × found-empty/error). Add the chainable-mock harness (copy from `leads-queries.test.ts`; note `getVisitorsByDay`/`getTopPages`/etc. use `.groupBy().orderBy().limit()` and `sql` exprs — the mock chain must include `groupBy`).
- [ ] Existing 6 list-query tests: their "returns empty result" assertions reference the literal `EMPTY_RESULT` shape — must be rewritten to assert `{ok:false,error:true}` (error) vs `ok` + empty `data` (empty).
- [ ] `get*ById` 3-way cases: add found/not-found/error to leads, calculator-leads, newsletter, showcase, testimonials, blog, emails query tests (7).
- [ ] No new framework install needed — `bun:test` already present.

## Security Domain

> `security_enforcement` is not present in `.planning/config.json`; absent = enabled. This phase has a narrow, low-sensitivity surface (admin-only, behind the Bearer/Better-Auth admin gate; no new inputs, no new endpoints).

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Unchanged — admin routes already gated (Better Auth / `src/lib/auth/admin.ts`). This phase adds no auth surface. |
| V3 Session Management | no | Unchanged. |
| V4 Access Control | no | Unchanged — all touched routes are under `(admin)/` already access-controlled. No new route. |
| V5 Input Validation | no | No new user input; `id` params already flow through existing loaders unchanged. |
| V6 Cryptography | no | None. |
| V7 Error Handling & Logging | yes | The error-state copy must NOT leak DB internals (use the generic "Something went wrong" message; never render the caught `error.message` to the operator UI). `logger.error` keeps the detail server-side only. [VERIFIED: matches CLAUDE.md "never expose internals"] |

### Known Threat Patterns for {Next.js 16 admin server components}
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Leaking DB error details into the rendered error state | Information disclosure | Generic user-facing copy; raw error only to `logger.error` (server). The proposed `AdminErrorState` takes a fixed `message`/`resource`, never the exception. |
| Error state masking a real outage as "normal" | Repudiation/availability | Exactly what this phase fixes — failures become visible to the operator. |

## Sources

### Primary (HIGH confidence)
- In-repo source (read in full this session): all 8 `src/lib/admin/*-queries.ts`; all 15 consumer pages under `src/app/(admin)/admin/**`; all 5 widgets under `src/components/admin/widgets/`; `src/components/ui/alert.tsx`; `src/components/admin/ResourceListPage.tsx`; `src/lib/admin/build-placeholder.ts`; `tests/unit/admin/leads-queries.test.ts`; `next.config.ts`; `components.json`; `package.json`; `tests/setup.ts`.
- nextjs.org/docs/app/api-reference/functions/not-found — `notFound()` throws `NEXT_HTTP_ERROR_FALLBACK;404`, terminates the segment render, no `return` required (TS `never`). Doc version 16.2.7, lastUpdated 2026-06-01. [CITED]

### Secondary (MEDIUM confidence)
- `.planning/v6-AUDIT-FINDINGS.md` (the admin silent-error-swallow finding, 25 functions) and `.planning/phases/13-admin-error-observability/13-CONTEXT.md` (locked decisions).

### Tertiary (LOW confidence)
- None. Context7 MCP tools were not exposed in this agent (known frontmatter-stripping bug) and the `ctx7` CLI is not installed; the one external claim (notFound semantics) was verified directly against official Next.js docs via WebFetch rather than left unverified.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps; all libs verified present in package.json.
- Architecture / consumer map: HIGH — every query function and every consumer read in full; map is exhaustive and line-referenced.
- Internal-caller hazard: HIGH — grep-verified all 6 internal `get*ById` callers.
- PPR/build pitfall: HIGH — root-cause documented in-repo (`build-placeholder.ts`) and notFound semantics confirmed against Next.js 16.2.7 docs.

**Research date:** 2026-06-02
**Valid until:** 2026-07-02 (stable; the only external surface is Next.js 16 server-component semantics, which are settled in 16.2.x). Re-verify the `cacheComponents` / PPR placeholder behavior if Next.js minor version changes before execution.
