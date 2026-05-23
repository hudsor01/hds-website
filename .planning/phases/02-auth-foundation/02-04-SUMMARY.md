---
phase: 02-auth-foundation
plan: 04
subsystem: auth-ui
tags: [better-auth, ui, admin-shell, sign-in, sign-up, role-guard]
requires:
  - 02-01 (better-auth installed + env vars wired)
  - 02-02 (Neon auth tables: users, sessions, accounts, verifications)
  - 02-03 (Better Auth server config + client SDK + getSession + /api/auth/[...all])
provides:
  - "/auth/sign-in route (static server page + client form)"
  - "/auth/sign-up route (static server page + client form)"
  - "/admin layout that gates on getSession() + session.user.role === 'admin'"
  - "/admin placeholder page (replaced in Phase 03)"
  - "<AccountMenu /> primitive for the admin shell top bar"
  - "Zod schemas for sign-in / sign-up form input validation"
affects:
  - none (purely additive; root layout and existing routes untouched)
tech-stack:
  added: []
  patterns:
    - "Server page + client form component pair (because 'use client' files cannot export metadata)"
    - "Native <details>/<summary> for dropdown menus (zero JS, native a11y, no new dependency)"
    - "useState-driven forms for small surfaces (matches src/app/unsubscribe/UnsubscribeForm.tsx precedent)"
    - "403 panel rendered inside the same layout that enforces the role check, so non-admins cannot bypass it by navigating to a deeper /admin/* URL"
key-files:
  created:
    - src/lib/schemas/auth-forms.ts
    - src/app/auth/layout.tsx
    - src/app/auth/sign-in/page.tsx
    - src/app/auth/sign-up/page.tsx
    - src/components/auth/SignInForm.tsx
    - src/components/auth/SignUpForm.tsx
    - src/components/auth/AccountMenu.tsx
    - src/app/admin/layout.tsx
    - src/app/admin/page.tsx
  modified: []
decisions:
  - "Used <details>/<summary> for AccountMenu (not useState toggle). Zero new deps, keyboard handling and screen-reader semantics come from the browser; the default disclosure triangle is suppressed via the `marker:hidden` Tailwind variant and the `::-webkit-details-marker` pseudo-element for cross-engine coverage."
  - "Used useState for SignInForm and SignUpForm (not @tanstack/react-form). Two-to-three field forms with a single submit button do not benefit from the factory; the project already has the same call-out in src/app/unsubscribe/UnsubscribeForm.tsx."
  - "403 panel is rendered by the admin layout itself (no separate route). A non-admin who navigates to /admin/anything triggers the layout, hits the role check, and gets the 403 before any deeper data fetch runs."
  - "Sign-up form passes `name: parsed.data.name ?? parsed.data.email` because Better Auth's signUp.email contract requires a non-empty name; the UI field stays optional and falls back to the email."
  - "Auth layout uses min-h-[calc(100vh-3.5rem)] (not min-h-screen) to account for the root layout's 56px Navbar so the centered form sits in the visible viewport instead of overflowing."
metrics:
  duration: ~15 minutes
  completed: 2026-05-22
---

# Phase 02 Plan 04: Auth Pages, Admin Layout, AccountMenu

JWT-cookie auth UI for Better Auth: sign-in and sign-up pages with their client forms, the /admin route group with a server-side session+role guard, the placeholder admin landing, and the AccountMenu dropdown primitive.

## File-by-file

