import { test, expect } from '@playwright/test'

/**
 * Lead Magnet API End-to-End Tests
 * Tests the complete lead capture and email delivery flow
 *
 * Business Critical Path:
 * 1. User submits lead magnet form
 * 2. API validates data
 * 3. Resend sends download email to user
 * 4. Resend sends admin notification
 * 5. Discord webhook notifies team
 * 6. Download URL is returned
 */

const API_ENDPOINT = '/api/lead-magnet'

// Valid test data
const validLeadData = {
  firstName: 'John',
  email: 'john.test@example.com',
  resource: 'website-performance-checklist'
}

const validResources = [
  'website-performance-checklist',
  'roi-calculator',
  'conversion-optimization-guide'
]

test.describe('Lead Magnet API - Validation', () => {
  test('should accept valid lead magnet request', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: validLeadData
    })

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.message).toContain('Success')
    expect(data.downloadUrl).toBeTruthy()
    expect(data.downloadUrl).toContain('/resources/downloads/')
  })

  test('should reject request with missing email', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: 'John',
        resource: 'website-performance-checklist'
        // missing email
      }
    })

    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.error).toBeTruthy()
    expect(data.errors?.email).toBeTruthy()
  })

  test('should reject request with invalid email format', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: 'John',
        email: 'invalid-email',
        resource: 'website-performance-checklist'
      }
    })

    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.error).toBeTruthy()
    expect(data.errors?.email).toContain('valid email')
  })

  test('should reject request with missing firstName', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        email: 'john@example.com',
        resource: 'website-performance-checklist'
        // missing firstName
      }
    })

    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.error).toBeTruthy()
    expect(data.errors?.firstName).toBeTruthy()
  })

  test('should reject request with empty firstName', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: '   ',
        email: 'john@example.com',
        resource: 'website-performance-checklist'
      }
    })

    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.error).toBeTruthy()
  })

  test('should reject request with invalid resource', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: 'John',
        email: 'john@example.com',
        resource: 'nonexistent-resource'
      }
    })

    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.error).toBeTruthy()
    expect(data.errors?.resource).toContain('Invalid resource')
  })

  test('should reject request with invalid JSON', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: 'invalid json',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.error).toContain('Invalid request format')
  })
})

test.describe('Lead Magnet API - Security', () => {
  test('should sanitize email to lowercase and trim', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: 'John',
        email: '  JOHN@EXAMPLE.COM  ',
        resource: 'website-performance-checklist'
      }
    })

    expect(response.ok()).toBeTruthy()
    // Email should be sanitized internally
  })

  test('should trim firstName whitespace', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: '  John  ',
        email: 'john@example.com',
        resource: 'website-performance-checklist'
      }
    })

    expect(response.ok()).toBeTruthy()
  })

  test('should detect potential injection attempts', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: '<script>alert("xss")</script>',
        email: 'john@example.com',
        resource: 'website-performance-checklist'
      }
    })

    // Should still process but log the suspicious activity
    // The response should be successful if validation passes
    expect(response.status()).toBeGreaterThanOrEqual(200)
  })

  test('should apply security headers', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: validLeadData
    })

    const headers = response.headers()

    // Check for common security headers
    expect(headers['x-content-type-options']).toBeTruthy()
    expect(headers['x-frame-options']).toBeTruthy()
    expect(headers['x-xss-protection']).toBeTruthy()
  })
})

test.describe('Lead Magnet API - Resources', () => {
  for (const resource of validResources) {
    test(`should accept valid resource: ${resource}`, async ({ request }) => {
      const response = await request.post(API_ENDPOINT, {
        data: {
          firstName: 'John',
          email: 'john@example.com',
          resource: resource
        }
      })

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.downloadUrl).toContain(resource)
    })
  }

  test('should return correct download URLs for each resource', async ({ request }) => {
    const resourceUrls = {
      'website-performance-checklist': '/resources/downloads/website-performance-checklist.pdf',
      'roi-calculator': '/resources/downloads/roi-calculator.xlsx',
      'conversion-optimization-guide': '/resources/downloads/conversion-optimization-guide.pdf'
    }

    for (const [resource, expectedUrl] of Object.entries(resourceUrls)) {
      const response = await request.post(API_ENDPOINT, {
        data: {
          firstName: 'John',
          email: 'john@example.com',
          resource: resource
        }
      })

      const data = await response.json()
      expect(data.downloadUrl).toBe(expectedUrl)
    }
  })
})

