import { describe, expect, it } from 'bun:test'
import {
	federalWithholding,
	medicareTax,
	socialSecurityTax
} from '@/lib/paystub-calculator/tax-calculations'
import {
	getSupportedTaxYears,
	getTaxDataForYear
} from '@/lib/paystub-calculator/tax-data'
import { DEFAULT_WITHHOLDING } from '@/types/paystub'

/**
 * Federal withholding and FICA, 2026.
 *
 * Expected values are worked by hand from IRS Pub. 15-T (2026) Worksheet 1A
 * and the annual percentage method tables (page 12), and IRS Pub. 15 (2026)
 * section 9 ($184,500 wage base, Additional Medicare Tax over $200,000).
 */
const W4 = DEFAULT_WITHHOLDING

describe('supported tax years', () => {
	it('backs 2026 only', () => {
		expect(getSupportedTaxYears()).toEqual([2026])
	})

	it('throws for a year without data instead of guessing', () => {
		expect(() => getTaxDataForYear(2025)).toThrow(
			'No federal tax data for 2025'
		)
	})
})

describe('federal withholding, Pub. 15-T Worksheet 1A', () => {
	it('single, biweekly $2,000: subtracts $8,600 before the table', () => {
		// 52,000 - 8,600 = 43,400; 1,240 + 12% x (43,400 - 19,900) = 4,060; / 26
		expect(federalWithholding(2000, 26, 'single', W4, 2026)).toBeCloseTo(
			156.15,
			2
		)
	})

	it('married filing jointly subtracts $12,900', () => {
		// 52,000 - 12,900 = 39,100; 10% x (39,100 - 19,300) = 1,980; / 26
		expect(federalWithholding(2000, 26, 'marriedJoint', W4, 2026)).toBeCloseTo(
			76.15,
			2
		)
	})

	it('Step 2 box: checkbox table and no line 1g amount', () => {
		// 52,000; 2,900 + 22% x (52,000 - 33,250) = 7,025; / 26
		const w4 = { ...W4, multipleJobs: true }
		expect(federalWithholding(2000, 26, 'single', w4, 2026)).toBeCloseTo(
			270.19,
			2
		)
	})

	it('Step 3 credit cannot push withholding below zero, Step 4(c) still added', () => {
		// 72,000 - 12,900 = 59,100; 2,480 + 12% x 15,000 = 4,280; / 12 = 356.67
		// credit 4,400 / 12 = 366.67, so 0, then + 25 extra
		const w4 = { ...W4, dependentsCredit: 4400, extraWithholding: 25 }
		expect(federalWithholding(6000, 12, 'marriedJoint', w4, 2026)).toBeCloseTo(
			25,
			2
		)
	})

	it('Step 4(a) adds and Step 4(b) subtracts, head of household', () => {
		// 78,000 + 10,000 - (5,000 + 8,600) = 74,400
		// 1,770 + 12% x (74,400 - 33,250) = 6,708; / 52
		const w4 = { ...W4, otherIncome: 10000, deductions: 5000 }
		expect(
			federalWithholding(1500, 52, 'headOfHousehold', w4, 2026)
		).toBeCloseTo(129, 2)
	})

	it('top bracket, single semimonthly $30,000', () => {
		// 720,000 - 8,600 = 711,400; 192,979.25 + 37% x 63,300 = 216,400.25; / 24
		expect(federalWithholding(30000, 24, 'single', W4, 2026)).toBeCloseTo(
			9016.68,
			2
		)
	})

	it('withholds nothing when annual wages are under the line 1g amount', () => {
		expect(federalWithholding(100, 52, 'single', W4, 2026)).toBe(0)
	})
})

describe('Social Security and Medicare, 2026', () => {
	it('stops Social Security at the $184,500 wage base', () => {
		expect(socialSecurityTax(10000, 0, 2026)).toBeCloseTo(620, 2)
		expect(socialSecurityTax(10000, 180000, 2026)).toBeCloseTo(279, 2)
		expect(socialSecurityTax(10000, 184500, 2026)).toBe(0)
	})

	it('adds 0.9% on wages over $200,000 in the year', () => {
		expect(medicareTax(10000, 0, 2026)).toBeCloseTo(145, 2)
		// 1.45% x 10,000 + 0.9% x 5,000
		expect(medicareTax(10000, 195000, 2026)).toBeCloseTo(190, 2)
		expect(medicareTax(10000, 250000, 2026)).toBeCloseTo(235, 2)
	})
})
