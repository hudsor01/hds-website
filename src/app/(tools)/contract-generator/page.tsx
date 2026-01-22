/**
 * Contract Generator
 * Create professional contracts with PDF download
 */

'use client';

import { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trackEvent } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { castError } from '@/lib/utils/errors';
import { FileCheck, Download, Save, RotateCcw } from 'lucide-react';
import type { ContractData, ContractTemplate } from '@/lib/pdf/contract-html-template';
import { useHydrated } from '@/hooks/use-hydrated';
import { useLocalStorageDraft } from '@/hooks/use-local-storage-draft';

const STORAGE_KEY = 'hds-contract-draft';

const DEFAULT_PROVIDER = {
  providerName: 'Hudson Digital Solutions',
  providerAddress: '',
  providerCity: 'Dallas',
  providerState: 'TX',
  providerZip: '',
  providerEmail: 'hello@hudsondigitalsolutions.com',
};

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

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

// Empty subscribe for useSyncExternalStore (for generated defaults)
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

export default function ContractGeneratorPage() {
  // Use hydration-safe hook
  const isHydrated = useHydrated();

  // Get generated defaults via useSyncExternalStore
  const generatedDefaults = useSyncExternalStore(
    emptySubscribe,
    getDefaultsSnapshot,
    getServerDefaultsSnapshot
  );

  // Load draft from localStorage using shared hook
  const { savedDraft, hasDraft, saveDraft: saveDraftToStorage, clearDraft: clearDraftFromStorage } =
    useLocalStorageDraft<ContractData>(STORAGE_KEY);

  // User-entered state
  const [userModifiedData, setUserModifiedData] = useState<Partial<ContractData>>({});

  // PDF download state
  const [isDownloading, setIsDownloading] = useState(false);

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
    saveDraftToStorage(contractData);
    trackEvent('contract_draft_saved', {
      template: contractData.template,
    });
  };

  const clearDraft = () => {
    clearDraftFromStorage();
    setUserModifiedData({});
    // Reset cached defaults so new ones are generated
    cachedDefaults = null;
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf/contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate PDF');
      }

      // Get the PDF blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Track analytics
      trackEvent('contract_downloaded', {
        template: contractData.template,
      });
    } catch (error) {
      const err = castError(error);
      logger.error('Failed to download contract PDF', {
        error: err.message,
        template: contractData.template,
      });
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const isValid =
    contractData.providerName.trim() !== '' &&
    ((contractData.clientName?.trim() ?? '') !== '' || (contractData.clientCompany?.trim() ?? '') !== '');

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
              <Button
                key={template.value}
                type="button"
                onClick={() => handleTemplateChange(template.value)}
                variant="outline"
                className={`h-auto w-full items-start justify-start p-4 text-left ${
                  contractData.template === template.value
                    ? 'border-primary bg-accent/10 dark:bg-primary-hover/20'
                    : 'hover:border-accent hover:bg-muted/50'
                }`}
              >
                <div className="font-semibold text-foreground">{template.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
              </Button>
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
          <Button
            type="button"
            onClick={saveDraft}
            variant="outline"
            className="bg-card"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>

          {hasDraft && (
            <Button
              type="button"
              onClick={clearDraft}
              variant="muted"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Draft
            </Button>
          )}

          {isHydrated && isValid && (
            <Button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              variant="default"
            >
              {isDownloading ? (
                'Generating PDF...'
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </Button>
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
