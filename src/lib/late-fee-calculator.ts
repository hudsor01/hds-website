/**
 * Invoice late fee calculator.
 *
 * Two policies:
 *  - 'flat'    : a one-time fee charged once the invoice is overdue past
 *                any grace period.
 *  - 'percent' : simple interest at a rate per period (day/week/month),
 *                prorated across the number of periods elapsed.
 */

export type LateFeeMode = 'flat' | 'percent'
export type FeePeriod = 'day' | 'week' | 'month'

export interface LateFeeInput {
	amount: number
	mode: LateFeeMode
	/** Used when mode === 'flat'. */
	flatFee?: number
	/** Percentage per period, used when mode === 'percent'. */
	percentRate?: number
	/** Period the percent rate applies to. Default 'month'. */
	period?: FeePeriod
	daysOverdue: number
	/** Days before any fee applies. Default 0. */
	gracePeriodDays?: number
}

export interface LateFeeResult {
	/** Days overdue after subtracting the grace period (never negative). */
	effectiveDays: number
	/** Periods elapsed (fractional) for percent mode; 0 for flat. */
	periods: number
	lateFee: number
	total: number
}

const PERIOD_DAYS: Record<FeePeriod, number> = {
	day: 1,
	week: 7,
	month: 30
}

const EMPTY: LateFeeResult = {
	effectiveDays: 0,
	periods: 0,
	lateFee: 0,
	total: 0
}

export function calculateLateFee(input: LateFeeInput): LateFeeResult {
	const amount = Number.isFinite(input.amount) ? input.amount : 0
	const daysOverdue = Number.isFinite(input.daysOverdue) ? input.daysOverdue : 0
	const grace = Number.isFinite(input.gracePeriodDays ?? 0)
		? (input.gracePeriodDays ?? 0)
		: 0

	const effectiveDays = Math.max(0, daysOverdue - Math.max(0, grace))

	// Not overdue (or still within grace): no fee.
	if (effectiveDays <= 0 || amount <= 0) {
		return { ...EMPTY, total: Math.max(0, amount) }
	}

	if (input.mode === 'flat') {
		const flatFee = Number.isFinite(input.flatFee ?? 0)
			? Math.max(0, input.flatFee ?? 0)
			: 0
		return {
			effectiveDays,
			periods: 0,
			lateFee: flatFee,
			total: amount + flatFee
		}
	}

	// percent
	const rate = Number.isFinite(input.percentRate ?? 0)
		? Math.max(0, input.percentRate ?? 0)
		: 0
	const period = input.period ?? 'month'
	const periods = effectiveDays / PERIOD_DAYS[period]
	const lateFee = amount * (rate / 100) * periods
	return {
		effectiveDays,
		periods,
		lateFee,
		total: amount + lateFee
	}
}
