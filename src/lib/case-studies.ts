/**
 * Case Studies Data Layer
 * Handles all case study data fetching with Drizzle ORM
 */

import { eq, desc, and } from 'drizzle-orm';
import { db } from './db';
import { caseStudies, type CaseStudy as CaseStudyRow } from './schema';
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

const mapCaseStudy = (row: CaseStudyRow): CaseStudy => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  client_name: row.clientName ?? '',
  industry: row.industry ?? '',
  project_type: row.projectType ?? '',
  description: row.description ?? '',
  challenge: row.challenge ?? undefined,
  solution: row.solution ?? undefined,
  results: row.results ?? undefined,
  technologies: Array.isArray(row.technologies) ? row.technologies as string[] : [],
  metrics: Array.isArray(row.metrics) ? row.metrics as Array<{ label: string; value: string }> : [],
  testimonial_text: row.testimonialText ?? '',
  testimonial_author: row.testimonialAuthor ?? '',
  testimonial_role: row.testimonialRole ?? '',
  testimonial_video_url: row.testimonialVideoUrl,
  thumbnail_url: row.thumbnailUrl ?? undefined,
  featured_image_url: row.featuredImageUrl ?? undefined,
  project_url: row.projectUrl,
  project_duration: row.projectDuration ?? '',
  team_size: row.teamSize ?? 0,
  featured: row.featured ?? false,
  published: row.published ?? false,
  created_at: row.createdAt?.toISOString() ?? undefined,
});

/**
 * Get all published case studies
 */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  try {
    const data = await db
      .select()
      .from(caseStudies)
      .where(eq(caseStudies.published, true))
      .orderBy(desc(caseStudies.createdAt));

    return data.map(mapCaseStudy);
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Failed to fetch case studies', {
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
    const [data] = await db
      .select()
      .from(caseStudies)
      .where(and(eq(caseStudies.slug, slug), eq(caseStudies.published, true)))
      .limit(1);

    return data ? mapCaseStudy(data) : null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Failed to fetch case study', {
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
    const data = await db
      .select({ slug: caseStudies.slug })
      .from(caseStudies)
      .where(eq(caseStudies.published, true));

    return data.map((c) => c.slug);
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Failed to fetch case study slugs', {
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
    const data = await db
      .select()
      .from(caseStudies)
      .where(and(eq(caseStudies.published, true), eq(caseStudies.featured, true)))
      .orderBy(desc(caseStudies.createdAt));

    return data.map(mapCaseStudy);
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      logger.error('Failed to fetch featured case studies', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return [];
  }
}
