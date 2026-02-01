/**
 * Admin Analytics CSV Export API
 * Exports lead data to CSV format
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { errorResponse, validationErrorResponse } from '@/lib/api/responses';
import { createServerLogger } from '@/lib/logger';
import { db } from '@/lib/db';
import { calculatorLeads, leadAttribution } from '@/lib/schemas/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { requireAdminAuth } from '@/lib/admin-auth';
import { withRateLimit } from '@/lib/api/rate-limit-wrapper';
import { analyticsExportQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';
import type { LeadExportData } from '@/types/admin-analytics';

const logger = createServerLogger('analytics-export-api');

async function handleAnalyticsExport(request: NextRequest) {
  await connection(); // Force dynamic rendering

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

    // Build conditions
    const conditions = [];

    if (quality) {
      conditions.push(eq(calculatorLeads.leadQuality, quality));
    }

    if (calculatorType) {
      conditions.push(eq(calculatorLeads.calculatorType, calculatorType));
    }

    if (startDate) {
      conditions.push(gte(calculatorLeads.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(calculatorLeads.createdAt, new Date(endDate)));
    }

    // Use a left join to avoid N+1 queries for attribution data
    const rows = await db
      .select({
        lead: calculatorLeads,
        attribution: {
          source: leadAttribution.source,
          medium: leadAttribution.medium,
          campaign: leadAttribution.campaign,
          referrer: leadAttribution.referrer,
          landingPage: leadAttribution.landingPage,
        },
      })
      .from(calculatorLeads)
      .leftJoin(leadAttribution, eq(calculatorLeads.id, leadAttribution.leadId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(calculatorLeads.createdAt));

    // Map to export format
    const enrichedLeads: LeadExportData[] = rows.map((row) => ({
      id: row.lead.id,
      email: row.lead.email,
      name: row.lead.name,
      company: row.lead.company,
      phone: row.lead.phone,
      calculator_type: row.lead.calculatorType,
      lead_score: row.lead.leadScore,
      lead_quality: row.lead.leadQuality,
      contacted: row.lead.contacted,
      converted: row.lead.converted,
      created_at: row.lead.createdAt.toISOString(),
      contacted_at: row.lead.contactedAt?.toISOString() ?? null,
      converted_at: row.lead.convertedAt?.toISOString() ?? null,
      conversion_value: row.lead.conversionValue ? Number(row.lead.conversionValue) : null,
      attribution: row.attribution !== null ? {
        source: row.attribution.source ?? '',
        medium: row.attribution.medium ?? '',
        campaign: row.attribution.campaign ?? '',
        device_type: '',
        browser: '',
        referrer: row.attribution.referrer ?? '',
        landing_page: row.attribution.landingPage ?? '',
      } : null,
    }));

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

export const GET = withRateLimit(handleAnalyticsExport, 'api');
