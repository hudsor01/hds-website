import { z } from 'zod';

/**
 * Query Parameter Validation Schemas
 * Used for validating URL search params in API routes and pages
 */

// ============================================
// Analytics API Schemas
// ============================================

export const leadQualitySchema = z.enum(['hot', 'warm', 'cold']);
export type LeadQuality = z.infer<typeof leadQualitySchema>;

export const calculatorTypeSchema = z.enum([
  'roi-calculator',
  'cost-estimator',
  'performance-calculator',
  'texas-ttl-calculator',
]);
export type CalculatorType = z.infer<typeof calculatorTypeSchema>;

// Whitelist of allowed sort columns to prevent SQL injection
export const leadSortBySchema = z.enum([
  'created_at',
  'lead_score',
  'email',
  'calculator_type',
  'lead_quality',
]);
export type LeadSortBy = z.infer<typeof leadSortBySchema>;

export const sortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof sortOrderSchema>;

export const analyticsLeadsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(1000).default(50),
  quality: leadQualitySchema.optional(),
  type: calculatorTypeSchema.optional(),
  sortBy: leadSortBySchema.default('created_at'),
  sortOrder: sortOrderSchema.default('desc'),
});
export type AnalyticsLeadsQuery = z.infer<typeof analyticsLeadsQuerySchema>;

export const analyticsOverviewQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
});
export type AnalyticsOverviewQuery = z.infer<typeof analyticsOverviewQuerySchema>;

export const analyticsTrendsQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
});
export type AnalyticsTrendsQuery = z.infer<typeof analyticsTrendsQuerySchema>;

export const analyticsExportQuerySchema = z.object({
  quality: leadQualitySchema.optional(),
  type: calculatorTypeSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
export type AnalyticsExportQuery = z.infer<typeof analyticsExportQuerySchema>;

// ============================================
// Case Studies API Schemas
// ============================================

export const industrySchema = z.enum([
  'saas',
  'ecommerce',
  'healthcare',
  'fintech',
  'real-estate',
  'education',
  'manufacturing',
  'other',
]);
export type Industry = z.infer<typeof industrySchema>;

export const caseStudiesQuerySchema = z.object({
  industry: industrySchema.optional(),
  featured: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
});
export type CaseStudiesQuery = z.infer<typeof caseStudiesQuerySchema>;

// ============================================
// Testimonials API Schemas
// ============================================

export const testimonialQuerySchema = z.object({
  all: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});
export type TestimonialQuery = z.infer<typeof testimonialQuerySchema>;

// Helper: optional string that treats empty strings as undefined
const optionalString = (maxLength = 100) =>
  z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().max(maxLength).optional()
  );

// Helper: optional URL that treats empty strings as undefined
const optionalUrl = () =>
  z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().url().optional()
  );

// Helper: optional token with min length
const optionalToken = () =>
  z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().min(1).max(100).optional()
  );

export const testimonialSubmitSchema = z.object({
  request_id: z.string().uuid().optional(),
  token: optionalToken(),
  client_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  company: optionalString(100),
  role: optionalString(100),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  content: z
    .string()
    .min(20, 'Testimonial must be at least 20 characters')
    .max(2000, 'Testimonial must be less than 2000 characters')
    .trim(),
  photo_url: optionalUrl(),
  video_url: optionalUrl(),
  service_type: optionalString(100),
});
export type TestimonialSubmit = z.infer<typeof testimonialSubmitSchema>;

// ============================================
// Analytics Dashboard URL State (for nuqs)
// ============================================

export const timeRangeSchema = z.enum(['7', '30', '90', '365']);
export type TimeRange = z.infer<typeof timeRangeSchema>;

export const dashboardFiltersSchema = z.object({
  timeRange: timeRangeSchema.default('30'),
  quality: leadQualitySchema.optional(),
  calculator: calculatorTypeSchema.optional(),
  search: z.string().max(100).optional(),
});
export type DashboardFilters = z.infer<typeof dashboardFiltersSchema>;

// ============================================
// Utility: Parse search params with schema
// ============================================

/**
 * Parse URLSearchParams with a Zod schema
 * Returns parsed data or null with errors logged
 */
export function parseSearchParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> | null {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  if (!result.success) {
    return null;
  }
  return result.data;
}

/**
 * Parse URLSearchParams with a Zod schema
 * Returns object with data or error details
 */
export function safeParseSearchParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  if (!result.success) {
    return { success: false, errors: result.error };
  }
  return { success: true, data: result.data };
}

