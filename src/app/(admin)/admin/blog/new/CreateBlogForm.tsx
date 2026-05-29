'use client'

/**
 * Admin "New post" form (client island).
 *
 * Thin wrapper around `useBlogForm` + `BlogFormFields`. State and field
 * markup are shared with EditBlogForm; this file owns only the empty
 * defaults, the title-blur auto-slug toggle, the submit handler, and
 * the create-vs-save copy. See `../_form/useBlogForm.ts` for the state
 * contract and `../_form/BlogFormFields.tsx` for the field markup.
 *
 * Boolean checkboxes are encoded as the literal string 'true' / 'false'
 * so the action's `formBoolean` preprocess parses them correctly on
 * both branches (a raw checkbox would emit "on" only when checked,
 * which `formBoolean` also handles, but the explicit pair survives
 * FormData encoding on both checked and unchecked states).
 */
import { toast } from 'sonner'
import {
	type AuthorOption,
	BlogFormFields,
	type TagOption
} from '../_form/BlogFormFields'
import { buildBlogFormData, useBlogForm } from '../_form/useBlogForm'
import { createBlogPostAction } from '../actions'

interface CreateBlogFormProps {
	authorOptions: AuthorOption[]
	tagOptions: TagOption[]
}

export function CreateBlogForm({
	authorOptions,
	tagOptions
}: CreateBlogFormProps) {
	const state = useBlogForm({
		title: '',
		slug: '',
		excerpt: '',
		content: '',
		featureImage: '',
		readingTime: 5,
		authorId: authorOptions[0]?.id ?? '',
		tagIds: [],
		featured: false,
		published: true
	})

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		state.setErrors({})
		const formData = buildBlogFormData(state, null)
		state.startTransition(async () => {
			const result = await createBlogPostAction(formData)
			if (result && result.ok === false) {
				state.setErrors(result.errors)
				toast.error(
					result.errors._form ?? 'Could not create. Please try again.'
				)
			}
		})
	}

	const formError = state.errors._form

	return (
		<form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
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
				enableTitleAutoSlug
			/>

			<div className="flex items-center gap-3">
				<button
					type="submit"
					disabled={state.isPending}
					className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-surface-base bg-accent-text hover:opacity-90 transition-smooth disabled:opacity-60"
				>
					{state.isPending ? 'Saving...' : 'Create post'}
				</button>
			</div>
		</form>
	)
}
