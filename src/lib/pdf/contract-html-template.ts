/**
 * Contract HTML Template Generator
 * Converts contract data to professional HTML with inline CSS for PDF generation
 */

export type ContractTemplate = 'service-agreement' | 'nda' | 'freelance-contract';

export interface ContractData {
  // Template type
  template: ContractTemplate;

  // Provider details
  providerName: string;
  providerAddress: string;
  providerCity: string;
  providerState: string;
  providerZip: string;
  providerEmail: string;

  // Client details
  clientName?: string;
  clientCompany?: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientEmail: string;

  // Contract details
  effectiveDate: string;
  endDate?: string;
  scopeOfWork?: string;
  paymentAmount?: string;
  paymentTerms?: string;
  timeline?: string;
  customClauses?: string;
}

function formatDate(dateString: string): string {
  if (!dateString) {
    return '__________________';
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getTemplateTitle(template: ContractTemplate): string {
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
}

function getServiceAgreementContent(data: ContractData): string {
  return `
    <div class="section">
      <h2 class="section-title">1. SERVICES</h2>
      <p class="paragraph">
        The Service Provider agrees to provide the following services to the Client:
      </p>
      <p class="paragraph">${data.scopeOfWork || '[Scope of work to be defined]'}</p>
    </div>

    <div class="section">
      <h2 class="section-title">2. COMPENSATION</h2>
      <p class="paragraph">
        In consideration for the Services, the Client agrees to pay the Service Provider:
      </p>
      <p class="paragraph">
        Amount: ${data.paymentAmount || '[Amount to be specified]'}
      </p>
      <p class="paragraph">
        Payment Terms: ${data.paymentTerms || '[Payment terms to be specified]'}
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">3. TIMELINE</h2>
      <p class="paragraph">
        ${data.timeline || 'The timeline for deliverables will be mutually agreed upon by both parties.'}
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">4. INTELLECTUAL PROPERTY</h2>
      <p class="paragraph">
        Upon full payment, all intellectual property rights in the deliverables shall transfer to the Client, except for any pre-existing materials owned by the Service Provider.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">5. CONFIDENTIALITY</h2>
      <p class="paragraph">
        Both parties agree to keep confidential all proprietary information disclosed during the course of this agreement and not to disclose such information to any third party without prior written consent.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">6. TERMINATION</h2>
      <p class="paragraph">
        Either party may terminate this agreement with 30 days written notice. In case of termination, the Client shall pay for all work completed up to the termination date.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">7. LIMITATION OF LIABILITY</h2>
      <p class="paragraph">
        The Service Provider's liability shall be limited to the total fees paid by the Client under this agreement. Neither party shall be liable for indirect, incidental, or consequential damages.
      </p>
    </div>
  `;
}

function getNDAContent(data: ContractData): string {
  return `
    <div class="section">
      <h2 class="section-title">1. DEFINITION OF CONFIDENTIAL INFORMATION</h2>
      <p class="paragraph">
        "Confidential Information" means any data or information, oral or written, disclosed by either party that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">2. OBLIGATIONS OF RECEIVING PARTY</h2>
      <p class="paragraph">The Receiving Party agrees to:</p>
      <ul class="bullet-list">
        <li>Hold the Confidential Information in strict confidence</li>
        <li>Not disclose the Confidential Information to any third parties</li>
        <li>Use the Confidential Information only for the purposes of ${data.scopeOfWork || 'the business relationship'}</li>
        <li>Protect the Confidential Information with the same degree of care used to protect its own confidential information</li>
      </ul>
    </div>

    <div class="section">
      <h2 class="section-title">3. EXCLUSIONS</h2>
      <p class="paragraph">
        Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was in the Receiving Party's possession before disclosure; (c) is independently developed without use of Confidential Information; or (d) is rightfully obtained from a third party.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">4. TERM</h2>
      <p class="paragraph">
        This agreement shall remain in effect from ${formatDate(data.effectiveDate)} until ${data.endDate ? formatDate(data.endDate) : 'terminated by either party with 30 days written notice'}. The confidentiality obligations shall survive for a period of 3 years after termination.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">5. RETURN OF INFORMATION</h2>
      <p class="paragraph">
        Upon termination or request, the Receiving Party shall promptly return or destroy all Confidential Information and certify such destruction in writing.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">6. REMEDIES</h2>
      <p class="paragraph">
        The parties acknowledge that breach of this agreement may cause irreparable harm and that monetary damages may be inadequate. Therefore, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to other available remedies.
      </p>
    </div>
  `;
}

function getFreelanceContractContent(data: ContractData): string {
  return `
    <div class="section">
      <h2 class="section-title">1. ENGAGEMENT</h2>
      <p class="paragraph">
        The Client hereby engages the Contractor as an independent contractor, and the Contractor accepts such engagement, to perform the following services:
      </p>
      <p class="paragraph">${data.scopeOfWork || '[Scope of work to be defined]'}</p>
    </div>

    <div class="section">
      <h2 class="section-title">2. COMPENSATION</h2>
      <p class="paragraph">
        Fee: ${data.paymentAmount || '[Amount to be specified]'}
      </p>
      <p class="paragraph">
        Payment Schedule: ${data.paymentTerms || '[Payment terms to be specified]'}
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">3. TIMELINE AND DELIVERABLES</h2>
      <p class="paragraph">
        ${data.timeline || 'The Contractor shall complete the work within a mutually agreed timeline.'}
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">4. INDEPENDENT CONTRACTOR STATUS</h2>
      <p class="paragraph">
        The Contractor is an independent contractor and not an employee of the Client. The Contractor is responsible for their own taxes, insurance, and benefits. The Contractor has the right to control the manner and means of performing the services.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">5. OWNERSHIP OF WORK</h2>
      <p class="paragraph">
        Upon full payment, all work product created under this agreement shall be the property of the Client. The Contractor assigns all rights, title, and interest in the work product to the Client.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">6. CONFIDENTIALITY</h2>
      <p class="paragraph">
        The Contractor agrees to keep confidential all information received from the Client in connection with this project and will not disclose such information to third parties without the Client's consent.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">7. TERMINATION</h2>
      <p class="paragraph">
        Either party may terminate this agreement with 14 days written notice. Upon termination, the Client shall pay for all work completed to date.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">8. REVISIONS</h2>
      <p class="paragraph">
        The fee includes up to two (2) rounds of revisions. Additional revisions will be billed at an agreed hourly rate.
      </p>
    </div>
  `;
}

function getTemplateContent(data: ContractData): string {
  switch (data.template) {
    case 'nda':
      return getNDAContent(data);
    case 'freelance-contract':
      return getFreelanceContractContent(data);
    default:
      return getServiceAgreementContent(data);
  }
}

export function generateContractHTML(data: ContractData): string {
  const clientDisplay = data.clientName || data.clientCompany;
  const providerLabel = data.template === 'nda' ? 'PARTY A (DISCLOSING PARTY)' : 'SERVICE PROVIDER';
  const clientLabel = data.template === 'nda' ? 'PARTY B (RECEIVING PARTY)' : 'CLIENT';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${getTemplateTitle(data.template)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11pt;
      color: #333333;
      line-height: 1.6;
      padding: 50px;
      background: #ffffff;
    }

    @media print {
      body {
        padding: 40px;
      }
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0891b2;
      text-align: center;
    }

    .title {
      font-size: 24pt;
      font-weight: bold;
      color: #0891b2;
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 12pt;
      color: #666666;
    }

    .effective-date {
      text-align: center;
      font-weight: bold;
      margin-bottom: 20px;
    }

    .parties-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e5e5e5;
    }

    .party-block {
      padding: 10px;
    }

    .party-label {
      font-size: 9pt;
      font-weight: bold;
      color: #0891b2;
      margin-bottom: 5px;
      letter-spacing: 1px;
    }

    .party-name {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .party-details {
      font-size: 10pt;
      color: #666666;
      line-height: 1.5;
    }

    .section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 13pt;
      font-weight: bold;
      color: #0891b2;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e5e5;
    }

    .paragraph {
      margin-bottom: 10px;
      text-align: justify;
    }

    .bullet-list {
      margin-left: 20px;
      margin-bottom: 10px;
    }

    .bullet-list li {
      margin-bottom: 5px;
    }

    .signature-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
    }

    .signature-intro {
      margin-bottom: 20px;
      font-weight: bold;
    }

    .signature-block {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .signature-column {
      padding: 10px;
    }

    .signature-line {
      border-bottom: 1px solid #333333;
      margin-top: 40px;
      margin-bottom: 5px;
      height: 1px;
    }

    .signature-label {
      font-size: 9pt;
      color: #666666;
      margin-bottom: 3px;
    }

    .signature-value {
      font-size: 10pt;
      min-height: 15px;
    }

    .footer {
      margin-top: 50px;
      padding-top: 15px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
    }

    .footer-text {
      font-size: 8pt;
      color: #999999;
    }

    @page {
      margin: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="title">${getTemplateTitle(data.template)}</div>
      <div class="subtitle">
        Between ${data.providerName || '[Provider]'} and ${clientDisplay || '[Client]'}
      </div>
    </div>

    <!-- Effective Date -->
    <div class="effective-date">
      Effective Date: ${formatDate(data.effectiveDate)}
    </div>

    <!-- Parties -->
    <div class="parties-section">
      <div class="party-block">
        <div class="party-label">${providerLabel}</div>
        <div class="party-name">${data.providerName}</div>
        <div class="party-details">
          ${data.providerAddress}<br>
          ${data.providerCity}, ${data.providerState} ${data.providerZip}<br>
          ${data.providerEmail}
        </div>
      </div>
      <div class="party-block">
        <div class="party-label">${clientLabel}</div>
        <div class="party-name">${clientDisplay}</div>
        <div class="party-details">
          ${data.clientCompany && data.clientName ? `${data.clientCompany}<br>` : ''}
          ${data.clientAddress}<br>
          ${data.clientCity}, ${data.clientState} ${data.clientZip}<br>
          ${data.clientEmail}
        </div>
      </div>
    </div>

    <!-- Template-specific content -->
    ${getTemplateContent(data)}

    <!-- Custom Clauses -->
    ${
      data.customClauses
        ? `
    <div class="section">
      <h2 class="section-title">ADDITIONAL TERMS</h2>
      <p class="paragraph">${data.customClauses}</p>
    </div>
    `
        : ''
    }

    <!-- Governing Law -->
    <div class="section">
      <h2 class="section-title">GOVERNING LAW</h2>
      <p class="paragraph">
        This agreement shall be governed by and construed in accordance with the laws of the State of ${data.providerState || 'Texas'}, without regard to its conflict of law provisions.
      </p>
    </div>

    <!-- Signature Section -->
    <div class="signature-section">
      <div class="signature-intro">
        IN WITNESS WHEREOF, the parties have executed this agreement as of the date first written above.
      </div>
      <div class="signature-block">
        <div class="signature-column">
          <div class="signature-line"></div>
          <div class="signature-label">Signature</div>
          <div class="signature-value">${data.providerName}</div>
          <div class="signature-label">Date: __________________</div>
        </div>
        <div class="signature-column">
          <div class="signature-line"></div>
          <div class="signature-label">Signature</div>
          <div class="signature-value">${clientDisplay}</div>
          <div class="signature-label">Date: __________________</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        Generated by Hudson Digital Solutions
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
