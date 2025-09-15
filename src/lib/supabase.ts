/**
 * Supabase Client Configuration
 * Full-featured database integration with webhooks, cron, queues, and GraphQL
 */

import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/types/database'

const supabaseUrl = 'https://bholhbfdqbdpfhmrzhbv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob2xoYmZkcWJkcGZobXJ6aGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTkyNjMsImV4cCI6MjA3MTAzNTI2M30.r06VbWsaX1R-8PCTmttWTc7WI4tESSmyfwbyCZX5-lY'

// Main Supabase client for standard operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Admin client for server-side operations (webhooks, cron, queues)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Database logging functions
export async function logToDatabase(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, unknown> = {}
) {
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
    // Fallback to console if database logging fails
    console.error('Database logging failed:', error)
  }
}

export async function logCustomEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  sessionId?: string,
  userId?: string
) {
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

// ========================================
// ADVANCED SUPABASE FEATURES
// ========================================

// Realtime subscriptions for live analytics
export function subscribeToLogs(callback: (payload: Record<string, unknown>) => void) {
  return supabase
    .channel('api_logs')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'api_logs' }, callback)
    .subscribe()
}

export function subscribeToEvents(callback: (payload: Record<string, unknown>) => void) {
  return supabase
    .channel('custom_events')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'custom_events' }, callback)
    .subscribe()
}

// Queue system for background processing
export async function enqueueLogProcessing(logData: Record<string, unknown>) {
  try {
    await supabaseAdmin.rpc('enqueue_log_processing', { log_data: logData })
  } catch (error) {
    console.error('Queue enqueue failed:', error)
  }
}

// GraphQL query for analytics
export async function queryAnalytics(query: string, variables?: Record<string, unknown>) {
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

// Webhook helpers for external integrations
export async function triggerWebhook(eventType: string, payload: Record<string, unknown>) {
  try {
    await supabaseAdmin.rpc('trigger_webhook', {
      event_type: eventType,
      payload: payload
    })
  } catch (error) {
    console.error('Webhook trigger failed:', error)
  }
}

// Lead scoring and analytics
export async function updateLeadScore(leadId: string, score: number) {
  try {
    await supabase
      .from('leads')
      .update({ lead_score: score, updated_at: new Date().toISOString() })
      .eq('id', leadId)
  } catch (error) {
    console.error('Lead score update failed:', error)
  }
}

// Conversion funnel tracking
export async function trackFunnelStep(
  sessionId: string,
  funnelName: string,
  stepName: string,
  stepOrder: number,
  completed: boolean = false,
  properties?: Record<string, unknown>
) {
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

// A/B testing integration
export async function recordTestResult(
  testName: string,
  variantName: string,
  converted: boolean,
  conversionEvent?: string,
  conversionValue?: number,
  sessionId?: string,
  userId?: string
) {
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

// Page analytics with session tracking
export async function trackPageView(
  path: string,
  title?: string,
  referrer?: string,
  sessionId?: string,
  userId?: string
) {
  try {
    const pageData = {
      session_id: sessionId || null,
      user_id: userId || null,
      path,
      title: title || document.title,
      referrer: referrer || document.referrer,
      user_agent: navigator.userAgent,
      ip_address: null, // Will be populated by server
      bounce: false, // Will be updated by duration tracking
      timestamp: new Date().toISOString(),
    } satisfies Database['public']['Tables']['page_analytics']['Insert']

    await supabase.from('page_analytics').insert(pageData)
  } catch (error) {
    console.error('Page tracking failed:', error)
  }
}

// Cron job status tracking
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