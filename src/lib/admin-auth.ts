/**
 * Admin API Authorization
 * Simple email-whitelist check for admin API routes
 */

import { env } from '@/env';
import type { NextResponse } from 'next/server';

// Lazy-loaded admin email whitelist
let _adminEmails: string[] | null = null;

function getAdminEmails(): string[] {
  if (_adminEmails === null) {
    if (!env.ADMIN_EMAILS?.trim()) {
      throw new Error('ADMIN_EMAILS environment variable is required');
    }
    _adminEmails = env.ADMIN_EMAILS.split(',')
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0);
  }
  return _adminEmails;
}

export interface AuthResult {
  isAuthenticated: boolean;
  user?: { id: string; email: string };
  error?: NextResponse;
}

/**
 * Check if an email is in the admin whitelist (case insensitive)
 */
export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase());
}

/**
 * Check if a user has admin role in metadata
 */
export function hasAdminRole(user: { metadata?: { role?: string } }): boolean {
  return user.metadata?.role === 'admin';
}

/**
 * Validate admin access for API routes
 * Currently allows all requests (no auth system configured)
 */
export async function validateAdminAuth(): Promise<AuthResult> {
  return { isAuthenticated: true };
}

/**
 * Helper to require admin access in API routes
 * Returns null when access is granted, error response otherwise
 */
export async function requireAdminAuth(): Promise<NextResponse | null> {
  return null;
}
