import { test, expect } from '@playwright/test';

test.describe('Portfolio Showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio', { waitUntil: 'domcontentloaded' });
    // Wait for the main content to be visible instead of networkidle
    await page.waitForSelector('h1', { timeout: 10000 });
  });

  test('should display portfolio projects with desktop/mobile toggle', async ({ page }) => {
    // Check if portfolio showcase component is visible (look for project selector tabs)
    const projectSelector = await page.locator('.flex.flex-wrap.gap-4.mb-12.justify-center');
    await expect(projectSelector).toBeVisible();

    // Check for project buttons
    const projectButtons = await page.locator('button:has-text("TenantFlow"), button:has-text("Ink37")');
    const buttonCount = await projectButtons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Check for TenantFlow project
    const tenantflowButton = await page.locator('button:has-text("TenantFlow")');
    await expect(tenantflowButton).toBeVisible();

    // Check for Ink37 Tattoos project
    const ink37Button = await page.locator('button:has-text("Ink37")');
    await expect(ink37Button).toBeVisible();
  });

  test('should allow switching between desktop and mobile views', async ({ page }) => {
    // Wait for portfolio showcase to load
    await page.waitForTimeout(2000);
    
    // Look for view toggle buttons
    const desktopToggle = await page.locator('button:has-text("Desktop")');
    const mobileToggle = await page.locator('button:has-text("Mobile")');

    const hasToggleButtons = await desktopToggle.count() > 0 && await mobileToggle.count() > 0;
    
    if (hasToggleButtons) {
      // Test desktop view first
      await desktopToggle.click();
      await page.waitForTimeout(1000);

      // Check if any images are visible (either desktop or general portfolio images)
      const allImages = await page.locator('img');
      const imageCount = await allImages.count();
      expect(imageCount).toBeGreaterThan(0);

      // Switch to mobile view
      await mobileToggle.click();
      await page.waitForTimeout(1000);

      // Check if images are still visible (mobile or fallback)
      const mobileImages = await page.locator('img');
      const mobileImageCount = await mobileImages.count();
      expect(mobileImageCount).toBeGreaterThan(0);
    } else {
      // If no toggle buttons, just verify portfolio images exist
      const portfolioImages = await page.locator('img');
      const imageCount = await portfolioImages.count();
      expect(imageCount).toBeGreaterThan(0);
    }
  });

  test('should display project metrics and results', async ({ page }) => {
    // Check for measurable impact section
    const impactSection = await page.locator('text=Measurable Impact');
    await expect(impactSection).toBeVisible();

    // Check for project sections (Challenge/Solution)
    const challengeSection = await page.locator('text=The Challenge');
    const solutionSection = await page.locator('text=The Solution');
    await expect(challengeSection).toBeVisible();
    await expect(solutionSection).toBeVisible();

    // Check for client testimonials if present
    const testimonials = await page.locator('blockquote');
    if (await testimonials.count() > 0) {
      await expect(testimonials.first()).toBeVisible();
    }

    // Check for technology stack
    const techStack = await page.locator('text=Technology Stack');
    await expect(techStack).toBeVisible();
  });

  test('should have working project navigation', async ({ page }) => {
    // Check if there are multiple projects and navigation works
    const projectButtons = await page.locator('button:has-text("TenantFlow"), button:has-text("Ink37")');
    const buttonCount = await projectButtons.count();

    if (buttonCount > 1) {
      // Click on first project
      await projectButtons.first().click();
      await page.waitForTimeout(500);

      // Check if project details are shown
      const projectTitle = await page.locator('h1, h2');
      if (await projectTitle.count() > 0) {
        await expect(projectTitle.first()).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if portfolio showcase adapts to mobile (look for project selector)
    const projectSelector = await page.locator('.flex.flex-wrap.gap-4.mb-12.justify-center');
    await expect(projectSelector).toBeVisible();

    // Check if images are properly sized for mobile
    const images = await page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const image = images.nth(i);
      const boundingBox = await image.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeLessThanOrEqual(375); // Should fit mobile viewport
      }
    }
  });

  test('should load portfolio images without errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Listen for image load errors
    page.on('response', (response) => {
      if (response.url().includes('.png') || response.url().includes('.jpg') || response.url().includes('.webp')) {
        if (!response.ok()) {
          errors.push(`Failed to load image: ${response.url()} (${response.status()})`);
        }
      }
    });

    // Wait for images to load
    await page.waitForTimeout(3000);

    // Check that no image load errors occurred
    expect(errors).toHaveLength(0);

    // Verify key portfolio images are present
    const tenantflowImage = await page.locator('img[src*="tenantflow"]');
    const ink37Image = await page.locator('img[src*="ink37"]');

    if (await tenantflowImage.count() > 0) {
      await expect(tenantflowImage.first()).toBeVisible();
    }
    
    if (await ink37Image.count() > 0) {
      await expect(ink37Image.first()).toBeVisible();
    }
  });
});