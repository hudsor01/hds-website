/**
 * External Service Validation Schemas
 *
 * Zod schemas for validating external API requests and responses.
 */

import { z } from 'zod'

// ============================================================================
// Resend Email API Schemas
// ============================================================================

export const resendEmailResponseSchema = z.object({
	id: z.string().uuid(),
	from: z.string().email(),
	to: z.array(z.string().email()),
	created_at: z.string().datetime()
})
