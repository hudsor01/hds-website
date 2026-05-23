---
phase: 02-auth-foundation
milestone: v4
status: complete
plans: 5
completed_plans: 5
commits: 5
date_started: 2026-05-22
date_completed: 2026-05-22
---

# Phase 02 - Auth Foundation Summary

Better Auth wired end to end against Neon: 4 new DB tables (users, sessions, accounts, verifications), email/password sign-up + sign-in pages, server-component `/admin` layout that enforces `role === 'admin'`, an AccountMenu primitive for sign-out, and an edge-level `proxy.ts` cookie short-circuit for anonymous `/admin/*` traffic. First signup is auto-promoted to admin; subsequent users default to `role: 'user'` and get a 403 panel on `/admin`.

## What shipped

| Plan | Title | Commit | What |
|---|---|---|---|
| 02-01 | Install better-auth and add auth env vars | `b9148a0` | `better-auth` npm dependency; `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` / `BETTER_AUTH_TRUSTED_ORIGINS` added to `src/env.ts` (secret required when `VERCEL_ENV === 'production'`); CLAUDE.md auth section updated. |
| 02-02 | Add Drizzle tables and DDL for Better Auth | `c7f5615` | `src/lib/schemas/auth.ts` with `users`, `sessions`, `accounts`, `verifications` Drizzle tables; barrel re-export from `src/lib/schemas/schema.ts`; tables created in Neon via MCP `run_sql` (drizzle-kit push is broken with pg_cron installed). |
| 02-03 | Wire Better Auth server, client, and API catch-all | `4212579` | `src/lib/auth/index.ts` (server config: Drizzle adapter, argon2id default, nextCookies plugin); `src/lib/auth/client.ts` (React SDK pinned to `NEXT_PUBLIC_BASE_URL`); `src/lib/auth/get-session.ts` (server-only typed helper); `src/app/api/auth/[...all]/route.ts` catch-all. First-signup admin promotion lives in the server config's after-hook. |
| 02-04 | Auth pages, /admin layout, AccountMenu | `3c09d8a` | `/auth/sign-in` + `/auth/sign-up` server pages with their client forms; `src/app/admin/layout.tsx` server component that calls `getSession()`, redirects on no session, renders inline 403 panel when `role !== 'admin'`, mounts AccountMenu top-right; `src/app/admin/page.tsx` placeholder for proof-of-loop; `src/components/auth/AccountMenu.tsx` using native `<details>`/`<summary>`; Zod schemas in `src/lib/schemas/auth-forms.ts`. |
| 02-05 | Edge cookie guard + full phase verification | (this commit) | `proxy.ts` extended with presence-only `better-auth.session_token` check for `/admin` + `/admin/*` (307 redirect to `/auth/sign-in?from={original}` when absent); existing security-headers / HTTPS-redirect / UA-blocklist / Cache-Control / CORS / Server-Timing branches preserved verbatim. Em-dash sweep scrubbed 4 pre-existing dashes in code comments (`proxy.ts:13,35`, `src/lib/auth/index.ts:80`, `src/lib/auth/client.ts:9`) to keep the per-file grep gate clean. |

## Defense in depth: the two-layer admin guard

The `/admin/*` access control is intentionally split across two layers:

1. **Edge (`proxy.ts`).** Cheap presence check on the `better-auth.session_token` cookie. Runs before any React server-render, before any DB call. Catches the no-cookie case (anonymous users, scanner bots) and 307-redirects to `/auth/sign-in?from={pathname}`. Does not validate the cookie value; that would require an edge-runtime-safe DB call which Better Auth does not guarantee.
2. **Server component (`src/app/admin/layout.tsx`).** Source of truth. Calls `getSession()` (which does the real DB lookup against the `sessions` table), then enforces `session.user.role === 'admin'`. Non-admins see a self-contained 403 panel; `children` are never rendered for them.

The two layers cannot disagree about the no-cookie case (both redirect / refuse), and the role decision belongs entirely to the server component. `src/lib/auth/admin.ts` (the pre-existing Bearer-token guard for cron / `/api/process-emails`) is untouched by this phase and continues to gate non-UI API access in parallel.

## Schema additions in Neon (`neondb.public`)

Tables added by Plan 02-02 (DDL applied via Neon MCP `run_sql`):

- `users` - id (text PK), email (text unique), emailVerified (bool), name (text), image (text), role (text default `'user'`), createdAt, updatedAt
- `sessions` - id (text PK), userId (text FK -> users.id ON DELETE CASCADE), expiresAt, token (text unique), ipAddress, userAgent, createdAt, updatedAt
- `accounts` - Better Auth standard shape (credentials hash for email/password, OAuth columns reserved for later providers)
- `verifications` - short-lived token store for email verify / password reset (unused initially, kept for future flows)

