# Plan 1: Remove Dead UI Components

## Objective

Remove unused shadcn/ui components that are blocking the TypeScript build.

## Analysis

Three UI components have imports for packages that exist in package.json but cause TypeScript errors:

1. **carousel.tsx** (141 lines)
   - Imports: `embla-carousel-react`
   - Usage: 0 imports found
   - Status: Dead code

2. **command.tsx** (156 lines)
   - Imports: `cmdk`
   - Usage: 0 imports found
   - Status: Dead code

3. **resizable.tsx** (75 lines)
   - Imports: `react-resizable-panels`
   - Usage: 0 imports found
   - Status: Dead code

## Verification Commands

```bash
# Verify carousel is unused
rg "from.*ui/carousel|import.*Carousel" src/ -g "*.tsx" -g "!carousel.tsx"

# Verify command is unused
rg "from.*ui/command|import.*Command" src/ -g "*.tsx" -g "!command.tsx"

# Verify resizable is unused
rg "from.*ui/resizable|import.*Resizable" src/ -g "*.tsx" -g "!resizable.tsx"
```

Expected result: No matches (0 files)

## Execution Steps

1. **Remove carousel component**
   ```bash
   rm src/components/ui/carousel.tsx
   ```

2. **Remove command component**
   ```bash
   rm src/components/ui/command.tsx
   ```

3. **Remove resizable component**
   ```bash
   rm src/components/ui/resizable.tsx
   ```

4. **Verify removal**
   ```bash
   ls src/components/ui/ | grep -E "carousel|command|resizable"
   # Should show nothing
   ```

5. **Run tests**
   ```bash
   bun test:unit
   # Expect: 342/342 passing
   ```

## Success Criteria

- [ ] carousel.tsx deleted
- [ ] command.tsx deleted
- [ ] resizable.tsx deleted
- [ ] No imports found for deleted components
- [ ] All 342 tests still passing
- [ ] Component count: 90 → 87 (-3)

## Expected Impact

- **Files removed:** 3
- **Lines removed:** ~372 lines
- **Build errors:** 3 → 0 (after dependencies removed in Plan 2)
- **Bundle size:** No change yet (dependencies still in package.json)

## Commit Message

```
refactor(phase-7): remove unused UI components (Plan 1)

Removed 3 dead shadcn/ui components that are never imported:
- carousel.tsx (embla-carousel-react dependency)
- command.tsx (cmdk dependency)
- resizable.tsx (react-resizable-panels dependency)

Verified zero usage with ripgrep across entire codebase.

Components: 90 → 87 (-3 dead code)
Lines removed: ~372
All 342 tests passing

Related dependencies will be removed in Plan 2.
```

## Rollback Plan

```bash
git checkout HEAD -- src/components/ui/carousel.tsx
git checkout HEAD -- src/components/ui/command.tsx
git checkout HEAD -- src/components/ui/resizable.tsx
```

## Next Steps

After this plan:
- Proceed to Plan 2: Remove unused dependencies
- This will fix the TypeScript build errors
