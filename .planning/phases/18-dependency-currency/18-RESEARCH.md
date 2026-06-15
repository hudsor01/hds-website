# Phase 18 Research — dependency-currency

**Researched:** 2026-06-02
**Method:** Live PR/diff inspection (`gh`) + official changelog review (GitHub release notes — primary sources). All 5 Dependabot PRs were opened 2026-06-02 against `main`, before the Phase-17 test fix merged; they are now 1+ commit behind and show `mergeable: UNKNOWN`.

## The 5 Dependabot PRs

| PR | Bump | Semver | Files | Independence |
|----|------|--------|-------|--------------|
| #327 | dev-dependencies group (5): `@types/react` 19.2.15->.16, `knip` 6.14.2->6.15.0, `next` 16.2.6->16.2.7, `react` 19.2.6->.7, `react-dom` 19.2.6->.7 | all **patch** | package.json + bun.lock | independent |
| #328 | `better-auth` 1.6.12->1.6.13 (all `@better-auth/*` in lockstep) | **patch** | package.json + bun.lock | independent |
| #329 | `@tiptap/extension-link` 3.23.6->3.24.0 | minor | package.json + bun.lock | COUPLED |
| #330 | `@tiptap/extension-image` 3.23.6->3.24.0 | minor | package.json + bun.lock | COUPLED |
| #331 | `@tiptap/starter-kit` 3.23.6->3.24.0 | minor | **package.json only (NO bun.lock)** | COUPLED |

## Critical finding: the Tiptap PRs are incomplete by construction

`package.json` pins **five** `@tiptap/*` packages, all at 3.23.6:
`@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`.

Dependabot opened PRs for only **three** (link #329, image #330, starter-kit #331). It did NOT open PRs for `@tiptap/pm` or `@tiptap/react`. Merging the three in isolation would leave `@tiptap/pm@3.23.6` + `@tiptap/react@3.23.6` against extensions/starter-kit at 3.24.0. Tiptap/ProseMirror require ALL `@tiptap/*` to be the SAME version — a split installs two `@tiptap/pm` copies and triggers the classic `RangeError: Adding different instances of a keyed plugin` at editor mount, breaking `src/components/admin/RichTextEditor.tsx` (the only Tiptap consumer, importing `@tiptap/react`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/starter-kit`).

Worse, merging the three one-at-a-time triggers a prod deploy per merge (main auto-deploys), so there would be intermediate prod states with mismatched Tiptap versions.

**Conclusion:** the Tiptap set must be bumped as **all five `@tiptap/*` -> 3.24.0 together, in one atomic change** with one regenerated `bun.lock`. The three Dependabot PRs cannot be merged as-is; they are superseded by a consolidated bump.

## Changelog review (official sources — no breaking changes)

- **Tiptap 3.24.0** (github.com/ueberdosis/tiptap releases): bug fixes only. Collaboration memory-leak fixes; `@tiptap/pm` adds a missing `@tiptap/pm/inputrules` export; details/markdown/static-renderer fixes. No API changes to starter-kit / extension-link / extension-image / react / pm. Safe minor.
- **better-auth 1.6.13** (github.com/better-auth/better-auth releases): bug + SECURITY fixes — patched SAML XML-injection (samlify 2.13.1), fixed `POST /oauth2/register` privilege bypass, blocked `javascript:`/`data:` redirect URI schemes, session/cookie storage-strategy fix on serverless. No breaking changes to session cookies, `getSession`, the Next.js handler, or the drizzle adapter. We use the drizzle adapter + Next handler (`src/app/api/auth/[...all]/route.ts`, `src/lib/auth/{index,client}.ts`); none of the changed areas (SAML/OAuth-provider/Expo/Google-One-Tap) are used here, so the relevant delta is pure security hardening. Safe patch — SHOULD merge.
- **Next 16.2.7** (github.com/vercel/next.js releases): backported bug fixes only; release notes explicitly state no breaking changes. Safe patch.

## Verification targets

- **DEP-02 (better-auth):** `src/app/api/auth/[...all]/route.ts`, `src/lib/auth/index.ts` (server, drizzle adapter + session), `src/lib/auth/client.ts`. Smoke: typecheck + build + full suite green; the auth handler compiles and `auth.api.getSession`-shaped usage is unchanged. Patch + no breaking changes = low risk.
- **DEP-03 (Tiptap):** `src/components/admin/RichTextEditor.tsx` — `useEditor` with `StarterKit`, `Link`, `Image`. Smoke: typecheck + build + full suite green AND a runtime editor check (mount, type, apply a link + image + bold/heading, confirm no console `keyed plugin` error and content persists). Browser smoke via Claude-in-Chrome or e2e if available.

## Execution strategy (for the planner/executor)

1. **#327 + #328 (independent, safe):** `@dependabot rebase` (already triggered) -> wait for clean CI on the Phase-17-fixed base -> #327 merge on green; #328 verify auth (typecheck/build/suite + handler smoke) then merge. Each merge auto-rebases nothing of the other (different lockfile hunks may conflict; rebase the loser if so).
2. **Tiptap consolidation:** branch `gsd/phase-18-tiptap-3.24` off the latest `origin/main` (AFTER #327/#328 land, to avoid lockfile churn); bump ALL FIVE `@tiptap/*` to 3.24.0 in package.json; `bun install` to regenerate `bun.lock`; verify (typecheck + build + full suite + editor smoke); one PR; CI green; merge; then close #329/#330/#331 with a comment pointing to the consolidated PR (superseded — they omitted `@tiptap/pm` + `@tiptap/react`).

## Pitfalls

1. Do NOT merge #329/#330/#331 individually — version split breaks the editor and ships a broken prod deploy.
2. Order matters: land #327/#328 first, then branch the Tiptap bump off the updated main, so `bun.lock` regenerates against current deps (one clean lockfile, no cross-PR conflicts).
3. #331 has no `bun.lock` change at all — never mergeable on its own; the consolidation supersedes it.
4. Each merge to `main` auto-deploys to Vercel prod (Hobby 100 deploys/day). Batch the Tiptap bump into one merge.
5. Use the REAL bun binary for local verify (the dev-shell `bun` wrapper mis-resolves nested `bun`; see Phase 17 notes).
