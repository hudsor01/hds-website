/**
 * Lead Attribution API Endpoint
 * Stores lead attribution data for marketing analytics
 */

import { createServerLogger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import type { LeadAttributionData } from '@/types/analytics';
import type { Database } from '@/types/database';
import type { LeadAttributionRow, LeadAttributionInsert, SupabaseQueryResult } from '@/types/supabase-helpers';
import { type NextRequest, NextResponse } from 'next/server';

const logger = createServerLogger('attribution-api');

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as LeadAttributionData;

    // Validate required fields
    if (!body.email && !body.session_id) {
      return NextResponse.json(
        { error: 'Either email or session_id is required' },
        { status: 400 }
      );
    }

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

    // Store in Supabase
    if (!supabaseAdmin) {
      logger.error('Supabase admin client not available');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if attribution already exists for this email/session
    const { data: existing } = await supabaseAdmin
      .from('lead_attribution')
      .select('id, email, first_visit_at, visit_count')
      .eq(email ? 'email' : 'session_id', (email || session_id) as string)
      .single() as SupabaseQueryResult<Pick<LeadAttributionRow, 'id' | 'email' | 'first_visit_at' | 'visit_count'>>;

    if (existing) {
      // Update last visit time and visit count
      await supabaseAdmin
        .from('lead_attribution')
        .update({
          last_visit_at: new Date().toISOString(),
          visit_count: (existing.visit_count || 0) + 1,
          current_page,
        })
        .eq('id', existing.id);

      logger.info('Updated existing attribution', { id: existing.id });

      return NextResponse.json({
        success: true,
        attribution_id: existing.id,
        first_visit: false,
      });
    }

    // Create new attribution record
    const insertData: LeadAttributionInsert = {
      email: email || '',
      source: source || 'direct',
      medium: medium || 'none',
      campaign: campaign || null,
      term: term || null,
      content: content || null,
      utm_params: utm_params ? (utm_params as unknown as Database['public']['Tables']['lead_attribution']['Row']['utm_params']) : null,
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
      .select()
      .single() as SupabaseQueryResult<LeadAttributionRow>;

    if (error) {
      logger.error('Failed to store attribution', error as Error);
      return NextResponse.json(
        { error: 'Failed to store attribution data' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to create attribution record' },
        { status: 500 }
      );
    }

    logger.info('Stored new attribution', { id: data.id });

    return NextResponse.json({
      success: true,
      attribution_id: data.id,
      first_visit: true,
    });
  } catch (error) {
    logger.error('Attribution API error', error instanceof Error ? error : new Error(String(error)));
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

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
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
        return NextResponse.json(
          { error: 'Attribution not found' },
          { status: 404 }
        );
      }

      logger.error('Failed to retrieve attribution', error);
      return NextResponse.json(
        { error: 'Failed to retrieve attribution data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('Attribution GET error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to retrieve attribution data' },
      { status: 500 }
    );
  }
}
