/**
 * Supabase Helper Types
 *
 * Derived types for working with Supabase database operations.
 */

import type { Database, Tables, TablesInsert, TablesUpdate } from './database';

// Re-export database types
export type { Database, Tables, TablesInsert, TablesUpdate };

// Specific table row types
export type LeadAttributionRow = Tables<'lead_attribution'>;
export type LeadAttributionInsert = TablesInsert<'lead_attribution'>;
export type LeadAttributionUpdate = TablesUpdate<'lead_attribution'>;

export type CalculatorLeadRow = Tables<'calculator_leads'>;
export type CalculatorLeadInsert = TablesInsert<'calculator_leads'>;
export type CalculatorLeadUpdate = TablesUpdate<'calculator_leads'>;

export type LeadNoteRow = Tables<'lead_notes'>;
export type LeadNoteInsert = TablesInsert<'lead_notes'>;
export type LeadNoteUpdate = TablesUpdate<'lead_notes'>;

export type ErrorLogRow = Tables<'error_logs'>;
export type ErrorLogInsert = TablesInsert<'error_logs'>;
export type ErrorLogUpdate = TablesUpdate<'error_logs'>;

export type CaseStudyRow = Tables<'case_studies'>;
export type CaseStudyInsert = TablesInsert<'case_studies'>;
export type CaseStudyUpdate = TablesUpdate<'case_studies'>;

export type ScheduledEmailRow = Tables<'scheduled_emails'>;
export type ScheduledEmailInsert = TablesInsert<'scheduled_emails'>;
export type ScheduledEmailUpdate = TablesUpdate<'scheduled_emails'>;

export type ProjectRow = Tables<'projects'>;
export type ProjectInsert = TablesInsert<'projects'>;
export type ProjectUpdate = TablesUpdate<'projects'>;

export type CustomEventRow = Tables<'custom_events'>;
export type CustomEventInsert = TablesInsert<'custom_events'>;
export type CustomEventUpdate = TablesUpdate<'custom_events'>;

export type TtlCalculationRow = Tables<'ttl_calculations'>;
export type TtlCalculationInsert = TablesInsert<'ttl_calculations'>;
export type TtlCalculationUpdate = TablesUpdate<'ttl_calculations'>;

export type WebVitalRow = Tables<'web_vitals'>;
export type WebVitalInsert = TablesInsert<'web_vitals'>;
export type WebVitalUpdate = TablesUpdate<'web_vitals'>;

export type LeadRow = Tables<'leads'>;
export type LeadInsert = TablesInsert<'leads'>;
export type LeadUpdate = TablesUpdate<'leads'>;

export type NewsletterSubscriberRow = Tables<'newsletter_subscribers'>;
export type NewsletterSubscriberInsert = TablesInsert<'newsletter_subscribers'>;
export type NewsletterSubscriberUpdate = TablesUpdate<'newsletter_subscribers'>;

export type TestimonialRow = Tables<'testimonials'>;
export type TestimonialInsert = TablesInsert<'testimonials'>;
export type TestimonialUpdate = TablesUpdate<'testimonials'>;

