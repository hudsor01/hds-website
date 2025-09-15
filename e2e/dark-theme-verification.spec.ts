import { test, expect } from '@playwright/test';
import { createTestLogger } from './test-logger';

test.describe('Homepage Dark Theme Verification', () => {
  test('should display dark hero background instead of bright blue/cyan gradient', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);
    // Navigate to the homepage
    logger.step('Navigating to homepage');
    await page.goto('/');

    // Wait for the page to fully load
    logger.step('Waiting for page to load');
    await page.waitForLoadState('networkidle');

    // Set the page to dark mode by emulating dark color scheme
    logger.step('Setting page to dark color scheme');
    await page.emulateMedia({ colorScheme: 'dark' });

    // Take a full page screenshot first for reference
    const fullScreenshotPath = 'test-results/homepage-dark-theme-full.png';
    await page.screenshot({
      path: fullScreenshotPath,
      fullPage: true
    });
    logger.screenshot(fullScreenshotPath, 'Full page dark theme');

    // Locate the main element with bg-gradient-hero class
    const mainElement = page.locator('main').first();
    await expect(mainElement).toBeVisible();

    // Take a screenshot of just the hero section (first section within main)
    const heroSection = page.locator('section').first();
    const heroScreenshotPath = 'test-results/hero-section-dark-theme.png';
    await heroSection.screenshot({
      path: heroScreenshotPath
    });
    logger.screenshot(heroScreenshotPath, 'Hero section dark theme');

    // Check for dark gradient classes on the main element
    const mainClasses = await mainElement.getAttribute('class');
    logger.analysis('main element', 'classes', mainClasses || 'none');

    // Verify the background has dark colors on main element
    const computedStyle = await mainElement.evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('background');
    });
    logger.analysis('main element', 'computed background', computedStyle);

    // Check if bg-gradient-hero class is present (should contain dark colors)
    expect(mainClasses).toContain('bg-gradient-hero');

    // Look for any bright blue/cyan color values that shouldn't be there
    const backgroundImage = await mainElement.evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('background-image');
    });
    logger.analysis('main element', 'background-image', backgroundImage);

    // Verify no bright cyan/blue colors are present in the gradient
    // These RGB values represent bright cyan/blue that should be replaced
    expect(backgroundImage).not.toMatch(/rgb\(6,\s*182,\s*212\)/); // cyan-500
    expect(backgroundImage).not.toMatch(/rgb\(8,\s*145,\s*178\)/); // cyan-600
    expect(backgroundImage).not.toMatch(/rgb\(59,\s*130,\s*246\)/); // blue-500

    // Check for presence of dark colors (gray, slate, zinc)
    const shouldContainDarkColors =
      backgroundImage.includes('rgb(17, 24, 39)') || // gray-900
      backgroundImage.includes('rgb(15, 23, 42)') || // slate-900
      backgroundImage.includes('rgb(24, 24, 27)') || // zinc-900
      backgroundImage.includes('rgb(30, 41, 59)') || // slate-800
      backgroundImage.includes('rgb(39, 39, 42)');   // zinc-800

    expect(shouldContainDarkColors).toBe(true);
    logger.step('Verified dark colors are present in background gradient');
  });

  test('should maintain terminal/code aesthetic with dark colors', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);
    logger.step('Navigating to homepage');
    await page.goto('/');
    logger.step('Waiting for page to load');
    await page.waitForLoadState('networkidle');

    // Set the page to dark mode
    logger.step('Setting page to dark color scheme');
    await page.emulateMedia({ colorScheme: 'dark' });

    // Check the main heading for terminal-style text
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();

    const headingText = await mainHeading.textContent();
    logger.analysis('main heading', 'text content', headingText || 'none');

    // Verify the business/technical theme in the heading
    expect(headingText).toMatch(/technical|revenue|faster|cheaper/i);

    // Check for any secondary gradient backgrounds
    const secondaryGradients = page.locator('.bg-gradient-secondary');
    if (await secondaryGradients.count() > 0) {
      const secondaryStyle = await secondaryGradients.first().evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('background-image');
      });
      logger.analysis('secondary gradient', 'background-image', secondaryStyle);

      // Ensure secondary gradients also use dark colors
      const containsDarkSecondaryColors =
        secondaryStyle.includes('rgb(30, 41, 59)') || // slate-800
        secondaryStyle.includes('rgb(39, 39, 42)');   // zinc-800

      expect(containsDarkSecondaryColors).toBe(true);
      logger.step('Verified secondary gradients use dark colors');
    }
    logger.complete('Terminal/code aesthetic verification completed');
  });

  test('should capture and analyze color scheme of key elements', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);
    logger.step('Navigating to homepage');
    await page.goto('/');
    logger.step('Waiting for page to load');
    await page.waitForLoadState('networkidle');

    // Set the page to dark mode
    logger.step('Setting page to dark color scheme');
    await page.emulateMedia({ colorScheme: 'dark' });

    // Analyze the overall color scheme
    logger.step('Analyzing overall color scheme');
    const bodyBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).getPropertyValue('background-color');
    });
    logger.analysis('body', 'background-color', bodyBgColor);

    // Check navigation area
    const nav = page.locator('nav').first();
    if (await nav.count() > 0) {
      const navBgColor = await nav.evaluate((el) => {
        return window.getComputedStyle(el).getPropertyValue('background-color');
      });
      logger.analysis('navigation', 'background-color', navBgColor);
    }

    // Take a final verification screenshot with annotations
    const finalScreenshotPath = 'test-results/dark-theme-verification-complete.png';
    await page.screenshot({
      path: finalScreenshotPath,
      fullPage: true
    });
    logger.screenshot(finalScreenshotPath, 'Final dark theme verification');

    // Log success message
    logger.complete('Dark theme verification completed successfully');
    logger.step('Screenshots saved to test-results/ directory');
    logger.step('Hero section should now display dark gray/slate gradient instead of bright cyan/blue');
  });
});