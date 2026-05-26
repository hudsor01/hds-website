# STATE — Current GSD Position

**Last updated:** 2026-05-25
**Branch:** `chrome-route-groups`
**Current milestone:** v5 (Admin hardening + content authoring)
**Current phase:** `06-admin-chrome-route-groups` (planning)
**Current plan:** none (CONTEXT written; planner pending)

## What just happened

- **Phase 05 operator smoke closed at 35/35.** Prod read-only sweep 2026-05-24 (19/19 verifiable on `https://www.hudsondigitalsolutions.com`) + local destructive + fixture-blocked sweep 2026-05-25 (16/16 against `http://localhost:3001`, driven via Claude-in-Chrome MCP). Zero failures. Chrome-bleed check PASS. Console-error gate PASS (only pre-fix "Failed to fetch" entries from before the local env-var fix, none during the smoke). 8 `smoke-*@example.com` fixtures seeded + cleaned via `psql`. Gate 14 closed; the result appended to `.planning/phases/05-admin-ops/05-07-VERIFICATION.md`.
- **Smoke surfaced 3 post-ship findings** addressed by this branch (`fix/smoke-audit-findings`): (1) Next.js 16 `data-scroll-behavior="smooth"` attribute now set on `<html>` (silences the per-route scroll-restoration warning); (2) WebVitals dev-console logger now picks `info | warn | error` based on the metric's CWV rating instead of always logging at `warn`; (3) Better Auth's internal logger is now piped through the project logger (CLAUDE.md compliance) with a `redactEmails` walker that masks any `email` / `recipientEmail` field before it reaches the log sink.
- **v4 (Admin Panel) is shipped end-to-end.** 4/4 phases complete on `main`:
  - Phase 02 (`auth-foundation`) via PR #210 (`54603c1`) — Better Auth + sessions + admin role guard + AccountMenu.
  - Phase 03 (`admin-shell-and-dashboard`) via PR #213 (`d88d049`) — Sidebar + Topbar + Forbidden + 5 dashboard widgets.
  - Phase 04 (`admin-content-crud`) via PR #215 (`cf37d1c`) — showcase / blog / testimonials CRUD with Server Actions + TanStack Form.
  - Phase 05 (`admin-ops`) via PR #217 (`5221269`) — leads / calculator-leads / newsletter / emails ops surfaces with `<form action>` Server Actions, 4 queue-health stat cards on /admin/emails.
- **PR #218 (`4114d37`) closed the cross-phase chrome bleed + project-wide em/en-dash sweep** that the per-phase review pipeline had missed (NavbarLight + Footer now self-suppress on `/admin/*` and `/auth/*` via `usePathname`; ~80 em/en-dash CLAUDE.md violations fixed across 30 files). Smoke was what surfaced the gap; future review prompts should include a project-wide CLAUDE.md compliance sweep as a separate concern from per-phase scope.
- Milestone v3 closed: Phase 01 (`showcase-ui-redesign`) shipped via PR #208.

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
- Dashboard visual reference = Efferd Dashboard 5 (web analytics layout). Adapted to our design system; not lifting CSS verbatim.
- Admin shell composition is **locked**: `<Sidebar />` (left, `w-60`) + `<Topbar />` (top, `h-14`) + `{children}` (`p-6` md / `p-8` lg). All v4 admin pages render inside this contract.
- Single data seam for admin reads: `src/lib/admin/{dashboard,showcase,blog,testimonials,leads,calculator-leads,newsletter,emails}-queries.ts`. Widgets and pages never import `db` directly.
- Every admin widget owns its own empty state. The page never short-circuits on one widget failing — each query wraps in try/catch and returns `[]` on failure.
- Sidebar `NAV_ITEMS` is the source of truth for the v4 page set. Adding a page = entry in `Sidebar.tsx` + route + queries function (if needed).
- recharts (`3.8.1`) is the v4 chart library. No other chart deps.
- **Phase 04 additions:** Server Actions seam (per-resource `actions.ts`) calls `requireAdminSession()` first then validates with Zod then mutates via Drizzle then `revalidatePath` for public + admin surfaces. Defense-in-depth auth: layer doesn't trust layer. publishedAt semantics differ per resource (showcase + blog have it, testimonials does not). Blog tag set replacement runs inside one Drizzle transaction. Next 16 cacheComponents requires `generateStaticParams()` + `await connection()` placeholder pattern on admin dynamic routes.
- **Phase 05 additions:** Same Server Actions contract as Phase 04 (no new shared helpers — 100% reuse). Detail page IS the edit surface (no `/[id]/edit` split for ops pages since mutations are small and the operator needs context to decide what to change). No useAppForm — every form is `<form action={...}>` + hidden id + submit button. 2 new shared admin primitives reused across all 4 surfaces (`StatusFilterBar` + `StatusBadge`). Filter chips round-trip via `?status=...` query param, server-rendered, zero client JS. `revalidatePath` covers BOTH list AND detail path on every mutation. `'use server'` files must NOT export non-async runtime values (only async functions and `export type` are allowed); validate this in `next build` before relying on lint + typecheck alone.

## Deferred / known issues

- Earlier `v1` / `v1` deferred / `v2` milestones are historical (no `.planning/` artifacts remain).
- 4 location pages (75 cities) shipped in PR #206; no follow-up planned.
- 4 pre-existing em-dashes in `src/components/ui/card.tsx` JSX block comments — out of scope per v3.0/01 verification.
- `industry` prop on `ProjectCardProps` is dead surface (pre-existing); candidate for cleanup if a later v4 phase touches Card again.
- Wave 2 commit-message attribution race recurred in Phase 05 (commit `2445bc1` named "leads Server Actions" actually also contains newsletter Task 1 files). End state is correct; future readers should verify via `git show <hash> --stat`. Mitigation for next parallel-agent phase: stage per-resource into separate sub-working-trees, or serialize commits behind a single coordinator.
- `'use server'` non-async runtime exports are invisible to lint + typecheck — only `next build` catches them. Latent `flattenZod` + `ActionResult` runtime value export in leads/actions.ts went unnoticed until Wave 3 ran the full build. Mitigation: add `bun run build` to the per-task verification command when a future plan ships new `actions.ts` files with shared helpers.

## Next action

Ship this branch (`fix/smoke-audit-findings`) as the smoke-closeout PR, merge, and v4 closes for real. After merge, choose v5 direction. Candidates surfaced during v4:

- Admin chrome route-group refactor (move `src/app` into `(public)/` + `(admin)/` + `(auth)/` route groups so chrome lives in the group layout instead of via `usePathname` self-suppression).
- Image-upload UI for showcase / blog / testimonials (admin currently pastes URLs).
- Rich-text / markdown editor for blog content (admin currently uses a plain `<textarea>`).
- Pagination + search for any list growing past ~200 rows.
- Better Auth logger compliance sweep (Phase 05 smoke found Better Auth was logging raw emails; this branch installs a redacting logger adapter, but a future audit could also check for emails leaking through other 3rd-party libraries).
