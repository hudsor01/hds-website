import { z } from 'zod';

// Common validation patterns
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

export const phoneSchema = z
  .string()
  .regex(
    /^[\d\s\-\+\(\)]+$/,
    'Please enter a valid phone number'
  )
  .min(10, 'Phone number must be at least 10 characters')
  .max(20, 'Phone number must be less than 20 characters')
  .optional()
  .or(z.literal(''));

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .startsWith('https://', 'URL must use HTTPS');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

export const companySchema = z
  .string()
  .max(100, 'Company name must be less than 100 characters')
  .optional()
  .or(z.literal(''));

export const messageSchema = z
  .string()
  .min(10, 'Message must be at least 10 characters')
  .max(5000, 'Message must be less than 5000 characters')
  .trim();

// Common response schemas
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string().optional(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    errors: z.record(z.string(), z.array(z.string())).optional(),
  });

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  total: z.number().int().nonnegative().optional(),
  totalPages: z.number().int().nonnegative().optional(),
});

export const timestampSchema = z.object({
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
});

// Service options for contact forms
export const serviceOptionsSchema = z.enum([
  'website',
  'webapp',
  'ecommerce',
  'optimization',
  'consultation',
  'other',
]);

export const budgetOptionsSchema = z.enum([
  '5-10K',
  '10-25K',
  '25-50K',
  '50K+',
  'tbd',
]);

export const timelineOptionsSchema = z.enum([
  'ASAP',
  '1 month',
  '1-3 months',
  '3-6 months',
  '6+ months',
]);