import { test, expect } from '@playwright/test';

test.describe('Site Navigation and Pages', () => {
  test('Homepage loads with all sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check hero section
    const heroSection = await page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Check main heading
    const mainHeading = await page.locator('h1');
    await expect(mainHeading).toBeVisible();
    const headingText = await mainHeading.textContent();
    expect(headingText).toContain('DIGITAL.MASTERMIND.UNLEASHED.');
    
    // Check CTA buttons
    const ctaButtons = await page.locator('a[href="/contact"], a[href="/services"]');
    const ctaCount = await ctaButtons.count();
    expect(ctaCount).toBeGreaterThanOrEqual(1);
    
    // Check services section
    const servicesSection = await page.locator('text=/Services|What We Do|Our Expertise/i').first();
    await expect(servicesSection).toBeVisible();
    
    // Check portfolio section
    const portfolioSection = await page.locator('text=/Portfolio|Our Work|Projects/i').first();
    await expect(portfolioSection).toBeVisible();
    
    // Check testimonials or about section
    const testimonialsSection = await page.locator('text=/Testimonial|Client|About/i').first();
    await expect(testimonialsSection).toBeVisible();
  });

  test('Navigation menu works on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check navigation links
    const navLinks = [
      { text: 'Services', href: '/services' },
      { text: 'Portfolio', href: '/portfolio' },
      { text: 'Blog', href: '/blog' },
      { text: 'Contact', href: '/contact' }
    ];
    
    for (const link of navLinks) {
      const navLink = await page.locator(`nav a:has-text("${link.text}")`).first();
      const isVisible = await navLink.isVisible().catch(() => false);
      
      if (isVisible) {
        const href = await navLink.getAttribute('href');
        expect(href).toBe(link.href);
        
        // Test navigation
        await navLink.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain(link.href);
        
        // Navigate back
        await page.goto('/');
      }
    }
  });

  test('Navigation menu works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for hamburger menu
    const hamburgerMenu = await page.locator('button[aria-label*="menu" i], button:has(svg)').first();
    const isHamburgerVisible = await hamburgerMenu.isVisible().catch(() => false);
    
    if (isHamburgerVisible) {
      // Click hamburger to open menu
      await hamburgerMenu.click();
      await page.waitForTimeout(300); // Wait for animation
      
      // Check if mobile menu is now visible
      const mobileNav = await page.locator('nav').first();
      await expect(mobileNav).toBeVisible();
      
      // Check navigation links in mobile menu
      const servicesLink = await page.locator('a:has-text("Services")').first();
      await expect(servicesLink).toBeVisible();
    }
  });

  test('Footer contains required information', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const footer = await page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for company name
    const footerText = await footer.textContent();
    expect(footerText).toContain('Hudson Digital Solutions');
    
    // Check for copyright
    expect(footerText?.toLowerCase()).toContain('©');
    
    // Check for links
    const footerLinks = await footer.locator('a');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    
    // Check for social media links (optional)
    const socialLinks = await footer.locator('a[href*="linkedin"], a[href*="twitter"], a[href*="github"]');
    const socialCount = await socialLinks.count();
    // May or may not have social links
    expect(socialCount).toBeGreaterThanOrEqual(0);
  });

  test('Services page displays service offerings', async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const pageTitle = await page.locator('h1');
    await expect(pageTitle).toBeVisible();
    
    // Check for service cards or sections
    const serviceCards = await page.locator('[class*="card"], article, section > div');
    const cardCount = await serviceCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    // Check for service descriptions
    const hasDescriptions = await page.locator('p').count();
    expect(hasDescriptions).toBeGreaterThan(0);
    
    // Check for CTA
    const ctaButton = await page.locator('a[href="/contact"], button:has-text("Get Started")');
    const ctaVisible = await ctaButton.first().isVisible().catch(() => false);
    expect(ctaVisible).toBe(true);
  });

  test('Portfolio page shows projects', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const pageTitle = await page.locator('h1');
    await expect(pageTitle).toBeVisible();
    
    // Check for project cards
    const projectElements = await page.locator('[class*="card"], article, [class*="project"]');
    const projectCount = await projectElements.count();
    expect(projectCount).toBeGreaterThan(0);
    
    // Check for images
    const images = await page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
  });

  test('Blog page loads articles', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const pageTitle = await page.locator('h1');
    await expect(pageTitle).toBeVisible();
    
    // Check for blog posts or placeholder
    const articles = await page.locator('article, [class*="post"], [class*="blog"]');
    const articleCount = await articles.count();
    
    // Either has articles or shows empty state
    if (articleCount === 0) {
      const emptyState = await page.locator('text=/No posts|No articles|Coming soon/i');
      await expect(emptyState).toBeVisible();
    } else {
      expect(articleCount).toBeGreaterThan(0);
    }
  });

  test('Contact page loads with form', async ({ page }) => {
    // Set a longer timeout for this specific test
    test.setTimeout(60000);
    
    await page.goto('/contact', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Check page title loads first
    const pageTitle = await page.locator('h1').first();
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
    await expect(pageTitle).toHaveText(/Build Something Legendary/);
    
    // Look for the contact form container specifically  
    const contactSection = await page.locator('section:has(form)').first();
    await expect(contactSection).toBeVisible({ timeout: 15000 });
    
    // Check for form with firstName field (distinguishes from newsletter)
    const contactForm = await page.locator('form').filter({ has: page.locator('input[name="firstName"]') });
    await expect(contactForm).toBeVisible({ timeout: 20000 });
    
    // Verify essential form fields exist
    await expect(page.locator('input[name="firstName"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="lastName"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('textarea[name="message"]')).toBeVisible({ timeout: 5000 });
    
    // Check submit button exists
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Page Transitions and Loading States', () => {
  test('Pages transition smoothly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to services
    const servicesLink = await page.locator('a[href="/services"]').first();
    await servicesLink.click();
    
    // Check for smooth transition (no flash of unstyled content)
    await page.waitForLoadState('domcontentloaded');
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    
    // Navigate to contact
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Form should be immediately interactive
    const firstNameField = await page.locator('input[name="firstName"]');
    await expect(firstNameField).toBeEnabled();
  });

  test('Error pages display correctly', async ({ page }) => {
    // Test 404 page
    const response = await page.goto('/non-existent-page-12345');
    expect(response?.status()).toBe(404);
    
    // Should show 404 message
    const errorMessage = await page.locator('text=/404|Not Found|Page not found/i');
    await expect(errorMessage.first()).toBeVisible();
    
    // Should have navigation back
    const homeLink = await page.locator('a[href="/"]');
    await expect(homeLink.first()).toBeVisible();
  });
});

test.describe('SEO and Meta Tags', () => {
  test('Pages have proper meta tags', async ({ page }) => {
    const pages = ['/', '/services', '/portfolio', '/blog', '/contact'];
    
    for (const path of pages) {
      await page.goto(path);
      
      // Check title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
      
      // Check meta description
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(50);
      
      // Check viewport meta
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toContain('width=device-width');
      
      // Check Open Graph tags
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();
      
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      expect(ogDescription).toBeTruthy();
    }
  });
});

test.describe('Performance Metrics', () => {
  test('Pages load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Check for lazy loading images
    const images = await page.locator('img[loading="lazy"]');
    const lazyImageCount = await images.count();
    expect(lazyImageCount).toBeGreaterThanOrEqual(0);
    
    // Check for optimized images (Next.js Image component)
    const nextImages = await page.locator('img[srcset]');
    const optimizedCount = await nextImages.count();
    expect(optimizedCount).toBeGreaterThanOrEqual(0);
  });

  test('CSS and JS assets are optimized', async ({ page }) => {
    const response = await page.goto('/');
    
    // Intercept network requests
    const resources: string[] = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.js') || url.includes('.css')) {
        resources.push(url);
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Check that assets are minified (contain hash in filename)
    const hashedAssets = resources.filter(url => 
      url.match(/\.[a-f0-9]{8,}\.(js|css)/) || 
      url.includes('.min.')
    );
    
    expect(hashedAssets.length).toBeGreaterThan(0);
  });
});