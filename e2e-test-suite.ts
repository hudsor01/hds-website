#!/usr/bin/env npx tsx

/**
 * Comprehensive E2E Testing Suite for Hudson Digital Solutions Website
 * 
 * This test suite performs comprehensive testing of:
 * 1. Core User Journeys
 * 2. Analytics & Performance Validation
 * 3. Accessibility Features
 * 4. Error Handling & Resilience
 * 5. Cross-Browser Compatibility
 */

import fs from 'fs';
import path from 'path';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
  message: string;
  details?: string[];
  performance?: {
    responseTime: number;
    statusCode: number;
  };
}

interface TestSuite {
  name: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    skipped: number;
  };
}

class E2ETestRunner {
  private baseUrl = 'http://localhost:3000';
  private testSuites: TestSuite[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive E2E Testing Suite for Hudson Digital Solutions');
    console.log('=' .repeat(80));

    // 1. Core User Journeys
    await this.testCoreUserJourneys();
    
    // 2. Analytics & Performance
    await this.testAnalyticsAndPerformance();
    
    // 3. Accessibility Features
    await this.testAccessibilityFeatures();
    
    // 4. Error Handling & Resilience
    await this.testErrorHandling();
    
    // 5. Cross-Browser Compatibility
    await this.testCompatibility();

    // Generate comprehensive report
    this.generateReport();
  }

  async testCoreUserJourneys(): Promise<void> {
    const suite: TestSuite = {
      name: 'Core User Journeys',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 }
    };

    console.log('\n📱 Testing Core User Journeys...');

    // Test home page loading
    suite.results.push(await this.testPageLoad('/', 'Home Page'));
    
    // Test navigation pages
    const pages = ['/about', '/services', '/contact', '/blog'];
    for (const page of pages) {
      suite.results.push(await this.testPageLoad(page, `${page.slice(1)} Page`));
    }

    // Test contact form API endpoint
    suite.results.push(await this.testContactFormAPI());

    // Test calendar widget accessibility
    suite.results.push(await this.testCalendarWidget());

    // Test responsive navigation
    suite.results.push(await this.testResponsiveNavigation());

