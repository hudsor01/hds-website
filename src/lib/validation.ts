// Form validation utilities
import { z } from 'zod'
import type { ValidationResult, FormErrors } from '@/types/paystub'

// Validate employee name
export const validateEmployeeName = (value: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, message: 'Employee name is required' }
  }
  if (value.trim().length < 2) {
    return { isValid: false, message: 'Employee name must be at least 2 characters' }
  }
  return { isValid: true }
}

// Validate hourly rate
export const validateHourlyRate = (value: number): ValidationResult => {
  if (!value || value <= 0) {
    return { isValid: false, message: 'Hourly rate is required and must be greater than $0' }
  }
  if (value > 1000) {
    return { isValid: false, message: 'Hourly rate seems unusually high (over $1,000)' }
  }
  return { isValid: true }
}

// Validate hours per period
export const validateHoursPerPeriod = (value: number): ValidationResult => {
  if (!value || value <= 0) {
    return { isValid: false, message: 'Hours per pay period is required and must be greater than 0' }
  }
  if (value > 200) {
    return { isValid: false, message: 'Hours per period seems unusually high (over 200)' }
  }
  return { isValid: true }
}

// Validate entire form
export const validateForm = (data: {
  employeeName: string
  hourlyRate: number
  hoursPerPeriod: number
}): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {}
  let isValid = true

  const nameResult = validateEmployeeName(data.employeeName)
  if (!nameResult.isValid) {
    errors.employeeName = nameResult.message
    isValid = false
  }

  const rateResult = validateHourlyRate(data.hourlyRate)
  if (!rateResult.isValid) {
    errors.hourlyRate = rateResult.message
    isValid = false
  }

  const hoursResult = validateHoursPerPeriod(data.hoursPerPeriod)
  if (!hoursResult.isValid) {
    errors.hoursPerPeriod = hoursResult.message
    isValid = false
  }

  return { isValid, errors }
}

// Contact Form Validation Schema
export const ContactFormSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),

  lastName: z.string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),

  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),

  phone: z.string()
    .optional()
    .refine(
      (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-\(\)]/g, '')),
      'Please enter a valid phone number'
    ),

  company: z.string()
    .optional()
    .refine(
      (val) => !val || val.length <= 100,
      'Company name must be less than 100 characters'
    ),

  service: z.string()
    .min(1, 'Please select a service')
    .refine(
      (val) => ['Custom Development', 'Revenue Operations', 'Partnership Management', 'Other'].includes(val),
      'Please select a valid service option'
    ),

  bestTimeToContact: z.string()
    .min(1, 'Please select your preferred contact time')
    .refine(
      (val) => ['Morning (9 AM - 12 PM)', 'Afternoon (12 PM - 5 PM)', 'Evening (5 PM - 8 PM)', 'Anytime'].includes(val),
      'Please select a valid contact time'
    ),

  message: z.string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
})

// Newsletter signup validation
export const NewsletterSignupSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
})

// Export types derived from Zod schemas
export type ContactFormData = z.infer<typeof ContactFormSchema>;
export type NewsletterSignupData = z.infer<typeof NewsletterSignupSchema>;