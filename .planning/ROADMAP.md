# Roadmap: Hudson Digital Solutions Website

## Overview

Production-quality Next.js business website with tool generators, contact forms, and comprehensive testing. Ongoing improvement through systematic code review remediation and audit-driven feature completion.

## Domain Expertise

None

## Milestones

- [v1.0 Cleanup & Simplification](milestones/v1.0-ROADMAP.md) (Phases 1-10) -- SHIPPED 2026-01-30
- **v1.1 Code Review Remediation** -- Phases 11-17 (partial -- 11, 17 complete; 12-16 deferred to v2.0)
- **v2.0 Audit Remediation & Feature Completion** -- Phases 37-44 (in progress)

## Completed Milestones

<details>
<summary>v1.0 Cleanup & Simplification (Phases 1-10) -- SHIPPED 2026-01-30</summary>

- [x] Phase 1: Dependency Audit & Pruning (5 plans)
- [x] Phase 2: Dead Code Elimination (4 plans)
- [x] Phase 3: Integration Cleanup (1 plan)
- [x] Phase 4: Code Deduplication (merged into other phases)
- [x] Phase 5: Configuration Simplification (6 plans)
- [x] Phase 6: Component Structure Optimization (5 plans)
- [x] Phase 7: Build & Bundle Optimization (2 plans)
- [x] Phase 8: Testing Infrastructure Review (4 plans)
- [x] Phase 9: Documentation & Environment (4 plans)
- [x] Phase 10: Final Validation & Verification

</details>

<details>
<summary>v1.1 Code Review Remediation (Phases 11-17) -- PARTIAL</summary>

Source: CODE_REVIEW.md -- 20 items audited, 5 already resolved by v1.0, 15 remaining grouped into 6 phases.

- [x] Phase 11: TypeScript Strictness & Code Quality (2/2 plans)
- [ ] Phase 12: Test Coverage & Infrastructure -- Deferred to v2.0 Phase 44
- [ ] Phase 13: Error Handling & Resilience -- Deferred to v2.0
- [ ] Phase 14: Security Hardening -- Deferred to v2.0 Phase 39
- [ ] Phase 15: Performance Optimization -- Deferred to v2.0 Phase 43
- [ ] Phase 16: Architecture & Component Patterns -- Deferred to v2.0 Phase 43
- [x] Phase 17: Next.js 16 Alignment (1/1 plans)

### Excluded Items (Already Resolved or Not Actionable)
- CODE_REVIEW #1 (missing core utilities) -- FIXED in v1.0
- CODE_REVIEW #2 (type system inconsistencies) -- FIXED in v1.0
- CODE_REVIEW #3 (Buffer type mismatches) -- FIXED in v1.0
- CODE_REVIEW #7 (failing unit tests) -- FIXED in v1.0 (334 passing)
- CODE_REVIEW #4 (database.ts size) -- Auto-generated file, splitting not practical
- CODE_REVIEW #19 (code documentation) -- Contradicts CLAUDE.md
- CODE_REVIEW #20 (architecture docs) -- Contradicts CLAUDE.md

</details>

## v2.0 Audit Remediation & Feature Completion

**Milestone Goal:** Address all findings from the comprehensive 4-agent codebase audit: wire orphaned code to pages, clean up API routes, decide on authentication strategy, align with modern Next.js patterns, and verify everything works.

**Source:** Codebase audit (2026-02-10) -- 4 parallel agents audited API routes, pages/components, lib/types, and auth/database integration.

**Supersedes:** v1.1 phases 12-16 (test coverage, error handling, security, performance, architecture) -- these concerns are incorporated into v2.0 phases.

#### Phase 37: Environment & Configuration Hygiene
**Goal**: Add all bypassed env vars to env.ts validation, update .env.example from Supabase to Neon/Drizzle references, fix CSP reports empty string bug
**Depends on**: v1.1 Phase 17 complete
**Research**: Unlikely (internal patterns, @t3-oss/env-nextjs already configured)
**Plans**: TBD

Audit findings addressed:
- POSTGRES_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET, STIRLING_PDF_URL bypass env.ts
- .env.example still references Supabase variables
- CSP reports route has empty string in EXPECTED_CSP_FIELDS array

Plans:
- [ ] 37-01: Env validation, .env.example update, CSP fix (2 tasks)

#### Phase 38: API Route Cleanup & Consolidation
**Goal**: Consolidate duplicate newsletter endpoints, evaluate orphaned API routes (health/pagespeed/csrf/paystub), enable disabled cron processing for web vitals and page analytics
**Depends on**: Phase 37 (env vars validated first)
**Research**: Unlikely (internal patterns)
**Plans**: TBD

Audit findings addressed:
- /api/newsletter and /api/newsletter/subscribe duplication
- 5 orphaned API routes with no frontend consumers
- processWebVitals() and processPageAnalytics() disabled despite tables existing
- /api/paystub potentially orphaned

Plans:
- [ ] 38-01: TBD

