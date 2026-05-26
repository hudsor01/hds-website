'use client'

/**
 * Admin Create Showcase form (client island).
 *
 * Built on `useAppForm` from `src/hooks/form-hook.tsx`. Every column from
 * the `showcase` Drizzle table is bound to a form field, per CONTEXT.md
 * section 5.1 (no scope-reduction "v1 with only required fields").
 *
 * Slug auto-fill (D-09):
 *  - On title blur, if the slug field is still empty, fill it via
 *    `slugify(title)`. Operator can still type a custom slug at any time.
 *
 * Submission seam:
 *  - Walks the form values, packs them into FormData (arrays joined with
 *    newlines, plain objects JSON-stringified), and hands the FormData to
 *    `createShowcaseAction`. On `{ ok: false, errors }` we map server-side
 *    field errors back onto the form via `setFieldMeta` and surface any
 *    `_form` error as a banner above the submit button.
 *  - On success the Server Action `redirect()`s straight into the edit
 *    page (server-side throw), so the success branch is never observed
 *    here.
 */
import { useState } from 'react'
import { FormFieldSet } from '@/components/admin/FormFieldSet'
import { ImageGalleryField } from '@/components/admin/ImageGalleryField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { useAppForm } from '@/hooks/form-hook'
import { slugify } from '@/lib/admin/slugify'
import { createShowcaseAction } from '../actions'

// Form shape mirrors the parsed shape of `createShowcaseSchema` but with
// concrete (non-optional) defaults so TanStack Form's field bindings have a
// stable value type to render. Optional text columns keep `null` as their
// resting state so the operator can clear a field and have the Server Action
// coerce empty -> null in `coerceFormFields` before Zod parses it back out.
type FormShape = {
	slug: string
	title: string
	description: string
	showcaseType: 'quick' | 'detailed'
	longDescription: string | null
	clientName: string | null
	industry: string | null
	projectType: string | null
	category: string | null
	challenge: string | null
	solution: string | null
	results: string | null
	imageUrl: string | null
	ogImageUrl: string | null
	gradientClass: string | null
	externalLink: string | null
	githubLink: string | null
	testimonialText: string | null
	testimonialAuthor: string | null
	testimonialRole: string | null
	testimonialVideoUrl: string | null
	projectDuration: string | null
	teamSize: number | null
	technologies: string[]
	metrics: Record<string, string>
	galleryImages: string[]
	featured: boolean
	published: boolean
	displayOrder: number
}

const DEFAULTS: FormShape = {
	slug: '',
	title: '',
	description: '',
	showcaseType: 'quick',
	longDescription: null,
	clientName: null,
	industry: null,
	projectType: null,
	category: null,
	challenge: null,
	solution: null,
	results: null,
	imageUrl: null,
	ogImageUrl: null,
	gradientClass: null,
	externalLink: null,
	githubLink: null,
	testimonialText: null,
	testimonialAuthor: null,
	testimonialRole: null,
	testimonialVideoUrl: null,
	projectDuration: null,
	teamSize: null,
	technologies: [],
	metrics: {},
	galleryImages: [],
	featured: false,
	published: false,
	displayOrder: 0
}

const INPUT_CLS =
	'w-full px-3 py-2 rounded-md border border-border bg-background text-foreground'
const TEXTAREA_CLS = INPUT_CLS

