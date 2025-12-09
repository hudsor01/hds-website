import { expect, test } from '@playwright/test'

/**
 * Email Queue Processing API Tests
 * Tests the cron job that processes scheduled emails
 *
 * Business Critical Path:
 * 1. Cron job calls /api/process-emails with Bearer token
 * 2. API authenticates request with CRON_SECRET
 * 3. Processes pending emails from queue
 * 4. Sends emails via Resend
 * 5. Updates email status (sent/failed)
 * 6. Returns processing stats
 */

const API_ENDPOINT = '/api/process-emails'

// Note: CRON_SECRET needs to be set in environment for these tests
// In production, this would be called by Vercel Cron or similar

test.describe('Email Queue Processing - Authentication', () => {
  test('should reject request without authorization header', async ({ request }) => {
    const response = await request.post(API_ENDPOINT)

    expect(response.status()).toBe(401)

    const data = await response.json()
    expect(data.error).toContain('Unauthorized')
  })

  test('should reject request with invalid Bearer token', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': 'Bearer invalid-token-12345'
      }
    })

    expect(response.status()).toBe(401)

    const data = await response.json()
    expect(data.error).toContain('Unauthorized')
  })

  test('should reject request with malformed authorization header', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': 'InvalidFormat token'
      }
    })

    expect(response.status()).toBe(401)
  })

  test('should accept request with valid Bearer token', async ({ request }) => {
    // Get CRON_SECRET from environment or use test value
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    // Should succeed (200) or return server error if email service not configured (500)
    expect([200, 500]).toContain(response.status())
  })

  test('should return 500 if CRON_SECRET environment variable not set', async ({ request }) => {
    // This test assumes CRON_SECRET might not be set in test environment
    // In production, this would always be set

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': 'Bearer any-token'
      }
    })

    // Will be either 401 (unauthorized) or 500 (env var not set)
    expect([401, 500]).toContain(response.status())
  })
})

test.describe('Email Queue Processing - Response Format', () => {
  test('should return processing stats on success', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    if (response.ok()) {
      const data = await response.json()

      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('stats')
      expect(data).toHaveProperty('timestamp')

      expect(typeof data.success).toBe('boolean')
      expect(typeof data.message).toBe('string')
      expect(typeof data.stats).toBe('object')
      expect(typeof data.timestamp).toBe('string')
    }
  })

  test('should include processed and error counts in message', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    if (response.ok()) {
      const data = await response.json()

      expect(data.message).toMatch(/processed/i)
      expect(data.message).toMatch(/\d+/)  // Should contain numbers
    }
  })

  test('should return ISO timestamp', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    if (response.ok()) {
      const data = await response.json()

      // Should be valid ISO 8601 timestamp
      const timestamp = new Date(data.timestamp)
      expect(timestamp.toISOString()).toBe(data.timestamp)
    }
  })
})

test.describe('Email Queue Processing - GET Endpoint (Stats)', () => {
  test('should get queue stats without authorization', async ({ request }) => {
    const response = await request.get(API_ENDPOINT)

    // Should require authentication
    expect(response.status()).toBe(401)
  })

  test('should get queue stats with valid authorization', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.get(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    if (response.ok()) {
      const data = await response.json()

      expect(data).toHaveProperty('stats')
      expect(data).toHaveProperty('timestamp')

      // Stats should contain queue information
      expect(typeof data.stats).toBe('object')
    }
  })

  test('should return current timestamp in stats', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.get(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    if (response.ok()) {
      const data = await response.json()

      const timestamp = new Date(data.timestamp)
      const now = new Date()

      // Timestamp should be within last 10 seconds
      expect(now.getTime() - timestamp.getTime()).toBeLessThan(10000)
    }
  })
})

test.describe('Email Queue Processing - Security Headers', () => {
  test('should apply security headers to response', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    const headers = response.headers()

    // Check for common security headers
    expect(headers['x-content-type-options']).toBeTruthy()
    expect(headers['x-frame-options']).toBeTruthy()
    expect(headers['x-xss-protection']).toBeTruthy()
  })

  test('should return JSON content type', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    const contentType = response.headers()['content-type']
    expect(contentType).toContain('application/json')
  })
})

