# Plan 1: Create Centralized Constants

**Status**: Ready for execution
**Priority**: HIGH
**Estimated Impact**: ~150 lines changed across 40 files

---

## Goal

Extract magic numbers and hardcoded business information into centralized constant files, creating single sources of truth for configuration values.

---

## Problems Identified

### 1. Magic Timeout Numbers (10+ files)
**Pattern**: `setTimeout(() => setCopied(false), 2000)`

**Files affected**:
- Copy feedback: 2000ms - 10+ files
- Save success: 3000ms - 1 file
- Print delay: 100ms - 1 file

**Impact**: Inconsistent UX, hard to maintain

### 2. Hardcoded Business Information (10+ files)
**Pattern**: `hello@hudsondigitalsolutions.com`, `Dallas`, `TX`

**Files affected**:
- Email address: 10+ files
- City: 6 files
- State: 6 files
- Company name: Multiple locations

**Impact**: Hard to update when business info changes, violates DRY

### 3. Repeated localStorage Keys
**Pattern**: Magic strings like `'savedCalculations'`, `'theme'`

**Impact**: Typo risk, hard to track usage

---

## Solution

Create 3 new constant files with proper TypeScript typing:

### File 1: `src/lib/constants/timeouts.ts`

```typescript
/**
 * Standard timeout durations for UI feedback
 * All values in milliseconds
 */
export const TIMEOUTS = {
  /** Duration for "Copied!" feedback toast (2 seconds) */
  COPY_FEEDBACK: 2000,

  /** Duration for save success message (3 seconds) */
  SAVE_SUCCESS: 3000,

  /** Delay before triggering print dialog (100ms) */
  PRINT_DELAY: 100,

  /** Duration for generic toast messages (4 seconds) */
  TOAST_DEFAULT: 4000,

  /** Duration for error messages (6 seconds) */
  TOAST_ERROR: 6000,
} as const;

export type TimeoutKey = keyof typeof TIMEOUTS;
```

### File 2: `src/lib/constants/business.ts`

```typescript
/**
 * Hudson Digital Solutions business information
 * Single source of truth for company contact details
 */
export const BUSINESS_INFO = {
  /** Company legal name */
  name: 'Hudson Digital Solutions',

  /** Short display name */
  displayName: 'Hudson Digital',

  /** Primary contact email */
  email: 'hello@hudsondigitalsolutions.com',

  /** Business location */
  location: {
    city: 'Dallas',
    state: 'TX',
    stateCode: 'TX',
    country: 'United States',
  },

  /** Social media and web presence */
  links: {
    website: 'https://hudsondigitalsolutions.com',
    // Add social links as needed
  },
} as const;

export type BusinessInfo = typeof BUSINESS_INFO;
```

### File 3: `src/lib/constants/storage-keys.ts`

```typescript
/**
 * Storage keys for localStorage and sessionStorage
 * Prevents typos and makes tracking easier
 */
export const STORAGE_KEYS = {
  /** TTL calculator saved calculations */
  TTL_SAVED_CALCULATIONS: 'savedCalculations',

  /** User theme preference */
  THEME: 'theme',

  /** Tool usage analytics */
  TOOL_USAGE: 'toolUsage',

  /** Form draft data */
  FORM_DRAFTS: 'formDrafts',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;
```

### File 4: `src/lib/constants/index.ts` (Barrel export)

```typescript
export * from './timeouts';
export * from './business';
export * from './storage-keys';
```

---

## Files to Update

### Category 1: Timeout Replacements (~12 files)

**Files with copy feedback timeout**:
1. `src/components/calculators/Calculator.tsx` - Line 45
2. `src/app/tools/cost-estimator/page.tsx`
3. `src/app/tools/roi-calculator/page.tsx`
4. `src/app/tools/mortgage-calculator/MortgageCalculatorClient.tsx`
5. `src/app/tools/performance-calculator/page.tsx`
6. `src/app/tools/tip-calculator/page.tsx`
7. `src/app/tools/contract-generator/page.tsx`
8. `src/app/tools/invoice-generator/page.tsx`
9. `src/app/tools/proposal-generator/page.tsx`
10. Plus 3-5 more tool files

**Pattern replacement**:
```typescript
// BEFORE
setTimeout(() => setCopied(false), 2000);

// AFTER
import { TIMEOUTS } from '@/lib/constants';
setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK);
```

**Files with save success timeout**:
1. `src/components/calculators/Calculator.tsx` - Line 45

**Pattern replacement**:
```typescript
// BEFORE
setTimeout(() => setSaveSuccess(false), 3000);

// AFTER
import { TIMEOUTS } from '@/lib/constants';
setTimeout(() => setSaveSuccess(false), TIMEOUTS.SAVE_SUCCESS);
```

**Files with print delay**:
1. `src/components/calculators/Calculator.tsx` - Line 308

**Pattern replacement**:
```typescript
// BEFORE
setTimeout(handlePrintPDF, 100);

// AFTER
import { TIMEOUTS } from '@/lib/constants';
setTimeout(handlePrintPDF, TIMEOUTS.PRINT_DELAY);
```

### Category 2: Business Info Replacements (~15 files)

**Files with email address**:
1. All tool generator pages (invoice, contract, proposal)
2. Contact forms
3. Footer component
4. About page
5. Plus 10+ more locations

