'use client'

/**
 * Admin Edit Testimonial form (client island).
 *
 * Mirrors `CreateTestimonialForm` but pre-fills from the loaded row,
 * binds to `updateTestimonialAction`, and surfaces the DeleteButton
 * after the submit row. The Server Action redirects back to the list on
 * delete success.
 *
 * Defaults read straight from the row; null columns become empty strings
 * for inputs and `null` for the rating select.
 */
import { useState } from 'react'
import { toast } from 'sonner'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { FormFieldSet } from '@/components/admin/FormFieldSet'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { useAppForm } from '@/hooks/form-hook'
import type { TestimonialRow } from '@/lib/admin/testimonials-queries'
import { deleteTestimonialAction, updateTestimonialAction } from '../../actions'

interface EditTestimonialFormProps {
	row: TestimonialRow
}

interface FormShape {
	id: string
	name: string
	content: string
	role: string | null
	company: string | null
	rating: number | null
	imageUrl: string | null
	videoUrl: string | null
	featured: boolean
	published: boolean
}

const INPUT_CLS =
	'w-full px-3 py-2 rounded-md border border-border bg-background text-foreground'
const TEXTAREA_CLS = INPUT_CLS

export function EditTestimonialForm({ row }: EditTestimonialFormProps) {
	const [formError, setFormError] = useState<string | null>(null)
	const [savedAt, setSavedAt] = useState<number | null>(null)

	const defaults: FormShape = {
		id: row.id,
		name: row.name,
		content: row.content,
		role: row.role ?? null,
		company: row.company ?? null,
		rating: row.rating ?? null,
		imageUrl: row.imageUrl ?? null,
		videoUrl: row.videoUrl ?? null,
		featured: row.featured ?? false,
		published: row.published ?? false
	}

	const form = useAppForm({
		defaultValues: defaults,
		onSubmit: async ({ value }) => {
			setFormError(null)
			const fd = new FormData()
			for (const [k, v] of Object.entries(value)) {
				if (v === null || v === undefined) {
					continue
				}
				fd.set(k, String(v))
			}
			const result = await updateTestimonialAction(fd)
			if (result && !result.ok) {
				const formMessage =
					result.errors._form ?? 'Could not save. Please try again.'
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
			} else if (result?.ok) {
				setSavedAt(Date.now())
			}
		}
	})

	return (
		<div className="space-y-8">
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
				{savedAt !== null && (
					<p role="status" className="text-sm text-success-text">
						Saved.
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
						<form.SubmitButton label="Save" loadingLabel="Saving..." />
					</form.AppForm>
				</div>
			</form>

			<div className="pt-6 border-t border-border max-w-2xl">
				<DeleteButton
					action={deleteTestimonialAction}
					id={row.id}
					label="Delete testimonial"
					confirmMessage={`Delete testimonial from "${row.name}"? This cannot be undone.`}
				/>
			</div>
		</div>
	)
}
