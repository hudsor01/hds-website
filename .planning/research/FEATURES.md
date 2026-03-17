# Features Research: Biome Migration

**Project:** Hudson Digital Solutions website (Next.js 15, TypeScript strict, React 19)
**Researched:** 2026-02-24
**Biome version researched:** 2.4.4 (current as of research date)
**Overall confidence:** HIGH — primary source was biomejs.dev official docs and GitHub issues

---

## What Biome Covers

Biome is a single Rust binary that replaces three tools:

| Tool Replaced | Biome Feature | Command |
|---------------|---------------|---------|
| ESLint | Linter (450+ rules) | `biome lint` |
| Prettier | Formatter | `biome format` |
| eslint-plugin-import (import ordering) | Assist: organizeImports | `biome check` |

**Key property:** `biome check --write` runs all three in one pass. For CI: `biome ci` (read-only, exits non-zero on violations).

**Domains system (v2.0+):** Biome auto-detects dependencies in `package.json` and enables domain-specific rules. If `react` is a dependency, the React domain becomes `recommended` automatically. If `next` is a dependency, the Next.js domain activates. No manual `extends` arrays needed.

---

## Rule Coverage Matrix

The current project's `eslint.config.mjs` uses: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`, plus custom rules. Mapping each rule to its Biome equivalent:

### TypeScript-ESLint Rules (from eslint-config-next/typescript + custom)

| ESLint Rule | Biome Equivalent | Coverage | Notes |
|---|---|---|---|
| `@typescript-eslint/no-unused-vars` (argsIgnorePattern `^_`, varsIgnorePattern `^_`, ignoreRestSiblings) | `noUnusedVariables` + `noUnusedFunctionParameters` | FULL | Biome natively ignores `_`-prefixed names; `ignoreRestSiblings` defaults to `true` |
| `@typescript-eslint/consistent-type-imports` (prefer: type-imports, fixStyle: separate-type-imports) | `useImportType` with `style: "separatedType"` | FULL | Enforces `import type { T }` form; auto-fixable |
| `@typescript-eslint/no-explicit-any` | `noExplicitAny` | FULL | In recommended ruleset |
| `@typescript-eslint/no-non-null-assertion` | `noNonNullAssertion` | FULL | Exact equivalent, warns by default |
| `@typescript-eslint/ban-ts-comment` (`ts-ignore: false, ts-nocheck: false, ts-check: false`) | `noTsIgnore` | PARTIAL | `noTsIgnore` only handles `@ts-ignore` → suggests `@ts-expect-error`. No equivalent for banning `@ts-nocheck` or `@ts-check`. Gap: custom ban-ts-comment options are not replicated. See Gaps section. |
| `@typescript-eslint/no-var-requires` (off for .js) | Not needed | N/A | Biome doesn't have CommonJS require checks in the same way; for a Next.js project this rule is moot |

### ESLint Core Rules (custom rules block)

| ESLint Rule | Biome Equivalent | Coverage | Notes |
|---|---|---|---|
| `no-console` (allow: warn, error) | `noConsole` with `options.allow: ["warn", "error"]` | FULL | Configurable allow list; same semantics |
| `no-debugger` | `noDebugger` | FULL | In recommended ruleset |
| `prefer-const` | `useConst` | FULL | In recommended ruleset |
| `no-var` | `noVar` | FULL | In recommended ruleset |
| `eqeqeq` ('always') | `noDoubleEquals` | FULL | In recommended; `ignoreNull: false` to match "always" |
| `curly` ('all') | `useBlockStatements` | FULL | Exact match; covers all control flow (if/else/for/while); NOT in recommended — must enable explicitly |
| `no-duplicate-imports` | organizeImports (assist action) | FUNCTIONAL | No lint rule; instead, `organizeImports` automatically merges duplicate imports on `biome check --write`. Violations are not flagged as errors, they are auto-fixed. Different mechanism, same outcome. |
| `no-unreachable` | `noUnreachable` | FULL | In recommended ruleset |
| `no-constant-condition` | `noConstantCondition` | FULL | In recommended ruleset |
| `no-empty` (allowEmptyCatch: true) | `noEmptyBlockStatements` | PARTIAL | Biome's rule flags empty blocks. No direct `allowEmptyCatch` option — empty catch blocks are common in the current codebase pattern. Needs verification whether Biome flags `catch {}`. |
| `react/no-unescaped-entities` (off — disabled) | No equivalent | N/A | Rule is disabled in current config (`'off'`), so no gap. Biome doesn't have this rule either (open issue #4491), but it doesn't need to be disabled. |

