# Plan 4: Directory Reorganization

**Phase**: 6 - Component Structure Optimization
**Status**: Ready for execution
**Impact**: Medium risk, organizational improvement

## Problem

Component organization follows **mixed patterns**:
- Feature-based: `admin/`, `blog/`, `paystub/`, `testimonials/`
- Type-based: `forms/`, `calculators/`, `layout/`
- Technology-based: `ui/`, `magicui/` (deleted in Plan 1)

Additionally, **9 components sit at root level** with no clear organization:
- `Analytics.tsx`
- `ComparisonView.tsx`
- `floating-field.tsx`
- `GoogleMap.tsx`
- `icon.tsx`
- `image.tsx`
- `JsonLd.tsx`
- `ResultsPanel.tsx`
- `WebVitalsReporting.tsx`

### Issues

1. **Unclear component placement**: Where does a new "blog form" go? `forms/` or `blog/`?
2. **Scattered utilities**: Root-level components are hard to discover
3. **Inconsistent naming**: `floating-field.tsx` (kebab-case) vs `JsonLd.tsx` (PascalCase)
4. **No clear principle**: Team can't agree on organization strategy

## Goal

Establish **clear, consistent organization principle** and reorganize components accordingly.

## Proposed Organization Principle

**Feature-first, with shared UI primitives**:
- Group by **feature domain** when component is feature-specific
- Keep **shared UI primitives** in `ui/`
- Create **utilities** directory for generic helpers
- Eliminate root-level components

## Target Structure

```
src/components/
├── admin/           # Admin dashboard features
├── blog/            # Blog features
├── calculators/     # Calculator features
├── forms/           # REMOVE - merge into feature directories
├── layout/          # Global layout (Navbar, Footer)
├── paystub/         # Paystub generator features
├── testimonials/    # Testimonial features
├── ui/              # Shared primitives (buttons, cards, etc.)
├── utilities/       # NEW - Generic utilities
│   ├── Analytics.tsx
│   ├── ComparisonView.tsx (or move to calculators/)
│   ├── ErrorBoundary.tsx
│   ├── GoogleMap.tsx
│   ├── icon.tsx → Icon.tsx (rename)
│   ├── image.tsx → Image.tsx (rename)
│   ├── JsonLd.tsx
│   ├── ResultsPanel.tsx (or move to calculators/)
│   ├── ScrollProgress.tsx
│   ├── ScrollToTop.tsx
│   └── WebVitalsReporting.tsx
└── [NO root-level components]
```

## Implementation

### Step 1: Create Utilities Directory

```bash
mkdir -p src/components/utilities
```

### Step 2: Move Root-Level Components to Utilities

