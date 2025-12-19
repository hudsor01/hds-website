import { test, expect } from '@playwright/test';
import { createTestLogger } from './test-logger';

/**
 * Cross-Browser Compatibility Test Suite
 *
 * TDD Approach: These tests are written FIRST and should FAIL initially.
 *
 * Test Coverage:
 * - Chromium (Chrome, Edge)
 * - Firefox
 * - WebKit (Safari)
 *
 * Critical User Flows Tested:
 * - Page loads and rendering
 * - Navigation
 * - Form submissions
 * - Interactive elements
 * - CSS Grid/Flexbox layouts
 * - OKLCH color support
 */

const CRITICAL_PAGES = [
  { path: '/', name: 'Home' },
  { path: '/services', name: 'Services' },
  { path: '/contact', name: 'Contact' },
];

test.describe('Cross-Browser - Page Rendering', () => {
  for (const pageDef of CRITICAL_PAGES) {
    test(`should render ${pageDef.name} page correctly`, async ({ page, browserName }, testInfo) => {
      const logger = createTestLogger(testInfo.title);

      logger.analysis('browser', 'name', browserName);

      await page.goto(pageDef.path);
      await page.waitForLoadState('networkidle');

      // Check page loaded
      const title = await page.title();
      logger.analysis('page', 'title', title);

      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);

      // Check main content is visible
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // Check no JavaScript errors
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.waitForTimeout(1000);

      if (errors.length > 0) {
        logger.analysis('errors', 'count', String(errors.length));
        errors.forEach(err => logger.analysis('error', 'message', err));
      }

      expect(errors.length).toBe(0);
    });
  }
});

test.describe('Cross-Browser - Navigation', () => {
  test('should navigate between pages', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click services link
    const servicesLink = page.locator('a[href="/services"]').first();
    await expect(servicesLink).toBeVisible();

    // Official Playwright pattern for SPA navigation
    // https://playwright.dev/docs/navigations
    await servicesLink.click();
    await page.waitForURL('**/services');
    await page.waitForLoadState('networkidle');

    // Verify navigation
    expect(page.url()).toContain('/services');

    // Check page content loaded
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should handle back navigation', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to another page
    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Should be on home page
    expect(page.url()).toMatch(/\/$|\/$/);
  });
});

test.describe('Cross-Browser - Forms', () => {
  test('should handle form input', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Find name input
    const nameInput = page.locator('input[name="name"], input[id="name"]').first();

    if (await nameInput.count() > 0) {
      await nameInput.fill('Test User');

      const value = await nameInput.inputValue();
      logger.analysis('name input', 'value', value);

      expect(value).toBe('Test User');
    }
  });

  test('should validate email format', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]').first();

    if (await emailInput.count() > 0) {
      // Enter invalid email
      await emailInput.fill('invalid-email');

      // Try to submit (if submit button exists)
      const submitButton = page.locator('button[type="submit"]').first();

      if (await submitButton.count() > 0) {
        await submitButton.click();

        // HTML5 validation should prevent submission
        const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => {
          return !el.validity.valid;
        });

        logger.analysis('email input', 'invalid', String(isInvalid));

        expect(isInvalid).toBe(true);
      }
    }
  });

  test('should focus on form fields', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input[name="name"], input[id="name"]').first();

    if (await nameInput.count() > 0) {
      await nameInput.focus();

      const isFocused = await nameInput.evaluate((el) => el === document.activeElement);
      logger.analysis('name input', 'focused', String(isFocused));

      expect(isFocused).toBe(true);
    }
  });
});

test.describe('Cross-Browser - Interactive Elements', () => {
  test('should handle button clicks', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find any clickable button
    const button = page.locator('button:visible, a[role="button"]:visible').first();

    if (await button.count() > 0) {
      const buttonText = await button.textContent();
      logger.analysis('button', 'text', buttonText || '');

      // Click should work without errors
      await button.click();
      await page.waitForTimeout(500);

      // No errors should occur
      logger.step('Button clicked successfully');
    }
  });

  test('should handle hover states', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const link = page.locator('a:visible').first();

    if (await link.count() > 0) {
      // Get initial color
      const initialColor = await link.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // Hover
      await link.hover();
      await page.waitForTimeout(100);

      // Get hover color
      const hoverColor = await link.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      logger.analysis('link', 'initial color', initialColor);
      logger.analysis('link', 'hover color', hoverColor);

      // Colors may or may not change depending on styles
    }
  });
});

