/**
 * Booking Types
 * 
 * Types for booking-related functionality, primarily for Cal.com integration
 * and booking management systems.
 */

import { z } from 'zod'

// ============= Cal.com Event Types =============

/**
 * Cal.com Event Type definition
 */
export interface CalEventType {
  id: number
  title: string
  slug: string
  description?: string
  duration: number
  price?: number
  currency?: string
  schedulingType?: 'COLLECTIVE' | 'ROUND_ROBIN'
  requiresConfirmation?: boolean
  disableGuests?: boolean
  hideCalendarNotes?: boolean
  minimumBookingNotice?: number
  beforeEventBuffer?: number
  afterEventBuffer?: number
  locations?: CalEventLocation[]
  customInputs?: CalCustomInput[]
  metadata?: Record<string, unknown>
  bookingFields?: CalBookingField[]
  workflows?: CalWorkflow[]
  hosts?: CalHost[]
  users?: CalUser[]
  team?: CalTeam
  owner?: CalUser
  eventName?: string
  timeZone?: string
  periodType?: 'UNLIMITED' | 'ROLLING' | 'RANGE'
  periodStartDate?: string
  periodEndDate?: string
  periodDays?: number
  periodCountCalendarDays?: boolean
  recurringEvent?: CalRecurringEvent
  seatsPerTimeSlot?: number
  seatsShowAttendees?: boolean
  position?: number
  successRedirectUrl?: string
  forwardParamsSuccessRedirect?: boolean
  hidden?: boolean
  hashedLink?: CalHashedLink
  destinationCalendar?: CalDestinationCalendar
  availability?: CalAvailability[]
  bookingLimits?: CalBookingLimits
  durationLimits?: CalDurationLimits
  offsetStart?: number
  hidden_?: boolean
  length?: number
}

/**
 * Cal.com Configuration for booking widgets
 */
export interface CalConfig {
  theme?: 'light' | 'dark' | 'auto'
  layout?: 'month_view' | 'column_view' | 'week_view'
  styles?: Record<string, string>
  hideEventTypeDetails?: boolean
  namespace?: string
  branding?: {
    brandColor?: string
    darkBrandColor?: string
    theme?: string
  }
  prefill?: {
    name?: string
    email?: string
    notes?: string
    guests?: string[]
    customInputs?: Record<string, unknown>
  }
  iframeAttrs?: Record<string, string>
  origin?: string
  debug?: boolean
  hideFormsOnce?: boolean
  isBookingPage?: boolean
  embedConfig?: CalEmbedConfig
}

/**
 * Cal.com Embed Configuration
 */
export interface CalEmbedConfig {
  elementOrSelector?: string
  calLink?: string
  config?: Partial<CalConfig>
  colorScheme?: 'auto' | 'dark' | 'light'
  namespace?: string
  restoreConfig?: Partial<CalConfig>
}

// ============= Supporting Types =============

/**
 * Cal.com Location definition
 */
export interface CalEventLocation {
  type: string
  address?: string
  link?: string
  displayLocationPublicly?: boolean
  hostPhoneNumber?: string
  credentialId?: number
}

/**
 * Cal.com Custom Input definition
 */
export interface CalCustomInput {
  id: number
  label: string
  type: 'TEXT' | 'TEXTLONG' | 'NUMBER' | 'BOOL' | 'RADIO' | 'PHONE'
  required?: boolean
  placeholder?: string
  options?: string[]
}

/**
 * Cal.com Booking Field definition
 */
export interface CalBookingField {
  name: string
  type: string
  label?: string
  required?: boolean
  placeholder?: string
  options?: Array<{
    label: string
    value: string
  }>
  getOptionsAt?: string
  hideWhenJustOneOption?: boolean
  hidden?: boolean
  editable?: 'user' | 'system' | 'user-readonly'
  defaultLabel?: string
  variant?: 'check' | 'radio'
}

/**
 * Cal.com Workflow definition
 */
export interface CalWorkflow {
  id: number
  name: string
  trigger: 'BEFORE_EVENT' | 'AFTER_EVENT' | 'NEW_EVENT' | 'CANCELLED_EVENT' | 'RESCHEDULED_EVENT'
  time?: number
  timeUnit?: 'MINUTE' | 'HOUR' | 'DAY'
  steps: CalWorkflowStep[]
}

/**
 * Cal.com Workflow Step definition
 */
export interface CalWorkflowStep {
  id: number
  stepNumber: number
  action: 'EMAIL_HOST' | 'EMAIL_ATTENDEE' | 'SMS_ATTENDEE' | 'SMS_NUMBER'
  sendTo?: string
  reminderBody?: string
  emailSubject?: string
  template?: 'REMINDER' | 'CUSTOM'
  numberRequired?: boolean
  sender?: string
}

