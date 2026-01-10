/**
 * Lead Notes API
 * Handles creating and fetching notes for leads
 */

import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { type NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { requireAdminAuth } from '@/lib/admin-auth';
import { withRateLimitParams } from '@/lib/api/rate-limit-wrapper';
import { z } from 'zod';

type LeadNoteInsert = Database['public']['Tables']['lead_notes']['Insert'];

const CreateNoteSchema = z.object({
  note_type: z.enum(['note', 'status_change', 'email_sent', 'call', 'meeting']),
  content: z.string().min(1),
  created_by: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

async function handleLeadNotesGet(
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
    const supabase = await createClient();

    // Fetch all notes for this lead (RLS enforces admin access)
    const { data: notes, error } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Failed to fetch notes:', error as Error);
      return errorResponse('Failed to fetch notes', 500);
    }

    return successResponse({ notes: notes || [] });
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
    const supabase = await createClient();
    const body = await request.json();

    // Validate input
    const validatedData = CreateNoteSchema.parse(body);

    // Insert note (RLS enforces admin access)
    const noteData: LeadNoteInsert = {
      lead_id: id,
      content: validatedData.content,
      note_type: validatedData.note_type,
      created_by: validatedData.created_by || 'admin',
    };

    const { data: note, error } = await supabase
      .from('lead_notes')
      .insert(noteData)
      .select('*')
      .maybeSingle();

    if (error) {
      logger.error('Failed to create note:', error as Error);
      return errorResponse('Failed to create note', 500);
    }

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
