'use client'

import { useState } from 'react'
import { FormSuccessMessage } from '@/components/forms/FormSuccessMessage'
import { FieldGroup } from '@/components/ui/field'
import { useAppForm } from '@/hooks/form-hook'
import { useContactFormSubmit } from '@/hooks/use-contact-form-submit'
import { getAttribution } from '@/lib/attribution'
import { buildFreeMockupPayload } from '@/lib/free-mockup'
import QueryProvider from '@/providers/QueryProvider'

export default function FreeMockupForm(props: { className?: string }) {
	// Mirror ContactForm: each consumer form owns its own QueryClient rather
	// than wrapping the whole app in a provider for a single useMutation site.
	return (
		<QueryProvider>
			<FreeMockupFormInner {...props} />
		</QueryProvider>
	)
}

function FreeMockupFormInner({ className = '' }: { className?: string }) {
	const mutation = useContactFormSubmit()
	const [showSuccess, setShowSuccess] = useState(false)

	const form = useAppForm({
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			businessName: '',
			currentSite: '',
			phone: ''
		},
		onSubmit: async ({ value }) => {
			// Attach the persisted marketing attribution so an ad-driven lead
			// carries its gclid into the lead -> sendAdConversion pipeline.
			await mutation.mutateAsync(
				buildFreeMockupPayload(value, getAttribution())
			)
			setShowSuccess(true)
		}
	})

	const handleReset = () => {
		form.reset()
		setShowSuccess(false)
		mutation.reset()
	}

	if (showSuccess) {
		return (
			<FormSuccessMessage
				title="Request received"
				message="Your free mockup request is in. We will review your business and send your custom website mockup shortly. Check your email for a confirmation."
				actionLabel="Submit another"
				onAction={handleReset}
			/>
		)
	}

	return (
		<form
			// method="post" so a pre-hydration submit uses POST and keeps the
			// payload out of the URL (mirrors ContactForm, audit #237).
			method="post"
			onSubmit={e => {
				e.preventDefault()
				e.stopPropagation()
				form.handleSubmit()
			}}
			className={className}
		>
			<FieldGroup className="grid md:grid-cols-6 gap-4 mb-6">
				<div className="md:col-span-3">
					<form.AppField name="firstName">
						{field => (
							<field.TextField
								label="First Name"
								autoComplete="given-name"
								required
							/>
						)}
					</form.AppField>
				</div>

				<div className="md:col-span-3">
					<form.AppField name="lastName">
						{field => (
							<field.TextField
								label="Last Name"
								autoComplete="family-name"
								required
							/>
						)}
					</form.AppField>
				</div>

				<div className="md:col-span-6">
					<form.AppField name="email">
						{field => (
							<field.EmailField
								label="Email Address"
								placeholder="name@business.com"
								required
							/>
						)}
					</form.AppField>
				</div>

				<div className="md:col-span-6">
					<form.AppField name="businessName">
						{field => (
							<field.TextField
								label="Business Name"
								autoComplete="organization"
								required
							/>
						)}
					</form.AppField>
				</div>

				<div className="md:col-span-6">
					<form.AppField name="currentSite">
						{field => (
							<field.TextField
								label="Current website or Google listing (optional)"
								placeholder="yourbusiness.com or your Google listing"
								hint="Paste your website or Google Business listing if you have one. Leave blank if you do not."
							/>
						)}
					</form.AppField>
				</div>

				<div className="md:col-span-3">
					<form.AppField name="phone">
						{field => (
							<field.PhoneField
								label="Phone (optional)"
								placeholder="(555) 123-4567"
							/>
						)}
					</form.AppField>
				</div>
			</FieldGroup>

			{mutation.isError && (
				<div
					className="mb-4 text-sm text-destructive"
					aria-live="assertive"
					role="alert"
				>
					{mutation.error?.message || 'An error occurred'}
				</div>
			)}

			<form.AppForm>
				{/* Full-width, prominent CTA on the landing page without altering
				    the shared SubmitButton primitive. */}
				<div className="[&_button]:w-full">
					<form.SubmitButton
						label="Get my free mockup"
						loadingLabel="Sending..."
					/>
				</div>
			</form.AppForm>
		</form>
	)
}
