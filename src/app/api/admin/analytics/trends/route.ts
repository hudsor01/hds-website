/**
 * Admin Analytics Trends API
 * Returns time-series data for trend visualizations
 */

import { type NextRequest, connection } from 'next/server';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { createServerLogger } from '@/lib/logger';
import { db } from '@/lib/db';
import { calculatorLeads } from '@/lib/schemas/schema';
import { and, gte, lte, asc } from 'drizzle-orm';
import { requireAdminAuth } from '@/lib/admin-auth';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { analyticsTrendsQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';
import type { TrendsLead, DailyDataPoint } from '@/types/admin-analytics';

const logger = createServerLogger('analytics-trends-api');

async function handleAnalyticsTrends(request: NextRequest) {
  await connection(); // Force dynamic rendering

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
      return validationErrorResponse(parseResult.errors);
    }

    const { days } = parseResult.data;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all leads within date range
    const rows = await db
      .select({
        createdAt: calculatorLeads.createdAt,
        contacted: calculatorLeads.contacted,
        converted: calculatorLeads.converted,
        leadQuality: calculatorLeads.leadQuality,
        calculatorType: calculatorLeads.calculatorType,
      })
      .from(calculatorLeads)
      .where(
        and(
          gte(calculatorLeads.createdAt, startDate),
          lte(calculatorLeads.createdAt, endDate)
        )
      )
      .orderBy(asc(calculatorLeads.createdAt));

    // Map Drizzle camelCase results to the TrendsLead snake_case interface
    const leads: TrendsLead[] = rows.map((row) => ({
        created_at: row.createdAt.toISOString(),
        contacted: row.contacted,
        converted: row.converted,
        lead_quality: row.leadQuality,
        calculator_type: row.calculatorType,
      }));

    // Group leads by date
    const dailyData = groupLeadsByDate(leads, days);

    // Calculate cumulative data
    const cumulativeLeads = calculateCumulative(dailyData, 'leads');
    const cumulativeConversions = calculateCumulative(dailyData, 'conversions');

    logger.info('Trends fetched', { days, dataPoints: dailyData.length });

    return successResponse({
      dailyData,
      cumulativeLeads,
      cumulativeConversions,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error) {
    logger.error('Analytics trends error', error instanceof Error ? error : new Error(String(error)));
    return errorResponse('Failed to fetch trends', 500);
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

export const GET = withRateLimit(handleAnalyticsTrends, 'api');
