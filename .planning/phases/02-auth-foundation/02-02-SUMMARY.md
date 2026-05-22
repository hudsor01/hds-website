---
phase: 02-auth-foundation
plan: 02
subsystem: auth
tags: [auth, drizzle, neon, schema, better-auth]
requires:
  - 02-01 (better-auth installed, env vars added)
provides:
  - "src/lib/schemas/auth.ts: users, sessions, accounts, verifications Drizzle tables + type exports"
  - "neondb.public.users, sessions, accounts, verifications (live tables)"
  - "src/lib/schemas/schema.ts barrel re-export for the auth schema"
affects:
  - src/lib/schemas/schema.ts
tech-stack:
  added: []
  patterns:
    - "Better Auth standard schema shape (text IDs, no defaultRandom on PKs)"
    - "DDL via psql (Neon MCP unavailable in this env; equivalent to mcp__Neon__run_sql)"
key-files:
  created:
    - src/lib/schemas/auth.ts
    - .planning/phases/02-auth-foundation/02-02-SUMMARY.md
  modified:
    - src/lib/schemas/schema.ts
decisions:
  - "Hand-wrote Drizzle tables per CONTEXT section 4 instead of running @better-auth/cli generate, because src/lib/auth/index.ts does not exist yet (it lands in 02-03). The CLI requires a betterAuth({...}) config to read from, so the chicken-and-egg is solved by authoring the schema first."
  - "Applied DDL with psql against $DATABASE_URL_UNPOOLED. The plan's nominal mechanism is mcp__Neon__run_sql, but that MCP server is not connected in this environment. psql against the unpooled Neon endpoint is functionally identical (same database, same branch, same DDL semantics). drizzle-kit push was NOT used (broken on this project due to pg_cron + hypopg)."
  - "users.role text NOT NULL DEFAULT 'user'. No DB CHECK constraint on values. The 'admin' value is set by the Better Auth databaseHook in 02-03 (first signup wins)."
metrics:
  duration: "~54m wall clock (mostly idle); ~5m active execution"
  tasks-completed: 3
  files-created: 2
  files-modified: 1
  completed: 2026-05-22
---

# Phase 02 Plan 02: Better Auth Drizzle Schema + Neon DDL Summary

Defined the Better Auth Drizzle schema (users, sessions, accounts, verifications) in `src/lib/schemas/auth.ts`, wired it into the barrel, and created the four tables in Neon `neondb` via direct SQL.

## What changed

- **Created** `src/lib/schemas/auth.ts` (94 lines) — four `pgTable` definitions plus 8 inferred type exports (User/NewUser, Session/NewSession, Account/NewAccount, Verification/NewVerification). Only imports from `'drizzle-orm/pg-core'` (boolean, pgTable, text, timestamp). No zod, no @/lib/db dependency.
- **Modified** `src/lib/schemas/schema.ts` — inserted `export * from './auth'` between `./analytics` and `./blog` (alphabetical order preserved).
- **Database** — created 4 tables in `neondb.public` via psql DDL transaction.

## Approach taken

Hand-wrote the Drizzle schema per CONTEXT.md section 4. The Better Auth CLI generator (`npx @better-auth/cli generate`) was not used because it requires a `betterAuth({...})` config object to introspect, and `src/lib/auth/index.ts` doesn't exist until 02-03. The hand-written schema matches Better Auth's standard column shapes (text IDs, `email_verified` boolean, OAuth-friendly accounts table) and will be validated against the Drizzle adapter at runtime in 02-03.

## DDL applied

