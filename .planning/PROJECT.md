# Hudson Digital Solutions Website

## What This Is

A production Next.js 15+ business website with tool generators (paystub, invoice, contract, proposal, ROI calculator, cost estimator, mortgage calculator, TTL calculator, tip calculator, performance calculator, JSON formatter, meta tag generator), location SEO pages (5 Texas cities), database-backed blog (Drizzle/Neon), contact forms, and comprehensive testing. v2.0 completed full audit remediation with 329 passing tests, zero TypeScript errors, zero lint errors, and full WCAG AA compliance.

## Core Value

Working tools and contact form stay functional while the codebase achieves production-grade quality: strict types, comprehensive test coverage, proper error handling, visual correctness, and accessible to all users.

## Requirements

### Validated

- Contact form with email delivery (Resend integration) — v1.0
- Tool pages: paystub, invoice, contract, proposal generators — v1.0
- Next.js 15+ App Router with React Server Components — v1.0
- TypeScript strict mode for type safety — v1.0
- Tailwind CSS utility-first styling — v1.0
- PDF generation capability (Puppeteer + Stirling) — v1.0
- Server Actions for form processing — v1.0
- Vercel deployment configuration — v1.0
- Dependency reduction (130+ to 72 packages) — v1.0
- Component reorganization (forms/, utilities/, calculators/) — v1.0
- Comprehensive .env.example template — v1.0
- 334 passing unit tests, 0 TypeScript errors, 0 lint warnings — v1.0
- noUnusedLocals/noUnusedParameters enabled in TypeScript — v1.1
- Standardized @/ absolute import paths — v1.1
- All env vars validated through env.ts (@t3-oss/env-nextjs) — v2.0
- 14 tool pages with correct routes and server+client metadata pattern — v2.0
- /locations/[slug] SEO pages with LocalBusiness JSON-LD (5 Texas cities) — v2.0
- Database-backed blog with BlogPosting + BreadcrumbList JSON-LD — v2.0
- All API routes verified with real consumers (11 routes, 14 orphans deleted) — v2.0
- 329 passing tests, 0 TypeScript errors, 0 ESLint errors — v2.0
- WCAG AA contrast compliance: navbar, dark mode, mobile nav — v2.0
- All Tailwind class names valid (no silent failures) — v2.0

### Active

- [ ] Expand location pages beyond Texas (5 cities → multi-state)
- [ ] Tools index page listing all 14 tools (currently shows only 3)
- [ ] Performance optimization: Core Web Vitals, bundle size audit
- [ ] E2E tests for critical user journeys (contact form, tool generators)

### Out of Scope

- Changing core framework (Next.js 15+, React 19) — constraint
- Splitting database.ts (auto-generated, 6,286 lines) — not practical
- Adding JSDoc to unchanged code — contradicts CLAUDE.md
- Creating architecture documentation proactively — contradicts CLAUDE.md
- Mobile app or native — web-first
- Auth system — customer-facing website, not SaaS

## Context

**Current Codebase State (post v2.0):**
- 72 npm dependencies
- 329 passing unit tests
- 0 TypeScript errors, 0 ESLint errors
- 14 tool pages, all server+client pattern with metadata
- 5 Texas location pages with LocalBusiness JSON-LD
- Database-backed blog (Drizzle/Neon, 4 tables)
- All Tailwind class names valid — no silent failures
- WCAG AA compliant: navbar, dark mode, mobile navigation

**Technical Debt:**
- @react-pdf/renderer incompatible with Turbopack (pre-existing, all branches)
- Tools index page lists only 3 of 14 tools
- Location pages only cover Texas (5 cities)
- No E2E test coverage for critical user flows

## Constraints

- **Tech Stack**: Next.js 15+ + React 19 (no framework changes)
- **Type Safety**: TypeScript strict mode non-negotiable
- **URL Stability**: Tool pages at current paths (no breaking routes)
- **Deployment**: Vercel configuration preserved
- **Feature Parity**: Zero regression on working features
- **CLAUDE.md**: All changes must comply with project coding standards

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Aggressive dependency pruning | 130+ packages, many unused | ✓ Good — 72 packages, zero regressions |
| Remove Supabase auth middleware | Not actively used | ✓ Good — simplified codebase |
| Standardize TanStack ecosystem | Consistent data/form handling | ✓ Good — Query + Form + nuqs |
| Keep database.ts as-is | Auto-generated, splitting impractical | ✓ Practical — avoid maintenance burden |
| Skip JSDoc/architecture docs | Contradicts CLAUDE.md guidelines | ✓ Intentional — respect project standards |
| Migrated from Supabase to Drizzle ORM + Neon | Better control, no vendor lock-in | ✓ Good — clean schema, type-safe queries |
| No auth system | Customer-facing website, not SaaS | ✓ Correct — removed all dead auth code |
| Database-backed blog via Drizzle | Same API surface as static array | ✓ Good — real content, structured data |
| Seed data via Neon MCP run_sql | No production credentials in codebase | ✓ Good — clean security boundary |
| Fix Tailwind at code level, not globals.css | Align to existing tokens not grow CSS | ✓ Good — 38+ files fixed, globals stays lean |
| Server+client pattern for tool pages | 'use client' prevents metadata export | ✓ Good — SEO metadata now works on all tools |

---
*Last updated: 2026-02-17 after v2.0 milestone*
