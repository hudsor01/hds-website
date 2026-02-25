# Research Summary: v3.1 Biome Migration

**Project:** Hudson Digital Solutions Website
**Milestone:** v3.1 — ESLint + Prettier → Biome
**Researched:** 2026-02-24
**Confidence:** HIGH (all findings from official Biome docs, Next.js docs, npm registry)

---

## Executive Summary

Biome 2.4.4 is a production-ready, single Rust binary that fully replaces ESLint and Prettier for this project. The migration is well-defined: install `@biomejs/biome` with an exact version pin, run the automated migration commands, hand-tune `biome.json` to cover known gaps, reformat the entire codebase in a dedicated commit, then remove the old tooling. The project's existing rule set is approximately 95% covered by Biome equivalents — all formatting settings map cleanly, and the majority of lint rules have direct equivalents in Biome's recommended ruleset plus its React and Next.js domains.

Two gaps are acceptable and will not be mitigated: `react-hooks/set-state-in-effect` (no Biome equivalent, open issue since July 2025, low regression risk because the pattern is already avoided in this codebase) and fine-grained `ban-ts-comment` options for `@ts-nocheck`/`@ts-check` (only `@ts-ignore` is covered by `noTsIgnore`). A third gap — `no-html-link-for-pages` — has no direct Biome equivalent but is unlikely to regress since the codebase already passes lint at 0 errors. No hybrid ESLint/Biome approach is warranted.

The main execution risk is the codebase-wide reformat: Biome's formatter is not identical to Prettier. This must be handled as a single isolated commit to preserve `git blame` usefulness. The migration should be done on a feature branch with a verified clean baseline before starting.

---

## Stack Changes

### Remove

| Package | Replacement |
|---------|-------------|
| `eslint` | `@biomejs/biome` |
| `eslint-config-next` | Biome's built-in `next` domain (auto-detected) |
| `prettier` | Biome's built-in formatter |

**Config files to delete:**
- `eslint.config.mjs`
- `.prettierrc.json`
- `.prettierignore` (replaced by `vcs.useIgnoreFile: true` respecting `.gitignore`)

