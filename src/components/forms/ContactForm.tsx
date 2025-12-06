'use client'

import { submitContactForm, type ContactFormState } from '@/app/actions/contact'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getBudgetOptions, getContactTimeOptions, getServiceOptions, getTimelineOptions } from '@/lib/form-utils'
import { logger } from '@/lib/logger'
import { CheckCircle2 } from 'lucide-react'
import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'

// Submit button with built-in pending state
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="px-12"
      trackConversion
      conversionLabel="Contact Form Submit"
      conversionValue="high"
    >
      {pending ? (
        <span className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
          Sending...
        </span>
      ) : (
        'Send Message'
      )}
    </Button>
  )
}

// Success Message Component
function SuccessMessage({ onReset, className = '' }: { onReset: () => void; className?: string }) {
  const handleReset = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    } else {
      onReset()
    }
  }

  return (
    <div className={`glass-card border-success-dark/50 text-center ${className}`}>
      <div className="mb-content-block">
        <CheckCircle2 className="w-16 h-16 mx-auto text-success-text" />
      </div>
      <h2 className="text-responsive-md font-bold text-success-foreground mb-heading">Message Sent Successfully!</h2>
      <p className="text-success-light mb-content-block">
        Thank you for contacting us. We&apos;ll get back to you within 24 hours.
      </p>
      <Button
        onClick={handleReset}
        className="bg-success-dark hover:bg-success"
      >
        Send Another Message
      </Button>
    </div>
  )
}

// Form Header Component
function FormHeader() {
  return (
    <div className="mb-comfortable">
      <h2 className="text-responsive-md text-accent mb-subheading">
        Let&apos;s Build Something Amazing
      </h2>
      <p className="text-muted-foreground">
        Tell us about your project and we&apos;ll get back to you within 24 hours.
      </p>
    </div>
  )
}

export default function ContactForm({ className = '' }: { className?: string }) {
  const [state, formAction] = useActionState<ContactFormState | null, FormData>(
    submitContactForm,
    null
  )

  // Show toast notifications when form state changes
  useEffect(() => {
    if (!state) {
      return
    }

    if (state.success) {
      toast.success("Thank you for contacting us. We'll get back to you within 24 hours.", {
        duration: 5000
      })
    } else if (state.error) {
      toast.error(state.error, {
        duration: 7000
      })
    }
  }, [state])

  // Track form state changes for business intelligence
  if (typeof window !== 'undefined' && state) {
    logger.info('Contact form state updated', {
      success: state.success,
      hasError: !!state.error,
      hasMessage: !!state.message,
      component: 'ContactForm',
      userFlow: 'lead_generation'
    })
  }

  // Show success message if form was submitted successfully
  if (state?.success) {
    logger.info('Contact form submission successful', {
      component: 'ContactForm',
      userFlow: 'lead_generation',
      conversionEvent: 'contact_form_completed',
      businessValue: 'high'
    })

    return (
      <SuccessMessage
        onReset={() => {/* Handled in SuccessMessage component */}}
        className={className}
      />
    )
  }

  return (
    <div className={`glass-card ${className}`}>
      <FormHeader />

      <form action={formAction} className="space-y-sections">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-comfortable">
          <Input
            type="text"
            id="firstName"
            name="firstName"
            required
            placeholder="First Name"
            autoComplete="given-name"
          />

          <Input
            type="text"
            id="lastName"
            name="lastName"
            required
            placeholder="Last Name"
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
        <Input
          type="email"
          id="email"
          name="email"
          required
          placeholder="Email Address"
          autoComplete="email"
        />

        {/* Phone and Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-comfortable">
          <Input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Phone Number (Optional)"
            autoComplete="tel"
          />

          <Input
            type="text"
            id="company"
            name="company"
            placeholder="Company Name (Optional)"
            autoComplete="organization"
          />
        </div>

        {/* Service and Time - Using native select for Server Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-comfortable">
          <select
            id="service"
            name="service"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            {getServiceOptions().map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            id="bestTimeToContact"
            name="bestTimeToContact"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            {getContactTimeOptions().map((opt: {value: string, label: string}) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Budget and Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-comfortable">
          <select
            id="budget"
            name="budget"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            {getBudgetOptions().map((opt: {value: string, label: string}) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            id="timeline"
            name="timeline"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            {getTimelineOptions().map((opt: {value: string, label: string}) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Tell us about your project..."
          rows={6}
          className="resize-none"
        />

        {/* Error Display */}
        {state && state.error && (
          <Alert variant="destructive" data-testid="error-message">
            <AlertDescription>
              Error: {state.error}
              {state.message && `. ${state.message}`}
            </AlertDescription>
          </Alert>
        )}

        {/* Success message for non-success state but with message */}
        {state && state.message && !state.error && (
          <Alert data-testid="success-message" className="border-success/30 bg-success/10">
            <AlertDescription className="text-success-text">
              {state.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex-center pt-4">
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
