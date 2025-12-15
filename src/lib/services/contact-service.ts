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
import { DISPLAY_CATEGORY_THRESHOLDS } from '@/lib/constants/lead-scoring';
import { getResendClient, isResendConfigured } from '@/lib/resend-client';
import { getEmailSequences, processEmailTemplate } from '@/lib/email-utils';
import { resendEmailResponseSchema } from '@/lib/schemas/external';
import type { ContactFormData, LeadScoring } from '@/lib/schemas/contact';
import { detectInjectionAttempt, escapeHtml } from '@/lib/utils';
import { castError, type Logger } from '@/lib/logger';

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
 * Generate HTML for admin notification email
 * Includes contact details and lead intelligence scoring
 */
export function generateAdminNotificationHTML(
  data: ContactFormData,
  leadScore?: number,
  sequenceId?: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #0891b2;">New Contact Form Submission</h1>

      <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2>Contact Information</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
        ${data.phone ? `<p><strong>Phone:</strong> <a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></p>` : ''}
        ${data.company ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>` : ''}
        ${data.service ? `<p><strong>Service Interest:</strong> ${escapeHtml(data.service)}</p>` : ''}
        ${data.budget ? `<p><strong>Budget:</strong> ${escapeHtml(data.budget)}</p>` : ''}
        ${data.timeline ? `<p><strong>Timeline:</strong> ${escapeHtml(data.timeline)}</p>` : ''}
      </div>

      ${leadScore ? `
      <div style="background: ${leadScore >= DISPLAY_CATEGORY_THRESHOLDS.HIGH_PRIORITY ? '#dcfce7' : leadScore >= DISPLAY_CATEGORY_THRESHOLDS.QUALIFIED ? '#fef3c7' : '#fef2f2'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: ${leadScore >= DISPLAY_CATEGORY_THRESHOLDS.HIGH_PRIORITY ? '#15803d' : leadScore >= DISPLAY_CATEGORY_THRESHOLDS.QUALIFIED ? '#d97706' : '#dc2626'};">Lead Intelligence</h2>
        <p><strong>Lead Score:</strong> ${leadScore}/100 ${
          leadScore >= DISPLAY_CATEGORY_THRESHOLDS.HIGH_PRIORITY ? '(HIGH PRIORITY)' : leadScore >= DISPLAY_CATEGORY_THRESHOLDS.QUALIFIED ? '(QUALIFIED)' : '(NURTURE)'
        }</p>
        <p><strong>Email Sequence:</strong> ${sequenceId || 'standard-welcome'}</p>
        <p><strong>Recommended Action:</strong> ${
          leadScore >= DISPLAY_CATEGORY_THRESHOLDS.HIGH_PRIORITY
            ? 'Schedule call within 24 hours'
            : leadScore >= DISPLAY_CATEGORY_THRESHOLDS.QUALIFIED
            ? 'Follow up within 2-3 days'
            : 'Add to nurture sequence'
        }</p>
      </div>
      ` : ''}

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
        <h2>Message</h2>
        <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      </div>

      <p style="margin-top: 30px; color: #64748b; font-size: 12px;">
        Submitted: ${new Date().toLocaleString()}<br>
        Source: Hudson Digital Solutions Contact Form<br>
        ${leadScore ? `Lead Score: ${leadScore}/100 | Sequence: ${sequenceId}` : ''}
      </p>
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
