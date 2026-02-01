/**
 * Lead Notes API
 * Handles creating and fetching notes for leads
 */

import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { leadNotes } from '@/lib/schemas/schema';
import { eq, asc } from 'drizzle-orm';
import { type NextRequest } from 'next/server';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { requireAdminAuth } from '@/lib/admin-auth';
import { withRateLimitParams } from '@/lib/api/rate-limit-wrapper';
import { z } from 'zod';

const CreateNoteSchema = z.object({
  note_type: z.enum(['note', 'status_change', 'email_sent', 'call', 'meeting']),
  content: z.string().min(1),
  created_by: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

async function handleLeadNotesGet(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    // Fetch all notes for this lead
    const notes = await db
      .select()
      .from(leadNotes)
      .where(eq(leadNotes.leadId, id))
      .orderBy(asc(leadNotes.createdAt));

    return successResponse({ notes });
  } catch (error) {
    logger.error('Notes fetch error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

export const GET = withRateLimitParams(handleLeadNotesGet, 'api');

async function handleLeadNotesPost(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();

    // Validate input
    const validatedData = CreateNoteSchema.parse(body);

    // Insert note
    const [note] = await db
      .insert(leadNotes)
      .values({
        leadId: id,
        content: validatedData.content,
        noteType: validatedData.note_type,
        createdBy: validatedData.created_by || 'admin',
      })
      .returning();

    return successResponse({ note });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    logger.error('Note creation error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

export const POST = withRateLimitParams(handleLeadNotesPost, 'contactFormApi');
