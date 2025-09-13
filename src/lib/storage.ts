// localStorage utilities for Next.js with SSR safety
import type { StoredFormData } from '@/types/storage'

const STORAGE_KEY = 'paystub-form-data'

// Check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined'

// Save form data to localStorage
export const saveFormData = (data: StoredFormData): void => {
  if (!isBrowser()) return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save form data to localStorage:', error)
  }
}

// Load form data from localStorage
export const loadFormData = (): StoredFormData | null => {
  if (!isBrowser()) return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn('Failed to load form data from localStorage:', error)
    return null
  }
}

// Clear form data from localStorage
export const clearFormData = (): void => {
  if (!isBrowser()) return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear form data from localStorage:', error)
  }
}