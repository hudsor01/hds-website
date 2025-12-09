/**
 * Admin Analytics Overview API
 * Returns high-level metrics and KPIs
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { createServerLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { analyticsOverviewQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';

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
    const { count: totalLeads } = await (await createClient())
      .from('calculator_leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Leads by quality
    const { data: leadsByQuality } = await (await createClient())
      .from('calculator_leads')
      .select('lead_quality')
      .gte('created_at', startDate.toISOString());

    const qualityBreakdown = {
      hot: leadsByQuality?.filter(l => l.lead_quality === 'hot').length || 0,
      warm: leadsByQuality?.filter(l => l.lead_quality === 'warm').length || 0,
      cold: leadsByQuality?.filter(l => l.lead_quality === 'cold').length || 0,
    };

    // Leads by calculator type
    const { data: leadsByType } = await (await createClient())
      .from('calculator_leads')
      .select('calculator_type')
      .gte('created_at', startDate.toISOString());

    const typeBreakdown = leadsByType?.reduce((acc, lead) => {
      acc[lead.calculator_type] = (acc[lead.calculator_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Conversion metrics
    const { count: convertedLeads } = await (await createClient())
      .from('calculator_leads')
      .select('*', { count: 'exact', head: true })
      .eq('converted', true)
      .gte('created_at', startDate.toISOString());

    const { count: contactedLeads } = await (await createClient())
      .from('calculator_leads')
      .select('*', { count: 'exact', head: true })
      .eq('contacted', true)
      .gte('created_at', startDate.toISOString());

    // Email metrics
    const { data: emailEngagement } = await (await createClient())
      .from('email_engagement')
      .select('event_type')
      .gte('created_at', startDate.toISOString());

    const emailMetrics = {
      sent: emailEngagement?.filter(e => e.event_type === 'sent').length || 0,
      opened: emailEngagement?.filter(e => e.event_type === 'opened').length || 0,
      clicked: emailEngagement?.filter(e => e.event_type === 'clicked').length || 0,
      bounced: emailEngagement?.filter(e => e.event_type === 'bounced').length || 0,
    };

    // Traffic sources
    const { data: attributionData } = await (await createClient())
      .from('lead_attribution')
      .select('source, medium')
      .gte('first_visit_at', startDate.toISOString());

    const sourceBreakdown = attributionData?.reduce((acc, attr) => {
      const key = attr.source || 'direct';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const response = {
      period: `${days} days`,
      totalLeads: totalLeads || 0,
      qualityBreakdown,
      typeBreakdown,
      conversionRate: totalLeads ? ((convertedLeads || 0) / totalLeads * 100).toFixed(1) : '0',
      contactRate: totalLeads ? ((contactedLeads || 0) / totalLeads * 100).toFixed(1) : '0',
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
