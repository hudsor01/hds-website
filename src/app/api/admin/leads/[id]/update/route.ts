/**
 * Lead Update API
 * Handles updating lead status (contacted, converted)
 */

import { type NextRequest } from 'next/server';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { calculatorLeads } from '@/lib/schemas/schema';
import { eq } from 'drizzle-orm';
import { requireAdminAuth } from '@/lib/admin-auth';
import { withRateLimitParams } from '@/lib/api/rate-limit-wrapper';
import { z } from 'zod';

const UpdateLeadSchema = z.object({
  contacted: z.boolean().optional(),
  converted: z.boolean().optional(),
  conversion_value: z.number().optional(),
  notes: z.string().optional(),
});

async function handleLeadUpdate(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    // Validate input
    const validatedData = UpdateLeadSchema.parse(body);

    // Build update object with Drizzle camelCase column names
    const updates: Partial<typeof calculatorLeads.$inferInsert> = {};

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
      .where(eq(calculatorLeads.id, params.id))
      .returning();

    return successResponse({ lead: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Lead update error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

export const PATCH = withRateLimitParams(handleLeadUpdate, 'contactFormApi');
