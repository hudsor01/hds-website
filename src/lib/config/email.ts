/**
 * Email Configuration Constants
 * Centralized email addresses and sender information
 */

import { BUSINESS_INFO } from '@/lib/constants';

/**
 * Email configuration for the application
 * Uses BUSINESS_INFO for single source of truth
 */
export const EMAIL_CONFIG = {
  /**
   * Admin notification email - Used for automated system emails
   * @example Newsletter confirmations, form submissions
   */
  FROM_ADMIN: `${BUSINESS_INFO.displayName} <noreply@hudsondigitalsolutions.com>`,

  /**
   * Personal email - Used for direct communication
   * @example Contact form responses, high-value lead notifications
   */
  FROM_PERSONAL: `Richard Hudson <${BUSINESS_INFO.email}>`,

  /**
   * Admin inbox - Receives all contact form submissions and notifications
   */
  TO_ADMIN: BUSINESS_INFO.email,
} as const;

/**
 * Type-safe keys for EMAIL_CONFIG
 */
export type EmailConfigKey = keyof typeof EMAIL_CONFIG;
