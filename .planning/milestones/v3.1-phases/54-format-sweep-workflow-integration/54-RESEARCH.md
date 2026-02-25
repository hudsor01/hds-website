# Phase 54: Format Sweep & Workflow Integration - Research

**Researched:** 2026-02-24
**Domain:** Biome CLI, Lefthook, VSCode extension, package.json scripts, GitHub Actions CI
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Format sweep:**
- Scope: `src/` only (root config files excluded from the isolated reformat commit)
- Run `bunx biome check src/ --write` — includes both formatting and organize-imports in a single pass
- The isolated format commit MUST be the first commit in the phase (before any script/hook/config changes)
- Commit message must be exactly: `chore: reformat codebase with biome`
- Phase lands on a phase-54 feature branch (branching_strategy: phase from config.json)

**Info-level items from Phase 53:**
- Fix all 7 info-level items (`useParseIntRadix` x4, `useNodejsImportProtocol` x2, `useLiteralKeys` x1) in Phase 54
- These go in a SEPARATE commit AFTER the isolated format sweep — not mixed into the reformat commit
- Commit message: `fix: apply biome info-level suggestions`

**Lefthook hooks:**
- Pre-commit hook: block on error (reject commit, report issues — do NOT auto-fix staged files)
- Scope: staged files only (`biome check --staged`)
- No pre-push hook — pre-commit is sufficient
- Read existing `lefthook.yml`, migrate any ESLint references to Biome, preserve all non-ESLint hooks
- Implementation must follow Biome's official documentation guidance for lefthook integration

**Package.json scripts:**
- `bun run lint` must invoke `biome check` (not `eslint`)
- `bun run format` must invoke `biome format --write` (not Prettier)
- Any `bun run lint:fix` or equivalent should use `biome check --write`
- Check all scripts that currently reference eslint/prettier and update them

**VSCode settings:**
- Update `.vscode/settings.json` — overwrite/merge as needed to align with Biome's official docs
- Enable `editor.formatOnSave: true` scoped to JS/TS/JSON/CSS file types
- Enable `editor.codeActionsOnSave` with `source.organizeImports` (Biome organise-imports)
- Set Biome extension as the default formatter for JS/TS/JSON/CSS
- Follow Biome's official VSCode integration documentation for all settings

**General principle:**
- All tooling decisions (lefthook config, VSCode settings, scripts) must align with Biome 2.4.4's official documentation and best practices — Claude should read the official docs when implementing

### Claude's Discretion

None identified — all key decisions are locked.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLEN-03 | Codebase reformatted by Biome in an isolated commit (preserves git blame usefulness) | Format sweep commit with `bunx biome check src/ --write` — see CRITICAL FINDING below |
| WKFL-01 | `package.json` lint and format scripts invoke Biome (not ESLint/Prettier) | Replace `"lint": "eslint ."` with `"lint": "biome check src/"` and add `"format": "biome format --write src/"` |
| WKFL-02 | Lefthook pre-commit hook lints staged files only with Biome (replaces slow full-repo ESLint scan) | Official Biome lefthook recipe with `{staged_files}` and `--no-errors-on-unmatched` |
| WKFL-03 | CI workflow runs Biome check (ESLint step renamed/replaced) | Rename "Run ESLint" step in `.github/workflows/ci.yml` to "Run Biome" with `bun run lint` |
| WKFL-04 | VSCode settings use Biome extension for format-on-save | Replace Prettier formatter references with `biomejs.biome` in `.vscode/settings.json` |

</phase_requirements>

## Summary

Phase 53 already completed the Biome installation, biome.json tuning, and **reformatted 264 source files** in the commit `feat(53-01): tune biome.json to 0 errors, 0 warnings` (commit 3042e73). Running `bunx biome check src/ --write` today produces zero changes to any src/ file — the codebase is already formatted by Biome's rules.

