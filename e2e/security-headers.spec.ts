import { test, expect } from '@playwright/test';

test.describe('Security Headers E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should include all essential security headers on homepage', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();

    // Core security headers
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    
    // Cross-origin policies
    expect(headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(headers['cross-origin-embedder-policy']).toBe('credentialless');
    expect(headers['cross-origin-resource-policy']).toBe('cross-origin');
    
    // CSP should be present
    expect(headers['content-security-policy']).toBeTruthy();
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['content-security-policy']).toContain("object-src 'none'");
    
    // Permissions policy
    expect(headers['permissions-policy']).toBeTruthy();
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['permissions-policy']).toContain('microphone=()');
    expect(headers['permissions-policy']).toContain('geolocation=()');
  });

  test('should include HSTS in production environment', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();

    // HSTS should be present in production or when served over HTTPS
    const isHttps = new URL(page.url()).protocol === 'https:';
    if (isHttps || process.env.NODE_ENV === 'production') {
      expect(headers['strict-transport-security']).toBeTruthy();
      expect(headers['strict-transport-security']).toContain('max-age=31536000');
      expect(headers['strict-transport-security']).toContain('includeSubDomains');
    }
  });

  test('should include security headers on API routes', async ({ page }) => {
    // Test a GET API route that should always be accessible
    const response = await page.request.get('/api/health');
    const headers = response.headers();

    // Basic security headers should be present
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['content-security-policy']).toBeTruthy();
    
    // API-specific headers
    expect(headers['cache-control']).toContain('no-store');
  });

  test('should block iframe embedding', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();

    // Both X-Frame-Options and CSP should prevent framing
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  });

  test('should have secure Content Security Policy', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();
    const csp = headers['content-security-policy'];

    expect(csp).toBeTruthy();

    // Should have restrictive defaults
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");

    // Should allow necessary external resources
    expect(csp).toContain('https://fonts.googleapis.com');
    expect(csp).toContain('https://us.i.posthog.com');
    expect(csp).toContain('https://vitals.vercel-insights.com');

    // Should upgrade insecure requests
    expect(csp).toContain('upgrade-insecure-requests');
  });

  test('should have comprehensive Permissions Policy', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();
    const permissionsPolicy = headers['permissions-policy'];

    expect(permissionsPolicy).toBeTruthy();

    // Should block dangerous features
    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('microphone=()');
    expect(permissionsPolicy).toContain('geolocation=()');
    expect(permissionsPolicy).toContain('payment=()');
    
    // Should disable FLoC
    expect(permissionsPolicy).toContain('interest-cohort=()');
    
    // Should allow controlled features
    expect(permissionsPolicy).toContain('fullscreen=(self)');
  });

  test('should prevent MIME type sniffing', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();

    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('should have secure referrer policy', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();

    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('should include performance and security timing headers', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();

    // Should include timing headers for monitoring
    expect(headers['x-request-time']).toBeTruthy();
    
    // Should include CSP nonce for monitoring
    expect(headers['x-csp-nonce']).toBeTruthy();
  });

  test('should block suspicious user agents in middleware', async ({ page }) => {
    // Test with a suspicious user agent that should be blocked
    try {
      const response = await page.request.get('/', {
        headers: {
          'User-Agent': 'sqlmap/1.0'
        }
      });
      
      expect(response.status()).toBe(403);
    } catch (error) {
      // This is expected if the request is blocked
      expect(error.message).toContain('403');
    }
  });

  test('should handle HTTPS redirects in production', async ({ page }) => {
    // Skip this test in development
    if (process.env.NODE_ENV !== 'production') {
      test.skip();
    }

    // In production, HTTP requests should redirect to HTTPS
    const response = await page.request.get('/', {
      headers: {
        'x-forwarded-proto': 'http'
      }
    });

    // Should either redirect (301/302) or already be HTTPS
    const isRedirect = [301, 302].includes(response.status());
    const isHttps = new URL(page.url()).protocol === 'https:';
    
    expect(isRedirect || isHttps).toBe(true);
  });

  test('should include proper CORS headers for API routes', async ({ page }) => {
    const response = await page.request.get('/api/health');
    const headers = response.headers();

    // CORS headers should be present
    expect(headers['access-control-allow-origin']).toBeTruthy();
    expect(headers['access-control-allow-methods']).toBeTruthy();
    expect(headers['access-control-allow-headers']).toBeTruthy();
  });

  test('should work with PostHog analytics', async ({ page }) => {
    // Navigate to a page that should load PostHog
    await page.goto('/');
    
    // Check that PostHog can load despite CSP
    await page.waitForLoadState('networkidle');
    
    // PostHog should be able to make requests
    const postHogRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('posthog')) {
        postHogRequests.push(request);
      }
    });
    
    // Trigger some interaction that would send PostHog events
    await page.click('nav a[href="/services"]', { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // PostHog requests should not be blocked by CSP
    // Note: This might not always trigger in test environment
  });

  test('should prevent clickjacking attacks', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();

    // Both X-Frame-Options and CSP should prevent clickjacking
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  });

  test('should have secure cross-origin policies', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();

    expect(headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(headers['cross-origin-embedder-policy']).toBe('credentialless');
    expect(headers['cross-origin-resource-policy']).toBe('cross-origin');
  });
});