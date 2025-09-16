import { test, expect } from '@playwright/test';
import { createTestLogger } from './test-logger';

test.describe('Hero Text Visibility', () => {
  test('should display all hero text elements correctly', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);
    // Navigate to homepage
    logger.step('Navigating to homepage');
    await page.goto('/');

    // Wait for page to load
    logger.step('Waiting for page to load');
    await page.waitForLoadState('networkidle');

    // Check main heading is visible
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();

    // Check for text content
    const headingText = await mainHeading.textContent();
    logger.analysis('hero heading', 'text content', headingText || 'none');
    expect(headingText).toBeTruthy();
    expect(headingText?.length).toBeGreaterThan(0);

    // Check for gradient text spans
    const gradientText = page.locator('.bg-gradient-to-r');
    const gradientCount = await gradientText.count();
    logger.verify('gradient text elements (.bg-gradient-to-r)', gradientCount);

    // Check specific text classes that were problematic
    const textCyan = page.locator('.text-cyan-400, .text-cyan-500, .text-cyan-600');
    const cyanCount = await textCyan.count();
    logger.verify('cyan text elements', cyanCount);

    // Check for any text-transparent classes that might hide text
    const transparentText = page.locator('.text-transparent');
    const transparentCount = await transparentText.count();
    logger.verify('transparent text elements', transparentCount);

    // If there are transparent text elements, ensure they have gradients
    if (transparentCount > 0) {
      for (let i = 0; i < transparentCount; i++) {
        const element = transparentText.nth(i);
        const classes = await element.getAttribute('class');
        expect(classes).toContain('gradient-text');
        expect(classes).toContain('bg-clip-text');
      }
    }

    // Take screenshot for visual verification
    const screenshotPath = 'hero-text-visibility.png';
    await page.screenshot({
      path: screenshotPath,
      fullPage: false
    });
    logger.screenshot(screenshotPath, 'Hero text visibility verification');

    // Check computed styles of hero text
    const heroTextElement = page.locator('h1 .bg-clip-text').first();
    if (await heroTextElement.count() > 0) {
      const isVisible = await heroTextElement.isVisible();
      expect(isVisible).toBeTruthy();

      // Check that the element has actual dimensions
      const boundingBox = await heroTextElement.boundingBox();
      expect(boundingBox).not.toBeNull();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThan(0);
        expect(boundingBox.height).toBeGreaterThan(0);
        logger.step(`Hero text element has dimensions: ${boundingBox.width}x${boundingBox.height}`);
      }
    }
    logger.complete('Hero text elements verification completed');
  });

  test('should have proper gradient classes applied', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);
    logger.step('Navigating to homepage');
    await page.goto('/');
    logger.step('Waiting for page to load');
    await page.waitForLoadState('networkidle');

    // Check for gradient text elements (not background gradients)
    const gradientTextElements = page.locator('.gradient-text');
    const count = await gradientTextElements.count();

    logger.verify('elements with gradient-text class', count, 1);

    // Verify at least one gradient text exists
    expect(count).toBeGreaterThan(0);

    if (count > 0) {
      const firstGradient = gradientTextElements.first();
      await expect(firstGradient).toBeVisible();

      // Gradient text elements that are visible should have the proper text gradient classes
      const visibleGradientTexts = page.locator('.gradient-text.text-transparent');
      const visibleCount = await visibleGradientTexts.count();

      if (visibleCount > 0) {
        const firstVisible = visibleGradientTexts.first();
        const classes = await firstVisible.getAttribute('class');
        expect(classes).toContain('bg-clip-text');
        expect(classes).toContain('text-transparent');
        logger.step('Verified gradient text has proper CSS classes');
      }
    }
    logger.complete('Gradient classes verification completed');
  });

  test('should not have any invisible text due to CSS issues', async ({ page }, testInfo) => {
    const logger = createTestLogger(testInfo.title);
    logger.step('Navigating to homepage');
    await page.goto('/');
    logger.step('Waiting for page to load');
    await page.waitForLoadState('networkidle');

    // Execute JavaScript to check for invisible text elements
    const invisibleTextElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('h1, h2, h3, p, span');
      const invisible: Array<{tag: string, text: string, classes: string, reason: string, issue?: unknown}> = [];

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const text = el.textContent?.trim();

        if (text && text.length > 0) {
          // Check if element is invisible
          if (styles.opacity === '0' ||
              styles.visibility === 'hidden' ||
              styles.display === 'none' ||
              (styles.color === 'transparent' && !el.classList.contains('bg-clip-text'))) {
            invisible.push({
              tag: el.tagName,
              text: text.substring(0, 50),
              classes: el.className,
              reason: `Invisible element detected`,
              issue: {
                opacity: styles.opacity,
                visibility: styles.visibility,
                display: styles.display,
                color: styles.color
              }
            });
          }
        }
      });

      return invisible;
    });

    logger.analysis('invisible text analysis', 'elements found', JSON.stringify(invisibleTextElements, null, 2));
    expect(invisibleTextElements).toHaveLength(0);
    logger.complete('CSS visibility verification completed');
  });
});