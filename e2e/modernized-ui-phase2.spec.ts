import { test, expect } from '@playwright/test';

test.describe('Modernized Navigation Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('navigation header has glassmorphism effects', async ({ page }) => {
    const nav = await page.locator('nav').first();
    await expect(nav).toBeVisible();
    
    // Check for fixed positioning
    const navClasses = await nav.getAttribute('class');
    expect(navClasses).toContain('fixed');
    expect(navClasses).toContain('z-50');
    
    // Check for backdrop blur styling
    const navStyles = await nav.evaluate((el) => window.getComputedStyle(el));
    expect(navStyles.backdropFilter || navStyles.webkitBackdropFilter).toBeTruthy();
    
    // Check for glassmorphism background
    const bgDiv = await page.locator('nav > div').first();
    const bgClasses = await bgDiv.getAttribute('class');
    expect(bgClasses).toContain('bg-gradient-to-r');
    expect(bgClasses).toContain('/80'); // transparency
  });

  test('navigation scroll effects work correctly', async ({ page }) => {
    const nav = await page.locator('nav').first();
    
    // Initial state - not scrolled
    let navClasses = await nav.getAttribute('class');
    expect(navClasses).not.toContain('shadow-2xl');
    
    // Scroll down to trigger effects
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300); // Wait for scroll handler
    
    // Check if scroll effects are applied
    navClasses = await nav.getAttribute('class');
    expect(navClasses).toContain('shadow-2xl');
    
    // Check backdrop blur changes
    const navStyle = await nav.getAttribute('style');
    expect(navStyle).toContain('blur');
  });

  test('logo has animation effects', async ({ page }) => {
    const logo = await page.locator('nav a[aria-label*="Hudson Digital Solutions - Home"]').first();
    await expect(logo).toBeVisible();
    
    // Check for logo icon
    const sparklesIcon = await logo.locator('svg').first();
    await expect(sparklesIcon).toBeVisible();
    
    // Check for gradient text
    const logoText = await logo.locator('span').first();
    const logoClasses = await logoText.getAttribute('class');
    expect(logoClasses).toContain('bg-gradient-to-r');
    expect(logoClasses).toContain('from-cyan-400');
    expect(logoClasses).toContain('to-blue-400');
    expect(logoClasses).toContain('bg-clip-text');
    
    // Hover over logo to trigger animation
    await logo.hover();
    await page.waitForTimeout(100);
    
    // Logo should have hover effects
    const iconDiv = await logo.locator('.relative').first();
    await expect(iconDiv).toBeVisible();
  });

  test('desktop navigation links have active indicators', async ({ page }) => {
    // Check home link is active on homepage
    const homeLink = await page.locator('nav a[href="/"][role="menuitem"]').first();
    const homeLinkClasses = await homeLink.getAttribute('class');
    expect(homeLinkClasses).toContain('text-cyan-400');
    
    // Check for active indicator animation
    const activeIndicator = await homeLink.locator('.bg-gradient-to-r').first();
    const isActiveIndicatorVisible = await activeIndicator.isVisible().catch(() => false);
    
    if (isActiveIndicatorVisible) {
      const indicatorClasses = await activeIndicator.getAttribute('class');
      expect(indicatorClasses).toContain('from-cyan-500/20');
      expect(indicatorClasses).toContain('to-blue-500/20');
    }
    
    // Navigate to services page
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    // Check services link is now active
    const servicesLink = await page.locator('nav a[href="/services"][role="menuitem"]').first();
    const servicesLinkClasses = await servicesLink.getAttribute('class');
    expect(servicesLinkClasses).toContain('text-cyan-400');
  });

  test('CTA button has shimmer effect', async ({ page }) => {
    const ctaButton = await page.locator('nav a[href="/contact"]:has-text("Get Started")').first();
    await expect(ctaButton).toBeVisible();
    
    // Check for gradient background
    const buttonSpan = await ctaButton.locator('span').first();
    const spanClasses = await buttonSpan.getAttribute('class');
    expect(spanClasses).toContain('bg-gradient-to-r');
    expect(spanClasses).toContain('from-cyan-500');
    expect(spanClasses).toContain('to-blue-500');
    
    // Check for shimmer effect span
    const shimmerSpan = await ctaButton.locator('span:has(span.from-transparent)').first();
    await expect(shimmerSpan).toHaveCount(1);
    
    // Hover to trigger animations
    await ctaButton.hover();
    await page.waitForTimeout(200);
    
    // Button should scale on hover
    const buttonClasses = await ctaButton.getAttribute('class');
    expect(buttonClasses).toContain('group');
  });

  test('mobile menu has smooth animations', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check hamburger button
    const hamburgerButton = await page.locator('button[aria-label*="menu"]').first();
    await expect(hamburgerButton).toBeVisible();
    
    // Check initial icon is bars
    const barsIcon = await hamburgerButton.locator('svg path[d*="M4 6h16"]').first();
    const barsVisible = await barsIcon.isVisible().catch(() => false);
    expect(barsVisible).toBe(true);
    
    // Open mobile menu
    await hamburgerButton.click();
    await page.waitForTimeout(400); // Wait for animation
    
    // Check X icon is now visible
    const xIcon = await hamburgerButton.locator('svg path[d*="M6 18L18 6"]').first();
    const xVisible = await xIcon.isVisible().catch(() => false);
    expect(xVisible).toBe(true);
    
    // Check mobile menu is visible
    const mobileMenu = await page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();
    
    // Check glassmorphism background
    const menuBg = await mobileMenu.locator('.bg-gradient-to-b').first();
    const menuBgClasses = await menuBg.getAttribute('class');
    expect(menuBgClasses).toContain('backdrop-blur-xl');
    expect(menuBgClasses).toContain('from-gray-900/95');
    
    // Check menu items are visible with staggered animation
    const menuItems = await mobileMenu.locator('a[aria-current]');
    const itemCount = await menuItems.count();
    expect(itemCount).toBeGreaterThan(0);
    
    // Close menu
    await hamburgerButton.click();
    await page.waitForTimeout(400);
    
    // Menu should be hidden
    await expect(mobileMenu).not.toBeVisible();
  });

  test('navigation links have hover effects', async ({ page }) => {
    const servicesLink = await page.locator('nav a[href="/services"][role="menuitem"]').first();
    
    // Initial state
    const initialClasses = await servicesLink.getAttribute('class');
    expect(initialClasses).toContain('text-gray-300');
    
    // Hover state
    await servicesLink.hover();
    await page.waitForTimeout(100);
    
    // Check hover background effect
    const hoverDiv = await servicesLink.locator('div').last();
    const hoverDivExists = await hoverDiv.count() > 0;
    
    if (hoverDivExists) {
      // Framer motion adds hover styles dynamically
      const linkBox = await servicesLink.boundingBox();
      if (linkBox) {
        // Verify the link is still interactive
        await expect(servicesLink).toBeEnabled();
      }
    }
  });
});

