# v6 Audit Findings — No-op / Stub Implementation Sweep

**Date:** 2026-06-01
**Method:** 8-lane parallel finder sweep across all 402 source files, each candidate adversarially verified against real code + call sites + project conventions (CLAUDE.md, STATE.md locked decisions).
**Totals:** 87 candidates -> **6 genuine stubs (fix)**, **50 intentional no-ops (confirm / decide / cleanup)**, 31 dismissed false positives.

This document is the canonical requirements input for milestone **v6**. Every non-false-positive finding below must receive an explicit disposition: FIX, CLEANUP, KEEP (verified intentional), or DECIDE.

---

## SECTION 1 — Genuine stubs (FIX)

### 1. [HIGH] Paystub state tax is silently $0 for 37 selectable states
- **Files:** `src/lib/paystub-calculator/state-tax-data.ts:126` (`getStateTaxBrackets`), `src/lib/paystub-calculator/state-tax-calculations.ts:12` (`calculateStateTax`), `src/lib/paystub-calculator/states-utils.ts:23` (`getIncomeTaxStates`), `src/components/paystub/PaystubForm.tsx:223` (dropdown)
- **Claim:** Page metadata + hero copy advertise "accurate payroll breakdowns with federal and state tax calculations for any pay period."
- **Reality:** `getStateTaxBrackets` only has data for 5 income-tax states (CA, NY, IL, PA, MA; plus redundant flat-0 TX/FL/WA which are already in the no-income-tax group). The dropdown renders ALL 42 income-tax states via `getIncomeTaxStates()` (50 minus 8 no-tax codes). Selecting any of the other 37 (AL, AZ, AR, CO, CT, DE, GA, HI, ID, IN, IA, KS, KY, LA, ME, MD, MI, MN, MS, MO, MT, NE, NH, NJ, NM, NC, ND, OH, OK, OR, RI, SC, UT, VT, VA, WV, WI) -> `getStateTaxBrackets` returns `undefined` -> `calculateStateTax` returns `0` (`// Unknown state -> assume no income tax`). User gets a confident $0 state tax and inflated net pay. Independently re-verified.
- **Fix:** Drive `getIncomeTaxStates()` off the keys actually present in `stateTaxDataByYear` so only supported states are selectable under "State Income Tax". Remove the redundant flat-0 TX/FL/WA entries from the income-tax table. Update the `tests/unit/.../state-tax-calculations.test.ts` case that codifies the silent-0 as "graceful". Optionally add bracket data for more states incrementally later.

### 2. [HIGH] `calculateStateTax` collapses missing data to 0 (same root cause as #1)
- **File:** `src/lib/paystub-calculator/state-tax-calculations.ts:12`
- **Reality:** The `if (!stateBrackets) return 0` early-return masks the missing-data condition from both the caller (`calculate-paystub-totals.ts`) and the user. Pairs with #1; fixed together. Alternative: return a `stateTaxSupported=false` signal and render a "state withholding not available" notice instead of a fake $0.

### 3. [MEDIUM] "Report Error" button reports nothing and tells the user it did
- **File:** `src/components/utilities/ErrorBoundary.tsx:65` (`DefaultErrorFallback.reportError`)
- **Reality:** The `fetch('/api/error-report', ...)` call is commented out (lines 81-85), no `/api/error-report` route exists (confirmed), yet the handler calls `alert('Error report has been prepared. Please contact support...')`. The ErrorBoundary wraps the root layout (`src/app/layout.tsx:197`), so this is live in production. This is the only `alert()` in the codebase.
- **Fix:** Either (a) implement a real report path (new route or wire to existing logging / Sentry) and uncomment the fetch, replacing `alert` with a Sonner `toast` per project convention; or (b) remove the "Report Error" button + `reportError` and keep "Copy Error Details" + the mailto contact link. Do not ship the current state.

### 4. [MEDIUM] 2023 year option is a dead toggle
- **Files:** `src/lib/paystub-calculator/tax-data.ts:70` (`getTaxDataForYear`), `src/components/paystub/PaystubForm.tsx:201` (`<SelectItem value="2023">`)
- **Reality:** `taxDataByYear` only contains 2024 (2025 is a deep-clone placeholder). `getTaxDataForYear(2023)` falls back to 2024 figures. The `2023` dropdown option silently uses 2024 brackets; the year arg is ignored for 2023.
- **Fix:** Remove the `2023` SelectItem, or add real 2023 brackets. Tighten `validation.ts` to reject years not present in `taxDataByYear` (derive the valid range from `Object.keys(taxDataByYear)`), add a unit test for `getTaxDataForYear(2023)`.

### 5. [LOW] Dangling "Test notification endpoints" stub comment
- **File:** `src/lib/notifications.ts:388`
- **Reality:** File ends with a `/** Test notification endpoints */` JSDoc block and no function under it. No call sites.
- **Fix:** Delete the dangling block (YAGNI), or implement `sendTestNotification()` if a manual webhook health-check is actually wanted.

### 6. [LOW] Phantom `order_index` field never backed by a column
- **File:** `src/lib/help-articles.ts:88` (`mapHelpArticle`), interface at `:23`
- **Reality:** `HelpArticle.order_index` is hardcoded `0`; the `help_articles` table (`src/lib/schemas/content.ts`) has no such column and all queries order by `createdAt`. Permanently-constant dead field.
- **Fix:** Delete `order_index` from the interface and mapper (YAGNI / "delete code rather than add"). No consumers read it. Add a real `orderIndex` column only if editorial ordering is later wanted.

---

