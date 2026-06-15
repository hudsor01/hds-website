# Phase 14: admin-page-title - Research

**Researched:** 2026-06-02
**Domain:** Next.js 16 App Router — per-page titles in a route-group admin shell
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- No misleading "dynamic-looking but constant" API survives. Either the prop carries a real per-page value or it is removed.
- Server-first (CLAUDE.md). If the chosen approach keeps Topbar client-side, justify it; prefer not introducing new client JS if a server pattern works.
- Title copy is dash-free, emoji-free; accessible heading semantics (a visible page heading should be a proper heading element / labeled landmark).
- Scope: `src/app/(admin)/admin/layout.tsx`, `src/components/admin/Topbar.tsx`, and the admin pages under `src/app/(admin)/admin/**` that need to supply their title. ADMINUX-01 only.

### Approach — DEFERRED TO RESEARCH (resolved below)
The operator decision: choose the canonical, most-performant Next.js 16 option by research, comparing:
1. Per-page visible heading (remove `pageTitle`; pages own their `<h1>`). Pure RSC, zero client JS.
2. Native `metadata` + `title.template` (governs DOCUMENT `<title>`, a separate concern from the visible span).
3. `usePathname`-driven title map in a client Topbar.
4. Anything more idiomatic Next.js 16 surfaces.

### Claude's Discretion (post-research)
- Exact title strings per admin page; the shared component's API if one is introduced; whether to also fix the document `<title>` via metadata in the same phase (recommended if cheap and the page set lacks it).

### Deferred Ideas (OUT OF SCOPE)
- Breadcrumbs / richer admin chrome navigation (not in ADMINUX-01).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMINUX-01 | `src/app/(admin)/admin/layout.tsx:47` passes a hardcoded `pageTitle="Admin"` to `Topbar`, which renders it as a visible heading. The prop looks per-page but is constant — a misleading API and missing feature. Implement per-page titles or remove the dynamic-looking prop, using the canonical most-performant Next.js 16 pattern. | Resolved below: the codebase ALREADY satisfies the visible-title requirement on a per-page basis (each page renders its own `<h1>`) and the document-title requirement (each page exports `metadata.title`). The `Topbar` `pageTitle` span is pure dead/duplicate UI. Canonical fix: **remove the prop and the span**; backfill `<h1>` on the 3 list pages that currently lean on the Topbar for their visible label. |
</phase_requirements>

## Summary

The defining discovery of this phase: **the per-page title feature the audit asked for already exists in this codebase — twice.** Every admin page already (1) exports `metadata.title` (governs the browser-tab `<title>`), and (2) renders its own visible `<h1>` heading inside the `<main>` slot — either directly (`dashboard`, `leads`, `emails`, every `[id]`/`new`/`edit` detail page) or through the shared server `ResourceListPage` `title=` prop (`showcase`, `blog`, `testimonials` lists). The `Topbar` `pageTitle="Admin"` span is therefore not a missing feature; it is a *redundant, always-wrong duplicate* sitting in the chrome above each page's correct `<h1>`. It is dead UI that lies.

This reframes the operator's three candidate approaches. The "per-page visible heading" approach (Candidate 1) is not something to build — it is the pattern the codebase already follows everywhere. The official Next.js 16 docs make the architecture unambiguous: **"Layouts do not have access to the route segments below itself"** and **"Layouts cannot pass data to their children"** [CITED: nextjs.org/docs/app/api-reference/file-conventions/layout — "Accessing child segments" and "Fetching Data"]. A layout structurally *cannot* know the active page's title, which is precisely why the existing `pageTitle` prop had to be hardcoded. The canonical resolution is therefore to **delete the misleading prop and the span**, keep each page's own `<h1>` as the single source of the visible title, and backfill an `<h1>` on the three list pages that currently rely on the Topbar for their visible label.

