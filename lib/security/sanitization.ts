// Security sanitization utilities using Zod validation and Next.js built-in sanitization
// For production, we'll add DOMPurify back as needed

// Basic HTML sanitization using built-in string methods
export function sanitizeHtml(input: string): string {
  // Remove all HTML tags and dangerous patterns
  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:(?!image\/(?:png|jpe?g|gif|svg\+xml))/gi, '') // Remove dangerous data URLs
    .trim()
}

// Basic string sanitization for non-HTML text
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
}

// Email sanitization with validation
export function sanitizeEmail(email: string): string {
  const sanitized = email.toLowerCase().trim()
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format')
  }
  return sanitized
}

// URL sanitization with validation
export function sanitizeUrl(url: string): string {
  try {
    const trimmed = url.trim()
    const parsed = new URL(trimmed)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol')
    }
    return parsed.toString()
  } catch {
    throw new Error('Invalid URL')
  }
}

// Phone number sanitization
export function sanitizePhone(phone: string): string {
  // Remove all non-numeric characters except + for international codes
  const sanitized = phone.replace(/[^\d+\-\s()]/g, '').trim()
  // Basic validation - should contain at least 10 digits
  const digitsOnly = sanitized.replace(/\D/g, '')
  if (digitsOnly.length < 10) {
    throw new Error('Invalid phone number format')
  }
  return sanitized
}

// Name sanitization
export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/[^\w\s\-.']/g, '') // Only allow letters, numbers, spaces, hyphens, periods, apostrophes
    .replace(/\s+/g, ' ') // Normalize whitespace
}

// Company name sanitization
export function sanitizeCompany(company: string): string {
  return company
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
}

// Subject/title sanitization
export function sanitizeSubject(subject: string): string {
  return subject
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 200) // Limit length
}

// Message/description sanitization
export function sanitizeMessage(message: string): string {
  return message
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 5000) // Limit length
}

// Sanitize user input for forms with proper validation
export function sanitizeFormInput<T extends Record<string, unknown>>(data: T): T {
  const sanitized = { ...data } as Record<string, unknown>

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string' && value.length > 0) {
      try {
        switch (key) {
          case 'email':
            sanitized[key] = sanitizeEmail(value)
            break
          case 'phone':
            sanitized[key] = sanitizePhone(value)
            break
          case 'url':
          case 'website':
            sanitized[key] = sanitizeUrl(value)
            break
          case 'name':
          case 'firstName':
          case 'lastName':
            sanitized[key] = sanitizeName(value)
            break
          case 'company':
          case 'organization':
            sanitized[key] = sanitizeCompany(value)
            break
          case 'subject':
          case 'title':
            sanitized[key] = sanitizeSubject(value)
            break
          case 'message':
          case 'description':
          case 'content':
            sanitized[key] = sanitizeMessage(value)
            break
          default:
            // Basic sanitization for other string fields
            sanitized[key] = sanitizeText(value)
        }
      } catch (error) {
        // If sanitization fails, throw an error with context
        throw new Error(`Invalid ${key}: ${(error as Error).message}`)
      }
    }
  }

  return sanitized as T
}

// Validate and sanitize contact form data specifically
export function sanitizeContactFormData(data: {
  name: string
  email: string
  phone?: string
  company?: string
  subject?: string
  service?: string
  budget?: string
  message: string
}) {
  return {
    name: sanitizeName(data.name),
    email: sanitizeEmail(data.email),
    phone: data.phone ? sanitizePhone(data.phone) : undefined,
    company: data.company ? sanitizeCompany(data.company) : undefined,
    subject: data.subject ? sanitizeSubject(data.subject) : undefined,
    service: data.service ? sanitizeText(data.service) : undefined,
    budget: data.budget ? sanitizeText(data.budget) : undefined,
    message: sanitizeMessage(data.message),
  }
}

// Newsletter form data sanitization
export function sanitizeNewsletterFormData(data: {
  email: string
  name?: string
}) {
  return {
    email: sanitizeEmail(data.email),
    name: data.name ? sanitizeName(data.name) : undefined,
  }
}

// Lead magnet form data sanitization
export function sanitizeLeadMagnetFormData(data: {
  email: string
  name?: string
  resourceId: string
}) {
  return {
    email: sanitizeEmail(data.email),
    name: data.name ? sanitizeName(data.name) : undefined,
    resourceId: sanitizeText(data.resourceId),
  }
}