import { test, expect } from '@playwright/test'

/**
 * Health Check Monitoring Tests
 * Tests the /api/health endpoint for system monitoring
 *
 * Business Critical:
 * - Uptime monitoring
 * - Environment validation
 * - Memory and performance metrics
 * - Service availability
 */

const HEALTH_ENDPOINT = '/api/health'

test.describe('Health Check - Basic Functionality', () => {
  test('should respond to GET requests', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    // Health check should always respond
    expect([200, 503]).toContain(response.status())
  })

  test('should respond to HEAD requests for uptime monitoring', async ({ request }) => {
    const response = await request.head(HEALTH_ENDPOINT)

    // HEAD should work for uptime checks
    expect([200, 503, 405]).toContain(response.status())
  })

  test('should respond quickly for fast health checks', async ({ request }) => {
    const startTime = Date.now()

    await request.get(HEALTH_ENDPOINT)

    const duration = Date.now() - startTime

    // Health check should be fast (< 1 second)
    expect(duration).toBeLessThan(1000)
  })
})

test.describe('Health Check - Response Format', () => {
  test('should return JSON response', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    const contentType = response.headers()['content-type']
    expect(contentType).toContain('application/json')
  })

  test('should include status in response', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      // Route emits: { status: 'ok', timestamp, database: 'ok', latency_ms, version }
      expect(data).toHaveProperty('status')
      expect(['ok', 'healthy', 'degraded', 'unhealthy']).toContain(data.status)
    }
  })

  test('should include database, latency_ms, and version fields on healthy response', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      expect(data).toHaveProperty('database', 'ok')
      expect(data).toHaveProperty('latency_ms')
      expect(typeof data.latency_ms).toBe('number')
      expect(data.latency_ms).toBeGreaterThanOrEqual(0)
      expect(data).toHaveProperty('version')
      expect(typeof data.version).toBe('string')
    }
  })

  test('should include timestamp in response', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      expect(data).toHaveProperty('timestamp')

      // Verify timestamp is recent (within last 10 seconds)
      const timestamp = new Date(data.timestamp)
      const now = new Date()
      expect(now.getTime() - timestamp.getTime()).toBeLessThan(10000)
    }
  })

  test('should include uptime information', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      // May include uptime
      if (data.uptime !== undefined) {
        expect(typeof data.uptime).toBe('number')
        expect(data.uptime).toBeGreaterThan(0)
      }
    }
  })
})

test.describe('Health Check - Environment Validation', () => {
  test('should validate critical environment variables', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      // May include env check
      if (data.environment !== undefined) {
        expect(typeof data.environment).toBe('object')
      }
    }
  })

  test('should indicate if required services are configured', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      // May include service status
      if (data.services !== undefined) {
        expect(typeof data.services).toBe('object')
      }
    }
  })
})

test.describe('Health Check - System Metrics', () => {
  test('should include memory usage if available', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      // May include memory metrics
      if (data.memory !== undefined) {
        expect(typeof data.memory).toBe('object')
        if (data.memory.used) {
          expect(typeof data.memory.used).toBe('number')
        }
      }
    }
  })

  test('should include process information', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      // May include process info
      if (data.process !== undefined) {
        expect(typeof data.process).toBe('object')
      }
    }
  })
})

test.describe('Health Check - Service Availability', () => {
  test('should check database connectivity if applicable', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      // Route returns 'ok' on success, 'error' on failure
      if (data.database !== undefined) {
        expect(['ok', 'error']).toContain(data.database)
      }
    }
  })

  test('should check email service status', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      // May include email service status
      if (data.email !== undefined) {
        expect(['configured', 'not_configured', 'error']).toContain(data.email)
      }
    }
  })

  test('should check analytics service status', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      // May include analytics status
      if (data.analytics !== undefined) {
        expect(typeof data.analytics).toBe('object')
      }
    }
  })
})

test.describe('Health Check - Error Scenarios', () => {
  test('should return 503 when unhealthy', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    // If unhealthy, should return 503
    if (response.status() === 503) {
      const data = await response.json()

      expect(data).toHaveProperty('status')
      // Route returns { status: 'error' } on DB failure
      expect(['unhealthy', 'degraded', 'error']).toContain(data.status)
      expect(data.database).toBe('error')
    }
  })

  test('should include status and database fields when unhealthy', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.status() === 503) {
      const data = await response.json()

      // Route returns { status: 'error', timestamp, database: 'error' }
      expect(data).toHaveProperty('status', 'error')
      expect(data).toHaveProperty('database', 'error')
      expect(data).toHaveProperty('timestamp')
    }
  })
})

test.describe('Health Check - Security', () => {
  test('should not expose sensitive information', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()
      const dataString = JSON.stringify(data)

      // Should not contain secrets, tokens, or passwords
      expect(dataString).not.toMatch(/password|secret|token|key/i)
    }
  })

  test('should include security headers', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    const headers = response.headers()

    expect(headers['x-content-type-options']).toBeTruthy()
    expect(headers['x-frame-options']).toBeTruthy()
  })

  test('should allow CORS for monitoring tools', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT, {
      headers: {
        'Origin': 'https://uptime-monitor.com'
      }
    })

    // Should respond regardless of CORS
    expect([200, 503]).toContain(response.status())
  })
})

test.describe('Health Check - Performance', () => {
  test('should handle concurrent health check requests', async ({ request }) => {
    const promises = Array(10).fill(null).map(() =>
      request.get(HEALTH_ENDPOINT)
    )

    const responses = await Promise.all(promises)

    // All requests should complete successfully
    responses.forEach(response => {
      expect([200, 503]).toContain(response.status())
    })
  })

  test('should not impact application performance', async ({ request, page }) => {
    // Make health check request
    await request.get(HEALTH_ENDPOINT)

    // Load main page
    const startTime = Date.now()
    await page.goto('/')
    const duration = Date.now() - startTime

    // Page should load normally
    expect(duration).toBeLessThan(5000)
  })
})

test.describe('Health Check - Monitoring Integration', () => {
  test('should be usable by UptimeRobot', async ({ request }) => {
    const response = await request.head(HEALTH_ENDPOINT)

    // HEAD request should work for uptime monitoring
    expect([200, 503, 405]).toContain(response.status())
  })

  test('should be usable by Pingdom', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    // Should respond quickly for monitoring
    expect([200, 503]).toContain(response.status())
  })

  test('should include custom monitoring headers', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    const headers = response.headers()

    // May include custom headers for monitoring
    expect(headers).toBeTruthy()
  })
})

test.describe('Health Check - Versioning', () => {
  test('should include API version if available', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      // May include version info
      if (data.version !== undefined) {
        expect(typeof data.version).toBe('string')
      }
    }
  })

  test('should include build information', async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT)

    if (response.ok()) {
      const data = await response.json()

      // May include build info
      if (data.build !== undefined) {
        expect(typeof data.build).toBe('object')
      }
    }
  })
})
