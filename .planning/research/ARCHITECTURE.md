# Architecture Research: Biome Integration

**Project:** Hudson Digital Solutions Website
**Researched:** 2026-02-24
**Confidence:** HIGH (verified against official Biome docs at biomejs.dev, version 2.4.4)

---

## Migration Sequence

Execute these steps in order. Each step is independently verifiable before proceeding.

### Step 1: Install Biome (before removing ESLint)

Run both tools in parallel temporarily to verify rule parity before removing ESLint.

```bash
bun add -D --exact @biomejs/biome
```

The `--exact` flag pins the version. Biome recommends this for lockstep consistency across environments. Current stable: **2.4.4**.

### Step 2: Initialize Biome config

```bash
bunx biome init
```

This generates a starter `biome.json` at the project root. Do not commit it yet — Step 3 overwrites it.

### Step 3: Migrate from Prettier (runs first — simpler, no rule conflicts)

```bash
bunx biome migrate prettier --write
```

Reads `.prettierrc.json` and writes formatter settings into `biome.json`. The project's Prettier config (tabs, no semi, single quotes, printWidth 80, LF) maps cleanly to Biome formatter options.

### Step 4: Migrate from ESLint

```bash
bunx biome migrate eslint --write --include-inspired
```

Reads `eslint.config.mjs` and ports rules to `biome.json`. The `--include-inspired` flag includes Biome rules that are semantically similar but not identical to ESLint rules — improves coverage at the cost of some behavioral differences. Review the output carefully.

**What the migration covers from the existing `eslint.config.mjs`:**

| ESLint Rule | Biome Equivalent | Group | Notes |
|---|---|---|---|
| `@typescript-eslint/no-unused-vars` | `noUnusedVariables` | correctness | Same `_` prefix ignore pattern supported |
| `@typescript-eslint/consistent-type-imports` | `useImportType` | style | Maps to `prefer: type-imports` behavior |
| `@typescript-eslint/no-explicit-any` | `noExplicitAny` | suspicious | Direct equivalent |
| `@typescript-eslint/no-non-null-assertion` | `noNonNullAssertion` | style | Direct equivalent |
| `@typescript-eslint/ban-ts-comment` | `noUnusedVariables` / manual review | — | Partial — Biome has `ts-ignore` suppression but no full `ban-ts-comment` with fine-grained options |
| `no-console` | `noConsole` | suspicious | Configurable `allow` list supported |
| `no-debugger` | `noDebugger` | suspicious | Direct equivalent, recommended by default |
| `prefer-const` | `useConst` | style | Direct equivalent |
| `no-var` | `noVar` | suspicious | Direct equivalent |
| `eqeqeq` | `noDoubleEquals` | suspicious | Direct equivalent |
| `curly: all` | `useBlockStatements` | style | Direct equivalent — enforces braces on all blocks |
| `no-duplicate-imports` | `noImportCycles` (v2.4) | suspicious | Import deduplication via organizer, not a direct lint rule |
| `no-unreachable` | `noUnreachable` | correctness | Recommended by default |
| `no-constant-condition` | `noConstantCondition` | correctness | Recommended by default |
| `no-empty` | `noEmptyBlockStatements` | suspicious | `allowEmptyCatch` maps to `block` scope config |
| `react/no-unescaped-entities` | `noUnescapedEntities` | correctness | Recommended in react domain |
| `react-hooks/rules-of-hooks` | `useHookAtTopLevel` | correctness | Recommended in react domain |
| `react-hooks/exhaustive-deps` | `useExhaustiveDependencies` | correctness | Recommended in react domain; behavior differs on unnecessary deps |

**Not covered by Biome (requires manual verification or accept gap):**

- `react-hooks/set-state-in-effect` — No direct Biome equivalent found. This ESLint rule is non-standard (not in `eslint-plugin-react-hooks` core). Likely a typo or custom rule. Verify whether it actually fires in the current codebase before migration.
- `@typescript-eslint/ban-ts-comment` fine-grained options — Biome suppresses `biome-ignore` comments but does not offer per-comment-type granularity matching ESLint's `{ 'ts-ignore': false }` config.
- `@next/eslint-plugin-next` rules — The `eslint-config-next` package includes Next.js-specific rules. Biome's `nextjs` domain (auto-detected from `package.json`) covers the most important ones (`noImgElement`, `noHeadElement`, `noDocumentImportInPage`, `noHeadImportInDocument`, `useGoogleFontPreconnect`, `noUnwantedPolyfillio`, `useInlineScriptId`). Rules focused on internal Next.js routing correctness (e.g., link validation) are not covered.

### Step 5: Hand-tune `biome.json`

Review the generated config against the ESLint rules table above. Manually add any rules the migration missed. See "Files to Create" section for the recommended final config.

### Step 6: Run Biome against the full codebase

