# Requirements: Hudson Digital Solutions — Milestone v6 (Audit Remediation)

**Defined:** 2026-06-01
**Core Value:** A production marketing site whose code does exactly what its names, signatures, and UI copy promise. No silent no-ops, no fake successes.
**Source of truth:** `.planning/v6-AUDIT-FINDINGS.md`

## v6 Requirements

Every requirement traces to an audit finding. Genuine stubs are FIX; intentional no-ops are CONFIRM/CLEANUP/DECIDE.

### Paystub tax accuracy

- [ ] **PAYSTUB-01**: A user can only select states for which the paystub calculator actually computes income tax; selecting a state never silently yields a confident $0 when that state levies income tax. (Findings #1, #2 — `state-tax-data.ts`, `state-tax-calculations.ts`, `states-utils.ts`, `PaystubForm.tsx`)
- [ ] **PAYSTUB-02**: The federal tax year selector only offers years backed by real data; a selected year never silently falls back to a different year's figures. The "2023" dead toggle is removed (or real 2023 data added). (Finding #4 — `tax-data.ts`, `PaystubForm.tsx`)
- [ ] **PAYSTUB-03**: Year validation rejects years not present in the tax-data table (range derived from the data, not hardcoded), with a unit test covering the rejected/fallback case. (Finding #4)
- [ ] **PAYSTUB-04**: The redundant flat-0 TX/FL/WA entries are removed from the income-tax bracket table (those states already live in the no-income-tax group). (Finding #1)

### Error reporting

- [ ] **ERR-01**: The ErrorBoundary "Report Error" action either transmits a real report or is removed; the UI never tells the user a report was filed when nothing was sent. No `alert()` is used (Sonner toast per project convention if feedback is shown). (Finding #3 — `ErrorBoundary.tsx`)

### Dead-code cleanup

- [ ] **CLEAN-01**: The dangling "Test notification endpoints" JSDoc stub in `notifications.ts` is removed (or a real `sendTestNotification()` implemented). (Finding #5)
- [ ] **CLEAN-02**: The phantom `HelpArticle.order_index` field (hardcoded 0, no backing column) is removed from the interface and mapper. (Finding #6 — `help-articles.ts`)
- [ ] **CLEAN-03**: Each remaining cleanup-bucket no-op is resolved by call-site check: unused logger `group`/`groupEnd`/`table` methods removed if no callers (else documented); `contact-welcome` `PARAGRAPH_STYLE.whiteSpace` removed or justified; `ttl-calculator` always-0 `processingFees` field verified and removed or given a clear comment. (Findings: logger.ts, contact-welcome.tsx, ttl-calculator/calculator.ts)

### Admin error observability

- [ ] **ADMINERR-01**: Admin list pages distinguish "query failed" from "no data" with a visible error state instead of silently rendering an empty list. (Finding: `*-queries.ts` `list*ForAdmin`)
- [ ] **ADMINERR-02**: Admin dashboard widgets distinguish a failed query from genuinely-empty analytics. (Finding: `dashboard-queries.ts`)
- [ ] **ADMINERR-03**: The `/admin/emails` queue-health counts distinguish a failed query from a healthy zeroed queue. (Finding: `emails-queries.ts::getQueueCounts`)
- [ ] **ADMINERR-04**: Admin detail pages (`get*ById`) show an error state on DB failure instead of a misleading 404. (Finding: `get*ById` across `*-queries.ts`)

> ADMINERR-01..04 implement the milestone decision "full error states everywhere," which supersedes the v4 locked decision "each query wraps in try/catch and returns [] on failure."

### Admin UX

- [ ] **ADMINUX-01**: The admin `pageTitle` is resolved canonically using the most-performant Next.js 16 approach (to be determined by research during phase planning), removing the hardcoded-but-dynamic-looking prop. (Finding: `(admin)/admin/layout.tsx:47`)

### Intentional no-op confirmation

- [ ] **NOOP-01**: Every verified-intentional no-op (env-gated integrations: ad-conversions, Sentry/error-tracking, Slack/Discord, Resend email paths; mock DB when `POSTGRES_URL` unset; production log-level drops; rate-limiter Redis fallback; attribution quota catch; blob-probe fallback; upload `onUploadCompleted` audit-log) is recorded as verified-intentional in `.planning/v6-AUDIT-FINDINGS.md` with rationale, so future audits recognize it. (50 intentional findings)
- [ ] **NOOP-02**: Where cheap and meaningful, a regression test asserts the documented no-op behavior (e.g. `sendAdConversion` no-ops without creds; `db` mock returns `[]` without `POSTGRES_URL`) so the behavior is intentional-by-contract, not accidental. (Subset of NOOP-01)

## Future Requirements (deferred)

- **PAYSTUB-F1**: Add real state income-tax brackets for the remaining 37 income-tax states (incremental), re-enabling them in the selector.

## Out of Scope

| Item | Reason |
|------|--------|
| Adding 37 states of tax bracket data | v6 fixes the *lie* (silent $0), not the *coverage*. Coverage is PAYSTUB-F1, deferred. |
| Changing the env-gated integration no-ops (ad-conversions, Sentry, Slack/Discord, Resend) | Verified correct-by-design graceful degradation; NOOP-01 documents them, does not change them. |
| The `db.ts` mock proxy | Intentional CI/build fallback; documented under NOOP-01. |
| The 31 dismissed false positives (render guards, SSR guards, useSyncExternalStore noops) | Legitimate idioms; no action. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PAYSTUB-01 | Phase 11 | Pending |
| PAYSTUB-02 | Phase 11 | Pending |
| PAYSTUB-03 | Phase 11 | Pending |
| PAYSTUB-04 | Phase 11 | Pending |
| ERR-01 | Phase 12 | Pending |
| ADMINERR-01 | Phase 13 | Pending |
| ADMINERR-02 | Phase 13 | Pending |
| ADMINERR-03 | Phase 13 | Pending |
| ADMINERR-04 | Phase 13 | Pending |
| ADMINUX-01 | Phase 14 | Pending |
| CLEAN-01 | Phase 15 | Pending |
| CLEAN-02 | Phase 15 | Pending |
| CLEAN-03 | Phase 15 | Pending |
| NOOP-01 | Phase 16 | Pending |
| NOOP-02 | Phase 16 | Pending |

**Coverage:**
- v6 requirements: 15 total
- Mapped to phases: 15 (Phases 11-16)
- Unmapped: 0

---
*Requirements defined: 2026-06-01*
*Last updated: 2026-06-01 at milestone v6 roadmap creation (Phases 11-16)*
