/**
 * Consolidated Marketing and Analytics Types
 * Includes analytics, email marketing, and tracking types
 */

// Email template data types
export interface EmailTemplateData {
  name: string;
  email: string;
  [key: string]: string | number | boolean | undefined;
}

// Email sequence types
export interface ScheduledEmail {
  to: string;
  sequenceId: string;
  emailId: string;
  sendAt: Date;
  data: EmailTemplateData;
}

// Email template function type
export type EmailTemplateFunction = (data: EmailTemplateData) => string;

// Email templates record type
export type EmailTemplatesRecord = Record<string, EmailTemplateFunction>;

// Email sequence types
export interface EmailSequenceStep {
  id: string;
  subject: string;
  content: string;
  delayDays: number;
  conditions?: {
    leadScore?: { min?: number; max?: number };
    source?: string[];
    hasDownloaded?: boolean;
  };
}

export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  steps: EmailSequenceStep[];
}

// Lead scoring system
export interface LeadScoreFactors {
  email: string;
  firstName: string;
  lastName?: string;
  company?: string;
  phone?: string;
  message: string;
  service?: string;
  source: string;
}

// Core analytics interface types
export interface EventProperties {
  [key: string]: string | number | boolean | undefined | null;
}

export interface PageViewProperties {
  url?: string;
  referrer?: string;
  title?: string;
  path?: string;
  search?: string;
  hash?: string;
}

export interface UserProperties {
  email?: string;
  name?: string;
  company?: string;
  plan?: string;
  [key: string]: string | number | boolean | undefined;
}

// Analytics event property types
export type BasicAnalyticsPropertyValue = string | number | boolean | null | undefined;

export interface AnalyticsProperties {
  [key: string]: BasicAnalyticsPropertyValue | BasicAnalyticsPropertyValue[] | AnalyticsProperties;
}

// Analytics Web Vitals metric type
export interface AnalyticsWebVitalMetric {
  name: string;
  value: number;
  rating?: string;
  id: string;
  navigationType?: string;
}

// Form submission tracking types
export interface FormSubmissionData {
  formName: string;
  success: boolean;
  errorMessage?: string;
  submissionTime?: number;
  [key: string]: BasicAnalyticsPropertyValue | BasicAnalyticsPropertyValue[] | undefined;
}

// Scheduling widget tracking types
export interface SchedulingWidgetData {
  action: 'opened' | 'booked' | 'closed';
  duration?: number;
  selectedDate?: string;
  selectedTime?: string;
  [key: string]: BasicAnalyticsPropertyValue | BasicAnalyticsPropertyValue[] | undefined;
}

// Conversion funnel tracking types
export interface ConversionFunnelData {
  step: string;
  stepNumber?: number;
  dropOffRate?: number;
  timeOnStep?: number;
  [key: string]: BasicAnalyticsPropertyValue | BasicAnalyticsPropertyValue[] | undefined;
}

// User traits for identification
export interface UserTraits {
  email?: string;
  name?: string;
  company?: string;
  plan?: string;
  createdAt?: Date | string;
  [key: string]: BasicAnalyticsPropertyValue | BasicAnalyticsPropertyValue[] | Date | undefined;
}

// Group properties
export interface GroupProperties {
  name?: string;
  industry?: string;
  employees?: number;
  plan?: string;
  [key: string]: BasicAnalyticsPropertyValue | BasicAnalyticsPropertyValue[] | undefined;
}