```bash
bunx biome check --write src/
```

Fix any auto-fixable issues, then review remaining errors manually. Keep a diff of everything Biome changes — this is the formatting pass that rewrites files.

### Step 7: Update package.json scripts

Replace ESLint/Prettier scripts with Biome equivalents. See "Script Updates" section.

### Step 8: Update lefthook.yml

Replace ESLint-based hooks with Biome staged-file checks. See "Lefthook Changes" section.

### Step 9: Update .vscode/settings.json

Replace Prettier formatter references with Biome. See "Files to Modify" section.

### Step 10: Remove ESLint and Prettier

```bash
bun remove eslint eslint-config-next prettier
```

Delete config files. See "Files to Delete" section.

### Step 11: Update CI workflow

Rename the "Run ESLint" step to "Run Biome". See "CI Considerations" section.

### Step 12: Verify clean state

```bash
bun run lint && bun run typecheck && bun run test:unit
```

All three must pass before the milestone is complete.

---

## Files to Create

### `biome.json` (project root)

The migration commands generate this. After running Steps 3 and 4, the expected final shape should be tuned to match:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "includes": [
      "**/*.{js,jsx,ts,tsx,json,jsonc}"
    ],
    "ignoreUnknown": true
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
      "semicolons": "asNeeded",
      "quoteStyle": "single",
      "quoteProperties": "asNeeded",
      "trailingCommas": "none",
      "bracketSpacing": true,
      "bracketSameLine": false,
      "arrowParentheses": "asNeeded"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noConsole": {
          "level": "warn",
          "options": {
            "allow": ["warn", "error"]
          }
        },
        "noExplicitAny": "error",
        "noVar": "error"
      },
      "style": {
        "useConst": "error",
        "useBlockStatements": "error",
        "useImportType": "error",
        "noNonNullAssertion": "warn"
      },
      "correctness": {
        "noUnusedVariables": "error"
      }
    }
  },
  "domains": {
    "next": "recommended",
    "react": "recommended"
  },
  "overrides": [
    {
      "includes": [
        "**/*.{js,mjs,cjs}"
      ],
      "linter": {
        "rules": {
          "style": {
            "useImportType": "off"
          }
        }
      }
    },
    {
      "includes": [
        "e2e/**",
        "tests/**"
      ],
      "linter": {
        "rules": {
          "suspicious": {
            "noConsole": "off"
          }
        }
      }
    }
  ]
}
```

**Key notes on this config:**

- `vcs.useIgnoreFile: true` makes Biome respect `.gitignore`, eliminating the need for a separate ignore list for `.next/`, `node_modules/`, etc.
- `domains.next: "recommended"` is auto-detected from `package.json` but explicit declaration is more predictable.
- `domains.react: "recommended"` enables `useHookAtTopLevel` and `useExhaustiveDependencies` — the React hooks rules the project relied on from `eslint-config-next`.
- The `overrides` for `e2e/` and `tests/` disable `noConsole` since test files commonly use `console` for debugging.
- `indentStyle: "tab"` matches the current Prettier config (`useTabs: true`).
- `semicolons: "asNeeded"` matches `semi: false`.
- `trailingCommas: "none"` matches the current Prettier setting.

---

## Files to Modify

### `package.json`

See "Script Updates" section for the full diff.

### `lefthook.yml`

See "Lefthook Changes" section for the updated config.

### `.vscode/settings.json`

Replace all Prettier formatter references and ESLint settings with Biome:

**Remove:**
- All `"[language]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }` blocks
- `"editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }`
- `"eslint.validate"` key
- `"eslint.workingDirectories"` key

**Add:**
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
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

**Keep unchanged:** CSS, Markdown formatters (Prettier for CSS is acceptable — Biome CSS formatter is experimental and not recommended for production). The `"[markdown]"` entry stays as Prettier.

**IDE extension:** The Biome VSCode extension ID is `biomejs.biome`. Install it. Uninstall `esbenp.prettier-vscode` if desired (keeping it is harmless for CSS/Markdown).

### `next.config.ts`

The current version is Next.js 16.x (based on `package.json`: `"next": "16.1.6"`). In Next.js 16, `next lint` is removed and there is no `eslint` option in `next.config`. The current `next.config.ts` has no `eslint` key, so **no changes are required to `next.config.ts`**. The build no longer runs linting automatically regardless.

---

## Files to Delete

| File | Reason |
|---|---|
| `eslint.config.mjs` | Replaced by `biome.json` |
| `.prettierrc.json` | Replaced by `biome.json` formatter settings |
| `.prettierignore` | Replaced by `vcs.useIgnoreFile: true` + `.gitignore` |

Note: There is no `.eslintignore` in the project root (only in `node_modules`). The ignore patterns in `eslint.config.mjs` map to `vcs.useIgnoreFile` in Biome.

