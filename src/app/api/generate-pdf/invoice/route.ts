/**
 * Invoice PDF Generation API
 * Generates PDF from invoice data using Stirling PDF service
 */

import { generatePDFFromHTML } from '@/lib/pdf/stirling-client';
import { generateInvoiceHTML, type InvoiceData } from '@/lib/pdf/invoice-html-template';
import { logger } from '@/lib/logger';
import { castError } from '@/lib/errors';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const LineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().nonnegative('Rate must be non-negative'),
  amount: z.number().nonnegative('Amount must be non-negative'),
});

const InvoiceDataSchema = z.object({
  // Company details
  companyName: z.string().min(1, 'Company name is required'),
  companyAddress: z.string().min(1, 'Company address is required'),
  companyCity: z.string().min(1, 'Company city is required'),
  companyState: z.string().min(1, 'Company state is required'),
  companyZip: z.string().min(1, 'Company ZIP is required'),
  companyEmail: z.string().email('Valid company email is required'),
  companyPhone: z.string().min(1, 'Company phone is required'),

  // Client details
  clientName: z.string().min(1, 'Client name is required'),
  clientAddress: z.string().min(1, 'Client address is required'),
  clientCity: z.string().min(1, 'Client city is required'),
  clientState: z.string().min(1, 'Client state is required'),
  clientZip: z.string().min(1, 'Client ZIP is required'),
  clientEmail: z.string().email('Valid client email is required'),

  // Invoice metadata
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),

  // Line items
  lineItems: z.array(LineItemSchema).min(1, 'At least one line item is required'),

  // Totals
  subtotal: z.number().nonnegative('Subtotal must be non-negative'),
  taxRate: z.number().nonnegative('Tax rate must be non-negative'),
  taxAmount: z.number().nonnegative('Tax amount must be non-negative'),
  total: z.number().nonnegative('Total must be non-negative'),

  // Optional
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = InvoiceDataSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid invoice data',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const invoiceData: InvoiceData = parsed.data;

    // Generate HTML from template
    const html = generateInvoiceHTML(invoiceData);

    // Generate PDF using Stirling PDF
    const pdfBuffer = await generatePDFFromHTML({
      html,
      filename: invoiceData.invoiceNumber,
    });

    // Return PDF file (convert Buffer to Uint8Array for NextResponse compatibility)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoiceData.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    const err = castError(error);
    logger.error('Failed to generate invoice PDF', {
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
