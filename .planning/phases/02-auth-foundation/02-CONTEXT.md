# Phase 02 — Auth Foundation

**Date:** 2026-05-22
**Branch:** `admin-panel-auth`
**Milestone:** v4 — Admin Panel
**Scope:** Wire Better Auth into the project. New users/sessions tables, sign-in/sign-up pages, `/admin/*` middleware guard, account menu primitive. No admin pages yet (those come in Phase 03+).

## 1. Goal

Stand up a production-grade auth foundation so subsequent v4 phases can assume "you have a session, you're an admin, you're inside `/admin`". This phase ships:

- Better Auth library wired to the existing Neon Postgres database
- 2 new Drizzle tables (`users`, `sessions`) generated from Better Auth's schema generator
- 2 new server-rendered pages: `/auth/sign-in` and `/auth/sign-up`
- An `/admin/*` route group + middleware that bounces unauthenticated requests to `/auth/sign-in`
- Role-based access: first signup gets `role: 'admin'`; later signups default to `role: 'user'` and get a 403 at `/admin/*`
- An `AccountMenu` client component (dropdown showing email + sign-out button); the only consumer in this phase is a placeholder `/admin/page.tsx` that proves the loop works

After this phase, signing up creates a row in Neon, signing in sets a session cookie, hitting `/admin` while signed-out redirects to `/auth/sign-in`, and hitting it as a non-admin returns 403. Nothing more is required for downstream phases.

## 2. Non-goals

- No actual admin pages (Phase 03 builds the dashboard, 04/05 build CRUD).
- No OAuth providers wired (architecture supports them; default to email/password only).
- No password reset / email verification flows (Phase 06+ if ever).
- No admin-promotion UI. The first sign-up wins; second-admin promotion is a manual SQL `UPDATE` (documented).
- No changes to the existing ADMIN_SECRET bearer-token guard used by `/api/process-emails` and cron endpoints. Those stay as-is for non-UI access; the new session-based auth is parallel.
- No migration of existing data (none exists — no users in Neon today).

## 3. Library choice: Better Auth

