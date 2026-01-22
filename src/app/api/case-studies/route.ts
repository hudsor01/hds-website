/**
 * Case Studies API
 * Public endpoint for fetching published case studies
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { caseStudies } from '@/lib/schema';
import { eq, desc, and } from 'drizzle-orm';
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

    // If slug is provided, return single case study
    if (slug) {
      const caseStudyResults = await db
        .select()
        .from(caseStudies)
        .where(
          and(
            eq(caseStudies.slug, slug),
            eq(caseStudies.published, true)
          )
        )
        .limit(1);

      const caseStudy = caseStudyResults[0] ?? null;

      if (!caseStudy) {
        return NextResponse.json(
          { error: 'Case study not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ caseStudy });
    }

    // Build query conditions for list of case studies
    const conditions = [eq(caseStudies.published, true)];

    // Filter by industry if provided
    if (industry) {
      conditions.push(eq(caseStudies.industry, industry));
    }

    // Filter by featured if provided
    if (featured) {
      conditions.push(eq(caseStudies.featured, true));
    }

    const caseStudyList = await db
      .select()
      .from(caseStudies)
      .where(and(...conditions))
      .orderBy(desc(caseStudies.createdAt));

    return NextResponse.json({ caseStudies: caseStudyList });
  } catch (error) {
    logger.error('Case studies API error:', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
