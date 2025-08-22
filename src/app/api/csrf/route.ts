import { NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';
import { applySecurityHeaders } from '@/lib/security-headers';

/**
 * GET /api/csrf
 * Returns a CSRF token for form submissions
 * Token is also set as a secure HTTP-only cookie
 */
export async function GET() {
  try {
    const token = generateCSRFToken();
    
    const response = NextResponse.json(
      { token },
      { status: 200 }
    );
    
    // Set CSRF token as HTTP-only, secure cookie
    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    });
    
    return applySecurityHeaders(response);
  } catch (error) {
    console.error('CSRF token generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate security token' },
      { status: 500 }
    );
  }
}