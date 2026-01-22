/**
 * Projects Data Layer
 * Handles all project-related data fetching with Drizzle ORM
 */

import { eq, and, asc, desc, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from './db';
import { projects, type Project as ProjectRow } from './schema';
import { logger } from './logger';

/**
 * Project type for API compatibility
 * Maps camelCase schema to snake_case API format
 */
export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  long_description: string | null;
  category: string;
  tech_stack: string[];
  technologies: string[] | null;
  image_url: string;
  gradient_class: string;
  external_link: string | null;
  github_link: string | null;
  case_study_url: string | null;
  stats: Record<string, string>;
  results_metrics: unknown;
  challenges: string[] | null;
  solutions: string[] | null;
  testimonial_text: string | null;
  testimonial_author: string | null;
  testimonial_author_title: string | null;
  testimonial_video_url: string | null;
  industry: string | null;
  project_duration: string | null;
  team_size: number | null;
  gallery_images: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  display_order: number;
  view_count: number;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const mapProject = (row: ProjectRow): Project => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  description: row.description,
  long_description: row.longDescription,
  category: row.category,
  tech_stack: row.techStack ?? [],
  technologies: row.technologies,
  image_url: row.imageUrl,
  gradient_class: row.gradientClass,
  external_link: row.externalLink,
  github_link: row.githubLink,
  case_study_url: row.caseStudyUrl,
  stats: (row.stats as Record<string, string>) ?? {},
  results_metrics: row.resultsMetrics,
  challenges: row.challenges,
  solutions: row.solutions,
  testimonial_text: row.testimonialText,
  testimonial_author: row.testimonialAuthor,
  testimonial_author_title: row.testimonialAuthorTitle,
  testimonial_video_url: row.testimonialVideoUrl,
  industry: row.industry,
  project_duration: row.projectDuration,
  team_size: row.teamSize,
  gallery_images: row.galleryImages,
  meta_title: row.metaTitle,
  meta_description: row.metaDescription,
  og_image_url: row.ogImageUrl,
  display_order: row.displayOrder,
  view_count: row.viewCount,
  featured: row.featured,
  published: row.published,
  published_at: row.publishedAt?.toISOString() ?? null,
  created_at: row.createdAt.toISOString(),
  updated_at: row.updatedAt.toISOString(),
});

/**
 * Get all published projects
 * Used for portfolio listing page
 */
export const getProjects = cache(async (): Promise<Project[]> => {
  try {
    const data = await db
      .select()
      .from(projects)
      .where(eq(projects.published, true))
      .orderBy(asc(projects.displayOrder), desc(projects.createdAt));

    return data.map(mapProject);
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
    const data = await db
      .select()
      .from(projects)
      .where(and(eq(projects.published, true), eq(projects.featured, true)))
      .orderBy(asc(projects.displayOrder), desc(projects.createdAt));

    return data.map(mapProject);
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
    const [data] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.published, true)))
      .limit(1);

    if (!data) {
      return null;
    }

    // Increment view count (fire-and-forget)
    incrementProjectViews(data.id).catch(() => {});

    return mapProject(data);
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
 * Get all project slugs for static generation
 * Used by generateStaticParams
 */
export const getAllProjectSlugs = cache(async (): Promise<string[]> => {
  try {
    const data = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.published, true));

    return data.map((p) => p.slug);
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
 * Increment project view count (non-blocking)
 */
async function incrementProjectViews(projectId: string): Promise<void> {
  try {
    await db
      .update(projects)
      .set({ viewCount: sql`${projects.viewCount} + 1` })
      .where(eq(projects.id, projectId));
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
