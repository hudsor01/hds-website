# Plan 1: Find and Remove Orphaned Components

**Phase:** 2 - Dead Code Elimination
**Created:** 2026-01-09
**Status:** Ready
**Context Budget:** ~40% (~80k tokens)

## Goal

Identify and remove React components that are not imported or used anywhere in the application. Focus on UI components, layout components, and feature components.

## Context

**Current State:**
- 87 component files in src/components/
- After Phase 1 cleanup, some components may be orphaned
- UI component library may have unused wrappers

**Preservation Requirements:**
- Components used in app/ routes must be kept
- Components imported by other components must be kept
- Components used in tests should be kept (but test themselves can be dead)

**Strategy:** Static analysis using grep to find imports, then remove components with zero imports

**Research:** None required - grep-based static analysis

## Tasks

### Task 1: Audit UI components for usage

**What:** Check which src/components/ui/* components are actually imported

**How:**
```bash
# List all UI components
find src/components/ui -name "*.tsx" -exec basename {} .tsx \;

# For each component, check if it's imported
for component in $(find src/components/ui -name "*.tsx" -exec basename {} .tsx \;); do
  echo "=== $component ==="
  grep -r "from.*ui/$component" src/ --include="*.tsx" --include="*.ts" | wc -l
done
```

**Outcome:** List of UI components with import counts

**Verification:**
- [ ] All UI components checked
- [ ] Import counts documented
- [ ] Zero-import components identified

**Decision Criteria:**
- **Remove if**: Zero imports from src/app or src/components (except self)
- **Keep if**: At least one import found
- **Exception**: Keep button.tsx, input.tsx, label.tsx (foundational components likely used indirectly)

---

### Task 2: Audit layout components for usage

**What:** Check which src/components/layout/* components are imported

**How:**
```bash
# Check Navbar usage
grep -r "Navbar\|NavbarLight" src/ --include="*.tsx"

# Check Footer usage
grep -r "Footer" src/ --include="*.tsx"

# Check any other layout components
find src/components/layout -name "*.tsx"
```

**Outcome:** Verification that all layout components are used

**Verification:**
- [ ] Navbar usage confirmed
- [ ] Footer usage confirmed
- [ ] Other layout components checked

**Decision Criteria:**
- Layout components are typically used in app/layout.tsx
- Unlikely to have orphaned layout components, but verify

---

### Task 3: Audit feature components for usage

**What:** Check non-UI, non-layout components for usage

**How:**
```bash
# Find feature component directories
find src/components -type d -not -path "*/ui" -not -path "*/layout" -not -path "*/magicui"

# For each feature component, check imports
find src/components/forms -name "*.tsx" -exec basename {} .tsx \;
find src/components/calculators -name "*.tsx" -exec basename {} .tsx \;
# etc for each directory

# Check imports for each
grep -r "from.*components/forms" src/
grep -r "from.*components/calculators" src/
```

**Outcome:** List of feature components with import verification

**Verification:**
- [ ] forms/ components checked
- [ ] calculators/ components checked
- [ ] blog/ components checked
- [ ] error/ components checked
- [ ] All other component directories audited

**Decision Criteria:**
- **Remove if**: Zero imports AND not directly used in app/ routes
- **Keep if**: Used in any route or imported by used component

---

### Task 4: Remove orphaned components

**What:** Delete component files with confirmed zero usage

**How:**
```bash
# Example removals (only after confirming zero usage)
# rm src/components/ui/{unused-component}.tsx

# After removal, verify build
bun run build
bun run test:unit
```

**Outcome:**
- Orphaned components removed
- Build still succeeds
- Tests still pass

**Verification:**
- [ ] Only confirmed orphans removed
- [ ] Build succeeds
- [ ] No import errors
- [ ] Tests pass
- [ ] Git commit created

**Rollback Plan:**
```bash
git checkout HEAD -- src/components/ui/{component}.tsx
```

---

### Task 5: Document findings

**What:** Create summary of removed components and impact

**Outcome:** Component removal report with:
- Number of components removed
- Categories (UI, layout, feature)
- File size reduction
- Rationale for each removal

**Verification:**
- [ ] Documentation complete
- [ ] Rationale clear for each removal

## Success Criteria

- [ ] All 87 components audited for usage
- [ ] Orphaned components identified (expect 5-15 removals)
- [ ] Zero-usage components removed
- [ ] Build succeeds after removal
- [ ] Tests pass after removal (313/313)
- [ ] No import errors
- [ ] Documentation complete

## Scope Boundaries

**In Scope:**
- Component files in src/components/
- Static import analysis
- Removing files with zero imports

**Out of Scope:**
- Unused functions within components (Plan 2)
- Dead code within component bodies (Plan 3)
- Commented code (Plan 4)
- Component refactoring or optimization

## Estimated Impact

**Expected Removals:** 5-15 component files

**Likely Candidates:**
- Unused UI component wrappers (after Phase 1 package removals)
- Experimental components never integrated
- Duplicate components replaced by better versions

**File Size:** 500B-2KB per component = 2.5KB-30KB total

## Risk Assessment

**Low Risk:**
- Static analysis is reliable (grep shows all imports)
- Build will fail if we remove something used
- Tests will fail if critical component removed
- Easy to rollback individual file removals

**Mitigation:**
- Verify zero imports before removal
- Run build after each removal batch
- Run tests after removal
- Git commit after successful removal

## Notes

**From Phase 1 learnings:**
- Check both direct imports AND usage in parent components
- UI wrappers can be used even without app-level imports
- Always verify with grep before removing

**Component categories to check:**
1. UI primitives (button, input, etc.) - likely all used
2. UI composite (card, badge, etc.) - may have unused
3. Layout components - all likely used
4. Feature components - check each feature directory
5. MagicUI components - decorative, may be unused

**Be conservative:** When in doubt, keep the component. Focus on obvious orphans with zero imports.
