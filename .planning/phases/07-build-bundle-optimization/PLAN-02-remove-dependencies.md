# Plan 2: Remove Unused Dependencies

## Objective

Remove unused npm packages from package.json now that their corresponding components are deleted.

## Dependencies to Remove

Based on Plan 1 component removal:

1. **embla-carousel-react** (8.6.0)
   - Used by: carousel.tsx (deleted)
   - Size: ~18KB
   - Status: Can be removed

2. **cmdk** (1.1.1)
   - Used by: command.tsx (deleted)
   - Size: ~25KB
   - Status: Can be removed

3. **react-resizable-panels** (4.3.3)
   - Used by: resizable.tsx (deleted)
   - Size: ~12KB
   - Status: Can be removed

**Total savings:** ~55KB in dependencies

## Verification

Check these packages aren't used elsewhere:

```bash
rg "embla-carousel" src/ package.json
rg "cmdk" src/ package.json
rg "resizable-panels" src/ package.json
```

Only matches should be in package.json dependencies section.

## Execution Steps

1. **Edit package.json** - Remove 3 dependency lines
2. **Update lockfile** - `bun install`
3. **Verify build** - `bun run build`
4. **Run tests** - `bun test:unit`

## Manual Edits Required

### package.json

Remove these lines from `dependencies`:
```json
"embla-carousel-react": "8.6.0",
"cmdk": "1.1.1",
"react-resizable-panels": "4.3.3",
```

## Success Criteria

- [ ] 3 dependencies removed from package.json
- [ ] bun.lockb updated
- [ ] Build succeeds (TypeScript errors resolved)
- [ ] All 342 tests passing
- [ ] node_modules ~55KB smaller

## Expected Impact

- **Dependencies:** 130+ → 127 (-3)
- **node_modules size:** ~55KB reduction
- **TypeScript errors:** 3 → 0 ✅
- **Build:** Now succeeds

## Commit Message

```
refactor(phase-7): remove unused dependencies (Plan 2)

Removed 3 npm packages after deleting their corresponding components:
- embla-carousel-react (8.6.0) - used by deleted carousel.tsx
- cmdk (1.1.1) - used by deleted command.tsx
- react-resizable-panels (4.3.3) - used by deleted resizable.tsx

Results:
- Dependencies reduced: ~130 → ~127
- node_modules size: ~55KB smaller
- TypeScript errors: 3 → 0 (build now succeeds)
- All 342 tests passing

Build verification successful.
```

## Rollback Plan

```bash
# Restore package.json
git checkout HEAD -- package.json
bun install
```

## Next Steps

After this plan:
- Proceed to Plan 3: Measure bundle size
- Document baseline metrics
- Build should now succeed cleanly
