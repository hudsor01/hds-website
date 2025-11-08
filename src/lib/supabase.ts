/**
 * Supabase Client Configuration
 * Safe initialization with proper validation
 *
 * Official docs: https://supabase.com/docs/reference/javascript/initializing
 *
 * Bug fix: Validates environment variables before creating clients
 * Prevents runtime failures from placeholder credentials
 */

import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/types/database'
import { env } from '@/env'

// Validate environment variables
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Validate required Supabase credentials
 * Throws descriptive error if missing
 */
function validateSupabaseCredentials(
  url: string | undefined,
  key: string | undefined,
  keyName: string
): { url: string; key: string } {
  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL environment variable is not set. ' +
      'Get this from your Supabase project dashboard.'
    );
  }

  if (!key) {
    throw new Error(
      `${keyName} environment variable is not set. ` +
      'Get this from your Supabase project dashboard.'
    );
  }

  // Validate URL format
  if (!url.startsWith('http')) {
    throw new Error(
      `Invalid Supabase URL: ${url}. Must start with https://`
    );
  }

  return { url, key };
}

/**
 * Create Supabase client with validation
 * Only creates client if credentials are valid
 */
function createSupabaseClient() {
  try {
    const { url, key } = validateSupabaseCredentials(
      supabaseUrl,
      supabaseAnonKey,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );

    return createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (error) {
    // Log warning but don't crash the app during build
    if (env.NODE_ENV === 'development') {
      console.warn('Supabase client creation failed:', error);
    }
    // Return null to allow graceful degradation
    return null;
  }
}

/**
 * Create admin Supabase client with service role key
 * For server-side operations (webhooks, cron, queues)
 */
function createSupabaseAdminClient() {
  try {
    const { url } = validateSupabaseCredentials(
      supabaseUrl,
      supabaseAnonKey,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );

    if (!supabaseServiceKey) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY environment variable is not set. ' +
        'This is required for admin operations. ' +
        'Get this from your Supabase project dashboard (Settings > API).'
      );
    }

    return createClient<Database>(url, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error) {
    if (env.NODE_ENV === 'development') {
      console.warn('Supabase admin client creation failed:', error);
    }
    return null;
  }
}

// Main Supabase client for standard operations
export const supabase = createSupabaseClient();

// Admin client for server-side operations (webhooks, cron, queues)
export const supabaseAdmin = createSupabaseAdminClient();

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Check if admin Supabase is properly configured
 */
export function isSupabaseAdminConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

/**
 * Get Supabase client with runtime validation
 * Throws if not configured
 */
export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Check environment variables.');
  }
  return supabase;
}

/**
 * Get admin Supabase client with runtime validation
 * Throws if not configured
 */
export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not configured. Check SUPABASE_SERVICE_ROLE_KEY.');
  }
  return supabaseAdmin;
}

// Re-export all the original functions with safe wrappers
export async function logToDatabase(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, unknown> = {}
) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping database log');
    return;
  }

  try {
    const logData = {
      endpoint: (context.endpoint as string) || 'unknown',
      method: (context.method as string) || 'INTERNAL',
      status_code: (context.status_code as number) || 200,
      response_time_ms: (context.response_time_ms as number) || null,
      user_agent: (context.userAgent as string) || null,
      ip_address: (context.ip_address as string) || null,
      error_message: level === 'error' ? message : null,
      request_headers: (context.headers as Json) || null,
      response_body: { level, message, context } as Json,
      timestamp: new Date().toISOString(),
    } satisfies Database['public']['Tables']['api_logs']['Insert'];

    await supabase.from('api_logs').insert(logData)
  } catch (error) {
    console.error('Database logging failed:', error)
  }
}

export async function logCustomEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  sessionId?: string,
  userId?: string
) {
  if (!supabase) {
    return;
  }

  try {
    const eventData = {
      session_id: sessionId || null,
      user_id: userId || null,
      event_name: eventName,
      event_category: (properties.category as string) || 'logging',
      page_path: (properties.path as string) || null,
      properties: properties as Json,
      value: (properties.value as number) || null,
      user_agent: (properties.userAgent as string) || null,
      ip_address: (properties.ip_address as string) || null,
      timestamp: new Date().toISOString(),
    } satisfies Database['public']['Tables']['custom_events']['Insert'];

    await supabase.from('custom_events').insert(eventData)
  } catch (error) {
    console.error('Custom event logging failed:', error)
  }
}

