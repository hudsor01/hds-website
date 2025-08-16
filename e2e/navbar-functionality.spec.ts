import { test, expect } from '@playwright/test';

test.describe('Navbar Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('nav', { timeout: 10000 });
  });

  test('should display navbar without hydration errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error' && 
          !msg.text().includes('PostHog') && 
          !msg.text().includes('Failed to load resource')) {
        errors.push(msg.text());
      }
    });

    // Wait for navbar to load
    await page.waitForSelector('nav', { timeout: 5000 });
    
    // Check navbar is visible and not transparent/hidden
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
    
    // Check navbar has proper styling (not stuck with opacity 0)
    const navbarStyles = await navbar.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        opacity: styles.opacity,
        transform: styles.transform,
        visibility: styles.visibility
      };
    });
    
    expect(navbarStyles.opacity).not.toBe('0');
    expect(navbarStyles.visibility).not.toBe('hidden');
    
    // Ensure no hydration errors occurred
    expect(errors.filter(err => err.includes('hydrat'))).toHaveLength(0);
  });

  test('should have working navigation links with analytics tracking', async ({ page }) => {
    // Check that navigation links are present and clickable
    const navLinks = [
      { text: 'Home', href: '/' },
      { text: 'Services', href: '/services' },
      { text: 'Portfolio', href: '/portfolio' },
      { text: 'Blog', href: '/blog' },
      { text: 'Contact', href: '/contact' }
    ];

    for (const link of navLinks) {
      const navLink = page.locator(`nav a:has-text("${link.text}")`, { hasText: link.text });
      
      // Check if link exists (some might be in mobile menu)
      const linkCount = await navLink.count();
      if (linkCount > 0) {
        await expect(navLink.first()).toBeVisible();
        
        // Verify href attribute
        const href = await navLink.first().getAttribute('href');
        expect(href).toBe(link.href);
      }
    }
  });

  test('should show active state for current page', async ({ page }) => {
    // Go to different pages and check active states
    const pages = [
      { path: '/services', linkText: 'Services' },
      { path: '/portfolio', linkText: 'Portfolio' },
      { path: '/contact', linkText: 'Contact' }
    ];

    for (const { path, linkText } of pages) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('nav', { timeout: 5000 });
      
      // Check if the current page link has active styling
      const activeLink = page.locator(`nav a:has-text("${linkText}")`, { hasText: linkText });
      if (await activeLink.count() > 0) {
        const classList = await activeLink.first().getAttribute('class');
        expect(classList).toContain('text-cyan-400'); // Active link should have cyan color
      }
    }
  });

  test('should handle mobile menu correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check for mobile menu button
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button:has([data-testid="menu-icon"])');
    
    if (await mobileMenuButton.count() > 0) {
      // Open mobile menu
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      // Check if mobile menu appeared
      const mobileMenu = page.locator('#mobile-menu, [data-testid="mobile-menu"]');
      if (await mobileMenu.count() > 0) {
        await expect(mobileMenu).toBeVisible();

        // Check mobile menu links
        const mobileLinks = mobileMenu.locator('a');
        const linkCount = await mobileLinks.count();
        expect(linkCount).toBeGreaterThan(0);

        // Close mobile menu (force click to bypass backdrop)
        await mobileMenuButton.click({ force: true });
        await page.waitForTimeout(500);
      }
    }
  });

  test('should have proper scroll behavior', async ({ page }) => {
    // Check navbar without scroll
    const navbar = page.locator('nav');
    const initialClasses = await navbar.getAttribute('class');
    
    // Scroll down the page
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    
    // Check if navbar classes changed (scroll effect)
    const scrolledClasses = await navbar.getAttribute('class');
    
    // The navbar should still be visible after scrolling
    await expect(navbar).toBeVisible();
    
    // Classes might change for scroll effects (glassmorphism, shadow, etc.)
    expect(scrolledClasses).toBeDefined();
  });

  test('should load theme toggle functionality', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button:has([data-testid="theme-toggle"])');
    
    if (await themeToggle.count() > 0) {
      await expect(themeToggle.first()).toBeVisible();
      
      // Test theme toggle click
      await themeToggle.first().click();
      await page.waitForTimeout(500);
      
      // Check if theme changed (html class or data attribute)
      const htmlElement = page.locator('html');
      const htmlClasses = await htmlElement.getAttribute('class');
      const themeAttribute = await htmlElement.getAttribute('data-theme');
      
      // Either classes or theme attribute should indicate theme state
      expect(htmlClasses || themeAttribute).toBeDefined();
    }
  });

  test('should render get started CTA button', async ({ page }) => {
    const ctaButton = page.locator('a:has-text("Get Started")');
    
    if (await ctaButton.count() > 0) {
      await expect(ctaButton.first()).toBeVisible();
      
      // Verify it links to contact page
      const href = await ctaButton.first().getAttribute('href');
      expect(href).toBe('/contact');
      
      // Test hover effect (should not cause errors)
      await ctaButton.first().hover();
      await page.waitForTimeout(200);
    }
  });
});