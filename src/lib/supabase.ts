/**
 * Supabase Client Configuration - Optimized for Performance
 * Full-featured database integration with:
 * - Connection pooling
 * - Request batching
 * - In-memory caching
 * - Fire-and-forget non-critical writes
 * - Retry logic for critical operations
 */

import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/types/database'
import {
  logEntrySchema,
  customEventSchema,
  webVitalsEntrySchema,
  webhookPayloadSchema,
  leadUpdateSchema,
  funnelTrackingSchema,
  testResultSchema,
  pageViewSchema,
  analyticsQuerySchema,
} from '@/lib/schemas'
import { logger } from './logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only validate in runtime, not during build
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  if (!supabaseUrl) {
    console.warn('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!supabaseAnonKey) {
    console.warn('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
}

// Optimized client configuration with connection pooling
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      // Enable connection pooling for better performance
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          // Enable keep-alive for connection reuse
          keepalive: true,
        });
      },
    },
  }
)

// Admin client with optimized settings for server-side operations
export const supabaseAdmin = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          keepalive: true,
        });
      },
    },
  }
)

// Helper function to check if admin client is properly configured
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder'
  );
}

// ========================================
// PERFORMANCE OPTIMIZATIONS
// ========================================

// Simple in-memory cache for read operations (5 minute TTL)
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }
  if (cached) {
    cache.delete(key);
  }
  return null;
}

export function setCache(key: string, data: unknown): void {
  cache.set(key, {
    data,
    expires: Date.now() + CACHE_TTL,
  });
}

// Clear cache periodically to prevent memory leaks
if (typeof window === 'undefined') {
  const cacheCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (value.expires < now) {
        cache.delete(key);
      }
    }
  }, CACHE_TTL);

  if (cacheCleanupInterval.unref) {
    cacheCleanupInterval.unref();
  }
}

// Batch queue for non-critical writes
interface BatchItem {
  table: string;
  data: unknown;
}

const batchQueue: BatchItem[] = [];
const BATCH_SIZE = 50;
const BATCH_INTERVAL = 2000; // 2 seconds
let isProcessing = false; // Mutex flag to prevent race conditions

// Valid table names for batching
type BatchTable =
  | 'api_logs'
  | 'custom_events'
  | 'web_vitals'
  | 'conversion_funnel'
  | 'ab_test_results'
  | 'page_analytics';

// Process batch queue (with mutex to prevent race conditions)
async function processBatchQueue() {
  // Prevent concurrent processing
  if (isProcessing || batchQueue.length === 0) {
    return;
  }

  isProcessing = true;

  try {
    const items = batchQueue.splice(0, BATCH_SIZE);
    const grouped = items.reduce((acc, item) => {
      const table = item.table as BatchTable;
      if (!acc[table]) {
        acc[table] = [];
      }
      const tableData = acc[table];
      if (tableData) {
        tableData.push(item.data);
      }
      return acc;
    }, {} as Record<BatchTable, unknown[]>);

    for (const [table, data] of Object.entries(grouped) as [BatchTable, unknown[]][]) {
      try {
        await supabase.from(table).insert(data as never);
      } catch (error) {
        console.error(`Batch insert failed for ${table}:`, error);
      }
    }
  } finally {
    // Release mutex
    isProcessing = false;
  }
}

// Set up batch processing interval (server-side only)
if (typeof window === 'undefined') {
  const batchInterval = setInterval(processBatchQueue, BATCH_INTERVAL);
  if (batchInterval.unref) {
    batchInterval.unref();
  }
}

// Queue item for batched insert (non-critical writes)
function queueForBatch(table: string, data: unknown): void {
  batchQueue.push({ table, data });

  // Process immediately if batch size reached
  if (batchQueue.length >= BATCH_SIZE) {
    processBatchQueue().catch(console.error);
  }
}

