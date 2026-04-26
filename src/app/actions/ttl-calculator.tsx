'use server'

import { count, eq, isNotNull, sql } from 'drizzle-orm'
import { z } from 'zod'
import { TtlCalculatorResults } from '@/emails/ttl-calculator-results'
import { env } from '@/env'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { getResendClient } from '@/lib/resend-client'
import { ttlCalculations } from '@/lib/schemas/ttl'
import { formatCurrency } from '@/lib/utils'
import type { CalculationResults, VehicleInputs } from '@/types/ttl-types'

// Validation schemas
const vehicleInputsSchema = z.object({
	purchasePrice: z.number(),
	tradeInValue: z.number().optional(),
	vehicleWeight: z.number().optional(),
	isElectric: z.boolean().optional(),
	isNewVehicle: z.boolean().optional(),
	county: z.string(),
	loanTermMonths: z.number().optional(),
	interestRate: z.number().optional(),
	downPayment: z.number().optional(),
	paymentFrequency: z.string().optional(),
	zipCode: z.string().optional(),
	loanStartDate: z.string().optional(),
	leaseMileage: z.number().optional(),
	leaseBuyout: z.number().optional(),
	residualValue: z.number().optional(),
	moneyFactor: z.number().optional()
})

const calculationResultsSchema = z.object({
	ttlResults: z.object({
		salesTax: z.number(),
		titleFee: z.number(),
		registrationFees: z.number(),
		processingFees: z.number().optional(),
		evFee: z.number().optional(),
		emissions: z.number().optional(),
		totalTTL: z.number()
	}),
	paymentResults: z.object({
		loanAmount: z.number(),
		monthlyPayment: z.number(),
		biweeklyPayment: z.number().optional(),
		totalInterest: z.number(),
		totalFinanced: z.number()
	}),
	tcoResults: z.unknown().optional(),
	leaseComparisonResults: z.unknown().optional()
})

const saveCalculationSchema = z.object({
	inputs: vehicleInputsSchema,
	results: calculationResultsSchema,
	name: z.string().optional(),
	email: z.string().email().optional()
})

const emailResultsSchema = z.object({
	shareCode: z.string().min(6),
	email: z.string().email()
})

const shareCodeSchema = z.string().min(6).max(24)

/**
 * Generate a unique, URL-safe share code using crypto.getRandomValues for security
 */
function generateShareCode(): string {
	// Exclude ambiguous characters: 0, O, I, l, 1
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
	const randomBytes = new Uint8Array(8)
	crypto.getRandomValues(randomBytes)
	let result = ''
	for (let i = 0; i < 8; i++) {
		result += chars.charAt((randomBytes[i] ?? 0) % chars.length)
	}
	return result
}

/**
 * Save calculation to database and return share code
 */
export async function saveCalculation(
	inputs: VehicleInputs,
	results: CalculationResults,
	name?: string,
	email?: string
): Promise<{ success: boolean; shareCode?: string; error?: string }> {
	try {
		// Validate input
		const validation = saveCalculationSchema.safeParse({
			inputs,
			results,
			name,
			email
		})
		if (!validation.success) {
			logger.warn('Invalid TTL calculation data', {
				errors: validation.error.issues
			})
			return { success: false, error: 'Invalid calculation data' }
		}

		// Generate unique share code (retry if collision)
		let shareCode = generateShareCode()
		let attempts = 0
		const maxAttempts = 5

		while (attempts < maxAttempts) {
			const existing = await db
				.select({ shareCode: ttlCalculations.shareCode })
				.from(ttlCalculations)
				.where(eq(ttlCalculations.shareCode, shareCode))
				.limit(1)

			if (existing.length === 0) {
				break
			}
			shareCode = generateShareCode()
			attempts++
		}

		if (attempts >= maxAttempts) {
			logger.error('Failed to generate unique share code after max attempts')
			return {
				success: false,
				error: 'Unable to generate share link. Please try again.'
			}
		}

		// Insert into database
		await db.insert(ttlCalculations).values({
			shareCode,
			inputs: inputs as unknown,
			results: results as unknown,
			name:
				name || `${formatCurrency(inputs.purchasePrice)} - ${inputs.county}`,
			email: email ?? null,
			county: inputs.county,
			purchasePrice: Math.round(inputs.purchasePrice)
		})

		// If email provided, send results
		if (email) {
			await emailResults(shareCode, email).catch(err => {
				logger.error('Failed to send TTL results email', { error: err })
			})
		}

		logger.info('TTL calculation saved', { shareCode, county: inputs.county })
		return { success: true, shareCode }
	} catch (error) {
		logger.error('Error saving TTL calculation', error)
		return { success: false, error: 'An unexpected error occurred' }
	}
}