---

## Script Updates

| Old Script | New Script | Notes |
|---|---|---|
| `"lint": "eslint ."` | `"lint": "biome check --error-on-warnings src/"` | `biome check` runs lint + format check together. `--error-on-warnings` treats all warnings as CI failures. Scope to `src/` to avoid checking generated files. |
| _(none)_ | `"format": "biome format --write src/"` | New script for formatting only. No Prettier equivalent existed as a script. |
| `"test:all": "bun run lint && bun run typecheck && bun run test:unit && bun test:e2e:fast"` | `"test:all": "bun run lint && bun run typecheck && bun run test:unit && bun run test:e2e:fast"` | Fix `bun test:e2e:fast` → `bun run test:e2e:fast` (minor pre-existing bug, unrelated to Biome). |
| `"test:ci": "bun run lint && bun run typecheck && bun run test:unit && bun test:e2e"` | `"test:ci": "bun run lint && bun run typecheck && bun run test:unit && bun run test:e2e"` | Same fix. |

**Complete updated scripts block:**

```json
"scripts": {
  "dev": "next dev",
  "dev:https": "cross-env HTTPS=true next dev",
  "build": "next build --webpack",
  "start": "next start",
  "lint": "biome check --error-on-warnings src/",
  "format": "biome format --write src/",
  "generate-sitemap": "bun run scripts/generate-sitemap.ts",
  "typecheck": "tsc --noEmit",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:fast": "playwright test --project=chromium --workers=1",
  "test:e2e:a11y": "playwright test --grep '@accessibility'",
  "test:e2e:animations": "playwright test --project=animations",
  "test:e2e:animations:quick": "playwright test animations-quick.spec.ts --grep '@critical'",
  "test:e2e:report": "playwright show-report",
  "test:e2e:install": "playwright install",
  "test:unit": "bun test tests/",
  "test:unit:watch": "bun test --watch tests/",
  "test:unit:coverage": "bun test --coverage tests/",
  "test:all": "bun run lint && bun run typecheck && bun run test:unit && bun run test:e2e:fast",
  "test:ci": "bun run lint && bun run typecheck && bun run test:unit && bun run test:e2e",
  "env:setup": "cp .env.example .env.local && echo 'Created .env.local from template. Please update with your actual values.'",
  "clean": "rm -rf .next out playwright-report test-results",
  "clean:test": "rm -rf playwright-report test-results",
  "test:install": "npm run test:e2e:install",
  "test:update-snapshots": "playwright test --update-snapshots",
  "prepare": "lefthook install"
}
```

---

## Lefthook Changes

The current config runs the full lint on every pre-commit/pre-push for any matching file change. Biome enables a better pattern: run only on staged files and auto-stage fixes.

**Updated `lefthook.yml`:**

```yaml
# Lefthook configuration
# Documentation: https://github.com/evilmartians/lefthook

pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,jsx,ts,tsx,json,jsonc}"
      run: bunx biome check --write --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {staged_files}
      stage_fixed: true
    typecheck:
      glob: "*.{ts,tsx}"
      run: bun run typecheck
    test:
      run: bun run test:unit

pre-push:
  parallel: true
  commands:
    lint:
      glob: "*.{js,jsx,ts,tsx,json,jsonc}"
      run: bunx biome check --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {staged_files}
      stage_fixed: false
    typecheck:
      glob: "*.{ts,tsx}"
      run: bun run typecheck
    test:
      run: bun run test:unit
```

**Key changes from current config:**

| Aspect | Before | After |
|---|---|---|
| Lint command | `bun run lint` (full repo ESLint scan) | `bunx biome check --write ... {staged_files}` (staged files only) |
| Auto-fix | None — ESLint did not auto-fix in hooks | `--write` + `stage_fixed: true` on pre-commit applies safe fixes and re-stages |
| Pre-push | Same full scan as pre-commit | Staged-file check without `--write` (read-only verification) |
| Speed | Full repo scan each time | Per-file Biome — significantly faster |

**Flag explanation:**

- `{staged_files}`: Lefthook expands this to the list of staged files. Biome receives only changed files.
- `--write`: Applies formatter and safe lint fixes. Pre-commit only — pre-push is read-only.
- `--no-errors-on-unmatched`: Prevents errors when no staged files match the glob (e.g., committing only a `.md` file).
- `--files-ignore-unknown=true`: Silently skips file types Biome does not process.
- `--colors=off`: Cleaner output in terminal hooks.
- `stage_fixed: true`: After Biome rewrites a file, lefthook re-stages it so the commit includes the corrected version.

---

## CI Considerations

The `.github/workflows/ci.yml` `quality` job runs `bun run lint`. Since the `lint` script is updated to call Biome, **no structural changes to the CI workflow are required** — only the step name should be updated for clarity.

