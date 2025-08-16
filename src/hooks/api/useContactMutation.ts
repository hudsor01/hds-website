import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type ContactFormData } from '@/schemas/contact';
import { trackFormSubmission } from '@/lib/posthog';
import { useCSRFToken } from './useCSRFToken';

interface ContactResponse {
  success: boolean;
  message: string;
  leadScore?: number;
}

interface ContactError {
  error: string;
  message: string;
  status: number;
}

async function submitContactForm(data: ContactFormData & { csrfToken: string }): Promise<ContactResponse> {
  const { csrfToken, ...formData } = data;
  
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(formData),
  });

  const result = await response.json();

  if (!response.ok) {
    const error: ContactError = {
      error: result.error || 'Failed to submit form',
      message: result.message || 'Failed to submit form',
      status: response.status,
    };
    throw error;
  }

  return result;
}

export function useContactMutation() {
  const queryClient = useQueryClient();
  const { data: csrfData } = useCSRFToken();

  return useMutation({
    mutationFn: (data: ContactFormData) => {
      if (!csrfData?.token) {
        throw new Error('CSRF token not available');
      }
      return submitContactForm({ ...data, csrfToken: csrfData.token });
    },
    
    // Optimistic update for immediate UI feedback
    onMutate: async (newContact) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['contact-submissions'] });

      // Snapshot the previous value for rollback
      const previousSubmissions = queryClient.getQueryData(['contact-submissions']);

      // Optimistically update to the new value
      queryClient.setQueryData(['contact-submissions'], (old: unknown[]) => [
        ...(old || []),
        { ...newContact, id: Date.now(), status: 'pending' }
      ]);

      // Return a context object with the snapshotted value
      return { previousSubmissions };
    },

    // If the mutation succeeds, track analytics and invalidate queries
    onSuccess: (data, variables) => {
      // Track successful submission with lead score
      trackFormSubmission('contact', true, {
        service: variables.service,
        budget: variables.budget,
        hasCompany: !!variables.company,
        leadScore: data.leadScore,
      });

      // Invalidate and refetch contact-related queries
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    },

    // If the mutation fails, rollback optimistic update and track error
    onError: (error, variables, context) => {
      // Track failed submission
      trackFormSubmission('contact', false);

      // Rollback optimistic update
      if (context?.previousSubmissions) {
        queryClient.setQueryData(['contact-submissions'], context.previousSubmissions);
      }
    },

    // Always called after success or error
    onSettled: () => {
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    },

    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry for client errors (4xx)
      if (error && 'status' in error) {
        const status = (error as Error & { status: number }).status;
        if (status >= 400 && status < 500) return false;
      }
      return failureCount < 2;
    },

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}