// Type definitions for email-related functionality

import { z } from 'zod'
import { emailSchema } from '@/lib/email/resend'

/**
 * Email payload for Resend emails
 */
export type EmailPayload = z.infer<typeof emailSchema>

/**
 * Result from sending an email
 */
export interface EmailResult {
  success: boolean
  response?: Record<string, unknown>
  error?: string
  details?: Record<string, unknown>
}

/**
 * Contact form data structure
 */
export interface ContactFormData {
  name: string
  email: string
  company?: string
  phone?: string
  message: string
}

/**
 * Newsletter signup data structure
 */
export interface NewsletterSignupData {
  email: string
  firstName?: string
  lastName?: string
}

/**
 * Lead magnet request data structure
 */
export interface LeadMagnetRequestData {
  email: string
  firstName?: string
  lastName?: string
  resourceId: string
}

/**
 * Lead magnet data structure for email templates
 */
export interface LeadMagnetData {
  email: string
  firstName?: string
  lastName?: string
  resourceName: string
  downloadLink: string
}

/**
 * Lead magnet resource information
 */
export interface LeadMagnetResource {
  name: string
  filePath: string
  description?: string
}

/**
 * Map of resource IDs to their information
 */
export type LeadMagnetResourceMap = Record<string, LeadMagnetResource>
