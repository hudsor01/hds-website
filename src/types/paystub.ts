/**
 * Consolidated Paystub-Related Types
 */

export type FilingStatus =
	| 'single'
	| 'marriedJoint'
	| 'marriedSeparate'
	| 'headOfHousehold'
	| 'qualifyingSurvivingSpouse'

export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly'

export const FILING_STATUSES = [
	'single',
	'marriedJoint',
	'marriedSeparate',
	'headOfHousehold',
	'qualifyingSurvivingSpouse'
] as const satisfies FilingStatus[]

interface TaxBracket {
	limit: number
	rate: number
}

export interface TaxData {
	ssWageBase: number
	ssRate: number
	medicareRate: number
	additionalMedicareRate: number
	additionalMedicareThreshold: {
		single: number
		marriedJoint: number
		marriedSeparate: number
		headOfHousehold: number
		qualifyingSurvivingSpouse: number
	}
	federalBrackets: {
		single: TaxBracket[]
		marriedJoint: TaxBracket[]
		marriedSeparate: TaxBracket[]
		headOfHousehold: TaxBracket[]
		qualifyingSurvivingSpouse: TaxBracket[]
	}
}

export interface PayPeriod {
	period: number
	payDate: string
	hours: number
	grossPay: number
	federalTax: number
	socialSecurity: number
	medicare: number
	stateTax: number
	otherDeductions: number
	netPay: number
}

export interface PaystubData {
	employeeName: string
	employeeId: string
	employerName: string
	hourlyRate: number
	hoursPerPeriod: number
	filingStatus: FilingStatus
	taxYear: number
	payPeriods: PayPeriod[]
	totals: {
		hours: number
		grossPay: number
		federalTax: number
		socialSecurity: number
		medicare: number
		stateTax: number
		otherDeductions: number
		netPay: number
	}
}
