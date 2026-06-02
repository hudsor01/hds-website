import { describe, expect, it } from 'bun:test'
import { calculateStateTax } from '@/lib/paystub-calculator/state-tax-calculations'
import { getSupportedIncomeTaxStateCodes } from '@/lib/paystub-calculator/state-tax-data'
import { getIncomeTaxStates } from '@/lib/paystub-calculator/states-utils'

describe('State Tax Calculations', () => {
	describe('PAYSTUB-01: dropdown <-> data parity', () => {
		it('selectable income-tax states equal the states with bracket data', () => {
			// Bidirectional parity: the dropdown list (getIncomeTaxStates) is derived
			// from the bracket-data keys (getSupportedIncomeTaxStateCodes), so the two
			// can never drift. Dedupe + sort both sides and compare.
			const selectable = [
				...new Set(getIncomeTaxStates().map(s => s.value))
			].sort()
			const withData = [...new Set(getSupportedIncomeTaxStateCodes())].sort()

			expect(selectable).toEqual(withData)
		})

		it('the supported income-tax set is exactly CA, IL, MA, NY, PA', () => {
			expect(getIncomeTaxStates().map(s => s.value).sort()).toEqual([
				'CA',
				'IL',
				'MA',
				'NY',
				'PA'
			])
		})
	})

	describe('Illinois State Tax (4.95% flat)', () => {
		it('should calculate IL state tax correctly', () => {
			const grossPay = 5000
			const ytdGross = 25000

			const tax = calculateStateTax(grossPay, ytdGross, 'IL', 'single')

			// IL has 4.95% flat rate
			expect(tax).toBeCloseTo(247.5, 2) // 5000 * 0.0495
		})

		it('should handle YTD accumulation for progressive states', () => {
			const grossPay = 3000
			const ytdGross = 15000

			const tax = calculateStateTax(grossPay, ytdGross, 'IL', 'single')

			// Still flat rate for IL
			expect(tax).toBeCloseTo(148.5, 2) // 3000 * 0.0495
		})
	})

	describe('Pennsylvania State Tax (3.07% flat)', () => {
		it('should calculate PA state tax correctly', () => {
			const grossPay = 4000
			const ytdGross = 20000

			const tax = calculateStateTax(grossPay, ytdGross, 'PA', 'single')

			// PA has 3.07% flat rate
			expect(tax).toBeCloseTo(122.8, 2) // 4000 * 0.0307
		})
	})

	describe('Massachusetts State Tax (flat 5.0%)', () => {
		it('should calculate MA state tax for low income', () => {
			const grossPay = 2000
			const ytdGross = 10000

			const tax = calculateStateTax(grossPay, ytdGross, 'MA', 'single')

			// MA is a flat 5.0% below the 1083150 surtax threshold
			expect(tax).toBeCloseTo(100, 2) // 2000 * 0.05
		})

		it('should calculate MA state tax for higher income', () => {
			const grossPay = 5000
			const ytdGross = 80000

			const tax = calculateStateTax(grossPay, ytdGross, 'MA', 'single')

			// Still flat 5.0%, well below the 1083150 surtax threshold
			expect(tax).toBeCloseTo(250, 2) // 5000 * 0.05
		})
	})

	describe('Corrected 2025 surtax boundaries', () => {
		it('applies the MA 4% surtax over 1083150 (effective 9.0%)', () => {
			// cumulative 1000000 -> 1100000: 83150 at 5% (up to 1083150) + 16850 at 9%
			// = 4157.50 + 1516.50 = 5674.00
			const tax = calculateStateTax(100000, 1000000, 'MA', 'single')
			expect(tax).toBeCloseTo(5674, 2)
		})

		it('applies the CA Mental Health Services surtax over 1000000 (13.3%)', () => {
			// cumulative 1000000 -> 1050000: entire 50000 slice is over 1000000 at 13.3%
			// = 50000 * 0.133 = 6650.00
			const tax = calculateStateTax(50000, 1000000, 'CA', 'single')
			expect(tax).toBeCloseTo(6650, 2)
		})

		it('hits the NY 10.9% top bracket over 25000000', () => {
			// cumulative 25000000 -> 26000000: entire 1000000 slice is over 25000000
			// at 10.9% = 1000000 * 0.109 = 109000.00
			const tax = calculateStateTax(1000000, 25000000, 'NY', 'single')
			expect(tax).toBeCloseTo(109000, 2)
		})
	})

	describe('Defensive fallback for UI-unreachable input', () => {
		it('returns 0 for Texas (TX is in NO_INCOME_TAX_CODES, not selectable here)', () => {
			// Defensive fallback: TX has no bracket data, so calculateStateTax returns 0.
			// The UI groups TX under "No State Income Tax", so this path is only reached
			// by direct/stale input, not by a user selecting a taxed state.
			const grossPay = 5000
			const ytdGross = 25000

			const tax = calculateStateTax(grossPay, ytdGross, 'TX', 'single')

			expect(tax).toBe(0)
		})

		it('returns 0 for Florida (FL is in NO_INCOME_TAX_CODES, not selectable here)', () => {
			// Defensive fallback: same as TX. Not user-facing "graceful" behavior, since
			// FL is never offered in the income-tax dropdown group.
			const grossPay = 6000
			const ytdGross = 30000

			const tax = calculateStateTax(grossPay, ytdGross, 'FL', 'single')

			expect(tax).toBe(0)
		})
	})

	describe('Defensive fallback for unknown state codes', () => {
		it('returns 0 for an unknown state code (UI cannot produce this)', () => {
			// Defensive fallback for input the UI can no longer produce: the dropdown is
			// derived from getSupportedIncomeTaxStateCodes, so 'XX' is unreachable through
			// normal use. Returning 0 keeps a stale shared URL from crashing the calc.
			const grossPay = 5000
			const ytdGross = 25000

			const tax = calculateStateTax(grossPay, ytdGross, 'XX', 'single')

			expect(tax).toBe(0)
		})
	})

	describe('California State Tax (progressive)', () => {
		it('calculates CA state tax for single filer', () => {
			const tax = calculateStateTax(5000, 20000, 'CA', 'single')
			expect(tax).toBeGreaterThan(0)
		})

		it('falls back to single brackets for headOfHousehold', () => {
			const tax = calculateStateTax(5000, 20000, 'CA', 'headOfHousehold')
			expect(tax).toBeGreaterThan(0)
		})
	})

	describe('New York State Tax (progressive)', () => {
		it('handles married separate using fallback brackets', () => {
			const tax = calculateStateTax(3000, 10000, 'ny', 'marriedSeparate')
			expect(tax).toBeGreaterThan(0)
		})
	})

	describe('Defensive fallback in the no-income-tax group', () => {
		it('returns 0 for TX (defensive, not user-facing graceful behavior)', () => {
			// Defensive fallback: TX is in NO_INCOME_TAX_CODES and has no bracket data,
			// so this exercises the UI-unreachable return-0 path, not a real $0 estimate.
			const tax = calculateStateTax(4000, 10000, 'TX', 'single')
			expect(tax).toBe(0)
		})
	})
})
