# Phase 54: Format Sweep & Workflow Integration - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Reformat the entire `src/` codebase with Biome in a single isolated commit, then migrate all developer tooling (package.json scripts, lefthook hooks, CI workflow, VSCode settings) from ESLint/Prettier to Biome. ESLint and Prettier are NOT removed in this phase — that is Phase 55.

</domain>

<decisions>
## Implementation Decisions

### Format sweep
- Scope: `src/` only (root config files excluded from the isolated reformat commit)
- Run `bunx biome check src/ --write` — includes both formatting and organize-imports in a single pass
- The isolated format commit MUST be the first commit in the phase (before any script/hook/config changes)
- Commit message must be exactly: `chore: reformat codebase with biome`
- Phase lands on a phase-54 feature branch (branching_strategy: phase from config.json)

### Info-level items from Phase 53
- Fix all 7 info-level items (`useParseIntRadix` x4, `useNodejsImportProtocol` x2, `useLiteralKeys` x1) in Phase 54
- These go in a SEPARATE commit AFTER the isolated format sweep — not mixed into the reformat commit
- Commit message: `fix: apply biome info-level suggestions`

### Lefthook hooks
- Pre-commit hook: block on error (reject commit, report issues — do NOT auto-fix staged files)
- Scope: staged files only (`biome check --staged`)
- No pre-push hook — pre-commit is sufficient
- Read existing `lefthook.yml`, migrate any ESLint references to Biome, preserve all non-ESLint hooks
- Implementation must follow Biome's official documentation guidance for lefthook integration

### Package.json scripts
- `bun run lint` must invoke `biome check` (not `eslint`)
- `bun run format` must invoke `biome format --write` (not Prettier)
- Any `bun run lint:fix` or equivalent should use `biome check --write`
- Check all scripts that currently reference eslint/prettier and update them

### VSCode settings
- Update `.vscode/settings.json` — overwrite/merge as needed to align with Biome's official docs
- Enable `editor.formatOnSave: true` scoped to JS/TS/JSON/CSS file types
- Enable `editor.codeActionsOnSave` with `source.organizeImports` (Biome organise-imports)
- Set Biome extension as the default formatter for JS/TS/JSON/CSS
- Follow Biome's official VSCode integration documentation for all settings

### General principle
- All tooling decisions (lefthook config, VSCode settings, scripts) must align with Biome 2.4.4's official documentation and best practices — Claude should read the official docs when implementing

</decisions>

<specifics>
## Specific Ideas

- The isolated reformat commit must contain ONLY formatting changes — no config files, no logic, no biome.json edits
- Lefthook and VSCode configuration should be based on what the official Biome docs recommend for their respective integrations, not guessed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 54-format-sweep-workflow-integration*
*Context gathered: 2026-02-24*
