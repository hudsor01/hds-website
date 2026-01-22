/**
 * Lead Attribution API Endpoint
 * Stores lead attribution data for marketing analytics
 */

import { db } from '@/lib/db';
import { leadAttribution, type NewLeadAttribution } from '@/lib/schema';
import { eq, or } from 'drizzle-orm';
import { createServerLogger } from '@/lib/logger';
import { castError } from '@/lib/utils/errors';
import { getClientIp, unifiedRateLimiter } from '@/lib/rate-limiter';
import { leadAttributionRequestSchema, type LeadAttributionRequest } from '@/lib/schemas/api';
import { type NextRequest, NextResponse } from 'next/server';

const logger = createServerLogger('attribution-api');

export async function POST(request: NextRequest) {
  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Attribution rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    // Parse and validate request body
    const parseResult = leadAttributionRequestSchema.safeParse(await request.json());

    if (!parseResult.success) {
      const issues = parseResult.error.flatten();
      return NextResponse.json(
        { error: 'Invalid attribution payload', details: issues.fieldErrors },
        { status: 400 }
      );
    }

    const body: LeadAttributionRequest = parseResult.data;

    // Extract attribution data
    const {
      email,
      source,
      medium,
      campaign,
      term,
      content,
      referrer,
      landing_page,
      session_id,
    } = body;

    logger.info('Attribution data received', {
      email,
      source,
      medium,
      campaign,
      session_id,
    });

    // Check if attribution already exists for this email/session
    // Build the where condition based on what we have
    const whereCondition = email
      ? eq(leadAttribution.sessionId, email)
      : session_id
        ? eq(leadAttribution.sessionId, session_id)
        : null;

    if (!whereCondition) {
      return NextResponse.json(
        { error: 'Either email or session_id is required' },
        { status: 400 }
      );
    }

    let existing: typeof leadAttribution.$inferSelect | undefined;
    try {
      const results = await db
        .select({
          id: leadAttribution.id,
          sessionId: leadAttribution.sessionId,
          timestamp: leadAttribution.timestamp,
        })
        .from(leadAttribution)
        .where(
          or(
            email ? eq(leadAttribution.sessionId, email) : undefined,
            session_id ? eq(leadAttribution.sessionId, session_id) : undefined
          )
        )
        .limit(1);

      existing = results[0] as typeof leadAttribution.$inferSelect | undefined;
    } catch (readError) {
      logger.error('Failed to read existing attribution', castError(readError));
      return NextResponse.json(
        { error: 'Unable to read existing attribution' },
        { status: 500 }
      );
    }

    if (existing) {
      // Update last visit time - in the new schema we update the timestamp
      try {
        await db
          .update(leadAttribution)
          .set({
            timestamp: new Date(),
          })
          .where(eq(leadAttribution.id, existing.id));
      } catch (updateError) {
        logger.error('Failed to update attribution', castError(updateError));
      }

      logger.info('Updated existing attribution', { id: existing.id });

      return NextResponse.json({
        success: true,
        attribution_id: existing.id,
        first_visit: false,
      });
    }

    // Create new attribution record
    const insertData: NewLeadAttribution = {
      sessionId: session_id || null,
      touchpoint: landing_page || 'direct',
      channel: medium || 'direct',
      source: source || 'direct',
      medium: medium || 'none',
      campaign: campaign || null,
      term: term || null,
      content: content || null,
      referrer: referrer || null,
      landingPage: landing_page || '',
      isFirstTouch: true,
      isLastTouch: true,
      timestamp: new Date(),
    };

    const result = await db
      .insert(leadAttribution)
      .values(insertData)
      .returning({ id: leadAttribution.id });

    if (!result[0]) {
      return NextResponse.json(
        { error: 'Failed to create attribution record' },
        { status: 500 }
      );
    }

    logger.info('Stored new attribution', { id: result[0].id });

    return NextResponse.json({
      success: true,
      attribution_id: result[0].id,
      first_visit: true,
    });
  } catch (error) {
    logger.error('Attribution API error', castError(error));
    return NextResponse.json(
      { error: 'Failed to process attribution data' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for retrieving attribution data
 */
export async function GET(request: NextRequest) {
  // Rate limiting - 100 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'readOnlyApi');
  if (!isAllowed) {
    logger.warn('Attribution GET rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const session_id = searchParams.get('session_id');

    if (!email && !session_id) {
      return NextResponse.json(
        { error: 'Either email or session_id parameter is required' },
        { status: 400 }
      );
    }

    // Query attribution data
    const whereCondition = email
      ? eq(leadAttribution.sessionId, email)
      : eq(leadAttribution.sessionId, session_id!);

    const results = await db
      .select()
      .from(leadAttribution)
      .where(whereCondition)
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Attribution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: results[0] });
  } catch (error) {
    logger.error('Attribution GET error', castError(error));
    return NextResponse.json(
      { error: 'Failed to retrieve attribution data' },
      { status: 500 }
    );
  }
}
