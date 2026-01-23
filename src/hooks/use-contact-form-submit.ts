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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit form')
      }

      return data
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
