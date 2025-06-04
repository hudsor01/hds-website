/**
 * Input Sanitization Utilities
 * 
 * Security utilities for sanitizing user input to prevent XSS, SQL injection,
 * and other security vulnerabilities.
 */

import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

/**
 * HTML sanitization options
 */
interface SanitizeOptions {
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  allowedSchemes?: string[]
  stripEmpty?: boolean
}

/**
 * Default allowed HTML tags for rich text
 */
const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre',
]

/**
 * Default allowed attributes
 */
const DEFAULT_ALLOWED_ATTRIBUTES = {
  a: ['href', 'title', 'target', 'rel'],
  '*': ['class'],
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(
  input: string,
  options: SanitizeOptions = {},
): string {
  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
    allowedSchemes = ['http', 'https', 'mailto'],
    stripEmpty = true,
  } = options

  // Configure DOMPurify
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: Object.entries(allowedAttributes).flatMap(([tag, attrs]) =>
      attrs.map(attr => (tag === '*' ? attr : `${tag}@${attr}`)),
    ),
    ALLOWED_URI_REGEXP: new RegExp(`^(${allowedSchemes.join('|')}):`, 'i'),
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
  })

  // Strip empty tags if requested
  if (stripEmpty) {
    return clean.replace(/<(\w+)(?:\s[^>]*)?>[\s]*<\/\1>/g, '')
  }

  return clean
}

/**
 * Sanitize plain text (removes all HTML)
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}

/**
 * Sanitize and validate email
 */
export function sanitizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase()
  const emailSchema = z.string().email()
  
  try {
    return emailSchema.parse(trimmed)
  } catch {
    throw new Error('Invalid email format')
  }
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string, allowedProtocols = ['http', 'https']): string {
  const trimmed = url.trim()
  
  // Check protocol
  const protocolMatch = trimmed.match(/^(\w+):/)
  if (protocolMatch && !allowedProtocols.includes(protocolMatch[1])) {
    throw new Error(`Invalid URL protocol. Allowed: ${allowedProtocols.join(', ')}`)
  }
  
  // Validate URL format
  try {
    const urlObj = new URL(trimmed)
    
    // Additional security checks
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      throw new Error('Local URLs are not allowed')
    }
    
    return urlObj.href
  } catch {
    throw new Error('Invalid URL format')
  }
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory traversal attempts
  let safe = filename.replace(/\.\./g, '')
  
  // Remove special characters except dots, dashes, and underscores
  safe = safe.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  
  // Remove multiple consecutive dots
  safe = safe.replace(/\.{2,}/g, '.')
  
  // Limit length
  if (safe.length > 255) {
    const ext = safe.split('.').pop() || ''
    const name = safe.substring(0, 255 - ext.length - 1)
    safe = `${name}.${ext}`
  }
  
  return safe
}

/**
 * Sanitize JSON string
 */
export function sanitizeJson(jsonString: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(jsonString)
    // Re-stringify to ensure it's valid JSON and remove any code
    return JSON.parse(JSON.stringify(parsed))
  } catch {
    throw new Error('Invalid JSON format')
  }
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  // Remove all non-numeric characters except + for international
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Basic validation
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error('Invalid phone number length')
  }
  
  return cleaned
}

/**
 * Sanitize and validate username
 */
export function sanitizeUsername(username: string): string {
  const trimmed = username.trim()
  
  // Check length
  if (trimmed.length < 3 || trimmed.length > 30) {
    throw new Error('Username must be between 3 and 30 characters')
  }
  
  // Allow only alphanumeric, underscore, and dash
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    throw new Error('Username can only contain letters, numbers, underscores, and dashes')
  }
  
  return trimmed
}

/**
 * Sanitize SQL identifier (table/column names)
 */
export function sanitizeSqlIdentifier(identifier: string): string {
  // Allow only alphanumeric and underscore
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new Error('Invalid SQL identifier')
  }
  
  // Check against common SQL keywords
  const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER']
  if (sqlKeywords.includes(identifier.toUpperCase())) {
    throw new Error('SQL keyword cannot be used as identifier')
  }
  
  return identifier
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  let sanitized = query.trim()
  
  // Remove SQL injection attempts
  sanitized = sanitized.replace(/['";\\]/g, '')
  
  // Remove common SQL keywords
  const dangerousPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION|EXEC|SCRIPT)\b/gi,
    /--/g,
    /\/\*/g,
    /\*\//g,
  ]
  
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })
  
  // Limit length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200)
  }
  
  return sanitized
}

/**
 * Create sanitized form data validator
 */
export function createSanitizedFormSchema<T extends z.ZodRawShape>(
  shape: T,
  sanitizers?: Partial<Record<keyof T, (value: unknown) => unknown>>,
) {
  const transformedShape: Record<string, unknown> = {}
  
  Object.entries(shape).forEach(([key, schema]) => {
    const sanitizer = sanitizers?.[key as keyof T]
    
    if (sanitizer && schema instanceof z.ZodString) {
      transformedShape[key] = schema.transform(sanitizer)
    } else {
      transformedShape[key] = schema
    }
  })
  
  return z.object(transformedShape)
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(
  obj: Record<string, unknown>,
  options: {
    maxDepth?: number
    allowedKeys?: string[]
    sanitizers?: Record<string, (value: unknown) => unknown>
  } = {},
): Record<string, unknown> {
  const { maxDepth = 10, allowedKeys, sanitizers = {} } = options
  
  function sanitizeRecursive(value: Record<string, unknown>, depth: number): Record<string, unknown> {
    if (depth > maxDepth) {
      throw new Error('Maximum object depth exceeded')
    }
    
    if (value === null || value === undefined) {
      return value
    }
    
    if (typeof value === 'string') {
      return sanitizeText(value)
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value
    }
    
    if (Array.isArray(value)) {
      return value.map(item => sanitizeRecursive(item, depth + 1))
    }
    
    if (typeof value === 'object') {
      const sanitized: Record<string, unknown> = {}
      
      Object.entries(value).forEach(([key, val]) => {
        // Check if key is allowed
        if (allowedKeys && !allowedKeys.includes(key)) {
          return
        }
        
        // Apply custom sanitizer if available
        if (sanitizers[key]) {
          sanitized[key] = sanitizers[key](val)
        } else {
          sanitized[key] = sanitizeRecursive(val, depth + 1)
        }
      })
      
      return sanitized
    }
    
    // For other types, convert to string and sanitize
    return sanitizeText(String(value))
  }
  
  return sanitizeRecursive(obj, 0)
}

/**
 * Common sanitizers for form fields
 */
export const commonSanitizers = {
  name: (value: string) => sanitizeText(value).slice(0, 100),
  email: (value: string) => sanitizeEmail(value),
  phone: (value: string) => sanitizePhone(value),
  url: (value: string) => sanitizeUrl(value),
  message: (value: string) => sanitizeHtml(value, { stripEmpty: true }),
  username: (value: string) => sanitizeUsername(value),
  filename: (value: string) => sanitizeFilename(value),
  search: (value: string) => sanitizeSearchQuery(value),
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeRequestBody(
  body: unknown,
  schema?: z.ZodSchema,
): Record<string, unknown> {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body')
  }
  
  // If schema provided, use it for validation and sanitization
  if (schema) {
    return schema.parse(body)
  }
  
  // Otherwise, do generic sanitization
  return sanitizeObject(body as Record<string, unknown>)
}

/**
 * XSS prevention for dynamic content
 */
export function preventXss(content: string): string {
  // Escape HTML entities
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  
  return content.replace(/[&<>"'/]/g, char => escapeMap[char])
}
