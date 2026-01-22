/**
 * Analytics API Endpoint
 * Receives and processes analytics events from the client
 */

import { db } from '@/lib/db';
import { customEvents, type NewCustomEvent } from '@/lib/schema';
import { env } from '@/env';
import { createServerLogger } from '@/lib/logger';
import { castError } from '@/lib/utils/errors';
import { getClientIp, unifiedRateLimiter } from '@/lib/rate-limiter';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const logger = createServerLogger('analytics-api');

// JSON value schema for analytics properties
// Using z.unknown() and casting since recursive Zod types have inference issues
const jsonValueSchema = z.unknown();

const analyticsEventSchema = z.object({
  eventName: z.string().min(1, 'eventName is required'),
  properties: z.record(z.string(), jsonValueSchema).default({}),
  timestamp: z.number().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Analytics rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    // Parse request body with strict schema
    const parseResult = analyticsEventSchema.safeParse(await request.json());

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid analytics payload', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { eventName, properties, timestamp, sessionId, userId } = parseResult.data;
    const eventCategory = typeof properties.category === 'string' ? properties.category : 'general';
    const eventLabel = typeof properties.label === 'string' ? properties.label : null;
    const eventValue = typeof properties.value === 'number' ? String(properties.value) : null;

    // Log the event
    logger.info('Analytics event received', {
      eventName,
      properties,
      sessionId,
      userId,
      timestamp: timestamp || Date.now(),
    });

    // Store in database using Drizzle
    try {
      const insertPayload: NewCustomEvent = {
        eventName,
        category: eventCategory,
        label: eventLabel,
        value: eventValue,
        sessionId: sessionId || null,
        userId: userId || null,
        properties: properties ?? {},
        timestamp: new Date(timestamp || Date.now()),
      };

      await db.insert(customEvents).values(insertPayload);
    } catch (dbError) {
      // Don't fail the request if database insert fails
      logger.error('Failed to store analytics event in database', castError(dbError));
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
    logger.error('Analytics API error', castError(error));
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
