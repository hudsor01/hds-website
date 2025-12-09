/**
 * Paystub PDF Template
 * Uses @react-pdf/renderer for PDF generation
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { PayPeriod, PaystubData } from '@/types/paystub';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  employerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  payInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
    padding: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 0.5,
    paddingVertical: 2,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 2,
  },
  total: {
    fontWeight: 'bold',
    borderTop: 1,
    marginTop: 5,
    paddingTop: 5,
  },
});

interface PaystubPDFProps {
  payPeriod: PayPeriod;
  employeeData: PaystubData;
  ytdTotals: {
    grossPay: number;
    federalTax: number;
    socialSecurity: number;
    medicare: number;
    netPay: number;
  };
}

export const PaystubPDF: React.FC<PaystubPDFProps> = ({
  payPeriod,
  employeeData,
  ytdTotals,
}) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.employerName}>{employeeData.employerName}</Text>
        <View style={styles.payInfo}>
          <Text>Pay Date: {payPeriod.payDate}</Text>
          <Text>Check #: {payPeriod.period.toString().padStart(4, '0')}</Text>
          <Text>Net Pay: ${payPeriod.netPay.toFixed(2)}</Text>
        </View>
      </View>

      {/* Employee Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employee Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{employeeData.employeeName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Employee ID:</Text>
          <Text style={styles.value}>{employeeData.employeeId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Period:</Text>
          <Text style={styles.value}>{payPeriod.period} of 26</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tax Year:</Text>
          <Text style={styles.value}>{employeeData.taxYear}</Text>
        </View>
      </View>

      {/* Earnings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earnings</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>Hours</Text>
            <Text style={styles.tableCell}>Rate</Text>
            <Text style={styles.tableCell}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Regular Pay</Text>
            <Text style={styles.tableCell}>{payPeriod.hours.toFixed(2)}</Text>
            <Text style={styles.tableCell}>${(payPeriod.grossPay / payPeriod.hours).toFixed(2)}</Text>
            <Text style={styles.tableCell}>${payPeriod.grossPay.toFixed(2)}</Text>
          </View>
          <View style={[styles.tableRow, styles.total]}>
            <Text style={styles.tableCell}>Gross Pay</Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}>${payPeriod.grossPay.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Deductions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deductions</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Federal Tax</Text>
            <Text style={styles.tableCell}>${payPeriod.federalTax.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Social Security</Text>
            <Text style={styles.tableCell}>${payPeriod.socialSecurity.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Medicare</Text>
            <Text style={styles.tableCell}>${payPeriod.medicare.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>State Tax</Text>
            <Text style={styles.tableCell}>${payPeriod.stateTax.toFixed(2)}</Text>
          </View>
          {payPeriod.otherDeductions > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Other Deductions</Text>
              <Text style={styles.tableCell}>${payPeriod.otherDeductions.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.tableRow, styles.total]}>
            <Text style={styles.tableCell}>Total Deductions</Text>
            <Text style={styles.tableCell}>${(payPeriod.federalTax + payPeriod.socialSecurity + payPeriod.medicare + payPeriod.stateTax + payPeriod.otherDeductions).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Net Pay */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Net Pay</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Net Pay:</Text>
          <Text style={styles.value}>${payPeriod.netPay.toFixed(2)}</Text>
        </View>
      </View>

      {/* YTD Totals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Year to Date Totals</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Gross Pay:</Text>
          <Text style={styles.value}>${ytdTotals.grossPay.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Federal Tax:</Text>
          <Text style={styles.value}>${ytdTotals.federalTax.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Social Security:</Text>
          <Text style={styles.value}>${ytdTotals.socialSecurity.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Medicare:</Text>
          <Text style={styles.value}>${ytdTotals.medicare.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Net Pay:</Text>
          <Text style={styles.value}>${ytdTotals.netPay.toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
