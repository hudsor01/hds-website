# Stack Research: Biome Migration

**Project:** Hudson Digital Solutions Website (hds-website)
**Milestone:** v3.1 — ESLint + Prettier → Biome
**Researched:** 2026-02-24
**Confidence:** HIGH (verified via official Next.js docs v16.1.6, Biome official docs, npm registry)

---

## Packages to Remove

| Package | Reason |
|---------|--------|
| `eslint` | Replaced entirely by Biome's linter |
| `eslint-config-next` | Next.js-specific ESLint ruleset — Biome has native `next` domain with equivalent rules |
| `prettier` | Replaced entirely by Biome's formatter |

**Config files to delete after migration:**

| File | Reason |
|------|--------|
| `eslint.config.mjs` | ESLint flat config — no longer needed |
| `.prettierrc.json` | Prettier config — Biome formatter replaces it |
| `.prettierignore` | Prettier ignore — replaced by `biome.json` VCS integration |

**Note:** `eslint-config-next` pulls in these transitive ESLint plugins as peer deps that also get removed from the dependency tree: `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `@next/eslint-plugin-next`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`. None need to be explicitly uninstalled — removing `eslint-config-next` and `eslint` drops the entire ESLint dependency subtree.

---

## Packages to Add

| Package | Version | Install Flag | Reason |
|---------|---------|-------------|--------|
| `@biomejs/biome` | `2.4.4` (pin exact) | `--save-dev --save-exact` | Single Rust binary replacing ESLint + Prettier. Version pinned with `--save-exact` per official Biome guidance to prevent unexpected breakage across team installs. |

**Install command (bun):**
```bash
bun add -d -E @biomejs/biome
```

The `-E` flag (`--save-exact`) is required. Biome's official docs mandate this to prevent the minor-version float that breaks formatting consistency across developer machines.

**Init command (run once after install):**
```bash
bunx biome init
```

This creates `biome.json` at project root.

**Migration commands (run after init to port existing config):**
```bash
bunx biome migrate eslint --write
bunx biome migrate prettier --write
```

These read `eslint.config.mjs` and `.prettierrc.json` respectively, converting them to `biome.json` equivalents.

---

## Packages to Retain

| Package | Reason |
|---------|--------|
| `lefthook` | Git hooks manager — not replaced by Biome. Hooks need script updates but the package stays. |
| `typescript` | Type checking is separate from linting. Biome does not replace `tsc --noEmit`. |
| All other devDependencies | No ESLint or Prettier dependencies remain in `devDependencies` except those two. No other packages are ESLint-adjacent in this project. |

**No hybrid needed.** The project's `eslint.config.mjs` uses only `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`, and standard rules — all of which have Biome equivalents. A hybrid (keeping ESLint for some rules) is not warranted.

---

## Version Notes

**Current stable Biome version:** `2.4.4` (published ~2026-02-21, confirmed via npm)

**Key version history context:**
- Biome 1.0 shipped August 2023
- Biome 2.0 shipped ~June 2025 (major rewrite, type inference added)
- Biome 2.4.x is current stable line as of February 2026

**Peer dependency concerns:** None. Biome has zero npm peer dependencies — it is a self-contained binary distributed as a platform-specific npm package. No cascading version conflicts possible.

**Node.js minimum:** Biome 2.x requires Node.js 18+. Project already runs on Node 20.9+ (Next.js 16 requirement), so no conflict.

**TypeScript coverage:** Biome 2.x covers ~85% of what `@typescript-eslint` catches. The specific rules in the project's `eslint.config.mjs` all have direct Biome equivalents (see Architecture/Pitfalls files for rule mapping).

---

## Integration Notes

### Next.js 16 removed `next lint`

As of Next.js 16.1.6 (the version in this project), the `next lint` command is **removed**. This project's `package.json` already uses `eslint .` directly in the `lint` script — not `next lint` — so no impact. The `eslint` option in `next.config.ts` is also removed in v16; this project's `next.config.ts` does not use it, so no change needed.

### Next.js-specific rules are covered by Biome natively

Biome 2.x ships a `next` linter domain that auto-activates when `next` is detected in `package.json`. Key rules it covers that this project's ESLint config relied on:

