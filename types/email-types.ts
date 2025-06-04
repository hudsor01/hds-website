/**
 * Email System Types
 * 
 * Comprehensive type definitions for email functionality including
 * transactional emails, sequences, templates, and automation.
 */

import { z } from 'zod'
import { SequenceStatus, ContentType } from './enum-types'

// ============= Email Infrastructure =============

/**
 * Email payload for sending emails via Resend
 */
export interface EmailPayload {
  to: string | string[]
  from?: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
  attachments?: EmailAttachment[]
  headers?: Record<string, string>
  tags?: EmailTag[]
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string
  content: string // Base64 encoded content
  type?: string
  disposition?: 'inline' | 'attachment'
  contentId?: string // For inline images
}

/**
 * Email tag for categorization and tracking
 */
export interface EmailTag {
  name: string
  value: string
}

/**
 * Result from sending an email
 */
export interface EmailResult {
  success: boolean
  messageId?: string
  response?: Record<string, unknown>
  error?: string
  details?: Record<string, unknown>
  timestamp: Date
}

/**
 * Email delivery status tracking
 */
export interface EmailDeliveryStatus {
  messageId: string
  email: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'failed'
  timestamp: Date
  details?: Record<string, unknown>
}

// ============= Email Templates =============

/**
 * Email template definition
 */
export interface EmailTemplate {
  id: string
  name: string
  description?: string
  category: 'transactional' | 'marketing' | 'system' | 'sequence'
  subject: string
  html: string
  text?: string
  variables: TemplateVariable[]
  isActive: boolean
  version: number
  createdAt: Date
  updatedAt: Date
  metadata?: {
    author?: string
    tags?: string[]
    previewText?: string
  }
}

/**
 * Template variable for dynamic content
 */
export interface TemplateVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'url' | 'email'
  required: boolean
  defaultValue?: Record<string, unknown>
  description?: string
  validation?: z.ZodSchema
}

/**
 * Template rendering context
 */
export interface TemplateContext {
  variables: Record<string, unknown>
  user?: {
    email: string
    firstName?: string
    lastName?: string
    company?: string
    [key: string]: any
  }
  metadata?: {
    timestamp: Date
    source: string
    [key: string]: any
  }
}

// ============= Email Sequences =============

/**
 * Automated email sequence definition
 */
export interface EmailSequence {
  id: string
  name: string
  description: string
  trigger: EmailTrigger
  emails: EmailStep[]
  isActive: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
  stats: SequenceStats
}

/**
 * Email sequence trigger condition
 */
export interface EmailTrigger {
  type: 'lead_magnet' | 'contact_form' | 'newsletter_signup' | 'purchase' | 'custom'
  conditions?: TriggerCondition[]
  resourceId?: string // For lead_magnet triggers
  delay?: number // Minutes to wait before starting sequence
}

/**
 * Trigger condition for sequence activation
 */
export interface TriggerCondition {
  field: string
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than'
  value: Record<string, unknown>
}

/**
 * Individual step in an email sequence
 */
export interface EmailStep {
  id: string
  order: number
  name: string
  delayDays: number // Days after the trigger event or previous step
  delayHours?: number // Additional hours for precise timing
  template: EmailTemplate | string // Template object or ID
  conditions?: StepCondition[]
  actions?: StepAction[]
  isActive: boolean
}

/**
 * Condition for skipping or modifying a sequence step
 */
export interface StepCondition {
  type: 'skip_if' | 'send_only_if'
  conditions: TriggerCondition[]
  operator: 'and' | 'or'
}

/**
 * Action to perform when step executes
 */
export interface StepAction {
  type: 'add_tag' | 'remove_tag' | 'update_field' | 'trigger_webhook' | 'move_to_sequence'
  parameters: Record<string, unknown>
}

/**
 * Sequence subscriber information
 */
export interface SequenceSubscriber {
  id: string
  email: string
  sequenceId: string
  triggeredAt: Date
  currentStep: number
  completedSteps: string[] // IDs of completed email steps
  status: SequenceStatus
  userData: Record<string, unknown> // Dynamic data for template replacement
  pausedAt?: Date
  pauseReason?: string
  completedAt?: Date
  unsubscribedAt?: Date
  lastEmailSent?: Date
  nextEmailDue?: Date
}

