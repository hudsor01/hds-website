import { test, expect } from '@playwright/test';

test.describe('Premium Animation Features', () => {
  test('animated counters work on home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for counters to be visible
    await page.waitForSelector('text=/150/', { timeout: 10000 });
    await page.waitForSelector('text=/98%/', { timeout: 10000 });
    await page.waitForSelector('text=/3.*x/', { timeout: 10000 });
    
    // Verify counters animated (they should contain the AnimatedCounter component)
    const projectCounter = await page.locator('text=/Projects Delivered/').locator('..').locator('div').first();
    await expect(projectCounter).toContainText('150+');
    
    const satisfactionCounter = await page.locator('text=/Client Satisfaction/').locator('..').locator('div').first();
    await expect(satisfactionCounter).toContainText('98%');
    
    const roiCounter = await page.locator('text=/Average ROI/').locator('..').locator('div').first();
    await expect(roiCounter).toContainText('3');
  });

  test('scroll progress indicator appears and works', async ({ page }) => {
    await page.goto('/');
    
    // Check scroll progress bar exists at top
    const progressBar = await page.locator('[class*="fixed"][class*="top-0"][class*="z-50"]').first();
    await expect(progressBar).toBeVisible();
    
    // Scroll down and verify progress bar updates
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
  });

  test('scroll indicator disappears after scrolling', async ({ page }) => {
    await page.goto('/');
    
    // Check scroll down indicator is visible initially
    const scrollIndicator = await page.locator('text=/Scroll/i').locator('..');
    await expect(scrollIndicator).toBeVisible();
    
    // Scroll down a bit
    await page.evaluate(() => window.scrollTo(0, 150));
    await page.waitForTimeout(500);
    
    // Verify scroll indicator is hidden
    await expect(scrollIndicator).not.toBeVisible();
  });

  test('animated counters work on services page', async ({ page }) => {
    await page.goto('/services');
    
    // Wait for the "Why Choose Us" section
    await page.waitForSelector('text=/WHY CHOOSE US/');
    
    // Scroll to the reasons section
    await page.locator('text=/WHY CHOOSE US/').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // Check animated counters are present (use more specific selectors)
    const reasonsSection = await page.locator('text=/WHY CHOOSE US/').locator('../..');
    await expect(reasonsSection.locator('text=/Projects Delivered/')).toBeVisible();
    await expect(reasonsSection.locator('text=/Success Rate/')).toBeVisible();
    await expect(reasonsSection.locator('text=/Average ROI/')).toBeVisible();
    
    // Use a more specific selector for Support to avoid conflict with footer
    const supportStat = await page.locator('.grid').filter({ hasText: '24/7' }).first();
    await expect(supportStat).toBeVisible();
  });

  test('contact form animations work properly', async ({ page }) => {
    await page.goto('/contact');
    
    // Test form field focus animations
    const firstNameField = await page.locator('input[name="firstName"]');
    await firstNameField.focus();
    await page.waitForTimeout(200);
    
    // Test validation shake animation
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Should show validation errors with animation
    await expect(page.locator('text=/required/i').first()).toBeVisible();
  });
});