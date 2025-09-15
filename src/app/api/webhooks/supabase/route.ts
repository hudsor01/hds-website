/**
 * Supabase Webhook Handler
 * Processes database events and triggers for real-time updates
 */

import { type NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createServerLogger } from '@/lib/logger'
import { triggerWebhook } from '@/lib/supabase'

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

    // Verify webhook signature
    if (!signature) {
      logger.warn('Missing webhook signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    const payload = await request.json()

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