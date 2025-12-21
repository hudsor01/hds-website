# Master TODO - Business Website

**Status**: Active
**Last Updated**: 2025-12-21
**Priority**: High

---

## Overview

Comprehensive UI/UX enhancement plan to create a professional, monochromatic design system with maximum contrast and clarity. This consolidates multiple design system improvement initiatives into a single, prioritized execution plan.

---

## Design Philosophy

**Core Principles:**
- **Monochromatic Palette**: Pure black, white, and shades of gray
- **No Gradients**: Clean, flat design throughout
- **Component Consistency**: Single source of truth via shadcn/ui + CVA
- **Semantic Tokens**: All styling via globals.css design tokens
- **Type Safety**: Full TypeScript compliance
- **Accessibility**: WCAG AA compliance minimum

**Semantic Colors** (functional only):
- Success: `oklch(0.55 0.15 145)` - Green for success states
- Warning: `oklch(0.65 0.15 85)` - Amber for warnings
- Destructive: `oklch(0.50 0.22 25)` - Red for errors

---

## Phase 1: Color System Foundation

**Priority**: Critical
**Estimated Time**: 2-3 hours
**Files Modified**: 1 (`src/app/globals.css`)

### Tasks

- [ ] **Update Light Mode Colors** (lines 6-85)
  ```css
  --color-background: oklch(0.99 0 0);      /* Pure white */
  --color-foreground: oklch(0.10 0 0);      /* Pure black */
  --color-card: oklch(1 0 0);               /* White */
  --color-card-foreground: oklch(0.10 0 0); /* Black */
  --color-primary: oklch(0.15 0 0);         /* Very dark gray */
  --color-primary-foreground: oklch(0.99 0 0); /* White */
  --color-accent: oklch(0.25 0 0);          /* Dark gray */
  --color-accent-foreground: oklch(0.99 0 0);  /* White */
  --color-muted: oklch(0.95 0 0);           /* Very light gray */
  --color-muted-foreground: oklch(0.40 0 0); /* Medium gray */
  --color-border: oklch(0.90 0 0);          /* Light gray */
  --color-input: oklch(0.96 0 0);           /* Very light gray */
  ```

- [ ] **Update Dark Mode Colors** (lines 86-133)
  ```css
  --color-background: oklch(0.08 0 0);      /* Pure black */
  --color-foreground: oklch(0.98 0 0);      /* White */
  --color-card: oklch(0.12 0 0);            /* Very dark gray */
  --color-card-foreground: oklch(0.98 0 0); /* White */
  --color-primary: oklch(0.95 0 0);         /* Very light gray */
  --color-primary-foreground: oklch(0.08 0 0); /* Black */
  --color-accent: oklch(0.80 0 0);          /* Light gray */
  --color-accent-foreground: oklch(0.08 0 0);  /* Black */
  --color-muted: oklch(0.20 0 0);           /* Dark gray */
  --color-muted-foreground: oklch(0.65 0 0); /* Medium gray */
  --color-border: oklch(0.25 0 0);          /* Dark gray */
  --color-input: oklch(0.18 0 0);           /* Very dark gray */
  ```

- [ ] **Update Glass Morphism Colors** (lines 1196-1216)
  ```css
  .glass-card {
    background: oklch(0.99 0 0 / 0.9);    /* Light glass */
    border: 1px solid oklch(0.90 0 0 / 0.5);
  }

  .glass-card-light {
    background: oklch(0.98 0 0 / 0.5);   /* Lighter glass */
    border: 1px solid oklch(0.90 0 0 / 0.5);
  }

  .dark .glass-card {
    background: oklch(0.12 0 0 / 0.9);   /* Dark glass */
    border: 1px solid oklch(0.25 0 0 / 0.5);
  }
  ```

- [ ] **Remove All Gradient References**
  - Search: `grep -r "gradient" src/app/globals.css`
  - Delete: `.gradient-text`, `.bg-gradient-*`, `mask-gradient-*`

**Verification:**
```bash
bun run typecheck  # No TypeScript errors
bun run dev        # Visual check - colors updated
```

---

## Phase 2: Core UI Components

