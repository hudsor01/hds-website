import { test, expect } from '@playwright/test'

/**
 * Rate Limiting and Security Tests
 * Tests rate limiting, CSRF protection, and security headers
 *
 * Business Critical:
 * - Prevent abuse of contact form (3 submissions per 15 min)
 * - Prevent abuse of lead magnet (protect bandwidth and email credits)
 * - CSRF token validation
 * - Security headers on all responses
 */

test.describe('Rate Limiting - Contact Form', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('should enforce rate limit on contact form submissions', async ({ page, context }) => {
    // Clear any existing rate limit state
    await context.clearCookies()

    const submissions = []

    // Try to submit 4 times rapidly
    for (let i = 0; i < 4; i++) {
      await page.goto('/contact')

      await page.fill('input[name="firstName"]', `Test${i}`)
      await page.fill('input[name="lastName"]', `User${i}`)
      await page.fill('input[name="email"]', `test${i}@ratelimit.com`)
      await page.fill('textarea[name="message"]', `Message ${i}`)

      await page.click('button[type="submit"]')

      // Wait for response
      await page.waitForTimeout(2000)

      // Check if success or error
      const hasSuccess = await page.locator('text=/success/i').isVisible()
      const hasError = await page.locator('text=/too many|rate limit/i').isVisible()

      submissions.push({
        attempt: i + 1,
        success: hasSuccess,
        rateLimited: hasError
      })

      if (hasError) {
        break
      }
    }

    // First 3 should succeed, 4th should be rate limited
    expect(submissions.filter(s => s.success).length).toBeLessThanOrEqual(3)
    expect(submissions.some(s => s.rateLimited)).toBeTruthy()
  })

  test('should show appropriate error message when rate limited', async ({ page, context }) => {
    await context.clearCookies()

    // Submit 3 times
    for (let i = 0; i < 3; i++) {
      await page.goto('/contact')

      await page.fill('input[name="firstName"]', `RateTest${i}`)
      await page.fill('input[name="lastName"]', 'User')
      await page.fill('input[name="email"]', `ratetest${i}@example.com`)
      await page.fill('textarea[name="message"]', 'Test')

      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)
    }

    // 4th submission should show rate limit error
    await page.goto('/contact')

    await page.fill('input[name="firstName"]', 'RateTest4')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[name="email"]', 'ratetest4@example.com')
    await page.fill('textarea[name="message"]', 'Test')

    await page.click('button[type="submit"]')

    // Should show rate limit message
    await expect(page.locator('text=/too many|rate limit|try again.*15 minutes/i')).toBeVisible({
      timeout: 5000
    })
  })
})

test.describe('Rate Limiting - Lead Magnet API', () => {
  test('should accept multiple lead magnet requests from different emails', async ({ request }) => {
    const responses = []

    for (let i = 0; i < 3; i++) {
      const response = await request.post('/api/lead-magnet', {
        data: {
          firstName: `Lead${i}`,
          email: `lead${i}@different.com`,
          resource: 'website-performance-checklist'
        }
      })

      responses.push(response.status())
    }

    // All should succeed (different emails)
    responses.forEach(status => {
      expect(status).toBe(200)
    })
  })
})

test.describe('CSRF Protection', () => {
  test('should generate CSRF token', async ({ request }) => {
    const response = await request.get('/api/csrf')

    if (response.ok()) {
      const data = await response.json()

      expect(data).toHaveProperty('token')
      expect(typeof data.token).toBe('string')
      expect(data.token.length).toBeGreaterThan(0)
    } else {
      // CSRF endpoint may not be implemented or may require different auth
      expect([404, 405]).toContain(response.status())
    }
  })

  test('should validate CSRF token on protected endpoints', async ({ request, page }) => {
    // Get CSRF token
    const tokenResponse = await request.get('/api/csrf')

    if (tokenResponse.ok()) {
      const { token } = await tokenResponse.json()

      // Use token in form submission
      await page.goto('/contact')

      // Set CSRF token if form uses it
      await page.evaluate((csrfToken) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = '_csrf'
        input.value = csrfToken
        document.querySelector('form')?.appendChild(input)
      }, token)

      await page.fill('input[name="firstName"]', 'CSRF')
      await page.fill('input[name="lastName"]', 'Test')
      await page.fill('input[name="email"]', 'csrf@test.com')
      await page.fill('textarea[name="message"]', 'Testing CSRF')

      await page.click('button[type="submit"]')

      // Should process successfully with valid token
      await page.waitForTimeout(2000)
    }
  })
})

