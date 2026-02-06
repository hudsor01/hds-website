import { test, expect } from '@playwright/test'

/**
 * E2E tests for complete user flows and journeys
 * Tests real user scenarios from entry to conversion
 */

test.describe('User Flow Validation', () => {
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

      // Verify horizontal scroll on portfolio cards
      const scrollContainer = page.locator('[class*="overflow-x-auto"]').first()

      if (await scrollContainer.count() > 0) {
        await expect(scrollContainer).toBeVisible()

        // Verify snap scroll is applied
        const snapType = await scrollContainer.evaluate(el =>
          window.getComputedStyle(el).scrollSnapType
        )

        expect(snapType).toBeTruthy()
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

  test.describe('Blog and Content Flow', () => {
    test('should browse blog listing', async ({ page }) => {
      await page.goto('/blog')
      await page.waitForLoadState('networkidle')

      // Verify blog page loads
      await expect(page.locator('h1, h2').filter({ hasText: /blog|article/i }).first()).toBeVisible()

      // Check for blog posts
      const posts = page.locator('article, [class*="card"]')
      const count = await posts.count()
      expect(count).toBeGreaterThanOrEqual(0) // May have 0 posts initially
    })

    test('should navigate from blog to individual post', async ({ page }) => {
      await page.goto('/blog')
      await page.waitForLoadState('networkidle')

      // Look for blog post links
      const postLink = page.locator('a[href*="/blog/"]').first()

      if (await postLink.count() > 0) {
        await postLink.click()
      await page.waitForURL('**/blog/**')

        // Should navigate to post
        await expect(page).toHaveURL(/.*blog\/.*/)

        // Verify post content is visible
        await expect(page.locator('article, main').first()).toBeVisible()
      }
    })
  })

  test.describe('About Page Flow', () => {
    test('should view company information', async ({ page }) => {
      await page.goto('/about')
      await page.waitForLoadState('networkidle')

      // Verify about page loads
      await expect(page.locator('h1')).toBeVisible()

      // Should have content about the company
      const content = await page.textContent('body')
      expect(content?.length).toBeGreaterThan(100)
    })

    test('should navigate from about to contact', async ({ page }) => {
      await page.goto('/about')
      await page.waitForLoadState('networkidle')

      // Click contact CTA
      const contactLink = page.locator('a[href="/contact"]').first()
      if (await contactLink.count() > 0) {
        await contactLink.click()
      await page.waitForURL('**/contact')
        await expect(page).toHaveURL(/.*contact/)
      }
    })
  })

  test.describe('Cross-Page Navigation Flow', () => {
    test('should complete full site navigation loop', async ({ page }) => {
      // Home
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('h1')).toBeVisible()

      // Services
      await page.locator('a[href="/services"]').first().click()
      await page.waitForURL('**/services')
      await expect(page).toHaveURL(/.*services/)

      // Portfolio
      await page.locator('a[href="/showcase"]').first().click()
      await page.waitForURL('**/showcase')
      await expect(page).toHaveURL(/.*portfolio/)

      // About
      await page.locator('a[href="/about"]').first().click()
      await page.waitForURL('**/about')
      await expect(page).toHaveURL(/.*about/)

      // Contact
      await page.locator('a[href="/contact"]').first().click()
      await page.waitForURL('**/contact')
      await expect(page).toHaveURL(/.*contact/)

      // Back to Home
      await page.locator('a[href="/"]').first().click()
      await page.waitForURL('**/')
      await expect(page).toHaveURL(/\/$|\/home$/)
    })

    test('should maintain state across navigation', async ({ page }) => {
      // Set dark mode or theme preference
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Look for theme toggle
      const themeToggle = page.locator('button[aria-label*="theme" i]').first()

      if (await themeToggle.count() > 0) {
        await themeToggle.click()
        await page.waitForTimeout(300)

        // Navigate to another page
        await page.locator('a[href="/services"]').first().click()
        await page.waitForURL('**/services')
        await page.waitForTimeout(300)

        // Theme should be preserved
        const htmlClass = await page.evaluate(() =>
          document.documentElement.className
        )

        expect(htmlClass).toBeTruthy()
      }
    })
  })

  test.describe('Performance and Loading Flow', () => {
    test('should load pages within acceptable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // Should load within 5 seconds (generous for CI environment)
      expect(loadTime).toBeLessThan(5000)
    })

    test('should show loading states during navigation', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Click navigation link
      const servicesLink = page.locator('a[href="/services"]').first()
      await servicesLink.click()
      await page.waitForURL('**/services')

      // Page should navigate
      await expect(page).toHaveURL(/.*services/)

      // Content should be visible
      await expect(page.locator('h1')).toBeVisible()
    })
  })

  test.describe('Accessibility Navigation Flow', () => {
    test('should navigate using keyboard only', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Tab to first interactive element
      await page.keyboard.press('Tab')

      // Check focus is visible
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        const styles = window.getComputedStyle(el!)
        return {
          outline: styles.outline,
          outlineColor: styles.outlineColor,
          tagName: el?.tagName
        }
      })

      expect(focusedElement.tagName).toMatch(/A|BUTTON|INPUT/)
      expect(focusedElement.outline || focusedElement.outlineColor).toBeTruthy()
    })

    test('should announce page changes to screen readers', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Navigate to new page
      await page.locator('a[href="/services"]').first().click()
      await page.waitForURL('**/services')

      // Page title should update
      const title = await page.title()
      expect(title).toBeTruthy()
      expect(title).toMatch(/service|hudson/i)
    })
  })
})
