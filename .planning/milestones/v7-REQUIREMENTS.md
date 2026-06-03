# Requirements: Hudson Digital Solutions — Milestone v7 (Stability and Maintenance)

**Defined:** 2026-06-02
**Core Value:** CI is a trustworthy signal and the project runs on current, supported dependencies. The test suite passes the same whether a test runs in isolation or in the full suite, and there are no stale dependency PRs hiding behind a noisy suite.
**Source of truth:** project memory `feedback_bun_mock_module_global_pollution.md` (the bun `mock.module` global-leak lesson) + the v6 deferred-items log (`.planning/phases/11-paystub-tax-accuracy/deferred-items.md`).

## v7 Requirements

### Test-suite isolation

- [x] **TEST-01**: The full `bun test tests/` run is order-independent and produces 0 failures, matching the isolated per-file results. The ~21 `homepage.test.tsx` + `navigation.test.tsx` (Footer / HomePage / Navbar / Navigation) failures — caused by bun's process-global `mock.module` registering and never being cleared by `mock.restore()` (oven-sh/bun#7823), which freezes a shared module's exports (`@/lib/constants/business` -> `BUSINESS_INFO` undefined) for later suites — are eliminated by root-causing the leaking test(s), not by skipping/xfail/suppressing them. Root cause: a `.tsx` consumer/render test that `mock.module(...)` a shared dep AND imports a broad module graph poisons unrelated suites.
- [x] **TEST-02**: A guard prevents reintroduction of the same class of leak — e.g. a documented + enforced convention (pure input->output unit tests over `mock.module` + JSX render where feasible; a setup-level reset or the `__REAL_*__` preload-capture pattern where a shared dep must be both mocked and asserted) plus a CI-level check that the full-suite pass count equals the sum of isolated runs. The fix is durable: re-running the suite repeatedly, and in any order bun chooses, stays 0-fail.

### Dependency currency

- [x] **DEP-01**: The 5 open Dependabot PRs (#327 dev-deps group of 5, #328 better-auth 1.6.12->1.6.13, #329 @tiptap/extension-link 3.24.0, #330 @tiptap/extension-image 3.24.0, #331 @tiptap/starter-kit 3.24.0) are each reviewed against current `main`: changelog/diff inspected, CI re-run on a clean (post-Phase-17) suite, and a per-PR merge/hold decision recorded with rationale. No PR is merged on a red or stale-base CI. (Resolved via consolidated PRs #341/#342/#343 merged CI-green; #327-331 closed-as-superseded with rationale — the Tiptap three omitted @tiptap/pm+react, and #327/#328 failed the frozen-lockfile CI.)
- [x] **DEP-02**: The better-auth bump (#328) is verified behaviorally before merge — the auth flows that matter in this app (signup, session cookie via `@supabase/ssr`-style `getAll`/`setAll`, admin-role gating) still work; the bump is patch-level (1.6.12->1.6.13) so the check is a targeted smoke, not a re-architecture. (Merged 1.6.13 in #342, then 1.6.14 in #343 — both: typecheck + build incl. `/api/auth/[...all]` + suite green; patch, no breaking changes.)
- [x] **DEP-03**: The three Tiptap 3.24.0 bumps (#329/#330/#331 — extension-link, extension-image, starter-kit) are verified together against the blog rich-text editor (links, images, core formatting render + persist) before merge, since they are a coupled set and starter-kit pulls peer extensions; the safe set is merged onto current `main` and any that regress the editor are held with a recorded reason. (Merged as one atomic bump of ALL FIVE @tiptap/* — incl. the pm+react the Dependabot PRs omitted — in #341; verified via build + tag-contract test + single-deduped prosemirror.)

## Out of Scope

| Item | Reason |
|------|--------|
| Major-version dependency upgrades beyond what Dependabot opened | v7 is currency + stability, not a framework migration. Only the 5 open PRs are in scope. |
| Rewriting the homepage/navigation tests from RTL to a different framework | The failures are a mock-leak side effect, not a test-framework problem; fix the leak, keep RTL. |
| Adding new test coverage for untested surfaces | v7 makes the existing suite trustworthy; net-new coverage is a separate concern. |
| Changing the env-gated no-op integrations confirmed in v6 (NOOP-01) | Verified correct-by-design; untouched. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | Phase 17 | Complete |
| TEST-02 | Phase 17 | Complete |
| DEP-01 | Phase 18 | Complete |
| DEP-02 | Phase 18 | Complete |
| DEP-03 | Phase 18 | Complete |

**Coverage:**
- v7 requirements: 5 total
- Mapped to phases: 5 (Phases 17-18)
- Unmapped: 0

---
*Requirements defined: 2026-06-02 (v7 Stability and Maintenance milestone start)*
*v6 requirements archived to `.planning/milestones/v6-REQUIREMENTS.md`*
