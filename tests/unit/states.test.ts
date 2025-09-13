import { describe, test, expect } from 'vitest'
import {
  NO_INCOME_TAX_STATES,
  INCOME_TAX_STATES,
  ALL_STATES,
  getStateInfo
} from '../../src/lib/states'

describe('States Data', () => {
  test('should have correct number of no-income-tax states', () => {
    expect(NO_INCOME_TAX_STATES).toHaveLength(9)
    
    // Verify all states are marked as having no income tax
    NO_INCOME_TAX_STATES.forEach(state => {
      expect(state.hasIncomeTax).toBe(false)
      expect(state.name).toBeTruthy()
      expect(state.code).toBeTruthy()
      expect(state.code).toHaveLength(2)
    })
  })

  test('should include all expected no-income-tax states', () => {
    const expectedStates = ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY']
    const actualCodes = NO_INCOME_TAX_STATES.map(state => state.code)
    
    expectedStates.forEach(code => {
      expect(actualCodes).toContain(code)
    })
  })

  test('should have correct number of income-tax states', () => {
    expect(INCOME_TAX_STATES).toHaveLength(42) // 41 states + DC
    
    // Verify all states are marked as having income tax
    INCOME_TAX_STATES.forEach(state => {
      expect(state.hasIncomeTax).toBe(true)
      expect(state.name).toBeTruthy()
      expect(state.code).toBeTruthy()
      expect(state.code).toHaveLength(2)
    })
  })

  test('should include DC in income tax states', () => {
    const dcState = INCOME_TAX_STATES.find(state => state.code === 'DC')
    expect(dcState).toBeDefined()
    expect(dcState?.name).toBe('District of Columbia')
    expect(dcState?.hasIncomeTax).toBe(true)
  })

  test('should have all 50 states + DC in combined list', () => {
    expect(ALL_STATES).toHaveLength(51) // 50 states + DC
    
    // Verify no duplicates
    const codes = ALL_STATES.map(state => state.code)
    const uniqueCodes = new Set(codes)
    expect(uniqueCodes.size).toBe(51)
  })

  test('should have states sorted alphabetically in ALL_STATES', () => {
    const stateNames = ALL_STATES.map(state => state.name)
    const sortedNames = [...stateNames].sort()
    expect(stateNames).toEqual(sortedNames)
  })

  test('should find state info by code', () => {
    // Test no-income-tax state
    const florida = getStateInfo('FL')
    expect(florida).toBeDefined()
    expect(florida?.name).toBe('Florida')
    expect(florida?.code).toBe('FL')
    expect(florida?.hasIncomeTax).toBe(false)

    // Test income-tax state
    const california = getStateInfo('CA')
    expect(california).toBeDefined()
    expect(california?.name).toBe('California')
    expect(california?.code).toBe('CA')
    expect(california?.hasIncomeTax).toBe(true)

    // Test DC
    const dc = getStateInfo('DC')
    expect(dc).toBeDefined()
    expect(dc?.name).toBe('District of Columbia')
    expect(dc?.code).toBe('DC')
    expect(dc?.hasIncomeTax).toBe(true)
  })

  test('should return undefined for invalid state codes', () => {
    expect(getStateInfo('XX')).toBeUndefined()
    expect(getStateInfo('')).toBeUndefined()
    expect(getStateInfo('ZZ')).toBeUndefined()
  })

  test('should not have any overlapping states between lists', () => {
    const noTaxCodes = new Set(NO_INCOME_TAX_STATES.map(state => state.code))
    const taxCodes = new Set(INCOME_TAX_STATES.map(state => state.code))
    
    // No state should be in both lists
    noTaxCodes.forEach(code => {
      expect(taxCodes.has(code)).toBe(false)
    })
  })

  test('should have valid state code format', () => {
    ALL_STATES.forEach(state => {
      expect(state.code).toMatch(/^[A-Z]{2}$/) // Two uppercase letters
    })
  })
})