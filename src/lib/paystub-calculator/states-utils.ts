// Native states utilities - logic only, no data bloat

import statesData from '@/data/states.json'

// Cache these to prevent creating new arrays on every call
const NO_INCOME_TAX_CODES = ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY']
const NO_INCOME_TAX_STATES_CACHE = statesData.states.filter(state =>
  NO_INCOME_TAX_CODES.includes(state.value)
)
const INCOME_TAX_STATES_CACHE = statesData.states.filter(state =>
  !NO_INCOME_TAX_CODES.includes(state.value)
)

/**
 * Get all states options
 */
export function getAllStatesOptions() {
  return statesData.states
}

/**
 * Get all states sorted alphabetically
 */
export function getAllStates() {
  return statesData.states.sort((a, b) => a.label.localeCompare(b.label))
}

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

/**
 * Get state info by code
 */
export function getStateInfo(code: string) {
  return statesData.states.find((state) => state.value === code)
}

/**
 * Check if state has income tax
 */
export function stateHasIncomeTax(code: string): boolean {
  return !NO_INCOME_TAX_CODES.includes(code)
}