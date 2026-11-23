/**
 * Consolidated Paystub-Related Types
 */

export type FilingStatus = 'single' | 'marriedJoint' | 'headOfHousehold'

export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly'

// The three filing statuses on the 2026 Form W-4, Step 1(c)
export const FILING_STATUSES = [
	'single',
	'marriedJoint',
	'headOfHousehold'
] as const satisfies FilingStatus[]

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
	single: 'Single or married filing separately',
	marriedJoint: 'Married filing jointly or qualifying surviving spouse',
	headOfHousehold: 'Head of household'
}

export const PAY_PERIODS_PER_YEAR: Record<PayFrequency, number> = {
	weekly: 52,
	biweekly: 26,
	semimonthly: 24,
	monthly: 12
}

/** Form W-4, pre-tax deductions and state withholding certificate entries */
export interface WithholdingInputs {
	/** W-4 Step 2(c): multiple jobs or a working spouse */
	multipleJobs: boolean
	/** W-4 Step 3: yearly credit for dependents */
	dependentsCredit: number
	/** W-4 Step 4(a): yearly other income */
	otherIncome: number
	/** W-4 Step 4(b): yearly deductions */
	deductions: number
	/** W-4 Step 4(c): extra federal withholding per pay period */
	extraWithholding: number
	/** Traditional 401(k) or 403(b) contribution per pay period */
	retirementPerPeriod: number
	/** Section 125 health, dental and vision premiums per pay period */
	healthPerPeriod: number
	/** CA DE 4 regular allowances, NY IT-2104 allowances, IL-W-4 line 1, MA M-4 exemptions */
	stateAllowances: number
	/** CA DE 4 estimated deduction allowances or IL-W-4 line 2 allowances */
	stateAdditionalAllowances: number
}

export const DEFAULT_WITHHOLDING: WithholdingInputs = {
	multipleJobs: false,
	dependentsCredit: 0,
	otherIncome: 0,
	deductions: 0,
	extraWithholding: 0,
	retirementPerPeriod: 0,
	healthPerPeriod: 0,
	stateAllowances: 1,
	stateAdditionalAllowances: 0
}

export interface PayPeriod {
	period: number
	payDate: string
	hours: number
	grossPay: number
	preTaxDeductions: number
	federalTax: number
	socialSecurity: number
	medicare: number
	stateTax: number
	stateInsurance: number
	otherDeductions: number
	netPay: number
}

export type PaystubTotals = Omit<PayPeriod, 'period' | 'payDate'>

export interface PaystubData {
	employeeName: string
	employeeId: string
	employerName: string
	hourlyRate: number
	hoursPerPeriod: number
	filingStatus: FilingStatus
	taxYear: number
	payPeriods: PayPeriod[]
	totals: PaystubTotals
}
