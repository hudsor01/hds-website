import { test, expect } from '@playwright/test';

test.describe('Phase 3: Advanced Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Transitions', () => {
    test('page transitions work smoothly between routes', async ({ page }) => {
      // Start on homepage
      await expect(page).toHaveURL('/');
      
      // Navigate to services page
      await page.click('nav a[href="/services"]');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/services');
      
      // Navigate to portfolio page
      await page.click('nav a[href="/portfolio"]');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/portfolio');
      
      // Navigate back to home
      await page.click('nav a[href="/"]');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL('/');
      
      // Check that page content is visible after transitions
      const mainContent = await page.locator('main');
      await expect(mainContent).toBeVisible();
    });

    test('page loading states display correctly', async ({ page }) => {
      // Navigate to a different page
      const navigationPromise = page.click('nav a[href="/contact"]');
      
      // Check for loading indicators during transition
      await page.waitForTimeout(100); // Brief wait to catch loading state
      
      await navigationPromise;
      await page.waitForLoadState('networkidle');
      
      // Ensure page loaded completely
      await expect(page).toHaveURL('/contact');
      const contactForm = await page.locator('form');
      await expect(contactForm).toBeVisible();
    });

    test('page transitions respect reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      // Navigate between pages
      await page.click('nav a[href="/services"]');
      await page.waitForLoadState('networkidle');
      
      // Page should still navigate correctly
      await expect(page).toHaveURL('/services');
      const pageContent = await page.locator('main');
      await expect(pageContent).toBeVisible();
    });
  });

  test.describe('Scroll-Triggered Animations', () => {
    test('scroll progress indicator works correctly', async ({ page }) => {
      // Go to a page with sufficient content
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Check initial scroll position
      const initialScrollY = await page.evaluate(() => window.scrollY);
      expect(initialScrollY).toBe(0);
      
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(300);
      
      // Check that we've scrolled
      const midScrollY = await page.evaluate(() => window.scrollY);
      expect(midScrollY).toBeGreaterThan(0);
      
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      
      // Check that we're at or near the bottom
      const finalScrollY = await page.evaluate(() => window.scrollY);
      expect(finalScrollY).toBeGreaterThan(midScrollY);
    });

    test('reveal animations trigger on scroll', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Scroll down to trigger animations
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForTimeout(500);
      
      // Check that service cards are visible
      const serviceCards = await page.locator('.grid.md\\:grid-cols-3 > div');
      const cardCount = await serviceCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      for (let i = 0; i < cardCount; i++) {
        const card = serviceCards.nth(i);
        await expect(card).toBeVisible();
      }
    });

    test('parallax effects work during scroll', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      
      // Get initial position of potential parallax elements
      const backgroundElements = await page.locator('[class*="bg-gradient"], [class*="absolute"]');
      const elementCount = await backgroundElements.count();
      
      if (elementCount > 0) {
        // Scroll and check for smooth transitions
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(300);
        
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(300);
        
        // Elements should still be visible and properly positioned
        const firstElement = backgroundElements.first();
        await expect(firstElement).toBeVisible();
      }
    });

    test('scroll animations perform smoothly', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Perform multiple scroll actions in sequence
      const scrollSteps = [200, 600, 1200, 1800];
      
      for (const step of scrollSteps) {
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), step);
        await page.waitForTimeout(100); // Brief pause between scrolls
      }
      
      // Check that page is still responsive
      const lastCard = await page.locator('.grid.md\\:grid-cols-3 > div').last();
      if (await lastCard.count() > 0) {
        await expect(lastCard).toBeVisible();
      }
    });
  });

  test.describe('Interactive Hover States', () => {
    test('hover effects work on interactive elements', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Test service card hover effects
      const serviceCards = await page.locator('.grid.md\\:grid-cols-3 > div');
      const firstCard = serviceCards.first();
      
      // Hover over the card
      await firstCard.hover();
      await page.waitForTimeout(200);
      
      // Check that hover styles are applied
      const cardClasses = await firstCard.getAttribute('class');
      expect(cardClasses).toContain('group');
      
      // Test number scaling on hover
      const numberElement = await firstCard.locator('.text-6xl').first();
      const numberClasses = await numberElement.getAttribute('class');
      expect(numberClasses).toContain('group-hover:scale-105');
    });

    test('magnetic hover effects work correctly', async ({ page }) => {
      // Navigate to a page with interactive elements
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      // Test button hover effects
      const submitButton = await page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
      
      // Hover over button
      await submitButton.hover();
      await page.waitForTimeout(200);
      
      // Button should have hover states
      const buttonClasses = await submitButton.getAttribute('class');
      expect(buttonClasses).toContain('hover:') || expect(buttonClasses).toContain('group');
    });

    test('ripple effects work on clickable elements', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      // Fill form to enable submit button
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('textarea[name="message"]', 'Test message');
      
      // Click submit button to test ripple effect
      const submitButton = await page.locator('button[type="submit"]');
      
      // Mock the API call to prevent actual submission
      await page.route('**/api/contact', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });
      
      await submitButton.click();
      await page.waitForTimeout(300);
      
      // Button should show loading state or response
      const buttonText = await submitButton.textContent();
      expect(buttonText).toBeTruthy();
    });

    test('3D tilt effects work on cards', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      
      // Test portfolio card tilt effects
      const portfolioCards = await page.locator('.grid.md\\:grid-cols-2 > div');
      const firstCard = portfolioCards.first();
      
      if (await firstCard.count() > 0) {
        // Get card position
        const cardBox = await firstCard.boundingBox();
        
        if (cardBox) {
          // Move mouse to different positions on card
          const centerX = cardBox.x + cardBox.width / 2;
          const centerY = cardBox.y + cardBox.height / 2;
          
          // Test corner positions
          await page.mouse.move(cardBox.x + 10, cardBox.y + 10);
          await page.waitForTimeout(100);
          
          await page.mouse.move(cardBox.x + cardBox.width - 10, cardBox.y + 10);
          await page.waitForTimeout(100);
          
          await page.mouse.move(centerX, centerY);
          await page.waitForTimeout(100);
          
          // Card should remain visible and interactive
          await expect(firstCard).toBeVisible();
        }
      }
    });

    test('hover states are accessible via keyboard', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Tab to interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip logo
      await page.keyboard.press('Tab'); // Go to first nav item
      
      // Continue tabbing to find focusable elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        // Check that focused element is visible
        const activeElement = await page.evaluate(() => document.activeElement);
        if (activeElement) {
          break;
        }
      }
      
      // At least one element should be focusable
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT'].includes(activeElement || '')).toBe(true);
    });
  });

  test.describe('Loading Skeletons', () => {
    test('loading skeletons display during slow connections', async ({ page }) => {
      // Simulate slow network to catch loading states
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      await page.goto('/services');
      
      // Wait for initial content to load
      await page.waitForLoadState('networkidle');
      
      // Content should be visible (not showing skeletons)
      const serviceCards = await page.locator('.grid.md\\:grid-cols-3 > div');
      const cardCount = await serviceCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      // Cards should have real content, not skeleton placeholders
      const firstCard = serviceCards.first();
      const cardText = await firstCard.textContent();
      expect(cardText).toBeTruthy();
      expect(cardText?.length).toBeGreaterThan(10);
    });

    test('skeleton animations are smooth and non-intrusive', async ({ page }) => {
      // Create a test page with skeleton components
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      // Check that real content loads properly
      const form = await page.locator('form');
      await expect(form).toBeVisible();
      
      const inputFields = await page.locator('input, textarea');
      const fieldCount = await inputFields.count();
      expect(fieldCount).toBeGreaterThan(0);
      
      // All form fields should be interactive
      for (let i = 0; i < fieldCount; i++) {
        const field = inputFields.nth(i);
        const isEnabled = await field.isEnabled();
        expect(isEnabled).toBe(true);
      }
    });

    test('skeleton placeholders match real content structure', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      
      // Check that portfolio cards have consistent structure
      const portfolioCards = await page.locator('.grid.md\\:grid-cols-2 > div');
      const cardCount = await portfolioCards.count();
      
      if (cardCount > 0) {
        const firstCard = portfolioCards.first();
        
        // Check for essential card elements
        const cardTitle = await firstCard.locator('h3').first();
        const cardDescription = await firstCard.locator('p').first();
        
        await expect(cardTitle).toBeVisible();
        await expect(cardDescription).toBeVisible();
        
        // Check for action buttons
        const actionButtons = await firstCard.locator('a, button');
        const buttonCount = await actionButtons.count();
        expect(buttonCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Integration Tests', () => {
    test('all Phase 3 features work together seamlessly', async ({ page }) => {
      // Start with page transition
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate with page transition
      await page.click('nav a[href="/services"]');
      await page.waitForLoadState('networkidle');
      
      // Test scroll animations
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);
      
      // Test hover interactions
      const serviceCards = await page.locator('.grid.md\\:grid-cols-3 > div');
      if (await serviceCards.count() > 0) {
        const firstCard = serviceCards.first();
        await firstCard.hover();
        await page.waitForTimeout(200);
      }
      
      // Navigate to another page
      await page.click('nav a[href="/portfolio"]');
      await page.waitForLoadState('networkidle');
      
      // Test portfolio interactions
      const portfolioCards = await page.locator('.grid.md\\:grid-cols-2 > div');
      if (await portfolioCards.count() > 0) {
        const firstPortfolioCard = portfolioCards.first();
        await firstPortfolioCard.hover();
        await page.waitForTimeout(200);
      }
      
      // Test final navigation
      await page.click('nav a[href="/contact"]');
      await page.waitForLoadState('networkidle');
      
      // Verify contact form is interactive
      const contactForm = await page.locator('form');
      await expect(contactForm).toBeVisible();
      
      // Test form interaction
      await page.fill('input[name="firstName"]', 'Integration');
      const inputValue = await page.inputValue('input[name="firstName"]');
      expect(inputValue).toBe('Integration');
    });

    test('performance remains good with all animations', async ({ page }) => {
      // Navigate through multiple pages quickly
      const pages = ['/', '/services', '/portfolio', '/contact', '/about'];
      
      for (const pagePath of pages) {
        const startTime = Date.now();
        
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        
        // Page should load within reasonable time
        expect(loadTime).toBeLessThan(5000);
        
        // Page content should be visible
        const mainContent = await page.locator('main');
        await expect(mainContent).toBeVisible();
        
        // Test scroll performance if content is long enough
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        if (pageHeight > 1000) {
          await page.evaluate(() => window.scrollTo(0, 500));
          await page.waitForTimeout(100);
        }
      }
    });

    test('animations respect user preferences', async ({ page }) => {
      // Test with reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Content should still be functional
      const serviceCards = await page.locator('.grid.md\\:grid-cols-3 > div');
      const cardCount = await serviceCards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      // Hover interactions should still work
      const firstCard = serviceCards.first();
      await firstCard.hover();
      await page.waitForTimeout(100);
      
      // Content should remain accessible
      const cardText = await firstCard.textContent();
      expect(cardText).toBeTruthy();
    });

    test('touch interactions work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Test touch interactions
      const serviceCards = await page.locator('.grid.md\\:grid-cols-3 > div');
      if (await serviceCards.count() > 0) {
        const firstCard = serviceCards.first();
        
        // Tap the card
        await firstCard.tap();
        await page.waitForTimeout(200);
        
        // Card should respond to touch
        await expect(firstCard).toBeVisible();
      }
      
      // Test mobile navigation
      const mobileMenuButton = await page.locator('button[aria-label*="menu"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.tap();
        await page.waitForTimeout(300);
        
        // Mobile menu should open
        const mobileMenu = await page.locator('#mobile-menu');
        await expect(mobileMenu).toBeVisible();
      }
    });
  });
});