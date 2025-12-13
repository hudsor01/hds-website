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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Detect potential injection attempts in user input
 * @param input - The input string to check
 * @param context - Optional context indicating how the input will be used (for stricter checks)
 */
export function detectInjectionAttempt(input: string, context?: 'sql' | 'template' | 'html' | 'header'): boolean {
  if (typeof input !== 'string') {
    return false;
  }

  // Always check for XSS and basic dangerous patterns
 const basePatterns = [
    /(<script|javascript:|vbscript:|on\w+\s*=)/i, // XSS attempts
    /(\.\.\/|<iframe|<object|<embed)/i, // Path traversal and embedded content
    /(%0A|%0D|\r\n|\r|\n)/g, // Newline injection (for header injection)
  ];

 if (basePatterns.some(pattern => pattern.test(input))) {
    return true;
  }

  // Context-specific checks for more targeted detection
  if (context === 'sql' || !context) {
    // SQL injection patterns with word boundaries to avoid false positives
    const sqlPatterns = [
      /\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|UNION)\b/i,
      /(;|\|\||&&)/, // Command separators
      /\bSELECT\s+\*\s+FROM\b/i, // Only flag this in SQL context
    ];

    if (sqlPatterns.some(pattern => pattern.test(input))) {
      return true;
    }
  }

  if (context === 'template' || !context) {
    // Template injection - more specific to actual template syntax with expressions
    const templatePatterns = [
      /\$\{[^}]*\}/, // Template literals with expressions
      /\{\s*[^{}]*[+\-*\/=<>!&|][^{}]*\s*\}/, // Templates with operators (not simple placeholders)
      /\{\s*\w+\s*\}/, // Simple placeholders like {name} are allowed, but complex ones aren't
    ];

    // Only flag complex template patterns, not simple placeholders
    if (templatePatterns.slice(0, 2).some(pattern => pattern.test(input))) {
      // Additional check: if it's just a simple placeholder like {name}, allow it
      const simplePlaceholder = /^\{\s*\w+\s*\}$/;
      if (!simplePlaceholder.test(input.trim())) {
        return true;
      }
    }
  }

  return false;
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
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const dateObj = new Date(date);

  let options: Intl.DateTimeFormatOptions;

  switch (format) {
    case 'short':
      options = { year: 'numeric', month: 'short', day: 'numeric' };
      break;
    case 'long':
      options = { year: 'numeric', month: 'long', day: 'numeric' };
      break;
    default:
      options = { year: 'numeric', month: 'short', day: 'numeric' };
  }

  return dateObj.toLocaleDateString('en-US', options);
}


