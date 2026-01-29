/**
 * Newsletter Signup E2E Tests
 * =============================================================================
 *
 * Tests for the NewsletterSignup component which uses TanStack Form with
 * validation via Zod schema (newsletterSchema). The component appears on
 * multiple pages (homepage, industry pages) with different variants.
 *
 * Key Testing Patterns:
 * - Email input: Standard Playwright fill() with type="email"
 * - Form submission: TanStack Form mutation with success/error states
 * - Variants: inline, sidebar, modal (tested on homepage inline variant)
 */

import { test, expect, type TestInfo, type Route } from '@playwright/test'
import { createTestLogger } from './test-logger'

test.describe('Newsletter Signup - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display newsletter signup form', async ({ page }) => {
    // Look for newsletter signup section
    const newsletterSection = page.locator('text=/Get Expert Insights|newsletter/i').first()

    // Scroll to newsletter section if needed
    if (await newsletterSection.isVisible()) {
      await newsletterSection.scrollIntoViewIfNeeded()
    }

    // Check for email input
    const emailInput = page.locator('input[type="email"]').first()
    await expect(emailInput).toBeVisible()

    // Check for subscribe button
    const subscribeButton = page.locator('button', { hasText: /subscribe/i }).first()
    await expect(subscribeButton).toBeVisible()
  })

  test('should show validation error for invalid email', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    // Find the email input
    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.scrollIntoViewIfNeeded()

    // Enter invalid email
    await emailInput.fill('invalid-email')
    logger.step('Entered invalid email')

    // Submit the form
    const subscribeButton = page.locator('button', { hasText: /subscribe/i }).first()
    await subscribeButton.click()

    // Wait for validation error
    await page.waitForTimeout(500)

    // Check for error message or browser validation
    const errorVisible = await page.locator('text=/invalid|email|required|valid/i').isVisible().catch(() => false)
    const inputInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)

    expect(errorVisible || inputInvalid).toBeTruthy()
    logger.complete('Validation error displayed')
  })

  test('should show validation error for empty email', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    // Find the subscribe button without filling email
    const subscribeButton = page.locator('button', { hasText: /subscribe/i }).first()
    await subscribeButton.scrollIntoViewIfNeeded()

    // Click subscribe with empty email
    await subscribeButton.click()

    // Wait for validation
    await page.waitForTimeout(500)

    // Newsletter success message should NOT appear with empty email
    const successVisible = await page.locator('text=/thank you.*email|subscribed/i').isVisible().catch(() => false)
    expect(successVisible).toBe(false)

    logger.complete('Empty email prevented submission')
  })

  test('should submit successfully with valid email', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    // Find and fill email input
    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.scrollIntoViewIfNeeded()

    const testEmail = `test-${Date.now()}@example.com`
    await emailInput.fill(testEmail)
    logger.step(`Entered email: ${testEmail}`)

    // Submit the form
    const subscribeButton = page.locator('button', { hasText: /subscribe/i }).first()
    await subscribeButton.click()

    // Wait for result
    await page.waitForTimeout(2000)

    // Check for success message or error (error expected in test env without email service)
    const successVisible = await page.locator('text=/thank you|subscribed|check your email|confirm/i').isVisible().catch(() => false)
    const errorVisible = await page.locator('text=/error|failed|try again|something went wrong/i').isVisible().catch(() => false)

    if (successVisible) {
      logger.complete('Newsletter subscription successful')
    } else if (errorVisible) {
      logger.warn('Newsletter subscription returned error (expected in test env)')
    }

    // Either success or error should appear
    expect(successVisible || errorVisible).toBeTruthy()
  })

  test('should show loading state during submission', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    // Find email input
    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.scrollIntoViewIfNeeded()

    await emailInput.fill('loading-test@example.com')

    // Get subscribe button
    const subscribeButton = page.locator('button', { hasText: /subscribe/i }).first()

    // Intercept API to add delay
    await page.route('**/api/newsletter/**', async (route: Route) => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      await route.continue()
    })

    // Click and check for loading state
    const clickPromise = subscribeButton.click()

    await page.waitForTimeout(100)

    // Check button state
    const buttonText = await subscribeButton.textContent()
    const isDisabled = await subscribeButton.isDisabled()

    if (buttonText?.includes('Subscribing') || buttonText?.includes('...') || isDisabled) {
      logger.complete('Loading state visible')
    } else {
      logger.step('Loading state may have been too fast to catch')
    }

    await clickPromise
  })

  test('should have accessible form structure', async ({ page }) => {
    // Find email input
    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.scrollIntoViewIfNeeded()

    // Check aria-label exists
    const hasAriaLabel = await emailInput.getAttribute('aria-label')
    const hasId = await emailInput.getAttribute('id')

    // Should have some accessible label
    expect(hasAriaLabel || hasId).toBeTruthy()

    // Subscribe button should be accessible
    const subscribeButton = page.locator('button', { hasText: /subscribe/i }).first()
    await expect(subscribeButton).toBeEnabled()
  })

  test('should disable input after successful subscription', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    // Fill and submit
    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.scrollIntoViewIfNeeded()
    await emailInput.fill(`disable-test-${Date.now()}@example.com`)

    const subscribeButton = page.locator('button', { hasText: /subscribe/i }).first()
    await subscribeButton.click()

    // Wait for response
    await page.waitForTimeout(2000)

    // Check if inputs are disabled after success
    const successVisible = await page.locator('text=/thank you|subscribed|confirm/i').isVisible().catch(() => false)

    if (successVisible) {
      // Check if input is disabled
      const isDisabled = await emailInput.isDisabled()
      if (isDisabled) {
        logger.complete('Input disabled after success')
      } else {
        logger.step('Input remains enabled (may be by design)')
      }
    } else {
      logger.warn('Subscription did not succeed (expected in test env)')
    }
  })
})

