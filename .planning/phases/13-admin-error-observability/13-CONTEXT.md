# Phase 13: admin-error-observability - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning
**Source:** Synthesized from `.planning/v6-AUDIT-FINDINGS.md` (the admin silent-error-swallow finding) + operator decision (v6: "full error states everywhere").

<domain>
## Phase Boundary

Make the admin surfaces distinguish a real DB failure from genuinely-empty data. Today every admin query catches DB errors and returns `[]` / `null` / all-zero counts, so on a real failure the operator sees an empty list, a healthy-looking zeroed queue, or — worst — a transient error on a detail page turns into a misleading 404 (`get*ById` returns `null` -> `notFound()`).

**Operator decision (LOCKED): full error states everywhere.** This SUPERSEDES the v4 locked decision ("each admin query wraps in try/catch and returns [] on failure"). Admin list pages, dashboard widgets, the `/admin/emails` queue-health counts, and detail pages must all distinguish "query failed" from "no data".

**Critical constraint — preserve v4 resilience:** the v4 intent was that one widget failing must NOT kill the whole page. Keep that. The fix is therefore NOT "throw everywhere" (a thrown query would take down the page via the route error boundary). The fix is to RETURN a discriminated result so each surface renders its OWN visible error state in place, independently. A failed dashboard widget shows an error in its own card; the other widgets still render.

**In scope:** the 25 query functions in `src/lib/admin/{blog,calculator-leads,dashboard,emails,leads,newsletter,showcase,testimonials}-queries.ts`, a shared result type + shared error-state UI primitive, and the admin pages/widgets that consume these queries (to render the new error state). ADMINERR-01..04.

**Out of scope:** changing what data the queries fetch; auth; the cursor-pagination logic itself (only its error path); any admin feature beyond error-vs-empty observability. The `delete*` mutation functions (which return `false` on error and are handled by the action layer) are NOT in this phase's 4 requirements — leave their contract unless trivially adjacent; the 4 ADMINERR reqs are read-path (list/widget/queue/detail).
</domain>

<decisions>
## Implementation Decisions (LOCKED)

