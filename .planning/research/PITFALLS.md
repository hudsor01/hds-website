# Pitfalls Research: Biome Migration

**Project:** Hudson Digital Solutions Website
**Migration:** ESLint + Prettier → Biome (v3.1 milestone)
**Researched:** 2026-02-24
**Overall Confidence:** HIGH (verified against Biome official docs, GitHub issues, and project's actual config files)

---

## Critical Pitfalls

These can silently lose rule coverage or break the build if unaddressed.

| Pitfall | Risk Level | Prevention | When to Address |
|---------|-----------|------------|-----------------|
| `ban-ts-comment` has no full equivalent in stable Biome | HIGH | Use `noTsComment` (nursery) + manually verify `@ts-ignore` / `@ts-nocheck` / `@ts-check` are individually covered; note current Biome only flags `@ts-ignore` → prefer `@ts-expect-error`, not the full 3-way ban | Phase 1: config setup |
| `ignoreRestSiblings` default flipped in recent Biome 2.x | HIGH | Explicitly set `"ignoreRestSiblings": true` in `noUnusedVariables` options — do not rely on defaults; this was a documented bug (PR #8398, fixed Dec 2025) but may still be wrong in your installed version | Phase 1: config setup |
| `no-unused-vars` splits into two Biome rules | HIGH | Enable both `noUnusedVariables` AND `noUnusedImports` in `correctness` — Biome's `noUnusedVariables` does NOT report unused imports; current ESLint config catches both | Phase 1: config setup |
| `no-html-link-for-pages` has no Biome equivalent | MEDIUM | Accept the gap: this rule warns about `<a href>` to internal pages instead of `<Link>`. Add an E2E or code-review check. The project already passes lint 0-errors so this was enforced at setup; regression risk is low if codebase already has no violations | Phase 1: after migration, manual check |
| Formatter diff will reformat the entire codebase | HIGH | Run `biome format --write` as a single atomic commit with message "chore: biome format entire codebase" — do NOT mix rule config changes and formatting in one commit; otherwise `git blame` becomes useless | Phase 2: format step |
| `biome migrate eslint` does not migrate `--include-inspired` rules by default | MEDIUM | Run with `--include-inspired` flag or manually verify inspired-but-not-ported rules; without this, rules like some `react-hooks` analogs may be silently dropped | Phase 1: migration command |
| `.eslintignore` negated globs are not migrated | MEDIUM | Biome emits a warning for negated glob patterns in `.eslintignore`; verify `biome.json` `ignore` patterns manually against the current ESLint `ignores` array in `eslint.config.mjs` | Phase 1: config review |
| `eslint-config-next` includes `core-web-vitals` rules not all covered by Biome | MEDIUM | Audit: `noImgElement` is covered; `no-html-link-for-pages` is not; verify current passing-0-errors baseline means no violations exist, then accept the open gap | Phase 1: rule parity check |
| Tailwind `@apply` / `@tailwind` directives trigger `unknownAtRules` CSS warnings | MEDIUM | Add `"css": { "parser": { "tailwindDirectives": true } }` to `biome.json`; note this is Tailwind v4 syntax — project uses `@tailwindcss/postcss` (v4) so this is required; there is an open bug where this setting does not fully suppress warnings in Biome 2.3.x | Phase 1: biome.json config |

---

## Next.js 15 Specific Gotchas

### 1. `next lint` runs more than linting

`next lint` performs "doctoring" — it sanity-checks `tsconfig.json`, verifies Next.js compiler options, and manages TypeScript setup. Biome does none of this. Replacing the `lint` script with `biome check .` removes the doctoring side-effect.

**Prevention:** This is acceptable here because `tsconfig.json` is already correct and stable. Keep `bun run typecheck` (`tsc --noEmit`) in `lefthook.yml` and CI to compensate.

**Context:** `next lint` is deprecated as of Next.js 15.5 and removed in Next.js 16. The project already runs Next.js 16.1.6, meaning `next lint` no longer exists — Biome is the natural replacement.

### 2. `eslint-config-next/typescript` transitively enables `@typescript-eslint` rules

The current `eslint.config.mjs` spreads both `nextCoreWebVitals` and `nextTypescript`, which internally activates a large set of typescript-eslint rules beyond what is explicitly listed in the project config. These implicit rules disappear when ESLint is removed.

**Known implicit rules from `eslint-config-next/typescript` to verify in Biome:**
- `@typescript-eslint/no-require-imports` → Biome: `noCommonJs` (style)
- `@typescript-eslint/no-array-constructor` → Biome: `useArrayLiterals` (style)
- React-specific rules from `eslint-plugin-react` / `eslint-plugin-react-hooks`

**Prevention:** After removing ESLint, run `biome check .` on the full codebase and inspect every new error/warning. Do not auto-suppress — investigate each one.

### 3. `react-hooks/set-state-in-effect` has no direct Biome equivalent

The current ESLint config explicitly enables `react-hooks/set-state-in-effect: "error"`. Biome has React hooks rules but this specific rule is not in the current Biome stable ruleset.

**Prevention:** Accept this gap. The rule prevents setting state directly inside `useEffect` without a cleanup or conditional. The pattern is already avoided in this codebase (project passes lint at 0 errors). Low regression risk but not zero.

### 4. `no-console` with allow list requires Biome workaround

The current ESLint config uses `'no-console': ['warn', { allow: ['warn', 'error'] }]`. Biome has `noConsole` but the "allow specific methods" option behavior differs.

**Biome's approach:** `noConsole` (in `nursery` as of recent versions) flags all `console.*` calls. There is no built-in per-method allowlist equivalent to ESLint's `allow` option.

**Prevention:** Use `// biome-ignore lint/nursery/noConsole: ...` for `console.warn` / `console.error` calls, OR configure `noConsoleLog` (which only flags `console.log`, not `warn`/`error`) — this is the better fit for this project since the CLAUDE.md rule prohibits `console.log` but explicitly allows `console.warn` and `console.error`. Use `noConsoleLog` rather than `noConsole`.

### 5. Lefthook `glob` filter + Biome `--staged` behavior

The current `lefthook.yml` runs `bun run lint` (full project scan) on pre-commit, filtered by glob. Biome's `--staged` flag is more efficient and precise for pre-commit use.

**Pitfall:** Keeping `bun run lint` (full scan) in lefthook after migrating to Biome is slow but not broken. However, the glob filter in lefthook (`*.{js,jsx,ts,tsx}`) does not tell Biome what files to check — it only controls when the hook fires. The actual files checked are still determined by Biome's own `include`/`files` config.

**Prevention:** Replace lefthook lint command with: `biome check --no-errors-on-unmatched --files-ignore-unknown=true --staged --colors=off $(git diff --cached --name-only --diff-filter=ACMR | tr '\n' ' ')` or use Biome's native staged-files integration.

---

## TypeScript Strict Mode Gaps

This project uses TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters` enabled in `tsconfig.json`. These overlap with Biome rules but are NOT redundant — TypeScript checks types, Biome checks syntax/patterns.

| ESLint Rule (current) | Biome Equivalent | Gap / Difference |
|----------------------|-----------------|-----------------|
| `@typescript-eslint/no-explicit-any: error` | `noExplicitAny` (suspicious) | No gap — direct equivalent. Enable in `suspicious` group. |
| `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: "^_"` | `noUnusedVariables` (correctness) | Biome auto-ignores `_`-prefixed variables — no pattern config needed. Also enable `noUnusedFunctionParameters` to cover args. |
| `@typescript-eslint/consistent-type-imports` with `separate-type-imports` | `useImportType` (style) | Direct equivalent. `separate-type-imports` style maps to `useImportType`. |
| `@typescript-eslint/no-non-null-assertion: warn` | `noNonNullAssertion` (style) | Direct equivalent. Set to `"warn"`. |
| `@typescript-eslint/ban-ts-comment` with `ts-ignore: false, ts-nocheck: false` | `noTsComment` (nursery) | **Partial coverage only.** Biome's rule currently focuses on `@ts-ignore` → suggest `@ts-expect-error`. The full 3-comment ban (ignore, nocheck, check) is not available in stable. |
| `no-duplicate-imports: error` | `noUselessImport` or `noDuplicateImports` (correctness) | Biome has `noDuplicateImports` — direct equivalent. |
| `eqeqeq: ['error', 'always']` | `noDoubleEquals` (suspicious) | Direct equivalent. |
| `curly: ['error', 'all']` | `useBlockStatements` (style) | Direct equivalent. This project's ESLint enforces curly on all if/else per CLAUDE.md — verify this rule is explicitly enabled, as it's not in Biome's `recommended` set. |
| `prefer-const: error` | `useConst` (style) | Direct equivalent. |
| `no-var: error` | `noVar` (style) | Direct equivalent. |
| `no-debugger: error` | `noDebugger` (suspicious) | Direct equivalent. |
| `no-unreachable: error` | `noUnreachable` (correctness) | Direct equivalent. |
| `no-constant-condition: error` | `noConstantCondition` (correctness) | Direct equivalent. |
| `no-empty: ['error', { allowEmptyCatch: true }]` | `noEmptyBlockStatements` (suspicious) | **Behavioral difference:** Biome does not support `allowEmptyCatch` option — empty catch blocks will be flagged. Workaround: use `// biome-ignore` on legitimate empty catches or add `catch (_e) { /* intentional */ }`. |
| `react/no-unescaped-entities: off` | N/A — turned off | No action needed. Biome has no equivalent rule. |
| `react-hooks/set-state-in-effect: error` | No equivalent | Gap — see Next.js gotchas section above. |
| Type-aware rules (no-floating-promises, etc.) | nursery/noFloatingPromises | **Biome 2.0+ only.** The rule is in nursery and catches ~75% of cases. Not recommended to enable on first migration pass. |

### Rules NOT in Biome stable that this project currently gets from `eslint-config-next/typescript`

Biome 2.x does not have equivalents for:
- `@typescript-eslint/no-misused-promises` (type-aware)
- `@typescript-eslint/no-floating-promises` (in nursery only, 75% detection rate)
- `@typescript-eslint/strict-boolean-expressions` (type-aware)

These were likely not enabled via `eslint-config-next/typescript` either (it uses `recommended` not `strict` typescript-eslint), but verify after migration by diffing the rule sets.

---

## Rule Parity Verification

A structured approach to confirming nothing was lost.

### Step 1: Capture the current ESLint rule surface before removing anything

```bash
# From project root
npx eslint --print-config src/app/page.tsx > /tmp/eslint-effective-config.json
```

This outputs every active rule, including those from `eslint-config-next` spreads. This is the ground truth before migration.

### Step 2: After Biome is configured, run both linters on the same file set

```bash
# Run ESLint (still installed) — capture output
bun run lint 2>&1 > /tmp/eslint-output.txt

# Run Biome — capture output
npx @biomejs/biome check . 2>&1 > /tmp/biome-output.txt

# If ESLint finds 0 errors but Biome finds new ones: investigate each
# If ESLint found something Biome does not: it's a coverage gap
```

### Step 3: Verify the 8 explicitly configured rules in `eslint.config.mjs`

For each rule in the current config, confirm the Biome equivalent is explicitly enabled in `biome.json`:

| Current ESLint Rule | Biome Rule to Enable | Biome Category |
|--------------------|---------------------|----------------|
| `@typescript-eslint/no-unused-vars` | `noUnusedVariables` + `noUnusedFunctionParameters` + `noUnusedImports` | `correctness` |
| `@typescript-eslint/consistent-type-imports` | `useImportType` | `style` |
| `@typescript-eslint/no-explicit-any` | `noExplicitAny` | `suspicious` |
| `@typescript-eslint/no-non-null-assertion` | `noNonNullAssertion` | `style` |
| `@typescript-eslint/ban-ts-comment` | `noTsComment` (nursery, partial) | `nursery` |
| `no-console` (warn, allow warn+error) | `noConsoleLog` (not `noConsole`) | `suspicious` |
| `no-debugger` | `noDebugger` | `suspicious` |
| `prefer-const` | `useConst` | `style` |
| `no-var` | `noVar` | `style` |
| `eqeqeq` | `noDoubleEquals` | `suspicious` |
| `curly: all` | `useBlockStatements` | `style` |
| `no-duplicate-imports` | `noDuplicateImports` | `correctness` |
| `no-unreachable` | `noUnreachable` | `correctness` |
| `no-constant-condition` | `noConstantCondition` | `correctness` |
| `no-empty` (allowEmptyCatch) | `noEmptyBlockStatements` (no allowEmptyCatch) | `suspicious` |
| `react-hooks/set-state-in-effect` | **No equivalent** | — |
| `no-html-link-for-pages` (from next) | **No equivalent** | — |
| `no-img-element` (from next) | `noImgElement` (next domain) | `next` |

### Step 4: Verify the formatter produces semantically equivalent output

```bash
# Run Prettier on a sample file to get current output
npx prettier --write src/app/page.tsx

# Then run Biome format on the same file
npx @biomejs/biome format --write src/app/page.tsx

# If output differs, check: tabs vs spaces, trailing commas, arrow parens
```

For this project's `.prettierrc.json`:
- `useTabs: true` → `biome.json: { "formatter": { "indentStyle": "tab" } }`
- `semi: false` → `biome.json: { "javascript": { "formatter": { "semicolons": "asNeeded" } } }`
- `singleQuote: true` → `biome.json: { "javascript": { "formatter": { "quoteStyle": "single" } } }`
- `trailingComma: "none"` → `biome.json: { "javascript": { "formatter": { "trailingCommas": "none" } } }`
- `arrowParens: "avoid"` → `biome.json: { "javascript": { "formatter": { "arrowParentheses": "asNeeded" } } }`
- `printWidth: 80` → `biome.json: { "formatter": { "lineWidth": 80 } }`
- `bracketSpacing: true` → Biome default (true), no change needed
- `endOfLine: "lf"` → `biome.json: { "formatter": { "lineEnding": "lf" } }`

`biome migrate prettier --write` should handle most of this automatically. Verify the output manually — do not trust the migration blindly.

---

## Rollback Strategy

### Prerequisites (before starting migration)

1. Create a git branch: `git checkout -b feat/biome-migration`
2. Commit the current state cleanly (0 lint errors, 0 type errors)
3. Note the current `package.json` devDependencies for ESLint: `eslint@9.39.2`, `eslint-config-next@16.1.6`, `prettier@3.8.1`

### Rollback trigger conditions

Abort and roll back if any of these occur:
- More than 5 rules cannot be mapped to Biome equivalents
- `bun run typecheck` starts failing after Biome changes (indicates config interaction)
- E2E tests fail in a way that correlates with a formatter change (unlikely but possible if auto-fix mutates semantics)
- Biome crashes on any file in the codebase

### Rollback procedure

```bash
# Option A: Git reset (preferred — clean branch)
git checkout main
git branch -D feat/biome-migration

# Option B: Selective revert (if migration was done on main)
git revert <biome-install-commit>..<HEAD>
bun install  # restores node_modules to pre-migration state
```

### What to restore manually if needed

```bash
# Reinstall ESLint + Prettier
bun add -d eslint@9.39.2 eslint-config-next@16.1.6 prettier@3.8.1

# Restore eslint.config.mjs — already in git history
# Restore .prettierrc.json — already in git history

# Restore package.json scripts:
# "lint": "eslint ."
# Remove any "format" script that was added

# Restore lefthook.yml lint command to: bun run lint
```

### Partial rollback: keep Biome formatter, revert Biome linter

This is a valid middle-ground if Biome linting has unresolvable gaps:

```bash
# Keep: biome.json with only formatter config
# Restore: eslint.config.mjs, eslint packages
# Update: scripts to run both `biome format` and `eslint .`
```

This is the "hybrid approach" referenced in community guides. The project could run Biome as formatter-only (replacing Prettier) while keeping ESLint for linting. The `eslint-config-biome` package disables ESLint formatting rules to prevent conflicts in this hybrid setup.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Install Biome | Version pinning — always use `--save-exact` to lock version | `bun add -d --exact @biomejs/biome` |
| `biome migrate prettier` | `.prettierrc.json` uses `useTabs: true` + `semi: false` — non-default for Biome; migrate command should handle it but verify `biome.json` output | Run migration, then manually confirm every field in `biome.json` formatter section |
| `biome migrate eslint` | Only migrates rules Biome has equivalents for; rules from `eslint-config-next` spread (not direct config) may not appear | Run with `--include-inspired`; then audit the 8 explicit rules manually |
| Format whole codebase | Creates a massive diff that pollutes git history | Single commit: `chore: reformat codebase with biome` before any lint config changes |
| Remove ESLint packages | `eslint-config-next` is also used for Next.js-specific TypeScript transforms; removing it should be safe since Next.js 16.x no longer depends on it for compilation | Verify `bun run build` succeeds after package removal |
| Update lefthook | Current lefthook runs full project `bun run lint` — this is slow; switch to `--staged` | Use Biome's `--staged` flag in lefthook pre-commit |
| CI scripts | `bun run test:ci` includes `bun run lint`; if the lint script is now `biome check .`, CI will use Biome automatically | No extra CI config needed beyond script change |
| VS Code extension | Biome VS Code extension (biomejs.biome) may report "Could not find Biome in dependencies" if `bun` installs to a non-standard path | Set `biome.lspBin` in `.vscode/settings.json` to `./node_modules/@biomejs/biome/bin/biome` |
| Tailwind CSS warnings | Biome's CSS linter flags `@tailwind` and `@layer` as unknownAtRules; this project uses Tailwind v4 (`@tailwindcss/postcss`) | Add `"css": { "parser": { "tailwindDirectives": true } }` to `biome.json`; note open bug in 2.3.x where this may still warn |
| TypeScript strict mode interaction | Biome's `useBlockStatements` (curly-all) enforces brace syntax — this was previously enforced by ESLint `curly: all` per CLAUDE.md; ensure it remains `error` not `warn` in Biome | Explicitly set `"useBlockStatements": "error"` in style rules |

---

## Sources

- [Biome: Migrate from ESLint and Prettier](https://biomejs.dev/guides/migrate-eslint-prettier/) — official migration guide with known limitations
- [Biome Rules Sources](https://biomejs.dev/linter/rules-sources/) — maps ESLint rules to Biome equivalents
- [Biome: Differences with Prettier](https://biomejs.dev/formatter/differences-with-prettier/) — authoritative list of formatter divergences
- [noUnusedVariables rule](https://biomejs.dev/linter/rules/no-unused-variables/) — confirms `ignoreRestSiblings` option
- [ignoreRestSiblings default bug PR #8398](https://github.com/biomejs/biome/pull/8398) — Dec 2025 fix, explicitly set the option
- [noFloatingPromises nursery rule](https://biomejs.dev/linter/rules/no-floating-promises/) — type-aware, nursery only, ~75% coverage vs typescript-eslint
- [Next.js + Biome discussion](https://github.com/vercel/next.js/discussions/59347) — confirms `next lint` removed in Next.js 16, Biome is the intended replacement
- [ban-ts-comment equivalent issue #713](https://github.com/biomejs/biome/issues/713) — partial implementation, not full parity
- [Tailwind unknownAtRules bug #7899](https://github.com/biomejs/biome/issues/7899) — tailwindDirectives setting bug in Biome 2.3.x
- [AppSignal: Migrating to BiomeJS](https://blog.appsignal.com/2025/05/07/migrating-a-javascript-project-from-prettier-and-eslint-to-biomejs.html) — practical limitations summary
- [Biome v2 release](https://biomejs.dev/blog/biome-v2/) — type-aware linting introduced, Next.js domain added
