/**
 * Profit margin & markup calculator.
 *
 * Given a cost and a selling price, computes profit, gross margin %, and
 * markup %. Margin and markup are distinct: margin is profit over PRICE,
 * markup is profit over COST. A value is `null` when its denominator is
 * zero (margin needs a non-zero price, markup needs a non-zero cost).
 *
 * Results are display-ready: profit is rounded to the cent and the
 * percentages to two decimals, half away from zero. The math runs on
 * integer ratios (amounts scaled to hundredths of a cent) because rounding
 * the float result directly misreads true halves: 197.99 -> 200 is a
 * 1.005% margin, but the float comes out as 1.00499... and would show
 * 1.00% instead of 1.01%. Results are never negative zero.
 */

export interface MarginResult {
	/** price - cost, rounded to the cent. */
	profit: number
	/** (price - cost) / price * 100, two decimals. null when price is 0. */
	marginPercent: number | null
	/** (price - cost) / cost * 100, two decimals. null when cost is 0. */
	markupPercent: number | null
}

/** Amounts are scaled to hundredths of a cent so sub-cent unit costs work. */
const UNITS_PER_DOLLAR = 10_000
const UNITS_PER_CENT = 100

function toUnits(dollars: number): number {
	return Math.round(dollars * UNITS_PER_DOLLAR)
}

/**
 * numerator / denominator rounded half away from zero, as an integer.
 * Both inputs are integers, so a true .5 quotient is exact in binary.
 * Adding 0 turns a -0 result into 0.
 */
function roundRatio(numerator: number, denominator: number): number {
	const quotient = numerator / denominator
	return Math.sign(quotient) * Math.round(Math.abs(quotient)) + 0
}

/** Ratio as a percent with two decimals: round(n / d * 10000) / 100. */
function percentOf(numerator: number, denominator: number): number {
	return roundRatio(numerator * 10_000, denominator) / 100
}

export function calculateMargin(cost: number, price: number): MarginResult {
	if (!Number.isFinite(cost) || !Number.isFinite(price)) {
		return { profit: Number.NaN, marginPercent: null, markupPercent: null }
	}
	const costUnits = toUnits(cost)
	const priceUnits = toUnits(price)
	const profitUnits = priceUnits - costUnits
	return {
		profit: roundRatio(profitUnits, UNITS_PER_CENT) / 100,
		marginPercent: priceUnits !== 0 ? percentOf(profitUnits, priceUnits) : null,
		markupPercent: costUnits !== 0 ? percentOf(profitUnits, costUnits) : null
	}
}

/**
 * Selling price needed to hit a target margin % on a given cost.
 * price = cost / (1 - margin/100), rounded UP to the cent so the margin
 * at that price is never below the target (cost 10 at 35% is $15.39, not
 * $15.38, which would be 34.98%).
 *
 * Returns null when the cost is not above 0 (there is no meaningful
 * price), the target is negative (a sell-below-cost price) or the target
 * is 100% or more (unreachable). The target is used to two decimals.
 */
export function priceForMargin(
	cost: number,
	targetMarginPercent: number
): number | null {
	if (!Number.isFinite(cost) || !Number.isFinite(targetMarginPercent)) {
		return null
	}
	const costUnits = toUnits(cost)
	const targetBasisPoints = Math.round(targetMarginPercent * 100)
	if (costUnits <= 0 || targetBasisPoints < 0 || targetBasisPoints >= 10_000) {
		return null
	}
	// cents = costUnits / UNITS_PER_CENT / (1 - bp / 10000), as one integer ratio.
	const priceCents = Math.ceil(
		(costUnits * 10_000) / ((10_000 - targetBasisPoints) * UNITS_PER_CENT)
	)
	return priceCents / 100
}
