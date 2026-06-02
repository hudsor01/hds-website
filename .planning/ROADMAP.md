### Phase 14: admin-page-title

**Goal**: The admin chrome shows a truthful, correct page title for each route. The hardcoded-but-dynamic-looking `pageTitle="Admin"` prop is removed; each page's own `<h1>` and `metadata.title` (already present on all 18 routes) are the canonical, zero-overhead title source.
**Depends on**: Nothing functionally; ordered after Phase 13 (both touch the admin surface).
**Requirements**: ADMINUX-01
**Success Criteria** (what must be TRUE):

  1. Each admin route resolves a correct, route-specific title rather than a static "Admin" for every page.
  2. The hardcoded-but-dynamic-looking `pageTitle` prop in `(admin)/admin/layout.tsx:47` is removed in favor of the chosen canonical mechanism.
  3. The chosen approach is the most-performant canonical Next.js 16 option, decided during plan-phase research (per-page heading by subtraction; the layout structurally cannot read the child title, and per-page `<h1>`/`metadata.title` already exist).

**Notes**: RESEARCH-RESOLVED (HIGH confidence): per-page titles already exist on all 18 admin routes; the canonical, most-performant fix is to REMOVE the redundant always-"Admin" Topbar prop, not build a new title mechanism. Pure server-component subtraction; no new client JS. ADMINUX-01, files `src/components/admin/Topbar.tsx` + `src/app/(admin)/admin/layout.tsx`.
**Plans**: 1 plan

Plans:

- [ ] 14-01-PLAN.md — Remove the misleading pageTitle prop from Topbar + its layout consumer; full lint/typecheck/unit/build gate

**UI hint**: yes
