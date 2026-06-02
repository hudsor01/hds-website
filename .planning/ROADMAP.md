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

## Milestone v6 — Audit Remediation

> Started 2026-06-01. Driven by a full no-op/stub audit (8-lane parallel finder sweep across all 402 source files, each candidate adversarially verified). 87 candidates resolved to 6 genuine stubs, 50 intentional no-ops, 31 dismissed false positives. Canonical findings at `.planning/v6-AUDIT-FINDINGS.md`. Goal: the codebase contains no functionality that silently fails to do what its name, signature, or UI copy promises. Every finding gets a disposition, no matter the severity.
>
> Phase numbering continues from v5 (last phase 10), so v6 runs Phase 11 through Phase 16. These are bugfix/cleanup phases against production code with full test + lint + typecheck + build gates; no new external integrations.
>
> **Milestone decision (admin error states):** ADMINERR-01..04 implement "full error states everywhere," which **supersedes** the v4 locked decision "each admin query wraps in try/catch and returns [] on failure." The single shared data seam is `src/lib/admin/*-queries.ts`; pages and widgets consume it and never import `db` directly.

### Phases

| # | Slug | Status | Plans | Severity | Description |
|---|---|---|---|---|---|
| 11 | `paystub-tax-accuracy` | in progress (2/4 plans) | 4 | HIGH | Stop the paystub calculator from emitting a confident, wrong financial output. Restrict the state dropdown to states with real bracket data (PAYSTUB-01), remove the dead 2023 and stale 2024 year toggles and re-key to OFFICIAL 2025 (PAYSTUB-02), derive year validation from the data table (PAYSTUB-03), drop redundant flat-0 TX/FL/WA bracket entries (PAYSTUB-04), correct federal + CA + NY + MA to official 2025 values incl. the >$1M CA/MA surtaxes (PAYSTUB-05..08), reframe copy as a 2025 estimate (PAYSTUB-09), and harden stale shared URLs (PAYSTUB-10). Findings #1, #2, #4 + the 2025-clone note + official-source data correction. |
| 12 | `errorboundary-report-path` | not started | TBD | MEDIUM | The root-layout ErrorBoundary "Report Error" action either transmits a real report or is removed; never claims a report was filed when nothing was sent. No `alert()`; Sonner toast if feedback is shown. Finding #3 (ERR-01). |
| 13 | `admin-error-observability` | not started | TBD | DECIDE | Admin list pages, dashboard widgets, the `/admin/emails` queue-health counts, and `get*ById` detail pages distinguish "query failed" from "no data" with a visible error state. Supersedes the v4 locked return-`[]`-on-failure decision. `get*ById` failure must NOT degrade to a 404. ADMINERR-01..04. |
| 14 | `admin-page-title` | not started | TBD | DECIDE | Resolve the hardcoded-but-dynamic-looking `pageTitle="Admin"` prop in `(admin)/admin/layout.tsx`. Canonical approach (native Next.js 16 metadata/title template vs per-page heading) is research-required during plan-phase. ADMINUX-01. |
| 15 | `dead-code-cleanup` | not started | TBD | LOW | Remove dead/dangling code: the `notifications.ts` "Test notification endpoints" JSDoc stub (CLEAN-01), the phantom `HelpArticle.order_index` field with no backing column (CLEAN-02), and the call-site-verified cleanup-bucket no-ops (logger `group`/`groupEnd`/`table`, `contact-welcome` `PARAGRAPH_STYLE.whiteSpace`, `ttl-calculator` always-0 `processingFees`) (CLEAN-03). Findings #5, #6 + CLEANUP bucket. |
| 16 | `intentional-noop-confirmation` | not started | TBD | DOC | Record every verified-intentional no-op (env-gated integrations, mock DB, prod log-level drops, rate-limiter fallback, attribution quota catch, blob-probe fallback, upload audit-log) as verified-intentional in `.planning/v6-AUDIT-FINDINGS.md` with rationale (NOOP-01), and add cheap regression tests asserting the documented behavior so it is intentional-by-contract (NOOP-02). 50 intentional findings. |

