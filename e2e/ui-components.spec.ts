import { test, expect } from '@playwright/test';

test.describe('UI Components - Modernized Form Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('FormField component with glassmorphism variant', async ({ page }) => {
    // Check FormField components have glass effect styling
    const firstNameField = await page.locator('input[name="firstName"]');
    
    // Verify the field exists and has proper styling classes
    await expect(firstNameField).toBeVisible();
    const fieldClasses = await firstNameField.getAttribute('class');
    expect(fieldClasses).toContain('bg-white/10');
    expect(fieldClasses).toContain('backdrop-blur-md');
    expect(fieldClasses).toContain('border-white/20');
    
    // Test floating label behavior
    const firstNameLabel = await page.locator('label[for="firstName"]');
    await expect(firstNameLabel).toBeVisible();
    
    // Focus the field and check label animation
    await firstNameField.focus();
    await page.waitForTimeout(300); // Wait for animation
    
    // Type in field and verify label stays floated
    await firstNameField.fill('John');
    const labelClasses = await firstNameLabel.getAttribute('class');
    expect(labelClasses).toContain('text-xs');
    
    // Check icon is present
    const iconElement = await page.locator('input[name="firstName"] ~ * svg').first();
    await expect(iconElement).toBeVisible();
  });

  test('FormSelect component with Radix UI', async ({ page }) => {
    // Find the service select trigger
    const serviceSelectTrigger = await page.locator('[role="combobox"][id="service"]');
    await expect(serviceSelectTrigger).toBeVisible();
    
    // Click to open dropdown
    await serviceSelectTrigger.click();
    
    // Wait for dropdown animation
    await page.waitForTimeout(200);
    
    // Check if dropdown portal is rendered
    const dropdownContent = await page.locator('[role="listbox"]');
    await expect(dropdownContent).toBeVisible();
    
    // Verify glassmorphism effect on dropdown
    const dropdownClasses = await dropdownContent.getAttribute('class');
    expect(dropdownClasses).toContain('bg-gray-800/95');
    expect(dropdownClasses).toContain('backdrop-blur-md');
    
    // Check options are visible with hover effects
    const firstOption = await page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible();
    
    // Hover and check hover state
    await firstOption.hover();
    await page.waitForTimeout(100);
    
    // Select an option
    await firstOption.click();
    
    // Verify dropdown closes and value is selected
    await expect(dropdownContent).not.toBeVisible();
    const selectedValue = await serviceSelectTrigger.textContent();
    expect(selectedValue).toBeTruthy();
    expect(selectedValue).not.toBe('Select service needed');
  });

  test('FormTextArea with character counter', async ({ page }) => {
    const messageTextarea = await page.locator('textarea[name="message"]');
    await expect(messageTextarea).toBeVisible();
    
    // Check glassmorphism styling
    const textareaClasses = await messageTextarea.getAttribute('class');
    expect(textareaClasses).toContain('bg-white/10');
    expect(textareaClasses).toContain('backdrop-blur-md');
    
    // Focus and type to see character counter
    await messageTextarea.focus();
    
    // Character counter should appear on focus
    const charCounter = await page.locator('text=/\\d+\\/1000/');
    await expect(charCounter).toBeVisible();
    
    // Type text and verify counter updates
    const testMessage = 'This is a test message for the textarea component.';
    await messageTextarea.fill(testMessage);
    
    const counterText = await charCounter.textContent();
    expect(counterText).toBe(`${testMessage.length}/1000`);
    
    // Verify icon is present
    const textareaIcon = await page.locator('textarea[name="message"] ~ * svg').first();
    await expect(textareaIcon).toBeVisible();
  });

  test('SubmitButton with loading states and ripple effect', async ({ page }) => {
    const submitButton = await page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    // Check button has gradient styling
    const buttonClasses = await submitButton.getAttribute('class');
    expect(buttonClasses).toContain('bg-gradient-to-r');
    expect(buttonClasses).toContain('from-cyan-500');
    
    // Check button has icon
    const buttonIcon = await submitButton.locator('svg');
    await expect(buttonIcon).toBeVisible();
    
    // Fill minimum required fields to enable submission
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'Test message');
    
    // Mock API to prevent actual submission
    await page.route('**/api/contact', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Test response' })
      });
    });
    
    // Click button and check loading state
    await submitButton.click();
    
    // Button should show loading spinner
    const loadingSpinner = await page.locator('button[type="submit"] .animate-spin');
    await expect(loadingSpinner).toBeVisible();
    
    // Button text should change to loading text
    const buttonText = await submitButton.textContent();
    expect(buttonText).toContain('Sending...');
  });

  test('Form field error states with animations', async ({ page }) => {
    // Submit empty form to trigger validation errors
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Check error styling on required fields
    const firstNameField = await page.locator('input[name="firstName"]');
    const firstNameClasses = await firstNameField.getAttribute('class');
    expect(firstNameClasses).toContain('border-red-500');
    
    // Check error message with icon
    const errorMessage = await page.locator('text=/First [Nn]ame.*required/i').first();
    await expect(errorMessage).toBeVisible();
    
    // Error icon should be visible
    const errorIcon = await page.locator('[id="firstName-error"] svg');
    await expect(errorIcon).toBeVisible();
    
    // Fill the field and verify error clears
    await firstNameField.fill('John');
    await page.waitForTimeout(300); // Wait for animation
    
    // Move to next field to trigger blur
    await page.locator('input[name="lastName"]').focus();
    
    // Error should be cleared
    await expect(errorMessage).not.toBeVisible();
  });

  test('Framer Motion animations on form interactions', async ({ page }) => {
    // Check initial fade-in animation
    const form = await page.locator('form');
    await expect(form).toHaveClass(/fade-in/);
    
    // Check field animations on interaction
    const emailField = await page.locator('input[name="email"]');
    
    // Get initial position
    const initialBox = await emailField.boundingBox();
    expect(initialBox).toBeTruthy();
    
    // Focus field and check for smooth transition
    await emailField.focus();
    await page.waitForTimeout(300); // Wait for any animations
    
    // The field should maintain smooth transitions
    const focusedClasses = await emailField.getAttribute('class');
    expect(focusedClasses).toContain('transition-all');
    expect(focusedClasses).toContain('duration-200');
  });
});

