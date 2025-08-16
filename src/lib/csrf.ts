import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const CSRF_TOKEN_COOKIE_NAME = 'csrf-token';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours

export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export function setCSRFTokenCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_TOKEN_MAX_AGE,
    path: '/',
  });
}

export function getCSRFTokenFromCookie(request: NextRequest): string | undefined {
  return request.cookies.get(CSRF_TOKEN_COOKIE_NAME)?.value;
}

export function verifyCSRFToken(tokenFromHeader: string, request: NextRequest): boolean {
  const tokenFromCookie = getCSRFTokenFromCookie(request);
  
  if (!tokenFromCookie || !tokenFromHeader) {
    return false;
  }
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(tokenFromCookie, 'hex'),
    Buffer.from(tokenFromHeader, 'hex')
  );
}

export function clearCSRFTokenCookie(response: NextResponse): void {
  response.cookies.delete(CSRF_TOKEN_COOKIE_NAME);
}

// Client-side CSRF token handling is now managed by React Query (useCSRFToken hook)