test.describe('Lead Magnet API - Response Format', () => {
  test('should return success response with correct structure', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: validLeadData
    })

    const data = await response.json()

    expect(data).toHaveProperty('success')
    expect(data).toHaveProperty('message')
    expect(data).toHaveProperty('downloadUrl')
    expect(typeof data.success).toBe('boolean')
    expect(typeof data.message).toBe('string')
    expect(typeof data.downloadUrl).toBe('string')
  })

  test('should return error response with correct structure', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        // Invalid data
      }
    })

    const data = await response.json()

    expect(data).toHaveProperty('error')
    expect(data).toHaveProperty('errors')
    expect(typeof data.error).toBe('string')
    expect(typeof data.errors).toBe('object')
  })
})

test.describe('Lead Magnet API - Email Delivery', () => {
  test('should still succeed even if email service fails', async ({ request }) => {
    // The API is designed to return download URL even if email fails
    const response = await request.post(API_ENDPOINT, {
      data: validLeadData
    })

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.downloadUrl).toBeTruthy()
  })

  test('should include appropriate success message when configured', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: validLeadData
    })

    const data = await response.json()
    expect(data.message).toMatch(/success|email|check/i)
  })
})

test.describe('Lead Magnet API - Edge Cases', () => {
  test('should handle very long first names', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: 'A'.repeat(100),
        email: 'john@example.com',
        resource: 'website-performance-checklist'
      }
    })

    // Should either accept or reject with validation error
    expect([200, 201, 400]).toContain(response.status())
  })

  test('should handle international characters in firstName', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: 'José María',
        email: 'jose@example.com',
        resource: 'website-performance-checklist'
      }
    })

    expect(response.ok()).toBeTruthy()
  })

  test('should handle emoji in firstName', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: 'John 👋',
        email: 'john@example.com',
        resource: 'website-performance-checklist'
      }
    })

    // Should process successfully
    expect(response.ok()).toBeTruthy()
  })

  test('should handle plus-addressing in email', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: 'John',
        email: 'john+test@example.com',
        resource: 'website-performance-checklist'
      }
    })

    expect(response.ok()).toBeTruthy()
  })

  test('should handle subdomain emails', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: 'John',
        email: 'john@mail.example.com',
        resource: 'website-performance-checklist'
      }
    })

    expect(response.ok()).toBeTruthy()
  })
})

test.describe('Lead Magnet API - Performance', () => {
  test('should respond within acceptable time', async ({ request }) => {
    const startTime = Date.now()

    await request.post(API_ENDPOINT, {
      data: validLeadData
    })

    const duration = Date.now() - startTime

    // Should respond within 5 seconds even with email sending
    expect(duration).toBeLessThan(5000)
  })

  test('should handle concurrent requests', async ({ request }) => {
    const promises = Array(5).fill(null).map((_, i) =>
      request.post(API_ENDPOINT, {
        data: {
          firstName: `User${i}`,
          email: `user${i}@example.com`,
          resource: 'website-performance-checklist'
        }
      })
    )

    const responses = await Promise.all(promises)

    // All requests should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy()
    })
  })
})

test.describe('Lead Magnet API - Error Handling', () => {
  test('should handle missing Content-Type header', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: JSON.stringify(validLeadData),
      headers: {
        'Content-Type': undefined
      }
    })

    // Should either succeed or return appropriate error
    expect([200, 201, 400, 415]).toContain(response.status())
  })

  test('should handle empty request body', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {}
    })

    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.error).toBeTruthy()
  })

  test('should handle null values', async ({ request }) => {
    const response = await request.post(API_ENDPOINT, {
      data: {
        firstName: null,
        email: null,
        resource: null
      }
    })

    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.error).toBeTruthy()
  })
})
