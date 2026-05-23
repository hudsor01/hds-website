---
phase: 02-auth-foundation
plan: 03
subsystem: auth
tags: [better-auth, drizzle, sessions, server-only]
requires:
  - 02-01 (better-auth dependency + env vars)
  - 02-02 (Drizzle auth tables live in Neon)
provides:
  - "@/lib/auth": configured Better Auth server instance (`auth`)
  - "@/lib/auth/client": browser SDK + named helpers (signIn, signUp, signOut, useSession)
  - "@/lib/auth/get-session": server-only `getSession()` + `SessionData` type
  - "/api/auth/*": catch-all route handling all Better Auth endpoints
affects:
  - Plan 02-04 (UI) consumes authClient and signUp/signIn helpers
  - Plan 02-05 (proxy middleware) consumes getSession
tech-stack:
  added: []
  patterns:
    - "Server-only module guard (`import 'server-only'`) on `index.ts` and `get-session.ts`"
    - "Drizzle adapter explicit model mapping ({ user: users, ... }) to bridge plural Drizzle identifiers and Better Auth's singular model names"
    - "databaseHooks.user.create.after with count() guard for first-signup-admin promotion"
    - "Catch-all route via toNextJsHandler(auth); no withMutationGuards wrapper (Better Auth handles its own CSRF)"
key-files:
  created:
    - src/lib/auth/index.ts
    - src/lib/auth/client.ts
    - src/lib/auth/get-session.ts
    - src/app/api/auth/[...all]/route.ts
  modified: []
decisions:
  - "Explicit `schema: { user: users, session: sessions, account: accounts, verification: verifications }` instead of `usePlural: true`. Reason: explicit mapping is self-documenting and survives renames; usePlural is a global flag with no clear ownership."
  - "First-signup-admin hook wraps the count + update in try/catch. Reason: a thrown after-hook surfaces as a 500 to the user even though the user row was already committed. Logging the failure and continuing lets the operator self-promote via SQL (the documented fallback in CLAUDE.md > Auth) without the signup looking broken."
  - "No `autoSignIn` toggle on emailAndPassword config. Reason: keep the config minimal; Better Auth's defaults are correct for our flow (the sign-in form redirects to /admin after a successful signup)."
  - "No try/catch around `auth.api.getSession` in get-session.ts. Reason: Better Auth returns null for missing/invalid sessions; any genuine throw is something the caller needs to see (middleware would 500, but that surfaces the bug instead of hiding it)."
metrics:
  duration: "35 minutes"
  tasks_completed: "3/3"
  files_created: 4
  files_modified: 0
  completed_date: "2026-05-23"
---

# Phase 02 Plan 03: Better Auth wiring (server + client + catch-all) Summary

One-liner: Wires Better Auth into the app with a Drizzle-adapter-backed `auth` instance, a server-only `getSession()` helper, a browser SDK with named helpers, a catch-all API route, and a databaseHooks `user.create.after` hook that promotes the first signup to `role='admin'`.

## What shipped

Four new files. Zero modifications to existing files.

### `src/lib/auth/index.ts` (105 lines)

Server-only Better Auth config. The full hook plus adapter wiring:

```typescript
import 'server-only'

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { count, eq } from 'drizzle-orm'
import { env } from '@/env'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { accounts, sessions, users, verifications } from '@/lib/schemas/schema'

const trustedOrigins =
    env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',')
        .map(value => value.trim())
        .filter(Boolean) ?? []

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user: users,
            session: sessions,
            account: accounts,
            verification: verifications
        }
    }),
    emailAndPassword: { enabled: true },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL ?? env.BASE_URL,
    trustedOrigins,
    user: {
        additionalFields: {
            role: { type: 'string', defaultValue: 'user' }
        }
    },
    databaseHooks: {
        user: {
            create: {
                after: async createdUser => {
                    try {
                        const [row] = await db.select({ value: count() }).from(users)
                        if (row?.value === 1) {
                            await db
                                .update(users)
                                .set({ role: 'admin', updatedAt: new Date() })
                                .where(eq(users.id, createdUser.id))
                            logger.info('First user promoted to admin', {
                                userId: createdUser.id,
                                email: createdUser.email
                            })
                        }
                    } catch (error) {
                        logger.error(
                            'First-signup-admin hook failed; promote manually via SQL',
                            error,
                            { metadata: { userId: createdUser.id, email: createdUser.email } }
                        )
                    }
                }
            }
        }
    },
    plugins: [nextCookies()]
})
```

