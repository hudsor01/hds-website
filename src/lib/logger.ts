/**
 * Unified Logger using Supabase (non-blocking)
 * Lightweight, non-blocking logging with sampling
 * NO PostHog - optimized for performance
 */

import analytics from './analytics';
import { logToDatabase, logCustomEvent as _logCustomEvent } from './supabase';

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
  private samplingRate = 0.1; // 10% sampling for non-critical logs

  private constructor() {
    // Initialize with random session ID if client-side
    if (typeof window !== 'undefined') {
      this.context.sessionId = this.generateSessionId();
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private generateSessionId(): string {
    // Generate simple session ID (no external dependencies)
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldSample(level: LogLevel): boolean {
    // Always log errors and warnings
    if (level === 'error' || level === 'warn') {
      return true;
    }

    // Skip sampling during build/prerendering (Next.js 16 cacheComponents compatibility)
    if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
      return false; // Don't log debug/info during build
    }

    // Sample info and debug logs at 10% rate (only at runtime)
    return Math.random() < this.samplingRate;
  }

  private formatMessage(level: LogLevel, message: string, data?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const env = process.env.NODE_ENV;

    if (env === 'production') {
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

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    // Sample logs to reduce overhead
    if (!this.shouldSample(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, data);

    // Console output based on level
    switch (level) {
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
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

    // Non-blocking analytics tracking (fire-and-forget)
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

      // Fire-and-forget (non-blocking)
      analytics.trackEvent(`log_${level}`, analyticsData);
    }

    // Non-blocking Supabase logging (fire-and-forget)
    logToDatabase(level, message, {
      ...this.context,
      ...data,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
    }).catch(() => {
      // Silent fail - don't block execution
    });
  }

  // Public methods matching console API
  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | Record<string, unknown>) {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error as Record<string, unknown>;

    this.log('error', message, errorData);

    // For errors, also track as a separate error event (fire-and-forget)
    if (typeof window !== 'undefined' && analytics) {
      // Fire-and-forget (non-blocking)
      analytics.trackError(message, false);
    }
  }

  // Timing methods (non-blocking)
  time(label: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  }

  timeEnd(label: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);

      try {
        performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = performance.getEntriesByName(label)[0];

        if (measure && analytics) {
          // Fire-and-forget (non-blocking)
          analytics.trackTiming('performance', label, measure.duration);
        }

        // Cleanup
        performance.clearMarks(`${label}-start`);
        performance.clearMarks(`${label}-end`);
        performance.clearMeasures(label);
      } catch {
        // Silent fail
      }
    }
  }

  // Context management
  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  getContext(): LogContext {
    return { ...this.context };
  }

  clearContext() {
    this.context = {};
    if (typeof window !== 'undefined') {
      this.context.sessionId = this.generateSessionId();
    }
  }
}

// Export singleton instance
const logger = Logger.getInstance();

// Server-side logger factory
export function createServerLogger(component?: string): Logger {
  const serverLogger = Logger.getInstance();

  if (component) {
    serverLogger.setContext({ component });
  }

  return serverLogger;
}

// Helper to cast Error objects for logging
export function castError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  const err = new Error('Unknown error');
  // Attach the original error as a property for debugging
  (err as Error & { originalError?: unknown }).originalError = error;
  return err;
}

// Export Logger type for use in function signatures
export type { Logger };

export { logger };
export default logger;
