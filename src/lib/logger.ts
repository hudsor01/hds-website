/**
 * Unified Logging Implementation
 * Provides server and client logging with Drizzle ORM error tracking
 */

import { db } from '@/lib/db'
import { errorLogs } from '@/lib/schema'
import { castError } from '@/lib/utils/errors'
import type {
  ErrorLogData,
  LogContext,
  Logger,
  LogLevel,
  ServerLogger
} from '@/types/logger'
import type { ErrorContext, ErrorLogPayload, ErrorLevel } from '@/types/error-logging'

export type { Logger, LogContext, LogLevel, ServerLogger } from '@/types/logger';

/**
 * Generate a fingerprint for grouping identical errors.
 * Hash of: error_type + message + first stack frame
 */
export function generateFingerprint(
  errorType: string,
  message: string,
  stack?: string
): string {
  const firstFrame = stack?.split('\n')[1]?.trim() || 'unknown'
  const input = `${errorType}:${message}:${firstFrame}`

  // Simple hash
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36).padStart(8, '0')
}

/**
 * Push error to database (non-blocking, fire-and-forget)
 * Note: Uses console.error as final fallback since we can't use the logger to log logger failures
 */
async function pushToDatabase(payload: ErrorLogPayload): Promise<void> {
  try {
    await db.insert(errorLogs).values({
      level: payload.level,
      errorType: payload.error_type,
      fingerprint: payload.fingerprint,
      message: payload.message,
      stackTrace: payload.stack_trace,
      url: payload.url,
      method: payload.method,
      route: payload.route,
      requestId: payload.request_id,
      userId: payload.user_id,
      userEmail: payload.user_email,
      environment: payload.environment ?? 'development',
      vercelRegion: payload.vercel_region,
      metadata: payload.metadata,
    })
  } catch (e) {
    // Never throw - logging should not break the app
    // Final fallback - can't use logger here as it would cause recursion
    if (process.env.NODE_ENV === 'development') {
      console.error('[Logger] Failed to push to database:', e)
    }
  }
}

/**
 * Base logger implementation
 */
export class BaseLogger implements Logger {
  private context: LogContext;
  private sessionId: string;
  private isBrowser: boolean;

  constructor(context: LogContext = {}) {
    this.context = context;
    this.sessionId = this.generateSessionId();
    this.isBrowser = typeof window !== 'undefined';

    if (this.isBrowser) {
      this.context.sessionId = this.sessionId;
      this.context.isServer = false;
    } else {
      this.context.isServer = true;
      this.context.environment = process.env.NODE_ENV ?? 'development';
    }
  }

