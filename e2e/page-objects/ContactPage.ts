import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import type { PostHogEvent, RateLimitTestResponse } from '@/types/test';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
}

export class ContactPage extends BasePage {
  // Form selectors
  readonly form: Locator;
  readonly firstNameField: Locator;
  readonly lastNameField: Locator;
  readonly emailField: Locator;
  readonly phoneField: Locator;
  readonly companyField: Locator;
  readonly serviceField: Locator;
  readonly budgetField: Locator;
  readonly timelineField: Locator;
  readonly messageField: Locator;
  readonly submitButton: Locator;

  // Feedback selectors
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly fieldErrors: Locator;

  // Form validation selectors
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;
  readonly emailError: Locator;
  readonly phoneError: Locator;
  readonly messageError: Locator;

  constructor(page: Page) {
    super(page, '/contact');
    
    // Initialize form selectors with multiple fallbacks
    this.form = page.locator('form').filter({ has: page.locator('input[name="firstName"]') });
    this.firstNameField = page.locator('input[name="firstName"]');
    this.lastNameField = page.locator('input[name="lastName"]');
    this.emailField = page.locator('input[name="email"]');
    this.phoneField = page.locator('input[name="phone"]');
    this.companyField = page.locator('input[name="company"]');
    this.serviceField = page.locator('select[name="service"], input[name="service"]');
    this.budgetField = page.locator('select[name="budget"], input[name="budget"]');
    this.timelineField = page.locator('select[name="timeline"], input[name="timeline"]');
    this.messageField = page.locator('textarea[name="message"]');
    this.submitButton = page.locator('button[type="submit"]');

    // Feedback messages
    this.successMessage = page.locator('[role="alert"], .success-message, [data-testid="success-message"]');
    this.errorMessage = page.locator('.error-message, .field-error, [data-testid="error-message"]');
    this.fieldErrors = page.locator('.field-error, [class*="error"]');

    // Field-specific errors
    this.firstNameError = page.locator('[id*="firstName-error"], [class*="firstName"][class*="error"]');
    this.lastNameError = page.locator('[id*="lastName-error"], [class*="lastName"][class*="error"]');
    this.emailError = page.locator('[id*="email-error"], [class*="email"][class*="error"]');
    this.phoneError = page.locator('[id*="phone-error"], [class*="phone"][class*="error"]');
    this.messageError = page.locator('[id*="message-error"], [class*="message"][class*="error"]');
  }

