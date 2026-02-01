/**
 * Admin Analytics Leads API
 * Returns detailed lead information with filtering
 */

import { type NextRequest, connection } from 'next/server';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { createServerLogger } from '@/lib/logger';
import { db } from '@/lib/db';
import { calculatorLeads, leadAttribution } from '@/lib/schemas/schema';
import { eq, and, desc, asc, type SQL } from 'drizzle-orm';
import { requireAdminAuth } from '@/lib/admin-auth';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { analyticsLeadsQuerySchema, safeParseSearchParams, type LeadSortBy } from '@/lib/schemas/query-params';

const logger = createServerLogger('analytics-leads-api');

/** Map validated sort column names to Drizzle column references */
function getSortColumn(sortBy: LeadSortBy) {
  const sortColumnMap = {
    created_at: calculatorLeads.createdAt,
    lead_score: calculatorLeads.leadScore,
    email: calculatorLeads.email,
    calculator_type: calculatorLeads.calculatorType,
    lead_quality: calculatorLeads.leadQuality,
  } as const;

  return sortColumnMap[sortBy];
}

async function handleAnalyticsLeads(request: NextRequest) {
  await connection(); // Force dynamic rendering

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const parseResult = safeParseSearchParams(searchParams, analyticsLeadsQuerySchema);
    if (!parseResult.success) {
      logger.warn('Invalid query parameters', { errors: parseResult.errors.flatten() });
      return validationErrorResponse(parseResult.errors);
    }

    const { limit, quality, type: calculatorType, sortBy, sortOrder } = parseResult.data;

    // Build filter conditions
    const conditions: SQL[] = [];

    if (quality) {
      conditions.push(eq(calculatorLeads.leadQuality, quality));
    }

    if (calculatorType) {
      conditions.push(eq(calculatorLeads.calculatorType, calculatorType));
    }

    // Determine sort direction
    const sortColumn = getSortColumn(sortBy);
    const orderByClause = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Query with LEFT JOIN to avoid N+1 problem
    const rows = await db
      .select({
        lead: calculatorLeads,
        attribution: {
          source: leadAttribution.source,
          medium: leadAttribution.medium,
          campaign: leadAttribution.campaign,
          referrer: leadAttribution.referrer,
          landingPage: leadAttribution.landingPage,
          createdAt: leadAttribution.timestamp,
        },
      })
      .from(calculatorLeads)
      .leftJoin(leadAttribution, eq(calculatorLeads.id, leadAttribution.leadId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderByClause)
      .limit(limit);

    // Transform the joined data to match expected format
    const enrichedLeads = rows.map((row) => ({
      ...row.lead,
      attribution: row.attribution !== null ? row.attribution : null,
    }));

    logger.info('Leads fetched', { count: enrichedLeads.length, quality, calculatorType });

    return successResponse({
      leads: enrichedLeads,
      count: enrichedLeads.length,
      filters: { quality, calculatorType, sortBy, sortOrder },
    });
  } catch (error) {
    logger.error('Analytics leads error', error instanceof Error ? error : new Error(String(error)));
    return errorResponse('Failed to fetch leads', 500);
  }
}

export const GET = withRateLimit(handleAnalyticsLeads, 'api');
