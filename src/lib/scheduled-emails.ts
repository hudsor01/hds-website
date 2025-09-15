/**
 * Scheduled Email System
 * Handles delayed email sequences and automated follow-ups
 */

import { Resend } from "resend";
import type {
  InternalScheduledEmail,
  EmailQueueStats,
  EmailProcessResult,
} from "@/types/utils";
import { createServerLogger } from "@/lib/logger";
import { getEmailSequences, processEmailTemplate } from "./email-utils";
import { escapeHtml, sanitizeEmailHeader } from "./security-utils";

// Create logger instance for email operations
const emailLogger = createServerLogger();
emailLogger.setContext({
  component: 'scheduled-emails',
  service: 'email-queue'
});

// In a real implementation, this would be stored in a database
// For demo purposes, we'll use in-memory storage with comments on database structure
let scheduledEmailsQueue: InternalScheduledEmail[] = [];

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Schedule email sequence for a new lead
 */
export function scheduleEmailSequence(
  recipientEmail: string,
  recipientName: string,
  sequenceId: string,
  variables: Record<string, string>
): void {
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

  // Since we simplified to single-template sequences, we'll schedule a follow-up
  // email for 3 days from now (if it's not the welcome email)
  if (sequenceId !== 'standard-welcome') {
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + 3); // 3 days follow-up

    const scheduledEmail: InternalScheduledEmail = {
      id: `${recipientEmail}-${sequenceId}-followup-${Date.now()}`,
      recipientEmail,
      recipientName,
      sequenceId,
      stepId: 'followup',
      scheduledFor,
      variables,
      status: "pending",
      createdAt: new Date(),
    };

    scheduledEmailsQueue.push(scheduledEmail);

    // Log email scheduling with metrics
    emailLogger.info('Email scheduled for delivery', {
      emailId: scheduledEmail.id,
      recipientEmail,
      recipientName,
      sequenceId,
      subject: sequence.subject,
      scheduledFor: scheduledFor.toISOString(),
      daysFromNow: 3,
      queueSize: scheduledEmailsQueue.length
    });
  }

  // In production, you would insert these into a database table like:
  // CREATE TABLE scheduled_emails (
  //   id VARCHAR PRIMARY KEY,
  //   recipient_email VARCHAR NOT NULL,
  //   recipient_name VARCHAR NOT NULL,
  //   sequence_id VARCHAR NOT NULL,
  //   step_id VARCHAR NOT NULL,
  //   scheduled_for TIMESTAMP NOT NULL,
  //   variables JSON,
  //   status VARCHAR DEFAULT 'pending',
  //   created_at TIMESTAMP DEFAULT NOW(),
  //   sent_at TIMESTAMP,
  //   error TEXT
  // );
}

/**
 * Process pending scheduled emails
 * This would typically be called by a cron job or scheduled task
 */
