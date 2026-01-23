/**
 * n8n Webhook Integration API
 * Receives automation triggers from n8n workflows
 */

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { createServerLogger } from '@/lib/logger';
import { scheduleEmail } from '@/lib/scheduled-emails';
import { emailSequenceIdSchema } from '@/lib/schemas/email';
import { calculatorLeads, type NewCalculatorLead } from '@/lib/schema';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LEAD_QUALITY_THRESHOLDS } from '@/lib/constants/lead-scoring';

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
    sequenceId: emailSequenceIdSchema,
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

    // Determine lead quality based on score
    const leadQuality = data.leadScore >= LEAD_QUALITY_THRESHOLDS.HOT
      ? 'hot'
      : data.leadScore >= LEAD_QUALITY_THRESHOLDS.WARM
        ? 'warm'
        : 'cold';

    // Store lead in database using Drizzle
    const insertData: NewCalculatorLead = {
      email: data.email,
      name: data.name,
      phone: data.phone ?? null,
      company: data.company ?? null,
      calculatorType: 'n8n-integration',
      inputs: { source: data.source },
      leadScore: data.leadScore,
      leadQuality,
    };

    const [lead] = await db.insert(calculatorLeads).values(insertData).returning();

    if (!lead) {
      logger.error('Failed to store lead from n8n - no result returned');
      return NextResponse.json(
        { error: 'Failed to store lead' },
        { status: 500 }
      );
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
      sequenceId: data.sequenceId,
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

    // Build update object with camelCase keys matching Drizzle schema
    const updateValues: Partial<{
      contacted: boolean;
      converted: boolean;
      notes: string;
      contactedAt: Date;
      convertedAt: Date;
    }> = {};

    if (data.updates.contacted !== undefined) {
      updateValues.contacted = data.updates.contacted;
      if (data.updates.contacted) {
        updateValues.contactedAt = new Date();
      }
    }
    if (data.updates.converted !== undefined) {
      updateValues.converted = data.updates.converted;
      if (data.updates.converted) {
        updateValues.convertedAt = new Date();
      }
    }
    if (data.updates.notes !== undefined) {
      updateValues.notes = data.updates.notes;
    }

    const result = await db
      .update(calculatorLeads)
      .set(updateValues)
      .where(eq(calculatorLeads.id, data.leadId))
      .returning({ id: calculatorLeads.id });

    if (result.length === 0) {
      logger.warn('Lead not found for update from n8n', { leadId: data.leadId });
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
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
