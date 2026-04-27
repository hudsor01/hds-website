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

import { ContactAdminNotification } from '@/emails/contact-admin-notification'
import { ContactWelcome } from '@/emails/contact-welcome'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { LEAD_QUALITY_THRESHOLDS } from '@/lib/constants/lead-scoring'
import { getEmailSequences, replaceTemplateVariables } from '@/lib/email-utils'
import type { Logger } from '@/lib/logger'
import { notifyHighValueLead } from '@/lib/notifications'
import { getResendClient, isResendConfigured } from '@/lib/resend-client'
import { scheduleEmailSequence } from '@/lib/scheduled-emails'
import type { ContactFormData, LeadScoring } from '@/lib/schemas/contact'
import { resendEmailResponseSchema } from '@/lib/schemas/external'
import { detectInjectionAttempt } from '@/lib/utils'

const EMAIL_CONFIG = {
	FROM_ADMIN: `${BUSINESS_INFO.displayName} <noreply@hudsondigitalsolutions.com>`,
	FROM_PERSONAL: `Richard Hudson <${BUSINESS_INFO.email}>`,
	TO_ADMIN: BUSINESS_INFO.email
} as const

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
		data.company
	].filter(Boolean)

	const hasSuspiciousContent = fieldsToCheck.some(field =>
		detectInjectionAttempt(field as string)
	)

	if (hasSuspiciousContent) {
		logger.warn('Potential injection attempt detected', { clientIP })
	}

	return hasSuspiciousContent
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
		email: data.email
	}
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
		return false
	}

	try {
		const response = await getResendClient().emails.send({
			from: EMAIL_CONFIG.FROM_ADMIN,
			to: [EMAIL_CONFIG.TO_ADMIN],
			subject: `New Project Inquiry - ${data.firstName} ${data.lastName} (Score: ${leadScore})`,
			react: (
				<ContactAdminNotification
					firstName={data.firstName}
					lastName={data.lastName}
					email={data.email}
					phone={data.phone}
					company={data.company}
					service={data.service}
					budget={data.budget}
					timeline={data.timeline}
					message={data.message}
					leadScore={leadScore}
					sequenceId={sequenceId}
				/>
			)
		})

		const validation = resendEmailResponseSchema.safeParse(response.data)
		if (!validation.success) {
			logger.warn('Admin email response validation failed', {
				errors: validation.error.issues
			})
		}
		return true
	} catch (error) {
		logger.error('Failed to send admin notification', error)
		return false
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
		return false
	}

	const sequences = getEmailSequences()
	const sequence = sequences[sequenceId as keyof typeof sequences]
	if (!sequence) {
		return false
	}

	try {
		const processedContent = replaceTemplateVariables(
			sequence.content,
			emailVariables
		)
		const processedSubject = replaceTemplateVariables(
			sequence.subject,
			emailVariables
		)

		const response = await getResendClient().emails.send({
			from: EMAIL_CONFIG.FROM_PERSONAL,
			to: [data.email],
			subject: processedSubject,
			react: (
				<ContactWelcome subject={processedSubject} content={processedContent} />
			)
		})

		const validation = resendEmailResponseSchema.safeParse(response.data)
		if (!validation.success) {
			logger.warn('Welcome email response validation failed', {
				errors: validation.error.issues
			})
		}
		return true
	} catch (error) {
		logger.error('Failed to send welcome email', error)
		return false
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
			leadQuality:
				leadScore >= LEAD_QUALITY_THRESHOLDS.HOT
					? 'hot'
					: leadScore >= LEAD_QUALITY_THRESHOLDS.WARM
						? 'warm'
						: 'cold',
			source: 'Contact Form'
		})
	} catch (error) {
		logger.error('Failed to send lead notifications', error)
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
		)
	} catch (error) {
		logger.error('Failed to schedule email sequence', error, {
			metadata: { email: data.email, sequenceId }
		})
	}
}
