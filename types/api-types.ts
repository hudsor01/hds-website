/**
 * API & Network Types
 * 
 * Type definitions for API requests, responses, and network operations.
 * Includes both REST and tRPC specific types.
 */

import { HTTPMethod, HTTPStatusCode, Status } from './enum-types'

// ============= Generic API Types =============

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: ApiError
  metadata?: ResponseMetadata
}

/**
 * API error information
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  field?: string // For validation errors
  timestamp: Date
  requestId?: string
}

/**
 * Response metadata for pagination and debugging
 */
export interface ResponseMetadata {
  requestId: string
  timestamp: Date
  duration: number
  rateLimit?: RateLimitInfo
  pagination?: PaginationInfo
  version?: string
}

/**
 * Rate limiting information
 */
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: Date
  retryAfter?: number
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Paginated request parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, unknown>
}

// ============= HTTP Request/Response Types =============

/**
 * HTTP request configuration
 */
export interface HttpRequest {
  method: HTTPMethod
  url: string
  headers?: Record<string, string>
  params?: Record<string, unknown>
  body?: Record<string, unknown>
  timeout?: number
  retries?: number
  authentication?: {
    type: 'bearer' | 'basic' | 'api-key'
    credentials: string | { username: string; password: string }
  }
}

/**
 * HTTP response information
 */
export interface HttpResponse<T = unknown> {
  status: HTTPStatusCode
  statusText: string
  headers: Record<string, string>
  data: T
  request: {
    url: string
    method: HTTPMethod
    duration: number
  }
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseUrl: string
  timeout: number
  retries: number
  headers: Record<string, string>
  interceptors?: {
    request?: (config: HttpRequest) => HttpRequest | Promise<HttpRequest>
    response?: (response: HttpResponse) => HttpResponse | Promise<HttpResponse>
    error?: (error: ApiError) => ApiError | Promise<ApiError>
  }
}

// ============= tRPC Specific Types =============

/**
 * tRPC context for procedures
 */
export interface TRPCContext {
  req?: Record<string, unknown>
  res?: Record<string, unknown>
  user?: {
    id: string
    email: string
    role: string
  }
  session?: {
    id: string
    userId: string
    expiresAt: Date
  }
  metadata: {
    requestId: string
    userAgent?: string
    ip?: string
    timestamp: Date
  }
}

/**
 * tRPC procedure metadata
 */
export interface TRPCProcedureMetadata {
  procedure: string
  input?: Record<string, unknown>
  duration: number
  success: boolean
  error?: string
  userId?: string
  timestamp: Date
}

/**
 * tRPC router configuration
 */
export interface TRPCRouterConfig {
  context: TRPCContext
  middleware?: {
    auth?: boolean
    rateLimit?: {
      max: number
      windowMs: number
    }
    validation?: boolean
    logging?: boolean
  }
}

// ============= External API Integration Types =============

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
  secret?: string
  isActive: boolean
  retryPolicy: {
    maxRetries: number
    backoffMultiplier: number
    maxBackoffSeconds: number
  }
  headers?: Record<string, string>
  createdAt: Date
  lastTriggered?: Date
}

/**
 * Webhook delivery attempt
 */
export interface WebhookDelivery {
  id: string
  webhookId: string
  event: string
  payload: Record<string, unknown>
  attempt: number
  status: 'pending' | 'success' | 'failed' | 'retry'
  statusCode?: number
  response?: string
  error?: string
  deliveredAt?: Date
  nextRetry?: Date
}

/**
 * Third-party service integration
 */
export interface ServiceIntegration {
  id: string
  name: string
  provider: 'stripe' | 'hubspot' | 'salesforce' | 'mailchimp' | 'zapier' | 'slack'
  isActive: boolean
  configuration: Record<string, unknown>
  credentials: {
    type: 'oauth' | 'api-key' | 'basic'
    data: Record<string, string>
    expiresAt?: Date
  }
  lastSyncAt?: Date
  syncStatus: 'idle' | 'syncing' | 'error'
  errorCount: number
  lastError?: string
}

// ============= Authentication API Types =============

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
  twoFactorCode?: string
}

