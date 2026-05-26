---
phase: 06
slug: admin-chrome-route-groups
milestone: v5
status: complete
type: refactor
plans_total: 0
plans_completed: 0
commit_count: 4
duration_min: 25
completed_date: 2026-05-25
branch: chrome-route-groups
tags:
  - route-groups
  - next-app-router
  - chrome-isolation
  - refactor
  - no-ux-change
key_files:
  added:
    - src/app/(public)/layout.tsx
    - .planning/phases/06-admin-chrome-route-groups/06-SUMMARY.md
  modified:
    - src/app/layout.tsx
    - src/components/layout/Navbar.tsx
    - src/components/layout/Footer.tsx
    - src/app/(auth)/auth/layout.tsx
    - src/components/calculators/Calculator.tsx
    - tests/unit/homepage.test.tsx
    - tests/unit/server-components.test.tsx
    - tests/unit/ttl-calculator-actions.test.ts
    - .planning/STATE.md
    - .planning/ROADMAP.md
  renamed:
    - count: 99
      summary: "63 public files into (public)/, 33 admin files into (admin)/admin/, 3 auth files into (auth)/auth/"
decisions:
  - "Chrome isolation is now solved by route-group topology, not by client-side usePathname early-return. PR #218 (4114d37) workaround removed."
  - "Each route group owns its own <main id=\"main-content\"> landmark; the root layout no longer emits one."
  - "Server Action import path for /tools/ttl-calculator updated from @/app/actions/ttl-calculator to @/app/(public)/actions/ttl-calculator (Server Actions resolve by file path, not URL)."
  - "loading.tsx, global-error.tsx, global-not-found.tsx, robots.ts, sitemap.ts, icon*.tsx, opengraph-image.tsx, twitter-image.tsx, apple-icon.tsx, globals.css remain at the root per Next.js metadata convention."
---

# Phase 06: Admin Chrome Route Groups Summary

Converted `src/app/` from a flat layout to three explicit route groups — `(public)/`, `(admin)/`, `(auth)/` — so the chrome a route receives is determined by which group it lives in. The `usePathname` early-return in `NavbarLight` and `Footer` introduced by PR #218 (4114d37) is removed; the bleed problem is solved by route-group topology instead. Zero URL changes; zero UX changes.

## What shipped

4 commits, sequenced for atomic review:

| # | SHA       | Message                                                                                                  |
| - | --------- | -------------------------------------------------------------------------------------------------------- |
| 1 | `87b1c55` | refactor(06): scaffold (public) (admin) (auth) route groups + (public) layout                            |
| 2 | `d095396` | refactor(06): git mv all public pages into (public)/                                                     |
| 3 | `467a004` | refactor(06): git mv /admin and /auth into (admin)/admin and (auth)/auth                                 |
| 4 | `a52c85b` | refactor(06): strip chrome from root layout + revert NavbarLight/Footer usePathname self-suppression     |

(Commit 5 — this document + STATE/ROADMAP sync — lands as a separate `chore(06)` commit after this file is written.)

### Topology after

```
src/app/
├── layout.tsx                           # thinnest shell: <html>/<body>, providers, Toaster, Analytics
├── globals.css                          # stays at root (Next.js convention)
├── api/                                 # stays at root (API routes have no chrome)
├── icon.tsx, apple-icon.tsx, ...        # stays at root (metadata file convention)
├── loading.tsx, global-error.tsx, ...   # stays at root (root-level convention files)
├── (public)/
│   ├── layout.tsx                       # NavbarLight + <main id="main-content"> + Footer + ScrollToTop
│   ├── page.tsx                         # /
│   ├── about/, blog/, contact/, ...     # every marketing page
│   └── actions/ttl-calculator.tsx       # Server Action (resolved by file path)
├── (admin)/
│   └── admin/
│       ├── layout.tsx                   # getSession + role guard + Sidebar + Topbar + <main>
│       └── dashboard/, blog/, ...       # every admin page
└── (auth)/
    └── auth/
        ├── layout.tsx                   # centered card shell
        ├── sign-in/page.tsx
        └── sign-up/page.tsx
```

### Why this is correct Next.js idiom

Route groups (`(name)/`) are URL-invisible — `/`, `/contact`, `/admin/dashboard`, `/auth/sign-in` all resolve identically. Layouts compose top-down: the root layout still wraps everything, then the route-group layout wraps everything inside that group. With each group owning its own chrome, admin and auth pages never inherit the marketing chrome by topology rather than by runtime gate. Adding a new top-level chrome variant in the future (e.g. a `(marketing-campaign)/` layout with a different navbar) becomes a route-group add, not a component edit.

## Verification — all gates green

