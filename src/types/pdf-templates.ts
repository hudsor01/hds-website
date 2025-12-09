/**
 * PDF Template Types
 * Types for contract, invoice, and proposal generators
 */

// ==========================================
// Contract Types
// ==========================================

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

// ==========================================
// Invoice Types
// ==========================================

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

// ==========================================
// Proposal Types
// ==========================================

export interface ProposalPricingItem {
  id: string;
  description: string;
  price: number;
}

export interface ProposalMilestone {
  id: string;
  phase: string;
  description: string;
  duration: string;
}

export interface ProposalData {
  // Company Info
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyEmail: string;
  companyPhone: string;
  companyDescription: string;
  // Client Info
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  // Project Info
  projectName: string;
  projectDate: string;
  validUntil: string;
  // Content
  overview: string;
  scopeItems: string[];
  milestones: ProposalMilestone[];
  pricingItems: ProposalPricingItem[];
  total: number;
  paymentTerms: string;
  // Terms
  terms: string;
}
