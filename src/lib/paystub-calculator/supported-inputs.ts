import {
	DEFAULT_WITHHOLDING,
	type FilingStatus,
	type WithholdingInputs
} from '@/types/paystub'
import { getIncomeTaxStates, getNoIncomeTaxStates } from './states-utils'
import { getSupportedTaxYears } from './tax-data'

// PAYSTUB-10: the full supported-state allow-list (income-tax + no-income-tax codes).
// nuqs passes a shared ?state=AL through unchanged, so the URL-restore path must
// intersect against this set; an unsupported code is dropped rather than applied,
// so it can never reach calculateStateTax's defensive $0 and present a silent zero.
// Single source of truth shared by both restore paths (URL + localStorage).
export const SUPPORTED_STATE_CODES: Set<string> = new Set(
	[...getIncomeTaxStates(), ...getNoIncomeTaxStates()].map(state => state.value)
)

// Case-insensitive membership check; restore paths pass raw query/storage strings.
export function isSupportedStateCode(code: string): boolean {
	return SUPPORTED_STATE_CODES.has(code.toUpperCase())
}

// Year is "supported" only when it has backing tax data (getSupportedTaxYears).
// A stale ?year=2024 or localStorage taxYear:2024 fails this and is clamped.
export function isSupportedTaxYear(year: number): boolean {
	return getSupportedTaxYears().includes(year)
}

// Maps a restored filing status onto the three Form W-4 statuses. Older saved
// forms and shared links used five return statuses; married filing
// separately withholds as single and a qualifying surviving spouse as married
// filing jointly (Form W-4 Step 1(c)).
const FILING_STATUS_ALIASES: Record<string, FilingStatus> = {
	single: 'single',
	marriedSeparate: 'single',
	marriedJoint: 'marriedJoint',
	qualifyingSurvivingSpouse: 'marriedJoint',
	headOfHousehold: 'headOfHousehold'
}

export function normalizeFilingStatus(value: unknown): FilingStatus | null {
	return typeof value === 'string'
		? (FILING_STATUS_ALIASES[value] ?? null)
		: null
}

// Restores saved withholding entries field by field, keeping the default for
// anything missing or malformed so a hand-edited or stale entry cannot reach
// the calculation.
export function restoreWithholding(saved: unknown): WithholdingInputs {
	if (!saved || typeof saved !== 'object') {
		return DEFAULT_WITHHOLDING
	}
	const source = saved as Record<string, unknown>
	const result: WithholdingInputs = { ...DEFAULT_WITHHOLDING }
	for (const key of Object.keys(DEFAULT_WITHHOLDING) as Array<
		keyof WithholdingInputs
	>) {
		const value = source[key]
		if (key === 'multipleJobs') {
			if (typeof value === 'boolean') {
				result.multipleJobs = value
			}
		} else if (
			typeof value === 'number' &&
			Number.isFinite(value) &&
			value >= 0
		) {
			result[key] = value
		}
	}
	return result
}
