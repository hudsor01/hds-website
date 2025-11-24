/**
 * Web Vitals API
 * Stores Core Web Vitals metrics for performance monitoring
 */

import { type NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
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
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validatedData = WebVitalSchema.parse(body);

    // Get user agent and URL
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || request.url;

    // Insert web vital
    const { error } = await supabaseAdmin
      .from('web_vitals' as any)
      .insert({
        metric_name: validatedData.name,
        value: validatedData.value,
        rating: validatedData.rating,
        delta: validatedData.delta,
        metric_id: validatedData.id,
        navigation_type: validatedData.navigation_type,
        user_agent: userAgent,
        page_url: referer,
      } as any);

    if (error) {
      console.error('Failed to store web vital:', error);
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

    console.error('Web vitals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