### Phase 11: paystub-tax-accuracy

**Goal**: The paystub calculator never tells the user a confident lie about their take-home pay. A user can only pick a state or year the calculator actually computes (official 2025 tables), a selected unsupported value can never silently fall back to a fake $0 or to another year's brackets, and the copy frames the output as an estimate.
**Depends on**: Nothing (first v6 phase)
**Requirements**: PAYSTUB-01, PAYSTUB-02, PAYSTUB-03, PAYSTUB-04, PAYSTUB-05, PAYSTUB-06, PAYSTUB-07, PAYSTUB-08, PAYSTUB-09, PAYSTUB-10
**Success Criteria** (what must be TRUE):

  1. The "State Income Tax" dropdown only lists states that have real bracket data (CA, NY, IL, PA, MA), derived from `stateTaxDataByYear`; no path produces a confident silent $0 for a state that levies income tax.
  2. The federal tax-year selector only offers years backed by real data; both the dead "2023" and the stale "2024" items are removed and the data tables are keyed 2025 with official values, default `taxYear` 2025.
  3. Year validation rejects any year not present in the tax-data table, derived from `getSupportedTaxYears()` (not hardcoded); a rejected-year (2024) + accepted-year (2025) unit test covers it.
  4. The redundant flat-0 TX/FL/WA entries are gone from the income-tax bracket table (those states remain only in the no-income-tax group).
  5. Federal, CA, NY, MA data are the OFFICIAL 2025 values (IRS Rev. Proc. 2024-40; SS wage base $176,100; FTB 2025; NY DTF 2025; MA flat 5.0% + $1,083,150 surtax), with the CA MHS (>$1M) and MA 4% (>$1,083,150) surtaxes encoded as top brackets; golden-number tests lock them.
  6. A stale shared `?state=AL` URL is intersected with the supported codes so it can never reach the defensive $0; the hero/metadata copy frames the output as a 2025 estimate, dash-free.

**Notes**: Target year is OFFICIAL 2025 (operator directive; supersedes the earlier 2024-based plan). Full fidelity: the >$1M CA/MA surtaxes are implemented as top brackets (no new math path). Does NOT add bracket data for the 37 unsupported states (deferred PAYSTUB-F1) or other tax years (deferred PAYSTUB-F2). Touches `tax-data.ts`, `state-tax-data.ts`, `states-utils.ts`, `validation.ts`, `state-tax-calculations.ts`, `PaystubForm.tsx`, `use-paystub-form.ts`, `use-paystub-generator.ts`, the paystub copy, and the unit tests.
**Plans**: 4 plans across 3 waves

Plans:
**Wave 1**

- [x] 11-01-PLAN.md — Federal tax-data 2025: re-key `tax-data.ts` to official 2025 IRS brackets (all statuses), SS wage base 176100, delete the 2024 entry + 2025 clone, move the baseline guard to 2025, export getSupportedTaxYears()
- [x] 11-02-PLAN.md — State tax-data 2025: re-key `state-tax-data.ts` to official 2025 CA/NY/MA (CA MHS + MA 4% surtaxes as top brackets, NY 9.65/10.3/10.9), delete TX/FL/WA flat-0, keep IL/PA, export getSupportedIncomeTaxStateCodes()

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 11-03-PLAN.md — Derivations + validation + tests: derive getIncomeTaxStates() from the data, replace the hardcoded year range with getSupportedTaxYears() membership, re-document the defensive guard, write the parity/exact-set/federal-golden/SS-cap/surtax tests and the rejected-2024/accepted-2025 tests (recompute MA to 0.05)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 11-04-PLAN.md — Form + URL + copy + gate: render the Tax Year dropdown from getSupportedTaxYears() (remove 2023 and 2024), default taxYear 2025, intersect the URL-restored ?state= with supported codes (PAYSTUB-10), reframe the hero/metadata copy as a 2025 estimate, run the full lint + typecheck + test:unit + build gate

