// Analytics event property types
export type AnalyticsPropertyValue = string | number | boolean | null | undefined;

export interface AnalyticsProperties {
  [key: string]: AnalyticsPropertyValue | AnalyticsPropertyValue[] | AnalyticsProperties;
}

// Web Vitals metric type
export interface WebVitalMetric {
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
  [key: string]: AnalyticsPropertyValue | AnalyticsPropertyValue[] | undefined;
}

// Scheduling widget tracking types
export interface SchedulingWidgetData {
  action: 'opened' | 'booked' | 'closed';
  duration?: number;
  selectedDate?: string;
  selectedTime?: string;
  [key: string]: AnalyticsPropertyValue | AnalyticsPropertyValue[] | undefined;
}

// Conversion funnel tracking types
export interface ConversionFunnelData {
  step: string;
  stepNumber?: number;
  dropOffRate?: number;
  timeOnStep?: number;
  [key: string]: AnalyticsPropertyValue | AnalyticsPropertyValue[] | undefined;
}

// User traits for identification
export interface UserTraits {
  email?: string;
  name?: string;
  company?: string;
  plan?: string;
  createdAt?: Date | string;
  [key: string]: AnalyticsPropertyValue | AnalyticsPropertyValue[] | Date | undefined;
}

// Group properties
export interface GroupProperties {
  name?: string;
  industry?: string;
  employees?: number;
  plan?: string;
  [key: string]: AnalyticsPropertyValue | AnalyticsPropertyValue[] | undefined;
}