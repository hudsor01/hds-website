'use client';

import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Create a single instance of QueryClient with advanced features
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query configuration
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false, // We'll handle this manually for important data
      refetchOnReconnect: true,
      refetchOnMount: false, // Only refetch if data is stale
    }
  }
});

interface QueryProviderProps {
  children: ReactNode;
}

// Handle focus management for browser environments only
if (typeof window !== 'undefined') {
  focusManager.setEventListener(handleFocus => {
    // Set up listener for visibility change events
    const visibilityChangeHandler = () => {
      handleFocus(document.visibilityState === 'visible');
    };

    window.addEventListener('visibilitychange', visibilityChangeHandler, false);

    return () => {
      window.removeEventListener('visibilitychange', visibilityChangeHandler, false);
    };
  });
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;