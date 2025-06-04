import { QueryClient } from '@tanstack/react-query'

/**
 * Query cache configuration for React Query
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Stale time: How long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time: How long inactive data stays in cache
      gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime in v5)
      
      // Retry configuration
      retry: (failureCount: number, error: unknown) => {
        // Don't retry on 4xx errors except 408, 429
        const err = error as { status?: number }
        if (err?.status && err.status >= 400 && err.status < 500 && ![408, 429].includes(err.status)) {
          return false
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Background refetch configuration
      refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
      refetchOnReconnect: 'always', // Always refetch on reconnect
      refetchOnMount: true, // Refetch on component mount
      
      // Network mode
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      // Retry configuration for mutations
      retry: (failureCount: number, error: unknown) => {
        // Don't retry client errors
        const err = error as { status?: number }
        if (err?.status && err.status >= 400 && err.status < 500) {
          return false
        }
        
        // Retry server errors up to 2 times
        return failureCount < 2
      },
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
}

/**
 * Create a new QueryClient with optimized cache settings
 */
export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig)
}

/**
 * Query key factories for consistent cache keys
 */
export const queryKeys = {
  // Contact form related
  contact: {
    all: ['contact'] as const,
    submissions: () => [...queryKeys.contact.all, 'submissions'] as const,
  },
  
  // Newsletter related
  newsletter: {
    all: ['newsletter'] as const,
    subscriptions: () => [...queryKeys.newsletter.all, 'subscriptions'] as const,
  },
  
  // Lead magnet related
  leadMagnet: {
    all: ['leadMagnet'] as const,
    resources: () => [...queryKeys.leadMagnet.all, 'resources'] as const,
    downloads: () => [...queryKeys.leadMagnet.all, 'downloads'] as const,
    resource: (id: string) => [...queryKeys.leadMagnet.all, 'resource', id] as const,
  },
  
  // Analytics related
  analytics: {
    all: ['analytics'] as const,
    pageViews: () => [...queryKeys.analytics.all, 'pageViews'] as const,
    events: () => [...queryKeys.analytics.all, 'events'] as const,
  },
  
  // Authentication related
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
} as const

/**
 * Cache invalidation helpers
 */
export class CacheManager {
  constructor(private queryClient: QueryClient) {}
  
  // Invalidate all contact-related queries
  invalidateContact() {
    return this.queryClient.invalidateQueries({ queryKey: queryKeys.contact.all })
  }
  
  // Invalidate all newsletter-related queries
  invalidateNewsletter() {
    return this.queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.all })
  }
  
  // Invalidate all lead magnet-related queries
  invalidateLeadMagnet() {
    return this.queryClient.invalidateQueries({ queryKey: queryKeys.leadMagnet.all })
  }
  
  // Invalidate all analytics queries
  invalidateAnalytics() {
    return this.queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all })
  }
  
  // Invalidate auth queries
  invalidateAuth() {
    return this.queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
  }
  
  // Clear all cache
  clearAll() {
    return this.queryClient.clear()
  }
  
  // Remove specific queries
  removeQueries(queryKey: readonly unknown[]) {
    return this.queryClient.removeQueries({ queryKey })
  }
}

/**
 * Cache optimization strategies
 */
export const cacheStrategies = {
  // For static content that rarely changes
  static: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // For dynamic content that changes frequently
  dynamic: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // For user-specific content
  user: {
    staleTime: 0, // Always stale
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // For real-time content
  realtime: {
    staleTime: 0, // Always stale
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  },
} as const