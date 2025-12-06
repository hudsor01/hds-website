/**
 * Unified Validation Utilities
 * Centralized validation functions following Zod patterns
 */

import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().min(1, 'Email is required').email('Invalid email address');
export const requiredStringSchema = (fieldName: string = 'Field') =>
  z.string().min(1, `${fieldName} is required`);
export const minLengthSchema = (min: number, fieldName: string = 'Field') =>
  z.string().min(min, `${fieldName} must be at least ${min} characters`);
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number');
export const urlSchema = z.string().url('Invalid URL');

// Form validation utilities
export class FormValidator {
  static validateEmail(email: string): boolean {
    try {
      emailSchema.parse(email);
      return true;
    } catch {
      return false;
    }
  }

  static validateRequired(value: unknown, fieldName: string = 'Field'): boolean {
    try {
      requiredStringSchema(fieldName).parse(value);
      return true;
    } catch {
      return false;
    }
  }

  static validateMinLength(value: string, min: number, fieldName: string = 'Field'): boolean {
    try {
      minLengthSchema(min, fieldName).parse(value);
      return true;
    } catch {
      return false;
    }
  }

 static validateWithSchema<T>(value: T, schema: z.ZodSchema<T>): { isValid: boolean; error?: string } {
    try {
      schema.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: error.issues[0]?.message || 'Validation failed'
        };
      }
      return { isValid: false, error: 'Validation failed' };
    }
  }

  static validateForm<T extends Record<string, unknown>>(
    data: T,
    schema: z.ZodSchema<T>
  ): { isValid: boolean; errors?: Record<string, string> } {
    try {
      schema.parse(data);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach(err => {
          if (err.path.length > 0) {
            const field = err.path[0] as string;
            errors[field] = err.message;
          }
        });
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { form: 'Form validation failed' } };
    }
  }
}

// Create Zod schemas from existing validation patterns
export const createZodDto = <T extends z.ZodRawShape>(shape: T) => z.object(shape);

// Common form schemas
export const newsletterSchema = createZodDto({
  email: emailSchema,
  firstName: z.string().optional(),
  source: z.string().optional(),
});

export const contactFormSchema = createZodDto({
  firstName: requiredStringSchema('First name'),
  lastName: requiredStringSchema('Last name'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  bestTimeToContact: z.string().optional(),
 budget: z.string().optional(),
  timeline: z.string().optional(),
  message: requiredStringSchema('Message').min(10, 'Message must be at least 10 characters'),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
