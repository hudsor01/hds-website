---
phase: 57-homepage-hero-redesign
plan: 03
subsystem: ui
tags: [homepage, tailwind, bento-grid, design-tokens, section-rhythm, anti-pattern-removal]

# Dependency graph
requires:
  - phase: 57-02
    provides: Redesigned hero section, animation-free BentoGrid/BentoCard component
  - phase: 56-design-system-foundation
    provides: Design tokens (text-section-title, py-section, surface-raised, border-border, bg-background)
provides:
  - Fully redesigned homepage with consistent section rhythm across all sections
  - Solutions section using BentoGrid + BentoCard with surface-raised tokens
  - Results section stripped of bg-muted, blur orbs, animationDelay, scale-105 transforms
  - Free Tools section with text-section-title h2, lucide ArrowRight, no hover scale transforms
  - Final CTA with variant=accent + variant=ghost Button pair at size=xl
affects:
  - 57-04 (Wave 4 verification will run full suite against complete redesign)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Solutions section: BentoGrid with auto-rows-auto + 3 BentoCards using col-span layout (2+1 on md, full on sm)"
    - "BentoCard className override: bg-surface-raised border-border shadow-sm to replace hardcoded bg-background and rgba() box-shadows"
    - "Section rhythm: all sections use py-section on bg-background — no alternating muted backgrounds"
    - "h2 pattern: text-section-title text-foreground mb-comfortable text-balance — no accent spans, no underline decorators"

key-files:
  created: []
  modified:
    - src/app/page.tsx
    - src/components/ui/bento-grid.tsx

key-decisions:
  - "Removed 'use client' from bento-grid.tsx: component is purely static layout (no hooks/events/browser APIs); required to allow Icon function props to be passed from Server Components without Next.js serialization errors"
  - "Removed solutions array and map: BentoGrid now uses inline BentoCard declarations — simpler and matches bento layout semantics (each card has different col-span)"

patterns-established:
  - "BentoGrid in Server Components: bento-grid.tsx must NOT have 'use client' when Icon function props are passed from server"
  - "Section h2 token: text-section-title (not text-responsive-2xl) for all homepage section headings"
  - "CTA pair pattern: variant=accent size=xl (primary) + variant=ghost size=xl (secondary)"

requirements-completed: [HERO-04]

# Metrics
duration: 27min
completed: 2026-02-26
---

# Phase 57 Plan 03: Homepage Hero Redesign — Section Rhythm Summary

**BentoGrid Solutions section, transform-free Results and Free Tools sections, and accent/ghost Final CTA — all 10 HERO test assertions green**

## Performance

- **Duration:** 27 min
- **Started:** 2026-02-26T16:11:12Z
- **Completed:** 2026-02-26T16:38:22Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Replaced Solutions grid (Card map over solutions array) with BentoGrid + 3 BentoCards using surface-raised tokens and col-span responsive layout
- Stripped Results section of all decorative anti-patterns: bg-muted, 3 blur orbs, animationDelay inline styles, scale-105 hover transforms, accent top-line divs, glow overlays, connecting dots
- Replaced Free Tools section SVG arrows with lucide ArrowRight; removed hover:scale-105, transform-gpu, and top accent-line decorators from all 3 tool cards
- Fixed Final CTA: plain h2 with text-section-title, primary Button variant=accent size=xl, secondary Button variant=ghost size=xl
- All 10 HERO tests pass (HERO-01 through HERO-04 fully green) — 370/370 test suite passes, build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace Solutions Grid with BentoGrid + apply section rhythm** - `01ff350` (feat)
2. **Task 2: Fix Final CTA section and unused import cleanup** - `9a85c2e` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/app/page.tsx` - Solutions section replaced with BentoGrid; Results/Free Tools/Final CTA all cleaned of anti-patterns; solutions array removed; all section h2s use text-section-title
- `src/components/ui/bento-grid.tsx` - Removed 'use client' directive (static layout component, no client hooks needed)

## Decisions Made

- Removed `'use client'` from `bento-grid.tsx`: The component is purely static layout (no hooks, no event handlers, no browser APIs). The `'use client'` directive caused Next.js to attempt serializing the `Icon` function prop across the server-client boundary during SSG/prerender, throwing "Functions cannot be passed directly to Client Components". Removing the directive makes BentoGrid a shared component that works correctly from Server Components.
- Removed `solutions` array and `.map()` call: BentoGrid uses inline BentoCard declarations because each card needs a different `col-span` (2, 1, and 3 respectively). A mapped array would complicate col-span per-item configuration without adding value.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed 'use client' from bento-grid.tsx to fix Next.js prerender error**
- **Found during:** Task 2 (build verification)
- **Issue:** `bun run build` failed with "Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with 'use server'". BentoCard accepts `Icon: React.ElementType` — passing a Lucide icon (a function) from the Server Component `page.tsx` to a Client Component (`'use client'` bento-grid.tsx) cannot be serialized.
- **Fix:** Removed `'use client'` from `src/components/ui/bento-grid.tsx`. The component uses no client-only APIs — it only renders JSX with static layout. After Plan 02's animation strip, there are no state, effects, or event handlers remaining.
- **Files modified:** `src/components/ui/bento-grid.tsx`
- **Verification:** `bun run build` succeeds; all 370 tests pass
- **Committed in:** `9a85c2e` (Task 2 commit)

**2. [Rule 3 - Blocking] Biome formatter required multi-line JSX for background prop**
- **Found during:** Task 1 (commit step)
- **Issue:** `bun run lint` reported formatter error: `background={<div className="absolute inset-0" aria-hidden="true" />}` must be split across multiple lines per Biome's JSX formatting rules
- **Fix:** Ran `bunx biome format --write src/app/page.tsx` to apply canonical formatting
- **Files modified:** `src/app/page.tsx`
- **Verification:** `bun run lint` reports "No fixes applied"
- **Committed in:** `01ff350` (Task 1 commit, reformatted before final commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for correctness. No scope creep. Build error prevented deployment; formatter fix maintains code style contract.

## Issues Encountered

- Build error on first Task 2 attempt due to `'use client'` + Icon prop serialization. Resolved by removing the unnecessary directive. The component had been marked `'use client'` historically when it contained animations — after Plan 02 stripped all animation code, the directive was no longer needed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 10 HERO test assertions pass (HERO-01 through HERO-04 all green)
- Full test suite: 370/370 pass
- Build succeeds — homepage static output verified
- TypeScript clean, Biome clean
- Ready for Phase 57-04 (Wave 4 verification)

## Self-Check: PASSED

- `src/app/page.tsx` — FOUND
- `src/components/ui/bento-grid.tsx` — FOUND
- `.planning/phases/57-homepage-hero-redesign/57-03-SUMMARY.md` — FOUND
- Commit `01ff350` — FOUND
- Commit `9a85c2e` — FOUND

---
*Phase: 57-homepage-hero-redesign*
*Completed: 2026-02-26*
