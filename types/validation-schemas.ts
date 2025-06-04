import { z } from 'zod'

// ======== User Information Schemas =========

/**
 * Basic name validation
 */
export const nameSchema = z
  .string()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(100, { message: 'Name cannot exceed 100 characters' })
  .refine(value => /^[a-zA-Z\s\-'.]+$/.test(value), {
    message:
      'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
  })

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email({ message: 'Please enter a valid email address' })
  .max(255, { message: 'Email cannot exceed 255 characters' })

/**
 * Phone number validation (optional)
 */
export const phoneSchema = z
  .string()
  .min(7, { message: 'Phone number must be at least 7 characters' })
  .max(20, { message: 'Phone number cannot exceed 20 characters' })
  .refine(value => /^[\d+\-()\\s.]+$/.test(value), {
    message:
      'Phone number can only contain digits, spaces, and the characters: + - ( )',
  })
  .optional()

/**
 * Company name validation (optional)
 */
export const companySchema = z
  .string()
  .min(2, { message: 'Company name must be at least 2 characters' })
  .max(100, { message: 'Company name cannot exceed 100 characters' })
  .optional()

// ======== Form Field Schemas =========

/**
 * Generic message validation
 */
export const messageSchema = z
  .string()
  .min(10, { message: 'Message must be at least 10 characters' })
  .max(2000, { message: 'Message cannot exceed 2000 characters' })

/**
 * Subject line validation
 */
export const subjectSchema = z
  .string()
  .min(3, { message: 'Subject must be at least 3 characters' })
  .max(100, { message: 'Subject cannot exceed 100 characters' })

/**
 * URL validation
 */
export const urlSchema = z
  .string()
  .url({ message: 'Please enter a valid URL' })
  .max(2048, { message: 'URL cannot exceed 2048 characters' })

/**
 * Password validation with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(100, { message: 'Password cannot exceed 100 characters' })
  .refine(password => /[A-Z]/.test(password), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine(password => /[a-z]/.test(password), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine(password => /[0-9]/.test(password), {
    message: 'Password must contain at least one number',
  })
  .refine(password => /[^A-Za-z0-9]/.test(password), {
    message: 'Password must contain at least one special character',
  })

/**
 * Date string validation
 */
export const dateStringSchema = z
  .string()
  .refine(value => !isNaN(Date.parse(value)), {
    message: 'Please enter a valid date',
  })

// ======== Security Schemas =========

/**
 * CSRF token schema
 */
export const csrfTokenSchema = z
  .string()
  .min(1, { message: 'CSRF token is required' })

/**
 * Legacy CAPTCHA token schema (deprecated - now using Clerk + spam protection)
 * @deprecated Use spam protection fields instead
 */
export const captchaTokenSchema = z
  .string()
  .min(1, { message: 'Verification token is required' })
  .optional()

/**
 * Schema for validating a nonce
 */
export const nonceSchema = z.string().length(22, { message: 'Invalid nonce' })
