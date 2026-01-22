/**
 * Invoice HTML Template Generator
 * Converts invoice data to professional HTML with inline CSS for PDF generation
 */

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  // Company details
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyEmail: string;
  companyPhone: string;

  // Client details
  clientName: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientEmail: string;

  // Invoice metadata
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;

  // Line items
  lineItems: InvoiceLineItem[];

  // Totals
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;

  // Optional
  notes?: string;
  terms?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const lineItemsHTML = data.lineItems
    .map(
      (item, index) => `
      <tr style="${index % 2 === 1 ? 'background-color: #f9fafb;' : ''}">
        <td style="padding: 12px 16px; text-align: left; font-size: 14px; color: #374151; border-bottom: 1px solid #e5e7eb;">
          ${item.description}
        </td>
        <td style="padding: 12px 16px; text-align: center; font-size: 14px; color: #374151; border-bottom: 1px solid #e5e7eb;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; text-align: right; font-size: 14px; color: #374151; border-bottom: 1px solid #e5e7eb;">
          ${formatCurrency(item.rate)}
        </td>
        <td style="padding: 12px 16px; text-align: right; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #e5e7eb;">
          ${formatCurrency(item.amount)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #111827;
      background: #ffffff;
      padding: 40px;
    }

    @media print {
      body {
        padding: 0;
      }
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 40px;
      border-bottom: 3px solid #0891b2;
      padding-bottom: 20px;
    }

    .invoice-title {
      font-size: 32px;
      font-weight: 700;
      color: #0891b2;
      margin-bottom: 8px;
    }

    .invoice-number {
      font-size: 16px;
      color: #6b7280;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }

    .detail-section h3 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      margin-bottom: 12px;
    }

    .detail-section p {
      font-size: 14px;
      color: #374151;
      margin-bottom: 4px;
    }

    .table-container {
      margin-bottom: 30px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    thead {
      background-color: #f3f4f6;
    }

    th {
      padding: 12px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
    }

    th.center {
      text-align: center;
    }

    th.right {
      text-align: right;
    }

    .totals {
      margin-left: auto;
      width: 300px;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .total-row.subtotal {
      color: #6b7280;
    }

    .total-row.tax {
      color: #6b7280;
    }

    .total-row.final {
      border-top: 2px solid #0891b2;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 700;
      color: #0891b2;
    }

    .notes-section {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
    }

    .notes-section h3 {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    .notes-section p {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.6;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-number">#${data.invoiceNumber}</div>
    </div>

    <!-- Details Grid -->
    <div class="details-grid">
      <!-- From -->
      <div class="detail-section">
        <h3>From</h3>
        <p><strong>${data.companyName}</strong></p>
        <p>${data.companyAddress}</p>
        <p>${data.companyCity}, ${data.companyState} ${data.companyZip}</p>
        <p>${data.companyEmail}</p>
        <p>${data.companyPhone}</p>
      </div>

      <!-- Bill To -->
      <div class="detail-section">
        <h3>Bill To</h3>
        <p><strong>${data.clientName}</strong></p>
        <p>${data.clientAddress}</p>
        <p>${data.clientCity}, ${data.clientState} ${data.clientZip}</p>
        <p>${data.clientEmail}</p>
      </div>

      <!-- Invoice Details -->
      <div class="detail-section">
        <h3>Invoice Details</h3>
        <p><strong>Invoice Date:</strong> ${data.invoiceDate}</p>
        <p><strong>Due Date:</strong> ${data.dueDate}</p>
      </div>
    </div>

    <!-- Line Items Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="center">Qty</th>
            <th class="right">Rate</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHTML}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row subtotal">
        <span>Subtotal:</span>
        <span>${formatCurrency(data.subtotal)}</span>
      </div>
      <div class="total-row tax">
        <span>Tax (${data.taxRate}%):</span>
        <span>${formatCurrency(data.taxAmount)}</span>
      </div>
      <div class="total-row final">
        <span>Total:</span>
        <span>${formatCurrency(data.total)}</span>
      </div>
    </div>

    ${
      data.notes
        ? `
    <!-- Notes -->
    <div class="notes-section">
      <h3>Notes</h3>
      <p>${data.notes}</p>
    </div>
    `
        : ''
    }

    ${
      data.terms
        ? `
    <!-- Terms -->
    <div class="notes-section">
      <h3>Payment Terms</h3>
      <p>${data.terms}</p>
    </div>
    `
        : ''
    }

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your business!</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
