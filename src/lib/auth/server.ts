/**
 * Neon Auth Server
 * Server-side authentication utilities for Server Components, Server Actions, and API Routes
 */
import { neonAuth } from '@neondatabase/neon-js/auth/next/server';

export { neonAuth };

/**
 * Get the current authenticated user in a Server Component or Server Action
 * @returns User and session data, or null values if not authenticated
 */
export async function getAuthUser() {
  const { user, session } = await neonAuth();
  return { user, session };
}

/**
 * Require authentication - throws if not authenticated
 * Use in protected Server Actions
 */
export async function requireAuth() {
  const { user, session } = await neonAuth();
  if (!user || !session) {
    throw new Error('Authentication required');
  }
  return { user, session };
}
