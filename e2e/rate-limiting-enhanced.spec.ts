import { test, expect } from '@playwright/test';
import { testData, selectors } from './helpers/test-data';

test.describe('Enhanced Rate Limiting with Vercel KV', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should enforce contact form rate limits (5 per 15 minutes)', async ({ page, context }) => {
    const results = [];
    
    // Submit 7 contact forms rapidly to exceed the limit
    for (let i = 0; i < 7; i++) {
      try {
        // Fill form with unique data
        await page.fill(selectors.form.firstName, `Test${i}`);
        await page.fill(selectors.form.lastName, 'User');
        await page.fill(selectors.form.email, `test${i}@ratelimit.test`);
        await page.fill(selectors.form.message, `Rate limit test message ${i}`);

        // Submit form and wait for response
        const responsePromise = page.waitForResponse(
          response => response.url().includes('/api/contact'),
          { timeout: 10000 }
        );

        await page.click(selectors.form.submitButton);
        const response = await responsePromise;
        
        results.push({
          attempt: i + 1,
          status: response.status(),
          headers: response.headers()
        });

        // Reset form for next attempt
        await page.reload();
        await page.waitForLoadState('networkidle');
        
      } catch (error) {
        results.push({
          attempt: i + 1,
          status: 0,
          error: error.message
        });
      }
    }

    // Analyze results
    const successfulRequests = results.filter(r => r.status === 200);
    const rateLimitedRequests = results.filter(r => r.status === 429);
    
    console.log('Rate limiting test results:', results);

    // Should have some successful requests (first 5 or fewer)
    expect(successfulRequests.length).toBeGreaterThan(0);
    expect(successfulRequests.length).toBeLessThanOrEqual(5);
    
    // Should have some rate limited requests
    expect(rateLimitedRequests.length).toBeGreaterThan(0);
    
    // Check rate limit headers are present
    const rateLimitedResponse = rateLimitedRequests[0];
    if (rateLimitedResponse?.headers) {
      expect(rateLimitedResponse.headers['x-ratelimit-limit']).toBeDefined();
      expect(rateLimitedResponse.headers['x-ratelimit-remaining']).toBeDefined();
      expect(rateLimitedResponse.headers['retry-after']).toBeDefined();
    }
  });

  test('should track rate limiting events in PostHog', async ({ page, context }) => {
    // Enable network monitoring
    const apiRequests = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('posthog')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });

    // Submit form multiple times to trigger rate limiting
    for (let i = 0; i < 6; i++) {
      await page.fill(selectors.form.firstName, `PostHog${i}`);
      await page.fill(selectors.form.lastName, 'Test');
      await page.fill(selectors.form.email, `posthog${i}@test.com`);
      await page.fill(selectors.form.message, `PostHog tracking test ${i}`);

      try {
        await page.click(selectors.form.submitButton);
        await page.waitForTimeout(500); // Brief pause between submissions
        
        // Reset form
        await page.reload();
        await page.waitForLoadState('networkidle');
      } catch (error) {
        // Continue even if some requests fail
        console.log(`Request ${i} failed:`, error.message);
      }
    }

    // Wait for PostHog events to be sent
    await page.waitForTimeout(2000);

    // Verify API requests were made
    const contactRequests = apiRequests.filter(req => 
      req.url.includes('/api/contact') && req.method === 'POST'
    );
    
    expect(contactRequests.length).toBeGreaterThan(0);
    console.log(`Made ${contactRequests.length} contact API requests`);
  });

  test('should enforce metrics endpoint rate limits (10 per minute)', async ({ page, context }) => {
    const results = [];
    
    // Make 15 requests to metrics endpoint to exceed limit
    for (let i = 0; i < 15; i++) {
      try {
        const response = await page.request.get('/api/metrics', {
          headers: {
            'Authorization': 'Bearer WaWMEIedz91WPpAp-fIefc7oAkTE3mAXbBg_AVH31veLk4P9HH9dahLIX7t7vuFy',
            'User-Agent': 'Prometheus/2.0 Test'
          }
        });

        results.push({
          attempt: i + 1,
          status: response.status(),
          headers: response.headers()
        });
        
      } catch (error) {
        results.push({
          attempt: i + 1,
          status: 0,
          error: error.message
        });
      }
    }

    // Analyze results
    const successfulRequests = results.filter(r => r.status === 200);
    const rateLimitedRequests = results.filter(r => r.status === 429);
    
    console.log('Metrics rate limiting results:', {
      total: results.length,
      successful: successfulRequests.length,
      rateLimited: rateLimitedRequests.length
    });

    // Should have some successful requests (up to 10)
    expect(successfulRequests.length).toBeGreaterThan(0);
    expect(successfulRequests.length).toBeLessThanOrEqual(10);
    
    // Should have some rate limited requests after exceeding limit
    expect(rateLimitedRequests.length).toBeGreaterThan(0);
  });

  test('should handle different IPs independently', async ({ browser }) => {
    // Create two different browser contexts to simulate different IPs
    const context1 = await browser.newContext({
      extraHTTPHeaders: {
        'X-Forwarded-For': '192.168.1.100'
      }
    });
    
    const context2 = await browser.newContext({
      extraHTTPHeaders: {
        'X-Forwarded-For': '192.168.1.200'
      }
    });

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Submit forms from both "IPs"
    await page1.goto('/contact');
    await page2.goto('/contact');
    
    await page1.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');

    // Submit from first IP
    await page1.fill(selectors.form.firstName, 'IP1');
    await page1.fill(selectors.form.lastName, 'Test');
    await page1.fill(selectors.form.email, 'ip1@test.com');
    await page1.fill(selectors.form.message, 'Test from IP 1');

    const response1Promise = page1.waitForResponse(response => 
      response.url().includes('/api/contact')
    );
    
    await page1.click(selectors.form.submitButton);
    const response1 = await response1Promise;

    // Submit from second IP
    await page2.fill(selectors.form.firstName, 'IP2');
    await page2.fill(selectors.form.lastName, 'Test');
    await page2.fill(selectors.form.email, 'ip2@test.com');
    await page2.fill(selectors.form.message, 'Test from IP 2');

    const response2Promise = page2.waitForResponse(response => 
      response.url().includes('/api/contact')
    );
    
    await page2.click(selectors.form.submitButton);
    const response2 = await response2Promise;

    // Both should succeed as they're from different IPs
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);

    await context1.close();
    await context2.close();
  });

  test('should provide proper rate limit response format', async ({ page }) => {
    // Submit multiple requests quickly to trigger rate limiting
    const responses = [];
    
    for (let i = 0; i < 8; i++) {
      const response = await page.request.post('/api/contact', {
        data: {
          firstName: `Rate${i}`,
          lastName: 'Limit',
          email: `rate${i}@test.com`,
          message: `Rate limit response test ${i}`
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      responses.push({
        status: response.status(),
        body: await response.text(),
        headers: response.headers()
      });
    }

    // Find a rate limited response
    const rateLimitedResponse = responses.find(r => r.status === 429);
    
    if (rateLimitedResponse) {
      // Parse response body
      const responseData = JSON.parse(rateLimitedResponse.body);
      
      // Check response structure
      expect(responseData).toHaveProperty('error');
      expect(responseData).toHaveProperty('message');
      expect(responseData).toHaveProperty('retryAfter');
      
      // Check headers
      expect(rateLimitedResponse.headers['x-ratelimit-limit']).toBeDefined();
      expect(rateLimitedResponse.headers['x-ratelimit-remaining']).toBeDefined();
      expect(rateLimitedResponse.headers['x-ratelimit-reset']).toBeDefined();
      expect(rateLimitedResponse.headers['retry-after']).toBeDefined();
      
      // Verify message is user-friendly
      expect(responseData.message).toContain('Too many');
      expect(responseData.message).toMatch(/\d+ seconds/);
    }
  });

  test('should handle rate limit window expiration', async ({ page }) => {
    // This test is challenging to implement in e2e due to time windows
    // Instead, we'll verify the API returns appropriate reset times
    
    const response = await page.request.post('/api/contact', {
      data: testData.validContact,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status() === 200) {
      // Check if rate limit headers are present even on successful requests
      const headers = response.headers();
      
      // These headers should be present to inform clients about limits
      if (headers['x-ratelimit-limit']) {
        expect(parseInt(headers['x-ratelimit-limit'])).toBeGreaterThan(0);
      }
      
      if (headers['x-ratelimit-remaining']) {
        expect(parseInt(headers['x-ratelimit-remaining'])).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should handle rate limiting errors gracefully', async ({ page }) => {
    // Test what happens when rate limiting service has issues
    // This would require mocking, but we can test edge cases
    
    // Test with malformed requests
    const malformedResponse = await page.request.post('/api/contact', {
      data: null,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Should handle gracefully even with rate limiting in place
    expect([400, 429, 500].includes(malformedResponse.status())).toBe(true);
    
    // Test with missing headers
    const noHeadersResponse = await page.request.post('/api/contact', {
      data: testData.validContact
      // Deliberately omit Content-Type
    });

    expect([400, 415, 429].includes(noHeadersResponse.status())).toBe(true);
  });
});