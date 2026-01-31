/**
 * PDF Template Unit Tests
 * Tests for invoice and contract HTML template generation
 */

import { describe, expect, it } from 'bun:test';
import {
  generateInvoiceHTML,
  type InvoiceData,
} from '@/lib/pdf/invoice-html-template';
import {
  generateContractHTML,
  type ContractData,
} from '@/lib/pdf/contract-html-template';

// ================================
// Invoice HTML Template Tests
// ================================

describe('Invoice HTML Template', () => {
  const validInvoiceData: InvoiceData = {
    companyName: 'Test Company LLC',
    companyAddress: '123 Main St',
    companyCity: 'Austin',
    companyState: 'TX',
    companyZip: '78701',
    companyEmail: 'billing@testcompany.com',
    companyPhone: '(512) 555-1234',
    clientName: 'Client Corp',
    clientAddress: '456 Oak Ave',
    clientCity: 'Dallas',
    clientState: 'TX',
    clientZip: '75201',
    clientEmail: 'accounts@clientcorp.com',
    invoiceNumber: 'INV-2026-001',
    invoiceDate: '2026-01-22',
    dueDate: '2026-02-22',
    lineItems: [
      {
        id: '1',
        description: 'Web Development Services',
        quantity: 40,
        rate: 150,
        amount: 6000,
      },
      {
        id: '2',
        description: 'UI/UX Design',
        quantity: 20,
        rate: 125,
        amount: 2500,
      },
    ],
    subtotal: 8500,
    taxRate: 8.25,
    taxAmount: 701.25,
    total: 9201.25,
    notes: 'Thank you for your business!',
    terms: 'Net 30',
  };

  it('should generate valid HTML document', () => {
    const html = generateInvoiceHTML(validInvoiceData);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });

  it('should include company details', () => {
    const html = generateInvoiceHTML(validInvoiceData);

    expect(html).toContain('Test Company LLC');
    expect(html).toContain('123 Main St');
    expect(html).toContain('Austin');
    expect(html).toContain('TX');
    expect(html).toContain('78701');
    expect(html).toContain('billing@testcompany.com');
    expect(html).toContain('(512) 555-1234');
  });

  it('should include client details', () => {
    const html = generateInvoiceHTML(validInvoiceData);

    expect(html).toContain('Client Corp');
    expect(html).toContain('456 Oak Ave');
    expect(html).toContain('Dallas');
    expect(html).toContain('accounts@clientcorp.com');
  });

  it('should include invoice metadata', () => {
    const html = generateInvoiceHTML(validInvoiceData);

    expect(html).toContain('INV-2026-001');
    expect(html).toContain('2026-01-22');
    expect(html).toContain('2026-02-22');
  });

  it('should include all line items', () => {
    const html = generateInvoiceHTML(validInvoiceData);

    expect(html).toContain('Web Development Services');
    expect(html).toContain('UI/UX Design');
    expect(html).toContain('40'); // quantity
    expect(html).toContain('20'); // quantity
  });

  it('should format currency values correctly', () => {
    const html = generateInvoiceHTML(validInvoiceData);

    // US currency format: $X,XXX.XX
    expect(html).toContain('$6,000.00');
    expect(html).toContain('$2,500.00');
    expect(html).toContain('$8,500.00'); // subtotal
    expect(html).toContain('$701.25'); // tax
    expect(html).toContain('$9,201.25'); // total
  });

  it('should include optional notes when provided', () => {
    const html = generateInvoiceHTML(validInvoiceData);

    expect(html).toContain('Thank you for your business!');
  });

  it('should include optional terms when provided', () => {
    const html = generateInvoiceHTML(validInvoiceData);

    expect(html).toContain('Net 30');
  });

  it('should handle missing optional fields', () => {
    const dataWithoutOptionals: InvoiceData = {
      ...validInvoiceData,
      notes: undefined,
      terms: undefined,
    };

    const html = generateInvoiceHTML(dataWithoutOptionals);

    // Should still generate valid HTML
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('INV-2026-001');
  });

  it('should handle single line item', () => {
    const singleItemData: InvoiceData = {
      ...validInvoiceData,
      lineItems: [
        {
          id: '1',
          description: 'Consulting',
          quantity: 1,
          rate: 500,
          amount: 500,
        },
      ],
      subtotal: 500,
      taxAmount: 41.25,
      total: 541.25,
    };

    const html = generateInvoiceHTML(singleItemData);

    expect(html).toContain('Consulting');
    expect(html).toContain('$500.00');
  });
});

