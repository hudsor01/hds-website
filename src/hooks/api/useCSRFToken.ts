import { useQuery } from '@tanstack/react-query';

async function fetchCSRFToken(): Promise<{ token: string }> {
  const response = await fetch('/api/csrf', {
    method: 'GET',
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch CSRF token');
  }

  return response.json();
}

export function useCSRFToken() {
  return useQuery({
    queryKey: ['csrf-token'],
    queryFn: fetchCSRFToken,
    
    // Cache for 2 minutes to reduce API calls
    staleTime: 2 * 60 * 1000,
    
    // Cache for 5 minutes max
    gcTime: 5 * 60 * 1000,
    
    // Don't refetch automatically
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    
    // Retry once if it fails, with shorter delay
    retry: 1,
    retryDelay: 500,
    
    // Enable query when mounted
    enabled: true,
  });
}