export async function logWebVitals(
  metric: string,
  value: number,
  rating: string,
  sessionId?: string,
  pagePath?: string
) {
  if (!supabase) {
    return;
  }

  try {
    const vitalsData = {
      session_id: sessionId || null,
      page_path: pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      metric_type: metric,
      value: value,
      rating: rating,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      device_type: typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      timestamp: new Date().toISOString(),
    } satisfies Database['public']['Tables']['web_vitals']['Insert'];

    await supabase.from('web_vitals').insert(vitalsData)
  } catch (error) {
    console.error('Web Vitals logging failed:', error)
  }
}

// Realtime subscriptions
export function subscribeToLogs(callback: (payload: Record<string, unknown>) => void) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  return supabase
    .channel('api_logs')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'api_logs' }, callback)
    .subscribe()
}

export function subscribeToEvents(callback: (payload: Record<string, unknown>) => void) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  return supabase
    .channel('custom_events')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'custom_events' }, callback)
    .subscribe()
}

// Admin operations
export async function enqueueLogProcessing(logData: Record<string, unknown>) {
  if (!supabaseAdmin) {
    console.warn('Supabase admin not configured, skipping log processing');
    return;
  }

  try {
    await supabaseAdmin.rpc('enqueue_log_processing', { log_data: logData })
  } catch (error) {
    console.error('Queue enqueue failed:', error)
  }
}

export async function queryAnalytics(query: string, variables?: Record<string, unknown>) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin not configured for analytics queries');
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('graphql', {
      query,
      variables: variables || {}
    })

    if (error) {throw error}
    return data
  } catch (error) {
    console.error('GraphQL query failed:', error)
    return null
  }
}

export async function triggerWebhook(eventType: string, payload: Record<string, unknown>) {
  if (!supabaseAdmin) {
    console.warn('Supabase admin not configured, skipping webhook');
    return;
  }

  try {
    await supabaseAdmin.rpc('trigger_webhook', {
      event_type: eventType,
      payload: payload
    })
  } catch (error) {
    console.error('Webhook trigger failed:', error)
  }
}

export async function updateLeadScore(leadId: string, score: number) {
  if (!supabase) {
    return;
  }

  try {
    await supabase
      .from('leads')
      .update({ lead_score: score, updated_at: new Date().toISOString() })
      .eq('id', leadId)
  } catch (error) {
    console.error('Lead score update failed:', error)
  }
}

export async function trackFunnelStep(
  sessionId: string,
  funnelName: string,
  stepName: string,
  stepOrder: number,
  completed: boolean = false,
  properties?: Record<string, unknown>
) {
  if (!supabase) {
    return;
  }

  try {
    const funnelData = {
      session_id: sessionId,
      funnel_name: funnelName,
      step_name: stepName,
      step_order: stepOrder,
      completed,
      completion_time: completed ? new Date().toISOString() : null,
      page_path: typeof window !== 'undefined' ? window.location.pathname : null,
      properties: properties as Json || null,
      timestamp: new Date().toISOString(),
    } satisfies Database['public']['Tables']['conversion_funnel']['Insert']

    await supabase.from('conversion_funnel').insert(funnelData)
  } catch (error) {
    console.error('Funnel tracking failed:', error)
  }
}

export async function recordTestResult(
  testName: string,
  variantName: string,
  converted: boolean,
  conversionEvent?: string,
  conversionValue?: number,
  sessionId?: string,
  userId?: string
) {
  if (!supabase) {
    return;
  }

  try {
    const testData = {
      test_name: testName,
      variant_name: variantName,
      user_id: userId || null,
      session_id: sessionId || null,
      converted,
      conversion_event: conversionEvent || null,
      conversion_value: conversionValue || null,
      properties: null,
      timestamp: new Date().toISOString(),
    } satisfies Database['public']['Tables']['ab_test_results']['Insert']

    await supabase.from('ab_test_results').insert(testData)
  } catch (error) {
    console.error('A/B test recording failed:', error)
  }
}

export async function trackPageView(
  path: string,
  title?: string,
  referrer?: string,
  sessionId?: string,
  userId?: string
) {
  if (!supabase) {
    return;
  }

  try {
    const pageData = {
      session_id: sessionId || null,
      user_id: userId || null,
      path,
      title: title || document.title,
      referrer: referrer || document.referrer,
      user_agent: navigator.userAgent,
      ip_address: null,
      bounce: false,
      timestamp: new Date().toISOString(),
    } satisfies Database['public']['Tables']['page_analytics']['Insert']

    await supabase.from('page_analytics').insert(pageData)
  } catch (error) {
    console.error('Page tracking failed:', error)
  }
}

export async function logCronExecution(jobName: string, status: 'started' | 'completed' | 'failed', error?: string) {
  try {
    await logToDatabase('info', `Cron job ${jobName} ${status}`, {
      job_name: jobName,
      status,
      error_message: error || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron logging failed:', error)
  }
}
