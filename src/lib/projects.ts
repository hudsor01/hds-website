/**
 * Projects Data Layer - Optimized with Caching
 * Handles all project-related data fetching with Supabase
 */

import { cache } from 'react';
import { supabase, supabaseAdmin, getCached, setCache } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { logger } from './logger';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

// Cache keys
const CACHE_KEYS = {
  ALL_PROJECTS: 'projects:all',
  PUBLISHED_PROJECTS: 'projects:published',
  FEATURED_PROJECTS: 'projects:featured',
  PROJECT_BY_SLUG: (slug: string) => `project:${slug}`,
  PROJECTS_BY_CATEGORY: (category: string) => `projects:category:${category}`,
} as const;

/**
 * Get all published projects (with caching)
 * Used for portfolio listing page
 */
export const getProjects = cache(async (): Promise<Project[]> => {
  try {
    // Check cache first
    const cached = getCached<Project[]>(CACHE_KEYS.PUBLISHED_PROJECTS);
    if (cached) {
      logger.debug('Projects cache hit', { key: CACHE_KEYS.PUBLISHED_PROJECTS });
      return cached;
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      // Only log errors in development or runtime (not during build)
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch projects', { error: error.message });
      }
      return [];
    }

    const projects = data || [];

    // Cache the results
    setCache(CACHE_KEYS.PUBLISHED_PROJECTS, projects);

    logger.info('Projects fetched from database', { count: projects.length });
    return projects;
  } catch (error) {
    // Only log errors in development or runtime (not during build)
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
    // Check cache first
    const cached = getCached<Project[]>(CACHE_KEYS.FEATURED_PROJECTS);
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      // Only log errors in development or runtime (not during build)
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch featured projects', { error: error.message });
      }
      return [];
    }

    const projects = data || [];
    setCache(CACHE_KEYS.FEATURED_PROJECTS, projects);

    return projects;
  } catch (error) {
    // Only log errors in development or runtime (not during build)
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Exception fetching featured projects', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
});

/**
 * Get a single project by slug (with caching)
 * Used for individual project pages
 */
export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  try {
    // Check cache first
    const cacheKey = CACHE_KEYS.PROJECT_BY_SLUG(slug);
    const cached = getCached<Project>(cacheKey);
    if (cached) {
      logger.debug('Project cache hit', { slug, key: cacheKey });
      return cached;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      // Don't log "not found" errors or build-time errors
      if (error.code !== 'PGRST116' && (process.env.NODE_ENV === 'development' || typeof window !== 'undefined')) {
        logger.error('Failed to fetch project', { slug, error: error.message });
      }
      return null;
    }

    // Cache the result
    setCache(cacheKey, data);

    // Increment view count (fire-and-forget)
    incrementProjectViews(data.id).catch(() => {
      // Silent fail - don't block the response
    });

    return data;
  } catch (error) {
    // Only log errors in development or runtime (not during build)
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
    const cacheKey = CACHE_KEYS.PROJECTS_BY_CATEGORY(category);
    const cached = getCached<Project[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .eq('category', category)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false});

    if (error) {
      // Only log errors in development or runtime (not during build)
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch projects by category', {
          category,
          error: error.message,
        });
      }
      return [];
    }

    const projects = data || [];
    setCache(cacheKey, projects);

    return projects;
  } catch (error) {
    // Only log errors in development or runtime (not during build)
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
    const { data, error } = await supabase
      .from('projects')
      .select('slug')
      .eq('published', true);

    if (error) {
      // Only log errors in development or runtime (not during build)
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        logger.error('Failed to fetch project slugs', { error: error.message });
      }
      return [];
    }

    return (data || []).map((p) => p.slug);
  } catch (error) {
    // Only log errors in development or runtime (not during build)
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
 * Private helper function
 */
async function incrementProjectViews(projectId: string): Promise<void> {
  try {
    // First get current view count
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('view_count')
      .eq('id', projectId)
      .single();

    if (!project) {
      return;
    }

    // Increment by 1
    const { error } = await supabaseAdmin
      .from('projects')
      .update({ view_count: project.view_count + 1 })
      .eq('id', projectId);

    if (error) {
      logger.warn('Failed to increment project views', {
        projectId,
        error: error.message,
      });
    }
  } catch (error) {
    // Non-critical operation, but log for debugging
    logger.debug('View count increment failed', {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Create a new project (admin only)
 * Returns the created project or null if failed
 */
export async function createProject(project: ProjectInsert): Promise<Project | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      logger.error('Failed to create project', {
        error: error.message,
        project: project.title,
      });
      return null;
    }

    logger.info('Project created successfully', {
      id: data.id,
      slug: data.slug,
      title: data.title,
    });

    return data;
  } catch (error) {
    logger.error('Exception creating project', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Update an existing project (admin only)
 */
export async function updateProject(
  id: string,
  updates: Partial<ProjectInsert>
): Promise<Project | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update project', {
        id,
        error: error.message,
      });
      return null;
    }

    // Invalidate cache for this project
    if (data.slug) {
      setCache(CACHE_KEYS.PROJECT_BY_SLUG(data.slug), null);
    }

    logger.info('Project updated successfully', {
      id: data.id,
      slug: data.slug,
    });

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
 * Delete a project (admin only)
 */
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);

    if (error) {
      logger.error('Failed to delete project', {
        id,
        error: error.message,
      });
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