**Candidates for utilities/**:
- `Analytics.tsx` - Generic analytics wrapper
- `GoogleMap.tsx` - Generic map component
- `JsonLd.tsx` - Generic SEO utility
- `WebVitalsReporting.tsx` - Generic performance utility
- `icon.tsx` → `Icon.tsx` - Generic icon wrapper
- `image.tsx` → `Image.tsx` - Generic image wrapper

```bash
# Move and rename
mv src/components/Analytics.tsx src/components/utilities/
mv src/components/GoogleMap.tsx src/components/utilities/
mv src/components/JsonLd.tsx src/components/utilities/
mv src/components/WebVitalsReporting.tsx src/components/utilities/
mv src/components/icon.tsx src/components/utilities/Icon.tsx
mv src/components/image.tsx src/components/utilities/Image.tsx
```

### Step 3: Move Feature-Specific Components

**Candidates for feature directories**:
- `ComparisonView.tsx` → `calculators/` (used in TTL calculator)
- `ResultsPanel.tsx` → `calculators/` (used in calculators)
- `floating-field.tsx` → `forms/` or inline (if only used once)

```bash
# Check usage first
grep -r "ComparisonView" src/ --include="*.tsx"
grep -r "ResultsPanel" src/ --include="*.tsx"
grep -r "floating-field" src/ --include="*.tsx"

# Move based on usage
# Example:
mv src/components/ComparisonView.tsx src/components/calculators/
mv src/components/ResultsPanel.tsx src/components/calculators/
```

### Step 4: Move Scroll Utilities

**Decision**: Where do ScrollProgress and ScrollToTop go?

**Option A**: `utilities/` (generic utilities)
**Option B**: `ui/` (UI enhancements)
**Option C**: `layout/` (layout enhancements)

**Recommendation**: `utilities/` (not primitive UI components)

```bash
mv src/components/ScrollProgress.tsx src/components/utilities/
mv src/components/ScrollToTop.tsx src/components/utilities/
```

### Step 5: Consolidate Forms Directory

**Current structure**:
```
forms/
├── ContactForm.tsx
└── NewsletterSignup.tsx
```

**Problem**: Only 2 components, could belong with features

**Options**:
1. **Keep forms/** - Maintain separate forms directory
2. **Move to features** - ContactForm → layout/, NewsletterSignup → testimonials/ or layout/
3. **Keep but rename** - Rename to `form-components/` for clarity

**Recommendation**: Keep `forms/` directory - maintains clear separation of form logic

**Alternative**: If other features have forms too, those should move here:
- `testimonials/TestimonialForm.tsx` → `forms/TestimonialForm.tsx`?
- `paystub/PaystubForm.tsx` → `forms/PaystubForm.tsx`?

**Decision needed**: Are forms a cross-cutting concern or feature-specific?
- **Cross-cutting**: All forms in `forms/`
- **Feature-specific**: Forms stay with features

**Recommendation**: Keep forms with features (current structure)

### Step 6: Move Error Boundary

```bash
# Error boundary is a utility, not a layout component
mv src/components/error/ErrorBoundary.tsx src/components/utilities/
rmdir src/components/error/  # Remove empty directory
```

### Step 7: Update All Imports

**Find and replace import paths**:

```bash
# Pattern: Update all imports for moved components
# Example for Analytics:
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  's|@/components/Analytics|@/components/utilities/Analytics|g' {} +

# Example for Icon (renamed):
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  's|@/components/icon|@/components/utilities/Icon|g' {} +
```

**Components to update**:
1. Analytics: `@/components/Analytics` → `@/components/utilities/Analytics`
2. GoogleMap: `@/components/GoogleMap` → `@/components/utilities/GoogleMap`
3. JsonLd: `@/components/JsonLd` → `@/components/utilities/JsonLd`
4. WebVitals: `@/components/WebVitalsReporting` → `@/components/utilities/WebVitalsReporting`
5. Icon: `@/components/icon` → `@/components/utilities/Icon`
6. Image: `@/components/image` → `@/components/utilities/Image`
7. ScrollProgress: `@/components/ScrollProgress` → `@/components/utilities/ScrollProgress`
8. ScrollToTop: `@/components/ScrollToTop` → `@/components/utilities/ScrollToTop`
9. ErrorBoundary: `@/components/error/ErrorBoundary` → `@/components/utilities/ErrorBoundary`
10. ComparisonView: `@/components/ComparisonView` → `@/components/calculators/ComparisonView`
11. ResultsPanel: `@/components/ResultsPanel` → `@/components/calculators/ResultsPanel`

### Step 8: Create Barrel Export (Optional)

**File**: `src/components/utilities/index.ts`

```typescript
// Re-export all utilities for cleaner imports
export { Analytics } from './Analytics'
export { ComparisonView } from '../calculators/ComparisonView' // or keep in utilities
export { ErrorBoundary } from './ErrorBoundary'
export { GoogleMap } from './GoogleMap'
export { Icon } from './Icon'
export { Image } from './Image'
export { JsonLd } from './JsonLd'
export { ResultsPanel } from '../calculators/ResultsPanel' // or keep in utilities
export { ScrollProgress } from './ScrollProgress'
export { ScrollToTop } from './ScrollToTop'
export { WebVitalsReporting } from './WebVitalsReporting'
```

**Benefits**: `import { Icon, Image, JsonLd } from '@/components/utilities'`

**Drawbacks**: Extra indirection, barrel file maintenance

**Recommendation**: Skip barrel export unless team requests it

### Step 9: Verify No Root-Level Components Remain

```bash
# List all .tsx files at components root (should be empty)
ls src/components/*.tsx 2>/dev/null | wc -l
```

**Expected**: 0 files

## Verification

### Build Check
```bash
bun run build
bun run typecheck
```

**Pass criteria**: No errors

### Import Check
```bash
# Verify no broken imports
bun run build 2>&1 | grep "Module not found"
```

**Expected**: No output (no missing modules)

### Directory Structure Check
```bash
tree -L 2 src/components/
```

**Expected structure**:
```
src/components/
├── admin/
├── blog/
├── calculators/
├── forms/
├── layout/
├── paystub/
├── testimonials/
├── ui/
└── utilities/
```

**NO files at root level**

## Files Modified

**Estimated**: 20-30 files (import updates)

### Files Moved/Renamed
1. Analytics.tsx → utilities/Analytics.tsx
2. GoogleMap.tsx → utilities/GoogleMap.tsx
3. JsonLd.tsx → utilities/JsonLd.tsx
4. WebVitalsReporting.tsx → utilities/WebVitalsReporting.tsx
5. icon.tsx → utilities/Icon.tsx (renamed)
6. image.tsx → utilities/Image.tsx (renamed)
7. ScrollProgress.tsx → utilities/ScrollProgress.tsx
8. ScrollToTop.tsx → utilities/ScrollToTop.tsx
9. error/ErrorBoundary.tsx → utilities/ErrorBoundary.tsx
10. ComparisonView.tsx → calculators/ComparisonView.tsx
11. ResultsPanel.tsx → calculators/ResultsPanel.tsx
12. floating-field.tsx → (TBD based on usage)

### Directories Removed
- `src/components/error/` (empty after ErrorBoundary moved)
- `src/components/magicui/` (removed in Plan 1)

### Directories Created
- `src/components/utilities/`

## Success Metrics

**Before**:
- Root-level components: 9
- Inconsistent naming: Yes (icon.tsx vs Icon.tsx)
- Clear organization principle: No

**After**:
- Root-level components: 0
- Inconsistent naming: No (all PascalCase.tsx)
- Clear organization principle: Yes (feature-first + shared utilities)
- Directories: 9 (down from 14, removed error/ and magicui/)

## Rollback Plan

```bash
# Revert all moves
git checkout src/components/

# Rebuild
bun run build
```

## Commit Strategy

**Commit 1**: Create utilities directory and move utilities
```
refactor(phase-6): reorganize utilities into utilities/ directory (Plan 4)

Created src/components/utilities/ and moved generic utilities:
- Analytics.tsx
- GoogleMap.tsx
- JsonLd.tsx
- WebVitalsReporting.tsx
- Icon.tsx (renamed from icon.tsx)
- Image.tsx (renamed from image.tsx)
- ScrollProgress.tsx
- ScrollToTop.tsx
- ErrorBoundary.tsx (from error/)

Updated all imports across codebase.

Result:
- 0 root-level components
- Clear utilities organization
- Consistent PascalCase naming
```

**Commit 2**: Move feature-specific components
```
refactor(phase-6): move feature-specific components to appropriate directories (Plan 4)

Moved calculator-specific components:
- ComparisonView.tsx → calculators/
- ResultsPanel.tsx → calculators/

Removed empty error/ directory.

Result:
- Components organized by feature
- Clearer component discovery
```

---

**Execution time**: 30-45 minutes
**Risk level**: Low-Medium (mechanical refactoring, lots of import updates)
**Dependencies**: Plans 1-3 (duplicate removal, client/server optimization, paystub consolidation)
