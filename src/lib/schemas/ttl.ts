/**
 * TTL Calculator schemas
 * Tables: ttl_calculations
 */
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';

export const ttlCalculations = pgTable('ttl_calculations', {
  id: uuid('id').primaryKey().defaultRandom(),
  shareCode: text('share_code').notNull().unique(),
  county: text('county'),
  purchasePrice: integer('purchase_price'),
  name: text('name'),
  email: text('email'),
  inputs: jsonb('inputs').notNull(),
  results: jsonb('results').notNull(),
  viewCount: integer('view_count').default(0),
  lastViewedAt: timestamp('last_viewed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type TtlCalculation = typeof ttlCalculations.$inferSelect;
export type NewTtlCalculation = typeof ttlCalculations.$inferInsert;
