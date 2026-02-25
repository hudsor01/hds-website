# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v3.1 — Biome Migration

**Shipped:** 2026-02-25
**Phases:** 3 | **Plans:** 3 | **Sessions:** 1

### What Was Built

- Biome 2.4.4 installed with exact pin, hand-crafted biome.json covering lint/format/CSS/React/Next.js domains — 263 source files cleaned of import violations in one sweep
- All developer tooling migrated to Biome: package.json scripts, lefthook pre-commit staged-files hook, CI workflow, VSCode format-on-save
- ESLint, eslint-config-next, prettier and all transitive deps removed; all config files deleted (eslint.config.mjs, .prettierrc.json, .prettierignore) — zero residual npm audit surface
- All verification gates passed: 360 unit tests, 139 static pages, 0 TypeScript errors, 0 Biome violations

### What Worked

- **Research-first phase planning:** Detailed CONTEXT.md with locked decisions before execution prevented mid-execution pivots (especially important for the lefthook `{staged_files}` vs `--staged` decision)
- **Phase 53 as the de facto format sweep:** Running `bunx biome check src/ --write` in Phase 53 meant Phase 54's format sweep was a confirmed no-op — cleaner git history, no duplicate churn
- **3-phase structure was exactly right:** Install → Wire → Remove maps perfectly to the migration risk profile; each phase could be validated before proceeding
- **Exact version pin (`-E` flag):** Zero peer dependency conflicts; Biome's monorepo structure means exact pins are reliable

### What Was Inefficient

- **biome migrate eslint not usable:** The cyclic reference in eslint-config-next (issue #2935, closed-not-planned) meant hand-tuning biome.json was required. Worth checking in future migrations whether this is fixed.
- **15 recommended rules disabled:** These fired on clean code with no ESLint equivalents. The time spent tuning could have been reduced by a Biome 2.x migration guide specific to Next.js projects.

### Patterns Established

- **Biome exact pin pattern:** `bun add -d -E @biomejs/biome@2.4.4` — no peer deps, deterministic
- **Three unused-vars rules required:** `noUnusedVariables` + `noUnusedFunctionParameters` + `noUnusedImports` (all three needed; no single rule covers all cases)
- **`useBlockStatements` is NOT in Biome recommended** — must be added explicitly to style group for curly-brace enforcement
- **lefthook integration:** `bunx biome check --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {staged_files}` — the lefthook variable syntax, not the Biome `--staged` flag
- **VSCode markdown formatter:** Set to `null` + `formatOnSave: false` after Prettier removal to prevent "formatter not found" errors

### Key Lessons

1. **Do the linter sweep in the install phase, not the "sweep" phase.** Running `biome check --write` in Phase 53 made Phase 54 a no-op. Design migration milestones so the "reformat" commit is just the first clean lint run, not a dedicated phase.
2. **Rule gap analysis is required for production migrations.** Document accepted gaps (no-duplicate-imports, react-hooks/set-state-in-effect) explicitly — they are knowable before execution and should not be surprises.
3. **Biome's recommended ruleset fires on legitimate patterns.** Expect to disable ~10-20 rules on a Next.js/React/TypeScript codebase. This is normal and not a failure of the migration.

### Cost Observations

- Sessions: 1 (all 3 phases executed in a single session)
- Notable: 3-phase migration completed in ~2.5 hours total execution time; pre-research eliminated all major decision points from execution

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Duration | Key Change |
|-----------|--------|----------|------------|
| v1.0 | 10 | 20 days | Established baseline cleanup workflow |
| v2.0 | 9 | 1 day | Parallel audit agents → comprehensive codebase map |
| v3.0 | 7 | 1 day | Gap closure phases added after audit |
| v3.1 | 3 | 1 day | Single-session migration with locked pre-decisions |

### Cumulative Quality

| Milestone | Unit Tests | Static Pages | Key Metric |
|-----------|------------|--------------|------------|
| v1.0 | 334 | ~100 | 45% fewer deps (130 → 72) |
| v2.0 | 329 | 129 | 14 orphaned API routes deleted |
| v3.0 | 360 | 139 | 75 location pages, E2E journey tests |
| v3.1 | 360 | 139 | Zero ESLint/Prettier npm surface |

### Top Lessons (Verified Across Milestones)

1. **Locked decisions in CONTEXT.md before execution pay off.** Every milestone where we pre-decided contentious issues (auth removal, format sweep timing, lefthook variable syntax) ran smoothly. Every deviation from this added rework.
2. **One-day phases are achievable when scope is well-defined.** v2.0, v3.0, and v3.1 each shipped in 1 day. The common factor: narrow phase scope with explicit success criteria.
3. **Gap closure is always needed after major milestones.** v3.0 required Phases 51-52 for retroactive verification. Build gap closure into milestone planning rather than treating it as a surprise.
