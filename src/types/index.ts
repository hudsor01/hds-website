/**
 * Centralized Type Exports
 * Single source of truth for all types in the application
 */

// Analytics Types
export type {
  AnalyticsProperties, AnalyticsWebVitalMetric, ConversionFunnelData, EmailSequence, EmailSequenceStep, EmailTemplateData, EmailTemplateFunction,
  EmailTemplatesRecord, EventProperties, FormSubmissionData, GroupProperties, LeadAttributionData, LeadScoreFactors, PageViewProperties, ScheduledEmail, SchedulingWidgetData, UserProperties, UserTraits, UTMParameters
} from './analytics';

// Form Types
export type {
  FieldValidation, FormAnalytics,
  FormComponentState, FormState, FormStep, FormSubmissionState, FormTrackingEvent, FormValidationRules,
  FormValue,
  FormValues, MultiStepFormState, UseFormOptions
} from './forms';

// Hook Types
export type {
  HooksAnalyticsPropertyValue, LoadingState, UseAnalyticsOptions,
  UseAnalyticsReturn, UseLoadingStateOptions
} from './hooks';

// Validation Types
export type {
  FormErrors, FormValidationResult
} from './validation';

// TTL Calculator Types
export type {
  CalculationResults, CalculatorContextType, CreditScoreRate, LeaseComparisonResults, PaymentResults, SavedCalculation, TCOResults, TTLResults, UseCalculationsReturn, VehicleInputs
} from './ttl-types';

// Common Types
export type {
  AnalyticsEventProperties, AnalyticsPayload, AnalyticsValue, ApiError, ApiValidationResult, AuthResponse, ContactError, ContactResponse, CreateTestimonialInput, CSRFTokenResponse, HealthCheckResponse,
  MetricsResponse, NewsletterSubscriber,
  NewsletterSubscribersResponse, RateLimitConfig, RateLimitEntry, RateLimitResult,
  RequestHeaders,
  ResponseHeaders, Testimonial, TrackEventInput, User, ValidationError
} from './api';