## SECTION 2 — Intentional no-ops (50) — disposition required

Most are correct graceful-degradation by design. Each gets an explicit disposition so they stop reappearing in future audits.

### KEEP (verified correct by design — env-gated / documented)
- `src/lib/ad-conversions.ts:368` `sendAdConversion` no-op when `GOOGLE_ADS_*` unset or no Google click id. Documented groundwork (CLAUDE.md + memory: build when paid budget exists).
- `src/lib/ad-conversions.ts:94` `AdConversionParams` `value`/`currency`/`occurredAt` unused by the only caller. KEEP for the future paid-ads wiring, OR trim the signature (DECIDE-minor).
- `src/lib/error-tracking.ts:14` `reportError` no-op when `SENTRY_DSN` unset. KEEP.
- `src/lib/notifications.ts:35` `sendSlackNotification` / `:189` `sendDiscordNotification` no-op when webhook env unset. KEEP.
- `src/lib/db.ts:42` `createMockDb` proxy returns `[]` when `POSTGRES_URL` unset (CI / build). KEEP.
- `src/lib/rate-limiter.ts:59` `checkWithRedis` empty-catch -> in-memory fallback on Redis error. KEEP (graceful degradation); consider a `logger.debug` on the catch.
- `src/lib/logger.ts:199` `BaseLogger.log` drops `info`/`debug` in prod server. KEEP (intentional log level).
- `src/app/api/contact/route.ts:166`, `src/app/api/newsletter/subscribe/route.tsx:90`, `src/app/api/testimonials/submit/route.tsx:91`, `src/app/api/calculators/submit/route.tsx:186` — email paths gated on `isResendConfigured()`; route returns success even when email not sent. KEEP (works without Resend by design). Note borderline: success copy when email silently skipped.
- `src/app/api/admin/images/upload/route.ts:94` `onUploadCompleted` logs-only (never fires on localhost; real write on form submit). KEEP.
- `src/lib/paystub-calculator/tax-data.ts:68` 2025 = clone of 2024 ("placeholder until official tables update"). FOLD INTO paystub phase (#4).

### CLEANUP candidates (dead / removable, low risk)
- `src/lib/logger.ts:321/326/330` `group`/`groupEnd`/`table` explicit no-op methods. Remove if no call sites; else KEEP for console-API compat.
- `src/emails/contact-welcome.tsx:25` `PARAGRAPH_STYLE.whiteSpace` no-op (no template uses intra-paragraph newlines). Remove or KEEP.
- `src/lib/attribution.ts:121` `writeStore` empty catch (quota / private mode). Add a `logger.debug` or KEEP.
- `src/hooks/use-blob-upload.ts:67` `probeUploadDisabled` returns `false` on probe error (treats failure as enabled). Minor; KEEP or surface.
- `src/lib/ttl-calculator/calculator.ts:98` `processingFees` hardcoded `0` ("already included in registration calculation"). Verify and either remove the always-0 field or KEEP with a clearer comment.

### DECIDE (needs an explicit call)
- **Admin query silent-error-swallow (25 functions)** across `src/lib/admin/{blog,calculator-leads,dashboard,emails,leads,newsletter,showcase,testimonials}-queries.ts` — every `list*`/`get*ById`/`delete*`/dashboard widget query catches DB errors and returns `[]` / `null` / all-zero counts, so on a real DB failure the operator sees an empty list, a 404, or a "healthy" zeroed queue with no error signal.
  - **This is a LOCKED v4 decision** (STATE.md: "Every admin widget owns its own empty state. The page never short-circuits on one widget failing — each query wraps in try/catch and returns [] on failure").
  - **DECISION:** honor the lock (KEEP) vs. add a visible error state that distinguishes "query failed" from "no data" (revises the locked decision). Recommend a lightweight error-distinct state for `get*ById` (avoid turning DB errors into 404s) while keeping list/widget empty-state resilience.
- `src/app/(admin)/admin/layout.tsx:47` `pageTitle` hardcoded `"Admin"` for every route ("per-page titles arrive in a later phase"). DECIDE: implement per-page titles or remove the dynamic-looking prop.

---

## SECTION 3 — Dismissed (31, no action)
False positives / legitimate idioms: React conditional render guards (`if (!data) return null`), SSR/hydration guards (`typeof window === 'undefined'`), `useSyncExternalStore` empty-subscribe noops, HTML `placeholder=` attributes, skeleton/loading components, default param values. No milestone work.

---

## SECTION 4 — Proposed v6 phase breakdown
1. **Phase: paystub-tax-accuracy** (HIGH) — findings #1, #2, #4 + the 2025-clone note. Restrict state dropdown to supported states (or visible disclaimer), fix the year toggle, tighten validation, update tests, drop redundant flat-0 entries.
2. **Phase: errorboundary-report-path** (MEDIUM) — finding #3. Implement real report route + Sonner toast, or remove the button. No `alert()`.
3. **Phase: dead-code-cleanup** (LOW) — findings #5, #6 + CLEANUP-bucket items (logger no-op methods if unused, contact-welcome whiteSpace, ttl processingFees, etc.).
4. **Phase: admin-error-observability** (DECIDE) — resolve the locked-decision conflict; add error-vs-empty distinction where it matters (esp. `get*ById` -> not-found vs failure). Gated on a decision.
5. **Phase: intentional-noop-confirmation** — record each KEEP item in this doc as verified-intentional; optionally add regression tests asserting the documented no-op behavior so the next audit recognizes them.

Branch + PR per the standard GSD execute/ship flow once phases are planned.
