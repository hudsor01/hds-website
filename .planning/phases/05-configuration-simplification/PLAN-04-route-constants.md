# Plan 4: Extract Route Constants

**Status**: Ready for execution
**Priority**: MEDIUM
**Estimated Impact**: ~30 files updated with type-safe routing

---

## Goal

Create centralized, type-safe constants for application routes and API endpoints, enabling easier refactoring and preventing broken links from typos.

---

## Problem Identified

### Current State

**Route strings scattered throughout codebase**:
```typescript
// In Navigation component
<Link href="/tools/ttl-calculator">

// In redirect logic
router.push('/tools/cost-estimator')

// In API calls
fetch('/api/contact')
```

**Issues**:
1. **Typo risk**: Easy to misspell `/tools/ttl-calculator`
2. **Hard to refactor**: If URL changes, must find all string occurrences
3. **No type safety**: Compiler can't help find broken links
4. **No autocomplete**: Can't discover available routes easily

**Impact**:
- Broken links from typos
- Difficult URL structure changes
- No compile-time safety
- Poor developer experience

---

## Solution

Create two centralized constant files with TypeScript typing:

### File 1: `src/lib/constants/routes.ts`

```typescript
/**
 * Application routes
 * Type-safe constants for all app navigation
 */

/** Home and main pages */
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  PORTFOLIO: '/portfolio',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

/** Tool pages */
export const TOOL_ROUTES = {
  INDEX: '/tools',
  TTL_CALCULATOR: '/tools/ttl-calculator',
  COST_ESTIMATOR: '/tools/cost-estimator',
  ROI_CALCULATOR: '/tools/roi-calculator',
  MORTGAGE_CALCULATOR: '/tools/mortgage-calculator',
  PERFORMANCE_CALCULATOR: '/tools/performance-calculator',
  TIP_CALCULATOR: '/tools/tip-calculator',
  PAYSTUB_GENERATOR: '/tools/paystub-generator',
  CONTRACT_GENERATOR: '/tools/contract-generator',
  INVOICE_GENERATOR: '/tools/invoice-generator',
  PROPOSAL_GENERATOR: '/tools/proposal-generator',
} as const;

/** Dynamic routes with helper functions */
export const DYNAMIC_ROUTES = {
  /** Portfolio project detail page */
  portfolioProject: (slug: string) => `/portfolio/${slug}` as const,

  /** Shared calculator results */
  sharedCalculation: (code: string) => `/tools/ttl-calculator?c=${code}` as const,
} as const;

/** All routes combined */
export const ALL_ROUTES = {
  ...ROUTES,
  TOOLS: TOOL_ROUTES,
  DYNAMIC: DYNAMIC_ROUTES,
} as const;

// Type exports for usage in components
export type Route = typeof ROUTES[keyof typeof ROUTES];
export type ToolRoute = typeof TOOL_ROUTES[keyof typeof TOOL_ROUTES];
```

### File 2: `src/lib/constants/api-endpoints.ts`

```typescript
/**
 * API endpoints
 * Type-safe constants for all API calls
 */

/** Public API endpoints */
export const API_ENDPOINTS = {
  // Contact and forms
  CONTACT: '/api/contact',
  TESTIMONIALS_SUBMIT: '/api/testimonials/submit',
  NEWSLETTER_SUBSCRIBE: '/api/newsletter/subscribe',
  LEAD_MAGNET: '/api/lead-magnet',

  // Tool generators
  PAYSTUB: '/api/paystub',
  CONTRACT: '/api/contract',
  INVOICE: '/api/invoice',
  PROPOSAL: '/api/proposal',

  // TTL Calculator
  TTL_CALCULATE: '/api/ttl/calculate',
  TTL_SAVE: '/api/ttl/save',
  TTL_LOAD: '/api/ttl/load',
  TTL_EMAIL: '/api/ttl/email',

  // Data fetching
  TESTIMONIALS: '/api/testimonials',
  CASE_STUDIES: '/api/case-studies',
  PORTFOLIO: '/api/portfolio',
} as const;

/** Admin API endpoints (service role required) */
export const ADMIN_API_ENDPOINTS = {
  USERS: '/api/admin/users',
  ANALYTICS: '/api/admin/analytics',
} as const;

/** Helper function for query parameters */
export function buildApiUrl(endpoint: string, params?: Record<string, string | number>): string {
  if (!params) return endpoint;

  const queryString = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();

  return `${endpoint}?${queryString}`;
}

// Type exports
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type AdminApiEndpoint = typeof ADMIN_API_ENDPOINTS[keyof typeof ADMIN_API_ENDPOINTS];
```