test.describe('Modernized Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
  });

  test('footer has glassmorphism effects', async ({ page }) => {
    const footer = await page.locator('footer').first();
    await expect(footer).toBeVisible();
    
    // Check for glassmorphism background
    const bgDiv = await footer.locator('.bg-gradient-to-t').first();
    const bgClasses = await bgDiv.getAttribute('class');
    expect(bgClasses).toContain('from-black');
    expect(bgClasses).toContain('via-gray-900/95');
    
    // Check for backdrop blur
    const blurDiv = await footer.locator('.backdrop-blur-xl').first();
    await expect(blurDiv).toBeVisible();
    
    // Check animated border
    const borderDiv = await footer.locator('.h-\\[1px\\] .animate-pulse').first();
    const borderClasses = await borderDiv.getAttribute('class');
    expect(borderClasses).toContain('bg-gradient-to-r');
    expect(borderClasses).toContain('via-cyan-400');
  });

  test('footer has proper grid layout', async ({ page }) => {
    const footer = await page.locator('footer').first();
    
    // Check main grid container
    const gridContainer = await footer.locator('.grid.grid-cols-1.md\\:grid-cols-4').first();
    await expect(gridContainer).toBeVisible();
    
    // Check all four columns exist
    const columns = await gridContainer.locator('> div');
    const columnCount = await columns.count();
    expect(columnCount).toBe(4);
    
    // Check brand section
    const brandSection = await columns.nth(0);
    const brandHeading = await brandSection.locator('h3');
    const brandText = await brandHeading.textContent();
    expect(brandText).toContain('Hudson Digital');
    
    // Check gradient text
    const brandClasses = await brandHeading.getAttribute('class');
    expect(brandClasses).toContain('bg-gradient-to-r');
    expect(brandClasses).toContain('from-cyan-400');
    expect(brandClasses).toContain('to-blue-400');
    expect(brandClasses).toContain('bg-clip-text');
  });

  test('footer contact information has hover effects', async ({ page }) => {
    const emailLink = await page.locator('footer a[href^="mailto:"]').first();
    await expect(emailLink).toBeVisible();
    
    // Check for icon
    const emailIcon = await emailLink.locator('svg').first();
    await expect(emailIcon).toBeVisible();
    
    // Check initial state
    const initialClasses = await emailLink.getAttribute('class');
    expect(initialClasses).toContain('text-gray-400');
    expect(initialClasses).toContain('hover:text-cyan-400');
    
    // Hover to trigger animation
    await emailLink.hover();
    await page.waitForTimeout(100);
    
    // Icon should scale on hover
    const iconClasses = await emailIcon.getAttribute('class');
    expect(iconClasses).toContain('group-hover:scale-110');
  });

  test('footer links have underline animation', async ({ page }) => {
    const aboutLink = await page.locator('footer a[href="/about"]').first();
    await expect(aboutLink).toBeVisible();
    
    // Check for underline span
    const underlineSpan = await aboutLink.locator('span.absolute.bottom-0');
    const underlineExists = await underlineSpan.count() > 0;
    
    if (underlineExists) {
      const spanClasses = await underlineSpan.getAttribute('class');
      expect(spanClasses).toContain('bg-cyan-400');
      expect(spanClasses).toContain('group-hover:w-full');
      
      // Initial state - no width
      expect(spanClasses).toContain('w-0');
      
      // Hover to trigger animation
      await aboutLink.hover();
      await page.waitForTimeout(300);
      
      // Underline should expand (handled by CSS transition)
      await expect(aboutLink).toHaveClass(/group/);
    }
  });

  test('newsletter form has modern styling', async ({ page }) => {
    const newsletterForm = await page.locator('footer form').first();
    await expect(newsletterForm).toBeVisible();
    
    // Check email input styling
    const emailInput = await newsletterForm.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    
    const inputClasses = await emailInput.getAttribute('class');
    expect(inputClasses).toContain('bg-white/10');
    expect(inputClasses).toContain('backdrop-blur-md');
    expect(inputClasses).toContain('border-white/20');
    expect(inputClasses).toContain('focus:ring-cyan-400');
    
    // Check subscribe button
    const subscribeButton = await newsletterForm.locator('button[type="submit"]');
    await expect(subscribeButton).toBeVisible();
    
    const buttonClasses = await subscribeButton.getAttribute('class');
    expect(buttonClasses).toContain('bg-gradient-to-r');
    expect(buttonClasses).toContain('from-cyan-500');
    expect(buttonClasses).toContain('to-blue-500');
    
    // Test form interaction
    await emailInput.focus();
    await emailInput.fill('test@example.com');
    
    // Button should be clickable
    await expect(subscribeButton).toBeEnabled();
  });

  test('social media links have hover animations', async ({ page }) => {
    // Find LinkedIn link
    const linkedInLink = await page.locator('footer a[href*="linkedin.com"]').first();
    await expect(linkedInLink).toBeVisible();
    
    // Check initial styling
    const initialClasses = await linkedInLink.getAttribute('class');
    expect(initialClasses).toContain('bg-white/5');
    expect(initialClasses).toContain('backdrop-blur-md');
    expect(initialClasses).toContain('border-white/10');
    
    // Hover to trigger animations
    await linkedInLink.hover();
    await page.waitForTimeout(100);
    
    // Check hover state classes
    expect(initialClasses).toContain('hover:bg-white/10');
    expect(initialClasses).toContain('hover:border-cyan-400/50');
    expect(initialClasses).toContain('hover:text-cyan-400');
    
    // Check GitHub link
    const githubLink = await page.locator('footer a[href*="github.com"]').first();
    await expect(githubLink).toBeVisible();
    
    // Both should have similar styling
    const githubClasses = await githubLink.getAttribute('class');
    expect(githubClasses).toBe(initialClasses);
  });

  test('scroll to top button appears and works', async ({ page }) => {
    // Initially scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    
    // Scroll to top button should not be visible
    let scrollButton = await page.locator('button[aria-label="Scroll to top"]');
    await expect(scrollButton).not.toBeVisible();
    
    // Scroll down past threshold
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    
    // Scroll to top button should appear
    scrollButton = await page.locator('button[aria-label="Scroll to top"]');
    await expect(scrollButton).toBeVisible();
    
    // Check button styling
    const buttonClasses = await scrollButton.getAttribute('class');
    expect(buttonClasses).toContain('fixed');
    expect(buttonClasses).toContain('bottom-8');
    expect(buttonClasses).toContain('right-8');
    expect(buttonClasses).toContain('bg-gradient-to-r');
    expect(buttonClasses).toContain('from-cyan-500');
    expect(buttonClasses).toContain('to-blue-500');
    
    // Click to scroll to top
    await scrollButton.click();
    await page.waitForTimeout(1000); // Wait for smooth scroll
    
    // Check we're back at top
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
    
    // Button should disappear
    await page.waitForTimeout(500);
    await expect(scrollButton).not.toBeVisible();
  });

  test('footer sections have staggered animations', async ({ page }) => {
    // Reload page to see animations
    await page.reload();
    
    // Scroll to footer to trigger animations
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 800));
    await page.waitForTimeout(100);
    
    // Continue scrolling to fully reveal footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600); // Wait for staggered animations
    
    // All sections should be visible
    const sections = await page.locator('footer .grid > div');
    const sectionCount = await sections.count();
    
    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);
      await expect(section).toBeVisible();
    }
    
    // Copyright section should be visible
    const copyright = await page.locator('footer').getByText(/© \d{4} Hudson Digital Solutions/);
    await expect(copyright).toBeVisible();
  });
});