### Error-signaling mechanism (the core pattern)
- Introduce a shared discriminated-union result, e.g. `AdminQueryResult<T> = { ok: true; data: T } | { ok: false; error: true }` (exact name/shape: research/planner's discretion, but it MUST let a consumer tell failure from a legitimately-empty success). Queries RETURN it; they do NOT throw (throwing would kill the page and break v4 resilience).
- A failed query's `catch` returns the `error` variant (still logging via `logger.error` as today — keep the logging). A successful-but-empty query returns the `ok` variant with empty data. These are now distinguishable.
- Single data seam stays: `src/lib/admin/*-queries.ts` is the only place pages/widgets read from (v4 decision, unchanged).

### List pages (ADMINERR-01)
- `list*ForAdmin` functions return the result type. The list pages render a visible error state (a shared error component) when `ok:false`, instead of silently showing the empty-list UI. The empty-list UI is reserved for genuine `ok:true` + zero rows.

### Dashboard widgets (ADMINERR-02)
- `dashboard-queries.ts` widget queries (`getVisitorsByDay`, `getTopPages`, `getTrafficSources`, `getRecentLeads`) return the result type. Each widget renders its own error state in its card on `ok:false`; a failing widget must NOT prevent the other widgets or the page from rendering (preserve v4 resilience).

### Queue-health counts (ADMINERR-03)
- `emails-queries.ts::getQueueCounts` no longer returns the all-zero record on error. On failure it returns the `error` variant so the `/admin/emails` stat cards show an error/unknown state instead of a falsely-healthy zeroed queue.

### Detail pages / get*ById (ADMINERR-04) — the misleading-404 fix
- `get*ById` functions distinguish three outcomes: FOUND (data), NOT-FOUND (no row — legitimately 404 via `notFound()`), and ERROR (DB failure). On ERROR the detail page must render an error state, NOT a 404. Concretely: the query returns a 3-way result (e.g. `{ status: 'found'; data } | { status: 'not-found' } | { status: 'error' }`), and the page calls `notFound()` only on `'not-found'` and renders the error state on `'error'`. A transient DB error must never present as "this record does not exist."

### Shared error-state UI
- Add ONE shared admin error-state component (mirror the existing empty-state pattern the pages/widgets already use). Reuse it across list pages, widgets, queue cards, and detail pages so the error UX is consistent. Survey `src/components/ui/` + existing admin empty-state components first (shadcn-first; do not hand-roll if a primitive fits).

### Claude's Discretion
- Exact names/shape of the result union(s) (two variants for list/widget/queue; three-way for get*ById) and where the type lives (a shared admin types module).
- The shared error component's exact API + copy (must be em/en-dash free, no emojis, accessible — `role="alert"` per the a11y conventions).
- Whether to also upgrade the `delete*` / mutation error contracts (NOT required by ADMINERR-01..04; only if trivially consistent and low-risk — otherwise defer).
- Plan/wave structure (likely: shared type + error component first, then per-resource query+page updates).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Decision source
- `.planning/v6-AUDIT-FINDINGS.md` — the admin silent-error-swallow finding (25 functions enumerated under "DECIDE").
- `.planning/STATE.md` / `.planning/ROADMAP.md` — the v6 decision that ADMINERR-01..04 SUPERSEDE the v4 "return [] on failure" lock.

### Query layer (the 8 files, ~25 functions)
- `src/lib/admin/leads-queries.ts` (`listLeadsForAdmin` -> EMPTY_RESULT; `getLeadById` -> null; `EMPTY_RESULT` const)
- `src/lib/admin/calculator-leads-queries.ts`, `src/lib/admin/newsletter-queries.ts`, `src/lib/admin/showcase-queries.ts`, `src/lib/admin/testimonials-queries.ts`, `src/lib/admin/blog-queries.ts` (same list + get*ById pattern)
- `src/lib/admin/dashboard-queries.ts` (`getVisitorsByDay`/`getTopPages`/`getTrafficSources`/`getRecentLeads` -> [])
- `src/lib/admin/emails-queries.ts` (`getQueueCounts` -> all-zero record; `listScheduledEmailsForAdmin`; `getScheduledEmailById`)

### Consumers (pages/widgets that render the result)
- `src/app/(admin)/admin/**` list pages + `[id]` detail pages + the dashboard widgets that call the above. Find them via the query import sites.
- Existing EMPTY-STATE components/pattern the pages already use (the analog for the new error state) — locate under `src/components/admin/` and `src/components/ui/`.

### Conventions
- `src/components/ui/` + shadcn registry + `components.json` (shadcn-first before any custom error component). `src/types/` for shared types. a11y: `role="alert"`, `aria-live`. CLAUDE.md: no `any`, server-first, no em/en-dash in user-facing copy.
</canonical_refs>

<specifics>
## Specific Ideas
- The win condition: on a forced DB error, a list shows "couldn't load" (not empty), a widget card shows an error (others still render), the queue cards show unknown (not a healthy zero), and a detail page shows an error state (not a 404). On genuine no-data, the existing empty states still show.
- A regression test per query that the `catch` path now yields the `error` variant (not `[]`/`null`/zeros), plus a get*ById test distinguishing not-found from error. Mock the db to throw.
- Gates: `bun run lint && bun run typecheck && bun run test:unit && bun run build`. This touches many server components — `build` must pass (PPR/cacheComponents).
</specifics>

<deferred>
## Deferred Ideas
- Upgrading the `delete*` mutation error contracts to the same discriminated result (out of the 4 ADMINERR reqs; revisit if desired later).
- A global admin error-monitoring/telemetry surface.
</deferred>

---
*Phase: 13-admin-error-observability*
*Context gathered: 2026-06-02, synthesized from the v6 admin-error finding + operator decision (full error states everywhere, superseding the v4 lock)*
