import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { calculatePaystubTotals, type PaystubCalculationParams } from '@/lib/paystub-calculator/calculate-paystub-totals'

/**
 * Pay Period Generation Tests
 *
 * Tests pay period calculations and overtime logic.
 * Uses real calculator to ensure production accuracy.
 */
describe('Pay period generation and overtime', () => {
  let baseParams: Omit<PaystubCalculationParams, 'payFrequency'> | null = null

  beforeEach(() => {
    baseParams = {
      hourlyRate: 25,
      hoursPerPeriod: 80,
      filingStatus: 'single' as const,
      taxYear: 2024,
      state: 'TX',
      overtimeHours: 0,
      overtimeRate: 37.5,
      additionalDeductions: [] as Array<{ name: string; amount: number }>,
    }
  })

  afterEach(() => {
    // Clean up to prevent state leakage between tests
    baseParams = null
  })

  it('generates correct number of periods for each frequency', () => {
    // Test mirrors production: each pay frequency generates specific number of pay periods per year
    const expectedCounts = {
      weekly: 52,
      biweekly: 26,
      semimonthly: 24,
      monthly: 12,
    } as const

    (Object.keys(expectedCounts) as Array<keyof typeof expectedCounts>).forEach((freq) => {
      if (!baseParams) {
        return
      }
      const result = calculatePaystubTotals({ ...baseParams, payFrequency: freq })
      expect(result.payPeriods).toHaveLength(expectedCounts[freq])
    })
  })

  it('adds overtime pay into gross calculations', () => {
    // Test mirrors production: overtime hours are paid at overtime rate and added to gross pay
    if (!baseParams) {
      return
    }
    const result = calculatePaystubTotals({
      ...baseParams,
      payFrequency: 'biweekly',
      overtimeHours: 10,
      overtimeRate: 50,
    })

    // Regular: 80 * $25 = $2000, Overtime: 10 * $50 = $500, Total: $2500
    expect(result.payPeriods[0]?.grossPay).toBeCloseTo(80 * 25 + 10 * 50, 2)
    expect(result.totals.grossPay).toBeGreaterThan(0)
  })
})
