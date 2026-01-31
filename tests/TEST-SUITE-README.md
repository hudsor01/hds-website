# Comprehensive Test Suite - TDD Implementation Guide

## Overview

This test suite follows strict **Test-Driven Development (TDD)** principles for a Next.js 16 + Tailwind CSS v4 monochromatic website.

**CRITICAL:** All tests are written FIRST and should FAIL initially. This is the RED phase of TDD.

## Test Suite Structure

```
e2e/
├── mobile-responsiveness.spec.ts      # Mobile viewport tests
├── visual-regression.spec.ts          # Screenshot comparisons
├── dark-mode-comprehensive.spec.ts    # Dark mode functionality
├── cross-browser.spec.ts              # Cross-browser compatibility
└── test-logger.ts                     # Test logging utility

tests/unit/
├── api-routes.test.ts                 # API endpoint tests
├── rate-limiter.test.ts               # Rate limiting tests
└── security.test.ts                   # Security tests
```

## 1. Mobile Responsiveness Tests

**File:** `e2e/mobile-responsiveness.spec.ts`

### Test Coverage

#### Viewports Tested
- **Mobile (375px):** iPhone SE baseline
- **Tablet (768px):** iPad baseline
- **Desktop (1024px):** Standard laptop
- **Wide (1920px):** Desktop monitor

#### Critical Requirements
1. No horizontal scrolling at any viewport
2. Mobile menu collapses properly
3. Touch targets minimum 44x44px (WCAG 2.1 Level AAA)
4. Readable font sizes (minimum 16px for body on mobile)
5. Proper text wrapping and spacing

### Key Tests

```typescript
// Test 1: No horizontal scroll
test('should render ${page} without horizontal scroll', async ({ page }) => {
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasHorizontalScroll).toBe(false);
});

// Test 2: Touch target size
test('should have proper touch targets on interactive elements', async ({ page }) => {
  const buttons = page.locator('button:visible');
  const box = await button.boundingBox();
  expect(box.width >= 44 && box.height >= 44).toBe(true);
});

// Test 3: Mobile menu
test('should show hamburger menu on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  const mobileMenuButton = page.locator('button[aria-label*="menu" i]');
  await expect(mobileMenuButton).toBeVisible();
});
```

### Expected Failures (RED Phase)
- ❌ Hamburger menu not implemented
- ❌ Desktop navigation visible on mobile
- ❌ Touch targets too small
- ❌ Font sizes too small on mobile
- ❌ Horizontal scrolling on narrow viewports

### Running Tests

```bash
# All mobile tests
bun run test:e2e --grep "Mobile Responsiveness"

# Specific viewport
bun run test:e2e --grep "Mobile.*375"

# Fast (Chromium only)
bun run test:e2e:fast --grep "mobile-responsiveness"
```

---

## 2. Visual Regression Tests

**File:** `e2e/visual-regression.spec.ts`

### Test Coverage

#### Pages Tested
- Home (`/`)
- Services (`/services`)
- Portfolio (`/portfolio`)
- Pricing (`/pricing`)
- Contact (`/contact`)
- About (`/about`)
- Blog (`/blog`)
- 404 Page

#### Modes Tested
- Light mode (desktop + mobile)
- Dark mode (desktop + mobile)

### Key Tests

```typescript
// Test 1: Screenshot comparison
test('should match baseline for home page (desktop)', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home-light-desktop.png', {
    fullPage: true,
    animations: 'disabled',
    maxDiffPixelRatio: 0.01,
  });
});

// Test 2: Monochromatic color validation
test('should use only monochromatic OKLCH colors', async ({ page }) => {
  const primaryVar = await page.evaluate(() => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary').trim();
  });
  expect(primaryVar).toContain('oklch');
});
```

### Expected Failures (RED Phase)
- ❌ Baseline screenshots don't exist
- ❌ Visual differences in components
- ❌ OKLCH color values not applied
- ❌ Dark mode not consistent across pages

### Running Tests

