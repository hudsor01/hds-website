/**
 * Scheduled Email System
 * Handles delayed email sequences and automated follow-ups
 * Uses Drizzle ORM for persistent storage
 */

import { eq, and, lte, lt, asc } from 'drizzle-orm';
import { db } from './db';
import { scheduledEmails, type ScheduledEmail as ScheduledEmailRow } from './schema';
import { createServerLogger } from "@/lib/logger";
import { getResendClient, isResendConfigured } from "@/lib/resend-client";
import {
  cancelEmailSequenceParamsSchema,
  scheduleEmailParamsSchema,
  type EmailSequenceId,
  type ScheduleEmailParams,
} from '@/lib/schemas/email';
import { resendEmailResponseSchema } from '@/lib/schemas/external';
import type {
  EmailProcessResult,
  EmailQueueStats,
} from "@/types/utils";
import { getEmailSequences, processEmailTemplate } from "./email-utils";
import { escapeHtml, sanitizeEmailHeader } from "./utils";

// Create logger instance for email operations
const emailLogger = createServerLogger();
emailLogger.setContext({
  component: 'scheduled-emails',
  service: 'email-queue'
});

export async function scheduleEmail(params: ScheduleEmailParams): Promise<void> {
  const {
    recipientEmail,
    recipientName,
    sequenceId,
    stepId,
    scheduledFor,
    variables,
  } = params;

  // Validate input parameters
  const validation = scheduleEmailParamsSchema.safeParse(params);

  if (!validation.success) {
    emailLogger.error('Invalid email scheduling parameters', {
      recipientEmail,
      recipientName,
      sequenceId,
      stepId,
      errors: validation.error.issues,
    });
    return;
  }

  try {
    const [data] = await db
      .insert(scheduledEmails)
      .values({
        recipientEmail,
        recipientName,
        sequenceId,
        stepId,
        scheduledFor,
        variables: variables ?? {},
        status: 'pending',
      })
      .returning();

    // Log email scheduling with metrics
    emailLogger.info('Email scheduled for delivery', {
      emailId: data?.id,
      recipientEmail,
      recipientName,
      sequenceId,
      stepId,
      scheduledFor: scheduledFor.toISOString(),
    });
  } catch (error) {
    emailLogger.error('Exception scheduling email', {
      error: error instanceof Error ? error.message : String(error),
      recipientEmail,
      sequenceId,
      stepId,
    });
  }
}

/**
 * Schedule email sequence for a new lead
 * Stores in database for persistence
 */
export async function scheduleEmailSequence(
  recipientEmail: string,
  recipientName: string,
  sequenceId: EmailSequenceId,
  variables: Record<string, string>
): Promise<void> {
  const sequences = getEmailSequences() as Record<string, { subject: string; content: string }>;
  const sequence = sequences[sequenceId];
  if (!sequence) {
    emailLogger.error('Email sequence not found', {
      sequenceId,
      recipientEmail,
      availableSequences: Object.keys(sequences)
    });
    return;
  }

  // Schedule a follow-up email for 3 days from now (if it's not the welcome email)
  if (sequenceId !== 'standard-welcome') {
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 3); // 3 days follow-up

    await scheduleEmail({
      recipientEmail,
      recipientName,
      sequenceId,
      stepId: 'followup',
      scheduledFor,
      variables,
    });
  }
}

/**
 * Process pending scheduled emails
 * This would typically be called by a cron job or scheduled task
 */
