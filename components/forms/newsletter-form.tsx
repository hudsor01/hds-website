'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  TextField,
} from '@/components/forms/form-fields'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
  newsletterSchema,
  type NewsletterFormValues,
} from '@/lib/validation/form-schemas'
import { cn } from '@/lib/utils'
import { FormErrorBoundary } from '@/components/error/route-error-boundaries'

export interface NewsletterFormProps {
  className?: string
  onSuccess?: () => void
  onError?: () => void
  includeName?: boolean
  submitEndpoint?: string
  useTrpc?: boolean
  title?: string
  description?: string
  successMessage?: string
  buttonText?: string
  darkMode?: boolean
  showInterests?: boolean
  interests?: string[]
  compact?: boolean
}

/**
 * Newsletter Form Component with integrated error boundary
 *
 * This component provides a standardized newsletter signup form.
 */
export function NewsletterForm({
  className = '',
  onSuccess,
  onError,
  includeName = false,
  submitEndpoint = 'newsletter.subscribe',
  useTrpc = true,
  title,
  description,
  successMessage = 'Thank you for subscribing!',
  buttonText = 'Subscribe',
  darkMode = false,
  showInterests = false,
  interests = ['Company Updates', 'Product News', 'Industry Insights'],
  compact = false,
}: NewsletterFormProps) {
  
  const handleFormError = (error: Error) => {
    // Track form errors specifically
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as { gtag: (command: string, eventName: string, parameters: Record<string, unknown>) => void }).gtag('event', 'form_error', {
        form_name: 'newsletter_form',
        error_message: error.message,
      })
    }
    
    // Call the original onError if provided
    if (onError) {
      onError(error)
    }
  }
  // Use the form submission hook
  const {
    submit,
    reset: resetSubmission,
    isSubmitting,
    isSubmitted,
    formError,
  } = useFormSubmission<NewsletterFormValues>({
    endpoint: useTrpc ? 'newsletter.subscribe' : submitEndpoint,
    useTrpc,
    successMessage,
    onSuccess,
    onError,
  })

  // Track selected interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  // Create form with react-hook-form
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      name: '',
      interests: [],
    },
  })

  // Handle form submission
  const onSubmit = async (data: NewsletterFormValues) => {
    // Add selected interests if shown
    if (showInterests) {
      data.interests = selectedInterests
    }

    // Submit the form
    await submit(data)
  }

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  // Reset the form
  const resetForm = () => {
    form.reset()
    resetSubmission()
    setSelectedInterests([])
  }

  // Render success state
  if (isSubmitted) {
    return (
      <FormErrorBoundary
        onError={handleFormError}
        className='w-full'
      >
        <div
          className={cn(
            'rounded-lg p-6',
            darkMode ? 'bg-gray-800 text-white' : 'bg-white',
            className,
          )}
        >
        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
          <CheckCircle className='h-12 w-12 text-green-500' />
          <h3
            className={cn(
              'text-xl font-bold',
              darkMode ? 'text-white' : 'text-gray-900',
            )}
          >
            {successMessage}
          </h3>
          <Button
            onClick={resetForm}
            variant='outline'
            size='sm'
            className={
              darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''
            }
          >
            Subscribe Again
          </Button>
        </div>
        </div>
      </FormErrorBoundary>
    )
  }

  // Render compact version
  if (compact) {
    return (
      <FormErrorBoundary
        onError={handleFormError}
        className='w-full'
      >
        <div
          className={cn(
            'rounded-lg p-4',
            darkMode ? 'bg-gray-800 text-white' : 'bg-white',
            className,
          )}
        >
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col sm:flex-row gap-3'
        >
          <div className='flex-1'>
            <input
              type='email'
              placeholder='Your email address'
              className={cn(
                'w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500',
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300',
              )}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className='text-red-500 text-xs mt-1'>
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type='submit'
            disabled={isSubmitting}
            className={darkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {isSubmitting ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              buttonText
            )}
          </Button>
        </form>
        </div>
      </FormErrorBoundary>
    )
  }

  // Render full version
  return (
    <FormErrorBoundary
      onError={handleFormError}
      className='w-full'
    >
      <div
        className={cn(
          'rounded-lg p-6',
          darkMode ? 'bg-gray-800 text-white' : 'bg-white',
          className,
        )}
      >
      {title && (
        <h3
          className={cn(
            'text-xl font-bold mb-2',
            darkMode ? 'text-white' : 'text-gray-900',
          )}
        >
          {title}
        </h3>
      )}

      {description && (
        <p
          className={cn(
            'text-sm mb-4',
            darkMode ? 'text-gray-300' : 'text-gray-600',
          )}
        >
          {description}
        </p>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        {includeName && (
          <TextField
            form={form}
            name='name'
            label='Name'
            placeholder='Your name'
            darkMode={darkMode}
          />
        )}

        <TextField
          form={form}
          name='email'
          label='Email'
          placeholder='your.email@example.com'
          type='email'
          required
          darkMode={darkMode}
        />

        {showInterests && interests.length > 0 && (
          <div className='space-y-3'>
            <p
              className={cn(
                'text-sm font-medium',
                darkMode ? 'text-gray-200' : 'text-gray-700',
              )}
            >
              I&apos;m interested in:
            </p>
            <div className='space-y-2'>
              {interests.map(interest => (
                <div key={interest} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id={`interest-${interest}`}
                    checked={selectedInterests.includes(interest)}
                    onChange={() => toggleInterest(interest)}
                    className={darkMode ? 'text-blue-500' : ''}
                  />
                  <label
                    htmlFor={`interest-${interest}`}
                    className={cn(
                      'text-sm',
                      darkMode ? 'text-gray-300' : 'text-gray-700',
                    )}
                  >
                    {interest}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form error */}
        {formError && <div className='text-red-500 text-sm'>{formError}</div>}

        <Button
          type='submit'
          disabled={isSubmitting}
          className={cn(
            'w-full',
            darkMode ? 'bg-blue-600 hover:bg-blue-700' : '',
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Subscribing...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </form>
      </div>
    </FormErrorBoundary>
  )
}
