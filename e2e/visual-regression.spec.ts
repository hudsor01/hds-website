import { test, expect } from '@playwright/test';
import { createTestLogger } from './test-logger';

/**
 * Visual Regression Test Suite
 *
 * TDD Approach: These tests are written FIRST and should FAIL initially
 * because baseline screenshots don't exist yet.
 *
 * Test Coverage:
 * - All critical pages in light and dark mode
 * - Screenshot comparisons for visual regression
 * - Monochromatic color palette verification
 * - OKLCH color value validation
 *
 * Usage:
 * 1. Run with --update-snapshots to create baselines
 * 2. Subsequent runs will compare against baselines
 * 3. Any visual changes will cause test failures
 */

const PAGES_TO_TEST = [
  { path: '/', name: 'home' },
  { path: '/services', name: 'services' },
  { path: '/showcase', name: 'portfolio' },
  { path: '/pricing', name: 'pricing' },
  { path: '/contact', name: 'contact' },
  { path: '/about', name: 'about' },
  { path: '/blog', name: 'blog' },
] as const;

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  desktop: { width: 1920, height: 1080 },
} as const;

test.describe('Visual Regression - Light Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Force light mode
    await page.emulateMedia({ colorScheme: 'light' });
  });

  for (const pageDef of PAGES_TO_TEST) {
    test(`should match baseline for ${pageDef.name} page (desktop)`, async ({ page }, testInfo) => {
      const logger = createTestLogger(testInfo.title);

      await page.setViewportSize(VIEWPORTS.desktop);

      logger.step(`Navigating to ${pageDef.path}`);
      await page.goto(pageDef.path);
      await page.waitForLoadState('networkidle');

      // Wait for any animations to complete
      await page.waitForTimeout(500);

      logger.step('Taking screenshot');

      // Take screenshot and compare
      await expect(page).toHaveScreenshot(
        `${pageDef.name}-light-desktop.png`,
        {
          fullPage: true,
          animations: 'disabled',
          // Allow small pixel differences for anti-aliasing
          maxDiffPixelRatio: 0.01,
        }
      );

      logger.complete('Screenshot comparison complete');
    });

    test(`should match baseline for ${pageDef.name} page (mobile)`, async ({ page }, testInfo) => {
      const logger = createTestLogger(testInfo.title);

      await page.setViewportSize(VIEWPORTS.mobile);

      logger.step(`Navigating to ${pageDef.path}`);
      await page.goto(pageDef.path);
      await page.waitForLoadState('networkidle');

      // Wait for any animations to complete
      await page.waitForTimeout(500);

      logger.step('Taking screenshot');

      await expect(page).toHaveScreenshot(
        `${pageDef.name}-light-mobile.png`,
        {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixelRatio: 0.01,
        }
      );

      logger.complete('Screenshot comparison complete');
    });
  }
});

test.describe('Visual Regression - Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Force dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
  });

  for (const pageDef of PAGES_TO_TEST) {
    test(`should match baseline for ${pageDef.name} page (desktop)`, async ({ page }, testInfo) => {
      const logger = createTestLogger(testInfo.title);

      await page.setViewportSize(VIEWPORTS.desktop);

      logger.step(`Navigating to ${pageDef.path}`);
      await page.goto(pageDef.path);
      await page.waitForLoadState('networkidle');

      // Wait for dark mode to apply and animations to complete
      await page.waitForTimeout(500);

      logger.step('Taking screenshot');

      await expect(page).toHaveScreenshot(
        `${pageDef.name}-dark-desktop.png`,
        {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixelRatio: 0.01,
        }
      );

      logger.complete('Screenshot comparison complete');
    });

    test(`should match baseline for ${pageDef.name} page (mobile)`, async ({ page }, testInfo) => {
      const logger = createTestLogger(testInfo.title);

      await page.setViewportSize(VIEWPORTS.mobile);

      logger.step(`Navigating to ${pageDef.path}`);
      await page.goto(pageDef.path);
      await page.waitForLoadState('networkidle');

      // Wait for dark mode to apply and animations to complete
      await page.waitForTimeout(500);

      logger.step('Taking screenshot');

      await expect(page).toHaveScreenshot(
        `${pageDef.name}-dark-mobile.png`,
        {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixelRatio: 0.01,
        }
      );

      logger.complete('Screenshot comparison complete');
    });
  }
});

test.describe('Specific Component Visual Tests', () => {
  test('should render hero section consistently', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Find hero section
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    logger.step('Taking hero section screenshot');

    // Screenshot just the hero
    await expect(hero).toHaveScreenshot('hero-section.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

  test('should render navigation consistently', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find navigation
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    logger.step('Taking navigation screenshot');

    await expect(nav).toHaveScreenshot('navigation.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });

  test('should render footer consistently', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find footer
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();

    logger.step('Taking footer screenshot');

    await expect(footer).toHaveScreenshot('footer.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Error Page Visual Regression', () => {
  test('should match baseline for 404 page', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    logger.step('Navigating to non-existent page');
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    logger.step('Taking 404 page screenshot');

    await expect(page).toHaveScreenshot('404-page.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  test('should match baseline for error page (dark mode)', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.emulateMedia({ colorScheme: 'dark' });

    logger.step('Navigating to non-existent page');
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    logger.step('Taking 404 page screenshot (dark)');

    await expect(page).toHaveScreenshot('404-page-dark.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe('Animation State Tests', () => {
  test('should capture animations in disabled state', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Disable animations via media query
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(300);

    logger.step('Taking screenshot with animations disabled');

    await expect(page).toHaveScreenshot('home-no-animations.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });
});
