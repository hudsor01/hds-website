import { env } from '@/env';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { newsletterSchema } from '@/lib/schemas/contact';
import { detectInjectionAttempt } from '@/lib/utils';
import { db } from '@/lib/db';
import { leads } from '@/lib/schemas/leads';
import { eq, desc, count } from 'drizzle-orm';
import { type NextRequest } from 'next/server';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';

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

async function handleNewsletterPost(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

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
      return validationErrorResponse(validation.error);
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
    try {
      await db.insert(leads).values({
        email: subscriptionData.email,
        name: subscriptionData.first_name || '',
        source: subscriptionData.source,
        status: 'newsletter-subscriber',
        metadata: {
          message: 'Signed up for newsletter',
          consent_marketing: subscriptionData.consent_marketing,
          consent_analytics: subscriptionData.consent_analytics,
          ip_address: subscriptionData.ip_address,
          user_agent: subscriptionData.user_agent || null,
        },
      });
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      logger.error('Failed to save newsletter subscriber to database', {
        error: errorMessage,
        email: subscriptionData.email,
        component: 'NewsletterAPI',
        userFlow: 'newsletter_subscription',
        action: 'POST_newsletter'
      });

      // Check if it's a duplicate email error (unique violation)
      if (errorMessage.includes('unique') || errorMessage.includes('duplicate') || errorMessage.includes('23505')) {
        return successResponse(undefined, 'You are already subscribed to our newsletter!');
      }

      return errorResponse('Failed to save subscription', 500);
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

    return successResponse(undefined, 'Thank you for subscribing to our newsletter!');
  } catch (error) {
    logger.error('Error in newsletter signup API', {
      error: error instanceof Error ? error.message : String(error),
      component: 'NewsletterAPI',
      userFlow: 'newsletter_subscription',
      action: 'POST_newsletter'
    });

    return errorResponse('Failed to process subscription', 500);
  }
}

export const POST = withRateLimit(handleNewsletterPost, 'newsletter');

// GET endpoint for retrieving subscribers (admin only)
async function handleNewsletterGet(request: NextRequest) {
  try {
    // Verify this is an admin request
    const authHeader = request.headers.get('authorization');

    // Check for admin token (should match the one configured in env)
    if (!env.ADMIN_API_TOKEN) {
      logger.error('ADMIN_API_TOKEN not configured');
      return errorResponse('Server configuration error', 500);
    }

    if (authHeader !== `Bearer ${env.ADMIN_API_TOKEN}`) {
      return errorResponse('Unauthorized', 401);
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
    const [countResult] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.source, 'newsletter-form'));

    const totalCount = countResult?.count ?? 0;

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
      .offset(offset)
      .limit(limit);

    logger.info('Newsletter subscribers retrieved successfully', {
      count: data.length,
      component: 'NewsletterAPI',
      userFlow: 'newsletter_admin',
      action: 'GET_subscribers'
    });

    return successResponse({
      subscribers: data,
      count: totalCount,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    logger.error('Error retrieving newsletter subscribers', {
      error: error instanceof Error ? error.message : String(error),
      component: 'NewsletterAPI',
      userFlow: 'newsletter_admin',
      action: 'GET_subscribers'
    });

    return errorResponse('Failed to retrieve subscribers', 500);
  }
}

export const GET = withRateLimit(handleNewsletterGet, 'api');