| File | Purpose |
|---|---|
| `src/lib/schemas/auth-forms.ts` | Two Zod schemas (`signInSchema`, `signUpSchema`) + inferred input types. Reuses `emailSchema` from `common.ts`; password is `min(8).max(128)`; name is optional `min(1).max(100)`. |
| `src/app/auth/layout.tsx` | Server component. Centers the auth form in the viewport (`bg-surface-base`, `min-h-[calc(100vh-3.5rem)]`). Does not render its own `<Toaster />` because the root layout already mounts one. |
| `src/app/auth/sign-in/page.tsx` | Server component. Exports `metadata`. Wraps `<SignInForm />` inside a `<Card>` with heading "Sign in" and a link to `/auth/sign-up`. |
| `src/app/auth/sign-up/page.tsx` | Server component. Exports `metadata`. Wraps `<SignUpForm />` inside a `<Card>` with heading "Create account" and a link to `/auth/sign-in`. |
| `src/components/auth/SignInForm.tsx` | Client component. `safeParse(signInSchema)`, then `signIn.email({ email, password, callbackURL: '/admin' })`. On success: `toast.success(...)`, `router.push('/admin')`, `router.refresh()`. Errors go through `logger.error` (internal) and a generic `toast.error('Invalid email or password.')` (user). |
| `src/components/auth/SignUpForm.tsx` | Client component. `safeParse(signUpSchema)`, then `signUp.email({ email, password, name: name ?? email, callbackURL: '/admin' })`. Same success/error path as SignInForm. |
| `src/components/auth/AccountMenu.tsx` | Client component. Native `<details>`/`<summary>` dropdown. Trigger shows the truncated email + a chevron. Panel shows "Signed in as / {email}" and a "Sign out" button. Sign out calls `signOut()` then `router.push('/auth/sign-in')` + `router.refresh()`. |
| `src/app/admin/layout.tsx` | Server component. `getSession()`. No session → `redirect('/auth/sign-in')`. Role mismatch → server-rendered 403 panel (does not render `children`). Admin → top bar with `<AccountMenu email={session.user.email} />` + `<main>{children}</main>`. |
| `src/app/admin/page.tsx` | Server component placeholder. Re-calls `getSession()` for type narrowing and renders "Signed in as {email} ({role})." Phase 03 replaces it. |

## Zod form schemas

```ts
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .optional()
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
```

`emailSchema` is the shared validator from `src/lib/schemas/common.ts` (lowercased, trimmed, RFC-ish email check).

## 403 approach

The role guard lives in `src/app/admin/layout.tsx`, not a separate route. When `session.user.role !== 'admin'`:

1. The layout `return`s a self-contained panel (heading "403 / Not authorized", body identifying the signed-in email + current role, a `mailto:` link for access requests, and a plain `<a href="/auth/sign-in">` for sign-out).
2. `children` are NOT rendered, so no deeper `/admin/*` page executes its data fetches under a non-admin session.

This is the source-of-truth check. The edge proxy (Plan 02-05) layers a fast cookie-presence short-circuit on top, but the layout's server check is what enforces role.

## Build / lint / typecheck

- `bun run typecheck` → exit 0
- `bun run lint` (Biome) → exit 0 (one autofix applied to a manual `!session || !session.user` → `!session?.user` simplification)
- `bun run build` → exit 0. Three new routes appear in the route table:
  - `○ /auth/sign-in` (Static)
  - `○ /auth/sign-up` (Static)
  - `◐ /admin` (Partial Prerender)

The `BetterAuthError: You are using the default secret` warning during prerender is environmental (no `BETTER_AUTH_SECRET` in the local build shell) and does not fail the build.

## Em/en-dash sweep

```
$ git status --short | awk '{print $2}' | xargs rg -lF '—' ; echo EXIT=$?
EXIT=1   (no matches)

$ git status --short | awk '{print $2}' | xargs rg -lF '–' ; echo EXIT=$?
EXIT=1   (no matches)
```

Zero em-dash or en-dash hits in any new file (JSX, comments, metadata, error strings, JSON, all clean).

## Deviations from Plan

None of substance. The plan flagged two implementation choices (AccountMenu primitive and form-state library) and the choices are documented in `decisions` above. One minor cleanup applied:

- **[Rule 1] Removed em-dash from one JSDoc comment in `SignInForm.tsx`.** The user-supplied prompt's grep is path-scoped (not JSX-scoped), so even comments needed to be em/en-dash-free to pass.
- **[Rule 1] Removed `'server-only'` literal from a comment in `auth-forms.ts`** so the acceptance check `grep -c "'server-only'"` returns 0 even though the file was never intended to be server-only.
- **[Rule 1] Applied Biome's `!session?.user` suggestion** in `admin/layout.tsx` to clear a warning before commit.

## Self-Check: PASSED

- All 9 new files exist on disk: confirmed via `git status --short`.
- All commits will be made by the executor in the closing commit (single atomic commit per the user's instructions).
