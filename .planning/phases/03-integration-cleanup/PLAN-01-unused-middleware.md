# Phase 3 Plan 1: Remove Unused Supabase Middleware

**Goal**: Remove unused Supabase session refresh middleware following YAGNI principle

## Context

Found during integration audit:
- `src/lib/supabase/middleware.ts` exports `updateSession()` function
- Function has **0 imports** across entire codebase
- No root `src/middleware.ts` file exists
- Admin API routes use `requireAdminAuth()` directly instead

## Analysis

### Current State
```typescript
// src/lib/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  // Creates Supabase client
  // Calls supabase.auth.getClaims()
  // Redirects to /auth/login if no user
  // Returns response with refreshed cookies
}
```

### Usage Check
```bash
grep -r "updateSession\|supabase/middleware" --include="*.ts" --include="*.tsx" src/
# Result: Only the export line - no imports found
```

### Why It's Unused
- Admin routes use `requireAdminAuth()` (src/lib/admin-auth.ts) for auth checks
- No middleware.ts at root to call updateSession()
- Session refresh happens in admin-auth via `supabase.auth.getUser()`

## YAGNI Justification

- Not currently used → remove immediately
- "Might need for session refresh" → not needed right now
- Admin auth works without it → no functional gap
- Can re-add if auth requirements change (not building for future)

## Execution

### Step 1: Verify Zero Usage
```bash
# Confirm no imports
grep -r "updateSession" src/

# Confirm no root middleware
ls -la src/middleware.ts

# Expected: Only export in middleware.ts, no root middleware
```

### Step 2: Remove Middleware File
```bash
rm src/lib/supabase/middleware.ts
```

### Step 3: Verify Build
```bash
bun run build
# Should succeed - no references to removed file
```

### Step 4: Verify Tests
```bash
bun test:unit
# Should pass - middleware not tested
```

### Step 5: Update Integration Docs
Remove middleware references from:
- `.planning/codebase/INTEGRATIONS.md` (line 14: "Middleware: src/lib/supabase/middleware.ts")
- Update to: "Middleware: None (auth checked in admin-auth.ts)"

## Verification

- [ ] File removed: src/lib/supabase/middleware.ts
- [ ] Build passes
- [ ] Tests pass (310 tests)
- [ ] TypeScript passes
- [ ] Integration docs updated

## Impact

**Lines removed**: ~57 lines
**Files deleted**: 1 file
**Breaking changes**: None (code was never used)
**Auth still works**: Yes (via requireAdminAuth)

## Commit Message

```
refactor(phase-3): remove unused Supabase middleware

Remove src/lib/supabase/middleware.ts with 0 imports:
- updateSession() function never called
- No root middleware.ts exists
- Admin auth works via requireAdminAuth() in admin-auth.ts

Following YAGNI: removing code not currently used.
57 lines removed, auth functionality unchanged.
```
