/**
 * Supabase Type Helpers
 * Helper types for Supabase queries to eliminate 'any' usage
 */

import type { Database } from './database';

// Table row types
export type LeadAttributionRow = Database['public']['Tables']['lead_attribution']['Row'];
export type LeadAttributionInsert = Database['public']['Tables']['lead_attribution']['Insert'];
export type LeadAttributionUpdate = Database['public']['Tables']['lead_attribution']['Update'];

export type WebVitalsRow = Database['public']['Tables']['web_vitals']['Row'];
export type WebVitalsInsert = Database['public']['Tables']['web_vitals']['Insert'];

// Case Studies types
export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  client_industry: string;
  client_logo_url: string | null;
  challenge: string;
  solution: string;
  results: string;
  metrics: {
    label: string;
    value: string;
    change?: string;
  }[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
    company: string;
    avatar_url?: string;
  } | null;
  video_testimonial_url: string | null;
  featured: boolean;
  technologies: string[];
  project_duration: string | null;
  project_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseStudyInsert extends Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export type CaseStudyUpdate = Partial<CaseStudyInsert>;

// Newsletter Subscribers types
export interface NewsletterSubscriber {
  id: string;
  email: string;
  first_name: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  status: 'active' | 'unsubscribed';
  source: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriberInsert extends Omit<NewsletterSubscriber, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

// Lead Notes types
export interface LeadNote {
  id: string;
  lead_id: string;
  note: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadNoteInsert extends Omit<LeadNote, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

// Supabase query result types
export interface SupabaseQueryResult<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

export interface SupabaseQueryArrayResult<T> {
  data: T[] | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

// Performance entry types for performance-monitoring.ts
export interface LargestContentfulPaintEntry extends PerformanceEntry {
  size?: number;
  element?: Element;
}

export interface LayoutShiftEntry extends PerformanceEntry {
  value?: number;
  hadRecentInput?: boolean;
}

export interface FirstInputEntry extends PerformanceEntry {
  processingStart?: number;
}
