/**
 * Form Validation Schemas
 *
 * @deprecated This module is deprecated. Use the centralized schemas from @/types/form-types instead.
 * This file now re-exports from the centralized types for backward compatibility.
 */

// Re-export centralized schemas and types for backward compatibility
export {
  nameSchema,
  emailSchema,
  phoneSchema,
  companySchema,
  messageSchema,
  subjectSchema,
  captchaTokenSchema,
  urlSchema,
  contactFormFullSchema,
  contactFormBasicSchema,
  newsletterSchema,
  leadMagnetSchema,
  roiCalculatorSchema,
  websiteAuditSchema,
  bookingSchema,
  // Type exports
  type ContactFormData,
  type ContactFormBasicData,
  type NewsletterFormData,
  type LeadMagnetFormData,
  type ROICalculatorFormData,
  type WebsiteAuditFormData,
  type BookingFormData,
} from '@/types/form-types';

// Legacy type aliases for backward compatibility
export type ContactFormValues = import('@/types/form-types').ContactFormData
export type NewsletterFormValues = import('@/types/form-types').NewsletterFormData
export type LeadMagnetFormValues = import('@/types/form-types').LeadMagnetFormData