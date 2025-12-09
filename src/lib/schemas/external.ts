/**
 * External Service Validation Schemas
 *
 * Zod schemas for validating external API requests and responses
 * (Resend, Discord, etc.)
 */

import { z } from 'zod';
import { emailSchema } from './common';

// ============================================================================
// Resend Email API Schemas
// ============================================================================

export const resendEmailRequestSchema = z.object({
  from: emailSchema,
  to: z.union([emailSchema, z.array(emailSchema)]),
  subject: z.string().min(1).max(998), // RFC 2822 limit
  html: z.string().optional(),
  text: z.string().optional(),
  cc: z.union([emailSchema, z.array(emailSchema)]).optional(),
  bcc: z.union([emailSchema, z.array(emailSchema)]).optional(),
  reply_to: z.union([emailSchema, z.array(emailSchema)]).optional(),
  tags: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(), // base64 encoded
    content_type: z.string().optional(),
  })).optional(),
}).refine(
  data => data.html || data.text,
  { message: 'Either html or text content must be provided' }
);

export const resendEmailResponseSchema = z.object({
  id: z.string().uuid(),
  from: z.string().email(),
  to: z.array(z.string().email()),
  created_at: z.string().datetime(),
});

export const resendErrorResponseSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  name: z.string(),
});

export type ResendEmailRequest = z.infer<typeof resendEmailRequestSchema>;
export type ResendEmailResponse = z.infer<typeof resendEmailResponseSchema>;
export type ResendErrorResponse = z.infer<typeof resendErrorResponseSchema>;

// ============================================================================
// Discord Webhook Schemas
// ============================================================================

export const discordColorSchema = z.number().int().min(0).max(16777215); // 0x000000 to 0xFFFFFF

export const discordEmbedFieldSchema = z.object({
  name: z.string().max(256),
  value: z.string().max(1024),
  inline: z.boolean().optional(),
});

export const discordEmbedFooterSchema = z.object({
  text: z.string().max(2048),
  icon_url: z.string().url().optional(),
});

export const discordEmbedAuthorSchema = z.object({
  name: z.string().max(256),
  url: z.string().url().optional(),
  icon_url: z.string().url().optional(),
});

export const discordEmbedSchema = z.object({
  title: z.string().max(256).optional(),
  description: z.string().max(4096).optional(),
  url: z.string().url().optional(),
  color: discordColorSchema.optional(),
  fields: z.array(discordEmbedFieldSchema).max(25).optional(),
  footer: discordEmbedFooterSchema.optional(),
  timestamp: z.string().datetime().optional(),
  author: discordEmbedAuthorSchema.optional(),
  thumbnail: z.object({
    url: z.string().url(),
  }).optional(),
  image: z.object({
    url: z.string().url(),
  }).optional(),
});

export const discordWebhookRequestSchema = z.object({
  content: z.string().max(2000).optional(),
  username: z.string().max(80).optional(),
  avatar_url: z.string().url().optional(),
  embeds: z.array(discordEmbedSchema).max(10).optional(),
}).refine(
  data => data.content || (data.embeds && data.embeds.length > 0),
  { message: 'Either content or embeds must be provided' }
);

// Discord webhooks return HTTP 204 No Content on success, or error details
export const discordWebhookErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  errors: z.record(z.string(), z.unknown()).optional(),
});

export type DiscordColor = z.infer<typeof discordColorSchema>;
export type DiscordEmbedField = z.infer<typeof discordEmbedFieldSchema>;
export type DiscordEmbed = z.infer<typeof discordEmbedSchema>;
export type DiscordWebhookRequest = z.infer<typeof discordWebhookRequestSchema>;
export type DiscordWebhookError = z.infer<typeof discordWebhookErrorSchema>;


// ============================================================================
// Cal.com Integration Schemas (if needed)
// ============================================================================

export const calComBookingSchema = z.object({
  id: z.number(),
  uid: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  attendees: z.array(z.object({
    email: emailSchema,
    name: z.string(),
    timeZone: z.string(),
  })),
  location: z.string().optional(),
  status: z.enum(['ACCEPTED', 'PENDING', 'CANCELLED', 'REJECTED']),
});

export type CalComBooking = z.infer<typeof calComBookingSchema>;