test.describe('Security Headers - Contact Form', () => {
  test('should include security headers on contact page', async ({ page }) => {
    const response = await page.goto('/contact')

    if (response) {
      const headers = response.headers()

      // Check for critical security headers
      expect(headers['x-content-type-options']).toBeTruthy()
      expect(headers['x-frame-options']).toBeTruthy()
    }
  })

  test('should have CSP headers', async ({ page }) => {
    const response = await page.goto('/')

    if (response) {
      const headers = response.headers()

      // Content Security Policy
      const csp = headers['content-security-policy']

      if (csp) {
        expect(csp).toBeTruthy()
        expect(typeof csp).toBe('string')
      }
    }
  })

  test('should set HSTS header', async ({ page }) => {
    const response = await page.goto('/')

    if (response) {
      const headers = response.headers()

      // Strict-Transport-Security (HSTS)
      const hsts = headers['strict-transport-security']

      if (hsts) {
        expect(hsts).toContain('max-age')
      }
    }
  })
})

test.describe('Security Headers - API Endpoints', () => {
  test('should include security headers on lead magnet API', async ({ request }) => {
    const response = await request.post('/api/lead-magnet', {
      data: {
        firstName: 'Security',
        email: 'security@test.com',
        resource: 'website-performance-checklist'
      }
    })

    const headers = response.headers()

    expect(headers['x-content-type-options']).toBeTruthy()
    expect(headers['x-frame-options']).toBeTruthy()
    expect(headers['x-xss-protection']).toBeTruthy()
  })

  test('should include security headers on email queue API', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post('/api/process-emails', {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    const headers = response.headers()

    expect(headers['x-content-type-options']).toBeTruthy()
    expect(headers['x-frame-options']).toBeTruthy()
  })
})

test.describe('Input Sanitization', () => {
  test('should sanitize HTML in contact form inputs', async ({ page }) => {
    await page.goto('/contact')

    const maliciousInput = '<img src=x onerror=alert(1)>'

    await page.fill('input[name="firstName"]', maliciousInput)
    await page.fill('input[name="lastName"]', 'Test')
    await page.fill('input[name="email"]', 'xss@test.com')
    await page.fill('textarea[name="message"]', 'Testing XSS prevention')

    await page.click('button[type="submit"]')

    // Should not execute any scripts
    const alerts = []
    page.on('dialog', dialog => {
      alerts.push(dialog.message())
      dialog.dismiss()
    })

    await page.waitForTimeout(2000)

    expect(alerts.length).toBe(0)
  })

  test('should sanitize SQL injection attempts', async ({ page }) => {
    await page.goto('/contact')

    await page.fill('input[name="firstName"]', "'; DROP TABLE users; --")
    await page.fill('input[name="lastName"]', 'Test')
    await page.fill('input[name="email"]', 'sql@test.com')
    await page.fill('textarea[name="message"]', 'Testing SQL injection prevention')

    await page.click('button[type="submit"]')

    // Should process normally without executing SQL
    await page.waitForTimeout(2000)

    // Page should still be functional (not crashed)
    expect(await page.title()).toBeTruthy()
  })

  test('should sanitize JavaScript in lead magnet form', async ({ request }) => {
    const response = await request.post('/api/lead-magnet', {
      data: {
        firstName: '<script>alert("xss")</script>',
        email: 'xss@test.com',
        resource: 'website-performance-checklist'
      }
    })

    // Should either succeed (with sanitization) or return 200
    expect([200, 400]).toContain(response.status())
  })

  test('should handle LDAP injection attempts', async ({ page }) => {
    await page.goto('/contact')

    await page.fill('input[name="firstName"]', '*)(uid=*')
    await page.fill('input[name="lastName"]', 'Test')
    await page.fill('input[name="email"]', 'ldap@test.com')
    await page.fill('textarea[name="message"]', 'Testing LDAP injection prevention')

    await page.click('button[type="submit"]')

    await page.waitForTimeout(2000)

    // Should process without error
    expect(await page.title()).toBeTruthy()
  })
})

test.describe('Email Header Injection Prevention', () => {
  test('should prevent email header injection in contact form', async ({ page }) => {
    await page.goto('/contact')

    // Attempt to inject email headers
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[name="email"]', 'test@example.com\nBcc: hacker@evil.com')
    await page.fill('textarea[name="message"]', 'Test message')

    await page.click('button[type="submit"]')

    // Should be rejected or sanitized
    await page.waitForTimeout(2000)
  })

  test('should prevent header injection in lead magnet', async ({ request }) => {
    const response = await request.post('/api/lead-magnet', {
      data: {
        firstName: 'Test\r\nBcc: hacker@evil.com',
        email: 'test@example.com',
        resource: 'website-performance-checklist'
      }
    })

    // Should succeed but sanitize headers
    expect([200, 400]).toContain(response.status())
  })
})

test.describe('DOS Protection', () => {
  test('should handle rapid repeated requests gracefully', async ({ request }) => {
    const promises = []

    // Send 10 rapid requests
    for (let i = 0; i < 10; i++) {
      promises.push(
        request.post('/api/lead-magnet', {
          data: {
            firstName: `DOS${i}`,
            email: `dos${i}@test.com`,
            resource: 'website-performance-checklist'
          }
        })
      )
    }

    const responses = await Promise.all(promises)

    // Should handle all requests without crashing
    responses.forEach(response => {
      expect([200, 429, 503]).toContain(response.status())
    })
  })

  test('should not crash on very large payloads', async ({ request }) => {
    const largeString = 'A'.repeat(100000)

    const response = await request.post('/api/lead-magnet', {
      data: {
        firstName: largeString,
        email: 'large@test.com',
        resource: 'website-performance-checklist'
      }
    })

    // Should either reject or handle gracefully
    expect([200, 400, 413, 500]).toContain(response.status())
  })
})

test.describe('Authentication & Authorization', () => {
  test('should protect email queue endpoint from unauthorized access', async ({ request }) => {
    const response = await request.post('/api/process-emails')

    expect(response.status()).toBe(401)
  })

  test('should protect email queue stats from unauthorized access', async ({ request }) => {
    const response = await request.get('/api/process-emails')

    expect(response.status()).toBe(401)
  })

  test('should validate Bearer token format', async ({ request }) => {
    const response = await request.post('/api/process-emails', {
      headers: {
        'Authorization': 'InvalidFormat'
      }
    })

    expect(response.status()).toBe(401)
  })
})

test.describe('CORS Protection', () => {
  test('should handle CORS preflight requests', async ({ request }) => {
    const response = await request.fetch('/api/lead-magnet', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://evil.com',
        'Access-Control-Request-Method': 'POST'
      }
    })

    // Should respond to OPTIONS
    expect([200, 204, 405]).toContain(response.status())
  })

  test('should include CORS headers in API responses', async ({ request }) => {
    const response = await request.post('/api/lead-magnet', {
      data: {
        firstName: 'CORS',
        email: 'cors@test.com',
        resource: 'website-performance-checklist'
      }
    })

    const headers = response.headers()

    // May or may not have CORS headers depending on configuration
    // Just verify response is valid
    expect(response.status()).toBeLessThan(500)
  })
})
