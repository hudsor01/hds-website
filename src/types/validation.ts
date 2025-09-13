// Form validation types

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export interface FormErrors {
  employeeName?: string
  hourlyRate?: string
  hoursPerPeriod?: string
}