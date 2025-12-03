/**
 * Supabase SSR Browser Client - For Authenticated Client Components
 *
 * Use this client in Client Components ('use client') when you need:
 * - Real-time subscriptions with user context
 * - Client-side auth state changes
 * - Protected client-side operations
 *
 * This client automatically handles auth token refresh in the browser.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/creating-a-client
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
}

// Type assertion after validation
const SUPABASE_URL: string = supabaseUrl
const SUPABASE_ANON_KEY: string = supabaseAnonKey

export function createClient() {
  return createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}
