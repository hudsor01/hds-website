# ROADMAP — Hudson Digital Solutions

## Milestone v3 — Showcase & conversion polish

> Started 2026-05-21. Site copy was repositioned in v2 (PR #206). v3 focuses on visual storytelling and conversion surfaces.
> Phase 01 shipped as PR #208 (squashed to `59e5e70` on `main`, 2026-05-22).

### Phases

| # | Slug | Status | Plans | Description |
|---|---|---|---|---|
| 01 | `showcase-ui-redesign` | complete (4/4) | 4 | Redesign `/showcase` around real homepage screenshots: featured project (JirahShop e-commerce) + 3 supporting cards (Ink 37, TenantFlow, RevOps Portfolio) + inline mid-scroll CTA. Spec at `.planning/phases/01-showcase-ui-redesign/01-CONTEXT.md`. Phase summary at `.planning/phases/01-showcase-ui-redesign/01-SUMMARY.md`. |

### Phase 01: showcase-ui-redesign

**Goal:** Turn `/showcase` into an image-led conversion surface. 4 published rows (1 featured, 3 support) all render with real homepage screenshots; a mid-scroll CTA appears between the grid and the closing CTA; hero typewriter is preserved; all new copy is em/en-dash free.

**Plans:** 4 plans across 3 waves

Plans:
- [x] 01-01-PLAN.md — Populate Neon `showcase` table: UPDATE imageUrl on 3 existing rows + INSERT jirah-shop row (featured, first by displayOrder)
- [x] 01-02-PLAN.md — Extend `Card variant="project"` with optional `imageUrl` / `imageAlt` props and a conditional Next.js Image header (4:3 featured, 16:9 support)
- [x] 01-03-PLAN.md — Rewrite `src/app/showcase/page.tsx`: new section header, featured-first split logic, 3-col support grid, new inline CTA section, strip em/en-dash from existing hero/metadata copy
- [x] 01-04-PLAN.md — Verification: lint + typecheck + build + em/en-dash grep + human visual smoke on local dev (automated gates green; human smoke deferred to operator pre-PR)

**Wave structure:**
- Wave 1 (parallel): 01-01 (data), 01-02 (component) — no file overlap, both prerequisites for the page rewrite
- Wave 2: 01-03 (page rewrite, depends on data and component)
- Wave 3: 01-04 (verification, depends on all)

## Milestone v4 — Admin Panel

> Started 2026-05-22. Built around Efferd Dashboard 5 (web analytics) shell. Auth is Better Auth (full sessions/users, users table in Neon). Scope is comprehensive admin: dashboard + content CRUD + leads/ops.

### Phases

| # | Slug | Status | Plans | Description |
|---|---|---|---|---|
| 02 | `auth-foundation` | complete (5/5) | 5 | Better Auth wired to Neon. Users + sessions + accounts + verifications tables. Sign-in / sign-up pages. `/admin/*` server-component role guard + `proxy.ts` edge cookie short-circuit. AccountMenu primitive. Phase summary at `.planning/phases/02-auth-foundation/02-SUMMARY.md`. |
| 03 | `admin-shell-and-dashboard` | complete (6/6) | 6 | Sidebar + topbar + content slot adapted from Efferd Dashboard 5. `/admin/dashboard` wired to real Neon data (web vitals p75, daily visitors, top pages, attribution channels, recent leads). 6 coming-soon stubs for the rest of v4. Phase summary at `.planning/phases/03-admin-shell-and-dashboard/03-SUMMARY.md`. |
| 04 | `admin-content-crud` | complete (6/6) | 6 | `/admin/showcase`, `/admin/blog`, `/admin/testimonials` list + create + edit + delete. Replaces direct-SQL / Neon MCP workflow. Spec at `.planning/phases/04-admin-content-crud/04-CONTEXT.md`. Phase summary at `.planning/phases/04-admin-content-crud/04-SUMMARY.md`. |
| 05 | `admin-ops` | pending | 0 | `/admin/leads` (contact submissions), `/admin/newsletter` (subscribers), `/admin/emails` (scheduled queue health). |

### Phase 03: admin-shell-and-dashboard

**Goal:** Replace the Phase-02 placeholder `/admin` page with a real admin shell (sidebar + topbar + content slot) and a working `/admin/dashboard` rendered from existing Neon tables (`web_vitals`, `page_analytics`, `leads`, `lead_attribution`). 6 coming-soon stubs for the rest of v4's pages.

**Plans:** 6 plans across 4 waves

Plans:
- [x] 03-01-PLAN.md — Install recharts; write `src/lib/admin/dashboard-queries.ts` with 5 typed Drizzle query functions (visitors-by-day, top-pages, traffic-sources, web-vitals-p75, recent-leads)
- [x] 03-02-PLAN.md — Shell primitives: `src/components/admin/{Sidebar,Topbar,Forbidden}.tsx` (Sidebar is client for usePathname active state, others are server)
- [x] 03-03-PLAN.md — Rewrite `src/app/admin/layout.tsx` to compose the new shell; rewrite `src/app/admin/page.tsx` as a redirect to `/admin/dashboard`
- [x] 03-04-PLAN.md — `src/app/admin/dashboard/page.tsx` + 5 widgets under `src/components/admin/widgets/` (VisitorsChart, WebVitalsCards, TopPagesTable, TrafficSourcesPie, RecentLeadsPanel)
- [x] 03-05-PLAN.md — 6 coming-soon stub pages under `src/app/admin/(coming-soon)/` for showcase, blog, testimonials (Phase 04) and leads, newsletter, emails (Phase 05)
- [x] 03-06-PLAN.md — Verification: lint + typecheck + build + em/en-dash sweep + Phase-02 untouched diff + operator smoke checklist (passed automated gates; operator smoke deferred pre-PR)

**Wave structure:**
- Wave 1 (parallel): 03-01 (deps + query lib), 03-02 (shell primitives) — no file overlap
- Wave 2: 03-03 (layout + redirect, depends on 03-02 primitives)
- Wave 3 (parallel): 03-04 (dashboard page + widgets, depends on 03-01 for queries and 03-03 for the shell), 03-05 (coming-soon stubs, depends on 03-03 for the layout)
- Wave 4: 03-06 (verification, depends on 03-04 + 03-05)

### Phase 04: admin-content-crud

**Goal:** Replace the three Phase-03 coming-soon stubs (`/admin/showcase`, `/admin/blog`, `/admin/testimonials`) with real list + create + edit + delete pages backed by Server Actions calling new admin-layer query functions. After this phase the operator manages all three content surfaces from the admin UI without writing SQL; public-facing rendering (`/showcase`, `/blog`, `/testimonials`) is untouched.

**Plans:** 6 plans across 4 waves

Plans:
- [x] 04-01-PLAN.md — Shared admin foundation: `src/lib/admin/{auth,slugify,form-data,db-errors}.ts` + `src/components/admin/{FormFieldSet,DeleteButton,PublishToggle,ResourceListPage}.tsx` (with 3 unit-test files)
- [x] 04-02-PLAN.md — Showcase CRUD vertical slice: `src/lib/admin/showcase-queries.ts` + `src/lib/schemas/admin-showcase.ts` + 6 pages under `src/app/admin/showcase/`
- [x] 04-03-PLAN.md — Blog CRUD vertical slice with author select + tag multi-select set replacement: `src/lib/admin/blog-queries.ts` + `src/lib/schemas/admin-blog.ts` + 6 pages under `src/app/admin/blog/`
- [x] 04-04-PLAN.md — Testimonials CRUD vertical slice: `src/lib/admin/testimonials-queries.ts` + `src/lib/schemas/admin-testimonials.ts` + 6 pages under `src/app/admin/testimonials/`
- [x] 04-05-PLAN.md — Cleanup: delete the 3 Phase-04 coming-soon stubs (`src/app/admin/(coming-soon)/{showcase,blog,testimonials}/page.tsx`); leaves leads/newsletter/emails stubs intact for Phase 05
- [x] 04-06-PLAN.md — Verification: lint + typecheck + unit tests + build + em/en-dash sweep + Phase 02/03/n8n/public byte-equal diff + operator 20-step smoke checklist (passed automated gates; operator smoke deferred pre-PR)

**Wave structure:**
- Wave 1: 04-01 (shared foundation; everything in Wave 2 depends on it)
- Wave 2 (parallel, 3 independent vertical slices): 04-02 (showcase), 04-03 (blog), 04-04 (testimonials) — zero file-overlap between the three
- Wave 3: 04-05 (stub cleanup, depends on all three Wave-2 routes existing)
- Wave 4: 04-06 (verification, depends on everything)

## Earlier milestones (archived)

- v1 — initial 10 phases, shipped
- v1 (later) — 2/7 phases done, rest deferred
- v2 — 8 phases, shipped (final phase: copy repositioning, PR #206)
