/**
 * Contact Form Action Tests
 * TDD tests for contact form submission and helper functions
 */

import { processEmailTemplate } from '@/lib/email-utils';
import {
  contactFormSchema,
  scoreLeadFromContactData,
} from '@/lib/schemas/contact';
import { detectInjectionAttempt, escapeHtml } from '@/lib/utils';
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { cleanupMocks, setupContactFormMocks } from '../test-utils';

// ================================
// Contact Form Schema Tests
// ================================

describe('Contact Form Schema Validation', () => {
  it('should validate a complete valid form submission', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      message: 'I need help with my website project.',
      company: 'Acme Corp',
      phone: '555-123-4567',
      service: 'web-development',
      budget: '5k-15k',
      timeline: '1-month',
    };

    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate minimal required fields', () => {
    const minimalData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      message: 'Hello, I need help with something.',
    };

    const result = contactFormSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });

  it('should reject missing firstName', () => {
    const invalidData = {
      email: 'john@example.com',
      message: 'Hello',
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email format', () => {
    const invalidData = {
      firstName: 'John',
      email: 'not-an-email',
      message: 'Hello',
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty message', () => {
    const invalidData = {
      firstName: 'John',
      email: 'john@example.com',
      message: '',
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject message that is too short', () => {
    const invalidData = {
      firstName: 'John',
      email: 'john@example.com',
      message: 'Hi',
    };

    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

// ================================
// Lead Scoring Tests
// ================================

describe('Lead Scoring', () => {
  it('should score high for complete business data with high budget and urgent timeline', () => {
    const leadData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@company.com',
      message: 'We need enterprise web development for our growing company with specific requirements.',
      company: 'Fortune 500 Corp',
      phone: '555-123-4567',
      service: 'web-development' as const,
      budget: '50k-plus' as const,
      timeline: 'asap' as const,
    };

    const result = scoreLeadFromContactData(leadData);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.sequenceType).toBe('high-value-consultation');
  });

  it('should score lower for minimal data', () => {
    const leadData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@gmail.com',
      message: 'Just browsing your site.',
    };

    const result = scoreLeadFromContactData(leadData);
    expect(result.score).toBeLessThan(50);
    expect(result.sequenceType).toBe('standard-welcome');
  });

  it('should detect leads with high budget', () => {
    const leadData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@enterprise.com',
      message: 'Need custom enterprise solution for our business.',
      budget: '50k-plus' as const,
    };

    const result = scoreLeadFromContactData(leadData);
    expect(result.score).toBeGreaterThanOrEqual(30);
  });

  it('should assign high-value sequence for high budget + urgent timeline', () => {
    const highScoreLead = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'ceo@bigcorp.com',
      message: 'Need development work completed quickly for an upcoming product launch deadline.',
      company: 'Big Corporation',
      budget: '15k-50k' as const,
      timeline: 'asap' as const,
      service: 'web-development' as const,
    };

    const result = scoreLeadFromContactData(highScoreLead);
    expect(result.sequenceType).toBe('high-value-consultation');
  });

  it('should assign targeted-service sequence for specific service with budget', () => {
    const leadData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@company.com',
      message: 'We need a new ecommerce website.',
      service: 'web-development' as const,
      budget: '15k-50k' as const,
    };

    const result = scoreLeadFromContactData(leadData);
    expect(result.sequenceType).toBe('targeted-service-consultation');
  });

  it('should assign enterprise-nurture sequence for leads with company', () => {
    const leadData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@company.com',
      message: 'Exploring options for our business.',
      company: 'Acme Corporation',
    };

    const result = scoreLeadFromContactData(leadData);
    expect(result.sequenceType).toBe('enterprise-nurture');
  });
});

// ================================
// Security Detection Tests
// ================================

