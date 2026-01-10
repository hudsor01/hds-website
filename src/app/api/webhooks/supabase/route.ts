/**
 * Supabase Webhook Handler
 * Processes database events and triggers for real-time updates
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { createServerLogger } from '@/lib/logger';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import {
    authChangePayloadSchema,
    databaseChangePayloadSchema,
    storageChangePayloadSchema,
    type AuthChangePayload,
    type DatabaseChangePayload,
    type StorageChangePayload,
} from '@/lib/schemas/api';
import {
    eventDataSchema,
    leadDataSchema,
} from '@/lib/schemas/supabase';
import type { Json } from '@/types/database';
import { supabaseAdmin } from '@/lib/supabase';
import { isValidHexString } from '@/lib/utils';
import { headers } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Verify webhook signature using HMAC-SHA256.
 * Returns true if signature is valid, false otherwise.
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    // Validate signature is a valid hex string before processing
    // This prevents silent truncation when Buffer.from encounters non-hex chars
    if (!isValidHexString(signature)) {
      return false;
    }

    // Generate expected signature
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    // Ensure buffers are same length before comparison
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

async function triggerWebhook(eventType: string, payload: unknown) {
  // Log webhook trigger and optionally notify external services
  const payloadData = (payload ?? {}) as Json;

  await supabaseAdmin
    .from('webhook_logs')
    .insert({
      event_type: eventType,
      payload: payloadData,
      triggered_at: new Date().toISOString(),
    });
}

const logger = createServerLogger('supabase-webhook')

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const signature = headersList.get('x-supabase-signature')
    const eventType = headersList.get('x-supabase-event-type')

    logger.info('Supabase webhook received', {
      eventType,
      hasSignature: !!signature,
      timestamp: new Date().toISOString(),
    })

    // Verify webhook signature exists
    if (!signature) {
      logger.warn('Missing webhook signature')
      return errorResponse('Missing signature', 401)
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET
    if (!webhookSecret) {
      logger.error('SUPABASE_WEBHOOK_SECRET not configured')
      return errorResponse('Webhook not configured', 500)
    }

    // Read raw body for signature verification
    const rawBody = await request.text()

    // Verify signature cryptographically using HMAC-SHA256
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      logger.warn('Invalid webhook signature - possible forgery attempt')
      return errorResponse('Invalid signature', 401)
    }

    // Validate event type
    const validEventTypes = ['db_change', 'auth_change', 'storage_change']
    if (!eventType || !validEventTypes.includes(eventType)) {
      logger.warn('Invalid or missing event type', { eventType })
      return errorResponse('Invalid event type', 400)
    }

    // Parse JSON from already-read body
    const rawPayload = JSON.parse(rawBody)

    // Validate payload based on event type
    let validatedPayload
    switch (eventType) {
      case 'db_change':
        validatedPayload = databaseChangePayloadSchema.safeParse(rawPayload)
        if (!validatedPayload.success) {
          logger.error('Invalid database change payload', {
            errors: validatedPayload.error.issues,
            payload: rawPayload,
          })
          return validationErrorResponse(validatedPayload.error)
        }
        await handleDatabaseChange(validatedPayload.data)
        break

      case 'auth_change':
        validatedPayload = authChangePayloadSchema.safeParse(rawPayload)
        if (!validatedPayload.success) {
          logger.error('Invalid auth change payload', {
            errors: validatedPayload.error.issues,
            payload: rawPayload,
          })
          return validationErrorResponse(validatedPayload.error)
        }
        await handleAuthChange(validatedPayload.data)
        break

      case 'storage_change':
        validatedPayload = storageChangePayloadSchema.safeParse(rawPayload)
        if (!validatedPayload.success) {
          logger.error('Invalid storage change payload', {
            errors: validatedPayload.error.issues,
            payload: rawPayload,
          })
          return validationErrorResponse(validatedPayload.error)
        }
        await handleStorageChange(validatedPayload.data)
        break
    }

    logger.info('Processing webhook payload', {
      eventType,
      recordId: rawPayload.record?.id,
      table: rawPayload.table,
      type: rawPayload.type,
    })

    // Trigger any downstream webhooks
    await triggerWebhook(eventType, rawPayload)

    logger.info('Webhook processed successfully', { eventType })
    return successResponse()

  } catch (error) {
    logger.error('Webhook processing failed', error instanceof Error ? error : new Error(String(error)))
    return errorResponse('Webhook processing failed', 500)
  }
}

async function handleDatabaseChange(payload: DatabaseChangePayload) {
  const { table, type, record, old_record } = payload

  logger.info('Database change detected', {
    table,
    type,
    recordId: record?.id,
  })

  // Validate record data if present
  if (!record) {
    logger.warn('Database change payload missing record data', { table, type })
    return
  }

  // Handle specific table changes
  switch (table) {
    case 'leads':
      if (type === 'INSERT') {
        const leadValidation = leadDataSchema.safeParse(record)
        if (leadValidation.success) {
          await handleNewLead(leadValidation.data)
        } else {
          logger.error('Invalid lead data', {
            errors: leadValidation.error.issues,
            record,
          })
        }
      } else if (type === 'UPDATE' && old_record) {
        const leadValidation = leadDataSchema.safeParse(record)
        if (leadValidation.success) {
          await handleLeadUpdate(leadValidation.data, old_record)
        }
      }
      break

    case 'custom_events':
      if (type === 'INSERT') {
        const eventValidation = eventDataSchema.safeParse(record)
        if (eventValidation.success) {
          await handleNewEvent(eventValidation.data)
        } else {
          logger.error('Invalid event data', {
            errors: eventValidation.error.issues,
            record,
          })
        }
      }
      break

    case 'api_logs':
      if (type === 'INSERT' && record.error_message) {
        await handleErrorLog(record)
      }
      break
  }
}

async function handleAuthChange(payload: AuthChangePayload) {
  const { user, type } = payload

  logger.info('Auth change detected', {
    userId: user?.id,
    eventType: type,
  })

  // Handle user authentication events based on type
  switch (type) {
    case 'SIGNED_IN':
      // Could trigger analytics, session logging
      break
    case 'SIGNED_OUT':
      // Could trigger session cleanup
      break
    case 'USER_UPDATED':
      // Could trigger profile update notifications
      break
    case 'USER_DELETED':
      // Could trigger cleanup, export data
      break
  }
}

async function handleStorageChange(payload: StorageChangePayload) {
  const { bucket, object, type } = payload

  logger.info('Storage change detected', {
    bucket,
    object,
    eventType: type,
  })

  // Handle file uploads, processing based on type
  switch (type) {
    case 'OBJECT_CREATED':
      // Could trigger file processing, thumbnail generation
      break
    case 'OBJECT_UPDATED':
      // Could trigger reprocessing
      break
    case 'OBJECT_REMOVED':
      // Could trigger cleanup
      break
  }
}

async function handleNewLead(lead: { email: string; first_name: string; source?: string | undefined; company?: string | undefined }) {
  logger.info('New lead created', {
    email: lead.email,
    name: lead.first_name,
    source: lead.source,
  })

  // Could trigger email sequences, notifications, etc.
  // Example: scheduleEmailSequence(lead.email, lead.first_name, 'welcome', {})
}

async function handleLeadUpdate(lead: { email: string; first_name: string; score?: number | undefined }, oldLead: Record<string, unknown>) {
  logger.info('Lead updated', {
    email: lead.email,
    scoreChanged: lead.score !== oldLead.score,
  })

  // Handle lead status changes, score updates, etc.
  // Example: If score increased significantly, trigger high-intent notification
}

async function handleNewEvent(event: { name: string; category?: string | undefined; session_id?: string | undefined }) {
  logger.info('New custom event logged', {
    eventName: event.name,
    category: event.category,
    sessionId: event.session_id,
  })

  // Could trigger real-time analytics updates
  // Example: Update real-time dashboards, trigger automations
}

async function handleErrorLog(log: Record<string, unknown>) {
  logger.error('Error logged in database', {
    endpoint: log.endpoint,
    method: log.method,
    statusCode: log.status_code,
    errorMessage: log.error_message,
  })

  // Could trigger alerts, notifications, etc.
  // Example: Send to error tracking service, create incident if critical
}
