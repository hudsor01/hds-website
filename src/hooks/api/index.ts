// Export all API hooks for easy importing
export { useContactMutation } from './useContactMutation';
export { useCSRFToken } from './useCSRFToken';
export { useWebVitalsMutation } from './useWebVitalsMutation';
export { useApiQuery, useApiMutation, useHealthCheck, useMetricsStatus } from './useApiClient';

// Re-export React Query core hooks for convenience
export {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  useSuspenseQuery,
  useSuspenseInfiniteQuery,
} from '@tanstack/react-query';