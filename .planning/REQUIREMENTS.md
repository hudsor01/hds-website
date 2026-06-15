# Requirements: Hudson Digital Solutions — Milestone v8 (Hardening)

**Defined:** 2026-06-03
**Core Value:** The production code is secure (no known-vulnerable deps), contract-correct (no double-sends, no wrong HTTP statuses, no unbounded public input), and lean (no dead code, no user-facing dash violations, no unsound casts).
**Source of truth:** the verified post-v7 repo review (this session) — two reviewer agents + `bun audit` + `fallow` code-intelligence. Findings tagged VERIFIED (confirmed in code) vs REPORTED (re-verify at plan time).

## v8 Requirements

### Dependency security

- [x] **SEC-01**: The 5 known vulnerabilities from `bun audit` are resolved or risk-accepted with rationale: `fast-uri ≤3.1.1` (2 HIGH — host confusion + path traversal, transitive via `react-email` + `@sentry/nextjs`), `postcss <8.5.10` (moderate XSS via unescaped `</style>`, via `next` + `@tailwindcss/postcss` + `sanitize-html`), `brace-expansion` (moderate DoS). Achieved via `bun update` (+ targeted overrides if needed) then a clean `bun audit`, OR every remaining advisory documented as transitive-build-only with no runtime exposure. Build + full suite stay green.

### Correctness bugs

- [x] **BUG-01**: The scheduled-email queue cannot double-send. `processPendingEmails` (`scheduled-emails.tsx`) atomically claims rows (`UPDATE … SET status='processing' … RETURNING`, or `FOR UPDATE SKIP LOCKED`) BEFORE the Resend call, so overlapping GET (Vercel cron) / POST (n8n) invocations or an overrunning run never send the same email twice. Regression test covers the claim semantics. (VERIFIED: select-then-send with no claim; dual-verb endpoint.)
- [x] **BUG-02**: The rate-limiter is safe under a Redis outage and atomic on the Redis path. The in-memory fallback store is bounded regardless of `useRedis` (cleanup runs even when Redis is configured), and the Redis counter sets count+TTL atomically (no TTL-less zombie keys). Test covers the fallback-cleanup path. (VERIFIED: cleanup only starts in the `!useRedis` branch. REPORTED: non-atomic `incr`+`expire`.)
- [x] **BUG-03**: The `testimonials/[id]` PATCH/DELETE endpoints return correct HTTP status: 404 for a non-existent id (the query layer reports rows-affected via `.returning()`), 400 for a malformed non-UUID id (route validates with `z.string().uuid()`), never a misleading 200 (success on missing) or 500 (Postgres `22P02` on garbage). Test covers missing + malformed ids. (VERIFIED: `updateTestimonialStatus`/`deleteTestimonial` return `true` unconditionally; no UUID validation.)
- [x] **BUG-04**: Public calculator submissions (`calculators/submit`) cannot persist unbounded/arbitrary JSON. `inputs`/`results` are shape-validated (per-calculator) or size/key-depth capped before insert, so a same-origin client cannot bloat the `calculator_leads` JSON columns. (VERIFIED: `z.record(z.string(), z.unknown())` stored verbatim, no cap.)

### Code hygiene

- [x] **CLEAN-01**: No user-facing em-dash / en-dash. Fix `pagespeed/route.ts:217` (the `"…exceed our budget — try again…"` error string shipped to the browser) and re-run the project-wide dash check clean. (VERIFIED.)
- [x] **CLEAN-02**: The dead exports/types `fallow` flagged are removed or justified with a rationale comment: exports `isGoogleAdsConfigured` (`ad-conversions.ts`), `getCsrfTokenFromRequest` (`csrf.ts`), `getClientIpFromHeaders` (`request.ts`); types `ContactFormData`, `ContactFormResponse` (`use-contact-form-submit.ts`), `FieldRenderProps` (`FormFieldSet.tsx`), `ErrorReport` (`schemas/error-report.ts`). (Framework-consumed `metadata`/`runtime`/`icon`/`opengraph-image` exports are NOT dead — excluded.)
- [x] **CLEAN-03**: Duplication reduced: extract the `flattenZod` helper + `ActionResult` type (copy-pasted across 6 admin `actions.ts`) into a shared `src/lib/admin/` module; remove the `NewsletterSignup.tsx` self-duplication (the ~65-line block repeated at 118-181 ↔ 231-295). (VERIFIED via fallow + agent.)
- [x] **CLEAN-04**: The 9 unsound + unnecessary `error as Error` casts feeding `logger.error` (calculator `storage.ts` modules + `use-paystub-calculator.ts` + `Calculator.tsx`) are dropped (`logger.error` already accepts `unknown` and normalizes). The 2 `any` in `ShowcaseFormFields.tsx` stay (`biome-ignore`'d for the TanStack Form generic) unless a clean type is trivial.
- [x] **CLEAN-05**: `CLAUDE.md` corrected — it documents two `castError` helpers but `src/lib/errors.ts` no longer exists (only `logger.ts`'s private one); update the guidance. Confirm `icon0.tsx`/`icon1.tsx` actually serve as favicons (192/512) — rename to the supported Next convention if not. Confirm `BASE_URL` is set in the prod Vercel env (else the `request.ts` same-origin check 403s all public form POSTs) — or harden the check to fall back to the request host / `NEXT_PUBLIC_BASE_URL`.

## Out of Scope

| Item | Reason |
|------|--------|
| Removing `icon0.tsx`/`icon1.tsx` as "dead code" | fallow false-positive — they are Next.js dynamic icon routes (framework-consumed). Only verify/rename if they don't serve. |
| "Fixing" the duplicate `deleteTestimonial` export | Intentional, documented re-export of one impl — not a duplicate implementation. |
| Refactoring the 7 admin `list*ForAdmin` complexity hotspots + `card.tsx` union casts | fallow flagged them (cognitive 30-42) but they work and are well-tested; maintainability is 92.9 (good). Deferred — not a v8 defect. |
| Deduping the e2e-spec clone families (most of the 11.8% duplication) | Test boilerplate; low risk, separate cleanup. CLEAN-03 covers only the runtime dupes. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 19 | Complete |
| BUG-01 | Phase 20 | Complete |
| BUG-02 | Phase 20 | Complete |
| BUG-03 | Phase 20 | Complete |
| BUG-04 | Phase 20 | Complete |
| CLEAN-01 | Phase 21 | Complete |
| CLEAN-02 | Phase 21 | Complete |
| CLEAN-03 | Phase 21 | Complete |
| CLEAN-04 | Phase 21 | Complete |
| CLEAN-05 | Phase 21 | Complete |

**Coverage:**
- v8 requirements: 10 total
- Mapped to phases: 10 (Phases 19-21)
- Unmapped: 0

---
*Requirements defined: 2026-06-03 (v8 Hardening milestone start)*
*v7 requirements archived to `.planning/milestones/v7-REQUIREMENTS.md`*
