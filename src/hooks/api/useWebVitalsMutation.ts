import { useMutation } from '@tanstack/react-query';

interface WebVitalsData {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
  pathname: string;
}

async function sendWebVitals(vitals: WebVitalsData): Promise<void> {
  const response = await fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vitals),
  });

  if (!response.ok) {
    throw new Error(`Failed to send web vitals: ${response.statusText}`);
  }
}

export function useWebVitalsMutation() {
  return useMutation({
    mutationFn: sendWebVitals,
    
    // Don't retry web vitals reporting failures
    retry: false,
    
    // Silent failure for analytics
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to send web vitals:', error);
      }
    },
    
    // Track successful web vitals reporting in dev
    onSuccess: (data, variables) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('Web vitals sent:', variables);
      }
    },
  });
}