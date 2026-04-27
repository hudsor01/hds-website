/**
 * Scheduled Email System
 * Handles delayed email sequences and automated follow-ups
 * Uses Drizzle ORM with Neon for persistent storage
 */

import { and, asc, eq, lt, lte } from 'drizzle-orm'
import { ScheduledDrip } from '@/emails/scheduled-drip'
import { env } from '@/env'
import { db } from '@/lib/db'
import { createServerLogger } from '@/lib/logger'
import { getResendClient, isResendConfigured } from '@/lib/resend-client'
import {
	cancelEmailSequenceParamsSchema,
	type EmailSequenceId,
	type ScheduleEmailParams,
	scheduleEmailParamsSchema
} from '@/lib/schemas/email'
import { type ScheduledEmail, scheduledEmails } from '@/lib/schemas/emails'
import { resendEmailResponseSchema } from '@/lib/schemas/external'
import type { EmailProcessResult, EmailQueueStats } from '@/types/utils'
import { BUSINESS_INFO } from './constants/business'
import { getEmailSequences, replaceTemplateVariables } from './email-utils'
import { sanitizeEmailHeader } from './utils'

// Create logger instance for email operations
const emailLogger = createServerLogger()
emailLogger.setContext({
	component: 'scheduled-emails',
	service: 'email-queue'
})