/**
 * Cal.com Host definition
 */
export interface CalHost {
  userId: number
  isFixed: boolean
  priority?: number
}

/**
 * Cal.com User definition
 */
export interface CalUser {
  id: number
  username: string
  name: string
  email: string
  bio?: string
  avatar?: string
  timeZone: string
  weekStart: string
  appTheme?: string
  theme?: string
  defaultScheduleId?: number
  locale?: string
  hideBranding?: boolean
  allowDynamicBooking?: boolean
  away?: boolean
  verified?: boolean
  role: 'USER' | 'ADMIN'
  plan: 'FREE' | 'TRIAL' | 'PRO' | 'PREMIUM'
}

/**
 * Cal.com Team definition
 */
export interface CalTeam {
  id: number
  name: string
  slug: string
  logo?: string
  bio?: string
  hideBranding?: boolean
  theme?: string
  brandColor?: string
  darkBrandColor?: string
  timeZone?: string
  weekStart?: string
  timeFormat?: number
}

/**
 * Cal.com Recurring Event definition
 */
export interface CalRecurringEvent {
  freq: number
  count?: number
  interval: number
  until?: string
}

/**
 * Cal.com Hashed Link definition
 */
export interface CalHashedLink {
  id: number
  link: string
  hashedUrl: string
}

/**
 * Cal.com Destination Calendar definition
 */
export interface CalDestinationCalendar {
  id: number
  integration: string
  externalId: string
  primaryEmail?: string
  userId?: number
  eventTypeId?: number
}

/**
 * Cal.com Availability definition
 */
export interface CalAvailability {
  id: number
  days: number[]
  startTime: string
  endTime: string
  date?: string
  userId?: number
  eventTypeId?: number
  scheduleId?: number
}

/**
 * Cal.com Booking Limits definition
 */
export interface CalBookingLimits {
  PER_DAY?: number
  PER_WEEK?: number
  PER_MONTH?: number
  PER_YEAR?: number
}

/**
 * Cal.com Duration Limits definition
 */
export interface CalDurationLimits {
  PER_DAY?: number
  PER_WEEK?: number
  PER_MONTH?: number
  PER_YEAR?: number
}

// ============= Booking Management Types =============

/**
 * Booking states for UI management
 */
export type BookingState = 
  | 'idle'
  | 'loading'
  | 'selecting'
  | 'confirming'
  | 'completed'
  | 'error'
  | 'cancelled'

/**
 * Service definition for booking widgets
 */
export interface BookingService {
  id: string
  name: string
  description?: string
  duration?: number
  price?: string
  bookingCurrency?: string
  featured?: boolean
  defaultMeetingType?: string
  features?: string[]
  eventTypeId?: number
  calendarId?: string
}

/**
 * Booking analytics event data
 */
export interface BookingAnalyticsEvent {
  sessionId: string
  serviceId?: string
  eventType: 'booking_page_view' | 'booking_started' | 'booking_completed' | 'booking_cancelled'
  timestamp: Date
  metadata?: Record<string, unknown>
}

// ============= Validation Schemas =============

/**
 * Cal.com configuration validation schema
 */
export const calConfigSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  layout: z.enum(['month_view', 'column_view', 'week_view']).optional(),
  styles: z.record(z.string()).optional(),
  hideEventTypeDetails: z.boolean().optional(),
  namespace: z.string().optional(),
  branding: z.object({
    brandColor: z.string().optional(),
    darkBrandColor: z.string().optional(),
    theme: z.string().optional(),
  }).optional(),
  prefill: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    notes: z.string().optional(),
    guests: z.array(z.string()).optional(),
    customInputs: z.record(z.any()).optional(),
  }).optional(),
  debug: z.boolean().optional(),
})

/**
 * Booking service validation schema
 */
export const bookingServiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  duration: z.number().positive().optional(),
  price: z.string().optional(),
  bookingCurrency: z.string().length(3).optional(),
  featured: z.boolean().optional(),
  defaultMeetingType: z.string().optional(),
  features: z.array(z.string()).optional(),
  eventTypeId: z.number().positive().optional(),
  calendarId: z.string().optional(),
})

// ============= Type Exports =============

export type CalConfigInput = z.infer<typeof calConfigSchema>
export type BookingServiceInput = z.infer<typeof bookingServiceSchema>

// Re-export commonly used types from cal-types for convenience
export type { CalService, CalBookingState } from '@/types/cal-types'