export async function processPendingEmails(): Promise<void> {
  const now = new Date();

  try {
    // Fetch pending emails from database
    const pendingEmails = await db
      .select()
      .from(scheduledEmails)
      .where(
        and(
          eq(scheduledEmails.status, 'pending'),
          lte(scheduledEmails.scheduledFor, now),
          lt(scheduledEmails.retryCount, 3)
        )
      )
      .orderBy(asc(scheduledEmails.scheduledFor))
      .limit(100);

    emailLogger.info('Starting email queue processing', {
      pendingCount: pendingEmails.length,
      processTime: now.toISOString()
    });

    // Process each email
    for (const scheduledEmail of pendingEmails) {
      try {
        await sendScheduledEmail(scheduledEmail);
      } catch (error) {
        emailLogger.error('Failed to process scheduled email', {
          emailId: scheduledEmail.id,
          recipientEmail: scheduledEmail.recipientEmail,
          sequenceId: scheduledEmail.sequenceId,
          error: error instanceof Error ? error.message : String(error)
        });

        const retryCount = scheduledEmail.retryCount ?? 0;

        // Increment retry count
        await db
          .update(scheduledEmails)
          .set({
            retryCount: retryCount + 1,
            error: error instanceof Error ? error.message : String(error),
            status: retryCount >= 2 ? 'failed' : 'pending',
          })
          .where(eq(scheduledEmails.id, scheduledEmail.id));
      }
    }
  } catch (error) {
    emailLogger.error('Exception in processPendingEmails', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Send a scheduled email
 */
async function sendScheduledEmail(scheduledEmail: ScheduledEmailRow): Promise<void> {
  if (!isResendConfigured()) {
    const errorMsg = "Email service not configured";
    emailLogger.warn('Resend API not configured', {
      emailId: scheduledEmail.id,
      recipientEmail: scheduledEmail.recipientEmail,
      environment: process.env.NODE_ENV,
      hasApiKey: !!process.env.RESEND_API_KEY
    });

    await db
      .update(scheduledEmails)
      .set({
        status: 'failed',
        error: errorMsg,
      })
      .where(eq(scheduledEmails.id, scheduledEmail.id));

    return;
  }

  const sequences = getEmailSequences() as Record<string, { subject: string; content: string }>;
  const sequence = sequences[scheduledEmail.sequenceId];

  if (!sequence) {
    const errorMsg = `Email sequence not found: ${scheduledEmail.sequenceId}`;

    await db
      .update(scheduledEmails)
      .set({
        status: 'failed',
        error: errorMsg,
      })
      .where(eq(scheduledEmails.id, scheduledEmail.id));

    emailLogger.error('Email sequence missing during send', {
      emailId: scheduledEmail.id,
      recipientEmail: scheduledEmail.recipientEmail,
      missingSequenceId: scheduledEmail.sequenceId,
      availableSequences: Object.keys(sequences)
    });

    return;
  }

  // Process template variables
  const variables = scheduledEmail.variables ?? {};
  const processedSubject = processEmailTemplate(
    sequence.subject,
    variables
  );
  const processedContent = processEmailTemplate(
    sequence.content,
    variables
  );

  try {
    // Convert plain text to HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        ${processedContent
          .split("\\n\\n")
          .map((paragraph) =>
            paragraph.startsWith("**") && paragraph.endsWith("**")
              ? `<h3 style="color: #0891b2; margin: 25px 0 15px 0;">${escapeHtml(
                  paragraph.slice(2, -2)
                )}</h3>`
              : paragraph.startsWith("• ")
              ? `<li style="margin: 8px 0;">${escapeHtml(
                  paragraph.slice(2)
                )}</li>`
              : paragraph.includes("• ")
              ? `<ul style="margin: 15px 0; padding-left: 20px;">${paragraph
                  .split("\\n")
                  .filter((line) => line.startsWith("• "))
                  .map(
                    (item) =>
                      `<li style="margin: 8px 0;">${escapeHtml(
                        item.slice(2)
                      )}</li>`
                  )
                  .join("")}</ul>`
              : `<p style="margin: 15px 0;">${escapeHtml(paragraph)}</p>`
          )
          .join("")}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
          <p style="margin: 0;">
            Richard Hudson<br>
            Hudson Digital Solutions<br>
            <a href="mailto:hello@hudsondigitalsolutions.com" style="color: #0891b2;">hello@hudsondigitalsolutions.com</a><br>
            <a href="https://hudsondigitalsolutions.com" style="color: #0891b2;">hudsondigitalsolutions.com</a>
          </p>
          <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
            You received this email because you requested information from Hudson Digital Solutions.
            <a href="https://hudsondigitalsolutions.com/unsubscribe?email=${encodeURIComponent(
              scheduledEmail.recipientEmail
            )}" style="color: #0891b2;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `;

    const emailResponse = await getResendClient().emails.send({
      from: "Richard Hudson <hello@hudsondigitalsolutions.com>",
      to: [scheduledEmail.recipientEmail],
      subject: sanitizeEmailHeader(processedSubject),
      html: htmlContent,
    });

    // Validate Resend response
    const responseValidation = resendEmailResponseSchema.safeParse(emailResponse.data);
    if (!responseValidation.success) {
      emailLogger.warn('Resend email response validation failed', {
        emailId: scheduledEmail.id,
        recipientEmail: scheduledEmail.recipientEmail,
        response: emailResponse.data,
        errors: responseValidation.error.issues,
      });
    }

    // Update status in database
    await db
      .update(scheduledEmails)
      .set({
        status: 'sent',
        sentAt: new Date(),
      })
      .where(eq(scheduledEmails.id, scheduledEmail.id));

    emailLogger.info('Email sent successfully', {
      emailId: scheduledEmail.id,
      recipientEmail: scheduledEmail.recipientEmail,
      recipientName: scheduledEmail.recipientName,
      subject: processedSubject,
      sequenceId: scheduledEmail.sequenceId,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    const retryCount = scheduledEmail.retryCount ?? 0;

    // Update status in database
    await db
      .update(scheduledEmails)
      .set({
        status: retryCount >= 2 ? 'failed' : 'pending',
        error: errorMsg,
        retryCount: retryCount + 1,
      })
      .where(eq(scheduledEmails.id, scheduledEmail.id));

    emailLogger.error('Email delivery failed', {
      emailId: scheduledEmail.id,
      recipientEmail: scheduledEmail.recipientEmail,
      subject: processedSubject,
      sequenceId: scheduledEmail.sequenceId,
      errorMessage: errorMsg,
      errorStack: error instanceof Error ? error.stack : undefined,
      retryCount: retryCount + 1,
    });
  }
}

/**
 * Get statistics about scheduled emails from database
 */
export async function getEmailQueueStats(): Promise<EmailQueueStats> {
  try {
    const data = await db
      .select({ status: scheduledEmails.status })
      .from(scheduledEmails);

    const stats = {
      pending: data.filter((e) => e.status === 'pending').length,
      sent: data.filter((e) => e.status === 'sent').length,
      failed: data.filter((e) => e.status === 'failed').length,
      total: data.length,
    };

    return stats;
  } catch (error) {
    emailLogger.error('Exception fetching email queue stats', {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      pending: 0,
      sent: 0,
      failed: 0,
      total: 0,
    };
  }
}

/**
 * Cancel scheduled emails for a specific recipient
 */
export async function cancelEmailSequence(
  recipientEmail: string,
  sequenceId?: string
): Promise<void> {
  // Validate cancellation parameters
  const validation = cancelEmailSequenceParamsSchema.safeParse({
    recipientEmail,
    sequenceId,
  });

  if (!validation.success) {
    emailLogger.error('Invalid email cancellation parameters', {
      recipientEmail,
      sequenceId,
      errors: validation.error.issues,
    });
    return;
  }

  try {
    // Build the where clause based on whether sequenceId is provided
    const conditions = [
      eq(scheduledEmails.recipientEmail, recipientEmail),
      eq(scheduledEmails.status, 'pending'),
    ];

    if (sequenceId) {
      conditions.push(eq(scheduledEmails.sequenceId, sequenceId));
    }

    // Delete matching records
    await db
      .delete(scheduledEmails)
      .where(and(...conditions));

    emailLogger.info('Email sequence cancelled', {
      recipientEmail,
      sequenceId: sequenceId || 'all',
    });
  } catch (error) {
    emailLogger.error('Exception cancelling email sequence', {
      error: error instanceof Error ? error.message : String(error),
      recipientEmail,
      sequenceId,
    });
  }
}

/**
 * API endpoint to manually trigger email processing
 * This would typically be called by a cron job
 */
export async function processEmailsEndpoint(): Promise<EmailProcessResult> {
  const beforeStats = await getEmailQueueStats();

  try {
    await processPendingEmails();
    const afterStats = await getEmailQueueStats();

    return {
      success: true,
      processed: afterStats.sent - beforeStats.sent,
      errors: afterStats.failed - beforeStats.failed,
    };
  } catch (error) {
    emailLogger.error('Email queue processing failed', {
      beforeStats,
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });

    return {
      success: false,
      processed: 0,
      errors: 1,
    };
  }
}

// Export queue stats for backwards compatibility
export async function getScheduledEmailsQueue() {
  try {
    const data = await db
      .select()
      .from(scheduledEmails)
      .where(eq(scheduledEmails.status, 'pending'))
      .orderBy(asc(scheduledEmails.scheduledFor));

    return data;
  } catch (error) {
    emailLogger.error('Exception fetching scheduled emails queue', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
