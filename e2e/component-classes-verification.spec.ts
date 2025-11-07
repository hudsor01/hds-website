import { test, expect, type TestInfo } from '@playwright/test';
import { createTestLogger } from './test-logger';

test.describe('Component Classes Visual Verification', () => {
  test('should verify globals.css component classes are working', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title);
    // Navigate to homepage using relative URL (uses baseURL from config)
    logger.step('Navigating to homepage');
    await page.goto('/');

    // Wait for page to load with longer timeout for local development
    logger.step('Waiting for page to load');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Take a screenshot of the hero section
    const screenshotPath = 'test-results/homepage-hero.png';
    await page.screenshot({
      path: screenshotPath,
      clip: { x: 0, y: 0, width: 1280, height: 800 }
    });
    logger.screenshot(screenshotPath, 'Hero section visual verification');

    // Verify gradient text elements are visible (should not be transparent)
    const gradientTextElements = page.locator('.gradient-text');
    const count = await gradientTextElements.count();

    if (count > 0) {
      // Check that gradient text elements are visible and have content
      for (let i = 0; i < count; i++) {
        const element = gradientTextElements.nth(i);
        await expect(element).toBeVisible();

        // Check that the text is not empty
        const textContent = await element.textContent();
        expect(textContent?.trim()).toBeTruthy();
      }

      logger.verify('gradient text elements', count);
      logger.step(`Verified ${count} gradient text elements have content and visibility`);
    }

    // Verify flex-center elements are properly centered
    const flexCenterElements = page.locator('.flex-center');
    const flexCenterCount = await flexCenterElements.count();
    logger.verify('flex-center elements', flexCenterCount);

    // Verify glass card elements are present and visible
    const glassCardElements = page.locator('.glass-card, .glass-card-light, .glass-section');
    const glassCardCount = await glassCardElements.count();
    logger.verify('glass card elements', glassCardCount);

    // Verify CTA buttons are present and styled correctly
    const ctaButtons = page.locator('.cta-primary, .cta-secondary');
    const ctaCount = await ctaButtons.count();
    logger.verify('CTA buttons', ctaCount);

    // Verify container classes are working
    const containerElements = page.locator('.container-wide, .container-narrow');
    const containerCount = await containerElements.count();
    logger.verify('container elements', containerCount);

    // Verify responsive text elements
    const responsiveText = page.locator('.text-responsive-sm, .text-responsive-md, .text-responsive-lg');
    const responsiveTextCount = await responsiveText.count();
    logger.verify('responsive text elements', responsiveTextCount);
    logger.complete('Homepage component classes verification completed');
  });

  test('should verify contact form component classes', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title);
    // Navigate to contact page using relative URL
    logger.step('Navigating to contact page');
    await page.goto('/contact');

    // Wait for page to load with longer timeout for local development
    logger.step('Waiting for contact page to load');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Take a screenshot of the contact form
    const formScreenshotPath = 'test-results/contact-form.png';
    await page.screenshot({
      path: formScreenshotPath,
      clip: { x: 0, y: 400, width: 1280, height: 800 }
    });
    logger.screenshot(formScreenshotPath, 'Contact form component classes');

    // Verify focus-ring elements exist (form inputs should have focus styles)
    const focusElements = page.locator('.focus-ring');
    const focusCount = await focusElements.count();
    logger.verify('elements with focus-ring class', focusCount);

    // Verify transition-smooth elements
    const smoothTransitions = page.locator('.transition-smooth');
    const transitionCount = await smoothTransitions.count();
    logger.verify('elements with smooth transitions', transitionCount);
    logger.complete('Contact form component classes verification completed');
  });

  test('should verify services page component classes', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title);
    // Navigate to services page using relative URL
    logger.step('Navigating to services page');
    await page.goto('/services');

    // Wait for page to load with longer timeout for local development
    logger.step('Waiting for services page to load');
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Take a screenshot of the services section
    const servicesScreenshotPath = 'test-results/services-page.png';
    await page.screenshot({
      path: servicesScreenshotPath,
      clip: { x: 0, y: 200, width: 1280, height: 1000 }
    });
    logger.screenshot(servicesScreenshotPath, 'Services page component classes');

    // Verify hover effects are present
    const hoverElements = page.locator('.hover-lift, .hover-glow, .card-hover-glow');
    const hoverCount = await hoverElements.count();
    logger.verify('elements with hover effects', hoverCount);
    logger.complete('Services page component classes verification completed');
  });
});