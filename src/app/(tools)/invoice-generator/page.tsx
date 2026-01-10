/**
 * Invoice Generator
 * Create professional invoices with PDF download
 */

'use client';

  import { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { Card } from '@/components/ui/card';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { trackEvent } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils';
import { FileText, Plus, Trash2, Download, Save, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { InvoiceData, InvoiceLineItem } from '@/lib/pdf/invoice-template';
import { useHydrated } from '@/hooks/use-hydrated';
import { logger } from '@/lib/logger';

// Dynamic import for PDF to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span>Loading PDF...</span> }
);

const InvoiceDocument = dynamic(
  () => import('@/lib/pdf/invoice-template').then((mod) => mod.InvoiceDocument),
  { ssr: false }
);

const STORAGE_KEY = 'hds-invoice-draft';

const DEFAULT_COMPANY = {
  companyName: 'Hudson Digital Solutions',
  companyAddress: '',
  companyCity: 'Dallas',
  companyState: 'TX',
  companyZip: '',
  companyEmail: 'hello@hudsondigitalsolutions.com',
  companyPhone: '',
};

const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${random}`;
};

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0] ?? '';
};

// Only call crypto.randomUUID() on the client
const createEmptyLineItem = (): InvoiceLineItem => ({
  id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `line-${Date.now()}`,
  description: '',
  quantity: 1,
  rate: 0,
  amount: 0,
});

// Subscribe to localStorage changes (for cross-tab sync if needed)
const subscribeToStorage = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

// Read draft from localStorage
const getDraftSnapshot = (): InvoiceData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as InvoiceData;
    }
  } catch (error) {
    // Log invalid localStorage data for debugging
    logger.warn('Failed to parse invoice draft from localStorage', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return null;
};

// Server snapshot always returns null
const getServerDraftSnapshot = (): InvoiceData | null => null;

// Empty subscribe for useSyncExternalStore (no-op)
const emptySubscribe = () => () => {};

// Module-level cache for generated defaults (persists across renders)
let cachedDefaults: {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItem: InvoiceLineItem;
} | null = null;

const getDefaultsSnapshot = () => {
  if (cachedDefaults === null) {
    cachedDefaults = {
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: formatDateForInput(new Date()),
      dueDate: formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      lineItem: createEmptyLineItem(),
    };
  }
  return cachedDefaults;
};

const getServerDefaultsSnapshot = () => ({
  invoiceNumber: '',
  invoiceDate: '',
  dueDate: '',
  lineItem: { id: '', description: '', quantity: 1, rate: 0, amount: 0 },
});

export default function InvoiceGeneratorPage() {
  // Use hydration-safe hook
  const isHydrated = useHydrated();

  // Get generated defaults via useSyncExternalStore (no refs during render)
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

  // Track if we have a draft (derived from savedDraft)
  const hasDraft = savedDraft !== null;

  // User-entered state (starts empty, user modifications go here)
  const [userModifiedData, setUserModifiedData] = useState<Partial<InvoiceData>>({});

  // Compute effective invoice data by merging: defaults < savedDraft < userModified
  const invoiceData = useMemo((): InvoiceData => {
    const baseData: InvoiceData = {
      ...DEFAULT_COMPANY,
      clientName: '',
      clientCompany: '',
      clientAddress: '',
      clientCity: '',
      clientState: '',
      clientZip: '',
      clientEmail: '',
      invoiceNumber: generatedDefaults.invoiceNumber,
      invoiceDate: generatedDefaults.invoiceDate,
      dueDate: generatedDefaults.dueDate,
      lineItems: generatedDefaults.lineItem.id ? [generatedDefaults.lineItem] : [],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      notes: 'Payment is due within 30 days. Please include invoice number with your payment.',
      paymentTerms: 'Net 30',
    };

    // Apply saved draft if exists
    if (savedDraft) {
      Object.assign(baseData, savedDraft);
    }

    // Apply user modifications (takes precedence)
    Object.assign(baseData, userModifiedData);

    return baseData;
  }, [generatedDefaults, savedDraft, userModifiedData]);

  // Helper to update invoice data (stores in userModifiedData)
  const setInvoiceData = useCallback((
    updater: InvoiceData | ((prev: InvoiceData) => InvoiceData)
  ) => {
    setUserModifiedData((prev) => {
      const currentFull: InvoiceData = {
        ...DEFAULT_COMPANY,
        clientName: '',
        clientCompany: '',
        clientAddress: '',
        clientCity: '',
        clientState: '',
        clientZip: '',
        clientEmail: '',
        invoiceNumber: generatedDefaults.invoiceNumber,
        invoiceDate: generatedDefaults.invoiceDate,
        dueDate: generatedDefaults.dueDate,
        lineItems: generatedDefaults.lineItem.id ? [generatedDefaults.lineItem] : [],
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        total: 0,
        notes: 'Payment is due within 30 days. Please include invoice number with your payment.',
        paymentTerms: 'Net 30',
        ...savedDraft,
        ...prev,
      };
      const newData = typeof updater === 'function' ? updater(currentFull) : updater;
      return newData;
    });
  }, [generatedDefaults, savedDraft]);

  // Calculate totals (derived values, used directly in render and PDF)
  const computedTotals = useMemo(() => {
    const subtotal = invoiceData.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (invoiceData.taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [invoiceData.lineItems, invoiceData.taxRate]);

  const handleInputChange = (field: keyof InvoiceData, value: string | number) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = useCallback((id: string, field: keyof InvoiceLineItem, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id !== id) {return item;}

        const updated = { ...item, [field]: value };
        // Recalculate amount when quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      }),
    }));
  }, [setInvoiceData]);

  const addLineItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, createEmptyLineItem()],
    }));
  };

  const removeLineItem = (id: string) => {
    if (invoiceData.lineItems.length === 1) {return;}
    setInvoiceData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id),
    }));
  };

  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoiceData));
    // Dispatch storage event to trigger useSyncExternalStore update
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    trackEvent('invoice_draft_saved', {
      invoice_number: invoiceData.invoiceNumber,
      line_items: invoiceData.lineItems.length,
    });
  };

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    // Dispatch storage event to trigger useSyncExternalStore update
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    // Reset user modifications and regenerate defaults
    setUserModifiedData({});
    // Reset cached defaults so new ones are generated
    cachedDefaults = null;
  };
  const isValid = invoiceData.clientName.trim() !== '' &&
                  invoiceData.lineItems.some(item => item.description.trim() !== '' && item.amount > 0);

  return (
    <CalculatorLayout
      title="Invoice Generator"
      description="Create professional invoices and download them as PDF"
      icon={<FileText className="h-8 w-8 text-primary" />}
    >
      <div className="space-y-sections">
        {/* Your Company Info */}
        <section className="space-y-content">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Your Company Information
          </h2>
          <div className="grid gap-content sm:grid-cols-2">
            <CalculatorInput
              label="Company Name"
              id="companyName"
              type="text"
              value={invoiceData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              helpText="Your business name"
            />
            <CalculatorInput
              label="Email"
              id="companyEmail"
              type="email"
              value={invoiceData.companyEmail}
              onChange={(e) => handleInputChange('companyEmail', e.target.value)}
            />
            <CalculatorInput
              label="Address"
              id="companyAddress"
              type="text"
              value={invoiceData.companyAddress}
              onChange={(e) => handleInputChange('companyAddress', e.target.value)}
            />
            <CalculatorInput
              label="Phone"
              id="companyPhone"
              type="tel"
              value={invoiceData.companyPhone}
              onChange={(e) => handleInputChange('companyPhone', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-tight">
              <CalculatorInput
                label="City"
                id="companyCity"
                type="text"
                value={invoiceData.companyCity}
                onChange={(e) => handleInputChange('companyCity', e.target.value)}
              />
              <CalculatorInput
                label="State"
                id="companyState"
                type="text"
                value={invoiceData.companyState}
                onChange={(e) => handleInputChange('companyState', e.target.value)}
              />
              <CalculatorInput
                label="ZIP"
                id="companyZip"
                type="text"
                value={invoiceData.companyZip}
                onChange={(e) => handleInputChange('companyZip', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Client Info */}
        <section className="space-y-content border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Bill To (Client)
          </h2>
          <div className="grid gap-content sm:grid-cols-2">
            <CalculatorInput
              label="Client Name"
              id="clientName"
              type="text"
              value={invoiceData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              helpText="Required"
              required
            />
            <CalculatorInput
              label="Company (Optional)"
              id="clientCompany"
              type="text"
              value={invoiceData.clientCompany}
              onChange={(e) => handleInputChange('clientCompany', e.target.value)}
            />
            <CalculatorInput
              label="Address"
              id="clientAddress"
              type="text"
              value={invoiceData.clientAddress}
              onChange={(e) => handleInputChange('clientAddress', e.target.value)}
            />
            <CalculatorInput
              label="Email"
              id="clientEmail"
              type="email"
              value={invoiceData.clientEmail}
              onChange={(e) => handleInputChange('clientEmail', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-tight">
              <CalculatorInput
                label="City"
                id="clientCity"
                type="text"
                value={invoiceData.clientCity}
                onChange={(e) => handleInputChange('clientCity', e.target.value)}
              />
              <CalculatorInput
                label="State"
                id="clientState"
                type="text"
                value={invoiceData.clientState}
                onChange={(e) => handleInputChange('clientState', e.target.value)}
              />
              <CalculatorInput
                label="ZIP"
                id="clientZip"
                type="text"
                value={invoiceData.clientZip}
                onChange={(e) => handleInputChange('clientZip', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Invoice Details */}
        <section className="space-y-content border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Invoice Details
          </h2>
          <div className="grid gap-content sm:grid-cols-4">
            <CalculatorInput
              label="Invoice Number"
              id="invoiceNumber"
              type="text"
              value={invoiceData.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
            />
            <CalculatorInput
              label="Invoice Date"
              id="invoiceDate"
              type="date"
              value={invoiceData.invoiceDate}
              onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
            />
            <CalculatorInput
              label="Due Date"
              id="dueDate"
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
            <div>
              <label htmlFor="paymentTerms" className="block text-sm font-medium text-foreground mb-1">
                Payment Terms
              </label>
              <select
                id="paymentTerms"
                name="paymentTerms"
                value={invoiceData.paymentTerms}
                onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-foreground"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
          </div>
        </section>

        {/* Line Items */}
        <section className="space-y-content border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Line Items
            </h2>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-tight text-xs font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b border-border">
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1"></div>
          </div>

          {/* Line Items */}
          {invoiceData.lineItems.map((item) => (
            <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-tight items-start pb-3 border-b border-border last:border-0">
              <div className="sm:col-span-5">
                <label htmlFor={`description-${item.id}`} className="sm:hidden text-xs text-muted-foreground">Description</label>
                <input
                  id={`description-${item.id}`}
                  name={`description-${item.id}`}
                  type="text"
                  value={item.description}
                  onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                  placeholder="Service or product description"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`quantity-${item.id}`} className="sm:hidden text-xs text-muted-foreground">Quantity</label>
                <input
                  id={`quantity-${item.id}`}
                  name={`quantity-${item.id}`}
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground text-center"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`rate-${item.id}`} className="sm:hidden text-xs text-muted-foreground">Rate</label>
                <input
                  id={`rate-${item.id}`}
                  name={`rate-${item.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate || ''}
                  onChange={(e) => handleLineItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground text-right"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="sm:hidden text-xs text-muted-foreground">Amount</label>
                <div className="px-3 py-2 text-sm font-medium text-foreground text-right">
                  {formatCurrency(item.amount)}
                </div>
              </div>
              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeLineItem(item.id)}
                  disabled={invoiceData.lineItems.length === 1}
                  className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Remove line item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Totals */}
        <section className="space-y-content border-t border-border pt-6">
          <div className="flex justify-end">
            <div className="w-full sm:w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(computedTotals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-content">
                <label htmlFor="taxRate" className="text-sm text-muted-foreground">Tax Rate</label>
                <div className="flex items-center gap-tight">
                  <input
                    id="taxRate"
                    name="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={invoiceData.taxRate || ''}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                    className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground text-right"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              {invoiceData.taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({invoiceData.taxRate}%)</span>
                  <span className="font-medium">{formatCurrency(computedTotals.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="text-lg font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(computedTotals.total)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-content border-t border-border pt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-foreground">
            Notes / Terms
          </label>
          <textarea
            id="notes"
            name="notes"
            value={invoiceData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="Payment instructions, thank you message, etc."
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
              document={<InvoiceDocument data={{ ...invoiceData, ...computedTotals }} />}
              fileName={`${invoiceData.invoiceNumber}.pdf`}
              className="flex items-center gap-tight rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-primary-hover"
              onClick={() => {
                trackEvent('invoice_downloaded', {
                  invoice_number: invoiceData.invoiceNumber,
                  total: computedTotals.total,
                  line_items: invoiceData.lineItems.length,
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
              Add client name and at least one line item to download PDF
            </p>
          )}
        </section>
      </div>

      {/* Educational Content */}
      <div className="mt-heading space-y-content border-t pt-8 dark:border-border">
        <h2 className="text-lg font-semibold text-foreground dark:text-foreground">
          Invoice Best Practices
        </h2>

        <div className="grid gap-content sm:grid-cols-2">
          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Clear Payment Terms
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Always specify payment terms upfront. Net 30 is standard, but consider offering discounts for early payment.
            </p>
          </Card>

          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Detailed Descriptions
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Include specific descriptions of services or products. This helps prevent disputes and makes record-keeping easier.
            </p>
          </Card>

          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Sequential Numbering
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Use a consistent invoice numbering system. This helps with organization and is often required for tax purposes.
            </p>
          </Card>

          <Card size="sm">
            <h3 className="mb-subheading font-semibold text-foreground dark:text-foreground">
              Keep Records
            </h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Save copies of all invoices for at least 7 years for tax and legal purposes.
            </p>
          </Card>
        </div>
      </div>
    </CalculatorLayout>
  );
}
