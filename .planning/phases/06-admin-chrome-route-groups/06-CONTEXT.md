# Phase 06 — Admin chrome route groups

**Date:** 2026-05-25
**Branch:** `chrome-route-groups`
**Milestone:** v5 — Admin hardening + content authoring
**Scope:** Convert `src/app` from a flat layout to three explicit route groups — `(public)/`, `(admin)/`, `(auth)/` — so marketing chrome (`NavbarLight` + `Footer`) lives in the `(public)/layout.tsx` instead of the root layout. Admin and auth pages stop inheriting marketing chrome by route topology, not by client-side suppression. Removes the `usePathname` early-return shipped in PR #218 (`4114d37`) as the canonical Next.js answer to the bleed.

## 1. Goal

After this phase, the chrome a route receives is determined by which route group it lives in. No client-side `usePathname` check, no `if (pathname.startsWith('/admin'))` early returns. Adding a new top-level chrome variant (e.g. a `(marketing-campaign)/` layout) becomes a route-group add, not a component edit.

Visible value: zero (no UX change). Architectural value: high (correct Next.js idiom, removes a client-side gate, makes the chrome boundary auditable from the file tree alone).

## 2. Non-goals

- **No UX change.** Every public page renders the same NavbarLight + Footer it does today. Every admin page renders the same Sidebar + Topbar it does today. Every auth page renders the centered card it does today.
- **No content edits.** No copy changes, no new sections, no design changes. Pure file relocation + layout extraction.
- **No new API routes.** `src/app/api/*` stays exactly where it is (API routes have no chrome, so route-group membership is moot).
- **No metadata route changes.** `src/app/{icon,apple-icon,opengraph-image,twitter-image,sitemap,robots,manifest}.{tsx,ts}` stay at the root because Next.js metadata file conventions require root-level placement.
- **No middleware change.** `proxy.ts` is route-pattern-driven, not route-group-driven; unchanged.
- **No removal of `scroll-smooth` class or `data-scroll-behavior` attribute** from the root `<html>`. The root layout retains the `<html>` + `<body>` shell; route groups own everything inside `<main>`.
- **No tests rewrite.** Existing Playwright e2e specs and bun:test unit tests stay as-is. Route-group membership is invisible to URLs (`(public)/` is stripped from the path).

## 3. Pattern (locked)

**Three route groups:**

- `src/app/(public)/` — every marketing-facing page. Owns its own `layout.tsx` that renders `<NavbarLight />` + `<main>{children}</main>` + `<Footer />` + `<ScrollToTop />`.
- `src/app/(admin)/` — the entire `/admin/*` tree. Owns its own `layout.tsx` that does the existing admin session check + composes `<Sidebar />` + `<Topbar />` + `<main>{children}</main>` (i.e. the current `src/app/admin/layout.tsx`, just moved one level in).
- `src/app/(auth)/` — `/auth/sign-in` + `/auth/sign-up`. Owns its own `layout.tsx` that renders the centered card shell (i.e. the current `src/app/auth/layout.tsx`).

