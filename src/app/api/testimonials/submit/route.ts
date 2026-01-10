/**
 * API Route: Submit Testimonial
 * POST /api/testimonials/submit
 */

import { type NextRequest } from 'next/server';
import { submitTestimonial, markRequestSubmitted, getTestimonialRequestByToken } from '@/lib/testimonials';
import { logger } from '@/lib/logger';
import { testimonialSubmitSchema } from '@/lib/schemas/query-params';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api/responses';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';

async function handleTestimonialSubmit(request: NextRequest) {
  try {
    const rawBody = await request.json();

    // Validate request body with Zod
    const parseResult = testimonialSubmitSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return validationErrorResponse(parseResult.error);
    }

    const body = parseResult.data;
    let requestId = body.request_id;

    // If token provided, validate it and mark as submitted
    if (body.token) {
      const testimonialRequest = await getTestimonialRequestByToken(body.token);

      if (!testimonialRequest) {
        return errorResponse('Invalid testimonial link', 400);
      }

      if (testimonialRequest.submitted) {
        return errorResponse('This link has already been used', 400);
      }

      if (new Date(testimonialRequest.expires_at) < new Date()) {
        return errorResponse('This link has expired', 400);
      }

      // Set request_id from the validated request
      requestId = testimonialRequest.id;
    }

    // Submit the testimonial
    const testimonial = await submitTestimonial({
      request_id: requestId,
      client_name: body.client_name,
      company: body.company,
      role: body.role,
      rating: body.rating,
      content: body.content,
      photo_url: body.photo_url,
      video_url: body.video_url,
      service_type: body.service_type,
    });

    if (!testimonial) {
      throw new Error('Failed to save testimonial');
    }

    // Mark the request as submitted if token was used
    if (body.token) {
      await markRequestSubmitted(body.token);
    }

    logger.info('Testimonial submitted', {
      component: 'TestimonialAPI',
      action: 'submit',
      testimonialId: testimonial.id,
      rating: body.rating,
      isPrivateLink: !!body.token,
    });

    return successResponse(undefined, 'Testimonial submitted successfully');
  } catch (error) {
    logger.error('Failed to submit testimonial', {
      component: 'TestimonialAPI',
      action: 'submit',
      error,
    });

    return errorResponse('Failed to submit testimonial. Please try again.', 500);
  }
}

export const POST = withRateLimit(handleTestimonialSubmit, 'contactForm');
