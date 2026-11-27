/**
 * Error Report Validation Schema
 *
 * Zod schema for the client-originated error-boundary report POSTed to
 * /api/error-report. The `.max()` length caps are the input-validation
 * control (sanity bounds against oversized stacks / malformed bodies);
 * the route rejects anything that fails this shape with a 400.
 *
 * Own-file schema by project convention: NOT added to the Drizzle table
 * barrel (src/lib/schemas/schema.ts) — that barrel holds table definitions
 * only.
 */

import { z } from 'zod'

export const errorReportSchema = z.object({
	message: z.string().min(1).max(2_000),
	stack: z.string().max(10_000).optional(),
	url: z.string().url().max(2_000),
	userAgent: z.string().max(1_000),
	timestamp: z.string().datetime(),
	platform: z.string().max(200).optional(),
	language: z.string().max(50).optional()
})

export type ErrorReport = z.infer<typeof errorReportSchema>
