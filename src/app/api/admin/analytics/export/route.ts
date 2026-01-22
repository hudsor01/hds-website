/**
 * Admin Analytics CSV Export API
 * Exports lead data to CSV format
 */

import { type NextRequest, NextResponse, connection } from 'next/server';
import { createServerLogger } from '@/lib/logger';
import { db } from '@/lib/db';
import { calculatorLeads, leadAttribution } from '@/lib/schema';
import { requireAdminAuth } from '@/lib/admin-auth';
import { unifiedRateLimiter, getClientIp } from '@/lib/rate-limiter';
import { analyticsExportQuerySchema, safeParseSearchParams } from '@/lib/schemas/query-params';
import { eq, gte, lte, and, desc } from 'drizzle-orm';
import type { LeadExportData } from '@/types/admin-analytics';

const logger = createServerLogger('analytics-export-api');

export async function GET(request: NextRequest) {
  await connection(); // Force dynamic rendering

  // Rate limiting - 60 requests per minute per IP
  const clientIp = getClientIp(request);
  const isAllowed = await unifiedRateLimiter.checkLimit(clientIp, 'api');
  if (!isAllowed) {
    logger.warn('Analytics export rate limit exceeded', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
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
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parseResult.errors.flatten().fieldErrors },
        { status: 400 }
      );
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

    // Query leads
    const leads = await db
      .select()
      .from(calculatorLeads)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(calculatorLeads.createdAt));

    // Fetch all attribution data for the leads' emails in one query to avoid N+1
    const emails = leads.map(l => l.email);
    const attributionMap = new Map<string, typeof leadAttribution.$inferSelect>();

    if (emails.length > 0) {
      // Query all attributions and filter by email in memory
      // This is more efficient than N individual queries
      const allAttributions = await db.select().from(leadAttribution);
      for (const attr of allAttributions) {
        // Match by session or lead association - use referrer/landing page as key
        // Since the original code matched by email, we'll need to check if there's an email field
        // The leadAttribution schema doesn't have email, so we'll match by leadId
        if (attr.leadId) {
          // Find the lead that matches this attribution
          const matchingLead = leads.find(l => l.id === attr.leadId);
          if (matchingLead) {
            attributionMap.set(matchingLead.email, attr);
          }
        }
      }
    }

    // Enrich leads with attribution data
    const enrichedLeads: LeadExportData[] = leads.map((lead): LeadExportData => {
      const attribution = attributionMap.get(lead.email);

      return {
        id: lead.id,
        email: lead.email,
        name: lead.name,
        company: lead.company,
        phone: lead.phone,
        calculator_type: lead.calculatorType,
        lead_score: lead.leadScore,
        lead_quality: lead.leadQuality,
        contacted: lead.contacted,
        converted: lead.converted,
        created_at: lead.createdAt.toISOString(),
        contacted_at: lead.contactedAt?.toISOString() ?? null,
        converted_at: lead.convertedAt?.toISOString() ?? null,
        conversion_value: lead.conversionValue ? Number(lead.conversionValue) : null,
        attribution: attribution ? {
          source: attribution.source ?? '',
          medium: attribution.medium ?? '',
          campaign: attribution.campaign ?? '',
          device_type: '', // Not in current schema
          browser: '', // Not in current schema
          referrer: attribution.referrer ?? '',
          landing_page: attribution.landingPage ?? '',
        } : null,
      };
    });

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
