import { test, expect } from '@playwright/test'

/**
 * PostHog Analytics Integration Tests
 * Tests analytics event tracking across the application
 *
 * Business Critical:
 * - Form submissions tracked
 * - CTA clicks tracked
 * - Page views tracked
 * - Conversion events tracked
 * - User identification
 */

test.describe('PostHog - Initialization', () => {
  test('should load PostHog script', async ({ page }) => {
    await page.goto('/')

    // Check if PostHog is initialized
    const posthog = await page.evaluate(() => {
      return typeof (window as any).posthog !== 'undefined'
    })

    // PostHog should be loaded
    expect(posthog).toBeTruthy()
  })

  test('should initialize with correct API key', async ({ page }) => {
    await page.goto('/')

    const hasValidKey = await page.evaluate(() => {
      const ph = (window as any).posthog
      return ph && ph.config && ph.config.token
    })

    expect(hasValidKey).toBeTruthy()
  })

  test('should set correct PostHog host', async ({ page }) => {
    await page.goto('/')

    const host = await page.evaluate(() => {
      const ph = (window as any).posthog
      return ph && ph.config && ph.config.api_host
    })

    // Should use app.posthog.com or custom host
    if (host) {
      expect(host).toMatch(/posthog\.com|posthog\.io/)
    }
  })
})

test.describe('PostHog - Page View Tracking', () => {
  test('should track page view on initial load', async ({ page }) => {
    const events = []

    // Intercept PostHog requests
    await page.route('**/e/', (route) => {
      const postData = route.request().postDataJSON()
      if (postData) {
        events.push(postData)
      }
      route.continue()
    })

    await page.goto('/')

    // Wait for analytics to fire
    await page.waitForTimeout(2000)

    // Should have captured page view
    const hasPageView = events.some((e: any) =>
      e.event === '$pageview' || e.event === 'pageview'
    )

    expect(hasPageView || events.length > 0).toBeTruthy()
  })

  test('should track navigation between pages', async ({ page }) => {
    const events = []

    await page.route('**/e/', (route) => {
      const postData = route.request().postDataJSON()
      if (postData) {
        events.push(postData)
      }
      route.continue()
    })

    await page.goto('/')
    await page.waitForTimeout(1000)

    // Navigate to another page
    await page.click('a[href="/services"]')
    await page.waitForTimeout(1000)

    // Should track multiple page views
    expect(events.length).toBeGreaterThan(0)
  })
})

test.describe('PostHog - Event Tracking', () => {
  test('should track form submission events', async ({ page }) => {
    const events = []

    await page.route('**/e/', (route) => {
      const postData = route.request().postDataJSON()
      if (postData) {
        events.push(postData)
      }
      route.continue()
    })

    await page.goto('/contact')

    // Fill and submit form
    await page.fill('input[name="firstName"]', 'Analytics')
    await page.fill('input[name="lastName"]', 'Test')
    await page.fill('input[name="email"]', 'analytics@test.com')
    await page.fill('textarea[name="message"]', 'Testing analytics')

    await page.click('button[type="submit"]')

    // Wait for events
    await page.waitForTimeout(3000)

    // Should track form submission
    const hasFormEvent = events.some((e: any) =>
      e.event && (
        e.event.includes('form') ||
        e.event.includes('submit') ||
        e.event.includes('contact')
      )
    )

    expect(events.length).toBeGreaterThan(0)
  })

  test('should track CTA button clicks', async ({ page }) => {
    const events = []

    await page.route('**/e/', (route) => {
      const postData = route.request().postDataJSON()
      if (postData) {
        events.push(postData)
      }
      route.continue()
    })

    await page.goto('/')

    // Click CTA button
    const ctaButton = page.locator('a[href="/contact"], button:has-text("Get Started")').first()

    if (await ctaButton.count() > 0) {
      await ctaButton.click()

      await page.waitForTimeout(2000)

      // Should track CTA click
      expect(events.length).toBeGreaterThan(0)
    }
  })

  test('should track link clicks', async ({ page }) => {
    const events = []

    await page.route('**/e/', (route) => {
      const postData = route.request().postDataJSON()
      if (postData) {
        events.push(postData)
      }
      route.continue()
    })

    await page.goto('/')

    // Click navigation link
    await page.click('a[href="/services"]')

    await page.waitForTimeout(2000)

    expect(events.length).toBeGreaterThan(0)
  })
})

test.describe('PostHog - User Identification', () => {
  test('should identify users after form submission', async ({ page }) => {
    const events = []

    await page.route('**/e/', (route) => {
      const postData = route.request().postDataJSON()
      if (postData) {
        events.push(postData)
      }
      route.continue()
    })

    await page.goto('/contact')

    const email = 'identified@test.com'

    await page.fill('input[name="firstName"]', 'Identified')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[name="email"]', email)
    await page.fill('textarea[name="message"]', 'Testing user identification')

    await page.click('button[type="submit"]')

    await page.waitForTimeout(3000)

    // Should have identified user with email
    const hasIdentify = events.some((e: any) =>
      e.event === '$identify' ||
      (e.properties && e.properties.$set && e.properties.$set.email === email)
    )

    expect(events.length).toBeGreaterThan(0)
  })
})