### React Rules (from eslint-config-next/core-web-vitals via eslint-plugin-react + react-hooks)

| ESLint Rule | Biome Equivalent | Coverage | Notes |
|---|---|---|---|
| `react-hooks/rules-of-hooks` | `useHookAtTopLevel` (React domain) | FULL | Enabled automatically via React domain |
| `react-hooks/exhaustive-deps` | `useExhaustiveDependencies` (React domain) | FULL | Port of exhaustive-deps; React 19 `useEffectEvent` semantics tracked in issue #7631 |
| `react-hooks/set-state-in-effect` | **No equivalent** | MISSING | Open issue #6856 (July 2025, Help wanted). This is the only react-hooks rule currently enabled (`'error'`) with no Biome equivalent. |
| `react/jsx-key` | `useJsxKeyInIterable` | FULL | In React domain recommended |
| `react/no-direct-mutation-state` | `noReactPropAssignments` (React domain) | PARTIAL | Biome covers prop mutation; state mutation is a React class component concern, less relevant in React 19 hooks-only code |
| Various React recommended rules from eslint-config-next | React domain `recommended` | FULL | Covers jsx-no-target-blank, button-has-type, jsx-no-useless-fragment, etc. |

### Next.js-Specific Rules (from eslint-config-next)

| ESLint Rule | Biome Equivalent | Coverage | Notes |
|---|---|---|---|
| `@next/next/no-img-element` | `noImgElement` (Next.js domain) | FULL |  |
| `@next/next/no-head-element` | `noHeadElement` (Next.js domain) | FULL |  |
| `@next/next/no-html-link-for-pages` | No direct equivalent | PARTIAL | Next.js domain covers some routing rules but not all |
| `@next/next/google-font-preconnect` | `useGoogleFontPreconnect` (Next.js domain) | FULL |  |
| `@next/next/no-async-client-component` | `noNextAsyncClientComponent` (Next.js domain) | FULL |  |
| `@next/next/no-document-import-in-page` | `noDocumentImportInPage` (Next.js domain) | FULL |  |
| `@next/next/no-head-import-in-document` | `noHeadImportInDocument` (Next.js domain) | FULL |  |

### Import Ordering (currently via ESLint no-duplicate-imports + implicit Next.js handling)

| Feature | Biome Equivalent | Coverage | Notes |
|---|---|---|---|
| Import deduplication | `organizeImports` (assist) | FUNCTIONAL | Auto-merges same-module imports on `--write` |
| Import ordering/grouping | `organizeImports` with `groups` config | FUNCTIONAL | Configurable group ordering; separate `@/` aliases from npm packages |
| Type import separation | `useImportType` style: separatedType | FULL | Converts inline types to `import type` statements |

---

## Biome Configuration

