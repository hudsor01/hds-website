import { NextRequest, NextResponse } from 'next/server';

// Edge runtime for instant response (no cold start)
export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({ 
    status: 'warm',
    timestamp: Date.now()
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    }
  });
}

export async function POST(request: NextRequest) {
  // Warm multiple functions
  const warmTargets = [
    '/api/contact',
    '/api/analytics/web-vitals',
  ];
  
  const results = await Promise.allSettled(
    warmTargets.map(url => 
      fetch(`${request.nextUrl.origin}${url}`, { 
        method: 'GET',
        headers: { 'X-Warm-Request': 'true' }
      })
    )
  );
  
  return NextResponse.json({ 
    warmed: results.length,
    timestamp: Date.now()
  });
}