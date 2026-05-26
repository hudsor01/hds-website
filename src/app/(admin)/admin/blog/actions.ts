'use server'

/**
 * Server Actions for the admin blog CRUD surface (Phase 04, Plan 03).
 *
 * Every action begins with `await requireAdminSession()` so a forged POST
 * cannot bypass the layout's role guard (defense in depth per CONTEXT.md
 * D-12). Inputs land as `FormData`, are flattened to a plain object via
 * `formDataToObject`, validated with the admin Zod schema, then handed to
 * the `blog-queries` write helpers. After every mutation we call
 * `revalidatePath('/admin/blog')` per CONTEXT.md D-11 so the list table
 * reflects the change on the next render.
 *
 * Returns the `{ ok, errors }` envelope on validation / DB errors so the
 * client form can map them onto fields. On success, `create`/`update`
 * redirect to the canonical post URL (Next.js redirect throws, so any
 * code after it is unreachable).
 */
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ZodError } from 'zod'
import { requireAdminSession } from '@/lib/admin/auth'
import {
	createBlogPost,
	deleteBlogPost,
	toggleBlogPostPublished,
	updateBlogPost
} from '@/lib/admin/blog-queries'
import { isUniqueViolation } from '@/lib/admin/db-errors'
import { formDataToObject } from '@/lib/admin/form-data'
import { logger } from '@/lib/logger'
import {
	createAdminBlogPostSchema,
	updateAdminBlogPostSchema
} from '@/lib/schemas/admin-blog'

export type ActionResult =
	| { ok: true; id: string }
	| { ok: false; errors: Record<string, string> }

function flattenZod(error: ZodError): Record<string, string> {
	const out: Record<string, string> = {}
	for (const issue of error.issues) {
		const key = issue.path.length > 0 ? issue.path.join('.') : '_form'
		if (!(key in out)) {
			out[key] = issue.message
		}
	}
	return out
}

export async function createBlogPostAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const parsed = createAdminBlogPostSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	let newId: string
	try {
		const row = await createBlogPost(parsed.data)
		newId = row.id
	} catch (error) {
		if (isUniqueViolation(error, 'slug')) {
			return { ok: false, errors: { slug: 'Slug already exists.' } }
		}
		logger.error('createBlogPostAction failed', error)
		return {
			ok: false,
			errors: { _form: 'Could not create post. Please try again.' }
		}
	}
	revalidatePath('/admin/blog')
	redirect(`/admin/blog/${newId}/edit`)
}

export async function updateBlogPostAction(
	formData: FormData
): Promise<ActionResult> {
	await requireAdminSession()
	const parsed = updateAdminBlogPostSchema.safeParse(formDataToObject(formData))
	if (!parsed.success) {
		return { ok: false, errors: flattenZod(parsed.error) }
	}
	const { id, ...rest } = parsed.data
	let newId: string
	try {
		const row = await updateBlogPost(id, rest)
		if (!row) {
			return { ok: false, errors: { _form: 'Post not found.' } }
		}
		newId = row.id
	} catch (error) {
		if (isUniqueViolation(error, 'slug')) {
			return { ok: false, errors: { slug: 'Slug already exists.' } }
		}
		logger.error('updateBlogPostAction failed', error, { metadata: { id } })
		return {
			ok: false,
			errors: { _form: 'Could not save post. Please try again.' }
		}
	}
	revalidatePath('/admin/blog')
	redirect(`/admin/blog/${newId}/edit`)
}

export async function deleteBlogPostAction(formData: FormData): Promise<void> {
	await requireAdminSession()
	const id = formData.get('id')
	if (typeof id !== 'string' || id.length === 0) {
		logger.warn('deleteBlogPostAction called without id')
		redirect('/admin/blog')
	}
	try {
		await deleteBlogPost(id)
	} catch (error) {
		logger.error('deleteBlogPostAction failed', error, { metadata: { id } })
	}
	revalidatePath('/admin/blog')
	redirect('/admin/blog')
}

export async function toggleBlogPostPublishedAction(
	formData: FormData
): Promise<void> {
	await requireAdminSession()
	const id = formData.get('id')
	if (typeof id !== 'string' || id.length === 0) {
		logger.warn('toggleBlogPostPublishedAction called without id')
		return
	}
	try {
		await toggleBlogPostPublished(id)
	} catch (error) {
		logger.error('toggleBlogPostPublishedAction failed', error, {
			metadata: { id }
		})
	}
	revalidatePath('/admin/blog')
}
