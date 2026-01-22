# TDD Test Suite - Quick Reference

## Quick Start

```bash
# Install dependencies
bun install

# Install Playwright browsers
bun run test:e2e:install

# Run unit tests
bun run test:unit

# Run E2E tests (fast)
bun run test:e2e:fast

# Run all tests
bun run test:all
```

---

## Test Commands Cheat Sheet

```bash
# Unit Tests
bun run test:unit                    # Run all unit tests
bun run test:unit:watch              # Watch mode
bun run test:unit:coverage           # With coverage report

# E2E Tests
bun run test:e2e                     # All browsers (Chromium, Firefox, WebKit)
bun run test:e2e:fast                # Chromium only (faster)
bun run test:e2e:ui                  # Interactive UI mode
bun run test:e2e --headed            # Show browser window
bun run test:e2e --debug             # Debug mode

# Specific Tests
bun run test:e2e --grep "Mobile"     # Mobile tests only
bun run test:e2e --grep "Dark Mode"  # Dark mode tests only
bun run test:e2e --grep "Visual"     # Visual regression only

# Screenshots
bun run test:update-snapshots        # Update all baselines
bun run test:e2e:report              # View test report

# CI Pipeline
bun run test:ci                      # Full CI test suite
```

---

## Test File Overview

| File | Tests | Run Command |
|------|-------|-------------|
| `e2e/mobile-responsiveness.spec.ts` | Mobile viewports, touch targets | `--grep "Mobile"` |
| `e2e/visual-regression.spec.ts` | Screenshot comparisons | `--grep "Visual"` |
| `e2e/dark-mode-comprehensive.spec.ts` | Dark mode, WCAG contrast | `--grep "Dark Mode"` |
| `e2e/cross-browser.spec.ts` | Browser compatibility | All by default |
| `tests/unit/api-routes.test.ts` | API validation | `bun test tests/unit/api-routes.test.ts` |

---

## Expected Test Status (RED Phase)

### Mobile Responsiveness ❌
- [ ] No horizontal scroll
- [ ] Hamburger menu on mobile
- [ ] Touch targets 44x44px
- [ ] Font sizes >= 16px mobile
- [ ] Desktop nav hidden mobile

### Visual Regression ❌
- [ ] Baseline screenshots exist
- [ ] OKLCH colors applied
- [ ] Dark mode consistent
- [ ] All pages render correctly

### Dark Mode ❌
- [ ] Theme toggle button
- [ ] localStorage persistence
- [ ] WCAG AA contrast (4.5:1)
- [ ] System preference detection
- [ ] Dark colors on all pages

### Cross-Browser ❌
- [ ] Works in Chromium
- [ ] Works in Firefox
- [ ] Works in WebKit/Safari
- [ ] OKLCH fallbacks
- [ ] No console errors

### API Tests ❌
- [ ] Form validation
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] XSS sanitization
- [ ] Error handling

---

## Test Priorities

### P0 - Critical (Must Pass)
1. No horizontal scrolling
2. Mobile navigation works
3. Forms validate inputs
4. WCAG contrast ratios
5. No console errors

### P1 - High (Should Pass)
1. Touch targets 44x44px
2. Dark mode toggle works
3. Theme persistence
4. Cross-browser compatibility
5. Visual regression baselines

### P2 - Medium (Nice to Have)
1. Animation transitions
2. Font loading optimization
3. OKLCH color support
4. Advanced rate limiting
5. Performance metrics

---

## Debugging Tips

### Visual Regression Failures
```bash
# View the diff
open playwright-report/index.html

# Update specific snapshot
bun run test:e2e --grep "home-light-desktop" --update-snapshots
```

### Mobile Test Failures
```bash
# Run single viewport
bun run test:e2e --grep "Mobile.*375"

# Debug with headed browser
bun run test:e2e --grep "Mobile" --headed --slowMo=1000
```

### Dark Mode Failures
```bash
# Test dark mode only
bun run test:e2e --grep "Dark Mode"

# Check specific contrast
bun run test:e2e --grep "WCAG.*body text"
```

### Cross-Browser Failures
```bash
# Test single browser
bun run test:e2e --project=firefox
bun run test:e2e --project=webkit

# Compare browsers
bun run test:e2e --grep "Cross-Browser.*render"
```

---

## Common Assertions

### Viewport
```typescript
expect(hasHorizontalScroll).toBe(false);
expect(bodyWidth).toBeLessThanOrEqual(viewport.width);
```

### Touch Targets
```typescript
const { width, height } = await button.boundingBox();
expect(width >= 44 && height >= 44).toBe(true);
```

### WCAG Contrast
```typescript
const contrastRatio = calculateContrast(bgColor, textColor);
expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
```

### OKLCH Colors
```typescript
const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary');
expect(primaryColor.trim()).toContain('oklch');
```

### Dark Mode
```typescript
const isDark = document.documentElement.classList.contains('dark');
expect(isDark).toBe(true);
```

---

## TDD Cycle Checklist

### RED Phase ✅
- [x] Write failing tests
- [x] Run tests (verify failures)
- [x] Document expected behavior

### GREEN Phase 🔄 (Next)
- [ ] Implement minimum code
- [ ] Run tests (verify passes)
- [ ] No refactoring yet

### REFACTOR Phase ⏳ (Later)
- [ ] Clean up code
- [ ] Remove duplication
- [ ] Improve design
- [ ] Tests still pass

---

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Unit Tests | 80% | 0% |
| E2E Tests | Critical paths | 0% |
| Mobile | All viewports | 0% |
| Dark Mode | All pages | 0% |
| Browsers | 3 browsers | 0% |

---

## Files Created

```
e2e/
├── mobile-responsiveness.spec.ts        (NEW)
├── visual-regression.spec.ts            (NEW)
├── dark-mode-comprehensive.spec.ts      (NEW)
└── cross-browser.spec.ts                (NEW)

tests/
├── TEST-SUITE-README.md                 (NEW)
└── TDD-QUICK-REFERENCE.md               (NEW)
```

---

## Next Actions

1. **Verify RED Phase**
   ```bash
   bun run test:e2e:fast
   # Should see failures
   ```

2. **Implement Features**
   - Mobile responsive navigation
   - Dark mode toggle
   - OKLCH color system
   - Form validation

3. **Verify GREEN Phase**
   ```bash
   bun run test:all
   # Should see passes
   ```

4. **Refactor**
   - Clean up implementations
   - Extract utilities
   - Document patterns

---

## Key Metrics

- **Total Tests:** ~150+ (when fully implemented)
- **Test Files:** 4 E2E + 1 Unit
- **Viewports:** 4 (mobile, tablet, desktop, wide)
- **Browsers:** 3 (Chromium, Firefox, WebKit)
- **Pages Tested:** 7+ critical pages
- **Screenshot Baselines:** 28+ (7 pages × 2 modes × 2 viewports)

---

## Resources

- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [WCAG Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [TDD Guide](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [OKLCH Colors](https://oklch.com)

---

**Last Updated:** 2025-12-17
**Test Suite Version:** 1.0.0
**Status:** RED Phase (Tests Written, Not Passing)
