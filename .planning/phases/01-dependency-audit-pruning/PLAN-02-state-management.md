# Plan 2: Audit State Management & Data Fetching

**Phase:** 1 - Dependency Audit & Pruning
**Created:** 2026-01-09
**Status:** Ready
**Context Budget:** ~50% (~100k tokens)

## Goal

Identify truly unused state management libraries while preserving client-side state management that reduces Vercel server costs. **Client-side code runs free on users' browsers, while Server Components incur Vercel compute charges.**

## Context

**Current State:**
- @tanstack/react-query 5.90.16 (server state caching)
- @tanstack/react-form 1.27.7 (form state management)
- @tanstack/react-table 8.21.3 (table state management)
- zustand 5.0.9 (client state management)
- nuqs 2.8.6 (URL state management)

**Preservation Requirements:**
- Contact form submission (currently uses Server Actions)
- Tool page forms (paystub, invoice, timesheet inputs)
- Any tables displaying data
- URL-based filtering/pagination if present

**Cost Optimization Insight:**
- **Server Components**: Vercel charges for compute time (expensive)
- **Client Components**: Run on user's browser (free)
- **React Query caching**: Reduces server requests (saves money)
- **Zustand client state**: Prevents server re-renders (saves money)

**Architecture Principle:** Use client-side state management to minimize Vercel server costs, not maximize Server Components.

**Research:** None required - codebase analysis against cost optimization

## Tasks

### Task 1: Audit React Query usage

**What:** Determine if TanStack React Query is being used for client-side caching

**How:**
```bash
# Search for React Query imports
grep -r "from '@tanstack/react-query'" src/

# Search for query hooks
grep -r "useQuery\|useMutation\|QueryClient" src/

# Check if QueryClientProvider exists
grep -r "QueryClientProvider" src/
```

**Outcome:** Usage report showing:
- If React Query is initialized (QueryClientProvider)
- Which components use useQuery or useMutation
- What data it's caching client-side

**Verification:**
- [ ] All React Query imports documented
- [ ] Provider location identified (if exists)
- [ ] Client-side caching patterns documented

**Decision Criteria:**
- **KEEP if**: Used for client-side data caching (reduces expensive server requests)
- **KEEP if**: Even lightly used - caching saves more money than bundle size costs
- **Remove ONLY if**: Zero usage (no imports anywhere)

**Checkpoint:** React Query's client-side caching prevents redundant Server Component renders. Even small usage can save significant Vercel costs.

---

### Task 2: Audit TanStack Form and Table usage

**What:** Check if TanStack Form and Table enable client-side functionality

**How:**
```bash
# Check TanStack Form
grep -r "from '@tanstack/react-form'" src/
grep -r "useForm" src/

# Check TanStack Table
grep -r "from '@tanstack/react-table'" src/
grep -r "useReactTable\|createColumnHelper" src/
```

**Outcome:** Usage report showing:
- **TanStack Form**: Client-side form validation vs Server Actions
- **TanStack Table**: Client-side sorting/filtering vs server-side

**Verification:**
- [ ] Form usage documented
- [ ] Table usage documented
- [ ] Client vs server operation identified

**Decision Criteria:**
- **TanStack Form**:
  - **KEEP if**: Provides client-side validation (instant feedback, no server round-trips)
  - **Remove if**: Zero usage AND Server Actions handle everything