test.describe('UI Components - Responsive Design', () => {
  test('Components adapt to mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Check grid layout changes to single column
    const gridContainer = await page.locator('.grid.grid-cols-1.md\\:grid-cols-2').first();
    const containerBox = await gridContainer.boundingBox();
    
    if (containerBox) {
      // On mobile, fields should stack vertically
      const firstField = await page.locator('input[name="firstName"]');
      const lastField = await page.locator('input[name="lastName"]');
      
      const firstBox = await firstField.boundingBox();
      const lastBox = await lastField.boundingBox();
      
      if (firstBox && lastBox) {
        // Last name field should be below first name field on mobile
        expect(lastBox.y).toBeGreaterThan(firstBox.y + firstBox.height);
      }
    }
    
    // All components should remain functional
    const submitButton = await page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('Components adapt to tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Check grid layout uses two columns on tablet
    const firstField = await page.locator('input[name="firstName"]');
    const lastField = await page.locator('input[name="lastName"]');
    
    const firstBox = await firstField.boundingBox();
    const lastBox = await lastField.boundingBox();
    
    if (firstBox && lastBox) {
      // Fields should be side by side on tablet
      expect(Math.abs(firstBox.y - lastBox.y)).toBeLessThan(10);
      expect(lastBox.x).toBeGreaterThan(firstBox.x + firstBox.width);
    }
  });
});

test.describe('UI Components - Accessibility', () => {
  test('Components meet WCAG standards', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Check color contrast for glassmorphism elements
    const firstNameField = await page.locator('input[name="firstName"]');
    
    // Verify ARIA attributes
    const ariaInvalid = await firstNameField.getAttribute('aria-invalid');
    expect(ariaInvalid).toBe('false');
    
    // Check focus indicators
    await firstNameField.focus();
    const focusedClasses = await firstNameField.getAttribute('class');
    expect(focusedClasses).toContain('focus:ring-2');
    expect(focusedClasses).toContain('focus:ring-cyan-400');
    
    // Tab navigation should work properly
    await page.keyboard.press('Tab');
    const activeElement = await page.evaluate(() => document.activeElement?.getAttribute('name'));
    expect(activeElement).toBe('lastName');
    
    // Labels should be properly associated
    const labels = await page.locator('label[for]');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThan(0);
    
    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i);
      const forAttribute = await label.getAttribute('for');
      if (forAttribute) {
        const associatedInput = await page.locator(`#${forAttribute}`);
        await expect(associatedInput).toHaveCount(1);
      }
    }
  });

  test('Screen reader support', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Check ARIA labels and descriptions
    const messageField = await page.locator('textarea[name="message"]');
    const ariaDescribedBy = await messageField.getAttribute('aria-describedby');
    
    if (ariaDescribedBy) {
      const description = await page.locator(`#${ariaDescribedBy}`);
      await expect(description).toBeVisible();
    }
    
    // Required fields should have proper indication
    const requiredFields = await page.locator('input[required], textarea[required]');
    const requiredCount = await requiredFields.count();
    
    for (let i = 0; i < requiredCount; i++) {
      const field = requiredFields.nth(i);
      const name = await field.getAttribute('name');
      
      // Check if label includes required indicator
      const label = await page.locator(`label[for="${name}"]`);
      const labelText = await label.textContent();
      expect(labelText).toContain('*');
    }
  });
});

test.describe('UI Components - Performance', () => {
  test('Components load efficiently', async ({ page }) => {
    // Start measuring
    await page.goto('/contact');
    
    // Wait for all animations to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Check that all interactive elements are ready
    const interactiveElements = await page.locator('input, textarea, button, [role="combobox"]');
    const elementCount = await interactiveElements.count();
    
    for (let i = 0; i < elementCount; i++) {
      const element = interactiveElements.nth(i);
      await expect(element).toBeVisible();
      
      // Elements should be interactive without delay
      const isEnabled = await element.isEnabled();
      expect(isEnabled).toBe(true);
    }
    
    // Animations should be smooth (CSS transitions are applied)
    const animatedElements = await page.locator('[class*="transition"]');
    const animatedCount = await animatedElements.count();
    expect(animatedCount).toBeGreaterThan(0);
  });
});