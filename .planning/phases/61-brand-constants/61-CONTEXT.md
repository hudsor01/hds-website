# Phase 61: Brand SoT via Codegen + Error/Meta/Manifest Cleanup - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning (research recommended before plan 01 — see 61-RESEARCH.md)

<domain>
## Phase Boundary

Establish `src/app/globals.css` as the LITERAL single source of truth for brand colors via build-time codegen. A small Bun script reads the `--color-*` oklch tokens from globals.css, computes their sRGB hex equivalents, and emits `src/lib/_generated/brand.json` (and a thin TS type wrapper). Any context that cannot consume CSS — React-PDF StyleSheet (phase 62), React Email components (phase 63), meta tags, manifest.json — imports from the generated file.

This phase ALSO migrates the surfaces that CAN consume globals.css directly: `global-error.tsx`, `global-not-found.tsx`. Those use Tailwind utilities, no codegen needed.

There is NO hand-maintained brand constants file. The generated file is marked DERIVED in a header banner; pre-commit and pre-build hooks regenerate it whenever globals.css changes.

</domain>

<decisions>
## Implementation Decisions

### Locked Decisions

- **Codegen output**: `src/lib/_generated/brand.ts` (not .json — TS gives us inferred types and import autocomplete; size identical). The file is checked into git so consumers can import without a build step in dev.
- **File header**: every generated file has a `// AUTO-GENERATED FROM src/app/globals.css — DO NOT EDIT MANUALLY. Regenerate with: bun run brand:generate` banner.
- **Codegen tool**: a single Bun script at `scripts/generate-brand-tokens.ts`. Parses globals.css with a regex (the `@theme` block has a known structure), converts oklch → sRGB hex via a small inline math implementation (no new dependency).
- **Conversion library**: Hand-roll the OKLCH → sRGB conversion (~50 lines, well-documented math). NO new dependency. Rationale: matches project's "no unnecessary deps" principle, conversion is deterministic and testable.
- **Hook integration**: 
  - `package.json` script `brand:generate`: runs the codegen
  - Lefthook `pre-commit`: if `src/app/globals.css` is in staged files, run `brand:generate` and re-stage `src/lib/_generated/brand.ts`
  - `prepare` script: runs `brand:generate` after `bun install` (covers fresh clones)
- **Generated tokens**: emit ALL `--color-*` tokens (light mode), plus the `.dark` variants under a `dark` namespace. Plus typography size tokens if they're useful for emails (defer; only colors needed for v4.1 scope).
- **Tests**: a `bun:test` unit test for the OKLCH → sRGB conversion function (given known oklch inputs from globals.css, asserts known hex outputs from a reference converter). Pin the reference values so any conversion drift is caught.
- **manifest.json**: hand-maintained (with a `_comment_*` sibling field pointing at `--color-primary` in globals.css). Could be auto-regenerated too, but JSON files break easily under codegen — leave as discipline-enforced for now.
- **Meta tags in layout.tsx**: import the generated module and use `BRAND.primary` (the hex string) inline.
- **Dead `selection-cyan` className**: removed (not defined anywhere)

### Claude's Discretion

- Whether to also emit dark-mode variants (recommend yes; cheap to do, future-proof for dark-themed PDFs/emails)
- Whether to emit typography size tokens (recommend NO for v4.1 — out of scope; revisit if React Email theming needs them)
- Whether the codegen script outputs a flat object or nested by token category (recommend flat — easier consumer ergonomics)

### Out of Scope

- Generating manifest.json from globals.css (manual sync acceptable; one value)
- Generating Tailwind config / theme objects (Tailwind v4 reads globals.css natively via `@theme` — no JS-side theme config needed)
- Watching for changes (just regenerate on commit/build/install)

</decisions>

<specifics>
## Surfaces in Scope

### Group A — codegen infrastructure
- NEW: `scripts/generate-brand-tokens.ts` — the codegen script
- NEW: `src/lib/_generated/brand.ts` — emitted output (checked into git, banner says DO NOT EDIT)
- NEW: `tests/unit/generate-brand-tokens.test.ts` — conversion unit tests
- MODIFIED: `package.json` — add `brand:generate` script and call it from `prepare`
- MODIFIED: `lefthook.yml` (or wherever lefthook config lives) — pre-commit hook for globals.css changes
- MODIFIED: `.gitignore` — ensure `src/lib/_generated/` is NOT gitignored (file IS checked in)
- MODIFIED: `biome.json` — exclude `src/lib/_generated/` from formatting/linting (it's generated)

### Group B — surfaces that consume globals.css directly via Tailwind (no codegen needed)
- `src/app/global-not-found.tsx` — add `import './globals.css'`, replace inline `style={{...}}` with Tailwind classes
- `src/app/global-error.tsx` — same pattern
- `src/app/layout.tsx` — remove dead `selection-cyan` className

### Group C — surfaces that import the generated brand.ts
- `src/app/layout.tsx` — meta `theme-color` and `msapplication-TileColor` use `BRAND.primary` from generated module
- `public/manifest.json` — hand-update `theme_color` to match `BRAND.primary` value, add `_comment_theme_color` sibling field

### Future consumers (in subsequent phases)
- Phase 62: React-PDF .tsx templates import BRAND for StyleSheet color values
- Phase 63: React Email v6 components import BRAND for inline style props / Tailwind config

</specifics>

<verification>
## Phase-Level Verification

After all plans complete:
- `bun run brand:generate` succeeds and emits `src/lib/_generated/brand.ts`
- The generated file's `BRAND.primary` value matches the oklch→hex conversion of `--color-primary` from globals.css (asserted in unit test)
- Pre-commit hook triggers regeneration when globals.css is modified (manual smoke test: change a token, commit, observe brand.ts updated)
- `grep -n "selection-cyan" src/` returns zero matches
- `grep -E "style=\{" src/app/global-error.tsx src/app/global-not-found.tsx` returns zero matches (full Tailwind migration)
- `grep -nE "#0891b2|#06b6d4|#0e7490" src/app/layout.tsx public/manifest.json` returns zero matches
- `bun run typecheck && bun run lint && bun run test:unit && bun run build` all pass
- Visual: 404 page, error page, and meta `theme-color` (mobile browser tab) all render with slate blue
</verification>
