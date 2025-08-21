import { test, expect } from './fixtures/test-fixtures';

test.describe('Visual Regression Tests @visual', () => {
  test.use({
    // Consistent viewport for visual tests
    viewport: { width: 1280, height: 720 },
    // Reduce motion for consistent screenshots
    reducedMotion: 'reduce'
  });

  test.beforeEach(async ({ page }) => {
    // Wait for fonts and animations to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('homepage visual comparison', async ({ page }) => {
    await page.goto('/');
    
    // Wait for hero section and key elements
    await page.waitForSelector('h1');
    await page.waitForSelector('section');
    
    // Hide dynamic elements that change between runs
    await page.addStyleTag({
      content: `
        [data-timestamp], .timestamp, .date {
          visibility: hidden !important;
        }
        .animate, .animation {
          animation: none !important;
          transition: none !important;
        }
      `
    });

    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      threshold: 0.2, // Allow 20% difference for dynamic content
      animations: 'disabled'
    });

    // Take above-the-fold screenshot
    await expect(page).toHaveScreenshot('homepage-hero.png', {
      threshold: 0.1,
      animations: 'disabled'
    });
  });

  test('contact page visual comparison', async ({ page }) => {
    await page.goto('/contact');
    
    // Wait for form to load
    await page.waitForSelector('form');
    await page.waitForSelector('input[name="firstName"]');
    
    // Ensure form is in clean state
    await page.evaluate(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.reset();
    });

    await expect(page).toHaveScreenshot('contact-page-full.png', {
      fullPage: true,
      threshold: 0.2,
      animations: 'disabled'
    });

    // Focus state screenshot
    await page.focus('input[name="firstName"]');
    await expect(page.locator('form')).toHaveScreenshot('contact-form-focus.png', {
      threshold: 0.1
    });
  });

  test('services page visual comparison', async ({ page }) => {
    await page.goto('/services');
    
    await page.waitForSelector('h1');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('services-page-full.png', {
      fullPage: true,
      threshold: 0.2,
      animations: 'disabled'
    });

    // Service cards section
    const serviceSection = page.locator('section').filter({ hasText: /service/i }).first();
    if (await serviceSection.count() > 0) {
      await expect(serviceSection).toHaveScreenshot('services-cards.png', {
        threshold: 0.1
      });
    }
  });

  test('portfolio page visual comparison', async ({ page }) => {
    await page.goto('/portfolio');
    
    await page.waitForSelector('h1');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('portfolio-page-full.png', {
      fullPage: true,
      threshold: 0.2,
      animations: 'disabled'
    });

    // Portfolio grid
    const portfolioGrid = page.locator('[class*="portfolio"], [class*="project"]').first();
    if (await portfolioGrid.count() > 0) {
      await expect(portfolioGrid).toHaveScreenshot('portfolio-grid.png', {
        threshold: 0.1
      });
    }
  });

  test('navigation visual comparison', async ({ page }) => {
    await page.goto('/');
    
    // Desktop navigation
    const nav = page.locator('nav').first();
    await expect(nav).toHaveScreenshot('navigation-desktop.png', {
      threshold: 0.1
    });

    // Hover state on navigation link
    const navLink = page.locator('nav a').first();
    if (await navLink.count() > 0) {
      await navLink.hover();
      await expect(nav).toHaveScreenshot('navigation-hover.png', {
        threshold: 0.1
      });
    }
  });

  test('footer visual comparison', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(500);

    const footer = page.locator('footer');
    await expect(footer).toHaveScreenshot('footer.png', {
      threshold: 0.1
    });
  });

  test('form states visual comparison', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForSelector('form');

    const form = page.locator('form').first();

    // Clean state
    await expect(form).toHaveScreenshot('form-clean.png');

    // Filled state
    await page.fill('input[name="firstName"]', 'Visual');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', 'visual@test.com');
    await page.fill('textarea[name="message"]', 'Testing visual regression for form states');

    await expect(form).toHaveScreenshot('form-filled.png');

    // Error state simulation
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      if (emailInput) {
        emailInput.setCustomValidity('Invalid email format');
        emailInput.reportValidity();
      }
    });

    await expect(form).toHaveScreenshot('form-error.png');
  });

  test('responsive breakpoints visual comparison', async ({ page }) => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'wide', width: 1920, height: 1080 }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      await page.goto('/');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`homepage-${breakpoint.name}.png`, {
        threshold: 0.2,
        animations: 'disabled'
      });

      // Test contact page at different breakpoints
      await page.goto('/contact');
      await page.waitForSelector('form');

      await expect(page).toHaveScreenshot(`contact-${breakpoint.name}.png`, {
        threshold: 0.2,
        animations: 'disabled'
      });
    }
  });

  test('dark mode visual comparison', async ({ page }) => {
    // Check if dark mode is supported
    const hasDarkMode = await page.evaluate(() => {
      return document.querySelector('[data-theme], .dark-mode, .theme-toggle') !== null;
    });

    if (!hasDarkMode) {
      test.skip('Dark mode not implemented');
    }

    await page.goto('/');

    // Test light mode
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('homepage-light-mode.png', {
      threshold: 0.1,
      animations: 'disabled'
    });

    // Test dark mode
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
      threshold: 0.1,
      animations: 'disabled'
    });
  });

  test('loading states visual comparison', async ({ page }) => {
    // Simulate slow network to capture loading states
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      route.continue();
    });

    await page.goto('/contact');

    // Try to capture loading state
    const loadingElement = page.locator('[data-testid="loading"], .loading, .spinner');
    if (await loadingElement.count() > 0) {
      await expect(loadingElement).toHaveScreenshot('loading-state.png');
    }

    await page.waitForLoadState('networkidle');
    await page.unroute('**/*');
  });

  test('interactive elements visual comparison', async ({ page }) => {
    await page.goto('/');

    // Button states
    const buttons = page.locator('button, a[role="button"]');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const firstButton = buttons.first();

      // Normal state
      await expect(firstButton).toHaveScreenshot('button-normal.png');

      // Hover state
      await firstButton.hover();
      await expect(firstButton).toHaveScreenshot('button-hover.png');

      // Focus state
      await firstButton.focus();
      await expect(firstButton).toHaveScreenshot('button-focus.png');

      // Active state
      await page.mouse.down();
      await expect(firstButton).toHaveScreenshot('button-active.png');
      await page.mouse.up();
    }
  });

  test('error page visual comparison', async ({ page }) => {
    // Test 404 page
    const response = await page.goto('/non-existent-page-visual-test');
    
    if (response && response.status() === 404) {
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('404-page.png', {
        threshold: 0.1,
        animations: 'disabled'
      });
    }
  });

  test('print styles visual comparison', async ({ page }) => {
    await page.goto('/');

    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('homepage-print.png', {
      threshold: 0.2,
      animations: 'disabled'
    });

    // Test contact page print styles
    await page.goto('/contact');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('contact-print.png', {
      threshold: 0.2,
      animations: 'disabled'
    });
  });
});

