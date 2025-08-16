import { test, expect } from '@playwright/test';
import { testData, expectedResponses, selectors, waitTimes } from './helpers/test-data';

test.describe('Contact Form - Validation & Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click(selectors.form.submitButton);

    // Check for validation errors
    const errors = await page.$$(selectors.form.errorMessage);
    expect(errors.length).toBeGreaterThan(0);

    // Specific field errors should be visible
    const firstNameError = await page.textContent('[id*="firstName-error"], [class*="firstName"][class*="error"]');
    expect(firstNameError).toContain('required');

    const lastNameError = await page.textContent('[id*="lastName-error"], [class*="lastName"][class*="error"]');
    expect(lastNameError).toContain('required');

    const emailError = await page.textContent('[id*="email-error"], [class*="email"][class*="error"]');
    expect(emailError).toContain('required');

    const messageError = await page.textContent('[id*="message-error"], [class*="message"][class*="error"]');
    expect(messageError).toContain('required');

    // Form should not be submitted
    const successMessage = await page.$(selectors.form.successMessage);
    expect(successMessage).toBeNull();
  });

  test('should validate email format', async ({ page }) => {
    const invalidEmails = [
      'notanemail',
      'missing@domain',
      '@nodomain.com',
      'spaces in@email.com',
      'double@@domain.com',
    ];

    for (const email of invalidEmails) {
      // Clear previous attempts
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Fill form with invalid email
      await page.fill(selectors.form.firstName, 'Test');
      await page.fill(selectors.form.lastName, 'User');
      await page.fill(selectors.form.email, email);
      await page.fill(selectors.form.message, 'Testing email validation');

      // Try to submit
      await page.click(selectors.form.submitButton);

      // Should show email validation error
      const emailError = await page.waitForSelector('[id*="email-error"], [class*="email"][class*="error"]', {
        timeout: waitTimes.short,
      });
      
      const errorText = await emailError.textContent();
      expect(errorText).toMatch(/invalid|valid|email/i);

      // Form should not be submitted
      const successMessage = await page.$(selectors.form.successMessage);
      expect(successMessage).toBeNull();
    }
  });

  test('should validate phone number format', async ({ page }) => {
    const invalidPhones = [
      'abcdefg',
      '123',
      'phone number',
      '!@#$%^&*()',
    ];

    for (const phone of invalidPhones) {
      // Clear previous attempts
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Fill form with invalid phone
      await page.fill(selectors.form.firstName, 'Test');
      await page.fill(selectors.form.lastName, 'User');
      await page.fill(selectors.form.email, 'test@example.com');
      await page.fill(selectors.form.phone, phone);
      await page.fill(selectors.form.message, 'Testing phone validation');

      // Try to submit
      await page.click(selectors.form.submitButton);

      // Should show phone validation error
      const phoneError = await page.waitForSelector('[id*="phone-error"], [class*="phone"][class*="error"]', {
        timeout: waitTimes.short,
      });
      
      const errorText = await phoneError.textContent();
      expect(errorText).toMatch(/invalid|valid|phone/i);
    }
  });

  test('should validate message minimum length', async ({ page }) => {
    // Fill form with too short message
    await page.fill(selectors.form.firstName, 'Test');
    await page.fill(selectors.form.lastName, 'User');
    await page.fill(selectors.form.email, 'test@example.com');
    await page.fill(selectors.form.message, 'Too short');

    // Try to submit
    await page.click(selectors.form.submitButton);

    // Should show message validation error
    const messageError = await page.waitForSelector('[id*="message-error"], [class*="message"][class*="error"]', {
      timeout: waitTimes.short,
    });
    
    const errorText = await messageError.textContent();
    expect(errorText).toMatch(/10|characters|length/i);

    // Form should not be submitted
    const successMessage = await page.$(selectors.form.successMessage);
    expect(successMessage).toBeNull();
  });

  test('should sanitize and handle XSS attempts', async ({ page }) => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
    ];

    for (const payload of xssPayloads) {
      // Fill form with XSS payload
      await page.fill(selectors.form.firstName, payload);
      await page.fill(selectors.form.lastName, 'Test');
      await page.fill(selectors.form.email, 'xss@test.com');
      await page.fill(selectors.form.message, payload);

      // Submit form
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/contact')
      );

      await page.click(selectors.form.submitButton);
      const response = await responsePromise;

      // Should still accept the form but sanitize the input
      expect(response.status()).toBe(200);

      // Check no alerts were triggered
      const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
      const dialog = await dialogPromise;
      expect(dialog).toBeNull();

      // Clear for next iteration
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should handle SQL injection attempts safely', async ({ page }) => {
    const sqlPayloads = [
      "Robert'; DROP TABLE users;--",
      "1' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users--",
    ];

    for (const payload of sqlPayloads) {
      // Fill form with SQL injection payload
      await page.fill(selectors.form.firstName, payload);
      await page.fill(selectors.form.lastName, 'Test');
      await page.fill(selectors.form.email, 'sql@test.com');
      await page.fill(selectors.form.company, payload);
      await page.fill(selectors.form.message, 'Testing SQL injection protection');

      // Submit form
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/contact')
      );

      await page.click(selectors.form.submitButton);
      const response = await responsePromise;

      // Should handle the input safely
      expect(response.status()).toBe(200);

      // Clear for next iteration
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should clear validation errors when corrected', async ({ page }) => {
    // Submit empty form to trigger errors
    await page.click(selectors.form.submitButton);

    // Wait for errors to appear
    await page.waitForSelector(selectors.form.errorMessage);

    // Fix first name field
    await page.fill(selectors.form.firstName, 'John');
    
    // First name error should disappear
    const firstNameError = await page.$('[id*="firstName-error"], [class*="firstName"][class*="error"]');
    if (firstNameError) {
      await expect(firstNameError).toBeHidden({ timeout: waitTimes.short });
    }

    // Fix email field
    await page.fill(selectors.form.email, 'john@example.com');
    
    // Email error should disappear
    const emailError = await page.$('[id*="email-error"], [class*="email"][class*="error"]');
    if (emailError) {
      await expect(emailError).toBeHidden({ timeout: waitTimes.short });
    }
  });

  test('should maintain form state during validation', async ({ page }) => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      company: 'Test Corp',
    };

    // Fill form with valid data except message
    await page.fill(selectors.form.firstName, validData.firstName);
    await page.fill(selectors.form.lastName, validData.lastName);
    await page.fill(selectors.form.email, validData.email);
    await page.fill(selectors.form.phone, validData.phone);
    await page.fill(selectors.form.company, validData.company);
    
    // Submit with missing message
    await page.click(selectors.form.submitButton);

    // Should show message error
    await page.waitForSelector('[id*="message-error"], [class*="message"][class*="error"]');

    // Other fields should retain their values
    expect(await page.inputValue(selectors.form.firstName)).toBe(validData.firstName);
    expect(await page.inputValue(selectors.form.lastName)).toBe(validData.lastName);
    expect(await page.inputValue(selectors.form.email)).toBe(validData.email);
    expect(await page.inputValue(selectors.form.phone)).toBe(validData.phone);
    expect(await page.inputValue(selectors.form.company)).toBe(validData.company);
  });

  test('should handle special characters in legitimate input', async ({ page }) => {
    const specialCharData = {
      firstName: "O'Brien",
      lastName: "Smith-Jones",
      email: 'user+test@example.com',
      company: 'AT&T Corporation',
      message: 'Hello! I need help with my website. Can you assist? Thanks & regards.',
    };

    // Fill form with special characters
    await page.fill(selectors.form.firstName, specialCharData.firstName);
    await page.fill(selectors.form.lastName, specialCharData.lastName);
    await page.fill(selectors.form.email, specialCharData.email);
    await page.fill(selectors.form.company, specialCharData.company);
    await page.fill(selectors.form.message, specialCharData.message);

    // Submit form
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/contact') && response.status() === 200
    );

    await page.click(selectors.form.submitButton);
    const response = await responsePromise;

    // Should accept legitimate special characters
    expect(response.status()).toBe(200);
    
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
  });

  test('should handle very long input gracefully', async ({ page }) => {
    const longString = 'A'.repeat(10000);

    // Fill form with very long input
    await page.fill(selectors.form.firstName, 'Test');
    await page.fill(selectors.form.lastName, 'User');
    await page.fill(selectors.form.email, 'test@example.com');
    await page.fill(selectors.form.message, longString);

    // Submit form
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/contact')
    );

    await page.click(selectors.form.submitButton);
    const response = await responsePromise;

    // Should handle long input (either accept with truncation or show error)
    expect([200, 400].includes(response.status())).toBe(true);
    
    if (response.status() === 400) {
      // If rejected, should show appropriate error
      const errorMessage = await page.waitForSelector(selectors.form.errorMessage);
      const errorText = await errorMessage.textContent();
      expect(errorText).toMatch(/too long|maximum|length/i);
    }
  });
});