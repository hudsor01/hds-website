'use client'

import React, { useTransition, useOptimistic, memo, startTransition, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitContactForm } from '@/lib/actions/email-actions'
import { FormErrorBoundary } from '@/components/error/route-error-boundaries'
import { HoneypotField, TimingHoneypot } from '@/components/security/honeypot-field'
import { Button } from '@/components/ui/button'
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react'

// React 19 optimistic action types
interface OptimisticSubmission {
  id: string
  name: string
  email: string
  message: string
  timestamp: Date
  status: 'pending' | 'success' | 'error'
}

// React 19 optimized submit button with useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button 
      type='submit' 
      disabled={pending}
      className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2'
    >
      {pending ? (
        <>
          <Loader2 className='h-4 w-4 animate-spin' />
          Sending...
        </>
      ) : (
        <>
          <Send className='h-4 w-4' />
          Send Message
        </>
      )}
    </Button>
  )
}

// React 19 optimized feedback component
const FormFeedback = memo(function FormFeedback({ 
  state, 
}: { 
  state: any 
}) {
  if (!state) return null

  if (state.success) {
    return (
      <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
        <div className='flex items-center gap-2 text-green-800'>
          <CheckCircle className='h-5 w-5' />
          <span className='font-semibold'>Message sent successfully!</span>
        </div>
        <p className='text-green-700 text-sm mt-1'>
          {state.message}
        </p>
      </div>
    )
  }

  if (!state.success && state.message) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
        <div className='flex items-center gap-2 text-red-800'>
          <AlertCircle className='h-5 w-5' />
          <span className='font-semibold'>Error</span>
        </div>
        <p className='text-red-700 text-sm mt-1'>
          {state.message}
        </p>
        {state.errors && (
          <div className='mt-2 space-y-1'>
            {Object.entries(state.errors).map(([field, errors]) => (
              <p key={field} className='text-red-600 text-xs'>
                {field}: {(errors as string[]).join(', ')}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
})

export interface ContactFormProps {
  className?: string
  onSuccess?: () => void
  onError?: (_error: Error) => void
  includeFields?: Array<'phone' | 'company' | 'subject' | 'service' | 'budget'>
  submitEndpoint?: string
  useTrpc?: boolean
  title?: string
  description?: string
  successMessage?: string
  darkMode?: boolean
  variant?: 'simple' | 'detailed'
}

/**
 * React 19 modernized contact form with useActionState and Resend integration
 */
export const ContactForm = memo(function ContactForm({
  className,
  onSuccess,
  onError,
  includeFields = ['phone'],
  submitEndpoint,
  useTrpc,
  title,
  description,
  successMessage,
  darkMode = false,
  variant = 'simple',
}: ContactFormProps) {
  const isDetailed = variant === 'detailed'
  
  // React 19 useActionState for Server Actions
  const [state, formAction] = useActionState(submitContactForm, null)

  // Handle success callback
  React.useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess()
    }
  }, [state?.success, onSuccess])

  // Handle error callback
  React.useEffect(() => {
    if (state && !state.success && state.message && onError) {
      onError(new Error(state.message))
    }
  }, [state, onError])

  return (
    <FormErrorBoundary
      onError={onError}
      className='w-full'
    >
      <div className={`${className} transition-opacity duration-200`}>
        <FormFeedback state={state} />
        
        <form action={formAction} className='space-y-6'>
          {/* Spam protection components */}
          <HoneypotField name='website' />
          <TimingHoneypot />
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                Name *
              </label>
              <input
                type='text'
                name='name'
                id='name'
                required
                placeholder='John Doe'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                Email *
              </label>
              <input
                type='email'
                name='email'
                id='email'
                required
                placeholder='john@example.com'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {includeFields.includes('phone') && (
            <div className='space-y-2'>
              <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>
                Phone (Optional)
              </label>
              <input
                type='tel'
                name='phone'
                id='phone'
                placeholder='(555) 123-4567'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          )}

          {isDetailed && includeFields.includes('company') && (
            <div className='space-y-2'>
              <label htmlFor='company' className='block text-sm font-medium text-gray-700'>
                Company (Optional)
              </label>
              <input
                type='text'
                name='company'
                id='company'
                placeholder='Acme Corp'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          )}

          {isDetailed && includeFields.includes('service') && (
            <div className='space-y-2'>
              <label htmlFor='service' className='block text-sm font-medium text-gray-700'>
                Service of Interest
              </label>
              <select
                name='service'
                id='service'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Select a service</option>
                <option value='web'>Web Development</option>
                <option value='revops'>Revenue Operations</option>
                <option value='analytics'>Data Analytics</option>
                <option value='strategy'>Business Strategy</option>
              </select>
            </div>
          )}

          <div className='space-y-2'>
            <label htmlFor='message' className='block text-sm font-medium text-gray-700'>
              Message *
            </label>
            <textarea
              name='message'
              id='message'
              rows={4}
              required
              placeholder='Tell us about your project...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical'
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </FormErrorBoundary>
  )
})