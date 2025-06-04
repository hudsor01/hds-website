'use client'

import { useState } from 'react'
import type { HTTPMethod } from '@/types/enum-types'
import type { ApiResponse } from '@/types/api-types'
import { useToast } from '@/components/ui/use-toast'

export interface FormSubmissionOptions<T = Record<string, unknown>> {
  endpoint?: string
  useTrpc?: boolean
  onSuccess?: (data: Record<string, unknown>) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
  toastEnabled?: boolean
  redirectUrl?: string
  method?: HTTPMethod
  transform?: (data: T) => Record<string, unknown>
}

export interface FormSubmissionResult<T = Record<string, unknown>> {
  success: boolean
  data?: T
  error?: Error
}

/**
 * Form submission hook for handling form submissions
 * This hook provides a consistent way to submit forms with various API methods
 * and handle success/error states.
 */
export function useFormSubmission<T = Record<string, unknown>>(
  options: FormSubmissionOptions<T> = {},
) {
  const {
    endpoint = '/api/contact',
    useTrpc = true,
    onSuccess,
    onError,
    successMessage = 'Form submitted successfully',
    errorMessage = 'Failed to submit form',
    toastEnabled = true,
    method = 'POST',
    transform,
  } = options

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { toast } = useToast()

  const submit = async (data: T, additionalData: Record<string, unknown> = {}) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      // Transform data if transform function is provided
      const transformedData = transform ? transform(data) : data
      const submitData = { ...transformedData, ...additionalData }

      let response: Record<string, unknown>

      // Use tRPC or fetch based on options
      if (useTrpc) {
        // Import api from trpc/client
        const { api } = await import('@/lib/trpc/client')

        // Extract endpoint parts (e.g., 'contact.submit' => ['contact', 'submit'])
        const [router, procedure] = endpoint.replace('/api/', '').split('.')

        if (!router || !procedure) {
          throw new Error(
            "Invalid tRPC endpoint format. Use 'router.procedure' format.",
          )
        }

        // Get the router and procedure
        // @ts-expect-error - Dynamic access
        response = await api[router][procedure].mutate(submitData)

        if (response && !response.success) {
          throw new Error(response.message || errorMessage)
        }
      } else {
        // Regular fetch
        const fetchResponse = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        })

        if (!fetchResponse.ok) {
          const error = await fetchResponse.json().catch(() => null)
          throw new Error(error?.message || errorMessage)
        }

        response = await fetchResponse.json().catch(() => ({}))
      }

      // Update state on success
      setIsSubmitted(true)

      // Show toast if enabled
      if (toastEnabled) {
        toast({
          title: 'Success',
          description: successMessage,
        })
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response)
      }

      return { success: true, data: response } as FormSubmissionResult<Record<string, unknown>>
    } catch (error) {
      console.error('Form submission error:', error)

      // Update error state
      setFormError(error instanceof Error ? error.message : errorMessage)

      // Show toast if enabled
      if (toastEnabled) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : errorMessage,
          variant: 'destructive',
        })
      }

      // Call error callback if provided
      if (onError && error instanceof Error) {
        onError(error)
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      } as FormSubmissionResult<Record<string, unknown>>
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setIsSubmitted(false)
    setFormError(null)
  }

  return {
    submit,
    reset,
    isSubmitting,
    isSubmitted,
    formError,
  }
}