/**
 * Login response data
 */
export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string
  }
  tokens: {
    accessToken: string
    refreshToken: string
    expiresAt: Date
  }
  session: {
    id: string
    expiresAt: Date
  }
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  name: string
  email: string
  password: string
  company?: string
  agreeToTerms: boolean
  marketingConsent?: boolean
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string
  resetToken?: string
  newPassword?: string
}

// ============= Analytics API Types =============

/**
 * Analytics event for tracking
 */
export interface AnalyticsEventRequest {
  event: string
  properties?: Record<string, unknown>
  userId?: string
  sessionId?: string
  timestamp?: Date
  context?: {
    page?: {
      url: string
      title: string
      referrer?: string
    }
    user?: {
      id?: string
      email?: string
    }
    device?: {
      type: 'desktop' | 'mobile' | 'tablet'
      browser: string
      os: string
    }
    location?: {
      country?: string
      region?: string
      city?: string
    }
  }
}

/**
 * Analytics query parameters
 */
export interface AnalyticsQuery {
  metric: string
  startDate: Date
  endDate: Date
  groupBy?: 'day' | 'week' | 'month'
  filters?: Record<string, unknown>
  segments?: string[]
}

/**
 * Analytics response data
 */
export interface AnalyticsResponse {
  metric: string
  period: {
    start: Date
    end: Date
  }
  data: AnalyticsDataPoint[]
  summary: {
    total: number
    average: number
    change?: number
    changePercent?: number
  }
}

/**
 * Analytics data point
 */
export interface AnalyticsDataPoint {
  timestamp: Date
  value: number
  breakdown?: Record<string, number>
}

// ============= Form API Types =============

/**
 * Form submission request
 */
export interface FormSubmissionRequest {
  formId: string
  fields: Record<string, unknown>
  metadata?: {
    userAgent?: string
    ip?: string
    referrer?: string
    timestamp: Date
  }
  security?: {
    honeypot?: string
    website?: string
    formStartTime?: number
    formSubmissionTime?: number
    clerkUserId?: string
    clerkSessionId?: string
  }
}

/**
 * Form submission response
 */
export interface FormSubmissionResponse {
  submissionId: string
  status: 'success' | 'error' | 'pending'
  message: string
  errors?: FormValidationError[]
  nextSteps?: {
    redirect?: string
    showMessage?: string
    triggerDownload?: string
  }
}

/**
 * Form validation error
 */
export interface FormValidationError {
  field: string
  code: string
  message: string
  value?: Record<string, unknown>
}

// ============= File API Types =============

/**
 * File upload request
 */
export interface FileUploadRequest {
  file: File | Buffer
  filename: string
  contentType: string
  folder?: string
  isPublic?: boolean
  metadata?: Record<string, unknown>
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  fileId: string
  filename: string
  url: string
  size: number
  contentType: string
  uploadedAt: Date
}

/**
 * File information
 */
export interface FileInfo {
  id: string
  filename: string
  originalName: string
  contentType: string
  size: number
  url: string
  isPublic: boolean
  folder?: string
  uploadedBy?: string
  uploadedAt: Date
  metadata?: Record<string, unknown>
}

// ============= Async Operation Types =============

/**
 * Long-running operation status
 */
export interface OperationStatus {
  operationId: string
  status: Status
  progress?: number
  message?: string
  result?: Record<string, unknown>
  error?: ApiError
  startedAt: Date
  completedAt?: Date
  estimatedDuration?: number
}

/**
 * Batch operation request
 */
export interface BatchRequest<T = unknown> {
  operations: T[]
  parallel?: boolean
  continueOnError?: boolean
  metadata?: Record<string, unknown>
}

/**
 * Batch operation response
 */
export interface BatchResponse<T = unknown> {
  batchId: string
  total: number
  successful: number
  failed: number
  results: BatchResult<T>[]
  summary: {
    duration: number
    errors: ApiError[]
  }
}

/**
 * Individual batch result
 */
export interface BatchResult<T = unknown> {
  index: number
  status: 'success' | 'error'
  data?: T
  error?: ApiError
}