import type { FilingStatus, WithholdingInputs } from '@/types/paystub'
import { scheduleTax } from './schedule'
import { getTaxDataForYear } from './tax-data'

type W4 = Pick<
	WithholdingInputs,
	| 'multipleJobs'
	| 'dependentsCredit'
	| 'otherIncome'
	| 'deductions'
	| 'extraWithholding'
>

/**
 * Federal income tax withholding for one pay period: IRS Pub. 15-T
 * Worksheet 1A, percentage method for automated payroll systems, Form W-4
 * 2020 or later.
 *
 * @param wages taxable wages for the period (gross less pre-tax 401(k) and
 *   Section 125 deductions)
 */
export function federalWithholding(
	wages: number,
	periodsPerYear: number,
	filingStatus: FilingStatus,
	w4: W4,
	year: number
): number {
	const data = getTaxDataForYear(year)
	// Step 1: adjusted annual wage amount (lines 1a to 1i)
	const annualWages = wages * periodsPerYear + w4.otherIncome
	const line1g = w4.multipleJobs ? 0 : data.line1g[filingStatus]
	const adjusted = Math.max(0, annualWages - (w4.deductions + line1g))
	// Step 2: tentative withholding (lines 2a to 2h)
	const schedules = w4.multipleJobs
		? data.checkboxSchedules
		: data.standardSchedules
	const tentative =
		scheduleTax(schedules[filingStatus], adjusted) / periodsPerYear
	// Step 3: dependent credits (lines 3a to 3c)
	const afterCredits = Math.max(
		0,
		tentative - w4.dependentsCredit / periodsPerYear
	)
	// Step 4: extra withholding (lines 4a and 4b)
	return afterCredits + w4.extraWithholding
}

/** Employee Social Security tax: 6.2% up to the yearly wage base */
export function socialSecurityTax(
	ficaWages: number,
	ytdFicaWages: number,
	year: number
): number {
	const data = getTaxDataForYear(year)
	const taxable = Math.min(
		ficaWages,
		Math.max(0, data.ssWageBase - ytdFicaWages)
	)
	return taxable * data.ssRate
}

/**
 * Employee Medicare tax: 1.45% of all wages, plus the 0.9% Additional
 * Medicare Tax on wages over $200,000 in the calendar year. Employers
 * withhold it at $200,000 for every filing status (IRS Pub. 15, section 9).
 */
export function medicareTax(
	ficaWages: number,
	ytdFicaWages: number,
	year: number
): number {
	const data = getTaxDataForYear(year)
	const threshold = data.additionalMedicareThreshold
	const overBefore = Math.max(0, ytdFicaWages - threshold)
	const overAfter = Math.max(0, ytdFicaWages + ficaWages - threshold)
	return (
		ficaWages * data.medicareRate +
		(overAfter - overBefore) * data.additionalMedicareRate
	)
}
