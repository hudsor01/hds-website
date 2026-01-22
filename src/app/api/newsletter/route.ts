import { eq, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { leads, type NewLead } from '@/lib/schema';
import { env } from '@/env';
import { logger } from '@/lib/logger';
import { getClientIp, unifiedRateLimiter } from '@/lib/rate-limiter';
import { newsletterSchema } from '@/lib/schemas/contact';
import { detectInjectionAttempt } from '@/lib/utils';
import { NextResponse, type NextRequest } from 'next/server';

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
  // Rate limiting - 3 requests per minute for newsletter signups
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'newsletter');
  if (!isAllowed) {
    logger.warn('Newsletter signup rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const startTime = Date.now();
    logger.info('Newsletter signup API accessed', {
      url: request.url,
      method: request.method,
      component: 'NewsletterAPI',
      userFlow: 'newsletter_subscription'
    });

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
        ip: clientIp,
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
      ip_address: clientIp,
      user_agent: userAgent || undefined,
    };

    // Save to leads table with newsletter source
    const leadData: NewLead = {
      email: subscriptionData.email,
      name: subscriptionData.first_name || '', // Store first name as part of name
      source: subscriptionData.source,
      status: 'newsletter-subscriber', // Different status for newsletter subscribers
      metadata: {
        message: 'Signed up for newsletter',
        consentMarketing: subscriptionData.consent_marketing,
        consentAnalytics: subscriptionData.consent_analytics,
        ipAddress: subscriptionData.ip_address,
        userAgent: subscriptionData.user_agent || null,
      },
    };

    try {
      await db.insert(leads).values(leadData);
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);

      logger.error('Failed to save newsletter subscriber to database', {
        error: errorMessage,
        email: subscriptionData.email,
        component: 'NewsletterAPI',
        userFlow: 'newsletter_subscription',
        action: 'POST_newsletter'
      });

      // Check if it's a duplicate email error (PostgreSQL unique violation code)
      if (errorMessage.includes('23505') || errorMessage.includes('unique constraint')) {
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
  // Rate limiting - 60 requests per minute for admin
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Newsletter admin rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

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

    // Get pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000); // Max 1000 per request
    const offset = (page - 1) * limit;

    // Retrieve newsletter subscribers from leads table (with privacy considerations)
    const data = await db
      .select({
        email: leads.email,
        name: leads.name,
        source: leads.source,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .where(eq(leads.source, 'newsletter-form'))
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(eq(leads.source, 'newsletter-form'));

    const count = countResult[0]?.count ?? 0;

    logger.info('Newsletter subscribers retrieved successfully', {
      count: data.length,
      component: 'NewsletterAPI',
      userFlow: 'newsletter_admin',
      action: 'GET_subscribers'
    });

    return NextResponse.json({
      subscribers: data,
      count,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
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
