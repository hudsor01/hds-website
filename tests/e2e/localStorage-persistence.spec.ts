import { test, expect } from '@playwright/test'

test.describe('localStorage Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Clear any existing localStorage data
    await page.evaluate(() => localStorage.clear())
  })

  test('should save form data to localStorage when user types', async ({ page }) => {
    const testData = {
      employeeName: 'John Doe',
      employeeId: 'EMP001',
      employerName: 'Test Company',
      hourlyRate: '25.50',
      hoursPerPeriod: '80'
    }

    // Fill out form fields
    await page.fill('input[placeholder*="full name"]', testData.employeeName)
    await page.fill('input[placeholder*="XXX-XX-XXXX"]', testData.employeeId)
    await page.fill('input[placeholder*="company name"]', testData.employerName)
    await page.fill('input[placeholder*="hourly rate"]', testData.hourlyRate)
    await page.fill('input[placeholder*="hours per pay period"]', testData.hoursPerPeriod)
    
    // Select filing status
    await page.selectOption('select', 'single')
    
    // Wait a bit for auto-save to trigger
    await page.waitForTimeout(500)
    
    // Check localStorage contains the data
    const savedData = await page.evaluate(() => {
      const stored = localStorage.getItem('paystub-form-data')
      return stored ? JSON.parse(stored) : null
    })
    
    expect(savedData).toBeTruthy()
    expect(savedData.employeeName).toBe(testData.employeeName)
    expect(savedData.employeeId).toBe(testData.employeeId)
    expect(savedData.employerName).toBe(testData.employerName)
    expect(savedData.hourlyRate).toBe(parseFloat(testData.hourlyRate))
    expect(savedData.hoursPerPeriod).toBe(parseFloat(testData.hoursPerPeriod))
    expect(savedData.filingStatus).toBe('single')
  })

  test('should load form data from localStorage on page refresh', async ({ page }) => {
    const testData = {
      employeeName: 'Jane Smith',
      employeeId: 'EMP002',
      employerName: 'Another Company',
      hourlyRate: '30.00',
      hoursPerPeriod: '40'
    }

    // Fill out form
    await page.fill('input[placeholder*="full name"]', testData.employeeName)
    await page.fill('input[placeholder*="XXX-XX-XXXX"]', testData.employeeId)
    await page.fill('input[placeholder*="company name"]', testData.employerName)
    await page.fill('input[placeholder*="hourly rate"]', testData.hourlyRate)
    await page.fill('input[placeholder*="hours per pay period"]', testData.hoursPerPeriod)
    
    // Select filing status and tax year
    await page.selectOption('select', 'marriedJoint')
    
    // Wait for auto-save
    await page.waitForTimeout(500)
    
    // Refresh the page
    await page.reload()
    
    // Check that form data is restored
    await expect(page.locator('input[placeholder*="full name"]')).toHaveValue(testData.employeeName)
    await expect(page.locator('input[placeholder*="XXX-XX-XXXX"]')).toHaveValue(testData.employeeId)
    await expect(page.locator('input[placeholder*="company name"]')).toHaveValue(testData.employerName)
    await expect(page.locator('input[placeholder*="hourly rate"]')).toHaveValue(testData.hourlyRate)
    await expect(page.locator('input[placeholder*="hours per pay period"]')).toHaveValue(testData.hoursPerPeriod)
    
    // Check that select values are restored
    await expect(page.locator('select').first()).toHaveValue('marriedJoint')
  })

  test('should clear localStorage when Clear Form is clicked', async ({ page }) => {
    // Fill out form first
    await page.fill('input[placeholder*="full name"]', 'Test User')
    await page.fill('input[placeholder*="hourly rate"]', '20.00')
    await page.fill('input[placeholder*="hours per pay period"]', '60')
    
    // Wait for auto-save
    await page.waitForTimeout(500)
    
    // Verify data is saved
    let savedData = await page.evaluate(() => {
      const stored = localStorage.getItem('paystub-form-data')
      return stored ? JSON.parse(stored) : null
    })
    expect(savedData).toBeTruthy()
    
    // Click Clear Form button
    await page.click('button:has-text("Clear Form")')
    
    // Verify localStorage is cleared
    savedData = await page.evaluate(() => {
      return localStorage.getItem('paystub-form-data')
    })
    expect(savedData).toBeNull()
    
    // Verify form fields are cleared
    await expect(page.locator('input[placeholder*="full name"]')).toHaveValue('')
    await expect(page.locator('input[placeholder*="hourly rate"]')).toHaveValue('')
    await expect(page.locator('input[placeholder*="hours per pay period"]')).toHaveValue('')
  })

  test('should handle corrupted localStorage data gracefully', async ({ page }) => {
    // Set corrupted data in localStorage
    await page.evaluate(() => {
      localStorage.setItem('paystub-form-data', 'invalid-json-data')
    })
    
    // Refresh page
    await page.reload()
    
    // Check that form loads with empty values (graceful degradation)
    await expect(page.locator('input[placeholder*="full name"]')).toHaveValue('')
    await expect(page.locator('input[placeholder*="hourly rate"]')).toHaveValue('')
    await expect(page.locator('input[placeholder*="hours per pay period"]')).toHaveValue('')
  })

  test('should save state selection to localStorage', async ({ page }) => {
    // Select a state
    const stateSelect = page.locator('select').nth(2) // Third select is state
    await stateSelect.selectOption('CA')
    
    // Wait for auto-save
    await page.waitForTimeout(500)
    
    // Check localStorage
    const savedData = await page.evaluate(() => {
      const stored = localStorage.getItem('paystub-form-data')
      return stored ? JSON.parse(stored) : null
    })
    
    expect(savedData.state).toBe('CA')
    
    // Refresh and verify state is restored
    await page.reload()
    await expect(stateSelect).toHaveValue('CA')
  })

  test('should auto-save when dropdown values change', async ({ page }) => {
    // Change filing status
    await page.selectOption('select', 'headOfHousehold')
    
    // Wait for auto-save
    await page.waitForTimeout(500)
    
    // Check localStorage
    const savedData = await page.evaluate(() => {
      const stored = localStorage.getItem('paystub-form-data')
      return stored ? JSON.parse(stored) : null
    })
    
    expect(savedData.filingStatus).toBe('headOfHousehold')
  })

  test('should preserve form data across browser sessions', async ({ page, context }) => {
    // Fill form data
    await page.fill('input[placeholder*="full name"]', 'Session Test User')
    await page.fill('input[placeholder*="hourly rate"]', '35.00')
    
    // Wait for auto-save
    await page.waitForTimeout(500)
    
    // Close current page and open new one (simulating new session)
    await page.close()
    const newPage = await context.newPage()
    await newPage.goto('/')
    
    // Verify data is still there
    await expect(newPage.locator('input[placeholder*="full name"]')).toHaveValue('Session Test User')
    await expect(newPage.locator('input[placeholder*="hourly rate"]')).toHaveValue('35.00')
  })

  test('should handle localStorage quota exceeded gracefully', async ({ page }) => {
    // Mock localStorage to throw quota exceeded error
    await page.evaluate(() => {
      const originalSetItem = localStorage.setItem
      localStorage.setItem = function() {
        throw new Error('QuotaExceededError: The quota has been exceeded.')
      }
      // Store reference to restore later if needed
      ;(window as any).originalSetItem = originalSetItem
    })
    
    // Try to fill form (should not crash)
    await page.fill('input[placeholder*="full name"]', 'Quota Test User')
    
    // Page should still be functional
    await expect(page.locator('input[placeholder*="full name"]')).toHaveValue('Quota Test User')
    await expect(page.locator('button:has-text("Generate")')).toBeVisible()
  })

  test('should update localStorage incrementally as user types', async ({ page }) => {
    const nameInput = page.locator('input[placeholder*="full name"]')
    
    // Type partial name
    await nameInput.fill('John')
    await page.waitForTimeout(300)
    
    // Check localStorage has partial data
    let savedData = await page.evaluate(() => {
      const stored = localStorage.getItem('paystub-form-data')
      return stored ? JSON.parse(stored) : null
    })
    expect(savedData.employeeName).toBe('John')
    
    // Complete the name
    await nameInput.fill('John Doe')
    await page.waitForTimeout(300)
    
    // Check localStorage is updated
    savedData = await page.evaluate(() => {
      const stored = localStorage.getItem('paystub-form-data')
      return stored ? JSON.parse(stored) : null
    })
    expect(savedData.employeeName).toBe('John Doe')
  })
})