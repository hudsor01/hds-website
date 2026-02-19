# Roadmap: Hudson Digital Solutions Website

## Overview

Production-quality Next.js business website with tool generators, contact forms, and comprehensive testing. Ongoing improvement through systematic code review remediation and audit-driven feature completion.

## Domain Expertise

None

## Milestones

- [v1.0 Cleanup & Simplification](milestones/v1.0-ROADMAP.md) (Phases 1-10) -- SHIPPED 2026-01-30
- **v1.1 Code Review Remediation** -- Phases 11-17 (partial -- 11, 17 complete; 12-16 deferred to v2.0)
- [v2.0 Audit Remediation & Feature Completion](milestones/v2.0-ROADMAP.md) (Phases 37-45) -- SHIPPED 2026-02-17
- **v3.0 Growth & Content** -- Phases 46-50 (complete — ready to archive)

## Completed Milestones

- ✅ [v1.0 Cleanup & Simplification](milestones/v1.0-ROADMAP.md) (Phases 1-10) — SHIPPED 2026-01-30
- ✅ [v2.0 Audit Remediation & Feature Completion](milestones/v2.0-ROADMAP.md) (Phases 37-45) — SHIPPED 2026-02-17

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

<details>
<summary>✅ v2.0 Audit Remediation & Feature Completion (Phases 37-45) — SHIPPED 2026-02-17</summary>

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
- [x] 37-01: Env validation, .env.example update, CSP fix, dead auth/n8n removal

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
- [x] 38-01: Delete orphaned routes, strip fake auth, clean constants/env, create paystub page

#### Phase 39: Auth Decision & Implementation
**Goal**: Decide Neon Auth strategy (complete implementation or remove partial setup), fix admin-auth.ts stub that provides zero protection on testimonial routes, add middleware.ts if implementing auth
**Depends on**: Phase 38 (clean API routes before adding auth layer)
**Research**: Likely (Neon Auth current docs, Next.js middleware patterns)
**Research topics**: Neon Auth beta API stability, middleware.ts patterns for Next.js 16, session management with @neondatabase/auth

**NOTE**: Auth route and admin-auth.ts already deleted in Phases 37-38. Neon Auth dependency removed. This phase may be skippable -- all auth-related dead code has been removed. Decision: no auth system needed for a customer-facing website.

Audit findings addressed:
- ~~Neon Auth API handler exists but no login pages, no middleware, no client auth~~ RESOLVED in Phase 37
- ~~admin-auth.ts validateAdminAuth() always returns true, requireAdminAuth() always returns null~~ RESOLVED in Phase 38
- ~~No middleware.ts for token refresh or route protection~~ N/A (no auth system)

Plans:
- [x] 39-01: N/A -- all findings resolved in Phases 37-38 (auth route deleted, admin-auth deleted, no auth needed)

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
- [x] 40-01: Create 4 tool page wrappers, fix route constants and broken index links

#### Phase 41: Location SEO Pages
**Goal**: Create /locations/[slug] dynamic pages using existing src/lib/locations.ts data (5 Texas cities), add generateStaticParams, proper metadata, LocalBusiness structured data
**Depends on**: Phase 40 (tools pages complete)
**Research**: Unlikely (locations.ts already has all data and schema generation functions)
**Plans**: TBD

Audit findings addressed:
- src/lib/locations.ts has 5 Texas cities with full SEO data but ZERO imports anywhere

Plans:
- [x] 41-01: Create /locations/[slug] dynamic pages with SEO metadata and LocalBusiness schema

#### Phase 42: Blog Data Strategy -- COMPLETE
**Goal**: Database-backed blog via Drizzle/Neon + structured data maximization (BlogPosting, BreadcrumbList)
**Depends on**: Phase 41 (content pages before blog)

Audit findings addressed:
- src/lib/blog.ts has hardcoded placeholder blog posts with empty content
- Blog pages render but content is placeholder ("This post content is coming soon")
- Location pages lack BreadcrumbList structured data

Plans:
- [x] 42-01: Database-backed blog + structured data (schema, seed, Drizzle queries, JSON-LD)

#### Phase 43: Next.js Architecture Alignment -- COMPLETE
**Goal**: Audit all pages for modern Next.js 15+ conventions; fix legacy patterns; add metadata to all tool pages
**Depends on**: Phase 42 (all new pages exist before auditing patterns)

Audit findings addressed:
- Removed next/head (Pages Router) from Calculator.tsx
- 9 'use client' tool pages couldn't export metadata; refactored to server+client pattern
- v1.1 Phase 15 (Performance) and Phase 16 (Architecture) items resolved

Plans:
- [x] 43-01: Architecture audit, next/head removal, 9 tool pages refactored to server+client

#### Phase 44: Test Coverage & Final Verification -- COMPLETE
**Goal**: Add tests for v2.0 features, verify zero regressions across full suite
**Depends on**: Phase 43 (all code finalized before testing)

Audit findings addressed:
- v1.1 Phase 12 (Test Coverage & Infrastructure) items for v2.0 modules
- Comprehensive verification of all v2.0 changes (328 tests, 0 errors)

