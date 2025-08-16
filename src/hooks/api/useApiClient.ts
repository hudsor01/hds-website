import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
}

async function apiRequest<T>(url: string, options: ApiClientOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    credentials = 'same-origin',
  } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Hook for GET requests (queries)
export function useApiQuery<T>(
  queryKey: (string | number)[],
  url: string,
  options: Omit<ApiClientOptions, 'method'> = {},
  queryOptions: Partial<UseQueryOptions<T, Error>> = {}
) {
  return useQuery({
    queryKey,
    queryFn: () => apiRequest<T>(url, { ...options, method: 'GET' }),
    ...queryOptions,
  });
}

// Hook for POST/PUT/DELETE requests (mutations)
export function useApiMutation<TData, TVariables>(
  url: string | ((variables: TVariables) => string),
  options: Omit<ApiClientOptions, 'body'> = {},
  mutationOptions: Partial<UseMutationOptions<TData, Error, TVariables>> & {
    invalidateQueries?: (string | number)[];
  } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) => {
      const requestUrl = typeof url === 'function' ? url(variables) : url;
      return apiRequest<TData>(requestUrl, {
        ...options,
        body: variables,
      });
    },
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries by default
      if (mutationOptions.invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: mutationOptions.invalidateQueries });
      }
      
      // Call custom onSuccess if provided
      if (mutationOptions.onSuccess) {
        mutationOptions.onSuccess(data, variables, context);
      }
    },
    ...mutationOptions,
  });
}

// Specialized hooks for common endpoints
export function useHealthCheck() {
  return useApiQuery(['health'], '/api/metrics', {}, {
    staleTime: 30000, // 30 seconds
    gcTime: 60000, // 1 minute
    retry: 2,
  });
}

export function useMetricsStatus() {
  return useApiQuery(['metrics-status'], '/api/metrics', {}, {
    enabled: process.env.NODE_ENV === 'development',
    staleTime: 10000, // 10 seconds
    retry: 1,
  });
}