/**
 * Lead Update API
 * Handles updating lead status (contacted, converted)
 */

import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { z } from 'zod';

const UpdateLeadSchema = z.object({
  contacted: z.boolean().optional(),
  converted: z.boolean().optional(),
  conversion_value: z.number().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting - 5 requests per minute per IP for write operations
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactFormApi');
  if (!isAllowed) {
    logger.warn('Lead update rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = UpdateLeadSchema.parse(body);

    // Build update object
    const updates: Record<string, unknown> = {};

    if (validatedData.contacted !== undefined) {
      updates.contacted = validatedData.contacted;
      if (validatedData.contacted) {
        updates.contacted_at = new Date().toISOString();
      }
    }

    if (validatedData.converted !== undefined) {
      updates.converted = validatedData.converted;
      if (validatedData.converted) {
        updates.converted_at = new Date().toISOString();
        if (validatedData.conversion_value) {
          updates.conversion_value = validatedData.conversion_value;
        }
      }
    }

    if (validatedData.notes !== undefined) {
      updates.notes = validatedData.notes;
    }

    // Update lead in database
    const { data, error } = await supabaseAdmin
      .from('calculator_leads')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update lead:', error as Error);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lead: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Lead update error:', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
