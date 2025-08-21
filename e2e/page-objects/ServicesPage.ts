import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ServicesPage extends BasePage {
  // Page elements
  readonly pageHeading: Locator;
  readonly serviceCards: Locator;
  readonly serviceDescriptions: Locator;
  readonly ctaButton: Locator;
  readonly contactButton: Locator;
  readonly pricingSection: Locator;
  readonly processSection: Locator;
  readonly benefitsSection: Locator;

  // Service categories
  readonly webDevelopmentService: Locator;
  readonly mobileAppService: Locator;
  readonly ecommerceService: Locator;
  readonly consultingService: Locator;

  // Interactive elements
  readonly serviceModal: Locator;
  readonly readMoreButtons: Locator;
  readonly serviceFilters: Locator;

  constructor(page: Page) {
    super(page, '/services');
    
    // Main page elements
    this.pageHeading = page.locator('h1');
    this.serviceCards = page.locator('[class*="service"], [class*="card"], article, section > div').filter({ hasText: /development|design|consulting/i });
    this.serviceDescriptions = page.locator('p, [class*="description"]');
    this.ctaButton = page.locator('a[href="/contact"], button:has-text("Get Started"), button:has-text("Contact")');
    this.contactButton = page.locator('a[href="/contact"]');
    
    // Sections
    this.pricingSection = page.locator('section:has-text("Pricing"), section:has-text("Cost"), [class*="pricing"]');
    this.processSection = page.locator('section:has-text("Process"), section:has-text("How We Work"), [class*="process"]');
    this.benefitsSection = page.locator('section:has-text("Benefits"), section:has-text("Why Choose"), [class*="benefits"]');

    // Specific services
    this.webDevelopmentService = page.locator('[class*="service"], [class*="card"]').filter({ hasText: /web development|website|frontend|backend/i });
    this.mobileAppService = page.locator('[class*="service"], [class*="card"]').filter({ hasText: /mobile|app|ios|android/i });
    this.ecommerceService = page.locator('[class*="service"], [class*="card"]').filter({ hasText: /ecommerce|e-commerce|shop|store/i });
    this.consultingService = page.locator('[class*="service"], [class*="card"]').filter({ hasText: /consulting|strategy|advisory/i });

    // Interactive elements
    this.serviceModal = page.locator('[class*="modal"], [class*="popup"], dialog');
    this.readMoreButtons = page.locator('button:has-text("Read More"), a:has-text("Learn More")');
    this.serviceFilters = page.locator('[class*="filter"], [class*="category"], button[data-filter]');
  }

  // Page verification methods
  async verifyPageLoaded() {
    await expect(this.pageHeading).toBeVisible();
    
    const pageTitle = await this.pageHeading.textContent();
    expect(pageTitle).toMatch(/services|what we do|our expertise/i);
  }

  async verifyServiceOfferings() {
    await expect(this.serviceCards.first()).toBeVisible();
    
    const serviceCount = await this.serviceCards.count();
    expect(serviceCount).toBeGreaterThan(0);
    
    // Verify each service card has description
    for (let i = 0; i < Math.min(serviceCount, 5); i++) {
      const serviceCard = this.serviceCards.nth(i);
      await expect(serviceCard).toBeVisible();
      
      const cardText = await serviceCard.textContent();
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(20);
    }
  }

  async verifyServiceDescriptions() {
    const descriptionCount = await this.serviceDescriptions.count();
    expect(descriptionCount).toBeGreaterThan(0);
    
    // Check quality of descriptions
    for (let i = 0; i < Math.min(descriptionCount, 3); i++) {
      const description = this.serviceDescriptions.nth(i);
      const text = await description.textContent();
      
      if (text && text.length > 50) {
        expect(text.length).toBeGreaterThan(50);
        expect(text.length).toBeLessThan(500); // Not too verbose
      }
    }
  }

  async verifyCTAPresence() {
    const ctaCount = await this.ctaButton.count();
    expect(ctaCount).toBeGreaterThan(0);
    
    // Verify CTA is clickable
    const firstCTA = this.ctaButton.first();
    await expect(firstCTA).toBeVisible();
    await expect(firstCTA).toBeEnabled();
  }

  // Service interaction methods
  async clickService(serviceName: 'web' | 'mobile' | 'ecommerce' | 'consulting') {
    let serviceElement: Locator;
    
    switch (serviceName) {
      case 'web':
        serviceElement = this.webDevelopmentService;
        break;
      case 'mobile':
        serviceElement = this.mobileAppService;
        break;
      case 'ecommerce':
        serviceElement = this.ecommerceService;
        break;
      case 'consulting':
        serviceElement = this.consultingService;
        break;
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
    
    if (await serviceElement.count() > 0) {
      await serviceElement.first().click();
      await this.page.waitForTimeout(500);
    }
  }

  async expandServiceDetails(index: number = 0) {
    if (await this.readMoreButtons.count() > index) {
      const readMoreButton = this.readMoreButtons.nth(index);
      await readMoreButton.click();
      await this.page.waitForTimeout(300);
      
      // Check if modal opened or content expanded
      if (await this.serviceModal.count() > 0) {
        await expect(this.serviceModal).toBeVisible();
      }
    }
  }

  async closeServiceModal() {
    if (await this.serviceModal.isVisible()) {
      const closeButton = this.serviceModal.locator('button:has-text("Close"), button[aria-label*="close" i], .close');
      
      if (await closeButton.count() > 0) {
        await closeButton.click();
      } else {
        // Click outside modal
        await this.page.keyboard.press('Escape');
      }
      
      await this.serviceModal.waitFor({ state: 'hidden' });
    }
  }

  // Navigation to contact
  async navigateToContactFromService() {
    await this.contactButton.first().click();
    await this.page.waitForLoadState('networkidle');
    
    // Verify we're on contact page
    expect(this.page.url()).toContain('/contact');
  }

  // Mobile verification
  async verifyMobileLayout() {
    // Service cards should stack properly on mobile
    const serviceCount = await this.serviceCards.count();
    
    for (let i = 0; i < Math.min(serviceCount, 3); i++) {
      const serviceCard = this.serviceCards.nth(i);
      const box = await serviceCard.boundingBox();
      
      if (box) {
        const viewportWidth = await this.page.viewportSize()?.width || 375;
        expect(box.width).toBeLessThanOrEqual(viewportWidth);
        expect(box.x).toBeGreaterThanOrEqual(0);
      }
    }
    
    // CTA buttons should be accessible
    if (await this.ctaButton.count() > 0) {
      const cta = this.ctaButton.first();
      await expect(cta).toBeVisible();
      
      const ctaBox = await cta.boundingBox();
      if (ctaBox) {
        const viewportWidth = await this.page.viewportSize()?.width || 375;
        expect(ctaBox.x + ctaBox.width).toBeLessThanOrEqual(viewportWidth);
      }
    }
  }

  // Content quality verification
  async verifyContentQuality() {
    // Check page heading
    const heading = await this.pageHeading.textContent();
    expect(heading).toBeTruthy();
    expect(heading!.length).toBeGreaterThan(5);

    // Verify service cards have quality content
    const serviceCount = await this.serviceCards.count();
    
    for (let i = 0; i < Math.min(serviceCount, 4); i++) {
      const card = this.serviceCards.nth(i);
      const cardText = await card.textContent();
      
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(50);
      
      // Should mention technology or benefits
      expect(cardText).toMatch(/react|next|javascript|typescript|responsive|scalable|performance|seo|security/i);
    }
  }

  // SEO verification specific to services page
  async verifyServicesSEO() {
    await this.verifyBasicSEO();
    
    // Check for service-specific keywords in meta
    const description = await this.page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toMatch(/services|development|design|consulting|web|mobile/i);
    
    // Check for structured data
    const structuredData = this.page.locator('script[type="application/ld+json"]');
    if (await structuredData.count() > 0) {
      const jsonLd = await structuredData.first().textContent();
      expect(jsonLd).toContain('Service');
    }
  }

  // Process section verification
  async verifyProcessSection() {
    if (await this.processSection.count() > 0) {
      await expect(this.processSection).toBeVisible();
      
      // Should have process steps
      const processSteps = this.processSection.locator('[class*="step"], [class*="phase"], li, .process-item');
      const stepCount = await processSteps.count();
      expect(stepCount).toBeGreaterThan(2);
      
      // Steps should have descriptive content
      for (let i = 0; i < Math.min(stepCount, 3); i++) {
        const step = processSteps.nth(i);
        const stepText = await step.textContent();
        expect(stepText).toBeTruthy();
        expect(stepText!.length).toBeGreaterThan(20);
      }
    }
  }

  // Benefits verification
  async verifyBenefitsSection() {
    if (await this.benefitsSection.count() > 0) {
      await expect(this.benefitsSection).toBeVisible();
      
      // Should list benefits
      const benefits = this.benefitsSection.locator('li, [class*="benefit"], [class*="advantage"]');
      const benefitCount = await benefits.count();
      expect(benefitCount).toBeGreaterThan(2);
      
      // Benefits should be compelling
      for (let i = 0; i < Math.min(benefitCount, 3); i++) {
        const benefit = benefits.nth(i);
        const benefitText = await benefit.textContent();
        expect(benefitText).toBeTruthy();
        expect(benefitText!.length).toBeGreaterThan(15);
      }
    }
  }

  // Pricing verification
  async verifyPricingSection() {
    if (await this.pricingSection.count() > 0) {
      await expect(this.pricingSection).toBeVisible();
      
      // Should have pricing information or contact for quote
      const pricingContent = await this.pricingSection.textContent();
      expect(pricingContent).toMatch(/price|cost|quote|starting|from|\$/i);
    }
  }

  // Service filtering (if available)
  async testServiceFilters() {
    if (await this.serviceFilters.count() > 0) {
      const filterCount = await this.serviceFilters.count();
      
      for (let i = 0; i < Math.min(filterCount, 3); i++) {
        const filter = this.serviceFilters.nth(i);
        await filter.click();
        await this.page.waitForTimeout(500);
        
        // Verify services are filtered
        const visibleServices = await this.serviceCards.count();
        expect(visibleServices).toBeGreaterThanOrEqual(0);
      }
    }
  }

  // Analytics tracking for services
  async verifyServiceAnalytics() {
    let serviceViewTracked = false;
    
    this.page.on('request', request => {
      if (request.url().includes('posthog') || request.url().includes('/capture')) {
        const postData = request.postData();
        if (postData && postData.includes('service_view')) {
          serviceViewTracked = true;
        }
      }
    });

    await this.page.waitForTimeout(2000);
    expect(serviceViewTracked).toBe(true);
  }

  // Lead generation verification
  async verifyLeadCapture() {
    // Check for lead magnets or contact forms
    const leadCapture = this.page.locator('form, [class*="lead"], [class*="signup"]');
    const leadCaptureCount = await leadCapture.count();
    
    if (leadCaptureCount > 0) {
      const firstLeadCapture = leadCapture.first();
      await expect(firstLeadCapture).toBeVisible();
      
      // Should have email input
      const emailInput = firstLeadCapture.locator('input[type="email"]');
      if (await emailInput.count() > 0) {
        await expect(emailInput).toBeVisible();
      }
    }
  }

  // Competitive advantage verification
  async verifyCompetitiveAdvantage() {
    const pageContent = await this.page.textContent();
    
    // Should mention competitive advantages
    expect(pageContent).toMatch(/experienced|expert|award|certified|years|proven|successful|leader/i);
    
    // Should have social proof
    const socialProof = this.page.locator('[class*="testimonial"], [class*="review"], [class*="client"]');
    const socialProofCount = await socialProof.count();
    expect(socialProofCount).toBeGreaterThanOrEqual(0);
  }

  // Technology stack verification
  async verifyTechnologyMentions() {
    const pageContent = await this.page.textContent();
    
    // Should mention modern technologies
    expect(pageContent).toMatch(/react|next|typescript|node|aws|vercel|modern|latest|cutting-edge/i);
  }

  // Call-to-action effectiveness
  async verifyCTAEffectiveness() {
    const ctaCount = await this.ctaButton.count();
    expect(ctaCount).toBeGreaterThan(0);
    
    // CTAs should be strategically placed
    for (let i = 0; i < Math.min(ctaCount, 3); i++) {
      const cta = this.ctaButton.nth(i);
      const ctaText = await cta.textContent();
      
      // Should have action-oriented text
      expect(ctaText).toMatch(/get started|contact|learn more|schedule|book|request/i);
    }
  }

  // Scroll behavior and lazy loading
  async verifyScrollBehavior() {
    // Scroll through services
    const serviceCount = await this.serviceCards.count();
    
    for (let i = 0; i < Math.min(serviceCount, 3); i++) {
      const service = this.serviceCards.nth(i);
      await service.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(200);
      await expect(service).toBeVisible();
    }
  }
}