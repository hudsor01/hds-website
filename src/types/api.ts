/**
 * Centralized API Type Definitions
 * Consolidates inline interfaces from API routes, hooks, and utilities
 */

// API Route Types
// Analytics Value Types
export type AnalyticsValue = string | number | boolean | null | undefined;

export interface AnalyticsPayload {
  event: string;
  properties: Record<string, AnalyticsValue>;
  userProperties: Record<string, AnalyticsValue>;
  timestamp: string;
  session_id: string;
  page_url: string;
  user_agent: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  bestTimeToContact?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  leadScore?: number;
}

export interface ContactError {
  error: string;
  message: string;
  status: number;
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
  code?: string;
}

// Generic API response wrapper - T defaults to void for responses with no data
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Rate Limiting Types
// Import NextRequest from 'next/server' when using these types
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: Request | { headers: Headers; url: string }) => string; // Request from Next.js or Express
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  identifier?: string; // Identifier for the rate limit type
  onLimitReached?: (key: string, request: Request | { headers: Headers; url: string }) => void;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  blocked?: boolean;
}

// HTTP Request/Response Types
export interface RequestHeaders {
  'Content-Type'?: string;
  'Authorization'?: string;
  'x-csrf-token'?: string;
  'User-Agent'?: string;
  'Accept'?: string;
  [key: string]: string | undefined;
}

export interface ResponseHeaders {
  'X-RateLimit-Limit'?: string;
  'X-RateLimit-Remaining'?: string;
  'X-RateLimit-Reset'?: string;
  'Cache-Control'?: string;
  'Content-Type'?: string;
  [key: string]: string | undefined;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// CSRF Types
export interface CSRFTokenResponse {
  token: string;
  expires: string;
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: {
    database?: 'healthy' | 'unhealthy';
    analytics?: 'healthy' | 'unhealthy';
    email?: 'healthy' | 'unhealthy';
    storage?: 'healthy' | 'unhealthy';
  };
  uptime: number;
  version: string;
}

// Metrics Types
export interface MetricsResponse {
  timestamp: string;
  metrics: {
    requests_total: number;
    requests_per_minute: number;
    error_rate: number;
    response_time_avg: number;
    active_connections: number;
  };
}