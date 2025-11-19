import { http, HttpResponse } from 'msw'

/**
 * MSW Handlers for API Mocking
 * Used in unit tests to mock API responses
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export const handlers = [
  // Lead Magnet API - Success
  http.post(`${BASE_URL}/api/lead-magnet`, async ({ request }) => {
    const body = await request.json()

    // Validate required fields
    if (!body.firstName || !body.email || !body.resource) {
      return HttpResponse.json(
        {
          error: 'Validation failed',
          errors: {
            firstName: !body.firstName ? 'First name is required' : undefined,
            email: !body.email ? 'Email is required' : undefined,
            resource: !body.resource ? 'Resource is required' : undefined
          }
        },
        { status: 400 }
      )
    }

    // Success response
    return HttpResponse.json({
      success: true,
      message: 'Success! Check your email for the download link.',
      downloadUrl: '/resources/downloads/website-performance-checklist.pdf'
    })
  }),

  // Contact Form Submission - Success
  http.post(`${BASE_URL}/api/contact`, async ({ request }) => {
    const formData = await request.formData()

    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName')
    const email = formData.get('email')
    const message = formData.get('message')

    if (!firstName || !lastName || !email || !message) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.'
    })
  }),

  // Email Queue Processing - Requires Auth
  http.post(`${BASE_URL}/api/process-emails`, async ({ request }) => {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    if (token !== 'test-cron-secret') {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      success: true,
      message: 'Processed 0 emails, 0 errors',
      stats: {
        pending: 0,
        sent: 0,
        failed: 0
      },
      timestamp: new Date().toISOString()
    })
  }),

  // Email Queue Stats - Requires Auth
  http.get(`${BASE_URL}/api/process-emails`, async ({ request }) => {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      stats: {
        pending: 0,
        sent: 5,
        failed: 0
      },
      timestamp: new Date().toISOString()
    })
  }),

  // Health Check
  http.get(`${BASE_URL}/api/health`, () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: 12345,
      environment: {
        nodeEnv: 'test',
        resendConfigured: true,
        posthogConfigured: true
      },
      services: {
        email: 'configured',
        analytics: 'configured'
      },
      memory: {
        used: 123456789,
        total: 1073741824
      }
    })
  }),

  http.head(`${BASE_URL}/api/health`, () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // CSRF Token Generation
  http.get(`${BASE_URL}/api/csrf`, () => {
    return HttpResponse.json({
      token: 'mock-csrf-token-12345'
    })
  }),

  // RSS Feed Generation
  http.get(`${BASE_URL}/api/rss/feed`, () => {
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Hudson Digital Solutions Blog</title>
    <link>https://hudsondigitalsolutions.com/blog</link>
    <description>Web development and business growth insights</description>
    <item>
      <title>Test Blog Post</title>
      <link>https://hudsondigitalsolutions.com/blog/test-post</link>
      <description>This is a test post</description>
      <pubDate>Mon, 01 Jan 2025 00:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`

    return HttpResponse.text(rss, {
      headers: {
        'Content-Type': 'application/xml'
      }
    })
  }),

  // Discord Webhook (external API)
  http.post('https://discord.com/api/webhooks/*', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Resend API (external API)
  http.post('https://api.resend.com/emails', () => {
    return HttpResponse.json({
      id: 'mock-email-id-12345',
      from: 'noreply@hudsondigitalsolutions.com',
      to: ['test@example.com'],
      created_at: new Date().toISOString()
    })
  }),

  // PostHog API (external API)
  http.post('https://app.posthog.com/e/', () => {
    return HttpResponse.json({ status: 1 })
  }),

  http.post('https://us.i.posthog.com/e/', () => {
    return HttpResponse.json({ status: 1 })
  }),

  // Supabase Webhook
  http.post(`${BASE_URL}/api/webhooks/supabase`, async ({ request }) => {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    return HttpResponse.json({
      success: true,
      processed: true,
      webhook_type: body.type || 'unknown'
    })
  })
]

// Error handlers for simulating failures
export const errorHandlers = [
  // Lead Magnet - Email Service Down
  http.post(`${BASE_URL}/api/lead-magnet`, () => {
    return HttpResponse.json(
      { error: 'Email service unavailable' },
      { status: 500 }
    )
  }),

  // Contact Form - Rate Limited
  http.post(`${BASE_URL}/api/contact`, () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again in 15 minutes.'
      },
      { status: 429 }
    )
  }),

  // Email Queue - Service Error
  http.post(`${BASE_URL}/api/process-emails`, ({ request }) => {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return HttpResponse.json(
      {
        error: 'Failed to process emails',
        success: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }),

  // Health Check - Unhealthy
  http.get(`${BASE_URL}/api/health`, () => {
    return HttpResponse.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  })
]

// Network error handlers
export const networkErrorHandlers = [
  http.post(`${BASE_URL}/api/lead-magnet`, () => {
    return HttpResponse.error()
  }),

  http.post(`${BASE_URL}/api/contact`, () => {
    return HttpResponse.error()
  })
]

export default handlers
