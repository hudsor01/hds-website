# Phase 21 Summary — code-hygiene

**Completed:** 2026-06-03
**Requirements:** CLEAN-01..05 — satisfied
**PR:** #346 (merged, CI-green). Net -60 lines, no behavior change.

## What shipped (3 commits)

- **CLEAN-01** (`fix(21)`): `pagespeed` 504 message em-dash -> period. The only user-facing dash violation; now dash-free.
- **CLEAN-04** (`fix(21)`): dropped 9 unsound `error as Error` casts feeding `logger.error` (signature is `error?: Error | unknown`, normalizes internally) — paystub/ttl `storage.ts`, `use-paystub-calculator.ts`, `Calculator.tsx`.
- **CLEAN-05 (doc)** (`fix(21)`): `CLAUDE.md` error-handling section no longer references the deleted `src/lib/errors.ts`; documents passing the caught `error` directly (no cast).
- **CLEAN-02** (`chore(21)`): deleted genuinely-dead `getClientIpFromHeaders` (no src/test consumer); un-exported `ContactFormResponse` + `FieldRenderProps` (used in-file only); justify-kept `isGoogleAdsConfigured` (deferred ad-conversions API) + `getCsrfTokenFromRequest` (has a test). `ContactFormData` (5 uses) + `ErrorReport` (1 use) kept — fallow false-positives.
- **CLEAN-03** (`refactor(21)`): extracted the 6x-duplicated `flattenZod` (ZodError -> field map) into `src/lib/admin/zod-errors.ts`; all 6 admin `actions.ts` import it.

## Decisions / deviations

- **`ActionResult` NOT shared** (CLEAN-03): only 3 of the "6" files define it and blog's `id` is required (`id: string`) vs the others' optional (`id?: string`) — sharing would wrongly widen blog's type. Left per-file (meaningful variance).
- **NewsletterSignup self-dup KEPT by decision** (CLEAN-03): the two ~65-line duplicated regions are the `variant === 'compact'` and `variant === 'section'` render branches — independently-styled variants. Deduping couples them and risks visual regressions with no visual-regression test to catch a mistake; not appropriate for a hygiene phase. The cross-file `flattenZod` dedup (the real win) shipped.
- **CLEAN-05 favicons RESOLVED, not deferred:** the build emits `/icon`, `/icon0`, `/icon1` routes — `icon0.tsx`/`icon1.tsx` DO serve (Next supports the numbered convention here). fallow's "unused files" flag was a confirmed false-positive; no rename needed.
- **CLEAN-05 `BASE_URL`:** `optional().default('http://localhost:3000')`, not prod-required. The `request.ts` same-origin check depends on it. Left the security-sensitive check unchanged (out of scope for hygiene); **operator should confirm `BASE_URL` is set in the prod Vercel env** (the live site's forms work, so it almost certainly is).

## Verification

- `bun run lint` clean (415 files), `bun run typecheck` clean, full `bun test tests/` 1090/0, `bun run build` compiled.
- `fallow dead-code`: unused type exports 4 -> 2 (remaining 2 are used; false-positives); `getClientIpFromHeaders` removed; the 2 kept exports are intentional.
- CI #346 green (Build/Test/Code Quality/Neon/Vercel). Merged to origin/main (`e755cbbc`).
