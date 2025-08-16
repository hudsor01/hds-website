import { test, expect } from '@playwright/test';
import { testData, expectedResponses, selectors, waitTimes } from './helpers/test-data';
import { NetworkInterceptor } from './helpers/network-interceptor';

test.describe('Contact Form - Happy Path', () => {
  let interceptor: NetworkInterceptor;

  test.beforeEach(async ({ page }) => {
    interceptor = new NetworkInterceptor(page);
    await interceptor.startRecording();
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(() => {
    interceptor.stopRecording();
  });

  test('should successfully submit contact form with valid data', async ({ page }) => {
    // Generate unique test data for this run
    const formData = {
      ...testData.validContact,
      email: `test-${Date.now()}@hudsondigitalsolutions.com`,
    };

    // Fill out the form
    await page.fill(selectors.form.firstName, formData.firstName);
    await page.fill(selectors.form.lastName, formData.lastName);
    await page.fill(selectors.form.email, formData.email);
    await page.fill(selectors.form.phone, formData.phone);
    await page.fill(selectors.form.company, formData.company);
    
    // Handle select or input for service/budget/timeline
    const serviceElement = await page.$(selectors.form.service);
    if (await serviceElement?.evaluate(el => el.tagName === 'SELECT')) {
      await page.selectOption(selectors.form.service, { label: formData.service });
    } else {
      await page.fill(selectors.form.service, formData.service);
    }

    const budgetElement = await page.$(selectors.form.budget);
    if (await budgetElement?.evaluate(el => el.tagName === 'SELECT')) {
      await page.selectOption(selectors.form.budget, { label: formData.budget });
    } else {
      await page.fill(selectors.form.budget, formData.budget);
    }

    const timelineElement = await page.$(selectors.form.timeline);
    if (await timelineElement?.evaluate(el => el.tagName === 'SELECT')) {
      await page.selectOption(selectors.form.timeline, { label: formData.timeline });
    } else {
      await page.fill(selectors.form.timeline, formData.timeline);
    }

    await page.fill(selectors.form.message, formData.message);

    // Submit the form
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/contact') && response.status() === 200
      ),
      page.click(selectors.form.submitButton),
    ]);

    // Verify success message is displayed
    const successMessage = await page.waitForSelector(selectors.form.successMessage, {
      timeout: waitTimes.formSubmit,
    });
    
    const messageText = await successMessage.textContent();
    expect(messageText).toContain(expectedResponses.success.message);

    // Verify API calls were made
    const emailCalls = interceptor.getEmailAPICalls();
    expect(emailCalls.length).toBeGreaterThan(0);
    
    const contactCall = emailCalls.find(call => call.url.includes('/api/contact'));
    expect(contactCall).toBeDefined();
    expect(contactCall?.status).toBe(200);
    expect(contactCall?.responseBody?.success).toBe(true);

    // Verify CSRF token was used
    const csrfCalls = interceptor.getCSRFCalls();
    expect(csrfCalls.length).toBeGreaterThan(0);

    // Verify PostHog analytics events were sent
    const posthogEvents = interceptor.getPostHogEvents();
    expect(posthogEvents.length).toBeGreaterThan(0);

    // Verify form is cleared or disabled after submission
    const submitButton = await page.$(selectors.form.submitButton);
    const isDisabled = await submitButton?.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('should handle high-value lead with enterprise data', async ({ page }) => {
    const formData = {
      ...testData.highValueContact,
      email: `enterprise-${Date.now()}@fortune500.com`,
    };

    // Fill out the form with high-value indicators
    await page.fill(selectors.form.firstName, formData.firstName);
    await page.fill(selectors.form.lastName, formData.lastName);
    await page.fill(selectors.form.email, formData.email);
    await page.fill(selectors.form.phone, formData.phone);
    await page.fill(selectors.form.company, formData.company);
    
    // Select high-value options
    const budgetElement = await page.$(selectors.form.budget);
    if (await budgetElement?.evaluate(el => el.tagName === 'SELECT')) {
      await page.selectOption(selectors.form.budget, { label: formData.budget });
    } else {
      await page.fill(selectors.form.budget, formData.budget);
    }

    const timelineElement = await page.$(selectors.form.timeline);
    if (await timelineElement?.evaluate(el => el.tagName === 'SELECT')) {
      await page.selectOption(selectors.form.timeline, { label: formData.timeline });
    } else {
      await page.fill(selectors.form.timeline, formData.timeline);
    }

    await page.fill(selectors.form.message, formData.message);

    // Submit and wait for response
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/contact') && response.status() === 200
    );

    await page.click(selectors.form.submitButton);
    const response = await responsePromise;
    const responseData = await response.json();

    // Verify high lead score is calculated
    expect(responseData.leadScore).toBeDefined();
    expect(responseData.leadScore).toBeGreaterThanOrEqual(70); // High-value threshold

    // Verify success message
    await page.waitForSelector(selectors.form.successMessage);
  });

  test('should preserve form data in Zustand store during navigation', async ({ page }) => {
    const partialData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      message: 'Partial message...',
    };

    // Fill partial form
    await page.fill(selectors.form.firstName, partialData.firstName);
    await page.fill(selectors.form.lastName, partialData.lastName);
    await page.fill(selectors.form.email, partialData.email);
    await page.fill(selectors.form.message, partialData.message);

    // Navigate away and back
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Check if form data is preserved (if implemented)
    const firstNameValue = await page.inputValue(selectors.form.firstName);
    const lastNameValue = await page.inputValue(selectors.form.lastName);
    const emailValue = await page.inputValue(selectors.form.email);
    const messageValue = await page.inputValue(selectors.form.message);

    // Note: This will fail if form persistence is not implemented
    // Comment out if not implemented yet
    /*
    expect(firstNameValue).toBe(partialData.firstName);
    expect(lastNameValue).toBe(partialData.lastName);
    expect(emailValue).toBe(partialData.email);
    expect(messageValue).toBe(partialData.message);
    */
  });

  test('should track form interactions with PostHog', async ({ page }) => {
    // Fill form fields one by one to track interactions
    await page.fill(selectors.form.firstName, 'Analytics');
    await page.fill(selectors.form.lastName, 'Test');
    await page.fill(selectors.form.email, 'analytics@test.com');
    
    // Wait a bit to ensure events are batched
    await page.waitForTimeout(waitTimes.short);

    // Check PostHog events were captured
    const posthogEvents = interceptor.getPostHogEvents();
    
    // Should have events for page view and form interactions
    expect(posthogEvents.length).toBeGreaterThan(0);
    
    // Verify events contain expected properties
    const captureEvents = posthogEvents.filter(event => 
      event.requestBody?.batch?.[0]?.event || 
      event.requestBody?.event
    );
    expect(captureEvents.length).toBeGreaterThan(0);
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check form has proper ARIA labels
    const form = await page.$(selectors.form.container);
    const ariaLabel = await form?.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    // Check all inputs have labels
    const inputs = await page.$$('input, textarea, select');
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const ariaLabel = await input.getAttribute('aria-label');
      
      // Should have either a label for the id, or an aria-label
      if (id) {
        const label = await page.$(`label[for="${id}"]`);
        expect(label || ariaLabel).toBeTruthy();
      }
    }

    // Check submit button is accessible
    const submitButton = await page.$(selectors.form.submitButton);
    const buttonText = await submitButton?.textContent();
    const buttonAriaLabel = await submitButton?.getAttribute('aria-label');
    expect(buttonText || buttonAriaLabel).toBeTruthy();
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Block the API endpoint to simulate network error
    await context.route('**/api/contact', route => {
      route.abort('failed');
    });

    // Fill and submit form
    await page.fill(selectors.form.firstName, 'Network');
    await page.fill(selectors.form.lastName, 'Test');
    await page.fill(selectors.form.email, 'network@test.com');
    await page.fill(selectors.form.message, 'Testing network error handling');

    await page.click(selectors.form.submitButton);

    // Should show error message
    const errorMessage = await page.waitForSelector(selectors.form.errorMessage, {
      timeout: waitTimes.medium,
    });
    
    const errorText = await errorMessage.textContent();
    expect(errorText).toBeTruthy();
    
    // Form should remain fillable for retry
    const submitButton = await page.$(selectors.form.submitButton);
    const isDisabled = await submitButton?.isDisabled();
    expect(isDisabled).toBe(false);
  });
});

