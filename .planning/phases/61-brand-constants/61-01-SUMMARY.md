---
phase: 61-brand-constants
plan: "01"
status: complete
completed: 2026-04-26
---

# Plan 61-01 Summary: Brand SoT Codegen Pipeline

## What was built

- **`scripts/generate-brand-tokens.ts`** — Bun script that parses `src/app/globals.css`, extracts every `--color-*: oklch(...)` token from both `@theme` (light) and `.dark` blocks, converts oklch → sRGB hex via hand-rolled Bjorn Ottosson math (no runtime dep), emits typed output. Idempotent — skips write when content hash (timestamp-stripped) matches existing file.
- **`src/lib/_generated/brand.ts`** — generated output: 81 light tokens (BRAND), 43 dark tokens (BRAND_DARK), `BrandColor` and `BrandColorDark` types. DO NOT EDIT banner present.
- **`tests/unit/generate-brand-tokens.test.ts`** — 10 conversion tests pinned against culori reference vectors. All 10 pass.

## Pinned reference hex values (verified against culori)

Computed via culori (devDep, kept in package.json for future token additions):

| Token | OKLCH | Hex |
|---|---|---|
| `--color-primary` | `oklch(0.38 0.12 255)` | `#064180` |
| `--color-accent` | `oklch(0.72 0.16 55)` | `#ef852e` |
| `--color-foreground` | `oklch(0.145 0.015 260)` | `#070a10` |
| `--color-muted-foreground` | `oklch(0.45 0.02 255)` | `#4e5661` |
| `--color-border` | `oklch(0.88 0.015 255)` | `#d1d8e1` |
| `--color-muted` | `oklch(0.955 0.008 90)` | `#f2f0ea` |
| `--color-background` | `oklch(0.985 0.002 90)` | `#fafaf9` |
| `--color-card` | `oklch(0.995 0.001 90)` | `#fefdfd` |
| `--color-secondary` | `oklch(0.94 0.01 255)` | `#e7ecf2` |
| `--color-ring` | `oklch(0.55 0.15 255)` | `#2971c6` |

Hand-rolled math output matches culori exactly for all 10 reference tokens.

## Tooling integration

**`package.json`:**
- Added `brand:generate` script
- Updated `prepare` to chain: `lefthook install && bun run brand:generate`

**`lefthook.yml`:**
- Switched `pre-commit` from `parallel: true` to `parallel: false` (priority sequencing required)
- Added `brand-tokens` command at priority 1: glob filter on `src/app/globals.css`, runs `brand:generate` and re-stages `src/lib/_generated/brand.ts`
- `check` (biome) bumped to priority 2; `typecheck` to priority 3 — runs after the regenerated file is staged

**`biome.json`:**
- Added `!!src/lib/_generated/**` to `files.includes` — generated files are excluded from lint/format

## Pre-existing lint debt cleared

`bun run lint` exposed 10 pre-existing FIXABLE issues (9 `assist/source/organizeImports` + 1 `lint/complexity/useOptionalChain`) that would have blocked every subsequent phase verification. Ran `bun run lint:fix` once to auto-resolve. Files modified by autofix:
- `src/components/ui/{accordion,breadcrumb,card,field,select}.tsx`
- `src/components/calculators/Calculator.tsx`
- `src/lib/blog.ts`
- `src/lib/pdf/{contract,invoice,proposal}-template.tsx`
- `src/types/react-simple-maps.d.ts`

These are mechanical safe transformations (import reordering, optional-chain rewrite). No behavioral changes.

## Verification gate

- `bun run typecheck` — clean
- `bun run lint` — clean (1 warning, unchanged from baseline)
- `bun run test:unit` — 407 pass, 0 fail (10 new tests added; all green)
- `bun run brand:generate` — runs in <1s; idempotent on no-change

## Notes for downstream phases

- Consumers import from `@/lib/_generated/brand`: `import { BRAND } from '@/lib/_generated/brand'`
- Token names are camelCase derived from `--color-*` kebab-case: `--color-muted-foreground` → `BRAND.mutedForeground`
- Dark variants available as `BRAND_DARK` if a future PDF/email needs them — not used in v4.1 scope
- If a phase needs a token that doesn't exist in globals.css, ADD IT to globals.css first (don't add to brand.ts directly), then `bun run brand:generate` regenerates