export async function scheduleEmail(
	params: ScheduleEmailParams
): Promise<void> {
	const {
		recipientEmail,
		recipientName,
		sequenceId,
		stepId,
		scheduledFor,
		variables
	} = params

	// Validate input parameters
	const validation = scheduleEmailParamsSchema.safeParse(params)

	if (!validation.success) {
		emailLogger.error('Invalid email scheduling parameters', {
			recipientEmail,
			recipientName,
			sequenceId,
			stepId,
			errors: validation.error.issues
		})
		return
	}

	try {
		const [inserted] = await db
			.insert(scheduledEmails)
			.values({
				recipientEmail,
				recipientName,
				sequenceId,
				stepId,
				scheduledFor,
				variables,
				status: 'pending'
			})
			.returning()

		// Log email scheduling with metrics
		emailLogger.info('Email scheduled for delivery', {
			emailId: inserted?.id,
			recipientEmail,
			recipientName,
			sequenceId,
			stepId,
			scheduledFor: scheduledFor.toISOString()
		})
	} catch (error) {
		emailLogger.error('Failed to schedule email', {
			error: error instanceof Error ? error.message : String(error),
			recipientEmail,
			sequenceId,
			stepId
		})
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
	const sequences = getEmailSequences() as Record<
		string,
		{ subject: string; content: string }
	>
	const sequence = sequences[sequenceId]
	if (!sequence) {
		emailLogger.error('Email sequence not found', {
			sequenceId,
			recipientEmail,
			availableSequences: Object.keys(sequences)
		})
		return
	}

	// Schedule a follow-up email for 3 days from now (if it's not the welcome email)
	if (sequenceId !== 'standard-welcome') {
		const scheduledFor = new Date()
		scheduledFor.setDate(scheduledFor.getDate() + 3) // 3 days follow-up

		await scheduleEmail({
			recipientEmail,
			recipientName,
			sequenceId,
			stepId: 'followup',
			scheduledFor,
			variables
		})
	}
}

/**
 * Process pending scheduled emails
 * This would typically be called by a cron job or scheduled task
 */
export async function processPendingEmails(): Promise<void> {
	const now = new Date()

	try {
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
			.limit(100)

		emailLogger.info('Starting email queue processing', {
			pendingCount: pendingEmails.length,
			processTime: now.toISOString()
		})

		// Process each email
		for (const scheduledEmail of pendingEmails) {
			try {
				await sendScheduledEmail(scheduledEmail)
			} catch (error) {
				emailLogger.error('Failed to process scheduled email', {
					emailId: scheduledEmail.id,
					recipientEmail: scheduledEmail.recipientEmail,
					sequenceId: scheduledEmail.sequenceId,
					error: error instanceof Error ? error.message : String(error)
				})

				const errorMsg = error instanceof Error ? error.message : String(error)

				// Increment retry count
				await db
					.update(scheduledEmails)
					.set({
						retryCount: scheduledEmail.retryCount + 1,
						error: errorMsg,
						status: scheduledEmail.retryCount >= 2 ? 'failed' : 'pending'
					})
					.where(eq(scheduledEmails.id, scheduledEmail.id))
			}
		}
	} catch (error) {
		emailLogger.error('Exception in processPendingEmails', {
			error: error instanceof Error ? error.message : String(error)
		})
	}
}

/**
 * Send a scheduled email
 */
async function sendScheduledEmail(
	scheduledEmail: ScheduledEmail
): Promise<void> {
	if (!isResendConfigured()) {
		const errorMsg = 'Email service not configured'
		emailLogger.warn('Resend API not configured', {
			emailId: scheduledEmail.id,
			recipientEmail: scheduledEmail.recipientEmail,
			environment: env.NODE_ENV,
			hasApiKey: !!env.RESEND_API_KEY
		})

		await db
			.update(scheduledEmails)
			.set({
				status: 'failed',
				error: errorMsg
			})
			.where(eq(scheduledEmails.id, scheduledEmail.id))

		return
	}

	const sequences = getEmailSequences() as Record<
		string,
		{ subject: string; content: string }
	>
	const sequence = sequences[scheduledEmail.sequenceId]

	if (!sequence) {
		const errorMsg = `Email sequence not found: ${scheduledEmail.sequenceId}`

		await db
			.update(scheduledEmails)
			.set({
				status: 'failed',
				error: errorMsg
			})
			.where(eq(scheduledEmails.id, scheduledEmail.id))

		emailLogger.error('Email sequence missing during send', {
			emailId: scheduledEmail.id,
			recipientEmail: scheduledEmail.recipientEmail,
			missingSequenceId: scheduledEmail.sequenceId,
			availableSequences: Object.keys(sequences)
		})

		return
	}

	// Process template variables
	const variables = (scheduledEmail.variables as Record<string, string>) || {}
	const processedSubject = replaceTemplateVariables(sequence.subject, variables)
	const processedContent = replaceTemplateVariables(sequence.content, variables)

	try {
		const emailResponse = await getResendClient().emails.send({
			from: `Richard Hudson <${BUSINESS_INFO.email}>`,
			to: [scheduledEmail.recipientEmail],
			subject: sanitizeEmailHeader(processedSubject),
			react: (
				<ScheduledDrip
					subject={processedSubject}
					content={processedContent}
					recipientEmail={scheduledEmail.recipientEmail}
				/>
			)
		})

		// Validate Resend response
		const responseValidation = resendEmailResponseSchema.safeParse(
			emailResponse.data
		)
		if (!responseValidation.success) {
			emailLogger.warn('Resend email response validation failed', {
				emailId: scheduledEmail.id,
				recipientEmail: scheduledEmail.recipientEmail,
				response: emailResponse.data,
				errors: responseValidation.error.issues
			})
		}

		// Update status in database
		await db
			.update(scheduledEmails)
			.set({
				status: 'sent',
				sentAt: new Date()
			})
			.where(eq(scheduledEmails.id, scheduledEmail.id))

		emailLogger.info('Email sent successfully', {
			emailId: scheduledEmail.id,
			recipientEmail: scheduledEmail.recipientEmail,
			recipientName: scheduledEmail.recipientName,
			subject: processedSubject,
			sequenceId: scheduledEmail.sequenceId
		})
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : 'Unknown error'

		// Update status in database
		await db
			.update(scheduledEmails)
			.set({
				status: scheduledEmail.retryCount >= 2 ? 'failed' : 'pending',
				error: errorMsg,
				retryCount: scheduledEmail.retryCount + 1
			})
			.where(eq(scheduledEmails.id, scheduledEmail.id))

		emailLogger.error('Email delivery failed', {
			emailId: scheduledEmail.id,
			recipientEmail: scheduledEmail.recipientEmail,
			subject: processedSubject,
			sequenceId: scheduledEmail.sequenceId,
			errorMessage: errorMsg,
			errorStack: error instanceof Error ? error.stack : undefined,
			retryCount: scheduledEmail.retryCount + 1
		})
	}
}

/**
 * Get statistics about scheduled emails from database
 */
export async function getEmailQueueStats(): Promise<EmailQueueStats> {
	try {
		const data = await db
			.select({ status: scheduledEmails.status })
			.from(scheduledEmails)

		const stats = {
			pending: data.filter(
				(e: { status: string | null }) => e.status === 'pending'
			).length,
			sent: data.filter((e: { status: string | null }) => e.status === 'sent')
				.length,
			failed: data.filter(
				(e: { status: string | null }) => e.status === 'failed'
			).length,
			total: data.length
		}

		return stats
	} catch (error) {
		emailLogger.error('Exception fetching email queue stats', {
			error: error instanceof Error ? error.message : String(error)
		})

		return {
			pending: 0,
			sent: 0,
			failed: 0,
			total: 0
		}
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
		sequenceId
	})

	if (!validation.success) {
		emailLogger.error('Invalid email cancellation parameters', {
			recipientEmail,
			sequenceId,
			errors: validation.error.issues
		})
		return
	}

	try {
		const conditions = [
			eq(scheduledEmails.recipientEmail, recipientEmail),
			eq(scheduledEmails.status, 'pending')
		]

		if (sequenceId) {
			conditions.push(eq(scheduledEmails.sequenceId, sequenceId))
		}

		await db.delete(scheduledEmails).where(and(...conditions))

		emailLogger.info('Email sequence cancelled', {
			recipientEmail,
			sequenceId: sequenceId || 'all'
		})
	} catch (error) {
		emailLogger.error('Exception cancelling email sequence', {
			error: error instanceof Error ? error.message : String(error),
			recipientEmail,
			sequenceId
		})
	}
}

/**
 * API endpoint to manually trigger email processing
 * This would typically be called by a cron job
 */
export async function processEmailsEndpoint(): Promise<EmailProcessResult> {
	const beforeStats = await getEmailQueueStats()

	try {
		await processPendingEmails()
		const afterStats = await getEmailQueueStats()

		return {
			success: true,
			processed: afterStats.sent - beforeStats.sent,
			errors: afterStats.failed - beforeStats.failed
		}
	} catch (error) {
		emailLogger.error('Email queue processing failed', {
			beforeStats,
			error: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined
		})

		return {
			success: false,
			processed: 0,
			errors: 1
		}
	}
}
