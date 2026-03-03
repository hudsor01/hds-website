# Phase 55: Old Tooling Removal & Verification - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove ESLint, Prettier, and all associated packages and config files from the repository. Scope and resolve empty catch blocks globally. Clean up ESLint/Prettier references in documentation. Run the full verification suite (unit tests, build, typecheck, biome check) to confirm the project is fully clean with Biome as the sole linter/formatter.

</domain>

<decisions>
## Implementation Decisions

### Removal scope
- Remove ALL ESLint-related packages from devDependencies, not just the 3 named in success criteria. This includes: `eslint`, `eslint-config-next`, and all transitive ESLint deps (`@typescript-eslint/*`, `@rushstack/eslint-patch`, `eslint-plugin-react-hooks`, etc.)
- Remove ALL ESLint config/ignore files: `eslint.config.mjs` plus any `.eslintignore`, `.eslintrc.*` variants found anywhere in the repo
- Run `bun install` after removal to update `bun.lock` before running the verification suite

### Prettier removal
- Claude's discretion on whether to keep Prettier for markdown or remove entirely
- Recommended approach: remove Prettier entirely (aligns with v3.1 goal of zero ESLint/Prettier surface)
- Remove ALL Prettier config files found (any `*.prettierrc*`, `.prettier.*` variant), not just `.prettierrc.json` and `.prettierignore`
- Claude's discretion on `.vscode/settings.json` markdown format-on-save behavior after removal

### Empty catch blocks — comprehensive global resolution
- Scope: run `grep -r "catch {}" src/` to find all empty catch blocks globally
- Resolution: comprehensively resolve every instance — add `/* intentional */` comments, or refactor if appropriate
- This is NOT optional — resolve ALL instances before completing the phase
- Commit the empty catch block fixes as a separate commit before the package removal commit

### Documentation cleanup
- Grep all `.md` files, `CLAUDE.md`, and any other docs for ESLint/Prettier references
- Update or remove any references that describe ESLint/Prettier as the project's linter/formatter
- Update to reference Biome where appropriate

### Claude's Discretion
- Whether to keep Prettier for markdown-only use or remove entirely (recommended: remove)
- `.vscode/settings.json` behavior for markdown files after Prettier removal
- Exact set of ESLint transitive packages to uninstall (scan package.json and remove all `eslint-*`, `@typescript-eslint/*`, `@rushstack/*` entries)

</decisions>

<specifics>
## Specific Ideas

- The user said "scope and comprehensively resolve the issue globally" for empty catch blocks — this is a hard requirement, not optional cleanup
- The v3.1 goal was "zero ESLint/Prettier dependency surface" — full removal (not partial) is the intent

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 55-old-tooling-removal-verification*
*Context gathered: 2026-02-24*
