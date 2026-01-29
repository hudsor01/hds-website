/**
 * Contact Service Layer
 * Centralized business logic for contact form processing
 *
 * This service handles:
 * - Security validation
 * - Email template preparation
 * - Admin notifications
 * - Welcome emails
 */

import { EMAIL_CONFIG } from '@/lib/config/email';
import { DISPLAY_CATEGORY_THRESHOLDS, LEAD_QUALITY_THRESHOLDS } from '@/lib/constants/lead-scoring';
import { getResendClient, isResendConfigured } from '@/lib/resend-client';
import { getEmailSequences, processEmailTemplate } from '@/lib/email-utils';
import { resendEmailResponseSchema } from '@/lib/schemas/external';
import type { ContactFormData, LeadScoring } from '@/lib/schemas/contact';
import { detectInjectionAttempt, escapeHtml } from '@/lib/utils';
import { castError, type Logger } from '@/lib/logger';
import { notifyHighValueLead } from '@/lib/notifications';
import { scheduleEmailSequence } from '@/lib/scheduled-emails';

/**
 * Check for suspicious content in form fields
 * Monitors for potential injection attempts without blocking
 */
export function checkForSecurityThreats(
  data: ContactFormData,
  clientIP: string,
  logger: Logger
): boolean {
  const fieldsToCheck = [
    data.firstName,
    data.lastName,
    data.email,
    data.message,
    data.company,
  ].filter(Boolean);

  const hasSuspiciousContent = fieldsToCheck.some((field) =>
    detectInjectionAttempt(field as string)
  );

  if (hasSuspiciousContent) {
    logger.warn('Potential injection attempt detected', { clientIP });
  }

  return hasSuspiciousContent;
}

/**
 * Prepare email template variables from form data
 */
export function prepareEmailVariables(data: ContactFormData) {
  return {
    firstName: data.firstName,
    lastName: data.lastName || '',
    company: data.company || 'your business',
    service: data.service || 'web development',
    email: data.email,
  };
}

/**
 * Email template styling helpers
 * Extracted for reusability and testability
 */
const EmailStyles = {
  /** Get background color based on lead score */
  getLeadScoreBackground(score: number): string {
    if (score >= DISPLAY_CATEGORY_THRESHOLDS.HIGH_PRIORITY) {
      return '#dcfce7'; // Green
    }
    if (score >= DISPLAY_CATEGORY_THRESHOLDS.QUALIFIED) {
      return '#fef3c7'; // Yellow
    }
    return '#fef2f2'; // Red
  },

  /** Get text color based on lead score */
  getLeadScoreTextColor(score: number): string {
    if (score >= DISPLAY_CATEGORY_THRESHOLDS.HIGH_PRIORITY) {
      return '#15803d'; // Dark green
    }
    if (score >= DISPLAY_CATEGORY_THRESHOLDS.QUALIFIED) {
      return '#d97706'; // Dark yellow
    }
    return '#dc2626'; // Dark red
  },

  /** Get category label based on lead score */
  getLeadScoreCategory(score: number): string {
    if (score >= DISPLAY_CATEGORY_THRESHOLDS.HIGH_PRIORITY) {
      return '(HIGH PRIORITY)';
    }
    if (score >= DISPLAY_CATEGORY_THRESHOLDS.QUALIFIED) {
      return '(QUALIFIED)';
    }
    return '(NURTURE)';
  },

  /** Get recommended action based on lead score */
  getRecommendedAction(score: number): string {
    if (score >= DISPLAY_CATEGORY_THRESHOLDS.HIGH_PRIORITY) {
      return 'Schedule call within 24 hours';
    }
    if (score >= DISPLAY_CATEGORY_THRESHOLDS.QUALIFIED) {
      return 'Follow up within 2-3 days';
    }
    return 'Add to nurture sequence';
  },
};

/**
 * Generate contact information section HTML
 */
