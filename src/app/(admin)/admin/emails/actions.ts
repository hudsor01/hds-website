/**
 * Admin Scheduled-Emails Server Actions.
 *
 * Single mutation seam for the Phase 05 `/admin/emails` surface (CONTEXT.md
 * §5.4 + §6). Every exported action follows the Phase 04 shape:
 *
 *   1. `await requireAdminSession()` (defense in depth -- the admin layout
 *      already gates GET renders, but a forged POST can hit an action without
 *      going through the layout, so every action revalidates here).
 *   2. Zod `safeParse` on `formDataToObject(formData)`.
 *   3. Call into `@/lib/admin/emails-queries`. The retry path translates the
 *      `RetryResult` discriminated union into the `ActionResult` envelope so
 *      the detail page sees `_form: 'Retry limit reached.'` (etc.) instead of
 *      a raw outcome object.
 *   4. `revalidatePath` for the list AND the detail page so the operator sees
 *      the new state immediately. Delete additionally `redirect()`s to the
 *      list because the detail page no longer has a row to render.
 *
 * `/api/process-emails/route.ts` is NOT imported or called from this file.
 * The retry action mutates DB state so the existing cron picks the row up
 * on the next tick; it does not invoke the cron handler directly.
 */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ZodError } from 'zod'
import { requireAdminSession } from '@/lib/admin/auth'
import {
	cancelScheduledEmail,
	deleteScheduledEmail,
	retryScheduledEmail
} from '@/lib/admin/emails-queries'
import { formDataToObject } from '@/lib/admin/form-data'
import { logger } from '@/lib/logger'
import {
	cancelEmailSchema,
	deleteEmailSchema,
	retryEmailSchema
} from '@/lib/schemas/admin-emails'

type ActionResult = { ok: true } | { ok: false; errors: Record<string, string> }

function flattenZod(error: ZodError): Record<string, string> {
	const out: Record<string, string> = {}
	for (const issue of error.issues) {
		const path = issue.path.join('.') || '_form'
		if (!(path in out)) {
			out[path] = issue.message
		}
	}
	return out
}

/**
 * Reset a scheduled email so the cron picks it up again. Refuses when
 * `retryCount >= maxRetries` (the query layer enforces this; the action
 * surfaces the typed reason via a friendly `_form` message). Does NOT
 * increment `retryCount` -- the cron handler owns that.
 */
export async function retryScheduledEmailAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const parsed = retryEmailSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	try {
		const outcome = await retryScheduledEmail(parsed.data.id)
		if (!outcome.ok) {
			if (outcome.reason === 'not_found') {
				return { ok: false, errors: { _form: 'Email not found.' } }
			}
			// max_retries_exceeded
			return {
				ok: false,
				errors: {
					_form:
						'Retry limit reached. Delete the row or update maxRetries via SQL.'
				}
			}
		}
		revalidatePath('/admin/emails')
		revalidatePath(`/admin/emails/${parsed.data.id}`)
		return { ok: true }
	} catch (e) {
		logger.error('retryScheduledEmailAction failed', e)
		return { ok: false, errors: { _form: 'Could not retry email.' } }
	}
}

/**
 * Cancel a pending scheduled email. Idempotent at the DB layer (calling on
 * an already-cancelled row is a no-op write of the same value). Returns
 * `_form: 'Email not found.'` when the row does not exist.
 */
export async function cancelScheduledEmailAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const parsed = cancelEmailSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	try {
		const row = await cancelScheduledEmail(parsed.data.id)
		if (!row) {
			return { ok: false, errors: { _form: 'Email not found.' } }
		}
		revalidatePath('/admin/emails')
		revalidatePath(`/admin/emails/${parsed.data.id}`)
		return { ok: true }
	} catch (e) {
		logger.error('cancelScheduledEmailAction failed', e)
		return { ok: false, errors: { _form: 'Could not cancel email.' } }
	}
}

/**
 * Permanently delete a scheduled-email row. Used for queue cleanup of
 * cancelled / failed rows the operator no longer wants to see. Redirects
 * to the list because the detail page is gone after the mutation.
 */
export async function deleteScheduledEmailAction(
	formData: FormData
): Promise<void> {
	await requireAdminSession()
	const parsed = deleteEmailSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		logger.error('deleteScheduledEmailAction invalid input', parsed.error)
		redirect('/admin/emails')
	}
	await deleteScheduledEmail(parsed.data.id)
	revalidatePath('/admin/emails')
	redirect('/admin/emails')
}
