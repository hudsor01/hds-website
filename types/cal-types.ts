/**
 * Cal.com Integration Types
 * 
 * Comprehensive type definitions for Cal.com integration including
 * Atoms API, widgets, webhooks, and booking management.
 * Based on official Cal.com embed documentation and Atoms API.
 */

import { z } from 'zod'

export interface CalEmbedConfig {
  namespace?: string
  styles?: {
    branding?: {
      brandColor?: string
    }
  }
  hideEventTypeDetails?: boolean
  layout?: 'month_view' | 'week_view' | 'column_view'
  theme?: 'light' | 'dark'
}

export interface CalInlineConfig extends CalEmbedConfig {
  elementOrSelector: string
  calLink: string
}

// Cal.com Event Types
export type CalEventAction = 
  | 'eventTypeSelected'
  | 'bookingSuccessful' 
  | 'linkReady'
  | 'linkFailed'
  | '__iframeReady'
  | '__windowLoadComplete'
  | '__dimensionChanged'
  | '*' // Wildcard for all events

export interface CalEventDetail {
  data: Record<string, unknown>
  type: string
  namespace: string
}

export interface CalEvent {
  detail: CalEventDetail
}

export type CalEventCallback = (event: CalEvent) => void

export interface CalEventListener {
  action: CalEventAction
  callback: CalEventCallback
}

export interface CalGlobal {
  (action: 'inline', config: CalInlineConfig): void
  (action: 'ui', config: Record<string, unknown>): void
  (action: 'on', listener: CalEventListener): void
}

// Extend global Window interface
declare global {
  interface Window {
    Cal?: CalGlobal
  }
}

export interface CalComWidgetProps {
  calLink?: string
  theme?: 'light' | 'dark'
  hideEventTypeDetails?: boolean
  layout?: 'month_view' | 'week_view' | 'column_view'
  className?: string
  onReady?: () => void
  onError?: (error: Error) => void
  // Cal.com embed event handlers
  onEventTypeSelected?: (event: CalEvent) => void
  onBookingSuccessful?: (event: CalEvent) => void
  onLinkReady?: (event: CalEvent) => void
  onLinkFailed?: (event: CalEvent) => void
  onDimensionChanged?: (event: CalEvent) => void
  onAllEvents?: (event: CalEvent) => void // Wildcard listener
}

export interface CalComButtonProps {
  calLink?: string
  children: React.ReactNode
  className?: string
  theme?: 'light' | 'dark'
  onBookingSuccess?: (booking: Record<string, unknown>) => void
  onBookingError?: (error: Error) => void
  // Cal.com embed event handlers
  onEventTypeSelected?: (event: CalEvent) => void
  onBookingSuccessful?: (event: CalEvent) => void
  onLinkReady?: (event: CalEvent) => void
  onLinkFailed?: (event: CalEvent) => void
}

// ============= Cal.com Atoms Types =============

/**
 * Cal.com CalProvider configuration
 */
export interface CalProviderConfig {
  clientId: string
  options: {
    apiUrl: string
    refreshUrl?: string
    readingDirection?: 'ltr' | 'rtl'
  }
  accessToken?: string
  autoUpdateTimezone?: boolean
  language?: string
  organizationId?: string
}

/**
 * Cal.com Atoms API response types
 */
export interface CalApiResponse<T = any> {
  status: 'success' | 'error'
  data?: T
  error?: {
    message: string
    code: string
    details?: Record<string, unknown>
  }
}

// ============= Database Schema Types =============

/**
 * Booking status enum
 */
export enum BookingStatus {
  AWAITING_HOST = 'AWAITING_HOST',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED'
}

/**
 * Meeting type enum
 */
export enum MeetingType {
  VIDEO = 'VIDEO',
  PHONE = 'PHONE',
  IN_PERSON = 'IN_PERSON',
  HYBRID = 'HYBRID'
}

/**
 * Booking source tracking
 */
export enum BookingSource {
  WEBSITE = 'WEBSITE',
  DIRECT_LINK = 'DIRECT_LINK',
  EMAIL = 'EMAIL',
  SOCIAL = 'SOCIAL',
  REFERRAL = 'REFERRAL',
  OTHER = 'OTHER'
}

// ============= Webhook Types =============

/**
 * Cal.com webhook event types
 */
