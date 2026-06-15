---
phase: 15-dead-code-cleanup
plan: 01
subsystem: cleanup
tags: [dead-code, typescript, logger, ttl-calculator, help-articles, refactor]

# Dependency graph
requires:
  - phase: v6-audit
    provides: v6-AUDIT-FINDINGS (findings #5, #6 + CLEANUP bucket -> CLEAN-01..03)
provides:
  - "notifications.ts free of the trailing dangling Test notification endpoints JSDoc"
  - "HelpArticle interface + mapper with no phantom order_index field"
  - "Logger interface + BaseLogger with no unused group/groupEnd/table no-ops"
  - "contact-welcome PARAGRAPH_STYLE.whiteSpace retained, documented as intentional inert-but-defensive"
  - "TTLResults contract and all consumers free of the vestigial always-0 processingFees field"
affects: [16-noop-cleanup, future-audits]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two-file interface/impl deletion: when removing a member from a class that `implements` an interface, delete the interface signature in the same change to avoid TS2420"

key-files:
  created:
    - .planning/phases/15-dead-code-cleanup/15-01-SUMMARY.md
  modified:
    - src/lib/notifications.ts
    - src/lib/help-articles.ts
    - src/lib/logger.ts
    - src/types/logger.ts
    - src/emails/contact-welcome.tsx
    - src/lib/ttl-calculator/calculator.ts
    - src/types/ttl-types.ts
    - src/app/(public)/actions/ttl-calculator.tsx
    - src/components/calculators/Calculator.tsx
    - tests/unit/calculator-store.test.ts

key-decisions:
  - "CLEAN-03c: chose the research-confirmed removal path over KEEP+clarify because processingFees is always 0 and never rendered; the real fee is already folded into registrationFees via PROCESSING_FEE"
  - "CLEAN-03a: edited both logger.ts and types/logger.ts in one commit to keep BaseLogger implements Logger valid (no TS2420)"
  - "CLEAN-03b: kept whiteSpace and rewrote the comment dash-free, removing the pre-existing em-dash to comply with CLAUDE.md no-dash rule"

patterns-established:
  - "Pure-subtraction cleanups verified by grep + typecheck + build + unit gate, not new behavioral assertions"

requirements-completed: [CLEAN-01, CLEAN-02, CLEAN-03]

# Metrics
duration: ~12min
completed: 2026-06-02
---

# Phase 15 Plan 01: Dead Code Cleanup Summary

**Removed three dead symbols (dangling JSDoc, phantom HelpArticle.order_index, three unused logger no-ops) and the vestigial always-0 processingFees field across the TTLResults contract and all 5 consumer sites, while keeping and documenting contact-welcome whiteSpace as intentional defensive styling. Zero behavior change, all gates green.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-06-02T17:06:00Z (approx)
- **Completed:** 2026-06-02T17:19:00Z (approx)
- **Tasks:** 3 (2 edit tasks + 1 verification-only gate)
- **Files modified:** 10 source/test files

## Accomplishments
- CLEAN-01: deleted the trailing dangling `/** Test notification endpoints */` JSDoc from `notifications.ts` (no phantom function added, YAGNI honored).
- CLEAN-02: removed the phantom `order_index` from both the `HelpArticle` interface and `mapHelpArticle` (no backing `help_articles` column, zero readers).
- CLEAN-03a: removed the unused `group`/`groupEnd`/`table` no-ops from `BaseLogger` and the `Logger` interface in the same commit, avoiding the TS2420 interface/impl trap.
- CLEAN-03b: kept `PARAGRAPH_STYLE.whiteSpace` and rewrote its comment to mark it intentional inert-but-defensive styling (also dropped a pre-existing em-dash from the comment).
- CLEAN-03c: removed the vestigial always-0, never-rendered `processingFees` field at all 6 occurrences across 5 files (calculator const + return, TTLResults field, action Zod schema, Calculator.tsx comparison copy, and the calculator-store test assertion).

## Task Commits

Each task was committed atomically with hooks (no --no-verify):

1. **Task 1: Pure deletions (CLEAN-01, CLEAN-02, CLEAN-03a) + CLEAN-03b comment** - `447527ca` (refactor)
2. **Task 2: Remove vestigial processingFees across 5 sites (CLEAN-03c)** - `b7d7ce5e` (refactor)
3. **Task 3: Full phase gate** - verification-only, no commit

**Plan metadata:** (final docs commit captures this SUMMARY.md + STATE.md + ROADMAP.md)

## Files Created/Modified
- `src/lib/notifications.ts` - removed trailing dangling JSDoc stub
- `src/lib/help-articles.ts` - removed `order_index` from interface and mapper
- `src/lib/logger.ts` - removed `group`/`groupEnd`/`table` no-op method bodies from `BaseLogger`
- `src/types/logger.ts` - removed the matching `group`/`groupEnd`/`table` members + their comment lines from the `Logger` interface
- `src/emails/contact-welcome.tsx` - kept `whiteSpace: 'pre-wrap'`, rewrote comment as intentional inert-but-defensive (dash-free)
- `src/lib/ttl-calculator/calculator.ts` - removed `const processingFees = 0` + comment and the returned `processingFees` member
- `src/types/ttl-types.ts` - dropped `processingFees: number` from `TTLResults`
- `src/app/(public)/actions/ttl-calculator.tsx` - dropped `processingFees: z.number().optional()` from the `ttlResults` schema
- `src/components/calculators/Calculator.tsx` - dropped the `processingFees` copy line in the comparison-vehicle `ttl` object
- `tests/unit/calculator-store.test.ts` - dropped the `processingFees: 50` assertion from the `TTLResults` literal
- `.planning/phases/15-dead-code-cleanup/15-01-SUMMARY.md` - this summary

## Decisions Made
- **CLEAN-03c removal vs. KEEP:** Took the discretion removal path. Research confirmed `processingFees` is always 0 and never rendered (`ResultsPanel`/`ComparisonView` render no processing-fee row), and the real fee is already folded into `registrationFees`. Removal is research-confirmed clean and required only the single documented test edit.
- **CLEAN-03a two-file edit:** Both `logger.ts` and `types/logger.ts` changed in the same commit so `class BaseLogger implements Logger` stays valid (no TS2420).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed a pre-existing em-dash from the contact-welcome comment**
- **Found during:** Task 1 (CLEAN-03b comment tightening)
- **Issue:** The existing PARAGRAPH_STYLE comment contained an em-dash ("may ignore this property —"), which violates the CLAUDE.md project-wide no em/en-dash rule. The plan asked to keep the comment dash-free.
- **Fix:** Rewrote the entire comment block dash-free while preserving the Outlook-normalization caveat and adding the intentional-defensive framing.
- **Files modified:** src/emails/contact-welcome.tsx
- **Verification:** lint + typecheck pass; comment contains no U+2013/U+2014.
- **Committed in:** 447527ca (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug fix - comment dash compliance)
**Impact on plan:** Minimal. The dash removal was an expected part of the dash-free comment rewrite the plan requested; no scope creep.

## Issues Encountered
- **`bun run test:unit` script wrapper failure:** Invoking the npm script `bun run test:unit` through the shell wrapper raised a `Cannot find module .../bun` error (node/pkg resolution quirk from the shell `bun` function wrapper). Resolved by running the underlying command directly via the absolute binary `~/.bun/bin/bun test tests/`. The test result is authoritative: 969 pass / 21 fail. This is a shell-environment quirk, not a code issue.

## Phase Gate Result
- `bun run lint` - PASS (Biome checked 408 files, no fixes applied)
- `bun run typecheck` - PASS (tsc --noEmit, no diagnostics)
- `bun run build` - PASS (exit 0, full route table prerendered)
- `bun test tests/` (test:unit) - 969 pass / 21 fail. The 21 failures are the documented pre-existing baseline (HomePage structural assertions + Navbar/Footer/Navigation cross-file RTL pollution in homepage.test.tsx + navigation.test.tsx). ZERO net-new failures; no failure references any symbol removed by this phase (verified: no processingFees/order_index/logger.group/Test-notification reference in failure output). This phase touched none of those files.

## Verification (all green)
- `! grep -n "Test notification endpoints" src/lib/notifications.ts` - PASS (CLEAN-01)
- `! grep -n "order_index" src/lib/help-articles.ts` - PASS (CLEAN-02)
- logger no-ops gone from BOTH src/lib/logger.ts AND src/types/logger.ts; typecheck green proves no TS2420 (CLEAN-03a)
- `whiteSpace: 'pre-wrap'` still present in contact-welcome.tsx with a tightened intentional-defensive comment (CLEAN-03b)
- `! grep -rn "processingFees" src/ tests/ e2e/` - PASS; typecheck green; calculator-store test passes (13 pass) (CLEAN-03c)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Dead-code subtraction for CLEAN-01..03 complete; build and types green.
- Phase 16 (NOOP-01, intentional env-gated no-ops) remains separate and untouched, as scoped.

## Self-Check: PASSED

- All 10 modified files + the SUMMARY.md exist on disk.
- Both task commits (`447527ca`, `b7d7ce5e`) exist in git history.
- No em/en-dash present in the touched contact-welcome.tsx comment.

---
*Phase: 15-dead-code-cleanup*
*Completed: 2026-06-02*
