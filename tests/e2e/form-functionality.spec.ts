import { test, expect } from '@playwright/test'

test.describe('Form Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Clear any existing localStorage data
    await page.evaluate(() => localStorage.clear())
  })

  test('should display form with all required fields', async ({ page }) => {
    // Check for main form elements
    await expect(page.locator('input[placeholder*="full name"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="XXX-XX-XXXX"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="company name"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="hourly rate"]')).toBeVisible()
    await expect(page.locator('input[placeholder*="hours per pay period"]')).toBeVisible()
    
    // Check for dropdowns
    await expect(page.locator('select')).toHaveCount(3) // Filing Status, Tax Year, State
    
    // Check for buttons
    await expect(page.locator('button:has-text("Generate")')).toBeVisible()
    await expect(page.locator('button:has-text("Clear Form")')).toBeVisible()
  })

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button:has-text("Generate")')
    
    // Check for validation error styling (red borders)
    await expect(page.locator('input[placeholder*="full name"]')).toHaveCSS('border-color', 'rgb(220, 53, 69)') // red-600
    await expect(page.locator('input[placeholder*="hourly rate"]')).toHaveCSS('border-color', 'rgb(220, 53, 69)')
    await expect(page.locator('input[placeholder*="hours per pay period"]')).toHaveCSS('border-color', 'rgb(220, 53, 69)')
  })

  test('should validate employee name field', async ({ page }) => {
    const nameInput = page.locator('input[placeholder*="full name"]')
    
    // Test empty name
    await nameInput.fill('')
    await page.click('button:has-text("Generate")')
    await expect(nameInput).toHaveCSS('border-color', 'rgb(220, 53, 69)')
    
    // Test name too short
    await nameInput.fill('A')
    await page.click('button:has-text("Generate")')
    await expect(nameInput).toHaveCSS('border-color', 'rgb(220, 53, 69)')
    
    // Test valid name
    await nameInput.fill('John Doe')
    await page.click('button:has-text("Generate")')
    await expect(nameInput).not.toHaveCSS('border-color', 'rgb(220, 53, 69)')
  })

  test('should validate hourly rate field', async ({ page }) => {
    const rateInput = page.locator('input[placeholder*="hourly rate"]')
    
    // Test zero rate
    await rateInput.fill('0')
    await page.click('button:has-text("Generate")')
    await expect(rateInput).toHaveCSS('border-color', 'rgb(220, 53, 69)')
    
    // Test negative rate
    await rateInput.fill('-5')
    await page.click('button:has-text("Generate")')
    await expect(rateInput).toHaveCSS('border-color', 'rgb(220, 53, 69)')
    
    // Test unusually high rate
    await rateInput.fill('1500')
    await page.click('button:has-text("Generate")')
    await expect(rateInput).toHaveCSS('border-color', 'rgb(220, 53, 69)')
    
    // Test valid rate
    await rateInput.fill('25.50')
    await page.click('button:has-text("Generate")')
    await expect(rateInput).not.toHaveCSS('border-color', 'rgb(220, 53, 69)')
  })

  test('should validate hours per period field', async ({ page }) => {
    const hoursInput = page.locator('input[placeholder*="hours per pay period"]')
    
    // Test zero hours
    await hoursInput.fill('0')
    await page.click('button:has-text("Generate")')
    await expect(hoursInput).toHaveCSS('border-color', 'rgb(220, 53, 69)')
    
    // Test negative hours
    await hoursInput.fill('-10')
    await page.click('button:has-text("Generate")')
    await expect(hoursInput).toHaveCSS('border-color', 'rgb(220, 53, 69)')
    
    // Test unusually high hours
    await hoursInput.fill('250')
    await page.click('button:has-text("Generate")')
    await expect(hoursInput).toHaveCSS('border-color', 'rgb(220, 53, 69)')
    
    // Test valid hours
    await hoursInput.fill('80')
    await page.click('button:has-text("Generate")')
    await expect(hoursInput).not.toHaveCSS('border-color', 'rgb(220, 53, 69)')
  })

  test('should display state dropdown with proper grouping', async ({ page }) => {
    const stateSelect = page.locator('select').nth(2) // Third select is state
    
    // Check that state select exists and has the proper structure
    await expect(stateSelect).toBeVisible()
    
    // Check for optgroups by checking the HTML content
    const selectHTML = await stateSelect.innerHTML()
    expect(selectHTML).toContain('States with Income Tax')
    expect(selectHTML).toContain('States without Income Tax')
    
    // Check for specific states in correct groups
    expect(selectHTML).toContain('<option value="FL">Florida</option>')
    expect(selectHTML).toContain('<option value="CA">California</option>')
  })

  test('should generate paystub with valid form data', async ({ page }) => {
    // Fill out the form with valid data
    await page.fill('input[placeholder*="full name"]', 'John Doe')
    await page.fill('input[placeholder*="XXX-XX-XXXX"]', 'EMP001')
    await page.fill('input[placeholder*="company name"]', 'Test Company')
    await page.fill('input[placeholder*="hourly rate"]', '25.50')
    await page.fill('input[placeholder*="hours per pay period"]', '80')
    
    // Select filing status
    await page.selectOption('select', { index: 0 }) // First filing status option
    
    // Generate paystub
    await page.click('button:has-text("Generate")')
    
    // Wait for generation to complete and check for success
    await page.waitForTimeout(2000) // Give time for calculation
    
    // Check that paystub components are generated
    await expect(page.locator('text=EARNINGS STATEMENT')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=ANNUAL WAGE AND TAX STATEMENT')).toBeVisible({ timeout: 5000 })
  })

  test('should clear form when Clear Form button is clicked', async ({ page }) => {
    // Fill out the form
    await page.fill('input[placeholder*="full name"]', 'John Doe')
    await page.fill('input[placeholder*="XXX-XX-XXXX"]', 'EMP001')
    await page.fill('input[placeholder*="company name"]', 'Test Company')
    await page.fill('input[placeholder*="hourly rate"]', '25.50')
    await page.fill('input[placeholder*="hours per pay period"]', '80')
    
    // Click Clear Form button
    await page.click('button:has-text("Clear Form")')
    
    // Check that all fields are cleared
    await expect(page.locator('input[placeholder*="full name"]')).toHaveValue('')
    await expect(page.locator('input[placeholder*="XXX-XX-XXXX"]')).toHaveValue('')
    await expect(page.locator('input[placeholder*="company name"]')).toHaveValue('')
    await expect(page.locator('input[placeholder*="hourly rate"]')).toHaveValue('')
    await expect(page.locator('input[placeholder*="hours per pay period"]')).toHaveValue('')
  })

  test('should show toast notifications', async ({ page }) => {
    // Fill valid form
    await page.fill('input[placeholder*="full name"]', 'John Doe')
    await page.fill('input[placeholder*="hourly rate"]', '25.50')
    await page.fill('input[placeholder*="hours per pay period"]', '80')
    
    // Generate paystub
    await page.click('button:has-text("Generate")')
    
    // Check for success toast (Sonner toast)
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 3000 })
  })

  test('should handle form submission during loading state', async ({ page }) => {
    // Fill valid form
    await page.fill('input[placeholder*="full name"]', 'John Doe')
    await page.fill('input[placeholder*="hourly rate"]', '25.50')
    await page.fill('input[placeholder*="hours per pay period"]', '80')
    
    // Click generate button
    await page.click('button:has-text("Generate")')
    
    // Check that button shows loading state
    await expect(page.locator('button:has-text("Generating...")')).toBeVisible({ timeout: 1000 })
    
    // Try clicking again while loading (should be disabled)
    const generateButton = page.locator('button:has-text("Generating...")')
    await expect(generateButton).toBeDisabled()
  })
})