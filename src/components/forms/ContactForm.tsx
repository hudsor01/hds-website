'use client'

import { revalidateLogic } from '@tanstack/react-form'
import { useState } from 'react'
import { FormSuccessMessage } from '@/components/forms/FormSuccessMessage'
import { FieldGroup } from '@/components/ui/field'
import formOptions from '@/data/form-options.json'
import { useAppForm } from '@/hooks/form-hook'
import { useContactFormSubmit } from '@/hooks/use-contact-form-submit'
import { getAttribution } from '@/lib/attribution'
import {
	type ContactFormData,
	contactFormClientSchema
} from '@/lib/schemas/contact'
import QueryProvider from '@/providers/QueryProvider'

// Module-level constants — these arrays are deserialized once at import
// time from the static JSON. No need to wrap in useMemo per render.
const serviceOptions = formOptions.services
const budgetOptions = formOptions.budget
const timelineOptions = formOptions.timeline
const contactTimeOptions = formOptions.contactTime

export default function ContactForm(props: { className?: string }) {
	// Each consumer-form gets its own QueryClient instance. Previously the
	// app-wide ClientProviders wrapped every page in QueryClientProvider
	// just to support this single useMutation site. See PERF-4.
	return (
		<QueryProvider>
			<ContactFormInner {...props} />
		</QueryProvider>
	)
}

function ContactFormInner({ className = '' }: { className?: string }) {
	const mutation = useContactFormSubmit()
	const [showSuccess, setShowSuccess] = useState(false)

	const form = useAppForm({
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			company: '',
			service: 'website-design',
			bestTimeToContact: 'anytime',
			budget: 'under-5k',
			timeline: 'flexible',
			message: ''
		},
		// Reward early, punish late: first error on blur, then revalidate on
		// change once the form has been submitted. Canonical TanStack pattern.
		validationLogic: revalidateLogic({
			mode: 'blur',
			modeAfterSubmission: 'change'
		}),
		validators: { onDynamic: contactFormClientSchema },
		onSubmit: async ({ value }) => {
			// Attach the persisted marketing attribution so the lead is
			// traceable to the campaign/click that produced it.
			await mutation.mutateAsync({
				...value,
				attribution: getAttribution()
			} as ContactFormData)
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
				title="Thank you"
				message="Form submitted successfully, we will get back to you soon"
				actionLabel="Send another message"
				onAction={handleReset}
			/>
		)
	}

	return (
		<form
			// `method="post"` so a pre-hydration submit (user clicks Submit
			// before React finishes mounting) at least uses POST and puts the
			// payload in the body instead of leaking name/email/message into
			// the URL as query params. The onSubmit handler still owns the
			// happy path; this is a defense-in-depth fallback against the
			// audit-reported GET behavior (#237).
			method="post"
			onSubmit={e => {
				e.preventDefault()
				e.stopPropagation()
				form.handleSubmit()
			}}
			className={`p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border max-w-3xl mx-auto ${className}`}
		>
			{/* Audit #266: standardize on label + helper-text-below. Drop
			    placeholders that just repeat the label (e.g. "Enter your
			    first name" under a "First Name" label is noise). Keep
			    example-style placeholders that show formatting (email,
			    phone) and hide the dropdown placeholders behind the label
			    via `Select…`. */}
			<FieldGroup className="grid md:grid-cols-6 gap-4 mb-6">
				{/* First Name */}
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

				{/* Last Name */}
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

				{/* Email */}
				<div className="md:col-span-6">
					<form.AppField name="email">
						{field => (
							<field.EmailField
								label="Email Address"
								placeholder="name@company.com"
								required
							/>
						)}
					</form.AppField>
				</div>

				{/* Phone */}
				<div className="md:col-span-3">
					<form.AppField name="phone">
						{field => (
							<field.PhoneField
								label="Phone (Optional)"
								placeholder="(555) 123-4567"
							/>
						)}
					</form.AppField>
				</div>

				{/* Company */}
				<div className="md:col-span-3">
					<form.AppField name="company">
						{field => (
							<field.TextField
								label="Company (Optional)"
								autoComplete="organization"
							/>
						)}
					</form.AppField>
				</div>

				{/* Service */}
				<div className="md:col-span-3">
					<form.AppField name="service">
						{field => (
							<field.SelectField
								label="Service Interest"
								options={serviceOptions}
								placeholder="Select a service"
							/>
						)}
					</form.AppField>
				</div>

				{/* Best Time to Contact */}
				<div className="md:col-span-3">
					<form.AppField name="bestTimeToContact">
						{field => (
							<field.SelectField
								label="Best Time to Contact"
								options={contactTimeOptions}
								placeholder="Select preferred time"
							/>
						)}
					</form.AppField>
				</div>

				{/* Budget */}
				<div className="md:col-span-3">
					<form.AppField name="budget">
						{field => (
							<field.SelectField
								label="Budget Range"
								options={budgetOptions}
								placeholder="Select budget range"
								hint="A rough number is fine. Helps me scope the right plan."
							/>
						)}
					</form.AppField>
				</div>

				{/* Timeline */}
				<div className="md:col-span-3">
					<form.AppField name="timeline">
						{field => (
							<field.SelectField
								label="Project Timeline"
								options={timelineOptions}
								placeholder="Select timeline"
							/>
						)}
					</form.AppField>
				</div>

				{/* Message */}
				<div className="col-span-full">
					<form.AppField name="message">
						{field => (
							<field.TextareaField
								label="Message"
								rows={6}
								required
								hint="A few sentences on the business and what you want the new site to do."
							/>
						)}
					</form.AppField>
				</div>
			</FieldGroup>

			{/* Mutation error */}
			{mutation.isError && (
				<div
					className="mb-4 text-sm text-destructive"
					aria-live="assertive"
					role="alert"
				>
					{mutation.error?.message || 'An error occurred'}
				</div>
			)}

			<div className="flex justify-end items-center w-full">
				<form.AppForm>
					<form.SubmitButton label="Submit" loadingLabel="Submitting..." />
				</form.AppForm>
			</div>
		</form>
	)
}
