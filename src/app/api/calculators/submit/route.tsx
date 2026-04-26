/**
 * Calculator Submission API
 * Stores calculator results and triggers email sequences
 */

import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { CalculatorAdminNotification } from '@/emails/calculator-admin-notification'
import { CalculatorResults } from '@/emails/calculator-results'
import { withRateLimit } from '@/lib/api/rate-limit-wrapper'
import {
	errorResponse,
	successResponse,
	validationErrorResponse
} from '@/lib/api/responses'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { db } from '@/lib/db'
import { createServerLogger } from '@/lib/logger'
import { notifyHighValueLead } from '@/lib/notifications'
import { getResendClient, isResendConfigured } from '@/lib/resend-client'
import { scheduleEmail } from '@/lib/scheduled-emails'
import { calculatorLeads } from '@/lib/schemas/leads'

// Schema for calculator submission
const calculatorSubmitSchema = z.object({
	calculator_type: z.enum([
		'roi-calculator',
		'cost-estimator',
		'performance-calculator',
		'texas-ttl-calculator'
	]),
	email: z.string().email('Invalid email address').toLowerCase().trim(),
	inputs: z.record(z.string(), z.unknown()),
	results: z.record(z.string(), z.unknown()).optional().default({})
})

const logger = createServerLogger('calculator-api')

// Lead scoring based on calculator inputs
function calculateLeadScore(
	calculatorType: string,
	inputs: Record<string, unknown>
): number {
	let score = 50 // Base score

	switch (calculatorType) {
		case 'roi-calculator': {
			// Higher traffic + lower conversion = higher opportunity
			const traffic = Number(inputs.monthlyTraffic) || 0
			const conversion = Number(inputs.conversionRate) || 0

			if (traffic > 50000) {
				score += 20
			} else if (traffic > 10000) {
				score += 10
			}

			if (conversion < 1) {
				score += 15
			} else if (conversion < 2) {
				score += 10
			}

			break
		}

		case 'cost-estimator': {
			// Larger projects = higher score
			const pages = Number(inputs.numberOfPages) || 0
			const features = (inputs.features as string[])?.length || 0

			if (pages > 10) {
				score += 15
			}
			if (features > 5) {
				score += 15
			}

			if (inputs.timeline === 'urgent') {
				score += 10
			}
			if (inputs.budget === 'high') {
				score += 10
			}

			break
		}

		case 'performance-calculator': {
			// Poor performance + high traffic = high priority
			const pageSpeed = Number(inputs.pageSpeedScore) || 100
			const monthlyVisitors = Number(inputs.monthlyVisitors) || 0

			if (pageSpeed < 50) {
				score += 20
			} else if (pageSpeed < 70) {
				score += 10
			}

			if (monthlyVisitors > 50000) {
				score += 15
			} else if (monthlyVisitors > 10000) {
				score += 10
			}

			break
		}
	}

	return Math.min(100, Math.max(0, score))
}

// Determine lead quality
function getLeadQuality(score: number): 'hot' | 'warm' | 'cold' {
	if (score >= 75) {
		return 'hot'
	}
	if (score >= 50) {
		return 'warm'
	}
	return 'cold'
}

