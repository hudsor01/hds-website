/**
 * Case Studies API
 * Public endpoint for fetching published case studies
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { caseStudiesQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';

export async function GET(request: NextRequest) {
  await connection(); // Force dynamic rendering

  // Rate limiting - 100 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'readOnlyApi');
  if (!isAllowed) {
    logger.warn('Case studies rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const parseResult = safeParseSearchParams(searchParams, caseStudiesQuerySchema);
    if (!parseResult.success) {
      logger.warn('Invalid query parameters', { errors: parseResult.errors.flatten() });
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.errors.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { industry, featured, slug } = parseResult.data;

    // Use server client - RLS allows public reads of published case studies
    const supabase = await createClient();

    // If slug is provided, return single case study
    if (slug) {
      const { data: caseStudy, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        logger.error('Failed to fetch case study by slug', error as Error);
        return NextResponse.json({ error: 'Failed to fetch case study' }, { status: 500 });
      }

      if (!caseStudy) {
        return NextResponse.json(
          { error: 'Case study not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ caseStudy });
    }

    // Build query for list of case studies
    let query = supabase
      .from('case_studies')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    // Filter by industry if provided
    if (industry) {
      query = query.eq('industry', industry);
    }

    // Filter by featured if provided
    if (featured) {
      query = query.eq('featured', true);
    }

    const { data: caseStudies, error } = await query;

    if (error) {
      logger.error('Failed to fetch case studies:', error as Error);
      return NextResponse.json(
        { error: 'Failed to fetch case studies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ caseStudies: caseStudies || [] });
  } catch (error) {
    logger.error('Case studies API error:', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