[Better Auth](https://www.better-auth.com/) is the pick because:
- Drizzle adapter ships in the box (we already use Drizzle)
- Server Component + Next.js App Router first-class support
- No service to manage, no per-MAU billing, no vendor lock-in
- Schema is owned by us (Neon tables, not someone else's hosted DB)
- Active, MIT-licensed, modern

Two strong alternatives considered and rejected:
- **NextAuth / Auth.js** — older, more legacy patterns, weaker session model for Next 15+/16
- **Clerk** — hosted, per-MAU billing, hard to escape later

## 4. Schema additions

Better Auth's CLI generates exact column shapes; this is the intended structure:

**`users` table** (new, in `src/lib/schemas/`)
- `id` text (UUID/CUID), primary key
- `email` text, unique, not null
- `emailVerified` boolean, default false
- `name` text, nullable
- `image` text, nullable
- `role` text, default `'user'` — values: `'admin' | 'user'`. Enforced in middleware, not at DB level.
- `createdAt` timestamp, not null
- `updatedAt` timestamp, not null

**`sessions` table** (new, in `src/lib/schemas/`)
- `id` text, primary key
- `userId` text, foreign key → `users.id` on delete cascade
- `expiresAt` timestamp, not null
- `token` text, unique, not null
- `ipAddress` text, nullable
- `userAgent` text, nullable
- `createdAt` timestamp, not null
- `updatedAt` timestamp, not null

**`accounts` table** (new — Better Auth requires it even for email/password)
- Standard Better Auth shape; covers credentials hash for password users + OAuth tokens for future providers.

**`verifications` table** (new — Better Auth standard)
- Holds short-lived tokens for email verification / password reset (unused initially, kept for future flows).

These get added to `src/lib/schemas/schema.ts` (the barrel). All push via `mcp__Neon__run_sql` per project convention (drizzle-kit push is broken with pg_cron installed, per memory).

## 5. File-level changes

### New files

- `src/lib/auth/index.ts` — `auth = betterAuth({ ... })` server-side config. Drizzle adapter, secret from env, base URL from env.
- `src/lib/auth/client.ts` — `authClient = createAuthClient({ ... })` for use in client components (sign-in form, sign-out button).
- `src/lib/auth/get-session.ts` — server-only helper, reads cookies, returns typed `{ user, session } | null`. Used by middleware and server components.
- `src/lib/schemas/auth.ts` — Drizzle tables (users, sessions, accounts, verifications) exported and re-exported from `schema.ts`.
- `src/app/api/auth/[...all]/route.ts` — single catch-all that proxies to Better Auth's request handler.
- `src/app/auth/layout.tsx` — minimal centered layout (no nav, no footer) for sign-in/sign-up.
- `src/app/auth/sign-in/page.tsx` — server-rendered page; embeds a small client form (`SignInForm`).
- `src/app/auth/sign-up/page.tsx` — server-rendered page; embeds `SignUpForm`. Note: first signup gets admin role.
- `src/app/admin/layout.tsx` — server component, calls `getSession()`, redirects to `/auth/sign-in` if no session, returns 403 if role !== 'admin'. Renders a thin shell with the AccountMenu in the top-right and `{children}` below. Real admin layout (sidebar, dashboard) lands in Phase 03.
- `src/app/admin/page.tsx` — placeholder page so we can prove the loop works: shows `Signed in as {email} ({role})`. Phase 03 replaces this.
- `src/components/auth/SignInForm.tsx` — client component, calls `authClient.signIn.email(...)`. Submits, handles error, on success redirects to `/admin`.
- `src/components/auth/SignUpForm.tsx` — client component, calls `authClient.signUp.email(...)`. On success, server-side hook sets `role: 'admin'` if it's the first row, else `'user'`.
- `src/components/auth/AccountMenu.tsx` — client component, dropdown with email + `Sign out` button; uses existing `DropdownMenu` from `src/components/ui/`.
- `proxy.ts` — extend the existing edge proxy: bounce `/admin/*` to `/auth/sign-in` if no session cookie. (We already own `proxy.ts`; this is one extra check.)
- `src/env.ts` — add 3 env vars: `BETTER_AUTH_SECRET` (required in production), `BETTER_AUTH_URL` (defaults to `BASE_URL`), `BETTER_AUTH_TRUSTED_ORIGINS` (comma-separated, optional).

### Modified files

- `src/lib/schemas/schema.ts` — re-export from new `auth.ts` schema file.
- `proxy.ts` — see above.
- `src/env.ts` — see above.
- `package.json` — add `better-auth` dependency.
- `CLAUDE.md` — single new line in the Auth section: "User auth: Better Auth, session cookies, see `src/lib/auth/`. Admin promotion is currently SQL-only — first signup gets it; later admins via `UPDATE users SET role='admin' WHERE email='...'`."

### Deleted files

None.

## 6. Auth flow

```
GET /auth/sign-up → server-rendered page with SignUpForm
SignUpForm POST → authClient.signUp.email({ email, password, name })
                   → /api/auth/sign-up/email  (Better Auth handler)
                   → inserts user row, hashed password into accounts row,
                     session row + sets httpOnly session cookie
                   → server-side hook: if (await db.select().from(users)).length === 1
                     then UPDATE users SET role='admin' WHERE id=newUserId
                   → client redirects to /admin

GET /admin/* (no cookie)           → middleware redirects to /auth/sign-in
GET /admin/* (cookie, role=user)   → admin/layout.tsx returns 403 page
GET /admin/* (cookie, role=admin)  → admin/layout.tsx renders shell + children

GET /auth/sign-in → server-rendered page with SignInForm
SignInForm POST → authClient.signIn.email({ email, password })
                   → /api/auth/sign-in/email (Better Auth handler)
                   → validates, sets new session cookie
                   → client redirects to /admin

Sign-out (AccountMenu button) → authClient.signOut()
                                 → /api/auth/sign-out (Better Auth handler)
                                 → invalidates session, clears cookie
                                 → client redirects to /auth/sign-in
```

## 7. Middleware vs server-component check

Both. **Defense in depth:**
- `proxy.ts` (edge middleware) does a cookie-presence check. Fast, runs before page render, catches the no-cookie case at the edge. Bounces to `/auth/sign-in`.
- `src/app/admin/layout.tsx` (server component) does the real validation (`getSession()` against the DB) and the role check. Renders 403 for non-admin users.

The edge check is cheap and stops bots; the server-component check is the source of truth.

## 8. Security checklist (must hold)

- Session cookie is `httpOnly`, `secure: true` in production, `sameSite: 'lax'`.
- Password hashed via Better Auth's argon2id default. No homegrown hashing.
- CSRF: Better Auth uses double-submit token automatically.
- `BETTER_AUTH_SECRET` must be ≥32 chars; T3 env Zod validation enforces.
- Production-required env vars (per existing `src/env.ts` pattern): `BETTER_AUTH_SECRET` becomes required when `VERCEL_ENV === 'production'`.
- `/api/auth/[...all]/route.ts` does NOT go through `withMutationGuards` — Better Auth handles its own CSRF.

## 9. Verification

- `bun run lint && bun run typecheck && bun run build` all pass
- New tables exist in Neon (`mcp__Neon__list_tables` returns users, sessions, accounts, verifications)
- Manual smoke (deferred to operator):
  1. `bun run dev`
  2. Visit `/auth/sign-up`, sign up. First signup gets admin role; verify in Neon.
  3. Hit `/admin` — see the placeholder page with email + role.
  4. Open incognito, visit `/admin` — bounce to `/auth/sign-in`.
  5. Sign in from incognito as a freshly created user — verify `role: 'user'` and 403 at `/admin`.
  6. Sign out from the AccountMenu. Verify cookie cleared and `/admin` bounces again.
- Em/en-dash sweep: zero `—` and zero `–` in any new copy (sign-in, sign-up, AccountMenu, 403 page).

## 10. Out of scope

- Admin pages (Phase 03+)
- Sidebar nav / Dashboard 5 layout (Phase 03)
- Password reset / email verification (deferred indefinitely)
- OAuth providers (architecture supports; defer to a later phase)
- User management UI (admin-promotion is SQL-only by design for now)
- 2FA / passkeys (defer)
- Mass migration of any existing accounts (there are none)