  // Page-specific overrides
  async waitForPageLoad() {
    await super.waitForPageLoad();
    
    // Wait specifically for the contact form to be ready
    await this.form.waitFor({ state: 'visible', timeout: 20000 });
    await this.firstNameField.waitFor({ state: 'visible', timeout: 5000 });
    await this.submitButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  // Form filling methods
  async fillContactForm(data: ContactFormData) {
    await this.firstNameField.fill(data.firstName);
    await this.lastNameField.fill(data.lastName);
    await this.emailField.fill(data.email);
    
    if (data.phone) {
      await this.phoneField.fill(data.phone);
    }
    
    if (data.company) {
      await this.companyField.fill(data.company);
    }
    
    if (data.service) {
      await this.handleSelectOrInput(this.serviceField, data.service);
    }
    
    if (data.budget) {
      await this.handleSelectOrInput(this.budgetField, data.budget);
    }
    
    if (data.timeline) {
      await this.handleSelectOrInput(this.timelineField, data.timeline);
    }
    
    await this.messageField.fill(data.message);
  }

  private async handleSelectOrInput(field: Locator, value: string) {
    const element = field.first();
    const tagName = await element.evaluate(el => el.tagName);
    
    if (tagName === 'SELECT') {
      await element.selectOption({ label: value });
    } else {
      await element.fill(value);
    }
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async submitFormAndWaitForResponse() {
    const responsePromise = this.waitForResponse('/api/contact');
    await this.submitForm();
    return await responsePromise;
  }

  // Validation methods
  async verifyFormSubmissionSuccess() {
    await this.successMessage.waitFor({ state: 'visible', timeout: 15000 });
    const messageText = await this.successMessage.textContent();
    expect(messageText).toContain("Thank you");
    
    // Verify form is disabled or cleared after submission
    const isSubmitDisabled = await this.submitButton.isDisabled();
    expect(isSubmitDisabled).toBe(true);
  }

  async verifyValidationError(field: 'firstName' | 'lastName' | 'email' | 'phone' | 'message', expectedMessage?: string) {
    const errorLocator = this.getErrorLocatorForField(field);
    await errorLocator.waitFor({ state: 'visible', timeout: 5000 });
    
    if (expectedMessage) {
      const errorText = await errorLocator.textContent();
      expect(errorText).toContain(expectedMessage);
    }
  }

  private getErrorLocatorForField(field: string): Locator {
    switch (field) {
      case 'firstName': return this.firstNameError;
      case 'lastName': return this.lastNameError;
      case 'email': return this.emailError;
      case 'phone': return this.phoneError;
      case 'message': return this.messageError;
      default: throw new Error(`Unknown field: ${field}`);
    }
  }

  async verifyNoValidationErrors() {
    const errorCount = await this.fieldErrors.count();
    expect(errorCount).toBe(0);
  }

  async verifyFormDataPersistence(expectedData: Partial<ContactFormData>) {
    if (expectedData.firstName) {
      expect(await this.firstNameField.inputValue()).toBe(expectedData.firstName);
    }
    if (expectedData.lastName) {
      expect(await this.lastNameField.inputValue()).toBe(expectedData.lastName);
    }
    if (expectedData.email) {
      expect(await this.emailField.inputValue()).toBe(expectedData.email);
    }
    if (expectedData.phone) {
      expect(await this.phoneField.inputValue()).toBe(expectedData.phone);
    }
    if (expectedData.company) {
      expect(await this.companyField.inputValue()).toBe(expectedData.company);
    }
    if (expectedData.message) {
      expect(await this.messageField.inputValue()).toBe(expectedData.message);
    }
  }

  // Accessibility testing
  async verifyFormAccessibility() {
    await super.checkPageAccessibility();
    
    // Check form has proper ARIA labels
    const formAriaLabel = await this.form.getAttribute('aria-label');
    expect(formAriaLabel).toBeTruthy();

    // Check all required fields have labels
    const requiredFields = [
      this.firstNameField,
      this.lastNameField, 
      this.emailField,
      this.messageField
    ];

    for (const field of requiredFields) {
      const id = await field.getAttribute('id');
      const name = await field.getAttribute('name');
      const ariaLabel = await field.getAttribute('aria-label');
      
      if (id) {
        const label = this.page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || !!ariaLabel).toBe(true);
      }
    }

    // Check submit button is accessible
    const buttonText = await this.submitButton.textContent();
    const buttonAriaLabel = await this.submitButton.getAttribute('aria-label');
    expect(buttonText || buttonAriaLabel).toBeTruthy();
  }

  // Security testing helpers
  async testXSSPrevention(payload: string) {
    // Fill form with XSS payload
    await this.fillContactForm({
      firstName: payload,
      lastName: 'Test',
      email: 'xss@test.com',
      message: payload
    });

    const response = await this.submitFormAndWaitForResponse();
    
    // Should accept the form but sanitize input
    expect(response.status()).toBe(200);
    
    // Check no alerts were triggered
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
    const dialog = await dialogPromise;
    expect(dialog).toBeNull();
  }

  async testSQLInjectionPrevention(payload: string) {
    await this.fillContactForm({
      firstName: payload,
      lastName: 'Test',
      email: 'sql@test.com',
      company: payload,
      message: 'Testing SQL injection protection'
    });

    const response = await this.submitFormAndWaitForResponse();
    
    // Should handle input safely
    expect(response.status()).toBe(200);
  }

  // Performance testing
  async measureFormPerformance() {
    const startTime = Date.now();
    
    // Fill form
    await this.fillContactForm({
      firstName: 'Performance',
      lastName: 'Test',
      email: 'perf@test.com',
      message: 'Testing form performance'
    });
    
    const fillTime = Date.now() - startTime;
    
    // Submit form
    const submitStartTime = Date.now();
    const response = await this.submitFormAndWaitForResponse();
    const submitTime = Date.now() - submitStartTime;
    
    return {
      fillTime,
      submitTime,
      responseStatus: response.status(),
      totalTime: fillTime + submitTime
    };
  }

  // Mobile-specific methods
  async verifyMobileUsability() {
    // Check form is visible and not cut off
    const formBox = await this.form.boundingBox();
    expect(formBox).toBeTruthy();
    
    if (formBox) {
      expect(formBox.x).toBeGreaterThanOrEqual(0);
      expect(formBox.width).toBeLessThanOrEqual(await this.page.viewportSize()?.width || 1280);
    }

    // Check all form fields are accessible on mobile
    const formFields = [
      this.firstNameField,
      this.lastNameField,
      this.emailField,
      this.messageField,
      this.submitButton
    ];

    for (const field of formFields) {
      await expect(field).toBeVisible();
      
      const box = await field.boundingBox();
      expect(box).toBeTruthy();
      
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        const viewportWidth = await this.page.viewportSize()?.width || 375;
        expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth);
      }
    }
  }

  async scrollToSubmitButtonIfNeeded() {
    await this.submitButton.scrollIntoViewIfNeeded();
  }

  // Analytics verification
  async verifyFormAnalytics() {
    // Check PostHog events for form interactions
    let capturedEvents: PostHogEvent[] = [];
    
    this.page.on('request', request => {
      if (request.url().includes('posthog') || request.url().includes('/capture')) {
        capturedEvents.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });

    // Fill a field to trigger analytics
    await this.firstNameField.fill('Analytics Test');
    await this.page.waitForTimeout(1000); // Wait for analytics to fire

    expect(capturedEvents.length).toBeGreaterThan(0);
  }

  // Lead scoring verification
  async verifyHighValueLeadScoring(data: ContactFormData) {
    const response = await this.submitFormAndWaitForResponse();
    const responseData = await response.json();
    
    // Verify high lead score is calculated for enterprise data
    expect(responseData.leadScore).toBeDefined();
    
    if (data.budget?.includes('50K+') || data.company?.toLowerCase().includes('enterprise')) {
      expect(responseData.leadScore).toBeGreaterThanOrEqual(70);
    }
  }

  // Rate limiting testing
  async testRateLimiting() {
    const responses: RateLimitTestResponse[] = [];
    
    // Submit multiple requests quickly
    for (let i = 0; i < 6; i++) {
      try {
        const response = await this.page.request.post('/api/contact', {
          data: {
            firstName: 'Rate',
            lastName: 'Test',
            email: `rate-test-${i}@example.com`,
            message: 'Testing rate limiting'
          },
          timeout: 10000
        });
        responses.push(response);
      } catch (error) {
        responses.push({ status: () => 503 });
      }
    }
    
    // Should have some rate limited responses
    const rateLimitedResponses = responses.filter(r => r.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  }

  // Network error handling
  async testNetworkErrorHandling() {
    // Block the API endpoint
    await this.page.route('**/api/contact', route => {
      route.abort('failed');
    });

    await this.fillContactForm({
      firstName: 'Network',
      lastName: 'Test',
      email: 'network@test.com',
      message: 'Testing network error handling'
    });

    await this.submitForm();

    // Should show error message
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    
    // Form should remain fillable for retry
    const isSubmitDisabled = await this.submitButton.isDisabled();
    expect(isSubmitDisabled).toBe(false);

    // Unblock the route for other tests
    await this.page.unroute('**/api/contact');
  }
}