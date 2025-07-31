# CSS Optimization Notes

## Analysis of Custom Utilities

### Currently Defined Utilities
1. **glass-light** - Used in LoadingStates.tsx ✅
2. **text-brand-cyan** - Maps to Tailwind's cyan-400
3. **text-brand-blue** - Maps to Tailwind's blue-500
4. **bg-brand-cyan** - Maps to Tailwind's cyan-400
5. **bg-brand-blue** - Maps to Tailwind's blue-500
6. **text-accent-400** - Maps to green-400 ✅
7. **text-warning-400** - Used in about and home pages ✅
8. **text-secondary-400** - Maps to cyan-400
9. **bg-secondary-400** - Maps to cyan-400
10. **bg-secondary-400-10** - Custom opacity variant
11. **bg-secondary-400-40** - Custom opacity variant
12. **bg-gradient-accent** - Used for gradients ✅
13. **bg-gradient-secondary** - Used for gradients ✅
14. **bg-gradient-warning** - Used in about/home pages ✅
15. **shadow-accent-500-30** - Custom shadow
16. **shadow-warning-500-30** - Used in pages ✅
17. **shadow-secondary-500-30** - Custom shadow
18. **font-roboto-flex** - Remapped to Geist fonts ✅
19. **focus-ring** - Custom focus styles

## Optimization Opportunities

### 1. Remove Duplicate Utilities
These utilities duplicate existing Tailwind classes:
- `text-brand-cyan` → Use `text-cyan-400`
- `text-brand-blue` → Use `text-blue-500`
- `bg-brand-cyan` → Use `bg-cyan-400`
- `bg-brand-blue` → Use `bg-blue-500`
- `text-secondary-400` → Use `text-cyan-400`
- `bg-secondary-400` → Use `bg-cyan-400`

### 2. Potentially Unused
Need to verify usage:
- `bg-secondary-400-10`
- `bg-secondary-400-40`
- `shadow-accent-500-30`
- `shadow-secondary-500-30`
- `focus-ring` (global focus styles already defined)

### 3. Keep These
These provide value beyond Tailwind defaults:
- `glass-light` - Custom glassmorphism effect
- `bg-gradient-accent/secondary/warning` - Complex gradients
- Font and animation utilities

## Recommendation
Instead of removing utilities one by one, consider:
1. Using Tailwind's built-in classes where possible
2. Moving complex utilities to component classes
3. Using CSS modules for component-specific styles

## Estimated Savings
- Removing duplicate utilities: ~1-2KB
- Overall CSS optimization: ~5-10KB with proper tree-shaking