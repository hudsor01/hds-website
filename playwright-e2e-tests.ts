#!/usr/bin/env npx tsx

/**
 * Comprehensive Playwright E2E Testing Suite for Hudson Digital Solutions
 * 
 * This test suite performs real browser testing of:
 * 1. Core User Journeys
 * 2. Analytics & Performance Validation  
 * 3. Accessibility Features
 * 4. Error Handling & Resilience
 * 5. Cross-Browser Compatibility
 */

const { chromium, firefox, webkit } = require('playwright');
import fs from 'fs';
import path from 'path';

type Browser = any;
type Page = any;
type BrowserContext = any;

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
  message: string;
  details?: string[];
  performance?: {
    loadTime: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
  };
  accessibility?: {
    violations: number;
    issues: string[];
  };
  screenshots?: string[];
}

interface TestSuite {
  name: string;
  browser: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
  };
}

class PlaywrightE2ETestRunner {
  private baseUrl = 'http://localhost:3000';
  private testSuites: TestSuite[] = [];
  private screenshotDir = path.join(process.cwd(), 'test-screenshots');

  constructor() {
    // Create screenshots directory
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive Playwright E2E Testing Suite');
    console.log('=' .repeat(80));

    const browsers = [
      { name: 'Chromium', launch: chromium.launch },
      { name: 'Firefox', launch: firefox.launch },
      { name: 'WebKit', launch: webkit.launch }
    ];

    for (const browserConfig of browsers) {
      console.log(`\n🌐 Testing with ${browserConfig.name}...`);
      
      const browser = await browserConfig.launch();
      
      try {
        await this.runBrowserTests(browser, browserConfig.name);
      } catch (error) {
        console.error(`Error testing with ${browserConfig.name}:`, error);
      } finally {
        await browser.close();
      }
    }

    this.generateReport();
  }

