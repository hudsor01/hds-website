/**
 * Security utilities for input sanitization and validation
 * Implements defense-in-depth approach to prevent injection attacks
 */

import type { ContactValidationResult } from '@/types/forms';

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param text - Raw user input text
 * @returns HTML-escaped safe text
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') return '';
  
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return text.replace(/[&<>"'`=/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Sanitize input for email headers to prevent header injection
 * Removes newlines, carriage returns, and other control characters
 * @param text - Raw user input
 * @returns Sanitized text safe for email headers
 */
export function sanitizeEmailHeader(text: string): string {
  if (typeof text !== 'string') return '';
  
  // Remove all control characters including newlines, carriage returns, null bytes
  return text
    .replace(/[\r\n\x00-\x1F\x7F]/g, '')
    .trim()
    .substring(0, 255); // Limit header field length
}

/**
 * Validate email format using RFC-compliant regex
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  
  // RFC 5322 compliant email regex (simplified for practical use)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email) && email.length <= 254; // Max email length per RFC
}

/**
 * Validate phone number format (international)
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export function isValidPhone(phone: string): boolean {
  if (typeof phone !== 'string') return false;
  
  // Allow digits, spaces, hyphens, parentheses, and + for international
  const phoneRegex = /^[\d\s\-\(\)\+]{7,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitize and validate name fields
 * @param name - Name to validate
 * @returns Sanitized name or null if invalid
 */
export function sanitizeName(name: string): string | null {
  if (typeof name !== 'string') return null;
  
  // Trim and remove excessive whitespace
  const sanitized = name.trim().replace(/\s+/g, ' ');
  
  // Allow letters, spaces, hyphens, apostrophes (common in names)
  // Block numbers and special characters that shouldn't be in names
  const nameRegex = /^[a-zA-ZÀ-ÿĀ-žА-я\s\-'\.]{1,50}$/;
  
  if (!nameRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
}

/**
 * Sanitize free-form text input (messages, descriptions)
 * @param text - Text to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized text
 */
export function sanitizeText(text: string, maxLength: number = 5000): string {
  if (typeof text !== 'string') return '';
  
  // Remove null bytes and other dangerous control characters
  // But keep newlines and tabs for formatting
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .substring(0, maxLength);
}

/**
 * Validate service selection from predefined list
 * @param service - Selected service
 * @returns True if valid service option
 */
export function isValidService(service: string): boolean {
  const validServices = [
    'Web Development',
    'Mobile Apps',
    'UI/UX Design',
    'Digital Marketing',
    'Brand Strategy',
    'Consulting',
    'E-commerce Solutions',
    'Custom Software',
    'Other'
  ];
  
  return validServices.includes(service);
}

/**
 * Validate time preference selection
 * @param time - Selected time preference
 * @returns True if valid time option
 */
export function isValidTimePreference(time: string): boolean {
  const validTimes = [
    'Morning (9AM-12PM)',
    'Afternoon (12PM-5PM)',
    'Evening (5PM-8PM)',
    'Flexible'
  ];
  
  return validTimes.includes(time);
}


/**
 * Comprehensive contact form data validation
 * @param data - Raw form data
 * @returns Validation result with sanitized data or errors
 */


export function validateContactForm(data: unknown): ContactValidationResult {
  const errors: Record<string, string> = {};
  
  // Type check - ensure data is an object
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Invalid form data' } };
  }
  
  // Type guard - cast to record to access properties
  const formData = data as Record<string, unknown>;
  
  // Validate and sanitize first name
  const firstName = sanitizeName(String(formData.firstName || ''));
  if (!firstName) {
    errors.firstName = 'Please enter a valid first name (letters only, max 50 characters)';
  }
  
  // Validate and sanitize last name
  const lastName = sanitizeName(String(formData.lastName || ''));
  if (!lastName) {
    errors.lastName = 'Please enter a valid last name (letters only, max 50 characters)';
  }
  
  // Validate email
  const email = String(formData.email || '');
  if (!email || !isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Validate phone (optional)
  const phone = formData.phone ? String(formData.phone) : undefined;
  if (phone && !isValidPhone(phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  // Sanitize company (optional)
  const company = formData.company ? sanitizeText(String(formData.company), 100) : undefined;
  
  // Validate service
  const service = String(formData.service || '');
  if (!service || !isValidService(service)) {
    errors.service = 'Please select a valid service';
  }
  
  // Validate time preference
  const bestTimeToContact = String(formData.bestTimeToContact || '');
  if (!bestTimeToContact || !isValidTimePreference(bestTimeToContact)) {
    errors.bestTimeToContact = 'Please select a valid contact time';
  }
  
  // Validate and sanitize message
  const message = sanitizeText(String(formData.message || ''), 5000);
  if (!message || message.length < 10) {
    errors.message = 'Please enter a message (at least 10 characters)';
  }
  
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }
  
  return {
    isValid: true,
    data: {
      firstName: firstName!,
      lastName: lastName!,
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      company,
      service,
      bestTimeToContact,
      message
    }
  };
}

/**
 * Detect potential injection attempts for logging/monitoring
 * @param input - Input to check
 * @returns True if potential injection detected
 */
export function detectInjectionAttempt(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  const injectionPatterns = [
    // XSS patterns
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    
    // SQL injection patterns
    /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b)\s+/gi,
    /--\s*$/gm,
    
    // Command injection patterns
    /[;&|`$]/g,
    
    // Path traversal
    /\.\.[\/\\]/g,
    
    // LDAP injection
    /[*()\\]/g
  ];
  
  return injectionPatterns.some(pattern => pattern.test(input));
}

/**
 * Rate limit key generator for contact forms
 * @param identifier - IP address or user identifier
 * @returns Rate limit key
 */
export function getRateLimitKey(identifier: string): string {
  return `contact-form:${identifier}`;
}