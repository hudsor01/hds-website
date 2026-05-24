/**
 * Admin Leads Server Actions.
 *
 * Single mutation seam for the Phase 05 `/admin/leads` surface (CONTEXT.md
 * §5.1 / §6). Four exported actions, every one of them shaped the same way:
 *
 *   1. `await requireAdminSession()` (D-12 defense in depth, since the
 *      admin layout already gates GET renders but a forged POST can hit an
 *      action without going through the layout, so every action checks
 *      again here).
 *   2. `formDataToObject` -> Zod `safeParse`.
 *   3. Call into `@/lib/admin/leads-queries` and translate failures: the
 *      generic envelope is `{ ok: false, errors: { _form: '...' } }` for
 *      anything we cannot map to a field. Delete-style actions return
 *      `void` and `redirect()` instead of returning an envelope (mirrors
 *      `deleteShowcaseAction`).
 *   4. `revalidatePath` after every successful mutation (D-11) so the
 *      list and / or detail surface re-renders without a manual refresh.
 *
 * `flattenZod` is duplicated rather than imported from another file -- the
 * Phase 04 convention is one flattener per actions file so each surface
 * stays independently auditable.
 */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ZodError } from 'zod'
import { requireAdminSession } from '@/lib/admin/auth'
import { formDataToObject } from '@/lib/admin/form-data'
import {
	addLeadNote,
	deleteLead,
	deleteLeadNote,
	updateLeadStatus
} from '@/lib/admin/leads-queries'
import { logger } from '@/lib/logger'
import {
	addLeadNoteSchema,
	deleteLeadNoteSchema,
	deleteLeadSchema,
	updateLeadStatusSchema
} from '@/lib/schemas/admin-leads'

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

export async function updateLeadStatusAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const parsed = updateLeadStatusSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	try {
		const row = await updateLeadStatus(parsed.data.id, parsed.data.status)
		if (!row) {
			return { ok: false, errors: { _form: 'Lead not found.' } }
		}
	} catch (e) {
		logger.error('updateLeadStatusAction failed', e)
		return { ok: false, errors: { _form: 'Could not update status.' } }
	}
	revalidatePath('/admin/leads')
	revalidatePath(`/admin/leads/${parsed.data.id}`)
	return { ok: true }
}

export async function addLeadNoteAction(
	formData: FormData
): Promise<ActionResult> {
	const session = await requireAdminSession()
	const parsed = addLeadNoteSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	try {
		await addLeadNote({
			leadId: parsed.data.leadId,
			content: parsed.data.content,
			createdBy: session.user.email
		})
	} catch (e) {
		logger.error('addLeadNoteAction failed', e)
		return { ok: false, errors: { _form: 'Could not add note.' } }
	}
	revalidatePath(`/admin/leads/${parsed.data.leadId}`)
	return { ok: true }
}

export async function deleteLeadAction(formData: FormData): Promise<void> {
	await requireAdminSession()
	const parsed = deleteLeadSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		logger.error('deleteLeadAction invalid input', parsed.error)
		redirect('/admin/leads')
	}
	await deleteLead(parsed.data.id)
	revalidatePath('/admin/leads')
	redirect('/admin/leads')
}

export async function deleteLeadNoteAction(formData: FormData): Promise<void> {
	await requireAdminSession()
	const parsed = deleteLeadNoteSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		logger.error('deleteLeadNoteAction invalid input', parsed.error)
		return
	}
	await deleteLeadNote(parsed.data.noteId)
	revalidatePath(`/admin/leads/${parsed.data.leadId}`)
}
