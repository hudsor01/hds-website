'use client'

/**
 * Admin Edit Showcase form (client island).
 *
 * Thin wrapper around `useShowcaseForm` + `ShowcaseFormFields`. State,
 * FormData packing, and field markup are shared with CreateShowcaseForm;
 * this file owns the row-derived initial values, the save-vs-create
 * copy, the bound update + delete actions, the "Saved." flash banner,
 * and the DeleteButton rendered outside the <form> so a stray submit
 * cannot trigger the delete action.
 *
 * Slug auto-fill on title blur is disabled here per CONTEXT.md D-09:
 * editing a slug is an explicit operator decision.
 */
import { useState } from 'react'
import { DeleteButton } from '@/components/admin/DeleteButton'
import type { ShowcaseRow } from '@/lib/admin/showcase-queries'
import { ShowcaseFormFields } from '../../_form/ShowcaseFormFields'
import {
	type ShowcaseFormShape,
	useShowcaseForm
} from '../../_form/useShowcaseForm'
import { deleteShowcaseAction, updateShowcaseAction } from '../../actions'

interface EditShowcaseFormProps {
	row: ShowcaseRow
}

function rowToFormShape(row: ShowcaseRow): ShowcaseFormShape {
	return {
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

export function EditShowcaseForm({ row }: EditShowcaseFormProps) {
	const [savedAt, setSavedAt] = useState<number | null>(null)

	const { form, formError } = useShowcaseForm({
		defaultValues: rowToFormShape(row),
		submitAction: updateShowcaseAction,
		extraFormData: { id: row.id },
		errorFallback: 'Could not save. Please try again.',
		onSuccess: () => setSavedAt(Date.now())
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

				<ShowcaseFormFields form={form} enableTitleAutoSlug={false} />

				<div className="flex items-center gap-3">
					<form.AppForm>
						<form.SubmitButton label="Save changes" loadingLabel="Saving..." />
					</form.AppForm>
				</div>
			</form>

			<div className="border-t border-border pt-6 max-w-2xl">
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
