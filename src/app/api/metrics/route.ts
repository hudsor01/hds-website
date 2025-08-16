import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/metrics';

// Prometheus metrics endpoint for Grafana scraping
export async function GET(request: NextRequest) {
  // Production security
  if (process.env.NODE_ENV === 'production') {
    // Check IP whitelist (your Prometheus server)
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') ||
                     request.headers.get('cf-connecting-ip'); // Cloudflare
    
    const allowedIPs = process.env.METRICS_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];
    
    // If whitelist is configured, enforce it
    if (allowedIPs.length > 0 && clientIP && !allowedIPs.includes(clientIP)) {
      console.error(`Metrics access denied for IP: ${clientIP}`);
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    // Check auth token if configured
    if (process.env.METRICS_AUTH_TOKEN) {
      const authHeader = request.headers.get('authorization');
      const expectedToken = `Bearer ${process.env.METRICS_AUTH_TOKEN}`;
      if (authHeader !== expectedToken) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }
  }

  try {
    // Get all metrics in Prometheus format
    const metrics = await register.metrics();
    
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error collecting metrics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Health check endpoint for monitoring
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}