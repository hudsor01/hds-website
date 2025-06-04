/**
 * Supabase Client Configuration
 * 
 * Simplified database and auth client for Next.js 15 + React 19
 * Replaces tRPC + Prisma with direct Supabase integration
 */

import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/src/lib/utils/env';

// Create Supabase client
export const supabase = createClient(
  ENV.NEXT_PUBLIC_SUPABASE_URL,
  ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Server-side client with service role key (for Server Actions)
export const supabaseAdmin = createClient(
  ENV.NEXT_PUBLIC_SUPABASE_URL,
  ENV.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database table types for TypeScript safety
export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          name: string;
          email: string;
          company?: string;
          phone?: string;
          subject?: string;
          message: string;
          service?: string;
          status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'UNRESPONSIVE';
          source?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company?: string;
          phone?: string;
          subject?: string;
          message: string;
          service?: string;
          status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'UNRESPONSIVE';
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company?: string;
          phone?: string;
          subject?: string;
          message?: string;
          service?: string;
          status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'UNRESPONSIVE';
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          company?: string;
          phone?: string;
          service?: string;
          budget?: string;
          message: string;
          status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'UNRESPONSIVE';
          source?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company?: string;
          phone?: string;
          service?: string;
          budget?: string;
          message: string;
          status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'UNRESPONSIVE';
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company?: string;
          phone?: string;
          service?: string;
          budget?: string;
          message?: string;
          status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'UNRESPONSIVE';
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      web_vitals: {
        Row: {
          id: string;
          url: string;
          metric: string;
          value: number;
          rating: 'good' | 'needs-improvement' | 'poor';
          user_agent?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          metric: string;
          value: number;
          rating: 'good' | 'needs-improvement' | 'poor';
          user_agent?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          metric?: string;
          value?: number;
          rating?: 'good' | 'needs-improvement' | 'poor';
          user_agent?: string;
          created_at?: string;
        };
      };
    };
  };
};

// Type helpers
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export type Lead = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export type WebVital = Database['public']['Tables']['web_vitals']['Row'];
export type WebVitalInsert = Database['public']['Tables']['web_vitals']['Insert'];