/**
 * Projects Data Layer
 * Handles all project-related data fetching with Supabase
 */

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { logger } from './logger';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

// Service role client ONLY for background operations with no user context
function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch projects', { error: error.message });
      }
      return [];
    }

    return data || [];
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
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
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch featured projects', { error: error.message });
      }
      return [];
    }

    return data || [];
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
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
      if (error.code !== 'PGRST116' && (process.env.NODE_ENV === 'development' || typeof window !== 'undefined')) {
        logger.error('Failed to fetch project', { slug, error: error.message });
      }
      return null;
    }

    // Increment view count (fire-and-forget)
    incrementProjectViews(data.id).catch(() => {});

    return data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching project', {
        slug,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  }
});

/**
 * Get projects by category
 */
export const getProjectsByCategory = cache(async (category: string): Promise<Project[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .eq('category', category)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch projects by category', {
          category,
          error: error.message,
        });
      }
      return [];
    }

    return data || [];
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching projects by category', {
        category,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
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
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch project slugs', { error: error.message });
      }
      return [];
    }

    return (data || []).map((p) => p.slug);
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching project slugs', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
});

/**
 * Get unique categories for filtering
 */
export const getProjectCategories = cache(async (): Promise<string[]> => {
  try {
    const projects = await getProjects();
    const categories = [...new Set(projects.map((p) => p.category))];
    return categories.sort();
  } catch (error) {
    logger.error('Exception fetching project categories', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
});

/**
 * Increment project view count (non-blocking)
 */
async function incrementProjectViews(projectId: string): Promise<void> {
  try {
    const adminClient = createServiceClient();
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
 * Create a new project (admin only - requires authenticated admin user)
 */
export async function createProject(project: ProjectInsert): Promise<Project | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create project', { error: error.message, project: project.title });
      return null;
    }

    logger.info('Project created successfully', { id: data.id, slug: data.slug, title: data.title });
    return data;
  } catch (error) {
    logger.error('Exception creating project', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Update an existing project (admin only - requires authenticated admin user)
 */
export async function updateProject(id: string, updates: Partial<ProjectInsert>): Promise<Project | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update project', { id, error: error.message });
      return null;
    }

    logger.info('Project updated successfully', { id: data.id, slug: data.slug });
    return data;
  } catch (error) {
    logger.error('Exception updating project', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Delete a project (admin only - requires authenticated admin user)
 */
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      logger.error('Failed to delete project', { id, error: error.message });
      return false;
    }

    logger.info('Project deleted successfully', { id });
    return true;
  } catch (error) {
    logger.error('Exception deleting project', {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
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