// ========================================
// DATABASE OPERATIONS (OPTIMIZED)
// ========================================
export async function logToDatabase(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, unknown> = {}
) {
  try {
    // Validate log entry
    const validation = logEntrySchema.safeParse({
      level,
      message,
      context,
    });

    if (!validation.success) {
      // Use console.warn to avoid infinite recursion
      console.warn('Invalid log entry data:', {
        level,
        message,
        errors: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        })),
      });
    }

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

    // Use batching for debug/info logs, immediate for warn/error
    if (level === 'debug' || level === 'info') {
      queueForBatch('api_logs', logData);
    } else {
      // Critical logs (warn/error) are inserted immediately
      await supabase.from('api_logs').insert(logData);
    }
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
    // Validate custom event data
    const validation = customEventSchema.safeParse({
      event_name: eventName,
      properties,
      session_id: sessionId,
      user_id: userId,
    });

    if (!validation.success) {
      // Use console.warn to avoid infinite recursion
      console.warn('Invalid custom event data:', {
        eventName,
        errors: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        })),
      });
    }

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

    // Most events can be batched for better performance
    queueForBatch('custom_events', eventData);
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
    const path = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/');

    // Validate web vitals data
    const validation = webVitalsEntrySchema.safeParse({
      metric_type: metric,
      value,
      rating,
      session_id: sessionId,
      path,
    });

    if (!validation.success) {
      // Use console.warn to avoid infinite recursion
      console.warn('Invalid web vitals data:', {
        metric,
        errors: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        })),
      });
    }

    const vitalsData = {
      session_id: sessionId || null,
      page_path: path,
      metric_type: metric,
      value: value,
      rating: rating,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      device_type: typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      timestamp: new Date().toISOString(),
    } satisfies Database['public']['Tables']['web_vitals']['Insert'];

    // Web vitals are non-critical, batch them
    queueForBatch('web_vitals', vitalsData);
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
    // Validate analytics query
    const validation = analyticsQuerySchema.safeParse({
      query,
      variables,
    });

    if (!validation.success) {
      // Use console.warn to avoid infinite recursion
      console.warn('Invalid analytics query:', {
        errors: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        })),
      });
      return null;
    }

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
    // Validate webhook payload
    const validation = webhookPayloadSchema.safeParse({
      event_type: eventType,
      data: payload,
      timestamp: new Date().toISOString(),
    });

    if (!validation.success) {
      // Use console.warn to avoid infinite recursion
      console.warn('Invalid webhook payload:', {
        eventType,
        errors: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        })),
      });
      return;
    }

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
    // Validate lead score update
    const validation = leadUpdateSchema.safeParse({
      lead_id: leadId,
      score,
    });

    if (!validation.success) {
      // Use console.warn to avoid infinite recursion
      console.warn('Invalid lead score update:', {
        leadId,
        errors: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        })),
      });
      return;
    }

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
    // Validate funnel tracking data
    const validation = funnelTrackingSchema.safeParse({
      funnel_name: funnelName,
      step_name: stepName,
      step_number: stepOrder,
      status: completed ? 'completed' : 'entered',
      session_id: sessionId,
      metadata: properties,
    });

    if (!validation.success) {
      logger.warn('Invalid funnel tracking data', {
        sessionId,
        funnelName,
        stepName,
        stepOrder,
        completed,
        properties,
        errors: validation.error.issues,
      });
    }

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

    // Funnel tracking is high-volume, batch it
    queueForBatch('conversion_funnel', funnelData);
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
    // Validate test result data
    const validation = testResultSchema.safeParse({
      test_id: testName,
      test_name: testName,
      variant: variantName,
      outcome: converted ? 'conversion' : 'other',
      value: conversionValue,
      session_id: sessionId,
      user_id: userId,
    });

    if (!validation.success) {
      logger.warn('Invalid A/B test result data', {
        testName,
        variantName,
        converted,
        conversionEvent,
        conversionValue,
        sessionId,
        userId,
        errors: validation.error.issues,
      });
    }

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

    // A/B test results can be batched
    queueForBatch('ab_test_results', testData);
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
    // Validate page view data
    const validation = pageViewSchema.safeParse({
      path,
      title: title || (typeof document !== 'undefined' ? document.title : undefined),
      referrer: referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      session_id: sessionId,
      user_id: userId,
    });

    if (!validation.success) {
      logger.warn('Invalid page view data', {
        path,
        title,
        referrer,
        sessionId,
        userId,
        errors: validation.error.issues,
      });
    }

    const pageData = {
      session_id: sessionId || null,
      user_id: userId || null,
      path,
      title: title || (typeof document !== 'undefined' ? document.title : 'Unknown'),
      referrer: referrer || (typeof document !== 'undefined' ? document.referrer : ''),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      ip_address: null, // Will be populated by server
      bounce: false, // Will be updated by duration tracking
      timestamp: new Date().toISOString(),
    } satisfies Database['public']['Tables']['page_analytics']['Insert']

    // Page views are high-volume, batch them
    queueForBatch('page_analytics', pageData);
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