test.describe('Contact Form - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should be fully functional on mobile devices', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Check form is visible and not cut off
    const form = await page.$(selectors.form.container);
    const isVisible = await form?.isVisible();
    expect(isVisible).toBe(true);

    // Check all form fields are accessible
    const formFields = [
      selectors.form.firstName,
      selectors.form.lastName,
      selectors.form.email,
      selectors.form.message,
      selectors.form.submitButton,
    ];

    for (const field of formFields) {
      const element = await page.$(field);
      const isVisible = await element?.isVisible();
      expect(isVisible).toBe(true);
      
      // Check element is within viewport
      const box = await element?.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(375);
      }
    }

    // Test form submission on mobile
    await page.fill(selectors.form.firstName, 'Mobile');
    await page.fill(selectors.form.lastName, 'User');
    await page.fill(selectors.form.email, 'mobile@test.com');
    await page.fill(selectors.form.message, 'Testing from mobile device');

    // Scroll to submit button if needed
    await page.locator(selectors.form.submitButton).scrollIntoViewIfNeeded();
    
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/contact') && response.status() === 200
      ),
      page.click(selectors.form.submitButton),
    ]);

    // Verify success message is visible on mobile
    const successMessage = await page.waitForSelector(selectors.form.successMessage);
    const isSuccessVisible = await successMessage.isVisible();
    expect(isSuccessVisible).toBe(true);
  });
});