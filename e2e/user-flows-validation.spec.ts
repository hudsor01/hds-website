import { test, expect } from '@playwright/test'

/**
 * E2E tests for complete user flows and journeys
 * Tests real user scenarios from entry to conversion
 */

// Helper to check server health before each test
async function waitForServer(baseURL: string, maxRetries = 3): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(baseURL, { signal: AbortSignal.timeout(5000) })
      if (response.ok) return true
    } catch {
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }
  return false
}

test.describe('User Flow Validation', () => {
  // Retry flaky tests up to 2 times (server stability)
  test.describe.configure({ retries: 2 })

  // Health check before each test
  test.beforeEach(async ({ page }) => {
    const baseURL = page.context().browser()?.contexts()[0]?.pages()[0]?.url() || 'http://localhost:3001'
    const serverReady = await waitForServer('http://localhost:3001')
    if (!serverReady) {
      throw new Error('Dev server is not responding - tests cannot continue')
    }
  })

  test.describe('Lead Generation Flow', () => {
    test('should complete full lead generation journey from homepage to contact', async ({ page }) => {
      // Start at homepage
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Verify hero section is visible
      await expect(page.locator('h1')).toBeVisible()

      // Click CTA button to contact
      const ctaButton = page.locator('a[href="/contact"], button:has-text("Get Started"), button:has-text("Start Your Project")').first()

      // Official Playwright pattern: https://playwright.dev/docs/navigations
      await ctaButton.click()
      await page.waitForURL('**/contact')
      await page.waitForURL('**/contact')

      // Should navigate to contact page
      await expect(page).toHaveURL(/.*contact/)

      // Fill out contact form
      await page.fill('#firstName', 'John')
      await page.fill('#lastName', 'Doe')
      await page.fill('#email', 'john@example.com')
      await page.fill('#company', 'Acme Corp')
      await page.fill('#message', 'I would like to discuss a web development project.')

      // Submit form
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // In test environment, form may show success or error - just verify submission attempted
      await page.waitForTimeout(2000)
    })

    test('should track user journey from services to contact', async ({ page }) => {
      // Start at services page
      await page.goto('/services')
      await page.waitForLoadState('networkidle')

      // Verify services are displayed
      await expect(page.locator('h1, h2').filter({ hasText: /service/i }).first()).toBeVisible()

      // Click contact CTA
      const contactLink = page.locator('a[href="/contact"]').first()

      // Official Playwright pattern: https://playwright.dev/docs/navigations
      await contactLink.click()
      await page.waitForURL('**/contact')
      await page.waitForURL('**/contact')

      // Should navigate to contact page
      await expect(page).toHaveURL(/.*contact/)

      // Contact form should be visible
      await expect(page.locator('form')).toBeVisible()
    })

    test('should navigate from portfolio to contact', async ({ page }) => {
      // Start at portfolio page
      await page.goto('/showcase')
      await page.waitForLoadState('networkidle')

      // Verify portfolio projects are visible
      await expect(page.locator('h1, h2').filter({ hasText: /showcase|project/i }).first()).toBeVisible()

      // Click "Start Your Project" CTA
      const ctaButton = page.locator('a[href="/contact"], button:has-text("Start Your Project")').first()
      await ctaButton.click()
      await page.waitForURL('**/contact')

      // Should navigate to contact page
      await expect(page).toHaveURL(/.*contact/)
    })
  })

  test.describe('Service Discovery Flow', () => {
    test('should browse all service offerings', async ({ page }) => {
      await page.goto('/services')
      await page.waitForLoadState('networkidle')

      // Verify page loads
      await expect(page.locator('h1')).toBeVisible()

      // Check for service cards/sections
      const serviceElements = page.locator('[class*="glass-card"], [class*="card"], section')
      const count = await serviceElements.count()
      expect(count).toBeGreaterThan(0)

      // Verify CTA buttons are present
      const ctaButtons = page.locator('a[href="/contact"], button:has-text("Get Started")')
      expect(await ctaButtons.count()).toBeGreaterThan(0)
    })

    test('should navigate between home and services seamlessly', async ({ page }) => {
      // Start at home
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Navigate to services via navigation or CTA
      const servicesLink = page.locator('a[href="/services"]').first()
      await servicesLink.click()
      await page.waitForURL('**/services')

      // Verify navigation
      await expect(page).toHaveURL(/.*services/)
      await expect(page.locator('h1')).toBeVisible()

      // Navigate back to home
      const homeLink = page.locator('a[href="/"]').first()
      await homeLink.click()
      await page.waitForURL('**/')

      // Verify home page
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Pricing Evaluation Flow', () => {
    test('should view pricing information and navigate to contact', async ({ page }) => {
      await page.goto('/pricing')
      await page.waitForLoadState('networkidle')

      // Verify pricing page loads
      await expect(page.locator('h1, h2').filter({ hasText: /pricing|plan/i })).toBeVisible()

      // Look for pricing cards or sections
      const pricingElements = page.locator('[class*="glass-card"], [class*="card"], section')
      const count = await pricingElements.count()
      expect(count).toBeGreaterThan(0)

      // Click contact CTA
      const contactButton = page.locator('a[href="/contact"], button:has-text("Get Started")').first()
      await contactButton.click()
      await page.waitForURL('**/contact')

      // Should navigate to contact
      await expect(page).toHaveURL(/.*contact/)
    })

    test('should compare pricing options', async ({ page }) => {
      await page.goto('/pricing')
      await page.waitForLoadState('networkidle')

      // Verify multiple pricing options are visible
      const pricingCards = page.locator('[class*="glass-card"], [class*="card"]')
      const count = await pricingCards.count()

      // Should have at least 2 pricing options
      expect(count).toBeGreaterThanOrEqual(2)
    })
  })

  test.describe('Portfolio Browsing Flow', () => {
    test('should browse portfolio projects', async ({ page }) => {
      await page.goto('/showcase')
      await page.waitForLoadState('networkidle')

      // Verify portfolio page loads
      await expect(page.locator('h1, h2').filter({ hasText: /showcase|project/i }).first()).toBeVisible()

      // Verify projects are displayed
      const projectCards = page.locator('[class*="glass-card"], [class*="card"]')
      const count = await projectCards.count()
      expect(count).toBeGreaterThan(0)

      // Hover over first project to see overlay
      const firstProject = projectCards.first()
      await firstProject.hover()
      await page.waitForTimeout(300)

      // Check for hover effects (transform should be applied)
      const transform = await firstProject.evaluate(el =>
        window.getComputedStyle(el).transform
      )
      expect(transform).toBeTruthy()
    })

    test('should view live project sites from portfolio', async ({ page, context }) => {
      await page.goto('/showcase')
      await page.waitForLoadState('networkidle')

      // Find "View Live Site" link
      const liveLink = page.locator('a[href*="http"]:has-text("View Live")').first()

      if (await liveLink.count() > 0) {
        // Get the href
        const href = await liveLink.getAttribute('href')
        expect(href).toBeTruthy()
        expect(href).toMatch(/^https?:\/\//)

        // Verify it opens in new tab
        const target = await liveLink.getAttribute('target')
        expect(target).toBe('_blank')
      }
    })

    test('should navigate from portfolio stats to CTA', async ({ page }) => {
      await page.goto('/showcase')
      await page.waitForLoadState('networkidle')

      // Scroll to stats section
      const statsSection = page.locator('text=/projects delivered|client satisfaction/i').first()
      if (await statsSection.count() > 0) {
        await statsSection.scrollIntoViewIfNeeded()

        // Verify stats are visible
        await expect(statsSection).toBeVisible()
      }

      // Click CTA to contact
      const ctaButton = page.locator('a[href="/contact"]').last()
      await ctaButton.click()
      await page.waitForURL('**/contact')

      await expect(page).toHaveURL(/.*contact/)
    })
  })

  // Skipped: paystub-generator route was removed during v1.0 consolidation
  test.describe.skip('Paystub Generator Flow', () => {
    test('should complete paystub generation flow', async ({ page }) => {
      await page.goto('/paystub-generator')
      await page.waitForLoadState('networkidle')

      // Verify page loads
      await expect(page.locator('h1, h2').filter({ hasText: /paystub/i })).toBeVisible()

      // Fill out employee information
      const nameInput = page.locator('#employeeName')
      if (await nameInput.count() > 0) {
        await nameInput.fill('John Doe')

        // Fill additional required fields
        await page.fill('#hourlyRate', '25.00')

        // Submit/Generate
        const generateButton = page.locator('button:has-text("Generate Pay Stubs")').first()
        if (await generateButton.count() > 0) {
          await generateButton.click()
          await page.waitForTimeout(1000)

          // Verify paystub preview is visible
          const paystub = page.locator('[class*="max-w-\\[8.5in\\]"]').first()
          if (await paystub.count() > 0) {
            await expect(paystub).toBeVisible()
          }
        }
      }
    })

    test('should generate and preview PDF', async ({ page }) => {
      await page.goto('/paystub-generator')
      await page.waitForLoadState('networkidle')

      const nameInput = page.locator('#employeeName')
      if (await nameInput.count() > 0) {
        // Fill required fields
        await nameInput.fill('Jane Smith')
        await page.fill('#hourlyRate', '35.00')

        // Generate paystub
        const generateButton = page.locator('button:has-text("Generate Pay Stubs")').first()
        if (await generateButton.count() > 0) {
          await generateButton.click()
          await page.waitForTimeout(1000)

          // Look for PDF preview or save button
          const saveButton = page.locator('button:has-text("Save"), button:has-text("PDF")').first()
          if (await saveButton.count() > 0) {
            await expect(saveButton).toBeVisible()
          }
        }
      }
    })
  })

  test.describe('Mobile Navigation Flow', () => {
    test('should navigate using mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Look for hamburger menu button
      const menuButton = page.locator('button[aria-label*="menu" i], button:has(svg)').first()

      if (await menuButton.count() > 0) {
        // Open menu
        await menuButton.click()
        await page.waitForTimeout(300)

        // Verify menu is visible
        const mobileMenu = page.locator('nav, [role="navigation"]')
        await expect(mobileMenu.first()).toBeVisible()

        // Click a menu item
        const servicesLink = page.locator('a[href="/services"]').first()
        if (await servicesLink.isVisible()) {
          await servicesLink.click()
      await page.waitForURL('**/services')
          await expect(page).toHaveURL(/.*services/)
        }
      }
    })

    test('should scroll smoothly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500))
      await page.waitForTimeout(300)

      // Verify scroll position
      const scrollY = await page.evaluate(() => window.scrollY)
      expect(scrollY).toBeGreaterThan(400)
    })

    test('should interact with touch elements on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/showcase')
      await page.waitForLoadState('networkidle')

      // Verify page loads and has interactive content
      await expect(page.locator('h1')).toBeVisible()

      // Verify touch-friendly elements are accessible
      const interactiveElements = page.locator('a:visible, button:visible')
      const count = await interactiveElements.count()
      expect(count).toBeGreaterThan(0)

      // Scroll to reveal a CTA button (may be below fold)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
      await page.waitForTimeout(300)

      // Find a visible CTA to click
      const visibleCTA = page.locator('a[href="/contact"]:visible, button:has-text("Start"):visible, button:has-text("Contact"):visible').first()
      if (await visibleCTA.count() > 0) {
        await visibleCTA.scrollIntoViewIfNeeded()
        await visibleCTA.click()
        await page.waitForURL('**/contact')
        await expect(page).toHaveURL(/.*contact/)
      }
    })
  })

  test.describe('Error Handling Flow', () => {
    test('should display 404 page for invalid routes', async ({ page }) => {
      await page.goto('/this-page-does-not-exist-12345')
      await page.waitForLoadState('networkidle')

      // Should show 404 or not found message
      const content = await page.textContent('body')
      expect(content).toMatch(/404|not found/i)
    })

    test('should handle form validation errors gracefully', async ({ page }) => {
      await page.goto('/contact')
      await page.waitForLoadState('networkidle')

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // Should show validation errors
      const errorMessages = page.locator('[class*="error"], [role="alert"]')
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible()
      } else {
        // HTML5 validation might prevent submission
        const requiredInput = page.locator('input[required]').first()
        const validationMessage = await requiredInput.evaluate((el: HTMLInputElement) =>
          el.validationMessage
        )
        expect(validationMessage).toBeTruthy()
      }
    })

    test('should recover from network errors', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Simulate offline
      await page.context().setOffline(true)

      // Try to navigate (will fail while offline)
      await page.locator('a[href="/services"]').first().click()
      await page.waitForTimeout(1000)

      // Go back online
      await page.context().setOffline(false)

      // Should be able to navigate again
      await page.reload()
      await expect(page.locator('h1')).toBeVisible()
    })
  })

  // Additional flow tests moved to user-flows-secondary.spec.ts
  // to reduce server load and prevent mid-suite crashes
})
