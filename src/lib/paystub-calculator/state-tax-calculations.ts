import {
	type FilingStatus,
	PAY_PERIODS_PER_YEAR,
	type PayFrequency
} from '@/types/paystub'
import { scheduleTax } from './schedule'
import { CA, IL, MA, NY, PA, WEEKS_PER_PERIOD } from './state-tax-data'

export interface StatePeriodInput {
	state: string
	filingStatus: FilingStatus
	payFrequency: PayFrequency
	grossPay: number
	retirement: number
	health: number
	/** Social Security and Medicare withheld this period (MA deducts them) */
	ficaTax: number
	allowances: number
	additionalAllowances: number
}

/** Running totals the yearly caps depend on */
export interface StateYearToDate {
	maFicaDeducted: number
	maPfmlWages: number
	nyPflPaid: number
}

export const EMPTY_STATE_YTD: StateYearToDate = {
	maFicaDeducted: 0,
	maPfmlWages: 0,
	nyPflPaid: 0
}

export interface StatePeriodResult {
	incomeTax: number
	insurance: number
	ytd: StateYearToDate
}

const STATE_INSURANCE_LABELS: Record<string, string> = {
	CA: 'CA SDI',
	NY: 'NY paid family leave and disability',
	MA: 'MA paid family and medical leave'
}

/** Label for the state payroll insurance line, or '' when the state has none */
export function stateInsuranceLabel(state: string): string {
	return STATE_INSURANCE_LABELS[state.toUpperCase()] ?? ''
}

export function calculateStatePeriod(
	input: StatePeriodInput,
	ytd: StateYearToDate,
	ssWageBase: number
): StatePeriodResult {
	const state = input.state.toUpperCase()
	// 401(k) deferrals reduce state withholding wages everywhere but PA
	// (REV-415). Section 125 premiums reduce them in all five states.
	const incomeTaxWages = input.grossPay - input.retirement - input.health
	const ficaWages = input.grossPay - input.health

	switch (state) {
		case 'CA':
			return {
				incomeTax: california(input, incomeTaxWages),
				// SDI applies to 401(k) deferrals but not Section 125 premiums
				insurance: ficaWages * CA.sdiRate,
				ytd
			}
		case 'NY': {
			const pfl = Math.min(
				input.grossPay * NY.pflRate,
				Math.max(0, NY.pflAnnualMax - ytd.nyPflPaid)
			)
			const disability = Math.min(
				input.grossPay * NY.disabilityRate,
				NY.disabilityWeeklyMax * WEEKS_PER_PERIOD[input.payFrequency]
			)
			return {
				incomeTax: newYork(input, incomeTaxWages),
				insurance: pfl + disability,
				ytd: { ...ytd, nyPflPaid: ytd.nyPflPaid + pfl }
			}
		}
		case 'IL':
			return { incomeTax: illinois(input, incomeTaxWages), insurance: 0, ytd }
		case 'PA':
			return {
				incomeTax: (input.grossPay - input.health) * PA.rate,
				insurance: 0,
				ytd
			}
		case 'MA': {
			const ficaDeduction = Math.min(
				input.ficaTax,
				Math.max(0, MA.ficaDeductionMax - ytd.maFicaDeducted)
			)
			const pfmlWages = Math.min(
				ficaWages,
				Math.max(0, ssWageBase - ytd.maPfmlWages)
			)
			return {
				incomeTax: massachusetts(input, incomeTaxWages, ficaDeduction),
				insurance: pfmlWages * MA.pfmlRate,
				ytd: {
					...ytd,
					maFicaDeducted: ytd.maFicaDeducted + ficaDeduction,
					maPfmlWages: ytd.maPfmlWages + pfmlWages
				}
			}
		}
		default:
			return { incomeTax: 0, insurance: 0, ytd }
	}
}

/** DE 44 Method B, annualized (DE 44 Examples E and F) */
function california(input: StatePeriodInput, wages: number): number {
	const periods = PAY_PERIODS_PER_YEAR[input.payFrequency]
	const annual = wages * periods
	const married = input.filingStatus === 'marriedJoint'
	const hoh = input.filingStatus === 'headOfHousehold'
	const totalAllowances = input.allowances + input.additionalAllowances
	const highTier = hoh || (married && totalAllowances >= 2)
	// Step 1: low income exemption
	const lowIncome = highTier
		? CA.lowIncomeExemption.high
		: CA.lowIncomeExemption.low
	if (annual <= lowIncome) {
		return 0
	}
	// Steps 2 and 3: estimated deduction allowances, then the standard deduction
	const standard = highTier
		? CA.standardDeduction.high
		: CA.standardDeduction.low
	const taxable =
		annual -
		input.additionalAllowances * CA.estimatedDeductionAllowance -
		standard
	// Step 4: tax rate table
	const schedule = hoh
		? CA.schedules.headOfHousehold
		: married
			? CA.schedules.married
			: CA.schedules.single
	// Step 5: exemption allowance credit for regular allowances only
	const tax =
		scheduleTax(schedule, taxable) - input.allowances * CA.allowanceCredit
	return Math.max(0, tax) / periods
}

/** NYS-50-T-NYS Method II on annual tables, Method III at the top */
function newYork(input: StatePeriodInput, wages: number): number {
	const periods = PAY_PERIODS_PER_YEAR[input.payFrequency]
	// Head of household uses the single tables (IT-2104)
	const status = input.filingStatus === 'marriedJoint' ? 'married' : 'single'
	const net =
		wages * periods - NY.deduction[status] - input.allowances * NY.allowance
	if (net <= 0) {
		return 0
	}
	if (net >= NY.methodIIIThreshold[status]) {
		const rate = NY.methodIIIRates.find(r => net >= r.atLeast)?.rate ?? 0
		return (net * rate) / periods
	}
	return scheduleTax(NY.schedules[status], net) / periods
}

/** IL-700-T automated payroll method */
function illinois(input: StatePeriodInput, wages: number): number {
	const periods = PAY_PERIODS_PER_YEAR[input.payFrequency]
	const exemptions =
		(input.allowances * IL.basicAllowance +
			input.additionalAllowances * IL.additionalAllowance) /
		periods
	return Math.max(0, wages - exemptions) * IL.rate
}

/** Circular M percentage method */
function massachusetts(
	input: StatePeriodInput,
	wages: number,
	ficaDeduction: number
): number {
	const frequency = input.payFrequency
	const periods = PAY_PERIODS_PER_YEAR[frequency]
	const n = input.allowances
	if (n >= 1 && wages <= MA.noWithholdingAtOrBelow[frequency]) {
		return 0
	}
	const factor = MA.exemption[frequency]
	const exemption =
		n === 0 ? 0 : n === 1 ? factor.one : factor.perExemption * n + factor.base
	const annual = Math.max(0, wages - ficaDeduction - exemption) * periods
	const tax =
		annual * MA.rate + Math.max(0, annual - MA.surtaxThreshold) * MA.surtaxRate
	const credit =
		input.filingStatus === 'headOfHousehold'
			? MA.headOfHouseholdCredit[frequency]
			: 0
	return Math.max(0, tax / periods - credit)
}
