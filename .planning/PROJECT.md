# Hudson Digital Solutions Website

## What This Is

A production Next.js 15+ business website with 13 tool generators (paystub, invoice, contract, proposal, ROI calculator, cost estimator, mortgage calculator, TTL calculator, tip calculator, performance calculator, JSON formatter, meta tag generator, testimonial collector), 75 location SEO pages across 11 states, automated blog pipeline (n8n → Neon), contact forms, and comprehensive testing. v3.0 surfaced all features, loaded real content, added E2E test coverage, and validated performance infrastructure.

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

### Active

- [ ] Design system tokens overhauled: type scale, color palette, spacing rhythm, surface/card treatment — v4.0
- [ ] Homepage hero compelling: distinctive background, strong headline hierarchy, polished CTAs — v4.0
- [ ] Core components polished: buttons, inputs, cards, navbar — not generic shadcn defaults — v4.0
- [ ] Tool pages have focused, professional layout with polished form/output presentation — v4.0
- [ ] Services, About, and Location pages feel like premium landing pages — v4.0

### Out of Scope

- Changing core framework (Next.js 15+, React 19) — constraint
- Splitting database.ts (auto-generated, 6,286 lines) — not practical
- Adding JSDoc to unchanged code — contradicts CLAUDE.md
- Creating architecture documentation proactively — contradicts CLAUDE.md
- Mobile app or native — web-first
- Auth system — customer-facing website, not SaaS

## Context

**Current Codebase State (post Phase 55 — v3.1 complete):**
- ~60 npm dependencies (ESLint/Prettier and all transitive deps removed)
- 360 passing unit tests + 18 E2E tests (Playwright)
- 0 TypeScript errors, 0 Biome errors, 0 Biome warnings, 0 Biome infos
- biome.json at project root — full lint, format, CSS, React/Next.js domain config
- `bun run lint` → `biome check src/`; `bun run format` → `biome format --write src/`
- lefthook pre-commit: Biome staged-files check (block on error, no auto-fix)
- `.github/workflows/ci.yml`: "Run Biome" step
- `.vscode/settings.json`: biomejs.biome formatter for JS/TS/JSON/CSS; markdown formatter null + formatOnSave:false
- All ESLint config files deleted (eslint.config.mjs) — no residual config surface
- All Prettier config files deleted (.prettierrc.json, .prettierignore) — no residual config surface
- 4 empty catch blocks in testimonials.ts annotated with intent comment
- CLAUDE.md development commands updated to Biome/bun:test
- 13 tool pages, all server+client pattern with metadata
- 75 location pages across 11 states with LocalBusiness JSON-LD
- Automated blog pipeline (n8n auto-publishes to Neon on every generation)
- Production build generates 139 static pages cleanly
- Performance infrastructure validated: lazy-loading, WebP images, Core Web Vitals monitoring
- All Tailwind class names valid — no silent failures
- WCAG AA compliant: navbar, dark mode, mobile navigation

**Technical Debt:**
- @react-pdf/renderer incompatible with Turbopack (pre-existing, all branches)

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

## Completed Milestone: v3.1 Biome Migration — COMPLETE

**Goal:** Replace ESLint + Prettier with Biome — single Rust binary, zero npm vulnerability surface, full TypeScript/React rule parity.

**Delivered:**
- Biome 2.4.4 installed, configured with full lint/format/CSS/React/Next.js domain rules
- All ESLint and Prettier packages removed (and transitive deps)
- All config files deleted: eslint.config.mjs, .prettierrc.json, .prettierignore
- lefthook pre-commit migrated to Biome; CI renamed from ESLint to Biome
- VSCode format-on-save configured for all file types via biomejs.biome extension
- 360 unit tests passing, 139 static pages building, 0 TS errors, 0 Biome violations

---
*Last updated: 2026-02-25 starting v4.0 UI Redesign milestone*
