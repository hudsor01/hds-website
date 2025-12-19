/**
 * GraphQL Analytics Endpoint
 * Provides GraphQL interface for querying Supabase analytics data
 */

import { createServerLogger } from '@/lib/logger';
import { getClientIp, unifiedRateLimiter } from '@/lib/rate-limiter';
import {
    analyticsVariablesSchema,
    graphqlRequestSchema,
} from '@/lib/schemas/api';
import type { Json } from '@/types/database';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse, type NextRequest } from 'next/server';

const logger = createServerLogger('graphql-analytics')

// Simple analytics query helper
async function queryAnalytics(query: string, variables: Record<string, unknown>) {
  // This is a simplified implementation - expand based on actual needs
  const { data, error } = await supabaseAdmin.rpc('query_analytics', { query_text: query, vars: variables as Json });
  if (error) {
    throw error;
  }
  return data;
}

export async function POST(request: NextRequest) {
  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request)
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api')
  if (!isAllowed) {
    logger.warn('GraphQL analytics rate limit exceeded', { ip: clientIp })
    return NextResponse.json(
      { errors: [{ message: 'Too many requests' }] },
      { status: 429 }
    )
  }

  try {
    // Basic authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawData = await request.json()

    // Validate request data
    const validation = graphqlRequestSchema.safeParse(rawData)
    if (!validation.success) {
      logger.error('Invalid GraphQL request', {
        errors: validation.error.issues,
        rawData,
      })
      return NextResponse.json(
        {
          errors: [{
            message: 'Invalid GraphQL request',
            details: validation.error.issues,
          }],
        },
        { status: 400 }
      )
    }

    const { query, variables } = validation.data

    logger.info('GraphQL analytics query received', {
      queryLength: query.length,
      hasVariables: !!variables,
    })

    // Validate variables if present
    if (variables) {
      const variablesValidation = analyticsVariablesSchema.safeParse(variables)
      if (!variablesValidation.success) {
        logger.error('Invalid query variables', {
          errors: variablesValidation.error.issues,
          variables,
        })
        return NextResponse.json(
          {
            errors: [{
              message: 'Invalid query variables',
              details: variablesValidation.error.issues,
            }],
          },
          { status: 400 }
        )
      }
    }

    // Execute GraphQL query
    const result = await executeAnalyticsQuery(query, variables || {})

    logger.info('GraphQL query executed successfully')
    return NextResponse.json(result)

  } catch (error) {
    logger.error('GraphQL query failed', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      {
        errors: [{
          message: 'Query execution failed',
          details: error instanceof Error ? error.message : String(error),
        }],
      },
      { status: 500 }
    )
  }
}

async function executeAnalyticsQuery(query: string, variables: Record<string, unknown> = {}) {
  // Parse and execute common analytics queries

  if (query.includes('getPageViews')) {
    return await getPageViews(variables)
  } else if (query.includes('getWebVitals')) {
    return await getWebVitals(variables)
  } else if (query.includes('getLeadStats')) {
    return await getLeadStats(variables)
  } else if (query.includes('getEventStats')) {
    return await getEventStats(variables)
  } else if (query.includes('getFunnelAnalytics')) {
    return await getFunnelAnalytics(variables)
  } else {
    // Fallback to direct Supabase GraphQL if available
    return await queryAnalytics(query, variables)
  }
}

