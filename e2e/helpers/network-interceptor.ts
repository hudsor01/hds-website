import { Page, Request, Response } from '@playwright/test';

interface NetworkCall {
  url: string;
  method: string;
  status: number;
  requestBody?: any;
  responseBody?: any;
  timestamp: number;
}

export class NetworkInterceptor {
  private page: Page;
  private calls: NetworkCall[] = [];
  private isRecording = false;

  constructor(page: Page) {
    this.page = page;
  }

  async startRecording() {
    this.calls = [];
    this.isRecording = true;

    // Intercept all network requests
    await this.page.route('**/*', async (route, request) => {
      const url = request.url();
      const method = request.method();
      
      // Capture request details
      let requestBody: any;
      try {
        if (method === 'POST' || method === 'PUT') {
          requestBody = request.postDataJSON();
        }
      } catch (e) {
        // Not JSON data
        requestBody = request.postData();
      }

      // Continue the request
      const response = await route.fetch();
      
      // Capture response details
      let responseBody: any;
      try {
        responseBody = await response.json();
      } catch (e) {
        // Not JSON response
        responseBody = await response.text();
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
      call.url.includes('resend.com') ||
      call.url.includes('n8n') ||
      call.url.includes('webhook')
    );
  }

  // Verify CSRF token was fetched
  getCSRFCalls(): NetworkCall[] {
    return this.calls.filter(call => call.url.includes('/api/csrf'));
  }

  // Check for security headers in responses
  async verifySecurityHeaders(response: Response) {
    const headers = response.headers();
    
    const securityHeaders = {
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'x-xss-protection': '1; mode=block',
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

  // Verify rate limiting is working
  async testRateLimit(endpoint: string, limit: number) {
    const requests: Promise<Response>[] = [];
    
    for (let i = 0; i < limit + 2; i++) {
      requests.push(
        this.page.request.post(endpoint, {
          data: { test: true },
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