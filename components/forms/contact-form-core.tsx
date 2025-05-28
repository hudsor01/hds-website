'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, CheckCircle, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { BaseForm } from '@/components/forms/base-form'
import { useFormSubmission } from '@/hooks/use-form-submission'
import {
  buildContactFormSchema,
} from '@/lib/validation/form-schemas'
import type { ContactFormValues } from '@/lib/validation/form-schemas'
import { cn } from '@/lib/utils'

export interface ContactFormCoreProps {
  children: ReactNode
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
  variant?: 'default' | 'outline'
  isCard?: boolean
  additionalData?: Record<string, any>
  formVariant?: 'simple' | 'detailed'
}

/**
 * Core contact form component that handles the form state and submission logic
 * but delegates rendering of the form fields to its children
 */
export function ContactFormCore({
  children,
  className = '',
  onSuccess,
  onError,
  includeFields = ['phone'],
  submitEndpoint = 'contact.submit',
  useTrpc = true,
  title = 'Get in Touch',
  description = 'Fill out the form below and we\'ll get back to you as soon as possible.',
  successMessage = 'Message Sent! We\'ll get back to you within 24 hours.',
  darkMode = false,
  variant = 'default',
  isCard = false,
  additionalData = {},
  formVariant = 'simple',
}: ContactFormCoreProps) {
  // Build schema based on included fields
  const formSchema = buildContactFormSchema(includeFields)

  // Use the form submission hook
  const {
    submit,
    reset: resetSubmission,
    isSubmitting,
    isSubmitted,
    formError,
  } = useFormSubmission<ContactFormValues>({
    endpoint: useTrpc ? 'contact.submit' : submitEndpoint,
    useTrpc,
    successMessage,
    onSuccess,
    onError,
    toastEnabled: formVariant !== 'simple',
  })

  // Create form with react-hook-form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      phone: '',
      company: '',
      subject: '',
      service: undefined,
      budget: undefined,
    },
  })

  // Handle form submission
  const onSubmit = async (data: ContactFormValues) => {
    // Submit the form with any additional data
    await submit({
      ...data,
      ...additionalData,
    })
  }

  // Reset the form
  const resetForm = () => {
    form.reset()
    resetSubmission()
  }


  // Render success state
  if (isSubmitted) {
    return (
      <div
        className={cn(
          'rounded-lg p-8',
          darkMode
            ? 'bg-gray-800'
            : 'bg-white border border-gray-200 shadow-md',
          className,
        )}
      >
        <div className='flex flex-col items-center justify-center space-y-4 text-center py-10'>
          <CheckCircle className='h-16 w-16 text-green-500' />
          <h3
            className={cn(
              'text-2xl font-bold',
              darkMode ? 'text-white' : 'text-gray-900',
            )}
          >
            {successMessage}
          </h3>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            Thank you for contacting us. We have received your message and will
            respond to you shortly.
          </p>
          <Button
            onClick={resetForm}
            className={darkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Send Another Message
          </Button>
        </div>
      </div>
    )
  }

  // Render the form
  return (
    <BaseForm
      form={form}
      onSubmit={onSubmit}
      title={title}
      description={description}
      isCard={isCard}
      className={className}
      darkMode={darkMode}
      variant={variant}
    >
      {/* Form fields passed as children */}
      {children}

      {/* Form error */}
      {formError && <div className='text-red-500 text-sm'>{formError}</div>}

      {/* Submit button */}
      <Button
        type='submit'
        disabled={isSubmitting}
        className={cn(
          'w-full',
          formVariant !== 'simple' ? 'md:w-auto' : '',
          darkMode
            ? 'bg-blue-600 hover:bg-blue-700'
            : formVariant !== 'simple'
              ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white hover:from-blue-700 hover:to-sky-700'
              : '',
        )}
        size={formVariant === 'simple' ? 'lg' : 'default'}
      >
        {isSubmitting ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Sending...
          </>
        ) : (
          <>
            <Send className='mr-2 h-4 w-4' />
            Send Message
          </>
        )}
      </Button>
    </BaseForm>
  )
}
