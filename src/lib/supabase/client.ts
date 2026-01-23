import { env } from '@/env';
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Create a Supabase browser client for client-side operations.
 * Returns null during SSG/build time when env vars aren't available.
 * Callers should handle the null case appropriately.
 */
export function createClient(): SupabaseClient<Database> | null {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const publicKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // During build/SSG, env vars may not be available - return null instead of throwing
  if (!supabaseUrl || !publicKey) {
    return null
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    publicKey
  )
}
