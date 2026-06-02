'use client'

/**
 * Admin Create Showcase form (client island).
 *
 * Thin wrapper around `useShowcaseForm` + `ShowcaseFormFields`. State,
 * FormData packing, and field markup are shared with EditShowcaseForm;
 * this file owns only the empty defaults, the title-blur auto-slug
 * toggle, the create-vs-save copy, and the bound Server Action.
 *
 * On success the action `redirect()`s into the edit page (server-side
 * throw), so the success branch is never observed here — no `onSuccess`
 * callback is needed.
 */
import { ShowcaseFormFields } from '../_form/ShowcaseFormFields'
import {
	type ShowcaseFormShape,
	useShowcaseForm
} from '../_form/useShowcaseForm'
import { createShowcaseAction } from '../actions'

const DEFAULTS: ShowcaseFormShape = {
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

export function CreateShowcaseForm() {
	const { form, formError } = useShowcaseForm({
		mode: 'create',
		defaultValues: DEFAULTS,
		submitAction: createShowcaseAction,
		errorFallback: 'Could not create. Please try again.'
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

			<ShowcaseFormFields form={form} enableTitleAutoSlug />

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
