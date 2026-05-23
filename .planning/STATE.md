# STATE — Current GSD Position

**Last updated:** 2026-05-22
**Branch:** `admin-panel-auth`
**Current milestone:** v4 (Admin Panel)
**Current phase:** `02-auth-foundation` (complete 5/5)
**Current plan:** none (phase closed)

## What just happened

- Phase 02 (`auth-foundation`) closed. 5 plans, 5 commits on `admin-panel-auth`. Better Auth wired end to end: 4 Neon tables (users/sessions/accounts/verifications), `/auth/sign-in` + `/auth/sign-up`, `/admin` role-guarded layout, AccountMenu primitive, and `proxy.ts` edge cookie short-circuit for anonymous `/admin/*`. First signup auto-promoted to admin; later signups get `role: 'user'` + 403 on `/admin`. All automated gates green (lint, typecheck, build, em/en-dash sweep, admin.ts Bearer guard untouched). Manual 6-step smoke deferred to operator pre-PR.
- Milestone v4 (Admin Panel) opened earlier. Built around Efferd Dashboard 5 (web analytics) as the shell. Auth = Better Auth (full sessions/users). Scope = comprehensive admin: dashboard + content CRUD + leads/ops.
- 4 phases queued in ROADMAP: `02-auth-foundation` (complete), `03-admin-shell-and-dashboard` (next), `04-admin-content-crud`, `05-admin-ops`.
- Milestone v3 closed: Phase 01 (`showcase-ui-redesign`) shipped to main as `59e5e70` via PR #208; planning sync as `60175b3` via PR #209.

## Active decisions (still in force from v3)

- Featured-first rendering on `/showcase`: `items.find(i => i.featured)` picks the lowest-displayOrder featured row for the full-width slot; support cards force `featured={false}` at the call site.
- Trust signal separators use U+00B7 MIDDLE DOT, never em-dash.
- Accent body copy on light backgrounds uses `text-accent-text` (WCAG-safe).
- Em/en-dash ban (CLAUDE.md) applies to user-facing text only.
- Milestone versions use whole numbers only (v3, v4), never decimals.

## Active decisions (v4)

- Auth library = **Better Auth** (npm `better-auth`). Multi-user sessions, password + OAuth-capable.
- Users live in Neon Postgres (new `users` + `sessions` tables; managed via Better Auth's Drizzle adapter).
- Admin gating = middleware-protected `/admin/*` route group. First user signed up gets `role: 'admin'`; later users default to `role: 'user'` and need promotion.
- Dashboard visual reference = Efferd Dashboard 5 (web analytics layout). Adapt under MIT-friendly assumption (we're copying patterns, not lifting copyrighted code verbatim).

## Deferred / known issues

- Earlier `v1` / `v1` deferred / `v2` milestones are historical (no `.planning/` artifacts remain).
- 4 location pages (75 cities) shipped in PR #206; no follow-up planned.
- 4 pre-existing em-dashes in `src/components/ui/card.tsx` JSX block comments — out of scope per v3.0/01 verification.
- `industry` prop on `ProjectCardProps` is dead surface (pre-existing); candidate for cleanup if v4 phase 04 touches Card again.

## Next action

Operator runs the 6-step manual smoke checklist in `.planning/phases/02-auth-foundation/02-SUMMARY.md` against `bun run dev`, then opens the PR for `admin-panel-auth` (squash recommended: `feat(auth): Better Auth foundation - users, sessions, /admin role guard, AccountMenu`). After merge, kick off Phase 03 (`admin-shell-and-dashboard`): write `03-CONTEXT.md` (sidebar + Efferd Dashboard 5 layout, real-data wiring for web vitals / PageSpeed history / recent contact submissions) and run `gsd-plan-phase 03-admin-shell-and-dashboard`.
