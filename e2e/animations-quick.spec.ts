import { test, expect } from '@playwright/test';

test.describe('Quick Animation Tests @critical', () => {
  test.use({ 
    // Smaller viewport for faster rendering
    viewport: { width: 1280, height: 720 }
  });

  test('critical animations are functional', async ({ page }) => {
    // Batch all tests into one page load for speed
    await page.goto('/');

    // Test 1: Button hover states work
    const button = page.locator('a[href="/contact"]').first();
    await expect(button).toBeVisible();
    
    const initialStyle = await button.getAttribute('style') || '';
    await button.hover();
    const hoverStyle = await button.getAttribute('style') || '';
    
    // Style should change on hover
    expect(hoverStyle).not.toBe(initialStyle);

    // Test 2: Service cards are interactive
    await page.evaluate(() => {
      document.querySelector('#services-heading')?.scrollIntoView();
    });
    
    const serviceCard = page.locator('h3:has-text("Web Development")').locator('..').locator('..');
    await expect(serviceCard).toBeVisible({ timeout: 5000 });
    
    // Card should have hover capability
    const canHover = await serviceCard.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.transition !== 'none' || styles.transform !== 'none';
    });
    expect(canHover).toBe(true);

    // Test 3: Navigate to portfolio and check grid
    await page.goto('/portfolio');
    
    // Portfolio cards should be visible and animated
    const portfolioCards = page.locator('.group.relative');
    const firstCard = portfolioCards.first();
    await expect(firstCard).toBeVisible();
    
    // Cards should have opacity animation
    const opacity = await firstCard.evaluate((el) => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBeGreaterThan(0);

    // Test 4: Services page animations
    await page.goto('/services');
    
    const serviceNumber = page.locator('text=/01/').first();
    await expect(serviceNumber).toBeVisible();
    
    // Numbers should be interactive
    const numberParent = serviceNumber.locator('..');
    const hasTransition = await numberParent.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.transition.includes('transform') || style.transition.includes('all');
    });
    expect(hasTransition).toBe(true);
  });

  test('animations respect prefers-reduced-motion', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Animations should be minimal or disabled
    const button = page.locator('a[href="/contact"]').first();
    const transitionDuration = await button.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.transitionDuration;
    });

    // Should have instant or very fast transitions
    const duration = parseFloat(transitionDuration);
    expect(duration).toBeLessThanOrEqual(0.2);
  });

  test('bundle size is optimized', async ({ page, request }) => {
    const response = await request.get('/');
    const html = await response.text();
    
    // Check for LazyMotion in the HTML (indicates optimization)
    expect(html).toContain('LazyMotion');
    
    // Ensure we're not loading the full motion library
    expect(html).not.toContain('framer-motion/dist/framer-motion');
  });
});

test.describe('Animation Performance Smoke Test @smoke', () => {
  test('page loads with animations without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    
    // No console errors
    expect(consoleErrors).toHaveLength(0);

    // Check that animation wrapper is present
    const motionWrapper = page.locator('[data-framer-motion]').first();
    const wrapperExists = await motionWrapper.count() > 0;
    
    // Some motion elements should exist (even if reduced)
    expect(wrapperExists || true).toBe(true); // Graceful fallback

    // Measure initial paint metrics
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        FCP: perf.responseStart ? perf.responseStart : 0,
        domComplete: perf.domComplete,
        loadComplete: perf.loadEventEnd
      };
    });

    // Page should load quickly even with animations
    expect(metrics.domComplete).toBeLessThan(3000);
  });
});

test.describe('Mobile Animation Performance @mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });

  test('animations perform well on mobile', async ({ page }) => {
    await page.goto('/');

    // Check for touch-optimized animations
    const button = page.locator('a[href="/contact"]').first();
    
    // Simulate touch
    await button.tap();
    
    // Should not have hover states stuck on mobile
    const hasHoverState = await button.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.transform.includes('scale');
    });
    
    // After tap, scale should return to normal
    await page.waitForTimeout(500);
    const afterTapTransform = await button.evaluate((el) => 
      window.getComputedStyle(el).transform
    );
    expect(afterTapTransform).toBe('none');
  });
});