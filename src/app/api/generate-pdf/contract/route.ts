/**
 * Contract PDF Generation API
 * Generates PDF from contract data using Stirling PDF service
 */

import { generatePDFFromHTML } from '@/lib/pdf/stirling-client';
import {
  generateContractHTML,
  type ContractData,
} from '@/lib/pdf/contract-html-template';
import { logger } from '@/lib/logger';
import { castError } from '@/lib/utils/errors';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ContractTemplateSchema = z.enum(['service-agreement', 'nda', 'freelance-contract']);

const ContractDataSchema = z.object({
  // Template type
  template: ContractTemplateSchema,

  // Provider details
  providerName: z.string().min(1, 'Provider name is required'),
  providerAddress: z.string().min(1, 'Provider address is required'),
  providerCity: z.string().min(1, 'Provider city is required'),
  providerState: z.string().min(1, 'Provider state is required'),
  providerZip: z.string().min(1, 'Provider ZIP is required'),
  providerEmail: z.string().email('Valid provider email is required'),

  // Client details
  clientName: z.string().optional(),
  clientCompany: z.string().optional(),
  clientAddress: z.string().min(1, 'Client address is required'),
  clientCity: z.string().min(1, 'Client city is required'),
  clientState: z.string().min(1, 'Client state is required'),
  clientZip: z.string().min(1, 'Client ZIP is required'),
  clientEmail: z.string().email('Valid client email is required'),

  // Contract details
  effectiveDate: z.string().min(1, 'Effective date is required'),
  endDate: z.string().optional(),
  scopeOfWork: z.string().optional(),
  paymentAmount: z.string().optional(),
  paymentTerms: z.string().optional(),
  timeline: z.string().optional(),
  customClauses: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ContractDataSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid contract data',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const contractData: ContractData = parsed.data;

    // Validate that either clientName or clientCompany is provided
    if (!contractData.clientName && !contractData.clientCompany) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either client name or client company must be provided',
        },
        { status: 400 }
      );
    }

    // Generate HTML from template
    const html = generateContractHTML(contractData);

    // Generate filename based on template and parties
    const clientDisplay = contractData.clientName || contractData.clientCompany;
    const filename = `${contractData.template}-${contractData.providerName}-${clientDisplay}`.replace(/\s+/g, '-');

    // Generate PDF using Stirling PDF
    const pdfBuffer = await generatePDFFromHTML({
      html,
      filename,
    });

    // Return PDF file (convert Buffer to Uint8Array for NextResponse compatibility)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    const err = castError(error);
    logger.error('Failed to generate contract PDF', {
      error: err.message,
      stack: err.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate PDF. Please try again.',
      },
      { status: 500 }
    );
  }
}