describe('Security Detection', () => {
  it('should detect SQL injection attempts', () => {
    const sqlInjection = "'; DROP TABLE users; --";
    expect(detectInjectionAttempt(sqlInjection)).toBe(true);
  });

  it('should detect XSS script tags', () => {
    const xssAttempt = '<script>alert("xss")</script>';
    expect(detectInjectionAttempt(xssAttempt)).toBe(true);
  });

  it('should detect JavaScript event handlers', () => {
    const xssAttempt = '<img onerror="alert(1)" src="x">';
    expect(detectInjectionAttempt(xssAttempt)).toBe(true);
  });

  it('should allow normal text', () => {
    const normalText = "Hello, I'm interested in your web development services.";
    expect(detectInjectionAttempt(normalText)).toBe(false);
  });

  it('should allow business names with special characters', () => {
    const businessName = "O'Brien & Associates LLC";
    expect(detectInjectionAttempt(businessName)).toBe(false);
  });

  it('should allow URLs in messages', () => {
    const messageWithUrl = 'Check out my current site at https://example.com';
    expect(detectInjectionAttempt(messageWithUrl)).toBe(false);
  });
});

// ================================
// HTML Escaping Tests
// ================================

describe('HTML Escaping', () => {
  it('should escape HTML special characters', () => {
    const input = '<script>alert("xss")</script>';
    const escaped = escapeHtml(input);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;');
    expect(escaped).toContain('&gt;');
  });

  it('should escape ampersands', () => {
    const input = 'Tom & Jerry';
    const escaped = escapeHtml(input);
    expect(escaped).toBe('Tom &amp; Jerry');
  });

  it('should escape quotes', () => {
    const input = 'He said "Hello"';
    const escaped = escapeHtml(input);
    expect(escaped).toContain('&quot;');
  });

  it('should preserve normal text', () => {
    const input = 'Hello World';
    const escaped = escapeHtml(input);
    expect(escaped).toBe('Hello World');
  });
});

// ================================
// Email Template Processing Tests
// ================================

describe('Email Template Processing', () => {
  it('should replace template variables', () => {
    const template = 'Hello {{firstName}}, welcome to {{company}}!';
    const variables = { firstName: 'John', company: 'Acme' };

    const result = processEmailTemplate(template, variables);
    expect(result).toBe('Hello John, welcome to Acme!');
  });

  it('should handle multiple occurrences of same variable', () => {
    const template = '{{firstName}} loves {{firstName}}';
    const variables = { firstName: 'John' };

    const result = processEmailTemplate(template, variables);
    expect(result).toBe('John loves John');
  });

  it('should handle missing variables gracefully', () => {
    const template = 'Hello {{firstName}}!';
    const variables = {};

    // Should not throw, may leave placeholder or empty
    expect(() => processEmailTemplate(template, variables)).not.toThrow();
  });
});

// ================================
// Form Submission Flow Tests
// ================================

describe('Contact Form Submission Flow', () => {
  beforeEach(async () => {
    setupContactFormMocks();
  });

  afterEach(() => {
    cleanupMocks();
  });

  it.skip('should handle rate limiting', async () => {
    // Skip: Rate limiter is mocked globally for tests
    // This test would need a separate test environment with real rate limiting

    const { submitContactForm } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.append('firstName', 'John');
    formData.append('lastName', 'Doe');
    formData.append('email', 'john@example.com');
    formData.append('message', 'Test message here for rate limiting.');

    const result = await submitContactForm(null, formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Too many requests');
  });

  it('should reject invalid form data - bad email', async () => {
    const { submitContactForm } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.append('firstName', 'John');
    formData.append('lastName', 'Doe');
    formData.append('email', 'invalid-email');
    formData.append('message', 'Test message that is long enough.');

    const result = await submitContactForm(null, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject form data with missing required fields', async () => {
    const { submitContactForm } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.append('firstName', 'John');
    // Missing lastName, email, message

    const result = await submitContactForm(null, formData);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should succeed with valid complete form data', async () => {
    const { submitContactForm } = await import('@/app/actions/contact');

    const formData = new FormData();
    formData.append('firstName', 'John');
    formData.append('lastName', 'Doe');
    formData.append('email', 'john@example.com');
    formData.append('message', 'I need help with my website project and would like to discuss options.');

    const result = await submitContactForm(null, formData);

    expect(result.success).toBe(true);
    expect(result.message).toBeDefined();
  });
});
