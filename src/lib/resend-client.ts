/**
 * Resend Email Client Singleton
 * Provides safe, lazy initialization of Resend client with proper error handling
 *
 * Official docs: https://resend.com/docs/send-with-nextjs
 *
 * This pattern prevents runtime errors when RESEND_API_KEY is missing
 * and provides clear error messages when email sending is attempted
 */

import { Resend } from 'resend';
import { env } from '@/env';

let resendInstance: Resend | null = null;
let initializationError: string | null = null;

/**
 * Get or create Resend client instance
 * Throws descriptive error if API key is missing
 */
export function getResendClient(): Resend {
  // Return cached instance if available
  if (resendInstance) {
    return resendInstance;
  }

  // Check if initialization previously failed
  if (initializationError) {
    throw new Error(initializationError);
  }

  // Validate API key
  const apiKey = env.RESEND_API_KEY;

  if (!apiKey) {
    initializationError = 'RESEND_API_KEY environment variable is not set. Email sending is disabled.';
    throw new Error(initializationError);
  }

  // Create and cache instance
  resendInstance = new Resend(apiKey);
  return resendInstance;
}

/**
 * Check if Resend is properly configured
 * Returns boolean instead of throwing
 */
export function isResendConfigured(): boolean {
  return !!env.RESEND_API_KEY;
}

/**
 * Optional: Send email with proper error handling
 * Wraps Resend send with additional error context
 */
export async function sendEmail(params: Parameters<Resend['emails']['send']>[0]) {
  try {
    const client = getResendClient();
    const result = await client.emails.send(params);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
      details: error
    };
  }
}
