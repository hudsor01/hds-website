/**
 * Admin Analytics Leads API
 * Returns detailed lead information with filtering
 */

import { type NextRequest, connection } from 'next/server';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { createServerLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { analyticsLeadsQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';

const logger = createServerLogger('analytics-leads-api');

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

    

    // Build query with JOIN to avoid N+1 problem
    // Previously: 1 query for leads + N queries for attribution = N+1 queries
    // Now: 1 query with left join = 1 query total
    let query = (await createClient())
      .from('calculator_leads')
      .select(`
        *,
        attribution:lead_attribution(
          first_touch_utm_source,
          first_touch_utm_medium,
          first_touch_utm_campaign,
          last_touch_utm_source,
          last_touch_utm_medium,
          last_touch_utm_campaign,
          referrer,
          landing_page,
          created_at
        )
      `);

    // Apply filters
    if (quality) {
      query = query.eq('lead_quality', quality);
    }

    if (calculatorType) {
      query = query.eq('calculator_type', calculatorType);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply limit
    query = query.limit(limit);

    const { data: leads, error } = await query;

    if (error) {
      logger.error('Failed to fetch leads', error as Error);
      return errorResponse('Failed to fetch leads', 500);
    }

    // Transform the joined data to match expected format
    // Supabase returns attribution as an array, we want single object or null
    const enrichedLeads = (leads || []).map((lead) => ({
      ...lead,
      attribution: Array.isArray(lead.attribution) && lead.attribution.length > 0
        ? lead.attribution[0]
        : lead.attribution || null,
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
