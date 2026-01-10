/**
 * Admin Analytics CSV Export API
 * Exports lead data to CSV format
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { errorResponse, validationErrorResponse } from '@/lib/api/responses';
import { createServerLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { analyticsExportQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';
import type { LeadExportData } from '@/types/admin-analytics';

const logger = createServerLogger('analytics-export-api');

export async function GET(request: NextRequest) {
  await connection(); // Force dynamic rendering

  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Analytics export rate limit exceeded', { ip: clientIp });
    return errorResponse('Too many requests', 429);
  }

  // Require admin authentication
  const authError = await requireAdminAuth();
  if (authError) {
    return authError;
  }

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters with Zod
    const parseResult = safeParseSearchParams(searchParams, analyticsExportQuerySchema);
    if (!parseResult.success) {
      logger.warn('Invalid query parameters', { errors: parseResult.errors.flatten() });
      return validationErrorResponse(parseResult.errors);
    }

    const { quality, type: calculatorType, startDate, endDate } = parseResult.data;

    

    // Build query
    let query = (await createClient())
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
      logger.error('Failed to fetch leads for export', error as Error);
      return errorResponse('Failed to fetch leads', 500);
    }

    // Enrich leads with attribution data
    const enrichedLeads: LeadExportData[] = await Promise.all(
      (leads || []).map(async (lead): Promise<LeadExportData> => {
        const { data: attribution } = await (await createClient())
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
            source: attribution.source ?? '',
            medium: attribution.medium ?? '',
            campaign: attribution.campaign ?? '',
            device_type: attribution.device_type ?? '',
            browser: attribution.browser ?? '',
            referrer: attribution.referrer ?? '',
            landing_page: attribution.landing_page ?? '',
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
    return errorResponse('Failed to export leads', 500);
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
