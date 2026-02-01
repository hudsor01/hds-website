/**
 * Admin Case Studies Management API
 * CRUD operations for case studies
 */

import { type NextRequest } from 'next/server';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { showcase } from '@/lib/schemas/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireAdminAuth } from '@/lib/admin-auth';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { z } from 'zod';

const CaseStudySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  client_name: z.string().min(1, 'Client name is required'),
  industry: z.string().min(1, 'Industry is required'),
  project_type: z.string().min(1, 'Project type is required'),
  description: z.string().min(1, 'Description is required'),
  challenge: z.string().min(1, 'Challenge is required'),
  solution: z.string().min(1, 'Solution is required'),
  results: z.string().min(1, 'Results are required'),
  technologies: z.array(z.string()).default([]),
  metrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).default([]),
  testimonial_text: z.string().optional(),
  testimonial_author: z.string().optional(),
  testimonial_role: z.string().optional(),
  testimonial_video_url: z.string().url().optional().nullable(),
  thumbnail_url: z.string().optional(),
  featured_image_url: z.string().optional(),
  project_url: z.string().url().optional().nullable(),
  project_duration: z.string().optional(),
  team_size: z.number().int().positive().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

// GET - Fetch all case studies (including unpublished for admin)
async function handleAdminCaseStudiesGet(_request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const caseStudies = await db
      .select()
      .from(showcase)
      .where(eq(showcase.showcaseType, 'detailed'))
      .orderBy(desc(showcase.createdAt));

    return successResponse({ caseStudies });
  } catch (error) {
    logger.error('Admin case studies API error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

export const GET = withRateLimit(handleAdminCaseStudiesGet, 'api');

// POST - Create new case study
async function handleAdminCaseStudiesPost(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();
    const validatedData = CaseStudySchema.parse(body);

    // Check if slug already exists
    const existing = await db
      .select({ id: showcase.id })
      .from(showcase)
      .where(eq(showcase.slug, validatedData.slug));

    if (existing.length > 0) {
      return errorResponse('A case study with this slug already exists', 400);
    }

    const [caseStudy] = await db
      .insert(showcase)
      .values({
        showcaseType: 'detailed',
        title: validatedData.title,
        slug: validatedData.slug,
        clientName: validatedData.client_name,
        industry: validatedData.industry,
        projectType: validatedData.project_type,
        description: validatedData.description,
        challenge: validatedData.challenge,
        solution: validatedData.solution,
        results: validatedData.results,
        technologies: validatedData.technologies.length ? validatedData.technologies : [],
        metrics: validatedData.metrics.length
          ? Object.fromEntries(validatedData.metrics.map(m => [m.label, m.value]))
          : {},
        testimonialAuthor: validatedData.testimonial_author ?? null,
        testimonialRole: validatedData.testimonial_role ?? null,
        testimonialText: validatedData.testimonial_text ?? null,
        testimonialVideoUrl: validatedData.testimonial_video_url ?? null,
        imageUrl: validatedData.thumbnail_url ?? null,
        ogImageUrl: validatedData.featured_image_url ?? null,
        externalLink: validatedData.project_url ?? null,
        projectDuration: validatedData.project_duration ?? null,
        teamSize: validatedData.team_size ?? null,
        published: validatedData.published ?? false,
        featured: validatedData.featured ?? false,
      })
      .returning();

    return successResponse({ caseStudy }, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Admin case studies POST error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

export const POST = withRateLimit(handleAdminCaseStudiesPost, 'contactFormApi');

// PUT - Update existing case study
async function handleAdminCaseStudiesPut(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return errorResponse('Case study ID is required', 400);
    }

    const validatedData = CaseStudySchema.partial().parse(updateData);

    // Map validated snake_case fields to Drizzle camelCase columns
    const updateFields: Partial<typeof showcase.$inferInsert> = {};

    if (validatedData.title !== undefined) {updateFields.title = validatedData.title;}
    if (validatedData.slug !== undefined) {updateFields.slug = validatedData.slug;}
    if (validatedData.client_name !== undefined) {updateFields.clientName = validatedData.client_name;}
    if (validatedData.industry !== undefined) {updateFields.industry = validatedData.industry;}
    if (validatedData.project_type !== undefined) {updateFields.projectType = validatedData.project_type;}
    if (validatedData.description !== undefined) {updateFields.description = validatedData.description;}
    if (validatedData.challenge !== undefined) {updateFields.challenge = validatedData.challenge;}
    if (validatedData.solution !== undefined) {updateFields.solution = validatedData.solution;}
    if (validatedData.results !== undefined) {updateFields.results = validatedData.results;}
    if (validatedData.technologies !== undefined) {updateFields.technologies = validatedData.technologies;}
    if (validatedData.metrics !== undefined) {
      updateFields.metrics = Object.fromEntries(validatedData.metrics.map(m => [m.label, m.value]));
    }
    if (validatedData.testimonial_author !== undefined) {updateFields.testimonialAuthor = validatedData.testimonial_author;}
    if (validatedData.testimonial_role !== undefined) {updateFields.testimonialRole = validatedData.testimonial_role;}
    if (validatedData.testimonial_text !== undefined) {updateFields.testimonialText = validatedData.testimonial_text;}
    if (validatedData.testimonial_video_url !== undefined) {updateFields.testimonialVideoUrl = validatedData.testimonial_video_url;}
    if (validatedData.thumbnail_url !== undefined) {updateFields.imageUrl = validatedData.thumbnail_url;}
    if (validatedData.featured_image_url !== undefined) {updateFields.ogImageUrl = validatedData.featured_image_url;}
    if (validatedData.project_url !== undefined) {updateFields.externalLink = validatedData.project_url;}
    if (validatedData.project_duration !== undefined) {updateFields.projectDuration = validatedData.project_duration;}
    if (validatedData.team_size !== undefined) {updateFields.teamSize = validatedData.team_size;}
    if (validatedData.published !== undefined) {updateFields.published = validatedData.published;}
    if (validatedData.featured !== undefined) {updateFields.featured = validatedData.featured;}

    const [caseStudy] = await db
      .update(showcase)
      .set(updateFields)
      .where(and(eq(showcase.id, id), eq(showcase.showcaseType, 'detailed')))
      .returning();

    return successResponse({ caseStudy });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Admin case studies PUT error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

// UUID validation schema for DELETE
const deleteQuerySchema = z.object({
  id: z.string().uuid('Invalid case study ID format'),
});

export const PUT = withRateLimit(handleAdminCaseStudiesPut, 'contactFormApi');

// DELETE - Delete case study
async function handleAdminCaseStudiesDelete(request: NextRequest) {
  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    // Validate UUID format
    const parseResult = deleteQuerySchema.safeParse({ id: idParam });
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const { id } = parseResult.data;

    await db
      .delete(showcase)
      .where(and(eq(showcase.id, id), eq(showcase.showcaseType, 'detailed')));

    return successResponse({ success: true });
  } catch (error) {
    logger.error('Admin case studies DELETE error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

export const DELETE = withRateLimit(handleAdminCaseStudiesDelete, 'contactFormApi');
