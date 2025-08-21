import { test, expect } from '@playwright/test';

test.describe('Framer Motion Animation Performance', () => {

  test.describe('Button Animations', () => {
    test('should have smooth hover and tap animations', async ({ page }) => {
      await page.goto('/');
      
      // Find a primary button
      const button = page.locator('a:has-text("Get Started")').first();
      await expect(button).toBeVisible();
      
      // Get initial transform
      const initialTransform = await button.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      // Test hover animation
      await button.hover();
      await page.waitForTimeout(100); // Allow animation to start
      
      const hoverTransform = await button.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      // Transform should change on hover (scale effect)
      expect(hoverTransform).not.toBe(initialTransform);
      
      // Test box shadow on hover
      const boxShadow = await button.evaluate((el) => 
        window.getComputedStyle(el).boxShadow
      );
      expect(boxShadow).toContain('rgba');
      
      // Measure animation smoothness
      const fps = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let frames = 0;
          let startTime = performance.now();
          
          function countFrames() {
            frames++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrames);
            } else {
              resolve(frames);
            }
          }
          
          requestAnimationFrame(countFrames);
        });
      });
      
      // Should maintain at least 30fps during animations
      expect(fps).toBeGreaterThan(30);
    });

    test('should have spring physics on tap', async ({ page }) => {
      await page.goto('/contact');
      
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
      
      // Simulate tap/click and measure transform
      const clickPromise = submitButton.click();
      
      // Quickly check transform during click
      const duringClickTransform = await submitButton.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      await clickPromise;
      
      // Should have scale transform during click (whileTap)
      expect(duringClickTransform).toMatch(/matrix|scale/);
    });
  });

  test.describe('Service Card Animations', () => {
    test('should animate service cards on hover with spring physics', async ({ page }) => {
      await page.goto('/services');
      
      // Wait for service cards to be visible
      const serviceCard = page.locator('.group').first();
      await expect(serviceCard).toBeVisible();
      
      // Get initial position
      const initialBox = await serviceCard.boundingBox();
      expect(initialBox).toBeTruthy();
      
      // Hover over card
      await serviceCard.hover();
      await page.waitForTimeout(300); // Allow spring animation
      
      // Check if card moved up (y: -8)
      const hoverBox = await serviceCard.boundingBox();
      expect(hoverBox).toBeTruthy();
      expect(hoverBox!.y).toBeLessThan(initialBox!.y);
      
      // Check for box shadow
      const boxShadow = await serviceCard.evaluate((el) => 
        window.getComputedStyle(el).boxShadow
      );
      expect(boxShadow).not.toBe('none');
    });

    test('should animate service numbers on hover', async ({ page }) => {
      await page.goto('/services');
      
      // Find service number
      const serviceNumber = page.locator('text=/0[1-3]/').first();
      await expect(serviceNumber).toBeVisible();
      
      const parentCard = serviceNumber.locator('xpath=ancestor::div[contains(@class, "group")]').first();
      
      // Get initial scale
      const initialTransform = await serviceNumber.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      // Hover parent card
      await parentCard.hover();
      await page.waitForTimeout(200);
      
      // Check if number scaled
      const hoverTransform = await serviceNumber.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      expect(hoverTransform).not.toBe(initialTransform);
    });

    test('should animate process steps on hover', async ({ page }) => {
      await page.goto('/services');
      
      // Scroll to process section
      await page.evaluate(() => {
        const processSection = document.querySelector('h2:has-text("THE PROCESS")');
        processSection?.scrollIntoView({ behavior: 'smooth' });
      });
      
      await page.waitForTimeout(500); // Wait for scroll
      
      const processStep = page.locator('.w-16.h-16').first();
      await expect(processStep).toBeVisible();
      
      // Test rotation on hover
      const initialTransform = await processStep.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      await processStep.hover();
      await page.waitForTimeout(300); // Allow rotation animation
      
      const hoverTransform = await processStep.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      // Should have rotation transform
      expect(hoverTransform).not.toBe(initialTransform);
      expect(hoverTransform).toMatch(/matrix|rotate/);
    });
  });

  test.describe('Portfolio Grid Stagger Animations', () => {
    test('should stagger portfolio cards on scroll into view', async ({ page }) => {
      await page.goto('/portfolio');
      
      // Get all portfolio cards
      const cards = page.locator('.group.relative');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);
      
      // Track animation timings
      const animationTimings = await page.evaluate(() => {
        const cards = document.querySelectorAll('.group.relative');
        const timings: number[] = [];
        const startTime = performance.now();
        
        return new Promise<number[]>((resolve) => {
          const observer = new MutationObserver(() => {
            cards.forEach((card, index) => {
              const opacity = window.getComputedStyle(card).opacity;
              if (opacity === '1' && !timings[index]) {
                timings[index] = performance.now() - startTime;
              }
            });
            
            if (timings.filter(Boolean).length === cards.length) {
              observer.disconnect();
              resolve(timings);
            }
          });
          
          cards.forEach(card => {
            observer.observe(card, { 
              attributes: true, 
              attributeFilter: ['style', 'class'] 
            });
          });
          
          // Timeout fallback
          setTimeout(() => {
            observer.disconnect();
            resolve(timings);
          }, 3000);
        });
      });
      
      // Verify stagger effect (each card should animate after the previous)
      for (let i = 1; i < animationTimings.length; i++) {
        if (animationTimings[i] && animationTimings[i - 1]) {
          // Each card should animate ~150ms after the previous (as configured)
          const delay = animationTimings[i] - animationTimings[i - 1];
          expect(delay).toBeGreaterThan(50); // Allow some variance
          expect(delay).toBeLessThan(300);
        }
      }
    });

    test('should animate portfolio stats with hover effects', async ({ page }) => {
      await page.goto('/portfolio');
      
      // Find stats
      const stat = page.locator('text=/150\\+/').first();
      await expect(stat).toBeVisible();
      
      // Test hover scale
      const initialTransform = await stat.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      await stat.hover();
      await page.waitForTimeout(200);
      
      const hoverTransform = await stat.evaluate((el) => 
        window.getComputedStyle(el).transform
      );
      
      expect(hoverTransform).not.toBe(initialTransform);
    });

    test('should lift portfolio cards on hover', async ({ page }) => {
      await page.goto('/portfolio');
      
      // Wait for grid to be visible
      await page.waitForSelector('.group.relative');
      
      const projectCard = page.locator('.group.relative').first();
      const initialBox = await projectCard.boundingBox();
      
      await projectCard.hover();
      await page.waitForTimeout(300); // Spring animation
      
      const hoverBox = await projectCard.boundingBox();
      
      // Card should move up
      expect(hoverBox!.y).toBeLessThan(initialBox!.y);
    });
  });

  test.describe('Home Page Service Cards', () => {
    test('should animate service cards with colored shadows', async ({ page }) => {
      await page.goto('/');
      
      // Scroll to services section
      await page.evaluate(() => {
        const servicesSection = document.querySelector('#services-heading');
        servicesSection?.scrollIntoView({ behavior: 'smooth' });
      });
      
      await page.waitForTimeout(500);
      
      // Test each service card color
      const webDevCard = page.locator('h3:has-text("Web Development")').locator('xpath=ancestor::div[contains(@class, "group")]').first();
      await expect(webDevCard).toBeVisible();
      
      await webDevCard.hover();
      await page.waitForTimeout(200);
      
      // Check for cyan shadow on web dev card
      const boxShadow = await webDevCard.evaluate((el) => {
        const innerDiv = el.querySelector('.relative.bg-gray-900\\/80');
        return window.getComputedStyle(innerDiv!).boxShadow;
      });
      
      expect(boxShadow).toContain('rgba');
      // Should contain cyan color values (34, 211, 238)
      expect(boxShadow).toMatch(/rgba\(34,\s*211,\s*238/);
    });
  });

  test.describe('Animation Performance Metrics', () => {
    test('should maintain 60fps during animations', async ({ page }) => {
      await page.goto('/');
      
      // Start performance recording
      await page.evaluate(() => {
        (window as any).animationFrames = [];
        let lastTime = performance.now();
        
        function recordFrame(currentTime: number) {
          const delta = currentTime - lastTime;
          (window as any).animationFrames.push(delta);
          lastTime = currentTime;
          
          if ((window as any).animationFrames.length < 60) {
            requestAnimationFrame(recordFrame);
          }
        }
        
        requestAnimationFrame(recordFrame);
      });
      
      // Trigger various animations
      const button = page.locator('a:has-text("Get Started")').first();
      await button.hover();
      await page.waitForTimeout(100);
      await button.click();
      
      // Wait for frames to be recorded
      await page.waitForTimeout(1000);
      
      // Analyze frame times
      const frameTimes = await page.evaluate(() => (window as any).animationFrames);
      const averageFrameTime = frameTimes.reduce((a: number, b: number) => a + b, 0) / frameTimes.length;
      
      // Average frame time should be ~16.67ms for 60fps
      expect(averageFrameTime).toBeLessThan(20); // Allow some variance
    });

    test('should not cause layout shifts during animations', async ({ page }) => {
      await page.goto('/services');
      
      // Monitor layout shifts
      const layoutShifts = await page.evaluate(() => {
        return new Promise<number>((resolve) => {
          let totalShift = 0;
          
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if ((entry as any).entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                totalShift += (entry as any).value;
              }
            }
          });
          
          observer.observe({ entryTypes: ['layout-shift'] });
          
          // Trigger animations
          setTimeout(() => {
            const cards = document.querySelectorAll('.group');
            cards.forEach(card => {
              card.dispatchEvent(new MouseEvent('mouseenter'));
            });
          }, 100);
          
          // Collect data
          setTimeout(() => {
            observer.disconnect();
            resolve(totalShift);
          }, 2000);
        });
      });
      
      // CLS should be minimal
      expect(layoutShifts).toBeLessThan(0.1);
    });

    test('should lazy load animation library efficiently', async ({ page }) => {
      // Clear cache and measure bundle loading
      await page.route('**/*.js', route => {
        route.continue();
      });
      
      const jsRequests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('.js')) {
          jsRequests.push(request.url());
        }
      });
      
      await page.goto('/');
      
      // Check that Framer Motion is loaded efficiently
      const framerBundle = jsRequests.find(url => 
        url.includes('framer') || url.includes('motion')
      );
      
      if (framerBundle) {
        const response = await page.request.get(framerBundle);
        const size = (await response.body()).length;
        
        // Optimized bundle should be small (< 10KB gzipped)
        expect(size).toBeLessThan(10240);
      }
    });
  });
});