### File 3: Update barrel export

**`src/lib/constants/index.ts`**:
```typescript
export * from './timeouts';
export * from './business';
export * from './storage-keys';
export * from './routes';
export * from './api-endpoints';
```

---

## Files to Update

### Category 1: Navigation Components (~5 files)

**Files**:
1. `src/components/layout/NavbarLight.tsx`
2. `src/components/layout/Footer.tsx`
3. `src/components/layout/MobileNav.tsx` (if exists)
4. `src/app/page.tsx` (home links)
5. `src/app/tools/page.tsx` (tool index)

**Pattern replacement**:
```typescript
// BEFORE
<Link href="/tools/ttl-calculator">TTL Calculator</Link>
<Link href="/portfolio">Portfolio</Link>

// AFTER
import { TOOL_ROUTES, ROUTES } from '@/lib/constants';
<Link href={TOOL_ROUTES.TTL_CALCULATOR}>TTL Calculator</Link>
<Link href={ROUTES.PORTFOLIO}>Portfolio</Link>
```

### Category 2: Client-Side Navigation (~8 files)

**Files**:
1. Tool pages with internal navigation
2. Forms with redirect after success
3. Calculator with route changes

**Pattern replacement**:
```typescript
// BEFORE
router.push('/tools/cost-estimator');
router.push(`/portfolio/${slug}`);

// AFTER
import { TOOL_ROUTES, DYNAMIC_ROUTES } from '@/lib/constants';
router.push(TOOL_ROUTES.COST_ESTIMATOR);
router.push(DYNAMIC_ROUTES.portfolioProject(slug));
```

### Category 3: API Calls (~15 files)

**Files**:
1. All client components making fetch calls
2. Server Actions
3. API route handlers (internal redirects)

**Pattern replacement**:
```typescript
// BEFORE
const response = await fetch('/api/contact', { ... });
const response = await fetch('/api/testimonials/submit', { ... });

// AFTER
import { API_ENDPOINTS } from '@/lib/constants';
const response = await fetch(API_ENDPOINTS.CONTACT, { ... });
const response = await fetch(API_ENDPOINTS.TESTIMONIALS_SUBMIT, { ... });
```

### Category 4: Metadata and SEO (~10 files)

**Files**:
1. All page.tsx files with metadata
2. Sitemap configuration
3. Canonical URL generation

**Pattern replacement**:
```typescript
// BEFORE
canonical: `https://hudsondigitalsolutions.com/tools/ttl-calculator`,

// AFTER
import { TOOL_ROUTES } from '@/lib/constants';
import { BUSINESS_INFO } from '@/lib/constants';
canonical: `${BUSINESS_INFO.links.website}${TOOL_ROUTES.TTL_CALCULATOR}`,
```

---

## Execution Steps

### Step 1: Create Route Constants
```bash
# Create new files
# - src/lib/constants/routes.ts
# - src/lib/constants/api-endpoints.ts
# - Update src/lib/constants/index.ts
```

### Step 2: Update Navigation Components (~5 files)
```bash
# Search for hardcoded routes in navigation
grep -r "href=\"/" src/components/layout/

# Update each navigation component:
# 1. Import route constants
# 2. Replace string literals with constants
# 3. Verify TypeScript compilation
```

### Step 3: Update Client Navigation (~8 files)
```bash
# Search for router.push calls
grep -r "router.push\|router.replace" src/

# Update each file:
# 1. Import route constants
# 2. Replace strings with constants or helper functions
```

### Step 4: Update API Calls (~15 files)
```bash
# Search for fetch calls
grep -r "fetch('/api" src/

