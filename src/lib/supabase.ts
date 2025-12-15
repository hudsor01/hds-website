/**
 * Supabase Client Singletons
 *
 * This file provides centralized Supabase clients for server-side operations:
 * - supabase: Public client for reading public data (testimonials, case studies, etc.)
 * - supabaseAdmin: Admin client with service role for privileged operations
 *
 * IMPORTANT:
 * - supabase uses SUPABASE_PUBLISHABLE_KEY (subject to RLS policies)
 * - supabaseAdmin uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)
 * - supabaseAdmin should ONLY be used in secure server contexts (API routes, Server Actions)
 *
 * For authenticated user operations, use:
 * - Server Components: import { createClient } from '@/lib/supabase/server'
 * - Client Components: import { createClient } from '@/lib/supabase/client'
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { env } from '@/env'

/**
 * Public Supabase client for reading public data
 * Uses anon/publishable key - subject to Row Level Security policies
 *
 * Use cases:
 * - Fetching testimonials
 * - Reading case studies
 * - Public portfolio items
 * - Any data marked as publicly readable in Supabase
 */
export const supabase = createSupabaseClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL || '',
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Admin Supabase client with service role privileges
 * Uses SERVICE_ROLE_KEY - bypasses Row Level Security policies
 *
 * SECURITY WARNING:
 * - This client has FULL DATABASE ACCESS
 * - NEVER expose this client to the browser
 * - ONLY use in secure server contexts (API routes, Server Actions, background jobs)
 *
 * Use cases:
 * - Admin operations (creating users, modifying protected data)
 * - Background jobs (analytics processing, scheduled emails)
 * - API routes that need to bypass RLS
 * - Webhook handlers
 */
export const supabaseAdmin = createSupabaseClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL || '',
  env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
