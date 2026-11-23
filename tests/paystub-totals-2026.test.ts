import { describe, expect, it } from 'bun:test'
import {
	calculatePaystubTotals,
	type PaystubCalculationParams
} from '@/lib/paystub-calculator/calculate-paystub-totals'
import {
	normalizeFilingStatus,
	restoreWithholding
} from '@/lib/paystub-calculator/supported-inputs'
import { validatePaystubInputs } from '@/lib/paystub-calculator/validation'
import { DEFAULT_WITHHOLDING } from '@/types/paystub'

function params(
	overrides: Partial<PaystubCalculationParams> = {}
): PaystubCalculationParams {
	return {
		hourlyRate: 25,
		hoursPerPeriod: 80,
		filingStatus: 'single',
		taxYear: 2026,
		state: 'TX',
		payFrequency: 'biweekly',
		withholding: DEFAULT_WITHHOLDING,
		...overrides
	}
}

describe('full-year paystub totals, 2026', () => {
	it('pre-tax 401(k) and health premiums flow into every line', () => {
		const r = calculatePaystubTotals(
			params({
				withholding: {
					...DEFAULT_WITHHOLDING,
					retirementPerPeriod: 100,
					healthPerPeriod: 40
				}
			})
		)
		const p = r.payPeriods[0]
		expect(p?.grossPay).toBe(2000)
		expect(p?.preTaxDeductions).toBe(140)
		// Federal on 1,860: (48,360 - 8,600) -> 1,240 + 12% x 19,860 = 3,623.20 / 26
		expect(p?.federalTax).toBe(139.35)
		// FICA on 1,960 (401(k) stays in FICA wages)
		expect(p?.socialSecurity).toBe(121.52)
		expect(p?.medicare).toBe(28.42)
		expect(p?.stateTax).toBe(0)
		expect(p?.netPay).toBe(1570.71)
		expect(r.totals.netPay).toBeCloseTo(1570.71 * 26, 2)
	})

	it('caps Social Security at $184,500 and adds Additional Medicare over $200,000', () => {
		const r = calculatePaystubTotals(params({ hourlyRate: 1000 }))
		// 80,000 per period, 2,080,000 a year
		expect(r.totals.grossPay).toBe(2080000)
		expect(r.totals.socialSecurity).toBeCloseTo(184500 * 0.062, 2)
		expect(r.payPeriods[2]?.socialSecurity).toBeCloseTo(24500 * 0.062, 2)
		expect(r.payPeriods[3]?.socialSecurity).toBe(0)
		expect(r.totals.medicare).toBeCloseTo(
			2080000 * 0.0145 + (2080000 - 200000) * 0.009,
			2
		)
	})

	it('stops NY paid family leave at $411.91 for the year', () => {
		const r = calculatePaystubTotals(
			params({
				state: 'NY',
				hourlyRate: 50,
				hoursPerPeriod: 40,
				payFrequency: 'weekly'
			})
		)
		// 411.91 PFL + 52 x 0.60 disability
		expect(r.totals.stateInsurance).toBeCloseTo(411.91 + 31.2, 2)
	})

	it('net pay always equals gross less every deduction', () => {
		const r = calculatePaystubTotals(
			params({
				state: 'MA',
				withholding: { ...DEFAULT_WITHHOLDING, retirementPerPeriod: 150 },
				additionalDeductions: [{ name: 'Union dues', amount: 20 }]
			})
		)
		for (const p of r.payPeriods) {
			const deductions =
				p.preTaxDeductions +
				p.federalTax +
				p.socialSecurity +
				p.medicare +
				p.stateTax +
				p.stateInsurance +
				p.otherDeductions
			expect(p.netPay).toBeCloseTo(p.grossPay - deductions, 2)
		}
	})
})

describe('withholding input validation', () => {
	it('rejects pre-tax deductions larger than gross pay', () => {
		const v = validatePaystubInputs(
			params({
				withholding: { ...DEFAULT_WITHHOLDING, retirementPerPeriod: 2500 }
			})
		)
		expect(v.errors.retirementPerPeriod).toBe(
			'Pre-tax deductions cannot be more than gross pay'
		)
	})

	it('rejects negative amounts and fractional allowances', () => {
		const v = validatePaystubInputs(
			params({
				withholding: {
					...DEFAULT_WITHHOLDING,
					otherIncome: -1,
					stateAllowances: 1.5
				}
			})
		)
		expect(v.errors.otherIncome).toBe('Other income must be zero or more')
		expect(v.errors.stateAllowances).toBe(
			'Allowances must be a whole number from 0 to 99'
		)
	})
})

describe('restoring older saved forms and links', () => {
	it('maps the old five filing statuses onto the three W-4 statuses', () => {
		expect(normalizeFilingStatus('marriedSeparate')).toBe('single')
		expect(normalizeFilingStatus('qualifyingSurvivingSpouse')).toBe(
			'marriedJoint'
		)
		expect(normalizeFilingStatus('headOfHousehold')).toBe('headOfHousehold')
		expect(normalizeFilingStatus('bogus')).toBeNull()
		expect(normalizeFilingStatus(null)).toBeNull()
	})

	it('keeps defaults for missing or malformed saved withholding fields', () => {
		const restored = restoreWithholding({
			multipleJobs: 'yes',
			otherIncome: 5000,
			deductions: -10,
			retirementPerPeriod: 'abc'
		})
		expect(restored).toEqual({ ...DEFAULT_WITHHOLDING, otherIncome: 5000 })
		expect(restoreWithholding(null)).toEqual(DEFAULT_WITHHOLDING)
	})
})
