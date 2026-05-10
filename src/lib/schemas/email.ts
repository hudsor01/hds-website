/**
 * Email Scheduling Validation Schemas
 */

import { z } from 'zod'
import { emailSchema, nameSchema } from './common'

const emailSequenceIdSchema = z.enum([
	'standard-welcome',
	'standard-consultation-followup',
	'standard-long-term-nurture',
	'standard-high-intent',
	'calculator-hot-lead',
	'calculator-follow-up',
	'high-value-consultation',
	'targeted-service-consultation',
	'enterprise-nurture'
])

export type EmailSequenceId = z.infer<typeof emailSequenceIdSchema>

const emailTemplateVariablesSchema = z.record(z.string(), z.string())

export const scheduleEmailParamsSchema = z.object({
	recipientEmail: emailSchema,
	recipientName: nameSchema,
	sequenceId: emailSequenceIdSchema,
	stepId: z.string(),
	scheduledFor: z.date(),
	variables: emailTemplateVariablesSchema
})

export type ScheduleEmailParams = z.infer<typeof scheduleEmailParamsSchema>