**Changes to `ci.yml` quality job:**

```yaml
# Before:
- name: Run ESLint
  run: bun run lint

# After:
- name: Run Biome
  run: bun run lint
```

Only the step name changes. The command (`bun run lint`) is unchanged because the `lint` script now invokes Biome.

**Cache key consideration:** The CI cache key uses `bun.lockb`. After removing ESLint and Prettier packages, `bun.lockb` changes. The existing cache restore-keys pattern handles this gracefully — first run after the change will be a cache miss, subsequent runs will hit.

**No new secrets or environment variables needed.** Biome runs entirely locally with no external service calls.

**Vercel deployment:** Vercel runs `bun run build` via the build command. Next.js 16 does not run `next lint` during build, so Biome is not involved in the Vercel build pipeline at all. No Vercel configuration changes needed.

---

## Architecture Summary

### Data Flow: Before vs After

**Before:**
```
Developer saves file
  → Prettier (VSCode on-save) formats file
  → git commit triggered
  → lefthook pre-commit:
      → bun run lint (ESLint full repo scan)
      → bun run typecheck
      → bun run test:unit
  → CI: bun run lint (ESLint), bun run typecheck, bun run test:unit
```

**After:**
```
Developer saves file
  → Biome (VSCode on-save via biomejs.biome extension) formats + lints file
  → git commit triggered
  → lefthook pre-commit:
      → bunx biome check --write {staged_files} (staged files only, auto-fixes + re-stages)
      → bun run typecheck
      → bun run test:unit
  → CI: bun run lint (Biome full src/ scan), bun run typecheck, bun run test:unit
```

### Component Map

| Component | Old | New |
|---|---|---|
| Formatter | Prettier (`prettier` package) | Biome formatter (built into `@biomejs/biome`) |
| Linter | ESLint + `eslint-config-next` + TypeScript ESLint | Biome linter (built into `@biomejs/biome`) |
| Git hook runner | lefthook (unchanged) | lefthook (unchanged) |
| Type checker | tsc (unchanged) | tsc (unchanged) |
| Unit test runner | Bun test (unchanged) | Bun test (unchanged) |
| E2E test runner | Playwright (unchanged) | Playwright (unchanged) |
| Config file | `eslint.config.mjs` + `.prettierrc.json` | `biome.json` (single file) |
| VSCode extension | `esbenp.prettier-vscode` + `dbaeumer.vscode-eslint` | `biomejs.biome` |

### Packages Removed vs Added

**Removed from `devDependencies`:**
- `eslint`
- `eslint-config-next`
- `prettier`

**Added to `devDependencies`:**
- `@biomejs/biome` (exact version pin)

This reduces the devDependency count from 23 to 21 and removes the largest vulnerability surface (ESLint's ecosystem of 100+ transitive packages).

---

## Confidence Assessment

| Area | Confidence | Source |
|---|---|---|
| Biome v2.4.4 is current stable | HIGH | npmjs.com + biomejs.dev/blog/biome-v2-4/ |
| `biome migrate prettier/eslint` commands | HIGH | biomejs.dev/guides/migrate-eslint-prettier/ |
| Lefthook `{staged_files}` + `stage_fixed` pattern | HIGH | biomejs.dev/recipes/git-hooks/ |
| React domain hooks rules coverage | HIGH | biomejs.dev/linter/domains/ |
| Next.js 16 removes `next lint` from build | HIGH | vercel/next.js discussion #59347, Next.js changelog |
| `no-duplicate-imports` gap | MEDIUM | Biome import organizer merges duplicates but no standalone lint rule confirmed |
| `react-hooks/set-state-in-effect` gap | LOW | Non-standard rule; behavior unclear without testing against actual codebase |
| `ban-ts-comment` partial coverage | MEDIUM | Biome has ts-comment suppression but config granularity not verified against exact ESLint options used |

---

## Sources

- [Biome Getting Started](https://biomejs.dev/guides/getting-started/)
- [Biome Migration from ESLint & Prettier](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [Biome Git Hooks Recipe (Lefthook)](https://biomejs.dev/recipes/git-hooks/)
- [Biome Domains](https://biomejs.dev/linter/domains/)
- [Biome v2.4 Release](https://biomejs.dev/blog/biome-v2-4/)
- [Biome Rules Sources (ESLint mapping)](https://biomejs.dev/linter/rules-sources/)
- [useExhaustiveDependencies](https://biomejs.dev/linter/rules/use-exhaustive-dependencies/)
- [useHookAtTopLevel](https://biomejs.dev/linter/rules/use-hook-at-top-level/)
- [Next.js Alternative Linters Discussion](https://github.com/vercel/next.js/discussions/59347)
- [Biome Configuration Reference](https://biomejs.dev/reference/configuration/)
