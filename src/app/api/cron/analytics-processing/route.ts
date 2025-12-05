/**
 * Analytics Processing Cron Job
 * Processes and aggregates analytics data from Supabase
 */

import { createServerLogger } from '@/lib/logger';
import { cronAuthHeaderSchema } from '@/lib/schemas';
import type { Database } from '@/types/database';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

const logger = createServerLogger('analytics-cron')

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    logger.error('Supabase environment variables are not configured');
    return null;
  }

  return createClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function logCronExecution(jobName: string, status: string, error?: string) {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('cron_logs')
      .insert({ job_name: jobName, status, error_message: error });
  } catch {
    // Non-critical, don't fail the job
  }
}

async function enqueueLogProcessing(data: Record<string, unknown>) {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('processing_queue')
      .insert({ data, created_at: new Date().toISOString() });
  } catch {
    // Non-critical, don't fail the job
  }
}

export async function POST(request: NextRequest) {
  const jobName = 'analytics-processing'

  try {
    await logCronExecution(jobName, 'started')
    logger.info('Starting analytics processing cron job')

    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')

    // Validate cron auth header format
    const authValidation = cronAuthHeaderSchema.safeParse(authHeader);
    if (!authValidation.success) {
      logger.error('Invalid cron auth header format', {
        errors: authValidation.error.issues,
        providedAuth: authHeader ? 'Bearer ***' : 'none',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.warn('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process analytics data
    const results = await Promise.all([
      processWebVitals(),
      processPageAnalytics(),
      processCustomEvents(),
      processLeadScoring(),
      processConversionFunnels(),
    ])

    const summary = {
      webVitalsProcessed: results[0],
      pageViewsProcessed: results[1],
      eventsProcessed: results[2],
      leadsScored: results[3],
      funnelsUpdated: results[4],
      timestamp: new Date().toISOString(),
    }

    logger.info('Analytics processing completed', summary)
    await logCronExecution(jobName, 'completed')

    return NextResponse.json({
      success: true,
      summary,
    })

  } catch (error) {
    logger.error('Analytics processing cron failed', error instanceof Error ? error : new Error(String(error)))
    await logCronExecution(jobName, 'failed', error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}

async function processWebVitals(): Promise<number> {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      logger.error('Supabase not configured for web vitals processing');
      return 0;
    }

    // Get unprocessed web vitals from last hour
    const { data: vitals, error } = await supabase
      .from('web_vitals')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (error) {throw error}

    logger.info(`Processing ${vitals?.length || 0} web vitals records`)

    // Aggregate and process vitals data
    // This could calculate averages, detect performance issues, etc.
    for (const vital of vitals || []) {
      if (vital.rating === 'poor') {
        // Queue poor performance for investigation
        await enqueueLogProcessing({
          type: 'poor_performance',
          metric: vital.metric_type,
          value: vital.value,
          page: vital.page_path,
        })
      }
    }

    return vitals?.length || 0
  } catch (error) {
    logger.error('Web vitals processing failed', error instanceof Error ? error : new Error(String(error)))
    return 0
  }
}

async function processPageAnalytics(): Promise<number> {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      logger.error('Supabase not configured for page analytics processing');
      return 0;
    }

    // Get page views from last hour
    const { data: pageViews, error } = await supabase
      .from('page_analytics')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (error) {throw error}

    logger.info(`Processing ${pageViews?.length || 0} page view records`)

    // Process bounce rate, session duration, popular pages, etc.
    const pageStats = new Map()

    for (const view of pageViews || []) {
      const path = view.path
      if (!pageStats.has(path)) {
        pageStats.set(path, { views: 0, uniqueUsers: new Set() })
      }

      const stats = pageStats.get(path)
      stats.views++
      if (view.user_id) {stats.uniqueUsers.add(view.user_id)}
    }

    // Log popular pages
    const popularPages = Array.from(pageStats.entries())
      .sort(([,a], [,b]) => b.views - a.views)
      .slice(0, 5)

    logger.info('Popular pages this hour', { popularPages })

    return pageViews?.length || 0
  } catch (error) {
    logger.error('Page analytics processing failed', error instanceof Error ? error : new Error(String(error)))
    return 0
  }
}

async function processCustomEvents(): Promise<number> {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      logger.error('Supabase not configured for custom event processing');
      return 0;
    }

    // Get custom events from last hour
    const { data: events, error } = await supabase
      .from('custom_events')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (error) {throw error}

    logger.info(`Processing ${events?.length || 0} custom events`)

    // Aggregate events by type and category
    const eventStats = new Map()

    for (const event of events || []) {
      const key = `${event.event_category}:${event.event_name}`
      eventStats.set(key, (eventStats.get(key) || 0) + 1)
    }

    // Log top events
    const topEvents = Array.from(eventStats.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)

    logger.info('Top events this hour', { topEvents })

    return events?.length || 0
  } catch (error) {
    logger.error('Custom events processing failed', error instanceof Error ? error : new Error(String(error)))
    return 0
  }
}

