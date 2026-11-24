'use client'

/**
 * Create a private testimonial request link (client island).
 *
 * Built on `useAppForm` like the other admin forms. Submits to the
 * session-gated `createTestimonialRequestAction`; on success it shows the
 * new link with a copy button and resets the fields. The server action
 * revalidates the requests page so the new row appears in the table.
 */
import { revalidateLogic } from '@tanstack/react-form'
import { Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FormFieldSet } from '@/components/admin/FormFieldSet'
import { useAppForm } from '@/hooks/form-hook'
import { createTestimonialRequestFormSchema } from '@/lib/schemas/admin-testimonials'
import { createTestimonialRequestAction } from '../actions'
import { copyRequestLink } from './RequestLinkActions'

interface FormShape {
	clientName: string
	clientEmail: string
	projectName: string
}

const DEFAULTS: FormShape = {
	clientName: '',
	clientEmail: '',
	projectName: ''
}

const INPUT_CLS =
	'w-full px-3 py-2 rounded-md border border-border bg-background text-foreground'

export function CreateRequestForm() {
	const [formError, setFormError] = useState<string | null>(null)
	const [created, setCreated] = useState<{
		token: string
		clientName: string
	} | null>(null)

	const form = useAppForm({
		defaultValues: DEFAULTS,
		validationLogic: revalidateLogic({
			mode: 'submit',
			modeAfterSubmission: 'change'
		}),
		validators: { onDynamic: createTestimonialRequestFormSchema },
		onSubmit: async ({ value }) => {
			setFormError(null)
			const fd = new FormData()
			for (const [k, v] of Object.entries(value)) {
				fd.set(k, v)
			}
			const result = await createTestimonialRequestAction(fd)
			if (!result.ok) {
				const message =
					result.errors._form ?? 'Could not create the link. Please try again.'
				setFormError(message)
				toast.error(message)
				for (const [field, fieldMessage] of Object.entries(result.errors)) {
					if (field === '_form') {
						continue
					}
					form.setFieldMeta(field as keyof FormShape, m => ({
						...m,
						errors: [fieldMessage]
					}))
				}
				return
			}
			setCreated({ token: result.token, clientName: value.clientName.trim() })
			toast.success('Review link created')
			form.reset()
		}
	})

	return (
		<div className="space-y-4">
			<form
				noValidate
				onSubmit={e => {
					e.preventDefault()
					void form.handleSubmit()
				}}
				className="grid gap-4 sm:grid-cols-3 items-start"
			>
				{formError && (
					<p role="alert" className="text-sm text-destructive sm:col-span-3">
						{formError}
					</p>
				)}

				<form.AppField name="clientName">
					{field => (
						<FormFieldSet
							label="Client name"
							htmlFor="clientName"
							required
							error={field.state.meta.errors[0]}
						>
							{aria => (
								<input
									{...aria}
									className={INPUT_CLS}
									value={field.state.value}
									onChange={e => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							)}
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="clientEmail">
					{field => (
						<FormFieldSet
							label="Client email"
							htmlFor="clientEmail"
							hint="Optional. Lets you email the link from this page."
							error={field.state.meta.errors[0]}
						>
							{aria => (
								<input
									{...aria}
									type="email"
									className={INPUT_CLS}
									value={field.state.value}
									onChange={e => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							)}
						</FormFieldSet>
					)}
				</form.AppField>

				<form.AppField name="projectName">
					{field => (
						<FormFieldSet
							label="Project"
							htmlFor="projectName"
							hint="Optional. Shown to the client on the review page."
							error={field.state.meta.errors[0]}
						>
							{aria => (
								<input
									{...aria}
									className={INPUT_CLS}
									value={field.state.value}
									onChange={e => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							)}
						</FormFieldSet>
					)}
				</form.AppField>

				<div className="sm:col-span-3 flex items-center gap-3">
					<form.AppForm>
						<form.SubmitButton
							label="Create review link"
							loadingLabel="Creating..."
						/>
					</form.AppForm>
				</div>
			</form>

			{created && (
				<div
					className="rounded-md border border-border bg-surface-base p-4 text-sm"
					role="status"
				>
					<p className="text-foreground">
						Link for {created.clientName} is ready. It works once and expires in
						30 days.
					</p>
					<button
						type="button"
						onClick={() => void copyRequestLink(created.token)}
						className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-text hover:underline"
					>
						<Copy size={14} aria-hidden="true" />
						Copy link
					</button>
				</div>
			)}
		</div>
	)
}
