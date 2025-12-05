/**
 * Admin Case Studies Management API
 * CRUD operations for case studies
 */

import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import type { CaseStudy, CaseStudyInsert, CaseStudyUpdate } from '@/types/supabase-helpers';
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
    

    const { data: caseStudies, error } = (await (await createClient())
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .select('*')
      .order('created_at', { ascending: false })) as unknown as { data: CaseStudy[] | null; error: unknown };

    if (error) {
      logger.error('Failed to fetch case studies:', error as Error);
      return NextResponse.json(
        { error: 'Failed to fetch case studies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ caseStudies: caseStudies || [] });
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
    const { data: existing } = (await (await createClient())
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .select('id')
      .eq('slug', validatedData.slug)
      .single()) as unknown as { data: Pick<CaseStudy, 'id'> | null; error: unknown };

    if (existing) {
      return NextResponse.json(
        { error: 'A case study with this slug already exists' },
        { status: 400 }
      );
    }

    const insertData: CaseStudyInsert = {
      ...validatedData,
      slug: validatedData.slug,
      client_logo_url: null,
      client_industry: validatedData.industry,
      testimonial: validatedData.testimonial_text ? {
        quote: validatedData.testimonial_text,
        author: validatedData.testimonial_author || '',
        role: validatedData.testimonial_role || '',
        company: validatedData.client_name,
      } : null,
      video_testimonial_url: validatedData.testimonial_video_url || null,
      project_url: validatedData.project_url || null,
      project_duration: validatedData.project_duration || null,
    };

    const { data: caseStudy, error } = (await (await createClient())
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .insert(insertData as unknown as never) // Bypass type checking for custom table
      .select()
      .single()) as unknown as { data: CaseStudy | null; error: unknown };

    if (error) {
      logger.error('Failed to create case study:', error as Error);
      return NextResponse.json(
        { error: 'Failed to create case study' },
        { status: 500 }
      );
    }

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

    

    const updateFields: CaseStudyUpdate = validatedData as CaseStudyUpdate;

    const { data: caseStudy, error } = (await (await createClient())
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .update(updateFields as unknown as never) // Bypass type checking
      .eq('id', id)
      .select()
      .single()) as unknown as { data: CaseStudy | null; error: unknown };

    if (error) {
      logger.error('Failed to update case study:', error as Error);
      return NextResponse.json(
        { error: 'Failed to update case study' },
        { status: 500 }
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

    

    const { error } = await (await createClient())
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete case study:', error as Error);
      return NextResponse.json(
        { error: 'Failed to delete case study' },
        { status: 500 }
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
