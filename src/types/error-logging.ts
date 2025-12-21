export type ErrorLevel = 'error' | 'fatal'

export interface ErrorContext {
  url?: string
  method?: string
  route?: string
  requestId?: string
  userId?: string
  userEmail?: string
  metadata?: Record<string, unknown>
}

export interface ErrorLogPayload {
  level: ErrorLevel
  error_type: string
  fingerprint: string
  message: string
  stack_trace?: string
  url?: string
  method?: string
  route?: string
  request_id?: string
  user_id?: string
  user_email?: string
  environment: string
  vercel_region?: string
  metadata: Record<string, unknown>
}

export interface ErrorLogRecord extends ErrorLogPayload {
  id: string
  created_at: string
  resolved_at?: string
  resolved_by?: string
}

export interface GroupedError {
  fingerprint: string
  error_type: string
  message: string
  level: ErrorLevel
  count: number
  first_seen: string
  last_seen: string
  route?: string
  resolved_at?: string
}

export interface ErrorStats {
  total_errors: number
  unique_types: number
  fatal_count: number
  resolved_count: number
  unresolved_count: number
}