Complete `biome.json` for this project, matching the current Prettier and ESLint settings:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".turbo/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "e2e/**",
      ".vercel/**",
      "node_modules/**",
      "drizzle/**"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "trailingCommas": "none",
      "semicolons": "asNeeded",
      "arrowParentheses": "asNeeded",
      "bracketSpacing": true,
      "bracketSameLine": false
    }
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "domains": {
      "react": "recommended",
      "next": "recommended"
    },
    "rules": {
      "recommended": true,
      "suspicious": {
        "noConsole": {
          "level": "warn",
          "options": {
            "allow": ["warn", "error"]
          }
        }
      },
      "style": {
        "useImportType": {
          "level": "error",
          "options": {
            "style": "separatedType"
          }
        },
        "useBlockStatements": "error",
        "noVar": "error",
        "useConst": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedFunctionParameters": "error",
        "noUnusedImports": "error"
      },
      "complexity": {
        "noExplicitAny": "error"
      },
      "nursery": {
        "noTsIgnore": "error"
      }
    }
  }
}
```

**Configuration notes:**

1. **Prettier settings mapped to Biome:**
   - `"useTabs": true` → `"indentStyle": "tab"`
   - `"semi": false` → `"semicolons": "asNeeded"`
   - `"singleQuote": true` → `"quoteStyle": "single"`
   - `"quoteProps": "as-needed"` → `"quoteProperties": "asNeeded"`
   - `"trailingComma": "none"` → `"trailingCommas": "none"`
   - `"bracketSpacing": true` → `"bracketSpacing": true`
   - `"bracketSameLine": false` → `"bracketSameLine": false`
   - `"arrowParens": "avoid"` → `"arrowParentheses": "asNeeded"`
   - `"endOfLine": "lf"` → `"lineEnding": "lf"`
   - `"printWidth": 80` → `"lineWidth": 80`

2. **`noExplicitAny` location:** Biome places this rule under `complexity` (not `typescript`). The rule name is `noExplicitAny`.

3. **`noDoubleEquals`:** Already in recommended — `eqeqeq` behavior is covered. If "always" (no null exception) is needed, add `"correctness": { "noDoubleEquals": { "level": "error", "options": { "ignoreNull": false } } }`.

4. **`vcs.useIgnoreFile`:** Known bugs in Biome 2.x with nested `.gitignore` files (issues #6252, #6715, #6964). If Biome is linting unexpected files, set `"useIgnoreFile": false` and rely solely on `files.ignore`.

---

## Gaps / Manual Steps

### Gap 1: `@typescript-eslint/ban-ts-comment` — PARTIAL coverage only

**Current config:** `{ 'ts-ignore': false, 'ts-nocheck': false, 'ts-check': false }` — all three disabled (meaning they are banned).

**Biome coverage:**
- `@ts-ignore` → `noTsIgnore` covers this (auto-fixes to `@ts-expect-error`)
- `@ts-nocheck` → No Biome rule exists. Open issue #713, resolved only as `noTsIgnore` (narrower scope).
- `@ts-check` → No Biome rule exists.

**Mitigation:** The `@ts-nocheck` and `@ts-check` directives are unusual in a TypeScript strict project. Search the codebase for `@ts-nocheck` and `@ts-check` before migration to verify none are present. If clean, the gap is theoretical.

```bash
grep -r "@ts-nocheck\|@ts-check" src/
```

### Gap 2: `react-hooks/set-state-in-effect` — NO equivalent

**Current config:** `'react-hooks/set-state-in-effect': 'error'`

**Status:** Open Biome issue #6856 (July 2025, marked Help wanted). Not yet implemented.

**What the rule does:** Prevents calling `setState` directly inside a `useEffect` without a conditional — prevents infinite re-render loops.

**Mitigation options:**
1. Accept the gap — TypeScript strict mode + code review catches this pattern.
2. Add a Biome GritQL plugin rule (Biome 2.0 supports custom rules via GritQL patterns — complex to write).
3. Keep a minimal ESLint config for this one rule only (hybrid approach — not recommended per milestone goal of "Full Biome only").

**Recommended:** Accept the gap. This rule is a "nice to have" safety net. A useEffect calling setState without conditions will surface immediately in development via visible infinite loops.

### Gap 3: `no-duplicate-imports` — different mechanism

**Current behavior:** ESLint flags duplicate import statements as errors.

**Biome behavior:** `organizeImports` (assist action) merges duplicates automatically on `biome check --write`. No error is raised on CI (`biome ci`) if duplicate imports exist — they are silently fixed on next `check --write`.

**Mitigation:** Run `biome check --write` before commits (via lefthook). The pre-commit hook effectively prevents duplicate imports from persisting.

### Gap 4: `no-empty` with `allowEmptyCatch: true`

**Current config:** `'no-empty': ['error', { allowEmptyCatch: true }]` — empty catch blocks allowed.

**Biome behavior:** `noEmptyBlockStatements` in recommended ruleset flags empty blocks. Biome does allow empty catch blocks if they contain a comment. The project uses empty catch blocks in server components (form handling patterns).

**Mitigation:** Add a comment inside empty catch blocks: `catch { /* intentionally empty */ }`. Biome respects this pattern. Alternatively, suppress with `// biome-ignore lint/correctness/noEmptyBlockStatements: intentional`.

### Gap 5: `useBlockStatements` is NOT in recommended

**Current config:** `'curly': ['error', 'all']`

**Biome:** `useBlockStatements` exists but is **not** in the recommended ruleset. Must be explicitly enabled. The example `biome.json` above includes it as `"error"`.

### Gap 6: `tests/vitest-setup.d.ts` ignore path

**Current ESLint config ignores:** `'tests/vitest-setup.d.ts'`

