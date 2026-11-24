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
 *
 * Request links (the private, single-use URLs clients use to submit a
 * review) are created, listed and deleted here too, behind the admin
 * session. The browser never sees ADMIN_SECRET; the Bearer-token API routes
 * remain only for server-to-server automation.
 */
'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/admin/auth'
import { formDataToObject } from '@/lib/admin/form-data'
import {
	createTestimonial,
	deleteTestimonial,
	toggleTestimonialFeatured,
	toggleTestimonialPublished,
	updateTestimonial
} from '@/lib/admin/testimonials-queries'
import { flattenZod } from '@/lib/admin/zod-errors'
import { logger } from '@/lib/logger'
import {
	createAdminTestimonialSchema,
	createTestimonialRequestFormSchema,
	updateAdminTestimonialSchema
} from '@/lib/schemas/admin-testimonials'
import {
	createTestimonialRequest,
	deleteTestimonialRequest,
	TESTIMONIALS_APPROVED_TAG,
	testimonialTokenTag
} from '@/lib/testimonials'

export type ActionResult =
	| { ok: true; id?: string }
	| { ok: false; errors: Record<string, string> }

const REQUESTS_PATH = '/admin/testimonials/requests'

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
	refreshPublicTestimonials()
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
		refreshPublicTestimonials()
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
	try {
		await deleteTestimonial(id)
	} catch (e) {
		logger.error('deleteTestimonialAction failed', e)
	}
	refreshPublicTestimonials()
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
	refreshPublicTestimonials()
}

export async function toggleTestimonialFeaturedAction(
	formData: FormData
): Promise<void> {
	await requireAdminSession()
	const id = String(formData.get('id') ?? '')
	if (!id) {
		redirect('/admin/testimonials')
	}
	await toggleTestimonialFeatured(id)
	refreshPublicTestimonials()
}

export type CreateRequestResult =
	| { ok: true; token: string }
	| { ok: false; errors: Record<string, string> }

export async function createTestimonialRequestAction(
	formData: FormData
): Promise<CreateRequestResult> {
	await requireAdminSession()
	const parsed = createTestimonialRequestFormSchema.safeParse(
		formDataToObject(formData)
	)
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	const { clientName, clientEmail, projectName } = parsed.data
	try {
		const request = await createTestimonialRequest({
			clientName,
			clientEmail: clientEmail || undefined,
			projectName: projectName || undefined
		})
		revalidatePath(REQUESTS_PATH)
		return { ok: true, token: request.token }
	} catch (e) {
		logger.error('createTestimonialRequestAction failed', e)
		return {
			ok: false,
			errors: { _form: 'Could not create the link. Please try again.' }
		}
	}
}

export async function deleteTestimonialRequestAction(
	formData: FormData
): Promise<void> {
	await requireAdminSession()
	const id = String(formData.get('id') ?? '')
	if (id) {
		try {
			const token = await deleteTestimonialRequest(id)
			// A revoked link must stop showing the form right away.
			if (token) {
				updateTag(testimonialTokenTag(token))
			}
		} catch (e) {
			logger.error('deleteTestimonialRequestAction failed', e)
		}
	}
	revalidatePath(REQUESTS_PATH)
}

/**
 * Every mutation can change what /testimonials shows (and its Review
 * JSON-LD), so expire the public cache along with the admin list. Without
 * this a newly published review stayed hidden for hours.
 */
function refreshPublicTestimonials(): void {
	revalidatePath('/admin/testimonials')
	updateTag(TESTIMONIALS_APPROVED_TAG)
}
