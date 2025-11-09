// Native states utilities - logic only, no data bloat

import statesData from '@/data/states.json'

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
  // This would need to be expanded with actual tax data
  return statesData.states.filter(state =>
    ['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY'].includes(state.value)
  )
}

/**
 * Get states with income tax
 */
export function getIncomeTaxStates() {
  return statesData.states.filter(state =>
    !['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY'].includes(state.value)
  )
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
  return !['AK', 'FL', 'NV', 'SD', 'TN', 'TX', 'WA', 'WY'].includes(code)
}