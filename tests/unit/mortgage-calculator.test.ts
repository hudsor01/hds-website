import { describe, expect, test } from 'bun:test'
import {
	calculateMortgage,
	fhaAnnualMipRate,
	fhaMipDurationMonths,
	MortgageInputError,
	type MortgageInputs,
	monthlyPayment,
	vaFundingFeeRate
} from '@/lib/mortgage-calculator/calculate'

// FHA figures: HUD Mortgagee Letter 2023-05. USDA: RD Instruction 440.1 Exhibit K
// and HB-1-3555. VA figures: va.gov funding fee
// table (effective April 7, 2023). PMI end rules: CFPB, Homeowners
// Protection Act. Payment math checked against the standard amortization
// formula ($280,000 at 6.5% for 30 years is $1,769.79).
function inputs(overrides: Partial<MortgageInputs> = {}): MortgageInputs {
	return {
		homePrice: 350000,
		downPayment: 70000,
		program: 'conventional',
		interestRate: 6.5,
		termYears: 30,
		propertyTaxAnnual: 6300,
		insuranceAnnual: 2400,
		hoaMonthly: 0,
		pmiRate: 0.5,
		vaFirstUse: true,
		vaExempt: false,
		financeUpfrontFee: true,
		closingCosts: 8000,
		discountPoints: 0,
		credits: 0,
		extraMonthly: 0,
		extraYearly: 0,
		startYear: 2027,
		startMonth: 1,
		...overrides
	}
}

describe('monthlyPayment', () => {
	test('matches the standard amortization formula', () => {
		expect(monthlyPayment(280000, 6.5, 360)).toBeCloseTo(1769.79, 2)
		expect(monthlyPayment(200000, 7, 180)).toBeCloseTo(1797.66, 2)
	})

	test('handles a zero rate and a zero balance', () => {
		expect(monthlyPayment(180000, 0, 180)).toBe(1000)
		expect(monthlyPayment(0, 6, 360)).toBe(0)
	})
})

describe('conventional loan', () => {
	test('20% down has no PMI and adds tax, insurance and HOA', () => {
		const r = calculateMortgage(inputs({ hoaMonthly: 50 }))
		expect(r.loanAmount).toBe(280000)
		expect(r.monthlyPrincipalInterest).toBeCloseTo(1769.79, 2)
		expect(r.monthlyMortgageInsurance).toBe(0)
		expect(r.mortgageInsuranceLabel).toBe('')
		expect(r.totalMonthlyPayment).toBeCloseTo(1769.79 + 525 + 200 + 50, 2)
		expect(r.totalInterest).toBeCloseTo(1769.79 * 360 - 280000, -1)
		expect(r.payoffMonths).toBe(360)
		expect(r.payoffYear).toBe(2056)
		expect(r.payoffMonth).toBe(12)
	})

	test('under 20% down charges PMI on the loan amount until 78% LTV', () => {
		const r = calculateMortgage(inputs({ downPayment: 35000 }))
		expect(r.loanAmount).toBe(315000)
		expect(r.monthlyMortgageInsurance).toBeCloseTo(131.25, 2)
		expect(r.mortgageInsuranceLabel).toBe('PMI')
		const end = r.mortgageInsuranceEndsAfterPayment
		expect(end).not.toBeNull()
		expect(r.totalMortgageInsurance).toBeCloseTo(131.25 * (end as number), 2)
		// After PMI ends the scheduled balance is at or below 78% of value
		const payment = r.monthlyPrincipalInterest
		const rate = 0.065 / 12
		const growth = (1 + rate) ** (end as number)
		const balance = 315000 * growth - payment * ((growth - 1) / rate)
		expect(balance).toBeLessThanOrEqual(350000 * 0.78)
	})

	test('PMI stops by the midpoint even above 78% LTV', () => {
		// 3% down on a 10-year loan reaches the midpoint before 78% LTV
		const r = calculateMortgage(
			inputs({ downPayment: 10500, termYears: 10, interestRate: 9 })
		)
		expect(r.mortgageInsuranceEndsAfterPayment).toBeLessThanOrEqual(60)
	})

	test('extra payments shorten the loan and save interest', () => {
		const base = calculateMortgage(inputs())
		const r = calculateMortgage(
			inputs({ extraMonthly: 200, extraYearly: 1000 })
		)
		expect(r.payoffMonths).toBeLessThan(360)
		expect(r.monthsSaved).toBe(360 - r.payoffMonths)
		expect(r.interestSaved).toBeCloseTo(base.totalInterest - r.totalInterest, 2)
		expect(r.interestSaved).toBeGreaterThan(0)
		// Principal repaid is always the loan amount
		const repaid = r.schedule.reduce((sum, y) => sum + y.principal, 0)
		expect(repaid).toBeCloseTo(280000, 0)
		expect(r.schedule.at(-1)?.endingBalance).toBe(0)
	})

	test('cash to close adds closing costs and points, minus credits', () => {
		const r = calculateMortgage(
			inputs({ closingCosts: 9000, discountPoints: 1, credits: 3000 })
		)
		expect(r.pointsCost).toBe(2800)
		expect(r.cashToClose).toBe(70000 + 9000 + 2800 - 3000)
	})

	test('credits never push cash to close below the down payment', () => {
		const r = calculateMortgage(inputs({ closingCosts: 1000, credits: 5000 }))
		expect(r.cashToClose).toBe(70000)
	})
})

