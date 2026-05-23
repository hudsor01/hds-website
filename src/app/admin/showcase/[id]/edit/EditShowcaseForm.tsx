'use client'

/**
 * Admin Edit Showcase form (client island).
 *
 * Mirrors CreateShowcaseForm in shape but:
 *  - `defaultValues` come from the row prop (typed `ShowcaseRow` from the
 *    admin query layer).
 *  - Calls `updateShowcaseAction` instead of create. Stays on the page
 *    after a successful save (sets a small "Saved." banner) so the
 *    operator does not lose scroll position.
 *  - Does NOT auto-slugify on title blur (D-09: edit form leaves slug
 *    alone unless the operator changes it manually).
 *  - Renders a `<DeleteButton>` outside the form, wired to
 *    `deleteShowcaseAction`. Native window.confirm gates the click.
 *
 * Every column from the `showcase` table is bound to a field, same as
 * CreateShowcaseForm (anti-scope-reduction gate from CONTEXT.md 5.1).
 */
import { useState } from 'react'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { FormFieldSet } from '@/components/admin/FormFieldSet'
import { useAppForm } from '@/hooks/form-hook'
import type { ShowcaseRow } from '@/lib/admin/showcase-queries'
import { deleteShowcaseAction, updateShowcaseAction } from '../../actions'

const INPUT_CLS =
	'w-full px-3 py-2 rounded-md border border-border bg-background text-foreground'
const TEXTAREA_CLS = INPUT_CLS

type FormShape = {
	id: string
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

function rowToFormShape(row: ShowcaseRow): FormShape {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		description: row.description,
		showcaseType: (row.showcaseType ?? 'quick') as 'quick' | 'detailed',
		longDescription: row.longDescription,
		clientName: row.clientName,
		industry: row.industry,
		projectType: row.projectType,
		category: row.category,
		challenge: row.challenge,
		solution: row.solution,
		results: row.results,
		imageUrl: row.imageUrl,
		ogImageUrl: row.ogImageUrl,
		gradientClass: row.gradientClass,
		externalLink: row.externalLink,
		githubLink: row.githubLink,
		testimonialText: row.testimonialText,
		testimonialAuthor: row.testimonialAuthor,
		testimonialRole: row.testimonialRole,
		testimonialVideoUrl: row.testimonialVideoUrl,
		projectDuration: row.projectDuration,
		teamSize: row.teamSize,
		technologies: (row.technologies as string[] | null) ?? [],
		metrics: (row.metrics as Record<string, string> | null) ?? {},
		galleryImages: (row.galleryImages as string[] | null) ?? [],
		featured: row.featured ?? false,
		published: row.published ?? false,
		displayOrder: row.displayOrder ?? 0
	}
}

interface EditShowcaseFormProps {
	row: ShowcaseRow
}