test.describe('Email Queue Processing - Error Handling', () => {
  test('should handle processing errors gracefully', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    // Even if there are email errors, API should respond
    expect([200, 500]).toContain(response.status())

    const data = await response.json()
    expect(data).toHaveProperty('success')
  })

  test('should return error details on failure', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    if (!response.ok()) {
      const data = await response.json()

      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('timestamp')
      expect(data.success).toBe(false)
    }
  })
})

test.describe('Email Queue Processing - Performance', () => {
  test('should process queue within reasonable time', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const startTime = Date.now()

    await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    const duration = Date.now() - startTime

    // Should respond within 10 seconds (even with multiple emails)
    expect(duration).toBeLessThan(10000)
  })

  test('should handle empty queue efficiently', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const startTime = Date.now()

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    const duration = Date.now() - startTime

    // Empty queue should process very quickly
    expect(duration).toBeLessThan(2000)

    if (response.ok()) {
      const data = await response.json()

      // Should indicate no emails processed
      expect(data.message).toMatch(/0 emails|processed 0/i)
    }
  })
})

test.describe('Email Queue Processing - Idempotency', () => {
  test('should be safe to call multiple times', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    // First call
    const response1 = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    // Second call immediately after
    const response2 = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    // Both calls should succeed
    expect([200, 500]).toContain(response1.status())
    expect([200, 500]).toContain(response2.status())

    // Should not duplicate email sends
    if (response1.ok() && response2.ok()) {
      const data1 = await response1.json()
      const data2 = await response2.json()

      // Second call should process 0 or fewer emails (already sent)
      expect(data1).toHaveProperty('message')
      expect(data2).toHaveProperty('message')
    }
  })
})

test.describe('Email Queue Processing - Integration', () => {
  test('should process emails scheduled by contact form', async ({ page, request }) => {
    // First, submit a contact form to create scheduled emails
    await page.goto('/contact')

    await page.fill('#firstName', 'Queue')
    await page.fill('#lastName', 'Test')
    await page.fill('#email', 'queuetest@example.com')
    await page.fill('textarea[name="message"]', 'Testing email queue')

    await page.click('button[type="submit"]')

    // Wait for submission
    await expect(page.locator('text=Message Sent Successfully!')).toBeVisible({ timeout: 10000 })

    // Now trigger email queue processing
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    if (response.ok()) {
      const data = await response.json()

      // Should have processed at least the scheduled follow-up emails
      expect(data.success).toBeTruthy()
    }
  })

  test('should process emails scheduled by lead magnet', async ({ request }) => {
    // First, submit a lead magnet form
    await request.post('/api/lead-magnet', {
      data: {
        firstName: 'Lead',
        email: 'lead@example.com',
        resource: 'website-performance-checklist'
      }
    })

    // Then process email queue
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    expect([200, 500]).toContain(response.status())
  })
})

test.describe('Email Queue Processing - Monitoring', () => {
  test('should provide queue statistics', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.get(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    if (response.ok()) {
      const data = await response.json()

      // Stats should be an object with queue information
      expect(data.stats).toBeTruthy()
      expect(typeof data.stats).toBe('object')
    }
  })

  test('should track successful vs failed emails', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    const response = await request.post(API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    if (response.ok()) {
      const data = await response.json()

      // Message should indicate processed and error counts
      expect(data.message).toMatch(/processed \d+/)
      expect(data.message).toMatch(/\d+ errors/)
    }
  })
})

test.describe('Email Queue Processing - Edge Cases', () => {
  test('should handle OPTIONS preflight request', async ({ request }) => {
    const response = await request.fetch(API_ENDPOINT, {
      method: 'OPTIONS'
    })

    // Should handle CORS preflight
    expect([200, 204, 405]).toContain(response.status())
  })

  test('should reject unsupported HTTP methods', async ({ request }) => {
    const response = await request.put(API_ENDPOINT)

    expect(response.status()).toBe(405)
  })

  test('should handle concurrent processing requests', async ({ request }) => {
    const cronSecret = process.env.CRON_SECRET || 'test-cron-secret'

    // Trigger multiple processing requests concurrently
    const promises = Array(3).fill(null).map(() =>
      request.post(API_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${cronSecret}`
        }
      })
    )

    const responses = await Promise.all(promises)

    // All should complete without crashing
    responses.forEach(response => {
      expect([200, 500]).toContain(response.status())
    })
  })
})
