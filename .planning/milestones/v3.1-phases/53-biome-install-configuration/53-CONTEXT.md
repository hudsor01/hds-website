# Phase 53: Biome Install & Configuration - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Install @biomejs/biome and produce a fully tuned `biome.json` covering lint and format rules equivalent to the current ESLint + Prettier setup. Phase 53 is complete when `bunx biome check src/` passes with 0 errors and 0 warnings. Format sweep (Phase 54) and old tooling removal (Phase 55) are separate phases.

**Stack:** Next.js 16.1.6 + Tailwind CSS 4.1.18 + Bun

</domain>

<decisions>
## Implementation Decisions

### Migration workflow
- Run `biome migrate eslint` then `biome migrate prettier` to generate a base `biome.json`
- Immediately strip rules that don't apply to this stack (Node.js-specific rules, older React patterns, etc.) before hand-tuning
- Baseline for what to keep: only rules that fire on the codebase. Discard anything producing 0 violations that isn't named in the success criteria
- No suppression: `bunx biome check src/` must pass with 0 errors AND 0 warnings — the codebase is already clean and correct
- Phase is not done until all 5 success criteria pass

### Rule gap policy
- When an ESLint rule has no Biome equivalent: pause and ask the user for direction on each instance
- All rules configured as `"error"` severity — no warnings (matches project fail-fast principle)
- Required lint domains (non-negotiable): React, React Hooks, Next.js
- A11y coverage is a bonus if Biome supports it, but not a blocker
- No need to capture an ESLint baseline — success criteria define done

### Tailwind CSS handling
- Do NOT use `biome-ignore` comments anywhere
- Do NOT add `globals.css` to the ignore list
- Do NOT disable CSS linting
- Researcher must find the correct Biome + Tailwind v4 configuration using official Biome and Tailwind v4 documentation
- Project uses Tailwind v4 CSS-first: `@import "tailwindcss"`, `@theme`, `@source` — no legacy `@tailwind` directives
- Only `src/app/globals.css` contains Tailwind-specific content; all other styling is Tailwind utility classes in `.tsx` files
- If Biome version needs upgrading to support Tailwind v4 at-rules properly, upgrade — don't stay on an old version for compatibility

### Formatter alignment
- Match current Prettier settings exactly to minimize the Phase 54 format sweep diff
- Prettier config to replicate in biome.json:
  - `useTabs: true`, `tabWidth: 2`
  - `semi: false` (no semicolons)
  - `singleQuote: true`
  - `trailingComma: "none"`
  - `bracketSpacing: true`, `bracketSameLine: false`
  - `endOfLine: "lf"`, `printWidth: 80`
- Same formatter settings for all file types: JS, TS, JSON, CSS
- CSS formatter enabled (not disabled or deferred)

### Claude's Discretion
- `arrowParens` setting: choose whichever (`"avoid"` or `"always"`) is more performant and leads to better DX — user deferred this decision

</decisions>

<specifics>
## Specific Ideas

- The codebase is described as already clean and correct — `biome check src/` should pass with no violations out of the box once `biome.json` is correctly configured. No hackery, no ignores, no suppression.
- Researcher should use official Biome docs + official Tailwind v4 docs to find the proper integration pattern (not blog posts, not StackOverflow workarounds)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 53-biome-install-configuration*
*Context gathered: 2026-02-24*
