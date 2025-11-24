/**
 * Analytics Event Validation Schemas
 *
 * Zod schemas for validating analytics events, page views, and user properties
 */

import { z } from 'zod';

// ============================================================================
// Core Analytics Schemas
// ============================================================================

export const eventPropertiesSchema = z.record(z.string(), z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number()])),
])).optional();

export const userPropertiesSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  plan: z.string().optional(),
  signupDate: z.string().datetime().optional(),
  lastActive: z.string().datetime().optional(),
}).passthrough(); // Allow additional properties

export const pageViewPropertiesSchema = z.object({
  path: z.string(),
  title: z.string().optional(),
  referrer: z.string().optional(),
  search: z.string().optional(),
  hash: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
}).passthrough();

export const conversionDataSchema = z.object({
  event: z.string(),
  value: z.number().optional(),
  currency: z.string().length(3).optional(), // ISO 4217 currency code
  transactionId: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().optional(),
    quantity: z.number().positive().optional(),
    price: z.number().optional(),
  })).optional(),
});

export type EventProperties = z.infer<typeof eventPropertiesSchema>;
export type UserProperties = z.infer<typeof userPropertiesSchema>;
export type PageViewProperties = z.infer<typeof pageViewPropertiesSchema>;
export type ConversionData = z.infer<typeof conversionDataSchema>;

// ============================================================================
// Web Vitals Schemas
// ============================================================================

export const webVitalMetricSchema = z.enum(['CLS', 'FID', 'FCP', 'LCP', 'TTFB', 'INP']);
export const webVitalRatingSchema = z.enum(['good', 'needs-improvement', 'poor']);

export const webVitalsDataSchema = z.object({
  id: z.string(),
  name: webVitalMetricSchema,
  value: z.number().nonnegative(),
  rating: webVitalRatingSchema,
  delta: z.number().optional(),
  navigationType: z.enum(['navigate', 'reload', 'back_forward', 'prerender']).optional(),
});

export type WebVitalMetric = z.infer<typeof webVitalMetricSchema>;
export type WebVitalRating = z.infer<typeof webVitalRatingSchema>;
export type WebVitalsData = z.infer<typeof webVitalsDataSchema>;

// ============================================================================
// Form Analytics Schemas
// ============================================================================

export const formInteractionSchema = z.object({
  formId: z.string(),
  formName: z.string().optional(),
  action: z.enum(['start', 'field_focus', 'field_blur', 'field_error', 'submit', 'success', 'error']),
  fieldName: z.string().optional(),
  timeSpent: z.number().nonnegative().optional(), // milliseconds
  errorMessage: z.string().optional(),
});

export type FormInteraction = z.infer<typeof formInteractionSchema>;

// ============================================================================
// Session Analytics Schemas
// ============================================================================

export const sessionDataSchema = z.object({
  sessionId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().nonnegative().optional(), // seconds
  pageViews: z.number().nonnegative(),
  events: z.number().nonnegative(),
  isEngaged: z.boolean().optional(),
  exitPage: z.string().optional(),
});

export type SessionData = z.infer<typeof sessionDataSchema>;

// ============================================================================
// A/B Testing Schemas
// ============================================================================

export const abTestVariantSchema = z.enum(['control', 'variant_a', 'variant_b', 'variant_c']);

export const abTestEventSchema = z.object({
  testId: z.string(),
  testName: z.string(),
  variant: abTestVariantSchema,
  metric: z.string(),
  value: z.number().optional(),
  timestamp: z.string().datetime(),
});

export type ABTestVariant = z.infer<typeof abTestVariantSchema>;
export type ABTestEvent = z.infer<typeof abTestEventSchema>;

// ============================================================================
// Funnel Analytics Schemas
// ============================================================================

export const funnelStepSchema = z.object({
  funnelName: z.string(),
  stepName: z.string(),
  stepNumber: z.number().int().positive(),
  completed: z.boolean(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type FunnelStep = z.infer<typeof funnelStepSchema>;

// ============================================================================
// Error Tracking Schemas
// ============================================================================

export const errorEventSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  errorInfo: z.record(z.string(), z.unknown()).optional(),
  url: z.string().url(),
  userAgent: z.string().optional(),
  timestamp: z.string().datetime(),
});

export type ErrorEvent = z.infer<typeof errorEventSchema>;

// ============================================================================
// Backend Analytics Payload Schema
// ============================================================================

export const backendAnalyticsPayloadSchema = z.object({
  client_id: z.string(),
  user_id: z.string().optional(),
  events: z.array(z.object({
    name: z.string(),
    params: z.record(z.string(), z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
    ])).optional(),
  })),
  user_properties: z.record(z.string(), z.union([
    z.string(),
    z.number(),
    z.boolean(),
  ])).optional(),
  timestamp_micros: z.string().optional(),
});

export type BackendAnalyticsPayload = z.infer<typeof backendAnalyticsPayloadSchema>;

// ============================================================================
// PostHog Event Schema
// ============================================================================

export const postHogEventSchema = z.object({
  event: z.string(),
  properties: eventPropertiesSchema,
  timestamp: z.string().datetime().optional(),
  distinct_id: z.string().optional(),
});

export type PostHogEvent = z.infer<typeof postHogEventSchema>;
