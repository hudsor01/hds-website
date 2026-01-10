/**
 * Case Studies API
 * Public endpoint for fetching published case studies
 */

import { type NextRequest, connection } from 'next/server';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { caseStudiesQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';

export async function GET(request: NextRequest) {
  await connection(); // Force dynamic rendering

  // Rate limiting - 100 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'readOnlyApi');
  if (!isAllowed) {
    logger.warn('Case studies rate limit exceeded', { ip: clientIp });
    return errorResponse('Too many requests', 429);
  }

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const parseResult = safeParseSearchParams(searchParams, caseStudiesQuerySchema);
    if (!parseResult.success) {
      logger.warn('Invalid query parameters', { errors: parseResult.errors.issues });
      return validationErrorResponse(parseResult.errors);
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
        return errorResponse('Failed to fetch case study', 500);
      }

      if (!caseStudy) {
        return errorResponse('Case study not found', 404);
      }

      return successResponse({ caseStudy });
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
      return errorResponse('Failed to fetch case studies', 500);
    }

    return successResponse({ caseStudies: caseStudies || [] });
  } catch (error) {
    logger.error('Case studies API error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}