This has a direct impact on CLEN-03: the "isolated format commit" required by the success criteria will effectively be an empty commit if scoped to src/ only. The planner must address this — the most defensible approach is to still create the commit (confirming the sweep was a no-op is itself a valid sweep), or to acknowledge that the Phase 53 tuning commit served as the de facto format sweep.

The 7 remaining info-level items are ALL unsafe fixes (`useParseIntRadix` x4, `useNodejsImportProtocol` x2, `useLiteralKeys` x1). These require `--write --unsafe` and must go in a separate commit per CONTEXT.md decisions.

The non-format work (scripts, lefthook, CI, VSCode) is well-defined and straightforward. Biome's official docs provide exact configuration patterns for all four areas.

**Primary recommendation:** Address the empty format sweep issue explicitly in the plan — either scope the reformat commit to root-level files that Phase 53 didn't touch, or treat the Plan 53 tuning commit as the de facto CLEN-03 fulfillment and document this in SUMMARY.md. Then proceed with the 7 info fixes and all tooling changes as planned.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @biomejs/biome | 2.4.4 (exact pin) | Linter + formatter CLI | Already installed in Phase 53 |
| lefthook | (existing install) | Git hook manager | Already configured via `prepare: lefthook install` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Biome VSCode extension | `biomejs.biome` | Editor integration | formatOnSave, organizeImports |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `{staged_files}` lefthook pattern | `--staged` flag | `--staged` is Biome's own flag; `{staged_files}` is lefthook's variable — official docs recommend `{staged_files}` for lefthook integration |
| block on error only | auto-fix + stage_fixed | CONTEXT.md locked: block only, no auto-fix |

## Architecture Patterns

### Pattern 1: Lefthook Staged-Files Check (Block Only, No Auto-Fix)

**What:** Run `biome check` on staged files, block commit on errors, do NOT auto-fix.

**When to use:** Per CONTEXT.md decision — reject bad commits, don't silently fix them.

