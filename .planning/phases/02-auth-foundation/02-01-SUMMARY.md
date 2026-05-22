---
phase: 02-auth-foundation
plan: 01
subsystem: auth
tags: [auth, env, dependencies, better-auth]
requires:
  - none (foundation plan, no upstream dependencies)
provides:
  - better-auth runtime dependency
  - env.BETTER_AUTH_SECRET (typed, production-required)
  - env.BETTER_AUTH_URL (typed, optional)
  - env.BETTER_AUTH_TRUSTED_ORIGINS (typed, optional)
  - CLAUDE.md auth-section narrative for future sessions
affects:
  - All subsequent 02-auth-foundation plans (02-02 schema, 02-03 server wiring, 02-04 UI)
tech-stack:
  added:
    - better-auth@1.6.11
  patterns:
    - Production-required secret pattern via .optional().refine() (mirrors ADMIN_SECRET / CRON_SECRET)
key-files:
  created:
    - .planning/phases/02-auth-foundation/02-01-SUMMARY.md
  modified:
    - package.json (added better-auth 1.6.11 to dependencies)
    - bun.lock (lockfile updated)
    - src/env.ts (3 new server schema entries + 3 new runtimeEnv mappings)
    - CLAUDE.md (Auth integration bullet rewritten; Env vars production-required list extended)
decisions:
  - better-auth version pinned to 1.6.11 by bun resolver (no manual pin in plan; latest stable at install time)
  - BETTER_AUTH_URL has no default in env.ts; call sites in 02-03 will fall back to BASE_URL
  - BETTER_AUTH_TRUSTED_ORIGINS stays a raw string in env.ts; comma-split happens at the call site (keeps env schema simple)
metrics:
  duration: ~4m
  completed: 2026-05-22T22:49:57Z
  tasks_completed: 3/3
  files_modified: 4
---

# Phase 02 Plan 01: Install Better Auth and Add Env Vars Summary

Installed `better-auth@1.6.11` as a runtime dependency, added three typed environment variables (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`) to the T3 env schema following the existing `ADMIN_SECRET` production-required pattern, and rewrote the CLAUDE.md Auth integration section to reflect that the project now has user auth via Better Auth (with manual admin promotion via SQL).

## What Changed

### Dependency

`bun add better-auth` resolved `better-auth@1.6.11` into `dependencies` (not devDependencies). 21 packages installed total (better-auth + its transitive deps). `bun.lock` updated.

### Env schema entries added to `src/env.ts`

Three new entries in the `server` block (placed immediately after `CRON_SECRET`):

```typescript
// Better Auth - session-signing secret (required in Vercel production)
BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters')
    .optional()
    .refine(
        val => process.env.VERCEL_ENV !== 'production' || !!val,
        'BETTER_AUTH_SECRET is required in production'
    ),

// Better Auth - canonical app URL (optional; falls back to BASE_URL at call site)
BETTER_AUTH_URL: z.string().url().optional(),

// Better Auth - extra trusted origins (optional; comma-separated, parsed at call site)
BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
```

`BETTER_AUTH_SECRET` mirrors the canonical `ADMIN_SECRET` / `CRON_SECRET` pattern exactly: optional + `.refine()` that requires a value when `VERCEL_ENV === 'production'`, with a 32-char minimum.

Three matching entries appended to `runtimeEnv` mapping:

```typescript
BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
```

Placed immediately after the `CRON_SECRET` line. No changes to the `client` block, `skipValidation`, or `emptyStringAsUndefined`.

### CLAUDE.md additions

1. `## INTEGRATIONS > **Auth:**` first bullet replaced:
   - Old: `No user-auth system in this app`
   - New: `User auth: Better Auth, session cookies, see src/lib/auth/. Admin promotion is currently SQL-only - first signup gets it; later admins via UPDATE users SET role='admin' WHERE email='...'.`
2. ADMIN_SECRET / CRON_SECRET Bearer-guard bullet preserved verbatim.
3. `**Env vars:**` schema-required bullet appended: `BETTER_AUTH_SECRET` added to the production-required list (now: `POSTGRES_URL, CSRF_SECRET, ADMIN_SECRET, CRON_SECRET, BETTER_AUTH_SECRET`).

No em-dash, no en-dash, no emoji in any added copy.

## Verification

| Check | Result |
| --- | --- |
| `grep -q '"better-auth"' package.json` | pass |
| `bun pm ls better-auth` | `better-auth@1.6.11` |
| `grep -c 'BETTER_AUTH_SECRET' src/env.ts` | 4 (schema + 2 error messages + runtimeEnv) — matches ADMIN_SECRET count exactly |
| `grep -c 'BETTER_AUTH_URL' src/env.ts` | 2 (schema + runtimeEnv) |
| `grep -c 'BETTER_AUTH_TRUSTED_ORIGINS' src/env.ts` | 2 (schema + runtimeEnv) |
| `bun run lint` | pass (Biome: 275 files, no fixes) |
| `bun run typecheck` | pass (`tsc --noEmit` exit 0) |
| `grep -F "User auth: Better Auth" CLAUDE.md` | one match |
| `grep -F "UPDATE users SET role='admin'" CLAUDE.md` | one match |
| `grep -F "BETTER_AUTH_SECRET" CLAUDE.md` | one match (in Env vars production-required list) |

## Deviations from Plan

**1. [Doc - Acceptance criteria off-by-one] `BETTER_AUTH_SECRET` count in env.ts is 4, not 3**

- Found during: Task 2 verification
- Issue: Plan acceptance criterion said `grep -c 'BETTER_AUTH_SECRET' src/env.ts` should return 3 ("server schema + runtimeEnv + error message"), but the canonical ADMIN_SECRET pattern has two error message strings (one for `.min(...)`, one for `.refine(...)`) plus the schema key plus the runtimeEnv key = 4.
- Resolution: Followed the canonical ADMIN_SECRET pattern verbatim (which the plan's `<interfaces>` block also explicitly says to mirror). `grep -c 'ADMIN_SECRET' src/env.ts` returns 4 for the same reason. The plan's grep-count expectation was off by one; the structural requirement (mirror ADMIN_SECRET exactly) supersedes.
- Files modified: src/env.ts (Task 2, no extra changes beyond plan scope)

No other deviations. Plan executed as written.

## Self-Check: PASSED

- `.planning/phases/02-auth-foundation/02-01-SUMMARY.md` exists (this file)
- `package.json` contains `"better-auth": "1.6.11"`
- `src/env.ts` typechecks clean
- `CLAUDE.md` contains the new auth line and the updated env-vars list
