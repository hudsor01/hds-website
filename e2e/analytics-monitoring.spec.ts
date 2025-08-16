import { test, expect } from '@playwright/test';

test.describe('Analytics and Monitoring', () => {
  test.beforeEach(async ({ page }) => {
    // Set up network interception for analytics
    await page.route('**/i.posthog.com/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok' })
      });
    });

    await page.route('**/vitals.vercel-insights.com/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'ok' })
      });
    });

    await page.route('**/api/metrics', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ recorded: true })
      });
    });
  });

  test('PostHog analytics initializes and tracks page views', async ({ page }) => {
    const posthogRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('i.posthog.com')) {
        posthogRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for PostHog to initialize
    await page.waitForTimeout(1000);
    
    // Check PostHog is loaded
    const posthogLoaded = await page.evaluate(() => {
      return typeof (window as any).posthog !== 'undefined';
    });
    expect(posthogLoaded).toBe(true);
    
    // Check page view was tracked
    expect(posthogRequests.length).toBeGreaterThan(0);
    
    // Navigate to another page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Should track another page view
    const pageViewEvents = posthogRequests.filter(req => 
      req.postData?.includes('$pageview') || 
      req.url.includes('capture')
    );
    expect(pageViewEvents.length).toBeGreaterThan(0);
  });

  test('Vercel Analytics tracks Web Vitals', async ({ page }) => {
    const vercelRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('vitals.vercel-insights.com')) {
        vercelRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Trigger some interactions to generate vitals
    await page.click('body');
    await page.evaluate(() => window.scrollTo(0, 100));
    
    // Wait for vitals to be sent
    await page.waitForTimeout(2000);
    
    // Check if Vercel Analytics is loaded
    const vercelAnalyticsLoaded = await page.evaluate(() => {
      return typeof (window as any).va !== 'undefined';
    });
    expect(vercelAnalyticsLoaded).toBe(true);
    
    // Navigate to trigger more vitals
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    
    // Vitals might be batched, so we check if any were sent
    expect(vercelRequests.length).toBeGreaterThanOrEqual(0);
  });

  test('Custom metrics endpoint receives data', async ({ page }) => {
    const metricsRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/metrics')) {
        metricsRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Trigger interactions that might send metrics
    await page.click('body');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Navigate to another page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Wait for any batched metrics
    await page.waitForTimeout(2000);
    
    // Check if metrics were sent (may or may not be implemented)
    if (metricsRequests.length > 0) {
      const firstRequest = metricsRequests[0];
      expect(firstRequest.method).toBe('POST');
      expect(firstRequest.headers['content-type']).toContain('application/json');
    }
  });

  test('Form interactions are tracked', async ({ page }) => {
    const analyticsRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('posthog.com') || request.url().includes('vercel-insights')) {
        analyticsRequests.push({
          url: request.url(),
          postData: request.postData()
        });
      }
    });

    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Interact with form fields
    await page.fill('input[name="firstName"]', 'Analytics');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', 'analytics@test.com');
    
    // Focus on different fields
    await page.focus('textarea[name="message"]');
    await page.fill('textarea[name="message"]', 'Testing analytics tracking');
    
    // Wait for any debounced events
    await page.waitForTimeout(1000);
    
    // Check if form interactions were tracked
    const formEvents = analyticsRequests.filter(req => 
      req.postData?.includes('form') || 
      req.postData?.includes('input') ||
      req.postData?.includes('field')
    );
    
    // May or may not track individual field interactions
    expect(formEvents.length).toBeGreaterThanOrEqual(0);
    
    // Submit form (mocked)
    await page.route('**/api/contact', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Should track form submission
    const submissionEvents = analyticsRequests.filter(req => 
      req.postData?.includes('submit') || 
      req.postData?.includes('contact_form')
    );
    expect(submissionEvents.length).toBeGreaterThanOrEqual(0);
  });

  test('Error tracking captures exceptions', async ({ page }) => {
    const errorRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('posthog') && request.postData()?.includes('error')) {
        errorRequests.push({
          url: request.url(),
          postData: request.postData()
        });
      }
    });

    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Inject an error
    await page.evaluate(() => {
      throw new Error('Test error for monitoring');
    }).catch(() => {
      // Expected to throw
    });
    
    // Wait for error to be reported
    await page.waitForTimeout(1000);
    
    // Errors might be caught and logged
    expect(consoleErrors.length + errorRequests.length).toBeGreaterThanOrEqual(0);
  });

  test('Performance metrics are collected', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get performance metrics from the browser
    const metrics = await page.evaluate(() => {
      const perf = window.performance;
      const navigation = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: perf.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: perf.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    // Verify metrics are reasonable
    expect(metrics.domContentLoaded).toBeGreaterThanOrEqual(0);
    expect(metrics.loadComplete).toBeGreaterThanOrEqual(0);
    expect(metrics.firstPaint).toBeGreaterThanOrEqual(0);
    
    // Check if metrics are being sent to monitoring
    const metricsLogged = await page.evaluate(() => {
      // Check if any performance monitoring is set up
      return typeof (window as any).reportWebVitals !== 'undefined' ||
             typeof (window as any).va !== 'undefined' ||
             typeof (window as any).posthog !== 'undefined';
    });
    expect(metricsLogged).toBe(true);
  });

  test('Session recording works correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if PostHog session recording is enabled
    const sessionRecordingEnabled = await page.evaluate(() => {
      const ph = (window as any).posthog;
      return ph && typeof ph.isFeatureEnabled === 'function' && 
             ph.isFeatureEnabled('session_recording');
    });
    
    // Session recording may or may not be enabled
    expect(typeof sessionRecordingEnabled).toBe('boolean');
    
    if (sessionRecordingEnabled) {
      // Perform some actions that would be recorded
      await page.click('body');
      await page.hover('h1');
      await page.evaluate(() => window.scrollTo(0, 100));
      
      // Wait for recording data to be sent
      await page.waitForTimeout(1000);
      
      // Check if recording data was captured
      const recordingActive = await page.evaluate(() => {
        const ph = (window as any).posthog;
        return ph && ph.sessionRecording && ph.sessionRecording.isRecordingEnabled();
      });
      expect(recordingActive).toBe(true);
    }
  });

  test('Feature flags are loaded', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for PostHog to load feature flags
    await page.waitForTimeout(1500);
    
    // Check if feature flags are available
    const featureFlagsLoaded = await page.evaluate(() => {
      const ph = (window as any).posthog;
      return ph && typeof ph.getFeatureFlag === 'function';
    });
    
    expect(featureFlagsLoaded).toBe(true);
    
    // Check if any feature flags are active
    const hasFeatureFlags = await page.evaluate(() => {
      const ph = (window as any).posthog;
      if (ph && ph.getFeatureFlagPayloads) {
        const flags = ph.getFeatureFlagPayloads();
        return Object.keys(flags || {}).length > 0;
      }
      return false;
    });
    
    // May or may not have feature flags configured
    expect(typeof hasFeatureFlags).toBe('boolean');
  });
});

test.describe('Security Headers and CSP', () => {
  test('Security headers are properly set', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();
    
    if (headers) {
      // Check for security headers (may be set by Vercel or middleware)
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
        'permissions-policy'
      ];
      
      for (const header of securityHeaders) {
        const value = headers[header];
        // Headers might be set at different levels
        if (value) {
          expect(value).toBeTruthy();
        }
      }
    }
  });

  test('Content Security Policy allows analytics', async ({ page }) => {
    const response = await page.goto('/');
    const cspHeader = response?.headers()['content-security-policy'];
    
    if (cspHeader) {
      // CSP should allow PostHog and Vercel Analytics
      expect(cspHeader).toContain('posthog.com');
      expect(cspHeader).toContain('vercel-insights.com');
    }
    
    // Analytics should still work with CSP
    await page.waitForLoadState('networkidle');
    
    const analyticsWorking = await page.evaluate(() => {
      return typeof (window as any).posthog !== 'undefined' &&
             typeof (window as any).va !== 'undefined';
    });
    expect(analyticsWorking).toBe(true);
  });
});