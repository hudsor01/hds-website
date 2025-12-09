/**
 * Admin Analytics Trends API
 * Returns time-series data for trend visualizations
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { createServerLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { analyticsTrendsQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';
import type { TrendsLead, DailyDataPoint } from '@/types/admin-analytics';

const logger = createServerLogger('analytics-trends-api');

export async function GET(request: NextRequest) {
  await connection(); // Force dynamic rendering

  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Analytics trends rate limit exceeded', { ip: clientIp });
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
    const parseResult = safeParseSearchParams(searchParams, analyticsTrendsQuerySchema);
    if (!parseResult.success) {
      logger.warn('Invalid query parameters', { errors: parseResult.errors.flatten() });
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.errors.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { days } = parseResult.data;

    

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all leads within date range
    const { data: leads, error } = await (await createClient())
      .from('calculator_leads')
      .select('created_at, contacted, converted, lead_quality, calculator_type')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Failed to fetch leads for trends', error as Error);
      return NextResponse.json(
        { error: 'Failed to fetch trends' },
        { status: 500 }
      );
    }

    // Group leads by date
    const dailyData = groupLeadsByDate(leads || [], days);

    // Calculate cumulative data
    const cumulativeLeads = calculateCumulative(dailyData, 'leads');
    const cumulativeConversions = calculateCumulative(dailyData, 'conversions');

    logger.info('Trends fetched', { days, dataPoints: dailyData.length });

    return NextResponse.json({
      dailyData,
      cumulativeLeads,
      cumulativeConversions,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error) {
    logger.error('Analytics trends error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}

function groupLeadsByDate(leads: TrendsLead[], days: number): DailyDataPoint[] {
  // Create a map to store daily counts
  const dateMap = new Map<string, DailyDataPoint>();

  // Initialize all dates in range with zero values
  const endDate = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - (days - 1 - i));
    const dateStr = date.toISOString().split('T')[0] || date.toISOString();

    dateMap.set(dateStr, {
      date: dateStr,
      leads: 0,
      contacted: 0,
      conversions: 0,
      hot: 0,
      warm: 0,
      cold: 0,
      roi: 0,
      cost: 0,
      performance: 0,
    });
  }

  // Aggregate lead data
  leads.forEach(lead => {
    const dateStr = lead.created_at.split('T')[0] || lead.created_at;
    const data = dateMap.get(dateStr);

    if (data) {
      data.leads++;
      if (lead.contacted) {data.contacted++;}
      if (lead.converted) {data.conversions++;}

      // Count by quality
      if (lead.lead_quality) {
        if (lead.lead_quality === 'hot') {data.hot++;}
        else if (lead.lead_quality === 'warm') {data.warm++;}
        else if (lead.lead_quality === 'cold') {data.cold++;}
      }

      // Count by calculator type
      if (lead.calculator_type === 'roi-calculator') {data.roi++;}
      else if (lead.calculator_type === 'cost-estimator') {data.cost++;}
      else if (lead.calculator_type === 'performance-calculator') {data.performance++;}
    }
  });

  // Convert map to sorted array
  return Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

function calculateCumulative(
  dailyData: DailyDataPoint[],
  metric: 'leads' | 'conversions'
): Array<{ date: string; value: number }> {
  let cumulative = 0;
  return dailyData.map(data => {
    cumulative += data[metric];
    return {
      date: data.date,
      value: cumulative,
    };
  });
}
