/**
 * API Route Validation Schemas
 *
 * Zod schemas for validating API route inputs and outputs
 */

import { z } from 'zod';
import { emailSchema, nameSchema } from './common';

// ============================================================================
// Lead Magnet API Schemas
// ============================================================================

export const leadMagnetResourceSchema = z.enum([
  'website-performance-checklist',
  'roi-calculator',
  'conversion-optimization-guide',
]);

export const leadMagnetRequestSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  resource: leadMagnetResourceSchema,
});

export const leadMagnetResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  downloadUrl: z.string().url().optional(),
  error: z.string().optional(),
});

export type LeadMagnetRequest = z.infer<typeof leadMagnetRequestSchema>;
export type LeadMagnetResource = z.infer<typeof leadMagnetResourceSchema>;
export type LeadMagnetResponse = z.infer<typeof leadMagnetResponseSchema>;

// ============================================================================
// Time Range Schema (used by analytics APIs)
// ============================================================================

export const timeRangeSchema = z.enum(['24h', '7d', '30d', '90d']);
export type TimeRange = z.infer<typeof timeRangeSchema>;

// ============================================================================
// Cron Job API Schemas
// ============================================================================

export const cronAuthHeaderSchema = z.object({
  authorization: z.string().regex(/^Bearer .+$/, 'Authorization must be Bearer token'),
});

export const cronResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  processed: z.number().optional(),
  errors: z.array(z.string()).optional(),
});

export type CronAuthHeader = z.infer<typeof cronAuthHeaderSchema>;
export type CronResponse = z.infer<typeof cronResponseSchema>;

// ============================================================================
// Webhook Validation Schemas
// ============================================================================

export const webhookSignatureSchema = z.object({
  'x-webhook-signature': z.string().min(1),
  'x-webhook-timestamp': z.string().min(1),
});

// Supabase webhook payload types
export const databaseChangePayloadSchema = z.object({
  type: z.enum(['INSERT', 'UPDATE', 'DELETE']),
  table: z.string(),
  schema: z.string(),
  record: z.record(z.string(), z.unknown()).nullable(),
  old_record: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const authChangePayloadSchema = z.object({
  type: z.enum(['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'USER_DELETED']),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email().optional(),
    role: z.string().optional(),
    created_at: z.string().datetime(),
  }).nullable(),
});

export const storageChangePayloadSchema = z.object({
  type: z.enum(['OBJECT_CREATED', 'OBJECT_UPDATED', 'OBJECT_REMOVED']),
  bucket: z.string(),
  object: z.string(),
  owner: z.string().uuid().optional(),
});

export const supabaseWebhookSchema = z.object({
  type: z.enum(['db_change', 'auth_change', 'storage_change']),
  payload: z.union([
    databaseChangePayloadSchema,
    authChangePayloadSchema,
    storageChangePayloadSchema,
  ]),
});

export type WebhookSignature = z.infer<typeof webhookSignatureSchema>;
export type DatabaseChangePayload = z.infer<typeof databaseChangePayloadSchema>;
export type AuthChangePayload = z.infer<typeof authChangePayloadSchema>;
export type StorageChangePayload = z.infer<typeof storageChangePayloadSchema>;
export type SupabaseWebhook = z.infer<typeof supabaseWebhookSchema>;

// ============================================================================
// Lead Attribution API Schemas
// ============================================================================

// JSON value schema - using z.unknown() since recursive Zod types have inference issues with Json type
const jsonValueSchema = z.unknown();

export const leadAttributionRequestSchema = z.object({
  email: emailSchema.optional(),
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  term: z.string().optional(),
  content: z.string().optional(),
  utm_params: z.record(z.string(), jsonValueSchema).optional(),
  referrer: z.string().url().optional(),
  landing_page: z.string().url().optional(),
  current_page: z.string().url().optional(),
  session_id: z.string().min(8).optional(),
  device_type: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
}).refine(
  (data) => Boolean(data.email || data.session_id),
  { message: 'Either email or session_id is required', path: ['email'] }
);

export type LeadAttributionRequest = z.infer<typeof leadAttributionRequestSchema>;

// ============================================================================
// CSRF Token Schemas
// ============================================================================

export const csrfTokenResponseSchema = z.object({
  token: z.string().min(32),
  expiresAt: z.number().positive(),
});

export type CsrfTokenResponse = z.infer<typeof csrfTokenResponseSchema>;
