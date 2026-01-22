/**
 * Email-related schemas
 * Tables: scheduled_emails, newsletter_subscribers, email_engagement
 */
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';

export const scheduledEmails = pgTable('scheduled_emails', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipientEmail: text('recipient_email').notNull(),
  recipientName: text('recipient_name').notNull(),
  sequenceId: text('sequence_id').notNull(),
  stepId: text('step_id').notNull(),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  status: text('status').notNull().default('pending'),
  variables: jsonb('variables').$type<Record<string, string>>().notNull().default({}),
  retryCount: integer('retry_count').notNull().default(0),
  maxRetries: integer('max_retries').notNull().default(3),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  status: text('status').default('active'),
  source: text('source'),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).defaultNow(),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const emailEngagement = pgTable('email_engagement', {
  id: uuid('id').primaryKey().defaultRandom(),
  emailId: uuid('email_id'),
  recipientEmail: text('recipient_email').notNull(),
  eventType: text('event_type').notNull(),
  linkUrl: text('link_url'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  metadata: jsonb('metadata'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

// Type exports
export type ScheduledEmail = typeof scheduledEmails.$inferSelect;
export type NewScheduledEmail = typeof scheduledEmails.$inferInsert;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
export type EmailEngagement = typeof emailEngagement.$inferSelect;
export type NewEmailEngagement = typeof emailEngagement.$inferInsert;
