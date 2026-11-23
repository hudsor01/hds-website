import { describe, expect, it } from 'bun:test'
import {
	calculateStatePeriod,
	EMPTY_STATE_YTD,
	type StatePeriodInput,
	stateInsuranceLabel
} from '@/lib/paystub-calculator/state-tax-calculations'
import { getSupportedIncomeTaxStateCodes } from '@/lib/paystub-calculator/state-tax-data'
import { getIncomeTaxStates } from '@/lib/paystub-calculator/states-utils'

/**
 * 2026 state payroll withholding. Where the agency publishes worked examples
 * they are used directly: EDD DE 44 (2026) Method B Examples A to F,
 * NYS-50-T-NYS (1/26) Method II Examples, IL-700-T (2026) automated payroll
 * example. NY and CA per-period examples use rounded per-period tables, so
 * the annualized method can differ by a few cents.
 */
const SS_WAGE_BASE = 184500

function input(overrides: Partial<StatePeriodInput>): StatePeriodInput {
	return {
		state: 'CA',
		filingStatus: 'single',
		payFrequency: 'biweekly',
		grossPay: 2000,
		retirement: 0,
		health: 0,
		ficaTax: 0,
		allowances: 0,
		additionalAllowances: 0,
		...overrides
	}
}

function run(overrides: Partial<StatePeriodInput>, ytd = EMPTY_STATE_YTD) {
	return calculateStatePeriod(input(overrides), ytd, SS_WAGE_BASE)
}

describe('supported states', () => {
	it('dropdown income-tax states equal the states with formulas', () => {
		const selectable = getIncomeTaxStates()
			.map(s => s.value)
			.sort()
		expect(selectable).toEqual([...getSupportedIncomeTaxStateCodes()].sort())
		expect(selectable).toEqual(['CA', 'IL', 'MA', 'NY', 'PA'])
	})

	it('no-income-tax and unknown states withhold nothing', () => {
		for (const state of ['TX', 'FL', 'ZZ']) {
			const r = run({ state, grossPay: 5000 })
			expect(r.incomeTax).toBe(0)
			expect(r.insurance).toBe(0)
		}
	})
})

describe('California, DE 44 Method B', () => {
	it('Example A: below the low income exemption withholds nothing', () => {
		const r = run({ payFrequency: 'weekly', grossPay: 210, allowances: 1 })
		expect(r.incomeTax).toBe(0)
	})

	it('Example B: married, 2 regular and 1 estimated deduction allowance', () => {
		const r = run({
			filingStatus: 'marriedJoint',
			grossPay: 1600,
			allowances: 2,
			additionalAllowances: 1
		})
		expect(r.incomeTax).toBeCloseTo(2.38, 2)
	})

	it('Example D: head of household, 3 allowances (table method gives 1.69)', () => {
		const r = run({
			filingStatus: 'headOfHousehold',
			payFrequency: 'weekly',
			grossPay: 950,
			allowances: 3
		})
		expect(r.incomeTax).toBeCloseTo(1.67, 2)
	})

	it('Example E: semimonthly $2,400, married, 4 allowances', () => {
		const r = run({
			filingStatus: 'marriedJoint',
			payFrequency: 'semimonthly',
			grossPay: 2400,
			allowances: 4
		})
		expect(r.incomeTax).toBeCloseTo(4.13, 2)
	})

	it('Example F: monthly $4,750, married, 4 allowances', () => {
		const r = run({
			filingStatus: 'marriedJoint',
			payFrequency: 'monthly',
			grossPay: 4750,
			allowances: 4
		})
		expect(r.incomeTax).toBeCloseTo(7.17, 2)
	})

	it('SDI is 1.3% of wages after Section 125 premiums, 401(k) included', () => {
		const r = run({ grossPay: 2000, retirement: 200, health: 100 })
		expect(r.insurance).toBeCloseTo(24.7, 2)
		expect(stateInsuranceLabel('ca')).toBe('CA SDI')
	})
})