 private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      // Browser environment
      if (!window.__logger_sessionId) {
        window.__logger_sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      }
      return window.__logger_sessionId;
    } else {
      // Server environment
      return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
 }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

 clearContext(): void {
    this.context = {};
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context },
      data
    };

    // Only log error and warn levels to console to comply with ESLint rules
    if (process.env.NODE_ENV === 'development' || this.isBrowser) {
      if (level === 'error') {
        console.error(`[${level.toUpperCase()}] ${message}`, logData);
      } else if (level === 'warn') {
        console.warn(`[${level.toUpperCase()}] ${message}`, logData);
      }
    }

    // In production, you might want to send to analytics or external logging service
    // For now, we'll just log error and warn levels to console in production
    if (process.env.NODE_ENV === 'production' && !this.isBrowser) {
      if (level === 'error' || level === 'warn') {
        console.error(`[${level.toUpperCase()}] ${message}`, logData);
      }
    }
 }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown, context?: ErrorContext): void {
    const errorData = this.extractErrorData(error);
    this.log('error', message, errorData);

    // Push to database in production (non-blocking, server-side only)
    if (process.env.NODE_ENV === 'production' && !this.isBrowser) {
      this.pushErrorToDatabase('error', message, errorData, context);
    }
  }

  fatal(message: string, error?: Error | unknown, context?: ErrorContext): void {
    const errorData = this.extractErrorData(error);
    this.log('error', message, errorData);

    // Push to database in production (non-blocking, server-side only)
    if (process.env.NODE_ENV === 'production' && !this.isBrowser) {
      this.pushErrorToDatabase('fatal', message, errorData, context);
    }
  }

  /**
   * Extracts structured error data from an unknown error value
   */
  private extractErrorData(error: unknown): ErrorLogData | undefined {
    if (!error) {
      return undefined;
    }

    const err = castError(error);
    return {
      name: err.name,
      message: err.message,
      stack: err.stack ?? undefined,
      cause: (err as Error & { cause?: unknown }).cause ?? undefined,
    };
  }

  private pushErrorToDatabase(
    level: ErrorLevel,
    message: string,
    errorData?: ErrorLogData,
    context?: ErrorContext
  ): void {
    const errorType = errorData?.name || 'UnknownError'
    const fingerprint = generateFingerprint(errorType, message, errorData?.stack)

    const payload: ErrorLogPayload = {
      level,
      error_type: errorType,
      fingerprint,
      message,
      stack_trace: errorData?.stack,
      url: context?.url,
      method: context?.method,
      route: context?.route,
      request_id: context?.requestId,
      user_id: context?.userId,
      user_email: context?.userEmail,
      environment: process.env.NODE_ENV || 'development',
      vercel_region: process.env.VERCEL_REGION,
      metadata: {
        ...context?.metadata,
        cause: errorData?.cause,
        sessionId: this.sessionId,
        component: this.context.component,
      },
    }

    // Fire and forget - don't await
    void pushToDatabase(payload)
  }

  time(label: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${label}-start`);
    }
  }

  timeEnd(label: string): void {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);

      const entries = performance.getEntriesByName(label);
      if (entries.length > 0) {
        const firstEntry = entries[0];
        if (firstEntry && typeof firstEntry.duration === 'number') {
          this.debug(`${label} took ${firstEntry.duration.toFixed(2)}ms`);
        }
        performance.clearMeasures?.(label);
      }
    }
  }

  group(_label: string): void {
    // No-op - console.group not allowed by ESLint rules
    // Could implement custom grouping if needed
  }

  groupEnd(): void {
    // No-op - console.groupEnd not allowed by ESLint rules
  }

  table(_data: unknown): void {
    // No-op - console.table not allowed by ESLint rules
    // Could implement custom table display if needed
  }
}

/**
 * Server logger implementation with additional server-specific methods
 */
export class ServerLoggerImpl extends BaseLogger implements ServerLogger {
  request(method: string, url: string, headers?: Record<string, string>): void {
    this.debug(`HTTP ${method} ${url}`, { headers });
  }

  response(status: number, duration?: number): void {
    const message = `HTTP response ${status}${duration !== undefined ? ` in ${duration}ms` : ''}`;
    this.debug(message);
  }

  database(query: string, duration?: number): void {
    const message = `DB query${duration !== undefined ? ` took ${duration}ms` : ''}`;
    this.debug(message, { query });
  }

 cache(operation: string, key: string, hit: boolean): void {
    const message = `Cache ${operation} for ${key}: ${hit ? 'HIT' : 'MISS'}`;
    this.debug(message);
  }
}

/**
 * Create a server logger instance with optional name for context
 */
export function createServerLogger(name?: string): ServerLogger {
  const context: LogContext = {
    component: name || 'server',
    isServer: true,
    environment: process.env.NODE_ENV ?? 'development',
  };

  if (name) {
    context.loggerName = name;
  }

  return new ServerLoggerImpl(context);
}

/**
 * Default logger instance for general use
 */
export const logger: Logger = new BaseLogger({
  component: 'default',
  isServer: typeof window === 'undefined',
  environment: process.env.NODE_ENV ?? 'development',
});

// ============================================================================
// Standardized Error Handling Utilities
// ============================================================================

/**
 * Error severity levels for standardized handling
 */
export type ErrorSeverity = 'critical' | 'warning' | 'info';

/**
 * Options for handleError utility
 */
export interface HandleErrorOptions {
  /** Context about where the error occurred */
  context?: string;
  /** Additional metadata to log */
  metadata?: Record<string, unknown>;
  /** Whether to rethrow the error after logging */
  rethrow?: boolean;
  /** Severity level - determines log level used */
  severity?: ErrorSeverity;
}

/**
 * Standardized error handler - ensures all errors are logged consistently
 * Use this in catch blocks to ensure errors are never silently swallowed
 *
 * @example
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   handleError(error, { context: 'riskyOperation', severity: 'warning' });
 * }
 */
export function handleError(
  error: unknown,
  options: HandleErrorOptions = {}
): ErrorLogData {
  const { context, metadata, rethrow = false, severity = 'warning' } = options;
  const err = castError(error);
  const errorData: ErrorLogData = {
    name: err.name,
    message: err.message,
    stack: err.stack ?? undefined,
    cause: (err as Error & { cause?: unknown }).cause ?? undefined,
  };

  const message = context ? `[${context}] ${errorData.message}` : errorData.message;
  const logData = metadata ? { ...metadata, errorData } : errorData;

  // Log based on severity level
  switch (severity) {
    case 'critical':
      logger.error(message, error);
      break;
    case 'warning':
      logger.warn(message, logData);
      break;
    default:
      logger.info(message, logData);
  }

  if (rethrow) {
    throw error;
  }

  return errorData;
}

/**
 * Result type for safeExecute
 */
export type SafeResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: ErrorLogData };

/**
 * Execute a function safely with automatic error logging
 * Returns a result object instead of throwing
 *
 * @example
 * const result = await safeExecute(
 *   () => fetchData(),
 *   { context: 'fetchData', severity: 'warning' }
 * );
 * if (result.success) {
 *   // use result.data
 * } else {
 *   // handle result.error
 * }
 */
export async function safeExecute<T>(
  fn: () => T | Promise<T>,
  options: HandleErrorOptions = {}
): Promise<SafeResult<T>> {
  try {
    const data = await fn();
    return { success: true, data, error: null };
  } catch (error) {
    const errorData = handleError(error, options);
    return { success: false, data: null, error: errorData };
  }
}

/**
 * Synchronous version of safeExecute
 */
export function safeExecuteSync<T>(
  fn: () => T,
  options: HandleErrorOptions = {}
): SafeResult<T> {
  try {
    const data = fn();
    return { success: true, data, error: null };
  } catch (error) {
    const errorData = handleError(error, options);
    return { success: false, data: null, error: errorData };
  }
}

// Add global type for session ID
declare global {
  interface Window {
    __logger_sessionId?: string;
  }
}
