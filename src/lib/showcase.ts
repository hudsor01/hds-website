/**
 * Unified Showcase Data Layer
 * Handles both portfolio items (quick) and case studies (detailed)
 */

import { eq, and, desc, asc } from 'drizzle-orm';
import { cache } from 'react';
import { db } from './db';
import { showcase, type Showcase } from './schema';
import { createServerLogger } from './logger';

const logger = createServerLogger();

// Re-export the type for convenience
export type { Showcase } from './schema';

export type ShowcaseType = 'quick' | 'detailed';

export interface ShowcaseItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string | null;
  showcaseType: ShowcaseType;
  clientName: string | null;
  industry: string | null;
  projectType: string | null;
  category: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  technologies: string[];
  metrics: Record<string, string>;
  imageUrl: string | null;
  ogImageUrl: string | null;
  galleryImages: string[] | null;
  gradientClass: string;
  externalLink: string | null;
  githubLink: string | null;
  testimonialText: string | null;
  testimonialAuthor: string | null;
  testimonialRole: string | null;
  testimonialVideoUrl: string | null;
  projectDuration: string | null;
  teamSize: number | null;
  featured: boolean;
  published: boolean;
  displayOrder: number;
  viewCount: number;
  publishedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const sanitizeSurfaceClass = (value?: string | null) => {
  if (!value) {
    return 'surface-overlay'
  }

  const normalized = value.toLowerCase()
  if (normalized.includes('gradient') || normalized.includes('from-') || normalized.includes('to-')) {
    return 'surface-overlay'
  }

  return value
}

/**
 * Map database row to ShowcaseItem
 */
function mapShowcase(row: Showcase): ShowcaseItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    longDescription: row.longDescription,
    showcaseType: (row.showcaseType as ShowcaseType) ?? 'quick',
    clientName: row.clientName,
    industry: row.industry,
    projectType: row.projectType,
    category: row.category,
    challenge: row.challenge,
    solution: row.solution,
    results: row.results,
    technologies: (row.technologies as string[]) ?? [],
    metrics: (row.metrics as Record<string, string>) ?? {},
    imageUrl: row.imageUrl,
    ogImageUrl: row.ogImageUrl,
    galleryImages: row.galleryImages as string[] | null,
    gradientClass: sanitizeSurfaceClass(row.gradientClass),
    externalLink: row.externalLink,
    githubLink: row.githubLink,
    testimonialText: row.testimonialText,
    testimonialAuthor: row.testimonialAuthor,
    testimonialRole: row.testimonialRole,
    testimonialVideoUrl: row.testimonialVideoUrl,
    projectDuration: row.projectDuration,
    teamSize: row.teamSize,
    featured: row.featured ?? false,
    published: row.published ?? false,
    displayOrder: row.displayOrder ?? 0,
    viewCount: row.viewCount ?? 0,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Get all published showcase items
 */
export const getShowcaseItems = cache(async (): Promise<ShowcaseItem[]> => {
  try {
    const rows = await db
      .select()
      .from(showcase)
      .where(eq(showcase.published, true))
      .orderBy(asc(showcase.displayOrder), desc(showcase.createdAt));

    return rows.map(mapShowcase);
  } catch (error) {
    logger.error('Failed to fetch showcase items', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
});

/**
 * Get showcase item by slug
 */
export const getShowcaseBySlug = cache(async (slug: string): Promise<ShowcaseItem | null> => {
  try {
    const [row] = await db
      .select()
      .from(showcase)
      .where(and(eq(showcase.slug, slug), eq(showcase.published, true)))
      .limit(1);

    return row ? mapShowcase(row) : null;
  } catch (error) {
    logger.error('Failed to fetch showcase item', {
      slug,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
});

/**
 * Get all showcase slugs (for static generation)
 */
export const getAllShowcaseSlugs = cache(async (): Promise<string[]> => {
  try {
    const rows = await db
      .select({ slug: showcase.slug })
      .from(showcase)
      .where(eq(showcase.published, true));

    return rows.map((row) => row.slug);
  } catch (error) {
    logger.error('Failed to fetch showcase slugs', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
});

/**
 * Get featured showcase items
 */
export const getFeaturedShowcase = cache(async (limit = 6): Promise<ShowcaseItem[]> => {
  try {
    const rows = await db
      .select()
      .from(showcase)
      .where(and(eq(showcase.published, true), eq(showcase.featured, true)))
      .orderBy(asc(showcase.displayOrder), desc(showcase.createdAt))
      .limit(limit);

    return rows.map(mapShowcase);
  } catch (error) {
    logger.error('Failed to fetch featured showcase', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
});

/**
 * Get showcase items by type (quick = portfolio, detailed = case study)
 */
export const getShowcaseByType = cache(async (type: ShowcaseType): Promise<ShowcaseItem[]> => {
  try {
    const rows = await db
      .select()
      .from(showcase)
      .where(and(eq(showcase.published, true), eq(showcase.showcaseType, type)))
      .orderBy(asc(showcase.displayOrder), desc(showcase.createdAt));

    return rows.map(mapShowcase);
  } catch (error) {
    logger.error('Failed to fetch showcase by type', {
      type,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
});

/**
 * Get quick portfolio items (showcaseType = 'quick')
 */
export const getPortfolioItems = cache(async (): Promise<ShowcaseItem[]> => {
  return getShowcaseByType('quick');
});

/**
 * Get detailed case studies (showcaseType = 'detailed')
 */
export const getCaseStudies = cache(async (): Promise<ShowcaseItem[]> => {
  return getShowcaseByType('detailed');
});

/**
 * Check if a showcase item is a detailed case study
 */
export function isDetailedShowcase(item: ShowcaseItem): boolean {
  return item.showcaseType === 'detailed';
}

/**
 * Check if a showcase item is a quick portfolio item
 */
export function isQuickShowcase(item: ShowcaseItem): boolean {
  return item.showcaseType === 'quick';
}