describe('New York, NYS-50-T-NYS Method II and III', () => {
	it('single Example 2: semimonthly $5,000, 1 allowance', () => {
		const r = run({
			state: 'NY',
			payFrequency: 'semimonthly',
			grossPay: 5000,
			allowances: 1
		})
		expect(r.incomeTax).toBeCloseTo(258.51, 1)
	})

	it('single Example 3: monthly $50,000, 3 allowances', () => {
		const r = run({
			state: 'NY',
			payFrequency: 'monthly',
			grossPay: 50000,
			allowances: 3
		})
		expect(r.incomeTax).toBeCloseTo(3576.63, 1)
	})

	it('married Example 2: semimonthly $5,000, 3 allowances', () => {
		const r = run({
			state: 'NY',
			filingStatus: 'marriedJoint',
			payFrequency: 'semimonthly',
			grossPay: 5000,
			allowances: 3
		})
		expect(r.incomeTax).toBeCloseTo(248.11, 1)
	})

	it('married Example 3: monthly $50,000, 3 allowances', () => {
		const r = run({
			state: 'NY',
			filingStatus: 'marriedJoint',
			payFrequency: 'monthly',
			grossPay: 50000,
			allowances: 3
		})
		expect(r.incomeTax).toBeCloseTo(3622.09, 1)
	})

	it('Method III at $1,077,550 and above (single)', () => {
		// (1,560,000 - 7,400) x 10.45% / 52
		const r = run({ state: 'NY', payFrequency: 'weekly', grossPay: 30000 })
		expect(r.incomeTax).toBeCloseTo(3120.13, 2)
	})

	it('PFL 0.432% plus disability 0.5% capped at $0.60 a week', () => {
		const r = run({ state: 'NY', grossPay: 3000 })
		// 12.96 PFL + 1.20 disability (2 weeks x 0.60)
		expect(r.insurance).toBeCloseTo(14.16, 2)
		expect(r.ytd.nyPflPaid).toBeCloseTo(12.96, 2)
	})

	it('stops PFL at the $411.91 yearly maximum', () => {
		const r = run(
			{ state: 'NY', grossPay: 3000 },
			{ ...EMPTY_STATE_YTD, nyPflPaid: 405 }
		)
		expect(r.insurance).toBeCloseTo(6.91 + 1.2, 2)
	})
})

describe('Illinois, IL-700-T automated payroll method', () => {
	it('IL-700-T example: $800 weekly, 2 line 1 and 2 line 2 allowances', () => {
		const r = run({
			state: 'IL',
			payFrequency: 'weekly',
			grossPay: 800,
			allowances: 2,
			additionalAllowances: 2
		})
		expect(r.incomeTax).toBeCloseTo(32.13, 2)
	})

	it('401(k) and Section 125 reduce Illinois wages', () => {
		const r = run({ state: 'IL', grossPay: 2000, retirement: 100, health: 100 })
		expect(r.incomeTax).toBeCloseTo(1800 * 0.0495, 2)
	})
})

describe('Pennsylvania, 3.07% flat', () => {
	it('taxes 401(k) deferrals but not Section 125 premiums', () => {
		const r = run({ state: 'PA', grossPay: 2000, retirement: 100, health: 40 })
		expect(r.incomeTax).toBeCloseTo(60.17, 2)
	})
})

describe('Massachusetts, Circular M', () => {
	it('subtracts FICA and the exemption factor, then 5%', () => {
		// 2,500 - 191.25 - 169 = 2,139.75 x 5%
		const r = run({
			state: 'MA',
			grossPay: 2500,
			ficaTax: 191.25,
			allowances: 1
		})
		expect(r.incomeTax).toBeCloseTo(106.99, 2)
		expect(r.ytd.maFicaDeducted).toBeCloseTo(191.25, 2)
	})

	it('stops the FICA deduction at $2,000 for the year', () => {
		const r = run(
			{ state: 'MA', grossPay: 2500, ficaTax: 191.25, allowances: 1 },
			{ ...EMPTY_STATE_YTD, maFicaDeducted: 1900 }
		)
		// 2,500 - 100 - 169 = 2,231 x 5%
		expect(r.incomeTax).toBeCloseTo(111.55, 2)
	})

	it('uses 38n + 131 for more than one biweekly exemption', () => {
		const r = run({ state: 'MA', grossPay: 2500, allowances: 3 })
		expect(r.incomeTax).toBeCloseTo((2500 - 245) * 0.05, 2)
	})

	it('subtracts the head of household amount', () => {
		const r = run({
			state: 'MA',
			filingStatus: 'headOfHousehold',
			grossPay: 2500,
			ficaTax: 191.25,
			allowances: 1
		})
		expect(r.incomeTax).toBeCloseTo(102.37, 2)
	})

	it('withholds nothing at or below $308 biweekly with an exemption', () => {
		expect(run({ state: 'MA', grossPay: 300, allowances: 1 }).incomeTax).toBe(0)
	})

	it('adds the 4% surtax over $1,107,750 a year', () => {
		// 1,560,000 x 5% + 452,250 x 4% = 96,090 / 52
		const r = run(
			{ state: 'MA', payFrequency: 'weekly', grossPay: 30000, ficaTax: 2295 },
			{ ...EMPTY_STATE_YTD, maFicaDeducted: 2000 }
		)
		expect(r.incomeTax).toBeCloseTo(1847.88, 2)
	})

	it('PFML is 0.46% up to the Social Security wage base', () => {
		expect(run({ state: 'MA', grossPay: 2500 }).insurance).toBeCloseTo(11.5, 2)
		const capped = run(
			{ state: 'MA', grossPay: 2500 },
			{ ...EMPTY_STATE_YTD, maPfmlWages: 184000 }
		)
		expect(capped.insurance).toBeCloseTo(500 * 0.0046, 2)
	})
})
