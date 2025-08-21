import { Page, Request, Response } from '@playwright/test';

interface NetworkCall {
  url: string;
  method: string;
  status: number;
  requestBody?: unknown;
  responseBody?: unknown;
  timestamp: number;
}

export class NetworkInterceptor {
  private page: Page;
  private calls: NetworkCall[] = [];
  private isRecording = false;
  private rateLimitHandling = true;
  private requestCounts = new Map<string, number>();

  constructor(page: Page, options: { handleRateLimit?: boolean } = {}) {
    this.page = page;
    this.rateLimitHandling = options.handleRateLimit ?? true;
  }

  async startRecording() {
    this.calls = [];
    this.requestCounts.clear();
    this.isRecording = true;

    // Intercept all network requests with rate limit handling
    await this.page.route('**/*', async (route, request) => {
      const url = request.url();
      const method = request.method();
      
      // Handle rate limiting for test APIs
      if (this.rateLimitHandling && this.shouldRateLimit(url)) {
        const rateLimitResponse = this.handleRateLimit(url, method);
        if (rateLimitResponse) {
          await route.fulfill(rateLimitResponse);
          return;
        }
      }
      
      // Capture request details
      let requestBody: unknown;
      try {
        if (method === 'POST' || method === 'PUT') {
          requestBody = request.postDataJSON();
        }
      } catch (e) {
        // Not JSON data
        requestBody = request.postData();
      }

      try {
        // Continue the request with timeout
        const response = await route.fetch({ timeout: 15000 });
        
        // Capture response details
        let responseBody: unknown;
        try {
          const text = await response.text();
          responseBody = JSON.parse(text);
        } catch (e) {
          // Not JSON response
          responseBody = text;
        }

        if (this.isRecording) {
          this.calls.push({
            url,
            method,
            status: response.status(),
            requestBody,
            responseBody,
            timestamp: Date.now(),
          });
        }

        // Fulfill the route with the original response
        await route.fulfill({ response });
      } catch (error) {
        // Handle network errors gracefully
        console.log(`Network error for ${url}: ${error}`);
        
        if (this.isRecording) {
          this.calls.push({
            url,
            method,
            status: 0, // Network error
            requestBody,
            responseBody: error.toString(),
            timestamp: Date.now(),
          });
        }
        
        // Return a reasonable error response
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Service temporarily unavailable' })
        });
      }
    });
  }

  stopRecording() {
    this.isRecording = false;
  }

  // Get all API calls to a specific endpoint
  getAPICalls(endpoint: string): NetworkCall[] {
    return this.calls.filter(call => call.url.includes(endpoint));
  }

  // Verify PostHog events were sent
  getPostHogEvents(): NetworkCall[] {
    return this.calls.filter(call => 
      call.url.includes('posthog.com') || 
      call.url.includes('/batch') ||
      call.url.includes('/capture')
    );
  }

  // Verify email was sent via API
  getEmailAPICalls(): NetworkCall[] {
    return this.calls.filter(call => 
      call.url.includes('/api/contact') ||
      call.url.includes('resend.com')
    );
  }

  // Verify CSRF token was fetched
  getCSRFCalls(): NetworkCall[] {
    return this.calls.filter(call => call.url.includes('/api/csrf'));
  }

  // Check for security headers in responses
  async verifySecurityHeaders(response: Response) {
    const headers = response.headers();
    
    // Import centralized security headers for consistency
    const { EXPECTED_SECURITY_HEADERS } = await import('@/lib/security-headers');
    const securityHeaders = {
      ...EXPECTED_SECURITY_HEADERS,
      'referrer-policy': ['strict-origin-when-cross-origin', 'origin-when-cross-origin'],
    };

    const results: Record<string, boolean> = {};
    
    for (const [header, expectedValue] of Object.entries(securityHeaders)) {
      const actualValue = headers[header];
      if (Array.isArray(expectedValue)) {
        results[header] = expectedValue.includes(actualValue);
      } else {
        results[header] = actualValue === expectedValue;
      }
    }

    return results;
  }

  // Handle rate limiting in tests
  private shouldRateLimit(url: string): boolean {
    return url.includes('/api/') && 
           (url.includes('contact') || url.includes('metrics') || url.includes('web-vitals'));
  }
  
  private handleRateLimit(url: string, method: string) {
    const key = `${method}:${url}`;
    const count = this.requestCounts.get(key) || 0;
    this.requestCounts.set(key, count + 1);
    
    // Simulate rate limiting after 5 requests
    if (count >= 5) {
      return {
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Too Many Requests',
          retryAfter: 60,
          message: 'Rate limit exceeded for testing'
        })
      };
    }
    
    return null;
  }
  
  // Verify rate limiting is working
  async testRateLimit(endpoint: string, limit: number) {
    const requests: Promise<Response>[] = [];
    
    for (let i = 0; i < limit + 2; i++) {
      requests.push(
        this.page.request.post(endpoint, {
          data: { test: true, requestId: i },
          timeout: 10000
        }).catch(error => {
          // Handle timeout/network errors
          return {
            status: () => 503,
            json: () => Promise.resolve({ error: 'Network error' })
          } as any;
        })
      );
    }

    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status());
    
    // Should have some 429 responses after the limit
    return statusCodes.filter(status => status === 429).length > 0;
  }

  // Clear all recorded calls
  clear() {
    this.calls = [];
    this.requestCounts.clear();
  }
  
  // Set rate limiting behavior
  setRateLimitHandling(enabled: boolean) {
    this.rateLimitHandling = enabled;
  }
  
  // Get failed requests
  getFailedRequests(): NetworkCall[] {
    return this.calls.filter(call => call.status >= 400);
  }
  
  // Get rate limited requests
  getRateLimitedRequests(): NetworkCall[] {
    return this.calls.filter(call => call.status === 429);
  }

  // Get all recorded calls
  getAllCalls(): NetworkCall[] {
    return this.calls;
  }

  // Debug helper to print all calls
  debugPrint() {
    console.log('=== Network Calls ===');
    this.calls.forEach((call, index) => {
      console.log(`[${index}] ${call.method} ${call.url} - ${call.status}`);
      if (call.requestBody) {
        console.log('  Request:', JSON.stringify(call.requestBody, null, 2));
      }
      if (call.responseBody) {
        console.log('  Response:', JSON.stringify(call.responseBody, null, 2));
      }
    });
  }
}