# Phase 61: Brand SoT via Codegen - Research

**Researched:** 2026-04-26
**Domain:** OKLCH → sRGB conversion, build-time codegen for design tokens
**Confidence:** HIGH

<user_constraints>
## Locked Constraints (from CONTEXT.md)

- globals.css is THE source of truth; brand.ts is mechanically derived
- No new runtime dependency (hand-roll OKLCH → sRGB conversion)
- Generated file checked into git with DO NOT EDIT banner
- Pre-commit + prepare hook keeps it in sync
</user_constraints>

<oklch_to_srgb_math>
## OKLCH → sRGB Conversion (Reference Implementation)

OKLCH is OKLab + cylindrical (chroma + hue). The conversion path is:

1. **OKLCH → OKLab** (cylindrical to rectangular):
   ```
   a = c * cos(h * π / 180)
   b = c * sin(h * π / 180)
   ```

2. **OKLab → linear sRGB** (Björn Ottosson's matrices):
   ```
   l_ = (L + 0.3963377774 * a + 0.2158037573 * b)^3
   m_ = (L - 0.1055613458 * a - 0.0638541728 * b)^3
   s_ = (L - 0.0894841775 * a - 1.2914855480 * b)^3

   R_linear = +4.0767416621*l_ -3.3077115913*m_ +0.2309699292*s_
   G_linear = -1.2684380046*l_ +2.6097574011*m_ -0.3413193965*s_
   B_linear = -0.0041960863*l_ -0.7034186147*m_ +1.7076147010*s_
   ```

3. **Linear sRGB → sRGB** (gamma correction):
   ```
   For each channel x:
     if x <= 0.0031308: srgb = 12.92 * x
     else:              srgb = 1.055 * x^(1/2.4) - 0.055
   ```

4. **sRGB → hex**:
   ```
   clamp each channel to [0, 1], multiply by 255, round, hex-encode
   ```

Total LOC: ~40 lines of TypeScript. Source: Björn Ottosson's blog post (the original OKLab paper) — math is canonical and used by every implementation (culori, colorjs.io, the CSS Color Module 4 spec itself).

## Reference Test Vectors

For unit tests, pin these conversions (computed once with culori as ground truth):

| Source (oklch) | Expected (hex) |
|---|---|
| `oklch(0.38 0.12 255)` (--color-primary) | TBD — compute and pin |
| `oklch(0.72 0.16 55)` (--color-accent) | TBD |
| `oklch(0.145 0.015 260)` (--color-foreground) | TBD |
| `oklch(0.45 0.02 255)` (--color-muted-foreground) | TBD |
| `oklch(0.88 0.015 255)` (--color-border) | TBD |
| `oklch(0.955 0.008 90)` (--color-muted) | TBD |

The unit test asserts the hand-rolled function output matches each pinned value. If the conversion math is wrong, all six fail with diffs.

## Out-of-gamut handling

Some oklch values represent colors outside the sRGB gamut. The naive conversion produces values outside [0, 1] which clamping squashes. For the brand palette in `globals.css`, all values are within sRGB gamut (they were chosen for screen rendering), so naive clamping is acceptable. Document this assumption in the script header: "Inputs assumed sRGB-representable. Out-of-gamut values clamp; no perceptual fallback."

</oklch_to_srgb_math>

<globals_css_parsing>
## Parsing globals.css

The file has a known structure. The `@theme { ... }` block contains all `--color-*` definitions, one per line, in the form:

```css
--color-primary: oklch(0.38 0.12 255);
--color-accent: oklch(0.72 0.16 55);
```

A regex is sufficient:

```typescript
const tokenRegex = /^\s*(--color-[a-z0-9-]+):\s*oklch\(([^)]+)\)\s*;/gm
```

For each match: capture group 1 is the token name, group 2 is the three space-separated values (lightness chroma hue, optionally with `%` on lightness).

Edge cases to handle:
- Lightness can be a decimal (`0.38`) or percentage (`38%`) — normalize to decimal
- Some Tailwind defaults use 4 components: `oklch(0.38 0.12 255 / 0.5)` (with alpha). For the brand palette, no alpha is used. Skip alpha for v4.1; add later if needed.
- Comments inside the @theme block must not match (regex anchors with `^\s*--color` handle this)
- The `.dark { ... }` block contains the same token names with overridden values — parse those too if dark variants are emitted

The script reads `src/app/globals.css` as text, runs the regex, builds an object `{ primary: '#hex', accent: '#hex', ... }`, and emits the TypeScript file:

```typescript
// AUTO-GENERATED FROM src/app/globals.css — DO NOT EDIT MANUALLY.
// Regenerate with: bun run brand:generate
//
// Source: src/app/globals.css @theme {} block
// Conversion: oklch -> sRGB hex (Björn Ottosson formulas)
// Last generated: <ISO timestamp>

export const BRAND = {
  primary: '#2f4f7a',
  accent: '#d99550',
  foreground: '#1a1a2e',
  // ...
} as const

export type BrandColor = keyof typeof BRAND
```
</globals_css_parsing>

<hook_integration>
## Lefthook Integration

The project uses lefthook 2.1.6 (per package.json). The codegen runs in pre-commit when globals.css is staged. Sketch:

```yaml
# lefthook.yml
pre-commit:
  commands:
    brand-tokens:
      glob: 'src/app/globals.css'
      run: bun run brand:generate && git add src/lib/_generated/brand.ts
```

If the existing lefthook.yml has structure that doesn't fit this snippet exactly, adapt. The intent: when globals.css changes, brand.ts is regenerated and re-staged before the commit lands.

The `prepare` script in package.json (currently `lefthook install`) gets a chained call:

```json
"prepare": "lefthook install && bun run brand:generate"
```

This way fresh clones get the file (or it's already in git — first regeneration is a no-op).
</hook_integration>

<biome_exclusion>
## Biome / Tooling Exclusion

`src/lib/_generated/` is generated; lint/format rules don't apply. Add to `biome.json`:

```json
{
  "files": {
    "ignore": ["src/lib/_generated/**"]
  }
}
```

Verify the existing `biome.json` schema and merge correctly — Biome 2.4 supports `files.ignore` array.

TypeScript strict mode still applies — the generated file IS valid TS, just not author-maintained.
</biome_exclusion>

<risks>
## Risks & Open Questions

- **Lefthook hook order**: the brand-tokens command must run BEFORE Biome formatting, otherwise Biome may try to format the generated file before it gets re-staged. Order in lefthook.yml matters; verify by simulating a globals.css change in plan 01.
- **CI**: GitHub Actions or Vercel build doesn't run lefthook. The `prepare` script (which runs on `bun install`) handles fresh installs. For CI: either the file is already committed (normal case) OR add a CI step `bun run brand:generate && git diff --exit-code src/lib/_generated/brand.ts` to fail builds where someone forgot to commit a regeneration.
- **OKLCH out-of-gamut colors**: the brand palette is in-gamut, but if anyone adds a saturated color later (high chroma), naive clamping silently distorts it. Mitigation: unit test asserts the chosen tokens stay in-gamut; flag any future drift.
- **Reference test vectors**: must be computed with a trusted converter ONCE and pinned. Suggested workflow: install culori as a dev-only dependency for the test setup, OR compute once via online converter and hardcode. Plan 01 should resolve this — recommend culori as a `devDependencies` install just for the test, then optionally remove later.
</risks>
