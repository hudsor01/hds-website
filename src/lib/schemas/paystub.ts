/**
 * Paystub Generator Validation Schemas
 *
 * Zod schemas for validating paystub generator inputs and calculations
 */

import { z } from 'zod';

// ============================================================================
// Core Paystub Schemas
// ============================================================================

export const employeeNameSchema = z
  .string()
  .min(2, 'Employee name must be at least 2 characters')
  .max(100, 'Employee name must be less than 100 characters')
  .trim();

export const hourlyRateSchema = z
  .number()
  .positive('Hourly rate must be greater than $0')
  .max(1000, 'Hourly rate seems unusually high (over $1,000)');

export const hoursPerPeriodSchema = z
  .number()
  .positive('Hours per pay period must be greater than 0')
  .max(200, 'Hours per period seems unusually high (over 200)');

export const taxRateSchema = z
  .number()
  .min(0, 'Tax rate cannot be negative')
  .max(100, 'Tax rate cannot exceed 100%');

export const deductionAmountSchema = z
  .number()
  .nonnegative('Deduction amount cannot be negative');

// ============================================================================
// Paystub Form Data Schema
// ============================================================================

export const paystubFormSchema = z.object({
  employeeName: employeeNameSchema,
  employeeId: z.string().optional(),
  hourlyRate: hourlyRateSchema,
  hoursPerPeriod: hoursPerPeriodSchema,
  overtimeHours: z.number().nonnegative().max(100).optional(),
  overtimeRate: z.number().positive().optional(),
  federalTaxRate: taxRateSchema.optional(),
  stateTaxRate: taxRateSchema.optional(),
  socialSecurityRate: taxRateSchema.optional(),
  medicareRate: taxRateSchema.optional(),
  additionalDeductions: z.array(z.object({
    name: z.string().min(1).max(100),
    amount: deductionAmountSchema,
  })).optional(),
  payPeriodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  payPeriodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
});

export type PaystubFormData = z.infer<typeof paystubFormSchema>;

// ============================================================================
// Paystub Calculation Result Schema
// ============================================================================

export const paystubCalculationSchema = z.object({
  grossPay: z.number().nonnegative(),
  regularPay: z.number().nonnegative(),
  overtimePay: z.number().nonnegative().optional(),
  totalTaxes: z.number().nonnegative(),
  federalTax: z.number().nonnegative().optional(),
  stateTax: z.number().nonnegative().optional(),
  socialSecurity: z.number().nonnegative().optional(),
  medicare: z.number().nonnegative().optional(),
  totalDeductions: z.number().nonnegative(),
  netPay: z.number().nonnegative(),
  ytdGross: z.number().nonnegative().optional(),
  ytdTaxes: z.number().nonnegative().optional(),
  ytdNet: z.number().nonnegative().optional(),
});

export type PaystubCalculation = z.infer<typeof paystubCalculationSchema>;

// ============================================================================
// Complete Paystub Data Schema (for PDF generation)
// ============================================================================

export const completePaystubSchema = z.object({
  employee: z.object({
    name: employeeNameSchema,
    id: z.string().optional(),
    address: z.string().optional(),
    ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$|^\*\*\*-\*\*-\d{4}$/).optional(), // Full or masked SSN
  }),
  employer: z.object({
    name: z.string().min(1).max(200),
    address: z.string().optional(),
    ein: z.string().regex(/^\d{2}-\d{7}$/).optional(), // Employer Identification Number
  }).optional(),
  payPeriod: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    payDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
  earnings: z.object({
    regular: z.object({
      hours: hoursPerPeriodSchema,
      rate: hourlyRateSchema,
      amount: z.number().nonnegative(),
    }),
    overtime: z.object({
      hours: z.number().nonnegative().max(100),
      rate: z.number().positive(),
      amount: z.number().nonnegative(),
    }).optional(),
    total: z.number().nonnegative(),
  }),
  taxes: z.object({
    federal: z.object({
      rate: taxRateSchema,
      amount: z.number().nonnegative(),
    }).optional(),
    state: z.object({
      rate: taxRateSchema,
      amount: z.number().nonnegative(),
    }).optional(),
    socialSecurity: z.object({
      rate: taxRateSchema,
      amount: z.number().nonnegative(),
    }).optional(),
    medicare: z.object({
      rate: taxRateSchema,
      amount: z.number().nonnegative(),
    }).optional(),
    total: z.number().nonnegative(),
  }),
  deductions: z.object({
    items: z.array(z.object({
      name: z.string().min(1).max(100),
      amount: deductionAmountSchema,
    })),
    total: z.number().nonnegative(),
  }).optional(),
  netPay: z.number().nonnegative(),
  ytd: z.object({
    gross: z.number().nonnegative(),
    taxes: z.number().nonnegative(),
    deductions: z.number().nonnegative(),
    net: z.number().nonnegative(),
  }).optional(),
});

export type CompletePaystub = z.infer<typeof completePaystubSchema>;

// ============================================================================
// Paystub Generation Request Schema
// ============================================================================

export const paystubGenerationRequestSchema = z.object({
  formData: paystubFormSchema,
  format: z.enum(['pdf', 'json']).default('pdf'),
  includeWatermark: z.boolean().default(false),
  watermarkText: z.string().max(100).optional(),
});

export type PaystubGenerationRequest = z.infer<typeof paystubGenerationRequestSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate paystub form data and return typed errors
 */
export function validatePaystubForm(data: unknown) {
  return paystubFormSchema.safeParse(data);
}

/**
 * Validate paystub calculation results
 */
export function validatePaystubCalculation(data: unknown) {
  return paystubCalculationSchema.safeParse(data);
}

/**
 * Validate complete paystub data before PDF generation
 */
export function validateCompletePaystub(data: unknown) {
  return completePaystubSchema.safeParse(data);
}