/**
 * Load calculation by share code
 */
export async function loadCalculation(shareCode: string): Promise<{
	success: boolean
	data?: { inputs: VehicleInputs; results: CalculationResults; name?: string }
	error?: string
}> {
	try {
		const parsedShareCode = shareCodeSchema.safeParse(shareCode)
		if (!parsedShareCode.success) {
			return { success: false, error: 'Invalid share code' }
		}

		// Fetch calculation
		const rows = await db
			.select({
				inputs: ttlCalculations.inputs,
				results: ttlCalculations.results,
				name: ttlCalculations.name,
				viewCount: ttlCalculations.viewCount
			})
			.from(ttlCalculations)
			.where(eq(ttlCalculations.shareCode, parsedShareCode.data))
			.limit(1)

		const data = rows[0]
		if (!data) {
			logger.warn('TTL calculation not found', { shareCode })
			return { success: false, error: 'Calculation not found or has expired' }
		}

		// Validate deserialized JSONB data
		const parsedInputs = vehicleInputsSchema.safeParse(data.inputs)
		if (!parsedInputs.success) {
			logger.error('Invalid inputs shape in stored TTL calculation', {
				shareCode,
				errors: parsedInputs.error.issues
			})
			return { success: false, error: 'Stored calculation data is invalid' }
		}

		const parsedResults = calculationResultsSchema.safeParse(data.results)
		if (!parsedResults.success) {
			logger.error('Invalid results shape in stored TTL calculation', {
				shareCode,
				errors: parsedResults.error.issues
			})
			return { success: false, error: 'Stored calculation data is invalid' }
		}

		// Increment view count (fire-and-forget)
		void db
			.update(ttlCalculations)
			.set({
				viewCount: sql`${ttlCalculations.viewCount} + 1`,
				lastViewedAt: new Date()
			})
			.where(eq(ttlCalculations.shareCode, shareCode))
			.then(() => {
				/* fire and forget */
			})
			.catch((err: Error) =>
				logger.error('Failed to update view count', { error: err })
			)

		return {
			success: true,
			data: {
				inputs: parsedInputs.data as VehicleInputs,
				results: parsedResults.data as CalculationResults,
				name: data.name || undefined
			}
		}
	} catch (error) {
		logger.error('Error loading TTL calculation', error)
		return { success: false, error: 'An unexpected error occurred' }
	}
}

/**
 * Email calculation results to user
 */