**Priority**: Critical
**Estimated Time**: 3-4 hours
**Files Modified**: 4

### Button Component (`src/components/ui/button.tsx`)

- [ ] Add `size="xl"` variant for hero CTAs
- [ ] Remove gradient hover effects
- [ ] Update to monochromatic palette
- [ ] Ensure all variants work with new colors

### GlassCard Component (`src/components/glass-card.tsx`)

- [ ] Add `hover` prop for hover effects
- [ ] Add `padding` prop: "sm" | "md" | "lg"
- [ ] Remove gradient overlays
- [ ] Update to monochromatic colors

### Badge Component (`src/components/ui/badge.tsx`)

- [ ] Add `rounded-full` variant support
- [ ] Remove any gradient variants
- [ ] Update to new color palette
- [ ] Ensure semantic variants (success/warning/danger) work

### Card Component (`src/components/ui/card.tsx`)

- [ ] Update border colors to gray scale
- [ ] Ensure compatibility with new palette
- [ ] Test all card variants

**Verification:**
```bash
bun run typecheck
bun run lint
```

---

## Phase 3: New Semantic Components

**Priority**: High
**Estimated Time**: 4-5 hours
**Files Created**: 3

### PricingCard Component (`src/components/pricing-card.tsx`)

- [ ] Extract pattern from pricing page
- [ ] Use GlassCard internally
- [ ] Props: `title, price, features, highlighted, buttonText`
- [ ] Support monochromatic highlighting

### ProjectCard Component (`src/components/project-card.tsx`)

- [ ] Extract pattern from portfolio page
- [ ] Use GlassCard internally
- [ ] Props: `title, description, image, tags, href`
- [ ] Monochromatic tag badges

### TestimonialCard Component (`src/components/testimonial-card.tsx`)

- [ ] Extract pattern from testimonials
- [ ] Use GlassCard internally
- [ ] Props: `author, role, company, content, rating`
- [ ] Gray-scale rating stars

**Verification:**
```bash
bun run typecheck
```

---

## Phase 4: High-Priority Pages

**Priority**: High
**Estimated Time**: 8-10 hours
**Files Modified**: 6

### Home Page (`src/app/page.tsx`)

- [ ] Replace all button instances with Button component
- [ ] Replace glass-card divs with GlassCard component
- [ ] Remove gradients from hero section
- [ ] Update stats section with new palette
- [ ] Ensure TestimonialCard usage

### Services Page (`src/app/services/page.tsx`)

- [ ] Replace glass-card-light with GlassCard
- [ ] Replace CTA buttons with Button component
- [ ] Update to monochromatic scheme
- [ ] Implement ServiceCard if needed

### Portfolio Page (`src/app/portfolio/page.tsx`)

- [ ] Implement ProjectCard component
- [ ] Replace filter buttons with Button component
- [ ] Remove gradient hover effects

### Pricing Page (`src/app/pricing/page.tsx`)

- [ ] Implement PricingCard component
- [ ] Replace CTA buttons with Button component
- [ ] Update highlights to gray tones

### About Page (`src/app/about/page.tsx`)

- [ ] Replace badge pills with Badge component
- [ ] Replace glass cards with GlassCard
- [ ] Replace CTA buttons

### Contact Page (`src/app/contact/page.tsx`)

- [ ] Update form styling
- [ ] Replace submit button with Button component
- [ ] Update info cards to GlassCard

**Verification:**
```bash
bun run typecheck
bun run lint
bun run dev  # Visual check each page
```

---

## Phase 5: Layout Components

**Priority**: Medium
**Estimated Time**: 2-3 hours
**Files Modified**: 2

### Navbar (`src/components/layout/Navbar.tsx`)

- [ ] Update background to gray scale
- [ ] Remove gradient overlays
- [ ] Update active link colors to dark gray
- [ ] Update hover states

### Footer (`src/components/layout/Footer.tsx`)

- [ ] Update background to dark gray
- [ ] Update link colors to light gray
- [ ] Update hover states
- [ ] Update social icon colors

**Verification:**
```bash
bun run typecheck
```

---

## Phase 6: Tool Pages (16 pages)

