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
 *   3. Call into `@/lib/admin/leads-queries` and translate failures.
 *   4. `revalidatePath` after every successful mutation (D-11) so the
 *      list and / or detail surface re-renders without a manual refresh.
 *
 * All four actions return `void` because every call site is a plain
 * `<form action={action}>` on a server component (the Phase 05 detail
 * page) -- React's typing for the form-action seam discards any return
 * value. Errors are logged via `logger.error`; the page re-renders with
 * the unchanged state and the operator retries.
 *
 * Sibling actions files (`calculator/actions.ts`, `newsletter/actions.ts`,
 * `emails/actions.ts`) keep a local `ActionResult` type + `flattenZod`
 * helper because their `Promise<ActionResult>`-returning actions are
 * wrapped in thin `void` shims at the page level. This file does NOT
 * declare either symbol because its actions are `void` natively, leaving
 * no caller. The local `flattenZod` helper in each sibling file is
 * duplicated by necessity: it is a VALUE, and `'use server'` files only
 * allow async function exports, so it cannot be shared across files.
 *
 * Deviation from PLAN 05-02 Task 2 (Rule 1 -- typecheck fix): the plan
 * specified `updateLeadStatusAction` and `addLeadNoteAction` as
 * `Promise<ActionResult>`, but React's `HTMLFormElement.action` typing
 * only accepts `string | ((formData) => void | Promise<void>)`. Wiring
 * an `ActionResult`-returning action directly into `<form action={...}>`
 * on a server component fails `tsc --noEmit`. Phase 04 dodged this by
 * consuming `ActionResult` from a TanStack-Form client island; Phase 05
 * uses server forms only (CONTEXT.md §3), so the contract collapses to
 * `void`.
 */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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

export async function updateLeadStatusAction(
	formData: FormData
): Promise<void> {
	await requireAdminSession()
	const parsed = updateLeadStatusSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		logger.error('updateLeadStatusAction invalid input', parsed.error)
		return
	}
	try {
		const row = await updateLeadStatus(parsed.data.id, parsed.data.status)
		if (!row) {
			logger.error('updateLeadStatusAction lead not found', {
				id: parsed.data.id
			})
			return
		}
	} catch (e) {
		logger.error('updateLeadStatusAction failed', e)
		return
	}
	revalidatePath('/admin/leads')
	revalidatePath(`/admin/leads/${parsed.data.id}`)
}

export async function addLeadNoteAction(formData: FormData): Promise<void> {
	const session = await requireAdminSession()
	const parsed = addLeadNoteSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		logger.error('addLeadNoteAction invalid input', parsed.error)
		return
	}
	try {
		await addLeadNote({
			leadId: parsed.data.leadId,
			content: parsed.data.content,
			createdBy: session.user.email
		})
	} catch (e) {
		logger.error('addLeadNoteAction failed', e)
		return
	}
	revalidatePath(`/admin/leads/${parsed.data.leadId}`)
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