# Update each file:
# 1. Import API_ENDPOINTS
# 2. Replace endpoint strings
# 3. Use buildApiUrl for query params if needed
```

### Step 5: Update Metadata (~10 files)
```bash
# Search for canonical URLs and metadata
grep -r "canonical\|'https://hudsondigitalsolutions" src/app/

# Update each page:
# 1. Import ROUTES and BUSINESS_INFO
# 2. Build URLs from constants
```

### Step 6: Update Sitemap Config
```bash
# Update next-sitemap.config.js to use constants
# Import and use route constants for sitemap generation
```

### Step 7: Verification
```bash
# Verify no hardcoded routes remain
grep -r "href=\"/tools" src/ | wc -l  # Should be minimal
grep -r "fetch('/api" src/ | wc -l   # Should be 0

# TypeScript compilation
pnpm typecheck

# Build
pnpm build

# Test navigation
pnpm dev
# Click through all nav links
# Verify all routes work
```

---

## Verification Checklist

- [ ] 2 new constant files created
- [ ] Navigation components updated (~5 files)
- [ ] Client-side navigation updated (~8 files)
- [ ] API calls updated (~15 files)
- [ ] Metadata/SEO updated (~10 files)
- [ ] Sitemap config updated
- [ ] TypeScript compilation passes
- [ ] All routes accessible
- [ ] All API endpoints work
- [ ] No broken links
- [ ] Autocomplete works in IDE

---

## Expected Impact

**Lines changed**: ~100 lines
**Files modified**: ~30 files
**New files**: 2 files

**Benefits**:
- ✅ Type-safe routing throughout app
- ✅ Autocomplete for routes in IDE
- ✅ Compiler catches broken links
- ✅ Easy to refactor URL structure
- ✅ Single source of truth for routes
- ✅ No more typo-induced 404s
- ✅ Better developer experience

---

## Advanced Usage Examples

### Type-Safe Link Component

```typescript
import { type Route, type ToolRoute } from '@/lib/constants';

interface TypedLinkProps {
  href: Route | ToolRoute | string; // string for dynamic routes
  children: React.ReactNode;
}

export function TypedLink({ href, children }: TypedLinkProps) {
  return <Link href={href}>{children}</Link>;
}
```

### Route Utilities

```typescript
// Add to routes.ts
export function isToolRoute(pathname: string): boolean {
  return pathname.startsWith('/tools');
}

export function getRouteTitle(route: Route | ToolRoute): string {
  const titles: Record<string, string> = {
    [ROUTES.HOME]: 'Home',
    [TOOL_ROUTES.TTL_CALCULATOR]: 'TTL Calculator',
    // ... more mappings
  };
  return titles[route] || 'Page';
}
```

---

## Commit Message

```
refactor(phase-5): create type-safe route constants (Plan 4)

Centralize all routes and API endpoints for type safety:

New files:
- src/lib/constants/routes.ts - App routes with TypeScript types
- src/lib/constants/api-endpoints.ts - API endpoint constants

Updated ~30 files:
- Navigation components (5 files)
- Client-side routing (8 files)
- API fetch calls (15 files)
- Metadata/SEO (10 files)

All routes now type-safe with autocomplete support.
Compiler will catch broken links at build time.

Lines changed: ~100 across 30 files
```

---

## Risk Assessment

**Risk Level**: LOW-MEDIUM

**Risks**:
- Missing a route during replacement
  - **Mitigation**: Comprehensive grep searches, manual testing
- Breaking dynamic routes
  - **Mitigation**: Helper functions with TypeScript types
- SEO impact from URL changes
  - **Mitigation**: NOT changing URLs, just centralizing constants

**Testing Strategy**:
1. TypeScript strict compilation
2. Full test suite
3. Manual navigation testing
4. Verify all API calls work
5. Check for 404s in dev
6. Test dynamic routes (portfolio, shared calculations)

---

**Plan 4 Status**: Ready for execution
**Next**: Execute this plan, then proceed to Plan 5 (Final Verification)
