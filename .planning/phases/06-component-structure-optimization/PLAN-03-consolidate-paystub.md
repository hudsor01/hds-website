# Plan 3: Consolidate Over-Granular Paystub Components

**Phase**: 6 - Component Structure Optimization
**Status**: Ready for execution
**Impact**: Medium risk, readability improvement

## Problem

The paystub feature has **12 separate component files** for generating a simple pay stub document:

1. `PayStub.tsx` - Main component (imports 8 sub-components)
2. `PayStubHeader.tsx` - Company name, pay date, check number
3. `PayStubEmployeeInfo.tsx` - Employee details, period info
4. `PayStubEarnings.tsx` - Hours, rate, gross pay
5. `PayStubDeductions.tsx` - Taxes deducted
6. `PayStubNetPay.tsx` - Net pay amount
7. `PayStubYearToDate.tsx` - YTD totals
8. `PayStubFooter.tsx` - Footer text
9. `PayStubSaveButton.tsx` - PDF download button
10. `PaystubForm.tsx` - Input form (separate concern, keep)
11. `PaystubNavigation.tsx` - Step navigation
12. `AnnualWageSummary.tsx` - Summary display

### Issues with Current Structure

**Readability**: Understanding paystub layout requires jumping between 12 files
**Maintenance**: Small changes require modifying multiple files
**Cognitive load**: Developer must track 8 imports and prop interfaces
**Over-abstraction**: Some components are <20 lines (trivial)

### Hypothesis

Components 2-8 (the sub-components of PayStub.tsx) may be simple enough to inline or consolidate into 2-3 logical sections.

## Investigation Plan

### Step 1: Analyze Component Complexity

**Read each sub-component** and measure:
1. **Lines of code** (LOC)
2. **Props complexity** (number of props, types)
3. **Logic complexity** (calculations, conditions, or just rendering?)
4. **Reusability** (used elsewhere or only in PayStub.tsx?)

```bash
# Count lines for each component (excluding blank lines)
for file in src/components/paystub/PayStub*.tsx; do
  echo "$file: $(grep -v '^[[:space:]]*$' "$file" | wc -l) lines"
done
```

**Decision criteria**:
- **<25 LOC + no logic** → Inline into parent
- **25-50 LOC + simple props** → Consider consolidating
- **>50 LOC or complex logic** → Keep separate

### Step 2: Map Component Dependencies

**Create dependency graph**:
```
PayStub.tsx
├── PayStubHeader.tsx          (imported)
├── PayStubEmployeeInfo.tsx    (imported)
├── PayStubEarnings.tsx        (imported)
├── PayStubDeductions.tsx      (imported)
├── PayStubNetPay.tsx          (imported)
├── PayStubYearToDate.tsx      (imported)
├── PayStubFooter.tsx          (imported)
└── PayStubSaveButton.tsx      (imported)
```

**Check for reuse**:
```bash
# Are any sub-components used outside PayStub.tsx?
for comp in Header EmployeeInfo Earnings Deductions NetPay YearToDate Footer SaveButton; do
  echo "PayStub$comp usage:"
  grep -r "PayStub$comp" src/ --include="*.tsx" | grep -v "paystub/PayStub$comp.tsx" | wc -l
done
```

**If count = 1** → Only used in PayStub.tsx → candidate for consolidation

### Step 3: Review Props Interfaces

**For each sub-component**, check props:
```typescript
// Example: PayStubHeader.tsx
interface PayStubHeaderProps {
  employerName: string;
  payDate: string;
  checkNumber: string;
  netPay: number;
}
```

**Questions**:
- Are props just being passed through from parent?
- Is there prop drilling that could be avoided?
- Could props be simplified if consolidated?

## Consolidation Strategy

### Option A: Keep Current Structure (if justified)

**Justification needed**:
- Each component has >50 LOC
- Components are reused elsewhere
- Complex logic requires separation
- Team prefers granular components

**Action**: Document decision, add comments explaining structure

### Option B: Consolidate into Sections (recommended if components are simple)

**Proposed structure** (3-4 components instead of 12):
```
src/components/paystub/
├── PayStub.tsx              (main component, ~200-250 LOC)
│   ├── <Header section>     (inline)
│   ├── <EmployeeInfo section> (inline)
│   ├── <Earnings section>   (inline)
│   ├── <Deductions section> (inline)
│   ├── <NetPay section>     (inline)
│   ├── <YearToDate section> (inline)
│   └── <Footer section>     (inline)
├── PaystubForm.tsx          (keep - different concern)
├── PaystubNavigation.tsx    (keep - navigation logic)
└── PayStubSaveButton.tsx    (keep or inline - depends on complexity)
```

**Benefits**:
- Single file contains entire paystub layout
- Easier to understand document structure
- Simpler imports
- Less file switching during maintenance

**Drawbacks**:
- Larger single file (200-250 LOC)
- Less granular git history
- Harder to test individual sections (if needed)

### Option C: Consolidate into Logical Groups

**Proposed structure** (4-5 components):
```
src/components/paystub/
├── PayStub.tsx                    (main component)
├── PayStubHeader.tsx              (header + employee info)
├── PayStubEarnings.tsx            (earnings + deductions)
├── PayStubTotals.tsx              (net pay + YTD)
├── PaystubForm.tsx                (keep)
└── PaystubNavigation.tsx          (keep)
```

**Benefits**:
- Consolidates related sections
- Reduces from 12 → 5 files
- Still maintains logical separation
- Easier to reason about than 12 files

## Implementation (if consolidating)

### Step 1: Backup Current State
```bash
git add -A
git commit -m "checkpoint: before paystub consolidation"
```

### Step 2: Create Consolidated Component(s)

