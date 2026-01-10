/**
 * Lead Update API
 * Handles updating lead status (contacted, converted)
 */

import { type NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
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
    return errorResponse('Too many requests', 429);
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    

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
    const { data, error } = await (await createClient())
      .from('calculator_leads')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update lead:', error as Error);
      return errorResponse('Failed to update lead', 500);
    }

    return successResponse({ lead: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Lead update error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}
