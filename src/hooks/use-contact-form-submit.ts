import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { logger } from '@/lib/logger'
import type { ContactFormData } from '@/lib/schemas/contact'

export type { ContactFormData } from '@/lib/schemas/contact'

export interface ContactFormResponse {
  success: boolean
  message?: string
  error?: string
}

export function useContactFormSubmit() {
  return useMutation<ContactFormResponse, Error, ContactFormData>({
    mutationFn: async (formData) => {
      // Validation handled by TanStack Form + Zod
      // Convert to FormData for the API
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, String(value))
        }
      })

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: form,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed')
      }

      return { success: true, message: data.message }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Thank you for contacting us. We'll get back to you within 24 hours.", {
          duration: 5000
        })
        logger.info('Contact form submission successful', {
          component: 'ContactForm',
          userFlow: 'lead_generation',
          conversionEvent: 'contact_form_completed',
          businessValue: 'high'
        })
      } else {
        toast.error(data.error || 'An error occurred. Please try again.', {
          duration: 7000
        })
      }
    },
    onError: (error) => {
      logger.error('Contact form submission failed', error)
      toast.error(error.message || 'An unexpected error occurred. Please try again later.', {
        duration: 7000
      })
    }
  })
}