**Wave structure:**

- Wave 1: 11-01 (federal `tax-data.ts`) + 11-02 (state `state-tax-data.ts`) in parallel (different files, no overlap)
- Wave 2: 11-03 (derivations + validation + all tests; consumes both Wave 1 exports)
- Wave 3: 11-04 (form + default year + URL hardening + copy + full gate; depends on 11-03)

**UI hint**: yes

### Phase 12: errorboundary-report-path

**Goal**: When an unhandled error hits the root-layout ErrorBoundary, the recovery UI tells the user the truth. The "Report Error" affordance either sends a real report or does not exist, and the app never claims a report was filed when nothing left the browser.
**Depends on**: Nothing (independent of Phase 11)
**Requirements**: ERR-01
**Success Criteria** (what must be TRUE):

  1. The "Report Error" action either transmits a real report (via a real route or existing logging path) or is removed; there is no commented-out fetch paired with a success message.
  2. The UI never tells the user a report was filed unless one actually was; if the button is removed, "Copy Error Details" plus the mailto contact link remain functional.
  3. No `alert()` remains in `ErrorBoundary.tsx` (it is the only `alert()` in the codebase); any user feedback uses a Sonner toast per project convention.

**Notes**: ErrorBoundary wraps the root layout, so this is live in production. Finding #3, file `src/components/utilities/ErrorBoundary.tsx`.
**Plans**: TBD
**UI hint**: yes

### Phase 13: admin-error-observability

**Goal**: An admin operator can always tell a real database failure apart from genuinely-empty data. Every admin read surface (list, dashboard widget, queue-health counts, detail page) renders a visible error state on query failure instead of masquerading as empty, healthy, or not-found.
**Depends on**: Nothing functionally; ordered after Phase 12 by severity. Touches the shared `src/lib/admin/*-queries.ts` seam established in v4.
**Requirements**: ADMINERR-01, ADMINERR-02, ADMINERR-03, ADMINERR-04
**Success Criteria** (what must be TRUE):

  1. Admin list pages show a distinct, visible error state on query failure instead of silently rendering an empty list (ADMINERR-01).
  2. Admin dashboard widgets distinguish a failed query from genuinely-empty analytics, surfacing a failure indicator rather than all-zero data (ADMINERR-02).
  3. The `/admin/emails` queue-health counts distinguish a failed query from a healthy zeroed queue (ADMINERR-03).
  4. Admin detail pages (`get*ById`) show an error state on DB failure instead of a misleading 404 (ADMINERR-04).

**Notes**: This implements the milestone decision "full error states everywhere" and **supersedes** the v4 locked decision ("each admin query wraps in try/catch and returns [] on failure"). The single shared data seam is `src/lib/admin/*-queries.ts`; pages and widgets consume it and never import `db` directly. `get*ById` detail-page error must NOT degrade to a 404.
**Plans**: TBD
**UI hint**: yes

### Phase 14: admin-page-title

**Goal**: The admin chrome shows a truthful, correct page title for each route. The hardcoded-but-dynamic-looking `pageTitle="Admin"` prop is replaced by the canonical, most-performant Next.js 16 mechanism for per-route titles.
**Depends on**: Nothing functionally; ordered after Phase 13 (both touch the admin surface).
**Requirements**: ADMINUX-01
**Success Criteria** (what must be TRUE):

  1. Each admin route resolves a correct, route-specific title rather than a static "Admin" for every page.
  2. The hardcoded-but-dynamic-looking `pageTitle` prop in `(admin)/admin/layout.tsx:47` is removed in favor of the chosen canonical mechanism.
  3. The chosen approach is the most-performant canonical Next.js 16 option, decided during plan-phase research (native metadata/title template vs per-page heading).

