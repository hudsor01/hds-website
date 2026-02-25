# Phase 53: Biome Install & Configuration - Research

**Researched:** 2026-02-24
**Domain:** Biome 2.x — install, biome.json configuration, ESLint/Prettier parity, Tailwind v4 CSS handling
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Migration workflow:**
- Run `biome migrate eslint` then `biome migrate prettier` to generate a base `biome.json`
- Immediately strip rules that don't apply to this stack (Node.js-specific rules, older React patterns, etc.) before hand-tuning
- Baseline for what to keep: only rules that fire on the codebase. Discard anything producing 0 violations that isn't named in the success criteria
- No suppression: `bunx biome check src/` must pass with 0 errors AND 0 warnings — the codebase is already clean and correct
- Phase is not done until all 5 success criteria pass

**Rule gap policy:**
- When an ESLint rule has no Biome equivalent: pause and ask the user for direction on each instance
- All rules configured as `"error"` severity — no warnings (matches project fail-fast principle)
- Required lint domains (non-negotiable): React, React Hooks, Next.js
- A11y coverage is a bonus if Biome supports it, but not a blocker
- No need to capture an ESLint baseline — success criteria define done

**Tailwind CSS handling:**
- Do NOT use `biome-ignore` comments anywhere
- Do NOT add `globals.css` to the ignore list
- Do NOT disable CSS linting
- Researcher must find the correct Biome + Tailwind v4 configuration using official Biome and Tailwind v4 documentation
- Project uses Tailwind v4 CSS-first: `@import "tailwindcss"`, `@theme`, `@source` — no legacy `@tailwind` directives
- Only `src/app/globals.css` contains Tailwind-specific content; all other styling is Tailwind utility classes in `.tsx` files
- If Biome version needs upgrading to support Tailwind v4 at-rules properly, upgrade — don't stay on an old version for compatibility

**Formatter alignment:**
- Match current Prettier settings exactly to minimize the Phase 54 format sweep diff
- Prettier config to replicate:
  - `useTabs: true`, `tabWidth: 2`
  - `semi: false` (no semicolons)
  - `singleQuote: true`
  - `trailingComma: "none"`
  - `bracketSpacing: true`, `bracketSameLine: false`
  - `endOfLine: "lf"`, `printWidth: 80`
- Same formatter settings for all file types: JS, TS, JSON, CSS
- CSS formatter enabled (not disabled or deferred)

**Claude's Discretion:**
- `arrowParens` setting: choose whichever (`"avoid"` or `"always"`) is more performant and leads to better DX — user deferred this decision

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BIOM-01 | Developer can run `biome check .` to lint and format-check the entire codebase (replacing `eslint .`) | Installation via `bun add -D -E @biomejs/biome` + `bunx biome check src/` documented |
| BIOM-02 | Biome formatter replaces Prettier — all JS/TS/JSON files formatted consistently via `biome format` | Formatter config mapping from Prettier settings fully researched |
| BIOM-03 | React and Next.js lint rules enforced via Biome's built-in domains | `linter.domains.react: "recommended"` and `linter.domains.next: "recommended"` confirmed |
| BIOM-04 | TypeScript unused-var rules fully covered: `noUnusedVariables`, `noUnusedFunctionParameters`, `noUnusedImports` | All three rules confirmed in `correctness` group |
| BIOM-05 | Curly-braces rule enforced via `useBlockStatements` (matching current ESLint `curly: all`) | Confirmed in `style` group, must be explicitly enabled |
| BIOM-06 | Tailwind CSS directives (`@layer`, `@apply`, `@tailwind`) do not trigger false Biome lint errors | `css.parser.tailwindDirectives: true` is the official fix for Tailwind v4 at-rules; project uses `@theme`, `@source`, `@utility` not `@tailwind` |
</phase_requirements>

---

## Summary

Biome 2.4.4 is the current stable release (as of the research date). It is a single binary with zero peer dependencies covering lint, format, and import organization. Installation via Bun uses `bun add -D -E @biomejs/biome` (the `-E` flag pins the exact version). The project state already documents the pin target: `2.4.4`.

