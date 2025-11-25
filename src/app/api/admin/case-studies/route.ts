/**
 * Admin Case Studies Management API
 * CRUD operations for case studies
 */

import { type NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { CaseStudy, CaseStudyInsert, CaseStudyUpdate } from '@/types/supabase-helpers';
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
export async function GET(_request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data: caseStudies, error } = (await supabaseAdmin
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .select('*')
      .order('created_at', { ascending: false })) as unknown as { data: CaseStudy[] | null; error: unknown };

    if (error) {
      console.error('Failed to fetch case studies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch case studies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ caseStudies: caseStudies || [] });
  } catch (error) {
    console.error('Admin case studies API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new case study
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CaseStudySchema.parse(body);

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if slug already exists
    const { data: existing } = (await supabaseAdmin
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

    const { data: caseStudy, error } = (await supabaseAdmin
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .insert(insertData as unknown as never) // Bypass type checking for custom table
      .select()
      .single()) as unknown as { data: CaseStudy | null; error: unknown };

    if (error) {
      console.error('Failed to create case study:', error);
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

    console.error('Admin case studies POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing case study
export async function PUT(request: NextRequest) {
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

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const updateFields: CaseStudyUpdate = validatedData as CaseStudyUpdate;

    const { data: caseStudy, error } = (await supabaseAdmin
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .update(updateFields as unknown as never) // Bypass type checking
      .eq('id', id)
      .select()
      .single()) as unknown as { data: CaseStudy | null; error: unknown };

    if (error) {
      console.error('Failed to update case study:', error);
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

    console.error('Admin case studies PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete case study
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Case study ID is required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { error } = await supabaseAdmin
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete case study:', error);
      return NextResponse.json(
        { error: 'Failed to delete case study' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin case studies DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
