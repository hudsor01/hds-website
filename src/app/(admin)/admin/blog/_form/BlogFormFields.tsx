'use client'

/**
 * Shared field markup for CreateBlogForm + EditBlogForm.
 *
 * Drives every input from `state` returned by `useBlogForm`. The outer
 * forms own the `<form>` element, submit handler, error banner, submit
 * button, and (for edit) the DeleteButton — so this component renders
 * only the per-field markup between the alert and the submit row.
 *
 * `enableTitleAutoSlug` toggles the create-time convenience of filling
 * the slug from the title on blur when the slug is still empty
 * (CONTEXT.md D-09). Edit does not auto-fill: editing a slug is an
 * explicit operator decision.
 */
import { FormFieldSet } from '@/components/admin/FormFieldSet'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { slugify } from '@/lib/admin/slugify'
import type { BlogFormState } from './useBlogForm'

export interface AuthorOption {
	id: string
	name: string
}

export interface TagOption {
	id: string
	name: string
}

interface BlogFormFieldsProps {
	state: BlogFormState
	authorOptions: AuthorOption[]
	tagOptions: TagOption[]
	enableTitleAutoSlug: boolean
}

const TEXT_INPUT_CLASS =
	'block w-full rounded-md border border-border bg-surface-base px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised'

const TEXTAREA_CLASS = `${TEXT_INPUT_CLASS} resize-y`

export function BlogFormFields({
	state,
	authorOptions,
	tagOptions,
	enableTitleAutoSlug
}: BlogFormFieldsProps) {
	const { errors } = state

	function handleTitleBlur() {
		if (
			enableTitleAutoSlug &&
			state.slug.length === 0 &&
			state.title.length > 0
		) {
			state.setSlug(slugify(state.title))
		}
	}

	return (
		<>
			<FormFieldSet label="Title" htmlFor="title" required error={errors.title}>
				<input
					id="title"
					name="title"
					type="text"
					value={state.title}
					onChange={e => state.setTitle(e.target.value)}
					onBlur={handleTitleBlur}
					className={TEXT_INPUT_CLASS}
					aria-invalid={errors.title ? 'true' : undefined}
					aria-describedby={errors.title ? 'title-error' : undefined}
				/>
			</FormFieldSet>

			<FormFieldSet
				label="Slug"
				htmlFor="slug"
				required
				error={errors.slug}
				hint={
					enableTitleAutoSlug
						? 'Lowercase, hyphen-separated. Auto-filled from the title.'
						: 'Lowercase, hyphen-separated.'
				}
			>
				<input
					id="slug"
					name="slug"
					type="text"
					value={state.slug}
					onChange={e => state.setSlug(e.target.value)}
					className={TEXT_INPUT_CLASS}
					aria-invalid={errors.slug ? 'true' : undefined}
					aria-describedby={errors.slug ? 'slug-error' : 'slug-hint'}
				/>
			</FormFieldSet>

			<FormFieldSet
				label="Excerpt"
				htmlFor="excerpt"
				required
				error={errors.excerpt}
			>
				<textarea
					id="excerpt"
					name="excerpt"
					value={state.excerpt}
					onChange={e => state.setExcerpt(e.target.value)}
					rows={3}
					className={TEXTAREA_CLASS}
					aria-invalid={errors.excerpt ? 'true' : undefined}
					aria-describedby={errors.excerpt ? 'excerpt-error' : undefined}
				/>
			</FormFieldSet>

			<FormFieldSet
				label="Content"
				htmlFor="content"
				required
				error={errors.content}
				hint="Rich text"
			>
				<RichTextEditor
					id="content"
					value={state.content}
					onChange={state.setContent}
					ariaDescribedby={errors.content ? 'content-error' : 'content-hint'}
					ariaInvalid={errors.content ? 'true' : undefined}
				/>
			</FormFieldSet>

			<ImageUploadField
				label="Feature image"
				htmlFor="featureImage"
				hint="Optional. Upload a file or paste a URL."
				value={state.featureImage === '' ? null : state.featureImage}
				onChange={next => state.setFeatureImage(next ?? '')}
				error={errors.featureImage}
			/>

			<FormFieldSet
				label="Reading time (minutes)"
				htmlFor="readingTime"
				error={errors.readingTime}
			>
				<input
					id="readingTime"
					name="readingTime"
					type="number"
					min={1}
					max={60}
					value={state.readingTime}
					onChange={e => state.setReadingTime(Number(e.target.value))}
					className={TEXT_INPUT_CLASS}
					aria-invalid={errors.readingTime ? 'true' : undefined}
					aria-describedby={
						errors.readingTime ? 'readingTime-error' : undefined
					}
				/>
			</FormFieldSet>

			<FormFieldSet
				label="Author"
				htmlFor="authorId"
				required
				error={errors.authorId}
			>
				<select
					id="authorId"
					name="authorId"
					value={state.authorId}
					onChange={e => state.setAuthorId(e.target.value)}
					className={TEXT_INPUT_CLASS}
					aria-invalid={errors.authorId ? 'true' : undefined}
					aria-describedby={errors.authorId ? 'authorId-error' : undefined}
				>
					{authorOptions.length === 0 && (
						<option value="" disabled>
							No authors available
						</option>
					)}
					{authorOptions.map(a => (
						<option key={a.id} value={a.id}>
							{a.name}
						</option>
					))}
				</select>
			</FormFieldSet>

			<FormFieldSet
				label="Tags"
				htmlFor="tagIds"
				error={errors.tagIds}
				hint="Pick zero or more."
			>
				<div
					id="tagIds"
					role="group"
					aria-describedby={errors.tagIds ? 'tagIds-error' : 'tagIds-hint'}
					className="grid grid-cols-2 gap-2 sm:grid-cols-3"
				>
					{tagOptions.length === 0 && (
						<p className="text-sm text-muted-foreground col-span-full">
							No tags available.
						</p>
					)}
					{tagOptions.map(tag => {
						const checked = state.tagIds.includes(tag.id)
						return (
							<label
								key={tag.id}
								className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-surface-base cursor-pointer"
							>
								<input
									type="checkbox"
									name="tagIds"
									value={tag.id}
									checked={checked}
									onChange={() => state.toggleTag(tag.id)}
									className="rounded border-border"
								/>
								<span>{tag.name}</span>
							</label>
						)
					})}
				</div>
			</FormFieldSet>

			<div className="flex flex-wrap gap-6">
				<label className="inline-flex items-center gap-2 text-sm text-foreground">
					<input
						type="checkbox"
						checked={state.featured}
						onChange={e => state.setFeatured(e.target.checked)}
						className="rounded border-border"
					/>
					Featured
				</label>
				<label className="inline-flex items-center gap-2 text-sm text-foreground">
					<input
						type="checkbox"
						checked={state.published}
						onChange={e => state.setPublished(e.target.checked)}
						className="rounded border-border"
					/>
					Published
				</label>
			</div>
		</>
	)
}
