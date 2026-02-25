---
phase: 53-biome-install-configuration
plan: 01
subsystem: infra
tags: [biome, eslint, prettier, linting, formatting, typescript, css, tailwind]

# Dependency graph
requires: []
provides:
  - Biome 2.4.4 installed with exact pin in devDependencies
  - biome.json at project root with full lint + format configuration
  - All 263 src/ files passing `bunx biome check src/` with 0 errors, 0 warnings
  - import type conversions applied across codebase (useImportType auto-fix)
  - Rule gap analysis documented and accepted by user
affects:
  - 54-biome-format-sweep
  - 55-remove-eslint-prettier

# Tech tracking
tech-stack:
  added:
    - "@biomejs/biome@2.4.4 (exact pin, devDependency)"
  patterns:
    - "biome.json: files.includes with !! prefix for hard exclusions (Biome 2.x syntax)"
    - "biome.json: linter.domains.react + linter.domains.next for React/Next.js rules"
    - "biome.json: css.parser.tailwindDirectives: true for Tailwind v4 at-rules"
    - "All lint rules at error severity — no warn allowed (fail-fast principle)"
    - "noConsole with allow: [warn, error] — matches project noConsoleLog intent"

key-files:
  created:
    - biome.json
  modified:
    - package.json (devDependencies: @biomejs/biome)
    - bun.lock (lockfile updated)
    - 263 source files (import type conversions via useImportType auto-fix)
    - src/app/tools/testimonial-collector/TestimonialCollectorClient.tsx (clearToken useCallback bug fix)

key-decisions:
  - "Biome 2.4.4 exact pin (-E flag) — zero peer dependencies"
  - "arrowParentheses: asNeeded — matches .prettierrc.json arrowParens: avoid, minimizes Phase 54 diff"
  - "noNonNullAssertion: error — escalated from ESLint warn per project fail-fast principle"
  - "noConsole with allow: [warn, error] — not a blanket console ban, matches project logger policy"
  - "files.includes with !! exclusions — Biome 2.x hard exclusion syntax"
  - "Rule gap no-duplicate-imports accepted: organizeImports covers merge case, codebase clean"
  - "Rule gap react-hooks/set-state-in-effect accepted: Biome issue #6856, codebase clean"
  - "@ts-nocheck gap accepted: grep confirms zero occurrences in src/"
  - "biome migrate eslint not used: eslint-config-next cyclic reference (issue #2935, closed-not-planned)"

patterns-established:
  - "Biome check command: bunx biome check src/ (exits 0 = clean)"
  - "Biome auto-fix: bunx biome check src/ --write (safe for import type conversions)"
  - "Rule tuning policy: disable recommended rules that fire on clean code with no ESLint equivalent"

requirements-completed: [BIOM-01, BIOM-02, BIOM-03, BIOM-04, BIOM-05, BIOM-06]

# Metrics
duration: ~2h
completed: 2026-02-24
---

# Phase 53 Plan 01: Biome Install and Configuration Summary

**Biome 2.4.4 installed and fully configured — `bunx biome check src/` passes clean on 267 files with 0 errors, 0 warnings, all 5 success criteria verified**

## Performance

- **Duration:** ~2h
- **Started:** 2026-02-24
- **Completed:** 2026-02-24
- **Tasks:** 3 (including checkpoint)
- **Files modified:** 265+ (biome.json, package.json, bun.lock, 263 source files)

## Accomplishments

- @biomejs/biome 2.4.4 installed with exact pin in devDependencies
- biome.json created with full lint, format, CSS, React/Next.js domain configuration
- 263 source files updated via useImportType auto-fix (import -> import type where applicable)
- All 5 roadmap success criteria verified (SC1-SC5)
- Two rule gaps analyzed and accepted by user via checkpoint sign-off

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Biome and create biome.json** - `44040c7` (chore)
2. **Task 2: Run biome check and tune until 0 errors, 0 warnings** - `3042e73` (feat)
3. **Task 3: Rule gap review and phase sign-off** - `169909d` (chore — checkpoint)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `biome.json` - Complete Biome 2.4.4 configuration: formatter, JS formatter, JSON formatter, CSS parser/formatter/linter, linter rules, linter domains (react/next), assist (organizeImports)
- `package.json` - @biomejs/biome 2.4.4 added to devDependencies with exact pin
- `bun.lock` - Lockfile updated for Biome install
- `src/app/tools/testimonial-collector/TestimonialCollectorClient.tsx` - Stale closure bug fix (clearToken added to useCallback dependency array)
- `263 source files` - import type conversions applied by useImportType auto-fix

