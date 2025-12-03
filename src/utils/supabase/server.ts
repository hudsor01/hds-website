/**
 * Supabase SSR Server Client - For Authenticated Operations
 *
 * Use this client when you need USER CONTEXT (cookies/sessions):
 * - Server Components that check user authentication
 * - Server Actions that need the current user
 * - Protected Route Handlers
 *
 * For PUBLIC data fetching (no user context needed):
 * → Use `supabase` from `@/lib/supabase`
 *
 * For ADMIN/SERVICE operations (bypassing RLS):
 * → Use `supabaseAdmin` from `@/lib/supabase`
 *
 * @see https://supabase.com/docs/guides/auth/server-side/creating-a-client
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
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

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
