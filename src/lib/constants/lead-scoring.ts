/**
 * Lead Scoring Constants
 * Centralized configuration for lead qualification and prioritization
 *
 * This file defines all scoring thresholds, point values, and categorization rules
 * used across the application for consistent lead evaluation.
 */

/**
 * Point values for lead scoring factors
 * Maximum possible score: 100 points
 */
export const LEAD_SCORE_POINTS = {
  /** High-value budget (15k-50k, 50k-plus) */
  HIGH_BUDGET: 30,

  /** Urgent timeline (asap, 1-month) */
  URGENT_TIMELINE: 20,

  /** Specific service selected (not 'other') */
  SPECIFIC_SERVICE: 15,

  /** Company name provided */
  HAS_COMPANY: 15,

  /** Phone number provided */
  HAS_PHONE: 10,

  /** Message length exceeds threshold */
  LONG_MESSAGE: 10,
} as const;

/**
 * Message length threshold for bonus points
 * Messages longer than this receive LONG_MESSAGE points
 */
export const MESSAGE_LENGTH_THRESHOLD = 100;

/**
 * Lead category thresholds
 * Used by scoreLeadFromContactData() to categorize leads
 */
export const LEAD_CATEGORY_THRESHOLDS = {
  /** High-value lead requiring immediate attention (>= 70) */
  HIGH_VALUE: 70,

  /** Qualified lead worth pursuing (>= 45) */
  QUALIFIED: 45,

  /** Standard lead for nurture sequence (>= 20) */
  STANDARD: 20,

  /** Below 20 = 'low' category (no dedicated threshold) */
} as const;

/**
 * Lead quality labels for database storage
 * Used to tag leads as hot/warm/cold in the database
 *
 * NOTE: These differ from LEAD_CATEGORY_THRESHOLDS - quality is about
 * immediate conversion potential, category is about engagement strategy
 */
export const LEAD_QUALITY_THRESHOLDS = {
  /** Hot lead - immediate conversion potential (>= 80) */
  HOT: 80,

  /** Warm lead - strong interest (>= 70) */
  WARM: 70,

  /** Below 70 = 'cold' lead (no dedicated threshold) */
} as const;

/**
 * Notification priority thresholds
 * Used to determine urgency level in Slack/Discord notifications
 */
export const NOTIFICATION_PRIORITY_THRESHOLDS = {
  /** Urgent notification - contact within 24 hours (>= 80) */
  URGENT: 80,

  /** High priority notification - follow up within 48 hours (>= 70) */
  HIGH_PRIORITY: 70,

  /** Below 70 = 'qualified' priority (no dedicated threshold) */
} as const;

/**
 * Minimum score required to trigger any notification
 * Leads below this threshold do not generate notifications
 */
export const NOTIFICATION_MINIMUM_THRESHOLD = 70;

/**
 * Display category thresholds for email presentation
 * Used in admin notification emails to visually categorize leads
 */
export const DISPLAY_CATEGORY_THRESHOLDS = {
  /** Display as "HIGH PRIORITY" with green styling (>= 70) */
  HIGH_PRIORITY: 70,

  /** Display as "QUALIFIED" with yellow styling (>= 40) */
  QUALIFIED: 40,

  /** Below 40 = "NURTURE" with red styling (no dedicated threshold) */
} as const;

/**
 * Type-safe keys for all threshold configurations
 */
export type LeadScorePointsKey = keyof typeof LEAD_SCORE_POINTS;
export type LeadCategoryThresholdKey = keyof typeof LEAD_CATEGORY_THRESHOLDS;
export type LeadQualityThresholdKey = keyof typeof LEAD_QUALITY_THRESHOLDS;
export type NotificationPriorityThresholdKey = keyof typeof NOTIFICATION_PRIORITY_THRESHOLDS;
export type DisplayCategoryThresholdKey = keyof typeof DISPLAY_CATEGORY_THRESHOLDS;
