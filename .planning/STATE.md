# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Working tools and contact form stay functional while the codebase achieves production-grade quality: strict types, comprehensive test coverage, proper error handling, visual correctness, and accessible to all users.
**Current focus:** v3.0 Growth & Content (Phase 48 — National Location Pages)

## Current Position

Phase: 48 of 50 (National Location Pages)
Plan: Not started
Status: Ready to plan
Last activity: 2026-02-18 — Phase 47 complete (/tools index shows all 13 tools)

Progress: v1.0 ✅ | v1.1 partial ✅ | v2.0 ✅ | v3.0 ▓▓░░░ 2/5 phases

## Performance Metrics

**Velocity:**
- Total plans completed: 41 (30 in v1.0, 3 in v1.1, 8 in v2.0)
- Average duration: ~1 day per phase
- Total execution time: 23 days

**By Milestone:**

| Milestone | Phases | Duration | Result |
|-----------|--------|----------|--------|
| v1.0 Cleanup | 10 phases | 20 days | -21,797 net lines, 45% fewer deps |
| v1.1 Remediation | 2/7 phases | 3 days | Strict TS, @/ imports, barrel removed, loading states |
| v2.0 Audit Remediation | 8/8 phases | 1 day | SHIPPED -- API cleanup, tool pages, locations, DB blog, architecture, tests |

## Accumulated Context

### Decisions

- Aggressive dependency pruning (130+ to 72 packages) -- Good
- Standardized on TanStack ecosystem -- Good
- Migrated from Supabase to Drizzle ORM + Neon -- 2026-02-02
- database.ts left as-is (auto-generated, 6,286 lines) -- Practical
- Excluded JSDoc/architecture docs from v1.1 (contradicts CLAUDE.md) -- Intentional
- Eliminated barrel files (src/components/forms/index.ts) -- Better tree-shaking
- Removed unused admin panel (34 files, 3,716 lines) -- 2026-02-10
- v1.1 phases 12-16 deferred to v2.0 (superseded by audit findings) -- 2026-02-10
- Deleted dead auth route + @neondatabase/auth (no auth system) -- 2026-02-14
- Deleted dead n8n webhook route + workflow JSON files -- 2026-02-14
- Aggressive API cleanup: deleted 14 orphaned routes, fake admin-auth -- 2026-02-14
- No auth system needed: this is a customer-facing website, not a SaaS app -- Confirmed
- New tool pages as server components with metadata exports -- Better than existing 'use client' pattern
- Blog fully database-backed via Drizzle/Neon (replaced static arrays) -- 2026-02-14
- Used drizzle-kit push (not migrate) for schema sync -- Consistent with project workflow
- Seed data via Neon MCP run_sql (not scripts) -- No production credentials in codebase
- Blog content seeded via automated n8n pipeline, not manual insertion -- 2026-02-18
- n8n Blog Generator (workflow zVe2oKlxqHps4njw) now auto-publishes to Neon on every run

### Deferred Issues

- @react-pdf/renderer incompatible with Turbopack (pre-existing, all branches)
- database.ts at 6,286 lines (auto-generated, not actionable)
- TTL Calculator uses next/head (Pages Router pattern) -- silently ignored in App Router, Phase 43 concern
- Tools index page only lists 3 of 14 tools -- future enhancement

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-18
Stopped at: Phase 47 complete. /tools shows all 13 tools with Lucide icons and TOOL_ROUTES constants.
Resume file: None
Next action: /gsd:plan-phase 48

## Recent Completions

### Phase 47: Tools Index — All 13 Tools (Complete)
- 47-01: Added META_TAG_GENERATOR + TESTIMONIAL_COLLECTOR to TOOL_ROUTES (was 11, now 13)
- Replaced 3-item hardcoded array with 13 tools using TOOL_ROUTES constants and Lucide icons
- Metadata description updated; 329 tests pass, 0 errors

### Phase 46: Blog Content Seeding (Complete)
- 46-01: Fixed broken homelab infrastructure (PostgreSQL+n8n CrashLoopBackOff, 14 days down)
- Fixed hds_generated_blogs schema (missing cycle_number column causing silent INSERT failures)
- Created n8n Neon credential; added 3 nodes to Blog Generator for auto-publish to Neon
- Workflow now fans out: Save HDS to Postgres → (RAG Store) + (Convert MD→HTML → Neon INSERT)
- Next scheduled run at :15 will populate blog_posts in Neon automatically

