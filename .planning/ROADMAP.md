# Roadmap: Business Website Cleanup & Simplification

## Overview

Transform a feature-complete Next.js business website from 130+ dependencies and scattered code patterns into a lean, maintainable codebase. Each phase systematically removes bloat while preserving working functionality (contact form, tool generators). The journey moves from dependency cleanup through code elimination, integration simplification, and ends with comprehensive validation that nothing broke.

## Domain Expertise

None

## Milestones

- 🚧 **v1.0 Cleanup & Simplification** - Phases 1-10 (in progress)
- 📋 **v1.1 Technical Debt Remediation** - Phases 11-18 (planned)
- 📋 **v2.0 Backend Migration** - Phases 19-26 (planned) - Migrate from Supabase to Neon + Bun.SQL + Drizzle ORM

## Phases

### 🚧 v1.0 Cleanup & Simplification (In Progress)

**Milestone Goal:** Remove bloat and simplify codebase while preserving working functionality

- [ ] **Phase 1: Dependency Audit & Pruning** - Identify and remove unused npm packages
- [ ] **Phase 2: Dead Code Elimination** - Remove unused components, functions, and files
- [ ] **Phase 3: Integration Cleanup** - Remove/simplify over-engineered integrations
- [ ] **Phase 4: Code Deduplication** - Eliminate DRY violations and consolidate patterns
- [ ] **Phase 5: Configuration Simplification** - Clean up config files, extract magic numbers
- [ ] **Phase 6: Component Structure Optimization** - Remove unnecessary abstractions
- [ ] **Phase 7: Build & Bundle Optimization** - Tree-shake, reduce first load JS
- [ ] **Phase 8: Testing Infrastructure Review** - Simplify testing setup
- [ ] **Phase 9: Documentation & Environment** - Create .env.example and clean docs
- [ ] **Phase 10: Final Validation & Verification** - End-to-end testing of all features

### 📋 v1.1 Technical Debt Remediation (Planned)

**Milestone Goal:** Systematically address structural technical debt identified in codebase analysis - eliminate duplication, improve testability, and prevent future debt accumulation

- [ ] **Phase 11: Route Consolidation** - Delete duplicate route structure (6,440 LOC)
- [ ] **Phase 12: God Function Refactor** - Split submitContactForm into focused functions
- [ ] **Phase 13: Shared Utilities Extraction** - Create reusable utilities for duplicated patterns
- [ ] **Phase 14: PDF Template Consolidation** - Extract shared template components
- [ ] **Phase 15: Notification System Tests** - Add comprehensive tests for notifications
- [ ] **Phase 16: PDF Generation Tests** - Add tests for PDF generation (2,145 LOC)
- [ ] **Phase 17: Type Definition Optimization** - Split/optimize database types (10K+ LOC)
- [ ] **Phase 18: Quality Gates & Prevention** - Implement automated quality gates

## Phase Details

### 🚧 v1.0 Cleanup & Simplification

#### Phase 1: Dependency Audit & Pruning
**Goal**: Remove unused packages from the 130+ npm dependencies, reducing installation size and attack surface
**Depends on**: Nothing (first phase)
**Research**: Unlikely (package.json analysis, tooling like depcheck)
**Plans**: 5 plans created

Plans:
- [ ] 01-01: Audit Radix UI and UI libraries
- [ ] 01-02: Audit React Query, TanStack, Zustand
- [ ] 01-03: Audit tsx, sharp, vercel CLI
- [ ] 01-04: Audit Testing Library, MSW, Playwright
- [ ] 01-05: Final cleanup and verification

#### Phase 2: Dead Code Elimination
**Goal**: Remove orphaned components, unused functions, commented code, and exports that aren't imported anywhere
**Depends on**: Phase 1 (cleaner dependency tree makes dead code more obvious)
**Research**: Unlikely (static analysis with existing tools)
**Plans**: TBD

Plans:
- [ ] 02-01: TBD (run /gsd:plan-phase 2 to break down)

