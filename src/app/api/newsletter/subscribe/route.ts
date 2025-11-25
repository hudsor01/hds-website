/**
 * Newsletter Subscription API
 * Handles email list subscriptions and welcome email
 */

import { type NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { NewsletterSubscriber, NewsletterSubscriberInsert, SupabaseQueryResult } from '@/types/supabase-helpers';
import { Resend } from 'resend';
import { z } from 'zod';

const SubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Initialize Resend here to avoid build-time errors
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  try {
    const body = await request.json();
    const { email, source } = SubscribeSchema.parse(body);

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if already subscribed
    const { data: existing } = (await supabaseAdmin
      .from('newsletter_subscribers' as 'lead_attribution') // Type assertion for custom table
      .select('*')
      .eq('email', email)
      .single()) as unknown as SupabaseQueryResult<NewsletterSubscriber>;

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
      first_name: null,
      unsubscribed_at: null,
      tags: [],
    };

    const { error: dbError } = await supabaseAdmin
      .from('newsletter_subscribers' as 'lead_attribution') // Type assertion for custom table
      .upsert(subscriberData as unknown as never); // Bypass type checking

    if (dbError) {
      console.error('Failed to save subscriber:', dbError);
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    // Send welcome email
    try {
      if (resend) {
        await resend.emails.send({
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
      console.error('Failed to send welcome email:', emailError);
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

    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
