/**
 * Admin Analytics Overview API
 * Returns high-level metrics and KPIs
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { createServerLogger } from '@/lib/logger';
import { db } from '@/lib/db';
import { calculatorLeads, leadAttribution, emailEngagement } from '@/lib/schema';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { analyticsOverviewQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';
import { gte, eq, and, count } from 'drizzle-orm';

const logger = createServerLogger('analytics-overview-api');

export async function GET(request: NextRequest) {
  await connection(); // Force dynamic rendering

  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Analytics overview rate limit exceeded', { ip: clientIp });
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
    const parseResult = safeParseSearchParams(searchParams, analyticsOverviewQuerySchema);
    if (!parseResult.success) {
      logger.warn('Invalid query parameters', { errors: parseResult.errors.flatten() });
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.errors.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { days } = parseResult.data;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total calculator leads
    const totalLeadsResult = await db
      .select({ count: count() })
      .from(calculatorLeads)
      .where(gte(calculatorLeads.createdAt, startDate));

    const totalLeads = totalLeadsResult[0]?.count ?? 0;

    // Leads by quality
    const leadsByQuality = await db
      .select({ leadQuality: calculatorLeads.leadQuality })
      .from(calculatorLeads)
      .where(gte(calculatorLeads.createdAt, startDate));

    const qualityBreakdown = {
      hot: leadsByQuality.filter(l => l.leadQuality === 'hot').length,
      warm: leadsByQuality.filter(l => l.leadQuality === 'warm').length,
      cold: leadsByQuality.filter(l => l.leadQuality === 'cold').length,
    };

    // Leads by calculator type
    const leadsByType = await db
      .select({ calculatorType: calculatorLeads.calculatorType })
      .from(calculatorLeads)
      .where(gte(calculatorLeads.createdAt, startDate));

    const typeBreakdown = leadsByType.reduce((acc, lead) => {
      acc[lead.calculatorType] = (acc[lead.calculatorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Conversion metrics
    const convertedLeadsResult = await db
      .select({ count: count() })
      .from(calculatorLeads)
      .where(
        and(
          eq(calculatorLeads.converted, true),
          gte(calculatorLeads.createdAt, startDate)
        )
      );

    const convertedLeads = convertedLeadsResult[0]?.count ?? 0;

    const contactedLeadsResult = await db
      .select({ count: count() })
      .from(calculatorLeads)
      .where(
        and(
          eq(calculatorLeads.contacted, true),
          gte(calculatorLeads.createdAt, startDate)
        )
      );

    const contactedLeads = contactedLeadsResult[0]?.count ?? 0;

    // Email metrics
    const emailEngagementData = await db
      .select({ eventType: emailEngagement.eventType })
      .from(emailEngagement)
      .where(gte(emailEngagement.timestamp, startDate));

    const emailMetrics = {
      sent: emailEngagementData.filter(e => e.eventType === 'sent').length,
      opened: emailEngagementData.filter(e => e.eventType === 'opened').length,
      clicked: emailEngagementData.filter(e => e.eventType === 'clicked').length,
      bounced: emailEngagementData.filter(e => e.eventType === 'bounced').length,
    };

    // Traffic sources
    const attributionData = await db
      .select({ source: leadAttribution.source, medium: leadAttribution.medium })
      .from(leadAttribution)
      .where(gte(leadAttribution.timestamp, startDate));

    const sourceBreakdown = attributionData.reduce((acc, attr) => {
      const key = attr.source || 'direct';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      period: `${days} days`,
      totalLeads,
      qualityBreakdown,
      typeBreakdown,
      conversionRate: totalLeads ? ((convertedLeads) / totalLeads * 100).toFixed(1) : '0',
      contactRate: totalLeads ? ((contactedLeads) / totalLeads * 100).toFixed(1) : '0',
      emailMetrics: {
        ...emailMetrics,
        openRate: emailMetrics.sent ? ((emailMetrics.opened / emailMetrics.sent) * 100).toFixed(1) : '0',
        clickRate: emailMetrics.opened ? ((emailMetrics.clicked / emailMetrics.opened) * 100).toFixed(1) : '0',
      },
      sourceBreakdown,
      generatedAt: new Date().toISOString(),
    };

    logger.info('Analytics overview generated', { days, totalLeads });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Analytics overview error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch analytics overview' },
      { status: 500 }
    );
  }
}
