'use client'

import React, { memo, useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { subscribeToNewsletter } from '@/lib/actions/email-actions'
import { HoneypotField } from '@/components/security/honeypot-field'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react'

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
          Subscribing...
        </>
      ) : (
        <>
          <Mail className='h-4 w-4' />
          Subscribe
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
          <span className='font-semibold'>Welcome aboard! 🎉</span>
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
          <span className='font-semibold'>Subscription Error</span>
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

export interface NewsletterFormProps {
  className?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
  title?: string
  description?: string
  placeholder?: string
  variant?: 'inline' | 'modal' | 'sidebar'
  showFirstName?: boolean
}

/**
 * React 19 modernized newsletter form with Resend integration
 */
export const NewsletterFormEnhanced = memo(function NewsletterFormEnhanced({
  className,
  onSuccess,
  onError,
  title = 'Stay in the Loop',
  description = 'Get weekly insights on business optimization and revenue operations.',
  placeholder = 'Enter your email address',
  variant = 'inline',
  showFirstName = false,
}: NewsletterFormProps) {
  // React 19 useActionState for Server Actions
  const [state, formAction] = useActionState(subscribeToNewsletter, null)

  // Handle success callback
  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess()
    }
  }, [state?.success, onSuccess])

  // Handle error callback
  useEffect(() => {
    if (state && !state.success && state.message && onError) {
      onError(new Error(state.message))
    }
  }, [state, onError])

  const isInline = variant === 'inline'
  const isModal = variant === 'modal'

  return (
    <div className={`${className} w-full max-w-md mx-auto`}>
      {title && (
        <div className='text-center mb-6'>
          <h3 className={`font-bold ${isModal ? 'text-xl' : 'text-lg'} text-gray-900 mb-2`}>
            {title}
          </h3>
          {description && (
            <p className='text-gray-600 text-sm'>
              {description}
            </p>
          )}
        </div>
      )}

      <FormFeedback state={state} />
      
      <form action={formAction} className='space-y-4'>
        {/* Spam protection */}
        <HoneypotField name='website' />
        
        {showFirstName && (
          <div className='space-y-2'>
            <label htmlFor='firstName' className='block text-sm font-medium text-gray-700'>
              First Name (Optional)
            </label>
            <input
              type='text'
              name='firstName'
              id='firstName'
              placeholder='John'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        )}

        <div className='space-y-2'>
          <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
            Email Address *
          </label>
          <input
            type='email'
            name='email'
            id='email'
            required
            placeholder={placeholder}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        <SubmitButton />

        <div className='text-center'>
          <p className='text-xs text-gray-500'>
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </form>
    </div>
  )
})

// Convenience exports for different variants
export const InlineNewsletterForm = memo(function InlineNewsletterForm(props: Omit<NewsletterFormProps, 'variant'>) {
  return <NewsletterFormEnhanced {...props} variant='inline' />
})

export const ModalNewsletterForm = memo(function ModalNewsletterForm(props: Omit<NewsletterFormProps, 'variant'>) {
  return <NewsletterFormEnhanced {...props} variant='modal' />
})

export const SidebarNewsletterForm = memo(function SidebarNewsletterForm(props: Omit<NewsletterFormProps, 'variant'>) {
  return <NewsletterFormEnhanced {...props} variant='sidebar' />
})