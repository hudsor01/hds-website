// localStorage utilities for Next.js with SSR safety
import type { StoredFormData } from '@/types/common'
import { logger } from './logger'

const STORAGE_KEY = 'paystub-form-data'

// Check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined'

// Save form data to localStorage
export const saveFormData = (data: StoredFormData): void => {
  if (!isBrowser()) {return}
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    logger.warn('Storage operation failed - save form data', {
      operation: 'save',
      storageKey: STORAGE_KEY,
      dataSize: JSON.stringify(data).length,
      error: error instanceof Error ? error.message : String(error),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    })
  }
}

// Load form data from localStorage
export const loadFormData = (): StoredFormData | null => {
  if (!isBrowser()) {return null}
  
  let stored: string | null = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    logger.warn('Storage operation failed - load form data', {
      operation: 'load',
      storageKey: STORAGE_KEY,
      error: error instanceof Error ? error.message : String(error),
      hasStoredData: !!stored,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    })
    return null
  }
}

// Clear form data from localStorage
export const clearFormData = (): void => {
  if (!isBrowser()) {return}
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    logger.warn('Storage operation failed - clear form data', {
      operation: 'clear',
      storageKey: STORAGE_KEY,
      error: error instanceof Error ? error.message : String(error),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    })
  }
}