import { describe, expect, it } from 'bun:test'
import {
	calculateFederalTax,
	calculateSocialSecurity
} from '@/lib/paystub-calculator/tax-calculations'
import {
	getSupportedTaxYears,
	getTaxDataForYear
} from '@/lib/paystub-calculator/tax-data'

/**
 * Federal Tax + FICA 2025 golden-value tests.
 *
 * Locks the Wave 1 (11-01) data re-key: official 2025 IRS federal brackets
 * (Rev. Proc. 2024-40) and the 2025 Social Security wage base ($176,100).
 */
describe('PAYSTUB-02: supported tax years', () => {
	it('getSupportedTaxYears() returns exactly [2025]', () => {
		expect(getSupportedTaxYears()).toEqual([2025])
	})
})

describe('PAYSTUB-05: federal 2025 brackets', () => {
	it('computes the single golden case (gross 50000, ytd 0)', () => {
		// 0.10*11925 + 0.12*(48475-11925) + 0.22*(50000-48475)
		// = 1192.50 + 4386.00 + 335.50 = 5914.00
		const tax = calculateFederalTax(50000, 'single', 0, 2025)
		expect(tax).toBeCloseTo(5914, 2)
	})

	it('locks the 10% ceiling at 11925 (not the old 11000)', () => {
		// At gross exactly 11925 (single, ytd 0) the whole slice is 10% -> 1192.50.
		// Under the old 11000 ceiling the 925 over would have been taxed at 12%.
		const tax = calculateFederalTax(11925, 'single', 0, 2025)
		expect(tax).toBeCloseTo(1192.5, 2)
	})
})

describe('PAYSTUB-05: SS wage base 2025', () => {
	it('taxes the full 176100 base at 6.2%', () => {
		// 176100 * 0.062 = 10918.20
		const ss = calculateSocialSecurity(176100, 0, 2025)
		expect(ss).toBeCloseTo(10918.2, 2)
	})

	it('caps contributions at the 176100 base (not the old 168600)', () => {
		// ytd 170000 + gross 10000 crosses 176100: (176100 - 170000) * 0.062
		// = 6100 * 0.062 = 378.20. Under the old 168600 base this would have been 0.
		const ss = calculateSocialSecurity(10000, 170000, 2025)
		expect(ss).toBeCloseTo(378.2, 2)
	})
})

describe('getTaxDataForYear defensive fallback', () => {
	it('resolves an unbacked year to the latest backed year (defense-in-depth)', () => {
		// getTaxDataForYear keeps a Math.max(...availableYears) fallback so an
		// unbacked year (e.g. a stale shared URL) resolves to 2025 rather than
		// throwing. This path is UI-unreachable once validatePaystubInputs rejects
		// unbacked years (Task 1); asserted here as defense-in-depth, not user-facing.
		const fallback = getTaxDataForYear(2024)
		const current = getTaxDataForYear(2025)
		expect(fallback.federalBrackets.single[0]?.limit).toBe(
			current.federalBrackets.single[0]?.limit
		)
	})
})
