/**
 * PageSpeed Insights schemas.
 *
 * Two boundaries: the upstream Google PSI v5 response (validated in
 * /api/pagespeed) and the route's own JSON contract (validated in the
 * browser by the performance calculator).
 */

import { z } from 'zod'

// ============================================================================
// Upstream: Google PageSpeed Insights v5 runPagespeed
// ============================================================================

const psiAuditSchema = z.object({
	displayValue: z.string().optional(),
	numericValue: z.number().optional(),
	score: z.number().nullable().optional()
})

/**
 * Only the fields the route reads. Lighthouse reports a failed run with a
 * `runtimeError` and a null category score instead of an HTTP error, so
 * both are modelled explicitly.
 */
export const psiResponseSchema = z.object({
	lighthouseResult: z.object({
		runtimeError: z
			.object({
				code: z.string(),
				message: z.string().optional()
			})
			.optional(),
		categories: z
			.object({
				performance: z
					.object({ score: z.number().min(0).max(1).nullable() })
					.optional()
			})
			.optional(),
		audits: z.record(z.string(), psiAuditSchema).optional()
	})
})

export type PsiResponse = z.infer<typeof psiResponseSchema>

// ============================================================================
// /api/pagespeed response contract
// ============================================================================

const labMetricSchema = z.object({
	/** Lighthouse's formatted value, e.g. "3.2 s", "450 ms", "0.05" */
	displayValue: z.string(),
	/** Raw value: milliseconds for timings, unitless for CLS */
	numericValue: z.number().nullable()
})

export type LabMetric = z.infer<typeof labMetricSchema>

const pagespeedMetricsSchema = z.object({
	performanceScore: z.number().int().min(0).max(100),
	lcp: labMetricSchema,
	cls: labMetricSchema,
	tbt: labMetricSchema,
	fcp: labMetricSchema
})

export type PagespeedMetrics = z.infer<typeof pagespeedMetricsSchema>

/** Shape of successResponse({ metrics }) from src/lib/api/responses.ts */
export const pagespeedSuccessSchema = z.object({
	success: z.literal(true),
	data: z.object({ metrics: pagespeedMetricsSchema })
})

/** Shape of errorResponse(message) from src/lib/api/responses.ts */
export const apiErrorSchema = z.object({
	success: z.literal(false),
	error: z.string()
})