export async function processPendingEmails(): Promise<void> {
  const now = new Date();
  const pendingEmails = scheduledEmailsQueue.filter(
    (email) => email.status === "pending" && email.scheduledFor <= now
  );

  emailLogger.info('Starting email queue processing', {
    pendingCount: pendingEmails.length,
    totalQueueSize: scheduledEmailsQueue.length,
    processTime: now.toISOString()
  });

  for (const scheduledEmail of pendingEmails) {
    try {
      await sendScheduledEmail(scheduledEmail);
    } catch (error) {
      emailLogger.error('Failed to process scheduled email', {
        emailId: scheduledEmail.id,
        recipientEmail: scheduledEmail.recipientEmail,
        sequenceId: scheduledEmail.sequenceId,
        scheduledFor: scheduledEmail.scheduledFor.toISOString(),
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

/**
 * Send a scheduled email
 */
async function sendScheduledEmail(
  scheduledEmail: InternalScheduledEmail
): Promise<void> {
  if (!resend) {
    const errorMsg = "Email service not configured";
    emailLogger.warn('Resend API not configured', {
      emailId: scheduledEmail.id,
      recipientEmail: scheduledEmail.recipientEmail,
      environment: process.env.NODE_ENV,
      hasApiKey: !!process.env.RESEND_API_KEY
    });
    scheduledEmail.status = "failed";
    scheduledEmail.error = errorMsg;
    return;
  }

  const sequences = getEmailSequences() as Record<string, { subject: string; content: string }>;
  const sequence = sequences[scheduledEmail.sequenceId];

  // Guard against missing sequence to satisfy TypeScript and avoid runtime errors
  if (!sequence) {
    const errorMsg = `Email sequence not found: ${scheduledEmail.sequenceId}`;
    scheduledEmail.status = "failed";
    scheduledEmail.error = errorMsg;
    emailLogger.error('Email sequence missing during send', {
      emailId: scheduledEmail.id,
      recipientEmail: scheduledEmail.recipientEmail,
      missingSequenceId: scheduledEmail.sequenceId,
      availableSequences: Object.keys(sequences)
    });
    return;
  }

  // With simplified sequences, we just use the main sequence template
  // Process template variables (moved outside try block for error logging)
  const processedSubject = processEmailTemplate(
    sequence.subject,
    scheduledEmail.variables
  );
  const processedContent = processEmailTemplate(
    sequence.content,
    scheduledEmail.variables
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

    await resend.emails.send({
      from: "Richard Hudson <hello@hudsondigitalsolutions.com>",
      to: [scheduledEmail.recipientEmail],
      subject: sanitizeEmailHeader(processedSubject),
      html: htmlContent,
    });

    scheduledEmail.status = "sent";
    scheduledEmail.sentAt = new Date();

    emailLogger.info('Email sent successfully', {
      emailId: scheduledEmail.id,
      recipientEmail: scheduledEmail.recipientEmail,
      recipientName: scheduledEmail.recipientName,
      subject: processedSubject,
      sequenceId: scheduledEmail.sequenceId,
      sentAt: scheduledEmail.sentAt.toISOString(),
      processingTime: scheduledEmail.sentAt.getTime() - scheduledEmail.createdAt.getTime()
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    scheduledEmail.status = "failed";
    scheduledEmail.error = errorMsg;

    emailLogger.error('Email delivery failed', {
      emailId: scheduledEmail.id,
      recipientEmail: scheduledEmail.recipientEmail,
      subject: processedSubject,
      sequenceId: scheduledEmail.sequenceId,
      errorMessage: errorMsg,
      errorStack: error instanceof Error ? error.stack : undefined,
      retryRecommended: true
    });

    // In production, you might want to retry failed emails or alert administrators
  }
}

/**
 * Get statistics about scheduled emails
 */
export function getEmailQueueStats(): EmailQueueStats {
  const stats = {
    pending: scheduledEmailsQueue.filter((e) => e.status === "pending").length,
    sent: scheduledEmailsQueue.filter((e) => e.status === "sent").length,
    failed: scheduledEmailsQueue.filter((e) => e.status === "failed").length,
    total: scheduledEmailsQueue.length,
  };

  return stats;
}

/**
 * Cancel scheduled emails for a specific recipient
 */
export function cancelEmailSequence(
  recipientEmail: string,
  sequenceId?: string
): void {
  scheduledEmailsQueue = scheduledEmailsQueue.filter(
    (email) =>
      !(
        email.recipientEmail === recipientEmail &&
        email.status === "pending" &&
        (!sequenceId || email.sequenceId === sequenceId)
      )
  );

  const cancelledCount = scheduledEmailsQueue.filter(
    (email) =>
      email.recipientEmail === recipientEmail &&
      email.status === "pending" &&
      (!sequenceId || email.sequenceId === sequenceId)
  ).length;

  emailLogger.info('Email sequence cancelled', {
    recipientEmail,
    sequenceId: sequenceId || 'all',
    cancelledCount,
    remainingQueueSize: scheduledEmailsQueue.length
  });
}

/**
 * API endpoint to manually trigger email processing
 * This would typically be called by a cron job
 */
export async function processEmailsEndpoint(): Promise<EmailProcessResult> {
  const beforeStats = getEmailQueueStats();

  try {
    await processPendingEmails();
    const afterStats = getEmailQueueStats();

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

// Export for use in API routes or scheduled tasks
export { scheduledEmailsQueue };
