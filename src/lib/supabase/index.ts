/**
 * Supabase client exports
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/env';
import type { Database } from '@/types/database';

export { createClient } from './server';
export { createClient as createBrowserClient } from './client';

/**
 * Admin client for server-side operations
 * Uses service role key for elevated permissions
 */
function createAdminClient() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    // Return a mock client that throws helpful errors
    return {
      from: (table: string) => ({
        select: () => Promise.resolve({ data: null, error: new Error(`Supabase not configured. Table: ${table}`) }),
        insert: () => Promise.resolve({ data: null, error: new Error(`Supabase not configured. Table: ${table}`) }),
        update: () => Promise.resolve({ data: null, error: new Error(`Supabase not configured. Table: ${table}`) }),
        delete: () => Promise.resolve({ data: null, error: new Error(`Supabase not configured. Table: ${table}`) }),
        upsert: () => Promise.resolve({ data: null, error: new Error(`Supabase not configured. Table: ${table}`) }),
      }),
    } as unknown as ReturnType<typeof createSupabaseClient<Database>>;
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Lazy-initialized admin client
let _supabaseAdmin: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseClient<Database>>, {
  get(_target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createAdminClient();
    }
    return (_supabaseAdmin as unknown as Record<string, unknown>)[prop as string];
  },
});
