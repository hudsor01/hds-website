/**
 * Email Configuration Constants
 * Centralized email addresses and sender information
 */

/**
 * Email configuration for the application
 * Uses 'as const' for type-safe, readonly configuration
 */
export const EMAIL_CONFIG = {
  /**
   * Admin notification email - Used for automated system emails
   * @example Newsletter confirmations, form submissions
   */
  FROM_ADMIN: 'Hudson Digital <noreply@hudsondigitalsolutions.com>',

  /**
   * Personal email - Used for direct communication
   * @example Contact form responses, high-value lead notifications
   */
  FROM_PERSONAL: 'Richard Hudson <hello@hudsondigitalsolutions.com>',

  /**
   * Admin inbox - Receives all contact form submissions and notifications
   */
  TO_ADMIN: 'hello@hudsondigitalsolutions.com',
} as const;

/**
 * Type-safe keys for EMAIL_CONFIG
 */
export type EmailConfigKey = keyof typeof EMAIL_CONFIG;