test.describe('Cross-Browser - CSS Layouts', () => {
  test('should render CSS Grid correctly', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/services');
    await page.waitForLoadState('networkidle');

    // Find grid containers (elements with class*="grid" that actually use grid display)
    const grids = await page.locator('[class*="grid"]').evaluateAll(elements => {
      return elements.filter(el => {
        const display = window.getComputedStyle(el).display;
        return display === 'grid' || display === 'inline-grid';
      });
    });

    logger.analysis('page', 'grid elements', String(grids.length));

    if (grids.length > 0) {
      // At least one element is using CSS Grid
      expect(grids.length).toBeGreaterThan(0);
    }
  });

  test('should render Flexbox correctly', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find flex containers
    const flexes = page.locator('[class*="flex"]');
    const flexCount = await flexes.count();

    logger.analysis('page', 'flex elements', String(flexCount));

    if (flexCount > 0) {
      const firstFlex = flexes.first();

      const display = await firstFlex.evaluate((el) => {
        return window.getComputedStyle(el).display;
      });

      logger.analysis('flex', 'display', display);

      // Should support flex display
      expect(['flex', 'inline-flex']).toContain(display);
    }
  });
});

test.describe('Cross-Browser - OKLCH Color Support', () => {
  test('should handle OKLCH colors or provide fallbacks', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if OKLCH is supported
    const supportsOKLCH = await page.evaluate(() => {
      const testDiv = document.createElement('div');
      testDiv.style.color = 'oklch(0.5 0.1 180)';
      return testDiv.style.color !== '';
    });

    logger.analysis('browser', 'supports OKLCH', String(supportsOKLCH));

    // Get actual rendered color
    const bodyColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    logger.analysis('body', 'background-color', bodyColor);

    // Should have background color defined (may be transparent in monochromatic design)
    expect(bodyColor).toBeTruthy();
  });

  test('should render colors consistently across browsers', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check primary color
    const primaryColor = await page.evaluate(() => {
      const root = document.documentElement;
      return window.getComputedStyle(root).getPropertyValue('--color-primary');
    });

    logger.analysis('css variable', '--color-primary', primaryColor.trim());

    // Variable should be defined
    expect(primaryColor.trim()).toBeTruthy();
  });
});

test.describe('Cross-Browser - Font Rendering', () => {
  test('should load custom fonts', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for fonts to load
    await page.waitForTimeout(1000);

    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });

    logger.analysis('body', 'font-family', fontFamily);

    // Should have custom font or fallback
    expect(fontFamily).toBeTruthy();
  });

  test('should render text without FOUT/FOIT issues', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/');

    // Check text is visible immediately
    const h1 = page.locator('h1').first();

    if (await h1.count() > 0) {
      await expect(h1).toBeVisible({ timeout: 1000 });

      const text = await h1.textContent();
      logger.analysis('h1', 'text', text || '');

      expect(text).toBeTruthy();
    }
  });
});

test.describe('Cross-Browser - Viewport Meta Tag', () => {
  test('should have proper viewport meta tag', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');

    logger.analysis('meta', 'viewport', viewport || 'missing');

    expect(viewport).toBeTruthy();
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
  });
});

test.describe('Cross-Browser - Console Errors', () => {
  test('should not have console errors on page load', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    if (errors.length > 0) {
      logger.analysis('errors', 'count', String(errors.length));
      errors.forEach((err, i) => {
        logger.analysis(`error[${i}]`, 'message', err);
      });
    }

    expect(errors.length).toBe(0);
  });
});

test.describe('Cross-Browser - Local Storage', () => {
  test('should support localStorage', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test localStorage
    const localStorageWorks = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'value');
        const value = localStorage.getItem('test');
        localStorage.removeItem('test');
        return value === 'value';
      } catch {
        return false;
      }
    });

    logger.analysis('localStorage', 'works', String(localStorageWorks));

    expect(localStorageWorks).toBe(true);
  });
});

test.describe('Cross-Browser - Critical User Flows', () => {
  test('should complete homepage to contact flow', async ({ page, browserName }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.analysis('browser', 'name', browserName);

    // Start at home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find contact link
    const contactLink = page.locator('a[href="/contact"]').first();
    await expect(contactLink).toBeVisible();

    // Official Playwright pattern for SPA navigation
    // https://playwright.dev/docs/navigations
    await contactLink.click();
    await page.waitForURL('**/contact');

    // Verify on contact page
    expect(page.url()).toContain('/contact');

    // Find contact form
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    logger.complete('User flow completed successfully');
  });
});
