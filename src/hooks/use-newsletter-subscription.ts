/**
 * Newsletter Subscription Mutation Hook
 * Single responsibility: API call for newsletter subscription
 */

import { useMutation } from '@tanstack/react-query';
import { trackEvent } from '@/lib/analytics';
import { logger } from '@/lib/logger';

interface NewsletterData {
  email: string;
  firstName?: string;
  source?: string;
}

interface NewsletterResponse {
  success: boolean;
  message: string;
}

async function subscribeToNewsletter(data: NewsletterData): Promise<NewsletterResponse> {
  const response = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Subscription failed');
  }

  return result;
}

export function useNewsletterSubscription() {
  return useMutation({
    mutationFn: subscribeToNewsletter,
    onSuccess: (_, variables) => {
      trackEvent('newsletter_signup', {
        email: variables.email,
        source: variables.source || 'unknown',
      });
      logger.info('Newsletter subscription successful', { source: variables.source });
    },
    onError: (error) => {
      logger.error('Newsletter subscription failed', { error: String(error) });
    },
  });
}
