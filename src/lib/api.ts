// API service functions for TanStack Query
import { logger } from '@/lib/logger';

/**
 * Fetch with timeout using AbortController
 * Per MDN: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

export interface PortfolioProject {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  gradient: string;
  stats: {
    [key: string]: string;
  };
  tech: string[];
  link: string;
  featured?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  service: string;
  highlight: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Real API functions that connect to actual API endpoints
export const apiService = {
  // Get portfolio projects
  getPortfolioProjects: async (): Promise<PortfolioProject[]> => {
    try {
      const response = await fetchWithTimeout('/api/portfolio/projects', {}, 10000);
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio projects: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Error fetching portfolio projects', error as Error);
      throw error;
    }
  },

  // Get testimonials
  getTestimonials: async (): Promise<Testimonial[]> => {
    try {
      const response = await fetchWithTimeout('/api/testimonials', {}, 10000);
      if (!response.ok) {
        throw new Error(`Failed to fetch testimonials: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Error fetching testimonials', error as Error);
      throw error;
    }
  },
  
  // Get a specific testimonial by ID
  getTestimonialById: async (id: number): Promise<Testimonial | undefined> => {
    try {
      const response = await fetchWithTimeout(`/api/testimonials?id=${id}`, {}, 10000);
      if (!response.ok) {
        throw new Error(`Failed to fetch testimonial: ${response.status} ${response.statusText}`);
      }
      const testimonials = await response.json();
      return testimonials.find((t: Testimonial) => t.id === id);
    } catch (error) {
      logger.error('Error fetching specific testimonial', error as Error);
      throw error;
    }
  },
  
  // Get a specific portfolio project by ID
  getPortfolioProjectById: async (id: number): Promise<PortfolioProject | undefined> => {
    try {
      const response = await fetchWithTimeout(`/api/portfolio/projects/${id}`, {}, 10000);
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio project: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      logger.error('Error fetching specific portfolio project', error as Error);
      throw error;
    }
  }
};