/**
 * Web Vitals API
 * Stores Core Web Vitals metrics for performance monitoring
 */

import { db } from '@/lib/db';
import { webVitals, type NewWebVital } from '@/lib/schema';
import { logger } from '@/lib/logger';
import { getClientIp, unifiedRateLimiter } from '@/lib/rate-limiter';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const WebVitalSchema = z.object({
  name: z.enum(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB']),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  delta: z.number(),
  id: z.string(),
  navigation_type: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Web vitals rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validatedData = WebVitalSchema.parse(body);

    // Get user agent and URL
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || request.url;

    // Parse pathname from referer URL
    let pathname = '/';
    try {
      const url = new URL(referer);
      pathname = url.pathname;
    } catch {
      // If URL parsing fails, use the full referer as pathname
      pathname = referer;
    }

    // Insert web vital using Drizzle
    const webVitalData: NewWebVital = {
      name: validatedData.name,
      value: String(validatedData.value),
      rating: validatedData.rating || null,
      delta: validatedData.delta !== undefined ? String(validatedData.delta) : null,
      navigationType: validatedData.navigation_type || null,
      url: referer,
      pathname,
      userAgent: userAgent || null,
      sessionId: null,
      timestamp: new Date(),
    };

    // Store web vitals data
    try {
      await db.insert(webVitals).values(webVitalData);
    } catch (dbError) {
      logger.error('Failed to store web vital:', dbError as Error);
      // Don't return error to client - fail silently
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Web vitals error:', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
