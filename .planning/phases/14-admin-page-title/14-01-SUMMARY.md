---
phase: 14-admin-page-title
plan: 01
subsystem: ui
tags: [nextjs, app-router, rsc, admin, metadata, accessibility]

# Dependency graph
requires:
  - phase: 02-admin-auth
    provides: admin route-group layout + Topbar chrome (getSession guard, Sidebar, AccountMenu)
provides:
  - "Admin Topbar with no pageTitle prop (renders only the Hudson Digital wordmark + AccountMenu)"
  - "Admin layout calling <Topbar email={session.user.email} /> with no misleading constant title"
  - "Single source of the visible label per admin route: each page's own <h1>; tab title via each page's metadata.title (both untouched)"
affects: [admin-ui, admin-chrome]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-page <h1> + metadata.title is the sole title owner; the layout/Topbar owns neither (App Router layouts cannot read child route data)"

key-files:
  created:
    - .planning/phases/14-admin-page-title/14-01-SUMMARY.md
  modified:
    - src/components/admin/Topbar.tsx
    - src/app/(admin)/admin/layout.tsx

key-decisions:
  - "Resolved ADMINUX-01 by pure subtraction: removed the always-'Admin' pageTitle prop + its span rather than building a new title mechanism (per-page titles already exist on all 18 routes)"
  - "Dropped the now-dangling '/' separator span; the wordmark stands alone (research Open Question 3)"
  - "Topbar stays a server component: no 'use client', no usePathname/useSelectedLayoutSegment, no PageHeader/context/title-map introduced"
  - "Left the layout auth guard (getSession / redirect / Forbidden branches) byte-equal; touched only the Topbar JSX line + stale comment (threat T-14-01 mitigation)"

patterns-established:
  - "Chrome layers must not duplicate page-owned data; a layout cannot read the active child's title, so a hardcoded chrome label is removed rather than faked"

requirements-completed: [ADMINUX-01]

# Metrics
duration: 3min
completed: 2026-06-02
---

# Phase 14 Plan 01: admin-page-title Summary

**Removed the misleading always-"Admin" `pageTitle` prop (and its span + dangling separator) from the admin Topbar and its single layout consumer; each admin page's own `<h1>` + `metadata.title` remains the sole title source.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-06-02T21:43:22Z
- **Completed:** 2026-06-02T21:46:02Z
- **Tasks:** 2 (1 implementation, 1 verification-only)
- **Files modified:** 2

## Accomplishments
- Topbar no longer accepts or renders `pageTitle`; its `TopbarProps` is now `{ email: string }`. It renders only the "Hudson Digital" wordmark + `<AccountMenu />` and stays a server component (no `'use client'`).
- The orphaned aria-hidden "/" separator span was removed along with the constant title span, so the wordmark stands alone (research Open Question 3).
- The admin layout calls `<Topbar email={session.user.email} />`; the stale `pageTitle: per-page titles arrive in a later phase; hardcoded for now.` comment is gone.
- The false docblock paragraph in `Topbar.tsx` (claiming the layout passes `pageTitle` so the topbar can label the screen) was deleted; the accurate "server-imports-client" explanation is kept.
- Auth guard (`getSession()` / `!session?.user` redirect / `role !== 'admin'` Forbidden) left byte-equal. No admin `page.tsx` touched.

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove the pageTitle prop from Topbar and its layout consumer** - `45c60d58` (refactor)
2. **Task 2: Full gate (lint, typecheck, unit, build)** - verification-only, no commit (no edits)

**Plan metadata:** (this commit) `docs(14-01): complete admin-page-title plan`

## Files Created/Modified
- `src/components/admin/Topbar.tsx` - Dropped `pageTitle` from `TopbarProps` + destructure; removed the separator + title spans; deleted the false docblock line. Stays a server component.
- `src/app/(admin)/admin/layout.tsx` - Call site changed to `<Topbar email={session.user.email} />`; stale comment removed; auth logic byte-equal.

