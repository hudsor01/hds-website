/**
 * Case Studies API
 * Public endpoint for fetching published case studies
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { CaseStudy } from '@/types/supabase-helpers';

export async function GET(request: NextRequest) {
  await connection(); // Force dynamic rendering

  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const featured = searchParams.get('featured');
    const slug = searchParams.get('slug');

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // If slug is provided, return single case study
    if (slug) {
      const { data: caseStudy, error } = (await supabaseAdmin
        .from('case_studies' as 'lead_attribution') // Type assertion for custom table
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()) as unknown as { data: CaseStudy | null; error: unknown };

      if (error) {
        return NextResponse.json(
          { error: 'Case study not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ caseStudy });
    }

    // Build query for list of case studies
    let query = supabaseAdmin
      .from('case_studies' as 'lead_attribution') // Type assertion for custom table
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    // Filter by industry if provided
    if (industry) {
      query = query.eq('industry', industry);
    }

    // Filter by featured if provided
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data: caseStudies, error } = await query;

    if (error) {
      console.error('Failed to fetch case studies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch case studies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ caseStudies: caseStudies || [] });
  } catch (error) {
    console.error('Case studies API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
