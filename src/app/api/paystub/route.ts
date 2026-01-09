import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createServerLogger } from '@/lib/logger'
import { calculatePaystubTotals } from '@/lib/paystub-calculator/calculate-paystub-totals'
import { validatePaystubInputs } from '@/lib/paystub-calculator/validation'
import { FILING_STATUSES, PAY_FREQUENCIES } from '@/types/paystub'

const logger = createServerLogger('paystub-api')

// Minimal API for server-side validated paystub calculations.

const requestSchema = z.object({
  hourlyRate: z.number().positive(),
  hoursPerPeriod: z.number().positive(),
  filingStatus: z.enum(FILING_STATUSES),
  taxYear: z.number().int().min(2020),
  state: z.string().min(2).max(2),
  payFrequency: z.enum(PAY_FREQUENCIES),
  overtimeHours: z.number().nonnegative().optional(),
  overtimeRate: z.number().positive().optional(),
  additionalDeductions: z
    .array(z.object({ name: z.string().min(1).max(100), amount: z.number().nonnegative() }))
    .optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = requestSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const validation = validatePaystubInputs(parsed.data)
    if (!validation.isValid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 })
    }

    const result = calculatePaystubTotals(parsed.data)
    return NextResponse.json({ payPeriods: result.payPeriods, totals: result.totals })
  } catch (error) {
    logger.error('Failed to calculate paystub', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json({ error: 'Unable to calculate paystub' }, { status: 500 })
  }
}
