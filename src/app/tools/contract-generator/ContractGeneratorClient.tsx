/**
 * Contract Generator
 * Create professional contracts with PDF download
 */

'use client';

import { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { BUSINESS_INFO } from '@/lib/constants/business';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { Card } from '@/components/ui/card';
import { trackEvent } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { FileCheck, Download, Save, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ContractData, ContractTemplate } from '@/lib/pdf/contract-template';
import { useHydrated } from '@/hooks/use-hydrated';

// Dynamic import for PDF to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span>Loading PDF...</span> }
);

const ContractDocument = dynamic(
  () => import('@/lib/pdf/contract-template').then((mod) => mod.ContractDocument),
  { ssr: false }
);

const STORAGE_KEY = 'hds-contract-draft';

const DEFAULT_PROVIDER = {
  providerName: 'Hudson Digital Solutions',
  providerAddress: '',
  providerCity: 'Dallas',
  providerState: 'TX',
  providerZip: '',
  providerEmail: BUSINESS_INFO.email,
};

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0] ?? '';
};

const TEMPLATES: { value: ContractTemplate; label: string; description: string }[] = [
  {
    value: 'service-agreement',
    label: 'Service Agreement',
    description: 'General agreement for professional services with payment terms and deliverables',
  },
  {
    value: 'nda',
    label: 'Non-Disclosure Agreement (NDA)',
    description: 'Protect confidential information shared between parties',
  },
  {
    value: 'freelance-contract',
    label: 'Freelance Contract',
    description: 'Independent contractor agreement with scope, payment, and ownership terms',
  },
];

// Subscribe to localStorage changes
const subscribeToStorage = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