### Phase 45: UI/UX Alignment & Accessibility (Complete)
- 45-01: Navbar dark mode visibility, phantom CSS utility fix, badge removal, broken links
- Fixed `--color-muted-foreground-dark` oklch(0.65→0.85) for WCAG AA compliance
- Added 34 missing @utility class definitions to globals.css (was causing site-wide layout collapse)
- Removed all Badge component usage (9 files) -- generic badges signal AI-generated code
- Fixed 4 broken calculator links (/roi-calculator etc → /tools/* via TOOL_ROUTES)
- Fixed navbar hover contrast: hover:text-accent-foreground (not text-foreground) on amber bg
- PR #120: https://github.com/hudsor01/hds-website/pull/120

### Phase 44: Test Coverage & Final Verification (Complete)
- 44-01: Added 31 tests (19 blog, 12 locations) -- 328 total passing
- blog.ts: 84% function coverage, 88% line coverage
- locations.ts: 100% function + line coverage
- Full verification: 0 TypeScript errors, 0 ESLint errors

### Phase 43: Next.js Architecture Alignment (Complete)
- 43-01: Removed next/head from Calculator.tsx, refactored 9 client tool pages to server+client pattern
- All tool pages now export SEO metadata (was impossible as 'use client' pages)
- Full codebase audit: 100% compliance with Next.js 15+ patterns
- v1.1 deferred items (Phases 15, 16) addressed

### Phase 42: Blog Data Strategy (Complete)
- 42-01: Database-backed blog + structured data maximization
- Created 4 Drizzle tables (blog_authors, blog_tags, blog_posts, blog_post_tags)
- Rewrote blog.ts with Drizzle queries (same API surface)
- Deleted 3 static blog pages (1,443 lines) -- dynamic [slug] route handles all
- Added BlogPosting + BreadcrumbList JSON-LD to blog posts
- Added BreadcrumbList JSON-LD to location pages

### Phase 41: Location SEO Pages (Complete)
- 41-01: Created /locations/[slug] with 5 Texas cities
- Server component with generateStaticParams, generateMetadata, LocalBusiness JSON-LD
- locations.ts no longer orphaned (first consumer)

### Phase 40: Tool Calculator Pages (Complete)
- 40-01: Created 4 page.tsx wrappers (ROI, Cost, Mortgage, TTL)
- Server components with metadata exports (follows CLAUDE.md)
- Fixed routes.ts: removed LOAN_CALCULATOR, renamed PAYSTUB_GENERATOR
- Fixed 3 broken links on tools index page
- 14 tool pages total, all routes verified

### Phase 39: Auth Decision (Complete -- resolved in 37-38)
- No plan needed -- all auth-related dead code already removed

### Phase 38: API Route Cleanup & Consolidation (Complete)
- 38-01: Deleted 14 orphaned routes, admin-auth.ts, broken attribution hook
- Stripped fake auth from 4 testimonial routes
- Cleaned api-endpoints.ts (15 -> 6 constants), removed 6 dead env vars
- Created paystub tool page at /tools/paystub-calculator
- Cleaned 5 dead test files/blocks
- 11 API routes remaining, all verified with consumers

### Phase 37: Environment & Configuration Hygiene (Complete)
- 37-01: Env vars through env.ts, .env.example updated, CSP fix, dead auth/n8n removed
- +35/-1,135 lines, 17 files, 1 dependency removed

### Admin Panel Removal (2026-02-10)
- Removed 34 files (admin pages, components, API routes, types, store)
- Moved shared types to types/logger.ts
- Zero TypeScript errors, zero lint errors

### Phase 11: TypeScript Strictness & Code Quality (Complete)
- 11-01: Enable noUnusedLocals/noUnusedParameters
- 11-02: Convert parent-directory imports to @/ paths, eliminate barrel file

### Phase 17: Next.js 16 Alignment (Complete)
- 17-01: Add loading.tsx to dynamic routes, clean layout/tsconfig

### Roadmap Evolution

- v1.0 created: Cleanup & simplification, 10 phases (1-10) -- 2026-01-11
- v1.0 shipped: 2026-01-30
- v1.1 created: Code review remediation, 7 phases (11-17) -- 2026-01-30
- v2.0 created: Audit remediation & feature completion, 8 phases (37-44) -- 2026-02-10
- Phase 45 added: UI/UX Alignment & Accessibility (navbar contrast, dark mode colors, WCAG AA compliance) -- 2026-02-16
- v2.0 shipped: 2026-02-17 — tagged v2.0
- v3.0 created: Growth & Content, 5 phases (46-50) -- 2026-02-18