**Priority**: Medium
**Estimated Time**: 6-8 hours
**Files Modified**: 16

### Pages to Update

- `/roi-calculator`
- `/cost-estimator`
- `/mortgage-calculator`
- `/paystub-generator`
- `/invoice-generator`
- `/proposal-generator`
- `/contract-generator`
- `/password-generator`
- `/json-formatter`
- `/meta-tag-generator`
- `/tip-calculator`
- `/performance-calculator`
- `/texas-ttl-calculator`
- `/testimonial-collector`
- Plus 2 more tool pages

### For Each Tool Page

- [ ] Replace buttons with Button component
- [ ] Update card styling to GlassCard
- [ ] Ensure consistent monochromatic colors
- [ ] Remove any gradient effects

**Verification:**
```bash
bun run build  # Ensure all pages build
```

---

## Phase 7: Content Pages

**Priority**: Low
**Estimated Time**: 4-5 hours
**Files Modified**: ~15

### Blog & Case Studies

- [ ] `src/app/blog/page.tsx`
- [ ] `src/app/case-studies/page.tsx`
- [ ] Update card components
- [ ] Replace CTAs with Button
- [ ] Update tag/badge styling

### Other Pages

- [ ] `/testimonials`
- [ ] `/faq`
- [ ] `/privacy`
- [ ] `/help`
- [ ] `/industries/saas`
- [ ] `/industries/ecommerce`
- [ ] `/industries/healthcare`
- [ ] `/industries/fintech`
- [ ] `/industries/real-estate`
- [ ] `/resources/conversion-optimization-toolkit`
- [ ] `/resources/website-performance-checklist`

**Verification:**
```bash
bun run typecheck
bun run lint
```

---

## Phase 8: Globals.css Cleanup

**Priority**: Medium
**Estimated Time**: 1-2 hours
**Files Modified**: 1

### Remove Deprecated Classes

- [ ] Delete `.cta-primary` (lines 1444-1465)
- [ ] Delete `.cta-secondary` (lines 1467-1487)
- [ ] Delete `.button-primary` (lines 1384-1397)
- [ ] Delete `.button-secondary` (lines 1399-1415)
- [ ] Delete `.button-tertiary` (lines 1417-1432)
- [ ] Delete `.button-hover-glow` (lines 1489-1498)

### Remove Gradient Utilities

- [ ] Delete `.gradient-text` if exists
- [ ] Remove `.bg-gradient-*` patterns
- [ ] Remove `mask-gradient-*` classes

### Keep (Update Colors Only)

- `.glass-card`, `.glass-card-light`
- `.section-spacing`, `.card-padding-*`
- `.container-*`, `.grid-*`
- `.transition-*`, `.hover-lift`

**Verification:**
```bash
grep -r "cta-primary\|button-primary\|gradient-text" src/
# Should return no results after cleanup
```

---

## Phase 9: Feature Components

**Priority**: Low
**Estimated Time**: 2-3 hours
**Files Modified**: ~5

### Components to Update

- [ ] `src/components/CTASection.tsx` - Remove gradients, update buttons
- [ ] `src/components/StatsBar.tsx` - Update to monochromatic
- [ ] `src/components/ScrollToTop.tsx` - Update button color
- [ ] `src/components/ui/alert.tsx` - Update colors
- [ ] `src/components/ui/input.tsx` - Gray borders, black text

**Verification:**
```bash
bun run typecheck
```

---

## Phase 10: Testing & Validation

**Priority**: Critical
**Estimated Time**: 3-4 hours

### Build & Type Check

- [ ] Run `bun run typecheck` - Must pass
- [ ] Run `bun run lint` - Must pass
- [ ] Run `bun run build` - Must succeed

### Accessibility Testing

- [ ] Check WCAG contrast ratios (AA standards)
  - Black on white should be excellent
  - All text meets minimum 4.5:1 ratio
- [ ] Test keyboard navigation
- [ ] Verify focus states visible
- [ ] Screen reader compatibility

### Cross-browser Testing

- [ ] Chrome - All features work
- [ ] Firefox - Color rendering consistent
- [ ] Safari - Glass morphism renders correctly

