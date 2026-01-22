/**
 * System-related schemas
 * Tables: error_logs, cron_logs, webhook_logs, api_logs, processing_queue
 */
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  integer,
  inet,
} from 'drizzle-orm/pg-core';

export const errorLogs = pgTable('error_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  level: text('level').notNull(),
  message: text('message').notNull(),
  stack: text('stack'),
  context: jsonb('context'),
  component: text('component'),
  userId: text('user_id'),
  sessionId: text('session_id'),
  url: text('url'),
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address'),
  resolved: boolean('resolved').default(false),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolvedBy: text('resolved_by'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

export const cronLogs = pgTable('cron_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobName: text('job_name').notNull(),
  status: text('status').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  durationMs: integer('duration_ms'),
  itemsProcessed: integer('items_processed'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const webhookLogs = pgTable('webhook_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: text('provider').notNull(),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload'),
  status: text('status').notNull(),
  statusCode: integer('status_code'),
  responseBody: jsonb('response_body'),
  errorMessage: text('error_message'),
  processingTimeMs: integer('processing_time_ms'),
  retryCount: integer('retry_count').default(0),
  idempotencyKey: text('idempotency_key'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

export const apiLogs = pgTable('api_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  endpoint: text('endpoint').notNull(),
  method: text('method').notNull(),
  statusCode: integer('status_code').notNull(),
  responseTimeMs: integer('response_time_ms'),
  requestBody: jsonb('request_body'),
  requestHeaders: jsonb('request_headers'),
  requestSizeBytes: integer('request_size_bytes'),
  responseBody: jsonb('response_body'),
  responseHeaders: jsonb('response_headers'),
  responseSizeBytes: integer('response_size_bytes'),
  errorMessage: text('error_message'),
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
});

export const processingQueue = pgTable('processing_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  queueName: text('queue_name').notNull(),
  taskType: text('task_type').notNull(),
  payload: jsonb('payload'),
  priority: integer('priority').default(0),
  status: text('status').default('pending'),
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(3),
  lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
  nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  result: jsonb('result'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type ErrorLog = typeof errorLogs.$inferSelect;
export type NewErrorLog = typeof errorLogs.$inferInsert;
export type CronLog = typeof cronLogs.$inferSelect;
export type NewCronLog = typeof cronLogs.$inferInsert;
export type WebhookLog = typeof webhookLogs.$inferSelect;
export type NewWebhookLog = typeof webhookLogs.$inferInsert;
export type ApiLog = typeof apiLogs.$inferSelect;
export type NewApiLog = typeof apiLogs.$inferInsert;
export type ProcessingQueueItem = typeof processingQueue.$inferSelect;
export type NewProcessingQueueItem = typeof processingQueue.$inferInsert;
