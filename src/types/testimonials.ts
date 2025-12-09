/**
 * Testimonial Types and Constants
 * Safe to import in both server and client components
 */

export interface TestimonialRequest {
  id: string;
  token: string;
  client_name: string;
  client_email: string | null;
  project_name: string | null;
  created_at: string;
  expires_at: string;
  submitted: boolean;
  submitted_at: string | null;
}

export interface Testimonial {
  id: string;
  request_id: string | null;
  client_name: string;
  company: string | null;
  role: string | null;
  rating: number;
  content: string;
  photo_url: string | null;
  video_url: string | null;
  service_type: string | null;
  approved: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export type ServiceType =
  | 'web-development'
  | 'saas-consulting'
  | 'digital-marketing'
  | 'ui-ux-design'
  | 'seo'
  | 'other';

export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'saas-consulting', label: 'SaaS Consulting' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'seo', label: 'SEO Services' },
  { value: 'other', label: 'Other' },
];
