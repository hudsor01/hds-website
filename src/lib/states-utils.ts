// Native states utilities - logic only, no data bloat

import statesData from '@/data/states.json'
import type { PaystubStateInfo } from '@/types/paystub'

/**
 * Get all states sorted alphabetically
 */
export function getAllStates(): PaystubStateInfo[] {
  const allStates = [...statesData.noIncomeTax, ...statesData.withIncomeTax]
  return allStates.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get states with no income tax
 */
export function getNoIncomeTaxStates(): PaystubStateInfo[] {
  return statesData.noIncomeTax
}

/**
 * Get states with income tax
 */
export function getIncomeTaxStates(): PaystubStateInfo[] {
  return statesData.withIncomeTax
}

/**
 * Get state info by code
 */
export function getStateInfo(code: string): PaystubStateInfo | undefined {
  const allStates = getAllStates()
  return allStates.find((state) => state.code === code)
}

/**
 * Check if state has income tax
 */
export function stateHasIncomeTax(code: string): boolean {
  const state = getStateInfo(code)
  return state?.hasIncomeTax ?? true
}