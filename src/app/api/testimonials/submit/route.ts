/**
 * API Route: Submit Testimonial
 * POST /api/testimonials/submit
 */

import { type NextRequest, NextResponse } from 'next/server';
import { submitTestimonial, markRequestSubmitted, getTestimonialRequestByToken } from '@/lib/testimonials';
import { logger } from '@/lib/logger';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { testimonialSubmitSchema } from '@/lib/schemas/query-params';

export async function POST(request: NextRequest) {
  // Rate limiting - 3 submissions per 15 minutes per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'contactForm');
  if (!isAllowed) {
    logger.warn('Testimonial submission rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const rawBody = await request.json();

    // Validate request body with Zod
    const parseResult = testimonialSubmitSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const errors = parseResult.error.flatten();
      const firstError = Object.values(errors.fieldErrors)[0]?.[0] || 'Invalid input';
      logger.warn('Invalid testimonial submission', { errors: errors.fieldErrors });
      return NextResponse.json(
        { error: firstError, details: errors.fieldErrors },
        { status: 400 }
      );
    }

    const body = parseResult.data;
    let requestId = body.request_id;

    // If token provided, validate it and mark as submitted
    if (body.token) {
      const testimonialRequest = await getTestimonialRequestByToken(body.token);

      if (!testimonialRequest) {
        return NextResponse.json(
          { error: 'Invalid testimonial link' },
          { status: 400 }
        );
      }

      if (testimonialRequest.submitted) {
        return NextResponse.json(
          { error: 'This link has already been used' },
          { status: 400 }
        );
      }

      if (new Date(testimonialRequest.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'This link has expired' },
          { status: 400 }
        );
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

    return NextResponse.json({
      success: true,
      message: 'Testimonial submitted successfully',
    });
  } catch (error) {
    logger.error('Failed to submit testimonial', {
      component: 'TestimonialAPI',
      action: 'submit',
      error,
    });

    return NextResponse.json(
      { error: 'Failed to submit testimonial. Please try again.' },
      { status: 500 }
    );
  }
}
