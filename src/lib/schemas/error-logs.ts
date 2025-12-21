import { z } from 'zod'

/**
 * Error Logs API Query Parameter Schemas
 * Used for validating query params in error logging admin endpoints
 */

export const timeRangeSchema = z.enum(['1h', '24h', '7d', '30d'])
export type TimeRange = z.infer<typeof timeRangeSchema>

export const errorLevelSchema = z.enum(['error', 'fatal'])
export type ErrorLevel = z.infer<typeof errorLevelSchema>

export const resolvedFilterSchema = z.enum(['true', 'false', 'all'])
export type ResolvedFilter = z.infer<typeof resolvedFilterSchema>

export const errorLogsQuerySchema = z.object({
  timeRange: timeRangeSchema.default('24h'),
  errorType: z.string().max(100).optional(),
  route: z.string().max(200).optional(),
  level: errorLevelSchema.optional(),
  search: z.string().max(200).optional(),
  resolved: resolvedFilterSchema.default('all'),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})
export type ErrorLogsQuery = z.infer<typeof errorLogsQuerySchema>

export const resolveErrorSchema = z.object({
  resolved: z.boolean(),
})
export type ResolveError = z.infer<typeof resolveErrorSchema>
