/**
 * Utility and Library Type Definitions
 * Consolidates types from lib files, hooks, and utility functions
 */

// Image Loader Types

export interface ImagePreset {
  width: number;
  height: number;
  quality: number;
}

export interface ImageSizes {
  small: number;
  medium: number;
  large: number;
}

export interface LazyLoadConfig {
  root: null;
  rootMargin: string;
  threshold: number;
}

// Scheduled Email Types
export interface InternalScheduledEmail {
  id: string;
  recipientEmail: string;
  recipientName: string;
  sequenceId: string;
  stepId: string;
  scheduledFor: Date;
  variables: Record<string, string>;
  status: "pending" | "sent" | "failed";
  createdAt: Date;
  sentAt?: Date;
  error?: string;
}

export interface EmailQueueStats {
  pending: number;
  sent: number;
  failed: number;
  total: number;
}

export interface EmailProcessResult {
  success: boolean;
  processed: number;
  errors: number;
}

// Feature Flag Types
// Touch Interaction Types
export interface TouchState {
  isTouching: boolean;
  touchStart: { x: number; y: number } | null;
  touchEnd: { x: number; y: number } | null;
  swipeDirection: "left" | "right" | "up" | "down" | null;
}

// Logger Types
export interface LogLevel {
  DEBUG: number;
  INFO: number;
  WARN: number;
  ERROR: number;
}

export interface LogContext {
  [key: string]: string | number | boolean | null | undefined;
}

export interface LoggerOptions {
  level: keyof LogLevel;
  enableConsole?: boolean;
  enableRemote?: boolean;
  context?: LogContext;
}