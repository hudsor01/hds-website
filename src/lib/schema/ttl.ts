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
  numeric,
  inet,
} from 'drizzle-orm/pg-core';

export const ttlCalculations = pgTable('ttl_calculations', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleYear: text('vehicle_year'),
  vehicleMake: text('vehicle_make'),
  vehicleModel: text('vehicle_model'),
  salePrice: numeric('sale_price'),
  tradeInValue: numeric('trade_in_value'),
  rebates: numeric('rebates'),
  county: text('county'),
  salesTaxRate: numeric('sales_tax_rate'),
  calculatedTax: numeric('calculated_tax'),
  titleFee: numeric('title_fee'),
  licenseFee: numeric('license_fee'),
  totalFees: numeric('total_fees'),
  inputs: jsonb('inputs'),
  results: jsonb('results'),
  sessionId: text('session_id'),
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type TtlCalculation = typeof ttlCalculations.$inferSelect;
export type NewTtlCalculation = typeof ttlCalculations.$inferInsert;