async function processLeadScoring(): Promise<number> {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      logger.error('Supabase not configured for lead scoring');
      return 0;
    }

    // Get recent leads that need scoring updates
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) {throw error}

    logger.info(`Processing lead scores for ${leads?.length || 0} leads`)

    let scoredCount = 0

    for (const lead of leads || []) {
      // Calculate lead score based on various factors
      let score = 0

      // Email domain scoring
      if (lead.email?.includes('@gmail.com') || lead.email?.includes('@yahoo.com')) {
        score += 10
      } else if (lead.email && !lead.email.includes('@gmail.com')) {
        score += 20 // Business email
      }

      // Company field
      if (lead.company) {score += 15}

      // Phone number
      if (lead.phone) {score += 10}

      // Message length (indicates engagement)
      if (lead.message && lead.message.length > 100) {score += 5}

      // Source quality
      if (lead.source === 'direct') {score += 10}
      else if (lead.source === 'organic') {score += 8}
      else if (lead.source === 'referral') {score += 12}

      // Update lead score if it changed
      if (score !== lead.lead_score) {
        await supabase
          .from('leads')
          .update({ lead_score: score, updated_at: new Date().toISOString() })
          .eq('id', lead.id)

        scoredCount++
      }
    }

    logger.info(`Updated scores for ${scoredCount} leads`)
    return scoredCount
  } catch (error) {
    logger.error('Lead scoring failed', error instanceof Error ? error : new Error(String(error)))
    return 0
  }
}

async function processConversionFunnels(): Promise<number> {
  try {
    const supabase = createServiceClient();

    if (!supabase) {
      logger.error('Supabase not configured for funnel processing');
      return 0;
    }

    // Get funnel data from last hour
    const { data: funnelSteps, error } = await supabase
      .from('conversion_funnel')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (error) {throw error}

    logger.info(`Processing ${funnelSteps?.length || 0} funnel steps`)

    // Analyze conversion rates by funnel
    const funnelStats = new Map()

    for (const step of funnelSteps || []) {
      const key = step.funnel_name
      if (!funnelStats.has(key)) {
        funnelStats.set(key, { total: 0, completed: 0 })
      }

      const stats = funnelStats.get(key)
      stats.total++
      if (step.completed) {stats.completed++}
    }

    // Log conversion rates
    for (const [funnelName, stats] of funnelStats.entries()) {
      const rate = stats.total > 0 ? (stats.completed / stats.total * 100).toFixed(2) : 0
      logger.info(`Funnel ${funnelName} conversion rate: ${rate}%`, stats)
    }

    return funnelSteps?.length || 0
  } catch (error) {
    logger.error('Funnel processing failed', error instanceof Error ? error : new Error(String(error)))
    return 0
  }
}
