/**
 * CSRF Token Generation and Validation for Edge Runtime
 * Uses Web Crypto API instead of Node.js crypto module
 * Compatible with Next.js Edge Runtime and middleware
 *
 * Official docs: https://nextjs.org/docs/app/api-reference/edge
 * Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
 */

import { env } from '@/env'

// T3 env handles validation - use validated env vars directly
// Fallback to dev secret only for local development when CSRF_SECRET is optional
const CSRF_SECRET = env.CSRF_SECRET || 'dev-csrf-secret-not-for-production';

const TOKEN_LENGTH = 18;
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Generate random hex string using Web Crypto API
 * Replaces Node.js randomBytes()
 */
function generateRandomHex(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create HMAC signature using Web Crypto API (SubtleCrypto)
 * Replaces Node.js createHmac()
 */
async function createHmacSignature(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  // Import the secret key
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the message
  const signature = await crypto.subtle.sign('HMAC', key, messageData);

  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a CSRF token with expiry and signature
 * Edge Runtime compatible - uses Web Crypto API
 */
export async function generateCsrfToken(): Promise<string> {
  const expiry = Date.now() + TOKEN_EXPIRY;
  const token = generateRandomHex(TOKEN_LENGTH);
  const signature = await createHmacSignature(`${token}.${expiry}`, CSRF_SECRET);

  return `${token}.${expiry}.${signature}`;
}

/**
 * Validate a CSRF token
 * Edge Runtime compatible - uses Web Crypto API
 */
export async function validateCsrfToken(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [tokenPart, expiry, signature] = parts;
 if (!tokenPart || !expiry || !signature) {
    return false;
  }

  // Check expiry
  if (Date.now() > parseInt(expiry, 10)) {
    return false;
  }

  // Verify signature
  const expectedSignature = await createHmacSignature(`${tokenPart}.${expiry}`, CSRF_SECRET);

 return signature === expectedSignature;
}

/**
 * Extract CSRF token from request
 */
export async function getCsrfTokenFromRequest(request: Request): Promise<string | null> {
  const headerToken = request.headers.get('X-CSRF-Token');
  if (headerToken) {
    return headerToken;
  }

  try {
    const formData = await request.formData();
    const bodyToken = formData.get('csrf_token') as string | null;
    if (bodyToken) {
      return bodyToken;
    }
  } catch {
    // Ignore errors if the request body is not form data
  }

  return null;
}

/**
 * Validate CSRF token for mutation requests
 * Safe-list GET, HEAD, OPTIONS
 */
export async function validateCsrfForMutation(request: Request): Promise<boolean> {
  // Skip CSRF validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const token = await getCsrfTokenFromRequest(request);
  if (!token) {
    return false;
  }

  return await validateCsrfToken(token);
}
