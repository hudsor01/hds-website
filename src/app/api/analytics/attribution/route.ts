/**
 * Lead Attribution API Endpoint
 * Stores lead attribution data for marketing analytics
 */

import { castError, createServerLogger } from '@/lib/logger';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { leadAttributionRequestSchema, type LeadAttributionRequest } from '@/lib/schemas/api';
import { db } from '@/lib/db';
import { leadAttribution } from '@/lib/schemas/leads';
import { eq } from 'drizzle-orm';
import { type NextRequest } from 'next/server';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';

const logger = createServerLogger('attribution-api');

async function handleAttributionPost(request: NextRequest) {
  try {

    // Parse and validate request body
    const parseResult = leadAttributionRequestSchema.safeParse(await request.json());

    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const body: LeadAttributionRequest = parseResult.data;

    // Extract attribution data
    const {
      source,
      medium,
      campaign,
      term,
      content,
      referrer,
      landing_page,
      current_page,
      session_id,
    } = body;

    logger.info('Attribution data received', {
      source,
      medium,
      campaign,
      session_id,
    });

    // Check if attribution already exists for this session
    try {
      const filterColumn = session_id ? leadAttribution.sessionId : null;
      const filterValue = session_id || null;

      let existing = null;
      if (filterColumn && filterValue) {
        const results = await db
          .select({ id: leadAttribution.id })
          .from(leadAttribution)
          .where(eq(filterColumn, filterValue));
        existing = results[0] ?? null;
      }

      if (existing) {
        logger.info('Updated existing attribution', { id: existing.id });

        return successResponse({
          attribution_id: existing.id,
          first_visit: false,
        });
      }
    } catch (queryError) {
      logger.error('Failed to read existing attribution', castError(queryError));
      return errorResponse('Unable to read existing attribution', 500);
    }

    // Create new attribution record
    try {
      const [data] = await db.insert(leadAttribution).values({
        touchpoint: landing_page || current_page || 'direct',
        channel: medium || 'none',
        source: source || 'direct',
        medium: medium || 'none',
        campaign: campaign || null,
        term: term || null,
        content: content || null,
        referrer: referrer || null,
        landingPage: landing_page || '',
        sessionId: session_id || null,
        isFirstTouch: true,
        isLastTouch: true,
      }).returning({ id: leadAttribution.id });

      if (!data) {
        return errorResponse('Failed to create attribution record', 500);
      }

      logger.info('Stored new attribution', { id: data.id });

      return successResponse({
        attribution_id: data.id,
        first_visit: true,
      });
    } catch (insertError) {
      logger.error('Failed to store attribution', castError(insertError));
      return errorResponse('Failed to store attribution data', 500);
    }
  } catch (error) {
    logger.error('Attribution API error', castError(error));
    return errorResponse('Failed to process attribution data', 500);
  }
}

export const POST = withRateLimit(handleAttributionPost, 'api');

/**
 * GET endpoint for retrieving attribution data
 */
async function handleAttributionGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return errorResponse('session_id parameter is required', 400);
    }

    // Query attribution data
    const results = await db
      .select()
      .from(leadAttribution)
      .where(eq(leadAttribution.sessionId, session_id));

    const data = results[0] ?? null;

    if (!data) {
      return errorResponse('Attribution not found', 404);
    }

    return successResponse({ data });
  } catch (error) {
    logger.error('Attribution GET error', error instanceof Error ? error : new Error(String(error)));
    return errorResponse('Failed to retrieve attribution data', 500);
  }
}

export const GET = withRateLimit(handleAttributionGet, 'readOnlyApi');
