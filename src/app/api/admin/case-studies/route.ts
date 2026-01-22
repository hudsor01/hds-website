/**
 * Admin Case Studies Management API
 * CRUD operations for case studies
 */

import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { caseStudies, type NewCaseStudy } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
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
export async function GET(request: NextRequest) {
  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Admin case studies rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const caseStudiesData = await db
      .select()
      .from(caseStudies)
      .orderBy(desc(caseStudies.createdAt));

    return NextResponse.json({ caseStudies: caseStudiesData || [] });
  } catch (error) {
    logger.error('Admin case studies API error:', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new case study
export async function POST(request: NextRequest) {
  // Rate limiting - 5 requests per minute per IP for write operations
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactFormApi');
  if (!isAllowed) {
    logger.warn('Admin case studies POST rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

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
      .select({ id: caseStudies.id })
      .from(caseStudies)
      .where(eq(caseStudies.slug, validatedData.slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'A case study with this slug already exists' },
        { status: 400 }
      );
    }

    const insertData: NewCaseStudy = {
      title: validatedData.title,
      slug: validatedData.slug,
      clientName: validatedData.client_name,
      industry: validatedData.industry,
      projectType: validatedData.project_type,
      description: validatedData.description,
      challenge: validatedData.challenge,
      solution: validatedData.solution,
      results: validatedData.results,
      technologies: validatedData.technologies.length ? validatedData.technologies : null,
      metrics: validatedData.metrics.length ? validatedData.metrics : null,
      testimonialAuthor: validatedData.testimonial_author || null,
      testimonialRole: validatedData.testimonial_role || null,
      testimonialText: validatedData.testimonial_text || null,
      testimonialVideoUrl: validatedData.testimonial_video_url || null,
      thumbnailUrl: validatedData.thumbnail_url || null,
      featuredImageUrl: validatedData.featured_image_url || null,
      projectUrl: validatedData.project_url || null,
      projectDuration: validatedData.project_duration || null,
      teamSize: validatedData.team_size ?? null,
      published: validatedData.published ?? false,
      featured: validatedData.featured ?? false,
    };

    const [caseStudy] = await db
      .insert(caseStudies)
      .values(insertData)
      .returning();

    return NextResponse.json({ caseStudy }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Admin case studies POST error:', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing case study
export async function PUT(request: NextRequest) {
  // Rate limiting - 5 requests per minute per IP for write operations
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactFormApi');
  if (!isAllowed) {
    logger.warn('Admin case studies PUT rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
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
      return NextResponse.json(
        { error: 'Case study ID is required' },
        { status: 400 }
      );
    }

    const validatedData = CaseStudySchema.partial().parse(updateData);

    const updateFields: Partial<NewCaseStudy> = {};

    if (validatedData.title !== undefined) { updateFields.title = validatedData.title; }
    if (validatedData.slug !== undefined) { updateFields.slug = validatedData.slug; }
    if (validatedData.client_name !== undefined) { updateFields.clientName = validatedData.client_name; }
    if (validatedData.industry !== undefined) { updateFields.industry = validatedData.industry; }
    if (validatedData.project_type !== undefined) { updateFields.projectType = validatedData.project_type; }
    if (validatedData.description !== undefined) { updateFields.description = validatedData.description; }
    if (validatedData.challenge !== undefined) { updateFields.challenge = validatedData.challenge; }
    if (validatedData.solution !== undefined) { updateFields.solution = validatedData.solution; }
    if (validatedData.results !== undefined) { updateFields.results = validatedData.results; }
    if (validatedData.technologies !== undefined) { updateFields.technologies = validatedData.technologies; }
    if (validatedData.metrics !== undefined) { updateFields.metrics = validatedData.metrics; }
    if (validatedData.testimonial_author !== undefined) { updateFields.testimonialAuthor = validatedData.testimonial_author; }
    if (validatedData.testimonial_role !== undefined) { updateFields.testimonialRole = validatedData.testimonial_role; }
    if (validatedData.testimonial_text !== undefined) { updateFields.testimonialText = validatedData.testimonial_text; }
    if (validatedData.testimonial_video_url !== undefined) { updateFields.testimonialVideoUrl = validatedData.testimonial_video_url; }
    if (validatedData.thumbnail_url !== undefined) { updateFields.thumbnailUrl = validatedData.thumbnail_url; }
    if (validatedData.featured_image_url !== undefined) { updateFields.featuredImageUrl = validatedData.featured_image_url; }
    if (validatedData.project_url !== undefined) { updateFields.projectUrl = validatedData.project_url; }
    if (validatedData.project_duration !== undefined) { updateFields.projectDuration = validatedData.project_duration; }
    if (validatedData.team_size !== undefined) { updateFields.teamSize = validatedData.team_size; }
    if (validatedData.published !== undefined) { updateFields.published = validatedData.published; }
    if (validatedData.featured !== undefined) { updateFields.featured = validatedData.featured; }

    const [caseStudy] = await db
      .update(caseStudies)
      .set(updateFields)
      .where(eq(caseStudies.id, id))
      .returning();

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ caseStudy });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Admin case studies PUT error:', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
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
      return NextResponse.json(
        { error: 'Invalid case study ID', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id } = parseResult.data;

    const deleted = await db
      .delete(caseStudies)
      .where(eq(caseStudies.id, id))
      .returning({ id: caseStudies.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Admin case studies DELETE error:', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
