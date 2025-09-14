/**
 * Common types shared across multiple modules
 * Consolidates duplicate type definitions to follow DRY principles
 */

// Form-related common types
export interface FormErrors {
  employeeName?: string
  hourlyRate?: string
  hoursPerPeriod?: string
}

// Touch interaction types
export interface TouchState {
  isTouching: boolean
  touchStart: { x: number; y: number } | null
  touchEnd: { x: number; y: number } | null
  swipeDirection: "left" | "right" | "up" | "down" | null
}

// Storage types
export interface StoredFormData {
  employeeName: string
  employeeId: string
  employerName: string
  hourlyRate: number
  hoursPerPeriod: number
  filingStatus: string
  taxYear: number
  state?: string
}