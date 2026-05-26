/**
 * Admin Testimonials Server Actions.
 *
 * Single mutation seam for the testimonials CRUD vertical slice
 * (CONTEXT.md D-02). Every exported action follows the same shape:
 *
 *   1. `await requireAdminSession()` (D-12 defense in depth -- the admin
 *      layout already gates GET renders, but a forged POST can hit an
 *      action without going through the layout, so every action
 *      revalidates here).
 *   2. `formDataToObject` -> Zod `safeParse`.
 *   3. Call into `@/lib/admin/testimonials-queries`. The testimonials
 *      table has no unique constraint other than the primary key, so
 *      there is no slug-style unique-violation translation here;
 *      anything that throws becomes a generic `_form` error.
 *   4. `revalidatePath('/admin/testimonials')` so the list re-renders
 *      after the mutation (D-11). Create additionally `redirect()`s
 *      into the edit page so the operator can keep editing the new row.
 *
 * Delete and toggle return `void` because they redirect / let
 * `revalidatePath` re-render. Create and update return the
 * `{ ok, errors }` envelope for the TanStack Form to consume.
 */
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ZodError } from 'zod'
import { requireAdminSession } from '@/lib/admin/auth'
import { formDataToObject } from '@/lib/admin/form-data'
import {
	createTestimonial,
	deleteTestimonial,
	toggleTestimonialPublished,
	updateTestimonial
} from '@/lib/admin/testimonials-queries'
import { logger } from '@/lib/logger'
import {
	createAdminTestimonialSchema,
	updateAdminTestimonialSchema
} from '@/lib/schemas/admin-testimonials'

export type ActionResult =
	| { ok: true; id?: string }
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

export async function createTestimonialAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const raw = formDataToObject(formData)
	const parsed = createAdminTestimonialSchema.safeParse(raw)
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	let newId: string
	try {
		const row = await createTestimonial(parsed.data)
		newId = row.id
	} catch (e) {
		logger.error('createTestimonialAction failed', e)
		return {
			ok: false,
			errors: { _form: 'Could not create. Please try again.' }
		}
	}
	revalidatePath('/admin/testimonials')
	redirect(`/admin/testimonials/${newId}/edit`)
}

export async function updateTestimonialAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const raw = formDataToObject(formData)
	const parsed = updateAdminTestimonialSchema.safeParse(raw)
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	try {
		const { id, ...rest } = parsed.data
		const row = await updateTestimonial(id, rest)
		if (!row) {
			return { ok: false, errors: { _form: 'Testimonial not found.' } }
		}
		revalidatePath('/admin/testimonials')
		revalidatePath(`/admin/testimonials/${id}/edit`)
		return { ok: true, id: row.id }
	} catch (e) {
		logger.error('updateTestimonialAction failed', e)
		return {
			ok: false,
			errors: { _form: 'Could not save. Please try again.' }
		}
	}
}

export async function deleteTestimonialAction(
	formData: FormData
): Promise<void> {
	await requireAdminSession()
	const id = String(formData.get('id') ?? '')
	if (!id) {
		redirect('/admin/testimonials')
	}
	await deleteTestimonial(id)
	revalidatePath('/admin/testimonials')
	redirect('/admin/testimonials')
}

export async function toggleTestimonialPublishedAction(
	formData: FormData
): Promise<void> {
	await requireAdminSession()
	const id = String(formData.get('id') ?? '')
	if (!id) {
		redirect('/admin/testimonials')
	}
	await toggleTestimonialPublished(id)
	revalidatePath('/admin/testimonials')
}
