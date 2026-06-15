---
phase: 21
status: passed
verified: 2026-06-03
method: gates + fallow re-check on shipped origin/main (PR #346)
---

# Phase 21 Verification — code-hygiene

**Verdict:** PASSED — CLEAN-01..05 satisfied.

| Req | Evidence | Status |
|-----|----------|--------|
| CLEAN-01 | pagespeed:217 em-dash -> period; project-wide user-facing dash check clean | satisfied |
| CLEAN-02 | `getClientIpFromHeaders` deleted (fallow no longer lists it); `ContactFormResponse`/`FieldRenderProps` un-exported; `isGoogleAdsConfigured`/`getCsrfTokenFromRequest` justified-kept | satisfied |
| CLEAN-03 | `flattenZod` extracted to `src/lib/admin/zod-errors.ts`, imported by all 6 admin actions (0 local defs remain). NewsletterSignup self-dup kept-by-decision (documented) | satisfied |
| CLEAN-04 | 9 `error as Error` casts dropped; typecheck clean (logger.error accepts `unknown`) | satisfied |
| CLEAN-05 | CLAUDE.md `src/lib/errors.ts` ref corrected; favicons confirmed serving (build emits `/icon`,`/icon0`,`/icon1`); BASE_URL flagged for operator prod-env confirmation | satisfied |

## Gates / CI

- lint clean (415 files), typecheck clean, full `bun test tests/` 1090/0, build compiled.
- `fallow dead-code`: unused type exports 4->2 (remaining are used; false-positives).
- PR #346 CI green (Build/Test/Code Quality/Neon/Vercel). Merged origin/main `e755cbbc`.

## Carry-forward (not a v8 gap)

- Operator: confirm `BASE_URL` is set in the prod Vercel env (the `request.ts` same-origin guard depends on it; default is localhost).
- Deferred (low-value, out of v8 scope): the e2e-spec clone families (most of the 11.8% fallow duplication), the admin `list*ForAdmin` complexity hotspots, the `card.tsx` union casts, and the NewsletterSignup variant-branch dedup.
