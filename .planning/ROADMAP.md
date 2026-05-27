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
| 05 | `admin-ops` | complete (7/7) | 7 | `/admin/leads` (contact submissions + attribution + notes), `/admin/leads/calculator` (calculator submissions), `/admin/newsletter` (subscribers + unsubscribe/GDPR), `/admin/emails` (scheduled queue health + retry/cancel). Spec at `.planning/phases/05-admin-ops/05-CONTEXT.md`. Phase summary at `.planning/phases/05-admin-ops/05-SUMMARY.md`. |

### Phase 03: admin-shell-and-dashboard

**Goal:** Replace the Phase-02 placeholder `/admin` page with a real admin shell (sidebar + topbar + content slot) and a working `/admin/dashboard` rendered from existing Neon tables (`web_vitals`, `page_analytics`, `leads`, `lead_attribution`). 6 coming-soon stubs for the rest of v4's pages.

**Plans:** 6 plans across 4 waves

Plans:
- [x] 03-01-PLAN.md — Install recharts; write `src/lib/admin/dashboard-queries.ts` with 5 typed Drizzle query functions (visitors-by-day, top-pages, traffic-sources, web-vitals-p75, recent-leads)
- [x] 03-02-PLAN.md — Shell primitives: `src/components/admin/{Sidebar,Topbar,Forbidden}.tsx` (Sidebar is client for usePathname active state, others are server)
- [x] 03-03-PLAN.md — Rewrite `src/app/admin/layout.tsx` to compose the new shell; rewrite `src/app/admin/page.tsx` as a redirect to `/admin/dashboard`
- [x] 03-04-PLAN.md — `src/app/admin/dashboard/page.tsx` + 5 widgets under `src/components/admin/widgets/` (VisitorsChart, WebVitalsCards, TopPagesTable, TrafficSourcesPie, RecentLeadsPanel)
- [x] 03-05-PLAN.md — 6 coming-soon stub pages under `src/app/admin/(coming-soon)/` for showcase, blog, testimonials (Phase 04) and leads, newsletter, emails (Phase 05)
- [x] 03-06-PLAN.md — Verification: lint + typecheck + build + em/en-dash sweep + Phase-02 untouched diff + operator smoke checklist (passed automated gates; operator smoke deferred to operator pre-PR)

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

### Phase 05: admin-ops

**Goal:** Replace the three Phase-03 coming-soon stubs (`/admin/leads`, `/admin/newsletter`, `/admin/emails`) with read-mostly ops pages backed by the existing Neon tables. Operator can list with status filters, view per-row detail, run small mutations (status change, add note, unsubscribe, retry, cancel, delete) without opening Neon Console. Calculator submissions get their own sub-page at `/admin/leads/calculator`. The `/api/process-emails` cron endpoint is untouched.

**Plans:** 7 plans across 4 waves

Plans:
- [x] 05-01-PLAN.md — Shared UI primitives: `src/components/admin/{StatusFilterBar,StatusBadge}.tsx` (server components consumed by all 4 Wave-2 list/detail surfaces)
- [x] 05-02-PLAN.md — Leads vertical slice: `src/lib/admin/leads-queries.ts` + `src/lib/schemas/admin-leads.ts` + 3 pages under `src/app/admin/leads/` (list with status filter, detail with attribution/notes/status mutations, 4 Server Actions)
- [x] 05-03-PLAN.md — Calculator leads vertical slice: `src/lib/admin/calculator-leads-queries.ts` + `src/lib/schemas/admin-calculator-leads.ts` + 3 pages under `src/app/admin/leads/calculator/` (list with quality filter, detail with inputs/results/conversion, 3 Server Actions)
- [x] 05-04-PLAN.md — Newsletter vertical slice: `src/lib/admin/newsletter-queries.ts` + `src/lib/schemas/admin-newsletter.ts` + 3 pages under `src/app/admin/newsletter/` (list, detail with unsubscribe/re-subscribe state machine, 3 Server Actions)
- [x] 05-05-PLAN.md — Emails vertical slice: `src/lib/admin/emails-queries.ts` + `src/lib/schemas/admin-emails.ts` + 3 pages under `src/app/admin/emails/` (list with 4 stat cards + status filter, detail with retry guard, 3 Server Actions; `/api/process-emails` UNTOUCHED)
- [x] 05-06-PLAN.md — Cleanup: delete the 3 Phase-05 coming-soon stubs (`src/app/admin/(coming-soon)/{leads,newsletter,emails}/page.tsx`) + remove the empty `(coming-soon)/` directory; verify cacheComponents pattern on all 4 dynamic detail routes
- [x] 05-07-PLAN.md — Verification: 13 automated gates (lint + typecheck + unit tests + build + em/en-dash sweep + Phase 02/03/04 + cron-endpoint + public byte-equal diff + requireAdminSession defense-in-depth count + revalidatePath count + no console.* / process.env.X / any types) + 35-step operator smoke checklist for all 4 surfaces

**Wave structure:**
- Wave 1: 05-01 (2 shared UI primitives; Wave 2 depends on these)
- Wave 2 (parallel, 4 independent vertical slices): 05-02 (leads), 05-03 (calculator-leads), 05-04 (newsletter), 05-05 (emails) — zero file-overlap between the four
- Wave 3: 05-06 (stub cleanup, depends on all four Wave-2 routes existing)
- Wave 4: 05-07 (verification, depends on everything)

