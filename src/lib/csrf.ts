import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_TOKEN_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Generate a new CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Get or create CSRF token from cookies
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_TOKEN_NAME);
  
  if (existingToken) {
    return existingToken.value;
  }
  
  // Generate new token
  const newToken = generateCSRFToken();
  
  // Set cookie with secure options
  cookieStore.set(CSRF_TOKEN_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return newToken;
}

// Verify CSRF token from request
export async function verifyCSRFToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_NAME);
  
  if (!cookieToken) {
    return false;
  }
  
  // Check header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken && crypto.timingSafeEqual(
    Buffer.from(cookieToken.value),
    Buffer.from(headerToken)
  )) {
    return true;
  }
  
  // Check body (for form submissions)
  try {
    const body = await request.clone().json();
    const bodyToken = body._csrf;
    
    if (bodyToken && crypto.timingSafeEqual(
      Buffer.from(cookieToken.value),
      Buffer.from(bodyToken)
    )) {
      return true;
    }
  } catch {
    // Body is not JSON or couldn't be parsed
  }
  
  return false;
}

// Client-side helper to get CSRF token
export function getCSRFTokenFromCookie(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_TOKEN_NAME}=([^;]+)`));
  return match ? match[2] : null;
}

// React hook for CSRF token
export function useCSRFToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return getCSRFTokenFromCookie();
}