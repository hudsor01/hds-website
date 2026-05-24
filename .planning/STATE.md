# STATE — Current GSD Position

**Last updated:** 2026-05-23
**Branch:** `admin-ops`
**Current milestone:** v4 (Admin Panel)
**Current phase:** `05-admin-ops` (complete 7/7, PR not yet open)
**Current plan:** none — phase complete, awaiting operator smoke + PR

## What just happened

- Phase 05 (`admin-ops`) closed. 7 plans across 4 waves, 14 implementation commits on `admin-ops` (bootstrap + Wave 1 + 12 Wave-2 commits + Wave-3 cleanup; 4 of the Wave-2 commits are SUMMARY-only docs). Operator-facing ops surfaces shipped for all 4 surfaces: `/admin/leads` (list with status filter + detail with attribution, notes, status mutations, delete), `/admin/leads/calculator` (list with quality filter + detail with inputs / results / conversion / mark-contacted / mark-converted), `/admin/newsletter` (list + detail with unsubscribe / re-subscribe state machine + GDPR hard delete), `/admin/emails` (list with 4 queue-health stat cards + status filter + detail with retry guard / cancel / delete). Every mutation is a single-button `<form action={...}>` posting to a Server Action that calls `requireAdminSession()` first then validates with Zod then mutates via Drizzle then `revalidatePath` for both list AND detail paths. 2 new shared admin primitives reused across all 4 surfaces: `StatusFilterBar` (server-side `<form method="get">` chip row) + `StatusBadge` (OKLCH token color map). Detail page IS the edit surface (no `/[id]/edit` split). No useAppForm — every form is `<form action={...}>` + hidden id + submit button. No new shared helpers needed; reuse rate from Phase 04 = 100%. Phase 02 / 03 / 04 files plus all public-route, public-API, n8n Bearer, and cron endpoint surfaces are byte-equal to `main` (53/53 protected paths verified). All 13 automated gates + Gate 10b green: lint (353 files, 0 diagnostics) + typecheck + 563 unit tests (unchanged baseline; Phase 05 added no new tests by design) + build (19 admin routes, all `◐` partial prerender, zero `(coming-soon)`) + em/en-dash sweep = 0 + protected-files diff = 53/53 OK + defense-in-depth auth verified (leads=5, calculator=4, newsletter=4, emails=4 `requireAdminSession()` calls) + every mutation calls `revalidatePath` (counts: leads=7, calculator=7, newsletter=7, emails=7) + no `console.*` / `process.env.X` / `any` in any added file + no non-async value exports in any `'use server'` file. 35-step operator manual smoke deferred to operator pre-PR (see `.planning/phases/05-admin-ops/05-07-VERIFICATION.md` for the checklist). Wave 2 ran 4 parallel agents in a single working tree; commit-message attribution got crossed with file contents on one commit (`2445bc1` named "leads Server Actions" actually contains newsletter Task 1 files too) — end state on disk is correct, future readers should verify via `git show <hash> --stat`. Latent `flattenZod` + `ActionResult` non-async runtime export in `leads/actions.ts` was invisible until `next build` could run end-to-end; Wave 3's stub-deletion commit (`cf59c45`) caught and fixed it inline.
- Phase 04 (`admin-content-crud`) closed earlier; PR not yet opened, deferred to operator. End state: branch `admin-content-crud` complete, awaiting operator smoke and PR.
- Phase 03 (`admin-shell-and-dashboard`) closed earlier and merged to `main` via PR #213.
- Phase 02 (`auth-foundation`) closed earlier. Merged into the base for `admin-shell-dashboard`.
- Milestone v4 (Admin Panel) complete: 4 / 4 phases done. After Phase 04 + Phase 05 PRs merge, v4 ships.
- Milestone v3 closed: Phase 01 (`showcase-ui-redesign`) shipped to main as `59e5e70` via PR #208.

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

Operator manual smoke checklist (35 steps in `.planning/phases/05-admin-ops/05-07-VERIFICATION.md`) on local dev, then ship PR for `admin-ops` -> `main`. After merge, v4 milestone (Admin Panel) complete; choose v5 direction.

Recommended PR squash message:

```
feat(admin): ops - leads, calculator-leads, newsletter, emails with Server Actions
```

(Phase 04 PR for `admin-content-crud` is also pending — both should ship before v4 closes.)