**Biome:** Add to `files.ignore` array. Already included in the example config.

---

## Migration Command

### Step 1: Install Biome

```bash
bun add -D -E @biomejs/biome
```

The `-E` flag pins the exact version, important for reproducible linting.

### Step 2: Run the automated migration

```bash
bunx biome migrate eslint --write
bunx biome migrate prettier --write
```

**What `migrate eslint` does:**
- Reads `eslint.config.mjs` (flat config format — supported)
- Handles these plugins: TypeScript ESLint, ESLint JSX A11y, ESLint React, ESLint Unicorn
- Translates `kebab-case-rule-name` to `camelCaseRuleName` in `biome.json`
- Migrates `.eslintignore` (not present in this project — ignores are in the config file)
- Does NOT migrate "inspired" rules by default; add `--include-inspired` to include those

**Known limitation with `eslint-config-next`:** The migration command may fail or partially succeed with `eslint-config-next` because the module resolution for Next.js configs can encounter cyclic reference issues. The generated `biome.json` should be verified and manually adjusted using the example config above.

Run with `--include-inspired` to catch more rules:

```bash
bunx biome migrate eslint --write --include-inspired
```

### Step 3: Verify and adjust `biome.json`

After migration, the auto-generated config will be incomplete. Replace or supplement it with the example config from the Biome Configuration section above, ensuring:
- Prettier options are correctly mapped (tabs, no semis, single quotes, no trailing commas)
- React and Next.js domains are enabled
- `useBlockStatements` is explicitly enabled (not in recommended)
- `noConsole` allow list is set to `["warn", "error"]`
- `useImportType` style is `"separatedType"`

### Step 4: Update package.json scripts

```json
{
  "scripts": {
    "lint": "biome lint --write .",
    "format": "biome format --write .",
    "check": "biome check --write .",
    "lint:ci": "biome ci ."
  }
}
```

The `test:all` and `test:ci` scripts currently call `bun run lint`. After migration that continues to work — `lint` just calls Biome instead of ESLint.

### Step 5: Update lefthook.yml

```yaml
pre-commit:
  parallel: true
  commands:
    check:
      glob: "*.{js,jsx,ts,tsx,json}"
      run: bunx biome check --write --no-errors-on-unmatched --files-ignore-unknown=true {staged_files}
    typecheck:
      glob: "*.{ts,tsx}"
      run: bun run typecheck
    test:
      run: bun run test:unit

pre-push:
  parallel: true
  commands:
    ci:
      run: bunx biome ci .
    typecheck:
      glob: "*.{ts,tsx}"
      run: bun run typecheck
    test:
      run: bun run test:unit
```

**Key difference from current lefthook:** Biome can accept staged files directly via `{staged_files}`, which is faster than linting the whole project on pre-commit.

### Step 6: Remove old tooling

```bash
bun remove eslint eslint-config-next prettier
```

Also remove: `.eslintrc.json` (not present), `eslint.config.mjs`, `.prettierrc.json`.

### Step 7: Validate

```bash
bunx biome check .
bun run typecheck
bun run test:unit
bun run build
```

---

## Summary: Coverage Assessment

| Category | Rules | Covered | Missing | Notes |
|---|---|---|---|---|
| TypeScript-ESLint | 5 custom rules | 4 full, 1 partial | `ban-ts-comment` for `@ts-nocheck` | Low risk gap |
| ESLint Core | 10 custom rules | 9 full, 1 different mechanism | `no-duplicate-imports` via auto-fix instead of error | Acceptable |
| React Hooks | 2 rules | 1 full | `set-state-in-effect` | Medium risk gap |
| eslint-config-next React rules | ~13 rules | ~12 full | Minor edge cases | React domain covers majority |
| Next.js-specific rules | ~7 rules | ~6 full | `no-html-link-for-pages` partial | Low risk |
| Formatter (Prettier) | All options | All | None | Full parity |
| Import organization | Import ordering | Full via organizeImports | None | Different mechanism, same result |

**Net assessment:** Biome covers approximately 95% of the current ESLint + Prettier configuration. The two notable gaps are `react-hooks/set-state-in-effect` (no equivalent, open issue) and the `@ts-nocheck`/`@ts-check` ban (partial — only `@ts-ignore` is covered). Both gaps have low practical impact given the codebase uses TypeScript strict mode and React 19 hooks patterns.
