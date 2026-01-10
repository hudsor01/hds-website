# Plan 2: Audit State Management & Data Fetching

**Phase:** 1 - Dependency Audit & Pruning
**Created:** 2026-01-09
**Status:** Ready
**Context Budget:** ~50% (~100k tokens)

## Goal

Identify and remove unnecessary state management libraries that duplicate Next.js 16 Server Components and Server Actions patterns, simplifying the architecture while preserving working features.

## Context

**Current State:**
- @tanstack/react-query 5.90.16 (server state caching)
- @tanstack/react-form 1.27.7 (form state management)
- @tanstack/react-table 8.21.3 (table state management)
- zustand 5.0.9 (client state management)
- nuqs 2.8.6 (URL state management)

**Preservation Requirements:**
- Contact form submission (uses Server Actions per ARCHITECTURE.md)
- Tool page forms (paystub, invoice, timesheet inputs)
- Any tables displaying data
- URL-based filtering/pagination if present

**Architecture Pattern:**
- Next.js 16 Server Components (default)
- Server Actions for mutations (no API routes needed)
- useActionState for form state (React 19 hook)
- Minimal client-side state (per CLAUDE.md guidelines)

**Research:** None required - codebase analysis against documented patterns

## Tasks

### Task 1: Audit React Query usage

**What:** Determine if TanStack React Query is actually used for server state management

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
- What data fetching it manages

**Verification:**
- [ ] All React Query imports documented
- [ ] Provider location identified (if exists)
- [ ] Alternative: Server Components + Server Actions already handle all data needs

**Decision Criteria:**
- **Remove if**: Zero usage OR all data fetching is handled by Server Components
- **Keep if**: Complex client-side caching is essential to features

**Checkpoint:** React Query is often overkill with Server Components. If data fetching is < 3 locations, Server Components likely sufficient.

---

### Task 2: Audit TanStack Form and Table usage

**What:** Check if TanStack Form and Table are used, or if simpler patterns suffice

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
- **TanStack Form**: Used or replaced by useActionState + Server Actions
- **TanStack Table**: Used for any data tables or completely unused

**Verification:**
- [ ] Form usage documented (vs. Server Actions pattern)
- [ ] Table usage documented (vs. basic HTML tables)
- [ ] ARCHITECTURE.md pattern confirms Server Actions for forms

**Decision Criteria:**
- **TanStack Form**: Remove if Server Actions handle all forms (ARCHITECTURE.md confirms this)
- **TanStack Table**: Remove if no complex tables exist (sortable, filterable, paginated)

---

### Task 3: Audit Zustand and nuqs usage

**What:** Check if client-side state management is actually needed

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
- **Zustand**: What global state is managed (if any)
- **nuqs**: URL params being synced to state

**Verification:**
- [ ] All Zustand stores identified
- [ ] URL state usage documented
- [ ] Alternative approaches evaluated (React useState, searchParams)

**Decision Criteria:**
- **Zustand**: Remove if no global client state needed (Server Components minimize this)
- **nuqs**: Remove if no complex URL state syncing (searchParams may suffice)

**Note:** Per CLAUDE.md: "Server State: React Server Components (no client state)"

---

### Task 4: Remove unused state management libraries

**What:** Uninstall libraries identified as unused in Tasks 1-3

**How:**
```bash
# Remove unused libraries (example - adjust based on findings)
bun remove @tanstack/react-query
bun remove @tanstack/react-form
bun remove @tanstack/react-table
bun remove zustand
bun remove nuqs

# Verify removal
bun install
bun run dev
```

**Outcome:**
- Cleaner package.json
- Reduced bundle size (React Query alone ~40kB)
- Simpler mental model (one pattern: Server Components + Server Actions)

**Verification:**
- [ ] Unused libraries removed from package.json
- [ ] No import errors in dev build
- [ ] Contact form submits successfully (Server Action pattern)
- [ ] Tool pages render and accept input
- [ ] No runtime errors in browser console

**Rollback Plan:**
```bash
bun add @tanstack/react-query@5.90.16
# Restore other packages as needed with exact versions
```

## Success Criteria

- [ ] All 5 state management libraries audited with usage report
- [ ] Unused libraries removed (expect 3-4 removals)
- [ ] Server Components + Server Actions confirmed as primary pattern
- [ ] All forms continue working (contact, tool inputs)
- [ ] No client-side state management bugs introduced
- [ ] Build succeeds without errors
- [ ] Contact form submission tested end-to-end

## Scope Boundaries

**In Scope:**
- Auditing state management library usage
- Removing libraries with zero usage
- Confirming Server Components pattern handles needs
- Testing form submissions after removal

**Out of Scope:**
- Refactoring forms from TanStack to Server Actions (if in use)
- Adding new state management patterns
- Optimizing data fetching performance
- Implementing caching strategies

## Estimated Impact

**Before:**
- 5 state management packages
- ~60-80kB in client bundle (React Query, Zustand, etc.)
- Multiple patterns for state (confusion)

**After:**
- 0-1 state management packages (keep only if actively used)
- ~10-20kB in client bundle (minimal useState)
- One clear pattern: Server Components + Server Actions

**Bundle Size:** Expect 40-60kB reduction in first load JS

## Risk Assessment

**Low Risk:**
- Server Components + Server Actions are the documented architecture
- CLAUDE.md explicitly says "Server State: React Server Components (no client state)"
- Static analysis shows clear usage patterns

**Medium Risk:**
- If React Query is used, removing may require alternative caching strategy

**Mitigation:**
- Test all forms after each removal
- Keep Server Actions intact (they're the replacement)
- Verify contact form email delivery still works

## Notes

- Next.js 16 Server Components eliminate most client state needs
- Server Actions replace React Query mutations
- useActionState (React 19) replaces TanStack Form
- Simple useState replaces Zustand for local UI state
- Next.js searchParams replace nuqs for URL state
- This aligns with CLAUDE.md: "Server-first: Default to Server Components"