A single transaction with four `CREATE TABLE IF NOT EXISTS` statements in dependency order (users first; sessions and accounts reference users; verifications standalone):

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  name text,
  image text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  token text NOT NULL UNIQUE,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope text,
  password text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verifications (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
```

psql output: `BEGIN / CREATE TABLE x4 / COMMIT`.

**Why psql rather than `mcp__Neon__run_sql`:** the Neon MCP server is not registered in this Claude Code environment (only context7, supabase, n8n-mcp are listed by `claude mcp list`, and the Neon one isn't connected). psql against `$DATABASE_URL_UNPOOLED` is functionally equivalent — same Neon project `soft-bush-38066584`, same branch `br-rough-shape-afdj4aqj`, same database `neondb`. `drizzle-kit push` was NOT used: it remains broken on this project because pg_cron + hypopg are installed (per CLAUDE.md and project memory).

## Post-change verification

### Table list (equivalent of `mcp__Neon__list_tables` filtered to the 4 new tables)

```
  table_name
---------------
 accounts
 sessions
 users
 verifications
(4 rows)
```

### users — columns

```
  column_name   |        data_type         | is_nullable | column_default
----------------+--------------------------+-------------+----------------
 id             | text                     | NO          |
 email          | text                     | NO          |
 email_verified | boolean                  | NO          | false
 name           | text                     | YES         |
 image          | text                     | YES         |
 role           | text                     | NO          | 'user'::text
 created_at     | timestamp with time zone | NO          | now()
 updated_at     | timestamp with time zone | NO          | now()
```

### users — constraints

```
     conname     | contype | pg_get_constraintdef
-----------------+---------+----------------------
 users_pkey      | p       | PRIMARY KEY (id)
 users_email_key | u       | UNIQUE (email)
```

### sessions — columns

```
 column_name |        data_type         | is_nullable | column_default
-------------+--------------------------+-------------+----------------
 id          | text                     | NO          |
 user_id     | text                     | NO          |
 expires_at  | timestamp with time zone | NO          |
 token       | text                     | NO          |
 ip_address  | text                     | YES         |
 user_agent  | text                     | YES         |
 created_at  | timestamp with time zone | NO          | now()
 updated_at  | timestamp with time zone | NO          | now()
```

### sessions — constraints

```
        conname        | contype |                     pg_get_constraintdef
-----------------------+---------+--------------------------------------------------------------
 sessions_user_id_fkey | f       | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
 sessions_pkey         | p       | PRIMARY KEY (id)
 sessions_token_key    | u       | UNIQUE (token)
```

### accounts — columns

```
       column_name        |        data_type         | is_nullable | column_default
--------------------------+--------------------------+-------------+----------------
 id                       | text                     | NO          |
 user_id                  | text                     | NO          |
 account_id               | text                     | NO          |
 provider_id              | text                     | NO          |
 access_token             | text                     | YES         |
 refresh_token            | text                     | YES         |
 id_token                 | text                     | YES         |
 access_token_expires_at  | timestamp with time zone | YES         |
 refresh_token_expires_at | timestamp with time zone | YES         |
 scope                    | text                     | YES         |
 password                 | text                     | YES         |
 created_at               | timestamp with time zone | NO          | now()
 updated_at               | timestamp with time zone | NO          | now()
```

### accounts — constraints

```
        conname        | contype |                     pg_get_constraintdef
-----------------------+---------+--------------------------------------------------------------
 accounts_user_id_fkey | f       | FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
 accounts_pkey         | p       | PRIMARY KEY (id)
```

### verifications — columns

```
 column_name |        data_type         | is_nullable | column_default
-------------+--------------------------+-------------+----------------
 id          | text                     | NO          |
 identifier  | text                     | NO          |
 value       | text                     | NO          |
 expires_at  | timestamp with time zone | NO          |
 created_at  | timestamp with time zone | NO          | now()
 updated_at  | timestamp with time zone | NO          | now()
```

## Barrel re-export

`src/lib/schemas/schema.ts` now reads:

```typescript
export * from './analytics'
export * from './auth'      // <- new
export * from './blog'
export * from './content'
export * from './emails'
export * from './leads'
export * from './showcase'
export * from './system'
export * from './ttl'
```

`import { users, sessions, accounts, verifications } from '@/lib/schemas/schema'` resolves cleanly.

## Acceptance criteria

All criteria from the plan pass:

| Criterion                                            | Status |
| ---------------------------------------------------- | ------ |
| `src/lib/schemas/auth.ts` ≥ 60 lines                 | 94 lines |
| `pgTable('users' / 'sessions' / 'accounts' / 'verifications')` each present once | 4/4 |
| `onDelete: 'cascade'` count = 2                      | 2 |
| `.unique()` count = 2 (users.email, sessions.token)  | 2 |
| `export type` count = 8                              | 8 |
| Only imports from `'drizzle-orm/pg-core'`            | yes |
| 4 tables exist in Neon                               | yes |
| `users.role` text NOT NULL DEFAULT `'user'`          | confirmed |
| `users.email` UNIQUE                                 | confirmed |
| `sessions.user_id` FK to users(id) ON DELETE CASCADE | confirmed |
| `sessions.token` UNIQUE                              | confirmed |
| Barrel re-exports `./auth` between `./analytics` and `./blog` | confirmed |
| `bun run lint` exits 0                               | yes |
| `bun run typecheck` exits 0                          | yes |

## Deviations from plan

**1. [Rule 3 - Blocking issue] Neon MCP unavailable in this Claude Code environment; used psql instead.**
- **Found during:** Task 3
- **Issue:** The plan instructs DDL via `mcp__Neon__run_sql`. `claude mcp list` shows only context7, supabase (unauthenticated), and n8n-mcp (failed) — no Neon MCP server connected.
- **Fix:** Used `psql "$DATABASE_URL_UNPOOLED"` to run the same DDL transactionally. This targets the same Neon project (`soft-bush-38066584`), same branch (`br-rough-shape-afdj4aqj`), same database (`neondb`). The DDL is byte-identical to what the MCP would have issued.
- **Why not `drizzle-kit push`:** Still broken on this project due to pg_cron + hypopg installation; no change there.
- **Files modified:** none (DB-only operation).

No other deviations. Code, types, and SQL match the spec.

## Notes for downstream plans

- Plan 02-03 wires `auth = betterAuth({ database: drizzleAdapter(db, { provider: 'pg', schema: { user: users, session: sessions, account: accounts, verification: verifications } }) })`. The Drizzle adapter expects singular-cased map keys; the table identifiers exported from `auth.ts` are plural, so the mapping is `user: users`, `session: sessions`, etc.
- The first-signup-becomes-admin behavior is a databaseHook in `betterAuth({...})` config, not a DB-level trigger. The `role` column default `'user'` is correct.
- No indexes beyond PK/UNIQUE were added. If query patterns later need `sessions(user_id)` or `accounts(user_id, provider_id)` lookups outside the FK, add them in a perf-tuning plan.

## Self-Check: PASSED

- `src/lib/schemas/auth.ts` exists: FOUND
- `src/lib/schemas/schema.ts` contains `export * from './auth'`: FOUND
- 4 tables in Neon `neondb.public`: FOUND (users, sessions, accounts, verifications)
- Lint + typecheck clean: FOUND
