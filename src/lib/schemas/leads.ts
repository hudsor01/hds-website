/**
 * Lead-related schemas
 * Tables: calculator_leads, lead_attribution, lead_notes, leads
 */
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  integer,
  numeric,
  inet,
} from 'drizzle-orm/pg-core';

export const calculatorLeads = pgTable('calculator_leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  company: text('company'),
  calculatorType: text('calculator_type').notNull(),
  inputs: jsonb('inputs').default({}).notNull(),
  results: jsonb('results').default({}).notNull(),
  leadScore: integer('lead_score'),
  leadQuality: text('lead_quality'),
  contacted: boolean('contacted').default(false).notNull(),
  contactedAt: timestamp('contacted_at', { withTimezone: true }),
  converted: boolean('converted').default(false).notNull(),
  convertedAt: timestamp('converted_at', { withTimezone: true }),
  conversionValue: numeric('conversion_value'),
  notes: text('notes'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmTerm: text('utm_term'),
  utmContent: text('utm_content'),
  referrer: text('referrer'),
  landingPage: text('landing_page'),
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const leadAttribution = pgTable('lead_attribution', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id'),
  sessionId: text('session_id'),
  touchpoint: text('touchpoint').notNull(),
  channel: text('channel'),
  source: text('source'),
  medium: text('medium'),
  campaign: text('campaign'),
  content: text('content'),
  term: text('term'),
  referrer: text('referrer'),
  landingPage: text('landing_page'),
  touchpointOrder: integer('touchpoint_order'),
  isFirstTouch: boolean('is_first_touch').default(false),
  isLastTouch: boolean('is_last_touch').default(false),
  attributionWeight: numeric('attribution_weight'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

export const leadNotes = pgTable('lead_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull(),
  noteType: text('note_type'),
  content: text('content').notNull(),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  company: text('company'),
  source: text('source'),
  status: text('status').default('new'),
  score: integer('score'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Type exports
export type CalculatorLead = typeof calculatorLeads.$inferSelect;
export type NewCalculatorLead = typeof calculatorLeads.$inferInsert;
export type LeadAttribution = typeof leadAttribution.$inferSelect;
export type NewLeadAttribution = typeof leadAttribution.$inferInsert;
export type LeadNote = typeof leadNotes.$inferSelect;
export type NewLeadNote = typeof leadNotes.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