**If Option B (single file)**:
```typescript
// PayStub.tsx
import React from 'react'
import { cn } from '@/lib/utils'
import type { PayPeriod, PaystubData } from '@/types/paystub'
import { PayStubSaveButton } from './PayStubSaveButton'

interface PayStubProps {
  payPeriod: PayPeriod
  employeeData: PaystubData
  ytdTotals: {
    grossPay: number
    federalTax: number
    socialSecurity: number
    medicare: number
    netPay: number
  }
}

export const PayStub: React.FC<PayStubProps> = ({
  payPeriod,
  employeeData,
  ytdTotals
}) => {
  // ... (inline all sub-component JSX here)

  return (
    <div className="relative">
      <PayStubSaveButton onSave={handleSaveAsPDF} />

      <div className={cn(/* ... */)}>
        {/* Header section - previously PayStubHeader */}
        <header>
          {/* ... */}
        </header>

        {/* Employee info - previously PayStubEmployeeInfo */}
        <section aria-label="Employee Information">
          {/* ... */}
        </section>

        {/* Earnings - previously PayStubEarnings */}
        <section aria-label="Earnings">
          {/* ... */}
        </section>

        {/* Deductions - previously PayStubDeductions */}
        <section aria-label="Deductions">
          {/* ... */}
        </section>

        {/* Net Pay - previously PayStubNetPay */}
        <section aria-label="Net Pay">
          {/* ... */}
        </section>

        {/* YTD - previously PayStubYearToDate */}
        <section aria-label="Year to Date">
          {/* ... */}
        </section>

        {/* Footer - previously PayStubFooter */}
        <footer>
          {/* ... */}
        </footer>
      </div>
    </div>
  )
}
```

### Step 3: Delete Consolidated Files

```bash
# If fully consolidated into PayStub.tsx
rm src/components/paystub/PayStubHeader.tsx
rm src/components/paystub/PayStubEmployeeInfo.tsx
rm src/components/paystub/PayStubEarnings.tsx
rm src/components/paystub/PayStubDeductions.tsx
rm src/components/paystub/PayStubNetPay.tsx
rm src/components/paystub/PayStubYearToDate.tsx
rm src/components/paystub/PayStubFooter.tsx
```

**Keep**:
- `PayStubSaveButton.tsx` (interactive, separate concern)
- `PaystubForm.tsx` (form logic, separate concern)
- `PaystubNavigation.tsx` (navigation, separate concern)
- `AnnualWageSummary.tsx` (check if still used)

### Step 4: Update Imports

**Find files importing deleted components**:
```bash
grep -r "from '@/components/paystub/PayStub" src/ --include="*.tsx"
```

**Expected**: Only PayStub.tsx should have imported them

**Verify**: No external imports of sub-components

### Step 5: Verify PDF Generation

**Check**: `src/lib/pdf/paystub-template.tsx`

**Ensure**: PDF template still works with consolidated structure

**If PDF uses sub-components**: Keep them, but rename to indicate they're PDF-only:
- `pdf/PayStubHeaderPDF.tsx`
- `pdf/PayStubEarningsPDF.tsx`
- etc.

## Testing

### Unit Tests
```bash
bun run test:unit -- paystub
```
**Pass criteria**: All paystub tests still pass

### Visual Verification
```bash
bun run dev
```

**Steps**:
1. Navigate to `/tools/paystub-generator`
2. Fill in form
3. Generate paystub
4. Verify layout looks identical to before
5. Download PDF
6. Verify PDF looks identical to before

### Accessibility Check

**Verify**:
- Semantic HTML preserved (header, section, footer)
- ARIA labels present
- Screen reader navigation still works

## Success Metrics

**Before**:
- Paystub component files: 12
- Main component imports: 8
- Total LOC across files: ~400-500 (estimated)

**After** (if consolidated):
- Paystub component files: 4-5
- Main component imports: 1-2
- Total LOC: Same (~400-500, just reorganized)
- **Readability**: Improved (single file view)
- **Maintainability**: Improved (fewer files to modify)

## Decision Points

### Decision 1: Consolidate or Keep?

**Consolidate if**:
- Sub-components are <30 LOC each
- No complex logic in sub-components
- Sub-components not reused elsewhere
- Team agrees consolidation improves readability

**Keep if**:
- Sub-components are >50 LOC each
- Complex calculations or logic in components
- Components reused in PDF template
- Current structure works well for team

### Decision 2: Full vs Partial Consolidation?

**Full consolidation** (Option B):
- All display logic in PayStub.tsx
- Keep only form, navigation, save button separate

**Partial consolidation** (Option C):
- Group into 3-4 logical sections
- Reduces from 12 → 5 files
- Balances file size with modularity

## Rollback Plan

```bash
# Revert all changes
git checkout src/components/paystub/

# Rebuild
bun run build
```

## Commit Message

```
refactor(phase-6): consolidate paystub display components (Plan 3)

Consolidated 8 small paystub sub-components into main PayStub.tsx
for improved readability and maintenance.

Before:
- 12 separate files
- 8 imports in main component
- Cognitive overhead tracking prop interfaces

After:
- 4 files (PayStub, Form, Navigation, SaveButton)
- 1-2 imports in main component
- Single file contains entire layout

Impact:
- Same functionality, clearer structure
- Easier to understand document layout
- Simpler maintenance (fewer files)

Kept separate:
- PaystubForm.tsx (form logic)
- PaystubNavigation.tsx (navigation)
- PayStubSaveButton.tsx (interactive)

All tests passing, visual output identical.
```

---

**Execution time**: 1-1.5 hours
**Risk level**: Medium (visual changes require careful testing)
**Dependencies**: Plan 1 (duplicate removal), Plan 2 (client/server optimization)
**Note**: This plan requires analyzing component sizes before execution - may decide to keep current structure if components are sufficiently complex
