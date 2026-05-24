/**
 * Admin Showcase Server Actions.
 *
 * Single mutation seam for the showcase CRUD vertical slice (CONTEXT.md D-02).
 * Every exported action follows the same shape:
 *
 *   1. `await requireAdminSession()` (D-12 defense in depth, since the admin layout
 *      already gates GET renders, but a forged POST can hit an action without
 *      going through the layout, so every action revalidates here).
 *   2. `formDataToObject` -> array / JSON coercion -> Zod `safeParse`.
 *   3. Call into `@/lib/admin/showcase-queries` and translate DB errors:
 *      slug unique-violation -> field-level form error; anything else -> a
 *      generic `_form` error and `logger.error`.
 *   4. `revalidatePath('/admin/showcase')` so the list re-renders after the
 *      mutation (D-11). Create additionally `redirect()`s straight into the
 *      edit page so the operator can keep editing the new row.
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
import { isUniqueViolation } from '@/lib/admin/db-errors'
import { formDataToObject } from '@/lib/admin/form-data'
import {
	createShowcase,
	deleteShowcase,
	toggleShowcasePublished,
	updateShowcase
} from '@/lib/admin/showcase-queries'
import { logger } from '@/lib/logger'
import {
	createShowcaseSchema,
	updateShowcaseSchema
} from '@/lib/schemas/admin-showcase'

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

/**
 * Translate the raw FormData (everything-is-a-string) into a shape Zod can
 * parse. Textareas for `technologies` / `galleryImages` arrive as newline-
 * delimited strings; `metrics` arrives as a JSON object string. Other fields
 * pass through unchanged.
 */
function coerceFormFields(
	raw: Record<string, string | string[]>
): Record<string, unknown> {
	const out: Record<string, unknown> = { ...raw }
	for (const key of ['technologies', 'galleryImages'] as const) {
		const v = out[key]
		if (typeof v === 'string') {
			out[key] = v
				.split('\n')
				.map(s => s.trim())
				.filter(Boolean)
		}
	}
	if (typeof out.metrics === 'string') {
		try {
			const parsed = JSON.parse(out.metrics)
			out.metrics =
				parsed && typeof parsed === 'object' && !Array.isArray(parsed)
					? parsed
					: {}
		} catch {
			out.metrics = {}
		}
	}
	return out
}

export async function createShowcaseAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const raw = coerceFormFields(formDataToObject(formData))
	const parsed = createShowcaseSchema.safeParse(raw)
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	let newId: string
	try {
		const row = await createShowcase(parsed.data)
		newId = row.id
	} catch (e) {
		if (isUniqueViolation(e, 'slug')) {
			return { ok: false, errors: { slug: 'Slug already exists.' } }
		}
		logger.error('createShowcaseAction failed', e)
		return {
			ok: false,
			errors: { _form: 'Could not create. Please try again.' }
		}
	}
	revalidatePath('/admin/showcase')
	redirect(`/admin/showcase/${newId}/edit`)
}

export async function updateShowcaseAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const raw = coerceFormFields(formDataToObject(formData))
	const parsed = updateShowcaseSchema.safeParse(raw)
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	try {
		const { id, ...rest } = parsed.data
		const row = await updateShowcase(id, rest)
		if (!row) {
			return { ok: false, errors: { _form: 'Showcase not found.' } }
		}
		revalidatePath('/admin/showcase')
		revalidatePath(`/admin/showcase/${id}/edit`)
		return { ok: true, id: row.id }
	} catch (e) {
		if (isUniqueViolation(e, 'slug')) {
			return { ok: false, errors: { slug: 'Slug already exists.' } }
		}
		logger.error('updateShowcaseAction failed', e)
		return {
			ok: false,
			errors: { _form: 'Could not save. Please try again.' }
		}
	}
}

export async function deleteShowcaseAction(formData: FormData): Promise<void> {
	await requireAdminSession()
	const id = String(formData.get('id') ?? '')
	if (!id) {
		redirect('/admin/showcase')
	}
	await deleteShowcase(id)
	revalidatePath('/admin/showcase')
	redirect('/admin/showcase')
}

export async function toggleShowcasePublishedAction(
	formData: FormData
): Promise<void> {
	await requireAdminSession()
	const id = String(formData.get('id') ?? '')
	if (!id) {
		redirect('/admin/showcase')
	}
	await toggleShowcasePublished(id)
	revalidatePath('/admin/showcase')
}
