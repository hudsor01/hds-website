# Hudson Digital Solutions Website

## What This Is

A production Next.js 15+ business website with a premium, token-driven design system, 13 tool generators with unified ToolPageLayout, 75 location SEO pages across 11 states, automated blog pipeline (n8n → Neon), contact forms, and comprehensive testing. v4.0 transformed the UI from generic shadcn defaults to a distinctive, polished experience.

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
- Automated blog content pipeline (n8n → Neon auto-publish) — v3.0
- Tools index page listing all 13 tools — v3.0
- Location pages expanded to 75 cities across 11 states — v3.0
- E2E test coverage for critical user journeys (18 Playwright tests) — v3.0
- Performance infrastructure validated (bundle audit, lazy-loading, Core Web Vitals) — v3.0
- Production build verified (129 static pages generate cleanly) — v3.0
- Biome 2.4.4 as sole linter/formatter: lint/format/CSS/React/Next.js domains configured — v3.1
- Developer workflow fully Biome-native: scripts, lefthook, CI, VSCode format-on-save — v3.1
- Zero ESLint/Prettier dependency surface: all packages and config files removed — v3.1
- 360 passing unit tests + 139 static pages with 0 TS errors, 0 Biome violations — v3.1
- OKLCH design token system: brand colors, typography, spacing, shadows, surface elevation — v4.0
- Premium homepage hero with grid-pattern + spotlight, strong headline hierarchy, polished CTAs — v4.0
- Core components polished: Button CVA variants, Input error states, Card glass/testimonial, Navbar/Footer — v4.0
- ToolPageLayout unified 12/13 tool pages with slot-based API and action bars (download/print/copy) — v4.0
- Content pages premium treatment: Services Server Component, About/Contact hero overlays, Location trust signals — v4.0
- 408 passing unit tests + 144 static pages with 0 TS errors, 0 Biome violations — v4.0

### Active

(None — next milestone requirements TBD)

### Out of Scope

- Changing core framework (Next.js 15+, React 19) — constraint
- Splitting database.ts (auto-generated, 6,286 lines) — not practical
- Adding JSDoc to unchanged code — contradicts CLAUDE.md
- Creating architecture documentation proactively — contradicts CLAUDE.md
- Mobile app or native — web-first
- Auth system — customer-facing website, not SaaS

## Context

**Current Codebase State (post v4.0 — UI Redesign complete):**
- 408 passing unit tests + E2E scaffold (Playwright)
- 144 static pages generating cleanly
- 0 TypeScript errors, 0 Biome violations
- OKLCH design token system in globals.css consumed by all pages and components
- ToolPageLayout shared component: 12/13 tools unified with slot-based API
- Premium hero overlays on Homepage, Services, About, Contact, Location pages
- Biome 2.4.4 sole linter/formatter; lefthook pre-commit
- 75 location pages, automated blog pipeline, 13 tool generators

**Technical Debt:**
- @react-pdf/renderer incompatible with Turbopack (pre-existing)
- TTL Calculator on legacy Calculator component (not ToolPageLayout)
- Tip Calculator results inside formSlot (no action bar)
- Phase 58 missing VERIFICATION.md (evidence in 58-04-SUMMARY.md)

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
| Auto-publish blog posts to Neon | No manual curation, automated pipeline | ✓ Good — n8n runs every 2h, content flows automatically |
| DOMPurify `typeof window` guard | Trusted n8n content, no XSS risk | ✓ Good — build works, sanitization runs client-side |
| No @next/bundle-analyzer | Audit sufficient without formal tool | ✓ Good — lazy-loading already correct |
| No Lighthouse CI GitHub Action | Real-user metrics via @vercel/speed-insights | ✓ Good — production data > synthetic scores |
| biome migrate eslint not used | eslint-config-next cyclic reference (issue #2935, closed) | ✓ Good — hand-tuned biome.json instead |
| 15 recommended Biome rules disabled | Fire on clean code with no ESLint equivalent; no suppression comments | ✓ Good — 0-violation baseline without suppression |
| Rule gaps accepted (no-duplicate-imports, react-hooks/set-state-in-effect) | No Biome 2.4.4 equivalent; codebase clean of violations | ✓ Accepted — organizeImports covers merge case |
| CLEN-03 format sweep satisfied by Phase 53 | Phase 53 commit 3042e73 was the de-facto reformat — Phase 54 sweep was a confirmed no-op | ✓ Good — clean git history, no duplicate churn |
| lefthook uses `{staged_files}` not `--staged` | Official lefthook docs use the lefthook variable syntax, not the Biome flag | ✓ Correct — per official lefthook + Biome docs |
| Prettier removed entirely (not kept for markdown) | v3.1 goal was zero ESLint/Prettier surface — partial removal would leave residual surface | ✓ Good — biomejs.biome handles all file types |
| VSCode markdown formatter set to null | Prevents "formatter not found" error after Prettier removal; markdown has no biome formatter | ✓ Correct — no false extension errors in editor |
| All ESLint transitive deps removed | Full removal (eslint, eslint-config-next, @typescript-eslint/*, @rushstack/*, eslint-plugin-react-hooks) | ✓ Good — zero npm audit surface from linting deps |
| OKLCH color space for design tokens | More perceptually uniform than HSL | ✓ Good — consistent brand palette across light/dark |
| Stay with Tailwind + shadcn for redesign | CSS tokens and overrides, no library swap | ✓ Good — minimal dependency change, maximum visual impact |
| ToolPageLayout slot-based API | formSlot/resultSlot ReactNode props | ✓ Good — tools pass JSX, layout handles structure |
| Programmatic pdf().toBlob() for downloads | Replaced PDFDownloadLink for ToolPageLayout compatibility | ✓ Good — works with action bar pattern |
| ServicesGrid/ProcessSteps as client components | Icon functions can't serialize across server-client boundary | ✓ Correct — Next.js SSG limitation |

## Completed Milestone: v4.0 UI Redesign — COMPLETE

**Goal:** Transform the site from generic shadcn defaults to a premium, distinctive UI.

**Delivered:**
- OKLCH design token system (brand colors, typography, spacing, shadows, surfaces)
- Premium homepage hero with grid-pattern + spotlight overlays
- Polished core components (Button, Input, Card, Navbar, Footer)
- ToolPageLayout unified 12/13 tool pages with action bars
- Content pages (Services, About, Contact, Locations) with premium treatment
- 408 unit tests, 144 static pages, 0 errors

---
*Last updated: 2026-03-03 after v4.0 UI Redesign milestone*