describe('FHA loan', () => {
	test('annual MIP rates follow ML 2023-05', () => {
		expect(fhaAnnualMipRate(300000, 0.965, 30)).toBe(0.0055)
		expect(fhaAnnualMipRate(300000, 0.95, 30)).toBe(0.005)
		expect(fhaAnnualMipRate(300000, 0.85, 30)).toBe(0.005)
		expect(fhaAnnualMipRate(800000, 0.965, 30)).toBe(0.0075)
		expect(fhaAnnualMipRate(800000, 0.9, 30)).toBe(0.007)
		expect(fhaAnnualMipRate(300000, 0.95, 15)).toBe(0.004)
		expect(fhaAnnualMipRate(300000, 0.9, 15)).toBe(0.0015)
		expect(fhaAnnualMipRate(800000, 0.95, 15)).toBe(0.0065)
		expect(fhaAnnualMipRate(800000, 0.85, 15)).toBe(0.004)
		expect(fhaAnnualMipRate(800000, 0.78, 15)).toBe(0.0015)
	})

	test('MIP lasts 11 years at 90% LTV or less, otherwise the full term', () => {
		expect(fhaMipDurationMonths(0.9, 30)).toBe(132)
		expect(fhaMipDurationMonths(0.91, 30)).toBe(360)
		expect(fhaMipDurationMonths(0.85, 10)).toBe(120)
	})

	test('3.5% down: upfront MIP financed, annual MIP for the life of the loan', () => {
		const r = calculateMortgage(inputs({ program: 'fha', downPayment: 12250 }))
		expect(r.baseLoan).toBe(337750)
		expect(r.upfrontFee).toBeCloseTo(337750 * 0.0175, 2)
		expect(r.upfrontFeeLabel).toBe('FHA upfront MIP')
		expect(r.loanAmount).toBeCloseTo(337750 * 1.0175, 1)
		expect(r.mortgageInsuranceLabel).toBe('FHA annual MIP')
		expect(r.mortgageInsuranceEndsAfterPayment).toBeNull()
		// First-year MIP is 0.55% of the average scheduled balance, about
		// 0.55% of the loan amount, and it steps down each year
		expect(r.monthlyMortgageInsurance).toBeGreaterThan(150)
		expect(r.monthlyMortgageInsurance).toBeLessThan(
			(r.loanAmount * 0.0055) / 12
		)
		const [y1, y2] = r.schedule
		expect((y2?.mortgageInsurance ?? 0) < (y1?.mortgageInsurance ?? 0)).toBe(
			true
		)
	})

	test('10% down: MIP ends after 11 years', () => {
		const r = calculateMortgage(inputs({ program: 'fha', downPayment: 35000 }))
		expect(r.mortgageInsuranceEndsAfterPayment).toBe(132)
	})

	test('paying the upfront MIP in cash adds it to cash to close', () => {
		const r = calculateMortgage(
			inputs({ program: 'fha', downPayment: 12250, financeUpfrontFee: false })
		)
		expect(r.loanAmount).toBe(337750)
		expect(r.cashToClose).toBeCloseTo(12250 + 8000 + 337750 * 0.0175, 1)
	})
})

