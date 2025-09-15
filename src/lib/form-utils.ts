// Native form utilities - logic only, no data bloat

import formOptions from '@/data/form-options.json'

/**
 * Get form options by type
 */
export function getFormOptions(type: keyof typeof formOptions) {
  return formOptions[type]
}

/**
 * Get service options for dropdowns
 */
export function getServiceOptions() {
  return formOptions.services
}

/**
 * Get budget options for dropdowns
 */
export function getBudgetOptions() {
  return formOptions.budget
}

/**
 * Get timeline options for dropdowns
 */
export function getTimelineOptions() {
  return formOptions.timeline
}

/**
 * Get contact time options for dropdowns
 */
export function getContactTimeOptions() {
  return formOptions.contactTime
}