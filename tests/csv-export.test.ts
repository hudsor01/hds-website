import { describe, expect, it } from 'bun:test'

import { payPeriodsToCsv } from '@/lib/paystub-calculator/csv'

const samplePeriods = [
  {
    period: 1,
    payDate: '2024-01-15T00:00:00.000Z',
    hours: 80,
    grossPay: 2000,
    federalTax: 200,
    socialSecurity: 124,
    medicare: 29,
    stateTax: 0,
    otherDeductions: 0,
    netPay: 1647,
  },
  {
    period: 2,
    payDate: '2024-01-29T00:00:00.000Z',
    hours: 80,
    grossPay: 2000,
    federalTax: 200,
    socialSecurity: 124,
    medicare: 29,
    stateTax: 0,
    otherDeductions: 0,
    netPay: 1647,
  },
]

describe('payPeriodsToCsv', () => {
  it('includes headers and rows without formulas', () => {
    const csv = payPeriodsToCsv(samplePeriods)
    const lines = csv.split('\n')
    expect(lines[0]).toContain('Period,Pay Date,Hours,Gross Pay')
    expect(lines).toHaveLength(samplePeriods.length + 1)
    expect(csv).not.toMatch(/[=+\-]\d/) // guard against formula injection
  })
})

