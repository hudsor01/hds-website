/**
 * Admin API Authentication
 * Server-side authentication for admin API routes using Neon Auth
 */

import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/server';
import { logger } from '@/lib/logger';

// Lazy-loaded admin email whitelist
// Validation happens on first use (not at import) to allow builds without env vars
let _adminEmails: string[] | null = null;

function getAdminEmails(): string[] {
  if (_adminEmails === null) {
    if (!process.env.ADMIN_EMAILS?.trim()) {
      throw new Error('ADMIN_EMAILS environment variable is required');
    }
    _adminEmails = process.env.ADMIN_EMAILS.split(',')
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
 * Validate admin authentication using Neon Auth session
 * Checks if the user is logged in and has admin privileges
 */
export async function validateAdminAuth(): Promise<AuthResult> {
  try {
    const { user, session } = await getAuthUser();

    if (!user || !session) {
      logger.warn('Admin API request without authentication', {
        component: 'AdminAuth',
      });
      return {
        isAuthenticated: false,
        error: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    // Check if user has admin privileges
    // Option 1: Check against email whitelist
    // Option 2: Check user metadata for admin role
    const isAdmin =
      isAdminEmail(user.email || '') ||
      hasAdminRole(user as { metadata?: { role?: string } });

    if (!isAdmin) {
      logger.warn('Admin API request from non-admin user', {
        component: 'AdminAuth',
        userId: user.id,
        email: user.email,
      });
      return {
        isAuthenticated: false,
        error: NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        ),
      };
    }

    return {
      isAuthenticated: true,
      user: { id: user.id, email: user.email || '' },
    };
  } catch (error) {
    logger.error('Admin auth validation failed', {
      component: 'AdminAuth',
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      isAuthenticated: false,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Helper to require admin authentication in API routes
 * Returns an error response if not authenticated, null if authenticated
 */
export async function requireAdminAuth(): Promise<NextResponse | null> {
  const auth = await validateAdminAuth();
  if (auth.isAuthenticated) {
    return null;
  }
  return auth.error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