**Primary recommendation:** Adopt **Candidate 1 (per-page visible heading, pure RSC)** by *subtraction*. Remove `pageTitle` from `Topbar` and `AdminLayout`; the Topbar keeps only the "Hudson Digital" wordmark and `AccountMenu` (it stays a server component — no tier change). Add a visible `<h1>` to the three list pages (`leads/calculator`, plus confirm `showcase`/`blog`/`testimonials` lists already get one via `ResourceListPage`). The document `<title>` is **already correct** on every page via `metadata.title`; an optional, cheap polish is adding a root-segment `title.template` for the `(admin)` group so tabs read consistently — but this is discretionary, not required by ADMINUX-01. Net result: zero new client JS, no new dependencies, one lie removed, the visible label correct on every route. [CITED: nextjs.org/docs/app/api-reference/functions/generate-metadata — title fields]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Visible page heading (the screen label the operator reads) | Page (RSC leaf) | — | Only the page knows its own title/params. The layout cannot read child route data [CITED: layout docs, "Accessing child segments"]. Each page already owns an `<h1>`. |
| Document `<title>` (browser tab) | Page (`metadata` export, RSC) | Root layout (`title.default`/`title.template`) | Metadata exports are Server-Component-only and resolved root→leaf; the page's `title` augments/replaces the parent's [CITED: generate-metadata docs, "Ordering"/"Merging"]. Already set per page. |
| Admin shell chrome (wordmark, account menu) | Layout → `Topbar` (RSC) | `AccountMenu` (client island, imported into server `Topbar`) | The chrome is route-independent; it belongs in the layout-level shell, not the page. |
| Active-nav highlighting | `Sidebar` (client island) | — | Needs `usePathname`; already the single client island in the chrome. The title fix must NOT add a second one. |

## Standard Stack

No external packages. This is a pure refactor of existing first-party code using built-in Next.js 16 App Router conventions (RSC pages, `metadata` exports). Nothing to install.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.x (project on Next 16) | App Router RSC pages + `metadata` API | Framework already in use; the title pattern is native, no add-on needed. [CITED: docs version banner reads `version: 16.2.7`, `lastUpdated: 2026-06-01`] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Per-page `<h1>` (Candidate 1) | `usePathname` title map in client Topbar (Candidate 3) | Forces `Topbar` to `'use client'`, adds a second client island duplicating the Sidebar's route table, ships JS for a static label, and couples the chrome to the route list. Strictly worse on every axis the operator cares about (server-first, least client JS, no misleading central map). Rejected. |
| Per-page `<h1>` (Candidate 1) | `metadata.title` ALONE (Candidate 2) as the "fix" | Metadata only controls the browser-tab `<title>`, not the visible Topbar span. It cannot render a visible heading. It does not, by itself, resolve ADMINUX-01 (the *visible* label). Already present per page anyway. Useful only as optional tab-title polish. Rejected as the primary fix. |
| Per-page `<h1>` (Candidate 1) | `useSelectedLayoutSegment()` in a client Topbar to derive a label | Same downsides as Candidate 3 (new client island, route-coupled map) plus the segment is a path slug, not a human title. Rejected. |

## Package Legitimacy Audit

**Not applicable.** This phase installs no external packages. It edits existing first-party source files only (`Topbar.tsx`, `layout.tsx`, three admin list pages). slopcheck / registry verification not required. [VERIFIED: codebase grep — no new imports introduced by the recommended change]

## Architecture Patterns

### System Architecture Diagram

