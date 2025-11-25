/**
 * Admin Analytics CSV Export API
 * Exports lead data to CSV format
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { createServerLogger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

const logger = createServerLogger('analytics-export-api');

interface LeadExportData {
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
  attribution: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    device_type: string | null;
    browser: string | null;
    referrer: string | null;
    landing_page: string | null;
  } | null;
}

export async function GET(request: NextRequest) {
  await connection(); // Force dynamic rendering

  try {
    const { searchParams } = new URL(request.url);
    const quality = searchParams.get('quality'); // hot, warm, cold
    const calculatorType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Build query
    let query = supabaseAdmin
      .from('calculator_leads')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (quality) {
      query = query.eq('lead_quality', quality);
    }

    if (calculatorType) {
      query = query.eq('calculator_type', calculatorType);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: leads, error } = await query;

    if (error) {
      logger.error('Failed to fetch leads for export', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    // Enrich leads with attribution data
    const enrichedLeads: LeadExportData[] = await Promise.all(
      (leads || []).map(async (lead): Promise<LeadExportData> => {
        const { data: attribution } = await supabaseAdmin
          .from('lead_attribution')
          .select('*')
          .eq('email', lead.email)
          .single();

        return {
          id: lead.id,
          email: lead.email,
          name: lead.name,
          company: lead.company,
          phone: lead.phone,
          calculator_type: lead.calculator_type,
          lead_score: lead.lead_score,
          lead_quality: lead.lead_quality,
          contacted: lead.contacted,
          converted: lead.converted,
          created_at: lead.created_at,
          contacted_at: lead.contacted_at,
          converted_at: lead.converted_at,
          conversion_value: lead.conversion_value,
          attribution: attribution ? {
            source: attribution.source,
            medium: attribution.medium,
            campaign: attribution.campaign,
            device_type: attribution.device_type,
            browser: attribution.browser,
            referrer: attribution.referrer,
            landing_page: attribution.landing_page,
          } : null,
        };
      })
    );

    // Convert to CSV
    const csv = convertToCSV(enrichedLeads);

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    logger.error('Analytics export error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    );
  }
}

function convertToCSV(leads: LeadExportData[]): string {
  if (leads.length === 0) {
    return 'No data to export';
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Email',
    'Name',
    'Company',
    'Phone',
    'Calculator Type',
    'Lead Score',
    'Lead Quality',
    'Contacted',
    'Converted',
    'Created At',
    'Contacted At',
    'Converted At',
    'Conversion Value',
    'Source',
    'Medium',
    'Campaign',
    'Device Type',
    'Browser',
    'Referrer',
    'Landing Page',
  ];

  // Build CSV rows
  const rows = leads.map(lead => [
    lead.id,
    lead.email,
    lead.name || '',
    lead.company || '',
    lead.phone || '',
    lead.calculator_type,
    lead.lead_score,
    lead.lead_quality,
    lead.contacted ? 'Yes' : 'No',
    lead.converted ? 'Yes' : 'No',
    lead.created_at,
    lead.contacted_at || '',
    lead.converted_at || '',
    lead.conversion_value || '',
    lead.attribution?.source || '',
    lead.attribution?.medium || '',
    lead.attribution?.campaign || '',
    lead.attribution?.device_type || '',
    lead.attribution?.browser || '',
    lead.attribution?.referrer || '',
    lead.attribution?.landing_page || '',
  ]);

  // Escape CSV values
  const escapeCsvValue = (value: unknown): string => {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Combine headers and rows
  const csvContent = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map(row => row.map(escapeCsvValue).join(',')),
  ].join('\n');

  return csvContent;
}
