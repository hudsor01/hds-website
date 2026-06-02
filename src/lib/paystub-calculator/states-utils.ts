// Native states utilities - logic only, no data bloat

import statesData from '@/data/states.json'
import { getSupportedIncomeTaxStateCodes } from './state-tax-data'

const NO_INCOME_TAX_CODES = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY']
const NO_INCOME_TAX_STATES_CACHE = statesData.states.filter(state =>
	NO_INCOME_TAX_CODES.includes(state.value)
)
// Single source of truth: the selectable income-tax states are exactly the codes
// that have bracket data (getSupportedIncomeTaxStateCodes), mapped to states.json
// labels. Deriving here (instead of "all states minus the no-tax codes") keeps the
// dropdown in lockstep with the data so it can never offer a state with no brackets.
const SUPPORTED_INCOME_TAX_CODES = new Set(getSupportedIncomeTaxStateCodes())
const INCOME_TAX_STATES_CACHE = statesData.states.filter(state =>
	SUPPORTED_INCOME_TAX_CODES.has(state.value)
)

/**
 * Get states with no income tax
 */
export function getNoIncomeTaxStates() {
	return NO_INCOME_TAX_STATES_CACHE
}

/**
 * Get states with income tax
 */
export function getIncomeTaxStates() {
	return INCOME_TAX_STATES_CACHE
}
