/**
 * Profit margin & markup calculator.
 *
 * Given a cost and a selling price, computes profit, gross margin %, and
 * markup %. Margin and markup are distinct: margin is profit over PRICE,
 * markup is profit over COST. A value is `null` when its denominator is
 * zero (margin needs a non-zero price, markup needs a non-zero cost).
 */

export interface MarginResult {
	profit: number
	/** (price - cost) / price * 100. null when price is 0. */
	marginPercent: number | null
	/** (price - cost) / cost * 100. null when cost is 0. */
	markupPercent: number | null
}

export function calculateMargin(cost: number, price: number): MarginResult {
	if (!Number.isFinite(cost) || !Number.isFinite(price)) {
		return { profit: Number.NaN, marginPercent: null, markupPercent: null }
	}
	const profit = price - cost
	const marginPercent = price !== 0 ? (profit / price) * 100 : null
	const markupPercent = cost !== 0 ? (profit / cost) * 100 : null
	return { profit, marginPercent, markupPercent }
}

/**
 * Selling price needed to hit a target margin % on a given cost.
 * price = cost / (1 - margin/100). Returns null for an unreachable
 * margin (>= 100%, since that implies zero or negative cost basis).
 */
export function priceForMargin(
	cost: number,
	targetMarginPercent: number
): number | null {
	if (!Number.isFinite(cost) || !Number.isFinite(targetMarginPercent)) {
		return null
	}
	const m = targetMarginPercent / 100
	// Reject negative targets (would imply a sell-below-cost price) and
	// >=100% (mathematically unreachable with a non-zero cost basis).
	if (m < 0 || m >= 1) {
		return null
	}
	return cost / (1 - m)
}
