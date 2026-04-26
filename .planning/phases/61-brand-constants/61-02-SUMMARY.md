     [1mSTDIN[0m
[38;5;8m   1[0m [37m---[0m
[38;5;8m   2[0m [37mphase: 61-brand-constants[0m
[38;5;8m   3[0m [37mplan: "02"[0m
[38;5;8m   4[0m [37mstatus: complete[0m
[38;5;8m   5[0m [37mcompleted: 2026-04-26[0m
[38;5;8m   6[0m [37m---[0m
[38;5;8m   7[0m 
[38;5;8m   8[0m [37m# Plan 61-02 Summary: Error Pages + Meta + Manifest[0m
[38;5;8m   9[0m 
[38;5;8m  10[0m [37m## What changed[0m
[38;5;8m  11[0m 
[38;5;8m  12[0m [37m- **`src/app/global-not-found.tsx`** — full rewrite to consume globals.css via Tailwind. Added `import './globals.css'`. Replaced every `style={{...}}` with utility classes (`bg-primary`, `text-foreground`, `border-border`, etc.). Zero inline styles remain.[0m
[38;5;8m  13[0m [37m- **`src/app/global-error.tsx`** — same pattern. Preserved the `'use client'` boundary, useEffect, and BUSINESS_INFO import. Inline error icon SVG now uses `currentColor` + `text-destructive` Tailwind class. Buttons use Tailwind utilities (Tailwind handles `border-0`, `cursor-pointer` natively).[0m
[38;5;8m  14[0m [37m- **`src/app/layout.tsx`** — imported `BRAND` from `@/lib/_generated/brand`; meta `theme-color` and `msapplication-TileColor` reference `{BRAND.primary}`; dead `selection-cyan` className removed from body.[0m
[38;5;8m  15[0m [37m- **`public/manifest.json`** — `theme_color` updated from `#22d3ee` (legacy cyan-400) to `#064180` (BRAND.primary). `background_color` updated from `#09090b` (near-black, didn't match design tokens) to `#fafaf9` (matches `--color-background`). Added `_comment_theme_color` field documenting the contract back to globals.css.[0m
[38;5;8m  16[0m [37m- **`src/components/calculators/Calculator.tsx`** — manual fix for the one lint error that required unsafe-autofix: `!emailInput || !emailInput.includes('@')` collapsed to `!emailInput?.includes('@')`.[0m
[38;5;8m  17[0m [37m- **`package.json`** — removed `undici: "8.1.0"` override that broke the build (incompatible with jsdom 29.0.2's declared `^7.24.5` dependency; v8 changed the WrapHandler internal API).[0m
[38;5;8m  18[0m 
[38;5;8m  19[0m [37m## Verification[0m
[38;5;8m  20[0m 
[38;5;8m  21[0m [37m```[0m
[38;5;8m  22[0m [37mbun run typecheck   ✓[0m
[38;5;8m  23[0m [37mbun run lint        ✓ (1 pre-existing warning)[0m
[38;5;8m  24[0m [37mbun run test:unit   ✓ 407 / 0[0m
[38;5;8m  25[0m [37mbun run build       ✓ (after undici override removal)[0m
[38;5;8m  26[0m [37m```[0m
[38;5;8m  27[0m 
[38;5;8m  28[0m [37m## Cyan eliminated from in-scope files[0m
[38;5;8m  29[0m 
[38;5;8m  30[0m [37m```[0m
[38;5;8m  31[0m [37mgrep -rnE "#06b6d4|#0891b2|#0e7490|#22d3ee" \[0m
[38;5;8m  32[0m [37m  src/app/layout.tsx src/app/global-error.tsx src/app/global-not-found.tsx \[0m
[38;5;8m  33[0m [37m  public/manifest.json[0m
[38;5;8m  34[0m [37m→ zero matches[0m
[38;5;8m  35[0m [37m```[0m
[38;5;8m  36[0m 
[38;5;8m  37[0m [37m## Pending user verification[0m
[38;5;8m  38[0m 
[38;5;8m  39[0m [37m- Visit `/some-bogus-path` (404) — confirm slate-blue brand on Go Home button, slate-blue Contact Us border[0m
[38;5;8m  40[0m [37m- Throw a deliberate error to trigger global-error.tsx — confirm slate-blue Try again button, destructive-red icon[0m
[38;5;8m  41[0m [37m- Mobile browser address bar tint = `#064180` (test in mobile Safari/Chrome)[0m
