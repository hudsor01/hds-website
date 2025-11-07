// API service functions for TanStack Query
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
      const response = await fetch('/api/portfolio/projects');
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio projects: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching portfolio projects:', error);
      throw error;
    }
  },

  // Get testimonials
  getTestimonials: async (): Promise<Testimonial[]> => {
    try {
      const response = await fetch('/api/testimonials');
      if (!response.ok) {
        throw new Error(`Failed to fetch testimonials: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  },
  
  // Get a specific testimonial by ID
  getTestimonialById: async (id: number): Promise<Testimonial | undefined> => {
    try {
      const response = await fetch(`/api/testimonials?id=${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch testimonial: ${response.status} ${response.statusText}`);
      }
      const testimonials = await response.json();
      return testimonials.find((t: Testimonial) => t.id === id);
    } catch (error) {
      console.error('Error fetching specific testimonial:', error);
      throw error;
    }
  },
  
  // Get a specific portfolio project by ID
  getPortfolioProjectById: async (id: number): Promise<PortfolioProject | undefined> => {
    try {
      const response = await fetch(`/api/portfolio/projects/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio project: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching specific portfolio project:', error);
      throw error;
    }
  }
};