test.describe('Visual Regression - Components @visual', () => {
  test('card components visual comparison', async ({ page }) => {
    await page.goto('/services');
    
    const cards = page.locator('[class*="card"], article');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      // Test first card
      const firstCard = cards.first();
      await expect(firstCard).toHaveScreenshot('service-card.png', {
        threshold: 0.1
      });

      // Test card hover state
      await firstCard.hover();
      await expect(firstCard).toHaveScreenshot('service-card-hover.png', {
        threshold: 0.1
      });
    }
  });

  test('testimonial components visual comparison', async ({ page }) => {
    await page.goto('/');
    
    const testimonials = page.locator('[class*="testimonial"], [class*="review"]');
    const testimonialCount = await testimonials.count();

    if (testimonialCount > 0) {
      const firstTestimonial = testimonials.first();
      await expect(firstTestimonial).toHaveScreenshot('testimonial.png', {
        threshold: 0.1
      });
    }
  });

  test('image gallery visual comparison', async ({ page }) => {
    await page.goto('/portfolio');
    
    const gallery = page.locator('[class*="gallery"], [class*="grid"]');
    if (await gallery.count() > 0) {
      await expect(gallery.first()).toHaveScreenshot('image-gallery.png', {
        threshold: 0.1
      });
    }
  });
});