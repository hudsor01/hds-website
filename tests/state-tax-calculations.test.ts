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
			expect(
				getIncomeTaxStates()
					.map(s => s.value)
					.sort()
			).toEqual(['CA', 'IL', 'MA', 'NY', 'PA'])
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

	describe('California State Tax (progressive, per-status schedule)', () => {
		it('uses the Schedule X (single) golden, not Schedule Z (gross 70000)', () => {
			// Schedule X single: 11079/26264/41452/57542/72724 ...
			// 0.01*11079 + 0.02*(26264-11079) + 0.04*(41452-26264)
			//   + 0.06*(57542-41452) + 0.08*(70000-57542)
			// = 110.79 + 303.70 + 607.52 + 965.40 + 996.64 = 2984.05
			const tax = calculateStateTax(70000, 0, 'CA', 'single')
			expect(tax).toBeCloseTo(2984.05, 2)
		})

		it('uses the Schedule Z (HoH) golden, distinct from single (gross 70000)', () => {
			// Schedule Z HoH: 22173/52530/67716/83805 ... distinguishes per-status from
			// single (single at 70000 = 2984.05, HoH = 1573.35 -- not the same schedule).
			// 0.01*22173 + 0.02*(52530-22173) + 0.04*(67716-52530)
			//   + 0.06*(70000-67716)
			// = 221.73 + 607.14 + 607.44 + 137.04 = 1573.35
			const tax = calculateStateTax(70000, 0, 'CA', 'headOfHousehold')
			expect(tax).toBeCloseTo(1573.35, 2)
		})
	})

	describe('New York State Tax (progressive, per-status schedule)', () => {
		it('uses the single schedule golden (gross 100000)', () => {
			// Single: 8500/11700/13900/80650/215400 ...
			// 0.04*8500 + 0.045*(11700-8500) + 0.0525*(13900-11700)
			//   + 0.055*(80650-13900) + 0.06*(100000-80650)
			// = 340.00 + 144.00 + 115.50 + 3671.25 + 1161.00 = 5431.75
			const tax = calculateStateTax(100000, 0, 'ny', 'single')
			expect(tax).toBeCloseTo(5431.75, 2)
		})

		it('uses the MFJ schedule golden, distinct from single (gross 100000)', () => {
			// MFJ: 17150/23600/27900/161550 ... distinguishes per-status from single
			// (single at 100000 = 5431.75, MFJ = 5167.50 -- wider low brackets).
			// 0.04*17150 + 0.045*(23600-17150) + 0.0525*(27900-23600)
			//   + 0.055*(100000-27900)
			// = 686.00 + 290.25 + 225.75 + 3965.50 = 5167.50
			const tax = calculateStateTax(100000, 0, 'ny', 'marriedJoint')
			expect(tax).toBeCloseTo(5167.5, 2)
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
