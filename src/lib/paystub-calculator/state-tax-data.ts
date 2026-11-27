import type { PayFrequency } from '@/types/paystub'
import { row, type ScheduleRow } from './schedule'

/**
 * 2026 state payroll withholding constants. Each state uses its own
 * employer formula, not the tax return brackets.
 *
 * - CA: EDD DE 44 Rev. 52 (4-26), Method B Exact Calculation, Tables 1 to 5,
 *   annual payroll period. SDI 1.3%, no wage limit (DE 44 page 2).
 * - NY: NYS-50-T-NYS (1/26), Method II Exact Calculation (annual tables) and
 *   Method III. PFL 0.432% up to $411.91 a year (paidfamilyleave.ny.gov/2026).
 *   Disability 0.5% up to $0.60 a week (WCL section 209).
 * - IL: IL-700-T (R-12/25) automated payroll method: 4.95% after $2,925 per
 *   IL-W-4 line 1 allowance and $1,000 per line 2 allowance.
 * - PA: 3.07% flat on compensation, no allowances (REV-415).
 * - MA: Circular M (Rev. 12/25) percentage method: 5%, plus 4% surtax over
 *   $1,107,750. PFML employee share 0.46% up to the Social Security wage base.
 */
const INCOME_TAX_STATE_CODES = ['CA', 'IL', 'MA', 'NY', 'PA'] as const

export const NO_INCOME_TAX_STATE_CODES = [
	'AK',
	'FL',
	'NV',
	'SD',
	'TN',
	'TX',
	'WA',
	'WY'
] as const

export const CA = {
	lowIncomeExemption: { low: 18896, high: 37791 },
	standardDeduction: { low: 5706, high: 11412 },
	estimatedDeductionAllowance: 1000,
	allowanceCredit: 168.3,
	sdiRate: 0.013,
	schedules: {
		single: [
			row(0, 0, 0.011),
			row(11079, 121.87, 0.022),
			row(26264, 455.94, 0.044),
			row(41452, 1124.21, 0.066),
			row(57542, 2186.15, 0.088),
			row(72724, 3522.17, 0.1023),
			row(371479, 34084.81, 0.1133),
			row(445771, 42502.09, 0.1243),
			row(742953, 79441.81, 0.1353),
			row(1000000, 114220.27, 0.1463)
		],
		married: [
			row(0, 0, 0.011),
			row(22158, 243.74, 0.022),
			row(52528, 911.88, 0.044),
			row(82904, 2248.42, 0.066),
			row(115084, 4372.3, 0.088),
			row(145448, 7044.33, 0.1023),
			row(742958, 68169.6, 0.1133),
			row(891542, 85004.17, 0.1243),
			row(1000000, 98485.5, 0.1353),
			row(1485906, 164228.58, 0.1463)
		],
		headOfHousehold: [
			row(0, 0, 0.011),
			row(22173, 243.9, 0.022),
			row(52530, 911.75, 0.044),
			row(67716, 1579.93, 0.066),
			row(83805, 2641.8, 0.088),
			row(98990, 3978.08, 0.1023),
			row(505208, 45534.18, 0.1133),
			row(606251, 56982.35, 0.1243),
			row(1000000, 105925.35, 0.1353),
			row(1010417, 107334.77, 0.1463)
		]
	} satisfies Record<string, ScheduleRow[]>
} as const

export const NY = {
	deduction: { single: 7400, married: 7950 },
	allowance: 1000,
	methodIIIThreshold: { single: 1077550, married: 2155350 },
	methodIIIRates: [
		{ atLeast: 25000000, rate: 0.117 },
		{ atLeast: 5000000, rate: 0.111 },
		{ atLeast: 0, rate: 0.1045 }
	],
	pflRate: 0.00432,
	pflAnnualMax: 411.91,
	disabilityRate: 0.005,
	disabilityWeeklyMax: 0.6,
	schedules: {
		single: [
			row(0, 0, 0.039),
			row(8500, 332, 0.044),
			row(11700, 472, 0.0515),
			row(13900, 586, 0.054),
			row(80650, 4190, 0.059),
			row(96800, 5143, 0.0703),
			row(107650, 5906, 0.0753),
			row(157650, 9673, 0.064),
			row(215400, 13369, 0.1144),
			row(265400, 19091, 0.0735)
		],
		married: [
			row(0, 0, 0.039),
			row(8500, 332, 0.044),
			row(11700, 472, 0.0515),
			row(13900, 586, 0.054),
			row(80650, 4190, 0.059),
			row(96800, 5143, 0.0657),
			row(107650, 5855, 0.0707),
			row(157650, 9388, 0.0801),
			row(211550, 13708, 0.064),
			row(323200, 20854, 0.1349),
			row(373200, 27600, 0.0735),
			row(1077550, 79369, 0.0765)
		]
	} satisfies Record<string, ScheduleRow[]>
} as const

export const IL = {
	rate: 0.0495,
	basicAllowance: 2925,
	additionalAllowance: 1000
} as const

export const PA = { rate: 0.0307 } as const

export const MA = {
	rate: 0.05,
	surtaxRate: 0.04,
	surtaxThreshold: 1107750,
	ficaDeductionMax: 2000,
	pfmlRate: 0.0046,
	/** Exemption factor per period: one exemption, else perExemption * n + base */
	exemption: {
		weekly: { one: 85, perExemption: 19, base: 66 },
		biweekly: { one: 169, perExemption: 38, base: 131 },
		semimonthly: { one: 183, perExemption: 42, base: 141 },
		monthly: { one: 367, perExemption: 83, base: 284 }
	} satisfies Record<
		PayFrequency,
		{ one: number; perExemption: number; base: number }
	>,
	/** No withholding at or below these wages when claiming 1 or more exemptions */
	noWithholdingAtOrBelow: {
		weekly: 154,
		biweekly: 308,
		semimonthly: 333,
		monthly: 667
	} satisfies Record<PayFrequency, number>,
	headOfHouseholdCredit: {
		weekly: 2.31,
		biweekly: 4.62,
		semimonthly: 5,
		monthly: 10
	} satisfies Record<PayFrequency, number>
} as const

/** Weeks in each pay period, for the NY disability weekly cap */
export const WEEKS_PER_PERIOD: Record<PayFrequency, number> = {
	weekly: 1,
	biweekly: 2,
	semimonthly: 52 / 24,
	monthly: 52 / 12
}

export function getSupportedIncomeTaxStateCodes(): string[] {
	return [...INCOME_TAX_STATE_CODES]
}
