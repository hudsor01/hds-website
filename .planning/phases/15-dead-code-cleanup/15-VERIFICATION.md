---
phase: 15-dead-code-cleanup
verified: 2026-06-02T18:05:00Z
status: passed
score: 3/3 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: none
  previous_score: none
---

# Phase 15: dead-code-cleanup Verification Report

**Phase Goal:** The codebase carries no dead or dangling surface that implies behavior it does not have. Phantom fields, dangling stub comments, and verified-unused no-op methods are removed (or, where call-site analysis shows a reason to keep, documented with a clear comment). (CLEAN-01, CLEAN-02, CLEAN-03)
**Verified:** 2026-06-02T18:05:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                                              | Status     | Evidence                                                                                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | CLEAN-01: dangling `Test notification endpoints` JSDoc removed from end of `notifications.ts`                     | ✓ VERIFIED | `grep -n "Test notification endpoints" src/lib/notifications.ts` → no match. File now ends on the Discord/Slack result-handling block. Diff `447527ca` shows removal of the 4-line dangling JSDoc. |
| 2   | CLEAN-02: phantom `HelpArticle.order_index` removed from BOTH interface and `mapHelpArticle`; no consumer breaks | ✓ VERIFIED | `grep -n "order_index" src/lib/help-articles.ts` → none. `grep -rn "order_index" src/` → none (zero readers). `content.ts` schema has no `order_index` column. Queries order by `createdAt`. Diff `447527ca`: `-2` lines. |
| 3   | CLEAN-03: each cleanup-bucket no-op resolved by call-site check (logger no-ops removed; whiteSpace documented+kept; processingFees removed) | ✓ VERIFIED | See CLEAN-03a/b/c breakdown below. Typecheck green (no TS2420), build green, calculator-store test green. |

**Score:** 3/3 truths verified

#### CLEAN-03 sub-item detail

- **CLEAN-03a (logger no-ops REMOVE — two files):** `grep -nE "^\s*(group|groupEnd|table)\s*[\(:]" src/lib/logger.ts` → no method defs. `src/types/logger.ts` → no `group`/`groupEnd`/`table` members. Diff `447527ca` removed the 3 no-op bodies from `BaseLogger` (lines using `unknown`, not `any`) AND the 3 matching `Logger` interface members in the same commit. `class BaseLogger implements Logger` still present at `logger.ts:139`; `bun run typecheck` exit 0 confirms no TS2420. Zero callers: `grep -rnE "\.(group|groupEnd|table)\(" src/ tests/ e2e/` → none. (Two logger.ts grep hits at lines 72/183 are the word "grouping"/"table" inside unrelated comments — false positives.)
- **CLEAN-03b (whiteSpace KEEP + document):** `whiteSpace: 'pre-wrap' as const` still present at `contact-welcome.tsx:32`; `PARAGRAPH_STYLE` still applied to `<Text>` at line 49. Lines 19-26 carry a clear "Intentional defensive styling, currently inert... do not remove it" comment, rewritten dash-free (the pre-existing em-dash was removed). NOT removed — correct disposition.
- **CLEAN-03c (processingFees REMOVE — discretionary path):** `grep -rn "processingFees" src/ tests/ e2e/` → zero matches across all 5 sites + test. Diff `b7d7ce5e` removed: action Zod field, Calculator.tsx copy line, `const processingFees = 0` + comment + returned field in calculator.ts, `TTLResults.processingFees`, and the `processingFees: 50` test assertion. REQUIREMENTS.md / ROADMAP SC explicitly permit "removed or given a clear comment", so this is within contract. Real fee (`PROCESSING_FEE = 4.75`) remains folded into `registrationFees` via `calculateRegistrationFee` — no behavior change. `calculator-store.test.ts`: 13 pass / 0 fail.

