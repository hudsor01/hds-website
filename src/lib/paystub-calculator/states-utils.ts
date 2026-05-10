// Native states utilities - logic only, no data bloat

import statesData from '@/data/states.json'

const NO_INCOME_TAX_CODES = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY']
const NO_INCOME_TAX_STATES_CACHE = statesData.states.filter(state =>
	NO_INCOME_TAX_CODES.includes(state.value)
)
const INCOME_TAX_STATES_CACHE = statesData.states.filter(
	state => !NO_INCOME_TAX_CODES.includes(state.value)
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