All four tables remain Drizzle-typed via `src/lib/schemas/auth.ts` and re-exported from the schema barrel.

## Env vars added (`src/env.ts`)

- `BETTER_AUTH_SECRET` - required when `VERCEL_ENV === 'production'` (T3 env `optional().refine(...)` pattern). Local dev gets a Better Auth warning if unset; the build still succeeds.
- `BETTER_AUTH_URL` - optional; defaults to `BASE_URL`.
- `BETTER_AUTH_TRUSTED_ORIGINS` - optional comma-separated list.

## Operator manual smoke checklist (run before opening PR)

Six steps. All deferred to the operator; the automated gates above cannot replace eyeball verification.

1. Ensure `.env.local` has `BETTER_AUTH_SECRET` set (`openssl rand -base64 32` if missing). Start `bun run dev`.
2. **First signup -> admin.** Fresh browser profile (or cleared cookies). Visit `http://localhost:3000/auth/sign-up`, submit email + password (>= 8 chars). Confirm redirect to `/admin` showing `Signed in as <email> (admin)`. Verify in Neon (`SELECT id, email, role FROM users`) that exactly one row exists, role = `admin`.
3. **Edge redirect for anonymous.** Open an incognito window. Visit `http://localhost:3000/admin`. Network panel should show a 307 to `/auth/sign-in?from=%2Fadmin`. The edge proxy short-circuited before any React render.
4. **Second signup -> user, role-based 403.** From the incognito window, sign up with a second email. After redirect to `/admin`, confirm the 403 panel appears ("You are signed in but you do not have admin access."). Verify in Neon that the second row has role = `user`.
5. **Sign in + sign out (admin).** In the first browser profile, sign out via the AccountMenu (top-right of admin shell -> Sign out). Land on `/auth/sign-in`. Sign back in with the admin credentials, confirm `/admin` renders the admin shell.
6. **Sanity check unrelated routes.** Visit `/`, `/showcase`, `/contact`. All should render normally; the proxy change must not regress non-admin paths.

If any step fails, capture the network response + Neon row state and file the failure before opening the PR.

## Recommended commit / PR shape

Five atomic commits on `admin-panel-auth`:

- `feat(auth): install better-auth and add auth env vars` (b9148a0)
- `feat(auth): add Drizzle tables and DDL for Better Auth` (c7f5615)
- `feat(auth): wire Better Auth server, client, and API catch-all` (4212579)
- `feat(auth): sign-in/sign-up pages, /admin layout with role guard, AccountMenu` (3c09d8a)
- `chore(02): phase verification passed` (this commit)

PR recommendation: **squash on merge** to main with message `feat(auth): Better Auth foundation - users, sessions, /admin role guard, AccountMenu`. The 5-commit history stays on the feature branch for traceability.

## Open follow-ups (not blocking the phase)

- **No admin-promotion UI.** Promoting a second admin is a manual SQL `UPDATE users SET role='admin' WHERE email='...'`. Documented in CLAUDE.md. Phase 04/05 may add an admin user-management screen.
- **No password reset / email verification flow.** The `verifications` table is provisioned but unused. Add when the product calls for it.
- **No OAuth providers wired.** Architecture supports them via the `accounts` table; add when needed.
- **Local dev `BETTER_AUTH_SECRET` warning is environmental.** The build still passes; production sets the secret via Vercel env. If a developer wants the warning gone locally, set the secret in `.env.local`.

## Phase verdict

All 5 plans shipped. All automated gates green (lint, typecheck, build, em/en-dash sweep, admin.ts untouched). Phase 02 ready for human manual smoke + PR. Phase 03 (admin-shell-and-dashboard) can begin immediately after merge.

## Self-Check: PASSED

- `proxy.ts` modified with the /admin block: confirmed via `git diff proxy.ts`.
- `02-05-VERIFICATION.md` exists at `.planning/phases/02-auth-foundation/02-05-VERIFICATION.md`.
- `02-SUMMARY.md` exists at `.planning/phases/02-auth-foundation/02-SUMMARY.md`.
- `STATE.md` updated: phase 02 marked complete (5/5); next action set to operator smoke + Phase 03 kickoff.
- `ROADMAP.md` updated: phase 02 row flipped to `complete (5/5)` with 5 plans.
- All 5 commit hashes will be present in `git log` after the closing commit lands.
