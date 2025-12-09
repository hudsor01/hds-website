/**
 * n8n Webhook Integration API
 * Receives automation triggers from n8n workflows
 */

import { createServerLogger } from '@/lib/logger';
import { notifyHighValueLead } from '@/lib/notifications';
import { scheduleEmail } from '@/lib/scheduled-emails';
import type { Database } from '@/types/database';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    logger.error('Supabase environment variables are missing');
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const logger = createServerLogger('n8n-webhook');

// Webhook authentication
function verifyWebhookAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.warn('N8N webhook secret not configured');
    return false;
  }

  return authHeader === `Bearer ${webhookSecret}`;
}

// Webhook payload schemas
const NewLeadSchema = z.object({
  action: z.literal('new_lead'),
  data: z.object({
    email: z.string().email(),
    name: z.string(),
    phone: z.string().optional(),
    company: z.string().optional(),
    source: z.string(),
    leadScore: z.number().min(0).max(100),
  }),
});

const EmailSequenceSchema = z.object({
  action: z.literal('trigger_email_sequence'),
  data: z.object({
    email: z.string().email(),
    name: z.string(),
    sequenceId: z.string(),
    scheduledFor: z.string().datetime().optional(),
  }),
});

const UpdateLeadSchema = z.object({
  action: z.literal('update_lead'),
  data: z.object({
    leadId: z.string(),
    updates: z.object({
      contacted: z.boolean().optional(),
      converted: z.boolean().optional(),
      status: z.string().optional(),
      notes: z.string().optional(),
    }),
  }),
});

/**
 * POST - Handle n8n webhook triggers
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    if (!verifyWebhookAuth(request)) {
      logger.warn('Unauthorized n8n webhook attempt', {
        ip: request.headers.get('x-forwarded-for'),
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    logger.info('N8N webhook received', { action });

    // Route to appropriate handler based on action
    switch (action) {
      case 'new_lead':
        return await handleNewLead(body);

      case 'trigger_email_sequence':
        return await handleEmailSequence(body);

      case 'update_lead':
        return await handleUpdateLead(body);

      default:
        logger.warn('Unknown n8n webhook action', { action });
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('N8N webhook error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle new lead creation
 */
async function handleNewLead(body: unknown) {
  try {
    const validation = NewLeadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { data } = validation.data;

    const supabase = createServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Store lead in database
    const { data: lead, error: dbError } = await supabase
      .from('calculator_leads')
      .insert({
        email: data.email,
        name: data.name,
        phone: data.phone,
        company: data.company,
        calculator_type: 'n8n-integration',
        inputs: { source: data.source },
        lead_score: data.leadScore,
        lead_quality: data.leadScore >= 75 ? 'hot' : data.leadScore >= 50 ? 'warm' : 'cold',
      })
      .select()
      .single();

    if (dbError) {
      logger.error('Failed to store lead from n8n', dbError);
      return NextResponse.json(
        { error: 'Failed to store lead' },
        { status: 500 }
      );
    }

    // Send notifications for high-value leads
    if (data.leadScore >= 70) {
      await notifyHighValueLead({
        leadId: lead.id,
        firstName: data.name.split(' ')[0] || data.name,
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        email: data.email,
        phone: data.phone,
        company: data.company,
        leadScore: data.leadScore,
        leadQuality: lead.lead_quality || 'warm',
        source: `n8n Integration - ${data.source}`,
      });
    }

    logger.info('N8N lead created successfully', {
      leadId: lead.id,
      email: data.email,
      leadScore: data.leadScore,
    });

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      message: 'Lead created successfully',
    });
  } catch (error) {
    logger.error('Error handling new lead from n8n', error as Error);
    return NextResponse.json(
      { error: 'Failed to process lead' },
      { status: 500 }
    );
  }
}

/**
 * Handle email sequence trigger
 */
async function handleEmailSequence(body: unknown) {
  try {
    const validation = EmailSequenceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { data } = validation.data;

    const scheduledFor = data.scheduledFor
      ? new Date(data.scheduledFor)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default: 1 day from now

    await scheduleEmail({
      recipientEmail: data.email,
      recipientName: data.name,
      sequenceId: data.sequenceId as never,
      stepId: 'n8n-triggered',
      scheduledFor,
      variables: {
        firstName: data.name.split(' ')[0] || data.name,
      },
    });

    logger.info('N8N email sequence scheduled', {
      email: data.email,
      sequenceId: data.sequenceId,
      scheduledFor: scheduledFor.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Email sequence scheduled',
      scheduled_for: scheduledFor.toISOString(),
    });
  } catch (error) {
    logger.error('Error scheduling email from n8n', error as Error);
    return NextResponse.json(
      { error: 'Failed to schedule email' },
      { status: 500 }
    );
  }
}

/**
 * Handle lead update
 */
async function handleUpdateLead(body: unknown) {
  try {
    const validation = UpdateLeadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { data } = validation.data;

    const supabase = createServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from('calculator_leads')
      .update(data.updates)
      .eq('id', data.leadId);

    if (updateError) {
      logger.error('Failed to update lead from n8n', updateError);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    logger.info('N8N lead updated successfully', {
      leadId: data.leadId,
      updates: Object.keys(data.updates),
    });

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
    });
  } catch (error) {
    logger.error('Error updating lead from n8n', error as Error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

/**
 * GET - Health check endpoint
 */
export async function GET(_request: NextRequest) {
  // Simple health check - no auth required
  return NextResponse.json({
    status: 'ok',
    service: 'n8n-webhook',
    timestamp: new Date().toISOString(),
  });
}
