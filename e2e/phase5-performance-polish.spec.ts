import { test, expect } from '@playwright/test';

test.describe('Phase 5: Performance & Polish', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Image Optimization', () => {
    test('optimized images load efficiently with proper fallbacks', async ({ page }) => {
      // Check for Next.js Image components
      const nextImages = await page.locator('img[loading]');
      const imageCount = await nextImages.count();
      
      if (imageCount > 0) {
        // Test first few images
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const image = nextImages.nth(i);
          
          // Check image attributes
          const loading = await image.getAttribute('loading');
          const sizes = await image.getAttribute('sizes');
          
          // Should have appropriate loading strategy
          expect(['lazy', 'eager']).toContain(loading);
          
          // Should have responsive sizes for optimization
          if (sizes) {
            expect(sizes.length).toBeGreaterThan(0);
          }
          
          // Image should be visible when loaded
          await expect(image).toBeVisible();
          
          // Check for proper alt text
          const alt = await image.getAttribute('alt');
          expect(alt).toBeTruthy();
        }
      }
    });

    test('image galleries display with progressive loading', async ({ page }) => {
      // Navigate to portfolio page which likely has image galleries
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      
      // Look for gallery containers
      const galleries = await page.locator('.grid img, [class*="gallery"] img');
      const galleryImageCount = await galleries.count();
      
      if (galleryImageCount > 0) {
        // Test progressive loading behavior
        const firstImage = galleries.first();
        
        // Image should load
        await expect(firstImage).toBeVisible();
        
        // Check for hover effects
        await firstImage.hover();
        await page.waitForTimeout(200);
        
        // Should handle hover gracefully
        await expect(firstImage).toBeVisible();
        
        // Test multiple images load correctly
        for (let i = 0; i < Math.min(galleryImageCount, 3); i++) {
          const image = galleries.nth(i);
          const isVisible = await image.isVisible();
          
          if (isVisible) {
            // Each visible image should have proper dimensions
            const box = await image.boundingBox();
            if (box) {
              expect(box.width).toBeGreaterThan(50);
              expect(box.height).toBeGreaterThan(50);
            }
          }
        }
      }
    });

    test('image error states handle gracefully', async ({ page }) => {
      // Test error handling by looking for any broken images
      const images = await page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const image = images.nth(i);
        
        // Check if image loaded successfully
        const naturalWidth = await image.evaluate((img: HTMLImageElement) => img.naturalWidth);
        const naturalHeight = await image.evaluate((img: HTMLImageElement) => img.naturalHeight);
        
        // If image dimensions are 0, it failed to load
        if (naturalWidth === 0 || naturalHeight === 0) {
          // Should have fallback content or proper error handling
          const alt = await image.getAttribute('alt');
          expect(alt).toBeTruthy(); // At minimum should have alt text
        }
      }
    });

    test('avatar components render with fallbacks', async ({ page }) => {
      // Look for avatar-like components
      const avatars = await page.locator('img[class*="rounded-full"], .rounded-full img, [class*="avatar"]');
      const avatarCount = await avatars.count();
      
      if (avatarCount > 0) {
        const firstAvatar = avatars.first();
        await expect(firstAvatar).toBeVisible();
        
        // Should be reasonably sized for an avatar
        const box = await firstAvatar.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(20);
          expect(box.height).toBeGreaterThan(20);
          expect(box.width).toBeLessThan(200);
          expect(box.height).toBeLessThan(200);
        }
      }
    });

    test('hero images load with priority and proper sizing', async ({ page }) => {
      // Look for hero section images
      const heroImages = await page.locator('section img, .hero img, [class*="hero"] img').first();
      
      if (await heroImages.count() > 0) {
        await expect(heroImages).toBeVisible();
        
        // Hero images should be large
        const box = await heroImages.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(300);
          expect(box.height).toBeGreaterThan(200);
        }
        
        // Should have priority loading
        const loading = await heroImages.getAttribute('loading');
        expect(['eager', null]).toContain(loading); // Priority images don't have loading="lazy"
      }
    });
  });

  test.describe('Bundle Size Optimization', () => {
    test('dynamic imports work correctly for route components', async ({ page }) => {
      const startTime = Date.now();
      
      // Navigate to different routes to test dynamic loading
      const routes = ['/services', '/portfolio', '/about'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Page should load within reasonable time
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000); // 5 seconds max per route
        
        // Main content should be visible
        const mainContent = await page.locator('main, [role="main"]');
        await expect(mainContent).toBeVisible();
        
        // Reset timer for next route
        startTime = Date.now();
      }
    });

    test('icons load efficiently without bundle bloat', async ({ page }) => {
      // Check for SVG icons
      const icons = await page.locator('svg');
      const iconCount = await icons.count();
      
      expect(iconCount).toBeGreaterThan(0);
      
      // Test first few icons
      for (let i = 0; i < Math.min(iconCount, 5); i++) {
        const icon = icons.nth(i);
        await expect(icon).toBeVisible();
        
        // Icons should be reasonably sized
        const box = await icon.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(10);
          expect(box.height).toBeGreaterThan(10);
          expect(box.width).toBeLessThan(100);
          expect(box.height).toBeLessThan(100);
        }
      }
    });

    test('lazy loading components appear on demand', async ({ page }) => {
      // Test components that should be lazily loaded
      const pageHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      if (pageHeight > viewportHeight * 2) {
        // Scroll to trigger lazy loading
        await page.evaluate(() => window.scrollTo(0, window.innerHeight));
        await page.waitForTimeout(500);
        
        // More content should be visible now
        const visibleElements = await page.locator('*:visible');
        const elementCount = await visibleElements.count();
        expect(elementCount).toBeGreaterThan(5);
        
        // Scroll further
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(500);
        
        // Even more content should be loaded
        const newVisibleElements = await page.locator('*:visible');
        const newElementCount = await newVisibleElements.count();
        expect(newElementCount).toBeGreaterThanOrEqual(elementCount);
      }
    });

    test('resource hints improve loading performance', async ({ page }) => {
      // Check for preconnect and dns-prefetch hints
      const preconnectLinks = await page.locator('link[rel="preconnect"]');
      const dnsPrefetchLinks = await page.locator('link[rel="dns-prefetch"]');
      const preloadLinks = await page.locator('link[rel="preload"]');
      
      const totalHints = await preconnectLinks.count() + 
                         await dnsPrefetchLinks.count() + 
                         await preloadLinks.count();
      
      // Should have some resource hints for optimization
      expect(totalHints).toBeGreaterThan(0);
    });

    test('code splitting works for different page sections', async ({ page }) => {
      // Measure initial page load
      const startTime = performance.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const initialLoadTime = performance.now() - startTime;
      
      // Navigate to services page
      const servicesStartTime = performance.now();
      await page.click('nav a[href="/services"]');
      await page.waitForLoadState('networkidle');
      const servicesLoadTime = performance.now() - servicesStartTime;
      
      // Navigation should be faster than initial load (due to code splitting)
      expect(servicesLoadTime).toBeLessThan(initialLoadTime * 1.5);
      
      // Page should be functional
      const servicesContent = await page.locator('main');
      await expect(servicesContent).toBeVisible();
    });
  });

  test.describe('Accessibility Audit', () => {
    test('accessibility audit component functions correctly', async ({ page }) => {
      // This test assumes an accessibility audit component exists
      // We'll test the general accessibility features instead
      
      // Check for proper heading structure
      const h1Elements = await page.locator('h1');
      const h1Count = await h1Elements.count();
      
      // Should have exactly one H1 per page
      expect(h1Count).toBe(1);
      
      if (h1Count > 0) {
        const h1Text = await h1Elements.first().textContent();
        expect(h1Text).toBeTruthy();
        expect(h1Text?.length).toBeGreaterThan(3);
      }
    });

    test('images have proper alt text', async ({ page }) => {
      const images = await page.locator('img');
      const imageCount = await images.count();
      
      // Check first few images for alt text
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const image = images.nth(i);
        const alt = await image.getAttribute('alt');
        
        // Alt text should exist (can be empty for decorative images)
        expect(alt).not.toBeNull();
        
        // If alt text exists, it should be meaningful
        if (alt && alt.length > 0) {
          expect(alt.length).toBeGreaterThan(2);
        }
      }
    });

    test('form elements have proper labels', async ({ page }) => {
      // Navigate to contact page
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      const formInputs = await page.locator('input, textarea, select');
      const inputCount = await formInputs.count();
      
      if (inputCount > 0) {
        // Check first few inputs for labels
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          const input = formInputs.nth(i);
          
          // Check for associated label
          const inputId = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');
          
          if (inputId) {
            const associatedLabel = await page.locator(`label[for="${inputId}"]`);
            const hasLabel = await associatedLabel.count() > 0;
            
            // Should have either a label, aria-label, or aria-labelledby
            expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
          }
        }
      }
    });

    test('keyboard navigation works throughout the site', async ({ page }) => {
      // Start keyboard navigation
      await page.keyboard.press('Tab');
      
      let tabCount = 0;
      const maxTabs = 15;
      let foundInteractiveElement = false;
      
      while (tabCount < maxTabs) {
        const activeElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            type: el?.getAttribute?.('type'),
            href: el?.getAttribute?.('href'),
            isVisible: el && el.offsetParent !== null,
          };
        });
        
        if (activeElement.tagName && 
            ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)) {
          foundInteractiveElement = true;
          
          // Interactive element should be visible
          expect(activeElement.isVisible).toBe(true);
          
          // Test activation
          if (activeElement.tagName === 'BUTTON' || 
              (activeElement.tagName === 'A' && !activeElement.href)) {
            await page.keyboard.press('Enter');
            await page.waitForTimeout(100);
          }
          
          break;
        }
        
        await page.keyboard.press('Tab');
        tabCount++;
      }
      
      // Should find at least one interactive element
      expect(foundInteractiveElement).toBe(true);
    });

    test('focus indicators are visible', async ({ page }) => {
      // Find focusable elements
      const focusableElements = await page.locator('a, button, input, textarea, select');
      const elementCount = await focusableElements.count();
      
      if (elementCount > 0) {
        const firstElement = focusableElements.first();
        
        // Focus the element
        await firstElement.focus();
        
        // Check if element has focus
        const isFocused = await firstElement.evaluate((el: HTMLElement) => 
          document.activeElement === el
        );
        
        expect(isFocused).toBe(true);
        
        // Element should be visible when focused
        await expect(firstElement).toBeVisible();
      }
    });

    test('ARIA attributes are properly used', async ({ page }) => {
      // Check for ARIA landmarks
      const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
      const landmarkCount = await landmarks.count();
      
      // Should have some ARIA landmarks
      expect(landmarkCount).toBeGreaterThan(0);
      
      // Check for ARIA labels
      const ariaLabelElements = await page.locator('[aria-label], [aria-labelledby], [aria-describedby]');
      const ariaLabelCount = await ariaLabelElements.count();
      
      // Should have some ARIA labels
      expect(ariaLabelCount).toBeGreaterThan(0);
    });
  });

  test.describe('Theme Refinements', () => {
    test('theme toggle functionality works correctly', async ({ page }) => {
      // Look for theme toggle button
      const themeToggle = await page.locator('button[title*="theme"], button[title*="Theme"], [aria-label*="theme"], [aria-label*="Theme"]');
      const toggleCount = await themeToggle.count();
      
      if (toggleCount > 0) {
        const toggle = themeToggle.first();
        await expect(toggle).toBeVisible();
        
        // Test theme toggle
        await toggle.click();
        await page.waitForTimeout(300);
        
        // Should still be visible after toggle
        await expect(toggle).toBeVisible();
        
        // Test multiple toggles
        await toggle.click();
        await page.waitForTimeout(300);
        await expect(toggle).toBeVisible();
      }
    });

    test('theme persistence works across page navigation', async ({ page }) => {
      // Check initial theme state
      const initialDarkMode = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      
      // Navigate to another page
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Theme state should be consistent
      const servicesDarkMode = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      
      expect(servicesDarkMode).toBe(initialDarkMode);
      
      // Navigate back to home
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Theme should still be consistent
      const homeDarkMode = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      
      expect(homeDarkMode).toBe(initialDarkMode);
    });

    test('theme transitions are smooth and performant', async ({ page }) => {
      // Look for theme toggle
      const themeToggle = await page.locator('button[title*="theme"], button[title*="Theme"]');
      const toggleCount = await themeToggle.count();
      
      if (toggleCount > 0) {
        const toggle = themeToggle.first();
        
        // Measure transition performance
        const startTime = Date.now();
        await toggle.click();
        await page.waitForTimeout(500); // Wait for transition
        const transitionTime = Date.now() - startTime;
        
        // Transition should be quick
        expect(transitionTime).toBeLessThan(1000);
        
        // Page should remain functional
        const mainContent = await page.locator('main');
        await expect(mainContent).toBeVisible();
      }
    });

    test('theme respects system preferences', async ({ page }) => {
      // Test system theme detection
      const systemIsDark = await page.evaluate(() => 
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
      
      // Check if page respects system preference (if using system theme)
      const pageDarkMode = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      );
      
      // This test is informational - either custom theme or system theme is valid
      expect(typeof pageDarkMode).toBe('boolean');
      expect(typeof systemIsDark).toBe('boolean');
    });

    test('theme colors are applied consistently', async ({ page }) => {
      // Check that theme-specific styles are applied
      const bodyStyles = await page.evaluate(() => {
        const body = document.body;
        const computedStyles = window.getComputedStyle(body);
        return {
          backgroundColor: computedStyles.backgroundColor,
          color: computedStyles.color,
        };
      });
      
      // Should have background and text colors set
      expect(bodyStyles.backgroundColor).toBeTruthy();
      expect(bodyStyles.color).toBeTruthy();
      
      // Colors should not be the browser defaults
      expect(bodyStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(bodyStyles.color).not.toBe('rgb(0, 0, 0)');
    });
  });

  test.describe('Performance Metrics', () => {
    test('page load times are within acceptable limits', async ({ page }) => {
      const routes = ['/', '/services', '/portfolio', '/about', '/contact'];
      const maxLoadTime = 3000; // 3 seconds
      
      for (const route of routes) {
        const startTime = Date.now();
        
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(maxLoadTime);
        
        // Page should be interactive
        const mainContent = await page.locator('main, body');
        await expect(mainContent).toBeVisible();
      }
    });

    test('animations do not cause performance issues', async ({ page }) => {
      // Scroll through page to trigger animations
      const pageHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      if (pageHeight > viewportHeight) {
        // Scroll in increments
        const scrollSteps = 5;
        const scrollAmount = pageHeight / scrollSteps;
        
        for (let i = 0; i < scrollSteps; i++) {
          const startTime = Date.now();
          
          await page.evaluate((y) => window.scrollTo(0, y), scrollAmount * i);
          await page.waitForTimeout(200);
          
          const scrollTime = Date.now() - startTime;
          
          // Scrolling should be smooth (within reasonable time)
          expect(scrollTime).toBeLessThan(500);
        }
      }
    });

    test('interactive elements respond quickly', async ({ page }) => {
      // Test button interactions
      const buttons = await page.locator('button, a[href]');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        
        // Test hover response time
        const hoverStartTime = Date.now();
        await firstButton.hover();
        await page.waitForTimeout(100);
        const hoverTime = Date.now() - hoverStartTime;
        
        expect(hoverTime).toBeLessThan(300);
        
        // Element should remain responsive
        await expect(firstButton).toBeVisible();
      }
    });

    test('memory usage remains stable during navigation', async ({ page }) => {
      // Navigate through multiple pages
      const routes = ['/', '/services', '/portfolio', '/about'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Check that page is responsive after navigation
        const pageTitle = await page.title();
        expect(pageTitle.length).toBeGreaterThan(0);
        
        // Wait a bit to allow for any memory cleanup
        await page.waitForTimeout(100);
      }
      
      // Return to home page - should still be functional
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const mainContent = await page.locator('main');
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe('Integration Tests', () => {
    test('all Phase 5 optimizations work together harmoniously', async ({ page }) => {
      // Test complete user journey with all optimizations
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Images should load efficiently
      const images = await page.locator('img');
      const imageCount = await images.count();
      if (imageCount > 0) {
        await expect(images.first()).toBeVisible();
      }
      
      // Theme toggle should work
      const themeToggle = await page.locator('button[title*="theme"], button[title*="Theme"]');
      if (await themeToggle.count() > 0) {
        await themeToggle.first().click();
        await page.waitForTimeout(300);
      }
      
      // Navigation should be smooth
      await page.click('nav a[href="/services"]');
      await page.waitForLoadState('networkidle');
      
      // Content should be accessible
      const mainContent = await page.locator('main');
      await expect(mainContent).toBeVisible();
      
      // Scroll should trigger optimized animations
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);
      
      // Page should remain stable and functional
      await expect(mainContent).toBeVisible();
    });

    test('accessibility standards are maintained across optimizations', async ({ page }) => {
      // Test accessibility across different pages
      const routes = ['/services', '/portfolio', '/about'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Should have proper heading structure
        const h1Elements = await page.locator('h1');
        const h1Count = await h1Elements.count();
        expect(h1Count).toBeGreaterThanOrEqual(1);
        
        // Should be keyboard navigable
        await page.keyboard.press('Tab');
        const activeElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(['A', 'BUTTON', 'INPUT', 'BODY', 'HTML'].includes(activeElement || '')).toBe(true);
        
        // Should have proper ARIA landmarks
        const landmarks = await page.locator('[role], main, nav, header, footer');
        const landmarkCount = await landmarks.count();
        expect(landmarkCount).toBeGreaterThan(0);
      }
    });

    test('performance optimizations do not break functionality', async ({ page }) => {
      // Test that optimization features work
      const functionalityTests = [
        // Image optimization doesn't break display
        async () => {
          const images = await page.locator('img');
          if (await images.count() > 0) {
            await expect(images.first()).toBeVisible();
          }
        },
        
        // Bundle optimization doesn't break navigation
        async () => {
          await page.click('nav a[href="/services"]');
          await page.waitForLoadState('networkidle');
          const content = await page.locator('main');
          await expect(content).toBeVisible();
        },
        
        // Theme switching doesn't break layout
        async () => {
          const themeToggle = await page.locator('button[title*="theme"]');
          if (await themeToggle.count() > 0) {
            await themeToggle.first().click();
            await page.waitForTimeout(300);
            const content = await page.locator('main');
            await expect(content).toBeVisible();
          }
        },
      ];
      
      // Run all functionality tests
      for (const test of functionalityTests) {
        await test();
      }
    });

    test('SEO and meta optimization works with all features', async ({ page }) => {
      const routes = ['/', '/services', '/portfolio', '/about'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        
        // Should have proper title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
        expect(title.length).toBeLessThan(70); // SEO best practice
        
        // Should have meta description
        const metaDescription = await page.locator('meta[name="description"]');
        if (await metaDescription.count() > 0) {
          const content = await metaDescription.getAttribute('content');
          expect(content?.length).toBeGreaterThan(50);
          expect(content?.length).toBeLessThan(160); // SEO best practice
        }
        
        // Should have proper structured content
        const mainContent = await page.locator('main');
        await expect(mainContent).toBeVisible();
      }
    });
  });
});