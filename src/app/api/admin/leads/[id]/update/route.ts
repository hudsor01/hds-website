/**
 * Lead Update API
 * Handles updating lead status (contacted, converted)
 */

import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { calculatorLeads } from '@/lib/schema';
import { eq } from 'drizzle-orm';
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
    const body = await request.json();

    // Validate input
    const validatedData = UpdateLeadSchema.parse(body);

    // Build update object
    const updates: Partial<{
      contacted: boolean;
      contactedAt: Date;
      converted: boolean;
      convertedAt: Date;
      conversionValue: string;
      notes: string;
    }> = {};

    if (validatedData.contacted !== undefined) {
      updates.contacted = validatedData.contacted;
      if (validatedData.contacted) {
        updates.contactedAt = new Date();
      }
    }

    if (validatedData.converted !== undefined) {
      updates.converted = validatedData.converted;
      if (validatedData.converted) {
        updates.convertedAt = new Date();
        if (validatedData.conversion_value) {
          updates.conversionValue = String(validatedData.conversion_value);
        }
      }
    }

    if (validatedData.notes !== undefined) {
      updates.notes = validatedData.notes;
    }

    // Update lead in database
    const [data] = await db
      .update(calculatorLeads)
      .set(updates)
      .where(eq(calculatorLeads.id, id))
      .returning();

    if (!data) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
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
