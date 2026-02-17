/**
 * Proposal Generator
 * Create professional project proposals with PDF download
 */

'use client';

  import { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { BUSINESS_INFO } from '@/lib/constants/business';
import { Card } from '@/components/ui/card';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { trackEvent } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils';
import { FileSpreadsheet, Plus, Trash2, Download, Save, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ProposalData, ProposalPricingItem, ProposalMilestone } from '@/lib/pdf/proposal-template';
import { useHydrated } from '@/hooks/use-hydrated';
import { logger } from '@/lib/logger';

// Dynamic import for PDF to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span>Loading PDF...</span> }
);

const ProposalDocument = dynamic(
  () => import('@/lib/pdf/proposal-template').then((mod) => mod.ProposalDocument),
  { ssr: false }
);

const STORAGE_KEY = 'hds-proposal-draft';

const DEFAULT_COMPANY = {
  companyName: 'Hudson Digital Solutions',
  companyAddress: '',
  companyCity: 'Dallas',
  companyState: 'TX',
  companyZip: '',
  companyEmail: BUSINESS_INFO.email,
  companyPhone: '',
  companyDescription: 'Hudson Digital Solutions is a Texas-based digital agency specializing in web development, SaaS consulting, and digital marketing. We partner with businesses to create exceptional digital experiences that drive growth and deliver measurable results.',
};

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0] ?? '';
};

// Only call crypto.randomUUID() on the client
const createEmptyPricingItem = (): ProposalPricingItem => ({
  id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `price-${Date.now()}`,
  description: '',
  price: 0,
});

// Subscribe to localStorage changes
const subscribeToStorage = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