#### Phase 39: Auth Decision & Implementation
**Goal**: Decide Neon Auth strategy (complete implementation or remove partial setup), fix admin-auth.ts stub that provides zero protection on testimonial routes, add middleware.ts if implementing auth
**Depends on**: Phase 38 (clean API routes before adding auth layer)
**Research**: Likely (Neon Auth current docs, Next.js middleware patterns)
**Research topics**: Neon Auth beta API stability, middleware.ts patterns for Next.js 16, session management with @neondatabase/auth

Audit findings addressed:
- Neon Auth API handler exists but no login pages, no middleware, no client auth
- admin-auth.ts validateAdminAuth() always returns true, requireAdminAuth() always returns null
- No middleware.ts for token refresh or route protection

Plans:
- [ ] 39-01: TBD

#### Phase 40: Tool Calculator Pages
**Goal**: Create page.tsx wrappers for ROI Calculator, Cost Estimator, and Mortgage Calculator client components; wire TTL Calculator to a consistent page; clean up route constants that reference non-existent pages
**Depends on**: Phase 37 (env hygiene ensures builds work)
**Research**: Unlikely (following existing tool page patterns in codebase)
**Plans**: TBD

Audit findings addressed:
- ROICalculatorClient.tsx, CostEstimatorClient.tsx, MortgageCalculatorClient.tsx have no page.tsx
- Calculator.tsx (TTL) is feature-complete but never imported
- TOOL_ROUTES defines PAYSTUB_GENERATOR and LOAN_CALCULATOR with no pages

Plans:
- [ ] 40-01: TBD

#### Phase 41: Location SEO Pages
**Goal**: Create /locations/[slug] dynamic pages using existing src/lib/locations.ts data (5 Texas cities), add generateStaticParams, proper metadata, LocalBusiness structured data
**Depends on**: Phase 40 (tools pages complete)
**Research**: Unlikely (locations.ts already has all data and schema generation functions)
**Plans**: TBD

Audit findings addressed:
- src/lib/locations.ts has 5 Texas cities with full SEO data but ZERO imports anywhere

Plans:
- [ ] 41-01: TBD

#### Phase 42: Blog Data Strategy
**Goal**: Decide whether blog should be database-backed (Drizzle) or remain static placeholder; implement chosen approach so blog pages serve real content
**Depends on**: Phase 41 (content pages before blog)
**Research**: Unlikely (Drizzle patterns already established in codebase)
**Plans**: TBD

Audit findings addressed:
- src/lib/blog.ts has hardcoded placeholder blog posts with empty content
- Blog pages render but content is placeholder ("This post content is coming soon")

Plans:
- [ ] 42-01: TBD

#### Phase 43: Next.js Architecture Alignment
**Goal**: Audit all pages for modern Next.js 16 conventions (async params, proper metadata exports, generateStaticParams where applicable, server-first components); address v1.1 deferred items for architecture, performance, and component patterns
**Depends on**: Phase 42 (all new pages exist before auditing patterns)
**Research**: Unlikely (patterns already established in newer pages)
**Plans**: TBD

Audit findings addressed:
- Ensure consistent modern patterns across all pages (old and new)
- v1.1 Phase 15 (Performance Optimization) items
- v1.1 Phase 16 (Architecture & Component Patterns) items

Plans:
- [ ] 43-01: TBD

#### Phase 44: Test Coverage & Final Verification
**Goal**: Add tests for all new pages and features created in this milestone, verify zero regressions, run full lint/typecheck/test suite
**Depends on**: Phase 43 (all code finalized before testing)
**Research**: Unlikely (existing test patterns in codebase)
**Plans**: TBD

Audit findings addressed:
- v1.1 Phase 12 (Test Coverage & Infrastructure) items
- Comprehensive verification of all v2.0 changes

Plans:
- [ ] 44-01: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-10 | v1.0 | 30+/30+ | Complete | 2026-01-30 |
| 11. TypeScript Strictness | v1.1 | 2/2 | Complete | 2026-02-02 |
| 12. Test Coverage | v1.1 | 0/TBD | Deferred to v2.0 | - |
| 13. Error Handling | v1.1 | 0/TBD | Deferred to v2.0 | - |
| 14. Security Hardening | v1.1 | 0/TBD | Deferred to v2.0 | - |
| 15. Performance Optimization | v1.1 | 0/TBD | Deferred to v2.0 | - |
| 16. Architecture & Components | v1.1 | 0/TBD | Deferred to v2.0 | - |
| 17. Next.js 16 Alignment | v1.1 | 1/1 | Complete | 2026-02-02 |
| 37. Env & Config Hygiene | v2.0 | 0/TBD | Not started | - |
| 38. API Route Cleanup | v2.0 | 0/TBD | Not started | - |
| 39. Auth Decision | v2.0 | 0/TBD | Not started | - |
| 40. Tool Calculator Pages | v2.0 | 0/TBD | Not started | - |
| 41. Location SEO Pages | v2.0 | 0/TBD | Not started | - |
| 42. Blog Data Strategy | v2.0 | 0/TBD | Not started | - |
| 43. Next.js Architecture | v2.0 | 0/TBD | Not started | - |
| 44. Test & Verification | v2.0 | 0/TBD | Not started | - |