#### Phase 3: Integration Cleanup
**Goal**: Remove or simplify over-engineered integrations (unused Supabase auth, disabled analytics features, unnecessary services)
**Depends on**: Phase 2 (know what's dead before removing integrations)
**Research**: Likely (need to verify if Supabase auth is used, how to safely remove)
**Research topics**: Supabase client removal patterns, analytics cleanup without breaking deployment
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

#### Phase 4: Code Deduplication
**Goal**: Consolidate duplicated logic identified in concerns (contact form duplication, repeated patterns)
**Depends on**: Phase 3 (cleaner integration layer before consolidating patterns)
**Research**: Unlikely (internal refactoring using established patterns)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

#### Phase 5: Configuration Simplification
**Goal**: Extract hardcoded configuration values to constants, clean up unnecessary config files
**Depends on**: Phase 4 (consolidated code makes config needs clearer)
**Research**: Unlikely (internal organization, no external dependencies)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

#### Phase 6: Component Structure Optimization
**Goal**: Remove unnecessary abstractions, flatten overly nested component hierarchies
**Depends on**: Phase 5 (clear configuration makes component responsibilities obvious)
**Research**: Unlikely (internal React patterns, server component optimization)
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

#### Phase 7: Build & Bundle Optimization
**Goal**: Tree-shake unused code, reduce first load JS under 180kB, improve build speed
**Depends on**: Phase 6 (optimized components reduce bundle size)
**Research**: Likely (Next.js bundle analyzer, tree-shaking techniques)
**Research topics**: Next.js 16 bundle optimization, dynamic imports strategy, Tailwind purge configuration
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

#### Phase 8: Testing Infrastructure Review
**Goal**: Simplify testing setup while maintaining coverage for critical paths (contact form, tool generators)
**Depends on**: Phase 7 (smaller bundle = faster tests)
**Research**: Unlikely (existing Playwright + Bun test patterns)
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

#### Phase 9: Documentation & Environment
**Goal**: Create missing .env.example, clean up documentation, remove stale comments
**Depends on**: Phase 8 (final codebase state clear)
**Research**: Unlikely (documentation and environment setup)
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

#### Phase 10: Final Validation & Verification
**Goal**: End-to-end manual testing of all core features (contact form, paystub/invoice/timesheet generators) to ensure zero regression
**Depends on**: Phase 9 (all cleanup complete)
**Research**: Unlikely (manual testing and verification)
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

---

### 📋 v1.1 Technical Debt Remediation

#### Phase 11: Route Consolidation
**Goal**: Delete duplicate `src/app/tools/` directory, keeping only `(tools)` route group - removes 6,440 LOC of duplicate code
**Depends on**: Phase 10 (v1.0 complete)
**Research**: Unlikely (Next.js route groups are well-documented)
**Plans**: 1 plan created

**Technical Debt Context:**
- Two parallel route structures exist: `src/app/tools/` and `src/app/(tools)/`
- Creates maintenance burden: bugs must be fixed in two places
- Version drift already occurring between the two
- Estimated annual cost: $8,400 in wasted developer time

Plans:
- [ ] 11-01: Delete duplicate route structure and verify build

#### Phase 12: God Function Refactor
**Goal**: Split `submitContactForm` (95 lines, 11 responsibilities) into focused, testable functions
**Depends on**: Phase 11
**Research**: Unlikely (internal refactoring)
**Plans**: TBD

**Technical Debt Context:**
- Located at `src/app/actions/contact.ts:30`
- Handles: validation, rate limiting, security, email, notifications, scheduling, logging, analytics
- Marked with TODO: "ANTI-PATTERN - GOD FUNCTION"
- Cannot unit test individual responsibilities
- High risk of regression on changes

Plans:
- [ ] 12-01: TBD

#### Phase 13: Shared Utilities Extraction
**Goal**: Create centralized utilities for duplicated patterns (number generators, storage keys, date formatting)
**Depends on**: Phase 12
**Research**: Unlikely (internal patterns)
**Plans**: TBD

**Technical Debt Context:**
- `generateInvoiceNumber()` duplicated across 6+ files
- Storage key generation (`const STORAGE_KEY = 'hds-...'`) repeated everywhere
- No centralized `src/lib/utils/generators.ts`

Plans:
- [ ] 13-01: TBD

#### Phase 14: PDF Template Consolidation
**Goal**: Extract shared components from PDF templates, reduce 30-40% duplication across 2,145 LOC
**Depends on**: Phase 13
**Research**: Unlikely (internal React/HTML patterns)
**Plans**: TBD

**Technical Debt Context:**
- 5 PDF template files totaling 2,145 lines
- No shared template abstractions or composition patterns
- Likely 30-40% duplicate HTML/JSX structure
- Missing utility functions for common table/section patterns

Plans:
- [ ] 14-01: TBD

#### Phase 15: Notification System Tests
**Goal**: Add comprehensive unit tests for `src/lib/notifications.ts` (387 LOC, 0% coverage)
**Depends on**: Phase 14
**Research**: Unlikely (existing test patterns in codebase)
**Plans**: TBD

**Technical Debt Context:**
- Zero test coverage on critical notification system
- Slack and Discord functions are 95% duplicate (also a refactor opportunity)
- Production bugs likely without tests

Plans:
- [ ] 15-01: TBD

#### Phase 16: PDF Generation Tests
**Goal**: Add integration tests for PDF generation covering all 5 templates
**Depends on**: Phase 15
**Research**: Unlikely (existing Playwright patterns)
**Plans**: TBD

**Technical Debt Context:**
- 2,145 lines of PDF generation code with 0% test coverage
- Revenue-critical feature (user-facing downloads)
- Complex template logic prone to regression

Plans:
- [ ] 16-01: TBD

#### Phase 17: Type Definition Optimization
**Goal**: Split/optimize `src/types/database.ts` (6,286 lines) and generated schema (4,303 lines)
**Depends on**: Phase 16
**Research**: Unlikely (TypeScript organization patterns)
**Plans**: TBD

**Technical Debt Context:**
- Two parallel database type definitions (`database.ts` vs `database-local.ts`)
- 10K+ lines of type definitions
- Bundle size and tree-shaking concerns
- No clear separation of concerns

Plans:
- [ ] 17-01: TBD

#### Phase 18: Quality Gates & Prevention
**Goal**: Implement automated quality gates (complexity checks, duplication detection, coverage requirements)
**Depends on**: Phase 17
**Research**: Likely (lefthook configuration, CI/CD integration patterns)
**Research topics**: Lefthook pre-commit hooks, GitHub Actions quality gates, complexity metrics tools
**Plans**: TBD

**Technical Debt Context:**
- No automated prevention of new debt
- Need: file size limits, complexity thresholds, coverage requirements
- Prevent future debt accumulation

Plans:
- [ ] 18-01: TBD

---

### 📋 v2.0 Backend Migration (Planned)

**Milestone Goal:** Complete backend rewrite - migrate from Supabase SDK to Neon PostgreSQL + Bun.SQL + Drizzle ORM + Neon Auth for zero npm database dependencies, 50% faster queries, and unified auth-in-database architecture.

**Design Document:** docs/plans/2026-01-22-backend-migration-neon-design.md

- [ ] **Phase 19: Neon Project Setup** - Create Neon project, configure connection pooling, set up environment
- [ ] **Phase 20: Database Migration** - Export Supabase data with pg_dump, import to Neon with pg_restore
- [ ] **Phase 21: Drizzle Schema Creation** - Convert Supabase types to Drizzle schema, configure drizzle-kit
- [ ] **Phase 22: Auth Migration** - Export Supabase users, enable Neon Auth, import users with password hashes
- [ ] **Phase 23: RLS Policy Migration** - Update RLS policies for Neon (auth.uid() → auth.user_id(), anon → anonymous)
- [ ] **Phase 24: Data Layer Rewrite** - Convert all Supabase queries to Drizzle ORM (~25 files)
- [ ] **Phase 25: Auth Integration** - Replace @supabase/ssr with Neon Auth SDK, update middleware
- [ ] **Phase 26: Validation & Cleanup** - Run all tests, verify all features, remove Supabase dependencies

#### Phase 19: Neon Project Setup
**Goal**: Create Neon project with matching PostgreSQL version, configure connection pooling, set up environment variables
**Depends on**: Phase 18 (v1.1 complete)
**Research**: Likely (Neon console setup, connection string formats)
**Research topics**: Neon project creation, pooler vs direct connection, SSL configuration
**Plans**: TBD

Plans:
- [ ] 19-01: TBD

#### Phase 20: Database Migration
**Goal**: Export all data from Supabase PostgreSQL and import to Neon using pg_dump/pg_restore
**Depends on**: Phase 19
**Research**: Unlikely (standard PostgreSQL tooling)
**Plans**: TBD

**Migration Context:**
- Use `pg_dump -Fc` for compressed custom format
- Use `--no-owner --no-acl` flags (Supabase-specific ownership)
- Verify row counts match after migration
- Keep backup until fully validated

Plans:
- [ ] 20-01: TBD

#### Phase 21: Drizzle Schema Creation
**Goal**: Convert `src/types/database.ts` (6,286 lines) to Drizzle schema files, configure drizzle-kit for migrations
**Depends on**: Phase 20
**Research**: Likely (Drizzle schema patterns, Bun.SQL integration)
**Research topics**: Drizzle schema definition, drizzle-kit introspection, Bun.SQL driver setup
**Plans**: TBD

**Schema Context:**
- 17+ tables to define in Drizzle
- Generate types from schema (replaces Supabase generated types)
- Set up `src/lib/schema/` directory structure
- Configure `drizzle.config.ts`

Plans:
- [ ] 21-01: TBD

#### Phase 22: Auth Migration
**Goal**: Export Supabase auth users, enable Neon Auth (Better Auth), import users preserving password hashes
**Depends on**: Phase 21
**Research**: Likely (Neon Auth setup, user migration scripts)
**Research topics**: Neon Auth SDK, Stack Auth API, bcrypt password hash preservation
**Plans**: TBD

**Auth Migration Context:**
- Export users with `auth.users` + `auth.identities` join
- Neon Auth assigns new user IDs (need remapping)
- Password hashes preserved in Modular Crypt Format
- OAuth users continue working (Google, GitHub, etc.)

Plans:
- [ ] 22-01: TBD

#### Phase 23: RLS Policy Migration
**Goal**: Update all Row-Level Security policies for Neon Auth compatibility
**Depends on**: Phase 22
**Research**: Unlikely (SQL policy updates)
**Plans**: TBD

**RLS Context:**
- Replace `auth.uid()` with `auth.user_id()` in all policies
- Replace `anon` role with `anonymous` role
- Update GRANT statements for new role names
- Test each policy with authenticated/anonymous requests

Plans:
- [ ] 23-01: TBD

#### Phase 24: Data Layer Rewrite
**Goal**: Convert all Supabase query builder calls to Drizzle ORM queries (~25 files, ~88 queries)
**Depends on**: Phase 23
**Research**: Unlikely (Drizzle query patterns)
**Plans**: TBD

**Files to Update:**
- `src/lib/case-studies.ts` - Case study queries
- `src/lib/testimonials.ts` - Testimonial queries
- `src/lib/help-articles.ts` - Help article queries
- `src/lib/projects.ts` - Project queries
- `src/lib/scheduled-emails.ts` - Email scheduling queries
- `src/app/api/**/route.ts` - All API routes
- `src/app/actions/*.ts` - All Server Actions
- `src/lib/logger.ts` - Error logging inserts

Plans:
- [ ] 24-01: TBD

#### Phase 25: Auth Integration
**Goal**: Replace `@supabase/ssr` with Neon Auth SDK, update middleware, auth wrapper, and admin auth
**Depends on**: Phase 24
**Research**: Likely (Neon Auth SDK, Stack provider setup)
**Research topics**: NeonAuthUIProvider, stackServerApp, access token context
**Plans**: TBD

**Files to Update:**
- `src/lib/supabase/server.ts` → Delete, replace with Neon Auth
- `src/lib/supabase/client.ts` → Delete, replace with Neon Auth
- `src/lib/supabase/middleware.ts` → Delete, replace with Neon Auth
- `src/lib/admin-auth.ts` → Update to use Neon Auth
- `src/components/admin/AuthWrapper.tsx` → Update to use Neon Auth
- `middleware.ts` → Update session handling
- `src/app/layout.tsx` → Add auth providers

Plans:
- [ ] 25-01: TBD

#### Phase 26: Validation & Cleanup
**Goal**: Run all tests, manually verify all features, remove Supabase dependencies, update environment variables
**Depends on**: Phase 25
**Research**: Unlikely (testing and cleanup)
**Plans**: TBD

**Validation Checklist:**
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Contact form works (submit, email, notifications)
- [ ] Paystub generator works (generate, PDF download)
- [ ] Invoice generator works (generate, PDF download)
- [ ] Contract generator works (generate, PDF download)
- [ ] Admin login works
- [ ] Admin dashboard loads data
- [ ] No Supabase imports remain in codebase
- [ ] `@supabase/supabase-js` removed from package.json
- [ ] `@supabase/ssr` removed from package.json
- [ ] Build succeeds with no TypeScript errors

Plans:
- [ ] 26-01: TBD

## Progress

**Execution Order:** Phases execute in numeric order: 1 → 2 → ... → 10 → 11 → ... → 18 → 19 → ... → 26

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Dependency Audit & Pruning | v1.0 | 0/5 | Planning complete | - |
| 2. Dead Code Elimination | v1.0 | 0/TBD | Not started | - |
| 3. Integration Cleanup | v1.0 | 0/TBD | Not started | - |
| 4. Code Deduplication | v1.0 | 0/TBD | Not started | - |
| 5. Configuration Simplification | v1.0 | 0/TBD | Not started | - |
| 6. Component Structure Optimization | v1.0 | 0/TBD | Not started | - |
| 7. Build & Bundle Optimization | v1.0 | 0/TBD | Not started | - |
| 8. Testing Infrastructure Review | v1.0 | 0/TBD | Not started | - |
| 9. Documentation & Environment | v1.0 | 0/TBD | Not started | - |
| 10. Final Validation & Verification | v1.0 | 0/TBD | Not started | - |
| 11. Route Consolidation | v1.1 | 1/1 | Complete | 2026-01-21 |
| 12. God Function Refactor | v1.1 | 0/TBD | Not started | - |
| 13. Shared Utilities Extraction | v1.1 | 0/TBD | Not started | - |
| 14. PDF Template Consolidation | v1.1 | 0/TBD | Not started | - |
| 15. Notification System Tests | v1.1 | 0/TBD | Not started | - |
| 16. PDF Generation Tests | v1.1 | 0/TBD | Not started | - |
| 17. Type Definition Optimization | v1.1 | 0/TBD | Not started | - |
| 18. Quality Gates & Prevention | v1.1 | 0/TBD | Not started | - |
| 19. Neon Project Setup | v2.0 | 0/TBD | Not started | - |
| 20. Database Migration | v2.0 | 0/TBD | Not started | - |
| 21. Drizzle Schema Creation | v2.0 | 0/TBD | Not started | - |
| 22. Auth Migration | v2.0 | 0/TBD | Not started | - |
| 23. RLS Policy Migration | v2.0 | 0/TBD | Not started | - |
| 24. Data Layer Rewrite | v2.0 | 0/TBD | Not started | - |
| 25. Auth Integration | v2.0 | 0/TBD | Not started | - |
| 26. Validation & Cleanup | v2.0 | 0/TBD | Not started | - |
