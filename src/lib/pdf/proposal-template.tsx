/**
 * Proposal PDF Template
 * Uses @react-pdf/renderer for PDF generation
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ProposalPricingItem, ProposalMilestone, ProposalData } from '@/types/pdf-templates';

// Re-export types for convenience
export type { ProposalPricingItem, ProposalMilestone, ProposalData };

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.6,
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 20,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center',
  },
  coverClient: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 40,
    textAlign: 'center',
  },
  coverCompany: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: 'center',
  },
  coverCompanyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 4,
  },
  coverCompanyDetails: {
    fontSize: 9,
    color: '#666666',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#0891b2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCompany: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  headerProject: {
    fontSize: 10,
    color: '#666666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  scopeItem: {
    marginBottom: 8,
    paddingLeft: 15,
    flexDirection: 'row',
  },
  scopeBullet: {
    marginRight: 10,
    color: '#0891b2',
  },
  scopeText: {
    flex: 1,
  },
  milestoneRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  milestonePhase: {
    width: '20%',
    fontWeight: 'bold',
  },
  milestoneDesc: {
    flex: 1,
  },
  milestoneDuration: {
    width: '20%',
    textAlign: 'right',
    color: '#666666',
  },
  pricingTable: {
    marginTop: 10,
  },
  pricingHeader: {
    flexDirection: 'row',
    backgroundColor: '#0891b2',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  pricingHeaderText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 9,
  },
  pricingRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  pricingRowAlt: {
    backgroundColor: '#f9fafb',
  },
  pricingItem: {
    flex: 3,
  },
  pricingPrice: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#0891b2',
    marginTop: 2,
  },
  totalLabel: {
    flex: 3,
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 11,
  },
  totalValue: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 12,
  },
  termsSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  termItem: {
    marginBottom: 8,
    fontSize: 9,
  },
  termTitle: {
    fontWeight: 'bold',
    color: '#333333',
  },
  termText: {
    color: '#666666',
  },
  aboutSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  signatureSection: {
    marginTop: 40,
    paddingTop: 20,
  },
  signatureBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureColumn: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 5,
    marginTop: 30,
    height: 1,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    fontSize: 9,
    color: '#999999',
  },
  validUntil: {
    backgroundColor: '#fff7ed',
    padding: 10,
    borderRadius: 4,
    marginTop: 15,
    textAlign: 'center',
  },
  validUntilText: {
    fontSize: 10,
    color: '#c2410c',
    fontWeight: 'bold',
  },
});

interface ProposalDocumentProps {
  data: ProposalData;
}

const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) {return '';}
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function ProposalDocument({ data }: ProposalDocumentProps) {
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={styles.coverTitle}>PROJECT PROPOSAL</Text>
          <Text style={styles.coverSubtitle}>{data.projectName || 'Project Name'}</Text>
          <Text style={styles.coverClient}>
            Prepared for: {data.clientCompany || data.clientName || 'Client'}
          </Text>
          <Text style={styles.coverDate}>
            {formatDate(data.projectDate)}
          </Text>
        </View>
        <View style={styles.coverCompany}>
          <Text style={styles.coverCompanyName}>{data.companyName}</Text>
          <Text style={styles.coverCompanyDetails}>
            {data.companyEmail} | {data.companyPhone}
          </Text>
        </View>
      </Page>

      {/* Content Pages */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerCompany}>{data.companyName}</Text>
          <Text style={styles.headerProject}>{data.projectName}</Text>
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Overview</Text>
          <Text style={styles.paragraph}>{data.overview || 'Project overview to be defined.'}</Text>
        </View>

        {/* Scope of Work */}
        {data.scopeItems.filter(item => item.trim()).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scope of Work</Text>
            {data.scopeItems.filter(item => item.trim()).map((item, index) => (
              <View key={index} style={styles.scopeItem}>
                <Text style={styles.scopeBullet}>&#8226;</Text>
                <Text style={styles.scopeText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Timeline */}
        {data.milestones.filter(m => m.description.trim()).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Timeline</Text>
            {data.milestones.filter(m => m.description.trim()).map((milestone) => (
              <View key={milestone.id} style={styles.milestoneRow}>
                <Text style={styles.milestonePhase}>{milestone.phase}</Text>
                <Text style={styles.milestoneDesc}>{milestone.description}</Text>
                <Text style={styles.milestoneDuration}>{milestone.duration}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pricing */}
        {data.pricingItems.filter(p => p.description.trim()).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Investment</Text>
            <View style={styles.pricingTable}>
              <View style={styles.pricingHeader}>
                <Text style={[styles.pricingHeaderText, styles.pricingItem]}>Description</Text>
                <Text style={[styles.pricingHeaderText, styles.pricingPrice]}>Amount</Text>
              </View>
              {data.pricingItems.filter(p => p.description.trim()).map((item, index) => (
                <View key={item.id} style={[styles.pricingRow, index % 2 === 1 ? styles.pricingRowAlt : {}]}>
                  <Text style={styles.pricingItem}>{item.description}</Text>
                  <Text style={styles.pricingPrice}>{formatCurrency(item.price)}</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Investment</Text>
                <Text style={styles.totalValue}>{formatCurrency(data.total)}</Text>
              </View>
            </View>

            {data.paymentTerms && (
              <Text style={[styles.paragraph, { marginTop: 15, fontSize: 9, color: '#666666' }]}>
                Payment Terms: {data.paymentTerms}
              </Text>
            )}

            {data.validUntil && (
              <View style={styles.validUntil}>
                <Text style={styles.validUntilText}>
                  This proposal is valid until {formatDate(data.validUntil)}
                </Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      {/* Terms & About Page */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerCompany}>{data.companyName}</Text>
          <Text style={styles.headerProject}>{data.projectName}</Text>
        </View>

        {/* Terms */}
        {data.terms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms &amp; Conditions</Text>
            <Text style={styles.paragraph}>{data.terms}</Text>
          </View>
        )}

        {/* About Us */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About {data.companyName}</Text>
          <Text style={styles.paragraph}>
            {data.companyDescription || 'Company description to be added.'}
          </Text>
          <Text style={[styles.paragraph, { marginTop: 10, fontSize: 9, color: '#666666' }]}>
            {data.companyAddress}
            {'\n'}
            {data.companyCity}, {data.companyState} {data.companyZip}
            {'\n'}
            {data.companyEmail} | {data.companyPhone}
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>
            To proceed with this proposal, please sign below:
          </Text>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Client Signature</Text>
              <Text style={{ fontSize: 10 }}>{data.clientName || data.clientCompany}</Text>
              <Text style={styles.signatureLabel}>Date: __________________</Text>
            </View>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>{data.companyName}</Text>
              <Text style={styles.signatureLabel}>Date: __________________</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for considering {data.companyName} for your project!
          </Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
}
