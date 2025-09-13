'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { ContactFormSchema } from '@/lib/validation'
import type { ContactFormData } from '@/types/forms'
import { useCSRFToken, useSubmitContactForm } from '@/hooks/useContactForm'
import { SERVICE_OPTIONS, TIME_OPTIONS } from '@/lib/form-constants'
import { FormField } from './forms/FormField'
import { SuccessMessage } from './forms/SuccessMessage'
import { FormHeader } from './forms/FormHeader'
import CustomSelect from '@/components/CustomSelect'
import FloatingInput from '@/components/FloatingInput'
import FloatingTextarea from '@/components/FloatingTextarea'

export default function ContactForm({ className = '' }: { className?: string }) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { data: csrfToken } = useCSRFToken()
  const submitMutation = useSubmitContactForm()

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      service: '',
      bestTimeToContact: '',
      message: ''
    } satisfies ContactFormData,
    validators: {
      onChange: ({ value }) => {
        const result = ContactFormSchema.safeParse(value)
        if (!result.success) {
          return result.error.format()
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      if (!csrfToken) {
        throw new Error('Security token not available. Please refresh the page and try again.')
      }

      await submitMutation.mutateAsync({
        data: value,
        csrfToken
      })

      setIsSubmitted(true)
      form.reset()
    },
  })

  if (isSubmitted) {
    return <SuccessMessage onReset={() => setIsSubmitted(false)} className={className} />
  }

  return (
    <div className={`bg-linear-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8 ${className}`}>
      <FormHeader />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-8"
      >
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="firstName">
            {(field) => (
              <FormField
                error={field.state.meta.errors[0]}
                touched={field.state.meta.isTouched}
              >
                <FloatingInput
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="First Name"
                  autoComplete="given-name"
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="lastName">
            {(field) => (
              <FormField
                error={field.state.meta.errors[0]}
                touched={field.state.meta.isTouched}
              >
                <FloatingInput
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Last Name"
                  autoComplete="family-name"
                />
              </FormField>
            )}
          </form.Field>
        </div>

        {/* Email */}
        <form.Field name="email">
          {(field) => (
            <FormField
              error={field.state.meta.errors[0]}
              touched={field.state.meta.isTouched}
            >
              <FloatingInput
                type="email"
                id="email"
                name="email"
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Email Address"
                autoComplete="email"
              />
            </FormField>
          )}
        </form.Field>

        {/* Phone and Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="phone">
            {(field) => (
              <FormField
                error={field.state.meta.errors[0]}
                touched={field.state.meta.isTouched}
              >
                <FloatingInput
                  type="tel"
                  id="phone"
                  name="phone"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Phone Number (Optional)"
                  autoComplete="tel"
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="company">
            {(field) => (
              <FormField
                error={field.state.meta.errors[0]}
                touched={field.state.meta.isTouched}
              >
                <FloatingInput
                  type="text"
                  id="company"
                  name="company"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Company Name (Optional)"
                  autoComplete="organization"
                />
              </FormField>
            )}
          </form.Field>
        </div>

        {/* Service and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field name="service">
            {(field) => (
              <FormField
                error={field.state.meta.errors[0]}
                touched={field.state.meta.isTouched}
              >
                <CustomSelect
                  id="service"
                  name="service"
                  required
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  options={SERVICE_OPTIONS}
                />
              </FormField>
            )}
          </form.Field>

          <form.Field name="bestTimeToContact">
            {(field) => (
              <FormField
                error={field.state.meta.errors[0]}
                touched={field.state.meta.isTouched}
              >
                <CustomSelect
                  id="bestTimeToContact"
                  name="bestTimeToContact"
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  options={TIME_OPTIONS}
                />
              </FormField>
            )}
          </form.Field>
        </div>

        {/* Message */}
        <form.Field name="message">
          {(field) => (
            <FormField
              error={field.state.meta.errors[0]}
              touched={field.state.meta.isTouched}
            >
              <FloatingTextarea
                id="message"
                name="message"
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Tell us about your project..."
                rows={6}
              />
            </FormField>
          )}
        </form.Field>

        {/* Error Display */}
        {submitMutation.isError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">
              {submitMutation.error?.message || 'Something went wrong. Please try again.'}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={!form.state.isValid || submitMutation.isPending}
            className="relative px-12 py-4 bg-linear-to-r from-cyan-500 to-blue-500 text-black font-semibold text-lg rounded-lg hover:from-cyan-400 hover:to-blue-400 transform hover:scale-105 transition-all duration-200 hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
          >
            {submitMutation.isPending ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}