import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  User,
  Testimonial,
  CreateTestimonialInput,
  NewsletterSubscribersResponse,
  TrackEventInput,
} from '@/types/api';

// Query keys
export const QUERY_KEYS = {
  testimonials: ['testimonials'] as const,
  newsletterSubscribers: ['newsletter-subscribers'] as const,
  user: ['user'] as const,
  contact: ['contact'] as const,
} as const;

// Testimonials hooks
export function useTestimonials(options?: UseQueryOptions<Testimonial[], Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.testimonials,
    queryFn: async () => {
      const response = await apiClient.getTestimonials();
      return response.data?.testimonials || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTestimonialInput) => {
      return await apiClient.createTestimonial(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.testimonials });
    },
  });
}

// Newsletter hooks
export function useNewsletterSubscribers(options?: UseQueryOptions<NewsletterSubscribersResponse | undefined, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.newsletterSubscribers,
    queryFn: async () => {
      const response = await apiClient.getNewsletterSubscribers();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (admin only data)
    ...options,
  });
}

export function useSubscribeToNewsletter() {
  return useMutation({
    mutationFn: async (data: { email: string; firstName?: string }) => {
      return await apiClient.subscribeToNewsletter(data);
    },
  });
}

// Contact form hook
export function useSubmitContactForm() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiClient.submitContactForm(formData);
    },
  });
}

// User related hooks
export function useUser(options?: UseQueryOptions<User | undefined, Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.user,
    queryFn: async () => {
      const response = await apiClient.getMe();
      return response.data?.user;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// Analytics hook
export function useTrackEvent() {
  return useMutation({
    mutationFn: async (eventData: TrackEventInput) => {
      return await apiClient.trackEvent(eventData);
    },
  });
}