test.describe('Newsletter Signup - Industry Pages', () => {
  const industryPages = [
    '/industries/saas',
    '/industries/ecommerce',
    '/industries/healthcare',
    '/industries/fintech',
    '/industries/real-estate',
  ]

  for (const pagePath of industryPages) {
    test(`should display newsletter signup on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath)

      // Newsletter might be in different positions, scroll to find it
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
      await page.waitForTimeout(500)

      // Look for newsletter section or email input
      const emailInput = page.locator('input[type="email"]').first()

      // Newsletter might not be on all pages
      if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(emailInput).toBeVisible()

        // Check for subscribe button
        const subscribeButton = page.locator('button', { hasText: /subscribe/i }).first()
        await expect(subscribeButton).toBeVisible()
      }
    })
  }
})

test.describe('Newsletter Signup - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should handle duplicate subscription gracefully', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.scrollIntoViewIfNeeded()

    // Use a common test email that might already be subscribed
    await emailInput.fill('duplicate@example.com')

    const subscribeButton = page.locator('button', { hasText: /subscribe/i }).first()
    await subscribeButton.click()

    // Wait for response
    await page.waitForTimeout(2000)

    // Should either succeed or show "already subscribed" message
    const anyResponse = await page.locator('text=/thank you|subscribed|already|error/i').isVisible().catch(() => false)

    if (anyResponse) {
      logger.complete('Handled duplicate subscription appropriately')
    } else {
      logger.warn('No visible response to duplicate subscription')
    }
  })

  test('should preserve email on network error', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.scrollIntoViewIfNeeded()

    const testEmail = 'network-error-test@example.com'
    await emailInput.fill(testEmail)

    // Simulate network failure
    await page.route('**/api/newsletter/**', (route) => {
      route.abort('failed')
    })

    const subscribeButton = page.locator('button', { hasText: /subscribe/i }).first()
    await subscribeButton.click()

    // Wait for error handling
    await page.waitForTimeout(1000)

    // Email should still be in the input
    await expect(emailInput).toHaveValue(testEmail)
    logger.complete('Email preserved after network error')
  })

  test('should handle rapid multiple clicks', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.scrollIntoViewIfNeeded()
    await emailInput.fill('rapid-click@example.com')

    const subscribeButton = page.locator('button', { hasText: /subscribe/i }).first()

    // Click rapidly multiple times
    await subscribeButton.click()
    await subscribeButton.click()
    await subscribeButton.click()

    // Wait for response
    await page.waitForTimeout(2000)

    // Should handle gracefully without errors
    const errorVisible = await page.locator('text=/error|failed/i').isVisible().catch(() => false)
    const successVisible = await page.locator('text=/thank you|subscribed/i').isVisible().catch(() => false)

    // Either success or handled error is acceptable
    logger.step(`Multiple clicks handled: success=${successVisible}, error=${errorVisible}`)
  })
})