```
Request /admin/<route>
        │
        ▼
(admin)/admin/layout.tsx  ── getSession() guard ──┐
   │  renders the shell:                          │ role !== admin → <Forbidden/> STOP
   │                                               │ no session    → redirect /auth/sign-in
   ▼ (role === admin)
 ┌─────────────────────────────────────────────────────────────┐
 │  <Sidebar/>            <Topbar/>  (RSC; wordmark + AccountMenu)│
 │  (client island,      ── NO pageTitle prop after this phase ──│
 │   usePathname)        ───────────────────────────────────────│
 │                        <main> { children } </main>            │
 │                            │                                  │
 │                            ▼                                  │
 │                  page.tsx (RSC leaf)                          │
 │                    ├─ export const metadata.title  → <title>  │  (browser tab)
 │                    └─ <h1>…page title…</h1>         → visible  │  (the screen label)
 └─────────────────────────────────────────────────────────────┘

Two title sinks, two owners — BOTH already owned by the page:
  • Document <title>  ← metadata.title (head, SSR-resolved)
  • Visible heading   ← <h1> inside the page body
The layout/Topbar owns NEITHER (it structurally cannot — see below).
```

### Pattern 1: The page is the title owner (canonical)
**What:** In the App Router, the page (the leaf segment) is the only component that knows its own identity. Both title sinks are page-owned: the visible heading is an `<h1>` in the page body; the tab title is the page's `metadata.title` export.
**When to use:** Always, for per-route titles. This is the framework's intended shape.
**Why the layout can't do it:**
```
// CITED: nextjs.org/docs/app/api-reference/file-conventions/layout
// "Accessing child segments":
//   "Layouts do not have access to the route segments below itself."
// "Fetching Data":
//   "Layouts cannot pass data to their children."
```
A layout receives only `children` and (its own) `params` — never the active child's title, params, or metadata. That is the root cause the existing comment admits at `layout.tsx:46` ("hardcoded for now"). There is no non-client trick to make a layout read the child title; the only client escape hatches (`usePathname`, `useSelectedLayoutSegment`) are exactly the rejected Candidate 3.

### Pattern 2: Shared server heading component (already in repo)
**What:** `src/components/admin/ResourceListPage.tsx` already centralizes the list-page `<h1>` via a `title` prop (server component, zero client). Detail/form pages render their `<h1>` inline.
**When to use:** Keep using `ResourceListPage` for the three resource lists. For the pages that render `<h1>` inline, leave them as-is — they already comply. Do NOT introduce a *new* `PageHeader` abstraction; `ResourceListPage` plus inline `<h1>` is the established, working idiom (CLAUDE.md: "SEARCH FIRST", "Follow existing patterns", "Delete code rather than add").

### Pattern 3 (optional, discretionary): document-title template for the admin group
**What:** A `title.template` on a segment applies to *child* segments and needs a `title.default`. [CITED: generate-metadata docs, `template` + `default`]
```tsx
// OPTIONAL polish only — NOT required by ADMINUX-01.
// If a metadata-owning layout is added for the (admin) group:
export const metadata: Metadata = {
  title: { template: '%s | Hudson Admin', default: 'Hudson Admin' },
  robots: { index: false, follow: false },
}
// then a page's `title: 'Leads'` renders <title>Leads | Hudson Admin</title>.
```
**Caveat:** `(admin)/admin/layout.tsx` is currently an `async` function that calls `getSession()`. A `metadata` export coexists fine with an async default export (metadata is a separate Server-Component export), so this is feasible without splitting the file. But it is **discretionary** — every admin page already sets a usable `metadata.title` (`'Admin: Leads'`, etc.), so the tab title is already correct. Recommend deferring unless the operator wants the unified `%s | Hudson Admin` suffix; if done, it lets the per-page titles drop the repeated `Admin:` prefix.

