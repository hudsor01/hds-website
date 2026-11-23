/**
 * Website conversion ROI calculator.
 *
 * Projects the added revenue from a RELATIVE lift in conversion rate (2%
 * with a 20% lift is 2.4%, capped at 100%). When the visitor enters what
 * they would spend, it also returns first-year ROI on that spend and the
 * payback period in months. The spend is always the visitor's own figure,
 * never an HDS price.
 *
 * Raw strings (form fields / URL params) are validated here with Zod so
 * the UI and shared links both go through the same boundary.
 */

import { z } from 'zod'

export interface RoiRawInput {
	monthlyTraffic: string
	conversionRate: string
	averageOrderValue: string
	improvementPercentage: string
	investment: string
}

export interface RoiInput {
	monthlyTraffic: number
	/** Current conversion rate in percent (2 means 2%). */
	conversionRate: number
	averageOrderValue: number
	/** Relative lift in percent (20 means the rate is multiplied by 1.2). */
	improvementPercentage: number
	/** What the visitor would spend; null when not entered. */
	investment: number | null
}

export type RoiField = keyof RoiRawInput

export type RoiParseResult =
	| { status: 'ok'; data: RoiInput }
	| { status: 'incomplete'; errors: Partial<Record<RoiField, string>> }
	| { status: 'invalid'; errors: Partial<Record<RoiField, string>> }

export interface RoiResult {
	currentConversionRate: number
	improvedConversionRate: number
	/** True when the lift would pass 100% and the rate was held at 100%. */
	improvedRateCapped: boolean
	currentMonthlyRevenue: number
	currentAnnualRevenue: number
	projectedMonthlyRevenue: number
	projectedAnnualRevenue: number
	monthlyIncrease: number
	annualIncrease: number
	/** (annualIncrease - investment) / investment x 100; null without one. */
	roiPercentage: number | null
	/** investment / monthlyIncrease; null without an investment or a gain. */
	paybackMonths: number | null
}

const MAX_CONVERSION_RATE = 100

const FIELD_SCHEMAS: Record<RoiField, z.ZodNumber> = {
	monthlyTraffic: z
		.number({ error: 'Enter visitors as a number.' })
		.positive('Enter visitors above 0.'),
	conversionRate: z
		.number({ error: 'Enter the rate as a number.' })
		.positive('Enter a rate above 0%.')
		.max(MAX_CONVERSION_RATE, 'Enter a rate of 100% or less.'),
	averageOrderValue: z
		.number({ error: 'Enter the value as a number.' })
		.positive('Enter a value above $0.'),
	improvementPercentage: z
		.number({ error: 'Enter the lift as a number.' })
		.positive('Enter a lift above 0%.'),
	investment: z
		.number({ error: 'Enter the amount as a number.' })
		.positive('Enter an amount above $0, or leave it blank.')
}

const REQUIRED_FIELDS: readonly RoiField[] = [
	'monthlyTraffic',
	'conversionRate',
	'averageOrderValue',
	'improvementPercentage'
]

function toNumber(raw: string): number {
	return Number(raw.trim())
}

/**
 * Validate raw field strings. A blank required field makes the input
 * incomplete (no results, no error). A filled field that is not a valid
 * number for its range is an error. Investment is optional.
 */
export function parseRoiInput(raw: RoiRawInput): RoiParseResult {
	const errors: Partial<Record<RoiField, string>> = {}
	const values: Partial<Record<RoiField, number>> = {}
	let missing = false

	for (const field of Object.keys(FIELD_SCHEMAS) as RoiField[]) {
		const text = raw[field].trim()
		if (text === '') {
			if (REQUIRED_FIELDS.includes(field)) {
				missing = true
			}
			continue
		}
		const parsed = FIELD_SCHEMAS[field].safeParse(toNumber(text))
		if (parsed.success) {
			values[field] = parsed.data
		} else {
			errors[field] = parsed.error.issues[0]?.message ?? 'Enter a valid number.'
		}
	}

	if (Object.keys(errors).length > 0) {
		return { status: 'invalid', errors }
	}
	if (
		missing ||
		values.monthlyTraffic === undefined ||
		values.conversionRate === undefined ||
		values.averageOrderValue === undefined ||
		values.improvementPercentage === undefined
	) {
		return { status: 'incomplete', errors }
	}
	return {
		status: 'ok',
		data: {
			monthlyTraffic: values.monthlyTraffic,
			conversionRate: values.conversionRate,
			averageOrderValue: values.averageOrderValue,
			improvementPercentage: values.improvementPercentage,
			investment: values.investment ?? null
		}
	}
}

export function calculateRoi(input: RoiInput): RoiResult {
	const {
		monthlyTraffic,
		conversionRate,
		averageOrderValue,
		improvementPercentage,
		investment
	} = input

	const liftedRate = conversionRate * (1 + improvementPercentage / 100)
	const improvedRateCapped = liftedRate > MAX_CONVERSION_RATE
	const improvedConversionRate = Math.min(liftedRate, MAX_CONVERSION_RATE)

	const currentMonthlyRevenue =
		monthlyTraffic * (conversionRate / 100) * averageOrderValue
	const projectedMonthlyRevenue =
		monthlyTraffic * (improvedConversionRate / 100) * averageOrderValue
	const monthlyIncrease = projectedMonthlyRevenue - currentMonthlyRevenue
	const annualIncrease = monthlyIncrease * 12

	const hasInvestment = investment !== null && investment > 0
	const roiPercentage = hasInvestment
		? ((annualIncrease - investment) / investment) * 100
		: null
	const paybackMonths =
		hasInvestment && monthlyIncrease > 0 ? investment / monthlyIncrease : null

	return {
		currentConversionRate: conversionRate,
		improvedConversionRate,
		improvedRateCapped,
		currentMonthlyRevenue,
		currentAnnualRevenue: currentMonthlyRevenue * 12,
		projectedMonthlyRevenue,
		projectedAnnualRevenue: projectedMonthlyRevenue * 12,
		monthlyIncrease,
		annualIncrease,
		roiPercentage,
		paybackMonths
	}
}
