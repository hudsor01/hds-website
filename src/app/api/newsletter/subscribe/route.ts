/**
 * Newsletter Subscription API
 * Handles email list subscriptions and welcome email
 */

import { logger } from '@/lib/logger';
import { getClientIp, unifiedRateLimiter } from '@/lib/rate-limiter';
import { getResendClient, isResendConfigured } from '@/lib/resend-client';
import type { Database } from '@/types/database';
import { supabaseAdmin } from '@/lib/supabase';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type NewsletterSubscriberInsert = Database['public']['Tables']['newsletter_subscribers']['Insert'];

const SubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Rate limiting - 3 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'newsletter');
  if (!isAllowed) {
    logger.warn('Newsletter rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, source } = SubscribeSchema.parse(body);

    // Check if already subscribed
    const { data: existing, error: existingError} = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error('Failed to check existing subscriber:', existingError as Error);
      return NextResponse.json({ error: 'Unable to process subscription' }, { status: 500 });
    }

    if (existing && existing.status === 'active') {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
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

    return NextResponse.json({ success: true, message: 'Successfully subscribed!' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    logger.error('Newsletter subscription error:', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
