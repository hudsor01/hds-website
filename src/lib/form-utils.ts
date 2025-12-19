// Native form utilities - logic only, no data bloat

import formOptions from '@/data/form-options.json'

/**
 * Get form options by type
 */
export function getFormOptions(type: keyof typeof formOptions) {
  return formOptions[type]
}