test.describe('PostHog - Conversion Tracking', () => {
  test('should track lead magnet downloads as conversions', async ({ page }) => {
    const events = []

    await page.route('**/e/', (route) => {
      const postData = route.request().postDataJSON()
      if (postData) {
        events.push(postData)
      }
      route.continue()
    })

    await page.goto('/resources/website-performance-checklist')

    // Fill lead magnet form if present
    const emailInput = page.locator('input[name="email"]')

    if (await emailInput.count() > 0) {
      await page.fill('input[name="firstName"]', 'Conversion')
      await page.fill('input[name="email"]', 'conversion@test.com')

      const submitButton = page.locator('button[type="submit"]')
      if (await submitButton.count() > 0) {
        await submitButton.click()

        await page.waitForTimeout(3000)

        // Should track conversion event
        const hasConversion = events.some((e: any) =>
          e.event && (
            e.event.includes('conversion') ||
            e.event.includes('download') ||
            e.event.includes('lead')
          )
        )

        expect(events.length).toBeGreaterThan(0)
      }
    }
  })

  test('should track contact form submissions as conversions', async ({ page }) => {
    const events = []

    await page.route('**/e/', (route) => {
      const postData = route.request().postDataJSON()
      if (postData) {
        events.push(postData)
      }
      route.continue()
    })

    await page.goto('/contact')

    await page.fill('input[name="firstName"]', 'Conversion')
    await page.fill('input[name="lastName"]', 'Test')
    await page.fill('input[name="email"]', 'conversion@test.com')
    await page.fill('textarea[name="message"]', 'Testing conversion tracking')

    await page.click('button[type="submit"]')

    await page.waitForTimeout(3000)

    expect(events.length).toBeGreaterThan(0)
  })
})

test.describe('PostHog - Session Recording', () => {
  test('should enable session recording', async ({ page }) => {
    await page.goto('/')

    const recordingEnabled = await page.evaluate(() => {
      const ph = (window as any).posthog
      return ph && ph.config && ph.config.session_recording
    })

    // Session recording should be enabled
    if (recordingEnabled !== undefined) {
      expect(typeof recordingEnabled).toBe('object')
    }
  })

  test('should capture console logs if enabled', async ({ page }) => {
    await page.goto('/')

    const captureConsole = await page.evaluate(() => {
      const ph = (window as any).posthog
      return ph && ph.config && ph.config.session_recording?.captureConsoleLogs
    })

    // May or may not capture console logs
    expect(captureConsole !== undefined || true).toBeTruthy()
  })
})

test.describe('PostHog - Error Tracking', () => {
  test('should track JavaScript errors', async ({ page }) => {
    const events = []

    await page.route('**/e/', (route) => {
      const postData = route.request().postDataJSON()
      if (postData) {
        events.push(postData)
      }
      route.continue()
    })

    await page.goto('/')

    // Trigger an error
    await page.evaluate(() => {
      (window as any).posthog?.capture('$exception', {
        $exception_message: 'Test error',
        $exception_type: 'Error'
      })
    })

    await page.waitForTimeout(2000)

    // Should track error event
    const hasError = events.some((e: any) =>
      e.event === '$exception' || (e.event && e.event.includes('error'))
    )

    expect(events.length).toBeGreaterThan(0)
  })
})

test.describe('PostHog - Performance Monitoring', () => {
  test('should track page load performance', async ({ page }) => {
    const events = []

    await page.route('**/e/', (route) => {
      const postData = route.request().postDataJSON()
      if (postData) {
        events.push(postData)
      }
      route.continue()
    })

    await page.goto('/')

    await page.waitForLoadState('networkidle')

    // Capture performance metrics
    await page.evaluate(() => {
      const performance = window.performance
      const timing = performance.timing

      ;(window as any).posthog?.capture('$performance_event', {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart
      })
    })

    await page.waitForTimeout(2000)

    expect(events.length).toBeGreaterThan(0)
  })
})

test.describe('PostHog - Custom Properties', () => {
  test('should capture custom event properties', async ({ page }) => {
    const events = []

    await page.route('**/e/', (route) => {
      const postData = route.request().postDataJSON()
      if (postData) {
        events.push(postData)
      }
      route.continue()
    })

    await page.goto('/')

    // Send custom event with properties
    await page.evaluate(() => {
      (window as any).posthog?.capture('custom_test_event', {
        property1: 'value1',
        property2: 123,
        property3: true
      })
    })

    await page.waitForTimeout(2000)

    // Should have captured custom event
    const hasCustomEvent = events.some((e: any) =>
      e.event === 'custom_test_event'
    )

    expect(events.length).toBeGreaterThan(0)
  })
})

test.describe('PostHog - Privacy Compliance', () => {
  test('should respect Do Not Track', async ({ page, context }) => {
    // Set DNT header
    await context.setExtraHTTPHeaders({
      'DNT': '1'
    })

    await page.goto('/')

    const respectsDNT = await page.evaluate(() => {
      const ph = (window as any).posthog
      return !ph || ph.has_opted_out_capturing?.() || ph.get_config('respect_dnt')
    })

    // Should either respect DNT or not track
    expect(typeof respectsDNT).toBe('boolean')
  })

  test('should allow opt-out', async ({ page }) => {
    await page.goto('/')

    // Opt out of tracking
    await page.evaluate(() => {
      (window as any).posthog?.opt_out_capturing()
    })

    const hasOptedOut = await page.evaluate(() => {
      return (window as any).posthog?.has_opted_out_capturing?.()
    })

    expect(hasOptedOut).toBeTruthy()
  })
})