**Notes**: RESEARCH-REQUIRED during plan-phase: decide native Next.js 16 metadata/title template vs per-page heading by the most-performant canonical option. ADMINUX-01, file `src/app/(admin)/admin/layout.tsx`.
**Plans**: TBD
**UI hint**: yes

### Phase 15: dead-code-cleanup

**Goal**: The codebase carries no dead or dangling surface that implies behavior it does not have. Phantom fields, dangling stub comments, and verified-unused no-op methods are removed (or, where call-site analysis shows a reason to keep, documented with a clear comment).
**Depends on**: Nothing
**Requirements**: CLEAN-01, CLEAN-02, CLEAN-03
**Success Criteria** (what must be TRUE):

  1. The dangling "Test notification endpoints" JSDoc stub in `notifications.ts` is removed (or a real `sendTestNotification()` is implemented) (CLEAN-01).
  2. The phantom `HelpArticle.order_index` field (hardcoded 0, no backing column) is removed from both the interface and the mapper in `help-articles.ts`; no consumer breaks (CLEAN-02).
  3. Each remaining cleanup-bucket no-op is resolved by call-site check: unused logger `group`/`groupEnd`/`table` methods removed if no callers (else documented); `contact-welcome` `PARAGRAPH_STYLE.whiteSpace` removed or justified; `ttl-calculator` always-0 `processingFees` verified and removed or given a clear comment (CLEAN-03).

**Notes**: Findings #5, #6 + the CLEANUP bucket. No DDL: `order_index` references a column that never existed. Files: `notifications.ts`, `help-articles.ts`, `schemas/content.ts` (reference only), `logger.ts`, `emails/contact-welcome.tsx`, `ttl-calculator/calculator.ts`.
**Plans**: TBD

### Phase 16: intentional-noop-confirmation

**Goal**: Every intentional no-op is recorded as verified-intentional so a future audit recognizes it instead of re-flagging it, and the cheapest/most-meaningful ones are pinned by a regression test so the behavior is intentional-by-contract rather than accidental.
**Depends on**: Phases 11 to 15 (the FIX/CLEANUP findings are resolved first; what remains is confirmed intentional). Last phase by design (documentation + tests).
**Requirements**: NOOP-01, NOOP-02
**Success Criteria** (what must be TRUE):

  1. Every verified-intentional no-op (env-gated integrations: ad-conversions, Sentry/error-tracking, Slack/Discord, Resend email paths; mock DB when `POSTGRES_URL` unset; production log-level drops; rate-limiter Redis fallback; attribution quota catch; blob-probe fallback; upload `onUploadCompleted` audit-log) is recorded as verified-intentional in `.planning/v6-AUDIT-FINDINGS.md` with rationale (NOOP-01).
  2. Where cheap and meaningful, a regression test asserts the documented no-op behavior, e.g. `sendAdConversion` no-ops without creds and the `db` mock returns `[]` without `POSTGRES_URL` (NOOP-02).
  3. No KEEP-disposition finding remains without an explicit recorded rationale; the next audit can map each back to a documented decision.

**Notes**: 50 intentional findings; NOOP-02 covers a meaningful subset. This phase changes documentation and tests, not the env-gated behavior itself (those are verified correct-by-design graceful degradation).
**Plans**: TBD

### v6 Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 11. paystub-tax-accuracy | 0/4 | Not started | - |
| 12. errorboundary-report-path | 0/0 | Not started | - |
| 13. admin-error-observability | 0/0 | Not started | - |
| 14. admin-page-title | 0/0 | Not started | - |
| 15. dead-code-cleanup | 0/0 | Not started | - |
| 16. intentional-noop-confirmation | 0/0 | Not started | - |

## Earlier milestones (archived)

- v1 — initial 10 phases, shipped
- v1 (later) — 2/7 phases done, rest deferred
- v2 — 8 phases, shipped (final phase: copy repositioning, PR #206)
