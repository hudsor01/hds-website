/**
 * This file exists for backward compatibility only.
 * All schemas have been moved to the types directory.
 *
 * @deprecated Use the schemas from the types directory instead.
 */

import { z } from 'zod'
import {
  contactFormFullSchema,
  newsletterSchema,
  leadMagnetSchema,
} from '@/types/form-types'

import {
  nameSchema,
  emailSchema,
  phoneSchema,
  companySchema,
  messageSchema,
  subjectSchema,
  urlSchema,
  passwordSchema,
  dateStringSchema,
  csrfTokenSchema,
  captchaTokenSchema,
  nonceSchema,
} from '@/types/validation-schemas'

// Re-export the schemas from the types directory
export {
  // Form schemas
  contactFormFullSchema,
  newsletterSchema,
  leadMagnetSchema,

  // Base schemas
  nameSchema,
  emailSchema,
  phoneSchema,
  companySchema,
  messageSchema,
  subjectSchema,
  urlSchema,
  passwordSchema,
  dateStringSchema,

  // Security schemas
  csrfTokenSchema,
  captchaTokenSchema,
  nonceSchema,
}

// Additional composite schemas
export const authSchema = {
  email: emailSchema,
  password: passwordSchema,
}

export const userProfileSchema = {
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: companySchema,
  bio: emailSchema
    .max(500, { message: 'Bio cannot exceed 500 characters' })
    .optional(),
  website: urlSchema.optional(),
}

// Enums
export const serviceEnum = z.enum([
  'revenue-ops',
  'web-development',
  'data-analytics',
  'business-strategy',
  'other',
])

export const budgetEnum = z.enum(['<10k', '10k-50k', '50k-100k', '>100k'])

export const serviceInquirySchema = {
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: companySchema,
  message: messageSchema,
  service: serviceEnum,
  budget: budgetEnum.optional(),
}

export const commentSchema = {
  name: nameSchema,
  email: emailSchema,
  comment: messageSchema.max(1000, {
    message: 'Comment cannot exceed 1000 characters',
  }),
}
