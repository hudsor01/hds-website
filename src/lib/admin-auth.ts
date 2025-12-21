/**
 * Admin API Authentication
 * Server-side authentication for admin API routes using Supabase Auth
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// Fail fast if ADMIN_EMAILS not configured
if (!process.env.ADMIN_EMAILS?.trim()) {
  throw new Error('ADMIN_EMAILS environment variable is required');
}

// Admin email whitelist - users with these emails can access admin features
// In production, you might use Supabase user roles/metadata instead
const ADMIN_EMAILS = process.env.ADMIN_EMAILS.split(',')
  .map(e => e.trim().toLowerCase())
  .filter(e => e.length > 0);

export interface AuthResult {
  isAuthenticated: boolean;
  user?: { id: string; email: string };
  error?: NextResponse;
}

/**
 * Validate admin authentication using Supabase session
 * Checks if the user is logged in and has admin privileges
 */
export async function validateAdminAuth(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      logger.warn('Admin API request without authentication', {
        component: 'AdminAuth',
        error: error?.message,
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
      ADMIN_EMAILS.includes(user.email?.toLowerCase() || '') ||
      user.user_metadata?.role === 'admin';

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