async function getPageViews(variables: Record<string, unknown>) {
  const timeRange = typeof variables.timeRange === 'string' ? variables.timeRange : '24h';
  const limit = typeof variables.limit === 'number' ? Math.min(Math.max(variables.limit, 1), 1000) : 100;

  const rangeMap: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };

  const defaultRange24h = 24 * 60 * 60 * 1000;
  const rangeMs = rangeMap[timeRange] ?? defaultRange24h;
  const since = new Date(Date.now() - rangeMs).toISOString();

  const { data, error } = await supabaseAdmin
    .from('page_analytics')
    .select('path, duration, bounce, session_id, user_id')
    .gte('timestamp', since);

  if (error) {
    logger.error('Failed to fetch page analytics', error);
    throw error;
  }

  const pageMap = new Map<string, {
    views: number;
    sessions: Set<string>;
    totalDuration: number;
    bounces: number;
  }>();

  let totalBounces = 0;

  for (const row of data || []) {
    const path = (row as { path?: string }).path || 'unknown';
    const stats = pageMap.get(path) ?? {
      views: 0,
      sessions: new Set<string>(),
      totalDuration: 0,
      bounces: 0,
    };

    stats.views += 1;

    const sessionKey = (row as { session_id?: string | null }).session_id
      || (row as { user_id?: string | null }).user_id
      || `anon-${stats.views}`;
    stats.sessions.add(sessionKey);

    const duration = (row as { duration?: number | null }).duration;
    if (typeof duration === 'number') {
      stats.totalDuration += duration;
    }

    if ((row as { bounce?: boolean | null }).bounce) {
      stats.bounces += 1;
      totalBounces += 1;
    }

    pageMap.set(path, stats);
  }

  const pages = Array.from(pageMap.entries())
    .map(([path, stats]) => ({
      path,
      views: stats.views,
      uniqueVisitors: stats.sessions.size,
      averageDuration: stats.views ? stats.totalDuration / stats.views : 0,
      bounceRate: stats.views ? (stats.bounces / stats.views) * 100 : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);

  const totalViews = data?.length || 0;
  const bounceRate = totalViews ? (totalBounces / totalViews) * 100 : 0;

  logger.info('Page analytics query executed', {
    timeRange,
    totalViews,
    pagesReturned: pages.length,
  });

  return {
    data: {
      pageViews: {
        total: totalViews,
        bounceRate,
        pages,
        timeRange,
      }
    }
  };
}

async function getWebVitals(variables: Record<string, unknown>) {
  const timeRange = typeof variables.timeRange === 'string' ? variables.timeRange : '24h';
  const metricFilter = typeof variables.metric === 'string' ? variables.metric : null;
  const rangeMap: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };

  const defaultRange24h = 24 * 60 * 60 * 1000;
  const rangeMs = rangeMap[timeRange] ?? defaultRange24h;
  const since = new Date(Date.now() - rangeMs).toISOString();

  let query = supabaseAdmin
    .from('web_vitals')
    .select('metric_type, value, rating, page_path, created_at')
    .gte('created_at', since);

  if (metricFilter) {
    query = query.eq('metric_type', metricFilter);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to fetch web vitals', error);
    throw error;
  }

  const metricMap = new Map<string, {
    values: number[];
    sum: number;
    ratings: { good: number; needsImprovement: number; poor: number };
    pageStats: Map<string, { total: number; count: number }>;
  }>();

  for (const row of data || []) {
    const metric = (row as { metric_type?: string }).metric_type || 'unknown';
    const value = Number((row as { value?: number | string }).value);
    if (!Number.isFinite(value)) {
      continue;
    }

    const rating = (row as { rating?: string | null }).rating;
    const pagePath = (row as { page_path?: string | null }).page_path || 'unknown';

    const stats = metricMap.get(metric) ?? {
      values: [],
      sum: 0,
      ratings: { good: 0, needsImprovement: 0, poor: 0 },
      pageStats: new Map<string, { total: number; count: number }>(),
    };

    stats.values.push(value);
    stats.sum += value;

    if (rating === 'good') {stats.ratings.good += 1;}
    else if (rating === 'needs-improvement') {stats.ratings.needsImprovement += 1;}
    else if (rating === 'poor') {stats.ratings.poor += 1;}

    const page = stats.pageStats.get(pagePath) ?? { total: 0, count: 0 };
    page.total += value;
    page.count += 1;
    stats.pageStats.set(pagePath, page);

    metricMap.set(metric, stats);
  }

  const percentile = (values: number[], p: number) => {
    if (!values.length) { return 0; }
    const sorted = [...values].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) {
      const lowerValue = sorted[lower];
      return lowerValue !== undefined ? lowerValue : 0;
    }
    const weight = idx - lower;
    const lowerVal = sorted[lower] ?? 0;
    const upperVal = sorted[upper] ?? 0;
    return lowerVal * (1 - weight) + upperVal * weight;
  };

  const metrics = Array.from(metricMap.entries()).map(([metric, stats]) => {
    const count = stats.values.length;
    const average = count ? stats.sum / count : 0;
    const slowestPages = Array.from(stats.pageStats.entries())
      .map(([path, ps]) => ({
        path,
        averageValue: ps.total / ps.count,
        samples: ps.count,
      }))
      .sort((a, b) => b.averageValue - a.averageValue)
      .slice(0, 5);

    return {
      metric,
      samples: count,
      average,
      p75: percentile(stats.values, 75),
      p95: percentile(stats.values, 95),
      ratingDistribution: stats.ratings,
      slowestPages,
    };
  }).sort((a, b) => b.samples - a.samples);

  logger.info('Web vitals query executed', {
    timeRange,
    metricFilter: metricFilter || 'all',
    metricsReturned: metrics.length,
  });

  return {
    data: {
      webVitals: {
        metrics,
        timeRange,
      }
    }
  };
}

