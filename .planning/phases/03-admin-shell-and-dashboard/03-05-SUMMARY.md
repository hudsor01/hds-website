---
phase: 03-admin-shell-and-dashboard
plan: 05
subsystem: admin-shell
tags: [admin, stubs, coming-soon, routing]
dependency-graph:
  requires:
    - 03-03 (admin layout renders Sidebar + Topbar shell around children)
  provides:
    - 6 stub routes so Sidebar nav links resolve instead of 404
    - Route-group convention: (coming-soon) keeps URLs flat under /admin/*
  affects:
    - src/components/admin/Sidebar.tsx nav targets (no edits, but their hrefs are now backed)
tech-stack:
  added: []
  patterns:
    - Next.js route groups for organizational grouping without URL prefixing
    - Server components with metadata.robots blocking indexers from admin surface
key-files:
  created:
    - src/app/admin/(coming-soon)/showcase/page.tsx
    - src/app/admin/(coming-soon)/blog/page.tsx
    - src/app/admin/(coming-soon)/testimonials/page.tsx
    - src/app/admin/(coming-soon)/leads/page.tsx
    - src/app/admin/(coming-soon)/newsletter/page.tsx
    - src/app/admin/(coming-soon)/emails/page.tsx
  modified: []
decisions:
  - Route-group name (coming-soon) is purely organizational; Next.js strips parens-folders from URLs so /admin/showcase still resolves
  - Stub panel reuses Forbidden's card chrome (rounded-xl border border-border bg-surface-raised p-8 shadow-sm) for visual consistency, without the full-viewport centering wrapper since the admin layout already provides shell chrome and main-slot padding
  - No shared ComingSoon component; 6 near-identical 24-line files are simpler than a one-off dedup abstraction that the next phase will delete
metrics:
  duration: ~6m
  completed: 2026-05-23
---

# Phase 3 Plan 5: Coming-soon stubs Summary

Six server-component stub pages under `src/app/admin/(coming-soon)/` so every Sidebar nav target (Phase 03-02) resolves to a real route instead of a Next.js 404. Each page is a small card with a heading, a single sentence naming the future phase, and a back-link to `/admin/dashboard`. All pages export `metadata` with `robots: { index: false, follow: false }` to keep the admin surface out of search engines.

## Files and Phase Mapping

| Route                  | File                                                          | Future phase |
| ---------------------- | ------------------------------------------------------------- | ------------ |
| `/admin/showcase`      | `src/app/admin/(coming-soon)/showcase/page.tsx`               | Phase 04     |
| `/admin/blog`          | `src/app/admin/(coming-soon)/blog/page.tsx`                   | Phase 04     |
| `/admin/testimonials`  | `src/app/admin/(coming-soon)/testimonials/page.tsx`           | Phase 04     |
| `/admin/leads`         | `src/app/admin/(coming-soon)/leads/page.tsx`                  | Phase 05     |
| `/admin/newsletter`    | `src/app/admin/(coming-soon)/newsletter/page.tsx`             | Phase 05     |
| `/admin/emails`        | `src/app/admin/(coming-soon)/emails/page.tsx`                 | Phase 05     |

## Build Route Output

`next build --webpack` lists all 6 stub routes at flat `/admin/*` URLs (the `(coming-soon)` group does not appear in the URL):

```
├ ◐ /admin
├ ◐ /admin/blog
├ ◐ /admin/dashboard
├ ◐ /admin/emails
├ ◐ /admin/leads
├ ◐ /admin/newsletter
├ ◐ /admin/showcase
├ ◐ /admin/testimonials
```

All 6 stub routes plus the pre-existing `/admin` redirect and `/admin/dashboard` are rendered as Partial Prerender (◐).

## Verification

- `bun run lint`: exit 0 (1 pre-existing info on `src/components/admin/Sidebar.tsx:61`, out of scope per Wave 1 freeze)
- `bun run typecheck`: clean
- `find "src/app/admin/(coming-soon)" -name 'page.tsx' | wc -l` -> 6
- `grep -rE '[—–]' "src/app/admin/(coming-soon)/"` -> no matches
- Build route table includes all 6 routes under `/admin/`, not under `/admin/(coming-soon)/`

## Deviations from Plan

None - plan executed as written. The plan's `<interfaces>` template used `<div className="max-w-xl">` with no card chrome; per the spawning prompt the panel chrome from `Forbidden.tsx` (`rounded-xl border border-border bg-surface-raised p-8 shadow-sm`) was applied for visual consistency. Content structure, exports, copy, and metadata match the plan exactly.

## Self-Check: PASSED

- All 6 files exist at the listed paths (verified by `find ... | wc -l` = 6)
- Build route table verified above includes all 6 routes
- Commit will be referenced after final commit
