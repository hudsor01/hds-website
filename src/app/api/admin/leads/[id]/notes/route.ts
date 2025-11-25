/**
 * Lead Notes API
 * Handles creating and fetching notes for leads
 */

import { supabaseAdmin } from '@/lib/supabase';
import type { LeadNote, LeadNoteInsert } from '@/types/supabase-helpers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreateNoteSchema = z.object({
  note_type: z.enum(['note', 'status_change', 'email_sent', 'call', 'meeting']),
  content: z.string().min(1),
  created_by: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Fetch all notes for this lead
    const { data: notes, error } = (await supabaseAdmin
      .from('lead_notes' as 'lead_attribution') // Type assertion for custom table
      .select('*')
      .eq('lead_id', params.id)
      .order('created_at', { ascending: true })) as unknown as { data: LeadNote[] | null; error: unknown };

    if (error) {
      console.error('Failed to fetch notes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (error) {
    console.error('Notes fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = CreateNoteSchema.parse(body);

    // Insert note
    const noteData: LeadNoteInsert = {
      lead_id: params.id,
      note: validatedData.content,
      created_by: validatedData.created_by || 'admin',
    };

    const { data: note, error } = (await supabaseAdmin
      .from('lead_notes' as 'lead_attribution') // Type assertion for custom table
      .insert(noteData as unknown as never) // Bypass type checking
      .select()
      .single()) as unknown as { data: LeadNote | null; error: unknown };

    if (error) {
      console.error('Failed to create note:', error);
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, note });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Note creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
