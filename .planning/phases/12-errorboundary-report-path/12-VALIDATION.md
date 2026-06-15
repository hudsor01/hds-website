---
phase: 12
slug: errorboundary-report-path
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-02
---

# Phase 12 — Validation Strategy

> Per-phase validation contract. Derived from 12-RESEARCH.md "Validation Architecture".

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bun:test (unit) + setupApiMocks pattern for route handlers |
| **Config file** | none — `tests/setup.ts` auto-mocks `@/env` and `@/lib/logger` |
| **Quick run command** | `bun test tests/unit/api-error-report.test.ts` |
| **Full suite command** | `bun run test:unit` |
| **Gates** | `bun run lint && bun run typecheck && bun run test:unit && bun run build` |

---

## Sampling Rate

- **After each task commit:** run the quick command for the file(s) touched (route test / ErrorBoundary test).
- **After the wave:** `bun run test:unit` + `bun run build`.
- **Before verify:** full gate chain green.
- **Max feedback latency:** ~20s.

---

## Per-Requirement Verification Map

| Requirement | Correct Behavior | Test Type | Automated Command | Status |
|-------------|------------------|-----------|-------------------|--------|
| ERR-01 (route) | `POST /api/error-report` validates the body (Zod), logs via `logger.error` (always-on), forwards to Sentry (env-gated), returns success; invalid body -> 400 | unit (success + invalid-body + logger/Sentry spy) | `bun test tests/unit/api-error-report.test.ts` | ⬜ pending |
| ERR-01 (guard) | Route uses `withMutationGuards(..., { rateLimit: 'api', csrf: false })` so a crashed-page report is not 403'd; same-origin check still applies | source assertion + handler test | grep + `bun test` | ⬜ pending |
| ERR-01 (client honesty) | ErrorBoundary `reportError` awaits the POST; `res.ok` -> `toast.success`, else `toast.error` + keep Copy-Details fallback; NO `alert()`; button disabled in-flight | unit (fetch+sonner mock) + grep | `bun test` + `! grep -n "alert(" src/components/utilities/ErrorBoundary.tsx` | ⬜ pending |
| ERR-01 (copy) | Toast/copy strings honest (never claim sent on failure) + em/en-dash free | source assertion + grep | grep U+2014/U+2013 | ⬜ pending |

---

## Wave 0 Requirements

- Existing infra covers it (bun:test + setupApiMocks pattern from `tests/unit/api-csp-reports.test.ts`). No new framework.
- Tests to ADD: `tests/unit/api-error-report.test.ts` (mirror csp-reports), optional `tests/unit/error-boundary-report.test.tsx`, and a grep gate that no `alert(` remains.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| A real render error shows the fallback, "Report Error" POSTs and toasts success (prod: report lands in `error_logs` / Sentry) | ERR-01 | ErrorBoundary catches render crashes; full path is a browser runtime + prod-DB behavior | Trigger a boundary error in dev; click Report Error; confirm a Sonner success toast and a server log entry; confirm failure path toasts error + Copy-Details still works |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (api-error-report test added)
- [x] No watch-mode flags
- [x] Feedback latency < 20s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-02 (derived from research; single-requirement phase)
