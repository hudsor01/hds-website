import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware } from '@/middleware/security';
import { z } from 'zod';

const webVitalSchema = z.object({
  id: z.string().max(100),
  name: z.enum(['FCP', 'LCP', 'CLS', 'FID', 'TTFB', 'INP']),
  value: z.number().min(0),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  delta: z.number(),
  navigationType: z.string().max(50),
  entries: z.array(z.any()).optional() // PerformanceEntry is complex, allow any for now
});

type WebVital = z.infer<typeof webVitalSchema>;

export async function POST(request: NextRequest) {
  return securityMiddleware(request, async (req) => {
    try {
      // Check if request has a body
      const text = await req.text();
      if (!text.trim()) {
        return NextResponse.json(
          { error: 'Empty request body' },
          { status: 400 }
        );
      }

      // Parse JSON safely
      let body;
      try {
        body = JSON.parse(text);
      } catch (parseError) {
        console.error('Web vitals JSON parse error:', parseError);
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
      
      // Validate metric data with Zod
      const result = webVitalSchema.safeParse(body);
      
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid metric data', details: result.error.issues },
          { status: 400 }
        );
      }
      
      const metric = result.data;

    // Log metric for monitoring
    if (process.env.NODE_ENV === "development" && process.env.DEBUG_WEB_VITALS) {
      console.log("Web Vitals Metric:", {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      url: request.headers.get('referer'),
    });
    }

    // In production, you would send this to your analytics service
    // Examples: Google Analytics, DataDog, New Relic, custom database
    
    // Send to Google Analytics 4 if available (only in production)
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && process.env.NODE_ENV === 'production') {
      await sendToGA4(metric, request);
    }

    // Store in database for historical analysis
    await storeMetric(metric, request);

    return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Web vitals logging error:', error);
      return NextResponse.json(
        { error: 'Failed to log metric' },
        { status: 500 }
      );
    }
  });
}

async function sendToGA4(metric: WebVital, request: NextRequest) {
  try {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const apiSecret = process.env.GA4_API_SECRET;
    
    if (!measurementId || !apiSecret) return;

    const clientId = request.headers.get('x-client-id') || 'anonymous';
    
    const payload = {
      client_id: clientId,
      events: [{
        name: 'web_vital',
        params: {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_rating: metric.rating,
          metric_id: metric.id,
          page_location: request.headers.get('referer'),
          user_agent: request.headers.get('user-agent'),
        }
      }]
    };

    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to send to GA4:', error);
  }
}

async function storeMetric(metric: WebVital, request: NextRequest) {
  // In a real application, you would store this in a database
  // For now, we'll just structure the data that would be stored
  
  const metricRecord = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigation_type: metric.navigationType,
    url: request.headers.get('referer'),
    user_agent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
    // Add more fields as needed for analysis
    device_type: getDeviceType(request.headers.get('user-agent') || ''),
    connection_type: request.headers.get('connection-type'),
  };

  // Example: Store in database
  // await db.webVitals.create({ data: metricRecord });
  
  // For now, log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Metric stored:', metricRecord);
  }
}

function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}