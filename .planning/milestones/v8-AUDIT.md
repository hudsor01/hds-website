# v8 — Hardening — Milestone Audit

**Audited:** 2026-06-03
**Verdict:** PASSED — definition of done achieved.
**Method:** Goal-backward audit against the SHIPPED state (`origin/main` + each phase's VERIFICATION + merged-PR/CI). Local `main` un-reconciled (`git merge` gated for the agent); `origin/main` is the source of truth and is complete.

## Definition of done

v8 set out to close the issues surfaced by the post-v7 repo review (two reviewer agents + `bun audit` + `fallow`): patch known dependency vulnerabilities, fix the real correctness bugs, and clean up conventions / dead code / duplication.

## Requirements coverage — 10/10 SATISFIED

| Req | Phase | Shipped (PR) | Status |
|-----|-------|--------------|--------|
| SEC-01 | 19 dependency-security | #344 | satisfied |
| BUG-01..04 | 20 correctness-bugs | #345 | satisfied |
| CLEAN-01..05 | 21 code-hygiene | #346 | satisfied |

Spot-verified on `origin/main`: the 4 security overrides (`fast-uri`/`postcss`/`brace-expansion`/`ws`) → `bun audit` clean; `claimDuePendingEmails` atomic claim + stale-`processing` reclaim; rate-limiter lazy-prune + `SET NX EX`+`INCR`; testimonials `.returning()` (x5) + uuid-400/404 across both routes; calculator 16KB/100-key cap; `pagespeed` dash-free; `src/lib/admin/zod-errors.ts` imported by all 6 admin actions; `getClientIpFromHeaders` removed; `CLAUDE.md` `errors.ts` ref corrected.

## Original-intent delivery

- **Dependency security (SEC-01):** all 5 known vulns (2 high `fast-uri`, moderate `postcss`/`brace-expansion`/`ws`) patched via same-major overrides; `bun audit` → 0.
- **Correctness (BUG-01..04):** email double-send race closed with an atomic claim (+ crash-orphan reclaim, a recovery gap caught by plan-check); rate-limiter bounded under a Redis outage + atomic Redis op; testimonials HTTP contract corrected (404/400, not 200/500); public calculator JSON capped. Each with a regression test proven to fail on pre-fix code. Suite 1073 → 1090.
- **Hygiene (CLEAN-01..05):** user-facing em-dash removed; genuinely-dead export pruned + internal-only exports tightened; `flattenZod` deduped across 6 files; 9 unsound error casts dropped; stale doc fixed; favicons confirmed serving; `BASE_URL` prod-env flagged for the operator.

## Cross-phase integration

Three independent surfaces (dependency manifest; runtime bug fixes; cleanup) with a clean ordering (deps → bugs → hygiene). The Phase-17 mock-leak guard + the order-independent suite held throughout (full `bun test tests/` 1090/0 on every branch); every merged PR was CI-green.

## Process highlights

- Phase 20 ran the full Opus loop (research → context → adversarial plan-check that caught the BUG-01 orphaned-`processing` recovery gap → execute). A CI escape (9 BUG-03 route-test failures from an `ADMIN_SECRET` env-snapshot ordering bug — same bun#7823 class as Phase 17, on `@/env`/auth) was caught before merge and root-fixed in two steps (9 → 1 → 0); product code was always correct.
- `fallow` code-intelligence drove the hygiene phase; two of its findings were correctly triaged as false-positives (`icon0`/`icon1` Next routes, the `deleteTestimonial` intentional re-export) and excluded.

## Caveats / follow-ups (not v8 gaps)

1. **Local `main` un-reconciled** — `git merge origin/main` is gated for the agent; operator runs it. `origin/main` complete.
2. **`BASE_URL` prod-env** — confirm it is set in Vercel prod (the same-origin guard depends on it; default is localhost). Operator verification, not a code defect.
3. **Deferred maintainability** (logged, out of v8 scope): e2e-spec clone families (most of fallow's 11.8% duplication), the 7 admin `list*ForAdmin` complexity hotspots, `card.tsx` union casts, NewsletterSignup variant-branch dedup.

## Conclusion

v8 Hardening is **functionally complete and shipped** on `origin/main`. All 10 requirements satisfied, all 3 phases verified + merged + CI-green. The production code is now free of known dependency vulnerabilities, has the four verified correctness bugs fixed with regression tests, and is leaner (dead code pruned, duplication reduced, unsound casts removed, docs corrected).
