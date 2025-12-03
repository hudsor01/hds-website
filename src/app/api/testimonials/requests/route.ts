/**
 * API Route: Testimonial Requests
 * GET /api/testimonials/requests - List all testimonial requests (admin only)
 * POST /api/testimonials/requests - Create a new testimonial request (admin only)
 *
 * SECURITY: These endpoints require admin authentication via Supabase session
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getTestimonialRequests, createTestimonialRequest } from '@/lib/testimonials';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Testimonial requests rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const requests = await getTestimonialRequests();

    return NextResponse.json({ requests });
  } catch (error) {
    logger.error('Error fetching testimonial requests', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialRequestsAPI',
      action: 'list',
    });

    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

interface CreateRequestBody {
  clientName: string;
  clientEmail?: string;
  projectName?: string;
}

export async function POST(request: NextRequest) {
  // Rate limiting - 5 requests per minute per IP for write operations
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactFormApi');
  if (!isAllowed) {
    logger.warn('Testimonial requests POST rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json() as CreateRequestBody;

    if (!body.clientName?.trim()) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    const newRequest = await createTestimonialRequest(
      body.clientName,
      body.clientEmail,
      body.projectName
    );

    if (!newRequest) {
      throw new Error('Failed to create request');
    }

    logger.info('Testimonial request created', {
      component: 'TestimonialRequestsAPI',
      action: 'create',
      requestId: newRequest.id,
      clientName: body.clientName,
    });

    return NextResponse.json({
      success: true,
      token: newRequest.token,
      id: newRequest.id,
    });
  } catch (error) {
    logger.error('Error creating testimonial request', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialRequestsAPI',
      action: 'create',
    });

    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
