import { test, expect } from '@playwright/test';

test.describe('Dark Design System - Visual Testing', () => {
  
  test.describe.configure({ timeout: 90000 });

  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-delay: 0.01ms !important;
          transition-duration: 0.01ms !important;
          transition-delay: 0.01ms !important;
        }
      `
    });
  });

  test.describe('Desktop Visual Tests', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('Homepage dark design renders correctly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Allow for any delayed content
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot('homepage-dark-design.png', {
        fullPage: true,
        threshold: 0.3
      });
      
      console.log('✅ Homepage visual test completed');
    });

    test('Services page visual consistency', async ({ page }) => {
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('services-dark-design.png', {
        fullPage: true,
        threshold: 0.3
      });
      
      console.log('✅ Services page visual test completed');
    });

    test('Portfolio page visual layout', async ({ page }) => {
      await page.goto('/portfolio');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('portfolio-dark-design.png', {
        fullPage: true,
        threshold: 0.3
      });
      
      console.log('✅ Portfolio page visual test completed');
    });

    test('Contact form dark styling', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('contact-dark-design.png', {
        fullPage: true,
        threshold: 0.3
      });
      
      console.log('✅ Contact page visual test completed');
    });

  });

  test.describe('Mobile Visual Tests', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('Mobile homepage dark design', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('mobile-homepage-dark.png', {
        fullPage: true,
        threshold: 0.3
      });
      
      console.log('✅ Mobile homepage visual test completed');
    });

    test('Mobile contact form layout', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('mobile-contact-dark.png', {
        fullPage: true,
        threshold: 0.3
      });
      
      console.log('✅ Mobile contact visual test completed');
    });

  });

  test.describe('Component-Level Visual Tests', () => {
    
    test('Navigation bar styling', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toHaveScreenshot('navbar-dark-design.png', {
        threshold: 0.3
      });
      
      console.log('✅ Navigation visual test completed');
    });

    test('Hero section gradient effects', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Find hero section
      const hero = page.locator('[data-testid="hero-section"], .hero, section').first();
      if (await hero.count() > 0) {
        await expect(hero).toHaveScreenshot('hero-dark-gradient.png', {
          threshold: 0.3
        });
      }
      
      console.log('✅ Hero section visual test completed');
    });

    test('Contact form components', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form');
      await expect(form).toHaveScreenshot('contact-form-dark.png', {
        threshold: 0.3
      });
      
      console.log('✅ Contact form visual test completed');
    });

    test('Footer styling consistency', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const footer = page.locator('footer');
      if (await footer.count() > 0) {
        await expect(footer).toHaveScreenshot('footer-dark-design.png', {
          threshold: 0.3
        });
      }
      
      console.log('✅ Footer visual test completed');
    });

  });

  test.describe('Interactive Elements Visual Tests', () => {
    
    test('Button hover states', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const buttons = page.locator('button, a[class*="button"], [role="button"]');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        
        // Normal state
        await expect(firstButton).toHaveScreenshot('button-normal-state.png', {
          threshold: 0.3
        });
        
        // Hover state
        await firstButton.hover();
        await page.waitForTimeout(300);
        await expect(firstButton).toHaveScreenshot('button-hover-state.png', {
          threshold: 0.3
        });
      }
      
      console.log('✅ Button state visual tests completed');
    });

    test('Form field focus states', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      const firstInput = page.locator('input').first();
      
      if (await firstInput.count() > 0) {
        // Normal state
        await expect(firstInput).toHaveScreenshot('input-normal-state.png', {
          threshold: 0.3
        });
        
        // Focus state
        await firstInput.focus();
        await page.waitForTimeout(300);
        await expect(firstInput).toHaveScreenshot('input-focus-state.png', {
          threshold: 0.3
        });
      }
      
      console.log('✅ Form field visual tests completed');
    });

  });

  test.describe('Cross-Resolution Visual Tests', () => {
    
    test('4K resolution compatibility', async ({ page }) => {
      await page.setViewportSize({ width: 3840, height: 2160 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Test that content scales properly at 4K
      const mainContent = page.locator('main, .main, [role="main"]').first();
      await expect(mainContent).toBeVisible();
      
      console.log('✅ 4K resolution visual test completed');
    });

    test('Tablet landscape orientation', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await expect(page).toHaveScreenshot('tablet-landscape-dark.png', {
        fullPage: true,
        threshold: 0.3
      });
      
      console.log('✅ Tablet landscape visual test completed');
    });

  });

});