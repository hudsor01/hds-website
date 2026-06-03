/**
 * Admin Calculator-Leads Server Actions.
 *
 * Phase-05 mutation seam for `/admin/leads/calculator`. Three actions:
 *
 *  1. markCalculatorLeadContactedAction: sets contacted=true, contactedAt=now()
 *  2. markCalculatorLeadConvertedAction:  sets converted=true, convertedAt=now(),
 *                                         conversionValue=<formdata>
 *  3. deleteCalculatorLeadAction:         DELETE row, redirect to list
 *
 * Per-action contract (identical to Phase 04 / CONTEXT.md §6):
 *
 *   1. `await requireAdminSession()` (D-12 defense in depth, since the admin
 *      layout already gates GET renders but a forged POST can bypass it).
 *   2. `formDataToObject` -> Zod `safeParse`.
 *   3. Call into `@/lib/admin/calculator-leads-queries` and translate failures
 *      into a generic `_form` error envelope, logging via `logger.error`.
 *   4. `revalidatePath('/admin/leads/calculator')` after success so the list
 *      re-renders; the detail page revalidates its own path too. Delete
 *      additionally `redirect()`s back to the list.
 *
 * Mark-contacted + mark-converted return the `{ ok, errors }` envelope so the
 * detail page can surface field-level / form-level errors. Delete returns
 * `void` because it always redirects.
 */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/admin/auth'
import {
	deleteCalculatorLead,
	markCalculatorLeadContacted,
	markCalculatorLeadConverted
} from '@/lib/admin/calculator-leads-queries'
import { formDataToObject } from '@/lib/admin/form-data'
import { flattenZod } from '@/lib/admin/zod-errors'
import { logger } from '@/lib/logger'
import {
	deleteCalculatorLeadSchema,
	markContactedSchema,
	markConvertedSchema
} from '@/lib/schemas/admin-calculator-leads'

type ActionResult = { ok: true } | { ok: false; errors: Record<string, string> }

export async function markCalculatorLeadContactedAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const parsed = markContactedSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	try {
		const row = await markCalculatorLeadContacted(parsed.data.id)
		if (!row) {
			return { ok: false, errors: { _form: 'Calculator lead not found.' } }
		}
		revalidatePath('/admin/leads/calculator')
		revalidatePath(`/admin/leads/calculator/${parsed.data.id}`)
		return { ok: true }
	} catch (e) {
		logger.error('markCalculatorLeadContactedAction failed', e)
		return { ok: false, errors: { _form: 'Could not mark as contacted.' } }
	}
}

export async function markCalculatorLeadConvertedAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const parsed = markConvertedSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	try {
		const row = await markCalculatorLeadConverted(
			parsed.data.id,
			parsed.data.conversionValue
		)
		if (!row) {
			return { ok: false, errors: { _form: 'Calculator lead not found.' } }
		}
		revalidatePath('/admin/leads/calculator')
		revalidatePath(`/admin/leads/calculator/${parsed.data.id}`)
		return { ok: true }
	} catch (e) {
		logger.error('markCalculatorLeadConvertedAction failed', e)
		return { ok: false, errors: { _form: 'Could not mark as converted.' } }
	}
}

export async function deleteCalculatorLeadAction(
	formData: FormData
): Promise<void> {
	await requireAdminSession()
	const parsed = deleteCalculatorLeadSchema.safeParse(
		formDataToObject(formData)
	)
	if (!parsed.success) {
		logger.error('deleteCalculatorLeadAction invalid input', parsed.error)
		redirect('/admin/leads/calculator')
	}
	await deleteCalculatorLead(parsed.data.id)
	revalidatePath('/admin/leads/calculator')
	redirect('/admin/leads/calculator')
}
