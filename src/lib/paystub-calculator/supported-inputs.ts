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
