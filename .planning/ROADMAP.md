# Roadmap: Business Website Cleanup & Simplification

## Overview

Transform a feature-complete Next.js business website from 130+ dependencies and scattered code patterns into a lean, maintainable codebase. Each phase systematically removes bloat while preserving working functionality (contact form, tool generators). The journey moves from dependency cleanup through code elimination, integration simplification, and ends with comprehensive validation that nothing broke.

## Domain Expertise

None

## Phases

- [x] **Phase 1: Dependency Audit & Pruning** - Identify and remove unused npm packages
- [ ] **Phase 2: Dead Code Elimination** - Remove unused components, functions, and files
- [ ] **Phase 3: Integration Cleanup** - Remove/simplify over-engineered integrations
- [ ] **Phase 4: Code Deduplication** - Eliminate DRY violations and consolidate patterns
- [ ] **Phase 5: Configuration Simplification** - Clean up config files, extract magic numbers
- [ ] **Phase 6: Component Structure Optimization** - Remove unnecessary abstractions
- [ ] **Phase 7: Build & Bundle Optimization** - Tree-shake, reduce first load JS
- [ ] **Phase 8: Testing Infrastructure Review** - Simplify testing setup
- [ ] **Phase 9: Documentation & Environment** - Create .env.example and clean docs
- [ ] **Phase 10: Final Validation & Verification** - End-to-end testing of all features

## Phase Details

### Phase 1: Dependency Audit & Pruning
**Goal**: Remove unused packages from the 130+ npm dependencies, reducing installation size and attack surface
**Depends on**: Nothing (first phase)
**Research**: Unlikely (package.json analysis, tooling like depcheck)
**Plans**: 5 plans created

1. PLAN-01-ui-components.md - Audit Radix UI and UI libraries
2. PLAN-02-state-management.md - Audit React Query, TanStack, Zustand
3. PLAN-03-build-tools.md - Audit tsx, sharp, vercel CLI
4. PLAN-04-testing.md - Audit Testing Library, MSW, Playwright
5. PLAN-05-cleanup-verification.md - Final cleanup and verification

### Phase 2: Dead Code Elimination
**Goal**: Remove orphaned components, unused functions, commented code, and exports that aren't imported anywhere
**Depends on**: Phase 1 (cleaner dependency tree makes dead code more obvious)
**Research**: Unlikely (static analysis with existing tools)
**Plans**: 4 plans created

1. PLAN-01-orphaned-components.md - Find and remove unused components
2. PLAN-02-unused-exports.md - Remove exports with zero imports
3. PLAN-03-commented-code.md - Clean commented code and dead imports
4. PLAN-04-final-verification.md - Comprehensive verification and documentation

### Phase 3: Integration Cleanup
**Goal**: Remove or simplify over-engineered integrations (unused Supabase auth, disabled analytics features, unnecessary services)
**Depends on**: Phase 2 (know what's dead before removing integrations)
**Research**: Likely (need to verify if Supabase auth is used, how to safely remove)
**Research topics**: Supabase client removal patterns, analytics cleanup without breaking deployment
**Plans**: TBD

Plans will be determined during phase planning.

### Phase 4: Code Deduplication
**Goal**: Consolidate duplicated logic identified in concerns (contact form duplication, repeated patterns)
**Depends on**: Phase 3 (cleaner integration layer before consolidating patterns)
**Research**: Unlikely (internal refactoring using established patterns)
**Plans**: TBD

Plans will be determined during phase planning.

### Phase 5: Configuration Simplification
**Goal**: Extract hardcoded configuration values to constants, clean up unnecessary config files
**Depends on**: Phase 4 (consolidated code makes config needs clearer)
**Research**: Unlikely (internal organization, no external dependencies)
**Plans**: TBD

Plans will be determined during phase planning.

### Phase 6: Component Structure Optimization
**Goal**: Remove unnecessary abstractions, flatten overly nested component hierarchies
**Depends on**: Phase 5 (clear configuration makes component responsibilities obvious)
**Research**: Unlikely (internal React patterns, server component optimization)
**Plans**: TBD

Plans will be determined during phase planning.

### Phase 7: Build & Bundle Optimization
**Goal**: Tree-shake unused code, reduce first load JS under 180kB, improve build speed
**Depends on**: Phase 6 (optimized components reduce bundle size)
**Research**: Likely (Next.js bundle analyzer, tree-shaking techniques)
**Research topics**: Next.js 16 bundle optimization, dynamic imports strategy, Tailwind purge configuration
**Plans**: TBD

Plans will be determined during phase planning.

### Phase 8: Testing Infrastructure Review
**Goal**: Simplify testing setup while maintaining coverage for critical paths (contact form, tool generators)
**Depends on**: Phase 7 (smaller bundle = faster tests)
**Research**: Unlikely (existing Playwright + Bun test patterns)
**Plans**: TBD

Plans will be determined during phase planning.

### Phase 9: Documentation & Environment
**Goal**: Create missing .env.example, clean up documentation, remove stale comments
**Depends on**: Phase 8 (final codebase state clear)
**Research**: Unlikely (documentation and environment setup)
**Plans**: TBD

Plans will be determined during phase planning.

### Phase 10: Final Validation & Verification
**Goal**: End-to-end manual testing of all core features (contact form, paystub/invoice/timesheet generators) to ensure zero regression
**Depends on**: Phase 9 (all cleanup complete)
**Research**: Unlikely (manual testing and verification)
**Plans**: TBD

Plans will be determined during phase planning.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Dependency Audit & Pruning | 5/5 | ✅ Complete | 2026-01-09 |
| 2. Dead Code Elimination | 0/4 | Planning complete | - |
| 3. Integration Cleanup | 0/TBD | Not started | - |
| 4. Code Deduplication | 0/TBD | Not started | - |
| 5. Configuration Simplification | 0/TBD | Not started | - |
| 6. Component Structure Optimization | 0/TBD | Not started | - |
| 7. Build & Bundle Optimization | 0/TBD | Not started | - |
| 8. Testing Infrastructure Review | 0/TBD | Not started | - |
| 9. Documentation & Environment | 0/TBD | Not started | - |
| 10. Final Validation & Verification | 0/TBD | Not started | - |
