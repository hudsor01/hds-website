/**
 * API Route: Submit Testimonial
 * POST /api/testimonials/submit
 */

import { type NextRequest, NextResponse } from 'next/server';
import { submitTestimonial, markRequestSubmitted, getTestimonialRequestByToken } from '@/lib/testimonials';
import { logger } from '@/lib/logger';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';

interface SubmitTestimonialRequest {
  request_id?: string;
  token?: string;
  client_name: string;
  company?: string;
  role?: string;
  rating: number;
  content: string;
  photo_url?: string;
  video_url?: string;
  service_type?: string;
}

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
    const body = await request.json() as SubmitTestimonialRequest;

    // Validate required fields
    if (!body.client_name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!body.content?.trim() || body.content.length < 20) {
      return NextResponse.json(
        { error: 'Testimonial must be at least 20 characters' },
        { status: 400 }
      );
    }

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

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
      body.request_id = testimonialRequest.id;
    }

    // Submit the testimonial
    const testimonial = await submitTestimonial({
      request_id: body.request_id,
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