describe('VA loan', () => {
	test('funding fee table, first use and after first use', () => {
		expect(vaFundingFeeRate(0, true)).toBe(0.0215)
		expect(vaFundingFeeRate(0, false)).toBe(0.033)
		expect(vaFundingFeeRate(0.05, true)).toBe(0.015)
		expect(vaFundingFeeRate(0.05, false)).toBe(0.015)
		expect(vaFundingFeeRate(0.1, false)).toBe(0.0125)
	})

	test('zero down, first use: 2.15% fee financed and no monthly insurance', () => {
		const r = calculateMortgage(inputs({ program: 'va', downPayment: 0 }))
		expect(r.upfrontFee).toBeCloseTo(7525, 2)
		expect(r.loanAmount).toBeCloseTo(357525, 2)
		expect(r.monthlyMortgageInsurance).toBe(0)
		expect(r.totalMortgageInsurance).toBe(0)
	})

	test('exempt veterans pay no funding fee', () => {
		const r = calculateMortgage(
			inputs({ program: 'va', downPayment: 0, vaExempt: true })
		)
		expect(r.upfrontFee).toBe(0)
		expect(r.loanAmount).toBe(350000)
	})
})

describe('USDA loan', () => {
	// RD Instruction 440.1 Exhibit K: 1.00% upfront, 0.35% annual.
	// HB-1-3555 16.4: financing the whole fee makes the loan base / (1 - 1%).
	test('zero down, fee financed: total loan is base / 0.99', () => {
		const r = calculateMortgage(
			inputs({ program: 'usda', downPayment: 0, homePrice: 250000 })
		)
		expect(r.loanAmount).toBeCloseTo(250000 / 0.99, 1)
		expect(r.upfrontFee).toBeCloseTo(250000 / 0.99 - 250000, 1)
		expect(r.upfrontFeeLabel).toBe('USDA guarantee fee')
		expect(r.mortgageInsuranceLabel).toBe('USDA annual fee')
		// Life of the loan, stepping down with the scheduled balance
		expect(r.mortgageInsuranceEndsAfterPayment).toBeNull()
		expect(r.monthlyMortgageInsurance).toBeLessThan(
			(r.loanAmount * 0.0035) / 12
		)
		expect(r.monthlyMortgageInsurance).toBeGreaterThan(
			(r.loanAmount * 0.0035 * 0.98) / 12
		)
		const [y1, y2] = r.schedule
		expect((y2?.mortgageInsurance ?? 0) < (y1?.mortgageInsurance ?? 0)).toBe(
			true
		)
	})

	test('paying the guarantee fee at closing: 1% of the base loan', () => {
		const r = calculateMortgage(
			inputs({
				program: 'usda',
				downPayment: 0,
				homePrice: 250000,
				financeUpfrontFee: false
			})
		)
		expect(r.loanAmount).toBe(250000)
		expect(r.upfrontFee).toBe(2500)
		expect(r.cashToClose).toBe(8000 + 2500)
	})

	test('only a 30-year term is allowed', () => {
		expect(() =>
			calculateMortgage(inputs({ program: 'usda', termYears: 15 }))
		).toThrow('USDA guaranteed loans are 30-year fixed. Choose a 30 year term.')
	})
})

describe('validation', () => {
	test('rejects a down payment that covers the price', () => {
		expect(() => calculateMortgage(inputs({ downPayment: 350000 }))).toThrow(
			MortgageInputError
		)
	})

	test('rejects negative values and unsupported terms', () => {
		expect(() => calculateMortgage(inputs({ insuranceAnnual: -1 }))).toThrow(
			'Home insurance must be zero or more.'
		)
		expect(() => calculateMortgage(inputs({ termYears: 40 }))).toThrow(
			MortgageInputError
		)
	})
})
