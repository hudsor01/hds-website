import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Escape HTML characters to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Detect potential injection attempts in user input
 */
export function detectInjectionAttempt(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  const injectionPatterns = [
    /(<script|javascript:|vbscript:|on\w+\s*=)/i, // XSS attempts
    /(\.\.\/|<iframe|<object|<embed)/i, // Path traversal and embedded content
    /(;|\|\||&&|DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|UNION|SELECT\s+\*\s+FROM)/i, // SQL injection patterns
    /(\$\{|\{\s*\w+\s*\}|\{\s*.*\s*\})/g, // Template injection patterns
    /(%0A|%0D|\r\n|\r|\n)/g, // Newline injection (for header injection)
  ];

  return injectionPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize email headers to prevent header injection
 */
export function sanitizeEmailHeader(header: string): string {
  if (typeof header !== 'string') {
    return '';
  }

  // Remove any newline characters that could be used for header injection
  return header
    .replace(/[\r\n]/g, '') // Remove carriage returns and newlines
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Format currency with proper locale
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date with proper locale
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with long format
 */
export function formatDateLong(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
