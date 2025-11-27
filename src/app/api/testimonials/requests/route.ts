/**
 * API Route: Testimonial Requests
 * GET /api/testimonials/requests - List all testimonial requests (admin only)
 * POST /api/testimonials/requests - Create a new testimonial request (admin only)
 *
 * SECURITY: These endpoints require admin authentication via Supabase session
 */

import { NextResponse } from 'next/server';
import { getTestimonialRequests, createTestimonialRequest } from '@/lib/testimonials';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';

export async function GET() {
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

export async function POST(request: Request) {
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
