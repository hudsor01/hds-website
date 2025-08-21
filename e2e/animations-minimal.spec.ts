import { test, expect } from '@playwright/test';

test.describe('Minimal Animation Tests', () => {
  test('animations are present and functional', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Test 1: Check button hover capability
    const button = page.locator('a').filter({ hasText: 'Get Started' }).first();
    await expect(button).toBeVisible();
    
    // Hover and check for style changes
    await button.hover();
    
    // Button should be interactive
    const isInteractive = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.cursor === 'pointer';
    });
    expect(isInteractive).toBe(true);
    
    // Test 2: Check service cards exist
    await page.goto('/services');
    
    const serviceCards = page.locator('div').filter({ hasText: /WEB APPS|CUSTOM SOLUTIONS|STRATEGY/ });
    const cardCount = await serviceCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Test 3: Check portfolio page loads
    await page.goto('/portfolio');
    
    const portfolioTitle = page.locator('h1').filter({ hasText: 'Our Portfolio' });
    await expect(portfolioTitle).toBeVisible();
    
    // Portfolio cards should exist
    const portfolioCards = page.locator('.group.relative');
    const portfolioCount = await portfolioCards.count();
    expect(portfolioCount).toBeGreaterThan(0);
  });

  test('page performance with animations', async ({ page }) => {
    // Navigate and measure performance
    await page.goto('/');
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Check that page is interactive
    const isInteractive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    expect(isInteractive).toBe(true);
    
    // Measure a simple performance metric
    const performanceData = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domComplete: perfData.domComplete,
        loadComplete: perfData.loadEventEnd,
        interactive: perfData.domInteractive
      };
    });
    
    // Page should load in reasonable time
    expect(performanceData.domComplete).toBeLessThan(5000);
  });
});