| ESLint rule (via eslint-config-next) | Biome equivalent |
|--------------------------------------|-----------------|
| `@next/next/no-img-element` | `lint/performance/noImgElement` (next domain, recommended) |
| `react/no-unescaped-entities` | `lint/suspicious/noReactSpecificProps` (covered) |
| `react-hooks/rules-of-hooks` | `lint/correctness/useHookAtTopLevel` |
| `react-hooks/exhaustive-deps` | `lint/correctness/useExhaustiveDependencies` |
| `@typescript-eslint/no-unused-vars` | `lint/correctness/noUnusedVariables` |
| `@typescript-eslint/no-explicit-any` | `lint/suspicious/noExplicitAny` |
| `@typescript-eslint/consistent-type-imports` | `lint/style/useImportType` |
| `no-console` | `lint/suspicious/noConsole` |
| `prefer-const` | `lint/style/useConst` |
| `eqeqeq` | `lint/suspicious/noDoubleEquals` |
| `curly` (all branches) | `lint/style/useSingleCaseStatement` / `noSingleLineBlock` |
| `no-debugger` | `lint/suspicious/noDebugger` |
| `no-var` | `lint/style/noVar` |

**Gaps requiring manual config in `biome.json`:**
- `@typescript-eslint/ban-ts-comment` → Biome has `lint/suspicious/noTsIgnore` but the project specifically allows `@ts-check` while blocking `@ts-ignore`/`@ts-nocheck`. This needs explicit rule configuration in `biome.json`.
- `react-hooks/set-state-in-effect` → Not a standard react-hooks rule; verify this was actually doing something useful or was a misconfiguration in the current ESLint config. Biome does not have a direct equivalent.
- `no-duplicate-imports` → Biome handles this via `lint/style/noDuplicateImports`.

### Formatter settings to preserve from `.prettierrc.json`

The `biome migrate prettier --write` command will handle these automatically, but for reference:

| Prettier setting | Biome equivalent |
|-----------------|-----------------|
| `useTabs: true` | `formatter.indentStyle: "tab"` |
| `tabWidth: 2` | `formatter.indentWidth: 2` |
| `semi: false` | `javascript.formatter.semicolons: "asNeeded"` |
| `singleQuote: true` | `javascript.formatter.quoteStyle: "single"` |
| `trailingComma: "none"` | `javascript.formatter.trailingCommas: "none"` |
| `printWidth: 80` | `formatter.lineWidth: 80` |
| `arrowParens: "avoid"` | `javascript.formatter.arrowParentheses: "asNeeded"` |
| `endOfLine: "lf"` | `formatter.lineEnding: "lf"` |

### `next.config.ts` — no changes needed

The project's `next.config.ts` does not reference the removed `eslint` option. No modifications required.

### `lefthook.yml` — scripts need updating

Current hooks run `bun run lint` which maps to `eslint .`. After migration:
- `lint` script → `biome check .` (lints and checks formatting)
- Or split: `biome lint .` for lint-only, `biome format --write .` for format

Recommended replacement for pre-commit:
```bash
bun run lint  # → biome check --write . (auto-fix on commit)
```

The `glob` patterns in `lefthook.yml` (`*.{js,jsx,ts,tsx}`) can be narrowed to match what Biome scans, but the default Biome glob coverage is equivalent.

### VSCode / editor integration

After installing `@biomejs/biome`, the Biome VSCode extension (`biomejs.biome`) should be installed and configured as the default formatter. This replaces Prettier extension usage. A `.vscode/settings.json` update will be needed (outside scope of this stack research).

---

## Sources

- [Biome official docs — Getting Started](https://biomejs.dev/guides/getting-started/) (HIGH confidence)
- [Biome official docs — Migrate from ESLint and Prettier](https://biomejs.dev/guides/migrate-eslint-prettier/) (HIGH confidence)
- [Biome roadmap 2026](https://biomejs.dev/blog/roadmap-2026/) — confirms v2.4 as current stable (HIGH confidence)
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — confirms `next lint` removal (HIGH confidence, official docs v16.1.6)
- [Next.js ESLint config reference](https://nextjs.org/docs/app/api-reference/config/eslint) — confirms eslint-config-next is still maintained for ESLint users, but optional (HIGH confidence)
- [Biome noImgElement rule](https://biomejs.dev/linter/rules/no-img-element/) — confirms next domain coverage (HIGH confidence)
- [@biomejs/biome npm package](https://www.npmjs.com/package/@biomejs/biome) — version 2.4.4 confirmed current (HIGH confidence)