## Milestone v5 — Admin hardening + content authoring

> Started 2026-05-25. v4 (Admin Panel) is shipped end-to-end and audited. v5 takes the next pass: turn the post-smoke audit findings into architectural cleanup, replace the paste-URL friction with real upload UI, give the blog a proper editor, sweep the 3rd-party logger surface for PII leaks, and stage pagination for any future list growth.
>
> **Closed 2026-05-27.** Audit at `.planning/milestones/v5-AUDIT.md`. 5/5 phases shipped (06-10) + 1 cross-phase hotfix (PR #226). Phase 10 was originally defensive-deferred; the deferral was overridden mid-audit and Phase 10 shipped via PR #228 (commit `870f717`).

### Phases

| # | Slug | Status | Plans | Description |
|---|---|---|---|---|
| 06 | `admin-chrome-route-groups` | complete (PR #222) | n/a | Moved `src/app` into `(public)/` + `(admin)/` + `(auth)/` route groups. Marketing chrome (NavbarLight + Footer) now lives in the (public) layout instead of the root layout, so admin/auth pages never inherit it. Removed the `usePathname` self-suppression shipped in PR #218 (`4114d37`) as the canonical fix. Zero UX change; route table byte-equal to pre-Phase-06. Phase summary at `.planning/phases/06-admin-chrome-route-groups/06-SUMMARY.md`. |
| 07 | `third-party-logger-compliance` | complete (PR #223) | 1 | Sink-level PII redaction. Shared `src/lib/log-redact.ts` walker extracted from PR #221's inline `redactEmails`; broadened to 3 field categories (emails, credentials, IPs); applied in `BaseLogger.log` + `pushToDatabase` so every metadata payload is masked before reaching stdout / `error_logs` / external webhooks. Better Auth's logger config now imports the shared module. 11 new unit tests. Spec at `.planning/phases/07-third-party-logger-compliance/07-CONTEXT.md`. Phase summary at `.planning/phases/07-third-party-logger-compliance/07-SUMMARY.md`. |
| 08 | `image-upload-ui` | complete (PR #224); operator step pending | 0 | Wired Vercel Blob upload widgets across the 6 admin form image fields (showcase imageUrl + ogImageUrl + galleryImages, blog featureImage, testimonials imageUrl). Single POST endpoint backed by `handleUpload`; 503 fast-fail keeps the paste-URL fallback working before the operator wires `BLOB_READ_WRITE_TOKEN`. **As of 2026-05-27, `BLOB_READ_WRITE_TOKEN` is not yet wired on Vercel** -- live prod GET `/api/admin/images/upload` returns `{"configured": false}`, paste-URL fallback is the active path. Phase summary at `.planning/phases/08-image-upload-ui/08-SUMMARY.md`. |
| 09 | `blog-rich-text-editor` | complete (PR #225) | 0 | Replaced the plain `<textarea>` for `blog_posts.content` on `/admin/blog/{new,[id]/edit}` with a Tiptap-based rich-text editor (StarterKit + Link + Image). Editor HTML output is a strict subset of `BlogPostContent.tsx`'s sanitize-html allowedTags; round-trip guarded by `rich-text-editor-tags.ts` + 3 unit tests. Public render path + schema + queries byte-equal to origin/main. Phase summary at `.planning/phases/09-blog-rich-text-editor/09-SUMMARY.md`. |
| -- | admin Loading hotfix (cross-phase) | shipped (PR #226) | 0 | Post-Phase-09 cross-phase fix. All 7 admin `[id]` edit/detail pages were stuck on the Suspense `Loading...` fallback in prod because the loader called `await connection()` before the placeholder-id check; the prerender emitted `<!--$~-->` (PPR postponed) markers React's `$RC` couldn't unhide. Bug originated in Phase 04 canonical pattern; widened with every admin `[id]` route. Fix: short-circuit the placeholder to `notFound()` before `connection()`. New `src/lib/admin/build-placeholder.ts` (shared constant + canonical docblock) + `tests/unit/admin/build-placeholder.test.ts` (23-case regression suite enumerating the admin tree). 3 rounds of independent code review. Diagnosed via Phase 09 live-verify. See `.planning/milestones/v5-AUDIT.md` for the root-cause analysis. |
| 10 | `admin-list-pagination` | complete (PR #228) | 9 | Cursor pagination + nuqs-driven ILIKE text search + shadcn `<Table>` / `<Pagination>` primitives across all 7 admin list pages. Replaces the Phase 04/05 hard caps with paginated reads. PAGE_SIZE=25; per-table cursor keys range from 2-part `(createdAt, id)` to NULLS-LAST 3-part `(publishedAt DESC NULLS LAST, createdAt, id)`. New `src/lib/admin/list-cursor.ts` codec + `buildPaginationHref` helper. SearchInput uses `useQueryState('q', { shallow: false, throttleMs: 300, clearOnDefault: true })` and resets `?cursor=` on q change. 20 commits across 3 waves; 112 new test cases. Phase summary at `.planning/phases/10-admin-list-pagination/10-SUMMARY.md`. |

## Earlier milestones (archived)

- v1 — initial 10 phases, shipped
- v1 (later) — 2/7 phases done, rest deferred
- v2 — 8 phases, shipped (final phase: copy repositioning, PR #206)
