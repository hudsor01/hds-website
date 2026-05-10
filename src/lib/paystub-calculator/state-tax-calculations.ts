import type { TaxData } from '@/types/paystub'
import { getStateTaxBrackets } from './state-tax-data'

export const calculateStateTax = (
	grossPay: number,
	ytdGross: number,
	state: string,
	filingStatus: keyof TaxData['federalBrackets'],
	year?: number
) => {
	const stateBrackets = getStateTaxBrackets(state, year)
	if (!stateBrackets) {
		return 0 // Unknown state -> assume no income tax
	}

	const brackets = stateBrackets[filingStatus].length
		? stateBrackets[filingStatus]
		: stateBrackets.single // Fallback to single brackets to avoid empty arrays
	let tax = 0
	let previousLimit = 0
	let remainingGrossPay = grossPay
	const currentTaxableIncome = ytdGross + grossPay

	// Calculate tax incrementally across brackets
	for (let i = 0; i < brackets.length; i++) {
		const bracket = brackets[i]
		if (!bracket) {
			continue
		}

		const bracketStart = previousLimit
		const bracketEnd = bracket.limit === Infinity ? Infinity : bracket.limit

		// Determine how much of the current gross pay falls in this bracket
		const taxableInBracketBeforeCurrent = Math.max(
			0,
			Math.min(ytdGross, bracketEnd) - bracketStart
		)
		const taxableInBracketAfterCurrent = Math.max(
			0,
			Math.min(currentTaxableIncome, bracketEnd) - bracketStart
		)
		const currentPayTaxableInBracket =
			taxableInBracketAfterCurrent - taxableInBracketBeforeCurrent

		if (currentPayTaxableInBracket > 0) {
			const applicablePay = Math.min(
				currentPayTaxableInBracket,
				remainingGrossPay
			)
			tax += applicablePay * bracket.rate
			remainingGrossPay -= applicablePay

			if (remainingGrossPay <= 0) {
				break
			}
		}

		previousLimit = bracketEnd
	}

	return tax
}
