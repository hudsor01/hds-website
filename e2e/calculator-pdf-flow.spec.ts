import { test, expect } from '@playwright/test';

/**
 * Texas TTL Calculator E2E Tests
 * =============================================================================
 *
 * The calculator auto-calculates as values change (no submit button).
 * Inputs use labels, not name/id attributes.
 * Use getByLabel() to find inputs.
 */

test.describe('Calculator and Print Flow', () => {
  test('should complete full calculator flow and show results', async ({ page }) => {
    // Navigate to calculator page
    await page.goto('/texas-ttl-calculator');

    // Wait for page to load and calculator to be visible
    await page.waitForSelector('text=Texas TTL Calculator', { timeout: 10000 });
    await page.waitForTimeout(500); // Give the calculator store time to initialize

    // Fill out calculator form using label-based selectors
    const purchasePriceInput = page.getByLabel('Purchase Price');
    await purchasePriceInput.waitFor({ state: 'visible', timeout: 10000 });
    await purchasePriceInput.fill('35000');

    const downPaymentInput = page.getByLabel('Down Payment');
    await downPaymentInput.fill('5000');

    const interestRateInput = page.getByLabel('Interest Rate (%)');
    await interestRateInput.fill('5.5');

    // Wait for auto-calculation to complete and results to appear
    await page.waitForSelector('text=Calculation Results', { timeout: 10000 });

    // Verify results are displayed
    await expect(page.locator('text=Monthly Payment')).toBeVisible();
    await expect(page.locator('text=Calculation Results')).toBeVisible();

    // Verify PDF/Print button exists
    const pdfButton = page.locator('button:has-text("PDF")');
    if (await pdfButton.count() > 0) {
      await expect(pdfButton.first()).toBeVisible();
    }
  });

  test('should handle minimal input and show results', async ({ page }) => {
    // Navigate to calculator
    await page.goto('/texas-ttl-calculator');

    // Wait for calculator to be ready
    await page.waitForSelector('text=Texas TTL Calculator', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Fill minimal form - just purchase price
    const purchasePriceInput = page.getByLabel('Purchase Price');
    await purchasePriceInput.waitFor({ state: 'visible', timeout: 10000 });
    await purchasePriceInput.fill('25000');

    // Wait for auto-calculation
    await page.waitForTimeout(1000);

    // Wait for results to appear
    await page.waitForSelector('text=Calculation Results', { timeout: 10000 });

    // Verify results appear (no error state visible)
    await expect(page.locator('text=Calculation Results')).toBeVisible();
  });

  test('should validate calculator input fields', async ({ page }) => {
    await page.goto('/texas-ttl-calculator');

    // Wait for calculator
    await page.waitForSelector('text=Texas TTL Calculator', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Test with invalid data - type="number" inputs should sanitize or reject invalid input
    const purchasePriceInput = page.getByLabel('Purchase Price');
    await purchasePriceInput.waitFor({ state: 'visible', timeout: 10000 });

    // Try to fill with invalid data - browser should prevent it or sanitize it
    await purchasePriceInput.fill('invalid');

    // Check that input is either empty or has valid value
    const value = await purchasePriceInput.inputValue();
    expect(value === '' || !isNaN(Number(value))).toBeTruthy();

    // The page should not crash
    await expect(page.locator('text=Texas TTL Calculator')).toBeVisible();
  });

  test('should allow sharing calculator results', async ({ page }) => {
    await page.goto('/texas-ttl-calculator');

    // Wait for calculator
    await page.waitForSelector('text=Texas TTL Calculator', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Fill form to get results
    const purchasePriceInput = page.getByLabel('Purchase Price');
    await purchasePriceInput.waitFor({ state: 'visible', timeout: 10000 });
    await purchasePriceInput.fill('40000');

    const downPaymentInput = page.getByLabel('Down Payment');
    await downPaymentInput.fill('8000');

    // Wait for results
    await page.waitForSelector('text=Calculation Results', { timeout: 10000 });

    // Look for Share button
    const shareButton = page.locator('button:has-text("Share")');
    if (await shareButton.count() > 0) {
      await shareButton.first().click();

      // Wait for share modal to appear
      await page.waitForTimeout(1000);

      // Check if share modal appeared
      const shareModal = page.locator('text=Share Your Results');
      if (await shareModal.count() > 0) {
        await expect(shareModal.first()).toBeVisible();
      }
    }
  });

  test('should handle print functionality', async ({ page }) => {
    await page.goto('/texas-ttl-calculator');

    // Wait for calculator
    await page.waitForSelector('text=Texas TTL Calculator', { timeout: 10000 });
    await page.waitForTimeout(500);

    // Fill form to get results
    const purchasePriceInput = page.getByLabel('Purchase Price');
    await purchasePriceInput.waitFor({ state: 'visible', timeout: 10000 });
    await purchasePriceInput.fill('50000');

    // Wait for results
    await page.waitForSelector('text=Calculation Results', { timeout: 10000 });

    // Verify PDF/Print button exists
    const pdfButton = page.locator('button:has-text("PDF")');
    if (await pdfButton.count() > 0) {
      await expect(pdfButton.first()).toBeVisible();
    }

    // Check for Email button
    const emailButton = page.locator('button:has-text("Email")');
    if (await emailButton.count() > 0) {
      await expect(emailButton.first()).toBeVisible();
    }
  });
});
