'use client'

/**
 * Admin "Edit post" form (client island).
 *
 * Thin wrapper around `useBlogForm` + `BlogFormFields`. Same state and
 * field markup as CreateBlogForm; this file owns the row-derived
 * initial values, the update action binding, the save-vs-create copy,
 * and the DeleteButton rendered outside the <form> so a stray submit
 * cannot trigger the delete action.
 *
 * Slug auto-fill on title blur is disabled here per CONTEXT.md D-09:
 * editing a slug is an explicit operator decision.
 */
import { toast } from 'sonner'
import { DeleteButton } from '@/components/admin/DeleteButton'
import type { AdminBlogListRow } from '@/lib/admin/blog-queries'
import {
	type AuthorOption,
	BlogFormFields,
	type TagOption
} from '../../_form/BlogFormFields'
import { buildBlogFormData, useBlogForm } from '../../_form/useBlogForm'
import { deleteBlogPostAction, updateBlogPostAction } from '../../actions'

interface EditBlogFormProps {
	row: AdminBlogListRow
	authorOptions: AuthorOption[]
	tagOptions: TagOption[]
}

export function EditBlogForm({
	row,
	authorOptions,
	tagOptions
}: EditBlogFormProps) {
	const state = useBlogForm({
		title: row.post.title,
		slug: row.post.slug,
		excerpt: row.post.excerpt,
		content: row.post.content,
		featureImage: row.post.featureImage ?? '',
		readingTime: row.post.readingTime,
		authorId: row.post.authorId ?? '',
		tagIds: row.tagIds,
		featured: row.post.featured ?? false,
		published: row.post.published ?? false
	})

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		state.setErrors({})
		const formData = buildBlogFormData(state, row.post.id)
		state.startTransition(async () => {
			const result = await updateBlogPostAction(formData)
			if (result && result.ok === false) {
				state.setErrors(result.errors)
				toast.error(result.errors._form ?? 'Could not save. Please try again.')
			}
		})
	}

	const formError = state.errors._form

	return (
		<div className="space-y-8 max-w-3xl">
			<form onSubmit={handleSubmit} className="space-y-6">
				{formError && (
					<div
						role="alert"
						className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
					>
						{formError}
					</div>
				)}

				<BlogFormFields
					state={state}
					authorOptions={authorOptions}
					tagOptions={tagOptions}
					enableTitleAutoSlug={false}
				/>

				<div className="flex items-center gap-3">
					<button
						type="submit"
						disabled={state.isPending}
						className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-surface-base bg-accent-text hover:opacity-90 transition-smooth disabled:opacity-60"
					>
						{state.isPending ? 'Saving...' : 'Save changes'}
					</button>
				</div>
			</form>

			<div className="border-t border-border pt-6">
				<DeleteButton
					action={deleteBlogPostAction}
					id={row.post.id}
					label="Delete post"
					confirmMessage={`Delete "${row.post.title}"? This cannot be undone.`}
				/>
			</div>
		</div>
	)
}
