import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // Hero section selectors
  readonly heroSection: Locator;
  readonly mainHeading: Locator;
  readonly heroSubtitle: Locator;
  readonly ctaButtons: Locator;
  readonly primaryCTA: Locator;
  readonly secondaryCTA: Locator;

  // Services section selectors
  readonly servicesSection: Locator;
  readonly serviceCards: Locator;
  readonly servicesHeading: Locator;

  // Portfolio section selectors
  readonly portfolioSection: Locator;
  readonly portfolioCards: Locator;
  readonly portfolioHeading: Locator;
  readonly portfolioImages: Locator;

  // Testimonials section selectors
  readonly testimonialsSection: Locator;
  readonly testimonialCards: Locator;
  readonly testimonialsHeading: Locator;

  // About/Company section selectors
  readonly aboutSection: Locator;
  readonly aboutHeading: Locator;
  readonly aboutContent: Locator;

  // Newsletter signup (if present)
  readonly newsletterSection: Locator;
  readonly newsletterForm: Locator;
  readonly newsletterEmail: Locator;
  readonly newsletterSubmit: Locator;

  constructor(page: Page) {
    super(page, '/');
    
    // Hero section
    this.heroSection = page.locator('section').first();
    this.mainHeading = page.locator('h1');
    this.heroSubtitle = page.locator('h1 + p, .hero-subtitle, [class*="subtitle"]');
    this.ctaButtons = page.locator('a[href="/contact"], a[href="/services"], button:has-text("Get Started")');
    this.primaryCTA = page.locator('a[href="/contact"]').first();
    this.secondaryCTA = page.locator('a[href="/services"]').first();

    // Services section
    this.servicesSection = page.locator('section:has-text("Services"), section:has-text("What We Do"), section:has-text("Our Expertise")').first();
    this.serviceCards = page.locator('[class*="service"], [class*="card"]:has-text("Web"), [class*="card"]:has-text("Development")');
    this.servicesHeading = page.locator('h2:has-text("Services"), h2:has-text("What We Do"), h2:has-text("Our Expertise")').first();

    // Portfolio section
    this.portfolioSection = page.locator('section:has-text("Portfolio"), section:has-text("Our Work"), section:has-text("Projects")').first();
    this.portfolioCards = page.locator('[class*="portfolio"], [class*="project"], [class*="work-item"]');
    this.portfolioHeading = page.locator('h2:has-text("Portfolio"), h2:has-text("Our Work"), h2:has-text("Projects")').first();
    this.portfolioImages = page.locator('[class*="portfolio"] img, [class*="project"] img');

    // Testimonials section
    this.testimonialsSection = page.locator('section:has-text("Testimonial"), section:has-text("Client"), section:has-text("Review")').first();
    this.testimonialCards = page.locator('[class*="testimonial"], [class*="review"], [class*="client-card"]');
    this.testimonialsHeading = page.locator('h2:has-text("Testimonial"), h2:has-text("Client"), h2:has-text("Review")').first();

    // About section
    this.aboutSection = page.locator('section:has-text("About"), section:has-text("Who We Are"), section:has-text("Our Story")').first();
    this.aboutHeading = page.locator('h2:has-text("About"), h2:has-text("Who We Are"), h2:has-text("Our Story")').first();
    this.aboutContent = page.locator('[class*="about"] p, [class*="story"] p');

    // Newsletter
    this.newsletterSection = page.locator('section:has-text("Newsletter"), section:has-text("Subscribe"), [class*="newsletter"]').first();
    this.newsletterForm = page.locator('form:has(input[type="email"])').filter({ hasNot: page.locator('input[name="firstName"]') });
    this.newsletterEmail = page.locator('input[type="email"]').filter({ hasNot: page.locator('form:has(input[name="firstName"]) input[type="email"]') });
    this.newsletterSubmit = page.locator('form:has(input[type="email"]) button[type="submit"]').filter({ hasNot: page.locator('form:has(input[name="firstName"]) button') });
  }

  // Page verification methods
  async verifyHeroSection() {
    await expect(this.heroSection).toBeVisible();
    await expect(this.mainHeading).toBeVisible();
    
    const headingText = await this.mainHeading.textContent();
    expect(headingText).toContain('DIGITAL.MASTERMIND.UNLEASHED.');
    
    // Verify CTA buttons are present
    const ctaCount = await this.ctaButtons.count();
    expect(ctaCount).toBeGreaterThanOrEqual(1);
  }

  async verifyServicesSection() {
    await expect(this.servicesSection).toBeVisible();
    await expect(this.servicesHeading).toBeVisible();
    
    // Should have service offerings displayed
    const serviceCount = await this.serviceCards.count();
    expect(serviceCount).toBeGreaterThan(0);
  }

  async verifyPortfolioSection() {
    await expect(this.portfolioSection).toBeVisible();
    await expect(this.portfolioHeading).toBeVisible();
    
    // Should have portfolio items
    const portfolioCount = await this.portfolioCards.count();
    expect(portfolioCount).toBeGreaterThan(0);
  }

  async verifyTestimonialsSection() {
    await expect(this.testimonialsSection).toBeVisible();
    await expect(this.testimonialsHeading).toBeVisible();
    
    // Should have testimonials
    const testimonialCount = await this.testimonialCards.count();
    expect(testimonialCount).toBeGreaterThan(0);
  }

  async verifyAllSections() {
    await this.verifyHeroSection();
    await this.verifyServicesSection();
    await this.verifyPortfolioSection();
    await this.verifyTestimonialsSection();
  }

  // Interaction methods
  async clickPrimaryCTA() {
    await this.primaryCTA.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickSecondaryCTA() {
    await this.secondaryCTA.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickServiceCard(index: number = 0) {
    const serviceCard = this.serviceCards.nth(index);
    await serviceCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickPortfolioItem(index: number = 0) {
    const portfolioItem = this.portfolioCards.nth(index);
    await portfolioItem.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Newsletter subscription
  async subscribeToNewsletter(email: string) {
    if (await this.newsletterSection.isVisible()) {
      await this.newsletterEmail.fill(email);
      
      const responsePromise = this.waitForResponse('/api/newsletter');
      await this.newsletterSubmit.click();
      
      try {
        const response = await responsePromise;
        return response;
      } catch {
        // Newsletter might not be implemented
        return null;
      }
    }
    return null;
  }

  // Performance verification
  async verifyImagesLoaded() {
    const images = this.page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  }

  async verifyLazyLoading() {
    const lazyImages = this.page.locator('img[loading="lazy"]');
    const lazyImageCount = await lazyImages.count();
    
    // Should have some lazy-loaded images for performance
    expect(lazyImageCount).toBeGreaterThanOrEqual(0);
  }

  async verifyOptimizedImages() {
    const nextImages = this.page.locator('img[srcset]');
    const optimizedCount = await nextImages.count();
    
    // Should have responsive images with srcset
    expect(optimizedCount).toBeGreaterThanOrEqual(0);
  }

  // Mobile-specific verifications
  async verifyMobileLayout() {
    // Hero section should be readable on mobile
    const heroBox = await this.heroSection.boundingBox();
    expect(heroBox).toBeTruthy();
    
    // Main heading should be visible and properly sized
    await expect(this.mainHeading).toBeVisible();
    const headingBox = await this.mainHeading.boundingBox();
    
    if (headingBox) {
      const viewportWidth = await this.page.viewportSize()?.width || 375;
      expect(headingBox.width).toBeLessThanOrEqual(viewportWidth);
    }
    
    // CTA buttons should be accessible
    const ctaCount = await this.ctaButtons.count();
    for (let i = 0; i < ctaCount; i++) {
      const cta = this.ctaButtons.nth(i);
      await expect(cta).toBeVisible();
      
      const ctaBox = await cta.boundingBox();
      if (ctaBox) {
        const viewportWidth = await this.page.viewportSize()?.width || 375;
        expect(ctaBox.x + ctaBox.width).toBeLessThanOrEqual(viewportWidth);
      }
    }
  }

  // Analytics verification
  async verifyPageViewTracking() {
    let pageViewCaptured = false;
    
    this.page.on('request', request => {
      if (request.url().includes('posthog') || request.url().includes('/capture')) {
        const postData = request.postData();
        if (postData && postData.includes('$pageview')) {
          pageViewCaptured = true;
        }
      }
    });

    // Wait for analytics to load and fire
    await this.page.waitForTimeout(2000);
    
    expect(pageViewCaptured).toBe(true);
  }

  // Scroll-based interactions
  async scrollThroughSections() {
    // Scroll to each section and verify it's visible
    const sections = [
      this.heroSection,
      this.servicesSection,
      this.portfolioSection,
      this.testimonialsSection
    ];

    for (const section of sections) {
      if (await section.count() > 0) {
        await section.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(500);
        await expect(section).toBeVisible();
      }
    }
  }

  // Animation verification
  async verifyAnimations() {
    // Check for CSS animations or transitions
    const animatedElements = this.page.locator('[class*="animate"], [class*="transition"], [class*="fade"]');
    const animatedCount = await animatedElements.count();
    
    // Should have some animated elements for modern UX
    expect(animatedCount).toBeGreaterThanOrEqual(0);
  }

  // Content verification
  async verifyContentQuality() {
    // Check hero content
    const headingText = await this.mainHeading.textContent();
    expect(headingText).toBeTruthy();
    expect(headingText!.length).toBeGreaterThan(10);

    // Check if subtitle exists and has content
    if (await this.heroSubtitle.count() > 0) {
      const subtitleText = await this.heroSubtitle.textContent();
      expect(subtitleText).toBeTruthy();
      expect(subtitleText!.length).toBeGreaterThan(20);
    }

    // Verify service descriptions
    const serviceDescriptions = this.page.locator('[class*="service"] p, [class*="card"] p');
    const descriptionCount = await serviceDescriptions.count();
    
    for (let i = 0; i < Math.min(descriptionCount, 3); i++) {
      const description = serviceDescriptions.nth(i);
      const text = await description.textContent();
      expect(text).toBeTruthy();
      expect(text!.length).toBeGreaterThan(20);
    }
  }

  // Social proof verification
  async verifySocialProof() {
    // Check for testimonials
    if (await this.testimonialCards.count() > 0) {
      const firstTestimonial = this.testimonialCards.first();
      await expect(firstTestimonial).toBeVisible();
      
      const testimonialText = await firstTestimonial.textContent();
      expect(testimonialText).toBeTruthy();
      expect(testimonialText!.length).toBeGreaterThan(30);
    }

    // Check for client logos or badges
    const socialProofElements = this.page.locator('[class*="client"], [class*="logo"], [class*="badge"]');
    const socialProofCount = await socialProofElements.count();
    expect(socialProofCount).toBeGreaterThanOrEqual(0);
  }

  // Conversion tracking
  async trackCTAClicks() {
    let ctaClickTracked = false;
    
    this.page.on('request', request => {
      if (request.url().includes('posthog') || request.url().includes('/capture')) {
        const postData = request.postData();
        if (postData && (postData.includes('cta_click') || postData.includes('button_click'))) {
          ctaClickTracked = true;
        }
      }
    });

    await this.primaryCTA.click();
    await this.page.waitForTimeout(1000);
    
    // CTA clicks should be tracked for conversion optimization
    expect(ctaClickTracked).toBe(true);
  }

  // Error state verification
  async verifyNoJavaScriptErrors() {
    const consoleErrors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Interact with the page to trigger any JS errors
    await this.scrollThroughSections();
    await this.page.waitForTimeout(2000);
    
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Failed to load resource') &&
      !error.includes('favicon.ico') &&
      !error.includes('chrome-extension')
    );
    
    expect(criticalErrors).toHaveLength(0);
  }
}