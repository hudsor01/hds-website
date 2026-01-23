/**
 * API Route: Testimonial Requests
 * GET /api/testimonials/requests - List all testimonial requests (admin only)
 * POST /api/testimonials/requests - Create a new testimonial request (admin only)
 *
 * SECURITY: These endpoints require admin authentication via Supabase session
 */

import { type NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api/responses';
import { getTestimonialRequests, createTestimonialRequest } from '@/lib/testimonials';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';

async function handleTestimonialRequestsGet(_request: NextRequest) {
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

export const GET = withRateLimit(handleTestimonialRequestsGet, 'api');

async function handleTestimonialRequestsPost(request: NextRequest) {
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

export const POST = withRateLimit(handleTestimonialRequestsPost, 'contactFormApi');
