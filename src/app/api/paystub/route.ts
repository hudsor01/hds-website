import { z } from 'zod'

import { createServerLogger } from '@/lib/logger'
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses'
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
      return validationErrorResponse(parsed.error)
    }

    const validation = validatePaystubInputs(parsed.data)
    if (!validation.isValid) {
      return errorResponse('Invalid paystub inputs', 400, validation.errors)
    }

    const result = calculatePaystubTotals(parsed.data)
    return successResponse({ payPeriods: result.payPeriods, totals: result.totals })
  } catch (error) {
    logger.error('Failed to calculate paystub', error instanceof Error ? error : new Error(String(error)))
    return errorResponse('Unable to calculate paystub', 500)
  }
}
