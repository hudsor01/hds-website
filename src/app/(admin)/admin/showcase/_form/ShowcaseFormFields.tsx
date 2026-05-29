'use client'

/**
 * Shared field markup for CreateShowcaseForm + EditShowcaseForm.
 *
 * Both outer forms own the `<form>` wrapper, submit handler, error
 * banner, and (for edit) the DeleteButton + "Saved." banner — so this
 * component renders only the per-field markup between them.
 *
 * `enableTitleAutoSlug` toggles the create-time convenience of filling
 * `slug` from `title` on blur when slug is still empty (CONTEXT.md
 * D-09). Edit does not auto-fill: editing a slug is an explicit
 * operator decision.
 */
import { FormFieldSet } from '@/components/admin/FormFieldSet'
import { ImageGalleryField } from '@/components/admin/ImageGalleryField'
import { ImageUploadField } from '@/components/admin/ImageUploadField'
import { slugify } from '@/lib/admin/slugify'
import type { ShowcaseFormShape } from './useShowcaseForm'

const INPUT_CLS =
	'w-full px-3 py-2 rounded-md border border-border bg-background text-foreground'
const TEXTAREA_CLS = INPUT_CLS

interface ShowcaseFormFieldsProps {
	// TanStack Form instance over ShowcaseFormShape. Typing the useAppForm
	// return is awkward across the AppField/AppForm boundary; the generic
	// param is enforced via `name={k}` lookups below.
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form generic
	form: any
	enableTitleAutoSlug: boolean
}