/**
 * Sequence performance statistics
 */
export interface SequenceStats {
  subscribers: {
    total: number
    active: number
    completed: number
    unsubscribed: number
  }
  emails: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
  }
  conversions: {
    total: number
    rate: number
    revenue?: number
  }
  lastUpdated: Date
}

// ============= Form-Related Email Types =============

/**
 * Contact form submission data for emails
 */
export interface ContactFormEmailData {
  name: string
  email: string
  company?: string
  phone?: string
  message: string
  service?: string
  budget?: string
  source?: string
  metadata?: {
    userAgent?: string
    ip?: string
    timestamp: Date
  }
}

/**
 * Newsletter subscription data
 */
export interface NewsletterEmailData {
  email: string
  firstName?: string
  lastName?: string
  source?: string
  interests?: string[]
  metadata?: {
    signupDate: Date
    ipAddress?: string
    userAgent?: string
  }
}

/**
 * Lead magnet request data for email delivery
 */
export interface LeadMagnetEmailData {
  email: string
  firstName?: string
  lastName?: string
  company?: string
  resourceId: string
  resourceName: string
  downloadLink: string
  metadata?: {
    downloadDate: Date
    ipAddress?: string
    source?: string
  }
}

// ============= Email Analytics =============

/**
 * Email campaign analytics
 */
export interface EmailCampaignAnalytics {
  campaignId: string
  name: string
  type: 'newsletter' | 'sequence' | 'broadcast' | 'transactional'
  sentAt: Date
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    complained: number
    unsubscribed: number
    failed: number
  }
  rates: {
    delivery: number
    open: number
    click: number
    bounce: number
    complaint: number
    unsubscribe: number
  }
  topLinks?: EmailLinkAnalytics[]
  deviceBreakdown?: Record<string, number>
  clientBreakdown?: Record<string, number>
}

/**
 * Individual email link analytics
 */
export interface EmailLinkAnalytics {
  url: string
  clicks: number
  uniqueClicks: number
  clickRate: number
  firstClickAt?: Date
  lastClickAt?: Date
}

/**
 * Email list health metrics
 */
export interface EmailListHealth {
  listId: string
  totalSubscribers: number
  activeSubscribers: number
  engagementRate: number
  bounceRate: number
  unsubscribeRate: number
  growthRate: number
  lastUpdated: Date
  segments: EmailSegment[]
}

/**
 * Email list segment
 */
export interface EmailSegment {
  id: string
  name: string
  criteria: TriggerCondition[]
  subscriberCount: number
  engagementRate: number
  lastUpdated: Date
}

// ============= Email Automation =============

/**
 * Email automation rule
 */
export interface EmailAutomationRule {
  id: string
  name: string
  description: string
  trigger: EmailTrigger
  actions: AutomationAction[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastTriggered?: Date
  triggerCount: number
}

/**
 * Automation action
 */
export interface AutomationAction {
  type: 'send_email' | 'add_to_sequence' | 'add_tag' | 'update_field' | 'send_webhook'
  parameters: Record<string, unknown>
  delay?: number // Minutes to wait before executing
}

/**
 * Email webhook payload
 */
export interface EmailWebhookPayload {
  event: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'
  messageId: string
  email: string
  timestamp: Date
  data?: Record<string, unknown>
}

// ============= Email Configuration =============

/**
 * Email service provider configuration
 */
export interface EmailProviderConfig {
  provider: 'resend' | 'sendgrid' | 'mailgun' | 'ses'
  apiKey: string
  domain?: string
  fromEmail: string
  fromName: string
  replyToEmail?: string
  webhookUrl?: string
  trackingEnabled: boolean
  rateLimits?: {
    perSecond?: number
    perMinute?: number
    perHour?: number
    perDay?: number
  }
}

/**
 * Email sending preferences
 */
export interface EmailPreferences {
  userId?: string
  email: string
  subscriptions: {
    newsletter: boolean
    productUpdates: boolean
    marketing: boolean
    transactional: boolean
    sequences: boolean
  }
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
  timezone?: string
  unsubscribedAt?: Date
  unsubscribeReason?: string
  preferences?: Record<string, unknown>
}