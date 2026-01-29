/**
 * Projects Data Layer
 * Handles all project-related data fetching with Supabase
 */

import { env } from '@/env';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { logger } from './logger';

type Project = Database['public']['Tables']['projects']['Row'];

// Service role client ONLY for background operations with no user context
function createServiceClient() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publicKey) {
    logger.error('Supabase environment variables are not configured for projects service client');
    return null;
  }

  return createSupabaseClient<Database>(
    supabaseUrl,
    publicKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Get all published projects
 * Used for portfolio listing page
 */
export const getProjects = cache(async (): Promise<Project[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch projects', { error: error.message });
      }
      return [];
    }

    return data || [];
  } catch (error) {
    if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching projects', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
});

/**
 * Get featured projects only
 * Used for homepage or featured section
 */
export const getFeaturedProjects = cache(async (): Promise<Project[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch featured projects', { error: error.message });
      }
      return [];
    }

    return data || [];
  } catch (error) {
    if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching featured projects', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
});

/**
 * Get a single project by slug
 * Used for individual project pages
 */
export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code !== 'PGRST116' && (env.NODE_ENV === 'development' || typeof window !== 'undefined')) {
        logger.error('Failed to fetch project', { slug, error: error.message });
      }
      return null;
    }

    // Increment view count (fire-and-forget)
    incrementProjectViews(data.id).catch(() => {});

    return data;
  } catch (error) {
    if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching project', {
        slug,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  }
});

/**
 * Get all project slugs for static generation
 * Used by generateStaticParams
 */
export const getAllProjectSlugs = cache(async (): Promise<string[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('slug')
      .eq('published', true);

    if (error) {
      if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch project slugs', { error: error.message });
      }
      return [];
    }

    return (data || []).map((p) => p.slug);
  } catch (error) {
    if (env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching project slugs', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
});

/**
 * Increment project view count (non-blocking)
 */
async function incrementProjectViews(projectId: string): Promise<void> {
  try {
    const adminClient = createServiceClient();

    if (!adminClient) {
      return;
    }
    const { data: project } = await adminClient
      .from('projects')
      .select('view_count')
      .eq('id', projectId)
      .single();

    if (!project) {
      return;
    }

    const { error } = await adminClient
      .from('projects')
      .update({ view_count: project.view_count + 1 })
      .eq('id', projectId);

    if (error) {
      logger.warn('Failed to increment project views', { projectId, error: error.message });
    }
  } catch (error) {
    logger.debug('View count increment failed', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Helper to parse stats JSON safely
 */
export function parseProjectStats(stats: unknown): Record<string, string> {
  try {
    if (typeof stats === 'object' && stats !== null) {
      return stats as Record<string, string>;
    }
    return {};
  } catch (error) {
    logger.warn('Failed to parse project stats', {
      error: error instanceof Error ? error.message : String(error),
    });
    return {};
  }
}