The most critical research finding is how to handle Tailwind v4 CSS at-rules. Biome 2.3 introduced `css.parser.tailwindDirectives: true` — a CSS parser option that enables recognition of Tailwind-specific syntax (`@theme`, `@utility`, `@variant`, `@apply`, `@source`). A bug in v2.3.0 where `biome ci` ignored this setting was fixed in v2.3.1. Since we target v2.4.4, this is fully functional. This is the correct, official solution — no `biome-ignore` comments, no ignore lists, no disabling CSS linting.

The `biome migrate eslint` command will fail on this project. The project's `eslint.config.mjs` uses `eslint-config-next` which internally patches ESLint via `@rushstack/eslint-patch`. When Biome's migration tool loads this config through Node.js, the patching mechanism throws "Failed to patch ESLint because the calling module was not recognized." This is a known closed-as-not-planned issue (#2935). The correct approach is to craft `biome.json` manually using the ESLint config as reference, then run `biome migrate prettier --write` for the Prettier settings (which does not have this limitation).

Two ESLint rules have no direct Biome equivalent: `react-hooks/set-state-in-effect` (open feature request #6856, not yet implemented) and `no-duplicate-imports` (no JS equivalent exists in Biome; there is only `noDuplicateAtImportRules` for CSS). Both are rule gaps requiring user direction per the gap policy.

**Primary recommendation:** Install Biome 2.4.4 exactly pinned, skip `biome migrate eslint` (it will fail), run `biome migrate prettier --write` to get formatter settings, then hand-craft the full `biome.json` using the ESLint rule mapping documented below.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @biomejs/biome | 2.4.4 (exact pin) | Unified linter + formatter | Single binary, zero deps, 10-100x faster than ESLint+Prettier combo |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| bunx | (bun built-in) | Execute Biome CLI without global install | All biome commands |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual biome.json | `biome migrate eslint` | Migration fails with eslint-config-next; manual is required |
| `css.parser.tailwindDirectives: true` | `noUnknownAtRules` ignore list | Parser option is the correct official fix; ignore list is a workaround |
| Biome 2.3.x | 2.4.4 | 2.3.0 had tailwindDirectives bug in `biome ci`; fixed in 2.3.1; 2.4.4 is fully stable |

**Installation:**
```bash
bun add -D -E @biomejs/biome
```

**Initial config (then migrate prettier):**
```bash
bunx --bun @biomejs/biome init
bunx @biomejs/biome migrate prettier --write
```

---

## Architecture Patterns

### Recommended Project Structure
```
(project root)/
├── biome.json           # Biome configuration (hand-crafted, not from migrate eslint)
├── package.json         # Update lint/format scripts to use biome
└── src/
    └── app/
        └── globals.css  # Tailwind v4 CSS — requires css.parser.tailwindDirectives: true
```

### Pattern 1: Correct biome.json for this project

**What:** The complete `biome.json` structure covering all requirements
**When to use:** This is the target configuration for Phase 53

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "files": {
    "includes": [
      "**",
      "!!.next",
      "!!out",
      "!!build",
      "!!coverage",
      "!!playwright-report",
      "!!test-results",
      "!!.vercel",
      "!!node_modules"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 80
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "none",
      "arrowParentheses": "asNeeded",
      "bracketSpacing": true,
      "bracketSameLine": false
    }
  },
  "json": {
    "formatter": {
      "enabled": true
    }
  },
  "css": {
    "parser": {
      "tailwindDirectives": true
    },
    "formatter": {
      "enabled": true,
      "indentStyle": "tab",
      "indentWidth": 2,
      "lineEnding": "lf",
      "lineWidth": 80,
      "quoteStyle": "single"
    },
    "linter": {
      "enabled": true
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedFunctionParameters": "error",
        "noUnusedImports": "error"
      },
      "style": {
        "useBlockStatements": "error",
        "noVar": "error",
        "useConst": "error",
        "useImportType": "error",
        "noNonNullAssertion": "error"
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noTsIgnore": "error",
        "noConsole": {
          "level": "error",
          "options": {
            "allow": ["warn", "error"]
          }
        },
        "noDebugger": "error",
        "noDoubleEquals": "error"
      }
    },
    "domains": {
      "react": "recommended",
      "next": "recommended"
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

**Note on arrowParens:** `"asNeeded"` (omits parens for single-arg arrows like `x => x`) matches the `.prettierrc.json` `"arrowParens": "avoid"`. This minimizes the Phase 54 format sweep diff. Source: `.prettierrc.json` confirmed `"arrowParens": "avoid"`.

### Pattern 2: Formatter Migration Command
**What:** Use `biome migrate prettier --write` to populate formatter settings from existing `.prettierrc.json`
**When to use:** After `biome init`, before hand-tuning lint rules

```bash
bunx @biomejs/biome migrate prettier --write
```

This reads `.prettierrc.json` and writes formatter options to `biome.json`. Verify the output matches the Prettier config, then hand-tune lint rules.

### Pattern 3: Verify CSS Tailwind Integration
**What:** Run biome check specifically on globals.css to verify zero at-rule errors
**When to use:** As the verification step for BIOM-06

```bash
bunx biome check --files-ignore-unknown=true src/app/globals.css
```

Or run full check and look for CSS errors:
```bash
bunx biome check src/ 2>&1 | grep -i "css\|at-rule\|theme\|source\|utility"
```

### Anti-Patterns to Avoid
- **Using `biome migrate eslint --write` directly:** Will fail with `eslint-config-next` due to `@rushstack/eslint-patch`. Skip this command entirely.
- **Adding `globals.css` to ignore list:** Locked decision prohibits this. Use `css.parser.tailwindDirectives: true` instead.
- **Setting rules to `"warn"`:** All rules must be `"error"`. If you configure severity, use `"error"` not `"warn"`. Project fail-fast principle.
- **Using the old `files.ignore` syntax:** Biome 2.x uses `files.includes` with `!!` prefix for complete exclusion.
- **Enabling `all` for domains:** Use `"recommended"` for react and next domains. `"all"` includes nursery (unstable) rules.
- **Forgetting `"$schema"` version:** Pin to `2.4.4` in `$schema` URL so IDEs validate correctly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tailwind v4 at-rule parsing | Custom ignore list in `noUnknownAtRules` | `css.parser.tailwindDirectives: true` | Official solution; parser-level fix is cleaner and handles all Tailwind v4 syntax |
| Import organization | Custom script | `assist.actions.source.organizeImports: "on"` | Biome built-in; runs with `biome check --write` |
| Formatter rule mapping | Manually type all Prettier settings | `biome migrate prettier --write` then verify | Handles the mapping automatically; still verify output |

**Key insight:** The migration path is: `biome init` → `biome migrate prettier --write` → hand-write lint rules from the ESLint rule mapping below → verify with `bunx biome check src/`.

---

## Common Pitfalls

### Pitfall 1: `biome migrate eslint` fails with eslint-config-next
**What goes wrong:** `bunx @biomejs/biome migrate eslint --write` throws "Failed to patch ESLint because the calling module was not recognized"
**Why it happens:** `eslint-config-next` uses `@rushstack/eslint-patch/modern-module-resolution` which patches the ESLint module resolution. When Biome loads the ESLint config via Node.js, the patch fails because the calling module context is unrecognized.
**How to avoid:** Skip `biome migrate eslint` entirely. Hand-craft `biome.json` using the ESLint rule mapping below. Run only `biome migrate prettier --write`.
**Warning signs:** Error message contains "calling module was not recognized" or references `@rushstack/eslint-patch`.

### Pitfall 2: Tailwind v4 at-rules produce false lint errors without `tailwindDirectives: true`
**What goes wrong:** `biome check src/` reports "Unexpected unknown at-rule: theme", "Unexpected unknown at-rule: source", "Unexpected unknown at-rule: utility" on `globals.css`
**Why it happens:** Without `css.parser.tailwindDirectives: true`, the CSS parser doesn't recognize Tailwind v4's custom at-rule syntax.
**How to avoid:** Set `css.parser.tailwindDirectives: true` in the `css.parser` section of `biome.json` BEFORE running any checks.
**Warning signs:** Any "unknown at-rule" errors in CSS files.

### Pitfall 3: `tailwindDirectives` bug in Biome 2.3.0
**What goes wrong:** `biome ci` ignores the `tailwindDirectives: true` setting and still reports Tailwind errors
**Why it happens:** Bug in 2.3.0 (issue #7835). `biome check` worked but `biome ci` did not.
**How to avoid:** We use Biome 2.4.4 which contains the fix released in 2.3.1. Not a concern at target version.
**Warning signs:** Only relevant if accidentally installing 2.3.0.

### Pitfall 4: `noEmptyBlockStatements` vs empty catch blocks
**What goes wrong:** Confusion between empty catch bindings (`catch { return false; }`) and truly empty catch blocks
**Why it happens:** The project uses ES2019 optional catch binding (`catch {` without error variable) extensively. These are NOT empty blocks — they have body content. `noEmptyBlockStatements` only flags blocks with no statements.
**How to avoid:** No action needed. Confirmed: all `catch {` occurrences in `src/` have body content (return statements, etc.). `noEmptyBlockStatements` will not fire on them. ESLint's `allowEmptyCatch: true` is irrelevant because there are no truly empty catch blocks.
**Warning signs:** If `noEmptyBlockStatements` fires unexpectedly, check whether the block body is actually empty.

### Pitfall 5: `noUnusedVariables` underscore pattern vs ESLint argsIgnorePattern
**What goes wrong:** The current ESLint config uses `argsIgnorePattern: '^_'` and `varsIgnorePattern: '^_'` to allow `_prevState`, `_something` etc.
**Why it happens:** Biome's `noUnusedVariables` has no `argsIgnorePattern` option — only `ignoreRestSiblings`. However, Biome **automatically** ignores variables starting with underscore by convention (this is built-in behavior, not a configuration option).
**How to avoid:** No configuration needed for underscore-prefixed variables. They are automatically excluded from the unused variable check. Verify with any existing `_prevState` usages in Server Actions.
**Warning signs:** If `noUnusedVariables` fires on `_prevState` params, verify Biome version is 2.4.4 (underscore convention is built-in).

### Pitfall 6: Domains may auto-enable via package.json detection
**What goes wrong:** Biome may auto-detect and enable react/next domains from `package.json` dependencies, creating implicit rule activation
**Why it happens:** Biome 2.x auto-detects domains when their dependencies are present in `package.json`. The project has `react` and `next` in dependencies.
**How to avoid:** Explicitly declare `linter.domains.react: "recommended"` and `linter.domains.next: "recommended"` in `biome.json` regardless of auto-detection. This makes configuration explicit and predictable.
**Warning signs:** Unexpected React-specific lint errors appearing without explicit domain config.

### Pitfall 7: `files.includes` vs old `files.ignore` syntax
**What goes wrong:** Using `"files": { "ignore": [".next", ...] }` which may not work correctly in Biome 2.x
**Why it happens:** Biome 2.x uses `files.includes` with negation patterns. The `!!` prefix (double exclamation) completely excludes directories from all operations including type indexing.
**How to avoid:** Use `!!` prefix for build directories (`.next`, `out`, `coverage`, `node_modules`). The `!!` variant ensures they're excluded from module graph construction as well.
**Warning signs:** Performance issues or false positives from build artifact files.

---

## ESLint Rule Mapping to Biome

Complete mapping of the project's `eslint.config.mjs` rules to Biome equivalents:

### TypeScript-specific rules (`@typescript-eslint/*`)

| ESLint Rule | Biome Rule | Group | Notes |
|-------------|------------|-------|-------|
| `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: '^_'` | `correctness.noUnusedVariables` | correctness | Biome auto-ignores `_` prefix; combine with `noUnusedFunctionParameters` and `noUnusedImports` |
| `@typescript-eslint/consistent-type-imports` with `prefer: 'type-imports'` | `style.useImportType` | style | Biome equivalent; use `"error"` |
| `@typescript-eslint/no-explicit-any` | `suspicious.noExplicitAny` | suspicious | Direct equivalent |
| `@typescript-eslint/no-non-null-assertion: 'warn'` | `style.noNonNullAssertion` | style | Set to `"error"` per project fail-fast policy |
| `@typescript-eslint/ban-ts-comment` (ts-ignore, ts-nocheck disabled) | `suspicious.noTsIgnore` | suspicious | Covers `@ts-ignore` only; no Biome rule for `@ts-nocheck` — **rule gap, minor** |
| `@typescript-eslint/no-var-requires: 'off'` for JS files | N/A | — | CommonJS require is not used; not needed |

### General ESLint rules

| ESLint Rule | Biome Rule | Group | Notes |
|-------------|------------|-------|-------|
| `no-console: { allow: ['warn', 'error'] }` | `suspicious.noConsole` with `options.allow: ["warn", "error"]` | suspicious | Direct equivalent |
| `no-debugger: 'error'` | `suspicious.noDebugger` | suspicious | Enabled by recommended |
| `prefer-const: 'error'` | `style.useConst` | style | Direct equivalent |
| `no-var: 'error'` | `style.noVar` | style | Direct equivalent |
| `eqeqeq: ['error', 'always']` | `suspicious.noDoubleEquals` | suspicious | Enabled by recommended |
| `curly: ['error', 'all']` | `style.useBlockStatements` | style | Must be explicitly enabled — NOT in recommended |
| `no-duplicate-imports: 'error'` | **NO EQUIVALENT** | — | **Rule gap** — Biome has no JS `noDuplicateImports` rule (only CSS `noDuplicateAtImportRules`) |
| `no-unreachable: 'error'` | `correctness.noUnreachable` | correctness | Enabled by recommended |
| `no-constant-condition: 'error'` | `correctness.noConstantCondition` | correctness | Enabled by recommended |
| `no-empty: { allowEmptyCatch: true }` | Not needed | — | Project has no truly empty catch blocks; all `catch {` have body content |

### React-specific rules

| ESLint Rule | Biome Rule | Group | Notes |
|-------------|------------|-------|-------|
| `react/no-unescaped-entities: 'off'` | N/A | — | Off in ESLint; Biome equivalent `noStringCaseMismatch` — not the same rule, ignore |
| `react-hooks/set-state-in-effect: 'error'` | **NO EQUIVALENT** | — | **Rule gap** — issue #6856 open, not implemented in 2.4.4 |

### Rules covered by domains

| Coverage | Via Domain | Notes |
|----------|------------|-------|
| React hooks rules (exhaustive-deps, hooks at top level) | `linter.domains.next: "recommended"` | Next domain inherits all React hook rules |
| `noImgElement` (no raw `<img>` tags) | `linter.domains.next: "recommended"` | Next.js-specific |
| `noSyncScripts` | `linter.domains.next: "recommended"` | Next.js-specific |
| `useJsxKeyInIterable`, `noChildrenProp` | `linter.domains.react: "recommended"` | React-specific |

---

## Rule Gaps Requiring User Direction

Two ESLint rules have no Biome equivalent in 2.4.4. Per the gap policy, the executor must pause and ask the user for direction on each:

**Gap 1: `no-duplicate-imports`**
- ESLint config: `'no-duplicate-imports': 'error'`
- Status: No JavaScript `noDuplicateImports` rule exists in Biome. There is only `noDuplicateAtImportRules` for CSS.
- Options: (a) Accept the gap — Biome's organizeImports assist will consolidate duplicate imports; (b) Wait for Biome to implement it
- Recommendation: Accept the gap. Biome's `assist.actions.source.organizeImports` will merge duplicate import sources automatically when running `biome check --write`.

**Gap 2: `react-hooks/set-state-in-effect`**
- ESLint config: `'react-hooks/set-state-in-effect': 'error'`
- Status: Feature request open (issue #6856), not implemented in Biome 2.4.4
- Options: (a) Accept the gap — the codebase is already clean; (b) Keep ESLint only for this rule (not aligned with migration goals)
- Recommendation: Accept the gap. The codebase is clean of violations; this is a preventive rule with no current violations.

---

## Code Examples

Verified patterns from official sources:

### Install Biome with Bun (exact pin)
```bash
# Source: https://biomejs.dev/guides/getting-started/
bun add -D -E @biomejs/biome
```

### Initialize and migrate Prettier settings
```bash
# Source: https://biomejs.dev/guides/migrate-eslint-prettier/
bunx --bun @biomejs/biome init
bunx @biomejs/biome migrate prettier --write
# DO NOT run: biome migrate eslint --write (fails with eslint-config-next)
```

### CSS Tailwind v4 at-rules — correct config
```json
{
  "css": {
    "parser": {
      "tailwindDirectives": true
    }
  }
}
```
Source: https://biomejs.dev/internals/changelog/version/2-3-0/

### Linter domains
```json
{
  "linter": {
    "domains": {
      "react": "recommended",
      "next": "recommended"
    }
  }
}
```
Source: https://biomejs.dev/linter/domains/

### noConsole with selective allow
```json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noConsole": {
          "level": "error",
          "options": {
            "allow": ["warn", "error"]
          }
        }
      }
    }
  }
}
```
Source: https://biomejs.dev/linter/rules/no-console/

### noUnusedVariables — correctness group
```json
{
  "linter": {
    "rules": {
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedFunctionParameters": "error",
        "noUnusedImports": "error"
      }
    }
  }
}
```
Sources: biomejs.dev/linter/rules/no-unused-variables/, no-unused-function-parameters/, no-unused-imports/

### useBlockStatements — must be explicitly enabled
```json
{
  "linter": {
    "rules": {
      "style": {
        "useBlockStatements": "error"
      }
    }
  }
}
```
Source: https://biomejs.dev/linter/rules/use-block-statements/

### Formatter matching Prettier config
```json
{
  "formatter": {
    "indentStyle": "tab",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 80
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "none",
      "arrowParentheses": "asNeeded",
      "bracketSpacing": true,
      "bracketSameLine": false
    }
  }
}
```
Source: `.prettierrc.json` + https://biomejs.dev/reference/configuration/

### files.includes with double-bang exclusion
```json
{
  "files": {
    "includes": [
      "**",
      "!!.next",
      "!!node_modules",
      "!!coverage",
      "!!playwright-report",
      "!!test-results"
    ]
  }
}
```
Source: https://biomejs.dev/guides/configure-biome/

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `files.ignore: [...]` | `files.includes: ["**", "!!dir"]` | Biome 2.x | `!!` prevents indexing for type inference too |
| `noUnknownAtRules` ignore list for Tailwind | `css.parser.tailwindDirectives: true` | Biome 2.3 (2025) | Parser-level fix; cleaner than rule-level workaround |
| `biome migrate eslint --write` workflow | Manual biome.json | Known limitation | Migration tool fails with eslint-config-next |
| Separate ESLint + Prettier | Single `biome check` | Biome 1.x+ | One command, one config, 10-100x faster |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Not relevant to this phase
- `biome migrate eslint` with eslint-config-next: Fails due to `@rushstack/eslint-patch`; do not attempt
- `files.ignore` syntax: Use `files.includes` with `!!` for hard exclusions

---

## Open Questions

1. **`no-duplicate-imports` gap**
   - What we know: Biome has no JS equivalent; Biome's organizeImports will consolidate imports on write
   - What's unclear: Whether the user wants this gap formally accepted or wants to investigate workarounds
   - Recommendation: Accept the gap with a note. Organizer handles deduplication on `--write`.

2. **`react-hooks/set-state-in-effect` gap**
   - What we know: Not implemented in Biome 2.4.4; open feature request; codebase is currently clean
   - What's unclear: User priority for this specific rule
   - Recommendation: Accept the gap. The codebase is clean; this is a preventive rule only.

3. **`@ts-nocheck` coverage**
   - What we know: Biome's `noTsIgnore` covers `@ts-ignore` but not `@ts-nocheck`. The ESLint config bans both.
   - What's unclear: Whether there are any `@ts-nocheck` usages in the codebase
   - Recommendation: Run `grep -r "@ts-nocheck" src/` before finalizing. If zero occurrences, the gap is academic.

4. **CSS formatter behavior on globals.css**
   - What we know: Biome CSS formatter is enabled and `tailwindDirectives: true` handles parsing
   - What's unclear: Whether Biome's CSS formatter produces correct output for `@utility` blocks with nested rules like `& > :not(:first-child) { ... }`
   - Recommendation: Run `bunx biome format --write src/app/globals.css` in isolation first to inspect the diff before running on all of `src/`.

---

## Sources

### Primary (HIGH confidence)
- https://biomejs.dev/guides/getting-started/ — Installation commands, `-E` flag, init command
- https://biomejs.dev/guides/migrate-eslint-prettier/ — Migration commands, Node.js requirement
- https://biomejs.dev/reference/configuration/ — Full config schema: formatter, JS formatter, CSS formatter, files.includes
- https://biomejs.dev/guides/configure-biome/ — files.includes with `!!` syntax, language overrides
- https://biomejs.dev/linter/domains/ — domains syntax, react/next configuration, auto-detection
- https://biomejs.dev/linter/rules/no-unused-variables/ — noUnusedVariables, ignoreRestSiblings option
- https://biomejs.dev/linter/rules/no-unused-function-parameters/ — noUnusedFunctionParameters
- https://biomejs.dev/linter/rules/no-unused-imports/ — noUnusedImports, correctness group
- https://biomejs.dev/linter/rules/use-block-statements/ — useBlockStatements, must be explicitly enabled
- https://biomejs.dev/linter/rules/no-console/ — noConsole with allow option
- https://biomejs.dev/linter/rules/use-import-type/ — useImportType, style group
- https://biomejs.dev/linter/css/rules/ — CSS rules list, noUnknownAtRules location
- https://biomejs.dev/linter/rules/no-unknown-at-rules/ — noUnknownAtRules ignore option
- https://biomejs.dev/internals/changelog/version/2-3-0/ — tailwindDirectives feature introduction
- https://biomejs.dev/internals/changelog/ — 2.4.4 confirmed as latest stable
- https://biomejs.dev/blog/biome-v2-3/ — tailwindDirectives feature details

### Secondary (MEDIUM confidence)
- https://github.com/biomejs/biome/issues/7835 — tailwindDirectives bug in 2.3.0, fixed in 2.3.1
- https://github.com/biomejs/biome/issues/7223 — unknownAtRules Tailwind v4 issue, resolved via tailwindDirectives
- https://github.com/biomejs/biome/issues/2935 — biome migrate eslint fails with eslint-config-next (closed not planned)
- https://github.com/biomejs/biome/issues/6856 — set-state-in-effect port request (open, not yet implemented)

### Tertiary (LOW confidence)
- None required — all critical claims verified with official sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — version confirmed from official changelog (2.4.4 = latest)
- Architecture (biome.json structure): HIGH — verified from official reference docs
- Tailwind v4 integration: HIGH — confirmed via official changelog and multiple issues
- Rule mapping: HIGH — each rule verified on biomejs.dev
- Rule gaps: HIGH — confirmed by searching biomejs.dev and GitHub issues
- Migration workflow: HIGH — confirmed from official migration guide + known issue #2935

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (Biome releases frequently; verify no patch changes to tailwindDirectives behavior)