Key shape notes:
- `additionalFields.role` typed as a literal object — no `as any` cast, no `@ts-expect-error` needed. Better Auth's `DBFieldAttribute` accepts `{ type: 'string', defaultValue: 'user' }` directly.
- `databaseHooks.user.create.after` receives `(user: User & Record<string, unknown>, context)` per `@better-auth/core/types/init-options.d.mts:1096`. The body returns `Promise<void>`. Wrapping in try/catch is required because a thrown after-hook would propagate as a 500 to the freshly-signed-up user even though the user row was already committed.
- `trustedOrigins` is hoisted to a const so the betterAuth({...}) literal stays readable.

### `src/lib/auth/client.ts` (20 lines)

Browser SDK. Reads `env.NEXT_PUBLIC_BASE_URL` (T3 env exposes it to the client bundle) and re-exports the four named helpers:

```typescript
import { createAuthClient } from 'better-auth/react'
import { env } from '@/env'

export const authClient = createAuthClient({
    baseURL: env.NEXT_PUBLIC_BASE_URL
})

export const { signIn, signUp, signOut, useSession } = authClient
```

No `server-only` guard — this file is intentionally client-safe. No imports from `./index` (server config) — that would poison the client bundle.

### `src/lib/auth/get-session.ts` (22 lines)

Server-only session helper:

```typescript
import 'server-only'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function getSession() {
    return auth.api.getSession({ headers: await headers() })
}

export type SessionData = Awaited<ReturnType<typeof getSession>>
```

The exported `SessionData` type spares downstream consumers from re-deriving the awaited return type. Better Auth's inferred shape includes the `role` additional field on `user`, so middleware (02-05) can branch on it directly.

### `src/app/api/auth/[...all]/route.ts` (3 non-blank lines)

The whole file:

```typescript
import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'

export const { GET, POST } = toNextJsHandler(auth)
```

No `withMutationGuards`. No CSRF wrapper. Better Auth handles its own CSRF via the trusted-origins check and the `nextCookies()` plugin.

## Better Auth config object

The first-signup-admin hook is the only piece of business logic in the entire auth config. Everything else is plumbing. The hook reads `count(*) FROM users` and updates the just-created user if the count is exactly 1. Race condition: explicitly out of scope per `02-CONTEXT.md` section 2 (single operator runs the first signup before announcing the URL; later admins are SQL UPDATEs).

## Verification

- `bun run lint` passes. Initial run flagged whitespace/format on the multi-line imports and the `.select().from()` chain inside the hook; `bun run lint:fix` collapsed those to single-line forms with zero behavioral change.
- `bun run typecheck` passes with no errors and no `as any` or `@ts-expect-error` in the new files.
- `bun run build` compiles successfully. The catch-all shows in the route table as `├ ƒ /api/auth/[...all]` (dynamic server-rendered). A `BetterAuthError: You are using the default secret` log line appears in build output because `BETTER_AUTH_SECRET` is unset in the local CI environment; this is expected (`env.ts` makes it optional outside Vercel production) and does not fail the build.
- `git diff src/lib/auth/admin.ts` is empty. The existing Bearer-token guard is untouched.

## Deviations from plan

None. Plan executed exactly as written.

## Self-Check: PASSED

- src/lib/auth/index.ts: FOUND
- src/lib/auth/client.ts: FOUND
- src/lib/auth/get-session.ts: FOUND
- src/app/api/auth/[...all]/route.ts: FOUND
- src/lib/auth/admin.ts: UNCHANGED (git diff empty)
- bun run lint: PASSED
- bun run typecheck: PASSED
- bun run build: PASSED (catch-all route registered as `ƒ /api/auth/[...all]`)