Removing `eslint` and `eslint-config-next` drops the entire ESLint transitive dependency tree (~100+ packages: `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `@next/eslint-plugin-next`, `@typescript-eslint/*`). No need to uninstall these individually.

### Add

| Package | Version | Flag | Notes |
|---------|---------|------|-------|
| `@biomejs/biome` | `2.4.4` | `--save-exact` / `-E` | Must use exact pin. Zero peer dependencies. Self-contained binary. |

**Install command:**
```bash
bun add -d -E @biomejs/biome
```

### Retain Unchanged

- `lefthook` — git hooks manager stays; hook scripts need updating, not the package
- `typescript` — Biome does not replace `tsc --noEmit`; type checking is separate

---

## Key Feature Coverage

Biome replaces three tools in one binary: linter (`biome lint`), formatter (`biome format`), and import organizer (`biome check`). The combined command `biome check --write` runs all three in one pass.

| Tool Replaced | Coverage | Notes |
|---|---|---|
| Prettier (formatter) | 100% | All `.prettierrc.json` settings map cleanly to `biome.json` |
| ESLint core rules | ~95% | 14 of 15 rules covered; `no-empty allowEmptyCatch` needs workaround |
| eslint-config-next React rules | ~95% | React and Next.js domains cover all major rules |
| @typescript-eslint rules | ~90% | `ban-ts-comment` partially covered only |
| react-hooks rules | ~75% | `set-state-in-effect` has no equivalent |

**Confirmed gaps (accept and move on):**

1. `react-hooks/set-state-in-effect` — no Biome equivalent (open issue #6856). Accept: patterns detected by this rule surface immediately as infinite render loops in dev.
2. `@typescript-eslint/ban-ts-comment` for `@ts-nocheck`/`@ts-check` — only `@ts-ignore` is covered by `noTsIgnore`. Mitigation: verify these directives don't exist in `src/` before migration.
3. `@next/next/no-html-link-for-pages` — no Next.js domain equivalent. Accept: codebase already clean.
4. `no-empty` with `allowEmptyCatch: true` — Biome's `noEmptyBlockStatements` flags empty catch blocks. Mitigation: add a comment inside empty catch blocks (`/* intentional */`) or use `// biome-ignore`.

**Key non-obvious rules to explicitly enable in `biome.json` (not in Biome recommended):**
- `useBlockStatements` (the `curly: all` equivalent) — MUST be explicitly set to `"error"`
- `noUnusedImports` — separate from `noUnusedVariables` in Biome; enable both
- `noUnusedFunctionParameters` — also separate; enable alongside `noUnusedVariables`

---

## Migration Approach

Execute in this exact order. Each step is independently verifiable before proceeding.

1. **Create a feature branch** — `git checkout -b feat/biome-migration`. Verify baseline: `bun run lint && bun run typecheck` must pass at 0 errors before starting.

2. **Install Biome** (keep ESLint/Prettier installed during this step for parallel verification):
   ```bash
   bun add -d -E @biomejs/biome
   ```

3. **Initialize and run automated migration:**
   ```bash
   bunx biome init
   bunx biome migrate prettier --write
   bunx biome migrate eslint --write --include-inspired
   ```
   Note: `biome migrate eslint` may partially fail with `eslint-config-next` due to cyclic reference issues. This is expected — the generated `biome.json` needs manual tuning in step 4.

4. **Hand-tune `biome.json`** — replace or supplement the auto-generated config with the final config from FEATURES.md (includes React/Next.js domains, `useBlockStatements`, `noConsole` allow list, `useImportType` with `separatedType`, all three unused-vars rules, Tailwind CSS directives support). Key additions the migration won't auto-apply:
   - `"domains": { "react": "recommended", "next": "recommended" }`
   - `"style": { "useBlockStatements": "error" }`
   - `"css": { "parser": { "tailwindDirectives": true } }` (required for Tailwind v4 `@apply` / `@layer`)
   - `"overrides"` disabling `noConsole` in `e2e/` and `tests/`
   - `vcs.useIgnoreFile: true` to respect `.gitignore`

5. **Run Biome on full codebase and commit the format diff separately:**
   ```bash
   bunx biome check --write src/
   git add src/
   git commit -m "chore: reformat codebase with biome"
   ```
   This must be a standalone commit. Do NOT mix formatting changes with rule config changes.

6. **Update `package.json` scripts:**
   - `"lint": "biome check --error-on-warnings src/"`
   - `"format": "biome format --write src/"` (new script)
   - Fix pre-existing bug: `bun test:e2e:fast` → `bun run test:e2e:fast` in `test:all` and `test:ci`

7. **Update `lefthook.yml`** — replace full-repo ESLint scan with Biome staged-file check:
   - Pre-commit: `bunx biome check --write --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {staged_files}` with `stage_fixed: true`
   - Pre-push: same command without `--write` and `stage_fixed: false`

8. **Update `.vscode/settings.json`** — replace Prettier and ESLint extension references with `biomejs.biome`. Remove `esbenp.prettier-vscode` for JS/TS/JSON (keep for CSS/Markdown). Add `source.organizeImports.biome` to `codeActionsOnSave`. Set `biome.lspBin` to `./node_modules/@biomejs/biome/bin/biome` if the extension can't find Biome.

9. **Remove old tooling:**
   ```bash
   bun remove eslint eslint-config-next prettier
   rm eslint.config.mjs .prettierrc.json .prettierignore
   ```

10. **Update CI** — rename the "Run ESLint" step to "Run Biome" in `.github/workflows/ci.yml`. The `bun run lint` command is unchanged; only the step label changes.

11. **Verify clean state:**
    ```bash
    bunx biome check .
    bun run typecheck
    bun run test:unit
    bun run build
    ```
    All four must pass before the milestone is complete.

---

## Watch Out For

**1. Separate commit for codebase reformat (CRITICAL)**
Running `biome check --write` on the full codebase creates a large diff across many files. If this is mixed with rule config changes in the same commit, `git blame` becomes useless for the affected files. Always commit the format sweep as a standalone `chore:` commit before any further changes.

**2. Three unused-vars rules, not one (HIGH)**
ESLint's `@typescript-eslint/no-unused-vars` is a single rule. In Biome, coverage requires enabling three separate rules: `noUnusedVariables`, `noUnusedFunctionParameters`, and `noUnusedImports`. Missing any of these creates a silent coverage gap. All three belong in the `correctness` group.

**3. `useBlockStatements` is not in Biome recommended (HIGH)**
The project's CLAUDE.md requires curly braces on all if/else (and ESLint enforced this via `curly: all`). Biome's equivalent `useBlockStatements` is NOT in the recommended ruleset — it will not be enabled automatically. It must be explicitly added as `"error"` in the `style` rules block. Forgetting this silently drops an enforced convention.

**4. Tailwind CSS unknownAtRules warnings (MEDIUM)**
Biome's CSS linter flags `@tailwind`, `@apply`, and `@layer` as unknown at-rules. This project uses Tailwind v4 (`@tailwindcss/postcss`). Mitigation: add `"css": { "parser": { "tailwindDirectives": true } }` to `biome.json`. Note: there is an open bug (Biome issue #7899) where this setting may not fully suppress warnings in Biome 2.3.x. If warnings persist, CSS linting can be scoped out via `files.ignore` for CSS files.

**5. `noConsole` vs `noConsoleLog` — use the right rule (MEDIUM)**
The project's current ESLint config allows `console.warn` and `console.error` but bans `console.log`. Biome's `noConsole` flags all `console.*` methods. PITFALLS.md recommends using `noConsoleLog` instead of `noConsole` — `noConsoleLog` only flags `console.log`, which matches the project's actual intent. Using `noConsole` with an allow list is available but more complex; `noConsoleLog` is simpler and correct here.

---

## Open Questions

1. **Empty catch blocks in the codebase** — The project uses empty catch blocks in the `setAll` pattern (Supabase auth boilerplate and form handling). Biome's `noEmptyBlockStatements` will flag these. Need to verify: how many occurrences exist, and whether adding a comment (`/* intentional */`) or using `// biome-ignore` is the right approach. A pre-migration `grep -r "catch {}" src/` will scope the work.

2. **`@ts-nocheck` / `@ts-check` in the codebase** — The current ESLint config bans both. Biome only covers `@ts-ignore`. Run `grep -r "@ts-nocheck\|@ts-check" src/` before migration. If none exist, the gap is theoretical. If any exist, they need to be addressed manually (convert to `@ts-expect-error` or remove).

3. **`biome migrate eslint` failure with `eslint-config-next`** — The migration command is documented to have issues with Next.js ESLint configs due to cyclic resolution. Expect partial output and plan to use the reference `biome.json` from FEATURES.md as the baseline rather than trusting the auto-generated result.

4. **Biome VSCode extension LSP path** — On some Bun-managed projects, the Biome VSCode extension cannot automatically locate `@biomejs/biome`. May need to add `"biome.lspBin": "./node_modules/@biomejs/biome/bin/biome"` to `.vscode/settings.json`. Verify after install.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack (packages, versions) | HIGH | Verified via npmjs.com and official Biome docs |
| Feature coverage (rule mapping) | HIGH | Verified against biomejs.dev/linter/rules-sources/ and individual rule pages |
| Migration sequence | HIGH | From official Biome migration guide; known `eslint-config-next` limitation documented |
| Pitfalls | HIGH | Cross-referenced with GitHub issues and official "differences with Prettier" doc |

**Overall confidence:** HIGH

---

## Sources

### Primary (HIGH confidence)
- [biomejs.dev/guides/getting-started/](https://biomejs.dev/guides/getting-started/) — install and init
- [biomejs.dev/guides/migrate-eslint-prettier/](https://biomejs.dev/guides/migrate-eslint-prettier/) — migration commands and known limitations
- [biomejs.dev/linter/rules-sources/](https://biomejs.dev/linter/rules-sources/) — ESLint → Biome rule mapping
- [biomejs.dev/linter/domains/](https://biomejs.dev/linter/domains/) — React and Next.js domain coverage
- [biomejs.dev/recipes/git-hooks/](https://biomejs.dev/recipes/git-hooks/) — lefthook staged-files pattern
- [biomejs.dev/formatter/differences-with-prettier/](https://biomejs.dev/formatter/differences-with-prettier/) — formatter divergences
- [biomejs.dev/blog/biome-v2-4/](https://biomejs.dev/blog/biome-v2-4/) — current stable version
- [nextjs.org/docs/app/guides/upgrading/version-16](https://nextjs.org/docs/app/guides/upgrading/version-16) — `next lint` removal confirmed
- [npmjs.com/@biomejs/biome](https://www.npmjs.com/package/@biomejs/biome) — version 2.4.4 confirmed

### Secondary (tracking open issues)
- [GitHub biomejs/biome #6856](https://github.com/biomejs/biome/issues/6856) — `set-state-in-effect` missing rule
- [GitHub biomejs/biome #713](https://github.com/biomejs/biome/issues/713) — `ban-ts-comment` partial coverage
- [GitHub biomejs/biome PR #8398](https://github.com/biomejs/biome/pull/8398) — `ignoreRestSiblings` default bug fix (Dec 2025)
- [GitHub biomejs/biome #7899](https://github.com/biomejs/biome/issues/7899) — Tailwind CSS `unknownAtRules` bug in 2.3.x

---
*Research completed: 2026-02-24*
*Ready for roadmap: yes*
