/**
 * Invoice PDF Template
 * Uses @react-pdf/renderer for PDF generation
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// Styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0891b2', // cyan-600
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0891b2', // cyan-600
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.5,
  },
  invoiceTitle: {
    textAlign: 'right',
  },
  invoiceTitleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    letterSpacing: 2,
  },
  invoiceNumber: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
  },
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  addressBlock: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0891b2', // cyan-600
    marginBottom: 6,
    letterSpacing: 1,
  },
  addressText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#333333',
  },
  invoiceDetails: {
    alignItems: 'flex-end',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 9,
    color: '#666666',
    width: 80,
    textAlign: 'right',
    marginRight: 10,
  },
  detailValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    width: 100,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0891b2', // cyan-600
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  colDescription: {
    flex: 3,
  },
  colQty: {
    flex: 1,
    textAlign: 'center',
  },
  colRate: {
    flex: 1,
    textAlign: 'right',
  },
  colAmount: {
    flex: 1,
    textAlign: 'right',
  },
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    width: 250,
  },
  totalLabel: {
    flex: 1,
    fontSize: 10,
    color: '#666666',
  },
  totalValue: {
    width: 100,
    fontSize: 10,
    textAlign: 'right',
    color: '#333333',
  },
  grandTotalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    width: 250,
    borderTopWidth: 2,
    borderTopColor: '#0891b2',
    marginTop: 6,
  },
  grandTotalLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  grandTotalValue: {
    width: 100,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#0891b2',
  },
  notesSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
  },
  footerLink: {
    fontSize: 8,
    color: '#0891b2',
    marginTop: 2,
  },
});

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  // Company Info
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyEmail: string;
  companyPhone: string;
  // Client Info
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientEmail: string;
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  // Line Items
  lineItems: InvoiceLineItem[];
  // Totals
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  // Additional
  notes: string;
  paymentTerms: string;
}

interface InvoiceDocumentProps {
  data: InvoiceData;
}

const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function InvoiceDocument({ data }: InvoiceDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{data.companyName}</Text>
            <Text style={styles.companyDetails}>
              {data.companyAddress}
              {'\n'}
              {data.companyCity}, {data.companyState} {data.companyZip}
              {'\n'}
              {data.companyEmail}
              {'\n'}
              {data.companyPhone}
            </Text>
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.invoiceTitleText}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{data.invoiceNumber}</Text>
          </View>
        </View>

        {/* Bill To & Invoice Details */}
        <View style={styles.addressSection}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>BILL TO</Text>
            <Text style={styles.addressText}>
              {data.clientName}
              {data.clientCompany && `\n${data.clientCompany}`}
              {'\n'}
              {data.clientAddress}
              {'\n'}
              {data.clientCity}, {data.clientState} {data.clientZip}
              {data.clientEmail && `\n${data.clientEmail}`}
            </Text>
          </View>
          <View style={styles.invoiceDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invoice Date:</Text>
              <Text style={styles.detailValue}>{data.invoiceDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>{data.dueDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Terms:</Text>
              <Text style={styles.detailValue}>{data.paymentTerms}</Text>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
          </View>
          {data.lineItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colRate}>{formatCurrency(item.rate)}</Text>
              <Text style={styles.colAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
          </View>
          {data.taxRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({data.taxRate}%)</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.taxAmount)}
              </Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total Due</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(data.total)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>NOTES</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business!
          </Text>
          <Text style={styles.footerLink}>
            Generated by Hudson Digital Solutions
          </Text>
        </View>
      </Page>
    </Document>
  );
}