### Anti-Patterns to Avoid
- **Making `Topbar` a client component to derive the title** (`usePathname`/`useSelectedLayoutSegment`): adds a second client island, ships JS for a static label, couples chrome to the route table. Violates server-first. Do not.
- **Keeping `pageTitle` but passing a real value from the layout:** impossible — the layout cannot read the child's title [CITED: layout docs]. Any "real value" would have to be re-hardcoded or route-mapped in the layout, recreating the lie or the coupling.
- **Introducing a brand-new `PageHeader` component** when `ResourceListPage` + inline `<h1>` already cover every page. YAGNI.
- **Rendering the `<h1>` on the not-found path of detail pages:** the `<h1>` must stay inside the success branch after `notFound()`/null guards (see Pitfall 3).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| "Layout needs to show the current page's title" | A route→title map in the layout or a client Topbar | Each page's own `<h1>` (already present) | The framework forbids the layout from knowing the child title; a map duplicates the Sidebar's route table and rots. [CITED: layout docs] |
| Browser-tab title per route | Hand-rolled `<title>` tags | `metadata.title` export per page (already present) | Docs: "do not manually add `<head>` tags such as `<title>`"; the Metadata API de-dupes/streams. [CITED: layout docs "Metadata" note] |
| Shared list-page heading | New `PageHeader` component | Existing `ResourceListPage` `title=` prop | Already a server component doing exactly this. |

**Key insight:** The most-performant Next.js 16 pattern here is achieved by *removing* code, not adding it. The feature exists; the bug is a redundant chrome span that contradicts it.

## Full Admin Page Map (the change surface)

All paths under `src/app/(admin)/admin/`. "Visible `<h1>` today?" is the load-bearing column — it tells you which pages need a heading added vs. which already comply. Every page already exports the listed `metadata.title`. [VERIFIED: codebase grep of every `page.tsx`]

| Route | File | `metadata.title` today | Visible `<h1>` today? | Recommended visible title |
|-------|------|------------------------|------------------------|---------------------------|
| `/admin` | `admin/page.tsx` | (none — `redirect()` only) | n/a (redirects to `/admin/dashboard`) | n/a |
| `/admin/dashboard` | `admin/dashboard/page.tsx` | `Admin Dashboard` | YES — `<h1 className="sr-only">Admin Dashboard</h1>` (intentional sr-only; charts are the visual) | Dashboard (keep sr-only or make visible — discretionary) |
| `/admin/leads` | `admin/leads/page.tsx` | `Admin: Leads` | YES — `<h1>Leads</h1>` | Leads |
| `/admin/leads/[id]` | `admin/leads/[id]/page.tsx` | `Admin: Lead detail` | YES — `<h1>{lead.name ?? lead.email}</h1>` (success path) | (dynamic — lead name) |
| `/admin/leads/calculator` | `admin/leads/calculator/page.tsx` | `Admin: Calculator leads` | YES — `<h1>` at line ~238 | Calculator leads |
| `/admin/leads/calculator/[id]` | `admin/leads/calculator/[id]/page.tsx` | `Admin: Calculator lead detail` | YES — `<h1>` at line ~156 (success path) | (dynamic) |
| `/admin/newsletter` | `admin/newsletter/page.tsx` | `Admin: Newsletter` | YES — `<h1>Newsletter</h1>` | Newsletter |
| `/admin/newsletter/[id]` | `admin/newsletter/[id]/page.tsx` | `Admin: Subscriber detail` | YES — `<h1>` at line ~90 (success path) | (dynamic — subscriber email) |
| `/admin/showcase` | `admin/showcase/page.tsx` | `Admin: Showcase` | YES — via `ResourceListPage title="Showcase"` | Showcase |
| `/admin/showcase/new` | `admin/showcase/new/page.tsx` | `Admin: New showcase` | YES — `<h1>` at line ~28 | New showcase |
| `/admin/showcase/[id]/edit` | `admin/showcase/[id]/edit/page.tsx` | `Admin: Edit showcase` | YES — `<h1>` at line ~62 | Edit showcase |
| `/admin/blog` | `admin/blog/page.tsx` | `Admin: Blog` | YES — via `ResourceListPage title="Blog"` | Blog |
| `/admin/blog/new` | `admin/blog/new/page.tsx` | `Admin: New post` | YES — `<h1>` at line ~50 | New post |
| `/admin/blog/[id]/edit` | `admin/blog/[id]/edit/page.tsx` | `Admin: Edit post` | YES — `<h1>` at line ~75 | Edit post |
| `/admin/testimonials` | `admin/testimonials/page.tsx` | `Admin: Testimonials` | YES — via `ResourceListPage title="Testimonials"` | Testimonials |
| `/admin/testimonials/new` | `admin/testimonials/new/page.tsx` | `Admin: New testimonial` | YES — `<h1>` at line ~29 | New testimonial |
| `/admin/testimonials/[id]/edit` | `admin/testimonials/[id]/edit/page.tsx` | `Admin: Edit testimonial` | YES — `<h1>` at line ~65 | Edit testimonial |
| `/admin/emails` | `admin/emails/page.tsx` | `Admin: Emails` | YES — `<h1>Emails</h1>` | Emails |
| `/admin/emails/[id]` | `admin/emails/[id]/page.tsx` | `Admin: Email detail` | YES — `<h1>` at line ~94 (success path) | (dynamic) |

