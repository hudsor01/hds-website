/**
 * Lead Update API
 * Handles updating lead status (contacted, converted)
 */

import { type NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
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
      console.error('Failed to update lead:', error);
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

    console.error('Lead update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
