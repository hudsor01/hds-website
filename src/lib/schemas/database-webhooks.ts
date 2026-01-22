/**
 * Database Webhook Validation Schemas
 *
 * Zod schemas for validating database operations, logging, and analytics
 */

import { z } from 'zod';

// ============================================================================
// Log Level and Context Schemas
// ============================================================================

export const logLevelSchema = z.enum(['debug', 'info', 'warn', 'error', 'fatal']);

export const logContextSchema = z.record(z.string(), z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number()])),
  z.record(z.string(), z.unknown()),
]));

export const logEntrySchema = z.object({
  level: logLevelSchema,
  message: z.string().min(1).max(5000),
  context: logContextSchema.optional(),
  timestamp: z.string().datetime().optional(),
  session_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  path: z.string().optional(),
});

export type LogLevel = z.infer<typeof logLevelSchema>;
export type LogContext = z.infer<typeof logContextSchema>;
export type LogEntry = z.infer<typeof logEntrySchema>;

// ============================================================================
// Custom Event Schemas
// ============================================================================

export const eventNameSchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Event name must start with letter or underscore');

export const customEventSchema = z.object({
  event_name: eventNameSchema,
  properties: z.record(z.string(), z.unknown()).optional(),
  session_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
});

export type EventName = z.infer<typeof eventNameSchema>;
export type CustomEvent = z.infer<typeof customEventSchema>;

// ============================================================================
// Web Vitals Schemas
// ============================================================================

export const webVitalsMetricTypeSchema = z.enum(['CLS', 'FID', 'FCP', 'LCP', 'TTFB', 'INP']);
export const webVitalsRatingSchema = z.enum(['good', 'needs-improvement', 'poor']);

export const webVitalsEntrySchema = z.object({
  metric_type: webVitalsMetricTypeSchema,
  value: z.number().nonnegative(),
  rating: webVitalsRatingSchema,
  session_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  path: z.string(),
  timestamp: z.string().datetime().optional(),
});

export type WebVitalsMetricType = z.infer<typeof webVitalsMetricTypeSchema>;
export type WebVitalsRating = z.infer<typeof webVitalsRatingSchema>;
export type WebVitalsEntry = z.infer<typeof webVitalsEntrySchema>;

// ============================================================================
// Lead Scoring Schemas
// ============================================================================

export const leadScoreSchema = z.number().int().min(0).max(100);

export const leadUpdateSchema = z.object({
  lead_id: z.string().uuid(),
  score: leadScoreSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type LeadScore = z.infer<typeof leadScoreSchema>;
export type LeadUpdate = z.infer<typeof leadUpdateSchema>;

// ============================================================================
// Funnel Tracking Schemas
// ============================================================================

export const funnelStepStatusSchema = z.enum(['entered', 'completed', 'abandoned', 'skipped']);

export const funnelTrackingSchema = z.object({
  funnel_name: z.string().min(1).max(100),
  step_name: z.string().min(1).max(100),
  step_number: z.number().int().positive(),
  status: funnelStepStatusSchema,
  session_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

export type FunnelStepStatus = z.infer<typeof funnelStepStatusSchema>;
export type FunnelTracking = z.infer<typeof funnelTrackingSchema>;

// ============================================================================
// A/B Test Schemas
// ============================================================================

export const testVariantSchema = z.enum(['control', 'variant_a', 'variant_b', 'variant_c']);
export const testOutcomeSchema = z.enum(['conversion', 'bounce', 'engagement', 'other']);

export const testResultSchema = z.object({
  test_id: z.string(),
  test_name: z.string().min(1).max(100),
  variant: testVariantSchema,
  outcome: testOutcomeSchema,
  value: z.number().optional(),
  session_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

export type TestVariant = z.infer<typeof testVariantSchema>;
export type TestOutcome = z.infer<typeof testOutcomeSchema>;
export type TestResult = z.infer<typeof testResultSchema>;

// ============================================================================
// Page View Schemas
// ============================================================================

export const pageViewSchema = z.object({
  path: z.string(),
  title: z.string().optional(),
  referrer: z.string().optional(),
  user_agent: z.string().optional(),
  session_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  duration_ms: z.number().int().nonnegative().optional(),
  scroll_depth: z.number().min(0).max(100).optional(), // percentage
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export type PageView = z.infer<typeof pageViewSchema>;

// ============================================================================
// Webhook Trigger Schemas
// ============================================================================

export const webhookEventTypeSchema = z.enum([
  'lead_captured',
  'contact_submitted',
  'download_requested',
  'high_intent_detected',
  'test_result',
  'error_occurred',
]);

export const webhookPayloadSchema = z.object({
  event_type: webhookEventTypeSchema,
  data: z.record(z.string(), z.unknown()),
  timestamp: z.string().datetime(),
  source: z.string().optional(),
});

export type WebhookEventType = z.infer<typeof webhookEventTypeSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

// ============================================================================
// GraphQL Query Schemas
// ============================================================================

export const graphqlQueryTypeSchema = z.enum([
  'pageViews',
  'events',
  'conversions',
  'funnelAnalysis',
  'testResults',
  'webVitals',
  'leadScores',
]);

export const queryVariablesSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().int().positive().max(10000).optional(),
  offset: z.number().int().nonnegative().optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
});

export const analyticsQuerySchema = z.object({
  query: z.string().min(1),
  variables: queryVariablesSchema.optional(),
});

export type GraphQLQueryType = z.infer<typeof graphqlQueryTypeSchema>;
export type QueryVariables = z.infer<typeof queryVariablesSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

// ============================================================================
// Database Record Schemas (for validation after queries)
// ============================================================================

export const uuidSchema = z.string().uuid();

export const timestampSchema = z.string().datetime();

export const databaseRecordSchema = z.object({
  id: uuidSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema.optional(),
}).passthrough(); // Allow additional fields

export type DatabaseRecord = z.infer<typeof databaseRecordSchema>;

// ============================================================================
// Lead Data Schemas
// ============================================================================

export const leadDataSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100).optional(),
  company: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  source: z.string().max(100).optional(),
  score: leadScoreSchema.optional(),
  intent_level: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type LeadData = z.infer<typeof leadDataSchema>;

// ============================================================================
// Event Data Schemas
// ============================================================================

export const eventDataSchema = z.object({
  name: eventNameSchema,
  category: z.string().max(100).optional(),
  label: z.string().max(200).optional(),
  value: z.number().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
  session_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
});

export type EventData = z.infer<typeof eventDataSchema>;
