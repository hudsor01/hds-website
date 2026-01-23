# Plan 6: Full t3-oss/env-nextjs Integration

**Status**: In execution
**Priority**: HIGH
**Estimated Impact**: 82 instances migrated, 5 schema additions, improved type safety

---

## Goal

Fully integrate t3-oss/env-nextjs to get complete type safety, runtime validation, and proper server/client separation for all environment variables.

---

## Current State Analysis

### Usage Statistics
- **Total `process.env.*` instances**: 82 (excluding env.ts runtimeEnv)
- **Files affected**: ~25 files
- **Most common bypasses**: NODE_ENV (34), Supabase vars (16), webhooks (7)

### Top Files to Migrate
1. `src/lib/logger.ts` - 11 instances
2. `src/lib/projects.ts` - 10 instances
3. `src/lib/case-studies.ts` - 8 instances
4. `src/lib/notifications.ts` - 7 instances
5. `src/lib/scheduled-emails.ts` - 4 instances

### Missing from Schema
Variables used in code but not in env.ts:
- `SLACK_WEBHOOK_URL`
- `N8N_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAILS`
- `VERCEL_REGION`

### Current Issues
1. **No type safety**: 82 instances bypass TypeScript autocomplete
2. **No validation**: Can't catch missing required vars at startup
3. **Everything optional**: Schema has `.optional()` on critical vars
4. **Inconsistent imports**: Some files use `env.*`, most use `process.env.*`

---

## Execution Strategy

### Phase 1: Update env.ts Schema

**Add missing variables:**
```typescript
server: {
  // Add these
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
  VERCEL_REGION: z.string().optional(),
},

client: {
  // Add this
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
}
```

**Make required vars non-optional:**
```typescript
server: {
  // Core functionality - REQUIRED
  RESEND_API_KEY: z.string().min(1), // Remove .optional()

  // Database - REQUIRED for most features
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1), // Remove .optional()
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1), // Remove .optional()
},

client: {
  // REQUIRED for app to function
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(), // Remove .optional()
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1), // Remove .optional()
}
```

### Phase 2: Migrate Files (Priority Order)

**Batch 1: High-usage utility files** (31 instances)
- [ ] `src/lib/logger.ts` (11) - NODE_ENV checks
- [ ] `src/lib/projects.ts` (10) - Supabase keys
- [ ] `src/lib/case-studies.ts` (8) - Supabase keys
- [ ] `src/lib/notifications.ts` (7) - Discord/Slack webhooks

**Batch 2: Supabase clients** (6 instances)
- [ ] `src/lib/supabase/server.ts` (2)
- [ ] `src/lib/supabase/middleware.ts` (2)
- [ ] `src/lib/supabase/client.ts` (2)

**Batch 3: API routes** (12 instances)
- [ ] `src/app/api/cron/analytics-processing/route.ts` (3)
- [ ] `src/app/actions/ttl-calculator.ts` (3)
- [ ] `src/app/api/lead-magnet/route.ts` (2)
- [ ] ~8 more API route files (1 each)

**Batch 4: Remaining files** (33 instances)
- [ ] `src/lib/scheduled-emails.ts` (4)
- [ ] `src/lib/admin-auth.ts` (2)
- [ ] `src/lib/csrf.ts` (1)
- [ ] `src/components/WebVitalsReporting.tsx` (2)
- [ ] ~20 more files

### Phase 3: Special Cases

**NODE_ENV (34 instances):**
- Already typed by env.ts schema
- Can keep some `process.env.NODE_ENV` for build-time checks
- Migrate runtime checks to `env.NODE_ENV`

**Conditional usage:**
```typescript
// Before
if (process.env.NODE_ENV === 'production') {}

// After (runtime)
import { env } from '@/env';
if (env.NODE_ENV === 'production') {}

// Keep for build-time
if (process.env.NODE_ENV === 'production') {} // In webpack/build configs only
```

---

## Migration Pattern

### Standard Replacement

**Before:**
```typescript
const apiKey = process.env.RESEND_API_KEY;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (process.env.NODE_ENV === 'production') {
  // ...
}
```

**After:**
```typescript
import { env } from '@/env';

const apiKey = env.RESEND_API_KEY;
const webhookUrl = env.DISCORD_WEBHOOK_URL;

if (env.NODE_ENV === 'production') {
  // ...
}
```

### Conditional Access

**Before:**
```typescript
const key = process.env.OPTIONAL_KEY || 'fallback';
```

**After:**
```typescript
import { env } from '@/env';

const key = env.OPTIONAL_KEY ?? 'fallback';
```

---

## Verification

### TypeScript Compilation
```bash
bun run typecheck
# Should pass with proper types
```

### Runtime Validation
```bash
# Test with missing required var
unset RESEND_API_KEY
pnpm dev
# Should fail at startup with clear error
```

### Regression Testing
```bash
# Ensure app still works
pnpm dev
# Test:
# - Database queries work
# - Email sending works
# - Webhook notifications work
```

---

## Expected Impact

**Type Safety:**
- ✅ 82 instances now have TypeScript autocomplete
- ✅ Catch typos at compile time
- ✅ Impossible to use undefined vars

**Runtime Validation:**
- ✅ Missing required vars caught at startup
- ✅ Invalid URLs/formats rejected before deployment
- ✅ Clear error messages guide fixes

**Security:**
- ✅ Server secrets can't leak to client bundle
- ✅ NEXT_PUBLIC_ prefix enforced
- ✅ Type system prevents misuse

**Developer Experience:**
- ✅ Autocomplete for all env vars
- ✅ Self-documenting via TypeScript
- ✅ Single source of truth (env.ts)

---

## Commit Strategy

**Commit 1: Update schema**
```
refactor(env): add missing variables and make required vars non-optional

Add missing variables to env.ts schema:
- SLACK_WEBHOOK_URL, N8N_WEBHOOK_SECRET, ADMIN_EMAILS, VERCEL_REGION, NEXT_PUBLIC_SITE_URL

Make truly required variables non-optional:
- RESEND_API_KEY, SUPABASE keys (required for core functionality)
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Adds runtime validation for critical configuration.
```

**Commit 2-5: Migrate files in batches**
```
refactor(env): migrate [batch-name] to typed env (Part X/4)

Replace process.env.* with env.* imports in:
- [list of files]

Adds TypeScript type safety and autocomplete.
X instances migrated.
```

**Commit 6: Final verification**
```
docs(env): complete full t3-oss/env-nextjs integration

All 82 process.env.* instances migrated to typed env.* imports.
Runtime validation now catches missing required vars at startup.
Full type safety across entire codebase.

Part of Phase 5: Configuration Simplification
```

---

## Risk Mitigation

**Backup before changes:**
```bash
git stash push -m "backup before env migration"
```

**Test incrementally:**
- Run typecheck after each batch
- Test app startup between batches
- Verify no regressions

**Rollback plan:**
- Each batch is a separate commit
- Can revert individual batches if issues found

---

**Plan 6 Status**: Ready for execution
**Estimated Time**: 2-3 hours (systematic migration)
**Next**: Execute Phase 1 (schema updates)