## Decisions Made
- Followed the plan and research exactly: fix is removal, not a new title feature. Per-page `<h1>`/`metadata.title` already cover every admin route, so no admin page was edited.
- Kept the dashboard `<h1 className="sr-only">` as-is (research Open Question 1, discretionary, out of strict ADMINUX-01 scope).
- Did not add a `(admin)` `title.template` (research Open Question 2, discretionary, deferred).
- Did not add the optional `tests/unit/admin-topbar.test.tsx` render test (research: low value; `typecheck` already proves the prop is gone). Acceptable per research Wave 0 note.

## Deviations from Plan

None - plan executed exactly as written. No deviation rules (1-4) triggered.

## Issues Encountered
- The `bun` command in this shell is wrapped by a `wrapSafeChainCommand` shell function, which mis-resolved `bun test tests/` (it tried to load a non-existent `/.../bun` module via node). Worked around by invoking the real binary directly at `/Users/richard/.bun/bin/bun test tests/`. This is a local shell-environment quirk, not a project issue; `bun run lint`, `bun run typecheck`, and `bun run build` resolved correctly through the wrapper.

## Gate Results (Task 2)

- `bun run lint` (Biome): clean - checked 408 files, no fixes.
- `bun run typecheck` (`tsc --noEmit`): clean - proves the single `pageTitle` consumer is updated and no dangling required prop remains.
- `bun run test:unit` (`bun test tests/`): **969 pass / 21 fail**, 3273 expect() calls across 990 tests / 84 files. The 21 failures are the documented pre-existing baseline (HomePage structural assertions, Navbar Polish COMP-04, Footer Component, Navigation Accessibility - cross-file rendering pollution). **Zero net-new failures**; none relate to the admin Topbar or layout.
- `bun run build` (`next build --webpack`): **Compiled successfully**. All 18+ admin routes still build as Partial Prerender (`◐`) - no PPR / `cacheComponents` regression from removing a static span on a server component. Exit 0.

### Verification (grep)
- `! grep -rn "pageTitle" src/components/admin/Topbar.tsx "src/app/(admin)/admin/layout.tsx"` - zero hits (prop fully gone).
- `! grep -n "hardcoded for now" "src/app/(admin)/admin/layout.tsx"` - zero hits (obsolete comment gone).
- `! grep -n "use client" src/components/admin/Topbar.tsx` - zero hits (Topbar stays server).
- `grep -n "<Topbar email={session.user.email} />"` - exactly one hit, no `pageTitle=`.
- `git diff --name-only -- 'src/app/(admin)/admin/**/page.tsx'` - empty (no admin page edited).

### Manual verification boundary (operator step, NOT faked as automated)
The route-by-route VISUAL confirmation across the 18 auth-gated admin routes is manual - this repo has no admin-session Playwright fixture (research Assumption A3 / Validation "Manual-Only Verifications"). The proportionate automated gate for a chrome-span removal is grep + typecheck + build, all green. The operator should visually walk `/admin/dashboard`, one list (`/admin/leads`), and one detail (`/admin/leads/[id]`) to confirm the duplicate "Admin" chrome label is gone and each page's own heading remains.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ADMINUX-01 resolved. The admin chrome no longer renders a universal "Admin" label; the visible label on every route is the page's own `<h1>` and the tab title is the page's `metadata.title`.
- No blockers. Discretionary follow-ups available if desired: promote the dashboard `<h1>` to visible (Open Question 1) and/or add a `(admin)` `title.template` (Open Question 2). Neither is required by ADMINUX-01.

## Self-Check: PASSED

- FOUND: src/components/admin/Topbar.tsx
- FOUND: src/app/(admin)/admin/layout.tsx
- FOUND: .planning/phases/14-admin-page-title/14-01-SUMMARY.md
- FOUND commit: 45c60d58

---
*Phase: 14-admin-page-title*
*Completed: 2026-06-02*
