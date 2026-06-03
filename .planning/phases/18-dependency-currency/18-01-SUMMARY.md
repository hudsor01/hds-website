# Phase 18 Summary — dependency-currency

**Completed:** 2026-06-02
**Requirements:** DEP-01, DEP-02, DEP-03 — all satisfied
**Outcome:** All target dependencies are on their latest published versions; all 5 open Dependabot PRs resolved; zero open dependency PRs.

## What shipped

Three verified, code-only PRs merged to `main` (each CI-green: Build/Test/Code-Quality/Neon/Vercel), superseding the 5 Dependabot PRs:

| PR | Bumps | Supersedes |
|----|-------|-----------|
| #341 | all five `@tiptap/*` 3.23.6 -> 3.24.0 (`extension-image`, `extension-link`, `pm`, `react`, `starter-kit`) | #329, #330, #331 |
| #342 | `next` 16.2.7, `react`/`react-dom` 19.2.7, `@types/react` 19.2.16, `knip` 6.15.0, `better-auth` 1.6.13 | #327, #328 |
| #343 | `better-auth` 1.6.13 -> 1.6.14 (latest; published mid-flight) | follow-up to #342/#328 |

Final state on `main`: better-auth 1.6.14, next 16.2.7, react/react-dom 19.2.7, knip 6.15.0, @types/react 19.2.16, all `@tiptap/*` 3.24.0 — every one matches the latest published version.

## Why consolidation instead of merging the Dependabot PRs (DEP-01)

Each of the 5 Dependabot PRs was reviewed (diff + official changelog) and a decision recorded. None could be merged as-is:

1. **Tiptap #329/#330/#331:** each bumped only ONE `@tiptap/*` package and OMITTED `@tiptap/pm` + `@tiptap/react` (also pinned 3.23.6). Tiptap requires all `@tiptap/*` at the same version; merging any subset would install two ProseMirror copies and crash `RichTextEditor.tsx` at mount (`RangeError: Adding different instances of a keyed plugin`), and merging them sequentially would ship that broken state to prod between deploys. Resolution: one atomic bump of all five (#341).
2. **#327 + #328:** both failed CI with `error: lockfile had changes, but lockfile is frozen` — the repo's `fix-lockfile` job did not produce a `bun install --frozen-lockfile`-compatible `bun.lock`. `@dependabot rebase`/`recreate` did not fix it. Resolution: regenerate a consistent lockfile on a controlled branch (#342) and verify the frozen install passes in CI (it did, with CI's bun 1.3.8).

All 5 Dependabot PRs were then closed with a comment pointing to the superseding merged PR.

## Safety review (official changelogs — primary sources)

- **Tiptap 3.24.0:** bug-fix minor; no API changes to starter-kit/link/image/react/pm (`@tiptap/pm` adds a missing `inputrules` export). 
- **better-auth 1.6.13 + 1.6.14:** patches; bug + security fixes (SAML XML-injection patch, OAuth register privilege-bypass fix, blocked `javascript:`/`data:` redirect schemes, `getSessionCookie` prefers `__Secure-` cookie). No changes to session cookies / `getSession` / Next handler / drizzle adapter — the surfaces this app uses.
- **next 16.2.7 / react 19.2.7 / etc.:** patches; release notes state no breaking changes.

## Verification

- **DEP-02 (better-auth):** typecheck + `biome` + `bun run build` (incl. `/api/auth/[...all]` handler compiling) + full suite, on both 1.6.13 (#342) and 1.6.14 (#343). Patch + no breaking changes = sufficient smoke.
- **DEP-03 (Tiptap):** typecheck + build (incl. `/admin/blog` mounting `RichTextEditor`) + full suite + the `rich-text-editor` tag-contract test (4/0 — StarterKit+Link+Image emit the same tag set as 3.23.6) + a single deduped `prosemirror-state`/`@tiptap/core@3.24.0`/`@tiptap/pm` in node_modules (the version-split crash is structurally impossible).
- **Phase-17 guard intact:** full `bun test tests/` = 1073 pass / 0 fail on every branch (order-independent suite held through all bumps); CI Code Quality (which runs `scripts/check-test-mock-leaks.sh`) green on all three PRs.
- No PR merged on red or stale-base CI.

## Notes / deviations

- **Deviation from literal "merge the 5 Dependabot PRs":** delivered as 3 verified consolidated PRs + 5 closed-as-superseded, forced by the Tiptap incompleteness + the Dependabot frozen-lockfile CI failures. End state is identical (all deps current + verified) and cleaner (one consistent lockfile, no intermediate broken prod deploy).
- `better-auth` 1.6.14 (#343) was an in-scope follow-up: 1.6.14 published after #342 was built, so #342 landed 1.6.13; #343 closed the one-patch gap to reach the latest.
- Local `main` reconcile remains operator-run (`git merge` gated in this env); origin/main is the source of truth and is complete.