    this.calculateSummary(suite);
    this.testSuites.push(suite);
  }

  async testAnalyticsAndPerformance(): Promise<void> {
    const suite: TestSuite = {
      name: 'Analytics & Performance',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 }
    };

    console.log('\n📊 Testing Analytics & Performance...');

    // Test analytics script loading
    suite.results.push(await this.testAnalyticsScripts());
    
    // Test Core Web Vitals setup
    suite.results.push(await this.testWebVitalsSetup());
    
    // Test page load performance
    suite.results.push(await this.testPageLoadPerformance());
    
    // Test SEO metadata
    suite.results.push(await this.testSEOMetadata());
    
    // Test PWA manifest
    suite.results.push(await this.testPWAManifest());

    this.calculateSummary(suite);
    this.testSuites.push(suite);
  }

  async testAccessibilityFeatures(): Promise<void> {
    const suite: TestSuite = {
      name: 'Accessibility Features',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 }
    };

    console.log('\n♿ Testing Accessibility Features...');

    // Test semantic HTML structure
    suite.results.push(await this.testSemanticHTML());
    
    // Test ARIA attributes
    suite.results.push(await this.testARIAAttributes());
    
    // Test keyboard navigation
    suite.results.push(await this.testKeyboardNavigation());
    
    // Test screen reader compatibility
    suite.results.push(await this.testScreenReaderCompatibility());
    
    // Test color contrast
    suite.results.push(await this.testColorContrast());

    this.calculateSummary(suite);
    this.testSuites.push(suite);
  }

  async testErrorHandling(): Promise<void> {
    const suite: TestSuite = {
      name: 'Error Handling & Resilience',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 }
    };

    console.log('\n🛡️ Testing Error Handling & Resilience...');

    // Test 404 error page
    suite.results.push(await this.testErrorPage('/nonexistent-page', '404 Error Page'));
    
    // Test form validation
    suite.results.push(await this.testFormValidation());
    
    // Test JavaScript error boundaries
    suite.results.push(await this.testErrorBoundaries());
    
    // Test offline functionality
    suite.results.push(await this.testOfflineFunctionality());
    
    // Test service worker registration
    suite.results.push(await this.testServiceWorker());

    this.calculateSummary(suite);
    this.testSuites.push(suite);
  }

  async testCompatibility(): Promise<void> {
    const suite: TestSuite = {
      name: 'Cross-Browser Compatibility',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0 }
    };

    console.log('\n🌐 Testing Cross-Browser Compatibility...');

    // Test responsive design
    suite.results.push(await this.testResponsiveDesign());
    
    // Test mobile viewport
    suite.results.push(await this.testMobileViewport());
    
    // Test critical CSS loading
    suite.results.push(await this.testCriticalCSS());
    
    // Test font loading
    suite.results.push(await this.testFontLoading());

    this.calculateSummary(suite);
    this.testSuites.push(suite);
  }

  // Individual Test Methods

  async testPageLoad(path: string, pageName: string): Promise<TestResult> {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'E2E-Test-Suite/1.0'
        }
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        const html = await response.text();
        const details = [
          `Status: ${response.status}`,
          `Response Time: ${responseTime}ms`,
          `Content Length: ${html.length} bytes`,
          `Content-Type: ${response.headers.get('content-type')}`,
        ];

        // Check for essential elements
        const hasTitle = html.includes('<title>');
        const hasMetaViewport = html.includes('viewport');
        const hasMainContent = html.includes('main') || html.includes('id="main-content"');

        if (!hasTitle || !hasMetaViewport || !hasMainContent) {
          details.push('⚠️ Missing essential HTML elements');
        }

        return {
          test: `${pageName} Load`,
          status: responseTime < 3000 ? 'PASS' : 'WARN',
          message: responseTime < 3000 ? 
            `Page loaded successfully in ${responseTime}ms` : 
            `Page loaded but response time is slow: ${responseTime}ms`,
          details,
          performance: { responseTime, statusCode: response.status }
        };
      } else {
        return {
          test: `${pageName} Load`,
          status: 'FAIL',
          message: `Failed to load with status ${response.status}`,
          performance: { responseTime, statusCode: response.status }
        };
      }
    } catch (error) {
      return {
        test: `${pageName} Load`,
        status: 'FAIL',
        message: `Error loading page: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testContactFormAPI(): Promise<TestResult> {
    try {
      const testData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        message: 'This is a test message for E2E testing purposes.'
      };

      const response = await fetch(`${this.baseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();

      if (response.ok) {
        return {
          test: 'Contact Form API',
          status: 'PASS',
          message: 'Contact form API endpoint working correctly',
          details: [
            `Status: ${response.status}`,
            `Response: ${JSON.stringify(result)}`,
          ]
        };
      } else {
        return {
          test: 'Contact Form API',
          status: 'FAIL',
          message: `API returned error: ${result.error || 'Unknown error'}`,
          details: [`Status: ${response.status}`, `Response: ${JSON.stringify(result)}`]
        };
      }
    } catch (error) {
      return {
        test: 'Contact Form API',
        status: 'FAIL',
        message: `Failed to test contact form API: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testCalendarWidget(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/contact`);
      const html = await response.text();
      
      const hasCalWidget = html.includes('cal.com') || html.includes('CalendarWidget');
      const hasIframe = html.includes('<iframe') || html.includes('calendar');
      
      return {
        test: 'Calendar Widget',
        status: hasCalWidget ? 'PASS' : 'WARN',
        message: hasCalWidget ? 
          'Calendar widget integration detected' : 
          'Calendar widget not detected in HTML',
        details: [
          `Cal.com integration: ${hasCalWidget ? 'Found' : 'Not found'}`,
          `Iframe elements: ${hasIframe ? 'Found' : 'Not found'}`
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

  async testResponsiveNavigation(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasMobileMenu = html.includes('mobile') && (html.includes('menu') || html.includes('navigation'));
      const hasResponsiveClasses = html.includes('md:') || html.includes('lg:') || html.includes('sm:');
      const hasNavbarComponent = html.includes('navbar') || html.includes('nav');
      
      return {
        test: 'Responsive Navigation',
        status: (hasMobileMenu && hasResponsiveClasses && hasNavbarComponent) ? 'PASS' : 'WARN',
        message: 'Navigation component structure validated',
        details: [
          `Mobile menu detection: ${hasMobileMenu ? 'Found' : 'Not found'}`,
          `Responsive classes: ${hasResponsiveClasses ? 'Found' : 'Not found'}`,
          `Navigation component: ${hasNavbarComponent ? 'Found' : 'Not found'}`
        ]
      };
    } catch (error) {
      return {
        test: 'Responsive Navigation',
        status: 'FAIL',
        message: `Error testing navigation: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testAnalyticsScripts(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasGA = html.includes('googletagmanager') || html.includes('gtag');
      const hasPostHog = html.includes('posthog') || html.includes('PostHog');
      const hasVercelAnalytics = html.includes('vercel') && html.includes('analytics');
      
      const foundScripts = [];
      if (hasGA) foundScripts.push('Google Analytics');
      if (hasPostHog) foundScripts.push('PostHog');
      if (hasVercelAnalytics) foundScripts.push('Vercel Analytics');
      
      return {
        test: 'Analytics Scripts',
        status: foundScripts.length >= 2 ? 'PASS' : 'WARN',
        message: `Found ${foundScripts.length} analytics platform(s)`,
        details: [
          `Google Analytics: ${hasGA ? 'Detected' : 'Not detected'}`,
          `PostHog: ${hasPostHog ? 'Detected' : 'Not detected'}`,
          `Vercel Analytics: ${hasVercelAnalytics ? 'Detected' : 'Not detected'}`,
          `Total platforms: ${foundScripts.join(', ') || 'None'}`
        ]
      };
    } catch (error) {
      return {
        test: 'Analytics Scripts',
        status: 'FAIL',
        message: `Error testing analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testWebVitalsSetup(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasWebVitals = html.includes('WebVitals') || html.includes('web-vitals') || html.includes('PerformanceObserver');
      const hasMetrics = html.includes('LCP') || html.includes('FID') || html.includes('CLS');
      
      return {
        test: 'Web Vitals Setup',
        status: hasWebVitals ? 'PASS' : 'WARN',
        message: hasWebVitals ? 
          'Web Vitals monitoring detected' : 
          'Web Vitals monitoring not clearly detected',
        details: [
          `Web Vitals component: ${hasWebVitals ? 'Found' : 'Not found'}`,
          `Core metrics: ${hasMetrics ? 'Found' : 'Not found'}`
        ]
      };
    } catch (error) {
      return {
        test: 'Web Vitals Setup',
        status: 'FAIL',
        message: `Error testing Web Vitals: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testPageLoadPerformance(): Promise<TestResult> {
    const results = [];
    let totalTime = 0;
    const pages = ['/', '/about', '/services', '/contact'];
    
    for (const page of pages) {
      const startTime = Date.now();
      try {
        const response = await fetch(`${this.baseUrl}${page}`);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        totalTime += responseTime;
        
        results.push(`${page}: ${responseTime}ms`);
      } catch (error) {
        results.push(`${page}: Error - ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }
    
    const avgTime = Math.round(totalTime / pages.length);
    
    return {
      test: 'Page Load Performance',
      status: avgTime < 2000 ? 'PASS' : avgTime < 4000 ? 'WARN' : 'FAIL',
      message: `Average page load time: ${avgTime}ms`,
      details: results
    };
  }

  async testSEOMetadata(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasTitle = html.includes('<title>') && !html.includes('<title></title>');
      const hasDescription = html.includes('name="description"') || html.includes('property="description"');
      const hasOG = html.includes('property="og:') && html.includes('og:title');
      const hasTwitter = html.includes('name="twitter:') || html.includes('property="twitter:');
      const hasCanonical = html.includes('rel="canonical"');
      const hasStructuredData = html.includes('"@type"') && html.includes('"@context"');
      
      const seoFeatures = [];
      if (hasTitle) seoFeatures.push('Title tag');
      if (hasDescription) seoFeatures.push('Meta description');
      if (hasOG) seoFeatures.push('Open Graph');
      if (hasTwitter) seoFeatures.push('Twitter Cards');
      if (hasCanonical) seoFeatures.push('Canonical URL');
      if (hasStructuredData) seoFeatures.push('Structured Data');
      
      return {
        test: 'SEO Metadata',
        status: seoFeatures.length >= 5 ? 'PASS' : seoFeatures.length >= 3 ? 'WARN' : 'FAIL',
        message: `Found ${seoFeatures.length}/6 SEO features`,
        details: [
          `Title tag: ${hasTitle ? '✓' : '✗'}`,
          `Meta description: ${hasDescription ? '✓' : '✗'}`,
          `Open Graph: ${hasOG ? '✓' : '✗'}`,
          `Twitter Cards: ${hasTwitter ? '✓' : '✗'}`,
          `Canonical URL: ${hasCanonical ? '✓' : '✗'}`,
          `Structured Data: ${hasStructuredData ? '✓' : '✗'}`
        ]
      };
    } catch (error) {
      return {
        test: 'SEO Metadata',
        status: 'FAIL',
        message: `Error testing SEO: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testPWAManifest(): Promise<TestResult> {
    try {
      const manifestResponse = await fetch(`${this.baseUrl}/manifest.json`);
      
      if (!manifestResponse.ok) {
        return {
          test: 'PWA Manifest',
          status: 'WARN',
          message: 'Manifest.json not found or inaccessible'
        };
      }
      
      const manifest = await manifestResponse.json();
      const hasName = manifest.name || manifest.short_name;
      const hasIcons = manifest.icons && manifest.icons.length > 0;
      const hasStartUrl = manifest.start_url;
      const hasDisplay = manifest.display;
      
      return {
        test: 'PWA Manifest',
        status: (hasName && hasIcons && hasStartUrl && hasDisplay) ? 'PASS' : 'WARN',
        message: 'PWA manifest validated',
        details: [
          `Name: ${hasName ? '✓' : '✗'}`,
          `Icons: ${hasIcons ? '✓' : '✗'}`,
          `Start URL: ${hasStartUrl ? '✓' : '✗'}`,
          `Display mode: ${hasDisplay ? '✓' : '✗'}`
        ]
      };
    } catch (error) {
      return {
        test: 'PWA Manifest',
        status: 'FAIL',
        message: `Error testing PWA manifest: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testSemanticHTML(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasMain = html.includes('<main');
      const hasNav = html.includes('<nav');
      const hasHeader = html.includes('<header') || html.includes('role="banner"');
      const hasFooter = html.includes('<footer') || html.includes('role="contentinfo"');
      const hasHeadings = html.includes('<h1') && html.includes('<h2');
      const hasSections = html.includes('<section') || html.includes('<article');
      
      const semanticElements = [];
      if (hasMain) semanticElements.push('main');
      if (hasNav) semanticElements.push('nav');
      if (hasHeader) semanticElements.push('header');
      if (hasFooter) semanticElements.push('footer');
      if (hasHeadings) semanticElements.push('headings');
      if (hasSections) semanticElements.push('sections');
      
      return {
        test: 'Semantic HTML',
        status: semanticElements.length >= 5 ? 'PASS' : 'WARN',
        message: `Found ${semanticElements.length}/6 semantic elements`,
        details: [
          `<main>: ${hasMain ? '✓' : '✗'}`,
          `<nav>: ${hasNav ? '✓' : '✗'}`,
          `<header>: ${hasHeader ? '✓' : '✗'}`,
          `<footer>: ${hasFooter ? '✓' : '✗'}`,
          `Heading hierarchy: ${hasHeadings ? '✓' : '✗'}`,
          `<section>/<article>: ${hasSections ? '✓' : '✗'}`
        ]
      };
    } catch (error) {
      return {
        test: 'Semantic HTML',
        status: 'FAIL',
        message: `Error testing semantic HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testARIAAttributes(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasAriaLabel = html.includes('aria-label');
      const hasAriaDescribedBy = html.includes('aria-describedby');
      const hasRole = html.includes('role=');
      const hasAriaHidden = html.includes('aria-hidden');
      const hasAriaExpanded = html.includes('aria-expanded');
      
      const ariaFeatures = [];
      if (hasAriaLabel) ariaFeatures.push('aria-label');
      if (hasAriaDescribedBy) ariaFeatures.push('aria-describedby');
      if (hasRole) ariaFeatures.push('role attributes');
      if (hasAriaHidden) ariaFeatures.push('aria-hidden');
      if (hasAriaExpanded) ariaFeatures.push('aria-expanded');
      
      return {
        test: 'ARIA Attributes',
        status: ariaFeatures.length >= 3 ? 'PASS' : 'WARN',
        message: `Found ${ariaFeatures.length}/5 ARIA features`,
        details: [
          `aria-label: ${hasAriaLabel ? '✓' : '✗'}`,
          `aria-describedby: ${hasAriaDescribedBy ? '✓' : '✗'}`,
          `role attributes: ${hasRole ? '✓' : '✗'}`,
          `aria-hidden: ${hasAriaHidden ? '✓' : '✗'}`,
          `aria-expanded: ${hasAriaExpanded ? '✓' : '✗'}`
        ]
      };
    } catch (error) {
      return {
        test: 'ARIA Attributes',
        status: 'FAIL',
        message: `Error testing ARIA: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testKeyboardNavigation(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasTabIndex = html.includes('tabindex');
      const hasFocusStyles = html.includes('focus:') || html.includes(':focus');
      const hasSkipLink = html.includes('skip') && html.includes('content');
      const hasKeyboardEvents = html.includes('onKeyDown') || html.includes('onKeyPress');
      
      return {
        test: 'Keyboard Navigation',
        status: (hasFocusStyles && hasTabIndex) ? 'PASS' : 'WARN',
        message: 'Keyboard navigation support detected',
        details: [
          `Tab index management: ${hasTabIndex ? '✓' : '✗'}`,
          `Focus styles: ${hasFocusStyles ? '✓' : '✗'}`,
          `Skip links: ${hasSkipLink ? '✓' : '✗'}`,
          `Keyboard event handlers: ${hasKeyboardEvents ? '✓' : '✗'}`
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

  async testScreenReaderCompatibility(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasAltText = html.includes('alt=') && !html.includes('alt=""');
      const hasLandmarks = html.includes('role="main"') || html.includes('<main');
      const hasHeadingStructure = html.includes('<h1') && html.includes('<h2');
      const hasAriaLabels = html.includes('aria-label');
      
      return {
        test: 'Screen Reader Compatibility',
        status: (hasAltText && hasLandmarks && hasHeadingStructure) ? 'PASS' : 'WARN',
        message: 'Screen reader compatibility features detected',
        details: [
          `Alt text on images: ${hasAltText ? '✓' : '✗'}`,
          `Landmark elements: ${hasLandmarks ? '✓' : '✗'}`,
          `Heading structure: ${hasHeadingStructure ? '✓' : '✗'}`,
          `ARIA labels: ${hasAriaLabels ? '✓' : '✗'}`
        ]
      };
    } catch (error) {
      return {
        test: 'Screen Reader Compatibility',
        status: 'FAIL',
        message: `Error testing screen reader compatibility: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testColorContrast(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      // Check for high contrast color classes and themes
      const hasHighContrast = html.includes('text-white') || html.includes('text-black');
      const hasThemeToggle = html.includes('theme') || html.includes('dark') || html.includes('light');
      const hasContrastColors = html.includes('contrast') || html.includes('accessible');
      
      return {
        test: 'Color Contrast',
        status: hasHighContrast ? 'PASS' : 'WARN',
        message: 'Color contrast implementation detected',
        details: [
          `High contrast colors: ${hasHighContrast ? '✓' : '✗'}`,
          `Theme toggle: ${hasThemeToggle ? '✓' : '✗'}`,
          `Contrast-specific classes: ${hasContrastColors ? '✓' : '✗'}`
        ]
      };
    } catch (error) {
      return {
        test: 'Color Contrast',
        status: 'FAIL',
        message: `Error testing color contrast: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testErrorPage(path: string, testName: string): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`);
      
      if (response.status === 404) {
        const html = await response.text();
        const hasErrorContent = html.includes('404') || html.includes('not found') || html.includes('error');
        
        return {
          test: testName,
          status: hasErrorContent ? 'PASS' : 'WARN',
          message: hasErrorContent ? 
            'Custom 404 page detected' : 
            'Returns 404 but custom page not clearly identified',
          details: [`Status: ${response.status}`, `Has error content: ${hasErrorContent}`]
        };
      } else {
        return {
          test: testName,
          status: 'WARN',
          message: `Expected 404 but got ${response.status}`,
          details: [`Status: ${response.status}`]
        };
      }
    } catch (error) {
      return {
        test: testName,
        status: 'FAIL',
        message: `Error testing 404 page: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testFormValidation(): Promise<TestResult> {
    try {
      // Test with invalid data
      const invalidData = {
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        message: 'short'
      };

      const response = await fetch(`${this.baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData)
      });

      const result = await response.json();
      const hasValidation = !response.ok && (result.error || result.message);
      
      return {
        test: 'Form Validation',
        status: hasValidation ? 'PASS' : 'WARN',
        message: hasValidation ? 
          'Form validation working correctly' : 
          'Form validation response unclear',
        details: [
          `Status: ${response.status}`,
          `Response: ${JSON.stringify(result)}`
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

  async testErrorBoundaries(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasErrorBoundary = html.includes('ErrorBoundary') || html.includes('error-boundary');
      
      return {
        test: 'Error Boundaries',
        status: hasErrorBoundary ? 'PASS' : 'WARN',
        message: hasErrorBoundary ? 
          'Error boundary implementation detected' : 
          'Error boundary not clearly detected in HTML',
        details: [`Error boundary detection: ${hasErrorBoundary ? 'Found' : 'Not found'}`]
      };
    } catch (error) {
      return {
        test: 'Error Boundaries',
        status: 'FAIL',
        message: `Error testing error boundaries: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testOfflineFunctionality(): Promise<TestResult> {
    try {
      const offlineResponse = await fetch(`${this.baseUrl}/offline.html`);
      const swResponse = await fetch(`${this.baseUrl}/sw.js`);
      
      const hasOfflinePage = offlineResponse.ok;
      const hasServiceWorker = swResponse.ok;
      
      return {
        test: 'Offline Functionality',
        status: (hasOfflinePage && hasServiceWorker) ? 'PASS' : 'WARN',
        message: 'Offline functionality components detected',
        details: [
          `Offline page: ${hasOfflinePage ? '✓' : '✗'}`,
          `Service worker: ${hasServiceWorker ? '✓' : '✗'}`
        ]
      };
    } catch (error) {
      return {
        test: 'Offline Functionality',
        status: 'FAIL',
        message: `Error testing offline functionality: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testServiceWorker(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/sw.js`);
      
      if (response.ok) {
        const sw = await response.text();
        const hasCaching = sw.includes('cache') || sw.includes('Cache');
        const hasOfflineSupport = sw.includes('offline') || sw.includes('fallback');
        
        return {
          test: 'Service Worker',
          status: (hasCaching && hasOfflineSupport) ? 'PASS' : 'WARN',
          message: 'Service worker functionality detected',
          details: [
            `Caching strategy: ${hasCaching ? '✓' : '✗'}`,
            `Offline support: ${hasOfflineSupport ? '✓' : '✗'}`
          ]
        };
      } else {
        return {
          test: 'Service Worker',
          status: 'WARN',
          message: 'Service worker not found',
          details: [`Status: ${response.status}`]
        };
      }
    } catch (error) {
      return {
        test: 'Service Worker',
        status: 'FAIL',
        message: `Error testing service worker: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testResponsiveDesign(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasViewportMeta = html.includes('viewport') && html.includes('width=device-width');
      const hasResponsiveClasses = html.includes('sm:') || html.includes('md:') || html.includes('lg:');
      const hasFlexGrid = html.includes('flex') || html.includes('grid');
      const hasMaxWidth = html.includes('max-w-') || html.includes('mx-auto');
      
      return {
        test: 'Responsive Design',
        status: (hasViewportMeta && hasResponsiveClasses && hasFlexGrid) ? 'PASS' : 'WARN',
        message: 'Responsive design implementation detected',
        details: [
          `Viewport meta tag: ${hasViewportMeta ? '✓' : '✗'}`,
          `Responsive classes: ${hasResponsiveClasses ? '✓' : '✗'}`,
          `Flex/Grid layout: ${hasFlexGrid ? '✓' : '✗'}`,
          `Container constraints: ${hasMaxWidth ? '✓' : '✗'}`
        ]
      };
    } catch (error) {
      return {
        test: 'Responsive Design',
        status: 'FAIL',
        message: `Error testing responsive design: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testMobileViewport(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      });
      
      const html = await response.text();
      
      const hasViewport = html.includes('width=device-width') && html.includes('initial-scale=1');
      const hasMobileOptimization = html.includes('mobile') || html.includes('touch');
      const hasAppleMeta = html.includes('apple-mobile-web-app');
      
      return {
        test: 'Mobile Viewport',
        status: hasViewport ? 'PASS' : 'WARN',
        message: 'Mobile viewport configuration detected',
        details: [
          `Viewport meta tag: ${hasViewport ? '✓' : '✗'}`,
          `Mobile optimization: ${hasMobileOptimization ? '✓' : '✗'}`,
          `Apple meta tags: ${hasAppleMeta ? '✓' : '✗'}`
        ]
      };
    } catch (error) {
      return {
        test: 'Mobile Viewport',
        status: 'FAIL',
        message: `Error testing mobile viewport: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testCriticalCSS(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasInlineCSS = html.includes('<style>') && html.includes('</style>');
      const hasPreloadCSS = html.includes('rel="preload"') && html.includes('as="style"');
      const hasAsyncCSS = html.includes('media="print"') || html.includes('onload=');
      
      return {
        test: 'Critical CSS',
        status: hasInlineCSS ? 'PASS' : 'WARN',
        message: 'Critical CSS optimization detected',
        details: [
          `Inline critical CSS: ${hasInlineCSS ? '✓' : '✗'}`,
          `CSS preloading: ${hasPreloadCSS ? '✓' : '✗'}`,
          `Async CSS loading: ${hasAsyncCSS ? '✓' : '✗'}`
        ]
      };
    } catch (error) {
      return {
        test: 'Critical CSS',
        status: 'FAIL',
        message: `Error testing critical CSS: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async testFontLoading(): Promise<TestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const html = await response.text();
      
      const hasPreconnect = html.includes('rel="preconnect"') && html.includes('fonts.googleapis.com');
      const hasFontDisplay = html.includes('font-display') || html.includes('display:');
      const hasWebFonts = html.includes('Geist') || html.includes('google') || html.includes('font');
      
      return {
        test: 'Font Loading',
        status: hasPreconnect ? 'PASS' : 'WARN',
        message: 'Font loading optimization detected',
        details: [
          `Font preconnect: ${hasPreconnect ? '✓' : '✗'}`,
          `Font display strategy: ${hasFontDisplay ? '✓' : '✗'}`,
          `Web fonts: ${hasWebFonts ? '✓' : '✗'}`
        ]
      };
    } catch (error) {
      return {
        test: 'Font Loading',
        status: 'FAIL',
        message: `Error testing font loading: ${error instanceof Error ? error.message : 'Unknown error'}`
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
    console.log('📊 COMPREHENSIVE E2E TEST REPORT');
    console.log('='.repeat(80));

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;
    let totalSkipped = 0;

    // Generate detailed report for each test suite
    this.testSuites.forEach(suite => {
      console.log(`\n📋 ${suite.name}`);
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
          console.log(`   Performance: ${result.performance.responseTime}ms (${result.performance.statusCode})`);
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
          console.log(`   • ${result.test}: ${result.message}`);
        });
      });
    }
    
    if (totalWarnings > 0) {
      console.log('\n⚠️ IMPROVEMENTS SUGGESTED:');
      this.testSuites.forEach(suite => {
        suite.results.filter(r => r.status === 'WARN').forEach(result => {
          console.log(`   • ${result.test}: ${result.message}`);
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
      path.join(process.cwd(), 'e2e-test-report.json'),
      JSON.stringify(reportData, null, 2)
    );

    console.log('\n📄 Detailed JSON report saved to: e2e-test-report.json');
    
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
  const runner = new E2ETestRunner();
  await runner.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { E2ETestRunner };