# Plan 2: Find and Remove Unused Exports

**Phase:** 2 - Dead Code Elimination
**Created:** 2026-01-09
**Status:** Ready
**Context Budget:** ~40% (~80k tokens)

## Goal

Identify and remove exported functions, types, and constants that are never imported anywhere in the codebase. Clean up lib/ utilities and hooks/ that export unused code.

## Context

**Current State:**
- 60 library files in src/lib/
- 13 hooks in src/hooks/
- Many files may export multiple functions, some unused
- Types and interfaces may be exported but never imported

**Pattern to Find:**
```typescript
// File: src/lib/utils.ts
export function usedFunction() { }      // ← Imported somewhere: KEEP
export function deadFunction() { }      // ← Never imported: REMOVE
export const USED_CONSTANT = 'foo'      // ← Imported somewhere: KEEP
export const DEAD_CONSTANT = 'bar'      // ← Never imported: REMOVE
```

**Preservation Requirements:**
- Exports used in tests should be kept (tests verify behavior)
- Types used only in the same file can be unexported
- Default exports should not be removed (may be route handlers)

**Strategy:** For each export, grep for imports. Remove exports with zero imports.

**Research:** None required - static analysis

## Tasks

### Task 1: Find all exports in lib/ directory

**What:** Identify all exported functions, constants, and types in src/lib/

**How:**
```bash
# Find all export statements
grep -rn "^export " src/lib/ --include="*.ts" > /tmp/lib-exports.txt

# Count total exports
wc -l /tmp/lib-exports.txt

# Sample output to understand pattern
head -20 /tmp/lib-exports.txt
```

**Outcome:** Complete list of all exports in lib/ directory

**Verification:**
- [ ] All lib/ exports catalogued
- [ ] Export types identified (function, const, type, interface)
- [ ] File locations documented

---

### Task 2: Check each export for usage

**What:** For each export, search entire codebase for imports

**How:**
```bash
# For a specific export, check if it's imported
export_name="someFunction"
grep -r "import.*$export_name" src/ --include="*.ts" --include="*.tsx" | grep -v "from.*lib/file-with-export"

# Automate for all exports
while read line; do
  export_name=$(echo "$line" | grep -oP 'export (function|const|type|interface) \K\w+')
  file=$(echo "$line" | cut -d: -f1)

  # Count imports (exclude self-imports)
  import_count=$(grep -r "import.*$export_name" src/ --include="*.ts" --include="*.tsx" | grep -v "$file" | wc -l)

  if [ "$import_count" -eq 0 ]; then
    echo "UNUSED: $export_name in $file"
  fi
done < /tmp/lib-exports.txt
```

**Outcome:** List of unused exports with zero imports

**Verification:**
- [ ] All exports checked for imports
- [ ] Unused exports identified
- [ ] Self-imports excluded from count

**Decision Criteria:**
- **Remove if**: Zero imports from other files
- **Keep if**: At least one import found
- **Keep if**: Used only in tests (tests verify behavior)
- **Exception**: Keep error handling utilities (may be imported dynamically)

---

### Task 3: Audit hooks for unused exports

**What:** Check src/hooks/ for unused custom hooks

**How:**
```bash
# List all custom hooks
find src/hooks -name "*.ts" -exec basename {} .ts \;

# For each hook, check usage
for hook in $(find src/hooks -name "*.ts" -exec basename {} .ts \;); do
  echo "=== $hook ==="
  # Check if hook is imported
  grep -r "from.*hooks/$hook" src/ --include="*.tsx" --include="*.ts"
  # Check if hook function is used
  hook_name=$(echo "$hook" | sed 's/-/\u&/g')  # Convert to camelCase
  grep -r "$hook_name" src/ --include="*.tsx" --include="*.ts"
done
```

**Outcome:** Unused hooks identified

**Verification:**
- [ ] All hooks checked
- [ ] Import usage documented
- [ ] Unused hooks identified

**Decision Criteria:**
- **Remove if**: Hook file has zero imports
- **Keep if**: Hook is imported and used
- **Keep if**: Hook is part of established pattern (even if single usage)

---

### Task 4: Check for unused type exports

**What:** Find TypeScript types/interfaces that are exported but never imported

