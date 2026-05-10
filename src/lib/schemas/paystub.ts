/**
 * Paystub Generator Validation Schemas
 *
 * Zod schemas for validating paystub generator inputs.
 */

import { z } from 'zod'

const employeeNameSchema = z
	.string()
	.min(2, 'Employee name must be at least 2 characters')
	.max(100, 'Employee name must be less than 100 characters')
	.trim()

const hourlyRateSchema = z
	.number()
	.positive('Hourly rate must be greater than $0')
	.max(1000, 'Hourly rate seems unusually high (over $1,000)')

const hoursPerPeriodSchema = z
	.number()
	.positive('Hours per pay period must be greater than 0')
	.max(200, 'Hours per period seems unusually high (over 200)')

const taxRateSchema = z
	.number()
	.min(0, 'Tax rate cannot be negative')
	.max(100, 'Tax rate cannot exceed 100%')

const deductionAmountSchema = z
	.number()
	.nonnegative('Deduction amount cannot be negative')

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
	additionalDeductions: z
		.array(
			z.object({
				name: z.string().min(1).max(100),
				amount: deductionAmountSchema
			})
		)
		.optional(),
	payPeriodStart: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
		.optional(),
	payPeriodEnd: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
		.optional()
})
