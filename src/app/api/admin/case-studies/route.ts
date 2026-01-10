/**
 * Admin Case Studies Management API
 * CRUD operations for case studies
 */

import { type NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { z } from 'zod';
import type { Database } from '@/types/database';

type CaseStudyInsert = Database['public']['Tables']['case_studies']['Insert'];
type CaseStudyUpdate = Database['public']['Tables']['case_studies']['Update'];

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
export async function GET(request: NextRequest) {
  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Admin case studies rate limit exceeded', { ip: clientIp });
    return errorResponse('Too many requests', 429);
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const supabase = await createClient();

    const { data: caseStudies, error } = await supabase
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch case studies:', error as Error);
      return errorResponse('Failed to fetch case studies', 500);
    }

    return successResponse({ caseStudies: caseStudies || [] });
  } catch (error) {
    logger.error('Admin case studies API error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

// POST - Create new case study
export async function POST(request: NextRequest) {
  // Rate limiting - 5 requests per minute per IP for write operations
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactFormApi');
  if (!isAllowed) {
    logger.warn('Admin case studies POST rate limit exceeded', { ip: clientIp });
    return errorResponse('Too many requests', 429);
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();
    const validatedData = CaseStudySchema.parse(body);
    const supabase = await createClient();

    // Check if slug already exists
    const { data: existing, error: existingError } = await supabase
      .from('case_studies')
      .select('id')
      .eq('slug', validatedData.slug)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error('Failed to check case study slug uniqueness', existingError as Error);
      return errorResponse('Unable to validate slug', 500);
    }

    if (existing) {
      return errorResponse('A case study with this slug already exists', 400);
    }

    const insertData: CaseStudyInsert = {
      title: validatedData.title,
      slug: validatedData.slug,
      client_name: validatedData.client_name,
      industry: validatedData.industry,
      project_type: validatedData.project_type,
      description: validatedData.description,
      challenge: validatedData.challenge,
      solution: validatedData.solution,
      results: validatedData.results,
      technologies: validatedData.technologies.length ? validatedData.technologies : null,
      metrics: validatedData.metrics.length ? validatedData.metrics : null,
      testimonial_author: validatedData.testimonial_author || null,
      testimonial_role: validatedData.testimonial_role || null,
      testimonial_text: validatedData.testimonial_text || null,
      testimonial_video_url: validatedData.testimonial_video_url || null,
      thumbnail_url: validatedData.thumbnail_url || null,
      featured_image_url: validatedData.featured_image_url || null,
      project_url: validatedData.project_url || null,
      project_duration: validatedData.project_duration || null,
      team_size: validatedData.team_size ?? null,
      published: validatedData.published ?? false,
      featured: validatedData.featured ?? false,
    } satisfies CaseStudyInsert;

    const { data: caseStudy, error } = await supabase
      .from('case_studies')
      .insert(insertData)
      .select('*')
      .maybeSingle();

    if (error) {
      logger.error('Failed to create case study:', error as Error);
      return errorResponse('Failed to create case study', 500);
    }

    return successResponse({ caseStudy }, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Admin case studies POST error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

// PUT - Update existing case study
export async function PUT(request: NextRequest) {
  // Rate limiting - 5 requests per minute per IP for write operations
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactFormApi');
  if (!isAllowed) {
    logger.warn('Admin case studies PUT rate limit exceeded', { ip: clientIp });
    return errorResponse('Too many requests', 429);
  }

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
    const supabase = await createClient();

    const updateFields: CaseStudyUpdate = {
      ...validatedData,
      technologies: validatedData.technologies ?? undefined,
      metrics: validatedData.metrics ?? undefined,
      testimonial_author: validatedData.testimonial_author ?? undefined,
      testimonial_role: validatedData.testimonial_role ?? undefined,
      testimonial_text: validatedData.testimonial_text ?? undefined,
      testimonial_video_url: validatedData.testimonial_video_url ?? undefined,
      thumbnail_url: validatedData.thumbnail_url ?? undefined,
      featured_image_url: validatedData.featured_image_url ?? undefined,
      project_url: validatedData.project_url ?? undefined,
      project_duration: validatedData.project_duration ?? undefined,
      team_size: validatedData.team_size ?? undefined,
      published: validatedData.published ?? undefined,
      featured: validatedData.featured ?? undefined,
    };

    const { data: caseStudy, error } = await supabase
      .from('case_studies')
      .update(updateFields)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      logger.error('Failed to update case study:', error as Error);
      return errorResponse('Failed to update case study', 500);
    }

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

// DELETE - Delete case study
export async function DELETE(request: NextRequest) {
  // Rate limiting - 5 requests per minute per IP for write operations
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactFormApi');
  if (!isAllowed) {
    logger.warn('Admin case studies DELETE rate limit exceeded', { ip: clientIp });
    return errorResponse('Too many requests', 429);
  }

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
    const supabase = await createClient();

    const { error } = await supabase
      .from('case_studies')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete case study:', error as Error);
      return errorResponse('Failed to delete case study', 500);
    }

    return successResponse({ success: true });
  } catch (error) {
    logger.error('Admin case studies DELETE error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}
