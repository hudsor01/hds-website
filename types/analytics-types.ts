/**
 * Analytics Types (Enhanced)
 * 
 * Comprehensive type definitions for analytics, tracking, and performance monitoring.
 * Includes page views, events, conversions, and business intelligence.
 */

import { z } from 'zod'
import { EventCategory, InteractionType } from './enum-types'

// ============= Core Analytics Schemas =============

/**
 * Page view tracking schema
 */
export const pageViewSchema = z.object({
  url: z.string().url('Invalid URL format'),
  title: z.string().min(1, 'Title is required'),
  path: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  clientTime: z.number().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  screenSize: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  viewport: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  device: z
    .object({
      type: z.enum(['desktop', 'mobile', 'tablet']),
      browser: z.string(),
      os: z.string(),
    })
    .optional(),
  location: z
    .object({
      country: z.string().optional(),
      region: z.string().optional(),
      city: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
})

/**
 * Event tracking schema
 */
export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  category: z.nativeEnum(EventCategory).optional(),
  action: z.string().optional(),
  label: z.string().optional(),
  value: z.number().optional(),
  page: z.string().optional(),
  data: z.record(z.any()).optional(),
  clientTime: z.number().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  properties: z.record(z.any()).optional(),
})

/**
 * Conversion tracking schema
 */
export const conversionSchema = z.object({
  event: z.string(),
  value: z.number().optional(),
  currency: z.string().default('USD'),
  transactionId: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().optional(),
    quantity: z.number().default(1),
    price: z.number(),
  })).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
})

// ============= Type Exports =============

export type PageView = z.infer<typeof pageViewSchema>
export type AnalyticsEvent = z.infer<typeof eventSchema>
export type ConversionEvent = z.infer<typeof conversionSchema>

// ============= Analytics Context & Configuration =============

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  providers: AnalyticsProvider[]
  sampling: {
    pageViews: number // 0-1, percentage to sample
    events: number
    errors: number
  }
  privacy: {
    anonymizeIp: boolean
    respectDNT: boolean // Do Not Track
    cookieConsent: boolean
    dataRetention: number // days
  }
  realtime: {
    enabled: boolean
    batchSize: number
    flushInterval: number // ms
  }
  debug: boolean
}

/**
 * Analytics provider configuration
 */
export interface AnalyticsProvider {
  name: 'google-analytics' | 'plausible' | 'mixpanel' | 'amplitude' | 'custom'
  enabled: boolean
  config: Record<string, unknown>
  trackingId?: string
  apiKey?: string
  endpoints?: {
    events?: string
    pageViews?: string
    conversions?: string
  }
}

/**
 * Analytics context for tracking
 */
export interface AnalyticsContext {
  sessionId: string
  userId?: string
  deviceId?: string
  timestamp: Date
  page: {
    url: string
    title: string
    path: string
    referrer?: string
  }
  user?: {
    id?: string
    anonymousId?: string
    traits?: Record<string, unknown>
  }
  device: {
    type: 'desktop' | 'mobile' | 'tablet'
    browser: string
    os: string
    screenSize: { width: number; height: number }
    viewport: { width: number; height: number }
  }
  location?: {
    country?: string
    region?: string
    city?: string
    timezone?: string
    language?: string
  }
  session: {
    startTime: Date
    pageCount: number
    eventCount: number
    duration: number
    isNewSession: boolean
    isNewUser: boolean
  }
  campaign?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
}

// ============= User Behavior Analytics =============

/**
 * User interaction tracking
 */
export interface UserInteraction {
  type: InteractionType
  element?: string
  elementId?: string
  elementClass?: string
  elementText?: string
  position?: { x: number; y: number }
  timestamp: Date
  duration?: number
  value?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/**
 * User session information
 */
export interface UserSession {
  id: string
  userId?: string
  startTime: Date
  endTime?: Date
  duration: number
  pageViews: number
  events: number
  bounced: boolean
  converted: boolean
  conversionValue?: number
  referrer?: string
  landingPage: string
  exitPage?: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  location?: {
    country?: string
    region?: string
    city?: string
  }
  campaign?: {
    source?: string
    medium?: string
    campaign?: string
  }
}

/**
 * User journey tracking
 */
export interface UserJourney {
  userId: string
  sessionId: string
  steps: JourneyStep[]
  startTime: Date
  endTime?: Date
  totalDuration: number
  touchpoints: number
  converted: boolean
  conversionStep?: number
  dropoffStep?: number
  value?: number
}

/**
 * Journey step definition
 */
export interface JourneyStep {
  step: number
  page: string
  action?: string
  timestamp: Date
  duration: number
  metadata?: Record<string, unknown>
}

// ============= Performance Analytics =============

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  url: string
  timestamp: Date
  loadTime: number
  domContentLoaded: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  timeToInteractive: number
  totalBlockingTime: number
  resourceLoadTime: {
    images: number
    scripts: number
    stylesheets: number
    fonts: number
  }
  networkInfo?: {
    effectiveType: string
    downlink: number
    rtt: number
  }
  deviceMemory?: number
  hardwareConcurrency?: number
}

/**
 * Core Web Vitals scoring
 */
export interface CoreWebVitalsScore {
  lcp: { value: number; score: 'good' | 'needs-improvement' | 'poor' }
  fid: { value: number; score: 'good' | 'needs-improvement' | 'poor' }
  cls: { value: number; score: 'good' | 'needs-improvement' | 'poor' }
  overall: 'good' | 'needs-improvement' | 'poor'
  timestamp: Date
}

