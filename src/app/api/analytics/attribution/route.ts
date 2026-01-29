/**
 * Lead Attribution API Endpoint
 * Stores lead attribution data for marketing analytics
 */

import { castError, createServerLogger } from '@/lib/logger';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { leadAttributionRequestSchema, type LeadAttributionRequest } from '@/lib/schemas/api';
import type { Json } from '@/types/database';
import type { LeadAttributionInsert } from '@/types/supabase-helpers';
import { supabaseAdmin } from '@/lib/supabase';
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
      email,
      source,
      medium,
      campaign,
      term,
      content,
      utm_params,
      referrer,
      landing_page,
      current_page,
      session_id,
      device_type,
      browser,
      os,
    } = body;

    logger.info('Attribution data received', {
      email,
      source,
      medium,
      campaign,
      session_id,
    });

    // Check if attribution already exists for this email/session
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('lead_attribution')
      .select('id, email, first_visit_at, visit_count')
      .eq(email ? 'email' : 'session_id', (email ?? session_id) as string)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error('Failed to read existing attribution', castError(existingError));
      return errorResponse('Unable to read existing attribution', 500);
    }

    if (existing) {
      // Update last visit time and visit count
      const { error: updateError } = await supabaseAdmin
        .from('lead_attribution')
        .update({
          last_visit_at: new Date().toISOString(),
          visit_count: (existing.visit_count || 0) + 1,
          current_page,
        })
        .eq('id', existing.id);

      if (updateError) {
        logger.error('Failed to update attribution', castError(updateError));
      }

      logger.info('Updated existing attribution', { id: existing.id });

      return successResponse({
        attribution_id: existing.id,
        first_visit: false,
      });
    }

    // Create new attribution record
    const insertData: LeadAttributionInsert = {
      email: email || 'anonymous@unknown.local',
      source: source || 'direct',
      medium: medium || 'none',
      campaign: campaign || null,
      term: term || null,
      content: content || null,
      utm_params: (utm_params ?? null) as Json | null,
      referrer: referrer || null,
      landing_page: landing_page || '',
      current_page: current_page || null,
      session_id: session_id || null,
      device_type: device_type || null,
      browser: browser || null,
      os: os || null,
      first_visit_at: new Date().toISOString(),
      last_visit_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('lead_attribution')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      logger.error('Failed to store attribution', error as Error);
      return errorResponse('Failed to store attribution data', 500);
    }

    if (!data) {
      return errorResponse('Failed to create attribution record', 500);
    }

    logger.info('Stored new attribution', { id: data.id });

    return successResponse({
      attribution_id: data.id,
      first_visit: true,
    });
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
    const email = searchParams.get('email');
    const session_id = searchParams.get('session_id');

    if (!email && !session_id) {
      return errorResponse('Either email or session_id parameter is required', 400);
    }

    // Query attribution data
    const query = supabaseAdmin
      .from('lead_attribution')
      .select('*');

    if (email) {
      query.eq('email', email);
    } else if (session_id) {
      query.eq('session_id', session_id);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return errorResponse('Attribution not found', 404);
      }

      logger.error('Failed to retrieve attribution', error as Error);
      return errorResponse('Failed to retrieve attribution data', 500);
    }

    return successResponse({ data });
  } catch (error) {
    logger.error('Attribution GET error', error instanceof Error ? error : new Error(String(error)));
    return errorResponse('Failed to retrieve attribution data', 500);
  }
}

export const GET = withRateLimit(handleAttributionGet, 'readOnlyApi');
