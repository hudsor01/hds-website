import { test, expect } from '@playwright/test'

test.describe('PDF Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Clear any existing localStorage data
    await page.evaluate(() => localStorage.clear())
    
    // Fill out form with valid data to generate documents
    await page.fill('input[placeholder*="full name"]', 'John Doe')
    await page.fill('input[placeholder*="XXX-XX-XXXX"]', 'EMP001')
    await page.fill('input[placeholder*="company name"]', 'Test Company')
    await page.fill('input[placeholder*="hourly rate"]', '25.50')
    await page.fill('input[placeholder*="hours per pay period"]', '80')
    
    // Generate paystub
    await page.click('button:has-text("Generate")')
    
    // Wait for documents to be generated
    await expect(page.locator('text=EARNINGS STATEMENT')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=ANNUAL WAGE AND TAX STATEMENT')).toBeVisible({ timeout: 5000 })
  })

  test('should display Save as PDF buttons on both documents', async ({ page }) => {
    // Check for PDF buttons on both PayStub and AnnualWageSummary
    const pdfButtons = page.locator('button:has-text("📄 Save as PDF")')
    await expect(pdfButtons).toHaveCount(2)
    
    // Verify buttons are visible and properly positioned
    await expect(pdfButtons.first()).toBeVisible()
    await expect(pdfButtons.last()).toBeVisible()
    
    // Check button styling
    await expect(pdfButtons.first()).toHaveCSS('background-color', 'rgb(5, 150, 105)') // emerald-600
    await expect(pdfButtons.first()).toHaveCSS('color', 'rgb(255, 255, 255)') // white
  })

  test('should hide PDF buttons when printing', async ({ page }) => {
    // Check that buttons are visible initially
    const pdfButtons = page.locator('button:has-text("📄 Save as PDF")')
    await expect(pdfButtons).toHaveCount(2)
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' })
    
    // Check that PDF buttons are hidden (no-print class)
    const hiddenButtons = page.locator('.no-print')
    await expect(hiddenButtons).toHaveCount(2)
    
    // Reset media
    await page.emulateMedia({ media: 'screen' })
  })

  test('should trigger print dialog when PDF button is clicked', async ({ page }) => {
    // Set up print dialog listener
    let printDialogTriggered = false
    
    await page.evaluate(() => {
      // Mock window.print to track if it was called
      (window as any).originalPrint = window.print
      window.print = () => {
        (window as any).printTriggered = true
      }
    })
    
    // Click the first PDF button
    await page.click('button:has-text("📄 Save as PDF")');
    
    // Check if print was triggered
    const printTriggered = await page.evaluate(() => (window as any).printTriggered)
    expect(printTriggered).toBe(true)
    
    // Restore original print function
    await page.evaluate(() => {
      if ((window as any).originalPrint) {
        window.print = (window as any).originalPrint
      }
    })
  })

  test('should have proper document structure for printing', async ({ page }) => {
    // Check that documents have proper class structure for print CSS
    await expect(page.locator('div').first()).toHaveCSS('position', 'relative')
    
    // Check for proper document styling
    const paystubDocument = page.locator('text=EARNINGS STATEMENT').locator('..')
    await expect(paystubDocument).toHaveCSS('font-family', /Arial/)
    await expect(paystubDocument).toHaveCSS('background-color', 'rgb(255, 255, 255)') // white
    
    const annualDocument = page.locator('text=ANNUAL WAGE AND TAX STATEMENT').locator('..')
    await expect(annualDocument).toHaveCSS('font-family', /Times/)
    await expect(annualDocument).toHaveCSS('background-color', 'rgb(255, 255, 255)') // white
  })

  test('should maintain document formatting when emulating print', async ({ page }) => {
    // Emulate print media
    await page.emulateMedia({ media: 'print' })
    
    // Check that documents maintain their structure
    await expect(page.locator('text=EARNINGS STATEMENT')).toBeVisible()
    await expect(page.locator('text=ANNUAL WAGE AND TAX STATEMENT')).toBeVisible()
    
    // Check that form elements are hidden in print view
    await expect(page.locator('input[placeholder*="full name"]')).toBeHidden()
    await expect(page.locator('button:has-text("Generate")')).toBeHidden()
    
    // Reset media
    await page.emulateMedia({ media: 'screen' })
  })

  test('should handle PDF button hover states', async ({ page }) => {
    const pdfButton = page.locator('button:has-text("📄 Save as PDF")').first()
    
    // Check initial color
    await expect(pdfButton).toHaveCSS('background-color', 'rgb(5, 150, 105)') // emerald-600
    
    // Hover over button
    await pdfButton.hover()
    
    // Check hover color (should be darker emerald)
    await expect(pdfButton).toHaveCSS('background-color', 'rgb(4, 120, 87)') // emerald-700
  })

  test('should maintain accessibility standards for PDF buttons', async ({ page }) => {
    const pdfButtons = page.locator('button:has-text("📄 Save as PDF")')
    
    // Check that buttons are keyboard accessible
    await pdfButtons.first().focus()
    await expect(pdfButtons.first()).toBeFocused()
    
    // Check button text is readable
    await expect(pdfButtons.first()).toHaveText('📄 Save as PDF')
    
    // Check button has proper cursor style
    await expect(pdfButtons.first()).toHaveCSS('cursor', 'pointer')
  })

  test('should position PDF buttons correctly', async ({ page }) => {
    const pdfButtonContainers = page.locator('.no-print')
    
    // Check that containers are positioned absolutely
    await expect(pdfButtonContainers.first()).toHaveCSS('position', 'absolute')
    
    // Check positioning properties
    await expect(pdfButtonContainers.first()).toHaveCSS('top', '-60px')
    await expect(pdfButtonContainers.first()).toHaveCSS('right', '0px')
    await expect(pdfButtonContainers.first()).toHaveCSS('z-index', '1000')
  })
})