**Official Biome docs pattern (from https://biomejs.dev/recipes/git-hooks/):**

```yaml
pre-commit:
  commands:
    check:
      glob: "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}"
      run: npx @biomejs/biome check --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {staged_files}
```

**Project-specific adaptation (using bunx instead of npx):**

```yaml
pre-commit:
  commands:
    check:
      glob: "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}"
      run: bunx biome check --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {staged_files}
```

Note: `--no-errors-on-unmatched` silences errors when no files match the glob (e.g., commit with only .md files). This prevents false hook failures.

### Pattern 2: VSCode Settings (Official Biome 2.x Docs)

**Source:** https://biomejs.dev/reference/vscode/

The Biome VSCode extension ID is `biomejs.biome`.

```json
{
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "[jsonc]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

**Remove from existing settings.json:**
- All `"editor.defaultFormatter": "esbenp.prettier-vscode"` entries for JS/TS/JSON
- `"source.fixAll.eslint": "explicit"` from `editor.codeActionsOnSave`
- `"source.organizeImports": "explicit"` (generic) → replace with `"source.organizeImports.biome": "explicit"`
- `"eslint.validate"` and `"eslint.workingDirectories"` sections
- CSS formatter entry (CSS is excluded from Biome formatting per project decisions)

**Keep from existing settings.json:**
- All Deno settings, GitHub Copilot settings, TailwindCSS settings, TypeScript settings
- `"[markdown]"` formatter (keep Prettier for markdown or remove formatOnSave)
- All non-ESLint/non-Prettier settings

**Note on `biome.lspBin`:** The deprecated `biome.lspBin` has been replaced by `biome.lsp.bin`. For Bun-managed projects, the extension should auto-discover `./node_modules/.bin/biome`. No explicit `biome.lsp.bin` config should be needed, but if the extension fails to find Biome, add:
```json
"biome.lsp.bin": "./node_modules/.bin/biome"
```

### Pattern 3: Package.json Scripts Migration

**Current state:**
```json
"lint": "eslint .",
"test:all": "bun run lint && bun run typecheck && bun run test:unit && bun test:e2e:fast",
"test:ci": "bun run lint && bun run typecheck && bun run test:unit && bun test:e2e"
```

**Target state (per CONTEXT.md):**
```json
"lint": "biome check src/",
"lint:fix": "biome check src/ --write",
"format": "biome format --write src/"
```

`test:all` and `test:ci` already call `bun run lint` and will automatically use Biome after the `lint` script is updated. No changes needed to those scripts beyond updating `lint`.

### Pattern 4: CI Workflow Migration

**Current state in `.github/workflows/ci.yml`:**
```yaml
- name: Run ESLint
  run: bun run lint
```

**Target state:**
```yaml
- name: Run Biome
  run: bun run lint
```

Only the step name changes (from "Run ESLint" to "Run Biome"). The `bun run lint` command is unchanged — it will invoke Biome after the package.json script is updated. No other CI changes required.

## Critical Finding: Format Sweep Is Already Done

**The format sweep (CLEN-03) was implicitly completed in Phase 53.**

Verification:
```bash
bunx biome check src/ --write
# Output: Checked 267 files in 121ms. No fixes applied.
# Found 7 infos. (all unsafe — not applied by --write)
```

The commit `feat(53-01): tune biome.json to 0 errors, 0 warnings` (3042e73) reformatted 264 source files as part of tuning biome.json.

**Planning options for the planner:**

Option A (Recommended): Create the format sweep commit anyway — run `bunx biome check src/ --write` which will be a no-op, stage the result (nothing), and create the commit documenting the sweep. This preserves the intent of the process even if the diff is empty. Some git workflows allow empty commits (`git commit --allow-empty`).

Option B: Acknowledge CLEN-03 is already satisfied by Phase 53's 3042e73 commit, skip the format sweep commit, document this in the plan's SUMMARY.md, and proceed directly to the 7 info-level fixes.

Option C: Expand scope to include ALL files (not just src/) — run `bunx biome check --write` on the entire repo, which may produce changes in root-level config files. This is NOT recommended as it violates the CONTEXT.md decision to scope to `src/` only.

**Recommendation: Option B** — Document that CLEN-03 is satisfied by Phase 53. The success criterion says "A single standalone commit exists with message `chore: reformat codebase with biome` containing only formatting changes." This was effectively done in 3042e73 (which contained formatting changes, not just biome.json edits). The planner should verify whether to treat 3042e73 as the CLEN-03 commit or create a no-op empty commit.

## The 7 Info-Level Fixes

All 7 are unsafe fixes (info severity, not error/warning). Require `biome check src/ --write --unsafe`:

| File | Rule | Fix |
|------|------|-----|
| `src/app/tools/cost-estimator/CostEstimatorClient.tsx:254` | `useParseIntRadix` | `parseInt(e.target.value)` → `parseInt(e.target.value, 10)` |
| `src/app/tools/performance-calculator/PerformanceCalculatorClient.tsx:236` | `useParseIntRadix` | `parseInt(e.target.value)` → `parseInt(e.target.value, 10)` |
| `src/components/paystub/PaystubForm.tsx:194` | `useParseIntRadix` | `parseInt(value)` → `parseInt(value, 10)` |
| `src/components/paystub/PaystubNavigation.tsx:70` | `useParseIntRadix` | `parseInt(value)` → `parseInt(value, 10)` |
| `src/lib/auth/admin.ts:1` | `useNodejsImportProtocol` | `'crypto'` → `'node:crypto'` |
| `src/lib/testimonials.ts:7` | `useNodejsImportProtocol` | `'crypto'` → `'node:crypto'` |
| `src/lib/ttl-calculator/calculator.ts:76` | `useLiteralKeys` | `COUNTY_FEES['Default']` → `COUNTY_FEES.Default` |

Command: `bunx biome check src/ --write --unsafe`
Result: All 7 fixed, 0 errors, 0 warnings, 0 infos.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Staged files detection in pre-commit | Custom shell script | `{staged_files}` lefthook variable | Lefthook handles cross-platform staged file detection |
| File type filtering | Manual glob in shell | `--files-ignore-unknown=true` Biome flag | Biome natively ignores unsupported file types |
| Post-fix re-staging | Manual `git add` | `stage_fixed: true` lefthook option | Only needed if auto-fixing; CONTEXT.md says block-only |

**Key insight:** The CONTEXT.md decision to "block on error" (not auto-fix) means `stage_fixed: true` is NOT needed. The hook should only run `biome check` (read-only) and exit non-zero on issues.

## Common Pitfalls

### Pitfall 1: Using `--staged` vs `{staged_files}`
**What goes wrong:** Using `biome check --staged` instead of `{staged_files}` in lefthook config
**Why it happens:** Biome has a `--staged` flag but the official Biome docs for lefthook use `{staged_files}` (lefthook's variable substitution)
**How to avoid:** Use `{staged_files}` with the glob pattern per official docs. The `--staged` flag works differently (directly queries git index) vs lefthook's variable which passes file paths as arguments.
**Warning signs:** Hook runs but doesn't seem to check the right files

### Pitfall 2: Missing `--no-errors-on-unmatched`
**What goes wrong:** Pre-commit hook fails on commits with only .md or other non-JS/TS files
**Why it happens:** When no staged files match the glob pattern, Biome returns an error
**How to avoid:** Always include `--no-errors-on-unmatched` in pre-commit hooks with glob filters
**Warning signs:** `git commit` fails when committing only documentation changes

### Pitfall 3: `source.organizeImports` vs `source.organizeImports.biome`
**What goes wrong:** Keeping generic `"source.organizeImports": "explicit"` instead of Biome-specific version
**Why it happens:** The generic form may conflict with TypeScript's own organize-imports action
**How to avoid:** Use `"source.organizeImports.biome": "explicit"` for Biome-specific action
**Warning signs:** Imports get reorganized differently than expected on save

### Pitfall 4: Existing lefthook pre-push hook
**What goes wrong:** Leaving the existing pre-push hook that runs `bun run lint` (which will invoke Biome after migration)
**Why it happens:** CONTEXT.md says "No pre-push hook — pre-commit is sufficient"
**How to avoid:** Remove the entire `pre-push` section from `lefthook.yml`
**Warning signs:** Double-running lint on push (pre-commit + pre-push both run)

### Pitfall 5: Empty format sweep commit
**What goes wrong:** Attempting `git commit -m "chore: reformat codebase with biome"` with no staged changes fails
**Why it happens:** Phase 53 already reformatted all files, so `bunx biome check src/ --write` is a no-op
**How to avoid:** Per Critical Finding section — use `git commit --allow-empty` or acknowledge CLEN-03 is satisfied by 3042e73
**Warning signs:** `nothing to commit, working tree clean` after running `bunx biome check src/ --write`

### Pitfall 6: Lefthook `typecheck` command in pre-commit
**What goes wrong:** The existing lefthook pre-commit runs `bun run typecheck` — this takes 10-20 seconds on every commit
**Why it happens:** Was configured in Phase 53 era, but CONTEXT.md only requires Biome in the hook
**How to avoid:** CONTEXT.md decision is pre-commit runs Biome only; remove typecheck and test from pre-commit (they run in CI). This is a judgment call — the plan should preserve non-ESLint hooks unless CONTEXT.md explicitly says to remove them.
**Warning signs:** Slow commits

## Code Examples

### lefthook.yml (complete target state)

```yaml
# Lefthook configuration
# Documentation: https://github.com/evilmartians/lefthook

pre-commit:
  commands:
    check:
      glob: "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}"
      run: bunx biome check --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {staged_files}
    typecheck:
      glob: "*.{ts,tsx}"
      run: bun run typecheck
    test:
      run: bun run test:unit
```

Note: Per CONTEXT.md, "Read existing `lefthook.yml`, migrate any ESLint references to Biome, preserve all non-ESLint hooks." The existing file has `lint`, `typecheck`, and `test` commands. Replace the `lint` command (ESLint) with the Biome `check` command. Keep `typecheck` and `test` as-is. Remove the entire `pre-push` section.

### package.json scripts delta

```diff
-  "lint": "eslint .",
+  "lint": "biome check src/",
+  "lint:fix": "biome check src/ --write",
+  "format": "biome format --write src/",
```

### Applying the 7 unsafe fixes

```bash
bunx biome check src/ --write --unsafe
# Fixes all 7 info-level items in one pass
# Verify:
bunx biome check src/
# Expected: Checked 267 files. No fixes applied. (0 errors, 0 warnings, 0 infos)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `npx @biomejs/biome` in lefthook | `bunx biome` (project uses Bun) | Bun adoption | Faster hook execution |
| `biome.lspBin` VSCode setting | `biome.lsp.bin` (deprecated old name) | Biome 1.x → 2.x | Must use new setting if explicit config needed |
| `source.fixAll.eslint` | `source.fixAll.biome` | Phase 53 | ESLint code action replaced |
| `esbenp.prettier-vscode` extension | `biomejs.biome` extension | Phase 54 | All JS/TS/JSON formatting via Biome |

## Open Questions

1. **Empty format sweep commit**
   - What we know: `bunx biome check src/ --write` produces 0 changes (Phase 53 already did it)
   - What's unclear: Whether to use `git commit --allow-empty` for the CLEN-03 commit, or declare CLEN-03 satisfied by 3042e73
   - Recommendation: Declare CLEN-03 satisfied by 3042e73, document in SUMMARY.md. Add a verification step confirming this — run `bunx biome check src/` and confirm 0 format errors as the "sweep verification."

2. **Lefthook pre-commit test command**
   - What we know: Existing lefthook has `bun run test:unit` in pre-commit
   - What's unclear: CONTEXT.md says "No pre-push hook — pre-commit is sufficient" for Biome, but doesn't say remove other pre-commit commands
   - Recommendation: Preserve `typecheck` and `test:unit` in pre-commit (they're not ESLint-related). Only replace the `lint` command.

3. **CSS formatter in VSCode**
   - What we know: The biome.json has CSS formatter enabled. The existing VSCode settings use Prettier for CSS.
   - What's unclear: CONTEXT.md says "Set Biome extension as the default formatter for JS/TS/JSON/CSS" — CSS included
   - Recommendation: Per CONTEXT.md decision, set `biomejs.biome` as formatter for `[css]`. The biome.json already has CSS formatter enabled.

## Sources

### Primary (HIGH confidence)
- Context7 `/websites/v1_biomejs_dev` — lefthook integration patterns, `{staged_files}`, `--staged` flag, `--no-errors-on-unmatched`
- Context7 `/biomejs/website` — VSCode settings, `source.fixAll.biome`, `source.organizeImports.biome`, `biomejs.biome` extension ID
- https://biomejs.dev/recipes/git-hooks/ — official lefthook configuration examples (fetched directly)
- https://biomejs.dev/reference/vscode/ — official VSCode settings (fetched directly)
- Direct codebase inspection — package.json scripts, lefthook.yml, .vscode/settings.json, .github/workflows/ci.yml, biome.json
- `git show 3042e73 --stat` — Phase 53 formatting commit confirmation (264 files reformatted)
- `bunx biome check src/ --write` — confirmed 0 changes on current codebase

### Secondary (MEDIUM confidence)
- WebSearch "biome 2.4 lefthook pre-commit staged files integration 2026" — consistent with official docs

### Tertiary (LOW confidence)
None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — using already-installed Biome 2.4.4
- Architecture: HIGH — official docs verified for all 4 integration areas
- Pitfalls: HIGH — discovered through direct codebase inspection and running commands
- Critical finding (empty sweep): HIGH — verified by running `bunx biome check src/ --write` directly

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (stable tooling)
