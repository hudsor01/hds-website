import { test, expect } from '@playwright/test'

test.describe('Paystub API', () => {
  const endpoint = '/api/paystub'

  test('rejects invalid payload', async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}${endpoint}`, {
      data: { hourlyRate: -1 },
    })
    expect(res.status()).toBe(400)
  })

  test('returns pay periods and totals for valid payload', async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}${endpoint}`, {
      data: {
        hourlyRate: 25,
        hoursPerPeriod: 80,
        filingStatus: 'single',
        taxYear: 2024,
        state: 'TX',
        payFrequency: 'biweekly',
      },
    })

    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(Array.isArray(json.payPeriods)).toBe(true)
    expect(json.totals?.grossPay).toBeGreaterThan(0)
  })
})

