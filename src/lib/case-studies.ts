/**
 * Case Studies Data Layer
 * Handles all case study data fetching with Supabase
 */

import { env } from '@/env';
import { createClient } from '@/lib/supabase/server';
import { logger } from './logger';
import type { Database } from '@/types/database';

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

type CaseStudyRow = Database['public']['Tables']['case_studies']['Row'];

const mapCaseStudy = (row: CaseStudyRow): CaseStudy => ({
  ...row,
  metrics: Array.isArray(row.metrics) ? row.metrics as Array<{ label: string; value: string }> : [],
  technologies: Array.isArray(row.technologies) ? row.technologies as string[] : [],
  testimonial_text: row.testimonial_text || '',
  testimonial_author: row.testimonial_author || '',
  testimonial_role: row.testimonial_role || '',
  testimonial_video_url: row.testimonial_video_url,
  thumbnail_url: row.thumbnail_url || undefined,
  featured_image_url: row.featured_image_url || undefined,
  project_url: row.project_url,
  project_duration: row.project_duration || '',
  team_size: row.team_size || 0,
  featured: row.featured ?? false,
  published: row.published ?? false,
  created_at: row.created_at || undefined,
});

/**
 * Get all published case studies
 */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      // Only log errors in development or runtime (not during build)
      if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch case studies', { error: error.message });
      }
      return [];
    }

    return (data || []).map(mapCaseStudy);
  } catch (error) {
    // Only log errors in development or runtime (not during build)
    if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching case studies', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
}

/**
 * Get a single case study by slug
 */
export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      // Don't log "not found" errors or build-time errors
      if (error.code !== 'PGRST116' && (env.NODE_ENV === 'development' || typeof window !== 'undefined')) {
        logger.error('Failed to fetch case study', { slug, error: error.message });
      }
      return null;
    }

    return data ? mapCaseStudy(data as CaseStudyRow) : null;
  } catch (error) {
    // Only log errors in development or runtime (not during build)
    if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching case study', {
        slug,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  }
}

/**
 * Get all case study slugs for static generation
 */
export async function getAllCaseStudySlugs(): Promise<string[]> {
  
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('slug')
      .eq('published', true);

    if (error) {
      // Only log errors in development or runtime (not during build)
      if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch case study slugs', { error: error.message });
      }
      return [];
    }

    return (data || []).map((c) => c.slug);
  } catch (error) {
    // Only log errors in development or runtime (not during build)
    if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching case study slugs', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
}

/**
 * Get featured case studies
 */
export async function getFeaturedCaseStudies(): Promise<CaseStudy[]> {
  
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      // Only log errors in development or runtime (not during build)
      if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch featured case studies', { error: error.message });
      }
      return [];
    }

    return (data || []).map(mapCaseStudy);
  } catch (error) {
    // Only log errors in development or runtime (not during build)
    if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching featured case studies', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
}
