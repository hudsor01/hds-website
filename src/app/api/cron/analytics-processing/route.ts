/**
 * Analytics Processing Cron Job
 * Processes and aggregates analytics data from Supabase
 */

import { createServerLogger } from '@/lib/logger';
import { cronAuthHeaderSchema } from '@/lib/schemas/api';
import type { Json } from '@/types/database';
import { supabaseAdmin } from '@/lib/supabase';
import { type NextRequest, NextResponse } from 'next/server';

const logger = createServerLogger('analytics-cron')

type SupabaseErrorRecord = { error: true }

const isSupabaseErrorRecord = (item: unknown): item is SupabaseErrorRecord => {
  if (typeof item !== 'object' || item === null) {
    return false
  }

  const record = item as Record<string, unknown>
  return record.error === true
}

async function logCronExecution(jobName: string, status: string, error?: string) {
  try {
    await supabaseAdmin
      .from('cron_logs')
      .insert({ job_name: jobName, status, error_message: error });
  } catch (e) {
    // Non-critical for main job, but log for debugging
    logger.warn('Failed to log cron execution to database', {
      jobName,
      status,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

async function enqueueLogProcessing(data: Record<string, unknown>) {
  try {
    const payload = {
      data: data as Json,
      created_at: new Date().toISOString(),
    };

    await supabaseAdmin
      .from('processing_queue')
      .insert(payload);
  } catch (e) {
    // Non-critical for main job, but log for debugging
    logger.warn('Failed to enqueue log processing', {
      dataType: data.type,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

async function createCustomEventsTable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    logger.error('Supabase environment variables are not configured');
    return;
  }

  const sql = `
    create table if not exists public.custom_events (
      id uuid default gen_random_uuid() primary key,
      event_name text not null,
      event_category text default 'general',
      event_label text,
      event_value numeric,
      session_id text,
      user_id text,
      page_path text,
      properties jsonb,
      metadata jsonb default '{}'::jsonb,
      timestamp timestamptz default now(),
      ip_address inet,
      user_agent text,
      value numeric
    );
    create index if not exists idx_custom_events_event_name on public.custom_events(event_name);
    create index if not exists idx_custom_events_category on public.custom_events(event_category);
    create index if not exists idx_custom_events_session_id on public.custom_events(session_id);
    create index if not exists idx_custom_events_timestamp on public.custom_events(timestamp);
  `;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error('Failed to create custom_events table', { status: response.status, body });
    }
  } catch (error) {
    logger.error('Failed to create custom_events table', error instanceof Error ? error : new Error(String(error)));
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

    await createCustomEventsTable()

    // Process analytics data
    const results = await Promise.all([
      // processWebVitals(), // TODO: Create web_vitals table - disabled until table exists
      // processPageAnalytics(), // TODO: Create page_analytics table - disabled until table exists
      processCustomEvents(),
      processLeadScoring(),
      processConversionFunnels(),
    ])

    const summary = {
      eventsProcessed: results[0],
      leadsScored: results[1],
      funnelsUpdated: results[2],
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

async function processCustomEvents(): Promise<number> {
  try {
    // Get custom events from the last 24 hours
    const { data, error } = await supabaseAdmin
      .from('custom_events')
      .select('event_name, event_category, event_value, session_id, user_id')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      logger.error('Failed to fetch custom events', error);
      return 0;
    }

    // Aggregate by event name and category
    const aggregated = data?.reduce((acc, curr) => {
      const key = `${curr.event_category}-${curr.event_name}`;
      if (!acc[key]) {
        acc[key] = {
          count: 0,
          total_value: 0,
          unique_sessions: new Set<string>(),
          unique_users: new Set<string>(),
        };
      }
      const eventData = acc[key];
      eventData.count++;
      if (curr.event_value) {
        eventData.total_value += curr.event_value;
      }
      if (curr.session_id) {
        eventData.unique_sessions.add(curr.session_id);
      }
      if (curr.user_id) {
        eventData.unique_users.add(curr.user_id);
      }
      return acc;
    }, {} as Record<string, { count: number; total_value: number; unique_sessions: Set<string>; unique_users: Set<string> }>);

    // Log aggregated data
    if (aggregated && Object.keys(aggregated).length > 0) {
      await enqueueLogProcessing({
        type: 'custom_events_aggregated',
        data: aggregated,
        timestamp: new Date().toISOString(),
      });
    }

    return data?.length || 0;
  } catch (error) {
    logger.error('Custom events processing failed', error instanceof Error ? error : new Error(String(error)));
    return 0;
  }
}

async function processLeadScoring(): Promise<number> {
  try {
    // Get leads that need scoring (new leads without scores or updated recently)
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('id, email, source, created_at, status')
      .or('lead_score.is.null,and(lead_score.lt.50,updated_at.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() + ')');

    if (error) {
      logger.error('Failed to fetch leads for scoring', error);
      return 0;
    }

    let scoredCount = 0;

    // Simple scoring algorithm based on source and status
    for (const lead of data || []) {
      let score = 0;

      // Base score by source
      switch (lead.source) {
        case 'calculator-form':
          score += 30;
          break;
        case 'contact-form':
          score += 25;
          break;
        case 'newsletter-form':
          score += 15;
          break;
        default:
          score += 10;
      }

      // Bonus for status
      switch (lead.status) {
        case 'qualified':
          score += 20;
          break;
        case 'contacted':
          score += 15;
          break;
        case 'converted':
          score += 25;
          break;
        default:
          score += 5;
      }

      // Update the lead score
      const { error: updateError } = await supabaseAdmin
        .from('leads')
        .update({ lead_score: Math.min(score, 100) })
        .eq('id', lead.id);

      if (!updateError) {
        scoredCount++;
      }
    }

    // Log scoring results
    if (scoredCount > 0) {
      await enqueueLogProcessing({
        type: 'leads_scored',
        data: { scored_count: scoredCount, total_leads: data?.length || 0 },
        timestamp: new Date().toISOString(),
      });
    }

    return scoredCount;
  } catch (error) {
    logger.error('Lead scoring processing failed', error instanceof Error ? error : new Error(String(error)));
    return 0;
  }
}

async function processConversionFunnels(): Promise<number> {
  try {
    // Get recent funnel steps
    const result = await supabaseAdmin
      .from('conversion_funnel')
      .select('funnel_name, step_name, step_order, completed_at, session_id, user_id')
      .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    if (result.error) {
      logger.error('Failed to fetch conversion funnel data', result.error);
      return 0;
    }

    // If data is null or an error object, return 0
    if (!result.data) {
      logger.warn('No conversion funnel data returned');
      return 0;
    }

    // Check if this is an error object disguised as data
    const firstItem = result.data[0];
    if (Array.isArray(result.data) && result.data.length > 0 && isSupabaseErrorRecord(firstItem)) {
      logger.warn('Supabase query returned schema error, skipping conversion funnel processing');
      return 0;
    }

    // Aggregate by funnel name
    const funnels = result.data.reduce((acc, curr) => {
      if ('funnel_name' in curr && 'step_order' in curr && 'step_name' in curr) {
        const funnelName = curr.funnel_name as string;
        if (!acc[funnelName]) {
          acc[funnelName] = {
            steps: {} as Record<number, { name: string; completions: number; unique_sessions: Set<string>; unique_users: Set<string>; conversion_rate?: number }>,
            total_completions: 0,
          };
        }

        const funnel = acc[funnelName];
        if (funnel) {
          const stepOrder = curr.step_order as number;
          if (!funnel.steps[stepOrder]) {
            funnel.steps[stepOrder] = {
              name: curr.step_name as string,
              completions: 0,
              unique_sessions: new Set<string>(),
              unique_users: new Set<string>(),
            };
          }

          const step = funnel.steps[stepOrder];
          if (step) {
            step.completions++;
            if ('session_id' in curr && curr.session_id) {
              step.unique_sessions.add(curr.session_id as string);
            }
            if ('user_id' in curr && curr.user_id) {
              step.unique_users.add(curr.user_id as string);
            }

            if ('completed_at' in curr && curr.completed_at) {
              funnel.total_completions++;
            }
          }
        }
      }

      return acc;
    }, {} as Record<string, { steps: Record<number, { name: string; completions: number; unique_sessions: Set<string>; unique_users: Set<string>; conversion_rate?: number }>; total_completions: number }>);

    // Calculate conversion rates
    if (funnels) {
      Object.keys(funnels).forEach(funnelName => {
        const funnel = funnels[funnelName];
        if (funnel) {
          const stepOrders = Object.keys(funnel.steps).map(Number).sort((a, b) => a - b);

          for (let i = 1; i < stepOrders.length; i++) {
            const prevOrder = stepOrders[i - 1];
            const currOrder = stepOrders[i];
            if (prevOrder !== undefined && currOrder !== undefined) {
              const prevStep = funnel.steps[prevOrder];
              const currStep = funnel.steps[currOrder];

              if (prevStep && currStep) {
                const conversionRate = prevStep.unique_sessions.size > 0
                  ? (currStep.unique_sessions.size / prevStep.unique_sessions.size) * 100
                  : 0;

                currStep.conversion_rate = conversionRate;
              }
            }
          }
        }
      });
    }

    // Log funnel data
    if (funnels && Object.keys(funnels).length > 0) {
      await enqueueLogProcessing({
        type: 'conversion_funnels_analyzed',
        data: funnels,
        timestamp: new Date().toISOString(),
      });
    }

    return result.data?.length || 0;
  } catch (error) {
    logger.error('Conversion funnels processing failed', error instanceof Error ? error : new Error(String(error)));
    return 0;
  }
}
