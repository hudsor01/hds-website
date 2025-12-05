/**
 * Lead Notes API
 * Handles creating and fetching notes for leads
 */

import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import type { LeadNote, LeadNoteInsert } from '@/types/supabase-helpers';
import { type NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { z } from 'zod';

const CreateNoteSchema = z.object({
  note_type: z.enum(['note', 'status_change', 'email_sent', 'call', 'meeting']),
  content: z.string().min(1),
  created_by: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Rate limiting
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Lead notes rate limit exceeded', { ip: clientIp });
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const supabase = await createClient();

    // Fetch all notes for this lead (RLS enforces admin access)
    const { data: notes, error } = await supabase
      .from('lead_notes' as 'lead_attribution')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: true }) as unknown as { data: LeadNote[] | null; error: unknown };

    if (error) {
      logger.error('Failed to fetch notes:', error as Error);
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (error) {
    logger.error('Notes fetch error:', error as Error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Rate limiting
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactFormApi');
  if (!isAllowed) {
    logger.warn('Lead notes POST rate limit exceeded', { ip: clientIp });
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

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
      note: validatedData.content,
      created_by: validatedData.created_by || 'admin',
    };

    const { data: note, error } = await supabase
      .from('lead_notes' as 'lead_attribution')
      .insert(noteData as unknown as never)
      .select()
      .single() as unknown as { data: LeadNote | null; error: unknown };

    if (error) {
      logger.error('Failed to create note:', error as Error);
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }

    return NextResponse.json({ success: true, note });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }

    logger.error('Note creation error:', error as Error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
