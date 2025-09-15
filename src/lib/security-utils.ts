/**
 * Security utilities for input sanitization and validation
 * Implements defense-in-depth approach to prevent injection attacks
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param text - Raw user input text
 * @returns HTML-escaped safe text
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {return '';}
  
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
  if (typeof text !== 'string') {return '';}
  
  // Remove all control characters including newlines, carriage returns, null bytes
  return text
    .replace(/[\r\n\x00-\x1F\x7F]/g, '')
    .trim()
    .substring(0, 255); // Limit header field length
}





/**
 * Detect potential injection attempts for logging/monitoring
 * @param input - Input to check
 * @returns True if potential injection detected
 */
export function detectInjectionAttempt(input: string): boolean {
  if (typeof input !== 'string') {return false;}
  
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