// Read draft from localStorage
const getDraftSnapshot = (): ProposalData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as ProposalData;
    }
  } catch (error) {
    // Log invalid localStorage data for debugging
    logger.warn('Failed to parse proposal draft from localStorage', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return null;
};

// Server snapshot always returns null
const getServerDraftSnapshot = (): ProposalData | null => null;

// Empty subscribe for useSyncExternalStore
const emptySubscribe = () => () => {};

// Module-level cache for generated defaults
let cachedDefaults: {
  projectDate: string;
  validUntil: string;
  milestones: ProposalMilestone[];
  pricingItems: ProposalPricingItem[];
} | null = null;

const getDefaultsSnapshot = () => {
  if (cachedDefaults === null) {
    cachedDefaults = {
      projectDate: formatDateForInput(new Date()),
      validUntil: formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      milestones: [
        { id: crypto.randomUUID(), phase: 'Phase 1', description: '', duration: '' },
        { id: crypto.randomUUID(), phase: 'Phase 2', description: '', duration: '' },
      ],
      pricingItems: [createEmptyPricingItem()],
    };
  }
  return cachedDefaults;
};

const getServerDefaultsSnapshot = () => ({
  projectDate: '',
  validUntil: '',
  milestones: [] as ProposalMilestone[],
  pricingItems: [] as ProposalPricingItem[],
});

export default function ProposalGeneratorClient() {
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
  const [userModifiedData, setUserModifiedData] = useState<Partial<ProposalData>>({});

  // Compute effective proposal data by merging: defaults < savedDraft < userModified
  const proposalData = useMemo((): ProposalData => {
    const baseData: ProposalData = {
      ...DEFAULT_COMPANY,
      clientName: '',
      clientCompany: '',
      clientEmail: '',
      projectName: '',
      projectDate: generatedDefaults.projectDate,
      validUntil: generatedDefaults.validUntil,
      overview: '',
      scopeItems: ['', '', ''],
      milestones: generatedDefaults.milestones,
      pricingItems: generatedDefaults.pricingItems,
      total: 0,
      paymentTerms: '50% deposit to begin work, 50% upon completion',
      terms: 'This proposal is based on the scope defined above. Any changes to the scope may affect the timeline and pricing. All work remains the property of the provider until full payment is received. Client agrees to provide timely feedback and necessary materials to maintain the project timeline.',
    };

    if (savedDraft) {
      Object.assign(baseData, savedDraft);
    }
    Object.assign(baseData, userModifiedData);

    return baseData;
  }, [generatedDefaults, savedDraft, userModifiedData]);

  // Helper to update proposal data
  const setProposalData = useCallback((
    updater: ProposalData | ((prev: ProposalData) => ProposalData)
  ) => {
    setUserModifiedData((prev) => {
      const currentFull: ProposalData = {
        ...DEFAULT_COMPANY,
        clientName: '',
        clientCompany: '',
        clientEmail: '',
        projectName: '',
        projectDate: generatedDefaults.projectDate,
        validUntil: generatedDefaults.validUntil,
        overview: '',
        scopeItems: ['', '', ''],
        milestones: generatedDefaults.milestones,
        pricingItems: generatedDefaults.pricingItems,
        total: 0,
        paymentTerms: '50% deposit to begin work, 50% upon completion',
        terms: 'This proposal is based on the scope defined above. Any changes to the scope may affect the timeline and pricing. All work remains the property of the provider until full payment is received. Client agrees to provide timely feedback and necessary materials to maintain the project timeline.',
        ...savedDraft,
        ...prev,
      };
      const newData = typeof updater === 'function' ? updater(currentFull) : updater;
      return newData;
    });
  }, [generatedDefaults, savedDraft]);

  // Calculate total (derived from pricingItems, used directly in render)
  const computedTotal = useMemo(() => {
    return proposalData.pricingItems.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [proposalData.pricingItems]);

  const handleInputChange = (field: keyof ProposalData, value: string) => {
    setProposalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScopeItemChange = useCallback((index: number, value: string) => {
    setProposalData((prev) => ({
      ...prev,
      scopeItems: prev.scopeItems.map((item, i) => (i === index ? value : item)),
    }));
  }, [setProposalData]);

  const addScopeItem = () => {
    setProposalData((prev) => ({
      ...prev,
      scopeItems: [...prev.scopeItems, ''],
    }));
  };

  const removeScopeItem = (index: number) => {
    if (proposalData.scopeItems.length === 1) {return;}
    setProposalData((prev) => ({
      ...prev,
      scopeItems: prev.scopeItems.filter((_, i) => i !== index),
    }));
  };

  const handleMilestoneChange = useCallback((id: string, field: keyof ProposalMilestone, value: string) => {
    setProposalData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  }, [setProposalData]);

  const addMilestone = () => {
    const nextPhaseNum = proposalData.milestones.length + 1;
    setProposalData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { id: crypto.randomUUID(), phase: `Phase ${nextPhaseNum}`, description: '', duration: '' },
      ],
    }));
  };

  const removeMilestone = (id: string) => {
    if (proposalData.milestones.length === 1) {return;}
    setProposalData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }));
  };

  const handlePricingChange = useCallback((id: string, field: keyof ProposalPricingItem, value: string | number) => {
    setProposalData((prev) => ({
      ...prev,
      pricingItems: prev.pricingItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, [setProposalData]);

  const addPricingItem = () => {
    setProposalData((prev) => ({
      ...prev,
      pricingItems: [...prev.pricingItems, createEmptyPricingItem()],
    }));
  };

  const removePricingItem = (id: string) => {
    if (proposalData.pricingItems.length === 1) {return;}
    setProposalData((prev) => ({
      ...prev,
      pricingItems: prev.pricingItems.filter((item) => item.id !== id),
    }));
  };

  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposalData));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    trackEvent('proposal_draft_saved', {
      project_name: proposalData.projectName,
      total: computedTotal,
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
    proposalData.projectName.trim() !== '' &&
    (proposalData.clientName.trim() !== '' || proposalData.clientCompany.trim() !== '');

  const getFileName = () => {
    const projectName = (proposalData.projectName || 'proposal')
      .toLowerCase()
      .replace(/\s+/g, '_');
    return `proposal_${projectName}.pdf`;
  };

  return (
    <CalculatorLayout
      title="Proposal Generator"
      description="Create professional project proposals and download them as PDF"
      icon={<FileSpreadsheet className="h-8 w-8 text-primary" />}
    >
      <div className="space-y-sections">
        {/* Your Company Info */}
        <section className="space-y-content">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Your Company Information
          </h3>
          <div className="grid gap-content sm:grid-cols-2">
            <CalculatorInput
              label="Company Name"
              id="companyName"
              type="text"
              value={proposalData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
            />
            <CalculatorInput
              label="Email"
              id="companyEmail"
              type="email"
              value={proposalData.companyEmail}
              onChange={(e) => handleInputChange('companyEmail', e.target.value)}
            />
            <CalculatorInput
              label="Phone"
              id="companyPhone"
              type="tel"
              value={proposalData.companyPhone}
              onChange={(e) => handleInputChange('companyPhone', e.target.value)}
            />
            <CalculatorInput
              label="Address"
              id="companyAddress"
              type="text"
              value={proposalData.companyAddress}
              onChange={(e) => handleInputChange('companyAddress', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-tight">
              <CalculatorInput
                label="City"
                id="companyCity"
                type="text"
                value={proposalData.companyCity}
                onChange={(e) => handleInputChange('companyCity', e.target.value)}
              />
              <CalculatorInput
                label="State"
                id="companyState"
                type="text"
                value={proposalData.companyState}
                onChange={(e) => handleInputChange('companyState', e.target.value)}
              />
              <CalculatorInput
                label="ZIP"
                id="companyZip"
                type="text"
                value={proposalData.companyZip}
                onChange={(e) => handleInputChange('companyZip', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              About Your Company
            </label>
            <textarea
              value={proposalData.companyDescription}
              onChange={(e) => handleInputChange('companyDescription', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="Brief description of your company..."
            />
          </div>
        </section>

        {/* Client Info */}
        <section className="space-y-content border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Client Information
          </h3>
          <div className="grid gap-content sm:grid-cols-3">
            <CalculatorInput
              label="Client Name"
              id="clientName"
              type="text"
              value={proposalData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              helpText="Required"
              required
            />
            <CalculatorInput
              label="Company"
              id="clientCompany"
              type="text"
              value={proposalData.clientCompany}
              onChange={(e) => handleInputChange('clientCompany', e.target.value)}
            />
            <CalculatorInput
              label="Email"
              id="clientEmail"
              type="email"
              value={proposalData.clientEmail}
              onChange={(e) => handleInputChange('clientEmail', e.target.value)}
            />
          </div>
        </section>

        {/* Project Info */}
        <section className="space-y-content border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Project Details
          </h3>
          <div className="grid gap-content sm:grid-cols-3">
            <CalculatorInput
              label="Project Name"
              id="projectName"
              type="text"
              value={proposalData.projectName}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              helpText="Required"
              required
            />
            <CalculatorInput
              label="Proposal Date"
              id="projectDate"
              type="date"
              value={proposalData.projectDate}
              onChange={(e) => handleInputChange('projectDate', e.target.value)}
            />
            <CalculatorInput
              label="Valid Until"
              id="validUntil"
              type="date"
              value={proposalData.validUntil}
              onChange={(e) => handleInputChange('validUntil', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Project Overview
            </label>
            <textarea
              value={proposalData.overview}
              onChange={(e) => handleInputChange('overview', e.target.value)}
              rows={4}
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="Describe the project goals, background, and objectives..."
            />
          </div>
        </section>

        {/* Scope of Work */}
        <section className="space-y-content border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Scope of Work
            </h3>
            <button
              type="button"
              onClick={addScopeItem}
              className="flex items-center gap-1 text-sm text-primary hover:text-accent"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
          {proposalData.scopeItems.map((item, index) => (
            <div key={index} className="flex gap-tight">
              <input
                type="text"
                value={item}
                onChange={(e) => handleScopeItemChange(index, e.target.value)}
                placeholder={`Scope item ${index + 1}...`}
                className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground"
              />
              <button
                type="button"
                onClick={() => removeScopeItem(index)}
                disabled={proposalData.scopeItems.length === 1}
                className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30"
                aria-label="Remove scope item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </section>

        {/* Timeline / Milestones */}
        <section className="space-y-content border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Timeline / Milestones
            </h3>
            <button
              type="button"
              onClick={addMilestone}
              className="flex items-center gap-1 text-sm text-primary hover:text-accent"
            >
              <Plus className="w-4 h-4" />
              Add Phase
            </button>
          </div>
          {proposalData.milestones.map((milestone) => (
            <div key={milestone.id} className="grid grid-cols-12 gap-tight items-start">
              <input
                type="text"
                value={milestone.phase}
                onChange={(e) => handleMilestoneChange(milestone.id, 'phase', e.target.value)}
                placeholder="Phase"
                className="col-span-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              <input
                type="text"
                value={milestone.description}
                onChange={(e) => handleMilestoneChange(milestone.id, 'description', e.target.value)}
                placeholder="Description of deliverables..."
                className="col-span-7 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              <input
                type="text"
                value={milestone.duration}
                onChange={(e) => handleMilestoneChange(milestone.id, 'duration', e.target.value)}
                placeholder="Duration"
                className="col-span-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              <button
                type="button"
                onClick={() => removeMilestone(milestone.id)}
                disabled={proposalData.milestones.length === 1}
                className="col-span-1 p-2 text-muted-foreground hover:text-destructive disabled:opacity-30"
                aria-label="Remove milestone"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </section>

        {/* Pricing */}
        <section className="space-y-content border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Pricing
            </h3>
            <button
              type="button"
              onClick={addPricingItem}
              className="flex items-center gap-1 text-sm text-primary hover:text-accent"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
          {proposalData.pricingItems.map((item) => (
            <div key={item.id} className="flex gap-tight items-start">
              <input
                type="text"
                value={item.description}
                onChange={(e) => handlePricingChange(item.id, 'description', e.target.value)}
                placeholder="Service or deliverable..."
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.price || ''}
                onChange={(e) => handlePricingChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground text-right"
              />
              <button
                type="button"
                onClick={() => removePricingItem(item.id)}
                disabled={proposalData.pricingItems.length === 1}
                className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30"
                aria-label="Remove pricing item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex justify-end pt-4 border-t border-border">
            <div className="text-right">
              <span className="text-sm text-muted-foreground mr-4">Total:</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(computedTotal)}</span>
            </div>
          </div>
          <CalculatorInput
            label="Payment Terms"
            id="paymentTerms"
            type="text"
            value={proposalData.paymentTerms}
            onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
            placeholder="e.g., 50% deposit, 50% upon completion"
          />
        </section>

        {/* Terms */}
        <section className="space-y-content border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Terms & Conditions
          </h3>
          <textarea
            value={proposalData.terms}
            onChange={(e) => handleInputChange('terms', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="Terms and conditions..."
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
              document={<ProposalDocument data={{ ...proposalData, total: computedTotal }} />}
              fileName={getFileName()}
              className="flex items-center gap-tight rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-primary/80"
              onClick={() => {
                trackEvent('proposal_downloaded', {
                  project_name: proposalData.projectName,
                  total: computedTotal,
                  scope_items: proposalData.scopeItems.filter((s) => s.trim()).length,
                  milestones: proposalData.milestones.filter((m) => m.description.trim()).length,
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
              Add project name and client information to download PDF
            </p>
          )}
        </section>
      </div>

      {/* Educational Content */}
      <div className="mt-heading space-y-content border-t pt-8 dark:border-border">
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground">
          Proposal Tips
        </h3>

        <div className="grid gap-content sm:grid-cols-2">
          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Clear Scope
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Define exactly what&apos;s included (and excluded) to prevent scope creep and set clear expectations.
            </p>
          </Card>

          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Value-Based Pricing
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Focus on the value and outcomes you&apos;ll deliver rather than just listing hours or tasks.
            </p>
          </Card>

          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Realistic Timeline
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Include buffer time for revisions and unexpected delays. Under-promise and over-deliver.
            </p>
          </Card>

          <Card size="sm">
            <h4 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Expiration Date
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Set a proposal validity period (30 days is common) to create urgency and protect your pricing.
            </p>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
