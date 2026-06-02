'use client'

/**
 * Admin Create Testimonial form (client island).
 *
 * Built on `useAppForm` from `src/hooks/form-hook.tsx`. Binds every column
 * the operator picks (name, role, company, content, rating, imageUrl,
 * videoUrl, featured, published) per CONTEXT.md 5.3.
 *
 * Image and video fields are URL-paste only per CONTEXT.md D-04 -- no
 * upload UI in this phase.
 *
 * The `published` checkbox defaults to false even though the DB default
 * is true: the admin create form intentionally yields an unpublished row
 * so the operator can review before flipping it on (CONTEXT.md 5.3 +
 * createAdminTestimonialSchema default).
 *
 * Submission seam mirrors `CreateShowcaseForm`: packs values into
 * FormData, hands them to `createTestimonialAction`, maps `{ ok: false,
 * errors }` back onto fields via `setFieldMeta`. On success the action
 * `redirect()`s into the edit page (server-side throw) so the success
 * branch is never observed here.
 */
import { revalidateLogic } from '@tanstack/react-form'
import { useState } from 'react'
import { toast } from 'sonner'
import type { z } from 'zod'
import { FormFieldSet } from '@/components/admin/FormFieldSet'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { useAppForm } from '@/hooks/form-hook'
import { createAdminTestimonialSchema } from '@/lib/schemas/admin-testimonials'
import { createTestimonialAction } from '../actions'

type FormShape = z.input<typeof createAdminTestimonialSchema>

const DEFAULTS: FormShape = {
	name: '',
	content: '',
	role: null,
	company: null,
	rating: null,
	imageUrl: null,
	videoUrl: null,
	featured: false,
	published: false
}

const INPUT_CLS =
	'w-full px-3 py-2 rounded-md border border-border bg-background text-foreground'
const TEXTAREA_CLS = INPUT_CLS

export function CreateTestimonialForm() {
	const [formError, setFormError] = useState<string | null>(null)

	const form = useAppForm({
		defaultValues: DEFAULTS,
		// Reward early, punish late: validate on submit, then revalidate on
		// change so errors clear as the user fixes them. Requires noValidate on
		// the form. Server action still validates on submit.
		validationLogic: revalidateLogic({
			mode: 'submit',
			modeAfterSubmission: 'change'
		}),
		validators: { onDynamic: createAdminTestimonialSchema },
		onSubmit: async ({ value }) => {
			setFormError(null)
			const fd = new FormData()
			for (const [k, v] of Object.entries(value)) {
				if (v === null || v === undefined) {
					continue
				}
				fd.set(k, String(v))
			}
			const result = await createTestimonialAction(fd)
			if (result && !result.ok) {
				const formMessage =
					result.errors._form ?? 'Could not create. Please try again.'
				setFormError(formMessage)
				toast.error(formMessage)
				for (const [field, fieldMessage] of Object.entries(result.errors)) {
					if (field === '_form') {
						continue
					}
					form.setFieldMeta(field as keyof FormShape, m => ({
						...m,
						errors: [fieldMessage]
					}))
				}
			}
		}
	})

	return (
		<form
			noValidate
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

			<form.AppField name="name">
				{field => (
					<FormFieldSet
						label="Name"
						htmlFor="name"
						required
						error={field.state.meta.errors[0]}
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

			<form.AppField name="role">
				{field => (
					<FormFieldSet
						label="Role"
						htmlFor="role"
						hint="e.g. CEO, Designer"
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e =>
									field.handleChange(
										e.target.value === '' ? null : e.target.value
									)
								}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="company">
				{field => (
					<FormFieldSet
						label="Company"
						htmlFor="company"
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<input
								{...aria}
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e =>
									field.handleChange(
										e.target.value === '' ? null : e.target.value
									)
								}
								onBlur={field.handleBlur}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="content">
				{field => (
					<FormFieldSet
						label="Content"
						htmlFor="content"
						required
						error={field.state.meta.errors[0]}
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

			<form.AppField name="rating">
				{field => (
					<FormFieldSet
						label="Rating"
						htmlFor="rating"
						hint="Optional. 1 to 5 stars."
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<select
								{...aria}
								className={INPUT_CLS}
								value={
									field.state.value == null ? '' : String(field.state.value)
								}
								onChange={e =>
									field.handleChange(
										e.target.value === '' ? null : Number(e.target.value)
									)
								}
								onBlur={field.handleBlur}
							>
								<option value="">No rating</option>
								<option value="5">5</option>
								<option value="4">4</option>
								<option value="3">3</option>
								<option value="2">2</option>
								<option value="1">1</option>
							</select>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="imageUrl">
				{field => (
					<ImageUploadField
						label="Image"
						htmlFor="imageUrl"
						hint="Upload a file or paste a URL."
						value={field.state.value ?? null}
						onChange={next => field.handleChange(next)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.AppField>

			<form.AppField name="videoUrl">
				{field => (
					<FormFieldSet
						label="Video URL"
						htmlFor="videoUrl"
						error={field.state.meta.errors[0]}
					>
						{aria => (
							<input
								{...aria}
								type="url"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e =>
									field.handleChange(
										e.target.value === '' ? null : e.target.value
									)
								}
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
							checked={Boolean(field.state.value)}
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
							checked={Boolean(field.state.value)}
							onChange={e => field.handleChange(e.target.checked)}
							onBlur={field.handleBlur}
						/>
						<label htmlFor="published" className="text-sm text-foreground">
							Published
						</label>
					</div>
				)}
			</form.AppField>

			<div className="flex items-center gap-3">
				<form.AppForm>
					<form.SubmitButton
						label="Create testimonial"
						loadingLabel="Creating..."
					/>
				</form.AppForm>
			</div>
		</form>
	)
}
