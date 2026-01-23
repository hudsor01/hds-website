# Plan 1: Audit UI Component Libraries

**Phase:** 1 - Dependency Audit & Pruning
**Created:** 2026-01-09
**Status:** Ready
**Context Budget:** ~50% (~100k tokens)

## Goal

Identify and remove unused Radix UI components and related UI libraries, reducing bundle size and maintenance overhead while preserving all working features.

## Context

**Current State:**
- 13 Radix UI component packages installed (@radix-ui/react-*)
- Additional UI libraries: lucide-react (icons), sonner (toasts), cmdk (command palette)
- class-variance-authority, tailwind-merge for styling utilities
- Unknown actual usage across codebase

**Preservation Requirements:**
- Contact form functionality (any form components used)
- Tool pages (paystub/invoice/timesheet generators)
- Navigation and layout components
- Icons used in UI

**Research:** None required - static analysis with existing tools

## Tasks

### Task 1: Scan codebase for Radix UI usage

**What:** Search all TypeScript/TSX files for Radix UI imports and component usage

**How:**
```bash
# Search for all Radix UI imports
grep -r "from '@radix-ui" src/

# List all Radix packages in package.json
grep "@radix-ui" package.json

# Create usage report
```

**Outcome:** Complete list of:
- Which Radix components are actually imported
- Which files use each component
- Which Radix packages are never referenced

**Verification:**
- [ ] All 13 Radix packages accounted for (used or unused)
- [ ] Usage report shows file paths for each import
- [ ] No false negatives (checked dynamic imports)

**Checkpoint:** If more than 8 Radix packages are unused, proceed with removal. If 7 or fewer unused, reassess trade-off of keeping for future use.

---

### Task 2: Remove unused Radix UI packages

**What:** Uninstall Radix packages that have zero imports in codebase

**How:**
```bash
# For each unused package identified in Task 1
bun remove @radix-ui/react-{package-name}

# Verify removal
bun install
```

**Outcome:**
- Reduced package.json dependencies count
- Smaller node_modules size
- Faster install times

**Verification:**
- [ ] All unused Radix packages removed from package.json
- [ ] bun install completes successfully
- [ ] No import errors when running dev server
- [ ] Contact form and tool pages still load

**Rollback Plan:** If removal breaks build:
```bash
bun add @radix-ui/react-{package-name}@{version}
```

---

### Task 3: Audit other UI libraries

**What:** Check usage of lucide-react, sonner, cmdk, embla-carousel-react

**How:**
```bash
# Check icon usage
grep -r "from 'lucide-react'" src/

# Check toast usage (sonner)
grep -r "from 'sonner'" src/
grep -r "toast\(" src/

# Check command palette (cmdk)
grep -r "from 'cmdk'" src/

# Check carousel (embla-carousel-react)
grep -r "embla" src/
```

**Outcome:** Usage report for each UI library showing:
- If library is used (yes/no)
- How many files import it
- What features depend on it

**Verification:**
- [ ] All 4 UI libraries checked
- [ ] Usage documented with file paths
- [ ] Unused libraries identified for removal

**Decision Point:** Remove any library with zero usage. Keep sonner if toast system is active, lucide-react if icons are used throughout.

## Success Criteria

- [ ] All Radix UI packages audited with usage report
- [ ] Unused Radix packages removed (estimate: 5-8 packages)
- [ ] Other UI libraries audited (lucide, sonner, cmdk, embla)
- [ ] Development server starts without errors
- [ ] Contact form renders and functions
- [ ] All tool pages load and display correctly
- [ ] No console errors related to missing UI components

## Scope Boundaries

**In Scope:**
- Auditing all UI component libraries
- Removing packages with zero imports
- Verifying features still work after removal

**Out of Scope:**
- Removing components with usage (even if light usage)
- Replacing UI libraries with alternatives
- Refactoring components to use different libraries
- Removing styling utilities (CVA, tailwind-merge) - covered in later phase

## Estimated Impact

**Before:**
- 13 Radix UI packages
- 4 additional UI libraries
- ~15-20MB in node_modules for UI alone

**After:**
- 4-6 Radix UI packages (only used ones)
- 2-3 additional UI libraries (icons + toast likely kept)
- ~6-10MB in node_modules for UI

**Bundle Size:** Expect 10-15kB reduction in first load JS from tree-shaking unused components

## Risk Assessment

**Low Risk:**
- Static analysis clearly shows unused packages
- No runtime dependency detection needed
- Easy rollback if issues arise

**Mitigation:**
- Test all pages after each removal
- Keep detailed removal log for rollback
- Verify build succeeds between removals

## Notes

- Radix UI components are headless (no styles), so removal won't affect visual design
- lucide-react uses tree-shaking, only imported icons in bundle
- sonner is likely used for toast notifications (check ToastProvider)
- cmdk may be unused leftover from initial setup
- embla-carousel-react may be for portfolio image carousels (check if portfolio exists)
