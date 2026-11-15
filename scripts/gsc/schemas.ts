/**
 * Zod schemas for the Search Console responses the client validates (D11).
 * A leaf module: client.ts validates with them and types.ts infers
 * IndexStatus and AnalyticsRow from them, so the contracts file does not
 * depend on the HTTP client (IN-08, IN-09).
 */
import { z } from 'zod'

// Every field is an optional string, never a strict enum: Google adds and
// reserves enum values. One new value must not fail the whole run (D11).
export const IndexStatusSchema = z.object({
	verdict: z.string().optional(),
	coverageState: z.string().optional(),
	lastCrawlTime: z.string().optional(),
	googleCanonical: z.string().optional(),
	userCanonical: z.string().optional(),
	pageFetchState: z.string().optional(),
	robotsTxtState: z.string().optional(),
	indexingState: z.string().optional()
})

export const InspectResponseSchema = z.object({
	inspectionResult: z.object({
		inspectionResultLink: z.string().optional(),
		indexStatusResult: IndexStatusSchema.optional()
	})
})

export const AnalyticsRowSchema = z.object({
	keys: z.array(z.string()),
	clicks: z.number(),
	impressions: z.number(),
	ctr: z.number(),
	position: z.number()
})

// Google omits rows when the window has no data.
export const AnalyticsResponseSchema = z.object({
	rows: z.array(AnalyticsRowSchema).optional()
})