test.describe('Phase 2 Integration Tests', () => {
  test('all Phase 2 components work together seamlessly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check navigation is visible and functional
    const nav = await page.locator('nav').first();
    await expect(nav).toBeVisible();
    
    // Navigate to services to test cards
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    // Check service cards are present and functional
    const serviceCards = await page.locator('.grid.md\\:grid-cols-3 > div');
    const cardCount = await serviceCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Test card hover effects
    const firstCard = serviceCards.first();
    await firstCard.hover();
    await page.waitForTimeout(200);
    
    // Navigate to portfolio to test different card styles
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    
    // Check portfolio cards
    const portfolioCards = await page.locator('.grid.md\\:grid-cols-2 > div');
    const portfolioCardCount = await portfolioCards.count();
    expect(portfolioCardCount).toBeGreaterThan(0);
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const footer = await page.locator('footer').first();
    await expect(footer).toBeVisible();
    
    // Navigation should still be visible and fixed
    await expect(nav).toBeVisible();
    const navPosition = await nav.evaluate(el => window.getComputedStyle(el).position);
    expect(navPosition).toBe('fixed');
    
    // Test scroll to top button
    const scrollButton = await page.locator('button[aria-label="Scroll to top"]');
    await expect(scrollButton).toBeVisible();
    await scrollButton.click();
    await page.waitForTimeout(1000);
    
    // Should be back at top
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test('navigation and footer work together without conflicts', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check both are visible
    const nav = await page.locator('nav').first();
    await expect(nav).toBeVisible();
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const footer = await page.locator('footer').first();
    await expect(footer).toBeVisible();
    
    // Navigation should still be visible and fixed
    await expect(nav).toBeVisible();
    const navPosition = await nav.evaluate(el => window.getComputedStyle(el).position);
    expect(navPosition).toBe('fixed');
    
    // Click a navigation link from bottom of page
    const homeLink = await nav.locator('a[href="/"]').first();
    await homeLink.click();
    await page.waitForLoadState('networkidle');
    
    // Should navigate successfully
    expect(page.url()).toContain('/');
  });

  test('main content has proper padding for fixed navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check main element has padding-top
    const main = await page.locator('main#main-content');
    const mainClasses = await main.getAttribute('class');
    expect(mainClasses).toContain('pt-16');
    
    // Content should not be hidden under navbar
    const firstElement = await page.locator('main > *').first();
    const firstElementBox = await firstElement.boundingBox();
    
    const nav = await page.locator('nav').first();
    const navBox = await nav.boundingBox();
    
    if (firstElementBox && navBox) {
      // First element should start below navbar
      expect(firstElementBox.y).toBeGreaterThanOrEqual(navBox.height);
    }
  });

  test('responsive behavior works correctly', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    
    // Desktop nav links should be visible
    const desktopNav = await page.locator('nav .hidden.md\\:flex');
    await expect(desktopNav).toBeVisible();
    
    // Mobile menu button should not be visible
    const mobileButton = await page.locator('button[aria-label*="menu"]');
    await expect(mobileButton).not.toBeVisible();
    
    // Footer should use 4-column grid
    const footerGrid = await page.locator('footer .md\\:grid-cols-4');
    await expect(footerGrid).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Desktop nav should be hidden
    await expect(desktopNav).not.toBeVisible();
    
    // Mobile menu button should be visible
    await expect(mobileButton).toBeVisible();
    
    // Footer should use single column
    const footerColumns = await page.locator('footer .grid > div');
    const firstColumn = await footerColumns.first();
    const secondColumn = await footerColumns.nth(1);
    
    const firstBox = await firstColumn.boundingBox();
    const secondBox = await secondColumn.boundingBox();
    
    if (firstBox && secondBox) {
      // Columns should stack vertically on mobile
      expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10);
    }
  });
});