// ================================
// Contract HTML Template Tests
// ================================

describe('Contract HTML Template', () => {
  const validContractData: ContractData = {
    template: 'service-agreement',
    effectiveDate: '2026-01-22',
    providerName: 'Service Provider LLC',
    providerAddress: '123 Business Blvd',
    providerCity: 'Austin',
    providerState: 'TX',
    providerZip: '78701',
    providerEmail: 'provider@example.com',
    clientName: 'Client Company Inc',
    clientCompany: 'Client Corp',
    clientAddress: '456 Corporate Dr',
    clientCity: 'Houston',
    clientState: 'TX',
    clientZip: '77001',
    clientEmail: 'client@example.com',
    endDate: '2026-05-31',
    scopeOfWork: 'Development of custom web application with user authentication and payment processing',
    paymentAmount: '$25,000.00',
    paymentTerms: '50% upfront, 50% on completion',
    timeline: 'February 2026 - May 2026',
    customClauses: 'Additional terms as agreed',
  };

  it('should generate valid HTML document', () => {
    const html = generateContractHTML(validContractData);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });

  it('should include effective date', () => {
    const html = generateContractHTML(validContractData);

    expect(html).toContain('January 22, 2026');
  });

  it('should include provider details', () => {
    const html = generateContractHTML(validContractData);

    expect(html).toContain('Service Provider LLC');
    expect(html).toContain('123 Business Blvd');
    expect(html).toContain('Austin');
  });

  it('should include client details', () => {
    const html = generateContractHTML(validContractData);

    expect(html).toContain('Client Company Inc');
    expect(html).toContain('456 Corporate Dr');
    expect(html).toContain('Houston');
  });

  it('should include scope of work', () => {
    const html = generateContractHTML(validContractData);

    expect(html).toContain('Development of custom web application');
    expect(html).toContain('user authentication');
    expect(html).toContain('payment processing');
  });

  it('should include payment amount', () => {
    const html = generateContractHTML(validContractData);

    expect(html).toContain('$25,000.00');
  });

  it('should include payment terms', () => {
    const html = generateContractHTML(validContractData);

    expect(html).toContain('50% upfront, 50% on completion');
  });

  it('should include timeline', () => {
    const html = generateContractHTML(validContractData);

    expect(html).toContain('February 2026 - May 2026');
  });

  it('should render service agreement template', () => {
    const html = generateContractHTML(validContractData);

    expect(html).toContain('SERVICE AGREEMENT');
  });

  it('should render NDA template', () => {
    const ndaData: ContractData = {
      ...validContractData,
      template: 'nda',
    };

    const html = generateContractHTML(ndaData);

    expect(html).toContain('NON-DISCLOSURE AGREEMENT');
  });

  it('should render freelance contract template', () => {
    const freelanceData: ContractData = {
      ...validContractData,
      template: 'freelance-contract',
    };

    const html = generateContractHTML(freelanceData);

    expect(html).toContain('FREELANCE CONTRACT');
  });

  it('should handle minimal required data', () => {
    const minimalData: ContractData = {
      template: 'service-agreement',
      effectiveDate: '2026-01-22',
      providerName: 'Provider',
      providerAddress: '123 St',
      providerCity: 'City',
      providerState: 'ST',
      providerZip: '12345',
      providerEmail: 'p@p.com',
      clientAddress: '456 Ave',
      clientCity: 'Town',
      clientState: 'TS',
      clientZip: '67890',
      clientEmail: 'c@c.com',
    };

    const html = generateContractHTML(minimalData);

    // Should still generate valid HTML
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Provider');
  });
});
