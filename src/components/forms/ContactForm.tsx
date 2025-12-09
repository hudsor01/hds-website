'use client'

import { useState, useMemo } from 'react'
import { useAppForm } from '@/hooks/form-hook'
import { FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import type { ContactFormData } from '@/lib/schemas/contact'
import { useContactFormSubmit } from '@/hooks/use-contact-form-submit'
import { getBudgetOptions, getContactTimeOptions, getServiceOptions, getTimelineOptions } from '@/lib/form-utils'
import { Check } from 'lucide-react'

// Success state component
function SuccessMessage({ onReset }: { onReset: () => void }) {
  return (
    <div className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border">
      <div className="h-full py-6 px-3">
        <div className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2">
          <Check className="size-8" />
        </div>
        <h2 className="text-center text-2xl text-pretty font-bold mb-2">
          Thank you
        </h2>
        <p className="text-center text-lg text-pretty text-muted-foreground mb-4">
          Form submitted successfully, we will get back to you soon
        </p>
        <div className="flex justify-center">
          <Button variant="outline" onClick={onReset}>
            Send another message
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ContactForm({ className = '' }: { className?: string }) {
  const mutation = useContactFormSubmit()
  const [showSuccess, setShowSuccess] = useState(false)

  const serviceOptions = useMemo(() => getServiceOptions(), [])
  const budgetOptions = useMemo(() => getBudgetOptions(), [])
  const timelineOptions = useMemo(() => getTimelineOptions(), [])
  const contactTimeOptions = useMemo(() => getContactTimeOptions(), [])

  const form = useAppForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      service: 'web-development',
      bestTimeToContact: 'anytime',
      budget: 'under-5k',
      timeline: 'flexible',
      message: ''
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value as ContactFormData)
      setShowSuccess(true)
    },
  })

  const handleReset = () => {
    form.reset()
    setShowSuccess(false)
    mutation.reset()
  }

  if (showSuccess) {
    return <SuccessMessage onReset={handleReset} />
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className={`p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border max-w-3xl mx-auto ${className}`}
    >
      <FieldGroup className="grid md:grid-cols-6 gap-4 mb-6">
        {/* First Name */}
        <div className="md:col-span-3">
          <form.AppField name="firstName">
            {(field) => (
              <field.TextField
                label="First Name"
                placeholder="Enter your first name"
                autoComplete="given-name"
              />
            )}
          </form.AppField>
        </div>

        {/* Last Name */}
        <div className="md:col-span-3">
          <form.AppField name="lastName">
            {(field) => (
              <field.TextField
                label="Last Name"
                placeholder="Enter your last name"
                autoComplete="family-name"
              />
            )}
          </form.AppField>
        </div>

        {/* Email */}
        <div className="md:col-span-6">
          <form.AppField name="email">
            {(field) => (
              <field.EmailField
                label="Email Address"
                placeholder="Enter your email address"
              />
            )}
          </form.AppField>
        </div>

        {/* Phone */}
        <div className="md:col-span-3">
          <form.AppField name="phone">
            {(field) => (
              <field.PhoneField
                label="Phone (Optional)"
                placeholder="Enter your phone number"
              />
            )}
          </form.AppField>
        </div>

        {/* Company */}
        <div className="md:col-span-3">
          <form.AppField name="company">
            {(field) => (
              <field.TextField
                label="Company (Optional)"
                placeholder="Enter your company name"
                autoComplete="organization"
              />
            )}
          </form.AppField>
        </div>

        {/* Service */}
        <div className="md:col-span-3">
          <form.AppField name="service">
            {(field) => (
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
            {(field) => (
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
            {(field) => (
              <field.SelectField
                label="Budget Range"
                options={budgetOptions}
                placeholder="Select budget range"
              />
            )}
          </form.AppField>
        </div>

        {/* Timeline */}
        <div className="md:col-span-3">
          <form.AppField name="timeline">
            {(field) => (
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
            {(field) => (
              <field.TextareaField
                label="Message"
                placeholder="Tell us about your project..."
                rows={6}
              />
            )}
          </form.AppField>
        </div>
      </FieldGroup>

      {/* Mutation error */}
      {mutation.isError && (
        <div className="mb-4 text-sm text-destructive">
          {mutation.error?.message || 'An error occurred'}
        </div>
      )}

      <div className="flex justify-end items-center w-full">
        <form.AppForm>
          <form.SubmitButton
            label="Submit"
            loadingLabel="Submitting..."
          />
        </form.AppForm>
      </div>
    </form>
  )
}