export async function emailResults(
	shareCode: string,
	email: string
): Promise<{ success: boolean; error?: string }> {
	try {
		// Validate input
		const validation = emailResultsSchema.safeParse({ shareCode, email })
		if (!validation.success) {
			return { success: false, error: 'Invalid email or share code' }
		}

		// Fetch calculation
		const rows = await db
			.select({
				inputs: ttlCalculations.inputs,
				results: ttlCalculations.results,
				name: ttlCalculations.name
			})
			.from(ttlCalculations)
			.where(eq(ttlCalculations.shareCode, validation.data.shareCode))
			.limit(1)

		const data = rows[0]
		if (!data) {
			return { success: false, error: 'Calculation not found' }
		}

		const parsedEmailInputs = vehicleInputsSchema.safeParse(data.inputs)
		const parsedEmailResults = calculationResultsSchema.safeParse(data.results)

		if (!parsedEmailInputs.success || !parsedEmailResults.success) {
			logger.error('Invalid stored calculation data for email', { shareCode })
			return { success: false, error: 'Calculation data is invalid' }
		}

		const inputs = parsedEmailInputs.data as VehicleInputs
		const results = parsedEmailResults.data as CalculationResults
		const shareUrl = `${env.NEXT_PUBLIC_SITE_URL || 'https://hudsondigitalsolutions.com'}/texas-ttl-calculator?c=${shareCode}`

		// Ensure results have required properties
		const ttl = results.ttlResults || {
			salesTax: 0,
			titleFee: 0,
			registrationFees: 0,
			totalTTL: 0
		}
		const payment = results.paymentResults || { monthlyPayment: 0 }

		// Send React Email
		const { error: emailError } = await getResendClient().emails.send({
			from: `${BUSINESS_INFO.name} <${BUSINESS_INFO.email}>`,
			to: email,
			subject: `Your Texas TTL Calculator Results - ${formatCurrency(inputs.purchasePrice)}`,
			react: (
				<TtlCalculatorResults
					purchasePrice={formatCurrency(inputs.purchasePrice)}
					county={inputs.county}
					downPayment={formatCurrency(inputs.downPayment || 0)}
					tradeInValue={
						inputs.tradeInValue
							? formatCurrency(inputs.tradeInValue)
							: undefined
					}
					salesTax={formatCurrency(ttl.salesTax)}
					titleFee={formatCurrency(ttl.titleFee)}
					registrationFees={formatCurrency(ttl.registrationFees)}
					totalTTL={formatCurrency(ttl.totalTTL)}
					monthlyPayment={formatCurrency(payment.monthlyPayment)}
					loanTermMonths={inputs.loanTermMonths || 60}
					interestRate={inputs.interestRate || 6.5}
					shareUrl={shareUrl}
				/>
			)
		})

		if (emailError) {
			logger.error('Failed to send TTL results email', emailError)
			return { success: false, error: 'Failed to send email' }
		}

		logger.info('TTL results email sent', { shareCode, email })
		return { success: true }
	} catch (error) {
		logger.error('Error emailing TTL results', error)
		return { success: false, error: 'An unexpected error occurred' }
	}
}

/**
 * Get calculator usage analytics (for admin dashboard)
 */
export async function getCalculatorAnalytics(): Promise<{
	totalCalculations: number
	topCounties: Array<{ county: string; count: number }>
	avgPurchasePrice: number
	recentCalculations: number
}> {
	try {
		// Total calculations
		const totalResult = await db
			.select({ count: count() })
			.from(ttlCalculations)
		const totalCalculations = totalResult[0]?.count ?? 0

		// Top counties
		const countyData = await db
			.select({ county: ttlCalculations.county })
			.from(ttlCalculations)
			.where(isNotNull(ttlCalculations.county))

		const countyCounts = countyData.reduce<Record<string, number>>(
			(acc: Record<string, number>, row: { county: string | null }) => {
				if (row.county) {
					acc[row.county] = (acc[row.county] || 0) + 1
				}
				return acc
			},
			{}
		)

		const topCounties = Object.entries(countyCounts)
			.sort(([, a], [, b]) => Number(b) - Number(a))
			.slice(0, 5)
			.map(([county, countVal]) => ({ county, count: countVal }))

		// Average purchase price
		const priceData = await db
			.select({ purchasePrice: ttlCalculations.purchasePrice })
			.from(ttlCalculations)
			.where(isNotNull(ttlCalculations.purchasePrice))

		const avgPurchasePrice =
			priceData.length > 0
				? priceData.reduce(
						(sum: number, row: { purchasePrice: number | null }) =>
							sum + (row.purchasePrice || 0),
						0
					) / priceData.length
				: 0

		// Recent calculations (last 7 days)
		const sevenDaysAgo = new Date()
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

		const recentResult = await db
			.select({ count: count() })
			.from(ttlCalculations)
			.where(sql`${ttlCalculations.createdAt} >= ${sevenDaysAgo.toISOString()}`)
		const recentCalculations = recentResult[0]?.count ?? 0

		return {
			totalCalculations,
			topCounties,
			avgPurchasePrice: Math.round(avgPurchasePrice),
			recentCalculations
		}
	} catch (error) {
		logger.error('Error fetching calculator analytics', error)
		return {
			totalCalculations: 0,
			topCounties: [],
			avgPurchasePrice: 0,
			recentCalculations: 0
		}
	}
}
