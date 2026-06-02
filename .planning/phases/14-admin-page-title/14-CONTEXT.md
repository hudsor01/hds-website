# Phase 14: admin-page-title - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning (RESEARCH-REQUIRED — the approach is decided by research, not pre-locked)
**Source:** Synthesized from `.planning/v6-AUDIT-FINDINGS.md` (ADMINUX-01) + the v6 operator decision ("resolve canonically using the most-performant Next.js 16 approach, chosen by research").

<domain>
## Phase Boundary

The admin route-group layout (`src/app/(admin)/admin/layout.tsx:47`) renders `<Topbar email={...} pageTitle="Admin" />` with `pageTitle` HARDCODED to the literal "Admin" for every admin route. The comment admits it: `// pageTitle: per-page titles arrive in a later phase; hardcoded for now.` `Topbar` (`src/components/admin/Topbar.tsx`) consumes `pageTitle` and renders it as a visible `<span>` heading. So the prop LOOKS dynamic/per-page but is a constant — a misleading API and a missing feature.

This phase resolves ADMINUX-01: make the admin page title correct, using the **canonical, most-performant Next.js 16 approach** (operator decision: the specific approach is to be DETERMINED BY RESEARCH, not assumed). Either give each admin page a real title or remove the dynamic-looking prop — whichever the research shows is the idiomatic, lowest-overhead Next.js 16 pattern.

**The core technical constraint (research must resolve around it):** in the Next.js App Router, a LAYOUT does not receive the active child route or its params/metadata as props, so a layout cannot directly read "the current page's title." Any solution must account for this: e.g. each PAGE owns its visible heading (RSC, zero client), OR native `metadata`/`title` template drives the document `<title>` (a separate concern from the visible topbar label), OR a `usePathname`-driven title map in the (client) Topbar, OR another idiom. Research picks the most-performant canonical one and notes the tradeoffs.

**In scope:** `src/app/(admin)/admin/layout.tsx`, `src/components/admin/Topbar.tsx`, and the admin pages under `src/app/(admin)/admin/**` that need to supply their title (per whichever pattern research selects). ADMINUX-01 only.

**Out of scope:** redesigning the admin shell/Topbar layout; non-admin titles; any other admin feature.
</domain>

<decisions>
## Implementation Decisions

### Approach — DEFERRED TO RESEARCH (the defining decision of this phase)
- The operator decision is explicit: choose the approach by researching the **canonical, most-performant Next.js 16** option. Do NOT pre-commit. The researcher must compare the realistic options against official Next.js 16 docs (use context7) and recommend one with rationale + the perf/SSR/client tradeoffs:
  1. **Per-page visible heading** — remove `pageTitle` from the layout/Topbar; each page (or a shared server `PageHeader`/`AdminPageHeading` component) renders its own title. Pure RSC, zero client JS, no layout-knows-child problem. Likely the most performant.
  2. **Native `metadata` + title template** — each admin page exports `metadata.title`; root/segment layout sets a `title.template`. This governs the DOCUMENT `<title>` (browser tab), which is a DIFFERENT concern from the visible Topbar span — research must be explicit about whether this solves the visible heading or only the tab title (and whether both should be done).
  3. **`usePathname`-driven title map in Topbar** — Topbar becomes/stays a client component deriving the label from the route. Runtime cost; centralizes the map; couples Topbar to the route table.
  4. Anything more idiomatic in Next.js 16 that research surfaces.
- Whatever is chosen must: kill the misleading constant prop, be applied consistently across all admin pages, and be the lowest-overhead canonical option (server-first preferred per CLAUDE.md).

### Locked regardless of approach
- No misleading "dynamic-looking but constant" API survives. Either the prop carries a real per-page value or it is removed.
- Server-first (CLAUDE.md). If the chosen approach keeps Topbar client-side, justify it; prefer not introducing new client JS if a server pattern works.
- Title copy is dash-free, emoji-free; accessible heading semantics (a visible page heading should be a proper heading element / labeled landmark, per the a11y conventions).

### Claude's Discretion (post-research)
- Exact title strings per admin page; the shared component's API if one is introduced; whether to also fix the document `<title>` via metadata in the same phase (recommended if cheap and the page set already lacks it).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Decision source
- `.planning/v6-AUDIT-FINDINGS.md` — ADMINUX-01 (hardcoded pageTitle).
- `.planning/REQUIREMENTS.md` — ADMINUX-01.

### Code under change / context
- `src/app/(admin)/admin/layout.tsx` — the `<Topbar ... pageTitle="Admin" />` call (line ~47) + the admitting comment.
- `src/components/admin/Topbar.tsx` — consumes `pageTitle` as a visible `<span>` heading (line ~18-28); note whether it is currently a server or client component.
- `src/app/(admin)/admin/**` — the full admin page set (dashboard, leads, leads/calculator, newsletter, showcase, blog, testimonials, emails + their `[id]` pages) that must each supply a title under the chosen pattern. Research must enumerate them.
- Existing metadata patterns: how public pages set `metadata`/`title` (e.g. `src/app/(public)/**/page.tsx`, `seo-utils.ts`) — the canonical metadata idiom already in this repo.

### Conventions
- CLAUDE.md: server-first; `'use client'` pages cannot export `metadata`; metadata description 120-160 chars for SEO (less relevant for admin/noindex, but the title pattern matters); no em/en-dash / emoji in user-facing copy; a11y heading semantics; shadcn-first if a shared heading component is introduced.
</canonical_refs>

<specifics>
## Specific Ideas
- Win condition: every admin page shows its correct title (no universal "Admin"), via the idiomatic Next.js 16 pattern with the least runtime/client overhead; the misleading constant prop is gone.
- Gates: `bun run lint && bun run typecheck && bun run test:unit && bun run build`. If a shared heading component is added, a small render test; the build must stay green (admin routes PPR).
- This touches the live admin shell — verify the Topbar/layout still render for every admin route after the change.
</specifics>

<deferred>
## Deferred Ideas
- Breadcrumbs / richer admin chrome navigation (not in ADMINUX-01).
</deferred>

---
*Phase: 14-admin-page-title*
*Context gathered: 2026-06-02; approach intentionally left to research per the v6 operator decision*
