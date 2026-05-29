/**
 * Admin Calculator-Lead Validation Schemas
 *
 * Phase-05 admin-mutation schema set for `/admin/leads/calculator`. Pure Zod
 * file (no DB imports) consumed by the Server Actions in
 * `src/app/admin/leads/calculator/actions.ts`.
 *
 * Three mutations:
 *  - markContactedSchema  -> `markCalculatorLeadContactedAction`
 *  - markConvertedSchema  -> `markCalculatorLeadConvertedAction`
 *  - deleteCalculatorLeadSchema -> `deleteCalculatorLeadAction`
 *
 * Numeric values arrive from FormData as strings, so `conversionValue` uses
 * `z.coerce.number()` to accept the raw `<input type="number">` payload.
 */
import { z } from 'zod'

export const markContactedSchema = z.object({
	id: z.string().uuid({ message: 'Invalid calculator lead id.' })
})

export const markConvertedSchema = z.object({
	id: z.string().uuid({ message: 'Invalid calculator lead id.' }),
	conversionValue: z.coerce
		.number()
		.nonnegative('Conversion value must be 0 or greater.')
})

export const deleteCalculatorLeadSchema = z.object({
	id: z.string().uuid({ message: 'Invalid calculator lead id.' })
})
