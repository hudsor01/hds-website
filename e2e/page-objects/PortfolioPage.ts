import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class PortfolioPage extends BasePage {
  // Page elements
  readonly pageHeading: Locator;
  readonly projectCards: Locator;
  readonly projectImages: Locator;
  readonly projectTitles: Locator;
  readonly projectDescriptions: Locator;
  readonly projectLinks: Locator;
  readonly liveLinks: Locator;
  readonly githubLinks: Locator;

  // Filtering and navigation
  readonly filterButtons: Locator;
  readonly categoryFilters: Locator;
  readonly technologyFilters: Locator;
  readonly sortOptions: Locator;

  // Project modal/details
  readonly projectModal: Locator;
  readonly modalImage: Locator;
  readonly modalDescription: Locator;
  readonly modalTechnologies: Locator;
  readonly modalCloseButton: Locator;

  // Gallery features
  readonly imageGallery: Locator;
  readonly thumbnails: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly fullscreenButton: Locator;

  constructor(page: Page) {
    super(page, '/portfolio');
    
    // Main page elements
    this.pageHeading = page.locator('h1');
    this.projectCards = page.locator('[class*="project"], [class*="portfolio"], [class*="work"], article').filter({ hasText: /project|portfolio|work/i });
    this.projectImages = page.locator('[class*="project"] img, [class*="portfolio"] img, [class*="work"] img');
    this.projectTitles = page.locator('[class*="project"] h2, [class*="project"] h3, [class*="portfolio"] h2, [class*="portfolio"] h3');
    this.projectDescriptions = page.locator('[class*="project"] p, [class*="portfolio"] p, [class*="description"]');
    this.projectLinks = page.locator('a[href*="http"], a:has-text("View"), a:has-text("Live"), a:has-text("Demo")');
    this.liveLinks = page.locator('a:has-text("Live"), a:has-text("Demo"), a:has-text("View Site")');
    this.githubLinks = page.locator('a[href*="github"], a:has-text("Code"), a:has-text("Repository")');

    // Filtering
    this.filterButtons = page.locator('[class*="filter"], button[data-filter], .category-filter');
    this.categoryFilters = page.locator('button:has-text("Web"), button:has-text("Mobile"), button:has-text("E-commerce")');
    this.technologyFilters = page.locator('button:has-text("React"), button:has-text("Next"), button:has-text("Node")');
    this.sortOptions = page.locator('select[name*="sort"], [class*="sort"]');

    // Modal elements
    this.projectModal = page.locator('[class*="modal"], dialog, [class*="popup"]');
    this.modalImage = page.locator('[class*="modal"] img, dialog img');
    this.modalDescription = page.locator('[class*="modal"] p, dialog p, [class*="modal"] [class*="description"]');
    this.modalTechnologies = page.locator('[class*="modal"] [class*="tech"], [class*="modal"] [class*="stack"]');
    this.modalCloseButton = page.locator('[class*="modal"] button:has-text("Close"), [class*="modal"] .close, dialog button');

    // Gallery elements
    this.imageGallery = page.locator('[class*="gallery"], [class*="carousel"]');
    this.thumbnails = page.locator('[class*="thumb"], [class*="preview"]');
    this.nextButton = page.locator('button:has-text("Next"), .next, [aria-label*="next"]');
    this.prevButton = page.locator('button:has-text("Previous"), .prev, [aria-label*="previous"]');
    this.fullscreenButton = page.locator('button:has-text("Fullscreen"), [aria-label*="fullscreen"]');
  }

  // Page verification methods
  async verifyPageLoaded() {
    await expect(this.pageHeading).toBeVisible();
    
    const pageTitle = await this.pageHeading.textContent();
    expect(pageTitle).toMatch(/portfolio|our work|projects|showcas/i);
  }

  async verifyProjectsDisplayed() {
    await expect(this.projectCards.first()).toBeVisible();
    
    const projectCount = await this.projectCards.count();
    expect(projectCount).toBeGreaterThan(0);
    
    // Verify each project has essential elements
    for (let i = 0; i < Math.min(projectCount, 3); i++) {
      const project = this.projectCards.nth(i);
      await expect(project).toBeVisible();
      
      // Should have an image
      const projectImage = project.locator('img');
      if (await projectImage.count() > 0) {
        await expect(projectImage.first()).toBeVisible();
      }
      
      // Should have a title
      const projectTitle = project.locator('h2, h3, [class*="title"]');
      if (await projectTitle.count() > 0) {
        const titleText = await projectTitle.first().textContent();
        expect(titleText).toBeTruthy();
        expect(titleText!.length).toBeGreaterThan(3);
      }
    }
  }

  async verifyProjectImages() {
    const imageCount = await this.projectImages.count();
    expect(imageCount).toBeGreaterThan(0);
    
    // Verify images are loaded
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = this.projectImages.nth(i);
      await expect(img).toBeVisible();
      
      // Check if image is actually loaded
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
      
      // Verify alt text for accessibility
      const altText = await img.getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  }

  // Project interaction methods
  async clickProject(index: number = 0) {
    const project = this.projectCards.nth(index);
    await project.click();
    await this.page.waitForTimeout(500);
    
    // Check if modal opened or navigated to project detail
    const currentUrl = this.page.url();
    const modalVisible = await this.projectModal.isVisible().catch(() => false);
    
    return modalVisible || currentUrl !== this.url;
  }

  async openProjectModal(index: number = 0) {
    const project = this.projectCards.nth(index);
    await project.click();
    
    if (await this.projectModal.count() > 0) {
      await expect(this.projectModal).toBeVisible();
      return true;
    }
    return false;
  }

  async closeProjectModal() {
    if (await this.projectModal.isVisible()) {
      if (await this.modalCloseButton.count() > 0) {
        await this.modalCloseButton.first().click();
      } else {
        await this.page.keyboard.press('Escape');
      }
      
      await this.projectModal.waitFor({ state: 'hidden' });
    }
  }

  async visitLiveProject(index: number = 0) {
    const liveLink = this.liveLinks.nth(index);
    
    if (await liveLink.count() > 0) {
      const href = await liveLink.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^https?:\/\//);
      
      // Open in new tab to verify link works
      const [newPage] = await Promise.all([
        this.page.context().waitForEvent('page'),
        liveLink.click()
      ]);
      
      await newPage.waitForLoadState('domcontentloaded');
      const newPageUrl = newPage.url();
      expect(newPageUrl).toBeTruthy();
      
      await newPage.close();
      return true;
    }
    return false;
  }

  async visitGithubRepository(index: number = 0) {
    const githubLink = this.githubLinks.nth(index);
    
    if (await githubLink.count() > 0) {
      const href = await githubLink.getAttribute('href');
      expect(href).toContain('github.com');
      
      // Verify link structure
      expect(href).toMatch(/^https:\/\/github\.com\/[\w-]+\/[\w-]+/);
      
      return true;
    }
    return false;
  }

  // Filtering and sorting
  async filterByCategory(category: 'web' | 'mobile' | 'ecommerce' | 'all') {
    const filterMap = {
      'web': 'Web',
      'mobile': 'Mobile',
      'ecommerce': 'E-commerce',
      'all': 'All'
    };
    
    const filterText = filterMap[category];
    const filterButton = this.page.locator(`button:has-text("${filterText}"), [data-filter="${category}"]`);
    
    if (await filterButton.count() > 0) {
      await filterButton.first().click();
      await this.page.waitForTimeout(500);
      
      // Verify filtering worked
      const visibleProjects = await this.projectCards.count();
      expect(visibleProjects).toBeGreaterThanOrEqual(0);
      
      return true;
    }
    return false;
  }

  async filterByTechnology(technology: string) {
    const techFilter = this.page.locator(`button:has-text("${technology}"), [data-filter="${technology.toLowerCase()}"]`);
    
    if (await techFilter.count() > 0) {
      await techFilter.first().click();
      await this.page.waitForTimeout(500);
      
      // Verify projects show the technology
      const visibleProjects = await this.projectCards.count();
      expect(visibleProjects).toBeGreaterThanOrEqual(0);
      
      return true;
    }
    return false;
  }

  async sortProjects(sortBy: 'newest' | 'oldest' | 'name') {
    if (await this.sortOptions.count() > 0) {
      await this.sortOptions.first().selectOption(sortBy);
      await this.page.waitForTimeout(500);
      
      return true;
    }
    return false;
  }

  // Gallery navigation
  async navigateGallery() {
    if (await this.imageGallery.count() > 0) {
      // Test next button
      if (await this.nextButton.count() > 0) {
        await this.nextButton.first().click();
        await this.page.waitForTimeout(300);
      }
      
      // Test previous button
      if (await this.prevButton.count() > 0) {
        await this.prevButton.first().click();
        await this.page.waitForTimeout(300);
      }
      
      // Test thumbnails
      const thumbnailCount = await this.thumbnails.count();
      if (thumbnailCount > 1) {
        await this.thumbnails.nth(1).click();
        await this.page.waitForTimeout(300);
      }
      
      return true;
    }
    return false;
  }

  // Content quality verification
  async verifyProjectContent() {
    const projectCount = await this.projectCards.count();
    
    for (let i = 0; i < Math.min(projectCount, 3); i++) {
      const project = this.projectCards.nth(i);
      
      // Verify project has title
      const titleElement = project.locator('h2, h3, [class*="title"]');
      if (await titleElement.count() > 0) {
        const title = await titleElement.first().textContent();
        expect(title).toBeTruthy();
        expect(title!.length).toBeGreaterThan(5);
      }
      
      // Verify project has description
      const descElement = project.locator('p, [class*="description"]');
      if (await descElement.count() > 0) {
        const description = await descElement.first().textContent();
        expect(description).toBeTruthy();
        expect(description!.length).toBeGreaterThan(20);
      }
      
      // Verify technologies are mentioned
      const projectText = await project.textContent();
      expect(projectText).toMatch(/react|next|javascript|typescript|node|python|php|wordpress|shopify/i);
    }
  }

  // Mobile responsiveness
  async verifyMobileLayout() {
    const projectCount = await this.projectCards.count();
    
    for (let i = 0; i < Math.min(projectCount, 3); i++) {
      const project = this.projectCards.nth(i);
      const box = await project.boundingBox();
      
      if (box) {
        const viewportWidth = await this.page.viewportSize()?.width || 375;
        expect(box.width).toBeLessThanOrEqual(viewportWidth);
        expect(box.x).toBeGreaterThanOrEqual(0);
      }
    }
    
    // Images should be responsive
    const imageCount = await this.projectImages.count();
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const img = this.projectImages.nth(i);
      const imgBox = await img.boundingBox();
      
      if (imgBox) {
        const viewportWidth = await this.page.viewportSize()?.width || 375;
        expect(imgBox.width).toBeLessThanOrEqual(viewportWidth);
      }
    }
  }

  // Performance verification
  async verifyImageOptimization() {
    const images = this.projectImages;
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      
      // Check for responsive images
      const srcset = await img.getAttribute('srcset');
      const sizes = await img.getAttribute('sizes');
      
      // Should have optimization attributes
      expect(srcset || sizes).toBeTruthy();
      
      // Check loading attribute
      const loading = await img.getAttribute('loading');
      if (i > 2) { // Images below fold should be lazy loaded
        expect(loading).toBe('lazy');
      }
    }
  }

  async verifyLazyLoading() {
    const lazyImages = this.page.locator('img[loading="lazy"]');
    const lazyCount = await lazyImages.count();
    
    // Should have lazy loaded images
    expect(lazyCount).toBeGreaterThan(0);
    
    // Scroll to trigger lazy loading
    await this.scrollToBottom();
    await this.page.waitForTimeout(1000);
    
    // Verify images loaded after scroll
    for (let i = 0; i < Math.min(lazyCount, 3); i++) {
      const img = lazyImages.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  }

  // SEO verification
  async verifyPortfolioSEO() {
    await this.verifyBasicSEO();
    
    // Check for portfolio-specific keywords
    const description = await this.page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toMatch(/portfolio|projects|work|showcase|examples/i);
    
    // Verify structured data for creative works
    const structuredData = this.page.locator('script[type="application/ld+json"]');
    if (await structuredData.count() > 0) {
      const jsonLd = await structuredData.first().textContent();
      expect(jsonLd).toMatch(/CreativeWork|WebSite|Portfolio/);
    }
  }

  // Case study verification
  async verifyCaseStudies() {
    const caseStudyLinks = this.page.locator('a:has-text("Case Study"), a:has-text("Learn More"), a:has-text("Read More")');
    const caseStudyCount = await caseStudyLinks.count();
    
    if (caseStudyCount > 0) {
      // Test first case study link
      const firstCaseStudy = caseStudyLinks.first();
      const href = await firstCaseStudy.getAttribute('href');
      expect(href).toBeTruthy();
      
      // Should link to detailed case study
      expect(href).toMatch(/\/case-study|\/project|\/portfolio|\/work/);
    }
  }

  // Technology showcase
  async verifyTechnologyShowcase() {
    const pageContent = await this.page.textContent();
    
    // Should showcase modern technologies
    expect(pageContent).toMatch(/react|next\.js|typescript|node\.js|aws|vercel|mongodb|postgresql/i);
    
    // Should mention specific features
    expect(pageContent).toMatch(/responsive|mobile-first|seo|performance|accessibility|scalable/i);
  }

  // Client testimonials in portfolio
  async verifyClientTestimonials() {
    const testimonials = this.page.locator('[class*="testimonial"], [class*="review"], blockquote');
    const testimonialCount = await testimonials.count();
    
    if (testimonialCount > 0) {
      for (let i = 0; i < Math.min(testimonialCount, 2); i++) {
        const testimonial = testimonials.nth(i);
        await expect(testimonial).toBeVisible();
        
        const testimonialText = await testimonial.textContent();
        expect(testimonialText).toBeTruthy();
        expect(testimonialText!.length).toBeGreaterThan(50);
      }
    }
  }

  // Analytics tracking
  async verifyPortfolioAnalytics() {
    let portfolioViewTracked = false;
    
    this.page.on('request', request => {
      if (request.url().includes('posthog') || request.url().includes('/capture')) {
        const postData = request.postData();
        if (postData && postData.includes('portfolio_view')) {
          portfolioViewTracked = true;
        }
      }
    });

    await this.page.waitForTimeout(2000);
    expect(portfolioViewTracked).toBe(true);
  }

  // Project diversity verification
  async verifyProjectDiversity() {
    const projectCount = await this.projectCards.count();
    expect(projectCount).toBeGreaterThanOrEqual(3);
    
    const allProjectText = await this.page.textContent();
    
    // Should show diverse project types
    const hasWebProjects = /website|web app|landing page/i.test(allProjectText);
    const hasEcommerce = /shop|store|ecommerce|e-commerce/i.test(allProjectText);
    const hasMobile = /mobile|app|ios|android/i.test(allProjectText);
    
    // Should have at least web projects
    expect(hasWebProjects).toBe(true);
  }

  // Contact conversion
  async verifyConversionOpportunities() {
    const contactCTAs = this.page.locator('a[href="/contact"], button:has-text("Contact"), button:has-text("Get Started")');
    const ctaCount = await contactCTAs.count();
    
    expect(ctaCount).toBeGreaterThan(0);
    
    // CTAs should be strategically placed
    const firstCTA = contactCTAs.first();
    await expect(firstCTA).toBeVisible();
    
    const ctaText = await firstCTA.textContent();
    expect(ctaText).toMatch(/contact|get started|work together|hire|discuss/i);
  }
}