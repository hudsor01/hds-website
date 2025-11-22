/**
 * Email Scheduling and Processing Validation Schemas
 *
 * Zod schemas for validating email sequences, scheduled emails, and email templates
 */

import { z } from 'zod';
import { emailSchema, nameSchema } from './common';

// ============================================================================
// Email Sequence Schemas
// ============================================================================

export const emailSequenceIdSchema = z.enum([
  'standard-welcome',
  'standard-consultation-followup',
  'standard-long-term-nurture',
  'standard-high-intent',
]);

export type EmailSequenceId = z.infer<typeof emailSequenceIdSchema>;

export const emailTemplateVariablesSchema = z.record(z.string(), z.string());

export const scheduleEmailParamsSchema = z.object({
  recipientEmail: emailSchema,
  recipientName: nameSchema,
  sequenceId: emailSequenceIdSchema,
  variables: emailTemplateVariablesSchema,
});

export type ScheduleEmailParams = z.infer<typeof scheduleEmailParamsSchema>;

// ============================================================================
// Scheduled Email Schemas
// ============================================================================

export const emailStatusSchema = z.enum(['pending', 'sent', 'failed']);

export const scheduledEmailSchema = z.object({
  id: z.string().min(1),
  recipientEmail: emailSchema,
  recipientName: nameSchema,
  sequenceId: emailSequenceIdSchema,
  stepId: z.string(),
  scheduledFor: z.date(),
  variables: emailTemplateVariablesSchema,
  status: emailStatusSchema,
  createdAt: z.date(),
  sentAt: z.date().optional(),
  error: z.string().optional(),
});

export type ScheduledEmail = z.infer<typeof scheduledEmailSchema>;

// ============================================================================
// Email Processing Schemas
// ============================================================================

export const emailQueueStatsSchema = z.object({
  pending: z.number().nonnegative(),
  sent: z.number().nonnegative(),
  failed: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export type EmailQueueStats = z.infer<typeof emailQueueStatsSchema>;

export const emailProcessResultSchema = z.object({
  success: z.boolean(),
  processed: z.number().nonnegative(),
  errors: z.number().nonnegative(),
});

export type EmailProcessResult = z.infer<typeof emailProcessResultSchema>;

// ============================================================================
// Email Cancellation Schemas
// ============================================================================

export const cancelEmailSequenceParamsSchema = z.object({
  recipientEmail: emailSchema,
  sequenceId: emailSequenceIdSchema.optional(),
});

export type CancelEmailSequenceParams = z.infer<typeof cancelEmailSequenceParamsSchema>;

// ============================================================================
// Email Content Schemas
// ============================================================================

export const emailTemplateSchema = z.object({
  subject: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
});

export type EmailTemplate = z.infer<typeof emailTemplateSchema>;

export const processedEmailSchema = z.object({
  from: z.string().email(),
  to: z.array(z.string().email()).min(1),
  subject: z.string().min(1).max(998), // RFC 2822 recommended maximum
  html: z.string().min(1),
  text: z.string().optional(),
});

export type ProcessedEmail = z.infer<typeof processedEmailSchema>;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate email scheduling parameters
 */
export function validateScheduleEmailParams(params: unknown) {
  return scheduleEmailParamsSchema.safeParse(params);
}

/**
 * Validate scheduled email structure
 */
export function validateScheduledEmail(email: unknown) {
  return scheduledEmailSchema.safeParse(email);
}

/**
 * Validate email cancellation parameters
 */
export function validateCancelEmailParams(params: unknown) {
  return cancelEmailSequenceParamsSchema.safeParse(params);
}

/**
 * Validate email queue stats
 */
export function validateEmailQueueStats(stats: unknown) {
  return emailQueueStatsSchema.safeParse(stats);
}
