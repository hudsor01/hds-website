/**
 * Admin Analytics Leads API
 * Returns detailed lead information with filtering
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { createServerLogger } from '@/lib/logger';
import { db } from '@/lib/db';
import { calculatorLeads, leadAttribution } from '@/lib/schema';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { analyticsLeadsQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';
import { eq, desc, asc, and, inArray, type SQL } from 'drizzle-orm';

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

    // Validate query parameters with Zod
    const parseResult = safeParseSearchParams(searchParams, analyticsLeadsQuerySchema);
    if (!parseResult.success) {
      logger.warn('Invalid query parameters', { errors: parseResult.errors.flatten() });
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.errors.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { limit, quality, type: calculatorType, sortBy, sortOrder } = parseResult.data;

    // Build conditions array with proper typing
    const conditions: SQL[] = [];
    if (quality) {
      conditions.push(eq(calculatorLeads.leadQuality, quality));
    }
    if (calculatorType) {
      conditions.push(eq(calculatorLeads.calculatorType, calculatorType));
    }

    // Map sortBy to schema field
    const sortByFieldMap = {
      created_at: calculatorLeads.createdAt,
      lead_score: calculatorLeads.leadScore,
      lead_quality: calculatorLeads.leadQuality,
    } as const;
    const sortField = sortByFieldMap[sortBy as keyof typeof sortByFieldMap] ?? calculatorLeads.createdAt;
    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Query leads with filters using standard select
    const leads = await db
      .select()
      .from(calculatorLeads)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderFn(sortField))
      .limit(limit);

    // Fetch attribution data for leads by lead_id
    const leadIds = leads.map(l => l.id);
    const attributionByLeadId = new Map<string, typeof leadAttribution.$inferSelect>();

    if (leadIds.length > 0) {
      // Use inArray for efficient batch lookup
      const attributions = await db
        .select()
        .from(leadAttribution)
        .where(inArray(leadAttribution.leadId, leadIds));

      for (const attr of attributions) {
        if (attr.leadId) {
          attributionByLeadId.set(attr.leadId, attr);
        }
      }
    }

    // Transform leads to include attribution data
    const enrichedLeads = leads.map((lead) => {
      const attribution = attributionByLeadId.get(lead.id);
      return {
        ...lead,
        attribution: attribution ? {
          first_touch_utm_source: attribution.source,
          first_touch_utm_medium: attribution.medium,
          first_touch_utm_campaign: attribution.campaign,
          last_touch_utm_source: attribution.source,
          last_touch_utm_medium: attribution.medium,
          last_touch_utm_campaign: attribution.campaign,
          referrer: attribution.referrer,
          landing_page: attribution.landingPage,
          created_at: attribution.timestamp,
        } : null,
      };
    });

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
