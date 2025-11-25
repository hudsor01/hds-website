import { logger } from '@/lib/logger'
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase'
import { detectInjectionAttempt } from '@/lib/utils'
import { NextResponse, type NextRequest } from 'next/server'
import { newsletterSchema } from '@/lib/schemas/contact'
import { env } from '@/env'

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

    // Validate input using shared schema
    const parsedBody = {
      email: body.email,
      firstName: body.firstName,
      source: body.source || 'newsletter-form'
    };
    
    const validation = newsletterSchema.safeParse(parsedBody);
    
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.issues.forEach(issue => {
        const key = String(issue.path[0]);
        if (!errors[key]) {
          errors[key] = [];
        }
        errors[key].push(issue.message);
      });
      
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      );
    }
    
    const validatedData = validation.data;

    // Check for injection attempts
    if (detectInjectionAttempt(body.email, 'header') || (body.firstName && detectInjectionAttempt(body.firstName as string, 'header'))) {
      logger.warn('Potential injection attempt detected in newsletter signup', {
        email: body.email,
        firstName: body.firstName,
        ip: clientIP,
        component: 'NewsletterAPI',
        userFlow: 'newsletter_subscription',
        action: 'POST_newsletter'
      });
    }

    // Prepare subscription data using validated data
    const subscriptionData: NewsletterSubscription = {
      email: validatedData.email.toLowerCase().trim(),
      first_name: validatedData.firstName ? validatedData.firstName.trim() : undefined,
      source: validatedData.source || 'newsletter-form',
      consent_marketing: body.consentMarketing ?? false,
      consent_analytics: body.consentAnalytics ?? true,
      ip_address: clientIP,
      user_agent: userAgent || undefined,
    };

    // Check if Supabase admin is configured
    if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
      logger.warn('Supabase admin not configured, skipping newsletter subscription save');
      return NextResponse.json({
        message: 'Thank you for subscribing to our newsletter! (development mode)',
        success: true
      });
    }

    // Save to leads table with newsletter source
    const { error } = await supabaseAdmin
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
    // Verify this is an admin request
    const authHeader = request.headers.get('authorization');
    
    // Check for admin token (should match the one configured in env)
    if (!env.ADMIN_API_TOKEN) {
      logger.error('ADMIN_API_TOKEN not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    if (authHeader !== `Bearer ${env.ADMIN_API_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Newsletter subscribers list accessed', {
      url: request.url,
      method: request.method,
      component: 'NewsletterAPI',
      userFlow: 'newsletter_admin'
    });

    // Check if Supabase admin is configured
    if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
      logger.warn('Supabase admin not configured, returning empty subscribers list');
      return NextResponse.json({
        subscribers: [],
        count: 0
      });
    }

    // Get pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000); // Max 1000 per request
    const offset = (page - 1) * limit;

    // Retrieve newsletter subscribers from leads table (with privacy considerations)
    const { data, error, count } = await supabaseAdmin
      .from('leads')
      .select('email, name, source, created_at', { count: 'exact' })
      .eq('source', 'newsletter-form') // Filter for newsletter signups only
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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
      count: count || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
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
