/**
 * Form Types
 * 
 * Comprehensive type definitions for all form-related functionality including
 * validation, submission, and form state management.
 */

import { z } from 'zod'
import { ServiceType, BudgetRange, FormStatus } from './enum-types'
import type { ApiResponse } from './api-types'

// ============= Form Validation Schemas =============

/**
 * Basic field validation schemas
 */
export const nameSchema = z
  .string()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(100, { message: 'Name cannot exceed 100 characters' })
  .refine(value => /^[a-zA-Z\s\-'\.]+$/.test(value), {
    message: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
  })

export const emailSchema = z
  .string()
  .email({ message: 'Please enter a valid email address' })
  .max(255, { message: 'Email cannot exceed 255 characters' })

export const phoneSchema = z
  .string()
  .min(7, { message: 'Phone number must be at least 7 characters' })
  .max(20, { message: 'Phone number cannot exceed 20 characters' })
  .refine(value => /^[\d\+\-\(\)\s\.]+$/.test(value), {
    message: 'Phone number can only contain digits, spaces, and the characters: + - ( )',
  })
  .optional()

export const companySchema = z
  .string()
  .min(2, { message: 'Company name must be at least 2 characters' })
  .max(100, { message: 'Company name cannot exceed 100 characters' })
  .optional()

export const messageSchema = z
  .string()
  .min(10, { message: 'Message must be at least 10 characters' })
  .max(2000, { message: 'Message cannot exceed 2000 characters' })

export const subjectSchema = z
  .string()
  .min(3, { message: 'Subject must be at least 3 characters' })
  .max(100, { message: 'Subject cannot exceed 100 characters' })

export const captchaTokenSchema = z
  .string()
  .min(1, { message: 'Verification token is required' })

export const urlSchema = z
  .string()
  .url({ message: 'Please enter a valid URL' })
  .max(2048, { message: 'URL cannot exceed 2048 characters' })

// ============= Form Data Schemas =============

/**
 * Contact form schema with all possible fields
 */
export const contactFormFullSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: companySchema,
  message: messageSchema,
  service: z.nativeEnum(ServiceType).optional(),
  budget: z.nativeEnum(BudgetRange).optional(),
  subject: subjectSchema.optional(),
  source: z.string().optional(),
  // Spam protection fields
  honeypot: z.string().optional(), // Anti-spam field
  website: z.string().optional(), // Additional honeypot field
  formStartTime: z.number().optional(), // Timing protection
  formSubmissionTime: z.number().optional(), // Timing protection
})

/**
 * Simple contact form schema (basic fields only)
 */
export const contactFormBasicSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: messageSchema,
  // Spam protection fields
  honeypot: z.string().optional(),
  website: z.string().optional(),
  formStartTime: z.number().optional(),
  formSubmissionTime: z.number().optional(),
})

/**
 * Newsletter subscription schema
 */
export const newsletterSchema = z.object({
  email: emailSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  source: z.string().optional(),
  interests: z.array(z.string()).optional(),
  frequency: z.enum(['weekly', 'monthly']).default('weekly'),
})

/**
 * Lead magnet form schema
 */
export const leadMagnetSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  company: companySchema,
  resourceId: z.string().min(1, 'Resource ID is required'),
  source: z.string().optional(),
})

/**
 * ROI calculator form schema
 */
export const roiCalculatorSchema = z.object({
  currentRevenue: z.number().min(0, 'Revenue must be positive'),
  monthlyLeads: z.number().min(0, 'Leads must be positive'),
  conversionRate: z.number().min(0).max(100, 'Conversion rate must be 0-100%'),
  averageProjectValue: z.number().min(0, 'Project value must be positive'),
  customerLifetimeValue: z.number().min(0).optional(),
  marketingSpend: z.number().min(0).optional(),
  industry: z.string().optional(),
  companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
})

/**
 * Website audit form schema
 */
export const websiteAuditSchema = z.object({
  websiteUrl: urlSchema,
  email: emailSchema,
  name: nameSchema,
  company: companySchema,
  goals: z.array(z.string()).min(1, 'Please select at least one goal'),
  currentChallenges: z.string().max(500).optional(),
  budget: z.nativeEnum(BudgetRange).optional(),
  timeline: z.enum(['asap', '1-month', '3-months', '6-months', 'flexible']).optional(),
})

/**
 * Booking form schema
 */
export const bookingSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: companySchema,
  service: z.nativeEnum(ServiceType),
  message: messageSchema,
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  timezone: z.string().optional(),
  budget: z.nativeEnum(BudgetRange).optional(),
})

// ============= Form Data Types =============

export type ContactFormData = z.infer<typeof contactFormFullSchema>
export type ContactFormBasicData = z.infer<typeof contactFormBasicSchema>
export type NewsletterFormData = z.infer<typeof newsletterSchema>
export type LeadMagnetFormData = z.infer<typeof leadMagnetSchema>
export type ROICalculatorFormData = z.infer<typeof roiCalculatorSchema>
export type WebsiteAuditFormData = z.infer<typeof websiteAuditSchema>
export type BookingFormData = z.infer<typeof bookingSchema>

