/**
 * Admin Analytics Types
 * Consolidated types for the analytics dashboard, API routes, and lead management
 */

/**
 * Lead attribution data from marketing/traffic sources
 */
export interface LeadAttribution {
  source: string;
  medium: string;
  campaign: string | null;
  device_type: string | null;
  browser: string | null;
  referrer: string | null;
  landing_page?: string | null;
}

/**
 * Full Lead interface for admin dashboard and lead detail views
 */
export interface Lead {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  calculator_type: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  lead_score: number;
  lead_quality: string;
  created_at: string;
  contacted: boolean;
  converted: boolean;
  contacted_at: string | null;
  converted_at: string | null;
  conversion_value: number | null;
  attribution: LeadAttribution | null;
}

/**
 * Minimal lead fields for trends aggregation queries
 */
export interface TrendsLead {
  created_at: string;
  contacted: boolean;
  converted: boolean;
  lead_quality: string | null;
  calculator_type: string;
}

/**
 * Lead data structure for CSV export with flattened attribution
 */
export interface LeadExportData {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  calculator_type: string;
  lead_score: number | null;
  lead_quality: string | null;
  contacted: boolean;
  converted: boolean;
  created_at: string;
  contacted_at: string | null;
  converted_at: string | null;
  conversion_value: number | null;
  attribution: LeadAttribution | null;
}

/**
 * Daily data point for trends charts
 */
export interface DailyDataPoint {
  date: string;
  leads: number;
  contacted: number;
  conversions: number;
  hot: number;
  warm: number;
  cold: number;
  // Calculator type breakdowns
  roi: number;
  cost: number;
  performance: number;
}

/**
 * Trends data structure returned by trends API
 */
export interface TrendsData {
  dailyData: DailyDataPoint[];
  cumulativeLeads: Array<{ date: string; value: number }>;
  cumulativeConversions: Array<{ date: string; value: number }>;
}

/**
 * Analytics overview metrics for dashboard header cards
 */
export interface AnalyticsOverview {
  totalLeads: number;
  qualityBreakdown: { hot: number; warm: number; cold: number };
  typeBreakdown: Record<string, number>;
  conversionRate: string;
  contactRate: string;
  emailMetrics: {
    sent: number;
    opened: number;
    clicked: number;
    openRate: string;
    clickRate: string;
  };
  sourceBreakdown: Record<string, number>;
}

/**
 * Lead note/activity entry
 */
export interface LeadNote {
  id: string;
  note_type: 'note' | 'status_change' | 'email_sent' | 'call' | 'meeting';
  content: string;
  created_by: string;
  created_at: string;
  metadata: Record<string, unknown>;
}