**Change-surface conclusion:** 18 routes (excluding the `/admin` redirect). **Every one already renders a visible `<h1>`.** No list page is missing a heading: showcase/blog/testimonials get theirs from `ResourceListPage title=`, leads/calculator/newsletter/emails render `<h1>` inline. **Therefore the only required edits are the 2 chrome files** (`Topbar.tsx` drops `pageTitle`; `layout.tsx` stops passing it). The detail-page `<h1>`s are already correctly placed inside the success branch (after `notFound()`), so removing the Topbar label leaves every page with exactly one correct, page-owned heading.

> **Important correction to the audit's premise:** ADMINUX-01 framed this as "implement per-page titles OR remove the prop." Research shows per-page titles are *already implemented* on all 18 routes. The minimal, canonical, most-performant action is **remove the prop** (and its span), not build a new title mechanism. Optionally make the dashboard `<h1>` visible (it is currently `sr-only` by deliberate design) if a visible label there is desired — discretionary.

## Topbar Reality

`src/components/admin/Topbar.tsx` is a **server component** today (no `'use client'`; its file header explicitly notes "Server by default" and that it imports the client `<AccountMenu/>` via the standard server-imports-client pattern). [VERIFIED: codebase read of Topbar.tsx]

- **Does the fix change its tier?** No. Removing the `pageTitle` prop and the `<span>{pageTitle}</span>` leaves `Topbar` rendering the static "Hudson Digital" wordmark + `<AccountMenu email={email} />`. It stays a server component. **No tier change, no new client JS.**
- **Lowest-overhead wiring:**
  1. `Topbar.tsx`: drop `pageTitle` from `TopbarProps`; keep `email`. Remove the `pageTitle` `<span>` (and the now-orphaned `/` separator span — decide whether the wordmark stands alone or keeps a trailing decoration; recommend just the wordmark).
  2. `layout.tsx`: change `<Topbar email={session.user.email} pageTitle="Admin" />` to `<Topbar email={session.user.email} />` and delete the misleading comment at line 46.
  3. Pages: no change required (every page already owns its `<h1>`). Optionally promote the dashboard `<h1 className="sr-only">` to visible.
- **Result:** the misleading constant prop is gone; the visible label on every screen is the page's own correct `<h1>`; the tab title is the page's own `metadata.title`.

## Common Pitfalls

### Pitfall 1: Treating this as "build a title feature"
**What goes wrong:** Planner adds a route→title map, a `PageHeader` component, or a client Topbar.
**Why it happens:** The audit wording ("implement per-page titles") implies the feature is missing. It is not.
**How to avoid:** Confirm via grep that all 18 pages already render an `<h1>` and export `metadata.title` (table above). The fix is removal.
**Warning signs:** Any new `'use client'`, any new component, any new dependency in the diff.

