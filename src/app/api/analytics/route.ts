/**
 * Analytics API Endpoint
 * Receives and processes analytics events from the client
 */

import { env } from '@/env';
import { castError, createServerLogger } from '@/lib/logger';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { db } from '@/lib/db';
import { customEvents } from '@/lib/schemas/analytics';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';

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

async function handleAnalyticsPost(request: NextRequest) {
  try {
    // Parse request body with strict schema
    const parseResult = analyticsEventSchema.safeParse(await request.json());

    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const { eventName, properties, timestamp, sessionId, userId } = parseResult.data;
    const eventCategory = typeof properties.category === 'string' ? properties.category : 'general';
    const eventLabel = typeof properties.label === 'string' ? properties.label : null;
    const eventValue = typeof properties.value === 'number' ? properties.value : null;
    const metadata = (properties ?? {}) as Record<string, unknown>;

    // Log the event
    logger.info('Analytics event received', {
      eventName,
      properties,
      sessionId,
      userId,
      timestamp: timestamp || Date.now(),
    });

    // Store in database
    try {
      await db.insert(customEvents).values({
        eventName,
        category: eventCategory,
        label: eventLabel,
        value: eventValue !== null ? String(eventValue) : null,
        sessionId: sessionId || null,
        userId: userId || null,
        properties: metadata,
        timestamp: new Date(timestamp || Date.now()),
      });
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

    return successResponse();
  } catch (error) {
    logger.error('Analytics API error', castError(error));
    return errorResponse('Failed to process analytics event', 500);
  }
}

export const POST = withRateLimit(handleAnalyticsPost, 'api');

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
