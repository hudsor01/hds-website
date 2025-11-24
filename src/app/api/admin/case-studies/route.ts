/**
 * Admin Case Studies Management API
 * CRUD operations for case studies
 */

import { type NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
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

    const { data: caseStudies, error } = await supabaseAdmin
      .from('case_studies' as any)
      .select('*')
      .order('created_at', { ascending: false });

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
    const { data: existing } = await supabaseAdmin
      .from('case_studies' as any)
      .select('id')
      .eq('slug', validatedData.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A case study with this slug already exists' },
        { status: 400 }
      );
    }

    const { data: caseStudy, error } = await supabaseAdmin
      .from('case_studies' as any)
      .insert(validatedData as any)
      .select()
      .single();

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

    const { data: caseStudy, error } = await supabaseAdmin
      .from('case_studies' as any)
      .update(validatedData as any)
      .eq('id', id)
      .select()
      .single();

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
      .from('case_studies' as any)
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