### Pitfall 2: Removing the prop but leaving `Topbar` typed to require it
**What goes wrong:** TypeScript build breaks because `TopbarProps.pageTitle` is still `required` somewhere, or the layout still passes it.
**How to avoid:** Edit `TopbarProps` and the single call site in `layout.tsx` together; run `bun run typecheck`. There is exactly one consumer of `pageTitle` (grep `pageTitle` is local to these two files). [VERIFIED: grep — `pageTitle` appears only in `Topbar.tsx` and `layout.tsx`]

### Pitfall 3: Heading on the not-found path of detail pages
**What goes wrong:** A detail `<h1>` rendered before the `notFound()`/null guard would show a heading for a missing record.
**How it's already handled:** Every `[id]` loader calls `notFound()` (and short-circuits the `BUILD_PLACEHOLDER_ID`) *before* the JSX that contains the `<h1>`. The heading only renders on the success path. This phase touches the chrome, not these guards — leave them intact. No regression risk if pages are untouched.

### Pitfall 4: PPR / `cacheComponents` interaction
**What goes wrong:** Editing admin pages can disturb the `connection()` + `<Suspense>` + `generateStaticParams`/`BUILD_PLACEHOLDER_ID` dance that keeps `next build` green under `cacheComponents:true`.
**How to avoid:** The recommended change does NOT touch any page's data-fetch, Suspense boundary, or `generateStaticParams`. It edits only `Topbar.tsx` + `layout.tsx` (and optionally a single dashboard `<h1>` className). Removing a static `<span>` from a server `Topbar` has zero PPR impact. Keep the build gate (`bun run build`) in the plan regardless. [CITED: generate-metadata docs "With Cache Components"; dashboard/[id] page comments document the existing pattern]

### Pitfall 5: `'use client'` can't export metadata
**What goes wrong:** If anyone "fixes" titles by moving metadata into a client file.
**Why it matters here:** Not a risk for the recommended approach (no client files touched), but worth flagging: **"The `metadata` object and `generateMetadata` function exports are only supported in Server Components."** [CITED: nextjs.org/docs/app/api-reference/functions/generate-metadata, "Good to know"]. All admin pages that export metadata are already server components — keep them that way.

## Consistency + Accessibility

