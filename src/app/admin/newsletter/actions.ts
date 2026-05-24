/**
 * Admin Newsletter Server Actions.
 *
 * Phase 05 mutation seam for `/admin/newsletter`. Three actions, identical
 * contract to Phase 04 (see `.planning/phases/05-admin-ops/05-CONTEXT.md`
 * section 6):
 *
 *   1. `unsubscribeSubscriberAction(formData)` -> `ActionResult`
 *      Transitions an `active` (or any) subscriber to `unsubscribed`.
 *   2. `resubscribeSubscriberAction(formData)` -> `ActionResult`
 *      Transitions an `unsubscribed` subscriber back to `active`.
 *   3. `deleteSubscriberAction(formData)` -> void
 *      GDPR hard delete. Redirects to the list on success or invalid input.
 *
 * Every action:
 *   1. `await requireAdminSession()` first (D-12 defense in depth, since the
 *      admin layout already gates GET renders, but a forged POST can hit an
 *      action without going through the layout).
 *   2. `formDataToObject` -> Zod `safeParse`.
 *   3. Call into `@/lib/admin/newsletter-queries` and translate failures into
 *      either a `{ ok: false, errors }` envelope or a generic `_form` error
 *      with `logger.error`.
 *   4. `revalidatePath('/admin/newsletter')` (and the detail path where
 *      relevant) so the list re-renders after the mutation.
 */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ZodError } from 'zod'
import { requireAdminSession } from '@/lib/admin/auth'
import { formDataToObject } from '@/lib/admin/form-data'
import {
	deleteSubscriber,
	setSubscriberStatus
} from '@/lib/admin/newsletter-queries'
import { logger } from '@/lib/logger'
import {
	deleteSubscriberSchema,
	setStatusSchema
} from '@/lib/schemas/admin-newsletter'

export type ActionResult =
	| { ok: true }
	| { ok: false; errors: Record<string, string> }

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

export async function unsubscribeSubscriberAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const raw = formDataToObject(formData)
	const parsed = setStatusSchema.safeParse({
		id: raw.id,
		status: 'unsubscribed'
	})
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	try {
		const row = await setSubscriberStatus(parsed.data.id, 'unsubscribed')
		if (!row) {
			return { ok: false, errors: { _form: 'Subscriber not found.' } }
		}
		revalidatePath('/admin/newsletter')
		revalidatePath(`/admin/newsletter/${parsed.data.id}`)
		return { ok: true }
	} catch (e) {
		logger.error('unsubscribeSubscriberAction failed', e)
		return { ok: false, errors: { _form: 'Could not unsubscribe.' } }
	}
}

export async function resubscribeSubscriberAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const raw = formDataToObject(formData)
	const parsed = setStatusSchema.safeParse({
		id: raw.id,
		status: 'active'
	})
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	try {
		const row = await setSubscriberStatus(parsed.data.id, 'active')
		if (!row) {
			return { ok: false, errors: { _form: 'Subscriber not found.' } }
		}
		revalidatePath('/admin/newsletter')
		revalidatePath(`/admin/newsletter/${parsed.data.id}`)
		return { ok: true }
	} catch (e) {
		logger.error('resubscribeSubscriberAction failed', e)
		return { ok: false, errors: { _form: 'Could not re-subscribe.' } }
	}
}

export async function deleteSubscriberAction(
	formData: FormData
): Promise<void> {
	await requireAdminSession()
	const parsed = deleteSubscriberSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		logger.error('deleteSubscriberAction invalid input', parsed.error)
		redirect('/admin/newsletter')
	}
	await deleteSubscriber(parsed.data.id)
	revalidatePath('/admin/newsletter')
	redirect('/admin/newsletter')
}
