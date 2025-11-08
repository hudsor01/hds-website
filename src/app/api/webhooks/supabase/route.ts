/**
 * Supabase Webhook Handler
 * Processes database events and triggers for real-time updates
 */

import { type NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createServerLogger } from '@/lib/logger'
import { triggerWebhook } from '@/lib/supabase'
import { env } from '@/env'

const logger = createServerLogger('supabase-webhook')

/**
 * Verify webhook signature using HMAC SHA-256
 * Uses Web Crypto API for Edge Runtime compatibility
 */
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(payload)

  // Import the secret key
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  // Sign the message
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData)

  // Convert to hex string
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(computedSignature, signature)
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

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
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Get webhook secret
    const webhookSecret = env.SUPABASE_WEBHOOK_SECRET
    if (!webhookSecret) {
      logger.error('SUPABASE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook verification not configured' },
        { status: 500 }
      )
    }

    // Get raw body for signature verification
    const rawBody = await request.text()
    const isValidSignature = await verifyWebhookSignature(
      rawBody,
      signature,
      webhookSecret
    )

    if (!isValidSignature) {
      logger.warn('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse payload after signature verification
    const payload = JSON.parse(rawBody)

    logger.info('Processing webhook payload', {
      eventType,
      recordId: payload.record?.id,
      table: payload.table,
      type: payload.type,
    })

    // Handle different event types
    switch (eventType) {
      case 'db_change':
        await handleDatabaseChange(payload)
        break

      case 'auth_change':
        await handleAuthChange(payload)
        break

      case 'storage_change':
        await handleStorageChange(payload)
        break

      default:
        logger.warn('Unknown webhook event type', { eventType })
    }

    // Trigger any downstream webhooks
    await triggerWebhook(eventType || 'unknown', payload)

    logger.info('Webhook processed successfully', { eventType })
    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Webhook processing failed', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleDatabaseChange(payload: Record<string, unknown>) {
  const { table, type, record, old_record } = payload

  // Type assertions for payload properties
  const tableStr = table as string
  const typeStr = type as string
  const recordObj = record as Record<string, unknown>
  const oldRecordObj = old_record as Record<string, unknown>

  logger.info('Database change detected', {
    table: tableStr,
    type: typeStr,
    recordId: recordObj?.id,
  })

  // Handle specific table changes
  switch (tableStr) {
    case 'leads':
      if (typeStr === 'INSERT') {
        await handleNewLead(recordObj)
      } else if (typeStr === 'UPDATE') {
        await handleLeadUpdate(recordObj, oldRecordObj)
      }
      break

    case 'custom_events':
      if (typeStr === 'INSERT') {
        await handleNewEvent(recordObj)
      }
      break

    case 'api_logs':
      if (typeStr === 'INSERT' && recordObj.error_message) {
        await handleErrorLog(recordObj)
      }
      break
  }
}

async function handleAuthChange(payload: Record<string, unknown>) {
  const user = payload.user as Record<string, unknown> | undefined
  logger.info('Auth change detected', {
    userId: user?.id,
    eventType: payload.event,
  })

  // Handle user authentication events
  // Could trigger welcome emails, analytics, etc.
}

async function handleStorageChange(payload: Record<string, unknown>) {
  logger.info('Storage change detected', {
    bucket: payload.bucket,
    object: payload.object,
    eventType: payload.event,
  })

  // Handle file uploads, processing, etc.
}

async function handleNewLead(lead: Record<string, unknown>) {
  logger.info('New lead created', {
    leadId: lead.id,
    email: lead.email,
    source: lead.source,
  })

  // Could trigger email sequences, notifications, etc.
}

async function handleLeadUpdate(lead: Record<string, unknown>, oldLead: Record<string, unknown>) {
  logger.info('Lead updated', {
    leadId: lead.id,
    statusChanged: lead.status !== oldLead.status,
    scoreChanged: lead.lead_score !== oldLead.lead_score,
  })

  // Handle lead status changes, score updates, etc.
}

async function handleNewEvent(event: Record<string, unknown>) {
  logger.info('New custom event logged', {
    eventName: event.event_name,
    category: event.event_category,
    sessionId: event.session_id,
  })

  // Could trigger real-time analytics updates
}

async function handleErrorLog(log: Record<string, unknown>) {
  logger.error('Error logged in database', {
    endpoint: log.endpoint,
    method: log.method,
    statusCode: log.status_code,
    errorMessage: log.error_message,
  })

  // Could trigger alerts, notifications, etc.
}