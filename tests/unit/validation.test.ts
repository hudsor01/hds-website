import { describe, test, expect } from 'vitest'
import {
  validateEmployeeName,
  validateHourlyRate,
  validateHoursPerPeriod,
  validateForm
} from '../../src/lib/validation'

describe('Validation Utilities', () => {
  describe('validateEmployeeName', () => {
    test('should validate valid employee names', () => {
      expect(validateEmployeeName('John Doe')).toEqual({ isValid: true })
      expect(validateEmployeeName('Jane Smith-Johnson')).toEqual({ isValid: true })
      expect(validateEmployeeName('A B')).toEqual({ isValid: true })
    })

    test('should reject empty or whitespace-only names', () => {
      expect(validateEmployeeName('')).toEqual({
        isValid: false,
        message: 'Employee name is required'
      })
      expect(validateEmployeeName('   ')).toEqual({
        isValid: false,
        message: 'Employee name is required'
      })
    })

    test('should reject names that are too short', () => {
      expect(validateEmployeeName('A')).toEqual({
        isValid: false,
        message: 'Employee name must be at least 2 characters'
      })
      expect(validateEmployeeName(' A ')).toEqual({
        isValid: false,
        message: 'Employee name must be at least 2 characters'
      })
    })
  })

  describe('validateHourlyRate', () => {
    test('should validate reasonable hourly rates', () => {
      expect(validateHourlyRate(15.50)).toEqual({ isValid: true })
      expect(validateHourlyRate(25)).toEqual({ isValid: true })
      expect(validateHourlyRate(100)).toEqual({ isValid: true })
      expect(validateHourlyRate(999.99)).toEqual({ isValid: true })
    })

    test('should reject zero or negative rates', () => {
      expect(validateHourlyRate(0)).toEqual({
        isValid: false,
        message: 'Hourly rate is required and must be greater than $0'
      })
      expect(validateHourlyRate(-5)).toEqual({
        isValid: false,
        message: 'Hourly rate is required and must be greater than $0'
      })
    })

    test('should reject unusually high rates', () => {
      expect(validateHourlyRate(1001)).toEqual({
        isValid: false,
        message: 'Hourly rate seems unusually high (over $1,000)'
      })
    })
  })

  describe('validateHoursPerPeriod', () => {
    test('should validate reasonable hours per period', () => {
      expect(validateHoursPerPeriod(40)).toEqual({ isValid: true })
      expect(validateHoursPerPeriod(80)).toEqual({ isValid: true })
      expect(validateHoursPerPeriod(1)).toEqual({ isValid: true })
      expect(validateHoursPerPeriod(200)).toEqual({ isValid: true })
    })

    test('should reject zero or negative hours', () => {
      expect(validateHoursPerPeriod(0)).toEqual({
        isValid: false,
        message: 'Hours per pay period is required and must be greater than 0'
      })
      expect(validateHoursPerPeriod(-10)).toEqual({
        isValid: false,
        message: 'Hours per pay period is required and must be greater than 0'
      })
    })

    test('should reject unusually high hours', () => {
      expect(validateHoursPerPeriod(201)).toEqual({
        isValid: false,
        message: 'Hours per period seems unusually high (over 200)'
      })
    })
  })

  describe('validateForm', () => {
    test('should validate a complete valid form', () => {
      const validData = {
        employeeName: 'John Doe',
        hourlyRate: 25.50,
        hoursPerPeriod: 80
      }
      
      const result = validateForm(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    test('should return all validation errors for invalid form', () => {
      const invalidData = {
        employeeName: '',
        hourlyRate: 0,
        hoursPerPeriod: -5
      }
      
      const result = validateForm(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors.employeeName).toBe('Employee name is required')
      expect(result.errors.hourlyRate).toBe('Hourly rate is required and must be greater than $0')
      expect(result.errors.hoursPerPeriod).toBe('Hours per pay period is required and must be greater than 0')
    })

    test('should return partial errors for partially invalid form', () => {
      const partiallyInvalidData = {
        employeeName: 'John Doe',
        hourlyRate: 1500, // Too high
        hoursPerPeriod: 80
      }
      
      const result = validateForm(partiallyInvalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors.employeeName).toBeUndefined()
      expect(result.errors.hourlyRate).toBe('Hourly rate seems unusually high (over $1,000)')
      expect(result.errors.hoursPerPeriod).toBeUndefined()
    })
  })
})