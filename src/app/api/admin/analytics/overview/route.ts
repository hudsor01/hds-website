/**
 * Admin Analytics Overview API
 * Returns high-level metrics and KPIs
 */

import { requireAdminAuth } from '@/lib/admin-auth';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { db } from '@/lib/db';
import { createServerLogger } from '@/lib/logger';
import { analyticsOverviewQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';
import { calculatorLeads, emailEngagement, leadAttribution } from '@/lib/schemas/schema';
import { and, count, eq, gte } from 'drizzle-orm';
import { type NextRequest, connection } from 'next/server';

const logger = createServerLogger('analytics-overview-api');

async function handleAnalyticsOverview(request: NextRequest) {
  await connection(); // Force dynamic rendering

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
      return validationErrorResponse(parseResult.errors);
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

    return successResponse(response);
  } catch (error) {
    logger.error('Analytics overview error', error instanceof Error ? error : new Error(String(error)));
    return errorResponse('Failed to fetch analytics overview', 500);
  }
}

export const GET = withRateLimit(handleAnalyticsOverview, 'api');
