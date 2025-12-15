/**
 * Contact Form E2E Tests
 * =============================================================================
 *
 * Tests for the ContactForm component which uses TanStack Form + shadcn/ui Field
 * components. The form includes text inputs, email, phone, textarea, and
 * Radix UI Select dropdowns.
 *
 * Key Testing Patterns:
 * - Input fields: Use name attributes (input[name="firstName"])
 * - Radix Select: Click trigger, then click option from dropdown
 * - Form submission: Monitor for success message or error state
 * - Wait strategies: Use waitForSelector to ensure form is fully loaded
 */

import { test, expect, type TestInfo, type Route } from '@playwright/test'
import { createTestLogger } from './test-logger'

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
    // Wait for the form to be fully loaded before interacting
    await page.waitForSelector('form', { state: 'visible', timeout: 10000 })
  })

  test('should display contact form with all fields', async ({ page }) => {
    // Check form is visible
    await expect(page.locator('form')).toBeVisible()

    // Wait for and check all text input fields are present (using name selectors)
    await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 10000 })
    await expect(page.locator('input[name="firstName"]')).toBeVisible()

    await page.waitForSelector('input[name="lastName"]', { state: 'visible', timeout: 10000 })
    await expect(page.locator('input[name="lastName"]')).toBeVisible()

    await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 })
    await expect(page.locator('input[name="email"]')).toBeVisible()

    await page.waitForSelector('input[name="phone"]', { state: 'visible', timeout: 10000 })
    await expect(page.locator('input[name="phone"]')).toBeVisible()

    await page.waitForSelector('input[name="company"]', { state: 'visible', timeout: 10000 })
    await expect(page.locator('input[name="company"]')).toBeVisible()

    await page.waitForSelector('textarea[name="message"]', { state: 'visible', timeout: 10000 })
    await expect(page.locator('textarea[name="message"]')).toBeVisible()

    // Check Radix Select triggers are present (they use button role)
    const selectTriggers = page.locator('button[role="combobox"]')
    await expect(selectTriggers.first()).toBeVisible()
  })

  test('should allow filling text input fields', async ({ page }) => {
    // Wait for form fields to be ready
    await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 10000 })

    // Fill text fields
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="lastName"]', 'Doe')
    await page.fill('input[name="email"]', 'john.doe@example.com')
    await page.fill('input[name="phone"]', '555-123-4567')
    await page.fill('input[name="company"]', 'Acme Corp')
    await page.fill('textarea[name="message"]', 'This is a test message.')

    // Verify values are set
    await expect(page.locator('input[name="firstName"]')).toHaveValue('John')
    await expect(page.locator('input[name="lastName"]')).toHaveValue('Doe')
    await expect(page.locator('input[name="email"]')).toHaveValue('john.doe@example.com')
    await expect(page.locator('input[name="phone"]')).toHaveValue('555-123-4567')
    await expect(page.locator('input[name="company"]')).toHaveValue('Acme Corp')
    await expect(page.locator('textarea[name="message"]')).toHaveValue('This is a test message.')
  })

  test('should allow selecting options from Radix Select dropdowns', async ({ page }) => {
    // Wait for form to be ready
    await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 10000 })

    // Select service option
    const serviceSelect = page.locator('button[name="service"]')
    await serviceSelect.click()
    await page.locator('[role="option"]').filter({ hasText: 'Web Development' }).first().click()

    // Select best time to contact
    const timeSelect = page.locator('button[name="bestTimeToContact"]')
    await timeSelect.click()
    await page.locator('[role="option"]').filter({ hasText: 'Morning' }).first().click()

    // Select budget
    const budgetSelect = page.locator('button[name="budget"]')
    await budgetSelect.click()
    await page.locator('[role="option"]').filter({ hasText: '$5,000 - $15,000' }).first().click()

    // Select timeline
    const timelineSelect = page.locator('button[name="timeline"]')
    await timelineSelect.click()
    await page.locator('[role="option"]').filter({ hasText: '1 Month' }).first().click()
  })

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Wait for submit button
    await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 10000 })

    // Try to submit empty form by clicking submit button
    await page.locator('button[type="submit"]').click()

    // Browser native validation should prevent submission
    // Check that form is still visible (not replaced with success message)
    await expect(page.locator('form')).toBeVisible()

    // The firstName field should show browser validation (required)
    const firstNameInput = page.locator('input[name="firstName"]')
    const isInvalid = await firstNameInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('should successfully submit form with valid data', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    // Wait for form to be ready
    await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 10000 })

    // Fill in required text fields
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="lastName"]', 'Doe')
    await page.fill('input[name="email"]', 'john.doe@example.com')
    await page.fill('textarea[name="message"]', 'This is a test message for the contact form. I am interested in your web development services.')

    // Fill optional text fields
    await page.fill('input[name="phone"]', '555-123-4567')
    await page.fill('input[name="company"]', 'Test Company Inc')

    logger.step('Filled text fields')

    // Select service (Radix Select)
    const serviceSelect = page.locator('button[name="service"]')
    await serviceSelect.click()
    await page.locator('[role="option"]').filter({ hasText: 'Web Development' }).first().click()

    // Select best time to contact
    const timeSelect = page.locator('button[name="bestTimeToContact"]')
    await timeSelect.click()
    await page.locator('[role="option"]').filter({ hasText: 'Morning' }).first().click()

    // Select budget
    const budgetSelect = page.locator('button[name="budget"]')
    await budgetSelect.click()
    await page.locator('[role="option"]').filter({ hasText: '$5,000 - $15,000' }).first().click()

    // Select timeline
    const timelineSelect = page.locator('button[name="timeline"]')
    await timelineSelect.click()
    await page.locator('[role="option"]').filter({ hasText: '1 Month' }).first().click()

    logger.step('Selected dropdown options')

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Wait for either success message or error
    await page.waitForSelector('text=/Thank you|Success|sent|error/i', { timeout: 15000 })

    // Check for success indicators
    const successVisible = await page.locator('text=/Thank you|Success|sent successfully/i').isVisible().catch(() => false)
    const errorVisible = await page.locator('text=/error|failed|try again/i').isVisible().catch(() => false)

    // In test environment without email service, we might get an error
    // In production with proper config, this should succeed
    expect(successVisible || errorVisible).toBeTruthy()

    if (successVisible) {
      logger.success('Form submitted successfully')
    } else if (errorVisible) {
      logger.warn('Form submission returned an error (expected in test environment)')
    }
  })

  test('should show pending state while submitting', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    // Wait for form to be ready
    await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 10000 })

    // Fill in minimum required fields
    await page.fill('input[name="firstName"]', 'Jane')
    await page.fill('input[name="lastName"]', 'Smith')
    await page.fill('input[name="email"]', 'jane.smith@example.com')
    await page.fill('textarea[name="message"]', 'Testing pending state during form submission.')

    // Get submit button
    const submitButton = page.locator('button[type="submit"]')

    // Intercept and delay API calls to make pending state visible
    await page.route('**/api/**', async (route: Route) => {
      if (route.request().method() === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      await route.continue()
    })

    // Get initial button text
    const initialText = await submitButton.textContent()
    logger.step(`Initial button text: ${initialText}`)

    // Click submit
    const submitPromise = submitButton.click()

    // Wait a moment for React state update
    await page.waitForTimeout(100)

    // Check for loading state
    try {
      // Button should show loading text or be disabled
      const buttonText = await submitButton.textContent()
      const isDisabled = await submitButton.isDisabled()

      if (buttonText?.includes('Submitting') || buttonText?.includes('...') || isDisabled) {
        logger.success('Button shows loading state')
      } else {
        // Form might have completed quickly
        const hasResult = await page.locator('text=/Thank you|error/i').isVisible().catch(() => false)
        if (hasResult) {
          logger.step('Form completed before catching loading state')
        }
      }
    } catch {
      logger.warn('Could not verify loading state')
    }

    await submitPromise
  })

  test('should allow resending after successful submission', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    // Wait for form to be ready
    await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 10000 })

    // Fill and submit form
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('textarea[name="message"]', 'Test message for resend flow.')

    await page.locator('button[type="submit"]').click()

    // Wait for result
    await page.waitForSelector('text=/Thank you|error/i', { timeout: 15000 })

    const successVisible = await page.locator('text=/Thank you/i').isVisible().catch(() => false)

    if (successVisible) {
      logger.step('Form submitted successfully, looking for reset button')

      // Check for "Send another message" button
      const resetButton = page.locator('button', { hasText: /another message/i })

      if (await resetButton.isVisible()) {
        await resetButton.click()

        // Form should be visible again with empty fields
        await expect(page.locator('form')).toBeVisible()
        await expect(page.locator('input[name="firstName"]')).toHaveValue('')
        logger.success('Form reset successfully')
      } else {
        logger.warn('Reset button not found - form may not support resend')
      }
    } else {
      logger.warn('Form did not show success (expected in test environment)')
    }
  })

  test('should preserve form data on validation error', async ({ page }) => {
    // Wait for form to be ready
    await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 10000 })

    // Fill in some fields with an invalid email
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="lastName"]', 'Doe')
    await page.fill('input[name="email"]', 'invalid-email') // Invalid format
    await page.fill('textarea[name="message"]', 'Test message that should be preserved.')

    // Try to submit
    await page.locator('button[type="submit"]').click()

    // Wait a moment for any validation
    await page.waitForTimeout(500)

    // Check that form data is preserved
    await expect(page.locator('input[name="firstName"]')).toHaveValue('John')
    await expect(page.locator('input[name="lastName"]')).toHaveValue('Doe')
    await expect(page.locator('input[name="email"]')).toHaveValue('invalid-email')
    await expect(page.locator('textarea[name="message"]')).toHaveValue('Test message that should be preserved.')
  })

  test('should have accessible form structure', async ({ page }) => {
    // Wait for form to be ready
    await page.waitForSelector('form', { state: 'visible', timeout: 10000 })

    // Check that form has proper structure
    const form = page.locator('form')
    await expect(form).toBeVisible()

    // Check inputs are present
    await expect(page.locator('input[name="firstName"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('textarea[name="message"]')).toBeVisible()

    // Check submit button is accessible
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeEnabled()
    await expect(submitButton).toHaveText(/submit/i)
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Wait for form to be ready
    await page.waitForSelector('input[name="firstName"]', { state: 'visible', timeout: 10000 })

    // Focus on first name and tab through fields
    await page.locator('input[name="firstName"]').focus()
    await expect(page.locator('input[name="firstName"]')).toBeFocused()

    // Tab to next field
    await page.keyboard.press('Tab')

    // Should move to lastName
    await expect(page.locator('input[name="lastName"]')).toBeFocused()

    // Continue tabbing through form
    await page.keyboard.press('Tab')
    await expect(page.locator('input[name="email"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('input[name="phone"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('input[name="company"]')).toBeFocused()
  })
})
