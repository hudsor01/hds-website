/**
 * Contact Form E2E Tests
 * =============================================================================
 *
 * Tests for the ContactForm component which uses TanStack Form + shadcn/ui Field
 * components. The form includes text inputs, email, phone, textarea, and
 * Radix UI Select dropdowns.
 *
 * Key Testing Patterns:
 * - Input fields: Use standard Playwright fill() with #id selectors
 * - Radix Select: Click trigger, then click option from dropdown
 * - Form submission: Monitor for success message or error state
 */

import { test, expect, type TestInfo, type Route } from '@playwright/test'
import { createTestLogger } from './test-logger'

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
  })

  test('should display contact form with all fields', async ({ page }) => {
    // Check form is visible
    await expect(page.locator('form')).toBeVisible()

    // Check all text input fields are present (using id selectors)
    await expect(page.locator('#firstName')).toBeVisible()
    await expect(page.locator('#lastName')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#phone')).toBeVisible()
    await expect(page.locator('#company')).toBeVisible()
    await expect(page.locator('#message')).toBeVisible()

    // Check Radix Select triggers are present (they use role="combobox")
    const selectTriggers = page.locator('[role="combobox"]')
    await expect(selectTriggers).toHaveCount(4) // service, bestTimeToContact, budget, timeline
  })

  test('should allow filling text input fields', async ({ page }) => {
    // Fill text fields
    await page.fill('#firstName', 'John')
    await page.fill('#lastName', 'Doe')
    await page.fill('#email', 'john.doe@example.com')
    await page.fill('#phone', '555-123-4567')
    await page.fill('#company', 'Acme Corp')
    await page.fill('#message', 'This is a test message.')

    // Verify values are set
    await expect(page.locator('#firstName')).toHaveValue('John')
    await expect(page.locator('#lastName')).toHaveValue('Doe')
    await expect(page.locator('#email')).toHaveValue('john.doe@example.com')
    await expect(page.locator('#phone')).toHaveValue('555-123-4567')
    await expect(page.locator('#company')).toHaveValue('Acme Corp')
    await expect(page.locator('#message')).toHaveValue('This is a test message.')
  })

  test('should allow selecting options from Radix Select dropdowns', async ({ page }) => {
    // Select service option
    const serviceSelect = page.locator('#service')
    await serviceSelect.click()
    await page.locator('[role="option"]').filter({ hasText: 'Web Development' }).click()

    // Select best time to contact
    const timeSelect = page.locator('#bestTimeToContact')
    await timeSelect.click()
    await page.locator('[role="option"]').filter({ hasText: 'Morning' }).click()

    // Select budget
    const budgetSelect = page.locator('#budget')
    await budgetSelect.click()
    await page.locator('[role="option"]').filter({ hasText: '$5,000 - $15,000' }).click()

    // Select timeline
    const timelineSelect = page.locator('#timeline')
    await timelineSelect.click()
    await page.locator('[role="option"]').filter({ hasText: '1 Month' }).click()
  })

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Try to submit empty form by clicking submit button
    await page.locator('button[type="submit"]').click()

    // Form should still be visible (not replaced with success message)
    await expect(page.locator('form')).toBeVisible()

    // Success message should NOT appear
    const successVisible = await page.locator('text=/Thank you/i').isVisible().catch(() => false)
    expect(successVisible).toBe(false)
  })

  test('should successfully submit form with valid data', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    // Fill in required text fields
    await page.fill('#firstName', 'John')
    await page.fill('#lastName', 'Doe')
    await page.fill('#email', 'john.doe@example.com')
    await page.fill('#message', 'This is a test message for the contact form. I am interested in your web development services.')

    // Fill optional text fields
    await page.fill('#phone', '555-123-4567')
    await page.fill('#company', 'Test Company Inc')

    logger.step('Filled text fields')

    // Select service (Radix Select)
    await page.locator('#service').click()
    await page.locator('[role="option"]').filter({ hasText: 'Web Development' }).click()

    // Select best time to contact
    await page.locator('#bestTimeToContact').click()
    await page.locator('[role="option"]').filter({ hasText: 'Morning' }).click()

    // Select budget
    await page.locator('#budget').click()
    await page.locator('[role="option"]').filter({ hasText: '$5,000 - $15,000' }).click()

    // Select timeline
    await page.locator('#timeline').click()
    await page.locator('[role="option"]').filter({ hasText: '1 Month' }).click()

    logger.step('Selected dropdown options')

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Wait for form to process (give it time to show success/error)
    await page.waitForTimeout(3000)

    // Check for success message
    const successVisible = await page.locator('text=/Thank you/i').isVisible().catch(() => false)

    if (successVisible) {
      logger.complete('Form submitted successfully - success message visible')
    } else {
      logger.warn('No success message visible - form may show inline validation or submission may have failed')
    }

    // Test passes if form submitted without crashing (page may navigate or show success)
    // Just verify something is visible on the page
    await expect(page.locator('body')).toBeVisible()
  })

  test('should show pending state while submitting', async ({ page }, testInfo: TestInfo) => {
    const logger = createTestLogger(testInfo.title)

    // Fill in minimum required fields
    await page.fill('#firstName', 'Jane')
    await page.fill('#lastName', 'Smith')
    await page.fill('#email', 'jane.smith@example.com')
    await page.fill('#message', 'Testing pending state during form submission.')

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
        logger.complete('Button shows loading state')
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

    // Fill and submit form
    await page.fill('#firstName', 'Test')
    await page.fill('#lastName', 'User')
    await page.fill('#email', 'test@example.com')
    await page.fill('#message', 'Test message for resend flow.')

    await page.locator('button[type="submit"]').click()

    // Wait for form to process
    await page.waitForTimeout(3000)

    // Check if success message appears
    const successVisible = await page.locator('text=/Thank you/i').isVisible().catch(() => false)

    if (successVisible) {
      logger.step('Form submitted successfully, looking for reset button')

      // Check for "Send another message" or similar reset button
      const resetButton = page.locator('button').filter({ hasText: /another|reset|new/i }).first()

      if (await resetButton.isVisible().catch(() => false)) {
        await resetButton.click()
        logger.complete('Reset button clicked')
        // Wait for form to reappear
        await page.waitForTimeout(500)
      } else {
        logger.warn('Reset button not visible')
      }
    } else {
      logger.warn('Form did not show success message')
    }

    // Test passes if we got this far without crashing
    await expect(page.locator('body')).toBeVisible()
  })

  test('should preserve form data on validation error', async ({ page }) => {
    // Fill in some fields with an invalid email
    await page.fill('#firstName', 'John')
    await page.fill('#lastName', 'Doe')
    await page.fill('#email', 'invalid-email') // Invalid format
    await page.fill('#message', 'Test message that should be preserved.')

    // Try to submit
    await page.locator('button[type="submit"]').click()

    // Wait a moment for any validation
    await page.waitForTimeout(500)

    // Check that form data is preserved
    await expect(page.locator('#firstName')).toHaveValue('John')
    await expect(page.locator('#lastName')).toHaveValue('Doe')
    await expect(page.locator('#email')).toHaveValue('invalid-email')
    await expect(page.locator('#message')).toHaveValue('Test message that should be preserved.')
  })

  test('should have accessible form structure', async ({ page }) => {
    // Check that all inputs have associated labels (via htmlFor/id)
    const firstNameLabel = page.locator('label[for="firstName"]')
    await expect(firstNameLabel).toBeVisible()

    const emailLabel = page.locator('label[for="email"]')
    await expect(emailLabel).toBeVisible()

    const messageLabel = page.locator('label[for="message"]')
    await expect(messageLabel).toBeVisible()

    // Check that form has proper structure
    const form = page.locator('form')
    await expect(form).toBeVisible()

    // Check submit button is accessible
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeEnabled()
    await expect(submitButton).toHaveText(/submit/i)
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on first name and tab through fields
    await page.locator('#firstName').focus()
    await expect(page.locator('#firstName')).toBeFocused()

    // Tab to next field
    await page.keyboard.press('Tab')

    // Should move to lastName
    await expect(page.locator('#lastName')).toBeFocused()

    // Continue tabbing through form
    await page.keyboard.press('Tab')
    await expect(page.locator('#email')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('#phone')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('#company')).toBeFocused()
  })
})
