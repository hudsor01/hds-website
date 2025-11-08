/**
 * Unified Logger using PostHog, Vercel, and Supabase
 * Replaces console.log with structured logging that works in all environments
 */

import analytics from './analytics';
import { logToDatabase, logCustomEvent as _logCustomEvent } from './supabase';
import { env } from '@/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  [key: string]: unknown;
}

class Logger {
  private static instance: Logger;
  private context: LogContext = {};

  private constructor() {
    // Initialize with session data if available
    if (typeof window !== 'undefined') {
      this.context.sessionId = this.getSessionId();
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getSessionId(): string {
    // Get PostHog session ID if available
    if (typeof window !== 'undefined' && 'posthog' in window && window.posthog) {
      const posthog = window.posthog as { get_session_id?: () => string | null };
      return posthog.get_session_id?.() || 'no-session';
    }
    return 'no-session';
  }

  private formatMessage(level: LogLevel, message: string, data?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const currentEnv = env.NODE_ENV;

    if (currentEnv === 'production') {
      // Structured JSON for Vercel logs
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...this.context,
        ...(data && { data })
      });
    }

    // Readable format for development
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  private async log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const formattedMessage = this.formatMessage(level, message, data);

    // Console output based on level
    switch (level) {
      case 'debug':
        if (env.NODE_ENV === 'development') {
          console.warn(formattedMessage, data || '');
        }
        break;
      case 'info':
        console.warn(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'error':
        console.error(formattedMessage, data || '');
        break;
    }

    // Send to PostHog for analytics
    if (typeof window !== 'undefined' && analytics) {
      const analyticsData: Record<string, string | number | boolean | null | undefined> = {
        message,
        level,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...Object.fromEntries(
          Object.entries(this.context).filter(([, value]) =>
            typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined
          )
        ),
        ...(data && Object.fromEntries(
          Object.entries(data).filter(([, value]) =>
            typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined
          )
        ))
      };
      analytics.trackEvent(`log_${level}`, analyticsData);
    }

    // In production, Vercel automatically captures console output
    // These logs are available in Vercel Dashboard > Functions > Logs

    // Send to Supabase database for persistent logging
    try {
      await logToDatabase(level, message, {
        ...this.context,
        ...data,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
      });
    } catch (dbError) {
      // Fallback to console if database logging fails
      console.error('Database logging failed:', dbError);
    }
  }

  // Public methods matching console API
  debug(message: string, data?: Record<string, unknown>) {
    void this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    void this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    void this.log('warn', message, data);
  }

  error(message: string, error?: Error | Record<string, unknown>) {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error as Record<string, unknown>;

    void this.log('error', message, errorData);

    // For errors, also track as a separate error event
    if (typeof window !== 'undefined' && analytics) {
      const errorAnalyticsData: Record<string, string | number | boolean | null | undefined> = {
        message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        errorType: typeof errorData === 'object' && errorData && 'name' in errorData ? String(errorData.name) : 'unknown',
        ...Object.fromEntries(
          Object.entries(this.context).filter(([, value]) =>
            typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined
          )
        )
      };
      analytics.trackEvent('error_occurred', errorAnalyticsData);
    }
  }

  // Set context for all future logs
  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  // Clear context
  clearContext() {
    this.context = {};
  }

  // Performance logging
  time(label: string) {
    if (typeof window !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  }

  timeEnd(label: string) {
    if (typeof window !== 'undefined') {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);

      const measure = performance.getEntriesByName(label)[0];
      if (measure) {
        this.info(`Performance: ${label}`, { duration: measure.duration });

        // Send to PostHog
        analytics.trackEvent('performance_measure', {
          label,
          duration: measure.duration,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Group related logs
  group(label: string) {
    console.warn(`[GROUP START] ${label}`);
  }

  groupEnd() {
    console.warn('[GROUP END]');
  }

  // Table logging for development
  table(data: Record<string, unknown>) {
    if (env.NODE_ENV === 'development') {
      console.warn('[TABLE DATA]', JSON.stringify(data, null, 2));
    }
  }

  // Database logging method
  async logToDatabase(level: LogLevel, message: string, context: Record<string, unknown> = {}) {
    try {
      await logToDatabase(level, message, {
        ...this.context,
        ...context,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log to database:', error);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Helper function to safely cast errors for logging
export function castError(error: unknown): Error | Record<string, unknown> {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'object' && error !== null) {
    return error as Record<string, unknown>;
  }
  return { message: String(error) };
}

// Export for server-side usage
export function createServerLogger(requestId?: string) {
  const serverLogger = Logger.getInstance();
  serverLogger.setContext({
    requestId,
    environment: env.NODE_ENV,
    isServer: true
  });
  return serverLogger;
}

// Helper for API routes
export function withLogger<T extends unknown[]>(
  handler: (req: Request, ...args: T) => Promise<Response>
) {
  return async (req: Request, ...args: T) => {
    const requestId = req.headers.get('x-request-id') ||
                     req.headers.get('x-vercel-id') ||
                     crypto.randomUUID();

    const logger = createServerLogger(requestId);

    logger.info('API Request', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    try {
      const result = await handler(req, ...args);
      logger.info('API Response Success', { requestId });
      return result;
    } catch (error) {
      logger.error('API Response Error', error instanceof Error ? error : { error });
      throw error;
    }
  };
}