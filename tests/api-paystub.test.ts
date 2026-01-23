import { describe, expect, it } from 'bun:test'

import { POST } from '@/app/api/paystub/route'

const basePayload = {
  hourlyRate: 25,
  hoursPerPeriod: 80,
  filingStatus: 'single',
  taxYear: 2024,
  state: 'TX',
  payFrequency: 'biweekly',
  overtimeHours: 0,
  overtimeRate: 37.5,
  additionalDeductions: [],
}

describe('API /api/paystub', () => {
  it('returns 400 on invalid payload', async () => {
    const req = new Request('http://localhost/api/paystub', {
      method: 'POST',
      body: JSON.stringify({ ...basePayload, hourlyRate: -1 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns totals on valid payload', async () => {
    const req = new Request('http://localhost/api/paystub', {
      method: 'POST',
      body: JSON.stringify(basePayload),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data?.totals?.grossPay).toBeGreaterThan(0)
    expect(Array.isArray(json.data?.payPeriods)).toBe(true)
  })
})

