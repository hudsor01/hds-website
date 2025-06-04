/**
 * Contact Data Fetching Functions
 * 
 * Server-side data fetching for Server Components
 * Replaces tRPC queries with direct Supabase calls
 */

import { supabaseAdmin, type Contact } from '@/lib/supabase';
import { unstable_cache } from 'next/cache';

// Types for query options
type ContactFilters = {
  status?: string;
  service?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

type PaginationOptions = {
  page?: number;
  limit?: number;
};

// Get contacts with filtering and pagination
export async function getContacts(
  filters: ContactFilters = {},
  pagination: PaginationOptions = {}
) {
  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('contacts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.service) {
    query = query.eq('service', filters.service);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching contacts:', error);
    throw new Error('Failed to fetch contacts');
  }

  return {
    contacts: data as Contact[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

// Get contact analytics
export async function getContactAnalytics(dateRange?: { startDate?: string; endDate?: string }) {
  let query = supabaseAdmin
    .from('contacts')
    .select('status, service, created_at');

  if (dateRange?.startDate) {
    query = query.gte('created_at', dateRange.startDate);
  }

  if (dateRange?.endDate) {
    query = query.lte('created_at', dateRange.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching contact analytics:', error);
    throw new Error('Failed to fetch contact analytics');
  }

  const contacts = data || [];

  // Calculate analytics
  const total = contacts.length;
  const statusBreakdown = contacts.reduce((acc, contact) => {
    acc[contact.status] = (acc[contact.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const serviceBreakdown = contacts.reduce((acc, contact) => {
    if (contact.service) {
      acc[contact.service] = (acc[contact.service] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Recent contacts (last 10)
  const recentContacts = contacts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return {
    summary: {
      total,
      new: statusBreakdown.NEW || 0,
      qualified: statusBreakdown.QUALIFIED || 0,
      won: statusBreakdown.WON || 0,
      conversionRate: total > 0 ? ((statusBreakdown.WON || 0) / total * 100) : 0,
    },
    breakdown: {
      status: statusBreakdown,
      service: serviceBreakdown,
    },
    recent: recentContacts,
  };
}

// Get single contact by ID
export async function getContact(id: string) {
  const { data, error } = await supabaseAdmin
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching contact:', error);
    throw new Error('Failed to fetch contact');
  }

  return data as Contact;
}

// Cached version for dashboard overview (5 minute cache)
export const getDashboardContactsOverview = unstable_cache(
  async () => {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('status, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching dashboard contacts:', error);
      return { total: 0, recent: 0, thisMonth: 0 };
    }

    const contacts = data || [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: contacts.length,
      recent: contacts.filter(c => new Date(c.created_at) > last7Days).length,
      thisMonth: contacts.filter(c => new Date(c.created_at) > startOfMonth).length,
      newContacts: contacts.filter(c => c.status === 'NEW').length,
    };
  },
  ['dashboard-contacts'],
  { revalidate: 300 } // 5 minutes
);