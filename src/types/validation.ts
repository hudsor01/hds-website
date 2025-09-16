// Form validation types

export interface FormValidationResult {
  isValid: boolean
  message?: string
}

export interface FormErrors {
  employeeName?: string
  hourlyRate?: string
  hoursPerPeriod?: string
}