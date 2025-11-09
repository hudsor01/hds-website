/**
 * Analytics API Endpoint
 * Receives and processes analytics events from the client
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createServerLogger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { env } from '@/env';

const logger = createServerLogger('analytics-api');

interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  sessionId?: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as AnalyticsEvent;
    const { eventName, properties, timestamp, sessionId, userId } = body;

    if (!eventName) {
      return NextResponse.json(
        { error: 'eventName is required' },
        { status: 400 }
      );
    }

    // Log the event
    logger.info('Analytics event received', {
      eventName,
      properties,
      sessionId,
      userId,
      timestamp: timestamp || Date.now(),
    });

    // Store in Supabase if available
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('custom_events').insert({
          event_name: eventName,
          event_category: properties?.category as string || 'general',
          event_label: properties?.label as string || null,
          event_value: properties?.value as number || null,
          session_id: sessionId || null,
          user_id: userId || null,
          metadata: properties || {},
          timestamp: new Date(timestamp || Date.now()).toISOString(),
        });
      } catch (dbError) {
        // Don't fail the request if database insert fails
        logger.error('Failed to store analytics event in database', dbError as Error);
      }
    }

    // Track critical events
    if (['form_submission', 'lead_captured', 'conversion'].includes(eventName)) {
      logger.info('Critical event tracked', {
        eventName,
        properties,
        environment: env.NODE_ENV,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Analytics API error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': env.NODE_ENV === 'production'
        ? 'https://hudsondigitalsolutions.com'
        : '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