function generateContactInfoSection(data: ContactFormData): string {
  const fields = [
    `<p><strong>Name:</strong> ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</p>`,
    `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>`,
    data.phone ? `<p><strong>Phone:</strong> <a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></p>` : '',
    data.company ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>` : '',
    data.service ? `<p><strong>Service Interest:</strong> ${escapeHtml(data.service)}</p>` : '',
    data.budget ? `<p><strong>Budget:</strong> ${escapeHtml(data.budget)}</p>` : '',
    data.timeline ? `<p><strong>Timeline:</strong> ${escapeHtml(data.timeline)}</p>` : '',
  ].filter(Boolean);

  return `
    <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
      <h2>Contact Information</h2>
      ${fields.join('\n      ')}
    </div>
  `;
}

/**
 * Generate lead intelligence section HTML
 */
function generateLeadIntelligenceSection(
  leadScore: number,
  sequenceId: string
): string {
  const backgroundColor = EmailStyles.getLeadScoreBackground(leadScore);
  const textColor = EmailStyles.getLeadScoreTextColor(leadScore);
  const category = EmailStyles.getLeadScoreCategory(leadScore);
  const action = EmailStyles.getRecommendedAction(leadScore);

  return `
    <div style="background: ${backgroundColor}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: ${textColor};">Lead Intelligence</h2>
      <p><strong>Lead Score:</strong> ${leadScore}/100 ${category}</p>
      <p><strong>Email Sequence:</strong> ${sequenceId || 'standard-welcome'}</p>
      <p><strong>Recommended Action:</strong> ${action}</p>
    </div>
  `;
}

/**
 * Generate message section HTML
 */
function generateMessageSection(message: string): string {
  return `
    <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
      <h2>Message</h2>
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;
}

/**
 * Generate footer section HTML
 */
function generateFooterSection(leadScore?: number, sequenceId?: string): string {
  const leadInfo = leadScore
    ? `Lead Score: ${leadScore}/100 | Sequence: ${sequenceId}`
    : '';

  return `
    <p style="margin-top: 30px; color: #64748b; font-size: 12px;">
      Submitted: ${new Date().toLocaleString()}<br>
      Source: Hudson Digital Solutions Contact Form<br>
      ${leadInfo}
    </p>
  `;
}

/**
 * Generate HTML for admin notification email
 * Composed from modular, testable sections
 */
export function generateAdminNotificationHTML(
  data: ContactFormData,
  leadScore?: number,
  sequenceId?: string
): string {
  const sections = [
    '<h1 style="color: #0891b2;">New Contact Form Submission</h1>',
    generateContactInfoSection(data),
    leadScore ? generateLeadIntelligenceSection(leadScore, sequenceId || 'standard-welcome') : '',
    generateMessageSection(data.message),
    generateFooterSection(leadScore, sequenceId),
  ].filter(Boolean);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${sections.join('\n      ')}
    </div>
  `;
}

/**
 * Send admin notification email
 * Returns true on success, false on failure
 */
export async function sendAdminNotification(
  data: ContactFormData,
  leadScore: number,
  sequenceId: LeadScoring['sequenceType'],
  logger: Logger
): Promise<boolean> {
  if (!isResendConfigured()) {
    return false;
  }

  try {
    const response = await getResendClient().emails.send({
      from: EMAIL_CONFIG.FROM_ADMIN,
      to: [EMAIL_CONFIG.TO_ADMIN],
      subject: `New Project Inquiry - ${data.firstName} ${data.lastName} (Score: ${leadScore})`,
      html: generateAdminNotificationHTML(data, leadScore, sequenceId),
    });

    const validation = resendEmailResponseSchema.safeParse(response.data);
    if (!validation.success) {
      logger.warn('Admin email response validation failed', {
        errors: validation.error.issues,
      });
    }
    return true;
  } catch (error) {
    logger.error('Failed to send admin notification', castError(error));
    return false;
  }
}

/**
 * Send welcome email to prospect
 * Returns true on success, false on failure
 */
export async function sendWelcomeEmail(
  data: ContactFormData,
  sequenceId: LeadScoring['sequenceType'],
  emailVariables: ReturnType<typeof prepareEmailVariables>,
  logger: Logger
): Promise<boolean> {
  if (!isResendConfigured()) {
    return false;
  }

  const sequences = getEmailSequences();
  const sequence = sequences[sequenceId as keyof typeof sequences];
  if (!sequence) {
    return false;
  }

  try {
    const processedContent = processEmailTemplate(sequence.content, emailVariables);
    const processedSubject = processEmailTemplate(sequence.subject, emailVariables);

    const response = await getResendClient().emails.send({
      from: EMAIL_CONFIG.FROM_PERSONAL,
      to: [data.email],
      subject: processedSubject,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
        ${processedContent
          .split('\n')
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join('')}
      </div>`,
    });

    const validation = resendEmailResponseSchema.safeParse(response.data);
    if (!validation.success) {
      logger.warn('Welcome email response validation failed', {
        errors: validation.error.issues,
      });
    }
    return true;
  } catch (error) {
    logger.error('Failed to send welcome email', castError(error));
    return false;
  }
}

/**
 * Send notifications for high-value leads (Slack/Discord)
 * Returns void, logs errors internally
 */
export async function sendLeadNotifications(
  data: ContactFormData,
  leadScore: number,
  logger: Logger
): Promise<void> {
  try {
    await notifyHighValueLead({
      leadId: `contact-${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      service: data.service,
      budget: data.budget,
      timeline: data.timeline,
      leadScore: leadScore,
      leadQuality: leadScore >= LEAD_QUALITY_THRESHOLDS.HOT ? 'hot' : leadScore >= LEAD_QUALITY_THRESHOLDS.WARM ? 'warm' : 'cold',
      source: 'Contact Form',
    });
  } catch (error) {
    logger.error('Failed to send lead notifications', castError(error));
  }
}

/**
 * Schedule follow-up email sequence
 * Returns void, logs errors internally
 */
export async function scheduleFollowUpEmails(
  data: ContactFormData,
  sequenceId: LeadScoring['sequenceType'],
  emailVariables: ReturnType<typeof prepareEmailVariables>,
  logger: Logger
): Promise<void> {
  try {
    await scheduleEmailSequence(
      data.email,
      `${data.firstName} ${data.lastName}`,
      sequenceId,
      emailVariables
    );
  } catch (error) {
    logger.error('Failed to schedule email sequence', {
      error: castError(error),
      email: data.email,
      sequenceId
    });
  }
}