export function ShowcaseFormFields({
	form,
	enableTitleAutoSlug
}: ShowcaseFormFieldsProps) {
	return (
		<>
			<form.AppField name="title">
				{(field: {
					state: { value: string; meta: { errors: string[] } }
					handleChange: (v: string) => void
					handleBlur: () => void
				}) => (
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
									if (!enableTitleAutoSlug) {
										return
									}
									const currentSlug = form.getFieldValue(
										'slug' as keyof ShowcaseFormShape
									)
									if (!currentSlug && field.state.value) {
										form.setFieldValue(
											'slug' as keyof ShowcaseFormShape,
											slugify(field.state.value)
										)
									}
								}}
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="slug">
				{(field: {
					state: { value: string; meta: { errors: string[] } }
					handleChange: (v: string) => void
					handleBlur: () => void
				}) => (
					<FormFieldSet
						label="Slug"
						htmlFor="slug"
						required
						hint={
							enableTitleAutoSlug
								? 'Lowercase letters, numbers, hyphens. Auto-filled from title.'
								: 'Lowercase letters, numbers, hyphens.'
						}
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

			<form.AppField name="description">
				{(field: {
					state: { value: string; meta: { errors: string[] } }
					handleChange: (v: string) => void
					handleBlur: () => void
				}) => (
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
							/>
						)}
					</FormFieldSet>
				)}
			</form.AppField>

			<form.AppField name="showcaseType">
				{(field: {
					state: { value: 'quick' | 'detailed' }
					handleChange: (v: 'quick' | 'detailed') => void
				}) => (
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

			<TextareaField
				form={form}
				name="longDescription"
				label="Long description"
				hint="Markdown allowed. Shown on the detail page."
				rows={6}
			/>
			<TextField form={form} name="clientName" label="Client name" />
			<TextField form={form} name="industry" label="Industry" />
			<TextField form={form} name="projectType" label="Project type" />
			<TextField form={form} name="category" label="Category" />
			<TextareaField form={form} name="challenge" label="Challenge" rows={4} />
			<TextareaField form={form} name="solution" label="Solution" rows={4} />
			<TextareaField form={form} name="results" label="Results" rows={4} />

			<form.AppField name="imageUrl">
				{(field: {
					state: { value: string | null; meta: { errors: string[] } }
					handleChange: (v: string | null) => void
				}) => (
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
				{(field: {
					state: { value: string | null; meta: { errors: string[] } }
					handleChange: (v: string | null) => void
				}) => (
					<ImageUploadField
						label="OG image"
						htmlFor="ogImageUrl"
						value={field.state.value}
						onChange={next => field.handleChange(next)}
						error={field.state.meta.errors[0]}
					/>
				)}
			</form.AppField>

			<TextField
				form={form}
				name="gradientClass"
				label="Gradient class"
				hint="Tailwind utility classes used for the card background."
			/>
			<UrlField form={form} name="externalLink" label="External link" />
			<UrlField form={form} name="githubLink" label="GitHub link" />
			<TextareaField
				form={form}
				name="testimonialText"
				label="Testimonial text"
				rows={3}
			/>
			<TextField
				form={form}
				name="testimonialAuthor"
				label="Testimonial author"
			/>
			<TextField form={form} name="testimonialRole" label="Testimonial role" />
			<UrlField
				form={form}
				name="testimonialVideoUrl"
				label="Testimonial video URL"
			/>
			<TextField form={form} name="projectDuration" label="Project duration" />

			<form.AppField name="teamSize">
				{(field: {
					state: { value: number | null; meta: { errors: string[] } }
					handleChange: (v: number | null) => void
					handleBlur: () => void
				}) => (
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
				{(field: {
					state: { value: string[]; meta: { errors: string[] } }
					handleChange: (v: string[]) => void
					handleBlur: () => void
				}) => (
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
				{(field: {
					state: { value: string[]; meta: { errors: string[] } }
					handleChange: (v: string[]) => void
				}) => (
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
				{(field: {
					state: {
						value: Record<string, string>
						meta: { errors: string[] }
					}
					handleChange: (v: Record<string, string>) => void
					handleBlur: () => void
				}) => (
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

			<CheckboxField form={form} name="featured" label="Featured" />
			<CheckboxField form={form} name="published" label="Published" />

			<form.AppField name="displayOrder">
				{(field: {
					state: { value: number; meta: { errors: string[] } }
					handleChange: (v: number) => void
					handleBlur: () => void
				}) => (
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
		</>
	)
}

// ────────────────────────────────────────────────────────────────────
// Field shortcuts for the bulk of single-line / textarea inputs whose
// markup is identical except for the FormFieldSet props. Reduces 24
// near-duplicate AppField blocks to single-line invocations above.
// ────────────────────────────────────────────────────────────────────

interface SharedFieldProps {
	// biome-ignore lint/suspicious/noExplicitAny: TanStack Form instance type
	form: any
	name: keyof ShowcaseFormShape
	label: string
	hint?: string
}

function TextField({ form, name, label, hint }: SharedFieldProps) {
	return (
		<form.AppField name={name}>
			{(field: {
				state: { value: string | null; meta: { errors: string[] } }
				handleChange: (v: string | null) => void
				handleBlur: () => void
			}) => (
				<FormFieldSet
					label={label}
					htmlFor={String(name)}
					hint={hint}
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
	)
}

function TextareaField({
	form,
	name,
	label,
	hint,
	rows
}: SharedFieldProps & { rows: number }) {
	return (
		<form.AppField name={name}>
			{(field: {
				state: { value: string | null; meta: { errors: string[] } }
				handleChange: (v: string | null) => void
				handleBlur: () => void
			}) => (
				<FormFieldSet
					label={label}
					htmlFor={String(name)}
					hint={hint}
					error={field.state.meta.errors[0]}
				>
					{aria => (
						<textarea
							{...aria}
							rows={rows}
							className={TEXTAREA_CLS}
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
	)
}

function UrlField({ form, name, label, hint }: SharedFieldProps) {
	return (
		<form.AppField name={name}>
			{(field: {
				state: { value: string | null; meta: { errors: string[] } }
				handleChange: (v: string | null) => void
				handleBlur: () => void
			}) => (
				<FormFieldSet
					label={label}
					htmlFor={String(name)}
					hint={hint}
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
	)
}

function CheckboxField({ form, name, label }: SharedFieldProps) {
	return (
		<form.AppField name={name}>
			{(field: {
				state: { value: boolean }
				handleChange: (v: boolean) => void
				handleBlur: () => void
			}) => (
				<div className="flex items-center gap-2">
					<input
						id={String(name)}
						type="checkbox"
						className="h-4 w-4 rounded border-border"
						checked={field.state.value ?? false}
						onChange={e => field.handleChange(e.target.checked)}
						onBlur={field.handleBlur}
					/>
					<label htmlFor={String(name)} className="text-sm text-foreground">
						{label}
					</label>
				</div>
			)}
		</form.AppField>
	)
}
