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

### Paystub tax data correctness

> Surfaced by the official-source re-research (`11-RESEARCH.md` "Data Accuracy Verification"). The audit only caught the coverage lie (37 states -> $0); the 5 "supported" states AND federal are themselves stale. Decision: full fidelity (implement the >$1M tiers too). Official 2024 values + source URLs are in `11-RESEARCH.md`.

- [ ] **PAYSTUB-05**: Federal 2024 income-tax brackets are corrected to the official IRS values for all filing statuses (code currently holds 2023 values labeled 2024). SS wage base / FICA / Medicare are already correct and must stay. (IRS Rev. Proc. 2023-34)
- [ ] **PAYSTUB-06**: CA 2024 brackets are corrected to official FTB values for all schedules, including the 1% Mental Health Services surtax on income over $1M. (CA FTB 2024 540 schedules)
- [ ] **PAYSTUB-07**: NY 2024 brackets are corrected to official DTF values for all schedules, including the 9.65% / 10.3% / 10.9% high-income brackets in effect since 2021. (NY DTF IT-201-I 2024)
- [ ] **PAYSTUB-08**: MA rate is corrected from the stale `0.0535` to the flat 5.0% in effect since 2020, including the 4% surtax on income over $1,053,750. (Mass.gov DOR)
- [ ] **PAYSTUB-09**: The paystub UI describes its output as an "estimate", not "accurate" tax. Methodology taxes gross with no W-4 / standard deduction / pre-tax deductions / credits, so it is not real withholding (IRS Pub 15-T); copy must not over-promise and must be em/en-dash free. (Methodology finding)
- [ ] **PAYSTUB-10**: A stale or shared URL state code (e.g. `?state=AL`, persisted via nuqs) cannot reach the defensive `$0` path. The URL-restored state is intersected with the supported state codes so an unsupported value resolves to a supported default / clear signal, never a silent $0. (nuqs passes parseable values through unchanged; validation is the only gate.)

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
- **PAYSTUB-F2**: Add 2025 (and 2026) federal + state tax tables once official tables are published, so the selectable year set can advance past 2024.

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
| PAYSTUB-05 | Phase 11 | Pending |
| PAYSTUB-06 | Phase 11 | Pending |
| PAYSTUB-07 | Phase 11 | Pending |
| PAYSTUB-08 | Phase 11 | Pending |
| PAYSTUB-09 | Phase 11 | Pending |
| PAYSTUB-10 | Phase 11 | Pending |
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
- v6 requirements: 21 total
- Mapped to phases: 21 (Phases 11-16)
- Unmapped: 0

---
*Requirements defined: 2026-06-01*
*Last updated: 2026-06-01 — Phase 11 expanded with PAYSTUB-05..10 after official-source tax-data verification (full-fidelity correction)*
