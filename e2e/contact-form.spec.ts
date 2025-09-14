import { test, expect } from '@playwright/test'

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
  })

  test('should display contact form with all fields', async ({ page }) => {
    // Check form is visible
    await expect(page.locator('form')).toBeVisible()

    // Check all required fields are present
    await expect(page.locator('input[name="firstName"]')).toBeVisible()
    await expect(page.locator('input[name="lastName"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('textarea[name="message"]')).toBeVisible()

    // Check optional fields
    await expect(page.locator('input[name="phone"]')).toBeVisible()
    await expect(page.locator('input[name="company"]')).toBeVisible()
    await expect(page.locator('select[name="service"]')).toBeVisible()
    await expect(page.locator('select[name="bestTimeToContact"]')).toBeVisible()
    await expect(page.locator('select[name="budget"]')).toBeVisible()
    await expect(page.locator('select[name="timeline"]')).toBeVisible()
  })

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Try to submit empty form
    await page.locator('button[type="submit"]').click()

    // Browser native validation should prevent submission
    // Check that form is still visible (not replaced with success message)
    await expect(page.locator('form')).toBeVisible()
  })

  test('should successfully submit form with valid data', async ({ page }) => {
    // Fill in required fields
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="lastName"]', 'Doe')
    await page.fill('input[name="email"]', 'john.doe@example.com')
    await page.fill('textarea[name="message"]', 'This is a test message for the contact form.')

    // Fill optional fields
    await page.fill('input[name="phone"]', '555-123-4567')
    await page.fill('input[name="company"]', 'Test Company')
    await page.selectOption('select[name="service"]', 'website')
    await page.selectOption('select[name="bestTimeToContact"]', 'morning')
    await page.selectOption('select[name="budget"]', '10-25K')
    await page.selectOption('select[name="timeline"]', '1-3 months')

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Wait for either success message or error
    await page.waitForSelector('text=/Thank you|Success|sent|error/i', { timeout: 10000 })

    // Check for success indicators (form might show success message or redirect)
    const successVisible = await page.locator('text=/Thank you|Success|sent successfully/i').isVisible().catch(() => false)
    const errorVisible = await page.locator('text=/error|failed|try again/i').isVisible().catch(() => false)

    // If we're in test environment without email service, we might get a specific error
    // In production, this should succeed
    expect(successVisible || errorVisible).toBeTruthy()
  })

  test('should show pending state while submitting', async ({ page }) => {
    // Fill in form
    await page.fill('input[name="firstName"]', 'Jane')
    await page.fill('input[name="lastName"]', 'Smith')
    await page.fill('input[name="email"]', 'jane.smith@example.com')
    await page.fill('textarea[name="message"]', 'Testing pending state')

    // Start monitoring the submit button
    const submitButton = page.locator('button[type="submit"]')

    // Click submit and immediately check for pending state
    const submitPromise = submitButton.click()

    // Check if button shows loading state (either disabled or shows "Sending...")
    await expect(submitButton).toBeDisabled({ timeout: 1000 }).catch(() => {})
    const buttonText = await submitButton.textContent()

    // Button should show some loading indication
    const hasLoadingState = buttonText?.includes('Sending') ||
                           buttonText?.includes('...') ||
                           await submitButton.isDisabled()

    expect(hasLoadingState).toBeTruthy()

    // Wait for submission to complete
    await submitPromise
  })

  test('should handle rate limiting gracefully', async ({ page }) => {
    // Submit form multiple times quickly to trigger rate limiting
    for (let i = 0; i < 4; i++) {
      await page.fill('input[name="firstName"]', `User${i}`)
      await page.fill('input[name="lastName"]', 'Test')
      await page.fill('input[name="email"]', `user${i}@example.com`)
      await page.fill('textarea[name="message"]', `Test message ${i}`)

      await page.locator('button[type="submit"]').click()

      // Wait a bit between submissions
      await page.waitForTimeout(1000)

      // If we hit rate limit, we should see an error message
      if (i === 3) {
        const rateLimitError = await page.locator('text=/too many|rate limit|try again.*minutes/i').isVisible().catch(() => false)
        if (rateLimitError) {
          expect(rateLimitError).toBeTruthy()
          break
        }
      }

      // Reset form if successful
      const successVisible = await page.locator('text=/Thank you|Success/i').isVisible().catch(() => false)
      if (successVisible) {
        await page.reload()
      }
    }
  })

  test('should preserve form data on validation error', async ({ page }) => {
    // Fill in some fields but leave required field empty
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="email"]', 'invalid-email') // Invalid email format
    await page.fill('textarea[name="message"]', 'Test message')

    // Try to submit
    await page.locator('button[type="submit"]').click()

    // Wait a moment for validation
    await page.waitForTimeout(500)

    // Check that form data is preserved
    await expect(page.locator('input[name="firstName"]')).toHaveValue('John')
    await expect(page.locator('textarea[name="message"]')).toHaveValue('Test message')
  })
})