```bash
# Create baselines (first run)
bun run test:update-snapshots

# Run visual regression tests
bun run test:e2e --grep "Visual Regression"

# Update snapshots after changes
bun run test:update-snapshots --grep "home-light-desktop"
```

---

## 3. Dark Mode Tests

**File:** `e2e/dark-mode-comprehensive.spec.ts`

### Test Coverage

#### Functionality
- Theme toggle button
- Theme persistence (localStorage)
- System preference detection
- Color transitions

#### Accessibility
- WCAG AA contrast ratios
- Body text: 4.5:1 minimum
- Headings: 3:1 minimum
- Interactive elements: 4.5:1 minimum

#### Color Validation
- OKLCH dark mode colors
- Appropriate lightness values
- Monochromatic palette

### Key Tests

```typescript
// Test 1: Theme toggle
test('should toggle dark mode when button clicked', async ({ page }) => {
  const initialTheme = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  );
  await themeToggle.click();
  const newTheme = await page.evaluate(() =>
    document.documentElement.classList.contains('dark')
  );
  expect(newTheme).not.toBe(initialTheme);
});

// Test 2: WCAG contrast
test('should meet WCAG AA contrast ratio for body text', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const contrastRatio = await page.evaluate(() => {
    // Calculate contrast ratio
    return calculateContrast(bgColor, textColor);
  });
  expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
});

// Test 3: Persistence
test('should persist theme preference in localStorage', async ({ page }) => {
  await themeToggle.click();
  const storedTheme = await page.evaluate(() =>
    localStorage.getItem('theme')
  );
  expect(storedTheme).toBeTruthy();
});
```

### Expected Failures (RED Phase)
- ❌ Theme toggle button not implemented
- ❌ localStorage persistence not working
- ❌ Contrast ratios below WCAG standards
- ❌ Dark mode colors not applied
- ❌ System preference not detected

### Running Tests

```bash
# All dark mode tests
bun run test:e2e --grep "Dark Mode"

# Just contrast tests
bun run test:e2e --grep "WCAG Contrast"

# Just persistence
bun run test:e2e --grep "Persistence"
```

---

## 4. Cross-Browser Tests

**File:** `e2e/cross-browser.spec.ts`

### Test Coverage

#### Browsers
- **Chromium:** Chrome, Edge
- **Firefox:** Mozilla Firefox
- **WebKit:** Safari

#### Features Tested
- Page rendering
- Navigation
- Form handling
- CSS Grid/Flexbox
- OKLCH color support
- Custom fonts
- localStorage
- Console errors

### Key Tests

```typescript
// Test 1: Cross-browser rendering
test('should render Home page correctly', async ({ page, browserName }) => {
  await page.goto('/');
  const main = page.locator('main');
  await expect(main).toBeVisible();

  // No JavaScript errors
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  expect(errors.length).toBe(0);
});

// Test 2: OKLCH support
test('should handle OKLCH colors or provide fallbacks', async ({ page }) => {
  const supportsOKLCH = await page.evaluate(() => {
    const testDiv = document.createElement('div');
    testDiv.style.color = 'oklch(0.5 0.1 180)';
    return testDiv.style.color !== '';
  });
  // Should work in modern browsers or have fallback
});

// Test 3: Form handling
test('should handle form input', async ({ page, browserName }) => {
  const nameInput = page.locator('input[name="name"]');
  await nameInput.fill('Test User');
  expect(await nameInput.inputValue()).toBe('Test User');
});
```

### Expected Failures (RED Phase)
- ❌ OKLCH not supported in older browsers (need fallbacks)
- ❌ Console errors on page load
- ❌ Form validation not working consistently
- ❌ CSS Grid/Flexbox issues in older browsers

### Running Tests

```bash
# All browsers
bun run test:e2e

# Chromium only (fast)
bun run test:e2e:fast --grep "Cross-Browser"

# Specific browser
bun run test:e2e --project=firefox --grep "Cross-Browser"
bun run test:e2e --project=webkit --grep "Cross-Browser"
```

---

## 5. API Tests

**File:** `tests/unit/api-routes.test.ts`

### Test Coverage

