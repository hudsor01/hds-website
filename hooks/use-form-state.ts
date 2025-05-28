'use client'

import { useState } from 'react'
import {
  useForm,
} from 'react-hook-form'
import type {
  UseFormProps,
  FieldValues,
  Path,
  UseFormReturn,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface FormStateOptions<T extends FieldValues> extends UseFormProps<T> {
  schema?: z.ZodSchema<T>
  defaultValues?: Partial<T>
  onSubmit?: (values: T) => Promise<void> | void
}

/**
 * Form state management hook
 * This hook provides a consistent way to manage form state across the application.
 * It wraps React Hook Form and provides additional state for form status.
 */
export function useFormState<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  ...formOptions
}: FormStateOptions<T>) {
  // Form status states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Create form with React Hook Form
  const form = useForm<T>({
    ...formOptions,
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: defaultValues as T,
  })

  // Handle form submission
  const handleSubmit = async (values: T) => {
    setIsSubmitting(true)
    setFormError(null)

    try {
      if (onSubmit) {
        await onSubmit(values)
      }

      setIsSubmitted(true)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred')

      // Set form error
      form.setError('root' as Path<T>, {
        type: 'manual',
        message:
          error instanceof Error ? error.message : 'Form submission failed',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form state
  const resetForm = () => {
    form.reset(defaultValues as T)
    setIsSubmitted(false)
    setFormError(null)
  }

  // Set a specific field value
  const setField = <K extends Path<T>>(name: K, value: T[K]) => {
    form.setValue(name, value, { shouldValidate: true, shouldDirty: true })
  }

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    formState: {
      ...form.formState,
      isSubmitting,
      isSubmitted,
      formError,
    },
    isSubmitting,
    isSubmitted,
    formError,
    resetForm,
    setField,
  }
}

/**
 * Type helper for useFormState
 * This type helper provides type safety for the form state hook.
 */
export type FormState<T extends FieldValues> = {
  form: UseFormReturn<T>
  handleSubmit: ReturnType<UseFormReturn<T>['handleSubmit']>
  formState: ReturnType<UseFormReturn<T>['formState']> & {
    isSubmitting: boolean
    isSubmitted: boolean
    formError: string | null
  }
  isSubmitting: boolean
  isSubmitted: boolean
  formError: string | null
  resetForm: () => void
  setField: <K extends Path<T>>(name: K, value: T[K]) => void
}