async function getLeadStats(variables: Record<string, unknown>) {
  const timeRange = typeof variables.timeRange === 'string' ? variables.timeRange : '30d';
  const rangeMap: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };

  const defaultRange30d = 30 * 24 * 60 * 60 * 1000;
  const rangeMs30d = rangeMap[timeRange] ?? defaultRange30d;
  const since = new Date(Date.now() - rangeMs30d).toISOString();

  // Fetch all leads data and aggregate in JS (postgrest doesn't support .group())
  const { data: leadsData, error: leadsError, count: totalCount } = await supabaseAdmin
    .from('leads')
    .select('id, lead_score, source, status', { count: 'exact' })
    .gte('created_at', since);

  if (leadsError) {
    logger.error('Failed to fetch lead stats', leadsError);
    throw leadsError;
  }

  const total = totalCount || 0;
  const leads = leadsData || [];

  // Calculate average score
  const scores = leads
    .map(l => (l as { lead_score?: number | null }).lead_score)
    .filter((s): s is number => typeof s === 'number');
  const averageScore = scores.length > 0
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : 0;

  // Aggregate by source
  const sourceMap = new Map<string, number>();
  for (const lead of leads) {
    const source = (lead as { source?: string | null }).source || 'unknown';
    sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
  }
  const bySource = Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Aggregate by status
  const statusMap = new Map<string, number>();
  for (const lead of leads) {
    const status = (lead as { status?: string | null }).status || 'unknown';
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  }
  const byStatus = Array.from(statusMap.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  logger.info('Lead stats query executed', {
    timeRange,
    total,
    sources: bySource.length,
    statuses: byStatus.length,
  });

  return {
    data: {
      leads: {
        total,
        averageScore,
        bySource,
        byStatus,
        timeRange,
      }
    }
  };
}

