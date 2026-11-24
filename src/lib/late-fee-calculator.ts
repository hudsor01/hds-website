/**
 * Invoice late fee calculator.
 *
 * Two policies:
 *  - 'flat'    : a one-time fee charged once the invoice is overdue past
 *                any grace period.
 *  - 'percent' : simple interest at a rate per period (day/week/month),
 *                prorated across the number of periods elapsed. A month
 *                counts as 30 days.
 *
 * Days are whole days (fractions are dropped). The fee is rounded to the
 * cent once, half up on the exact decimal value, and the total is the
 * amount plus that rounded fee, so the two always reconcile.
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
	/** Rounded to the cent. */
	lateFee: number
	/** amount + lateFee, in whole cents. */
	total: number
}

const PERIOD_DAYS: Record<FeePeriod, number> = {
	day: 1,
	week: 7,
	month: 30
}

/** Percent rates are used to four decimals (e.g. 1.5% -> 15000). */
const RATE_SCALE = 10_000

function toCents(dollars: number): number {
	return Math.round(dollars * 100)
}

function wholeDays(value: number | undefined): number {
	return Number.isFinite(value ?? 0) ? Math.max(0, Math.trunc(value ?? 0)) : 0
}

/**
 * Simple interest in cents, rounded half up. BigInt keeps the product
 * exact, so 549 * 1.5% * 10 / 30 = 2.745 rounds to 2.75 instead of a
 * float 2.7449999 rounding down.
 */
function percentFeeCents(
	amountCents: number,
	rate: number,
	days: number,
	periodDays: number
): number {
	const numerator =
		BigInt(amountCents) * BigInt(Math.round(rate * RATE_SCALE)) * BigInt(days)
	const denominator = BigInt(RATE_SCALE * 100 * periodDays)
	return Number((numerator * 2n + denominator) / (denominator * 2n))
}

const EMPTY: LateFeeResult = {
	effectiveDays: 0,
	periods: 0,
	lateFee: 0,
	total: 0
}

export function calculateLateFee(input: LateFeeInput): LateFeeResult {
	const amountCents = Number.isFinite(input.amount) ? toCents(input.amount) : 0
	const daysOverdue = wholeDays(input.daysOverdue)
	const grace = wholeDays(input.gracePeriodDays)

	const effectiveDays = Math.max(0, daysOverdue - grace)

	// Not overdue (or still within grace): no fee.
	if (effectiveDays <= 0 || amountCents <= 0) {
		return { ...EMPTY, total: Math.max(0, amountCents) / 100 }
	}

	if (input.mode === 'flat') {
		const flatFeeCents = Number.isFinite(input.flatFee ?? 0)
			? Math.max(0, toCents(input.flatFee ?? 0))
			: 0
		return {
			effectiveDays,
			periods: 0,
			lateFee: flatFeeCents / 100,
			total: (amountCents + flatFeeCents) / 100
		}
	}

	// percent
	const rate = Number.isFinite(input.percentRate ?? 0)
		? Math.max(0, input.percentRate ?? 0)
		: 0
	const period = input.period ?? 'month'
	const periodDays = PERIOD_DAYS[period]
	const feeCents = percentFeeCents(amountCents, rate, effectiveDays, periodDays)
	return {
		effectiveDays,
		periods: effectiveDays / periodDays,
		lateFee: feeCents / 100,
		total: (amountCents + feeCents) / 100
	}
}
