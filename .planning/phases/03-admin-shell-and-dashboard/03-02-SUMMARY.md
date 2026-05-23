---
phase: 03-admin-shell-and-dashboard
plan: 02
subsystem: admin-shell
tags: [admin, shell, sidebar, topbar, forbidden, lucide-react]
requires:
  - 'src/components/auth/AccountMenu.tsx (from Phase 02 - reused)'
  - 'lucide-react (already in package.json)'
  - 'globals.css sidebar OKLCH tokens (already defined)'
provides:
  - 'Sidebar (client) with 7 nav items and active-link via usePathname'
  - 'Topbar (server) with pageTitle prop and embedded AccountMenu'
  - 'Forbidden (server) 403 panel with email + role props'
affects:
  - 'src/app/admin/layout.tsx (will be rewired in Plan 03-03 to compose these three primitives; UNCHANGED by this plan)'
tech-stack:
  added: []
  patterns:
    - 'Server-imports-client (Topbar server component imports the client AccountMenu)'
    - 'Single client island in shell chrome (Sidebar only; usePathname forces it)'
    - 'aria-current="page" on active sidebar link'
key-files:
  created:
    - src/components/admin/Sidebar.tsx
    - src/components/admin/Topbar.tsx
    - src/components/admin/Forbidden.tsx
  modified: []
decisions:
  - 'Sidebar uses `h-screen sticky top-0` (not calc-based min-height) so the sidebar pins independently of topbar height and the main slot scrolls under it'
  - 'Icon library is lucide-react (already installed and used elsewhere in the codebase). Heroicons names from phase context mapped to the closest lucide equivalents; no @heroicons/react install needed'
  - 'Topbar prop is `pageTitle` (per orchestrator instruction) - the layout in Plan 03-03 will pass the current page title in'
  - 'Forbidden renders `role ?? "none"` so users with a null/undefined role do not see the literal word "null"'
  - 'NavItem type and NAV_ITEMS array are co-located inside Sidebar.tsx - only one consumer, no shared module needed'
metrics:
  duration: '~10 minutes'
  completed: '2026-05-23'
  tasks: 3
  files-created: 3
  files-modified: 0
---

# Phase 3 Plan 2: Admin Shell Primitives Summary

Three shell primitives (Sidebar, Topbar, Forbidden) created as their own files under `src/components/admin/`. Plan 03-03 will compose them into a rewritten admin layout; this plan does not touch `src/app/admin/layout.tsx`.

## Component prop signatures

```typescript
// src/components/admin/Sidebar.tsx (client)
export function Sidebar(): JSX.Element
// No props. Reads pathname internally via usePathname().

// src/components/admin/Topbar.tsx (server)
interface TopbarProps {
  email: string
  pageTitle: string
}
export function Topbar({ email, pageTitle }: TopbarProps): JSX.Element

// src/components/admin/Forbidden.tsx (server)
interface ForbiddenProps {
  email: string
  role: string | null | undefined
}
export function Forbidden({ email, role }: ForbiddenProps): JSX.Element
```

## Sidebar nav items and icon mapping

The phase CONTEXT lists Heroicons names; we use lucide-react (already in package.json at 1.14.0). Each Heroicon was verified to have a lucide equivalent under `node_modules/lucide-react/dist/esm/icons/`.

| Label        | Href                  | Heroicons name (context)        | lucide-react name | lucide file              |
| ------------ | --------------------- | ------------------------------- | ----------------- | ------------------------ |
| Dashboard    | /admin/dashboard      | HomeIcon                        | `Home`            | home.mjs                 |
| Showcase     | /admin/showcase       | RectangleStackIcon              | `LayoutGrid`      | layout-grid.mjs          |
| Blog         | /admin/blog           | DocumentTextIcon                | `FileText`        | file-text.mjs            |
| Testimonials | /admin/testimonials   | ChatBubbleLeftRightIcon         | `MessagesSquare`  | messages-square.mjs      |
| Leads        | /admin/leads          | UserGroupIcon                   | `Users`           | users.mjs                |
| Newsletter   | /admin/newsletter     | EnvelopeIcon                    | `Mail`            | mail.mjs                 |
| Emails       | /admin/emails         | PaperAirplaneIcon               | `Send`            | send.mjs                 |

All seven icons rendered at `size={18}` with `aria-hidden="true"` (decorative; the link text carries the label).

## Active-state pathname rule

A nav item highlights (`bg-sidebar-primary text-sidebar-primary-foreground`, `aria-current="page"`) when:

```ts
pathname === item.href || pathname.startsWith(item.href + '/')
```

This keeps Dashboard highlighted on `/admin/dashboard/visitors`, Blog on `/admin/blog/[slug]/edit`, etc. Pure prefix match would over-highlight (e.g. `/admin/showcase-archive` would falsely highlight Showcase); the explicit `+ '/'` guards against that.

Inactive state: `text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`.

## Visual breakdown

- **Sidebar**: `w-60` (240px) wide, hidden below `md` (mobile collapse polish deferred to a later plan per phase non-goals). Full viewport height via `h-screen sticky top-0`. Border-right + `bg-sidebar` (OKLCH token from globals.css). Header block `px-4 py-4` shows the site name; nav links `px-3 py-2 mx-2 rounded-md text-sm font-medium`.
- **Topbar**: `h-14` (56px) tall, matching the public site's navbar height. `px-6` horizontal padding. `border-b border-border bg-surface-raised`. Left side: site name + `/` separator + page title. Right side: `<AccountMenu />`.
- **Forbidden**: Centered card panel, `max-w-md`, `rounded-xl border border-border bg-surface-raised p-8 shadow-sm`, sits in a `min-h-[calc(100vh-3.5rem)]` flex container with `bg-surface-base`. Identical layout to the inline 403 panel that currently lives in `src/app/admin/layout.tsx`.

## Verification

- `bun run lint`: PASS (exit 0; one info-level suggestion about template literal vs string concat - skipped because acceptance criterion requires the `+ '/'` form verbatim)
- `bun run typecheck`: PASS (exit 0)
- `grep -rE '[—–]' src/components/admin/`: no matches (em/en-dash sweep clean)
- `grep -c "href: '/admin/" src/components/admin/Sidebar.tsx`: 7
- `grep -rn "@heroicons" src/components/admin/`: no matches
- `src/app/admin/layout.tsx`: unchanged (verified via `git diff --stat`)

## Deviations from Plan

The orchestrator prompt overrode two plan details (orchestrator is authoritative):

1. **Topbar prop name**: plan said `pageLabel`, orchestrator said `pageTitle`. Used `pageTitle`.
2. **Sidebar icons**: plan said `LayoutDashboard` for Dashboard and `MessageSquare` for Testimonials; orchestrator said `Home` and `MessagesSquare`. Used the orchestrator's choices. Both `Home` and `MessagesSquare` exist in lucide-react and were verified before use.

No auto-fixes (Rules 1-3) triggered.

## Self-Check: PASSED

- `src/components/admin/Sidebar.tsx`: FOUND
- `src/components/admin/Topbar.tsx`: FOUND
- `src/components/admin/Forbidden.tsx`: FOUND
- Commit hash recorded after `git commit` step below.
