# Phase 18 Context — dependency-currency

**Phase:** 18
**Milestone:** v7 Stability and Maintenance
**Requirements:** DEP-01, DEP-02, DEP-03
**Severity:** MEDIUM
**Depends on:** Phase 17 (merged — clean order-independent suite; the dep PRs' CI Test job no longer hits the mock.module pollution)

## Goal

The 5 open Dependabot PRs are reviewed, verified, and the safe set merged onto current `main`, each with a recorded decision. After this phase there are no stale dependency PRs and the project is on current supported versions.

## Locked decisions

1. **All 5 bumps are SAFE** (official changelog review, 18-RESEARCH.md): Tiptap 3.24.0 (bug-fix minor), better-auth 1.6.13 (patch + security fixes), Next 16.2.7 + react/react-dom/types/knip (patch). No breaking changes in any.
2. **#327 (dev-deps) + #328 (better-auth): merge individually** via Dependabot, after `@dependabot rebase` puts them on the Phase-17-fixed base and CI is green.
3. **Tiptap #329/#330/#331: CONSOLIDATE, do NOT merge individually.** They omit `@tiptap/pm` + `@tiptap/react` (also at 3.23.6); merging the three alone leaves a version split that crashes the editor (`keyed plugin` RangeError) and would ship a broken prod deploy. Bump ALL FIVE `@tiptap/*` to 3.24.0 in one branch + one regenerated `bun.lock`, verify the editor, merge, then close #329/#330/#331 as superseded-by the consolidated PR.
4. **Order:** land #327/#328 first, then branch the Tiptap bump off the updated `origin/main` (one clean lockfile, no cross-PR `bun.lock` conflicts).
5. **No PR merges on red or stale-base CI.** Each merge auto-deploys to Vercel prod — batch the Tiptap bump into a single merge.

## Verification (what proves done)

- **DEP-01:** all 5 PRs reviewed + a recorded per-PR decision (merge / superseded). #327 + #328 merged green; #329/#330/#331 closed as superseded with a comment linking the consolidated PR.
- **DEP-02 (better-auth):** typecheck + build + full `bun test tests/` green on 1.6.13; the auth handler + drizzle-adapter usage compiles unchanged. (Patch, no breaking changes — CI + compile is sufficient smoke; a runtime auth check is a bonus, not a gate.)
- **DEP-03 (Tiptap):** typecheck + build + full suite green with all five `@tiptap/*` at 3.24.0; `RichTextEditor.tsx` mounts and links/images/core formatting render + persist with no `keyed plugin` console error (browser/e2e smoke).
- Each PR merges only on all-green CI (Build, Test, Code Quality incl. the Phase-17 guard, Neon, Vercel).

## Scope boundary

- IN: the 5 dependency bumps + the consolidated Tiptap branch + closing the superseded PRs + verification.
- OUT: any other dependency upgrades; framework migrations; new features; touching unrelated `src/**`.

## Notes

- Ship flow: #327/#328 merge as the existing Dependabot PRs; the Tiptap consolidation is a new code-only branch off `origin/main` (planning stays on `main`).
- `git merge`/`reset`/`rebase` on local `main` is gated in this env — operator reconciles local `main` after merges (content already matches origin where applicable).
- Use the real bun binary (`~/.bun/bin/bun`) for local verification.