**How:**
```bash
# Find all type/interface exports
grep -rn "^export (type|interface)" src/ --include="*.ts" > /tmp/type-exports.txt

# For each type, check imports
while read line; do
  type_name=$(echo "$line" | grep -oP 'export (type|interface) \K\w+')
  file=$(echo "$line" | cut -d: -f1)

  # Check if type is imported elsewhere
  import_count=$(grep -r "import.*$type_name" src/ | grep -v "$file" | wc -l)

  if [ "$import_count" -eq 0 ]; then
    echo "UNUSED TYPE: $type_name in $file"
  fi
done < /tmp/type-exports.txt
```

**Outcome:** Unused type exports identified

**Verification:**
- [ ] All type exports checked
- [ ] Import usage documented
- [ ] Unused types identified

**Decision Criteria:**
- **Remove export (not type)**: If type is used only within the file, make it non-exported
- **Remove type entirely**: If type is never used anywhere
- **Keep if**: Type is imported by other files

---

### Task 5: Remove unused exports

**What:** Delete or un-export identified unused code

**How:**
```bash
# For unused exports, either:
# 1. Remove the entire export if function/const is unused
# 2. Remove the 'export' keyword if only used internally

# Example: Remove entire unused function
# Before:
# export function unusedHelper() { }
# After: (deleted)

# Example: Un-export internal-only type
# Before:
# export interface InternalType { }
# After:
# interface InternalType { }  // Remove 'export'

# Verify after each change
bun run build
bun run test:unit
```

**Outcome:**
- Unused exports removed
- Internal-only exports made private
- Build and tests still pass

**Verification:**
- [ ] Unused exports removed
- [ ] Build succeeds
- [ ] Tests pass (313/313)
- [ ] No import errors
- [ ] Git commit created

**Rollback Plan:**
```bash
git checkout HEAD -- src/lib/{file}.ts
```

---

### Task 6: Document findings

**What:** Create summary of removed exports and impact

**Outcome:** Export removal report with:
- Number of exports removed
- Categories (functions, constants, types)
- Files affected
- Lines of code removed

**Verification:**
- [ ] Documentation complete
- [ ] Impact quantified

## Success Criteria

- [ ] All lib/ exports audited (60 files)
- [ ] All hooks/ exports audited (13 files)
- [ ] Unused exports identified (expect 10-30 removals)
- [ ] Zero-import exports removed or made private
- [ ] Build succeeds after removal
- [ ] Tests pass after removal
- [ ] No import errors
- [ ] Documentation complete

## Scope Boundaries

**In Scope:**
- Exported functions in src/lib/
- Exported hooks in src/hooks/
- Exported types/interfaces
- Exported constants

**Out of Scope:**
- Unused code within functions (that's dead code within bodies)
- Default exports (may be route handlers)
- Component exports (covered in Plan 1)
- Internal function refactoring

## Estimated Impact

**Expected Removals:** 10-30 exports

**Likely Candidates:**
- Helper functions that were replaced
- Constants defined but never used
- Types for features that were removed
- Experimental utilities never integrated

**Lines of Code:** 50-200 lines (functions, types, constants)

## Risk Assessment

**Low Risk:**
- Static analysis is reliable
- Build will fail if we remove imported export
- Tests will fail if critical utility removed
- Easy to rollback individual removals

**Medium Risk:**
- Dynamic imports won't be caught by grep
- Runtime-only usage won't show up in static analysis

**Mitigation:**
- Check for dynamic import patterns: `import()`, `require()`
- Keep error handling and logging utilities (may be used at runtime)
- Run full test suite after removal
- Manual verification of critical lib/ files

## Notes

**Common dead export patterns:**
1. Helper functions replaced by better implementations
2. Constants defined for features never built
3. Types for removed integrations
4. Experimental utilities never adopted

**Files likely to have unused exports:**
- src/lib/utils.ts (kitchen sink of utilities)
- src/types/*.ts (type definitions)
- src/lib/schemas/*.ts (validation schemas for removed features)

**Conservative approach:**
- When in doubt, keep the export
- Focus on obvious unused exports with zero imports
- Don't remove if used only in tests (tests verify behavior)

**From Phase 1 learnings:**
- Check dependencies before removal
- Verify builds after each batch
- Document rationale for removal
