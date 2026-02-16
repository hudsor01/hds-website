---
phase: 37-environment-configuration-hygiene
plan: 01
status: complete
---

# Summary: Environment & Configuration Hygiene

**Commit:** 7f6b5e9 (`refactor(37): env hygiene, remove dead code`)

## What Was Done

1. **Routed bypassed env vars through env.ts validation**
   - Added `POSTGRES_URL` and `STIRLING_PDF_URL` to env.ts with Zod schemas
   - Updated `src/lib/db.ts` and `src/lib/pdf/stirling-client.ts` to import from `env`
   - Updated `src/app/api/lead-magnet/route.ts` to use `env.DISCORD_WEBHOOK_URL`

2. **Updated .env.example to reflect current stack**
   - Replaced Supabase references with Neon/Drizzle (`POSTGRES_URL`, `DATABASE_URL_UNPOOLED`)
   - Removed stale entries: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_WEBHOOK_SECRET`
   - Added `STIRLING_PDF_URL` section

3. **Fixed CSP reports empty string bug**
   - Removed `""` from `EXPECTED_CSP_FIELDS` array in `src/app/api/csp-reports/route.ts`
   - The empty string caused `String.includes("")` to always return true, bypassing validation

4. **Deleted dead auth code**
   - Removed `src/app/api/auth/[...path]/route.ts` (no auth system exists)
   - Removed `@neondatabase/auth` dependency
   - Removed `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` from env.ts and .env.example

5. **Deleted dead n8n integration**
   - Removed `n8n-workflows/` directory (5 JSON workflow exports, never used)
   - Removed `src/app/api/webhooks/n8n/route.ts` (262 lines, speculative code)
   - Removed `N8N_WEBHOOK_SECRET` from env.ts
   - Removed `WEBHOOKS_N8N` constant and `ADMIN_API_ENDPOINTS` (admin panel already deleted)

6. **Reconfigured lefthook**
   - Removed stale `.husky/_` hooks path, lefthook now uses standard `.git/hooks/`
   - Removed "Replaces husky" comment from lefthook.yml

## Results

- **+35 lines, -1,135 lines** across 17 files
- Zero lint warnings, zero TypeScript errors
- 330 unit tests passing
- All env vars flow through env.ts (except documented exclusions: `SKIP_ENV_VALIDATION`, `NODE_ENV` in logger, `DATABASE_URL_UNPOOLED` in drizzle.config.ts)
- Zero Supabase references in config files
- Zero dead auth/n8n code remaining

## Issues

None.
