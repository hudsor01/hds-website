# STATE — Current GSD Position

**Last updated:** 2026-05-22
**Branch:** `admin-panel-auth`
**Current milestone:** v4 (Admin Panel)
**Current phase:** `02-auth-foundation` (planning)
**Current plan:** none yet

## What just happened

- Milestone v4 (Admin Panel) opened. Built around Efferd Dashboard 5 (web analytics) as the shell. Auth = Better Auth (full sessions/users). Scope = comprehensive admin: dashboard + content CRUD + leads/ops.
- 4 phases queued in ROADMAP: `02-auth-foundation` (in progress), `03-admin-shell-and-dashboard`, `04-admin-content-crud`, `05-admin-ops`.
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

Write `02-CONTEXT.md` for `auth-foundation` (the design spec for Better Auth setup, users/sessions schema, sign-in/sign-up routes, `/admin` middleware, account menu primitive). Then run `gsd-plan-phase 02-auth-foundation`.
