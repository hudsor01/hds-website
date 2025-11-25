import { env } from '@/env';
import type {
  ApiResponse,
  User,
  AuthResponse,
  NewsletterSubscribersResponse,
  Testimonial,
  CreateTestimonialInput,
  PortfolioProject,
  CreatePortfolioProjectInput,
  TrackEventInput,
} from '@/types/api';

// API Client class to manage all API calls
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000');
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if available
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth-token') 
      : null;
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic fetch method with error handling
  private async fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.fetcher<ApiResponse<AuthResponse>>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    // Clear auth token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
    return this.fetcher<ApiResponse>('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.fetcher<ApiResponse<{ user: User }>>('/api/auth/me', {
      method: 'GET',
    });
  }

  // Contact form
  async submitContactForm(formData: FormData) {
    // Convert FormData to object for JSON
    const object: Record<string, string> = {};
    formData.forEach((value, key) => {
      object[key] = value as string;
    });

    return this.fetcher<ApiResponse>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(object),
    });
  }

  // Newsletter endpoints
  async subscribeToNewsletter(emailData: { email: string; firstName?: string }) {
    return this.fetcher<ApiResponse>('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async getNewsletterSubscribers(page: number = 1, limit: number = 100) {
    return this.fetcher<ApiResponse<NewsletterSubscribersResponse>>(`/api/newsletter?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  }

  // Testimonials endpoints
  async getTestimonials() {
    return this.fetcher<ApiResponse<{ testimonials: Testimonial[] }>>('/api/testimonials', {
      method: 'GET',
    });
  }

  async createTestimonial(data: CreateTestimonialInput) {
    return this.fetcher<ApiResponse>('/api/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Portfolio projects endpoints
  async getPortfolioProjects() {
    return this.fetcher<ApiResponse<{ projects: PortfolioProject[] }>>('/api/portfolio/projects', {
      method: 'GET',
    });
  }

  async getPortfolioProject(id: string) {
    return this.fetcher<ApiResponse<{ project: PortfolioProject }>>(`/api/portfolio/projects/${id}`, {
      method: 'GET',
    });
  }

  async createPortfolioProject(data: CreatePortfolioProjectInput) {
    return this.fetcher<ApiResponse>('/api/portfolio/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics endpoints
  async trackEvent(eventData: TrackEventInput) {
    return this.fetcher<ApiResponse>('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Lead magnet endpoints
  async downloadLeadMagnet(resourceId: string) {
    return this.fetcher<ApiResponse<{ downloadUrl: string }>>(`/api/lead-magnet/${resourceId}`, {
      method: 'GET',
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();