### Visual Regression

- [ ] Screenshot all 48+ pages
- [ ] Verify no gradients remain
- [ ] Verify component consistency
- [ ] Verify monochromatic palette throughout

**Manual Checklist:**
- [ ] Home page - No scroll, centered content
- [ ] Services - Cards render correctly
- [ ] Portfolio - Projects display properly
- [ ] Pricing - Cards highlighted correctly
- [ ] About - Team section looks good
- [ ] Contact - Form styles updated
- [ ] All tool pages functional
- [ ] Blog cards consistent
- [ ] Navbar works in light/dark
- [ ] Footer renders correctly

---

## Phase 11: Documentation & Cleanup

**Priority**: Low
**Estimated Time**: 1-2 hours

### Final Steps

- [ ] Update README.md with new design system notes
- [ ] Document color palette in design system guide
- [ ] Delete old plan files from `/Users/richard/.claude/plans/`
- [ ] Commit all changes with detailed message
- [ ] Delete this master_todo.md file

### Commit Message Template

```
feat: implement monochromatic design system

BREAKING CHANGE: Complete UI/UX overhaul to monochromatic palette

- Updated all color tokens to black/white/gray scale
- Removed all gradient effects
- Standardized component usage across 48+ pages
- Updated button, card, badge components
- Created PricingCard, ProjectCard, TestimonialCard
- Cleaned up deprecated CSS classes
- Maintained semantic colors (green/amber/red) for states
- WCAG AA accessibility compliance verified

Affected:
- 150+ files modified
- 6 new components created
- All pages updated to new palette
- globals.css completely refactored
```

---

## Success Criteria

### Visual Consistency
- ✅ **Monochromatic Palette**: Only black/white/gray (except semantic)
- ✅ **No Gradients**: Zero gradient effects anywhere
- ✅ **Component Consistency**: All 66 glass-card instances use GlassCard
- ✅ **Button Standardization**: All buttons use Button component
- ✅ **Badge Consistency**: All badges use Badge component

### Technical Quality
- ✅ **Type Safety**: TypeScript compiles without errors
- ✅ **Build Success**: Production build succeeds
- ✅ **No Warnings**: Zero ESLint warnings
- ✅ **Bundle Size**: Reasonable bundle size maintained

### Accessibility
- ✅ **WCAG AA**: All contrast ratios meet AA standards
- ✅ **Keyboard Nav**: All interactive elements accessible
- ✅ **Focus States**: Visible focus indicators
- ✅ **Screen Reader**: Proper ARIA labels

### Coverage
- ✅ **48+ Pages**: All pages updated
- ✅ **All Components**: UI components standardized
- ✅ **All Tools**: 16 tool pages consistent
- ✅ **Layouts**: Navbar and Footer updated

---

## Estimated Total Impact

**Files Affected**: 150+ files
**Time Estimate**: 40-50 hours total
**Lines Changed**: ~3,000-4,000 lines
**Components Created**: 3 new components
**Components Modified**: 15+ components
**Pages Updated**: 48+ pages

---

## Notes & Considerations

- **Backup First**: Create backup branch before starting
- **Incremental Progress**: Commit after each phase
- **Visual Testing**: Check each page in browser after updates
- **Dark Mode**: Test both light and dark modes thoroughly
- **Responsive**: Verify mobile, tablet, desktop layouts
- **Performance**: Monitor bundle size doesn't increase significantly

---

## Rollback Strategy

If issues arise:

```bash
# Find the commit before changes
git log --oneline

# Revert to previous state
git revert <commit-hash>

# Or reset to before changes
git reset --hard <commit-hash>
```

---

## Deduplication Notes

This master plan consolidates:
1. **golden-marinating-clock.md** - Original slate/charcoal UI plan
2. **shiny-pondering-shamir.md** - Monochromatic execution plan

Differences resolved:
- Chose monochromatic (black/white) over slate/charcoal as cleaner
- Combined duplicate component update tasks
- Unified verification steps
- Consolidated success criteria
- Single source of truth for color values

**Status**: Ready for execution
**Next Step**: Start with Phase 1 - Color System Foundation