export enum CalWebhookEvent {
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_RESCHEDULED = 'BOOKING_RESCHEDULED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_PAID = 'BOOKING_PAID',
  BOOKING_REQUESTED = 'BOOKING_REQUESTED',
  MEETING_ENDED = 'MEETING_ENDED',
  FORM_SUBMITTED = 'FORM_SUBMITTED',
  INSTANT_MEETING = 'INSTANT_MEETING',
  RECORDING_READY = 'RECORDING_READY'
}

/**
 * Webhook payload structure
 */
export interface CalWebhookPayload {
  triggerEvent: CalWebhookEvent
  createdAt: string
  payload: {
    booking?: CalWebhookBooking
    eventType?: CalWebhookEventType
    user?: CalWebhookUser
    attendees?: CalWebhookAttendee[]
    organizer?: CalWebhookOrganizer
    location?: CalWebhookLocation
    additionalNotes?: string
    responses?: Record<string, unknown>
    metadata?: Record<string, unknown>
    rescheduleReason?: string
    cancellationReason?: string
    paymentId?: string
  }
}

/**
 * Webhook booking data
 */
export interface CalWebhookBooking {
  id: number
  uid: string
  title: string
  description?: string
  startTime: string
  endTime: string
  timeZone: string
  status: string
  paid: boolean
  customInputs?: Record<string, unknown>
  responses?: Record<string, unknown>
}

/**
 * Webhook event type data
 */
export interface CalWebhookEventType {
  id: number
  title: string
  slug: string
  length: number
  price?: number
  currency?: string
}

/**
 * Webhook user data
 */
export interface CalWebhookUser {
  id: number
  username: string
  name: string
  email: string
  timeZone: string
}

/**
 * Webhook attendee data
 */
export interface CalWebhookAttendee {
  name: string
  email: string
  timeZone: string
  locale?: string
}

/**
 * Webhook organizer data
 */
export interface CalWebhookOrganizer {
  id: number
  name: string
  email: string
  username: string
  timeZone: string
}

/**
 * Webhook location data
 */
export interface CalWebhookLocation {
  type: string
  address?: string
  link?: string
  hostPhoneNumber?: string
  attendeePhoneNumber?: string
}

// ============= Analytics Types =============

/**
 * Booking analytics data
 */
export interface BookingAnalytics {
  period: {
    start: Date
    end: Date
  }
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  noShowBookings: number
  pendingBookings: number
  
  // Revenue metrics
  totalRevenue: number
  averageBookingValue: number
  conversionRate: number
  
  // Time-based metrics
  averageLeadTime: number // days between booking and appointment
  averageSessionDuration: number // minutes
  
  // Source attribution
  bookingsBySource: Record<BookingSource, number>
  topReferrers: Array<{
    source: string
    bookings: number
    revenue: number
  }>
  
  // Performance metrics
  responseTime: number // average time to confirm booking
  customerSatisfaction?: number
  repeatBookingRate: number
  
  // Trends
  dailyBookings: Array<{
    date: string
    bookings: number
    revenue: number
  }>
  
  hourlyDistribution: Array<{
    hour: number
    bookings: number
  }>
  
  weeklyDistribution: Array<{
    dayOfWeek: number
    bookings: number
  }>
}

// ============= Validation Schemas =============

/**
 * Booking creation schema
 */
export const bookingCreateSchema = z.object({
  eventTypeId: z.number().positive(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  attendee: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    timeZone: z.string(),
  }),
  location: z.string().optional(),
  customInputs: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  source: z.nativeEnum(BookingSource).default(BookingSource.WEBSITE),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
})

/**
 * Booking update schema
 */
export const bookingUpdateSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  internalNotes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
})

// ============= Service Types =============

/**
 * Service configuration for Cal.com integration
 */
export interface CalService {
  id: string
  name: string
  slug: string
  description: string
  duration: number
  price?: number
  bookingCurrency?: string
  calEventTypeId?: number
  isActive: boolean
  featured?: boolean
  defaultMeetingType: 'VIDEO' | 'PHONE' | 'IN_PERSON' | 'HYBRID'
  allowedMeetingTypes: Array<'VIDEO' | 'PHONE' | 'IN_PERSON' | 'HYBRID'>
  requiresApproval?: boolean
  features?: string[]
  benefits?: string[]
  targetAudience?: string
  estimatedTimeline?: string
  category?: string
  totalBookings?: number
  completedBookings?: number
  totalRevenue?: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Booking state management
 */
export interface CalBookingState {
  isLoading: boolean
  isBooked: boolean
  bookingId?: string
  error?: string
  retryCount: number
  lastAttempt?: Date
}

// ============= Type Exports =============

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>