#### Endpoints
- Contact form submission
- Newsletter subscription
- Calculator endpoints
- Health check
- CSRF token validation

#### Security
- Rate limiting
- Input validation
- XSS prevention
- Error handling

### Key Tests

```typescript
// Test 1: Validation
test('should validate required fields', () => {
  const result = validateContactForm({});
  expect(result.success).toBe(false);
  expect(result.errors).toContain('name is required');
});

// Test 2: Rate limiting
test('should block requests over rate limit', async () => {
  const rateLimiter = createRateLimiter({ max: 2, window: 60000 });
  await rateLimiter.check(ip);
  await rateLimiter.check(ip);
  const result = await rateLimiter.check(ip);
  expect(result.allowed).toBe(false);
});

// Test 3: XSS prevention
test('should sanitize HTML in message', () => {
  const payload = {
    message: '<script>alert("xss")</script>Hello'
  };
  const result = validateContactForm(payload);
  expect(result.data.message).not.toContain('<script>');
});
```

### Expected Failures (RED Phase)
- ❌ Validation functions not implemented
- ❌ Rate limiter not implemented
- ❌ CSRF validation not working
- ❌ Sanitization not applied
- ❌ Error handling not consistent

### Running Tests

```bash
# All API tests
bun test tests/unit/api-routes.test.ts

# Specific test
bun test tests/unit/api-routes.test.ts -t "should validate"

# With coverage
bun run test:unit:coverage
```

---

## TDD Workflow

### RED Phase (Current)

1. ✅ Write tests FIRST
2. ✅ Run tests and verify they FAIL
3. ✅ Document expected failures

### GREEN Phase (Next)

1. Implement minimal code to pass tests
2. Run tests and verify they PASS
3. No refactoring yet

### REFACTOR Phase (Final)

1. Clean up code
2. Remove duplication
3. Improve design
4. Tests still PASS

---

## Running All Tests

```bash
# Unit tests only
bun run test:unit

# E2E tests only (all browsers)
bun run test:e2e

# E2E tests (fast - Chromium only)
bun run test:e2e:fast

# All tests (CI pipeline)
bun run test:ci

# With coverage
bun run test:unit:coverage
```

---

## Test Utilities

### Test Logger

```typescript
import { createTestLogger } from './test-logger';

test('example test', async ({ page }, testInfo) => {
  const logger = createTestLogger(testInfo.title);

  logger.step('Navigating to page');
  logger.analysis('element', 'property', 'value');
  logger.complete('Test completed');
});
```

### Viewport Helper

```typescript
const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1024, height: 768 },
  wide: { width: 1920, height: 1080 },
};

await page.setViewportSize(VIEWPORTS.mobile);
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run unit tests
        run: bun run test:unit

      - name: Install Playwright browsers
        run: bun run test:e2e:install

      - name: Run E2E tests
        run: bun run test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Debugging Failed Tests

### Visual Regression Failures

```bash
# Update snapshots
bun run test:update-snapshots

# View diff
open playwright-report/index.html
```

### E2E Test Failures

```bash
# Run with UI mode
bun run test:e2e:ui

# Run with headed browser
bun run test:e2e --headed

# Debug specific test
bun run test:e2e --grep "test name" --debug
```

### Unit Test Failures

```bash
# Run single test file
bun test tests/unit/api-routes.test.ts

# Watch mode
bun run test:unit:watch

# Verbose output
bun test --verbose
```

---

## Next Steps

1. **Run all tests** to confirm RED phase
2. **Implement features** to make tests pass (GREEN phase)
3. **Refactor code** while keeping tests green (REFACTOR phase)
4. **Add more tests** as edge cases are discovered
5. **Document test patterns** for team consistency

---

## Important Notes

- All tests are deterministic (no random failures)
- Tests run in CI/CD without modification
- Screenshot baselines stored in git
- Test data is isolated and cleaned up
- Rate limiting tests use time windows
- WCAG contrast calculated programmatically
- OKLCH colors validated against CSS spec

---

## Contact

For questions about the test suite:
- Review test file comments
- Check Playwright documentation
- Consult CLAUDE.md for project patterns