export function CreateShowcaseForm() {
	const [formError, setFormError] = useState<string | null>(null)

	const form = useAppForm({
		defaultValues: DEFAULTS,
		onSubmit: async ({ value }) => {
			setFormError(null)
			const fd = new FormData()
			for (const [k, v] of Object.entries(value)) {
				if (v === null || v === undefined) {
					continue
				}
				if (Array.isArray(v)) {
					fd.set(k, (v as string[]).join('\n'))
				} else if (typeof v === 'object') {
					fd.set(k, JSON.stringify(v))
				} else {
					fd.set(k, String(v))
				}
			}
			const result = await createShowcaseAction(fd)
			if (result && !result.ok) {
				setFormError(
					result.errors._form ?? 'Could not create. Please try again.'
				)
				for (const [field, message] of Object.entries(result.errors)) {
					if (field === '_form') {
						continue
					}
					form.setFieldMeta(field as keyof FormShape, m => ({
						...m,
						errors: [message]
					}))
				}
			}
		}
	})

	return (
		<form
			onSubmit={e => {
				e.preventDefault()
				void form.handleSubmit()
			}}
			className="space-y-6 max-w-2xl"
		>
			{formError && (
				<p role="alert" className="text-sm text-destructive">
					{formError}
				</p>
			)}

			<form.AppField name="title">
				{field => (
					<FormFieldSet
						label="Title"
						htmlFor="title"
						required
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={() => {
									field.handleBlur()
									const slug = form.getFieldValue('slug')
									if (!slug && field.state.value) {
										form.setFieldValue('slug', slugify(field.state.value))
									}
								}}
								required
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="slug">
				{field => (
					<FormFieldSet
						label="Slug"
						htmlFor="slug"
						required
						hint="Lowercase letters, numbers, hyphens. Auto-filled from title."
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								required
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="description">
				{field => (
					<FormFieldSet
						label="Description"
						htmlFor="description"
						required
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<textarea
								{...aria}
								rows={3}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								required
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="showcaseType">
				{field => (
					<FormFieldSet label="Type" htmlFor="showcaseType" required>
						{aria => (
							<select
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? 'quick'}
								onChange={e =>
									field.handleChange(e.target.value as 'quick' | 'detailed')
								}
							>
								<option value="quick">Quick (portfolio)</option>
								<option value="detailed">Detailed (case study)</option>
							</select>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="longDescription">
				{field => (
					<FormFieldSet
						label="Long description"
						htmlFor="longDescription"
						hint="Markdown allowed. Shown on the detail page."
					>
						{aria => (
							<textarea
								{...aria}
								rows={6}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="clientName">
				{field => (
					<FormFieldSet label="Client name" htmlFor="clientName">
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="industry">
				{field => (
					<FormFieldSet label="Industry" htmlFor="industry">
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="projectType">
				{field => (
					<FormFieldSet label="Project type" htmlFor="projectType">
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="category">
				{field => (
					<FormFieldSet label="Category" htmlFor="category">
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="challenge">
				{field => (
					<FormFieldSet label="Challenge" htmlFor="challenge">
						{aria => (
							<textarea
								{...aria}
								rows={4}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="solution">
				{field => (
					<FormFieldSet label="Solution" htmlFor="solution">
						{aria => (
							<textarea
								{...aria}
								rows={4}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="results">
				{field => (
					<FormFieldSet label="Results" htmlFor="results">
						{aria => (
							<textarea
								{...aria}
								rows={4}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="imageUrl">
				{field => (
					<ImageUploadField
						label="Image"
						htmlFor="imageUrl"
						value={field.state.value}
						onChange={next => field.handleChange(next)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.AppField>

			<form.AppField name="ogImageUrl">
				{field => (
					<ImageUploadField
						label="OG image"
						htmlFor="ogImageUrl"
						value={field.state.value}
						onChange={next => field.handleChange(next)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.AppField>

			<form.AppField name="gradientClass">
				{field => (
					<FormFieldSet
						label="Gradient class"
						htmlFor="gradientClass"
						hint="Tailwind utility classes used for the card background."
					>
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="externalLink">
				{field => (
					<FormFieldSet
						label="External link"
						htmlFor="externalLink"
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<input
								{...aria}
								type="url"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="githubLink">
				{field => (
					<FormFieldSet
						label="GitHub link"
						htmlFor="githubLink"
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<input
								{...aria}
								type="url"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="testimonialText">
				{field => (
					<FormFieldSet label="Testimonial text" htmlFor="testimonialText">
						{aria => (
							<textarea
								{...aria}
								rows={3}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="testimonialAuthor">
				{field => (
					<FormFieldSet label="Testimonial author" htmlFor="testimonialAuthor">
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="testimonialRole">
				{field => (
					<FormFieldSet label="Testimonial role" htmlFor="testimonialRole">
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="testimonialVideoUrl">
				{field => (
					<FormFieldSet
						label="Testimonial video URL"
						htmlFor="testimonialVideoUrl"
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<input
								{...aria}
								type="url"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="projectDuration">
				{field => (
					<FormFieldSet label="Project duration" htmlFor="projectDuration">
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="teamSize">
				{field => (
					<FormFieldSet
						label="Team size"
						htmlFor="teamSize"
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<input
								{...aria}
								type="number"
								min={1}
								max={1000}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e =>
									field.handleChange(
										e.target.value === '' ? null : Number(e.target.value)
									)
								}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="technologies">
				{field => (
					<FormFieldSet
						label="Technologies"
						htmlFor="technologies"
						hint="One per line."
					>
						{aria => (
							<textarea
								{...aria}
								rows={4}
								className={TEXTAREA_CLS}
								value={(field.state.value ?? []).join('\n')}
								onChange={e =>
									field.handleChange(
										e.target.value
											.split('\n')
											.map(s => s.trim())
											.filter(Boolean)
									)
								}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="galleryImages">
				{field => (
					<ImageGalleryField
						label="Gallery images"
						htmlFor="galleryImages"
						hint="Upload files or paste URLs."
						values={field.state.value ?? []}
						onChange={next => field.handleChange(next)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.AppField>

			<form.AppField name="metrics">
				{field => (
					<FormFieldSet
						label="Metrics (JSON object)"
						htmlFor="metrics"
						hint='Example: {"users":"10k","uptime":"99.9%"}'
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<textarea
								{...aria}
								rows={4}
								className={TEXTAREA_CLS}
								value={JSON.stringify(field.state.value ?? {}, null, 2)}
								onChange={e => {
									try {
										const parsed = JSON.parse(e.target.value)
										if (
											parsed &&
											typeof parsed === 'object' &&
											!Array.isArray(parsed)
										) {
											field.handleChange(parsed as Record<string, string>)
										}
									} catch {
										// invalid JSON: ignore until next valid edit
									}
								}}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="featured">
				{field => (
					<div className="flex items-center gap-2">
						<input
							id="featured"
							type="checkbox"
							className="h-4 w-4 rounded border-border"
							checked={field.state.value ?? false}
							onChange={e => field.handleChange(e.target.checked)}
							onBlur={field.handleBlur}
						/>
						<label htmlFor="featured" className="text-sm text-foreground">
							Featured
						</label>
					</div>
				)}
			</form.AppField>

			<form.AppField name="published">
				{field => (
					<div className="flex items-center gap-2">
						<input
							id="published"
							type="checkbox"
							className="h-4 w-4 rounded border-border"
							checked={field.state.value ?? false}
							onChange={e => field.handleChange(e.target.checked)}
							onBlur={field.handleBlur}
						/>
						<label htmlFor="published" className="text-sm text-foreground">
							Published
						</label>
					</div>
				)}
			</form.AppField>

			<form.AppField name="displayOrder">
				{field => (
					<FormFieldSet
						label="Display order"
						htmlFor="displayOrder"
						hint="Lower numbers appear first."
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<input
								{...aria}
								type="number"
								min={0}
								className={INPUT_CLS}
								value={field.state.value ?? 0}
								onChange={e => field.handleChange(Number(e.target.value))}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<div className="flex items-center gap-3">
				<form.AppForm>
					<form.SubmitButton
						label="Create showcase"
						loadingLabel="Creating..."
					/>
				</form.AppForm>
			</div>
		</form>
	)
}
