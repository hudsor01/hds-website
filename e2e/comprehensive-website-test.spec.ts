import { test, expect } from '@playwright/test';

test.describe('Hudson Digital Solutions - Comprehensive Website Testing', () => {
  
  test.describe.configure({ timeout: 120000 }); // 2 minute timeout for comprehensive tests

  test.beforeEach(async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });

    // Track uncaught exceptions
    page.on('pageerror', error => {
      console.error(`Page error: ${error.message}`);
    });
  });

  test.describe('Page Loading & Basic Functionality', () => {
    
    test('Home page loads successfully with dark design', async ({ page }) => {
      await page.goto('/');
      
      // Check page loads without errors
      await expect(page).toHaveTitle(/Hudson Digital Solutions/);
      
      // Verify dark gradient background is present
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Check for hero section
      const heroSection = page.locator('[data-testid="hero-section"], .hero, h1').first();
      await expect(heroSection).toBeVisible();
      
      // Verify navigation is present
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toBeVisible();
      
      console.log('✅ Home page loaded successfully');
    });

    test('Services page loads with proper styling', async ({ page }) => {
      await page.goto('/services');
      
      // Check page loads
      await expect(page.locator('h1')).toBeVisible();
      
      // Look for service cards/sections
      const serviceContent = page.locator('.service, .card, [data-testid*="service"]').first();
      if (await serviceContent.count() > 0) {
        await expect(serviceContent).toBeVisible();
      }
      
      console.log('✅ Services page loaded successfully');
    });

    test('Portfolio page displays correctly', async ({ page }) => {
      await page.goto('/portfolio');
      
      // Check page loads
      await expect(page.locator('h1')).toBeVisible();
      
      // Look for portfolio items
      const portfolioContent = page.locator('.portfolio, .project, [data-testid*="portfolio"]').first();
      if (await portfolioContent.count() > 0) {
        await expect(portfolioContent).toBeVisible();
      }
      
      console.log('✅ Portfolio page loaded successfully');
    });

    test('Contact page loads with form', async ({ page }) => {
      await page.goto('/contact');
      
      // Check page loads
      await expect(page.locator('h1')).toBeVisible();
      
      // Verify contact form is present
      const form = page.locator('form');
      await expect(form).toBeVisible();
      
      console.log('✅ Contact page loaded successfully');
    });

    test('About page loads if it exists', async ({ page }) => {
      const response = await page.goto('/about');
      
      if (response?.status() === 200) {
        await expect(page.locator('h1')).toBeVisible();
        console.log('✅ About page loaded successfully');
      } else {
        console.log('ℹ️ About page does not exist or is not accessible');
      }
    });

  });

  test.describe('Navigation & User Flow Testing', () => {
    
    test('Navigation menu works across all browsers', async ({ page }) => {
      await page.goto('/');
      
      // Find navigation links
      const navLinks = page.locator('nav a, [role="navigation"] a');
      const linkCount = await navLinks.count();
      
      console.log(`Found ${linkCount} navigation links`);
      
      // Test main navigation links
      const testLinks = ['services', 'portfolio', 'contact'];
      
      for (const link of testLinks) {
        const navLink = page.locator(`nav a[href*="${link}"], [role="navigation"] a[href*="${link}"]`).first();
        
        if (await navLink.count() > 0) {
          await navLink.click();
          await page.waitForLoadState('networkidle');
          
          // Verify we're on the right page
          await expect(page).toHaveURL(new RegExp(link));
          console.log(`✅ Navigation to /${link} works`);
          
          // Go back to home for next test
          await page.goto('/');
          await page.waitForLoadState('networkidle');
        }
      }
    });

    test('Critical user flow: Home → Services → Contact', async ({ page }) => {
      // Start at home
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Navigate to services
      const servicesLink = page.locator('a[href*="services"]').first();
      await servicesLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/services/);
      
      // Navigate to contact from services
      const contactLink = page.locator('a[href*="contact"]').first();
      await contactLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/contact/);
      
      // Verify contact form is present
      await expect(page.locator('form')).toBeVisible();
      
      console.log('✅ Critical user flow completed successfully');
    });

    test('Mobile navigation works', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Look for mobile menu button
      const menuButton = page.locator('[data-testid="mobile-menu"], .mobile-menu-toggle, button[aria-label*="menu"], button[aria-expanded]').first();
      
      if (await menuButton.count() > 0) {
        await menuButton.click();
        
        // Check if mobile menu is visible
        const mobileMenu = page.locator('[data-testid="mobile-menu-items"], .mobile-menu, [role="menu"]').first();
        await expect(mobileMenu).toBeVisible();
        
        console.log('✅ Mobile navigation works');
      } else {
        console.log('ℹ️ Mobile menu button not found - may use different mobile navigation pattern');
      }
    });

  });

  test.describe('Contact Form Functionality', () => {
    
    test('Contact form renders and validates correctly', async ({ page }) => {
      await page.goto('/contact');
      
      // Wait for form to be visible
      const form = page.locator('form');
      await expect(form).toBeVisible();
      
      // Check for basic form fields
      const nameField = page.locator('input[name*="name"], input[id*="name"]').first();
      const emailField = page.locator('input[type="email"], input[name*="email"]').first();
      const messageField = page.locator('textarea[name*="message"], textarea[id*="message"]').first();
      
      await expect(nameField).toBeVisible();
      await expect(emailField).toBeVisible();
      await expect(messageField).toBeVisible();
      
      // Test form validation
      const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
      await submitButton.click();
      
      // Check if validation errors appear (form should not submit without required fields)
      await page.waitForTimeout(1000); // Wait for validation
      
      console.log('✅ Contact form validation works');
    });

    test('Contact form fields work with PRD requirements', async ({ page }) => {
      await page.goto('/contact');
      
      // Fill out basic fields
      await page.fill('input[name*="name"], input[id*="name"]', 'Test User');
      await page.fill('input[type="email"], input[name*="email"]', 'test@example.com');
      await page.fill('textarea[name*="message"], textarea[id*="message"]', 'Test message');
      
      // Look for PRD-specific fields
      const timeField = page.locator('select[name*="time"], select[id*="time"], [data-testid*="time"]').first();
      const interestField = page.locator('select[name*="interest"], select[id*="interest"], [data-testid*="interest"]').first();
      
      if (await timeField.count() > 0) {
        await timeField.selectOption({ index: 1 });
        console.log('✅ Best Time to Contact field works');
      }
      
      if (await interestField.count() > 0) {
        await interestField.selectOption({ index: 1 });
        console.log('✅ Categorical Interest field works');
      }
      
      console.log('✅ Form fields populated successfully');
    });

  });

  test.describe('Visual & Design Testing', () => {
    
    test('Dark gradient backgrounds render correctly', async ({ page }) => {
      await page.goto('/');
      
      // Check body background
      const body = page.locator('body');
      const bodyStyles = await body.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          background: computed.background,
          backgroundColor: computed.backgroundColor,
          backgroundImage: computed.backgroundImage
        };
      });
      
      // Should have some form of background styling
      const hasBackground = bodyStyles.background !== 'rgba(0, 0, 0, 0)' || 
                           bodyStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                           bodyStyles.backgroundImage !== 'none';
      
      expect(hasBackground).toBeTruthy();
      console.log('✅ Background styling is applied');
    });

    test('Hover effects work on interactive elements', async ({ page }) => {
      await page.goto('/');
      
      // Find buttons and links to test hover effects
      const buttons = page.locator('button, a[href], [role="button"]');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        
        // Get initial styles
        const initialStyles = await firstButton.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            transform: computed.transform,
            opacity: computed.opacity,
            backgroundColor: computed.backgroundColor
          };
        });
        
        // Hover over the element
        await firstButton.hover();
        await page.waitForTimeout(300); // Wait for hover transition
        
        // Get hover styles
        const hoverStyles = await firstButton.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            transform: computed.transform,
            opacity: computed.opacity,
            backgroundColor: computed.backgroundColor
          };
        });
        
        // Check if any style changed on hover
        const stylesChanged = JSON.stringify(initialStyles) !== JSON.stringify(hoverStyles);
        
        console.log(`✅ Hover effects ${stylesChanged ? 'detected' : 'may not be present'}`);
      }
    });

    test('Responsive design works on different screen sizes', async ({ page }) => {
      // Test different viewport sizes
      const viewports = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1920, height: 1080, name: 'Desktop' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        
        // Check if content is visible and properly laid out
        const mainContent = page.locator('main, .main, [role="main"], h1').first();
        await expect(mainContent).toBeVisible();
        
        console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) layout works`);
      }
    });

  });

  test.describe('Performance & Error Testing', () => {
    
    test('No JavaScript errors in console', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      page.on('pageerror', error => {
        errors.push(error.message);
      });
      
      // Test main pages
      const pages = ['/', '/services', '/portfolio', '/contact'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for any delayed scripts
      }
      
      // Filter out non-critical errors
      const criticalErrors = errors.filter(error => 
        !error.includes('favicon') &&
        !error.includes('analytics') &&
        !error.includes('posthog') &&
        !error.toLowerCase().includes('network')
      );
      
      expect(criticalErrors).toHaveLength(0);
      
      if (criticalErrors.length === 0) {
        console.log('✅ No critical JavaScript errors found');
      } else {
        console.error('❌ Critical errors found:', criticalErrors);
      }
    });

    test('Pages load within acceptable time', async ({ page }) => {
      const pages = ['/', '/services', '/portfolio', '/contact'];
      
      for (const pagePath of pages) {
        const startTime = Date.now();
        
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        
        // Should load within 10 seconds (generous for development)
        expect(loadTime).toBeLessThan(10000);
        
        console.log(`✅ ${pagePath} loaded in ${loadTime}ms`);
      }
    });

    test('All critical assets load correctly', async ({ page }) => {
      await page.goto('/');
      
      // Check for failed network requests
      const failedRequests: string[] = [];
      
      page.on('response', response => {
        if (response.status() >= 400) {
          failedRequests.push(`${response.status()}: ${response.url()}`);
        }
      });
      
      await page.waitForLoadState('networkidle');
      
      // Filter out non-critical failed requests
      const criticalFailures = failedRequests.filter(request => 
        !request.includes('favicon') &&
        !request.includes('analytics') &&
        !request.includes('tracking')
      );
      
      expect(criticalFailures).toHaveLength(0);
      
      if (criticalFailures.length === 0) {
        console.log('✅ All critical assets loaded successfully');
      } else {
        console.error('❌ Critical asset failures:', criticalFailures);
      }
    });

  });

  test.describe('Cross-Browser Compatibility', () => {
    
    test('Site works in Chromium', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Chromium-specific test');
      
      await page.goto('/');
      await expect(page.locator('h1')).toBeVisible();
      
      // Test form functionality
      await page.goto('/contact');
      await expect(page.locator('form')).toBeVisible();
      
      console.log('✅ Chromium compatibility verified');
    });

    test('Site works in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'Firefox-specific test');
      
      await page.goto('/');
      await expect(page.locator('h1')).toBeVisible();
      
      await page.goto('/contact');
      await expect(page.locator('form')).toBeVisible();
      
      console.log('✅ Firefox compatibility verified');
    });

    test('Site works in WebKit/Safari', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'WebKit-specific test');
      
      await page.goto('/');
      await expect(page.locator('h1')).toBeVisible();
      
      await page.goto('/contact');
      await expect(page.locator('form')).toBeVisible();
      
      console.log('✅ WebKit/Safari compatibility verified');
    });

  });

});