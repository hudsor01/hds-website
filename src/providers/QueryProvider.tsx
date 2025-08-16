'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create a new query client instance for each client-side render
  // This ensures each user gets their own isolated cache
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // Stale time: How long data stays fresh (5 minutes)
          staleTime: 5 * 60 * 1000,
          // Cache time: How long inactive data stays in cache (10 minutes)  
          gcTime: 10 * 60 * 1000,
          // Retry failed requests 3 times with exponential backoff
          retry: (failureCount, error) => {
            // Don't retry for 4xx errors
            if (error instanceof Error && 'status' in error) {
              const status = (error as Error & { status: number }).status;
              if (status >= 400 && status < 500) return false;
            }
            return failureCount < 3;
          },
          // Retry delay with exponential backoff
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          // Refetch on window focus in production
          refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        },
        mutations: {
          // Retry failed mutations once
          retry: 1,
          // Retry delay for mutations
          retryDelay: 1000,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}