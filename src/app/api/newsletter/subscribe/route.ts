/**
 * Newsletter Subscription API
 * Handles email list subscriptions and welcome email
 */

import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { getResendClient, isResendConfigured } from '@/lib/resend-client';
import type { Database } from '@/types/database';
import { supabaseAdmin } from '@/lib/supabase';
import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';

type NewsletterSubscriberInsert = Database['public']['Tables']['newsletter_subscribers']['Insert'];

const SubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional(),
});

async function handleNewsletterSubscribe(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = SubscribeSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { email, source } = validation.data;

    // Check if already subscribed
    const { data: existing, error: existingError} = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error('Failed to check existing subscriber:', existingError as Error);
      return errorResponse('Unable to process subscription', 500);
    }

    if (existing && existing.status === 'active') {
      return errorResponse('Email already subscribed', 400);
    }

    // Insert or update subscriber
    const subscriberData: NewsletterSubscriberInsert = {
      email,
      status: 'active',
      source: source || 'website',
      subscribed_at: new Date().toISOString(),
      unsubscribed_at: null,
    };

    const { error: dbError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert(subscriberData);

    if (dbError) {
      logger.error('Failed to save subscriber:', dbError);
      return errorResponse('Failed to subscribe', 500);
    }

    // Send welcome email
    try {
      if (isResendConfigured()) {
        await getResendClient().emails.send({
        from: 'Hudson Digital Solutions <hello@hudsondigitalsolutions.com>',
        to: email,
        subject: 'Welcome to Hudson Digital Solutions Newsletter',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0891b2;">Welcome to Our Newsletter!</h1>
            <p>Thank you for subscribing to Hudson Digital Solutions newsletter.</p>
            <p>You'll receive weekly insights on:</p>
            <ul>
              <li>Scaling engineering teams</li>
              <li>Technical leadership best practices</li>
              <li>Development efficiency tips</li>
              <li>Industry trends and case studies</li>
            </ul>
            <p>Stay tuned for our next edition!</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              You're receiving this because you subscribed to our newsletter.
              <a href="https://hudsondigitalsolutions.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #0891b2;">Unsubscribe</a>
            </p>
          </div>
        `,
        });
      }
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError as Error);
      // Don't fail the request if email fails
    }

    return successResponse(undefined, 'Successfully subscribed!');
  } catch (error) {
    logger.error('Newsletter subscription error:', error as Error);
    return errorResponse('Internal server error', 500);
  }
}

export const POST = withRateLimit(handleNewsletterSubscribe, 'newsletter');
