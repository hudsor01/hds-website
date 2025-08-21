import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object providing common functionality for all pages
 */
export abstract class BasePage {
  protected page: Page;
  protected url: string;

  constructor(page: Page, url: string) {
    this.page = page;
    this.url = url;
  }

  // Common selectors
  get navigation(): Locator {
    return this.page.locator('nav');
  }

  get header(): Locator {
    return this.page.locator('header');
  }

  get footer(): Locator {
    return this.page.locator('footer');
  }

  get mainContent(): Locator {
    return this.page.locator('main');
  }

  get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading"], .loading, .spinner');
  }

  // Navigation methods
  async goto(options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }) {
    await this.page.goto(this.url, {
      waitUntil: options?.waitUntil || 'networkidle',
      timeout: 30000
    });
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    // Wait for basic page structure
    await this.page.waitForLoadState('domcontentloaded');
    
    // Wait for loading spinners to disappear
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // No loading spinner found, continue
    }
    
    // Wait for main content to be visible
    await this.mainContent.waitFor({ state: 'visible', timeout: 10000 });
  }

  // Common navigation actions
  async navigateToHome() {
    await this.page.locator('a[href="/"], .logo').first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToServices() {
    await this.page.locator('a[href="/services"]').first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToPortfolio() {
    await this.page.locator('a[href="/portfolio"]').first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToBlog() {
    await this.page.locator('a[href="/blog"]').first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToContact() {
    await this.page.locator('a[href="/contact"]').first().click();
    await this.page.waitForLoadState('networkidle');
  }

  // Mobile navigation
  async openMobileMenu() {
    const hamburger = this.page.locator('button[aria-label*="menu" i], button:has(svg)').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  async closeMobileMenu() {
    const closeButton = this.page.locator('button[aria-label*="close" i], .close-menu').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  // Common assertions
  async verifyPageTitle(expectedTitle: string | RegExp) {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  async verifyPageURL(expectedURL: string | RegExp) {
    await expect(this.page).toHaveURL(expectedURL);
  }

  async verifyMetaDescription(expectedDescription: string | RegExp) {
    const metaDescription = await this.page.locator('meta[name="description"]').getAttribute('content');
    if (typeof expectedDescription === 'string') {
      expect(metaDescription).toContain(expectedDescription);
    } else {
      expect(metaDescription).toMatch(expectedDescription);
    }
  }

  // Accessibility helpers
  async checkPageAccessibility() {
    // Verify page has proper heading structure
    const h1Count = await this.page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1

    // Verify images have alt text
    const images = this.page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const role = await img.getAttribute('role');
      
      // Images should have alt text, aria-label, or be decorative
      expect(alt !== null || ariaLabel !== null || role === 'presentation').toBe(true);
    }

    // Verify links have accessible names
    const links = this.page.locator('a');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      // Links should have text content, aria-label, or title
      expect(text?.trim() || ariaLabel || title).toBeTruthy();
    }
  }

  // Performance helpers
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.waitForPageLoad();
    return Date.now() - startTime;
  }

  // Error handling
  async verifyNoConsoleErrors() {
    const errors: string[] = [];
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any console errors to appear
    await this.page.waitForTimeout(1000);
    
    expect(errors).toHaveLength(0);
  }

  // SEO helpers
  async verifyBasicSEO() {
    // Check title exists and is not empty
    const title = await this.page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);

    // Check meta description
    const description = await this.page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);

    // Check viewport meta tag
    const viewport = await this.page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');

    // Check Open Graph tags
    const ogTitle = await this.page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
  }

  // Utility methods
  async scrollToBottom() {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await this.page.waitForTimeout(500);
  }

  async scrollToTop() {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await this.page.waitForTimeout(500);
  }

  async waitForElement(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async takeFullPageScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true
    });
  }

  // Analytics helpers
  async verifyAnalyticsLoaded() {
    // Check PostHog
    const posthogScript = this.page.locator('script[src*="posthog"]');
    if (await posthogScript.count() > 0) {
      // PostHog should be initialized
      const posthogInitialized = await this.page.evaluate(() => {
        return typeof window.posthog !== 'undefined';
      });
      expect(posthogInitialized).toBe(true);
    }

    // Check Vercel Analytics
    const vercelAnalytics = await this.page.evaluate(() => {
      return typeof window.va !== 'undefined';
    });
    if (vercelAnalytics) {
      expect(vercelAnalytics).toBe(true);
    }
  }

  // Cookie and privacy helpers
  async acceptCookies() {
    const cookieBanner = this.page.locator('[data-testid="cookie-banner"], .cookie-banner');
    if (await cookieBanner.isVisible()) {
      const acceptButton = cookieBanner.locator('button:has-text("Accept"), button:has-text("OK")');
      await acceptButton.click();
      await cookieBanner.waitFor({ state: 'hidden' });
    }
  }

  // Form helpers
  async fillField(selector: string, value: string) {
    await this.page.fill(selector, value);
    // Verify the field was filled
    const actualValue = await this.page.inputValue(selector);
    expect(actualValue).toBe(value);
  }

  async selectOption(selector: string, option: string | { label: string } | { value: string }) {
    await this.page.selectOption(selector, option);
  }

  // Wait helpers
  async waitForResponse(urlPattern: string | RegExp, timeout: number = 30000) {
    return await this.page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }

  async waitForRequest(urlPattern: string | RegExp, timeout: number = 30000) {
    return await this.page.waitForRequest(
      request => {
        const url = request.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }
}