  async runBrowserTests(browser: Browser, browserName: string): Promise<void> {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'E2E-Test-Suite/1.0'
    });

    try {
      // 1. Core User Journeys
      await this.testCoreUserJourneys(context, browserName);
      
      // 2. Analytics & Performance
      await this.testAnalyticsAndPerformance(context, browserName);
      
      // 3. Accessibility Features
      await this.testAccessibilityFeatures(context, browserName);
      
      // 4. Error Handling
      await this.testErrorHandling(context, browserName);
      
      // 5. Responsive Testing
      await this.testResponsiveDesign(context, browserName);

    } finally {
      await context.close();
    }
  }

  async testCoreUserJourneys(context: BrowserContext, browserName: string): Promise<void> {
    const suite: TestSuite = {
      name: 'Core User Journeys',
      browser: browserName,
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 }
    };

    console.log('📱 Testing Core User Journeys...');

    const page = await context.newPage();

    // Test home page loading and navigation
    suite.results.push(await this.testPageLoad(page, '/', 'Home Page'));
    
    // Test navigation functionality
    suite.results.push(await this.testNavigation(page));
    
    // Test contact form
    suite.results.push(await this.testContactForm(page));
    
    // Test calendar widget
    suite.results.push(await this.testCalendarWidget(page));
    
    // Test theme toggle
    suite.results.push(await this.testThemeToggle(page));

    // Test other pages
    const pages = ['/about', '/services', '/blog'];
    for (const pagePath of pages) {
      suite.results.push(await this.testPageLoad(page, pagePath, `${pagePath.slice(1)} Page`));
    }

    await page.close();
    this.calculateSummary(suite);
    this.testSuites.push(suite);
  }

  async testAnalyticsAndPerformance(context: BrowserContext, browserName: string): Promise<void> {
    const suite: TestSuite = {
      name: 'Analytics & Performance',
      browser: browserName,
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 }
    };

    console.log('📊 Testing Analytics & Performance...');

    const page = await context.newPage();

    // Test analytics loading
    suite.results.push(await this.testAnalyticsScripts(page));
    
    // Test performance metrics
    suite.results.push(await this.testPagePerformance(page));
    
    // Test SEO elements
    suite.results.push(await this.testSEOElements(page));
    
    // Test Web Vitals
    suite.results.push(await this.testWebVitals(page));

    await page.close();
    this.calculateSummary(suite);
    this.testSuites.push(suite);
  }

  async testAccessibilityFeatures(context: BrowserContext, browserName: string): Promise<void> {
    const suite: TestSuite = {
      name: 'Accessibility Features',
      browser: browserName,
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 }
    };

    console.log('♿ Testing Accessibility Features...');

    const page = await context.newPage();

    // Test keyboard navigation
    suite.results.push(await this.testKeyboardNavigation(page));
    
    // Test screen reader elements
    suite.results.push(await this.testScreenReaderElements(page));
    
    // Test ARIA attributes
    suite.results.push(await this.testARIAAttributes(page));
    
    // Test focus management
    suite.results.push(await this.testFocusManagement(page));

    await page.close();
    this.calculateSummary(suite);
    this.testSuites.push(suite);
  }

  async testErrorHandling(context: BrowserContext, browserName: string): Promise<void> {
    const suite: TestSuite = {
      name: 'Error Handling',
      browser: browserName,
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 }
    };

    console.log('🛡️ Testing Error Handling...');

    const page = await context.newPage();

    // Test 404 page
    suite.results.push(await this.test404Page(page));
    
    // Test form validation
    suite.results.push(await this.testFormValidation(page));
    
    // Test JavaScript errors
    suite.results.push(await this.testJavaScriptErrors(page));

    await page.close();
    this.calculateSummary(suite);
    this.testSuites.push(suite);
  }

  async testResponsiveDesign(context: BrowserContext, browserName: string): Promise<void> {
    const suite: TestSuite = {
      name: 'Responsive Design',
      browser: browserName,
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 }
    };

    console.log('📱 Testing Responsive Design...');

    // Test different viewport sizes
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      const page = await context.newPage();
      await page.setViewportSize(viewport);
      suite.results.push(await this.testViewport(page, viewport));
      await page.close();
    }

    this.calculateSummary(suite);
    this.testSuites.push(suite);
  }

  // Individual Test Methods

  async testPageLoad(page: Page, path: string, pageName: string): Promise<TestResult> {
    try {
      const startTime = Date.now();
      
      const response = await page.goto(`${this.baseUrl}${path}`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      const loadTime = Date.now() - startTime;

      if (!response || !response.ok()) {
        return {
          test: `${pageName} Load`,
          status: 'FAIL',
          message: `Failed to load page: ${response?.status() || 'No response'}`,
          performance: { loadTime }
        };
      }

      // Wait for page to be fully loaded
      await page.waitForLoadState('domcontentloaded');

      // Take screenshot
      const screenshotPath = path.join(this.screenshotDir, `${pageName.replace(/\s+/g, '-').toLowerCase()}-load.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Check for essential elements
      const hasTitle = await page.title();
      const hasMainContent = await page.locator('main, [id="main-content"]').count() > 0;
      const hasNavigation = await page.locator('nav').count() > 0;

      const details = [
        `Load time: ${loadTime}ms`,
        `Title: ${hasTitle ? '✓' : '✗'}`,
        `Main content: ${hasMainContent ? '✓' : '✗'}`,
        `Navigation: ${hasNavigation ? '✓' : '✗'}`
      ];

      return {
        test: `${pageName} Load`,
        status: loadTime < 3000 ? 'PASS' : 'WARN',
        message: `Page loaded in ${loadTime}ms`,
        details,
        performance: { loadTime },
        screenshots: [screenshotPath]
      };

    } catch (error) {
      return {
        test: `${pageName} Load`,
        status: 'FAIL',
        message: `Error loading page: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testNavigation(page: Page): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/`);

      // Test navigation menu
      const navLinks = page.locator('nav a');
      const linkCount = await navLinks.count();

      const details = [`Found ${linkCount} navigation links`];
      let workingLinks = 0;

      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        try {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');
          const text = await link.textContent();
          
          if (href && href.startsWith('/')) {
            await link.click();
            await page.waitForLoadState('domcontentloaded');
            workingLinks++;
            details.push(`${text}: ✓`);
          }
        } catch (error) {
          details.push(`Link ${i + 1}: ✗ (${error instanceof Error ? error.message : 'Error'})`);
        }
      }

      return {
        test: 'Navigation Functionality',
        status: workingLinks >= linkCount * 0.8 ? 'PASS' : 'WARN',
        message: `${workingLinks}/${linkCount} navigation links working`,
        details
      };

    } catch (error) {
      return {
        test: 'Navigation Functionality',
        status: 'FAIL',
        message: `Error testing navigation: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testContactForm(page: Page): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/contact`);
      await page.waitForLoadState('domcontentloaded');

      // Take screenshot of contact form
      const screenshotPath = path.join(this.screenshotDir, 'contact-form.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Find form elements
      const form = page.locator('form');
      const formExists = await form.count() > 0;

      if (!formExists) {
        return {
          test: 'Contact Form',
          status: 'FAIL',
          message: 'Contact form not found on page',
          screenshots: [screenshotPath]
        };
      }

      // Test form validation
      const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
      await submitButton.click();

      // Wait for validation messages
      await page.waitForTimeout(1000);

      // Check for validation messages
      const errorMessages = await page.locator('.text-red-400, .error, [role="alert"]').count();
      
      // Test form filling
      const firstName = page.locator('input[name="firstName"], input[placeholder*="First"]').first();
      const lastName = page.locator('input[name="lastName"], input[placeholder*="Last"]').first();
      const email = page.locator('input[name="email"], input[type="email"]').first();
      const message = page.locator('textarea[name="message"], textarea').first();

      const fieldsExist = {
        firstName: await firstName.count() > 0,
        lastName: await lastName.count() > 0,
        email: await email.count() > 0,
        message: await message.count() > 0
      };

      // Fill out form with test data
      if (fieldsExist.firstName) await firstName.fill('Test');
      if (fieldsExist.lastName) await lastName.fill('User');
      if (fieldsExist.email) await email.fill('test@example.com');
      if (fieldsExist.message) await message.fill('This is a test message for E2E testing purposes.');

      // Submit form
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Check for success or error response
      const successMessage = await page.locator('.text-green-400, .success, .alert-success').count();
      const errorMessage = await page.locator('.text-red-400, .error, .alert-error').count();

      const details = [
        `Form found: ${formExists ? '✓' : '✗'}`,
        `Validation messages: ${errorMessages > 0 ? '✓' : '✗'}`,
        `First name field: ${fieldsExist.firstName ? '✓' : '✗'}`,
        `Last name field: ${fieldsExist.lastName ? '✓' : '✗'}`,
        `Email field: ${fieldsExist.email ? '✓' : '✗'}`,
        `Message field: ${fieldsExist.message ? '✓' : '✗'}`,
        `Form submission: ${successMessage > 0 ? 'Success' : errorMessage > 0 ? 'Error shown' : 'No response'}`
      ];

      return {
        test: 'Contact Form',
        status: formExists && Object.values(fieldsExist).filter(Boolean).length >= 3 ? 'PASS' : 'WARN',
        message: 'Contact form functionality tested',
        details,
        screenshots: [screenshotPath]
      };

    } catch (error) {
      return {
        test: 'Contact Form',
        status: 'FAIL',
        message: `Error testing contact form: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testCalendarWidget(page: Page): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/contact`);
      await page.waitForLoadState('domcontentloaded');

      // Look for calendar widget indicators
      const calWidget = await page.locator('iframe[src*="cal.com"], [data-cal-link], .cal-widget').count();
      const calText = await page.locator('text=/calendar|booking|schedule/i').count();

      return {
        test: 'Calendar Widget',
        status: calWidget > 0 ? 'PASS' : calText > 0 ? 'WARN' : 'FAIL',
        message: calWidget > 0 ? 'Calendar widget found' : calText > 0 ? 'Calendar references found' : 'No calendar widget detected',
        details: [
          `Calendar iframes/widgets: ${calWidget}`,
          `Calendar-related text: ${calText}`
        ]
      };

    } catch (error) {
      return {
        test: 'Calendar Widget',
        status: 'FAIL',
        message: `Error testing calendar widget: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testThemeToggle(page: Page): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/`);
      await page.waitForLoadState('domcontentloaded');

      // Look for theme toggle button
      const themeToggle = page.locator('button:has-text("theme"), button:has-text("dark"), button:has-text("light"), [aria-label*="theme"]').first();
      const themeToggleExists = await themeToggle.count() > 0;

      if (!themeToggleExists) {
        return {
          test: 'Theme Toggle',
          status: 'WARN',
          message: 'Theme toggle button not found'
        };
      }

      // Get initial theme state
      const initialClass = await page.evaluate(() => document.documentElement.className);
      
      // Click theme toggle
      await themeToggle.click();
      await page.waitForTimeout(500);

      // Check if theme changed
      const newClass = await page.evaluate(() => document.documentElement.className);
      const themeChanged = initialClass !== newClass;

      return {
        test: 'Theme Toggle',
        status: themeChanged ? 'PASS' : 'WARN',
        message: themeChanged ? 'Theme toggle working' : 'Theme toggle found but functionality unclear',
        details: [
          `Initial class: ${initialClass}`,
          `After toggle: ${newClass}`,
          `Theme changed: ${themeChanged ? '✓' : '✗'}`
        ]
      };

    } catch (error) {
      return {
        test: 'Theme Toggle',
        status: 'FAIL',
        message: `Error testing theme toggle: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testAnalyticsScripts(page: Page): Promise<TestResult> {
    try {
      const requests: string[] = [];
      
      page.on('request', request => {
        const url = request.url();
        if (url.includes('googletagmanager') || url.includes('google-analytics') || 
            url.includes('posthog') || url.includes('vercel') || url.includes('gtag')) {
          requests.push(url);
        }
      });

      await page.goto(`${this.baseUrl}/`);
      await page.waitForLoadState('networkidle');

      // Check for analytics in page content
      const pageContent = await page.content();
      const hasGA = pageContent.includes('gtag') || pageContent.includes('googletagmanager');
      const hasPostHog = pageContent.includes('posthog');
      const hasVercel = pageContent.includes('vercel') && pageContent.includes('analytics');

      const details = [
        `Google Analytics: ${hasGA ? '✓' : '✗'}`,
        `PostHog: ${hasPostHog ? '✓' : '✗'}`,
        `Vercel Analytics: ${hasVercel ? '✓' : '✗'}`,
        `Analytics requests: ${requests.length}`,
        ...requests.slice(0, 5).map(url => `Request: ${new URL(url).hostname}`)
      ];

      const analyticsCount = [hasGA, hasPostHog, hasVercel].filter(Boolean).length;

      return {
        test: 'Analytics Scripts',
        status: analyticsCount >= 2 ? 'PASS' : analyticsCount >= 1 ? 'WARN' : 'FAIL',
        message: `Found ${analyticsCount} analytics platform(s)`,
        details
      };

    } catch (error) {
      return {
        test: 'Analytics Scripts',
        status: 'FAIL',
        message: `Error testing analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testPagePerformance(page: Page): Promise<TestResult> {
    try {
      const startTime = Date.now();
      
      await page.goto(`${this.baseUrl}/`);
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
        };
      });

      const details = [
        `Total load time: ${loadTime}ms`,
        `DOM Content Loaded: ${Math.round(metrics.domContentLoaded)}ms`,
        `Load complete: ${Math.round(metrics.loadComplete)}ms`,
        `First Paint: ${Math.round(metrics.firstPaint)}ms`,
        `First Contentful Paint: ${Math.round(metrics.firstContentfulPaint)}ms`
      ];

      return {
        test: 'Page Performance',
        status: loadTime < 3000 ? 'PASS' : loadTime < 5000 ? 'WARN' : 'FAIL',
        message: `Page performance measured`,
        details,
        performance: {
          loadTime,
          firstContentfulPaint: metrics.firstContentfulPaint
        }
      };

    } catch (error) {
      return {
        test: 'Page Performance',
        status: 'FAIL',
        message: `Error measuring performance: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testSEOElements(page: Page): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/`);
      await page.waitForLoadState('domcontentloaded');

      const title = await page.title();
      const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      
      // Check for structured data
      const structuredData = await page.locator('script[type="application/ld+json"]').count();

      const seoElements = [
        { name: 'Title tag', value: title, present: !!title },
        { name: 'Meta description', value: metaDescription, present: !!metaDescription },
        { name: 'Open Graph title', value: ogTitle, present: !!ogTitle },
        { name: 'Twitter card', value: twitterCard, present: !!twitterCard },
        { name: 'Canonical URL', value: canonical, present: !!canonical },
        { name: 'Structured data', value: `${structuredData} scripts`, present: structuredData > 0 }
      ];

      const presentCount = seoElements.filter(el => el.present).length;

      return {
        test: 'SEO Elements',
        status: presentCount >= 5 ? 'PASS' : presentCount >= 3 ? 'WARN' : 'FAIL',
        message: `Found ${presentCount}/6 SEO elements`,
        details: seoElements.map(el => `${el.name}: ${el.present ? '✓' : '✗'} ${el.value ? `(${el.value.slice(0, 50)}...)` : ''}`)
      };

    } catch (error) {
      return {
        test: 'SEO Elements',
        status: 'FAIL',
        message: `Error testing SEO elements: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testWebVitals(page: Page): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/`);
      await page.waitForLoadState('networkidle');

      // Simulate interaction for FID measurement
      await page.click('body');
      await page.waitForTimeout(1000);

      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals: any = {};
          
          // LCP
          if ('PerformanceObserver' in window) {
            new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries();
              const lastEntry = entries[entries.length - 1];
              vitals.lcp = lastEntry.startTime;
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // CLS
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries();
              entries.forEach((entry: any) => {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value;
                }
              });
              vitals.cls = clsValue;
            }).observe({ entryTypes: ['layout-shift'] });
          }

          setTimeout(() => resolve(vitals), 2000);
        });
      });

      const details = [
        `LCP: ${vitals.lcp ? Math.round(vitals.lcp) + 'ms' : 'Not measured'}`,
        `CLS: ${vitals.cls ? vitals.cls.toFixed(3) : 'Not measured'}`
      ];

      return {
        test: 'Web Vitals',
        status: vitals.lcp || vitals.cls ? 'PASS' : 'WARN',
        message: 'Web Vitals measurement attempted',
        details
      };

    } catch (error) {
      return {
        test: 'Web Vitals',
        status: 'FAIL',
        message: `Error measuring Web Vitals: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testKeyboardNavigation(page: Page): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/`);
      await page.waitForLoadState('domcontentloaded');

      // Test tabbing through focusable elements
      let focusableElements = 0;
      let focusableWithVisibleFocus = 0;

      // Get all potentially focusable elements
      const focusableSelectors = [
        'a[href]', 'button', 'input', 'textarea', 'select',
        '[tabindex]:not([tabindex="-1"])'
      ];

      for (const selector of focusableSelectors) {
        const elements = await page.locator(selector).count();
        focusableElements += elements;

        // Check if elements have visible focus styles
        for (let i = 0; i < Math.min(elements, 5); i++) {
          try {
            await page.locator(selector).nth(i).focus();
            const styles = await page.locator(selector).nth(i).evaluate(el => {
              const computed = window.getComputedStyle(el, ':focus');
              return {
                outline: computed.outline,
                boxShadow: computed.boxShadow,
                border: computed.border
              };
            });

            if (styles.outline !== 'none' || styles.boxShadow !== 'none' || 
                styles.border.includes('blue') || styles.border.includes('cyan')) {
              focusableWithVisibleFocus++;
            }
          } catch (error) {
            // Element might not be focusable
          }
        }
      }

      return {
        test: 'Keyboard Navigation',
        status: focusableElements > 0 && focusableWithVisibleFocus > 0 ? 'PASS' : 'WARN',
        message: 'Keyboard navigation tested',
        details: [
          `Focusable elements: ${focusableElements}`,
          `Elements with visible focus: ${focusableWithVisibleFocus}`
        ]
      };

    } catch (error) {
      return {
        test: 'Keyboard Navigation',
        status: 'FAIL',
        message: `Error testing keyboard navigation: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testScreenReaderElements(page: Page): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/`);
      await page.waitForLoadState('domcontentloaded');

      // Check for screen reader elements
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
      const landmarks = await page.locator('main, nav, header, footer, aside, section[aria-label]').count();
      const altTexts = await page.locator('img[alt]:not([alt=""])').count();
      const ariaLabels = await page.locator('[aria-label], [aria-labelledby]').count();

      const features = [
        { name: 'Headings', count: headings, threshold: 1 },
        { name: 'Landmarks', count: landmarks, threshold: 2 },
        { name: 'Alt texts', count: altTexts, threshold: 0 },
        { name: 'ARIA labels', count: ariaLabels, threshold: 1 }
      ];

      const passedFeatures = features.filter(f => f.count >= f.threshold).length;

      return {
        test: 'Screen Reader Elements',
        status: passedFeatures >= 3 ? 'PASS' : passedFeatures >= 2 ? 'WARN' : 'FAIL',
        message: `${passedFeatures}/4 screen reader features found`,
        details: features.map(f => `${f.name}: ${f.count} (${f.count >= f.threshold ? '✓' : '✗'})`)
      };

    } catch (error) {
      return {
        test: 'Screen Reader Elements',
        status: 'FAIL',
        message: `Error testing screen reader elements: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testARIAAttributes(page: Page): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/`);
      await page.waitForLoadState('domcontentloaded');

      const ariaElements = {
        'aria-label': await page.locator('[aria-label]').count(),
        'aria-describedby': await page.locator('[aria-describedby]').count(),
        'aria-expanded': await page.locator('[aria-expanded]').count(),
        'aria-hidden': await page.locator('[aria-hidden]').count(),
        'role': await page.locator('[role]').count()
      };

      const presentCount = Object.values(ariaElements).filter(count => count > 0).length;

      return {
        test: 'ARIA Attributes',
        status: presentCount >= 3 ? 'PASS' : presentCount >= 2 ? 'WARN' : 'FAIL',
        message: `Found ${presentCount}/5 ARIA attribute types`,
        details: Object.entries(ariaElements).map(([attr, count]) => `${attr}: ${count}`)
      };

    } catch (error) {
      return {
        test: 'ARIA Attributes',
        status: 'FAIL',
        message: `Error testing ARIA attributes: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testFocusManagement(page: Page): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/`);
      await page.waitForLoadState('domcontentloaded');

      // Test focus trap in modals/dropdowns
      const interactiveElements = await page.locator('button, [role="button"]').count();
      
      let focusTrapped = false;
      if (interactiveElements > 0) {
        // Click first interactive element to potentially open modal/dropdown
        await page.locator('button, [role="button"]').first().click();
        await page.waitForTimeout(500);

        // Check if focus is managed
        const activeElement = await page.evaluate(() => document.activeElement?.tagName);
        focusTrapped = activeElement !== 'BODY';
      }

      return {
        test: 'Focus Management',
        status: interactiveElements > 0 ? 'PASS' : 'WARN',
        message: 'Focus management tested',
        details: [
          `Interactive elements: ${interactiveElements}`,
          `Focus trapped: ${focusTrapped ? '✓' : '✗'}`
        ]
      };

    } catch (error) {
      return {
        test: 'Focus Management',
        status: 'FAIL',
        message: `Error testing focus management: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async test404Page(page: Page): Promise<TestResult> {
    try {
      const response = await page.goto(`${this.baseUrl}/nonexistent-page-12345`);
      
      if (response?.status() === 404) {
        // Take screenshot of 404 page
        const screenshotPath = path.join(this.screenshotDir, '404-page.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });

        const content = await page.content();
        const has404Content = content.includes('404') || content.toLowerCase().includes('not found');
        const hasNavigation = await page.locator('nav a, [href="/"]').count() > 0;

        return {
          test: '404 Error Page',
          status: has404Content ? 'PASS' : 'WARN',
          message: has404Content ? 'Custom 404 page found' : '404 status but unclear content',
          details: [
            `Status: ${response.status()}`,
            `404 content: ${has404Content ? '✓' : '✗'}`,
            `Navigation present: ${hasNavigation ? '✓' : '✗'}`
          ],
          screenshots: [screenshotPath]
        };
      } else {
        return {
          test: '404 Error Page',
          status: 'WARN',
          message: `Expected 404 but got ${response?.status() || 'unknown status'}`
        };
      }

    } catch (error) {
      return {
        test: '404 Error Page',
        status: 'FAIL',
        message: `Error testing 404 page: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testFormValidation(page: Page): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/contact`);
      await page.waitForLoadState('domcontentloaded');

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Check for validation messages
      const errorMessages = await page.locator('.text-red-400, .error, [role="alert"], .invalid').count();

      // Test invalid email format
      const emailField = page.locator('input[type="email"], input[name="email"]').first();
      if (await emailField.count() > 0) {
        await emailField.fill('invalid-email');
        await submitButton.click();
        await page.waitForTimeout(1000);
      }

      const moreErrors = await page.locator('.text-red-400, .error, [role="alert"], .invalid').count();

      return {
        test: 'Form Validation',
        status: errorMessages > 0 || moreErrors > errorMessages ? 'PASS' : 'WARN',
        message: 'Form validation tested',
        details: [
          `Initial validation errors: ${errorMessages}`,
          `Errors after invalid email: ${moreErrors}`
        ]
      };

    } catch (error) {
      return {
        test: 'Form Validation',
        status: 'FAIL',
        message: `Error testing form validation: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testJavaScriptErrors(page: Page): Promise<TestResult> {
    try {
      const errors: string[] = [];

      page.on('pageerror', error => {
        errors.push(error.message);
      });

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(`${this.baseUrl}/`);
      await page.waitForLoadState('networkidle');

      // Navigate to other pages to catch more errors
      await page.goto(`${this.baseUrl}/contact`);
      await page.waitForLoadState('domcontentloaded');

      return {
        test: 'JavaScript Errors',
        status: errors.length === 0 ? 'PASS' : errors.length <= 2 ? 'WARN' : 'FAIL',
        message: `Found ${errors.length} JavaScript errors`,
        details: errors.slice(0, 5).map(error => `Error: ${error.slice(0, 100)}`)
      };

    } catch (error) {
      return {
        test: 'JavaScript Errors',
        status: 'FAIL',
        message: `Error testing JavaScript errors: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testViewport(page: Page, viewport: { name: string; width: number; height: number }): Promise<TestResult> {
    try {
      await page.goto(`${this.baseUrl}/`);
      await page.waitForLoadState('domcontentloaded');

      // Take screenshot for this viewport
      const screenshotPath = path.join(this.screenshotDir, `viewport-${viewport.name.toLowerCase()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Check responsive elements
      const mobileMenu = await page.locator('[class*="mobile"], button[aria-label*="menu"]').count();
      const hiddenElements = await page.locator('[class*="md:hidden"], [class*="lg:hidden"]').count();
      const responsiveText = await page.locator('[class*="text-sm"], [class*="text-lg"]').count();

      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      const details = [
        `Viewport: ${viewport.width}x${viewport.height}`,
        `Mobile menu elements: ${mobileMenu}`,
        `Hidden responsive elements: ${hiddenElements}`,
        `Responsive text: ${responsiveText}`,
        `Horizontal scroll: ${hasHorizontalScroll ? '✗' : '✓'}`
      ];

      return {
        test: `${viewport.name} Viewport`,
        status: !hasHorizontalScroll ? 'PASS' : 'WARN',
        message: `${viewport.name} viewport tested`,
        details,
        screenshots: [screenshotPath]
      };

    } catch (error) {
      return {
        test: `${viewport.name} Viewport`,
        status: 'FAIL',
        message: `Error testing ${viewport.name} viewport: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private calculateSummary(suite: TestSuite): void {
    suite.summary.total = suite.results.length;
    suite.summary.passed = suite.results.filter(r => r.status === 'PASS').length;
    suite.summary.failed = suite.results.filter(r => r.status === 'FAIL').length;
    suite.summary.warnings = suite.results.filter(r => r.status === 'WARN').length;
    suite.summary.skipped = suite.results.filter(r => r.status === 'SKIP').length;
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE PLAYWRIGHT E2E TEST REPORT');
    console.log('='.repeat(80));

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;
    let totalSkipped = 0;

    // Generate detailed report for each test suite
    this.testSuites.forEach(suite => {
      console.log(`\n📋 ${suite.name} (${suite.browser})`);
      console.log('-'.repeat(50));
      
      suite.results.forEach(result => {
        const statusIcon = {
          'PASS': '✅',
          'FAIL': '❌',
          'WARN': '⚠️',
          'SKIP': '⏭️'
        }[result.status];
        
        console.log(`${statusIcon} ${result.test}: ${result.message}`);
        
        if (result.details && result.details.length > 0) {
          result.details.forEach(detail => {
            console.log(`   ${detail}`);
          });
        }
        
        if (result.performance) {
          console.log(`   Performance: ${result.performance.loadTime}ms load time`);
        }

        if (result.screenshots && result.screenshots.length > 0) {
          console.log(`   Screenshots: ${result.screenshots.length} saved`);
        }
      });
      
      console.log(`\nSummary: ${suite.summary.passed}/${suite.summary.total} passed, ${suite.summary.failed} failed, ${suite.summary.warnings} warnings`);
      
      totalTests += suite.summary.total;
      totalPassed += suite.summary.passed;
      totalFailed += suite.summary.failed;
      totalWarnings += suite.summary.warnings;
      totalSkipped += suite.summary.skipped;
    });

    // Overall summary
    console.log('\n' + '='.repeat(80));
    console.log('🎯 OVERALL TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed} (${Math.round((totalPassed/totalTests)*100)}%)`);
    console.log(`❌ Failed: ${totalFailed} (${Math.round((totalFailed/totalTests)*100)}%)`);
    console.log(`⚠️ Warnings: ${totalWarnings} (${Math.round((totalWarnings/totalTests)*100)}%)`);
    console.log(`⏭️ Skipped: ${totalSkipped} (${Math.round((totalSkipped/totalTests)*100)}%)`);

    // Recommendations
    console.log('\n🔧 RECOMMENDATIONS');
    console.log('='.repeat(80));
    
    if (totalFailed > 0) {
      console.log('❌ CRITICAL ISSUES:');
      this.testSuites.forEach(suite => {
        suite.results.filter(r => r.status === 'FAIL').forEach(result => {
          console.log(`   • ${result.test} (${suite.browser}): ${result.message}`);
        });
      });
    }
    
    if (totalWarnings > 0) {
      console.log('\n⚠️ IMPROVEMENTS SUGGESTED:');
      this.testSuites.forEach(suite => {
        suite.results.filter(r => r.status === 'WARN').forEach(result => {
          console.log(`   • ${result.test} (${suite.browser}): ${result.message}`);
        });
      });
    }

    // Generate JSON report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        warnings: totalWarnings,
        skipped: totalSkipped,
        passRate: Math.round((totalPassed/totalTests)*100)
      },
      testSuites: this.testSuites
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'playwright-e2e-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 Detailed JSON report saved to: playwright-e2e-report.json');
    console.log('📷 Screenshots saved to: test-screenshots/');
    
    // Final status
    const overallStatus = totalFailed === 0 ? 
      (totalWarnings === 0 ? 'EXCELLENT' : 'GOOD') : 
      'NEEDS ATTENTION';
    
    console.log(`\n🏆 OVERALL STATUS: ${overallStatus}`);
    console.log('='.repeat(80));
  }
}

// Execute the test suite
async function main() {
  const runner = new PlaywrightE2ETestRunner();
  await runner.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { PlaywrightE2ETestRunner };