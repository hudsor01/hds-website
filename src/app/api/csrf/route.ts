import { NextResponse } from 'next/server';
import { generateCSRFToken, setCSRFTokenCookie } from '@/lib/csrf';

export async function GET() {
  try {
    const token = generateCSRFToken();
    
    const response = NextResponse.json(
      { token },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );

    setCSRFTokenCookie(response, token);
    
    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}