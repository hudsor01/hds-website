/**
 * Shared Email Template Utilities
 * Consolidates duplicate HTML email generation logic
 */

import { escapeHtml } from './utils';

/**
 * Base email wrapper with consistent styling
 */
function emailWrapper(content: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${content}
    </div>
  `;
}

/**
 * Email section with background and padding
 */
function emailSection(
  title: string,
  content: string,
  bgColor: string = 'white',
  borderColor: string = '#e2e8f0'
): string {
  return `
    <div style="background: ${bgColor}; padding: 20px; border: 1px solid ${borderColor}; border-radius: 8px; margin: 20px 0;">
      <h2>${title}</h2>
      ${content}
    </div>
  `;
}

/**
 * Lead score badge with color coding
 */
function leadScoreBadge(score: number, sequenceId?: string): string {
  const bgColor = score >= 70 ? "#dcfce7" : score >= 40 ? "#fef3c7" : "#fef2f2";
  const textColor = score >= 70 ? "#15803d" : score >= 40 ? "#d97706" : "#dc2626";
  const priority = score >= 70 ? "(HIGH PRIORITY)" : score >= 40 ? "(QUALIFIED)" : "(NURTURE)";
  const action = score >= 70
    ? "Schedule call within 24 hours"
    : score >= 40
    ? "Follow up within 2-3 days"
    : "Add to nurture sequence";

  return `
    <div style="background: ${bgColor}; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: ${textColor};">Lead Intelligence</h2>
      <p><strong>Lead Score:</strong> ${score}/100 ${priority}</p>
      ${sequenceId ? `<p><strong>Email Sequence:</strong> ${sequenceId}</p>` : ''}
      <p><strong>Recommended Action:</strong> ${action}</p>
    </div>
  `;
}

/**
 * Email footer with timestamp and source
 */
function emailFooter(source: string, additionalInfo?: string): string {
  return `
    <p style="margin-top: 30px; color: #64748b; font-size: 12px;">
      Submitted: ${new Date().toLocaleString()}<br>
      Source: ${source}
      ${additionalInfo ? `<br>${additionalInfo}` : ''}
    </p>
  `;
}

/**
 * Generate admin notification for contact form submissions
 */
export function generateContactFormNotification(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  message: string;
  leadScore?: number;
  sequenceId?: string;
}): string {
  const { firstName, lastName, email, phone, company, service, budget, timeline, message, leadScore, sequenceId } = data;

  const contactInfo = `
    <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></p>` : ""}
    ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ""}
    ${service ? `<p><strong>Service Interest:</strong> ${escapeHtml(service)}</p>` : ""}
    ${budget ? `<p><strong>Budget:</strong> ${escapeHtml(budget)}</p>` : ""}
    ${timeline ? `<p><strong>Timeline:</strong> ${escapeHtml(timeline)}</p>` : ""}
  `;

  const messageSection = `
    <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
      <h2>Message</h2>
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  const content = `
    <h1 style="color: #0891b2;">New Contact Form Submission</h1>
    ${emailSection('Contact Information', contactInfo)}
    ${leadScore ? leadScoreBadge(leadScore, sequenceId) : ''}
    ${messageSection}
    ${emailFooter('Hudson Digital Solutions Contact Form', leadScore ? `Lead Score: ${leadScore}/100 | Sequence: ${sequenceId}` : '')}
  `;

  return emailWrapper(content);
}

/**
 * Generate admin notification for lead magnet downloads
 */
export function generateLeadMagnetNotification(data: {
  firstName: string;
  email: string;
  resourceTitle: string;
}): string {
  const leadInfo = `
    <p><strong>Name:</strong> ${escapeHtml(data.firstName)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
    <p><strong>Resource Downloaded:</strong> ${data.resourceTitle}</p>
    <p><strong>Download Time:</strong> ${new Date().toLocaleString()}</p>
  `;

  const followUpActions = `
    <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
      <h2>Recommended Follow-up Actions</h2>
      <ul>
        <li>Add to CRM/email marketing system</li>
        <li>Tag as "${data.resourceTitle}" lead</li>
        <li>Schedule follow-up email sequence</li>
        <li>Consider for strategic consultation offer</li>
      </ul>
    </div>
  `;

  const content = `
    <h1 style="color: #0891b2;">New Lead Magnet Download</h1>
    ${emailSection('Lead Information', leadInfo)}
    ${followUpActions}
    ${emailFooter('Hudson Digital Solutions Lead Magnet System')}
  `;

  return emailWrapper(content);
}

/**
 * Generate welcome email for lead magnet downloads
 */
export function generateLeadMagnetWelcomeEmail(data: {
  firstName: string;
  resourceTitle: string;
  downloadUrl: string;
}): string {
  const content = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
      <h1 style="color: #0891b2; margin-bottom: 24px;">
        Thanks for downloading ${data.resourceTitle}!
      </h1>

      <p style="font-size: 16px; color: #1e293b; margin-bottom: 16px;">
        Hi ${escapeHtml(data.firstName)},
      </p>

      <p style="font-size: 16px; color: #1e293b; margin-bottom: 16px;">
        Thank you for your interest in our ${data.resourceTitle}. Your download is ready!
      </p>

      <div style="background: #f1f5f9; padding: 24px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b;">
          <strong>Click below to access your resource:</strong>
        </p>
        <a href="${data.downloadUrl}"
           style="display: inline-block; background: #0891b2; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Download Now
        </a>
      </div>

      <div style="margin: 32px 0;">
        <p style="font-size: 16px; color: #1e293b; margin-bottom: 12px;">
          <strong>What's Next?</strong>
        </p>
        <ul style="color: #475569; font-size: 15px;">
          <li style="margin-bottom: 8px;">Review the materials at your own pace</li>
          <li style="margin-bottom: 8px;">Apply the strategies to your business</li>
          <li style="margin-bottom: 8px;">Reach out if you have questions or need implementation help</li>
        </ul>
      </div>

      <div style="background: linear-gradient(135deg, rgba(8, 145, 178, 0.1), rgba(16, 185, 129, 0.1)); padding: 24px; border-radius: 8px; border: 1px solid rgba(8, 145, 178, 0.2);">
        <p style="font-size: 16px; color: #1e293b; margin-bottom: 16px;">
          <strong>Need Help Implementing?</strong>
        </p>
        <p style="font-size: 15px; color: #475569; margin-bottom: 16px;">
          We offer strategic consultations to help you apply these concepts to your specific business needs.
        </p>
        <a href="https://hudsondigitalsolutions.com/contact"
           style="display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
          Schedule a Consultation
        </a>
      </div>

      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          Best regards,<br>
          <strong style="color: #1e293b;">Richard Hudson</strong><br>
          Hudson Digital Solutions
        </p>
        <p style="color: #94a3b8; font-size: 12px;">
          Hudson Digital Solutions<br>
          Professional Web Development & Business Growth Strategy
        </p>
      </div>
    </div>
  `;

  return content;
}
