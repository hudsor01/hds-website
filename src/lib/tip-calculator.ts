/**
 * Tip calculator math.
 *
 * Everything works in integer cents so the tip, the total and each
 * person's share always reconcile to the cent. Floats are converted to
 * cents once at the boundary (`toCents`) and never rounded separately.
 */

const MIN_TIP_PERCENT = 0
const MAX_TIP_PERCENT = 100
export const MIN_SPLIT = 1
export const MAX_SPLIT = 20

export interface TipInput {
	/** Bill before tax and tip, in dollars. */
	billAmount: number
	/** Tip percentage, 0 to 100. Decimals allowed (hundredths of a percent). */
	tipPercent: number
	/** Number of people splitting, 1 to 20. */
	splitCount: number
}

export interface TipResult {
	billCents: number
	tipCents: number
	totalCents: number
	splitCount: number
	/** Each person's share of the total, rounded down to the cent. */
	perPersonTotalCents: number
	/** Each person's share of the tip, rounded down to the cent. */
	perPersonTipCents: number
	/** perPersonTotalCents - perPersonTipCents. */
	perPersonBillCents: number
	/**
	 * Cents left over after the even split. This many people pay one cent
	 * more so the shares add up to the total. Always less than splitCount.
	 */
	remainderCents: number
}

/** Dollars to whole cents, rounding to the nearest cent. */
export function toCents(dollars: number): number {
	return Math.round(dollars * 100)
}

/** Whole cents back to dollars for display. */
export function fromCents(cents: number): number {
	return cents / 100
}

export function isValidTipPercent(percent: number): boolean {
	return (
		Number.isFinite(percent) &&
		percent >= MIN_TIP_PERCENT &&
		percent <= MAX_TIP_PERCENT
	)
}

/**
 * Tip in cents for a bill in cents, rounded half up to the nearest cent.
 * The percent is scaled to hundredths of a percent so the division is an
 * exact integer ratio and a true half cent (e.g. $47.30 at 15% = 709.5
 * cents) is never misread by float noise.
 */
export function tipCentsFor(billCents: number, tipPercent: number): number {
	const basisPoints = Math.round(tipPercent * 100)
	return Math.round((billCents * basisPoints) / 10_000)
}

/** Returns null when any input is out of range. */
export function calculateTip(input: TipInput): TipResult | null {
	const { billAmount, tipPercent, splitCount } = input
	if (!Number.isFinite(billAmount) || billAmount < 0) {
		return null
	}
	if (!isValidTipPercent(tipPercent)) {
		return null
	}
	if (
		!Number.isInteger(splitCount) ||
		splitCount < MIN_SPLIT ||
		splitCount > MAX_SPLIT
	) {
		return null
	}

	const billCents = toCents(billAmount)
	const tipCents = tipCentsFor(billCents, tipPercent)
	const totalCents = billCents + tipCents
	const perPersonTotalCents = Math.floor(totalCents / splitCount)
	const perPersonTipCents = Math.floor(tipCents / splitCount)

	return {
		billCents,
		tipCents,
		totalCents,
		splitCount,
		perPersonTotalCents,
		perPersonTipCents,
		perPersonBillCents: perPersonTotalCents - perPersonTipCents,
		remainderCents: totalCents - perPersonTotalCents * splitCount
	}
}
