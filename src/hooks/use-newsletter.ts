/**
 * Unified Newsletter Hook
 * Provides consistent newsletter signup functionality across all newsletter components
 */

"use client";

import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

interface NewsletterData {
  email: string;
  firstName?: string;
  source?: string;
}

interface UseNewsletterOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useNewsletter({ onSuccess, onError }: UseNewsletterOptions = {}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: async (data: NewsletterData) => {
      setStatus('loading');
      setMessage('');

      // Use the unified API client
      return apiClient.subscribeToNewsletter(data);
    },
    onSuccess: () => {
      setStatus('success');
      setMessage('Thank you! Check your email to confirm your subscription.');
      logger.info('Newsletter signup successful', {
        component: 'useNewsletter',
        conversionEvent: 'newsletter_signup',
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
      logger.error('Newsletter signup failed', {
        component: 'useNewsletter',
        error: error.message,
      });
      onError?.(error.message);
    },
  });

  const subscribe = (data: NewsletterData) => {
    mutation.mutate(data);
  };

  const reset = () => {
    setStatus('idle');
    setMessage('');
    mutation.reset();
  };

  return {
    status,
    message,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    subscribe,
    reset,
  };
}
