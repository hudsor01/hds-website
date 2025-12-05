/**
 * Consolidated Schema Exports
 *
 * This file provides a single entry point for all Zod validation schemas
 * used throughout the application.
 */

// Common validation schemas
export {
  emailSchema,
  phoneSchema,
  urlSchema,
  nameSchema,
  companySchema,
  messageSchema,
  serviceOptionsSchema,
  budgetOptionsSchema,
  timelineOptionsSchema,
  apiResponseSchema,
} from './common';

// Contact form schemas
export {
  contactFormSchema,
  contactFormRequestSchema,
  leadScoringSchema,
  emailSequenceConfigSchema,
  newsletterSchema,
  contactFormResponseSchema,
  scoreLeadFromContactData,
  type ContactFormData,
  type LeadScoring,
} from './contact';

// API route schemas
export {
  leadMagnetRequestSchema,
  leadMagnetResponseSchema,
  leadMagnetResourceSchema,
  graphqlRequestSchema,
  graphqlResponseSchema,
  analyticsVariablesSchema,
  timeRangeSchema,
  cronAuthHeaderSchema,
  cronResponseSchema,
  webhookSignatureSchema,
  databaseChangePayloadSchema,
  authChangePayloadSchema,
  storageChangePayloadSchema,
  supabaseWebhookSchema,
  csrfTokenResponseSchema,
  type LeadMagnetRequest,
  type LeadMagnetResource,
  type LeadMagnetResponse,
  type GraphQLRequest,
  type GraphQLResponse,
  type TimeRange,
  type SupabaseWebhook,
  type DatabaseChangePayload,
  type AuthChangePayload,
  type StorageChangePayload,
} from './api';

// Analytics schemas
export {
  eventPropertiesSchema,
  userPropertiesSchema,
  pageViewPropertiesSchema,
  conversionDataSchema,
  webVitalsDataSchema,
  webVitalMetricSchema,
  webVitalRatingSchema,
  formInteractionSchema,
  sessionDataSchema,
  abTestEventSchema,
  abTestVariantSchema,
  funnelStepSchema,
  errorEventSchema,
  backendAnalyticsPayloadSchema,
  postHogEventSchema,
  type EventProperties,
  type UserProperties,
  type PageViewProperties,
  type ConversionData,
  type WebVitalsData,
  type FormInteraction,
  type SessionData,
  type ABTestEvent,
  type FunnelStep,
  type ErrorEvent,
  type BackendAnalyticsPayload,
  type PostHogEvent,
} from './analytics';

// External service schemas
export {
  resendEmailRequestSchema,
  resendEmailResponseSchema,
  resendErrorResponseSchema,
  discordWebhookRequestSchema,
  discordEmbedSchema,
  discordWebhookErrorSchema,
  postHogCaptureRequestSchema,
  postHogBatchRequestSchema,
  postHogFeatureFlagResponseSchema,
  ga4EventSchema,
  ga4MeasurementRequestSchema,
  calComBookingSchema,
  type ResendEmailRequest,
  type ResendEmailResponse,
  type DiscordWebhookRequest,
  type DiscordEmbed,
  type PostHogCaptureRequest,
  type GA4Event,
  type GA4MeasurementRequest,
  type CalComBooking,
} from './external';

// Supabase database operation schemas
export {
  logLevelSchema,
  logContextSchema,
  logEntrySchema,
  customEventSchema,
  eventNameSchema,
  webVitalsEntrySchema,
  webVitalsMetricTypeSchema,
  webVitalsRatingSchema,
  leadScoreSchema,
  leadUpdateSchema,
  funnelTrackingSchema,
  funnelStepStatusSchema,
  testResultSchema,
  testVariantSchema,
  testOutcomeSchema,
  pageViewSchema,
  webhookEventTypeSchema,
  webhookPayloadSchema,
  analyticsQuerySchema,
  queryVariablesSchema,
  leadDataSchema,
  eventDataSchema,
  type LogLevel,
  type LogEntry,
  type CustomEvent,
  type WebVitalsEntry,
  type LeadUpdate,
  type FunnelTracking,
  type TestResult,
  type PageView,
  type WebhookPayload,
  type AnalyticsQuery,
  type LeadData,
  type EventData,
} from './supabase';

// Email scheduling schemas
export {
  emailSequenceIdSchema,
  emailTemplateVariablesSchema,
  scheduleEmailParamsSchema,
  emailStatusSchema,
  scheduledEmailSchema,
  emailQueueStatsSchema,
  emailProcessResultSchema,
  cancelEmailSequenceParamsSchema,
  emailTemplateSchema,
  processedEmailSchema,
  validateScheduleEmailParams,
  validateScheduledEmail,
  validateCancelEmailParams,
  validateEmailQueueStats,
  type EmailSequenceId,
  type ScheduleEmailParams,
  type ScheduledEmail,
  type EmailQueueStats,
  type EmailProcessResult,
  type CancelEmailSequenceParams,
  type EmailTemplate,
  type ProcessedEmail,
} from './email';

// Paystub generator schemas
export {
  paystubFormSchema,
  paystubCalculationSchema,
  completePaystubSchema,
  paystubGenerationRequestSchema,
  employeeNameSchema,
  hourlyRateSchema,
  hoursPerPeriodSchema,
  validatePaystubForm,
  validatePaystubCalculation,
  validateCompletePaystub,
  type PaystubFormData,
  type PaystubCalculation,
  type CompletePaystub,
  type PaystubGenerationRequest,
} from './paystub';

// Query params and validation utilities
export {
  parseSearchParams,
  safeParseSearchParams,
  formatValidationError,
  createValidationErrorResponse,
  type FormattedValidationError,
} from './query-params';
