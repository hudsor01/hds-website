/**
 * Admin Analytics Leads API
 * Returns detailed lead information with filtering
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { createServerLogger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';

const logger = createServerLogger('analytics-leads-api');

export async function GET(request: NextRequest) {
  await connection(); // Force dynamic rendering

  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Analytics leads rate limit exceeded', { ip: clientIp });
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const quality = searchParams.get('quality'); // hot, warm, cold
    const calculatorType = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Build query with JOIN to avoid N+1 problem
    // Previously: 1 query for leads + N queries for attribution = N+1 queries
    // Now: 1 query with left join = 1 query total
    let query = supabaseAdmin
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
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
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

    return NextResponse.json({
      leads: enrichedLeads,
      count: enrichedLeads.length,
      filters: { quality, calculatorType, sortBy, sortOrder },
    });
  } catch (error) {
    logger.error('Analytics leads error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
