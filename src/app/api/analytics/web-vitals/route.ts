import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware, validateRequestBody } from '@/middleware/security';

interface WebVital {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  navigationType: string;
}

// Validation schema for web vitals
const webVitalSchema = {
  id: { required: true, type: 'string' as const, max: 100 },
  name: { 
    required: true, 
    type: 'string' as const,
    pattern: /^(FCP|LCP|CLS|FID|TTFB|INP)$/
  },
  value: { required: true, type: 'number' as const, min: 0 },
  rating: { 
    required: true, 
    type: 'string' as const,
    pattern: /^(good|needs-improvement|poor)$/
  },
  delta: { required: true, type: 'number' as const },
  navigationType: { required: true, type: 'string' as const, max: 50 }
};

export async function POST(request: NextRequest) {
  return securityMiddleware(request, async (req) => {
    try {
      const body = await req.json();
      
      // Validate metric data
      const validation = validateRequestBody<WebVital>(body, webVitalSchema);
      
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid metric data', details: validation.errors },
          { status: 400 }
        );
      }
      
      const metric = validation.data!;

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