// ============= Form State Management =============

/**
 * Generic form state
 */
export interface FormState<T = any> {
  data: T
  errors: FormErrors<T>
  touched: FormTouched<T>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
  status: FormStatus
  message?: string
  submitCount: number
  isInitialized: boolean
}

/**
 * Form errors object
 */
export type FormErrors<T> = {
  [K in keyof T]?: string | string[]
}

/**
 * Form touched fields
 */
export type FormTouched<T> = {
  [K in keyof T]?: boolean
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  name: string
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio'
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  hidden?: boolean
  validation?: z.ZodSchema
  options?: FormSelectOption[]
  min?: number
  max?: number
  step?: number
  rows?: number
  autoComplete?: string
  className?: string
  help?: string
  defaultValue?: Record<string, unknown>
}

/**
 * Select option for form fields
 */
export interface FormSelectOption {
  value: string | number
  label: string
  disabled?: boolean
  group?: string
}

/**
 * Form submission result
 */
export interface FormSubmissionResult<T = any> extends ApiResponse<T> {
  validationErrors?: FormErrors<any>
  fieldErrors?: Record<string, string[]>
  redirect?: string
  showSuccess?: boolean
  downloadUrl?: string
}

/**
 * Form submission options
 */
export interface FormSubmissionOptions {
  skipValidation?: boolean
  showSuccessMessage?: boolean
  redirectOnSuccess?: string
  resetOnSuccess?: boolean
  scrollToError?: boolean
  validateBeforeSubmit?: boolean
}

// ============= Form Hooks & Utilities =============

/**
 * Form hook return type
 */
export interface UseFormReturn<T> {
  state: FormState<T>
  formProps: {
    onSubmit: (e: React.FormEvent) => void
    noValidate: boolean
  }
  fieldProps: (name: keyof T) => FormFieldProps
  handleChange: (name: keyof T, value: Record<string, unknown>) => void
  handleBlur: (name: keyof T) => void
  handleSubmit: (data: T) => Promise<void>
  setFieldValue: (name: keyof T, value: Record<string, unknown>) => void
  setFieldError: (name: keyof T, error: string) => void
  setFieldTouched: (name: keyof T, touched?: boolean) => void
  validateField: (name: keyof T) => Promise<boolean>
  validateForm: () => Promise<boolean>
  reset: (data?: Partial<T>) => void
  setData: (data: Partial<T>) => void
  getFieldValue: (name: keyof T) => any
  getFieldError: (name: keyof T) => string | undefined
  isFieldTouched: (name: keyof T) => boolean
  isFieldValid: (name: keyof T) => boolean
}

/**
 * Form field props
 */
export interface FormFieldProps {
  name: string
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
  onBlur: () => void
  error?: string
  touched?: boolean
  required?: boolean
  disabled?: boolean
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

/**
 * Form context type
 */
export interface FormContextType<T = any> {
  formId: string
  state: FormState<T>
  config: FormConfig<T>
  actions: FormActions<T>
}

/**
 * Form configuration
 */
export interface FormConfig<T = any> {
  schema: z.ZodSchema<T>
  onSubmit: (data: T) => Promise<FormSubmissionResult>
  initialData?: Partial<T>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  revalidateOnSubmit?: boolean
  resetOnSubmit?: boolean
  submitOnEnter?: boolean
  preserveOnUnmount?: boolean
  options?: FormSubmissionOptions
}

/**
 * Form actions
 */
export interface FormActions<T = any> {
  setData: (data: Partial<T>) => void
  setErrors: (errors: FormErrors<T>) => void
  setTouched: (touched: FormTouched<T>) => void
  setStatus: (status: FormStatus) => void
  setMessage: (message: string) => void
  setSubmitting: (submitting: boolean) => void
  reset: (data?: Partial<T>) => void
  validate: () => Promise<boolean>
  submit: () => Promise<void>
}

// ============= Form Components =============

/**
 * Contact form component props
 */
export interface ContactFormProps {
  className?: string
  onSuccess?: () => void
  onError?: (errorToReport: Error) => void
  includeFields?: Array<'phone' | 'company' | 'subject' | 'service' | 'budget'>
  variant?: 'simple' | 'detailed'
}

/**
 * Base form component props
 */
export interface BaseFormProps<T = any> {
  config: FormConfig<T>
  children: React.ReactNode
  className?: string
  autoComplete?: 'on' | 'off'
  noValidate?: boolean
  onFormChange?: (state: FormState<T>) => void
}

/**
 * Form provider props
 */
export interface FormProviderProps<T = any> extends BaseFormProps<T> {
  formId?: string
}

/**
 * Form field wrapper props
 */
export interface FormFieldWrapperProps {
  name: string
  label?: string
  help?: string
  required?: boolean
  error?: string
  touched?: boolean
  children: React.ReactNode
  className?: string
  labelClassName?: string
  errorClassName?: string
  helpClassName?: string
}

// ============= Specialized Form Types =============

/**
 * Multi-step form configuration
 */
export interface MultiStepFormConfig<T = any> {
  steps: FormStep<T>[]
  onStepChange?: (step: number, data: Partial<T>) => void
  onComplete: (data: T) => Promise<FormSubmissionResult>
  allowStepSkipping?: boolean
  validateOnStepChange?: boolean
  preserveStepData?: boolean
}

/**
 * Form step definition
 */
export interface FormStep<T = any> {
  id: string
  title: string
  description?: string
  fields: (keyof T)[]
  validation?: z.ZodSchema
  component?: React.ComponentType<any>
  isOptional?: boolean
  canSkip?: boolean
}

/**
 * Multi-step form state
 */
export interface MultiStepFormState<T = any> extends FormState<T> {
  currentStep: number
  totalSteps: number
  completedSteps: number[]
  stepErrors: Record<number, FormErrors<T>>
  canGoNext: boolean
  canGoPrev: boolean
  isFirstStep: boolean
  isLastStep: boolean
}

/**
 * Dynamic form field configuration
 */
export interface DynamicFormField extends FormFieldConfig {
  id: string
  order: number
  section?: string
  dependencies?: FormFieldDependency[]
  conditionalDisplay?: FormFieldCondition
  validationRules?: FormValidationRule[]
}

/**
 * Form field dependency
 */
export interface FormFieldDependency {
  field: string
  value: Record<string, unknown>
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
}

/**
 * Form field condition
 */
export interface FormFieldCondition {
  field: string
  operator: 'show_if' | 'hide_if' | 'require_if' | 'disable_if'
  value: Record<string, unknown>
}

/**
 * Form validation rule
 */
export interface FormValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: Record<string, unknown>
  message: string
  validator?: (value: Record<string, unknown>, data: Record<string, unknown>) => boolean
}

