---
phase: 03-admin-shell-and-dashboard
plan: 03
subsystem: admin
tags: [admin, layout, redirect, auth-guard, shell]
requires:
  - src/components/admin/Sidebar.tsx
  - src/components/admin/Topbar.tsx
  - src/components/admin/Forbidden.tsx
  - src/lib/auth/get-session.ts
provides:
  - admin-layout-shell
  - admin-index-redirect
affects:
  - /admin
  - /admin/*
tech-stack:
  added: []
  patterns:
    - Server-component layout owns the only `getSession()` call for /admin/*
    - Layout-level Forbidden render (children never execute for non-admins)
    - Server-side redirect for the canonical entry route
key-files:
  created: []
  modified:
    - src/app/admin/layout.tsx
    - src/app/admin/page.tsx
decisions:
  - "pageTitle is hardcoded to 'Admin' for now; per-page titles deferred to a later phase"
  - "/admin index uses next/navigation redirect (server 307) rather than a client-side router push"
  - "Forbidden renders inside the layout (not a separate route) so non-admins cannot bypass it via deeper URLs"
metrics:
  duration: ~10m
  tasks_completed: 2
  files_modified: 2
  completed: 2026-05-23
---

# Phase 03 Plan 03: Admin Layout Shell + Index Redirect Summary

One-liner: Composed the Sidebar + Topbar + Forbidden primitives into the admin layout and turned `/admin` into a server redirect to `/admin/dashboard`, preserving the Phase 02 auth semantics byte-for-byte.

## What Shipped

### `src/app/admin/layout.tsx` (rewritten)

Server component. Three-branch auth guard (identical semantics to Phase 02):

1. **No session** -> `redirect('/auth/sign-in')` from `next/navigation`.
2. **Signed in, role !== 'admin'** -> render `<Forbidden email role />`. Children never execute, so deeper `/admin/*` data fetches stay gated.
3. **Signed in as admin** -> render the shell:
   ```
   <div className="min-h-screen flex bg-surface-base">
     <Sidebar />
     <div className="flex-1 flex flex-col min-w-0">
       <Topbar email={session.user.email} pageTitle="Admin" />
       <main className="flex-1 p-6 lg:p-8">{children}</main>
     </div>
   </div>
   ```

Imports trimmed: dropped `Link` from `next/link` (Forbidden owns the sign-in link) and `AccountMenu` (Topbar owns it). The inlined 403 JSX block from Phase 02 is gone; that markup now lives in `<Forbidden />`.

### `src/app/admin/page.tsx` (rewritten)

Minimal redirect page (no JSX, not async):

```tsx
import { redirect } from 'next/navigation'

export default function AdminIndexPage(): never {
  redirect('/admin/dashboard')
}
```

No `getSession()` call here. The parent layout already enforces session + role before this page runs. The redirect is a server 307 (correct for a GET request bouncing through a server-component redirect signal).

## Auth Guard Semantics

| State | Behavior | Where |
|-------|----------|-------|
| No session cookie | Edge proxy short-circuit (Phase 02) | `proxy.ts` |
| Session cookie present, no valid session | `redirect('/auth/sign-in')` | layout |
| Session present, role !== 'admin' | `<Forbidden />` panel | layout |
| Session present, role === 'admin' | Shell + children | layout |
| Any of the above at `/admin` exactly | Above runs first, then `redirect('/admin/dashboard')` | page |

Because layouts wrap pages, the layout's session + role check always runs before the index redirect. Unauthorized requests never observe the dashboard URL.

## pageTitle: Hardcoded For Now

The Topbar's `pageTitle` prop is currently fixed to the literal string `"Admin"`. The layout has no built-in way to know which child page is rendering, so a static label is the right scope for this plan.

A later phase can introduce per-page titles via one of:
- `next/headers` reading a custom header set by each page,
- a React context written by each page (would force Topbar to become a client island), or
- segment-level metadata + a `unstable_*` API.

This is intentionally deferred. No consumer needs dynamic titles yet, and the YAGNI principle in `CLAUDE.md` says don't build for hypothetical requirements.

## Build / Verification

- `bun run lint` -> clean (1 unrelated info hint in `Sidebar.tsx` from Plan 03-02).
- `bun run typecheck` -> clean.
- `bun run build` -> succeeds. Route table emits `/admin`, `/auth/sign-in`, `/auth/sign-up`, `/api/auth/[...all]`. `/admin/dashboard` is not in the route table yet (Plan 03-04 ships it); the redirect target's absence does not block the redirect page from compiling.

## Phase 02 Files Untouched

Confirmed via `git status --short`: only `src/app/admin/layout.tsx` and `src/app/admin/page.tsx` were modified. No changes to:
- `src/lib/auth/*`
- `src/components/auth/*`
- `src/app/auth/*`
- `src/app/api/auth/[...all]/route.ts`
- `proxy.ts`
- `src/lib/auth/admin.ts`

## Deviations from Plan

**1. [Rule 1 - Lint] Collapsed `<Forbidden />` return to a single-expression return**
- **Found during:** Task 1 (Biome `noUselessFragments` adjacent rule about single-element parenthesized returns)
- **Issue:** Biome flagged the multi-line `return ( <Forbidden ... /> )` as needing the parens removed.
- **Fix:** Changed to `return <Forbidden email={session.user.email} role={session.user.role} />`.
- **Files modified:** `src/app/admin/layout.tsx`

**2. [Rule 3 - Acceptance criteria]: removed `<Forbidden` mention from JSDoc**
- **Found during:** Task 1 acceptance check (`grep -c "<Forbidden"` must equal 1)
- **Issue:** A `<Forbidden />` reference inside the file's JSDoc pushed the grep count to 2.
- **Fix:** Rephrased the JSDoc to "render the Forbidden panel" (plain words, no angle brackets).
- **Files modified:** `src/app/admin/layout.tsx`

**3. [Direction override] pageTitle hardcoded to "Admin" instead of "Dashboard"**
- **Source:** Operator instructions in the execute prompt overrode the plan's suggested `pageLabel="Dashboard"`.
- **Resolution:** Used `pageTitle="Admin"`. Documented above in "pageTitle: Hardcoded For Now".

No other deviations. No auth gates. No checkpoint stops.

## Known Stubs

None. Both files are production-ready for their scope. `/admin/dashboard` (the redirect target) is the next plan's responsibility (Plan 03-04); its absence is the expected handoff state, not a stub in this plan.

## Self-Check: PASSED

- `src/app/admin/layout.tsx`: FOUND
- `src/app/admin/page.tsx`: FOUND
- `.planning/phases/03-admin-shell-and-dashboard/03-03-SUMMARY.md`: FOUND
- Commit recorded in final step below.
