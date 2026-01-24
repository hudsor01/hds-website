# Phase 7: Build & Bundle Optimization - Overview

## Objective

Reduce bundle size, remove dead code and unused dependencies, and optimize build configuration for production deployment on Vercel.

**Target:** First Load JS under 180kB per route

## Current State Analysis

### Build Status
- **TypeScript Errors:** 3 unused UI components with missing dependencies
  - carousel.tsx → embla-carousel-react
  - command.tsx → cmdk
  - resizable.tsx → react-resizable-panels

### Component Analysis
- **Total Components:** 90 (all client components after Phase 6)
- **Dead UI Components Identified:** 3 (carousel, command, resizable)
- **Unused Dependencies:** 3 packages (~50KB)

### Bundle Concerns
1. All components are client components (intentional for Vercel cost optimization)
2. Unused shadcn/ui components included in build
3. Some dependencies not actively used
4. No dynamic imports for heavy components

## Success Criteria

- [ ] Build completes without TypeScript errors
- [ ] All unused UI components removed
- [ ] Unused dependencies removed from package.json
- [ ] Bundle size measured and documented
- [ ] All 342 unit tests passing
- [ ] Production build successful

## Plans

### Plan 1: Remove Dead UI Components
**Goal:** Remove unused shadcn/ui components blocking the build

**Components to Remove:**
1. `carousel.tsx` - embla-carousel-react (unused)
2. `command.tsx` - cmdk (unused)
3. `resizable.tsx` - react-resizable-panels (unused)

**Verification:** `rg "import.*from.*carousel|command|resizable"` shows zero results

### Plan 2: Remove Unused Dependencies
**Goal:** Clean up package.json and reduce node_modules size

**Dependencies to Remove:**
1. embla-carousel-react (8.6.0)
2. cmdk (1.1.1)
3. react-resizable-panels (4.3.3)

**Actions:**
- Remove from package.json
- Run `bun install` to update lockfile
- Verify build succeeds

### Plan 3: Measure & Document Bundle Size
**Goal:** Establish baseline metrics for future optimization

**Measurements:**
- First Load JS per route
- Total bundle size
- Largest chunks
- Client bundle vs Server bundle

**Tools:**
- Next.js build output
- Bundle analyzer (if needed)

### Plan 4: Final Verification
**Goal:** Ensure all optimizations work correctly

**Checks:**
- Production build succeeds
- All tests pass (342/342)
- No TypeScript errors
- Key routes load correctly

## Risk Assessment

**Low Risk:**
- Removing dead code (not imported anywhere)
- Removing unused dependencies

**Medium Risk:**
- Bundle size changes affecting performance

**Mitigation:**
- Comprehensive testing after each change
- Rollback capability via git

## Expected Outcomes

### Immediate Wins
- ✅ Build succeeds without errors
- ✅ ~3 unused components removed
- ✅ ~50KB dependencies removed
- ✅ Cleaner codebase

### Future Optimization Opportunities
- Dynamic imports for calculator components
- Image optimization review
- Code splitting strategies
- Tailwind CSS purge configuration

## Dependencies

- **Requires:** Phase 6 complete (component structure optimized)
- **Blocks:** Phase 8 (testing infrastructure depends on stable build)

## Notes

- Phase 6 converted all components to client for Vercel cost optimization
- This is intentional and should NOT be reverted
- Bundle size increase from client components is acceptable tradeoff for Vercel savings
- Focus on removing dead code, not changing architecture