| Gate                                        | Result                                                         |
| ------------------------------------------- | -------------------------------------------------------------- |
| `bun run lint`                              | exit 0 (354 files, 0 errors)                                   |
| `bun run typecheck`                         | exit 0                                                         |
| `bun run test:unit`                         | 563/563 pass (2335 expect calls) — baseline preserved exactly  |
| `bun run build`                             | exit 0                                                         |
| Route table byte-equality vs pre-Phase-06   | PASS — `diff /tmp/routes-before.txt /tmp/routes-after.txt` empty |
| Em-dash sweep on `src/`                     | PASS — only code-comment / JSDoc matches (CLAUDE.md exempt)    |
| En-dash sweep on `src/`                     | PASS — zero matches in modified files                          |
| `src/lib/auth/admin.ts` diff vs origin/main | PASS — 0 lines                                                 |
| `proxy.ts` diff vs origin/main              | PASS — 0 lines                                                 |
| `src/app/api/**` diff vs origin/main        | PASS — 0 lines                                                 |
| Admin layout content vs pre-move            | PASS — `diff` of `(admin)/admin/layout.tsx` vs origin path is empty |
| Auth layout content vs pre-move             | PASS — only JSDoc lines 5-8 changed (intentional; documented above) |

## Route table excerpt (post-Phase-06, byte-equal to pre-Phase-06)

```
├ ○ /                                                                                         1h      1d
├ ○ /about
├ ◐ /admin
├ ◐ /admin/dashboard
├ ◐ /admin/blog
├ ◐ /admin/leads
├ ◐ /admin/leads/calculator
├ ◐ /admin/newsletter
├ ◐ /admin/emails
├ ◐ /admin/showcase
├ ◐ /admin/testimonials
├ ƒ /auth/sign-in
├ ƒ /auth/sign-up
├ ○ /contact
├ ○ /services
├ ○ /tools/ttl-calculator
├ ƒ /api/auth/[...all]
├ ƒ /api/process-emails
└ ...
```

Full route table at `/tmp/routes-after.txt` is identical to `/tmp/routes-before.txt`.

## Deviations from plan

### Auto-fixed (Rule 1 — broken imports)

**1. [Rule 1 - Bug] Updated 4 consumers of moved file paths**

- **Found during:** Commit 2 (typecheck after public-page moves)
- **Issue:** Server Action `@/app/actions/ttl-calculator` and test imports of `@/app/page`, `@/app/services/page`, `@/app/contact/page` broke after the corresponding files moved into `(public)/`. Server Actions and tests resolve by file path, not by URL.
- **Fix:** Updated all 4 consumer files to use the new `(public)/` paths. CONTEXT.md §5 explicitly anticipated this category of fix.
- **Files modified:**
  - `src/components/calculators/Calculator.tsx`
  - `tests/unit/ttl-calculator-actions.test.ts`
  - `tests/unit/server-components.test.tsx`
  - `tests/unit/homepage.test.tsx`
- **Commit:** `d095396` (folded into commit 2)

### Auto-fixed (Rule 3 — Biome format)

**2. [Rule 3 - Blocking] Biome reflowed long import path**

- **Found during:** Commit 2 pre-commit hook
- **Issue:** The longer `@/app/(public)/actions/ttl-calculator` import exceeded Biome's printWidth and triggered a format error in `tests/unit/ttl-calculator-actions.test.ts`.
- **Fix:** Ran `npx biome check tests/ --write` to wrap the import statements; re-staged.
- **Commit:** `d095396` (folded into commit 2)

No architectural deviations. No new dependencies. No content edits to any moved file.

## Hard constraints — all preserved

- `src/lib/auth/admin.ts` (Bearer cron guard) byte-equal to origin/main: **PASS**
- `proxy.ts` byte-equal to origin/main: **PASS**
- `src/app/api/**` byte-equal to origin/main: **PASS**
- Phase 02/03/04/05 admin/auth content byte-equal (only path moves via git rename): **PASS**
- No new dependencies: **PASS**
- No em/en-dashes in any user-facing copy: **PASS**
- No `console.*`, no `process.env.X`, no `any`: **PASS**

## Operator pre-PR smoke checklist (5 steps)

Deferred to operator pre-PR per CONTEXT §8. Each step is a visual / functional verification; the route-group topology means a single failure on any step is a structural bug, not a content issue.

1. Visit `/` — sees marketing `NavbarLight` + `Footer` (and `ScrollToTop` once scrolled past viewport).
2. Visit `/contact` — same marketing chrome, same active-state nav highlight.
3. Visit `/admin/dashboard` (signed in as admin) — admin `Sidebar` + `Topbar` only, zero marketing chrome bleed-through.
4. Visit `/auth/sign-in` (signed out) — centered auth card, no marketing chrome, no admin Sidebar.
5. Sign in, navigate around `/admin/*` — chrome stays admin-only across navigations; no flash of marketing chrome during route transitions.

## Self-Check: PASSED

- File `src/app/(public)/layout.tsx`: **FOUND**
- File `src/app/(admin)/admin/layout.tsx`: **FOUND**
- File `src/app/(auth)/auth/layout.tsx`: **FOUND**
- File `.planning/phases/06-admin-chrome-route-groups/06-SUMMARY.md`: **FOUND** (this file)
- Commit `87b1c55`: **FOUND** in `git log`
- Commit `d095396`: **FOUND** in `git log`
- Commit `467a004`: **FOUND** in `git log`
- Commit `a52c85b`: **FOUND** in `git log`
