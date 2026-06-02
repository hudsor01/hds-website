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

	it('locks the MFS top-bracket split at 375800 (copy-paste hazard vs single)', () => {
		// MFS shares the first six limits with single but caps the 35% band at 375800
		// (single caps at 626350). gross 400000 ytd 0 straddles the 35%/37% split:
		// 0.10*11925 + 0.12*(48475-11925) + 0.22*(103350-48475)
		//   + 0.24*(197300-103350) + 0.32*(250525-197300)
		//   + 0.35*(375800-250525) + 0.37*(400000-375800)
		// = 1192.50 + 4386.00 + 12072.50 + 22548.00 + 17032.00 + 43846.25 + 8954.00
		// = 110031.25
		const tax = calculateFederalTax(400000, 'marriedSeparate', 0, 2025)
		expect(tax).toBeCloseTo(110031.25, 2)
	})

	it('locks the marriedJoint golden (gross 250000, ytd 0)', () => {
		// 0.10*23850 + 0.12*(96950-23850) + 0.22*(206700-96950)
		//   + 0.24*(250000-206700)
		// = 2385.00 + 8772.00 + 24145.00 + 10392.00 = 45694.00
		const tax = calculateFederalTax(250000, 'marriedJoint', 0, 2025)
		expect(tax).toBeCloseTo(45694, 2)
	})

	it('locks the headOfHousehold golden crossing 64850/103350 (gross 120000)', () => {
		// HoH has its own schedule (17000/64850/103350...), distinct from single.
		// 0.10*17000 + 0.12*(64850-17000) + 0.22*(103350-64850)
		//   + 0.24*(120000-103350)
		// = 1700.00 + 5742.00 + 8470.00 + 3996.00 = 19908.00
		const tax = calculateFederalTax(120000, 'headOfHousehold', 0, 2025)
		expect(tax).toBeCloseTo(19908, 2)
	})

	it('locks the qualifyingSurvivingSpouse golden (QSS == MFJ schedule, gross 300000)', () => {
		// QSS mirrors MFJ (23850/96950/206700...).
		// 0.10*23850 + 0.12*(96950-23850) + 0.22*(206700-96950)
		//   + 0.24*(300000-206700)
		// = 2385.00 + 8772.00 + 24145.00 + 22392.00 = 57694.00
		const tax = calculateFederalTax(
			300000,
			'qualifyingSurvivingSpouse',
			0,
			2025
		)
		expect(tax).toBeCloseTo(57694, 2)
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
	it('resolves an unbacked year to the official 2025 data (defense-in-depth)', () => {
		// getTaxDataForYear keeps a Math.max(...availableYears) fallback so an
		// unbacked year (e.g. a stale shared URL) resolves to 2025 rather than
		// throwing. This path is UI-unreachable once validatePaystubInputs rejects
		// unbacked years (Task 1); asserted here as defense-in-depth, not user-facing.
		// Assert against the official 2025 VALUES (single 10% ceiling 11925, SS wage
		// base 176100), not call-to-call equality, so the test proves the fallback
		// lands on real 2025 data rather than merely "the same thing twice".
		const fallback = getTaxDataForYear(2024)
		expect(fallback.federalBrackets.single[0]?.limit).toBe(11925)
		expect(fallback.ssWageBase).toBe(176100)
	})
})
