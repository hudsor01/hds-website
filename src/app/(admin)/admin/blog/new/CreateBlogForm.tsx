'use client'

/**
 * Admin "New post" form (client component).
 *
 * State lives in `useState` rather than `useAppForm` because the existing
 * form factory does not own a checkbox-grid field type and we need fine
 * control over the FormData payload (e.g. boolean checkboxes must be
 * encoded as the literal string 'true' / 'false' so the action's
 * `z.coerce.boolean()` parses them correctly without falling back to
 * defaults). On title blur with an empty slug we fill via `slugify(title)`
 * per CONTEXT.md D-09. Tag selection is a checkbox grid; the action
 * receives `tagIds` as a repeated FormData key which `formDataToObject`
 * collects into a string[].
 */
import { useState, useTransition } from 'react'
import { FormFieldSet } from '@/components/admin/FormFieldSet'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { slugify } from '@/lib/admin/slugify'
import { createBlogPostAction } from '../actions'

interface AuthorOption {
	id: string
	name: string
}

interface TagOption {
	id: string
	name: string
}

interface CreateBlogFormProps {
	authorOptions: AuthorOption[]
	tagOptions: TagOption[]
}

const TEXT_INPUT_CLASS =
	'block w-full rounded-md border border-border bg-surface-base px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised'

const TEXTAREA_CLASS = `${TEXT_INPUT_CLASS} resize-y`
const CODE_TEXTAREA_CLASS = `${TEXTAREA_CLASS} font-mono`

export function CreateBlogForm({
	authorOptions,
	tagOptions
}: CreateBlogFormProps) {
	const [title, setTitle] = useState('')
	const [slug, setSlug] = useState('')
	const [excerpt, setExcerpt] = useState('')
	const [content, setContent] = useState('')
	const [featureImage, setFeatureImage] = useState('')
	const [readingTime, setReadingTime] = useState(5)
	const [authorId, setAuthorId] = useState(authorOptions[0]?.id ?? '')
	const [tagIds, setTagIds] = useState<string[]>([])
	const [featured, setFeatured] = useState(false)
	const [published, setPublished] = useState(true)

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [isPending, startTransition] = useTransition()

	function handleTitleBlur() {
		if (slug.length === 0 && title.length > 0) {
			setSlug(slugify(title))
		}
	}

	function toggleTag(id: string) {
		setTagIds(prev =>
			prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
		)
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setErrors({})
		const formData = new FormData()
		formData.append('title', title)
		formData.append('slug', slug)
		formData.append('excerpt', excerpt)
		formData.append('content', content)
		formData.append('featureImage', featureImage)
		formData.append('readingTime', String(readingTime))
		formData.append('authorId', authorId)
		formData.append('featured', featured ? 'true' : 'false')
		formData.append('published', published ? 'true' : 'false')
		for (const id of tagIds) {
			formData.append('tagIds', id)
		}
		startTransition(async () => {
			const result = await createBlogPostAction(formData)
			if (result && result.ok === false) {
				setErrors(result.errors)
			}
		})
	}

	const formError = errors._form

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

			<FormFieldSet label="Title" htmlFor="title" required error={errors.title}>
				<input
					id="title"
					name="title"
					type="text"
					value={title}
					onChange={e => setTitle(e.target.value)}
					onBlur={handleTitleBlur}
					required
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
				hint="Lowercase, hyphen-separated. Auto-filled from the title."
			>
				<input
					id="slug"
					name="slug"
					type="text"
					value={slug}
					onChange={e => setSlug(e.target.value)}
					required
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
					value={excerpt}
					onChange={e => setExcerpt(e.target.value)}
					rows={3}
					required
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
				hint="Markdown"
			>
				<textarea
					id="content"
					name="content"
					value={content}
					onChange={e => setContent(e.target.value)}
					rows={18}
					required
					className={CODE_TEXTAREA_CLASS}
					aria-invalid={errors.content ? 'true' : undefined}
					aria-describedby={errors.content ? 'content-error' : 'content-hint'}
				/>
			</FormFieldSet>

			<ImageUploadField
				label="Feature image"
				htmlFor="featureImage"
				hint="Optional. Upload a file or paste a URL."
				value={featureImage === '' ? null : featureImage}
				onChange={next => setFeatureImage(next ?? '')}
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
					value={readingTime}
					onChange={e => setReadingTime(Number(e.target.value))}
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
					value={authorId}
					onChange={e => setAuthorId(e.target.value)}
					required
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
						const checked = tagIds.includes(tag.id)
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
									onChange={() => toggleTag(tag.id)}
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
						checked={featured}
						onChange={e => setFeatured(e.target.checked)}
						className="rounded border-border"
					/>
					Featured
				</label>
				<label className="inline-flex items-center gap-2 text-sm text-foreground">
					<input
						type="checkbox"
						checked={published}
						onChange={e => setPublished(e.target.checked)}
						className="rounded border-border"
					/>
					Published
				</label>
			</div>

			<div className="flex items-center gap-3">
				<button
					type="submit"
					disabled={isPending}
					className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-surface-base bg-accent-text hover:opacity-90 transition-smooth disabled:opacity-60"
				>
					{isPending ? 'Saving...' : 'Create post'}
				</button>
			</div>
		</form>
	)
}
