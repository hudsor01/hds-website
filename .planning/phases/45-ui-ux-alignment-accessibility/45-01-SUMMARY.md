# Phase 45-01: UI/UX Alignment & Accessibility Summary

**Fixed navbar visibility, phantom CSS utility classes, broken links, and removed AI-pattern badges**

## Accomplishments

### Navbar & Dark Mode (Original Scope)
- Increased `--color-muted-foreground-dark` from oklch(0.65) to oklch(0.85) for WCAG AA contrast
- Fixed navbar background opacity: `bg-background/20` → `bg-background/90` for reliable rendering
- Fixed tagline: removed `/80` opacity (compounding darkness in dark mode)
- Fixed navbar hover contrast: `hover:text-foreground` → `hover:text-accent-foreground` on all
  elements that use `hover:bg-accent` (amber background requires paired foreground token)
- Added `dark:text-foreground` to nav link classes for explicit dark mode override

### Homepage Text Visibility
- Fixed 4 instances of `text-muted` (references background color, not a text color) →
  `text-muted-foreground` (the correct text token) in hero trust indicators and section labels

### Phantom CSS Utility Classes (Root Cause Fix)
- Discovered 20+ utility class names referenced throughout the codebase were never defined in
  any CSS file (`py-section`, `mb-comfortable`, `space-y-sections`, `card-padding`, etc.)
- In Tailwind v4, unknown class names silently produce no CSS output - this was causing
  layout/spacing collapse across the entire site
- Added 34 lines of `@utility` definitions to globals.css covering all missing classes:
  - Section padding: `py-section`, `py-section-sm`
  - Card padding: `card-padding-sm`, `card-padding`, `card-padding-lg`
  - Margin scale: `mb-subheading`, `mb-heading`, `mb-comfortable`, `mb-content-block`,
    `mb-card-content`, `mt-heading`, `mt-card-content`
  - Button padding: `p-button`
  - Vertical stacks: `space-y-tight`, `space-y-content`, `space-y-comfortable`, `space-y-sections`
  - Z-index: `z-sticky`, `z-fixed`, `z-nav`

### Badge Removal (9 files)
- Globally removed all `Badge` component usage -- generic badges signal AI/template-generated code
- Replaced with equivalent styled `<span>` or `<div>` elements using direct Tailwind classes
- Files cleaned: card.tsx, testimonial-card.tsx, TagList.tsx, and 6 page components
- `src/components/ui/badge.tsx` itself retained (library component, not removed)

### Broken Calculator Links (Bug Fix)
- Fixed 4 hardcoded bare paths that 404 in production:
  - `/roi-calculator` → `TOOL_ROUTES.ROI_CALCULATOR` (/tools/roi-calculator)
  - `/cost-estimator` → `TOOL_ROUTES.COST_ESTIMATOR` (/tools/cost-estimator)
  - `/performance-calculator` → `TOOL_ROUTES.PERFORMANCE_CALCULATOR` (/tools/performance-calculator)
- Added `TOOL_ROUTES` import alongside existing `ROUTES` import in page.tsx

### Dead Code Removal
- Deleted `src/components/ui/CustomerLogos.tsx` -- created then immediately removed from usage,
  contained placeholder data and would mislead users if ever reactivated

### Hero Section
- Removed CustomerLogos component from hero top (was adding excessive whitespace)
- Reduced hero padding: `py-section lg:py-40` → `pt-20 pb-16 lg:pt-24 lg:pb-20`

## Files Created/Modified

- `src/app/globals.css` - Dark mode token fix, 34 new @utility definitions
- `src/components/layout/Navbar.tsx` - Opacity fixes, hover contrast token correction
- `src/app/page.tsx` - Text token fixes, hero padding, broken link fix (4 links)
- `src/components/ui/card.tsx` - Badge removal (tech stack + highlight variants)
- `src/components/testimonial-card.tsx` - Badge removal
- `src/components/ui/CustomerLogos.tsx` - DELETED (dead code)
- 6 additional page components - Badge → styled span replacement

## Decisions Made

- oklch(0.85) for muted-foreground-dark: balances WCAG AA compliance with muted aesthetic
- Navbar bg at 90%: reliable rendering while maintaining translucency
- `hover:text-accent-foreground` not `hover:text-foreground`: color system correctness
- Badge removal is cosmetic only -- no behavior changes, all visual equivalence maintained
- TOOL_ROUTES over hardcoded strings: aligns with established codebase pattern

## Issues Encountered

- First commit blocked by TypeScript error: `CustomerLogos` import left after component removal
  from JSX. Fixed by removing the unused import.
- TOOL_ROUTES vs ROUTES: initial fix used `ROUTES.ROI_CALCULATOR` which doesn't exist;
  corrected to `TOOL_ROUTES` after typecheck caught it.

## Commits

- `feat(45-01): fix dark mode navbar visibility and contrast`
- `feat(45-01): fix homepage hero section text visibility`
- `refactor: remove all Badge component usage globally`
- `feat: add CustomerLogos component for social proof` (immediately followed by removal)
- `fix: reduce excessive hero section whitespace`
- `fix: define missing spacing utility classes in globals.css`
- `fix: address PR review issues before merge` (route fixes, hover contrast, dead code removal)

## PR

https://github.com/hudsor01/hds-website/pull/120

## Next Phase Readiness

Phase 45 complete. All v2.0 extended phases finished. Ready for v3.0 milestone planning
or production deployment review.