async function handleCalculatorSubmit(request: NextRequest) {
	try {
		const body = await request.json()

		// Validate with Zod schema
		const parseResult = calculatorSubmitSchema.safeParse(body)
		if (!parseResult.success) {
			logger.warn('Invalid calculator submission', {
				errors: parseResult.error.issues
			})
			return validationErrorResponse(parseResult.error)
		}

		const { calculator_type, email, inputs, results } = parseResult.data

		// Calculate lead score
		const leadScore = calculateLeadScore(calculator_type, inputs)
		const leadQuality = getLeadQuality(leadScore)

		logger.info('Calculator submission received', {
			calculator_type,
			email,
			leadScore,
			leadQuality
		})

		// Store in database
		const [calculatorLead] = await db
			.insert(calculatorLeads)
			.values({
				calculatorType: calculator_type as string,
				email,
				name: typeof inputs.name === 'string' ? inputs.name : null,
				company: typeof inputs.company === 'string' ? inputs.company : null,
				phone: typeof inputs.phone === 'string' ? inputs.phone : null,
				inputs: inputs,
				results: results || {},
				leadScore: leadScore,
				leadQuality: leadQuality
			})
			.returning()

		if (!calculatorLead) {
			logger.error('Failed to store calculator lead - no row returned')
			return errorResponse('Failed to store submission', 500)
		}

		// Send immediate email with results
		if (isResendConfigured()) {
			try {
				await getResendClient().emails.send({
					from: `Hudson Digital Solutions <noreply@hudsondigitalsolutions.com>`,
					to: email,
					subject: `Your ${getCalculatorName(calculator_type)} Results`,
					react: (
						<CalculatorResults
							calculatorName={getCalculatorName(calculator_type)}
							results={results || {}}
						/>
					)
				})

				logger.info('Results email sent', { email, calculator_type })
			} catch (emailError) {
				logger.error('Failed to send results email', emailError)
				// Don't fail the request if email fails
			}

			try {
				const inputName = typeof inputs.name === 'string' ? inputs.name : ''
				const company = typeof inputs.company === 'string' ? inputs.company : ''

				await getResendClient().emails.send({
					from: `Hudson Digital Solutions <noreply@hudsondigitalsolutions.com>`,
					to: BUSINESS_INFO.email,
					subject: `[Notification] New ${getCalculatorName(calculator_type)} Submission (${leadQuality.toUpperCase()})`,
					react: (
						<CalculatorAdminNotification
							calculatorName={getCalculatorName(calculator_type)}
							email={email}
							name={inputName || undefined}
							company={company || undefined}
							leadScore={leadScore}
							leadQuality={leadQuality}
						/>
					)
				})

				logger.info('Admin notification sent', { email, calculator_type })
			} catch (adminEmailError) {
				logger.error('Failed to send admin notification', adminEmailError)
				// Don't fail the request if admin email fails
			}
		}

		// Extract name for notifications
		const inputName = typeof inputs.name === 'string' ? inputs.name : ''
		const nameParts = inputName.split(' ')
		const firstName = nameParts[0] || email.split('@')[0] || ''
		const lastName = nameParts.slice(1).join(' ') || ''

		// Send high-value lead notifications to Slack/Discord
		try {
			await notifyHighValueLead({
				leadId: calculatorLead.id,
				firstName,
				lastName,
				email,
				phone: typeof inputs.phone === 'string' ? inputs.phone : undefined,
				company:
					typeof inputs.company === 'string' ? inputs.company : undefined,
				leadScore: leadScore,
				leadQuality: leadQuality,
				source: `Calculator - ${getCalculatorName(calculator_type)}`,
				calculatorType: calculator_type
			})
		} catch (notificationError) {
			// Log but don't fail the submission if notifications fail
			logger.error('Failed to send lead notifications', notificationError)
		}

		// Schedule follow-up emails based on lead quality
		const sequenceId =
			leadQuality === 'hot' ? 'calculator-hot-lead' : 'calculator-follow-up'

		try {
			await scheduleEmail({
				recipientEmail: email,
				recipientName: inputName || email.split('@')[0] || 'there',
				sequenceId,
				stepId: 'followup-1',
				scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
				variables: {
					calculator_type: getCalculatorName(calculator_type),
					lead_score: leadScore.toString()
				}
			})

			logger.info('Follow-up email scheduled', { email, sequenceId })
		} catch (scheduleError) {
			logger.error('Failed to schedule follow-up', scheduleError)
		}

		return successResponse({
			lead_id: calculatorLead.id,
			lead_score: leadScore,
			lead_quality: leadQuality
		})
	} catch (error) {
		logger.error(
			'Calculator API error',
			error instanceof Error ? error : new Error(String(error))
		)
		return errorResponse('Failed to process submission', 500)
	}
}

export const POST = withRateLimit(handleCalculatorSubmit, 'contactForm')

// Helper functions
function getCalculatorName(type: string): string {
	const names: Record<string, string> = {
		'roi-calculator': 'ROI Calculator',
		'cost-estimator': 'Website Cost Estimator',
		'performance-calculator': 'Performance Savings Calculator'
	}
	return names[type] || 'Calculator'
}