**Pattern replacement**:
```typescript
// BEFORE
const email = 'hello@hudsondigitalsolutions.com';

// AFTER
import { BUSINESS_INFO } from '@/lib/constants';
const email = BUSINESS_INFO.email;
```

**Files with city/state**:
1. Tool generators with location fields
2. Contact information displays
3. Schema.org structured data

**Pattern replacement**:
```typescript
// BEFORE
city: 'Dallas',
state: 'TX',

// AFTER
import { BUSINESS_INFO } from '@/lib/constants';
city: BUSINESS_INFO.location.city,
state: BUSINESS_INFO.location.stateCode,
```

### Category 3: Storage Key Replacements (~8 files)

**Files with localStorage usage**:
1. `src/stores/calculator-store.ts`
2. Theme toggle components
3. Tool usage tracking
4. Form draft persistence

**Pattern replacement**:
```typescript
// BEFORE
localStorage.getItem('savedCalculations');

// AFTER
import { STORAGE_KEYS } from '@/lib/constants';
localStorage.getItem(STORAGE_KEYS.TTL_SAVED_CALCULATIONS);
```

---

## Execution Steps

### Step 1: Create Constant Files
```bash
# Create all 4 new files
# - src/lib/constants/timeouts.ts
# - src/lib/constants/business.ts
# - src/lib/constants/storage-keys.ts
# - src/lib/constants/index.ts
```

### Step 2: Update Timeout Usage (~12 files)
```bash
# Search for magic timeouts
grep -r "setTimeout.*2000\|setTimeout.*3000\|setTimeout.*100" src/

# Update each file:
# 1. Add import: import { TIMEOUTS } from '@/lib/constants'
# 2. Replace: setTimeout(fn, 2000) → setTimeout(fn, TIMEOUTS.COPY_FEEDBACK)
# 3. Replace: setTimeout(fn, 3000) → setTimeout(fn, TIMEOUTS.SAVE_SUCCESS)
# 4. Replace: setTimeout(fn, 100) → setTimeout(fn, TIMEOUTS.PRINT_DELAY)
```

### Step 3: Update Business Info (~15 files)
```bash
# Search for hardcoded business info
grep -r "hello@hudsondigitalsolutions.com\|'Dallas'\|'TX'" src/

# Update each file:
# 1. Add import: import { BUSINESS_INFO } from '@/lib/constants'
# 2. Replace email strings with BUSINESS_INFO.email
# 3. Replace city with BUSINESS_INFO.location.city
# 4. Replace state with BUSINESS_INFO.location.stateCode
```

### Step 4: Update Storage Keys (~8 files)
```bash
# Search for localStorage usage
grep -r "localStorage.getItem\|localStorage.setItem" src/

# Update each file:
# 1. Add import: import { STORAGE_KEYS } from '@/lib/constants'
# 2. Replace string literals with STORAGE_KEYS.* constants
```

### Step 5: Verification
```bash
# Verify no magic numbers remain
grep -r "setTimeout.*2000\|setTimeout.*3000" src/ | wc -l  # Should be 0

# Verify no hardcoded email
grep -r "hello@hudsondigitalsolutions.com" src/ | wc -l  # Should be 0

# Verify TypeScript compilation
pnpm typecheck

# Verify tests
pnpm test:unit

# Verify build
pnpm build
```

---

## Verification Checklist

- [ ] 4 new constant files created
- [ ] All timeout magic numbers replaced (~12 files)
- [ ] All business info strings replaced (~15 files)
- [ ] All storage keys replaced (~8 files)
- [ ] TypeScript compilation passes
- [ ] All 310 tests pass
- [ ] Production build succeeds
- [ ] No grep matches for old patterns
- [ ] Constants properly typed with `as const`
- [ ] JSDoc comments added for clarity

---

## Expected Impact

**Lines changed**: ~150 lines
**Files modified**: ~40 files
**New files**: 4 files
**Lines removed**: ~50 (replacing verbose literals with imports)

**Benefits**:
- ✅ Single source of truth for timeouts
- ✅ Easy to update business information
- ✅ Type-safe constant access
- ✅ Prevents typos in storage keys
- ✅ Improved maintainability
- ✅ Self-documenting code via JSDoc

---

## Commit Message

```
refactor(phase-5): create centralized constants (Plan 1)

Create single sources of truth for configuration values:

New files:
- src/lib/constants/timeouts.ts - UI timeout durations
- src/lib/constants/business.ts - Company contact info
- src/lib/constants/storage-keys.ts - Storage key literals
- src/lib/constants/index.ts - Barrel export

Updated ~40 files:
- Replace 12 timeout magic numbers (2000ms, 3000ms, 100ms)
- Replace 15+ hardcoded business info strings
- Replace 8+ localStorage key literals

All values now typed with TypeScript for safety.

Lines changed: ~150 across 40 files
```

---

## Risk Assessment

**Risk Level**: LOW

**Risks**:
- Typo in constant name could break functionality
  - **Mitigation**: TypeScript will catch at compile time
- Missing a location during replacement
  - **Mitigation**: grep verification commands catch stragglers
- Business info change ripple
  - **Mitigation**: That's exactly what we're solving!

**Testing Strategy**:
1. TypeScript strict mode compilation
2. Full unit test suite (310 tests)
3. Manual verification of key flows (copy button, save, email)
4. grep commands to verify old patterns removed

---

**Plan 1 Status**: Ready for execution
**Next**: Execute this plan, then proceed to Plan 2 (Environment File Cleanup)
