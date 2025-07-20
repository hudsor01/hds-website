import { NextRequest, NextResponse } from 'next/server';

// Static responses for common requests
const STATIC_RESPONSES = {
  services: {
    data: [
      'Web Development',
      'Digital Strategy',
      'Performance Optimization',
      'SEO Services'
    ],
    ttl: 3600 // 1 hour
  },
  pricing: {
    data: {
      starter: '$999',
      professional: '$2999',
      enterprise: 'Custom'
    },
    ttl: 86400 // 24 hours
  }
};

export const runtime = 'edge'; // Always warm

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  
  // Serve static data instantly
  if (type && STATIC_RESPONSES[type as keyof typeof STATIC_RESPONSES]) {
    const response = STATIC_RESPONSES[type as keyof typeof STATIC_RESPONSES];
    return NextResponse.json(response.data, {
      headers: {
        'Cache-Control': `public, s-maxage=${response.ttl}, stale-while-revalidate`,
      }
    });
  }
  
  // Fall back to dynamic data
  return NextResponse.json({ error: 'Type not found' }, { status: 404 });
}