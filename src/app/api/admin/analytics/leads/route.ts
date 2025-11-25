/**
 * Admin Analytics Leads API
 * Returns detailed lead information with filtering
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { createServerLogger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

const logger = createServerLogger('analytics-leads-api');

export async function GET(request: NextRequest) {
  await connection(); // Force dynamic rendering

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const quality = searchParams.get('quality'); // hot, warm, cold
    const calculatorType = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from('calculator_leads')
      .select('*');

    // Apply filters
    if (quality) {
      query = query.eq('lead_quality', quality);
    }

    if (calculatorType) {
      query = query.eq('calculator_type', calculatorType);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply limit
    query = query.limit(limit);

    const { data: leads, error } = await query;

    if (error) {
      logger.error('Failed to fetch leads', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    // Enrich leads with attribution data
    const enrichedLeads = await Promise.all(
      (leads || []).map(async (lead) => {
        // Get attribution data
        const { data: attribution } = await supabaseAdmin
          .from('lead_attribution')
          .select('*')
          .eq('email', lead.email)
          .single();

        return {
          ...lead,
          attribution: attribution || null,
        };
      })
    );

    logger.info('Leads fetched', { count: enrichedLeads.length, quality, calculatorType });

    return NextResponse.json({
      leads: enrichedLeads,
      count: enrichedLeads.length,
      filters: { quality, calculatorType, sortBy, sortOrder },
    });
  } catch (error) {
    logger.error('Analytics leads error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