**Root layout (`src/app/layout.tsx`)** shrinks to:
- `<html>` + `<body>` shell
- Skip link
- JsonLd (organization + website schema)
- `<NuqsAdapter>` + `<ClientProviders>` + `<ErrorBoundary>` + `<Toaster>` + `<Analytics>` + `<SpeedInsights>` + `<WebVitalsReporting>`
- NO `<NavbarLight />`, NO `<Footer />`, NO `<main>` landmark (each route group's layout owns its own `<main>`)

**URL invariance:** Route group names in `()` are URL-invisible. `/` resolves to `(public)/page.tsx`. `/contact` resolves to `(public)/contact/page.tsx`. `/admin/dashboard` resolves to `(admin)/admin/dashboard/page.tsx`. No URL changes anywhere.

**Self-suppression removal:** `NavbarLight` and `Footer` lose their `usePathname` + early-return blocks added in PR #218. Both go back to unconditional render (which is correct because the `(public)` layout is the only place they're mounted).

## 4. File-level changes

### New files

- `src/app/(public)/layout.tsx` — renders `<NavbarLight />` + skip-link target `<main id="main-content" className="min-h-screen pt-14">{children}</main>` + `<Footer />` + `<ScrollToTop />`. JSDoc explains: this layout wraps every marketing-facing page; admin and auth use their own group layouts; the root layout no longer renders any chrome.
- `src/app/(admin)/admin/layout.tsx` — the file at `src/app/admin/layout.tsx` today, moved one level deeper. Unchanged content (still does `getSession` + `requireAdminSession`-equivalent role check + renders `<Sidebar />` + `<Topbar />` + `<main>{children}</main>` — with its own `<main>` landmark).
- `src/app/(auth)/auth/layout.tsx` — the file at `src/app/auth/layout.tsx` today, moved one level deeper. Unchanged content (centered card shell). Update the JSDoc — the "self-suppress on /auth/* via usePathname" sentence introduced in PR #218 is no longer accurate; rewrite to describe the new route-group placement.

### Moved files (URL invariant — `()` is stripped from the path)

**Public pages** — move into `src/app/(public)/`:
- `src/app/page.tsx` → `src/app/(public)/page.tsx`
- `src/app/not-found.tsx` → `src/app/(public)/not-found.tsx`
- `src/app/error.tsx` → `src/app/(public)/error.tsx` (verify it exists; if not, no move)
- `src/app/about/` → `src/app/(public)/about/`
- `src/app/blog/` → `src/app/(public)/blog/`
- `src/app/contact/` → `src/app/(public)/contact/`
- `src/app/faq/` → `src/app/(public)/faq/`
- `src/app/help/` → `src/app/(public)/help/`
- `src/app/locations/` → `src/app/(public)/locations/`
- `src/app/portfolio/` → `src/app/(public)/portfolio/`
- `src/app/privacy/` → `src/app/(public)/privacy/`
- `src/app/services/` → `src/app/(public)/services/`
- `src/app/showcase/` → `src/app/(public)/showcase/`
- `src/app/switch-from-thryv/` → `src/app/(public)/switch-from-thryv/`
- `src/app/terms/` → `src/app/(public)/terms/`
- `src/app/testimonials/` → `src/app/(public)/testimonials/`
- `src/app/tools/` → `src/app/(public)/tools/`
- `src/app/unsubscribe/` → `src/app/(public)/unsubscribe/`
- `src/app/website-migration/` → `src/app/(public)/website-migration/`
- `src/app/actions/` → `src/app/(public)/actions/` (verify; if these Server Actions are imported from outside `app/`, the move is still safe — actions resolve by file path, not URL)

**Admin pages** — move into `src/app/(admin)/admin/`:
- All of `src/app/admin/` → `src/app/(admin)/admin/`
- This includes `layout.tsx`, `page.tsx`, `dashboard/`, `showcase/`, `blog/`, `testimonials/`, `leads/`, `newsletter/`, `emails/`, `(coming-soon)/` if anything remains there (Phase 05 deleted the directory entirely; verify).

**Auth pages** — move into `src/app/(auth)/auth/`:
- `src/app/auth/layout.tsx` → `src/app/(auth)/auth/layout.tsx`
- `src/app/auth/sign-in/page.tsx` → `src/app/(auth)/auth/sign-in/page.tsx`
- `src/app/auth/sign-up/page.tsx` → `src/app/(auth)/auth/sign-up/page.tsx`

**Stays at root (Next.js metadata convention)** — do NOT move:
- `src/app/layout.tsx` (root layout)
- `src/app/globals.css`
- `src/app/api/` (entire API tree)
- `src/app/icon.tsx`, `src/app/apple-icon.tsx`, `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx`
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts` (if any)
- `src/app/global-error.tsx` (Next.js error boundary convention — must live at root)

### Modified files

- `src/app/layout.tsx` — strip `<NavbarLight />`, `<Footer />`, `<ScrollToTop />`, and the `<main id="main-content">` wrapper from the body. Keep `<html>` + `<body>` shell + skip link + JsonLd + providers + Analytics. JSDoc comment block updated to note that chrome now lives in route-group layouts.
- `src/components/layout/Navbar.tsx` — remove the `usePathname` import (if not used elsewhere) and the early-return block introduced by PR #218. Component goes back to unconditional render. JSDoc updated.
- `src/components/layout/Footer.tsx` — same: remove `usePathname` import + early-return + JSDoc update.

### Deleted files

- `src/app/admin/layout.tsx` (moved to `(admin)/admin/layout.tsx`)
- `src/app/admin/page.tsx` (moved)
- `src/app/auth/layout.tsx` (moved)
- `src/app/auth/sign-in/page.tsx` (moved)
- `src/app/auth/sign-up/page.tsx` (moved)
- All public-page files at their old root locations (each moved into `(public)/`)

(Mechanically, `git mv` preserves history; effective net change is "moved with rename".)

## 5. Import-path implications

Route groups do NOT change URLs but DO change file paths. Three places where this matters:

1. **Relative imports inside moved files.** A page that did `import { X } from '../../components/Foo'` may now need a different number of `../`s. Switching them all to the `@/` alias removes the fragility. Best practice: every moved file uses absolute imports via `@/` only. Audit during the move.

2. **`src/app/sitemap.ts` and `src/app/robots.ts`.** These typically import from `@/lib/seo-utils` and reference public-route paths as strings. The strings are URLs (not file paths), so no change needed. Verify.

3. **Tests.** Playwright e2e specs navigate by URL, not by file path. No change. bun:test unit tests import server modules by `@/...` alias. No change. Verify both run clean after the move.

## 6. Validation that no URL changes

After the move, run `bun run build` and capture the route table. Diff against the pre-move route table:

```
git diff main -- <route-table-output> | wc -l   # should be zero
```

(In practice: capture `bun run build | grep -E '^[│├└]' > routes-after.txt` before and after; `diff` the two; expect no changes other than the `└` / `├` tree-drawing glyphs.)

## 7. Constraints (do not violate)

- All project conventions in `/CLAUDE.md`. Highlights: NO em/en-dashes in user-facing strings (only `@/lib/logger`, never `console.*`; Zod `safeParse`; env via `@/env`).
- Phase 02/03/04/05 surface is functionally untouched. Files MOVE but their content is byte-identical to pre-move (`git diff main -- <new-path>` should show only the rename, not content change). Exceptions: `(admin)/admin/layout.tsx` JSDoc may need a one-line update if it referenced the old path; `(auth)/auth/layout.tsx` JSDoc needs the post-PR-#218 sentence rewritten.
- `src/lib/auth/admin.ts` (Bearer cron guard) stays untouched.
- `proxy.ts` stays untouched. Its matcher patterns target URLs, not file paths.
- All public-API surfaces (`src/app/api/**`) stay untouched.
- Cron + n8n endpoints stay byte-equal to main.

## 8. Verification

- `bun run lint && bun run typecheck && bun run build` all exit 0
- Build route table is byte-equal to pre-move route table (only file paths in source changed; URLs are invariant)
- Em/en-dash sweep on all changed files: zero matches
- Phase 02/03/04/05 admin/auth surface diff vs main: only the file relocation appears; no content drift
- Production smoke (light): navigate to `/`, `/contact`, `/services`, `/admin/dashboard`, `/auth/sign-in` and verify the correct chrome renders for each (marketing chrome on `/`, `/contact`, `/services`; admin chrome on `/admin/dashboard`; centered auth card on `/auth/sign-in`)
- `NavbarLight` and `Footer` source diff vs main: shows the `usePathname` import + early-return removal, JSDoc updated, no other changes

## 9. Out of scope

- Image upload UI (Phase 08)
- Rich-text blog editor (Phase 09)
- Pagination (Phase 10)
- 3rd-party logger sweep (Phase 07)
- Any new top-level chrome variant beyond the three groups above
- Any redesign of NavbarLight or Footer beyond the early-return removal