- **TanStack Table**:
  - **KEEP if**: Client-side sorting/filtering (free operations on user's browser)
  - **Remove if**: Zero usage AND no tables exist

**Cost Note:** Client-side table operations (sort, filter, paginate) are FREE. Server-side table operations cost money on every interaction.

---

### Task 3: Audit Zustand and nuqs usage

**What:** Check if client-side state management is reducing server dependency

**How:**
```bash
# Check Zustand stores
grep -r "from 'zustand'" src/
grep -r "create(" src/ | grep -i "store"
find src/ -name "*store*" -type f

# Check nuqs (URL state)
grep -r "from 'nuqs'" src/
grep -r "useQueryState\|parseAsString" src/
```

**Outcome:** Usage report showing:
- **Zustand**: What global client state is managed
- **nuqs**: URL params being synced client-side

**Verification:**
- [ ] All Zustand stores identified
- [ ] URL state usage documented
- [ ] Client-side state benefits documented

**Decision Criteria:**
- **Zustand**:
  - **KEEP if**: Managing client state (avoids server re-renders)
  - **KEEP if**: Even lightly used - client state is free, server state costs money
  - **Remove ONLY if**: Zero usage
- **nuqs**:
  - **KEEP if**: Client-side URL state syncing (prevents server round-trips)
  - **Remove if**: Zero usage

**Cost Note:** Every useState/Zustand update that avoids a Server Component re-render saves Vercel compute time.

---

### Task 4: Remove ONLY truly unused libraries

**What:** Uninstall libraries with confirmed ZERO usage (no imports found)

**How:**
```bash
# Remove ONLY libraries with zero imports found in Tasks 1-3
# DO NOT remove libraries that are being used

# Example (only if zero usage confirmed):
# bun remove @tanstack/react-form  # ONLY if no imports found
# bun remove @tanstack/react-table  # ONLY if no imports found

# Verify removal
bun install
bun run dev
```

**Outcome:**
- Remove only truly dead code
- Keep client-side libraries that save server costs
- Preserve cost-optimized architecture

**Verification:**
- [ ] ONLY zero-usage libraries removed
- [ ] Client-side caching libraries preserved
- [ ] No import errors in dev build
- [ ] All features continue working

**Rollback Plan:**
```bash
bun add @tanstack/react-query@5.90.16
# Restore other packages as needed with exact versions
```

## Success Criteria

- [ ] All 5 state management libraries audited with usage report
- [ ] **ONLY** zero-usage libraries removed (expect 0-2 removals)
- [ ] Client-side state management preserved (cost optimization)
- [ ] All forms continue working
- [ ] No increase in server-side operations
- [ ] Build succeeds without errors

## Scope Boundaries

**In Scope:**
- Auditing state management library usage
- Removing libraries with confirmed zero usage
- Preserving client-side functionality for cost optimization
- Testing features after removal

**Out of Scope:**
- Removing libraries that are being used
- Converting client-side to server-side (would increase costs)
- Optimizing bundle size at expense of server costs
- Adding new state management patterns

## Estimated Impact

**Before:**
- 5 state management packages
- Client-side caching and state management

**After:**
- 3-5 state management packages (remove ONLY if unused)
- **Preserved** client-side functionality (cost savings)
- Small bundle reduction (only truly unused libraries)

**Bundle Size:** Expect 0-20kB reduction (only if libraries truly unused)

**Cost Impact:** **Negative cost impact if we remove used libraries** - would force more expensive server operations

## Risk Assessment

**HIGH RISK if we remove used libraries:**
- Forcing Server Components increases Vercel bills
- Removing React Query caching increases server requests
- Removing Zustand increases server re-renders
- Each server operation costs money

**LOW RISK if we only remove unused:**
- Static analysis shows clear zero-usage cases
- Easy to identify libraries with no imports

**Mitigation:**
- **Only remove if grep shows zero imports**
- Test all features after removal
- Keep detailed usage documentation
- Preserve client-side optimizations

## Notes

**CRITICAL COST INSIGHTS:**
- **Server Components cost money** - Vercel charges for compute time
- **Client Components are free** - Run on user's browser
- **React Query caching** - Reduces expensive server requests
- **Zustand client state** - Prevents expensive server re-renders
- **Client-side table operations** - Free sorting/filtering vs paid server ops

**Decision Framework:**
1. Does library have ANY imports? → KEEP
2. Does library enable client-side ops? → KEEP (saves money)
3. Does library reduce server requests? → KEEP (saves money)
4. Zero usage confirmed? → Can remove

**Previous assumption was WRONG:** "Server-first" is NOT cost-optimal for Vercel. Client-side state management REDUCES Vercel bills.

**Only remove libraries with confirmed zero usage.** Bias toward keeping client-side functionality.
