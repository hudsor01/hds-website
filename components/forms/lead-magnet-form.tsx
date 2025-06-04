'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Download, CheckCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { BaseForm } from '@/components/forms/base-form'
import {
  TextField,
  FormRow,
} from '@/components/forms/form-fields'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
  leadMagnetSchema,
  type LeadMagnetFormValues,
} from '@/lib/validation/form-schemas'
import { cn } from '@/lib/utils'
import { FormErrorBoundary } from '@/components/error/route-error-boundaries'

export type LeadMagnetResource = {
  id: string
  title: string
  description: string
  fileName: string
  thumbnailUrl?: string
}

export interface LeadMagnetFormProps {
  className?: string
  onSuccess?: () => void
  onError?: () => void
  submitEndpoint?: string
  useTrpc?: boolean
  title?: string
  description?: string
  successMessage?: string
  darkMode?: boolean
  resource: LeadMagnetResource
  buttonText?: string
}

/**
 * Lead Magnet Form Component with integrated error boundary
 *
 * This component provides a form for lead magnet (resource) downloads.
 */
export function LeadMagnetForm({
  className = '',
  onSuccess,
  onError,
  submitEndpoint = 'leadMagnet.download',
  useTrpc = true,
  title = 'Get Your Free Resource',
  description,
  successMessage = 'Your download is ready!',
  darkMode = false,
  resource,
  buttonText = 'Download Now',
}: LeadMagnetFormProps) {

  const handleFormError = (error: Error) => {
    // Track form errors specifically
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as { gtag: (command: string, eventName: string, parameters: Record<string, unknown>) => void }).gtag('event', 'form_error', {
        form_name: 'lead_magnet_form',
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
    isSubmitting,
    isSubmitted,
    formError,
  } = useFormSubmission<LeadMagnetFormValues>({
    endpoint: useTrpc ? 'leadMagnet.download' : submitEndpoint,
    useTrpc,
    successMessage,
    onSuccess,
    onError,
  })

  // Create form with react-hook-form
  const form = useForm<LeadMagnetFormValues>({
    resolver: zodResolver(leadMagnetSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
    },
  })

  // Handle form submission
  const onSubmit = async (data: LeadMagnetFormValues) => {
    // Submit the form with resource ID
    await submit({
      ...data,
      resourceId: resource.id,
    })
  }

  // If form is submitted, show download button
  if (isSubmitted) {
    const downloadUrl = `/resources/${resource.fileName}`

    return (
      <FormErrorBoundary
        onError={handleFormError}
        className='w-full'
      >
        <div
          className={cn(
            'rounded-lg p-8 text-center',
            darkMode
              ? 'bg-gray-800 text-white'
              : 'bg-white border border-gray-200 shadow-sm',
            className,
          )}
        >
        <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
        <h3
          className={cn(
            'text-2xl font-bold mb-2',
            darkMode ? 'text-white' : 'text-gray-900',
          )}
        >
          {successMessage}
        </h3>
        <p className={cn('mb-6', darkMode ? 'text-gray-300' : 'text-gray-600')}>
          Your download is ready. Click the button below to download your
          resource.
        </p>

        <div className='flex flex-col items-center space-y-4'>
          <a
            href={downloadUrl}
            download
            target='_blank'
            rel='noopener noreferrer'
            className={cn(
              'inline-flex items-center px-6 py-3 rounded-lg font-medium text-white shadow-sm',
              'transition-all duration-200',
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
            )}
          >
            <Download className='mr-2 h-5 w-5' />
            Download {resource.title}
          </a>

          <p
            className={cn(
              'text-sm mt-2',
              darkMode ? 'text-gray-400' : 'text-gray-500',
            )}
          >
            We&apos;ve also sent a download link to your email.
          </p>
        </div>
        </div>
      </FormErrorBoundary>
    )
  }

  // Render the form
  return (
    <FormErrorBoundary
      onError={handleFormError}
      className='w-full'
    >
      <BaseForm
      form={form}
      onSubmit={onSubmit}
      title={title}
      description={
        description ||
        `Fill out the form below to get access to ${resource.title}`
      }
      isCard={true}
      className={className}
      darkMode={darkMode}
    >
      <div className='mb-6'>
        {resource.thumbnailUrl && (
          <div className='mb-4 flex justify-center'>
            <Image
              src={resource.thumbnailUrl}
              alt={resource.title}
              width={320}
              height={160}
              className='rounded-lg max-h-40 object-cover shadow-sm'
            />
          </div>
        )}

        <h4
          className={cn(
            'text-lg font-medium mb-2',
            darkMode ? 'text-white' : 'text-gray-900',
          )}
        >
          {resource.title}
        </h4>

        <p
          className={cn(
            'text-sm',
            darkMode ? 'text-gray-300' : 'text-gray-600',
          )}
        >
          {resource.description}
        </p>
      </div>

      <FormRow columns={1}>
        <TextField
          form={form}
          name='name'
          label='Name'
          placeholder='Your name'
          required
          darkMode={darkMode}
        />
      </FormRow>

      <FormRow columns={1}>
        <TextField
          form={form}
          name='email'
          label='Email'
          placeholder='your.email@example.com'
          type='email'
          required
          darkMode={darkMode}
        />
      </FormRow>

      <FormRow columns={1}>
        <TextField
          form={form}
          name='company'
          label='Company'
          placeholder='Your company name'
          darkMode={darkMode}
        />
      </FormRow>

      {/* Form error */}
      {formError && <div className='text-red-500 text-sm'>{formError}</div>}

      <Button
        type='submit'
        disabled={isSubmitting}
        className={cn(
          'w-full mt-2',
          darkMode
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
        )}
        size='lg'
      >
        {isSubmitting ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Processing...
          </>
        ) : (
          <>
            <Download className='mr-2 h-4 w-4' />
            {buttonText}
          </>
        )}
      </Button>

      <p
        className={cn(
          'text-xs text-center mt-4',
          darkMode ? 'text-gray-400' : 'text-gray-500',
        )}
      >
        By submitting this form, you agree to receive occasional updates and
        marketing communications.
      </p>
      </BaseForm>
    </FormErrorBoundary>
  )
}