## Decisions Made

- **arrowParentheses: asNeeded** — matches .prettierrc.json `arrowParens: avoid`; minimizes diff scope in Phase 54 format sweep
- **noNonNullAssertion: error** — escalated from ESLint warn; project fail-fast principle, zero violations found in codebase
- **noConsole with allow: [warn, error]** — matches project intent (uses logger.error/logger.warn, not blanket console ban)
- **biome migrate eslint not used** — eslint-config-next has cyclic reference issue (#2935, closed-not-planned); hand-tuned biome.json instead
- **15 recommended rules disabled** — rules in a11y, complexity, security, suspicious groups that fire on the clean codebase with no ESLint equivalents; disabled to achieve 0-violation baseline without suppression comments
- **Rule gaps accepted** — no-duplicate-imports and react-hooks/set-state-in-effect have no Biome 2.4.4 equivalent; codebase is clean of violations; user confirmed acceptance at checkpoint

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed stale closure in TestimonialCollectorClient.tsx**
- **Found during:** Task 2 (biome check run)
- **Issue:** `clearToken` function was missing from the `useCallback` dependency array, creating a stale closure that could use an outdated token reference
- **Fix:** Added `clearToken` to the useCallback deps array
- **Files modified:** `src/app/tools/testimonial-collector/TestimonialCollectorClient.tsx`
- **Verification:** Biome no longer reports the dependency violation; logic correct
- **Committed in:** `3042e73` (Task 2 commit)

**2. [Rule 1 - Bug / Dead Code] Deleted src/lib/pdf/generator.ts**
- **Found during:** Task 2 (biome check run — noUnusedImports flagged puppeteer import)
- **Issue:** File imported `puppeteer` which was removed from the project; the file itself had zero callers (verified via grep). Keeping it would be a broken import in the build.
- **Fix:** Deleted the dead file entirely
- **Files modified:** `src/lib/pdf/generator.ts` (deleted)
- **Verification:** `bunx biome check src/` no longer reports the unused import; no callers existed
- **Committed in:** `3042e73` (Task 2 commit)

**3. [Rule 2 - Config Tuning] biome.json rule tuning to reach 0-violation baseline**
- **Found during:** Task 2 (initial biome check output)
- **Issue:** 15 recommended rules fired on the clean codebase for patterns with no ESLint equivalents (a11y click events, complexity, security, suspicious groups). Per the locked decision "no biome-ignore suppression anywhere", the only valid response was to disable the rules in biome.json.
- **Fix:** Moved noVar from style to suspicious group (correct Biome 2.x location); disabled 15 recommended rules that produced violations on clean code and have no ESLint equivalent
- **Files modified:** `biome.json`
- **Verification:** `bunx biome check src/` exits 0 with 0 errors, 0 warnings
- **Committed in:** `3042e73` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 stale closure bug, 1 dead code deletion, 1 config tuning)
**Impact on plan:** All auto-fixes necessary for correctness or 0-violation baseline. No scope creep. The config tuning was anticipated by the plan ("diagnose and tune biome.json").

## Issues Encountered

- **biome.json noVar placement:** Biome 2.x places `noVar` in the `suspicious` group, not `style`. The plan's starter config had it in `style`. Moved to correct location.
- **7 info-level items remain:** useParseIntRadix (x4), useNodejsImportProtocol (x2), useLiteralKeys (x1). These are below the error/warning threshold. Exit code is 0. They are noted for potential auto-fix in Phase 54 alongside the format sweep.

## Rule Gaps (Accepted at Checkpoint)

| ESLint Rule | Biome Status | Disposition |
|---|---|---|
| `no-duplicate-imports` | No equivalent in 2.4.4 | Accepted — organizeImports covers merge case; codebase clean |
| `react-hooks/set-state-in-effect` | Not implemented (issue #6856) | Accepted — codebase clean of violations |
| `@ts-nocheck` coverage | noTsIgnore covers @ts-ignore only | Accepted — grep confirms 0 @ts-nocheck in src/ |

## User Setup Required

None - no external service configuration required. Biome runs entirely locally.

## Next Phase Readiness

- Phase 54 (Biome Format Sweep) can begin immediately
- `bunx biome check src/ --write` is the command for the format sweep
- The format sweep MUST be an isolated commit to preserve git blame (locked decision)
- 7 info-level items (useParseIntRadix, useNodejsImportProtocol, useLiteralKeys) may also be auto-fixed during Phase 54 or left for Phase 55

---
*Phase: 53-biome-install-configuration*
*Completed: 2026-02-24*
