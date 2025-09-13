/**
 * Scheduled Email System
 * Handles delayed email sequences and automated follow-ups
 */

import { Resend } from "resend";
import { EMAIL_SEQUENCES, processEmailTemplate } from "./email-sequences";
import { escapeHtml, sanitizeEmailHeader } from "./security-utils";
import type {
  InternalScheduledEmail,
  EmailQueueStats,
  EmailProcessResult,
} from "@/types/utils";

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
  const sequence = EMAIL_SEQUENCES[sequenceId];
  if (!sequence) {
    console.error(`Email sequence not found: ${sequenceId}`);
    return;
  }

  // Schedule each step in the sequence
  sequence.steps.forEach((step) => {
    if (step.delayDays === 0) {
      // Skip immediate emails as they're handled in the contact form
      return;
    }

    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + step.delayDays);

    const scheduledEmail: InternalScheduledEmail = {
      id: `${recipientEmail}-${sequenceId}-${step.id}-${Date.now()}`,
      recipientEmail,
      recipientName,
      sequenceId,
      stepId: step.id,
      scheduledFor,
      variables,
      status: "pending",
      createdAt: new Date(),
    };

    scheduledEmailsQueue.push(scheduledEmail);

    // Log only in development, not during tests
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `Scheduled email: ${
          step.subject
        } for ${recipientEmail} on ${scheduledFor.toISOString()}`
      );
    }
  });

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

  console.warn(`Processing ${pendingEmails.length} pending emails...`);

  for (const scheduledEmail of pendingEmails) {
    try {
      await sendScheduledEmail(scheduledEmail);
    } catch (error) {
      console.error(
        `Failed to process scheduled email ${scheduledEmail.id}:`,
        error
      );
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
    console.warn("Resend not configured, skipping email send");
    scheduledEmail.status = "failed";
    scheduledEmail.error = "Email service not configured";
    return;
  }

  const sequence = EMAIL_SEQUENCES[scheduledEmail.sequenceId];

  // Guard against missing sequence to satisfy TypeScript and avoid runtime errors
  if (!sequence) {
    scheduledEmail.status = "failed";
    scheduledEmail.error = `Email sequence not found: ${scheduledEmail.sequenceId}`;
    console.error(
      `Failed to send scheduled email ${scheduledEmail.id}: sequence ${scheduledEmail.sequenceId} not found`
    );
    return;
  }

  const step = sequence.steps.find((s) => s.id === scheduledEmail.stepId);

  if (!step) {
    scheduledEmail.status = "failed";
    scheduledEmail.error = "Email step not found";
    return;
  }

  try {
    // Process template variables
    const processedSubject = processEmailTemplate(
      step.subject,
      scheduledEmail.variables
    );
    const processedContent = processEmailTemplate(
      step.content,
      scheduledEmail.variables
    );

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

    console.log(
      `Sent scheduled email: ${processedSubject} to ${scheduledEmail.recipientEmail}`
    );
  } catch (error) {
    scheduledEmail.status = "failed";
    scheduledEmail.error =
      error instanceof Error ? error.message : "Unknown error";

    console.error(
      `Failed to send scheduled email to ${scheduledEmail.recipientEmail}:`,
      error
    );

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

  console.log(
    `Cancelled scheduled emails for ${recipientEmail}${
      sequenceId ? ` in sequence ${sequenceId}` : ""
    }`
  );
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
    console.error("Error processing email queue:", error);
    return {
      success: false,
      processed: 0,
      errors: 1,
    };
  }
}

// Export for use in API routes or scheduled tasks
export { scheduledEmailsQueue };