export function EditShowcaseForm({ row }: EditShowcaseFormProps) {
	const [formError, setFormError] = useState<string | null>(null)
	const [savedAt, setSavedAt] = useState<number | null>(null)

	const form = useAppForm({
		defaultValues: rowToFormShape(row),
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
			const result = await updateShowcaseAction(fd)
			if (result?.ok) {
				setSavedAt(Date.now())
				return
			}
			if (result && !result.ok) {
				setFormError(result.errors._form ?? 'Could not save. Please try again.')
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
		<div className="space-y-6">
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
				{savedAt && !formError && (
					<p key={savedAt} role="status" className="text-sm text-accent-text">
						Saved.
					</p>
				)}

				<input type="hidden" name="id" value={row.id} />

				<form.AppField name="title">
					{field => (
						<FormFieldSet
							label="Title"
							htmlFor="title"
							required
							error={field.state.meta.errors[0]}
						>
							<input
								id="title"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								required
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="slug">
					{field => (
						<FormFieldSet
							label="Slug"
							htmlFor="slug"
							required
							hint="Lowercase letters, numbers, hyphens."
							error={field.state.meta.errors[0]}
						>
							<input
								id="slug"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								required
							/>
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
							<textarea
								id="description"
								rows={3}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								required
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="showcaseType">
					{field => (
						<FormFieldSet label="Type" htmlFor="showcaseType" required>
							<select
								id="showcaseType"
								className={INPUT_CLS}
								value={field.state.value ?? 'quick'}
								onChange={e =>
									field.handleChange(e.target.value as 'quick' | 'detailed')
								}
							>
								<option value="quick">Quick (portfolio)</option>
								<option value="detailed">Detailed (case study)</option>
							</select>
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
							<textarea
								id="longDescription"
								rows={6}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="clientName">
					{field => (
						<FormFieldSet label="Client name" htmlFor="clientName">
							<input
								id="clientName"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="industry">
					{field => (
						<FormFieldSet label="Industry" htmlFor="industry">
							<input
								id="industry"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="projectType">
					{field => (
						<FormFieldSet label="Project type" htmlFor="projectType">
							<input
								id="projectType"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="category">
					{field => (
						<FormFieldSet label="Category" htmlFor="category">
							<input
								id="category"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="challenge">
					{field => (
						<FormFieldSet label="Challenge" htmlFor="challenge">
							<textarea
								id="challenge"
								rows={4}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="solution">
					{field => (
						<FormFieldSet label="Solution" htmlFor="solution">
							<textarea
								id="solution"
								rows={4}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="results">
					{field => (
						<FormFieldSet label="Results" htmlFor="results">
							<textarea
								id="results"
								rows={4}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="imageUrl">
					{field => (
						<FormFieldSet
							label="Image URL"
							htmlFor="imageUrl"
							error={field.state.meta.errors[0]}
						>
							<input
								id="imageUrl"
								type="url"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="ogImageUrl">
					{field => (
						<FormFieldSet
							label="OG image URL"
							htmlFor="ogImageUrl"
							error={field.state.meta.errors[0]}
						>
							<input
								id="ogImageUrl"
								type="url"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="gradientClass">
					{field => (
						<FormFieldSet
							label="Gradient class"
							htmlFor="gradientClass"
							hint="Tailwind utility classes used for the card background."
						>
							<input
								id="gradientClass"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
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
							<input
								id="externalLink"
								type="url"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
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
							<input
								id="githubLink"
								type="url"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="testimonialText">
					{field => (
						<FormFieldSet label="Testimonial text" htmlFor="testimonialText">
							<textarea
								id="testimonialText"
								rows={3}
								className={TEXTAREA_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="testimonialAuthor">
					{field => (
						<FormFieldSet
							label="Testimonial author"
							htmlFor="testimonialAuthor"
						>
							<input
								id="testimonialAuthor"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="testimonialRole">
					{field => (
						<FormFieldSet label="Testimonial role" htmlFor="testimonialRole">
							<input
								id="testimonialRole"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
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
							<input
								id="testimonialVideoUrl"
								type="url"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="projectDuration">
					{field => (
						<FormFieldSet label="Project duration" htmlFor="projectDuration">
							<input
								id="projectDuration"
								className={INPUT_CLS}
								value={field.state.value ?? ''}
								onChange={e => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
							/>
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
							<input
								id="teamSize"
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
							<textarea
								id="technologies"
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
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="galleryImages">
					{field => (
						<FormFieldSet
							label="Gallery image URLs"
							htmlFor="galleryImages"
							hint="One URL per line."
							error={field.state.meta.errors[0]}
						>
							<textarea
								id="galleryImages"
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
						</FormFieldSet>
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
							<textarea
								id="metrics"
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
							<input
								id="displayOrder"
								type="number"
								min={0}
								className={INPUT_CLS}
								value={field.state.value ?? 0}
								onChange={e => field.handleChange(Number(e.target.value))}
								onBlur={field.handleBlur}
							/>
						</FormFieldSet>
					)}
				</form.AppField>

				<div className="flex items-center gap-3">
					<form.AppForm>
						<form.SubmitButton label="Save changes" loadingLabel="Saving..." />
					</form.AppForm>
				</div>
			</form>

			<div className="pt-4 border-t border-border max-w-2xl">
				<DeleteButton
					action={deleteShowcaseAction}
					id={row.id}
					label="Delete showcase"
					confirmMessage={`Delete "${row.title}"? This cannot be undone.`}
				/>
			</div>
		</div>
	)
}
