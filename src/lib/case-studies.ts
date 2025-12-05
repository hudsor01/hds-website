/**
 * Case Studies Data Layer
 * Handles all case study data fetching with Supabase
 */

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { logger } from './logger';

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client_name: string;
  industry: string;
  project_type: string;
  description: string;
  challenge?: string;
  solution?: string;
  results?: string;
  technologies?: string[];
  metrics: Array<{ label: string; value: string }>;
  testimonial_text: string;
  testimonial_author: string;
  testimonial_role: string;
  testimonial_video_url: string | null;
  thumbnail_url?: string;
  featured_image_url?: string;
  project_url: string | null;
  project_duration: string;
  team_size: number;
  featured: boolean;
  published: boolean;
  created_at?: string;
}

/**
 * Get all published case studies
 */
export const getCaseStudies = cache(async (): Promise<CaseStudy[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      // Only log errors in development or runtime (not during build)
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch case studies', { error: error.message });
      }
      return [];
    }

    return (data as unknown as CaseStudy[]) || [];
  } catch (error) {
    // Only log errors in development or runtime (not during build)
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching case studies', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
});

/**
 * Get a single case study by slug
 */
export const getCaseStudyBySlug = cache(async (slug: string): Promise<CaseStudy | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      // Don't log "not found" errors or build-time errors
      if (error.code !== 'PGRST116' && (process.env.NODE_ENV === 'development' || typeof window !== 'undefined')) {
        logger.error('Failed to fetch case study', { slug, error: error.message });
      }
      return null;
    }

    return data as unknown as CaseStudy;
  } catch (error) {
    // Only log errors in development or runtime (not during build)
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching case study', {
        slug,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  }
});

/**
 * Get all case study slugs for static generation
 */
export const getAllCaseStudySlugs = cache(async (): Promise<string[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies' as 'lead_attribution')
      .select('slug')
      .eq('published', true);

    if (error) {
      // Only log errors in development or runtime (not during build)
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch case study slugs', { error: error.message });
      }
      return [];
    }

    return ((data as unknown as Array<{ slug: string }>) || []).map((c) => c.slug);
  } catch (error) {
    // Only log errors in development or runtime (not during build)
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching case study slugs', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
});

/**
 * Get featured case studies
 */
export const getFeaturedCaseStudies = cache(async (): Promise<CaseStudy[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies' as 'lead_attribution')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      // Only log errors in development or runtime (not during build)
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch featured case studies', { error: error.message });
      }
      return [];
    }

    return (data as unknown as CaseStudy[]) || [];
  } catch (error) {
    // Only log errors in development or runtime (not during build)
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching featured case studies', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
});
