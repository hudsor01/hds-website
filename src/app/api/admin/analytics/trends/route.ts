/**
 * Admin Analytics Trends API
 * Returns time-series data for trend visualizations
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { createServerLogger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

const logger = createServerLogger('analytics-trends-api');

export async function GET(request: NextRequest) {
  await connection(); // Force dynamic rendering

  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all leads within date range
    const { data: leads, error } = await supabaseAdmin
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

interface Lead {
  created_at: string;
  contacted: boolean;
  converted: boolean;
  lead_quality: string | null;
  calculator_type: string;
}

interface DailyDataPoint {
  date: string;
  leads: number;
  contacted: number;
  conversions: number;
  hot: number;
  warm: number;
  cold: number;
  roi: number;
  cost: number;
  performance: number;
}

function groupLeadsByDate(leads: Lead[], days: number): DailyDataPoint[] {
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
