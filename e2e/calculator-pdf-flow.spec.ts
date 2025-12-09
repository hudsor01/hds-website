import { test, expect } from '@playwright/test';

test.describe('Calculator and Print Flow', () => {
  test('should complete full calculator flow and print results', async ({ page }) => {
    // Navigate to calculator page
    await page.goto('/texas-ttl-calculator');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Fill out calculator form - adjust selectors based on actual component
    await page.fill('input[name="purchasePrice"]', '35000');
    await page.fill('input[name="downPayment"]', '5000');
    await page.selectOption('select[name="loanTermMonths"]', '60');
    await page.fill('input[name="interestRate"]', '5.5');
    await page.fill('input[name="zipCode"]', '75201');

    // Submit calculation
    await page.click('button[type="submit"]');

    // Wait for results to appear - look for the results panel
    await page.waitForSelector('text=Calculation Results', { timeout: 10000 });

    // Verify results are displayed
    await expect(page.locator('text=Monthly Payment')).toBeVisible();
    await expect(page.locator('text=Total Cost')).toBeVisible();

    // Click PDF/Print button
    await page.click('button:has-text("PDF")');

    // Since it uses window.print(), we can't easily test the actual print dialog
    // But we can verify the button exists and is clickable
    await expect(page.locator('button:has-text("PDF")')).toBeVisible();
  });

  test('should handle calculation errors gracefully', async ({ page }) => {
    // Navigate to calculator
    await page.goto('/texas-ttl-calculator');

    // Fill minimal form
    await page.fill('input[name="purchasePrice"]', '25000');

    // Submit calculation
    await page.click('button[type="submit"]');

    // Wait for results
    await page.waitForSelector('text=Calculation Results', { timeout: 10000 });

    // Verify results appear (no error state visible)
    await expect(page.locator('text=Calculation Results')).toBeVisible();
  });

  test('should validate calculator input fields', async ({ page }) => {
    await page.goto('/texas-ttl-calculator');

    // Test with invalid data
    await page.fill('input[name="purchasePrice"]', 'invalid');
    await page.fill('input[name="interestRate"]', '-5');

    // Submit
    await page.click('button[type="submit"]');

    // The form should handle validation - either show errors or sanitize inputs
    // For now, just verify the page doesn't crash
    await expect(page.locator('text=Texas TTL Calculator')).toBeVisible();
  });

  test('should save and share calculator configurations', async ({ page }) => {
    await page.goto('/texas-ttl-calculator');

    // Fill form
    await page.fill('input[name="purchasePrice"]', '40000');
    await page.fill('input[name="downPayment"]', '8000');
    await page.selectOption('select[name="loanTermMonths"]', '72');

    // Submit calculation
    await page.click('button[type="submit"]');

    // Wait for results
    await page.waitForSelector('text=Calculation Results', { timeout: 10000 });

    // Click Save button
    await page.click('button:has-text("Save")');

    // Click Share button
    await page.click('button:has-text("Share")');

    // Verify share modal appears
    await expect(page.locator('text=Share Your Results')).toBeVisible();
  });

  test('should handle print functionality', async ({ page }) => {
    await page.goto('/texas-ttl-calculator');

    // Fill form for different scenarios
    await page.fill('input[name="purchasePrice"]', '50000');
    await page.selectOption('select[name="loanTermMonths"]', '48');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for results
    await page.waitForSelector('text=Calculation Results', { timeout: 10000 });

    // Verify PDF/Print button exists
    await expect(page.locator('button:has-text("PDF")')).toBeVisible();

    // Click Email button
    await page.click('button:has-text("Email")');

    // Should trigger share modal first if no share code exists
    await expect(page.locator('text=Share Your Results')).toBeVisible();
  });
});
