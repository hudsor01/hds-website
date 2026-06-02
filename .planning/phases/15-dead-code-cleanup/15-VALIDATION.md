---
phase: 15
slug: dead-code-cleanup
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-02
---

# Phase 15 — Validation Strategy

> Per-phase validation contract. Derived from 15-RESEARCH.md. This is deletion + 2 documentation edits; verification is grep + typecheck + build green + no-behavior-change (honest: deletions have little positive unit-test surface; the guard is "nothing references the removed symbols and the suite stays green").

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bun:test |
| **Quick run command** | `bun run typecheck` (catches any dangling reference to a removed symbol) |
| **Gates** | `bun run lint && bun run typecheck && bun run test:unit && bun run build` |

---

## Sampling Rate

- **After each deletion:** `bun run typecheck` (immediately catches a missed consumer / the logger interface TS2420).
- **Before verify:** full gate chain green; `bun run test:unit` shows no net-new failures beyond the documented pre-existing baseline.

---

## Per-Requirement Verification Map

| Requirement | Correct Behavior | Test Type | Automated Command | Status |
|-------------|------------------|-----------|-------------------|--------|
| CLEAN-01 | Dangling `Test notification endpoints` JSDoc gone from `notifications.ts` | source grep | `! grep -n "Test notification endpoints" src/lib/notifications.ts` | ⬜ pending |
| CLEAN-02 | `order_index` gone from `HelpArticle` interface + `mapHelpArticle` | source grep + typecheck | `! grep -n "order_index" src/lib/help-articles.ts` + `bun run typecheck` | ⬜ pending |
| CLEAN-03a | logger `group`/`groupEnd`/`table` removed from BOTH `logger.ts` AND the `Logger` interface in `types/logger.ts` (no TS2420) | source grep + typecheck | `! grep -nE "group|groupEnd|table" src/lib/logger.ts src/types/logger.ts` (scoped to the no-op methods) + `bun run typecheck` | ⬜ pending |
| CLEAN-03b | `contact-welcome` whiteSpace KEPT, comment clarifies it is intentional defensive styling (currently inert) | source assertion | read the comment; whiteSpace still present | ⬜ pending |
| CLEAN-03c | `processingFees` removed across calculator.ts / ttl-types.ts / action / Calculator.tsx; `calculator-store.test.ts` assertion dropped; typecheck green | source grep + typecheck + unit | `! grep -rn "processingFees" src/` + `bun run typecheck` + `bun test tests/unit/calculator-store.test.ts` | ⬜ pending |

---

## Wave 0 Requirements

- No new test infra. The only test edit is dropping the `processingFees: 50` assertion in `tests/unit/calculator-store.test.ts:52` (CLEAN-03c removal). No test references the CLEAN-01/-02/-03a deleted symbols (research-confirmed).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| TTL calculator output unchanged after removing the never-rendered `processingFees` field | CLEAN-03c | UI is the proof it was never displayed | Load `/tools/...` TTL calculator; confirm the results/comparison render identically (no missing/added row) |

---

## Validation Sign-Off

- [x] All tasks have automated verify (grep/typecheck/build) or are manual-by-nature
- [x] Sampling continuity: typecheck after each deletion
- [x] Wave 0: only the one processingFees test-assertion edit
- [x] No watch-mode flags
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-02 (deletions + 1 doc edit; verification is grep/typecheck/build + no behavior change per research)
