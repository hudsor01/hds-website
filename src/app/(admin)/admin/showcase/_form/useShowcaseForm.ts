'use client'

/**
 * Shared TanStack Form setup for the showcase create/edit pair.
 *
 * Both forms share the same field shape and packing logic — only the
 * Server Action binding, the initial values, the title-blur auto-slug
 * behavior, and the success-side ("stay vs. redirect") differ.
 *
 * The packer walks every value and encodes arrays as newline-joined
 * strings (matches `coerceFormFields` on the action side) and plain
 * objects as JSON. `null`/`undefined` values are skipped so the action
 * sees the missing key, not an empty string that bypasses
 * `optionalText.transform(v => v.trim() === '' ? null : v)`.
 */
import { useState } from 'react'
import { toast } from 'sonner'
import { useAppForm } from '@/hooks/form-hook'

export type ShowcaseFormShape = {
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

interface ShowcaseSubmitResult {
	ok: boolean
	errors?: Record<string, string>
}

export interface UseShowcaseFormOptions {
	defaultValues: ShowcaseFormShape
	submitAction: (fd: FormData) => Promise<ShowcaseSubmitResult | undefined>
	/**
	 * Hidden FormData fields appended on every submit, e.g. `{ id: row.id }`
	 * on the edit form. Skipped if undefined.
	 */
	extraFormData?: Record<string, string>
	/** Generic copy used in the toast + banner when the action returns `_form`. */
	errorFallback: string
	/** Called after a successful submit (edit uses this to flip the "Saved." flag). */
	onSuccess?: () => void
}

function packShowcaseFormData(
	value: ShowcaseFormShape,
	extras?: Record<string, string>
): FormData {
	const fd = new FormData()
	for (const [key, val] of Object.entries(extras ?? {})) {
		fd.set(key, val)
	}
	for (const [key, val] of Object.entries(value)) {
		if (val === null || val === undefined) {
			continue
		}
		if (Array.isArray(val)) {
			fd.set(key, (val as string[]).join('\n'))
		} else if (typeof val === 'object') {
			fd.set(key, JSON.stringify(val))
		} else {
			fd.set(key, String(val))
		}
	}
	return fd
}

export function useShowcaseForm({
	defaultValues,
	submitAction,
	extraFormData,
	errorFallback,
	onSuccess
}: UseShowcaseFormOptions) {
	const [formError, setFormError] = useState<string | null>(null)

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			setFormError(null)
			const fd = packShowcaseFormData(value, extraFormData)
			const result = await submitAction(fd)
			if (result?.ok) {
				onSuccess?.()
				return
			}
			if (result && !result.ok) {
				const errorMap = result.errors ?? {}
				const formMessage = errorMap._form ?? errorFallback
				setFormError(formMessage)
				toast.error(formMessage)
				for (const [field, fieldMessage] of Object.entries(errorMap)) {
					if (field === '_form') {
						continue
					}
					form.setFieldMeta(field as keyof ShowcaseFormShape, m => ({
						...m,
						errors: [fieldMessage]
					}))
				}
				return
			}
			// `result` is undefined. On create the action `redirect()`s on
			// success (Next.js converts the throw to a transport-level
			// navigation, so the client awaits resolve to `undefined` while
			// the page is on its way to the edit screen). Showing a toast
			// there would flash a "Could not create" message just before
			// the navigation lands. Edit doesn't redirect — it always
			// returns `{ ok: true | false }` — so an `undefined` result
			// there is a genuine anomaly worth surfacing.
			if (onSuccess) {
				setFormError(errorFallback)
				toast.error(errorFallback)
			}
		}
	})

	return { form, formError }
}