// ============= Resource Definitions =============

/**
 * Available lead magnet resources
 */
export const LEAD_MAGNET_RESOURCES = {
  'website-checklist': {
    id: 'website-checklist',
    title: '10-Point Website Checklist',
    description: 'Essential checklist to ensure your website has everything it needs for success',
    type: 'checklist' as const,
    filePath: '/resources/website-checklist.pdf',
    thumbnailPath: '/images/resources/website-checklist-thumb.jpg',
    downloadCount: 0,
    tags: ['website', 'checklist', 'optimization'],
  },
  'contact-form-templates': {
    id: 'contact-form-templates',
    title: '5 High-Converting Contact Form Templates',
    description: 'Copy-paste templates for different types of contact forms that convert',
    type: 'template' as const,
    filePath: '/resources/contact-form-templates.pdf',
    thumbnailPath: '/images/resources/contact-forms-thumb.jpg',
    downloadCount: 0,
    tags: ['forms', 'templates', 'conversion'],
  },
  'seo-basics-cheatsheet': {
    id: 'seo-basics-cheatsheet',
    title: 'SEO Basics Cheat Sheet',
    description: 'One-page guide to getting found on Google and improving search rankings',
    type: 'guide' as const,
    filePath: '/resources/seo-basics-cheatsheet.pdf',
    thumbnailPath: '/images/resources/seo-cheatsheet-thumb.jpg',
    downloadCount: 0,
    tags: ['seo', 'guide', 'google'],
  },
  'roi-calculator-template': {
    id: 'roi-calculator-template',
    title: 'Digital Marketing ROI Calculator',
    description: 'Excel template to calculate the return on investment for your digital marketing',
    type: 'template' as const,
    filePath: '/resources/roi-calculator-template.xlsx',
    thumbnailPath: '/images/resources/roi-calculator-thumb.jpg',
    downloadCount: 0,
    tags: ['roi', 'calculator', 'marketing'],
  },
  'digital-strategy-guide': {
    id: 'digital-strategy-guide',
    title: 'Complete Digital Strategy Guide',
    description: 'Comprehensive guide to creating a winning digital strategy for your business',
    type: 'guide' as const,
    filePath: '/resources/digital-strategy-guide.pdf',
    thumbnailPath: '/images/resources/digital-strategy-thumb.jpg',
    downloadCount: 0,
    tags: ['strategy', 'digital', 'business'],
  },
  'case-study-crm-optimization': {
    id: 'case-study-crm-optimization',
    title: 'CRM Optimization Case Study',
    description: 'How we helped a client increase sales efficiency by 40% with CRM optimization',
    type: 'case-study' as const,
    filePath: '/resources/case-study-crm-optimization.pdf',
    thumbnailPath: '/images/resources/crm-case-study-thumb.jpg',
    downloadCount: 0,
    tags: ['crm', 'case-study', 'optimization'],
  },
} as const

export type LeadMagnetResourceId = keyof typeof LEAD_MAGNET_RESOURCES
export type LeadMagnetResource = typeof LEAD_MAGNET_RESOURCES[LeadMagnetResourceId]