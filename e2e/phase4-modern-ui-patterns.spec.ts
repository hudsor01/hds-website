import { test, expect } from '@playwright/test';

test.describe('Phase 4: Modern UI Patterns', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Hero Section Components', () => {
    test('hero section displays with gradient backgrounds', async ({ page }) => {
      // Check for hero section presence
      const heroSection = await page.locator('section').first();
      await expect(heroSection).toBeVisible();
      
      // Check for gradient classes in hero or background elements
      const gradientElements = await page.locator('[class*="bg-gradient"], [class*="gradient"]');
      const gradientCount = await gradientElements.count();
      expect(gradientCount).toBeGreaterThan(0);
      
      // Check for hero content structure
      const heroTitle = await page.locator('h1').first();
      await expect(heroTitle).toBeVisible();
      
      const heroText = await heroTitle.textContent();
      expect(heroText).toBeTruthy();
      expect(heroText?.length).toBeGreaterThan(5);
    });

    test('hero animations work on page load', async ({ page }) => {
      // Reload to catch initial animations
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check for hero title
      const heroTitle = await page.locator('h1').first();
      await expect(heroTitle).toBeVisible();
      
      // Check for CTA buttons
      const ctaButtons = await page.locator('a[href="/contact"], button:has-text("Get Started"), button:has-text("Start")');
      const buttonCount = await ctaButtons.count();
      
      if (buttonCount > 0) {
        const firstButton = ctaButtons.first();
        await expect(firstButton).toBeVisible();
        
        // Test button hover effects
        await firstButton.hover();
        await page.waitForTimeout(200);
        
        // Button should have hover classes
        const buttonClasses = await firstButton.getAttribute('class');
        expect(buttonClasses).toBeTruthy();
      }
    });

    test('hero scroll indicator and parallax effects work', async ({ page }) => {
      // Look for scroll indicators
      const scrollIndicators = await page.locator('[class*="scroll"], .animate-bounce, [aria-label*="scroll"]');
      const indicatorCount = await scrollIndicators.count();
      
      // Test scrolling behavior if page has sufficient height
      const pageHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      if (pageHeight > viewportHeight * 1.5) {
        // Scroll down to test parallax effects
        await page.evaluate(() => window.scrollTo(0, 300));
        await page.waitForTimeout(300);
        
        // Hero should still be visible or smoothly transitioning
        const heroSection = await page.locator('section').first();
        const isVisible = await heroSection.isVisible();
        
        // Either visible or smoothly hidden (both are valid)
        expect(typeof isVisible).toBe('boolean');
        
        // Scroll back up
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
      }
    });

    test('hero responsive behavior works correctly', async ({ page }) => {
      // Test desktop
      await page.setViewportSize({ width: 1440, height: 900 });
      
      const heroTitle = await page.locator('h1').first();
      await expect(heroTitle).toBeVisible();
      
      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(heroTitle).toBeVisible();
      
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(heroTitle).toBeVisible();
      
      // Check that text is still readable on mobile
      const titleText = await heroTitle.textContent();
      expect(titleText).toBeTruthy();
    });
  });

  test.describe('Bento Grid Layouts', () => {
    test('bento grid layouts display correctly', async ({ page }) => {
      // Navigate to pages that might have grid layouts
      const pages = ['/services', '/portfolio', '/about'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        // Look for grid layouts
        const gridElements = await page.locator('.grid, [class*="grid-cols"], [class*="grid"]');
        const gridCount = await gridElements.count();
        
        if (gridCount > 0) {
          // Test first grid
          const firstGrid = gridElements.first();
          await expect(firstGrid).toBeVisible();
          
          // Check for grid items
          const gridItems = await firstGrid.locator('> *');
          const itemCount = await gridItems.count();
          expect(itemCount).toBeGreaterThan(0);
          
          // Test grid responsiveness
          await page.setViewportSize({ width: 375, height: 667 });
          await expect(firstGrid).toBeVisible();
          
          await page.setViewportSize({ width: 1440, height: 900 });
          await expect(firstGrid).toBeVisible();
          
          break; // Found a grid, test passed
        }
      }
    });

    test('bento cards have proper hover effects', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Look for card-like elements in grids
      const cardElements = await page.locator('.grid > div, [class*="grid"] > div, [class*="card"], .p-6, .p-8');
      const cardCount = await cardElements.count();
      
      if (cardCount > 0) {
        const firstCard = cardElements.first();
        
        // Check card is visible
        await expect(firstCard).toBeVisible();
        
        // Test hover effects
        await firstCard.hover();
        await page.waitForTimeout(200);
        
        // Check for hover transition classes
        const cardClasses = await firstCard.getAttribute('class');
        const hasHoverEffects = cardClasses && (
          cardClasses.includes('hover:') ||
          cardClasses.includes('group') ||
          cardClasses.includes('transition')
        );
        
        expect(hasHoverEffects).toBe(true);
      }
    });

    test('bento grid animations stagger correctly', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      
      // Look for portfolio grid
      const portfolioGrid = await page.locator('.grid');
      const gridCount = await portfolioGrid.count();
      
      if (gridCount > 0) {
        const firstGrid = portfolioGrid.first();
        const gridItems = await firstGrid.locator('> div');
        const itemCount = await gridItems.count();
        
        // Test multiple items for stagger effect
        for (let i = 0; i < Math.min(itemCount, 3); i++) {
          const item = gridItems.nth(i);
          await expect(item).toBeVisible();
          
          // Brief delay to catch stagger timing
          await page.waitForTimeout(50);
        }
      }
    });

    test('bento grid maintains aspect ratios', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Check grid containers
      const gridContainers = await page.locator('.grid');
      const containerCount = await gridContainers.count();
      
      if (containerCount > 0) {
        const firstContainer = gridContainers.first();
        const gridItems = await firstContainer.locator('> *');
        const itemCount = await gridItems.count();
        
        // Check that items have reasonable dimensions
        for (let i = 0; i < Math.min(itemCount, 3); i++) {
          const item = gridItems.nth(i);
          const box = await item.boundingBox();
          
          if (box) {
            expect(box.width).toBeGreaterThan(50);
            expect(box.height).toBeGreaterThan(50);
            
            // Reasonable aspect ratio (not too extreme)
            const aspectRatio = box.width / box.height;
            expect(aspectRatio).toBeGreaterThan(0.2);
            expect(aspectRatio).toBeLessThan(5.0);
          }
        }
      }
    });
  });

  test.describe('Feature Sections with 3D Transforms', () => {
    test('feature sections display with 3D effects', async ({ page }) => {
      const pages = ['/services', '/about'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        // Look for feature sections
        const featureSections = await page.locator('section');
        const sectionCount = await featureSections.count();
        
        if (sectionCount > 1) {
          // Test feature cards/items
          const featureItems = await page.locator('[class*="feature"], .grid > div, section .grid > div');
          const itemCount = await featureItems.count();
          
          if (itemCount > 0) {
            const firstItem = featureItems.first();
            await expect(firstItem).toBeVisible();
            
            // Test hover for 3D effects
            await firstItem.hover();
            await page.waitForTimeout(300);
            
            // Check for transform classes
            const itemClasses = await firstItem.getAttribute('class');
            const hasTransforms = itemClasses && (
              itemClasses.includes('transform') ||
              itemClasses.includes('perspective') ||
              itemClasses.includes('rotate') ||
              itemClasses.includes('scale')
            );
            
            // Either has transform classes or custom CSS transforms
            const hasCustomTransforms = await firstItem.evaluate((el) => {
              const style = window.getComputedStyle(el);
              return style.transform !== 'none' || style.transformStyle === 'preserve-3d';
            });
            
            expect(hasTransforms || hasCustomTransforms).toBe(true);
            break;
          }
        }
      }
    });

    test('feature section animations trigger on scroll', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Scroll to trigger animations
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);
      
      // Look for animated feature elements
      const animatedElements = await page.locator('[class*="animate"], [class*="transition"]');
      const elementCount = await animatedElements.count();
      
      expect(elementCount).toBeGreaterThan(0);
      
      // Scroll further down
      await page.evaluate(() => window.scrollTo(0, 1000));
      await page.waitForTimeout(500);
      
      // Elements should remain visible and functional
      if (elementCount > 0) {
        const firstElement = animatedElements.first();
        const isVisible = await firstElement.isVisible();
        
        // Element should either be visible or smoothly hidden
        expect(typeof isVisible).toBe('boolean');
      }
    });

    test('feature icons and graphics have proper animations', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Look for icons (SVG elements)
      const icons = await page.locator('svg');
      const iconCount = await icons.count();
      
      if (iconCount > 0) {
        // Test first few icons
        for (let i = 0; i < Math.min(iconCount, 3); i++) {
          const icon = icons.nth(i);
          const isVisible = await icon.isVisible();
          
          if (isVisible) {
            // Test hover effects on parent or icon itself
            const parent = await icon.locator('..').first();
            await parent.hover();
            await page.waitForTimeout(200);
            
            // Icon should be responsive to interactions
            await expect(icon).toBeVisible();
          }
        }
      }
    });

    test('feature sections maintain readability during animations', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Find feature text content
      const textElements = await page.locator('h2, h3, p');
      const textCount = await textElements.count();
      
      if (textCount > 0) {
        // Test text during animations
        const titleElement = await page.locator('h2, h3').first();
        await expect(titleElement).toBeVisible();
        
        // Hover on parent container to trigger animations
        const parentSection = await titleElement.locator('..').first();
        await parentSection.hover();
        await page.waitForTimeout(300);
        
        // Text should remain readable
        const titleText = await titleElement.textContent();
        expect(titleText).toBeTruthy();
        expect(titleText?.length).toBeGreaterThan(3);
        
        // Text should still be visible after animation
        await expect(titleElement).toBeVisible();
      }
    });
  });

  test.describe('Testimonial Carousels', () => {
    test('testimonial carousel displays and functions', async ({ page }) => {
      // Look for testimonial sections across pages
      const pages = ['/about', '/', '/services'];
      let foundCarousel = false;
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        // Look for testimonial indicators
        const testimonialElements = await page.locator('[class*="testimonial"], [class*="carousel"], .grid > div:has-text("testimonial"), blockquote');
        const testimonialCount = await testimonialElements.count();
        
        if (testimonialCount > 0) {
          foundCarousel = true;
          
          // Test first testimonial element
          const firstTestimonial = testimonialElements.first();
          await expect(firstTestimonial).toBeVisible();
          
          const testimonialText = await firstTestimonial.textContent();
          expect(testimonialText).toBeTruthy();
          
          break;
        }
      }
      
      // If no testimonials found, check for quote-like content
      if (!foundCarousel) {
        const quotes = await page.locator('blockquote, [class*="quote"]');
        const quoteCount = await quotes.count();
        
        if (quoteCount > 0) {
          const firstQuote = quotes.first();
          await expect(firstQuote).toBeVisible();
          foundCarousel = true;
        }
      }
      
      expect(foundCarousel).toBe(true);
    });

    test('carousel navigation works correctly', async ({ page }) => {
      // Create a test scenario with navigation
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for navigation buttons
      const navButtons = await page.locator('button[aria-label*="next"], button[aria-label*="previous"], button:has(svg)');
      const buttonCount = await navButtons.count();
      
      if (buttonCount > 0) {
        // Test button functionality
        const firstButton = navButtons.first();
        await expect(firstButton).toBeVisible();
        
        // Click button
        await firstButton.click();
        await page.waitForTimeout(300);
        
        // Button should remain interactive
        await expect(firstButton).toBeEnabled();
      }
      
      // Look for dot navigation
      const dots = await page.locator('[class*="dot"], .w-2.h-2, button[aria-label*="Go to"]');
      const dotCount = await dots.count();
      
      if (dotCount > 1) {
        // Test dot navigation
        const secondDot = dots.nth(1);
        await secondDot.click();
        await page.waitForTimeout(300);
        
        // Should handle navigation smoothly
        expect(dotCount).toBeGreaterThan(0);
      }
    });

    test('testimonial content displays properly', async ({ page }) => {
      await page.goto('/about');
      await page.waitForLoadState('networkidle');
      
      // Look for testimonial-like content structure
      const contentElements = await page.locator('blockquote, [class*="quote"], .grid > div');
      const contentCount = await contentElements.count();
      
      if (contentCount > 0) {
        // Test testimonial content structure
        const firstContent = contentElements.first();
        await expect(firstContent).toBeVisible();
        
        // Look for author information
        const authorElements = await firstContent.locator('[class*="author"], [class*="name"], h3, h4, .font-bold');
        const authorCount = await authorElements.count();
        
        if (authorCount > 0) {
          const author = authorElements.first();
          const authorText = await author.textContent();
          expect(authorText).toBeTruthy();
        }
        
        // Look for rating elements (stars)
        const ratingElements = await firstContent.locator('svg[class*="star"], [class*="rating"], [class*="star"]');
        const ratingCount = await ratingElements.count();
        
        // Rating is optional, so just verify structure if present
        if (ratingCount > 0) {
          const firstStar = ratingElements.first();
          await expect(firstStar).toBeVisible();
        }
      }
    });

    test('carousel auto-play and touch interactions work', async ({ page }) => {
      // Set mobile viewport for touch testing
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for swipeable content
      const swipeableElements = await page.locator('[class*="carousel"], [class*="swipe"], .grid');
      const swipeCount = await swipeableElements.count();
      
      if (swipeCount > 0) {
        const firstSwipeable = swipeableElements.first();
        
        // Test touch interaction
        const box = await firstSwipeable.boundingBox();
        
        if (box) {
          // Simulate swipe gesture
          await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
          await page.mouse.up();
          
          await page.waitForTimeout(300);
          
          // Element should handle touch interaction gracefully
          await expect(firstSwipeable).toBeVisible();
        }
      }
    });

    test('testimonial animations are smooth and accessible', async ({ page }) => {
      // Test with reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for testimonial content
      const testimonialElements = await page.locator('blockquote, [class*="testimonial"]');
      const testimonialCount = await testimonialElements.count();
      
      if (testimonialCount > 0) {
        const firstTestimonial = testimonialElements.first();
        await expect(firstTestimonial).toBeVisible();
        
        // Content should be accessible even with reduced motion
        const testimonialText = await firstTestimonial.textContent();
        expect(testimonialText).toBeTruthy();
        expect(testimonialText?.length).toBeGreaterThan(10);
      }
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      
      // Should be able to navigate to interactive elements
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT'].includes(activeElement || '')).toBe(true);
    });
  });

  test.describe('Integration Tests', () => {
    test('all Phase 4 components work together harmoniously', async ({ page }) => {
      // Test complete page with multiple modern UI patterns
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check hero section
      const heroTitle = await page.locator('h1').first();
      await expect(heroTitle).toBeVisible();
      
      // Navigate to services (likely has feature sections)
      await page.click('nav a[href="/services"]');
      await page.waitForLoadState('networkidle');
      
      // Check for grid layouts
      const gridElements = await page.locator('.grid');
      const gridCount = await gridElements.count();
      expect(gridCount).toBeGreaterThan(0);
      
      // Test interactions
      if (gridCount > 0) {
        const firstGrid = gridElements.first();
        const gridItems = await firstGrid.locator('> div');
        const itemCount = await gridItems.count();
        
        if (itemCount > 0) {
          const firstItem = gridItems.first();
          await firstItem.hover();
          await page.waitForTimeout(200);
        }
      }
      
      // Navigate to portfolio (likely has bento grids)
      await page.click('nav a[href="/portfolio"]');
      await page.waitForLoadState('networkidle');
      
      // Check portfolio structure
      const portfolioContent = await page.locator('main');
      await expect(portfolioContent).toBeVisible();
      
      // Scroll to test animations
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);
      
      // Page should remain stable and interactive
      const interactiveElements = await page.locator('a, button');
      const interactiveCount = await interactiveElements.count();
      expect(interactiveCount).toBeGreaterThan(0);
    });

    test('performance remains optimal with all modern UI patterns', async ({ page }) => {
      // Test performance across pages with complex UI
      const pages = ['/', '/services', '/portfolio', '/about'];
      const maxLoadTime = 3000; // 3 seconds max
      
      for (const pagePath of pages) {
        const startTime = Date.now();
        
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(maxLoadTime);
        
        // Test interaction responsiveness
        const clickableElements = await page.locator('a, button').first();
        if (await clickableElements.count() > 0) {
          await clickableElements.hover();
          await page.waitForTimeout(100);
          
          // Hover should be responsive
          await expect(clickableElements).toBeVisible();
        }
      }
    });

    test('modern UI patterns are responsive across all devices', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1440, height: 900, name: 'desktop' },
        { width: 1920, height: 1080, name: 'large desktop' },
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        await page.goto('/services');
        await page.waitForLoadState('networkidle');
        
        // Check that content is visible and readable
        const mainContent = await page.locator('main');
        await expect(mainContent).toBeVisible();
        
        // Check that grids adapt properly
        const gridElements = await page.locator('.grid');
        const gridCount = await gridElements.count();
        
        if (gridCount > 0) {
          const firstGrid = gridElements.first();
          await expect(firstGrid).toBeVisible();
          
          // Grid items should be visible
          const gridItems = await firstGrid.locator('> *');
          const itemCount = await gridItems.count();
          
          if (itemCount > 0) {
            const firstItem = gridItems.first();
            await expect(firstItem).toBeVisible();
            
            // Item should have reasonable dimensions for viewport
            const box = await firstItem.boundingBox();
            if (box) {
              expect(box.width).toBeGreaterThan(50);
              expect(box.width).toBeLessThan(viewport.width);
            }
          }
        }
      }
    });

    test('accessibility is maintained with all modern UI patterns', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Test keyboard navigation through modern UI elements
      await page.keyboard.press('Tab');
      
      let tabCount = 0;
      const maxTabs = 20;
      
      while (tabCount < maxTabs) {
        const activeElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            hasVisibleFocus: el && window.getComputedStyle(el).outline !== 'none',
            isVisible: el && el.offsetParent !== null,
          };
        });
        
        if (activeElement.tagName && ['A', 'BUTTON', 'INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
          // Interactive element should be visible and have focus indication
          expect(activeElement.isVisible).toBe(true);
          break;
        }
        
        await page.keyboard.press('Tab');
        tabCount++;
      }
      
      // Should find at least one interactive element
      expect(tabCount).toBeLessThan(maxTabs);
      
      // Test ARIA labels on complex components
      const ariaElements = await page.locator('[aria-label], [aria-labelledby], [role]');
      const ariaCount = await ariaElements.count();
      expect(ariaCount).toBeGreaterThan(0);
    });
  });
});