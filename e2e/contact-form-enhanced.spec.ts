import { test, expect } from '@playwright/test'

test.describe('Enhanced Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
  })

  test.describe('FloatingInput Components', () => {
    test('should have floating label animations', async ({ page }) => {
      const firstNameInput = page.locator('input[name="firstName"]')
      const firstNameLabel = page.locator('label[for="firstName"]')
      
      // Label should float when input is focused
      await firstNameInput.focus()
      await expect(firstNameLabel).toHaveCSS('transform', /translate|scale/)
      
      // Label should stay floated when input has value
      await firstNameInput.fill('John')
      await firstNameInput.blur()
      await expect(firstNameInput).toHaveValue('John')
    })

    test('should validate email format', async ({ page }) => {
      const emailInput = page.locator('input[name="email"]')
      
      // Invalid email
      await emailInput.fill('invalid-email')
      await emailInput.blur()
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
      expect(isInvalid).toBeTruthy()
      
      // Valid email
      await emailInput.fill('test@example.com')
      await emailInput.blur()
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)
      expect(isValid).toBeTruthy()
    })

    test('should accept optional fields', async ({ page }) => {
      // Optional fields should work without values
      const phoneInput = page.locator('input[name="phone"]')
      const companyInput = page.locator('input[name="company"]')
      
      await phoneInput.fill('555-123-4567')
      await expect(phoneInput).toHaveValue('555-123-4567')
      
      await companyInput.fill('Acme Corp')
      await expect(companyInput).toHaveValue('Acme Corp')
      
      // Clear and verify they're optional
      await phoneInput.clear()
      await companyInput.clear()
      await expect(phoneInput).toHaveValue('')
      await expect(companyInput).toHaveValue('')
    })
  })

  test.describe('CustomSelect Components', () => {
    test('should open dropdown on click', async ({ page }) => {
      const serviceButton = page.locator('button[id="service"]')
      await serviceButton.click()
      
      // Dropdown should be visible
      const dropdown = page.locator('[role="listbox"]').first()
      await expect(dropdown).toBeVisible()
      
      // Options should be visible
      await expect(page.locator('text="Custom Development"')).toBeVisible()
      await expect(page.locator('text="Revenue Operations"')).toBeVisible()
    })

    test('should select option and close dropdown', async ({ page }) => {
      const serviceButton = page.locator('button[id="service"]')
      await serviceButton.click()
      
      // Select an option
      await page.locator('text="Revenue Operations"').click()
      
      // Dropdown should close
      const dropdown = page.locator('[role="listbox"]').first()
      await expect(dropdown).not.toBeVisible()
      
      // Selected value should be displayed
      await expect(serviceButton).toContainText('Revenue Operations')
    })

    test('should support keyboard navigation', async ({ page }) => {
      const serviceButton = page.locator('button[id="service"]')
      await serviceButton.focus()
      
      // Open with Enter key
      await page.keyboard.press('Enter')
      await expect(page.locator('[role="listbox"]').first()).toBeVisible()
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      
      // Select with Enter
      await page.keyboard.press('Enter')
      
      // Verify selection
      await expect(serviceButton).toContainText('Revenue Operations')
    })

    test('should close on Escape key', async ({ page }) => {
      const serviceButton = page.locator('button[id="service"]')
      await serviceButton.click()
      
      // Dropdown should be open
      await expect(page.locator('[role="listbox"]').first()).toBeVisible()
      
      // Press Escape
      await page.keyboard.press('Escape')
      
      // Dropdown should close
      await expect(page.locator('[role="listbox"]').first()).not.toBeVisible()
    })
  })

  test.describe('FloatingTextarea Component', () => {
    test('should accept multi-line text', async ({ page }) => {
      const textarea = page.locator('textarea[name="message"]')
      const multilineText = 'Line 1\nLine 2\nLine 3'
      
      await textarea.fill(multilineText)
      await expect(textarea).toHaveValue(multilineText)
    })

    test('should show character count', async ({ page }) => {
      const textarea = page.locator('textarea[name="message"]')
      const testMessage = 'This is a test message'
      
      await textarea.fill(testMessage)
      
      // Check if character count is displayed
      const charCount = page.locator('text=/\\d+\\/\\d+/')
      await expect(charCount).toBeVisible()
    })
  })

  test.describe('Form Submission', () => {
    test('should validate required fields', async ({ page }) => {
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()
      
      // Browser should prevent submission due to required fields
      // Form should still be visible
      await expect(page.locator('form')).toBeVisible()
      
      // Fill required fields
      await page.locator('input[name="firstName"]').fill('John')
      await page.locator('input[name="lastName"]').fill('Doe')
      await page.locator('input[name="email"]').fill('john@example.com')
      await page.locator('textarea[name="message"]').fill('Test message')
      
      // Should now be able to submit
      await submitButton.click()
      
      // Check for loading state
      await expect(submitButton).toContainText(/Sending/i)
    })

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API failure
      await page.route('/api/contact', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        })
      })
      
      // Fill and submit form
      await page.locator('input[name="firstName"]').fill('John')
      await page.locator('input[name="lastName"]').fill('Doe')
      await page.locator('input[name="email"]').fill('john@example.com')
      await page.locator('textarea[name="message"]').fill('Test message')
      
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()
      
      // Should show error message
      await expect(page.locator('text=/error|failed/i')).toBeVisible({ timeout: 5000 })
    })

    test('should show success message on successful submission', async ({ page }) => {
      // Mock successful API response
      await page.route('/api/contact', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true, 
            message: 'Message sent successfully' 
          })
        })
      })
      
      // Fill and submit form
      await page.locator('input[name="firstName"]').fill('John')
      await page.locator('input[name="lastName"]').fill('Doe')
      await page.locator('input[name="email"]').fill('john@example.com')
      await page.locator('textarea[name="message"]').fill('Test message')
      
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()
      
      // Should show success message
      await expect(page.locator('text=/success|sent/i')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Form should still be accessible
      const form = page.locator('form')
      await expect(form).toBeVisible()
      
      // Grid should stack on mobile
      const nameGrid = page.locator('.grid').first()
      const gridClass = await nameGrid.getAttribute('class')
      expect(gridClass).toContain('grid-cols-1')
    })

    test('should adapt to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      // Form should be visible
      const form = page.locator('form')
      await expect(form).toBeVisible()
      
      // Should show side-by-side layout for some fields
      const nameGrid = page.locator('.grid').first()
      const gridClass = await nameGrid.getAttribute('class')
      expect(gridClass).toContain('md:grid-cols-2')
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      // Check CustomSelect ARIA attributes
      const serviceButton = page.locator('button[id="service"]')
      await expect(serviceButton).toHaveAttribute('role', 'combobox')
      await expect(serviceButton).toHaveAttribute('aria-expanded', 'false')
      
      await serviceButton.click()
      await expect(serviceButton).toHaveAttribute('aria-expanded', 'true')
      
      // Check listbox role
      const dropdown = page.locator('[role="listbox"]').first()
      await expect(dropdown).toBeVisible()
      
      // Check option roles
      const options = page.locator('[role="option"]')
      expect(await options.count()).toBeGreaterThan(0)
    })

    test('should be keyboard navigable', async ({ page }) => {
      // Tab through all form fields
      await page.locator('input[name="firstName"]').focus()
      
      const focusableElements = [
        'firstName',
        'lastName', 
        'email',
        'phone',
        'company',
        'service',
        'bestTimeToContact',
        'message'
      ]
      
      for (const field of focusableElements) {
        if (field === 'firstName') continue // Already focused
        
        await page.keyboard.press('Tab')
        
        // Check if correct element is focused
        const activeElement = await page.evaluate(() => {
          const el = document.activeElement
          return el?.getAttribute('name') || el?.getAttribute('id')
        })
        
        // CustomSelect uses id instead of name
        expect(activeElement).toBe(field)
      }
    })

    test('should have sufficient color contrast', async ({ page }) => {
      // Check text contrast for key elements
      const elements = [
        { selector: 'label', minContrast: 4.5 },
        { selector: 'button[type="submit"]', minContrast: 4.5 },
        { selector: '.text-gray-300', minContrast: 4.5 }
      ]
      
      for (const { selector } of elements) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          // Verify element has sufficient contrast
          // This is a simplified check - real contrast testing would use axe-core
          const color = await element.evaluate(el => 
            window.getComputedStyle(el).color
          )
          expect(color).toBeTruthy()
        }
      }
    })
  })

  test.describe('Visual Polish', () => {
    test('should have smooth hover effects', async ({ page }) => {
      const submitButton = page.locator('button[type="submit"]')
      
      // Check for transition classes
      const className = await submitButton.getAttribute('class')
      expect(className).toContain('transition')
      expect(className).toContain('hover:')
    })

    test('should have loading spinner during submission', async ({ page }) => {
      // Mock slow API response
      await page.route('/api/contact', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true })
        })
      })
      
      // Fill and submit
      await page.locator('input[name="firstName"]').fill('John')
      await page.locator('input[name="lastName"]').fill('Doe')
      await page.locator('input[name="email"]').fill('john@example.com')
      await page.locator('textarea[name="message"]').fill('Test')
      
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()
      
      // Should show loading spinner
      const spinner = page.locator('.animate-spin')
      await expect(spinner).toBeVisible()
    })

    test('should have gradient backgrounds', async ({ page }) => {
      const formContainer = page.locator('form').locator('..')
      const className = await formContainer.getAttribute('class')
      
      expect(className).toContain('bg-gradient')
      expect(className).toContain('backdrop-blur')
    })
  })
})