**Note on SUMMARY vs CONTEXT divergence:** CONTEXT.md listed CLEAN-03c as "KEEP+clarify"; SUMMARY took the "REMOVE" path. Both ROADMAP success criterion 3 and REQUIREMENTS.md CLEAN-03 explicitly allow either ("verified and removed **or** given a clear comment"). The removal is research-confirmed clean (always-0, never-rendered, real fee folded into registrationFees) and leaves typecheck/build/tests green. Within contract — not a gap.

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/lib/notifications.ts` | No trailing dangling JSDoc | ✓ VERIFIED | Ends on result-handling block; -4 lines in `447527ca` |
| `src/lib/help-articles.ts` | No `order_index` (interface + mapper) | ✓ VERIFIED | -2 lines; zero readers anywhere in src/ |
| `src/lib/logger.ts` | No `group`/`groupEnd`/`table` bodies | ✓ VERIFIED | -14 lines; `implements Logger` intact |
| `src/types/logger.ts` | No matching interface members | ✓ VERIFIED | -7 lines; typecheck green (no TS2420) |
| `src/emails/contact-welcome.tsx` | `whiteSpace` KEPT + clear comment | ✓ VERIFIED | Line 32 present, applied to `<Text>`; dash-free comment |
| `src/lib/ttl-calculator/calculator.ts` | `processingFees` removed | ✓ VERIFIED | -4 lines; PROCESSING_FEE still in registrationFees |
| `src/types/ttl-types.ts` | `processingFees` field dropped | ✓ VERIFIED | -1 line |
| `src/app/(public)/actions/ttl-calculator.tsx` | optional schema field dropped | ✓ VERIFIED | -1 line |
| `src/components/calculators/Calculator.tsx` | copy line dropped | ✓ VERIFIED | -1 line |
| `tests/unit/calculator-store.test.ts` | `processingFees: 50` assertion dropped | ✓ VERIFIED | -1 line; suite 13/13 green |

### Key Link Verification

No cross-module wiring links to verify — this is a pure-subtraction phase. The relevant "link" integrity check is that `BaseLogger implements Logger` stays valid after the two-file deletion: VERIFIED via `bun run typecheck` exit 0 (no TS2420).

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Typecheck clean (proves no TS2420 from two-file logger edit) | `bun run typecheck` | exit 0, no diagnostics | ✓ PASS |
| Production build clean (full route table incl. /tools/ttl-calculator) | `bun run build` | exit 0 | ✓ PASS |
| Calculator-store unit test green after processingFees removal | `bun test tests/unit/calculator-store.test.ts` | 13 pass / 0 fail | ✓ PASS |
| Full unit suite: only pre-existing failures, 0 net-new | `bun test tests/` | 969 pass / 21 fail | ✓ PASS |

**Full-suite failure analysis:** All 21 failures are the documented pre-existing baseline — Footer Component (RTL pollution at `Footer.tsx:51`), Navigation Accessibility + Navbar Polish (navigation.test.tsx), and HomePage structural assertions (homepage.test.tsx). None of those files were touched by Phase 15. `grep -iE "processingFees|order_index|logger.(group|groupEnd|table)|Test notification"` over the failure log → ZERO matches. 0 net-new failures attributable to this phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| CLEAN-01 | 15-01 | Dangling "Test notification endpoints" JSDoc removed | ✓ SATISFIED | Truth 1 |
| CLEAN-02 | 15-01 | Phantom `HelpArticle.order_index` removed (interface + mapper) | ✓ SATISFIED | Truth 2 |
| CLEAN-03 | 15-01 | Each no-op resolved by call-site check (logger removed; whiteSpace documented; processingFees removed) | ✓ SATISFIED | Truth 3 + sub-items 03a/03b/03c |

No orphaned requirements: REQUIREMENTS.md maps only CLEAN-01..03 to Phase 15, all claimed by plan 15-01.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| src/lib/logger.ts | 99, 184 | em-dash in code comment | ℹ️ Info | Pre-existing (introduced commit `b28d41a8`, not Phase 15). Developer-only code comments — exempt under CLAUDE.md no-dash rule. Not attributable to this phase. |

No debt markers (TBD/FIXME/XXX/TODO/HACK/PLACEHOLDER) introduced. No `any` types introduced (removed `table(_data: unknown)` used `unknown`). No em/en-dash in any touched user-facing string; the one user-adjacent comment (contact-welcome) was made dash-free by this phase. No stub patterns — phase is pure deletion + one comment rewrite, verified line-by-line in diffs `447527ca` and `b7d7ce5e`.

### Human Verification Required

None. Phase is pure subtraction with no user-visible behavior change (processingFees was always 0 and never rendered; whiteSpace retained unchanged). All claims verified programmatically via grep, diff inspection, typecheck, build, and unit tests.

### Gaps Summary

No gaps. All 3 ROADMAP success criteria and all 3 requirements (CLEAN-01, CLEAN-02, CLEAN-03) are satisfied in shipped code:
- The dangling JSDoc, phantom `order_index`, three logger no-ops (both files), and the vestigial `processingFees` chain are all removed and confirmed absent by grep.
- The intentionally-retained `whiteSpace: 'pre-wrap'` is present with a clear dash-free justifying comment.
- `BaseLogger implements Logger` remains valid (typecheck exit 0, no TS2420).
- Build exit 0; calculator-store test 13/13; full suite 969 pass / 21 fail with all 21 being the documented pre-existing baseline and ZERO net-new or symbol-referencing failures.

The SUMMARY/CONTEXT divergence on CLEAN-03c (KEEP-vs-REMOVE) is within the requirement contract, which explicitly permits either disposition; the chosen removal is research-confirmed clean and gate-verified.

---

_Verified: 2026-06-02T18:05:00Z_
_Verifier: Claude (gsd-verifier)_
