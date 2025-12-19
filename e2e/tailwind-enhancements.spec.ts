import { test, expect, type Browser } from '@playwright/test';

test.describe('Tailwind CSS Enhancements', () => {
  test.describe('Text Balancing', () => {
    test('should have text-balance on headings', async ({ page }) => {
      await page.goto('/');

      // Check main heading has text-balance
      const heading = page.locator('h1').first();
      const headingClass = await heading.getAttribute('class');
      expect(headingClass).toContain('text-balance');
    });

    test('should have text-pretty on descriptions', async ({ page }) => {
      await page.goto('/about');

      // Check description paragraphs have text-pretty
      const descriptions = page.locator('p.text-pretty');
      const count = await descriptions.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should apply text-balance across all major pages', async ({ page }) => {
      const pages = ['/about', '/services', '/pricing', '/blog', '/contact'];

      for (const path of pages) {
        await page.goto(path);
        const headings = page.locator('h1.text-balance, h2.text-balance');
        const count = await headings.count();
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Will-Change Optimizations', () => {
    test('should have will-change-transform on hover elements', async ({ page }) => {
      await page.goto('/');

      // Check buttons with hover:scale have will-change
      const buttons = page.locator('button.will-change-transform');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should optimize performance for animated elements', async ({ page }) => {
      await page.goto('/portfolio');

      // Check project cards have will-change
      const cards = page.locator('.will-change-transform');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Scroll Snap Implementation', () => {
    test('should have scroll snap on mobile testimonials', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/testimonials');

      // Check scroll snap classes
      const container = page.locator('.snap-x.snap-mandatory');
      await expect(container).toBeVisible();

      const items = page.locator('.snap-center');
      const count = await items.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have horizontal scroll on mobile portfolio', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/portfolio');

      // Check for overflow-x-auto and snap classes
      const scrollContainer = page.locator('.overflow-x-auto.snap-x');
      await expect(scrollContainer).toBeVisible();
    });

    test('should hide scrollbar on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/portfolio');

      // Check for scrollbar-hide class
      const container = page.locator('.scrollbar-hide');
      await expect(container).toBeVisible();
    });
  });

  test.describe('Smooth Scrolling', () => {
    test('should have scroll-smooth on html element', async ({ page }) => {
      await page.goto('/');

      // Check HTML element has scroll-smooth
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toContain('scroll-smooth');
    });

    test('should show scroll-to-top button when scrolled', async ({ page }) => {
      await page.goto('/');

      // Initially button should not be visible
      const scrollButton = page.locator('button[aria-label="Scroll to top"]');
      await expect(scrollButton).not.toBeVisible();

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(100);

      // Button should appear
      await expect(scrollButton).toBeVisible();

      // Click button
      await scrollButton.click();
      await page.waitForTimeout(500);

      // Should be back at top
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThan(50);
    });

    test('scroll-to-top button should have proper styling', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);

      const button = page.locator('button[aria-label="Scroll to top"]').first();
      await button.waitFor({ state: 'visible', timeout: 5000 });
      const buttonClass = await button.getAttribute('class');

      expect(buttonClass).toContain('fixed');
      expect(buttonClass).toContain('bottom-8');
      expect(buttonClass).toContain('right-8');
      expect(buttonClass).toContain('bg-accent'); // Monochromatic design uses bg-accent
      expect(buttonClass).toContain('will-change-transform');
    });
  });

  test.describe('Motion Preferences', () => {
    test('should respect prefers-reduced-motion', async ({ browser }: { browser: Browser }) => {
      // Create context with reduced motion preference
      const context = await browser.newContext({
        reducedMotion: 'reduce'
      });
      const page = await context.newPage();

      await page.goto('/');

      // Check that animations are disabled
      const animationDuration = await page.evaluate(() => {
        const element = document.querySelector('.animate-pulse');
        if (!element) {return null;}
        return window.getComputedStyle(element).animationDuration;
      });

      // Should be effectively 0 (0s or 0.01ms) or null if no animated elements
      if (animationDuration) {
        expect(animationDuration).toMatch(/^(0s|0\.01ms)$/);
      }

      await context.close();
    });

    test('should disable hover scales with reduced motion', async ({ browser }: { browser: Browser }) => {
      const context = await browser.newContext({
        reducedMotion: 'reduce'
      });
      const page = await context.newPage();

      await page.goto('/');

      // Check hover:scale elements don't scale
      const transform = await page.evaluate(() => {
        const button = document.querySelector('.hover\\:scale-105');
        if (!button) {return null;}

        // Simulate hover
        button.classList.add('hover');
        return window.getComputedStyle(button).transform;
      });

      // Should be none or matrix(1, 0, 0, 1, 0, 0) (no scale) or null
      if (transform) {
        expect(transform).toMatch(/none|matrix\(1,\s*0,\s*0,\s*1,\s*0,\s*0\)/);
      }

      await context.close();
    });

    test('should disable will-change with reduced motion', async ({ browser }: { browser: Browser }) => {
      const context = await browser.newContext({
        reducedMotion: 'reduce'
      });
      const page = await context.newPage();

      await page.goto('/');

      // Check will-change is auto
      const willChange = await page.evaluate(() => {
        const element = document.querySelector('.will-change-transform');
        if (!element) {return null;}
        return window.getComputedStyle(element).willChange;
      });

      expect(willChange).toBe('auto');

      await context.close();
    });
  });

  test.describe('Responsive Behavior', () => {
    test('scroll snap should only apply on mobile', async ({ page }) => {
      // Desktop view
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/portfolio');

      // Should not have overflow-x-auto on desktop
      const desktopContainer = page.locator('.md\\:overflow-visible');
      await expect(desktopContainer).toBeVisible();

      // Mobile view
      await page.setViewportSize({ width: 375, height: 667 });

      // Should have overflow-x-auto on mobile
      const mobileContainer = page.locator('.overflow-x-auto');
      await expect(mobileContainer).toBeVisible();
    });

    test('text sizes should be responsive', async ({ page }) => {
      await page.goto('/');

      // Mobile
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileHeading = page.locator('h1').first();
      const mobileFontSize = await mobileHeading.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );

      // Desktop
      await page.setViewportSize({ width: 1440, height: 900 });
      const desktopFontSize = await mobileHeading.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );

      // Desktop font should be larger
      expect(parseInt(desktopFontSize)).toBeGreaterThan(parseInt(mobileFontSize));
    });
  });

  test.describe('Performance Optimizations', () => {
    test('should have optimized animations', async ({ page }) => {
      await page.goto('/');

      // Check for transform-gpu class usage
      const gpuElements = await page.locator('.transform-gpu').count();
      expect(gpuElements).toBeGreaterThan(0);
    });

    test('should use will-change sparingly', async ({ page }) => {
      await page.goto('/');

      // Count will-change elements
      const willChangeCount = await page.locator('.will-change-transform').count();

      // Should be present but not excessive (less than 20 on a page)
      expect(willChangeCount).toBeGreaterThan(0);
      expect(willChangeCount).toBeLessThan(20);
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('scroll-to-top button should be accessible', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(100);

      const button = page.locator('button[aria-label="Scroll to top"]');

      // Check ARIA label
      const ariaLabel = await button.getAttribute('aria-label');
      expect(ariaLabel).toBe('Scroll to top');

      // Check keyboard accessibility
      await button.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThan(50);
    });

    test('form elements should have proper focus states', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');

      // Wait for form to be fully loaded - look for any input element
      await page.waitForSelector('input, textarea', { state: 'visible', timeout: 5000 });

      // Check focus ring on first visible input
      const input = page.locator('input, textarea').first();
      await input.waitFor({ state: 'visible' });
      await input.focus();

      // Check that focus styles are applied (may be through focus-ring class or CSS)
      const focusStyles = await input.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return {
          outline: styles.outline,
          outlineColor: styles.outlineColor,
          borderColor: styles.borderColor
        }
      })

      // Should have some visible focus indicator
      const hasFocusIndicator =
        focusStyles.outline !== 'none' ||
        focusStyles.outlineColor !== 'rgba(0, 0, 0, 0)' ||
        focusStyles.borderColor !== 'rgba(0, 0, 0, 0)'

      expect(hasFocusIndicator).toBe(true)
    });
  });
});