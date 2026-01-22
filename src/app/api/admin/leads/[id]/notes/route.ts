/**
 * Lead Notes API
 * Handles creating and fetching notes for leads
 */

import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import { leadNotes, type NewLeadNote } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';
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
    // Fetch all notes for this lead
    const notes = await db
      .select()
      .from(leadNotes)
      .where(eq(leadNotes.leadId, id))
      .orderBy(asc(leadNotes.createdAt));

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
    const body = await request.json();

    // Validate input
    const validatedData = CreateNoteSchema.parse(body);

    // Insert note
    const noteData: NewLeadNote = {
      leadId: id,
      content: validatedData.content,
      noteType: validatedData.note_type,
      createdBy: validatedData.created_by || 'admin',
    };

    const [note] = await db
      .insert(leadNotes)
      .values(noteData)
      .returning();

    return NextResponse.json({ success: true, note });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }

    logger.error('Note creation error:', error as Error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