Plans:
- [x] 44-01: blog.ts tests (19), locations.ts tests (12), full suite verification

#### Phase 45: UI/UX Alignment & Accessibility
**Goal**: Fix navbar transparency/contrast issues, improve dark mode color tokens for WCAG AA compliance, ensure glass morphism effects render correctly, and make tagline visible across all viewports
**Depends on**: Phase 44 (testing complete, codebase verified)

Issues addressed:
- Navbar glass effect not rendering (bg-background/20 opacity not working)
- Navigation items invisible in dark mode (insufficient contrast)
- Tagline illegible (text-accent/80 too dark against navbar)
- WCAG AA accessibility failures (contrast ratios < 4.5:1)
- Dark mode color tokens too dark for transparency
- backdrop-blur-xl not applying correctly

Plans:
- [x] 45-01: Navbar dark mode, phantom CSS utilities, silent Tailwind class audit, WCAG AA fixes

</details>

### v3.0 Growth & Content (In Progress)

**Milestone Goal:** Surface all existing features to users, load real content, prove correctness with E2E tests, and optimize for performance before a marketing push.

#### Phase 46: Blog Content Seeding

**Goal**: Seed real blog posts written by the user into Neon via MCP run_sql — no code changes, pure data operation
**Depends on**: v2.0 complete (blog schema already created in Phase 42)
**Research**: Unlikely (Drizzle schema exists: blog_posts, blog_authors, blog_tags, blog_post_tags)
**Plans**: TBD

Plans:
- [x] 46-01: Fixed homelab infra, created Neon credential, wired n8n Blog Generator to auto-publish to Neon

#### Phase 47: Tools Index — All 14 Tools

**Goal**: Fix the /tools index page to list all 14 tool pages; currently shows only 3
**Depends on**: Phase 46
**Research**: Unlikely (TOOL_ROUTES constant already exists with all 14 routes)
**Plans**: TBD

Plans:
- [x] 47-01: Add 2 missing TOOL_ROUTES, expand /tools index from 3 to 13 tools with Lucide icons

#### Phase 48: National Location Pages

**Goal**: Expand location coverage from 5 Texas cities to top 50–100 major US metro areas with full SEO metadata and LocalBusiness JSON-LD
**Depends on**: Phase 47
**Research**: Unlikely (existing locations.ts + /locations/[slug] dynamic route pattern already in place)
**Plans**: TBD

Plans:
- [x] 48-01: Add getLocationsByState helper, create /locations index page, expand sitemap to 85+ entries

#### Phase 49: E2E Test Suite

**Goal**: Playwright end-to-end tests for critical user journeys — contact form submission, tool generators (paystub, invoice), and navigation flows
**Depends on**: Phase 48
**Research**: Likely (need to verify Playwright config status, check e2e/ directory, establish test patterns)
**Research topics**: Playwright config in project, existing e2e/ test files, CI integration for E2E, test data strategy
**Plans**: TBD

Plans:
- [x] 49-01: Create e2e/tools.spec.ts and e2e/locations.spec.ts (tools index + 3 generators + locations)

#### Phase 50: Performance Audit & Core Web Vitals

**Goal**: Core Web Vitals audit, bundle size review, image optimization pass — hit Lighthouse targets before marketing push
**Depends on**: Phase 49
**Research**: Likely (Next.js bundle analyzer setup, Lighthouse CI config, Core Web Vitals tooling)
**Research topics**: next/bundle-analyzer, Lighthouse CI GitHub Action, CLS/LCP/FID sources in Next.js 15 App Router
**Plans**: TBD

Plans:
- [x] 50-01: DOMPurify SSR fix, author LCP priority, bundle audit, performance infrastructure confirmed

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
| 37. Env & Config Hygiene | v2.0 | 1/1 | Complete | 2026-02-14 |
| 38. API Route Cleanup | v2.0 | 1/1 | Complete | 2026-02-14 |
| 39. Auth Decision | v2.0 | 1/1 | Complete (resolved in 37-38) | 2026-02-14 |
| 40. Tool Calculator Pages | v2.0 | 1/1 | Complete | 2026-02-14 |
| 41. Location SEO Pages | v2.0 | 1/1 | Complete | 2026-02-14 |
| 42. Blog Data Strategy | v2.0 | 1/1 | Complete | 2026-02-14 |
| 43. Next.js Architecture | v2.0 | 1/1 | Complete | 2026-02-14 |
| 44. Test & Verification | v2.0 | 1/1 | Complete | 2026-02-14 |
| 45. UI/UX Alignment | v2.0 | 1/1 | Complete | 2026-02-17 |
| 46. Blog Content Seeding | v3.0 | 1/1 | Complete | 2026-02-18 |
| 47. Tools Index — All 13 Tools | v3.0 | 1/1 | Complete | 2026-02-18 |
| 48. National Location Pages | v3.0 | 1/1 | Complete | 2026-02-18 |
| 49. E2E Test Suite | v3.0 | 1/1 | Complete | 2026-02-18 |
| 50. Performance Audit | v3.0 | 1/1 | Complete | 2026-02-18 |
