/**
 * Unified Logging Implementation
 * Provides server and client logging with database error tracking
 */

import { env } from '@/env';
import { db } from '@/lib/db';
import { errorLogs } from '@/lib/schemas/system';
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
 * Cast unknown error to Error object
 */
export function castError(error: unknown): ErrorLogData {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? undefined,
      cause: (error as Error & { cause?: unknown }).cause ?? undefined
    };
  }

  if (typeof error === 'string') {
    return {
      name: 'StringError',
      message: error,
      stack: undefined,
      cause: undefined
    };
  }

  if (error === null || error === undefined) {
    return {
      name: 'NullError',
      message: String(error),
      stack: undefined,
      cause: undefined
    };
  }

  try {
    return {
      name: 'UnknownError',
      message: typeof error === 'object' ? JSON.stringify(error) : String(error),
      stack: undefined,
      cause: undefined
    };
  } catch {
    return {
      name: 'UnknownError',
      message: String(error),
      stack: undefined,
      cause: undefined
    };
  }
}

/**
 * Generate a fingerprint for grouping identical errors.
 * Hash of: error_type + message + first stack frame
 */
function generateFingerprint(
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
      fingerprint: payload.fingerprint,
      errorType: payload.error_type,
      level: payload.level,
      message: payload.message,
      stackTrace: payload.stack_trace,
      url: payload.url,
      method: payload.method,
      route: payload.route,
      requestId: payload.request_id,
      userId: payload.user_id,
      userEmail: payload.user_email,
      environment: payload.environment,
      vercelRegion: payload.vercel_region,
      metadata: payload.metadata,
    });
  } catch (e) {
    // Never throw - logging should not break the app
    // Final fallback - can't use logger here as it would cause recursion
    if (env.NODE_ENV === 'development') {
      console.error('[Logger] Failed to push to database:', e)
    }
  }
}

/**
 * Base logger implementation
 */
class BaseLogger implements Logger {
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
      this.context.environment = env.NODE_ENV ?? 'development';
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
    if (env.NODE_ENV === 'development' || this.isBrowser) {
      if (level === 'error') {
        console.error(`[${level.toUpperCase()}] ${message}`, logData);
      } else if (level === 'warn') {
        console.warn(`[${level.toUpperCase()}] ${message}`, logData);
      }
    }

    // In production, you might want to send to analytics or external logging service
    // For now, we'll just log error and warn levels to console in production
    if (env.NODE_ENV === 'production' && !this.isBrowser) {
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
    const errorData = error ? castError(error) : undefined;
    this.log('error', message, errorData);

    // Push to database in production (non-blocking, server-side only)
    if (env.NODE_ENV === 'production' && !this.isBrowser) {
      this.pushErrorToDatabase('error', message, errorData, context);
    }
  }

  fatal(message: string, error?: Error | unknown, context?: ErrorContext): void {
    const errorData = error ? castError(error) : undefined;
    this.log('error', message, errorData);

    // Push to database in production (non-blocking, server-side only)
    if (env.NODE_ENV === 'production' && !this.isBrowser) {
      this.pushErrorToDatabase('fatal', message, errorData, context);
    }
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
      environment: env.NODE_ENV || 'development',
      vercel_region: env.VERCEL_REGION,
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
class ServerLoggerImpl extends BaseLogger implements ServerLogger {
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
    environment: env.NODE_ENV ?? 'development',
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
  environment: env.NODE_ENV ?? 'development',
});

// Add global type for session ID
declare global {
  interface Window {
    __logger_sessionId?: string;
  }
}
