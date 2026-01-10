/**
 * API Route: Testimonial Requests
 * GET /api/testimonials/requests - List all testimonial requests (admin only)
 * POST /api/testimonials/requests - Create a new testimonial request (admin only)
 *
 * SECURITY: These endpoints require admin authentication via Supabase session
 */

import { type NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api/responses';
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
    return errorResponse('Too many requests', 429);
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const requests = await getTestimonialRequests();

    return successResponse({ requests });
  } catch (error) {
    logger.error('Error fetching testimonial requests', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialRequestsAPI',
      action: 'list',
    });

    return errorResponse('Failed to fetch requests', 500);
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
    return errorResponse('Too many requests', 429);
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json() as CreateRequestBody;

    if (!body.clientName?.trim()) {
      return errorResponse('Client name is required', 400);
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

    return successResponse({
      token: newRequest.token,
      id: newRequest.id,
    });
  } catch (error) {
    logger.error('Error creating testimonial request', {
      error: error instanceof Error ? error.message : String(error),
      component: 'TestimonialRequestsAPI',
      action: 'create',
    });

    return errorResponse('Failed to create request', 500);
  }
}
