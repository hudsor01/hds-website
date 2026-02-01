/**
 * Case Studies API
 * Public endpoint for fetching published case studies
 */

import { type NextRequest, connection } from 'next/server';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { showcase } from '@/lib/schemas/schema';
import { eq, and, desc } from 'drizzle-orm';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { caseStudiesQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';

async function handleCaseStudiesGet(request: NextRequest) {
  await connection(); // Force dynamic rendering

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const parseResult = safeParseSearchParams(searchParams, caseStudiesQuerySchema);
    if (!parseResult.success) {
      logger.warn('Invalid query parameters', { errors: parseResult.errors.issues });
      return validationErrorResponse(parseResult.errors);
    }

    const { industry, featured, slug } = parseResult.data;

    // If slug is provided, return single case study
    if (slug) {
      const conditions = and(
        eq(showcase.showcaseType, 'detailed'),
        eq(showcase.slug, slug),
        eq(showcase.published, true)
      );

      const results = await db.select().from(showcase).where(conditions);
      const caseStudy = results[0] ?? null;

      if (!caseStudy) {
        return errorResponse('Case study not found', 404);
      }

      return successResponse({ caseStudy });
    }

    // Build conditions for list of case studies
    const conditions = [
      eq(showcase.showcaseType, 'detailed'),
      eq(showcase.published, true),
    ];

    // Filter by industry if provided
    if (industry) {
      conditions.push(eq(showcase.industry, industry));
    }

    // Filter by featured if provided
    if (featured) {
      conditions.push(eq(showcase.featured, true));
    }

    const caseStudies = await db
      .select()
      .from(showcase)
      .where(and(...conditions))
      .orderBy(desc(showcase.createdAt));

    return successResponse({ caseStudies });
  } catch (error) {
    logger.error('Case studies API error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

export const GET = withRateLimit(handleCaseStudiesGet, 'readOnlyApi');
