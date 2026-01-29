/**
 * Analytics-related schemas
 * Tables: web_vitals, custom_events, page_analytics, conversion_funnel, ab_test_results
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

export const webVitals = pgTable('web_vitals', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  value: numeric('value').notNull(),
  rating: text('rating'),
  delta: numeric('delta'),
  navigationType: text('navigation_type'),
  url: text('url'),
  pathname: text('pathname'),
  sessionId: text('session_id'),
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

export const customEvents = pgTable('custom_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventName: text('event_name').notNull(),
  category: text('category'),
  action: text('action'),
  label: text('label'),
  value: numeric('value'),
  properties: jsonb('properties'),
  sessionId: text('session_id'),
  userId: text('user_id'),
  url: text('url'),
  pathname: text('pathname'),
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

export const pageAnalytics = pgTable('page_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  pathname: text('pathname').notNull(),
  pageTitle: text('page_title'),
  pageViews: integer('page_views').default(0),
  uniqueVisitors: integer('unique_visitors').default(0),
  avgTimeOnPage: numeric('avg_time_on_page'),
  bounceRate: numeric('bounce_rate'),
  exitRate: numeric('exit_rate'),
  date: timestamp('date', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const conversionFunnel = pgTable('conversion_funnel', {
  id: uuid('id').primaryKey().defaultRandom(),
  funnelName: text('funnel_name').notNull(),
  stepName: text('step_name').notNull(),
  stepOrder: integer('step_order').notNull(),
  sessionId: text('session_id').notNull(),
  userId: text('user_id'),
  pagePath: text('page_path'),
  completed: boolean('completed').default(false),
  completionTime: timestamp('completion_time', { withTimezone: true }),
  timeToComplete: integer('time_to_complete'),
  properties: jsonb('properties'),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

export const abTestResults = pgTable('ab_test_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  testName: text('test_name').notNull(),
  variantName: text('variant_name').notNull(),
  sessionId: text('session_id'),
  userId: text('user_id'),
  converted: boolean('converted').default(false),
  conversionEvent: text('conversion_event'),
  conversionValue: numeric('conversion_value'),
  properties: jsonb('properties'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

// Type exports
export type WebVital = typeof webVitals.$inferSelect;
export type NewWebVital = typeof webVitals.$inferInsert;
export type CustomEvent = typeof customEvents.$inferSelect;
export type NewCustomEvent = typeof customEvents.$inferInsert;
export type PageAnalytic = typeof pageAnalytics.$inferSelect;
export type NewPageAnalytic = typeof pageAnalytics.$inferInsert;
export type ConversionFunnelEntry = typeof conversionFunnel.$inferSelect;
export type NewConversionFunnelEntry = typeof conversionFunnel.$inferInsert;
export type AbTestResult = typeof abTestResults.$inferSelect;
export type NewAbTestResult = typeof abTestResults.$inferInsert;
