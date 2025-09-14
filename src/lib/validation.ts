// Paystub generator validation utilities
import type { PaystubValidationResult } from '@/types/paystub';
import type { FormErrors } from '@/types/common';

// =============================================================================
// PAYSTUB GENERATOR VALIDATION
// =============================================================================

// Validate employee name
export const validateEmployeeName = (value: string): PaystubValidationResult => {
  if (!value.trim()) {
    return { isValid: false, message: 'Employee name is required' }
  }
  if (value.trim().length < 2) {
    return { isValid: false, message: 'Employee name must be at least 2 characters' }
  }
  return { isValid: true }
}

// Validate hourly rate
export const validateHourlyRate = (value: number): PaystubValidationResult => {
  if (!value || value <= 0) {
    return { isValid: false, message: 'Hourly rate is required and must be greater than $0' }
  }
  if (value > 1000) {
    return { isValid: false, message: 'Hourly rate seems unusually high (over $1,000)' }
  }
  return { isValid: true }
}

// Validate hours per period
export const validateHoursPerPeriod = (value: number): PaystubValidationResult => {
  if (!value || value <= 0) {
    return { isValid: false, message: 'Hours per pay period is required and must be greater than 0' }
  }
  if (value > 200) {
    return { isValid: false, message: 'Hours per period seems unusually high (over 200)' }
  }
  return { isValid: true }
}

// Validate entire paystub form
export const validateForm = (data: {
  employeeName: string
  hourlyRate: number
  hoursPerPeriod: number
}): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {}
  let isValid = true

  const nameResult = validateEmployeeName(data.employeeName)
  if (!nameResult.isValid) {
    errors.employeeName = nameResult.message
    isValid = false
  }

  const rateResult = validateHourlyRate(data.hourlyRate)
  if (!rateResult.isValid) {
    errors.hourlyRate = rateResult.message
    isValid = false
  }

  const hoursResult = validateHoursPerPeriod(data.hoursPerPeriod)
  if (!hoursResult.isValid) {
    errors.hoursPerPeriod = hoursResult.message
    isValid = false
  }

  return { isValid, errors }
}