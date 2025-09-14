'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitContactForm } from '@/app/actions/contact'
import type { ContactFormState } from '@/app/actions/contact'
import { getServiceOptions, getContactTimeOptions, getBudgetOptions, getTimelineOptions } from '@/lib/form-utils'

// Submit button with built-in pending state
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="relative px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold text-lg rounded-lg hover:from-cyan-400 hover:to-blue-400 transform hover:scale-105 transition-all duration-200 hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none will-change-transform"
    >
      {pending ? (
        <span className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
          Sending...
        </span>
      ) : (
        'Send Message'
      )}
    </button>
  )
}

// Success Message Component
function SuccessMessage({ onReset, className = '' }: { onReset: () => void; className?: string }) {
  return (
    <div className={`glass-card bg-gradient-to-br from-green-900/90 to-green-800/90 border-green-700/50 text-center ${className}`}>
      <div className="mb-6">
        <svg className="w-16 h-16 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-green-100 mb-4">Message Sent Successfully!</h2>
      <p className="text-green-200 mb-6">
        Thank you for contacting us. We'll get back to you within 24 hours.
      </p>
      <button
        onClick={onReset}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
      >
        Send Another Message
      </button>
    </div>
  )
}

// Form Header Component
function FormHeader() {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
        Let's Build Something Amazing
      </h2>
      <p className="text-gray-400">
        Tell us about your project and we'll get back to you within 24 hours.
      </p>
    </div>
  )
}

export default function ContactForm({ className = '' }: { className?: string }) {
  const [state, formAction] = useActionState<ContactFormState | null, FormData>(
    submitContactForm,
    null
  )

  // Debug logging for tests
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn('ContactForm state:', state)
  }

  // Show success message if form was submitted successfully
  if (state?.success) {
    return (
      <SuccessMessage
        onReset={() => window.location.reload()}
        className={className}
      />
    )
  }

  return (
    <div className={`glass-card ${className}`}>
      <FormHeader />

      <form action={formAction} className="space-y-8">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            placeholder="First Name"
            autoComplete="given-name"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all accent-cyan-500"
          />

          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            placeholder="Last Name"
            autoComplete="family-name"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all accent-cyan-500"
          />
        </div>

        {/* Email */}
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="Email Address"
          autoComplete="email"
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
        />

        {/* Phone and Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Phone Number (Optional)"
            autoComplete="tel"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all accent-cyan-500"
          />

          <input
            type="text"
            id="company"
            name="company"
            placeholder="Company Name (Optional)"
            autoComplete="organization"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all accent-cyan-500"
          />
        </div>

        {/* Service and Time - Using native select for Server Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <select
              id="service"
              name="service"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all accent-cyan-500"
            >
              {getServiceOptions().map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              id="bestTimeToContact"
              name="bestTimeToContact"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all accent-cyan-500"
            >
              {getContactTimeOptions().map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget and Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <select
              id="budget"
              name="budget"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all accent-cyan-500"
            >
              {getBudgetOptions().map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              id="timeline"
              name="timeline"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all accent-cyan-500"
            >
              {getTimelineOptions().map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <textarea
          id="message"
          name="message"
          required
          placeholder="Tell us about your project..."
          rows={6}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none accent-cyan-500"
        />

        {/* Error Display */}
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4" data-testid="error-message">
            <p className="text-red-400 text-sm">
              Error: {state.error}
              {state.message && `. ${state.message}`}
            </p>
          </div>
        )}

        {/* Success message for non-success state but with message */}
        {state?.message && !state?.error && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4" data-testid="success-message">
            <p className="text-green-400 text-sm">
              {state.message}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}