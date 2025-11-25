import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  User,
  Testimonial,
  CreateTestimonialInput,
  PortfolioProject,
  CreatePortfolioProjectInput,
  NewsletterSubscribersResponse,
  TrackEventInput,
} from '@/types/api';

// Query keys
export const QUERY_KEYS = {
  testimonials: ['testimonials'] as const,
  portfolioProjects: ['portfolio-projects'] as const,
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

// Portfolio projects hooks
export function usePortfolioProjects(options?: UseQueryOptions<PortfolioProject[], Error>) {
  return useQuery({
    queryKey: QUERY_KEYS.portfolioProjects,
    queryFn: async () => {
      const response = await apiClient.getPortfolioProjects();
      return response.data?.projects || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function usePortfolioProject(id: string) {
  return useQuery({
    queryKey: ['portfolio-project', id],
    queryFn: async () => {
      const response = await apiClient.getPortfolioProject(id);
      return response.data?.project;
    },
    enabled: !!id,
  });
}

export function useCreatePortfolioProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePortfolioProjectInput) => {
      return await apiClient.createPortfolioProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.portfolioProjects });
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