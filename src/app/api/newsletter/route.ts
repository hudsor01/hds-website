import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { detectInjectionAttempt } from '@/lib/utils';
import { env } from '@/env';

// Validate environment variables
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Initialize Supabase client
const supabase = createClient(
  supabaseUrl,
  supabaseKey, // Using service role key for admin privileges
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Define the type for newsletter subscription data
interface NewsletterSubscription {
  email: string;
  first_name?: string;
  source: string;
  consent_marketing: boolean;
  consent_analytics: boolean;
  ip_address?: string;
  user_agent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    logger.info('Newsletter signup API accessed', {
      url: request.url,
      method: request.method,
      component: 'NewsletterAPI',
      userFlow: 'newsletter_subscription'
    });

    // Get client IP from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    let clientIP = '127.0.0.1';
    
    if (forwardedFor) {
      const first = forwardedFor.split(',')[0]?.trim();
      if (first) {
        clientIP = first;
      }
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
      clientIP = realIp.trim();
    }

    const userAgent = request.headers.get('user-agent');

    // Parse request body
    const body = await request.json();

    // Validate input
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check for injection attempts
    if (detectInjectionAttempt(body.email) || (body.firstName && detectInjectionAttempt(body.firstName as string))) {
      logger.warn('Potential injection attempt detected in newsletter signup', {
        email: body.email,
        firstName: body.firstName,
        ip: clientIP,
        component: 'NewsletterAPI',
        userFlow: 'newsletter_subscription',
        action: 'POST_newsletter'
      });
    }

    // Prepare subscription data
    const subscriptionData: NewsletterSubscription = {
      email: body.email.toLowerCase().trim(),
      first_name: body.firstName ? body.firstName.trim() : undefined,
      source: body.source || 'newsletter-form',
      consent_marketing: body.consentMarketing ?? false,
      consent_analytics: body.consentAnalytics ?? true,
      ip_address: clientIP,
      user_agent: userAgent || undefined,
    };

    // Save to leads table with newsletter source
    const { error } = await supabase
      .from('leads')
      .insert([{
        email: subscriptionData.email,
        name: subscriptionData.first_name || '', // Store first name as part of name
        source: subscriptionData.source,
        status: 'newsletter-subscriber', // Different status for newsletter subscribers
        message: 'Signed up for newsletter', // Indicate source
        consent_marketing: subscriptionData.consent_marketing,
        consent_analytics: subscriptionData.consent_analytics,
        ip_address: subscriptionData.ip_address,
        user_agent: subscriptionData.user_agent || null,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      logger.error('Failed to save newsletter subscriber to database', {
        error: error.message,
        email: subscriptionData.email,
        component: 'NewsletterAPI',
        userFlow: 'newsletter_subscription',
        action: 'POST_newsletter'
      });
      
      // Check if it's a duplicate email error
      if (error.code === '23505') { // Unique violation code
        return NextResponse.json(
          { message: 'You are already subscribed to our newsletter!' },
          { status: 200 } // Return 200 since they're already subscribed
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    logger.info('Newsletter subscription saved successfully', {
      email: subscriptionData.email,
      source: subscriptionData.source,
      responseTime: Date.now() - startTime,
      component: 'NewsletterAPI',
      userFlow: 'newsletter_subscription',
      action: 'POST_newsletter'
    });

    // In a real implementation, you might want to also:
    // 1. Send a confirmation/welcome email
    // 2. Trigger a marketing automation workflow
    // 3. Add to email service provider (Mailchimp, etc.)

    return NextResponse.json({
      message: 'Thank you for subscribing to our newsletter!',
      success: true
    });
  } catch (error) {
    logger.error('Error in newsletter signup API', {
      error: error instanceof Error ? error.message : String(error),
      component: 'NewsletterAPI',
      userFlow: 'newsletter_subscription',
      action: 'POST_newsletter'
    });

    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving subscribers (admin only)
export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would check for admin authentication:
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    logger.info('Newsletter subscribers list accessed', {
      url: request.url,
      method: request.method,
      component: 'NewsletterAPI',
      userFlow: 'newsletter_admin'
    });

    // Retrieve newsletter subscribers from leads table (with privacy considerations)
    const { data, error } = await supabase
      .from('leads')
      .select('email, name, source, created_at')
      .eq('source', 'newsletter-form') // Filter for newsletter signups only
      .order('created_at', { ascending: false })
      .limit(100); // Limit for performance

    if (error) {
      logger.error('Failed to retrieve newsletter subscribers', {
        error: error.message,
        component: 'NewsletterAPI',
        userFlow: 'newsletter_admin',
        action: 'GET_subscribers'
      });
      return NextResponse.json(
        { error: 'Failed to retrieve subscribers' },
        { status: 500 }
      );
    }

    logger.info('Newsletter subscribers retrieved successfully', {
      count: data?.length || 0,
      component: 'NewsletterAPI',
      userFlow: 'newsletter_admin',
      action: 'GET_subscribers'
    });

    return NextResponse.json({ 
      subscribers: data,
      count: data?.length || 0 
    });
  } catch (error) {
    logger.error('Error retrieving newsletter subscribers', {
      error: error instanceof Error ? error.message : String(error),
      component: 'NewsletterAPI',
      userFlow: 'newsletter_admin',
      action: 'GET_subscribers'
    });

    return NextResponse.json(
      { error: 'Failed to retrieve subscribers' },
      { status: 500 }
    );
  }
}