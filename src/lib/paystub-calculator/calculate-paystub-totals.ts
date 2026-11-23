import {
	DEFAULT_WITHHOLDING,
	type FilingStatus,
	PAY_PERIODS_PER_YEAR,
	type PayFrequency,
	type PayPeriod,
	type PaystubTotals,
	type WithholdingInputs
} from '@/types/paystub'
import { roundCents } from './schedule'
import { calculateStatePeriod, EMPTY_STATE_YTD } from './state-tax-calculations'
import {
	federalWithholding,
	medicareTax,
	socialSecurityTax
} from './tax-calculations'
import { getTaxDataForYear } from './tax-data'
import { validatePaystubInputs } from './validation'

export interface PaystubCalculationParams {
	hourlyRate: number
	hoursPerPeriod: number
	filingStatus: FilingStatus
	taxYear: number
	state: string
	payFrequency: PayFrequency
	overtimeHours?: number
	overtimeRate?: number
	/** Post-tax deductions per pay period */
	additionalDeductions?: Array<{ name: string; amount: number }>
	withholding?: WithholdingInputs
}

export interface PaystubCalculationResult {
	payPeriods: PayPeriod[]
	totals: PaystubTotals
}

export const calculatePaystubTotals = (
	params: PaystubCalculationParams
): PaystubCalculationResult => {
	const {
		hourlyRate,
		hoursPerPeriod,
		filingStatus,
		taxYear,
		state,
		payFrequency,
		overtimeHours = 0,
		overtimeRate = hourlyRate * 1.5,
		additionalDeductions = [],
		withholding = DEFAULT_WITHHOLDING
	} = params

	const validation = validatePaystubInputs(params)
	if (!validation.isValid) {
		const message = `Invalid paystub inputs: ${Object.values(validation.errors).join(', ')}`
		throw new Error(message)
	}

	const payPeriodsCount = PAY_PERIODS_PER_YEAR[payFrequency]
	const { ssWageBase } = getTaxDataForYear(taxYear)

	// Generate pay dates
	const generatePayDates = (frequency: typeof payFrequency) => {
		const dates: Date[] = []
		const year = taxYear

		switch (frequency) {
			case 'weekly': {
				// Start from January 1st and generate weekly pay dates
				const currentDate = new Date(year, 0, 1) // Jan 1
				// Find the first Monday of the year
				while (currentDate.getDay() !== 1) {
					// 1 = Monday
					currentDate.setDate(currentDate.getDate() + 1)
				}
				for (let i = 0; i < 52; i++) {
					dates.push(new Date(currentDate))
					currentDate.setDate(currentDate.getDate() + 7)
				}
				break
			}
			case 'biweekly': {
				// Start from January 1st and generate bi-weekly pay dates
				const biweeklyDate = new Date(year, 0, 1)
				// Find the first payday (every other Monday)
				while (biweeklyDate.getDay() !== 1) {
					// 1 = Monday
					biweeklyDate.setDate(biweeklyDate.getDate() + 1)
				}
				for (let i = 0; i < 26; i++) {
					dates.push(new Date(biweeklyDate))
					biweeklyDate.setDate(biweeklyDate.getDate() + 14)
				}
				break
			}
			case 'semimonthly':
				for (let month = 0; month < 12; month++) {
					// 15th of each month
					dates.push(new Date(year, month, 15))
					// Last day of each month (account for different month lengths)
					const lastDay = new Date(year, month + 1, 0).getDate()
					dates.push(new Date(year, month, lastDay))
				}
				break
			case 'monthly':
				for (let month = 0; month < 12; month++) {
					// Typically on the last business day of the month
					const lastDay = new Date(year, month + 1, 0) // Last day of the month
					// Adjust to Friday if the last day falls on a weekend
					const adjustedDate = new Date(lastDay)
					if (adjustedDate.getDay() === 0) {
						// Sunday
						adjustedDate.setDate(adjustedDate.getDate() - 2) // Previous Friday
					} else if (adjustedDate.getDay() === 6) {
						// Saturday
						adjustedDate.setDate(adjustedDate.getDate() - 1) // Previous Friday
					}
					dates.push(adjustedDate)
				}
				break
		}
		return dates
	}

	const payDates = generatePayDates(payFrequency).slice(0, payPeriodsCount)
	const payPeriods: PayPeriod[] = []
	const totals: PaystubTotals = {
		hours: 0,
		grossPay: 0,
		preTaxDeductions: 0,
		federalTax: 0,
		socialSecurity: 0,
		medicare: 0,
		stateTax: 0,
		stateInsurance: 0,
		otherDeductions: 0,
		netPay: 0
	}
	let ytdFicaWages = 0
	let stateYtd = EMPTY_STATE_YTD

	// Every period has the same pay; only the yearly caps (Social Security
	// wage base, Additional Medicare threshold, state caps) change over the year.
	const grossPay = roundCents(
		hourlyRate * hoursPerPeriod + overtimeHours * overtimeRate
	)
	const retirement = withholding.retirementPerPeriod
	const health = withholding.healthPerPeriod
	const preTaxDeductions = roundCents(retirement + health)
	const federalWages = grossPay - retirement - health
	const ficaWages = grossPay - health
	const otherDeductions = roundCents(
		additionalDeductions.reduce((sum, d) => sum + d.amount, 0)
	)

	for (let i = 0; i < payPeriodsCount; i++) {
		const federalTax = roundCents(
			federalWithholding(
				federalWages,
				payPeriodsCount,
				filingStatus,
				withholding,
				taxYear
			)
		)
		const socialSecurity = roundCents(
			socialSecurityTax(ficaWages, ytdFicaWages, taxYear)
		)
		const medicare = roundCents(medicareTax(ficaWages, ytdFicaWages, taxYear))
		const statePeriod = calculateStatePeriod(
			{
				state,
				filingStatus,
				payFrequency,
				grossPay,
				retirement,
				health,
				ficaTax: socialSecurity + medicare,
				allowances: withholding.stateAllowances,
				additionalAllowances: withholding.stateAdditionalAllowances
			},
			stateYtd,
			ssWageBase
		)
		stateYtd = statePeriod.ytd
		const stateTax = roundCents(statePeriod.incomeTax)
		const stateInsurance = roundCents(statePeriod.insurance)

		const netPay = roundCents(
			grossPay -
				preTaxDeductions -
				federalTax -
				socialSecurity -
				medicare -
				stateTax -
				stateInsurance -
				otherDeductions
		)
		const hours = hoursPerPeriod + overtimeHours

		payPeriods.push({
			period: i + 1,
			payDate: payDates[i]?.toISOString() || new Date().toISOString(),
			hours,
			grossPay,
			preTaxDeductions,
			federalTax,
			socialSecurity,
			medicare,
			stateTax,
			stateInsurance,
			otherDeductions,
			netPay
		})

		ytdFicaWages += ficaWages
		totals.hours += hours
		totals.grossPay += grossPay
		totals.preTaxDeductions += preTaxDeductions
		totals.federalTax += federalTax
		totals.socialSecurity += socialSecurity
		totals.medicare += medicare
		totals.stateTax += stateTax
		totals.stateInsurance += stateInsurance
		totals.otherDeductions += otherDeductions
		totals.netPay += netPay
	}

	for (const key of Object.keys(totals) as Array<keyof PaystubTotals>) {
		totals[key] = roundCents(totals[key])
	}

	return { payPeriods, totals }
}