// ============= Business Analytics =============

/**
 * Funnel analysis data
 */
export interface FunnelData {
  name: string
  steps: FunnelStep[]
  period: { start: Date; end: Date }
  totalUsers: number
  conversionRate: number
  dropoffRate: number
  averageTime: number
}

/**
 * Funnel step data
 */
export interface FunnelStep {
  name: string
  users: number
  conversionRate: number
  dropoffRate: number
  averageTime: number
  metadata?: Record<string, unknown>
}

/**
 * Cohort analysis data
 */
export interface CohortData {
  cohortType: 'weekly' | 'monthly'
  period: { start: Date; end: Date }
  cohorts: Cohort[]
  retentionRates: number[][]
  averageRetention: number
}

/**
 * Cohort definition
 */
export interface Cohort {
  name: string
  period: Date
  size: number
  retentionRates: number[]
  value?: number
}

/**
 * A/B test results
 */
export interface ABTestResult {
  testId: string
  name: string
  variants: ABTestVariant[]
  status: 'draft' | 'running' | 'completed' | 'stopped'
  startDate: Date
  endDate?: Date
  winningVariant?: string
  confidenceLevel: number
  statisticalSignificance: boolean
  sampleSize: number
  conversionMetric: string
}

/**
 * A/B test variant
 */
export interface ABTestVariant {
  id: string
  name: string
  traffic: number // percentage
  users: number
  conversions: number
  conversionRate: number
  improvementOverControl?: number
  pValue?: number
}

// ============= Analytics Store =============

/**
 * Analytics store interface for Zustand
 */
export interface AnalyticsStore {
  hasConsent: boolean
  sessionId: string | null
  setConsent: (newConsent: boolean) => void
  setSessionId: (newSessionId: string | null) => void
  reset: () => void
}

// ============= Analytics Hooks & Utilities =============

/**
 * Page analytics hook options
 */
export interface UsePageAnalyticsOptions {
  trackPageView?: boolean
  trackTime?: boolean
  trackEvents?: boolean
  trackPerformance?: boolean
  trackScrollDepth?: boolean
  debounceTime?: number
}

/**
 * Event tracking options
 */
export interface TrackEventOptions {
  name: string
  category?: EventCategory
  action?: string
  label?: string
  value?: number
  data?: Record<string, unknown>
  immediate?: boolean
}

/**
 * Analytics hook return type
 */
export interface UseAnalyticsReturn {
  trackEvent: (options: TrackEventOptions) => void
  trackPageView: (data?: Partial<PageView>) => void
  trackConversion: (data: ConversionEvent) => void
  identify: (userId: string, traits?: Record<string, unknown>) => void
  group: (groupId: string, traits?: Record<string, unknown>) => void
  alias: (newId: string, previousId?: string) => void
  reset: () => void
  getSessionId: () => string
  getUserId: () => string | undefined
  setUserProperties: (properties: Record<string, unknown>) => void
}

// ============= Real-time Analytics =============

/**
 * Real-time analytics data
 */
export interface RealtimeData {
  timestamp: Date
  activeUsers: number
  pageViews: number
  events: number
  topPages: PageStat[]
  topReferrers: ReferrerStat[]
  topCountries: CountryStat[]
  deviceTypes: DeviceTypeStat[]
  browsers: BrowserStat[]
}

/**
 * Page statistics
 */
export interface PageStat {
  page: string
  views: number
  uniqueViews: number
  averageTime: number
}

/**
 * Referrer statistics
 */
export interface ReferrerStat {
  referrer: string
  visits: number
  percentage: number
}

/**
 * Country statistics
 */
export interface CountryStat {
  country: string
  users: number
  percentage: number
}

/**
 * Device type statistics
 */
export interface DeviceTypeStat {
  type: 'desktop' | 'mobile' | 'tablet'
  users: number
  percentage: number
}

/**
 * Browser statistics
 */
export interface BrowserStat {
  browser: string
  users: number
  percentage: number
}

// ============= Analytics Dashboard =============

/**
 * Dashboard widget configuration
 */
export interface AnalyticsDashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'funnel' | 'map'
  title: string
  span: { cols: number; rows: number }
  position: { x: number; y: number }
  config: {
    metric?: string
    timeRange?: string
    filters?: Record<string, unknown>
    chartType?: 'line' | 'bar' | 'pie' | 'area'
    groupBy?: string
  }
  refreshInterval?: number
}

/**
 * Dashboard configuration
 */
export interface AnalyticsDashboard {
  id: string
  name: string
  description?: string
  widgets: AnalyticsDashboardWidget[]
  filters: DashboardFilter[]
  defaultTimeRange: string
  refreshInterval: number
  isPublic: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Dashboard filter
 */
export interface DashboardFilter {
  id: string
  name: string
  type: 'select' | 'date' | 'text' | 'number'
  options?: string[]
  defaultValue?: Record<string, unknown>
  required?: boolean
}

// ============= Export Legacy Types =============

// ============= Error Tracking Types =============

/**
 * Error context for logging and tracking
 */
export interface ErrorContext {
  userId?: string
  sessionId?: string
  requestId?: string
  url?: string
  method?: string
  statusCode?: number
  userAgent?: string
  ipAddress?: string
  component?: string
  route?: string
  buildVersion?: string
  timestamp?: string
  extra?: Record<string, unknown>
}

// Legacy exports for backward compatibility
export interface UsePageAnalyticsOptions {
  trackPageView?: boolean
  trackTime?: boolean
  trackEvents?: boolean
}