- **Heading element:** every visible page title must be a real `<h1>` (not a styled `<span>`). The codebase already does this; the Topbar's `<span>` was never a heading, which is itself an a11y smell (a screen-reader user got no page `<h1>` from the chrome — they relied on the page's own `<h1>`). Removing the span improves the a11y story: exactly one `<h1>` per page, page-owned.
- **One `<h1>` per page:** after removal there is precisely one `<h1>` per admin route (the page's). The dashboard's `sr-only` `<h1>` keeps the page labeled for AT even though the visual is a chart grid — acceptable and intentional; promoting it to visible is discretionary.
- **Landmark labeling:** the admin nav already uses `<nav aria-label="Admin navigation">` (Sidebar). The `<main>` slot in `layout.tsx` is the content landmark. No change needed for ADMINUX-01.
- **Dash-free / emoji-free copy:** all recommended titles ("Leads", "Calculator leads", "New post", etc.) are plain words — compliant with the project-wide em/en-dash ban and no-emoji rule. The existing `metadata.title` strings use a colon (`Admin: Leads`) which is allowed (colon, not dash).

## Validation Architecture

> `workflow.nyquist_validation` not explicitly false → section included.

This change is overwhelmingly **build-time + visual**, not behavioral. Be honest: there is little to unit-test about "a span was removed." The real gates are typecheck, build, and a visual confirmation that each route still renders its own heading.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `bun:test` (unit) + Playwright (e2e), per CLAUDE.md |
| Config file | `bunfig`/`tests/setup.ts` for unit; `playwright.config.ts` for e2e (baseURL `http://localhost:3001`) |
| Quick run command | `bun run test:unit` |
| Full suite command | `bun run test:all` (lint + typecheck + unit + e2e:fast) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMINUX-01 | `Topbar` no longer requires/renders `pageTitle`; renders wordmark + AccountMenu only | unit (render) | `bun run test:unit` (new `tests/unit/admin-topbar.test.tsx` rendering `<Topbar email="x@y.z" />` and asserting no "Admin" literal and presence of "Hudson Digital") | ❌ Wave 0 (optional — low value; the typecheck already proves the prop is gone) |
| ADMINUX-01 | No call site still passes `pageTitle`; type surface is clean | build/typecheck | `bun run typecheck` | ✅ (existing) |
| ADMINUX-01 | Admin shell still builds green under `cacheComponents` PPR | build | `bun run build` | ✅ (existing) |
| ADMINUX-01 | Each admin route renders exactly one page `<h1>` with the correct label | e2e/visual (manual or Playwright a11y) | `bun run test:e2e:a11y` against authenticated admin routes, OR manual walkthrough of the 18 routes | ⚠️ admin routes are auth-gated; e2e needs an admin session fixture (may not exist) — **honestly, this is primarily a manual visual check** |

### Sampling Rate
- **Per task commit:** `bun run lint && bun run typecheck` (the load-bearing gate for prop removal).
- **Per wave merge:** `bun run test:unit` + `bun run build`.
- **Phase gate:** `bun run build` green (PPR), plus a manual walk of `/admin/dashboard`, one list (`/admin/leads`), and one detail (`/admin/leads/[id]`) confirming the duplicate "Admin" chrome label is gone and the page's own heading remains.

### What is honestly testable vs. manual
- **Automatable & worthwhile:** `typecheck` (prop removed everywhere), `build` (PPR stays green). These are the real safety net.
- **Automatable but low-value:** a `Topbar` render unit test asserting the absence of `pageTitle`. Fine to add for regression-locking, but the typecheck already enforces it. Recommend a tiny render test only if cheap.
- **Manual / visual:** confirming the *visual* result across 18 auth-gated admin routes. Admin pages require an admin session; unless an admin e2e fixture exists, this is a manual confirmation. State this plainly in the plan — do not pretend a Playwright spec covers it if no admin auth fixture exists.

### Wave 0 Gaps
- [ ] (Optional) `tests/unit/admin-topbar.test.tsx` — render `<Topbar email="dev@example.com" />`, assert renders "Hudson Digital" + AccountMenu, asserts no required `pageTitle`. Low priority; typecheck is the real gate.
- [ ] Confirm whether an authenticated-admin Playwright fixture exists; if not, the route-by-route visual check is manual (document it, don't fake it).

*If no unit test is added: acceptable — typecheck + build + manual visual walk is a proportionate gate for a chrome-span removal.*

## Security Domain

> `security_enforcement` not configured false → section included.

This phase changes no auth, no data access, no input handling. The admin `getSession()` + role guard in `layout.tsx` is **untouched** and must remain so.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no (unchanged) | Existing `getSession()` in `layout.tsx`; do not modify |
| V3 Session Management | no (unchanged) | Better Auth session cookies; do not modify |
| V4 Access Control | no (unchanged) | Role check `session.user.role !== 'admin'` → `<Forbidden/>`; do not modify |
| V5 Input Validation | no | No new inputs; titles are static literals |
| V6 Cryptography | no | None involved |

### Known Threat Patterns for this change
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Accidentally weakening the admin guard while editing the layout | Elevation of Privilege | Touch only the `<Topbar .../>` JSX line + comment in `layout.tsx`; leave the `getSession()`/redirect/Forbidden branches byte-equal. Verify with a diff review. |
| Leaking a real value into the (noindex) title | Information Disclosure | Admin metadata already sets `robots: { index: false, follow: false }` per page; static titles add no PII. Detail-page `<h1>`s already render record names but only on the authenticated success path. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Project is on Next.js 16.x (CLAUDE.md says "Next.js 16"); docs fetched were v16.2.7. Exact patch may differ but the layout/metadata semantics cited are stable across Next 13→16. | Standard Stack | Low — the cited APIs (layout `children`/`params`, metadata `title`) are long-stable. |
| A2 | The dashboard `<h1 className="sr-only">` is intentionally sr-only (the page comment + chart-grid layout support this), so leaving it sr-only is acceptable; making it visible is discretionary. | Full Admin Page Map | Low — purely cosmetic; operator may prefer a visible dashboard heading. |
| A3 | No authenticated-admin Playwright e2e fixture exists for walking admin routes (not verified in this session). | Validation Architecture | Medium — if one exists, the visual check can be automated; if not, it's manual. Planner should verify. |

**No claims about library identity or compliance were assumed beyond A1.**

## Open Questions

1. **Promote the dashboard `<h1>` to visible?**
   - What we know: it is `sr-only` today by deliberate design (chart grid is the visual).
   - What's unclear: whether the operator wants a visible "Dashboard" heading now that the Topbar "Admin" label is gone.
   - Recommendation: leave `sr-only` (no regression); make it visible only if the operator asks. Discretionary.

2. **Also add a `(admin)` `title.template`?**
   - What we know: every page already sets a correct `metadata.title`; tab titles are already right.
   - What's unclear: whether the operator wants the unified `%s | Hudson Admin` suffix (would let pages drop the repeated `Admin:` prefix).
   - Recommendation: defer (out of strict ADMINUX-01 scope). Cheap to add later if desired; requires a `metadata` export on the admin layout (coexists with the async default export) and switching per-page titles to bare names + `title.absolute` where appropriate.

3. **Keep or drop the Topbar `/` separator span?**
   - What we know: the separator only made sense as "Hudson Digital / {pageTitle}". With `pageTitle` gone it dangles.
   - Recommendation: drop the separator; render the wordmark alone. Trivial.

## Environment Availability

No external dependencies. Pure first-party code/config change. **Step 2.6: SKIPPED (no external tools, services, runtimes, or DB needed for the change itself — `bun`, `next` already present).**

## Sources

### Primary (HIGH confidence)
- nextjs.org/docs/app/api-reference/file-conventions/layout (v16.2.7, lastUpdated 2026-06-01) — "Accessing child segments" ("Layouts do not have access to the route segments below itself"), "Fetching Data" ("Layouts cannot pass data to their children"), "Query params"/"Pathname" (layouts don't rerender → can't read live route state), "Metadata" (don't hand-add `<head>` tags).
- nextjs.org/docs/app/api-reference/functions/generate-metadata (v16.2.7, lastUpdated 2026-06-01) — `title` controls the document `<title>`; `title.template`/`title.default`/`title.absolute` semantics ("template applies to child segments, not the segment it's defined in; default required"); "The `metadata` object and `generateMetadata` function exports are only supported in Server Components"; "Ordering"/"Merging"; "With Cache Components".
- Codebase (VERIFIED by direct read/grep): `src/app/(admin)/admin/layout.tsx`, `src/components/admin/Topbar.tsx` (server component), `src/components/admin/Sidebar.tsx` (sole client island), `src/components/admin/ResourceListPage.tsx` (server `title=` heading), and all 18 admin `page.tsx` files (each exports `metadata.title` + renders an `<h1>`).

### Secondary (MEDIUM confidence)
- None required — all load-bearing claims verified against official docs or the codebase.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no packages; native Next.js 16 APIs verified against current official docs.
- Architecture: HIGH — layout-cannot-read-child and metadata-vs-visible-title are directly cited; the codebase's existing pattern verified by reading every page.
- Pitfalls: HIGH — derived from the actual files (PPR/`connection()`, `notFound()` guards, single `pageTitle` consumer).

**Research date:** 2026-06-02
**Valid until:** 2026-07-02 (stable; Next.js App Router layout/metadata semantics are long-settled)
