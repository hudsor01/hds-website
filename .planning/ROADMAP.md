# Roadmap: Business Website Cleanup & Simplification

## Overview

Transform a feature-complete Next.js business website from 130+ dependencies and scattered code patterns into a lean, maintainable codebase. Each phase systematically removes bloat while preserving working functionality (contact form, tool generators). The journey moves from dependency cleanup through code elimination, integration simplification, and ends with comprehensive validation that nothing broke.

## Domain Expertise

None

## Milestones

- 🚧 **v1.0 Cleanup & Simplification** - Phases 1-10 (in progress)
- 📋 **v1.1 Technical Debt Remediation** - Phases 11-18 (planned)

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

## Progress

**Execution Order:** Phases execute in numeric order: 1 → 2 → ... → 10 → 11 → ... → 18

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
| 11. Route Consolidation | v1.1 | 0/1 | Planning complete | - |
| 12. God Function Refactor | v1.1 | 0/TBD | Not started | - |
| 13. Shared Utilities Extraction | v1.1 | 0/TBD | Not started | - |
| 14. PDF Template Consolidation | v1.1 | 0/TBD | Not started | - |
| 15. Notification System Tests | v1.1 | 0/TBD | Not started | - |
| 16. PDF Generation Tests | v1.1 | 0/TBD | Not started | - |
| 17. Type Definition Optimization | v1.1 | 0/TBD | Not started | - |
| 18. Quality Gates & Prevention | v1.1 | 0/TBD | Not started | - |
