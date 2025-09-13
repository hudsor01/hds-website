import { useMutation, useQuery } from '@tanstack/react-query'
import type { ContactFormData } from '@/types/forms'

// Fetch CSRF token
export function useCSRFToken() {
  return useQuery({
    queryKey: ['csrf-token'],
    queryFn: async () => {
      const response = await fetch('/api/csrf')
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token')
      }
      const data = await response.json()
      return data.token as string
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// Submit contact form
export function useSubmitContactForm() {
  return useMutation({
    mutationFn: async ({ data, csrfToken }: { data: ContactFormData; csrfToken: string }) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message')
      }

      return result
    },
  })
}