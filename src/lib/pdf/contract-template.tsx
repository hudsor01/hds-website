/**
 * Contract PDF Template
 * Uses @react-pdf/renderer for PDF generation
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333333',
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0891b2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0891b2',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  partiesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  partyBlock: {
    flex: 1,
    padding: 10,
  },
  partyLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 5,
    letterSpacing: 1,
  },
  partyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  partyDetails: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.5,
  },
  clauseNumber: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  signatureSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
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
    marginTop: 40,
    height: 1,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 3,
  },
  signatureValue: {
    fontSize: 10,
    minHeight: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
  },
  bulletPoint: {
    marginBottom: 5,
    paddingLeft: 15,
  },
  effectiveDate: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export type ContractTemplate = 'service-agreement' | 'nda' | 'freelance-contract';

export interface ContractData {
  // Template
  template: ContractTemplate;
  // Provider/Company Info
  providerName: string;
  providerAddress: string;
  providerCity: string;
  providerState: string;
  providerZip: string;
  providerEmail: string;
  // Client Info
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientEmail: string;
  // Contract Details
  effectiveDate: string;
  endDate: string;
  // Terms
  scopeOfWork: string;
  paymentTerms: string;
  paymentAmount: string;
  timeline: string;
  // Custom
  customClauses: string;
}

interface ContractDocumentProps {
  data: ContractData;
}

const formatDate = (dateString: string): string => {
  if (!dateString) {return '__________________';}
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getTemplateTitle = (template: ContractTemplate): string => {
  switch (template) {
    case 'service-agreement':
      return 'SERVICE AGREEMENT';
    case 'nda':
      return 'NON-DISCLOSURE AGREEMENT';
    case 'freelance-contract':
      return 'FREELANCE CONTRACT';
    default:
      return 'CONTRACT';
  }
};

const ServiceAgreementContent = ({ data }: { data: ContractData }) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1. SERVICES</Text>
      <Text style={styles.paragraph}>
        The Service Provider agrees to provide the following services to the Client:
      </Text>
      <Text style={styles.paragraph}>{data.scopeOfWork || '[Scope of work to be defined]'}</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2. COMPENSATION</Text>
      <Text style={styles.paragraph}>
        In consideration for the Services, the Client agrees to pay the Service Provider:
      </Text>
      <Text style={styles.paragraph}>
        Amount: {data.paymentAmount || '[Amount to be specified]'}
      </Text>
      <Text style={styles.paragraph}>
        Payment Terms: {data.paymentTerms || '[Payment terms to be specified]'}
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>3. TIMELINE</Text>
      <Text style={styles.paragraph}>
        {data.timeline || 'The timeline for deliverables will be mutually agreed upon by both parties.'}
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>4. INTELLECTUAL PROPERTY</Text>
      <Text style={styles.paragraph}>
        Upon full payment, all intellectual property rights in the deliverables shall transfer to the Client, except for any pre-existing materials owned by the Service Provider.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>5. CONFIDENTIALITY</Text>
      <Text style={styles.paragraph}>
        Both parties agree to keep confidential all proprietary information disclosed during the course of this agreement and not to disclose such information to any third party without prior written consent.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>6. TERMINATION</Text>
      <Text style={styles.paragraph}>
        Either party may terminate this agreement with 30 days written notice. In case of termination, the Client shall pay for all work completed up to the termination date.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>7. LIMITATION OF LIABILITY</Text>
      <Text style={styles.paragraph}>
        The Service Provider&apos;s liability shall be limited to the total fees paid by the Client under this agreement. Neither party shall be liable for indirect, incidental, or consequential damages.
      </Text>
    </View>
  </>
);

const NDAContent = ({ data }: { data: ContractData }) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1. DEFINITION OF CONFIDENTIAL INFORMATION</Text>
      <Text style={styles.paragraph}>
        &quot;Confidential Information&quot; means any data or information, oral or written, disclosed by either party that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2. OBLIGATIONS OF RECEIVING PARTY</Text>
      <Text style={styles.paragraph}>
        The Receiving Party agrees to:
      </Text>
      <Text style={styles.bulletPoint}>- Hold the Confidential Information in strict confidence</Text>
      <Text style={styles.bulletPoint}>- Not disclose the Confidential Information to any third parties</Text>
      <Text style={styles.bulletPoint}>- Use the Confidential Information only for the purposes of {data.scopeOfWork || 'the business relationship'}</Text>
      <Text style={styles.bulletPoint}>- Protect the Confidential Information with the same degree of care used to protect its own confidential information</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>3. EXCLUSIONS</Text>
      <Text style={styles.paragraph}>
        Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was in the Receiving Party&apos;s possession before disclosure; (c) is independently developed without use of Confidential Information; or (d) is rightfully obtained from a third party.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>4. TERM</Text>
      <Text style={styles.paragraph}>
        This agreement shall remain in effect from {formatDate(data.effectiveDate)} until {data.endDate ? formatDate(data.endDate) : 'terminated by either party with 30 days written notice'}. The confidentiality obligations shall survive for a period of 3 years after termination.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>5. RETURN OF INFORMATION</Text>
      <Text style={styles.paragraph}>
        Upon termination or request, the Receiving Party shall promptly return or destroy all Confidential Information and certify such destruction in writing.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>6. REMEDIES</Text>
      <Text style={styles.paragraph}>
        The parties acknowledge that breach of this agreement may cause irreparable harm and that monetary damages may be inadequate. Therefore, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to other available remedies.
      </Text>
    </View>
  </>
);

const FreelanceContractContent = ({ data }: { data: ContractData }) => (
  <>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>1. ENGAGEMENT</Text>
      <Text style={styles.paragraph}>
        The Client hereby engages the Contractor as an independent contractor, and the Contractor accepts such engagement, to perform the following services:
      </Text>
      <Text style={styles.paragraph}>{data.scopeOfWork || '[Scope of work to be defined]'}</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2. COMPENSATION</Text>
      <Text style={styles.paragraph}>
        Fee: {data.paymentAmount || '[Amount to be specified]'}
      </Text>
      <Text style={styles.paragraph}>
        Payment Schedule: {data.paymentTerms || '[Payment terms to be specified]'}
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>3. TIMELINE AND DELIVERABLES</Text>
      <Text style={styles.paragraph}>
        {data.timeline || 'The Contractor shall complete the work within a mutually agreed timeline.'}
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>4. INDEPENDENT CONTRACTOR STATUS</Text>
      <Text style={styles.paragraph}>
        The Contractor is an independent contractor and not an employee of the Client. The Contractor is responsible for their own taxes, insurance, and benefits. The Contractor has the right to control the manner and means of performing the services.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>5. OWNERSHIP OF WORK</Text>
      <Text style={styles.paragraph}>
        Upon full payment, all work product created under this agreement shall be the property of the Client. The Contractor assigns all rights, title, and interest in the work product to the Client.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>6. CONFIDENTIALITY</Text>
      <Text style={styles.paragraph}>
        The Contractor agrees to keep confidential all information received from the Client in connection with this project and will not disclose such information to third parties without the Client&apos;s consent.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>7. TERMINATION</Text>
      <Text style={styles.paragraph}>
        Either party may terminate this agreement with 14 days written notice. Upon termination, the Client shall pay for all work completed to date.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>8. REVISIONS</Text>
      <Text style={styles.paragraph}>
        The fee includes up to two (2) rounds of revisions. Additional revisions will be billed at an agreed hourly rate.
      </Text>
    </View>
  </>
);

export function ContractDocument({ data }: ContractDocumentProps) {
  const getContent = () => {
    switch (data.template) {
      case 'nda':
        return <NDAContent data={data} />;
      case 'freelance-contract':
        return <FreelanceContractContent data={data} />;
      default:
        return <ServiceAgreementContent data={data} />;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{getTemplateTitle(data.template)}</Text>
          <Text style={styles.subtitle}>
            Between {data.providerName || '[Provider]'} and {data.clientName || data.clientCompany || '[Client]'}
          </Text>
        </View>

        {/* Effective Date */}
        <Text style={styles.effectiveDate}>
          Effective Date: {formatDate(data.effectiveDate)}
        </Text>

        {/* Parties */}
        <View style={styles.partiesSection}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>
              {data.template === 'nda' ? 'PARTY A (DISCLOSING PARTY)' : 'SERVICE PROVIDER'}
            </Text>
            <Text style={styles.partyName}>{data.providerName}</Text>
            <Text style={styles.partyDetails}>
              {data.providerAddress}
              {'\n'}
              {data.providerCity}, {data.providerState} {data.providerZip}
              {'\n'}
              {data.providerEmail}
            </Text>
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>
              {data.template === 'nda' ? 'PARTY B (RECEIVING PARTY)' : 'CLIENT'}
            </Text>
            <Text style={styles.partyName}>{data.clientName || data.clientCompany}</Text>
            <Text style={styles.partyDetails}>
              {data.clientCompany && data.clientName && `${data.clientCompany}\n`}
              {data.clientAddress}
              {'\n'}
              {data.clientCity}, {data.clientState} {data.clientZip}
              {'\n'}
              {data.clientEmail}
            </Text>
          </View>
        </View>

        {/* Template-specific content */}
        {getContent()}

        {/* Custom Clauses */}
        {data.customClauses && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADDITIONAL TERMS</Text>
            <Text style={styles.paragraph}>{data.customClauses}</Text>
          </View>
        )}

        {/* Governing Law */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GOVERNING LAW</Text>
          <Text style={styles.paragraph}>
            This agreement shall be governed by and construed in accordance with the laws of the State of {data.providerState || 'Texas'}, without regard to its conflict of law provisions.
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>
            IN WITNESS WHEREOF, the parties have executed this agreement as of the date first written above.
          </Text>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature</Text>
              <Text style={styles.signatureValue}>{data.providerName}</Text>
              <Text style={styles.signatureLabel}>Date: __________________</Text>
            </View>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature</Text>
              <Text style={styles.signatureValue}>{data.clientName || data.clientCompany}</Text>
              <Text style={styles.signatureLabel}>Date: __________________</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by Hudson Digital Solutions
          </Text>
        </View>
      </Page>
    </Document>
  );
}