async function getEventStats(variables: Record<string, unknown>) {
  const timeRange = typeof variables.timeRange === 'string' ? variables.timeRange : '24h';
  const limit = typeof variables.limit === 'number'
    ? Math.min(Math.max(variables.limit, 1), 1000)
    : 100;
  const categoryFilter = typeof variables.category === 'string' ? variables.category : null;

  const rangeMap: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };

  const defaultRange24h = 24 * 60 * 60 * 1000;
  const rangeMs = rangeMap[timeRange] ?? defaultRange24h;
  const since = new Date(Date.now() - rangeMs).toISOString();

  let query = supabaseAdmin
    .from('custom_events')
    .select('event_name, event_category, event_value, session_id, user_id, timestamp')
    .gte('timestamp', since);

  if (categoryFilter) {
    query = query.eq('event_category', categoryFilter);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to fetch event stats', error);
    throw error;
  }

  const aggregates = new Map<string, {
    name: string;
    category: string;
    count: number;
    totalValue: number;
    valueSamples: number;
    sessions: Set<string>;
    users: Set<string>;
    lastTimestamp: string | null;
  }>();

  for (const row of data || []) {
    const name = (row as { event_name?: string | null }).event_name || 'unknown';
    const category = (row as { event_category?: string | null }).event_category || 'general';
    const key = `${category}|${name}`;

    const stats = aggregates.get(key) ?? {
      name,
      category,
      count: 0,
      totalValue: 0,
      valueSamples: 0,
      sessions: new Set<string>(),
      users: new Set<string>(),
      lastTimestamp: null as string | null,
    };

    stats.count += 1;

    const rawValue = (row as { event_value?: number | string | null }).event_value;
    const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    if (Number.isFinite(value)) {
      stats.totalValue += value;
      stats.valueSamples += 1;
    }

    const sessionId = (row as { session_id?: string | null }).session_id;
    if (sessionId) {stats.sessions.add(sessionId);}

    const userId = (row as { user_id?: string | null }).user_id;
    if (userId) {stats.users.add(userId);}

    const eventTimestamp = (row as { timestamp?: string | null }).timestamp;
    if (eventTimestamp && (!stats.lastTimestamp || eventTimestamp > stats.lastTimestamp)) {
      stats.lastTimestamp = eventTimestamp;
    }

    aggregates.set(key, stats);
  }

  const events = Array.from(aggregates.values())
    .map((stats) => ({
      name: stats.name,
      category: stats.category,
      count: stats.count,
      uniqueSessions: stats.sessions.size,
      uniqueUsers: stats.users.size,
      totalValue: stats.totalValue,
      averageValue: stats.valueSamples ? stats.totalValue / stats.valueSamples : 0,
      lastOccurredAt: stats.lastTimestamp,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const total = data?.length || 0;
  const categoryCount = new Set(events.map((e) => e.category)).size;

  logger.info('Event stats query executed', {
    timeRange,
    totalEvents: total,
    eventsReturned: events.length,
    categoryCount,
    categoryFilter: categoryFilter || 'all',
  });

  return {
    data: {
      events: {
        total,
        events,
        timeRange,
      }
    }
  };
}

async function getFunnelAnalytics(variables: Record<string, unknown>) {
  const timeRange = typeof variables.timeRange === 'string' ? variables.timeRange : '7d';
  const funnelName = typeof variables.funnelName === 'string' ? variables.funnelName : null;
  const limit = typeof variables.limit === 'number'
    ? Math.min(Math.max(variables.limit, 1), 100)
    : 50;

  const rangeMap: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };

  const defaultRange7d = 7 * 24 * 60 * 60 * 1000;
  const rangeMs = rangeMap[timeRange] ?? defaultRange7d;
  const since = new Date(Date.now() - rangeMs).toISOString();

  let query = supabaseAdmin
    .from('conversion_funnel')
    .select('funnel_name, step_name, step_order, completed_at, session_id, user_id, completed, time_to_complete')
    .gte('completed_at', since);

  if (funnelName) {
    query = query.eq('funnel_name', funnelName);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Failed to fetch funnel analytics', error);
    throw error;
  }

  if (!data?.length) {
    return {
      data: {
        funnels: [],
        timeRange,
      }
    };
  }

  type StepStats = {
    name: string;
    order: number;
    completions: number;
    uniqueSessions: Set<string>;
    uniqueUsers: Set<string>;
    totalTime: number;
    timeSamples: number;
    conversionRate?: number;
  };

  const funnelMap = new Map<string, { steps: Map<number, StepStats>; totalCompletions: number }>();

  for (const row of data) {
    const name = (row as { funnel_name?: string | null }).funnel_name || 'unknown';
    const order = Number((row as { step_order?: number | null }).step_order ?? 0);
    const stepName = (row as { step_name?: string | null }).step_name || `Step ${order || 1}`;
    const sessionId = (row as { session_id?: string | null }).session_id || `anon-${order}-${Math.random()}`;
    const userId = (row as { user_id?: string | null }).user_id;
    const completedFlag = (row as { completed?: boolean | null }).completed;
    const completedAt = (row as { completed_at?: string | null }).completed_at;
    const timeToComplete = (row as { time_to_complete?: number | null }).time_to_complete;

    const funnel = funnelMap.get(name) ?? { steps: new Map<number, StepStats>(), totalCompletions: 0 };
    let step = funnel.steps.get(order);
    if (!step) {
      step = {
        name: stepName,
        order,
        completions: 0,
        uniqueSessions: new Set<string>(),
        uniqueUsers: new Set<string>(),
        totalTime: 0,
        timeSamples: 0,
      };
      funnel.steps.set(order, step);
    }

    step.completions += 1;
    step.uniqueSessions.add(sessionId);
    if (userId) {
      step.uniqueUsers.add(userId);
    }

    if (Number.isFinite(timeToComplete)) {
      step.totalTime += Number(timeToComplete);
      step.timeSamples += 1;
    }

    if (completedFlag || completedAt) {
      funnel.totalCompletions += 1;
    }

    funnelMap.set(name, funnel);
  }

  // Calculate step-to-step conversion rates
  for (const [, funnel] of funnelMap) {
    const orderedSteps = Array.from(funnel.steps.values()).sort((a, b) => a.order - b.order);
    for (let i = 1; i < orderedSteps.length; i++) {
      const prev = orderedSteps[i - 1];
      const curr = orderedSteps[i];
      if (prev && curr) {
        const denominator = prev.uniqueSessions.size || prev.completions;
        curr.conversionRate = denominator > 0
          ? (curr.uniqueSessions.size / denominator) * 100
          : 0;
      }
    }
  }

  const funnels = Array.from(funnelMap.entries())
    .map(([name, funnel]) => {
      const steps = Array.from(funnel.steps.values())
        .sort((a, b) => a.order - b.order)
        .map(step => ({
          name: step.name,
          order: step.order,
          completions: step.completions,
          uniqueSessions: step.uniqueSessions.size,
          uniqueUsers: step.uniqueUsers.size,
          averageTimeToComplete: step.timeSamples ? step.totalTime / step.timeSamples : null,
          conversionRate: step.conversionRate ?? 0,
        }));

      const firstStep = steps[0];
      const lastStep = steps[steps.length - 1];
      return {
        name,
        totalCompletions: funnel.totalCompletions,
        steps,
        overallConversion: steps.length > 1 && firstStep?.uniqueSessions && lastStep
          ? (lastStep.uniqueSessions / firstStep.uniqueSessions) * 100
          : 0,
      };
    })
    .sort((a, b) => b.totalCompletions - a.totalCompletions)
    .slice(0, limit);

  logger.info('Funnel analytics query executed', {
    timeRange,
    funnelFilter: funnelName || 'all',
    funnelsReturned: funnels.length,
  });

  return {
    data: {
      funnels,
      timeRange,
    }
  };
}