// Read draft from localStorage
const getDraftSnapshot = (): ContractData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as ContractData;
    }
  } catch (error) {
    // Log invalid JSON for debugging, but don't break the app
    logger.debug('Failed to parse contract draft from localStorage', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return null;
};

// Server snapshot always returns null
const getServerDraftSnapshot = (): ContractData | null => null;

// Empty subscribe for useSyncExternalStore
const emptySubscribe = () => () => {};

// Module-level cache for generated defaults
let cachedDefaults: { effectiveDate: string } | null = null;

const getDefaultsSnapshot = () => {
  if (cachedDefaults === null) {
    cachedDefaults = {
      effectiveDate: formatDateForInput(new Date()),
    };
  }
  return cachedDefaults;
};

const getServerDefaultsSnapshot = () => ({
  effectiveDate: '',
});

export default function ContractGeneratorClient() {
  // Use hydration-safe hook
  const isHydrated = useHydrated();

  // Get generated defaults via useSyncExternalStore
  const generatedDefaults = useSyncExternalStore(
    emptySubscribe,
    getDefaultsSnapshot,
    getServerDefaultsSnapshot
  );

  // Load draft from localStorage using useSyncExternalStore
  const savedDraft = useSyncExternalStore(
    subscribeToStorage,
    getDraftSnapshot,
    getServerDraftSnapshot
  );

  // Track if we have a draft (derived)
  const hasDraft = savedDraft !== null;

  // User-entered state
  const [userModifiedData, setUserModifiedData] = useState<Partial<ContractData>>({});

  // Compute effective contract data by merging: defaults < savedDraft < userModified
  const contractData = useMemo((): ContractData => {
    const baseData: ContractData = {
      template: 'service-agreement',
      ...DEFAULT_PROVIDER,
      clientName: '',
      clientCompany: '',
      clientAddress: '',
      clientCity: '',
      clientState: '',
      clientZip: '',
      clientEmail: '',
      effectiveDate: generatedDefaults.effectiveDate,
      endDate: '',
      scopeOfWork: '',
      paymentTerms: '',
      paymentAmount: '',
      timeline: '',
      customClauses: '',
    };

    if (savedDraft) {
      Object.assign(baseData, savedDraft);
    }
    Object.assign(baseData, userModifiedData);

    return baseData;
  }, [generatedDefaults, savedDraft, userModifiedData]);

  // Helper to update contract data
  const setContractData = useCallback((
    updater: ContractData | ((prev: ContractData) => ContractData)
  ) => {
    setUserModifiedData((prev) => {
      const currentFull: ContractData = {
        template: 'service-agreement',
        ...DEFAULT_PROVIDER,
        clientName: '',
        clientCompany: '',
        clientAddress: '',
        clientCity: '',
        clientState: '',
        clientZip: '',
        clientEmail: '',
        effectiveDate: generatedDefaults.effectiveDate,
        endDate: '',
        scopeOfWork: '',
        paymentTerms: '',
        paymentAmount: '',
        timeline: '',
        customClauses: '',
        ...savedDraft,
        ...prev,
      };
      const newData = typeof updater === 'function' ? updater(currentFull) : updater;
      return newData;
    });
  }, [generatedDefaults, savedDraft]);

  const handleInputChange = (field: keyof ContractData, value: string) => {
    setContractData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTemplateChange = (template: ContractTemplate) => {
    setContractData((prev) => ({ ...prev, template }));
    trackEvent('contract_template_selected', { template });
  };

  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contractData));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    trackEvent('contract_draft_saved', {
      template: contractData.template,
    });
  };

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    setUserModifiedData({});
    // Reset cached defaults so new ones are generated
    cachedDefaults = null;
  };

  const isValid =
    contractData.providerName.trim() !== '' &&
    (contractData.clientName.trim() !== '' || contractData.clientCompany.trim() !== '');

  const getFileName = () => {
    const templateName = contractData.template.replace('-', '_');
    const clientName = (contractData.clientName || contractData.clientCompany || 'client')
      .toLowerCase()
      .replace(/\s+/g, '_');
    return `${templateName}_${clientName}.pdf`;
  };

  return (
    <CalculatorLayout
      title="Contract Generator"
      description="Create professional contracts and download them as PDF"
      icon={<FileCheck className="h-8 w-8 text-primary" />}
    >
      <div className="space-y-sections">
        {/* Template Selection */}
        <section className="space-y-content">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Select Contract Type
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {TEMPLATES.map((template) => (
              <button
                key={template.value}
                type="button"
                onClick={() => handleTemplateChange(template.value)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  contractData.template === template.value
                    ? 'border-primary bg-accent/10 dark:bg-primary/20'
                    : 'border-border hover:border-accent hover:bg-muted/50'
                }`}
              >
                <div className="font-semibold text-foreground">{template.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Provider/Your Info */}
        <section className="space-y-content border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {contractData.template === 'nda' ? 'Party A (Disclosing Party)' : 'Service Provider'}
          </h2>
          <div className="grid gap-content sm:grid-cols-2">
            <CalculatorInput
              label="Name / Company"
              id="providerName"
              type="text"
              value={contractData.providerName}
              onChange={(e) => handleInputChange('providerName', e.target.value)}
              required
            />
            <CalculatorInput
              label="Email"
              id="providerEmail"
              type="email"
              value={contractData.providerEmail}
              onChange={(e) => handleInputChange('providerEmail', e.target.value)}
            />
            <CalculatorInput
              label="Address"
              id="providerAddress"
              type="text"
              value={contractData.providerAddress}
              onChange={(e) => handleInputChange('providerAddress', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-tight">
              <CalculatorInput
                label="City"
                id="providerCity"
                type="text"
                value={contractData.providerCity}
                onChange={(e) => handleInputChange('providerCity', e.target.value)}
              />
              <CalculatorInput
                label="State"
                id="providerState"
                type="text"
                value={contractData.providerState}
                onChange={(e) => handleInputChange('providerState', e.target.value)}
              />
              <CalculatorInput
                label="ZIP"
                id="providerZip"
                type="text"
                value={contractData.providerZip}
                onChange={(e) => handleInputChange('providerZip', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Client Info */}
        <section className="space-y-content border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {contractData.template === 'nda' ? 'Party B (Receiving Party)' : 'Client'}
          </h2>
          <div className="grid gap-content sm:grid-cols-2">
            <CalculatorInput
              label="Contact Name"
              id="clientName"
              type="text"
              value={contractData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              helpText="Required"
              required
            />
            <CalculatorInput
              label="Company Name (Optional)"
              id="clientCompany"
              type="text"
              value={contractData.clientCompany}
              onChange={(e) => handleInputChange('clientCompany', e.target.value)}
            />
            <CalculatorInput
              label="Address"
              id="clientAddress"
              type="text"
              value={contractData.clientAddress}
              onChange={(e) => handleInputChange('clientAddress', e.target.value)}
            />
            <CalculatorInput
              label="Email"
              id="clientEmail"
              type="email"
              value={contractData.clientEmail}
              onChange={(e) => handleInputChange('clientEmail', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-tight">
              <CalculatorInput
                label="City"
                id="clientCity"
                type="text"
                value={contractData.clientCity}
                onChange={(e) => handleInputChange('clientCity', e.target.value)}
              />
              <CalculatorInput
                label="State"
                id="clientState"
                type="text"
                value={contractData.clientState}
                onChange={(e) => handleInputChange('clientState', e.target.value)}
              />
              <CalculatorInput
                label="ZIP"
                id="clientZip"
                type="text"
                value={contractData.clientZip}
                onChange={(e) => handleInputChange('clientZip', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Contract Details */}
        <section className="space-y-content border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Contract Details
          </h2>
          <div className="grid gap-content sm:grid-cols-2">
            <CalculatorInput
              label="Effective Date"
              id="effectiveDate"
              type="date"
              value={contractData.effectiveDate}
              onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
            />
            <CalculatorInput
              label="End Date (Optional)"
              id="endDate"
              type="date"
              value={contractData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              helpText="Leave blank for ongoing agreements"
            />
          </div>
        </section>

        {/* Terms - Not shown for NDA */}
        {contractData.template !== 'nda' && (
          <section className="space-y-content border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Terms
            </h2>
            <div className="space-y-content">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Scope of Work
                </label>
                <textarea
                  value={contractData.scopeOfWork}
                  onChange={(e) => handleInputChange('scopeOfWork', e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
                  placeholder="Describe the services to be provided..."
                />
              </div>
              <div className="grid gap-content sm:grid-cols-2">
                <CalculatorInput
                  label="Payment Amount"
                  id="paymentAmount"
                  type="text"
                  value={contractData.paymentAmount}
                  onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
                  placeholder="e.g., $5,000 or $150/hour"
                />
                <CalculatorInput
                  label="Payment Terms"
                  id="paymentTerms"
                  type="text"
                  value={contractData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                  placeholder="e.g., 50% upfront, 50% on completion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Timeline / Milestones
                </label>
                <textarea
                  value={contractData.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
                  placeholder="Describe the project timeline and any key milestones..."
                />
              </div>
            </div>
          </section>
        )}

        {/* Scope for NDA */}
        {contractData.template === 'nda' && (
          <section className="space-y-content border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Purpose of Disclosure
            </h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Purpose
              </label>
              <textarea
                value={contractData.scopeOfWork}
                onChange={(e) => handleInputChange('scopeOfWork', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
                placeholder="e.g., Evaluating a potential business partnership..."
              />
            </div>
          </section>
        )}

        {/* Custom Clauses */}
        <section className="space-y-content border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Additional Terms (Optional)
          </h2>
          <textarea
            value={contractData.customClauses}
            onChange={(e) => handleInputChange('customClauses', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="Add any custom clauses or special terms..."
          />
        </section>

        {/* Actions */}
        <section className="flex flex-wrap gap-3 pt-4">
          <button
            type="button"
            onClick={saveDraft}
            className="flex items-center gap-tight rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-xs hover:bg-muted dark:bg-muted dark:hover:bg-muted-foreground"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>

          {hasDraft && (
            <button
              type="button"
              onClick={clearDraft}
              className="flex items-center gap-tight rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-xs hover:bg-muted dark:bg-muted dark:hover:bg-muted-foreground"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Draft
            </button>
          )}

          {isHydrated && isValid && (
            <PDFDownloadLink
              document={<ContractDocument data={contractData} />}
              fileName={getFileName()}
              className="flex items-center gap-tight rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-primary/80"
              onClick={() => {
                trackEvent('contract_downloaded', {
                  template: contractData.template,
                  has_scope: !!contractData.scopeOfWork,
                  has_payment: !!contractData.paymentAmount,
                });
              }}
            >
              {({ loading }) =>
                loading ? (
                  'Generating PDF...'
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )
              }
            </PDFDownloadLink>
          )}

          {!isValid && (
            <p className="text-sm text-muted-foreground self-center">
              Add provider name and client information to download PDF
            </p>
          )}
        </section>
      </div>

      {/* Educational Content */}
      <div className="mt-heading space-y-content border-t pt-8 dark:border-border">
        <h2 className="text-lg font-semibold text-foreground dark:text-foreground">
          Contract Tips
        </h2>

        <div className="grid gap-content sm:grid-cols-2">
          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Be Specific
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Clearly define the scope of work, deliverables, and timelines to avoid misunderstandings.
            </p>
          </Card>

          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Payment Terms
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Include specific payment amounts, due dates, and any late payment penalties.
            </p>
          </Card>

          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Legal Review
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              For significant contracts, have an attorney review the terms before signing.
            </p>
          </Card>

          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Keep Copies
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Both parties should sign and keep copies of the executed contract.
            </p>
          </Card>
        </div>

        <Card size="sm" className="bg-warning-light dark:bg-warning-bg-dark/20">
          <p className="text-sm text-warning-darker dark:text-warning-muted">
            <strong>Disclaimer:</strong> These contract templates are provided for informational purposes only and do not constitute legal advice. Consult with a qualified attorney for legal matters specific to your situation.
          </p>
        </Card>
      </div>
    </CalculatorLayout>
  );
}
